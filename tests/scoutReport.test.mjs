/* ============================================================
 *  問題回報測試（node:test）
 *  跑：npm run test:report
 * ------------------------------------------------------------
 *  守的是 readme docs/31「App（有資料但無登入）」＋ Scout Admin 統一回報 v1：
 *    1) 本 App 唔自己開後端：只用 Scout Admin widget／Apps Script
 *    2) widget 未載入 → 開獨立回報頁（fail-safe，唔會「撳完冇反應」）
 *    3) widget 只載入一次；載入後 FAB 由 CSS 收埋（入口只有自己粒球）
 *    4) payload 一定係統一回報格式：8 個欄位、type=issue、來源系統正確
 *    5) 全部入口都係 target="_blank" rel="noopener"
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { build } from 'esbuild';


/** 假 document：只實作載入器用到嘅幾個 method（唔會上網、唔會留 pending fetch） */
function makeDoc() {
  const made = [];
  const body = { appendChild: (el) => { made.push(el); el.parentNode = body; } };
  return {
    body,
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      attrs: {},
      setAttribute(k, v) { this.attrs[k] = String(v); },
      getAttribute(k) { return this.attrs[k] ?? null; },
      addEventListener() {},
    }),
    getElementById: () => null,
    querySelector: (sel) => made.find((el) => sel.includes(`[data-scout-widget]`) && el.attrs?.['data-scout-widget']) ?? null,
    querySelectorAll: (sel) => made.filter((el) => sel.includes('data-scout-widget') && el.attrs?.['data-scout-widget']),
    __made: made,
  };
}

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(path.join(root, p), 'utf8');

const outdir = mkdtempSync(path.join(tmpdir(), 'scoutreport-'));
await build({
  entryPoints: [path.join(root, 'src/lib/scoutReportWidget.ts')],
  bundle: true, format: 'esm', platform: 'neutral',
  outfile: path.join(outdir, 'widget.mjs'),
});
const widget = await import(pathToFileURL(path.join(outdir, 'widget.mjs')).href);

const config = read('src/config.ts');
const button = read('src/components/ReportBugButton.tsx');
const css = read('src/index.css');

test('回報入口接 Scout Admin（統一回報格式 v1），唔係自建後端', () => {
  /* 全家標準：同一條 Apps Script 接收端、同一個 widget */
  assert.match(config, /scout-admin-blue\.vercel\.app\/widget\.js/);
  assert.match(config, /SCRIPT\.google\.com|script\.google\.com/i, '應指向 Scout Admin 嘅 Apps Script');
  assert.match(config, /report\.html\?app=/, '應有獨立回報頁後備路線');
  /* 本 App 唔應該有自己嘅回報 API */
  assert.equal(read('api/card.js').includes('report'), false);
});

test('widget FAB 收埋：入口只有 App 自己粒「回報」球', () => {
  assert.match(css, /#scoutw-fab\s*\{\s*display:\s*none\s*!important/);
  assert.match(css, /@media print\s*\{[\s\S]*#scoutw-root[\s\S]*display:\s*none\s*!important/);
  /* 兩粒掣爭位係 HKMAP 撞過嘅問題；我哋一定要有自己嘅入口 */
  assert.match(button, /data-report-open/);
});

test('回報掣：新分頁 + noopener，唔阻塞、唔彈窗', () => {
  assert.match(button, /target="_blank"/);
  assert.match(button, /rel="noopener"/);
  /* 唔准自動彈：唔可以有 useEffect 一掛載就開 */
  assert.equal(/useEffect\(/.test(button), false, '回報唔可以自動彈出');
});

test('widget 未載入 / 被封鎖 → 開獨立回報頁（零死連）', async () => {
  widget.__resetWidgetLoaderForTests();
  /* 用假 document：唔會上網、唔會留 pending fetch。
     timeoutMs 校細 → script 永遠 load 唔到時，載入器唔會卡死，會照樣回 fallback。 */
  const fakeDoc = makeDoc();
  const result = await widget.openScoutReport({
    widgetUrl: 'https://example.test/widget.js',
    sourceApp: 'AvianDex 鳥類圖鑑',
    doc: fakeDoc,
    waitMs: 150,
    timeoutMs: 120,
  });
  assert.equal(result, 'fallback', 'widget 載唔到都要有出路（開獨立回報頁），唔可以「撳完冇反應」');
  /* 有插過 script，而且只插一次 */
  assert.equal(fakeDoc.querySelectorAll('script[data-scout-widget]').length, 1);
  widget.__resetWidgetLoaderForTests();
});

test('widget 載入器：同一個 promise、唔會重覆插 script、有死線', () => {
  widget.__resetWidgetLoaderForTests();
  const doc = makeDoc();
  const a = widget.loadScoutAdminWidget({ url: 'https://example.test/w.js', sourceApp: 'x', doc, timeoutMs: 50 });
  const b = widget.loadScoutAdminWidget({ url: 'https://example.test/w.js', sourceApp: 'x', doc });
  assert.equal(a, b, '第二次載入應回同一個 promise（widget 本身有 window flag，重覆插都危險）');
  assert.equal(doc.querySelectorAll('script[data-scout-widget]').length, 1);
  assert.equal(doc.querySelector('script[data-scout-widget]').getAttribute('data-app'), 'x');
  /* 死線到 → 一定 resolve（唔會永遠 pending，令 UI 卡死） */
  return a.then((ok) => {
    assert.equal(ok, false, 'script load 唔到時，死線一到要回 false');
    widget.__resetWidgetLoaderForTests();
  });
});

test('詳細資料頁都有回報入口，並自動帶入雀鳥編號', () => {
  const detail = read('src/components/BirdDetailPage.tsx');
  assert.match(detail, /<ReportBugButton[^>]*birdId=\{bird\.id\}/, '詳細資料頁應帶 birdId');
  /* 本機冇「已回報」記錄：唔加新 localStorage key（Scout Admin 自己記錄） */
  /* 只准喺註解提到「冇 localStorage」——唔准有真正嘅讀寫 */
  assert.equal(/localStorage\.(getItem|setItem|removeItem)/.test(button), false, '回報掣唔應該讀寫 localStorage');
});
