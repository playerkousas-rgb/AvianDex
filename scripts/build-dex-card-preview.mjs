#!/usr/bin/env node
/* ============================================================
 *  生成「圖鑑資訊卡」的靜態預覽頁（tools/dex-card-preview.html）
 * ------------------------------------------------------------
 *  用途：把 1 張（或幾張）卡砌出來給人眼驗收，不必開 dev server。
 *  卡面由 src/lib/dexCardLayout.ts 砌 —— 同一個 renderer 之後給 app 用，
 *  預覽與 app 不會走兩套版。
 *
 *  用法：
 *    node scripts/build-dex-card-preview.mjs                 # 預設 0013 八哥
 *    node scripts/build-dex-card-preview.mjs 0013 0004 0049
 * ============================================================ */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const ids = process.argv.slice(2).filter((a) => /^\d{1,4}$/.test(a));
const targets = ids.length ? ids.map((i) => i.padStart(4, '0')) : ['0013'];

/* 用 esbuild 直接吃 TS 的 renderer，避免手抄版式 */
const outfile = path.join(mkdtempSync(path.join(tmpdir(), 'dexcard-')), 'layout.mjs');
await build({
  entryPoints: [path.join(root, 'src/lib/dexCardLayout.ts')],
  bundle: true, format: 'esm', platform: 'neutral', outfile,
});
const { renderDexCard, DEX_CARD_CSS } = await import(pathToFileURL(outfile).href);

const J = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const idx = J('src/data/explorerIndex.json');
const zhAll = J('src/data/cardDetails.zh.json').birds;
const enAll = J('src/data/cardDetails.en.json').birds;
const measAll = J('src/data/measurements.json');
const scoresAll = J('src/data/dexScores.json').scores;
const srcAll = J('src/data/cardSources.json').sources;
const pkg = J('package.json');
const birds = idx.birds;
const dietMap = Object.fromEntries(idx.dietTags.map((t) => [t.id, t]));
const habMap = Object.fromEntries(idx.habitatTags.map((t) => [t.id, t]));
const R2 = 'https://pub-a9333a974e814ccba1994639b6e79266.r2.dev/birdcards';

function toInput(id) {
  const e = birds[id];
  const m = measAll[id] || {};
  const meas = {};
  for (const k of ['wing', 'tail', 'tarsus', 'bill', 'mass']) if (m[k]) meas[k] = String(m[k]);
  return {
    id,
    zhName: e.z, enName: e.e, sciName: e.s,
    orderLatin: e.o, orderZh: e.oz, familyLatin: e.f, familyZh: e.fz,
    zh: zhAll[id] || {}, en: enAll[id] || {},
    dietZh: (e.d || []).map((t) => dietMap[t]?.zh).filter(Boolean),
    dietEn: (e.d || []).map((t) => dietMap[t]?.en).filter(Boolean),
    habitatZh: (e.h || []).map((t) => habMap[t]?.zh).filter(Boolean),
    habitatEn: (e.h || []).map((t) => habMap[t]?.en).filter(Boolean),
    meas,
    mass: m.mass ? String(m.mass) : '',
    wing: m.wing ? String(m.wing) : '',
    lengthCm: e.len || 0,
    lengthEstimated: !!scoresAll[id]?.vEst,
    score: scoresAll[id],
    source: srcAll[id] || '',
    version: `v${pkg.version}`,
    artUrl: `${R2}/${id}.avif`,
  };
}

const cards = targets.map((id) => {
  const d = toInput(id);
  return `
  <section class="wrap" id="card-${id}">
    <div class="cap">
      <b>NO.${id}</b> ${d.zhName} · ${d.enName}
      <span class="hint">螢幕上的是 1200×1600 原尺寸（縮放看整張，1:1 看細節）</span>
    </div>
    <div class="stage"><div class="scaler">${renderDexCard(d)}</div></div>
  </section>`;
}).join('');

const html = `<!doctype html>
<html lang="zh-Hant-HK"><head>
<meta charset="utf-8">
<title>圖鑑資訊卡預覽 · AvianDex</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<style>
  body{margin:0;background:#20241f;color:#e8ece8;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif}
  .top{padding:18px 24px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;gap:16px;align-items:baseline;flex-wrap:wrap}
  .top h1{font-size:16px;margin:0;letter-spacing:.02em}
  .top p{margin:0;font-size:12px;color:#9fae9f}
  .wrap{padding:22px 24px 40px}
  .cap{font-size:13px;color:#cfd8cf;margin-bottom:10px;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
  .cap b{font-family:ui-monospace,monospace;color:#e9c65c}
  .hint{font-size:11px;color:#7d8a7d}
  /* 容器永遠是 1200 寬，用 transform 縮到視窗寬度：
     這樣 1200×1600 的原尺寸版面在窄螢幕上只是縮小，不會被 reflow 打散 */
  .stage{width:1200px;max-width:100%;height:1600px;overflow:hidden;background:#0e120e;
         border-radius:14px;transform-origin:top left}
  .scaler{transform-origin:top left}
  ${DEX_CARD_CSS}
  /* 預覽頁把卡縮到容器寬度；下載用的 PNG 一律用 1200×1600 原尺寸 */
  body{--s:1}
  @media (max-width:1290px){
    body{--s:calc((100vw - 48px) / 1200)}
    .wrap{padding-bottom:calc(40px + (1600px * (1 - var(--s)) * 0))}
    .stage{transform:scale(var(--s));margin-bottom:calc(1600px * (var(--s) - 1))}
  }
</style>
</head><body>
<div class="top">
  <h1>圖鑑資訊卡 · 預覽</h1>
  <p>一套版式，按「目」自動換色 · 文字由 git 內 JSON 注入 · 插畫用 BIRD-DEX 2 現成 569 張 · 空欄一律寫「資料待查」</p>
</div>
${cards}
</body></html>`;

writeFileSync(path.join(root, 'public/dex-card-preview.html'), html, 'utf8');
console.log('已寫入 public/dex-card-preview.html（', targets.length, '張：', targets.join(', '), '）');
