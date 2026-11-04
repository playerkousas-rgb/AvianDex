#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 產生「卡面工作室」用的單檔 HTML
 * ------------------------------------------------------------
 *  用法：
 *    node scripts/cards/build-studio-data.mjs            # 全部有文案的卡
 *    node scripts/cards/build-studio-data.mjs --out x.html
 *
 *  為什麼要有這支？
 *    用戶的兩個 HTML（AI SCOUT / 漫畫生成器）證明了一件事：
 *    「版面用 HTML + CSS，文字用 DOM 寫，AI 只畫圖」係最快而且最準的做法。
 *    但卡面一旦要批次（559 張），就唔可以每次貼 prompt，
 *    所以要有一支工具把「資料 → 單檔 HTML（雙擊即開）」。
 *
 *  輸出：tools/card-studio/aviandex-studio.html
 *    · 內嵌全部文案 + 分類快照（唔需要上網，唔需要 build）
 *    · 內嵌 0008 的像素圖／真雀相／5 張小插圖（dataURL，約 2MB）
 *    · 可以直接在 Gemini Canvas 貼上使用，或本機雙擊開啟
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'src/data');
const STUDIO = path.join(ROOT, 'tools/card-studio');
const ART = path.join(ROOT, 'cards/art');

const HOME_CARD = '0008';        // 內嵌示範資產的卡
const ICON_KEYS = ['分佈地區', '棲息環境', '食物', '成長與繁殖', '有趣冷知識'];
const ICON_FILES = {
  分佈地區: 'icons/range-asia.png',
  棲息環境: 'icons/habitat-park.png',
  食物: 'icons/food-insects.png',
  成長與繁殖: 'icons/nest-eggs.png',
  有趣冷知識: 'icons/song-notes.png',
};
const MAX_EDGE = 900;            // 內嵌圖片長邊上限（控制檔案大小）
const JPEG_Q = 82;

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };

/* ---------- 文字工具 ---------- */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/;
/** 版面用的「視覺寬度」：中日韓字＝1，其他＝0.55 */
function vis(text) {
  let n = 0;
  for (const ch of String(text || '')) n += CJK.test(ch) ? 1 : 0.55;
  return Math.round(n);
}

/* ---------- 圖片 → dataURL（用 ImageMagick，唔想加 node 依賴） ---------- */
function embedImage(file) {
  if (!exists(file)) return null;
  const tmp = path.join('/tmp', 'studio-' + path.basename(file).replace(/\W/g, '_') + '.jpg');
  try {
    // 一律轉 JPEG（相片）或 PNG（像素圖／插畫保留清晰度）
    const isPixel = /sprite/i.test(file);
    const out = isPixel ? tmp.replace(/\.jpg$/, '.png') : tmp;
    const args = isPixel
      ? [file, '-resize', `${MAX_EDGE}x${MAX_EDGE}>`, out]
      : [file, '-resize', `${MAX_EDGE}x${MAX_EDGE}>`, '-quality', String(JPEG_Q), out];
    const r = spawnSync('convert', args);
    if (r.status !== 0) throw new Error('convert 失敗');
    const mime = isPixel ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,` + fs.readFileSync(out).toString('base64');
  } catch (e) {
    console.warn(`⚠️  ${path.basename(file)} 未能內嵌：${e.message}`);
    return null;
  }
}

/* ---------- 資料快照 ---------- */
function buildData() {
  const birds = readJson(path.join(DATA, 'birds.json'));
  const tax = readJson(path.join(DATA, 'birdTaxonomy.json'));
  const copyPath = path.join(DATA, 'cardCopy.json');
  const copy = exists(copyPath) ? readJson(copyPath) : {};

  const byId = new Map(birds.map((b) => [b.id, b]));
  const cards = {};
  for (const [id, c] of Object.entries(copy)) {
    if (!/^\d{4}$/.test(id)) continue;
    const b = byId.get(id) || {};
    const t = tax[id] || {};
    cards[id] = {
      name: b.name || t.zh || '',
      en: t.comName || b.en || '',
      sci: t.sciName || '',
      order: t.order || '',
      family: t.family || '',
      orderZh: c.orderZh || t.orderZh || '',
      familyZh: c.familyZh || t.familyZh || '',
      code: t.speciesCode || '',
      copy: c,
    };
  }

  /* 分類快照：只留工作室會用到的欄位，控制體積 */
  const taxLite = {};
  for (const [id, t] of Object.entries(tax)) {
    taxLite[id] = {
      zh: (byId.get(id) || {}).name || '',
      comName: t.comName || '', sciName: t.sciName || '',
      order: t.order || '', family: t.family || '',
      orderZh: t.orderZh || '', familyZh: t.familyZh || '',
      speciesCode: t.speciesCode || '',
    };
  }
  return { cards, tax: taxLite };
}

/* ---------- 內嵌資產 ---------- */
/* 如果 cards/art/ 冇資產（例如 CI 或新 clone），但現有成品已內嵌，
 * 就沿用成品的資產：否則每次重建都會把 3.9 MB 成品弄成 2.6 MB，
 * 「有冇相」看起來沒變，但圖就靜靜消失了。 */
function existingAssets(out) {
  try {
    if (!exists(out)) return {};
    const s = fs.readFileSync(out, 'utf8');
    const i = s.indexOf('window.AVIANDEX_ASSETS=');
    if (i < 0) return {};
    const start = i + 'window.AVIANDEX_ASSETS='.length;
    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;
    for (let k = start; k < s.length; k += 1) {
      const ch = s[k];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') { inStr = true; continue; }
      if (ch === '{') depth += 1;
      else if (ch === '}') { depth -= 1; if (depth === 0) { end = k + 1; break; } }
    }
    if (end < 0) return {};
    const obj = JSON.parse(s.slice(start, end));
    return obj && typeof obj === 'object' ? obj : {};
  } catch (e) {
    console.warn('⚠️  讀不到舊成品內嵌資產：' + e.message);
    return {};
  }
}

function buildAssets(out) {
  const A = Object.assign({}, existingAssets(out));
  const photo = path.join(ART, `${HOME_CARD}-photo.png`);
  const sprite = path.join(ART, `${HOME_CARD}-sprite.png`);
  if (exists(photo)) A[`photo:${HOME_CARD}`] = embedImage(photo);
  if (exists(sprite)) A[`sprite:${HOME_CARD}`] = embedImage(sprite);
  for (const k of ICON_KEYS) {
    const url = embedImage(path.join(ART, ICON_FILES[k]));
    if (url) A[`icon:${k}`] = url;
  }
  return Object.fromEntries(Object.entries(A).filter(([, v]) => v));
}

/* ---------- 品質檢查：每格字數（版面預算） ---------- */
const BUDGET = {
  intro_zh: 150, length: 14, weight: 18, range: 60, habitat: 60, diet: 60,
  breeding: 175, funFact: 70, etymology: 90,
};
const ITEM_MAX = 44;
function lintCard(id, c) {
  const warn = [];
  for (const [k, max] of Object.entries(BUDGET)) {
    const v = String(c[k] || '').trim();
    if (v && vis(v) > max) warn.push(`${k} 視覺寬度 ${vis(v)} > ${max}`);
  }
  for (const k of ['highlights', 'tips', 'caution']) {
    for (const it of c[k] || []) {
      const t = typeof it === 'string' ? it : it.text || '';
      if (vis(t) > ITEM_MAX) warn.push(`${k} 有一條 ${vis(t)} > ${ITEM_MAX}：${t.slice(0, 18)}…`);
    }
  }
  if (c.scores && Object.keys(c.scores).length !== 5) warn.push('scores 不是 5 項');
  if (c.scores && !c.facts_note) warn.push('有主觀評分但冇 facts_note 聲明');
  if ((c.callouts || []).length && !c.photo) warn.push('有 callouts 但冇 photo（會出空圈）');
  return warn;
}

/* ---------- 主程式 ---------- */
function main() {
  const args = process.argv.slice(2);
  const outArg = args.indexOf('--out');
  const out = outArg >= 0 ? path.resolve(args[outArg + 1])
    : path.join(STUDIO, 'aviandex-studio.html');

  const shellPath = path.join(STUDIO, 'studio.html');
  if (!exists(shellPath)) throw new Error('找不到 tools/card-studio/studio.html');
  let shell = fs.readFileSync(shellPath, 'utf8');

  const { cards, tax } = buildData();
  const assets = buildAssets(out);
  const ids = Object.keys(cards).sort();

  /* 品質檢查報告 */
  const problems = [];
  for (const id of ids) {
    const w = lintCard(id, cards[id].copy);
    if (w.length) problems.push([id, w]);
  }

  /* 注入資料（放喺 studio.html 的 boot() 之前） */
  const payload =
    '<script>\n/* ==== 由 scripts/cards/build-studio-data.mjs 產生，請勿手改 ==== */\n' +
    `window.AVIANDEX_STUDIO=${JSON.stringify({ cards, tax })};\n` +
    `window.AVIANDEX_ASSETS=${JSON.stringify(assets)};\n` +
    '</script>\n';

  shell = shell.replace('<script>\n/* ============================================================\n *  AvianDex 卡面工作室', payload + '<script>\n/* ============================================================\n *  AvianDex 卡面工作室');

  /* 讓 studio 讀 AVIANDEX_ASSETS */
  shell = shell.replace("const A = {};   /* 執行期資產（AI 生成或手動放入的圖） */",
    "const A = Object.assign({}, window.AVIANDEX_ASSETS || {});   /* 內嵌資產 + AI 生成 */");

  fs.mkdirSync(path.dirname(out), { recursive: true });
  /* 防止「用咗舊資產重建」把成品弄瘦：成品檔（已內嵌資料的舊版）如果有內嵌圖而
   * 今次冇，就唔好覆蓋 —— 否則 3.9 MB 會變成 2.6 MB，而冇人會發現。 */
  /* 最後檢查：舊成品有圖、新成品冇圖 → 用舊圖補回（正常情況下 existingAssets 已處理） */
  if (fs.existsSync(out) && fs.readFileSync(out, 'utf8').includes('data:image/')
      && !JSON.stringify(assets).includes('data:image/')) {
    fs.writeFileSync(out + '.new', shell, 'utf8');
    console.warn('\n⚠️ 今次冇內嵌圖（cards/art/ 冇資產），但現有成品有 → 新版本寫成 .new，未覆蓋。');
    return;
  }
  fs.writeFileSync(out, shell, 'utf8');

  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  const cardKb = ids.length;

  console.log(`✅ ${path.relative(ROOT, out)}（${kb} KB）`);
  console.log(`   卡：${cardKb} 張（${ids.join(' ')}）`);
  console.log(`   內嵌圖：${Object.keys(assets).length} 張（${Object.keys(assets).join('、')}）`);
  console.log(`   分類快照：${Object.keys(tax).length} 個編號`);

  if (problems.length) {
    console.log('\n⚠️ 版面預算警告（唔會擋出圖，但會擠到或截字）：');
    for (const [id, w] of problems) {
      console.log(`   ${id}`);
      for (const x of w) console.log(`     · ${x}`);
    }
  } else {
    console.log('\n✅ 所有卡的欄位長度都在版面預算之內');
  }
}

main();
