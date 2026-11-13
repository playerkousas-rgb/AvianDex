/* ============================================================
 *  圖卡載入器測試（node:test）
 *  跑：npm run test:cards
 * ------------------------------------------------------------
 *  驗證四件舊版出事嘅事：
 *   1) 併發上限（唔會一次過打幾百個請求）
 *   2) 副檔名 fallback（.avif 冇就試 .webp／.jpg）
 *   3) 404 = missing，網絡錯 = error（兩者唔可以混淆）
 *   4) 直連 R2 連續失敗 → 自動改用 /api/card 代理
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');

/** 用 esbuild（vite 自帶）把 TS 轉成可在 node 跑的 ESM，並注入 import.meta.env */
function buildLoader() {
  const out = path.join(mkdtempSync(path.join(tmpdir(), 'aviandex-')), 'cardImage.mjs');
  execFileSync(
    path.join(root, 'node_modules/.bin/esbuild'),
    [
      path.join(root, 'src/lib/cardImage.ts'),
      '--bundle',
      '--format=esm',
      '--platform=neutral',
      '--define:import.meta.env.BASE_URL="/"',
      '--define:import.meta.env.VITE_R2_BASE_URL="undefined"',
      `--outfile=${out}`,
    ],
    { stdio: 'pipe' },
  );
  return out;
}

/** 安裝假的 Image / fetch，按 scenario 決定邊個網址存在 */
function installStubs(scenario, { latencyMs = 1 } = {}) {
  const requests = [];
  const fetchRequests = [];
  let inflightNow = 0;
  let maxInflight = 0;

  class FakeImage {
    set src(value) {
      this._src = value;
      requests.push(value);
      inflightNow += 1;
      maxInflight = Math.max(maxInflight, inflightNow);
      const outcome = scenario(value);
      setTimeout(() => {
        inflightNow -= 1;
        if (outcome === 'ok') this.onload?.();
        else this.onerror?.(new Error('fake image error'));
      }, latencyMs);
    }
    get src() {
      return this._src;
    }
  }

  globalThis.Image = FakeImage;
  globalThis.fetch = async (url, options) => {
    fetchRequests.push({ url: String(url), method: options?.method || 'GET' });
    const outcome = scenario(String(url));
    if (outcome === 'network-error') throw new TypeError('fetch failed');
    return {
      ok: outcome === 'ok',
      status: outcome === 'ok' ? 200 : 404,
      headers: { get: () => 'image/avif' },
      json: async () => ({}),
    };
  };

  return {
    requests,
    fetchRequests,
    getMaxInflight: () => maxInflight,
  };
}

test('併發上限 + 副檔名 fallback + 404 判定', async () => {
  // 只有 0002 用 .webp、0003 完全冇圖；其他都係 .avif
  const scenario = (url) => {
    if (url.includes('card-manifest')) return 'missing';
    if (url.includes('0003')) return 'missing';
    if (url.includes('0002') && url.endsWith('.webp')) return 'ok';
    if (url.includes('0002')) return 'missing';
    return url.includes('.avif') ? 'ok' : 'missing';
  };
  const stub = installStubs(scenario);
  const loader = await import(pathToFileURL(buildLoader()).href);
  const { requestCard, getEntry } = loader;

  const ids = Array.from({ length: 30 }, (_, i) => String(i + 1).padStart(4, '0'));
  ids.forEach(requestCard);

  await new Promise((r) => setTimeout(r, 800));

  assert.equal(getEntry('0001').status, 'loaded');
  assert.equal(getEntry('0001').url.endsWith('0001.avif'), true);

  // .avif 冇 → 要試到 .webp 搵到圖（舊版只試 avif，這張會變「未發現」）
  assert.equal(getEntry('0002').status, 'loaded');
  assert.equal(getEntry('0002').url.endsWith('0002.webp'), true);

  // 完全冇圖 → missing，不是 error（兩者顯示不同，不可混淆）
  assert.equal(getEntry('0003').status, 'missing');

  assert.ok(
    stub.getMaxInflight() <= 6,
    `併發應該 ≤ 6，實際 ${stub.getMaxInflight()}（一次過打太多會令 r2.dev 限流）`,
  );
});

test('網絡失敗 → 最後是 error，並且會 fallback 到代理', async () => {
  let proxyUsed = false;
  const scenario = (url) => {
    if (url.includes('card-manifest')) return 'missing';
    if (url.startsWith('/api/card')) {
      proxyUsed = true;
      return 'ok';
    }
    return 'network-error'; // 直連 r2.dev 全部失敗
  };
  installStubs(scenario);
  const loader = await import(`${pathToFileURL(buildLoader()).href}?proxy`);
  const { requestCard, getEntry } = loader;

  requestCard('0001');
  await new Promise((r) => setTimeout(r, 500));

  assert.equal(getEntry('0001').status, 'loaded');
  assert.ok(getEntry('0001').url.startsWith('/api/card'), '應該改用代理網址');
  assert.ok(proxyUsed, '代理應該至少被呼叫一次');
});

test('resetAll 之後可以重新探測（上傳新圖後用）', async () => {
  let has = false;
  const scenario = (url) => (url.includes('card-manifest') ? 'missing' : has ? 'ok' : 'missing');
  installStubs(scenario);
  const loader = await import(`${pathToFileURL(buildLoader()).href}?reset`);
  const { requestCard, getEntry, resetAll } = loader;

  requestCard('0009');
  await new Promise((r) => setTimeout(r, 300));
  assert.equal(getEntry('0009').status, 'missing');

  has = true; // 模擬上傳了新圖
  resetAll();
  requestCard('0009');
  await new Promise((r) => setTimeout(r, 300));
  assert.equal(getEntry('0009').status, 'loaded');
});

test('設定檔的圖卡網址格式正確（4 位補零、可換網域）', async () => {
  const out = path.join(mkdtempSync(path.join(tmpdir(), 'aviandex-cfg-')), 'config.mjs');
  execFileSync(
    path.join(root, 'node_modules/.bin/esbuild'),
    [
      path.join(root, 'src/config.ts'),
      '--bundle',
      '--format=esm',
      '--platform=neutral',
      '--define:import.meta.env.VITE_R2_BASE_URL="https://cdn.example.com/"',
      '--loader:.json=json',
      `--outfile=${out}`,
    ],
    { stdio: 'pipe' },
  );
  const src = readFileSync(out, 'utf8');
  assert.ok(src.includes('https://cdn.example.com'), '應讀到環境變數覆寫網域');
  const mod = await import(pathToFileURL(out).href);
  /* 卡面正面用插畫（birdcards），翻轉面才用資訊圖卡（aviandex）。
     這兩個資料夾不可以再混 —— 混錯就是「569 張全部未發現」的那個 bug。 */
  assert.equal(mod.cardUrl('21'), `${mod.R2_BASE_URL}/birdcards/0021.avif`);
  assert.equal(mod.artUrl('21'), `${mod.R2_BASE_URL}/birdcards/0021.avif`);
  /* 0001–0120 全部已重製，所以網址帶 `?v=restart-NNNN-v1` 快取版本。 */
  assert.equal(mod.infoCardUrl('21'), `${mod.R2_BASE_URL}/aviandex/0021.avif?v=restart-0021-v1`);
  assert.equal(mod.cardProxyUrl('21'), '/api/card?id=0021&ext=avif&folder=birdcards');
  // 兩個資料夾都要在候選名單內（插畫先，資訊卡後備）
  assert.deepEqual(mod.cardUrlCandidates('21'), [
    `${mod.R2_BASE_URL}/birdcards/0021.avif`,
    `${mod.R2_BASE_URL}/aviandex/0021.avif`,
  ]);
  assert.equal(mod.TOTAL_SLOTS, 583, '槽位數要同 birds.json 一致');
});


test('no external-app path guessing, no cross-origin HEAD requests, and bounded negative probes', async () => {
  const stub = installStubs(url => url.startsWith('/api/card') ? 'missing' : 'network-error');
  const loader = await import(`${pathToFileURL(buildLoader()).href}?no-external-probes`);
  loader.requestCard('0043');
  await new Promise(r => setTimeout(r, 250));
  assert.equal(loader.getEntry('0043').status, 'missing');
  assert.ok(stub.requests.every(url => !url.includes('skw-birdex2')));
  assert.ok(stub.requests.every(url => !url.includes('/demo/card-')));
  assert.ok(stub.fetchRequests.filter(r => r.method === 'HEAD').every(r => r.url.startsWith('/api/card')));
  assert.ok(stub.requests.length <= 10, `expected at most 5 formats × direct/proxy, got ${stub.requests.length}`);
  const count = stub.requests.length;
  for (let i = 0; i < 10; i++) loader.requestCard('0043');
  await new Promise(r => setTimeout(r, 50));
  assert.equal(stub.requests.length, count, 'missing card must not auto-retry forever');
  loader.resetAll();
  assert.equal(loader.getStats().useProxy, false);
});

test('a 200 HEAD after image decode failure must not be marked loaded', async () => {
  installStubs(url => url.includes('card-manifest') ? 'missing' : 'network-error');
  globalThis.fetch = async url => ({ ok: true, status: 200, json: async () => ({}) });
  const loader = await import(`${pathToFileURL(buildLoader()).href}?decode-failure`);
  loader.requestCard('0044');
  await new Promise(r => setTimeout(r, 100));
  assert.equal(loader.getEntry('0044').status, 'error');
});
