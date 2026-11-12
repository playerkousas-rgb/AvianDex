/* PWA 自動更新守則（node:test）
 * 「加到主畫面後不能自動更新」的三個根因，各守一條：
 *   1) sw.js 每次部署內容要不同 → 必須含 __BUILD_ID__，並由 vite.config.ts build 時換成 commit／時間
 *   2) 主畫面 App 不會重新載入頁面 → main.tsx 要在 visibilitychange／focus／online 時 reg.update()
 *   3) sw.js 不可被 HTTP 快取 → register 用 updateViaCache:'none'，vercel.json 對 /sw.js 設 max-age=0
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

test('sw.js 帶 __BUILD_ID__，快取名跟版本走，且不在 install 時 skipWaiting', () => {
  const sw = read('public/sw.js');
  assert.match(sw, /const BUILD = '__BUILD_ID__'/);
  assert.match(sw, /'aviandex-shell-' \+ BUILD/);
  const install = sw.slice(sw.indexOf("addEventListener('install'"), sw.indexOf("addEventListener('activate'"));
  assert.doesNotMatch(install, /skipWaiting\(\)/);
  assert.match(sw, /SKIP_WAITING/);
});

test('vite.config.ts 有 stampServiceWorker 並已啟用', () => {
  const v = read('vite.config.ts');
  assert.match(v, /function stampServiceWorker/);
  assert.match(v, /__BUILD_ID__/);
  assert.match(v, /plugins = \[[^\]]*stampServiceWorker\(\)/);
});

test('main.tsx：回到前景／聚焦／上線都檢查更新，註冊不走 HTTP 快取', () => {
  const m = read('src/main.tsx');
  for (const ev of ['visibilitychange', 'focus', 'online']) assert.ok(m.includes(`'${ev}'`), ev);
  assert.match(m, /updateViaCache: 'none'/);
});

test('vercel.json：/sw.js 與 index.html 不快取，/assets 與 /icons 長快取', () => {
  const j = JSON.parse(read('vercel.json'));
  const h = (src) => j.headers.find((x) => x.source === src)?.headers.map((y) => `${y.key}: ${y.value}`).join('|') ?? '';
  assert.match(h('/sw.js'), /max-age=0/);
  assert.match(h('/index.html'), /max-age=0/);
  assert.match(h('/assets/(.*)'), /immutable/);
  assert.match(h('/icons/(.*)'), /immutable/);
});
