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
  globalThis.fetch = async (url) => {
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
  assert.equal(mod.cardUrl('21'), `${mod.R2_BASE_URL}/aviandex/0021.avif`);
  assert.equal(mod.cardProxyUrl('21'), '/api/card?id=0021&ext=avif');
  assert.equal(mod.TOTAL_SLOTS, 569, '槽位數要同 birds.json 一致');
});
