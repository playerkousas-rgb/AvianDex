#!/usr/bin/env node
/* ============================================================
 *  產生 569 隻雀的「圖鑑評分」
 * ------------------------------------------------------------
 *  這支腳本不改任何原始資料，只讀三個已核實的檔案：
 *    src/data/explorerIndex.json   分類／食性 tag／棲地 tag／體長
 *    src/data/cardDetails.zh.json   IUCN／遷徙／語源／保育註記
 *    src/data/measurements.json     AVONET 翼長（體長後備）
 *
 *  輸出 src/data/dexScores.json（由 src/lib/dexScore.ts 的公式決定）。
 *  公式改了 → 重跑這支 → 569 張卡一齊更新，不必逐張改。
 *
 *  用法：node scripts/build-dex-scores.mjs [--dry]
 * ============================================================ */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const dry = process.argv.includes('--dry');

/* 借 esbuild 把 TS 公式編成可 import 的 ESM，避免手抄一份公式（兩份一定會走樣） */
const outdir = mkdtempSync(path.join(tmpdir(), 'dexscore-'));
const outfile = path.join(outdir, 'dexScore.mjs');
await build({
  entryPoints: [path.join(root, 'src/lib/dexScore.ts')],
  bundle: true, format: 'esm', platform: 'neutral', outfile,
});
const { dexScore } = await import(pathToFileURL(outfile).href);

const ex = JSON.parse(readFileSync(path.join(root, 'src/data/explorerIndex.json'), 'utf8')).birds;
const zh = JSON.parse(readFileSync(path.join(root, 'src/data/cardDetails.zh.json'), 'utf8')).birds;
const meas = JSON.parse(readFileSync(path.join(root, 'src/data/measurements.json'), 'utf8'));

const scores = {};
const dist = {};
let estimated = 0;

for (const [id, e] of Object.entries(ex)) {
  const d = zh[id] || {};
  const m = meas[id] || {};
  const s = dexScore({
    iucn: d.iucn,
    habitats: (e.h || []).length,
    diets: (e.d || []).length,
    lengthCm: e.len || 0,
    wingMm: m.wing ? Number(m.wing) : 0,
    hasMigration: !!d.migration,
    hasEtymology: !!d.etymology,
    hasHighlights: !!d.highlights,
    conservationText: d.conservation,
  });
  if (s.lengthEstimated) estimated += 1;

  /* 只存有值的欄位，null 全部省略（檔案細一點，也令人一眼看出缺什麼） */
  const rec = {};
  if (s.importance != null) rec.i = s.importance;
  if (s.adaptability != null) rec.a = s.adaptability;
  if (s.visibility != null) rec.v = s.visibility;
  if (s.research != null) rec.r = s.research;
  if (s.attention != null) rec.c = s.attention;
  if (s.overall != null) rec.o = s.overall;
  if (s.lengthEstimated) rec.vEst = 1;
  scores[id] = rec;

  const bucket = s.overall == null ? '無' : s.overall.toFixed(1);
  dist[bucket] = (dist[bucket] || 0) + 1;
}

const payload = {
  _readme: [
    '圖鑑評分（自訂指標，非學術評分）。由 scripts/build-dex-scores.mjs 產生，不要手改。',
    'i=生物重要性（IUCN） a=適應力（棲地×食性 tag） v=觀賞價值（體長，易觀察度）',
    'r=研究價值（遷徙/語源/要點） c=保育關注度（受脅註記+IUCN） o=綜合',
    'vEst=1 表示體長由 AVONET 翼長×0.22 估算，卡面會標「約」。',
    '公式見 src/lib/dexScore.ts。',
  ],
  scores,
};

if (dry) {
  console.log('（dry run）共', Object.keys(scores).length, '隻');
} else {
  writeFileSync(path.join(root, 'src/data/dexScores.json'), JSON.stringify(payload) + '\n', 'utf8');
  console.log('已寫入 src/data/dexScores.json（', Object.keys(scores).length, '隻）');
}

console.log('體長由翼長估算：', estimated, '隻');
const ovs = Object.values(scores).map((s) => s.o).filter((v) => v != null);
console.log(`綜合分：有分 ${ovs.length}，平均 ${(ovs.reduce((a, b) => a + b, 0) / ovs.length).toFixed(2)}，最高 ${Math.max(...ovs)}`);
