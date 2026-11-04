#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 把工作室的卡面抽成獨立 HTML（給人看／存 PDF）
 * ------------------------------------------------------------
 *  用法：
 *    node scripts/cards/export-card-html.mjs 0008
 *    node scripts/cards/export-card-html.mjs            # 預設 3 張
 *
 *  做法：用 jsdom 真的執行一次工作室（同一份 CSS、同一個 render()），
 *        再把 <div id="card"> + CSS 抽出來，圖片保持 dataURL（離線可看）。
 *  ⚠️ 這不是「截圖」——沙盒沒有 Chromium。要看像素級效果，請在瀏覽器打開。
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'tools/card-studio/aviandex-studio.html');
const OUT_DIR = path.join(ROOT, 'docs/card-preview');

const ids = process.argv.slice(2).filter((a) => /^\d{4}$/.test(a));
const targets = ids.length ? ids : ['0008', '0288', '0290'];

/* jsdom 不是專案依賴（唔想為一份文件加 package）→ 有就用，冇就清楚講 */
let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.error('✗ 需要 jsdom 才能執行工作室。請先：npm i -D jsdom');
  process.exit(1);
}
if (!fs.existsSync(SRC)) {
  console.error('✗ 找不到 tools/card-studio/aviandex-studio.html，請先跑 node scripts/cards/build-studio-data.mjs');
  process.exit(1);
}

const html = fs.readFileSync(SRC, 'utf8');
const MAX_EDGE = 520;   /* 預覽檔的圖縮到長邊 520，令單張檔案由 1.5 MB 降到 ~150 KB */

/** 把 HTML 內所有 data:image/... base64 縮細（用 ImageMagick，唔加 node 依賴） */
function shrinkDataUrls(doc) {
  let n = 0;
  return doc.replace(/data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)/g, (all, mime, b64) => {
    const buf = Buffer.from(b64, 'base64');
    if (buf.length < 40000) return all;            /* 細圖唔動 */
    const inF = path.join('/tmp', `exp-${process.pid}-${n}.img`);
    const outF = inF + '.jpg';
    fs.writeFileSync(inF, buf);
    const r = spawnSync('convert', [inF, '-resize', `${MAX_EDGE}x${MAX_EDGE}>`, '-quality', '82', outF]);
    fs.unlinkSync(inF);
    if (r.status !== 0 || !fs.existsSync(outF)) return all;
    const small = fs.readFileSync(outF);
    fs.unlinkSync(outF);
    n++;
    return 'data:image/jpeg;base64,' + small.toString('base64');
  });
}
const cache = new Map();

async function renderCard(id) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local/' });
  const { window } = dom;
  await new Promise((r) => setTimeout(r, 250));
  const { document } = window;
  const num = document.getElementById('num');
  num.value = id;
  num.dispatchEvent(new window.Event('input', { bubbles: true }));
  num.dispatchEvent(new window.Event('change', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 120));
  /* 只抽卡面會用到的 CSS（工作室的介面 CSS 太長，唔想帶入） */
  const css = [...document.styleSheets]
    .flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } })
    .join('\n');
  const card = document.getElementById('card');
  const name = (document.querySelector('#curBird') || {}).value || '';
  const out = card.outerHTML;
  window.close();
  return { out, css, name };
}

/* 卡面用到的 CSS 其實只有 .card 內那堆；用「包含 card 或 --G」粗略過濾會截錯，
 * 所以全部帶上（工作室 CSS 約 40 KB，gzip 後幾 KB，可以接受）。 */
fs.mkdirSync(OUT_DIR, { recursive: true });
const made = [];
for (const id of targets) {
  if (cache.has(id)) continue;
  const { out, css, name } = await renderCard(id);
  const page = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NO.${id} ${name.replace(/（.*$/, '')} — AvianDex 卡面示意</title>
<style>
/* 由 aviandex-studio.html 抽出的同一份 CSS（確保與工作室完全一致） */
${css}
/* 預覽用外框：唔影響卡面本身 */
html,body{margin:0;background:#eef3ee}
#stageWrap{padding:24px;display:flex;justify-content:center}
#card{box-shadow:0 24px 60px -24px rgba(0,0,0,.45)}
.note{max-width:1200px;margin:0 auto;padding:0 24px 24px;font:13px/1.7 system-ui,sans-serif;color:#4a5f52}
.note b{color:#0b6b45}
@media print{html,body{background:#fff}#stageWrap{padding:0}.note{display:none}#card{box-shadow:none}}
</style></head>
<body>
<div class="note"><b>NO.${id} ${name.replace(/（.*$/, '')}</b> —— 這是工作室同一份 DOM／CSS 的輸出，
不是截圖。按 Ctrl+P 可直接印成 PDF（A4 直向、無邊距）。</div>
<div id="stageWrap">${out}</div>
</body></html>`;
  const file = path.join(OUT_DIR, `${id}.html`);
  fs.writeFileSync(file, shrinkDataUrls(page), 'utf8');
  made.push(`${id}（${(fs.statSync(file).size / 1024).toFixed(0)} KB）`);
}
console.log(`✅ docs/card-preview/：${made.join('、')}`);
console.log('   打開後可 Ctrl+P 印成 PDF；版面與 tools/card-studio/aviandex-studio.html 完全相同。');
