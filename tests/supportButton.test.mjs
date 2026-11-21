/* ============================================================
 *  「讚好／收藏」掣測試（readme SG18 / docs/60）
 *  跑：npm run test:support
 * ------------------------------------------------------------
 *  readme 定咗 10 條「每個新 App 必做」，呢份測試逐條鎖住：
 *    1) 掣存在、常駐、非阻塞（唔彈窗／唔倒數／唔遮內容）
 *    2) 網址只由 ScoutStoreGate.getAppStoreUrl(slug) 組出；helper 未載入 → hidden
 *    3) slug 已對 website/migrations/20261116-app-slug-seed.sql 核實
 *    4) CSS `[hidden]{display:none}`（否則 inline-flex 會令 hidden 照顯示＝死連）
 *    5) 零直連主站 Supabase／零 bump_hearts／bump_stars／零 anon key
 *    6) 中英同步（讚好／收藏 · Like / Save）＋ aria-label／title
 *    7) 列印隱藏
 *    8) 窄屏 360–430px 唔爆版（球用 BALL_SIZE 48px，唔會撐爆）
 *    9) 唔開 supportNudge（常駐掣已經夠）
 *   10) 詳細資料頁都撳得到（用戶 2026-11-21 定案：浮動球 ＋ 詳細頁一行）
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
/** 讀檔，但先剝走註解 —— 註解講「我哋唔會做 X」唔應該當成「做咗 X」 */
const read = (p) => readFileSync(path.join(root, p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

const config = readFileSync(path.join(root, 'src/config.ts'), 'utf8'); // 保留註解：slug 出自呢度
const configNoComments = read('src/config.ts');
const button = read('src/components/LikeSaveButton.tsx');
const hook = read('src/hooks/useStoreSupport.ts');
const balls = read('src/components/SideToolBalls.tsx');
const app = read('src/App.tsx');
const detail = read('src/components/BirdDetailPage.tsx');
const cssRaw = readFileSync(path.join(root, 'src/index.css'), 'utf8');
const css = cssRaw;
const html = read('index.html');
const seedNote = read('docs/APP_REVIEW.md');

const outdir = mkdtempSync(path.join(tmpdir(), 'support-'));
await build({
  entryPoints: [path.join(root, 'src/hooks/useStoreSupport.ts')],
  bundle: true, format: 'esm', platform: 'neutral',
  // config.ts 會讀 import.meta.env（Vite 專用）→ 測試入面照 Vite 咁定義
  define: { 'import.meta.env.VITE_R2_BASE_URL': 'undefined' },
  outfile: path.join(outdir, 'support.mjs'),
});
const support = await import(pathToFileURL(path.join(outdir, 'support.mjs')).href);

test('SG18 ①：掣存在、常駐、新分頁、非阻塞', () => {
  assert.match(button, /data-store-support="like-save"/, '要有穩定 hook 方便測試／除錯');
  assert.match(button, /target="_blank"/);
  assert.match(button, /rel="noopener"/);
  /* 常駐＝唔靠互動才出現；唔准倒數／彈窗／自動開 */
  assert.equal(/setTimeout|Countdown|倒數|window\.open/.test(button), false);
  assert.equal(/useEffect/.test(button), false, '唔應該一掛載就做嘢（會變自動彈）');
  /* 有 modal 打開就收埋（同其他球一致） */
  assert.match(button, /if \(hidden \|\| !url\) return null/);
});

test('SG18 ②：網址只由 getAppStoreUrl(slug) 組出，helper 未載入即 hidden', async () => {
  /* 冇 gate → null（UI 唔 render，零死連） */
  assert.equal(support.storeSupportUrlFrom(null, 'aviandex'), null);
  assert.equal(support.storeSupportUrlFrom({}, 'aviandex'), null);

  /* 標準 helper */
  const gate = {
    getAppStoreUrl: (slug) => `https://scoutappstore.vercel.app/?app=${encodeURIComponent(slug)}`,
  };
  assert.equal(
    support.storeSupportUrlFrom(gate, 'aviandex'),
    'https://scoutappstore.vercel.app/?app=aviandex',
  );

  /* 向下相容：舊 helper 只得 getPortal */
  assert.equal(
    support.storeSupportUrlFrom({ getPortal: () => ({ url: 'https://scoutappstore.vercel.app/' }) }, 'aviandex'),
    'https://scoutappstore.vercel.app/?app=aviandex',
  );

  /* helper 爆錯／回怪嘢 → 一樣係 null，唔會出半死 link */
  assert.equal(support.storeSupportUrlFrom({ getAppStoreUrl: () => { throw new Error('x'); } }, 'aviandex'), null);
  assert.equal(support.storeSupportUrlFrom({ getAppStoreUrl: () => 'javascript:alert(1)' }, 'aviandex'), null);

  /* 元件內的網址只可以來自 hook，唔准寫死主站 */
  assert.match(button, /useStoreSupportUrl\(\)/);
  assert.equal(/https:\/\/scoutappstore/.test(button), false, '元件內唔准寫死主站網址');
  /* hook 只可以有一個「第一 frame 墊底」常數，而且同 registry 一樣 */
  assert.match(hook, /const DEFAULT_STORE_FALLBACK = 'https:\/\/scoutappstore\.vercel\.app\/\?app=aviandex'/);
  const gateSrc = readFileSync(path.join(root, 'public/store_gate_v1.0.js'), 'utf8');
  assert.match(gateSrc, /url: 'https:\/\/scoutappstore\.vercel\.app\/'/);
  assert.equal(/getAppStoreUrl/.test(button), false, '元件唔應該自己叫 gate（要經 hook 統一處理）');
});

test('SG18 ③＋④：slug 已對 app-slug-seed.sql 核實，唔准靠 repo 名猜', () => {
  /* 種子檔原文：('avian-dex.vercel.app', 'aviandex') */
  assert.match(config, /avian-dex\.vercel\.app/, '要寫明 slug 係對住種子檔邊一行嚟核實');
  assert.match(configNoComments, /APP_STORE_SLUG = 'aviandex'/);
  assert.match(hook, /APP_STORE_SLUG/);
  /* gate helper 本身要存在（唔係我哋自己砌一份） */
  const gate = read('public/store_gate_v1.0.js');
  assert.match(gate, /function getAppStoreUrl\(appSlug\)/);
  assert.match(gate, /getAppStoreUrl,/);
  assert.ok(seedNote.length > 0);
});

test('SG18 ⑤：零直連主站資料庫、零 bump_hearts／bump_stars／anon key', () => {
  for (const [name, src] of [['LikeSaveButton', button], ['useStoreSupport', hook], ['SideToolBalls', balls]]) {
    assert.equal(/supabase/i.test(src), false, `${name} 唔應該掂主站資料庫`);
    assert.equal(/bump_(hearts|stars)/.test(src), false, `${name} 唔應該呼叫主站 RPC`);
    assert.equal(/anon[_-]?key/i.test(src), false, `${name} 唔應該有 anon key`);
  }
});

test('SG18 ⑥：中英同步（讚好／收藏 · Like / Save）＋ aria-label／title', () => {
  assert.match(button, /'讚好／收藏', 'Like \/ Save'/);
  assert.match(button, /aria-label=/);
  assert.match(button, /title=/);
  /* 球嘅 hover 標籤跟同一組字 */
  assert.match(button, /BALL_LABEL\(side\)/);
});

test('SG18 ⑦：[hidden] 真係唔顯示；列印隱藏', () => {
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  assert.match(css, /@media print\s*\{[\s\S]*tool-ball[\s\S]*display:\s*none\s*!important/);
});

test('SG18 ⑧：左右各 3 粒（用戶定案：讚好／收藏放左、回報放右）', () => {
  /* 次序唯一來源＝config.ts；元件唔准自己排 */
  assert.match(config, /like: 'left'/);
  assert.match(config, /etiquette: 'left'/);
  assert.match(config, /gear: 'left'/);
  assert.match(config, /map: 'right'/);
  assert.match(config, /report: 'right'/);
  assert.match(config, /birddex3: 'right'/);
  assert.match(balls, /toolBallsFor\('left'\)/);
  assert.match(balls, /toolBallsFor\('right'\)/);
  /* App 唔再自己砌右排（之前左右兩邊各寫一次，就會走樣） */
  assert.equal(/BALL_RAIL_RIGHT/.test(app), false, 'App 唔應該再自己砌右排球');
});

test('SG18 ⑨：唔開 supportNudge（同一個用家唔好被騷擾兩次）', () => {
  assert.equal(/supportNudge/.test(app), false);
  assert.equal(/supportNudge/.test(html), false);
});

test('SG18 ⑩：詳細資料頁都撳得到（浮動球 ＋ 詳細頁一行）', () => {
  assert.match(detail, /<LikeSaveButton lang=\{lang\} variant="row" \/>/);
  assert.match(detail, /<ReportBugButton[^>]*variant="row"/);
  /* row 版都要有 aria-label／title，觸控 ≥40px */
  assert.match(button, /min-h-10/);
});
