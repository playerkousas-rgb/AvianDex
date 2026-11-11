/* ============================================================
 *  開機冒煙測試（smoke test）
 * ------------------------------------------------------------
 *  為甚麼要有這支？
 *    2026-11 發生過一次「一進 App 一片雪白」。原因不是 CSS、不是網絡，
 *    而是 PokedexDevice 在 birds.json 未載入完成時讀 currentBird.id
 *    （當時 currentBird 是 undefined）→ TypeError → 整個 React tree 消失。
 *
 *    這種 bug 用單元測試測不到（每個元件單獨看都正常），
 *    用肉眼又要等編譯、開瀏覽器、看 Console 才發現。
 *    所以這裡用 jsdom 真跑一次完整 App render，
 *    只要 root 是空的，或者 React 拋錯，就當失敗。
 *
 *  測的是「最惡劣的情況」：
 *    - 所有網絡請求都失敗（模擬離線／R2 掛掉）
 *    - 沒有 localStorage 任何紀錄（第一次開）
 *    - birds.json 未載入完成就 render
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '..');

/** 把 App.tsx 連同所有依賴打包成一個 ESM 檔，方便在 jsdom 內 import */
function bundle() {
  const dir = path.join(root, 'node_modules', '.cache', 'smoke');
  mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'app.mjs');
  execFileSync(
    path.join(root, 'node_modules/.bin/esbuild'),
    [
      path.join(root, 'src/App.tsx'),
      '--bundle',
      '--format=esm',
      '--platform=browser',
      '--loader:.json=json',
      '--jsx=automatic',
      '--define:process.env.NODE_ENV="development"',
      '--define:import.meta.env.PROD=false',
      '--define:import.meta.env.DEV=true',
      '--define:import.meta.env.BASE_URL="/"',
      '--define:import.meta.env.VITE_R2_BASE_URL="https://cdn.example.test"',
      '--external:*.png',
      '--external:*.jpg',
      /* React 只可以有一份，否則 hooks 會因為兩份 instance 而爆
         “Cannot read properties of null (reading 'useState')” */
      '--external:react',
      '--external:react-dom',
      '--external:react/jsx-runtime',
      `--outfile=${out}`,
    ],
    { stdio: 'pipe' },
  );
  return out;
}

function makeDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  window.matchMedia ||= () => ({
    matches: false, addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {},
  });
  window.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} };
  window.IntersectionObserver ||= class { observe() {} unobserve() {} disconnect() {} };
  window.scrollTo ||= () => {};
  // 模擬「完全離線」：任何圖片／JSON 請求都失敗
  window.fetch = () => Promise.reject(new Error('offline (smoke test)'));
  return window;
}

function installGlobals(window) {
  const g = globalThis;
  g.window = window;
  g.document = window.document;
  Object.defineProperty(g, 'navigator', { value: window.navigator, configurable: true });
  g.HTMLElement = window.HTMLElement;
  g.Element = window.Element;
  g.Node = window.Node;
  g.Event = window.Event;
  g.MouseEvent = window.MouseEvent;
  g.getComputedStyle = window.getComputedStyle.bind(window);
  g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  g.cancelAnimationFrame = (id) => clearTimeout(id);
  g.matchMedia = window.matchMedia;
  g.ResizeObserver = window.ResizeObserver;
  g.IntersectionObserver = window.IntersectionObserver;
  g.localStorage = window.localStorage;
  g.sessionStorage = window.sessionStorage;
  g.MutationObserver = window.MutationObserver;
}

test('App 可以完整 render，不會白屏（模擬離線、第一次開）', async () => {
  const out = bundle();
  const window = makeDom();
  installGlobals(window);

  const reactErrors = [];
  const originalError = console.error;
  console.error = (...a) => { reactErrors.push(a.map(String).join(' ')); };

  const errors = [];
  let unmount;
  window.addEventListener('error', (e) => errors.push(e.error?.stack || e.message));

  try {
    const React = await import(pathToFileURL(path.join(root, 'node_modules/react/index.js')).href);
    const { createRoot } = await import(pathToFileURL(path.join(root, 'node_modules/react-dom/client.js')).href);
    const mod = await import(pathToFileURL(out).href);

    const rootEl = window.document.getElementById('root');
    const r = createRoot(rootEl);
    unmount = () => r.unmount();
    r.render(React.createElement(mod.default));

    // 等 birds.json 的 dynamic import、state 更新與動畫 frame 全部跑完
    await new Promise((res) => setTimeout(res, 2500));

    const html = rootEl.innerHTML;

    // 1) 絕對不可以是空白：白屏 = 使用者見到一片雪白
    assert.ok(html.length > 5000, `root 只有 ${html.length} 字元，看起來是白屏`);
    assert.match(rootEl.textContent || '', /AvianDex/, '連 App 標題都冇，React tree 應該掛了');

    // 2) 不應該有未捕捉的錯誤
    assert.deepEqual(errors, [], `render 期間拋錯：${errors[0]}`);

    // 3) 特別攔住「讀 undefined 的屬性」這類初值 bug
    const fatal = reactErrors.filter((e) =>
      /Cannot read properties of (undefined|null)|Maximum update depth|is not a function/.test(e));
    assert.deepEqual(fatal, [], `元件在 render 期間拋錯：${fatal[0]}`);
  } finally {
    /* 收尾：framer-motion 的動畫迴圈、jsdom 的計時器、模擬的 rAF 都會令
       node:test 收不到工（測試明明 pass，但整個檔 timeout）。
       所以明確卸載 React tree + 關窗。 */
    try { unmount?.(); } catch { /* 已卸載 */ }
    /* 等一輪，讓卸載引發的非同步工作跑完，才清走全域。
       否則殘留 callback 會在測試結束後才執行，撞到「window is not defined」。 */
    await new Promise((res) => setTimeout(res, 500));
    try { window.close(); } catch { /* jsdom 有時不支援 */ }
    console.error = originalError;
    for (const k of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'Event',
      'MouseEvent', 'localStorage', 'sessionStorage', 'MutationObserver',
      'matchMedia', 'ResizeObserver', 'IntersectionObserver',
      'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle']) {
      try { delete globalThis[k]; } catch { /* 有些是 defineProperty，刪不到就算了 */ }
    }
  }
});
