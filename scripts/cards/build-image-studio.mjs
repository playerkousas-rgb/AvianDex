#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 產生「出圖工作室」單檔 HTML
 * ------------------------------------------------------------
 *  用法：
 *    node scripts/cards/build-image-studio.mjs              # 用 cards/art/image-ref-card.jpg
 *    node scripts/cards/build-image-studio.mjs --ref FILE   # 換參考圖
 *    node scripts/cards/build-image-studio.mjs --no-ref     # 唔內嵌參考卡
 *
 *  為什麼要這支？
 *    Gemini 出圖要三樣嘢齊：① 參考圖（鎖風格）② 板模 prompt（鎖內容）
 *    ③ 卡面資料（鎖外形，唔准 AI 自由創作）。
 *    「一鍵出齊」時唔可以靠人手貼，所以要把三樣嘢預先注入單檔 HTML。
 *
 *  體積控制：參考圖縮到長邊 1200、JPEG 80（約 150 KB），
 *            分類快照只留 prompt 會用到的欄位。
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'src/data');
const STUDIO = path.join(ROOT, 'tools/card-studio');
const ART = path.join(ROOT, 'cards/art');

const DEFAULT_REF = [
  path.join(ART, 'image-ref-card.jpg'),
  path.join(ART, '0008-refcard.png'),
];
const MAX_EDGE = 1200;
const JPEG_Q = 80;

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };

function toDataUrl(file, { maxEdge = MAX_EDGE, q = JPEG_Q } = {}) {
  const out = path.join('/tmp', 'studio-ref-' + Date.now() + '.jpg');
  const r = spawnSync('convert', [file, '-resize', `${maxEdge}x${maxEdge}>`, '-quality', String(q), out]);
  if (r.status !== 0) throw new Error('convert 失敗：' + file);
  const b = fs.readFileSync(out);
  fs.unlinkSync(out);
  return { url: 'data:image/jpeg;base64,' + b.toString('base64'), bytes: b.length };
}

/* 沿用舊成品的內嵌資產（參考卡）。cards/art/ 冇資產時（新 clone／CI），
 * 直接重建會把 5.2 MB 成品換成「冇參考卡」版；圖看起來還在，但其實消失了。 */
function existingAssets(file) {
  try {
    if (!exists(file)) return {};
    const s2 = fs.readFileSync(file, 'utf8');
    const i = s2.indexOf('window.AVIANDEX_ASSETS=');
    if (i < 0) return {};
    const start = i + 'window.AVIANDEX_ASSETS='.length;
    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;
    for (let k = start; k < s2.length; k += 1) {
      const ch = s2[k];
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
    const o = JSON.parse(s2.slice(start, end));
    return o && typeof o === 'object' ? o : {};
  } catch (e) {
    console.warn('⚠️  讀不到舊成品資產：' + e.message);
    return {};
  }
}

function main() {
  const args = process.argv.slice(2);
  const refIdx = args.indexOf('--ref');
  const noRef = args.includes('--no-ref');
  const shellPath = path.join(STUDIO, 'imagestudio.html');
  if (!exists(shellPath)) throw new Error('找不到 tools/card-studio/imagestudio.html');
  let shell = fs.readFileSync(shellPath, 'utf8');

  /* 資料：同卡面工作室一樣的形狀，方便兩邊互通 */
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
      id,
      name: b.name || t.zh || '',
      en: t.comName || b.en || '',
      sci: t.sciName || '',
      orderZh: t.orderZh || '', familyZh: t.familyZh || '',
      /* 只留卡面會用到的純文字欄位（唔要 fieldCopy 原始結構以外的雜訊） */
      copy: {
        ...c,
        fieldCopy: (c.fieldCopy || []).map((x) => ({ id: x.id, zh: x.zh, en: x.en })),
      },
      /* 相片由 Gemini 自己上 Macaulay Library 找 → 這裡只給「去哪找」與可追溯的搜尋鍵 */
      src: {
        macaulay: `https://search.macaulaylibrary.org/catalog?taxonCode=${t.speciesCode || ''}&mediaType=photo&sort=rating_rank_desc`,
        asset: '',                       // 有指定 assetId 才填（人手補）
        wikidata: '',                    // 預留
      },
      speciesCode: t.speciesCode || '',
    };
  }
  const taxLite = {};
  for (const [id, t] of Object.entries(tax)) {
    taxLite[id] = {
      zh: (byId.get(id) || {}).name || '',
      comName: t.comName || '', sciName: t.sciName || '',
      orderZh: t.orderZh || '', familyZh: t.familyZh || '',
    };
  }

  /* 參考圖（沿用舊成品資產，再用 cards/art/ 的新圖覆蓋） */
  const outFile = path.join(STUDIO, 'aviandex-image-studio.html');
  const assets = noRef ? {} : existingAssets(outFile);
  if (!noRef) {
    let refFile = refIdx >= 0 ? path.resolve(args[refIdx + 1]) : DEFAULT_REF.find(exists);
    if (refFile && exists(refFile)) {
      try {
        const r = toDataUrl(refFile);
        assets.refcard = r.url;
        console.log(`✅ 參考卡：${path.relative(ROOT, refFile)}（${Math.round(r.bytes / 1024)} KB）`);
      } catch (e) {
        console.warn('⚠️  參考卡未能內嵌：' + e.message);
      }
    } else {
      if (assets.refcard) {
        console.log('ℹ️  cards/art/ 冇參考卡檔，沿用舊成品內嵌的參考卡');
      } else {
        console.warn('⚠️  找不到參考卡（' + DEFAULT_REF.map((p) => path.relative(ROOT, p)).join(' / ') +
          '）。工作室仍可用，但要自己拖入圖片。');
      }
    }
  }

  /* 另外給一份「原始」copy（未加工的 fieldCopy 等），工作室用它取 en 與 src；
   * cards 保持舊形狀，唔會影響已寫好的 prompt 模板。 */
  const rawCopy = {};
  for (const [id, c] of Object.entries(copy)) {
    if (!/^\d{4}$/.test(id)) continue;
    const t = tax[id] || {};
    rawCopy[id] = {
      ...c,
      speciesCode: t.speciesCode || '',
      src: {
        macaulay: t.speciesCode
          ? `https://search.macaulaylibrary.org/catalog?taxonCode=${t.speciesCode}&mediaType=photo&sort=rating_rank_desc`
          : '',
        asset: '',
      },
    };
  }

  const payload =
    '<script>\n/* ==== 由 scripts/cards/build-image-studio.mjs 產生，請勿手改 ==== */\n' +
    `window.AVIANDEX_STUDIO=${JSON.stringify({ cards, tax: taxLite, raw: rawCopy })};\n` +
    `window.AVIANDEX_ASSETS=${JSON.stringify(assets)};\n` +
    '</script>\n';

  const marker = '<script>\n/* ============================================================\n *  AvianDex 出圖工作室';
  if (!shell.includes(marker)) throw new Error('喺 imagestudio.html 搵唔到注入點');
  shell = shell.replace(marker, payload + marker);

  const out = outFile;
  fs.writeFileSync(out, shell, 'utf8');
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`✅ ${path.relative(ROOT, out)}（${kb} KB）`);
  console.log(`   卡：${Object.keys(cards).length} 張　分類快照：${Object.keys(taxLite).length} 個編號`);
  console.log(`   可寫入 prompt 的欄位：look / habitat / diet / range / funFact / callouts`);

  /* 順手報告：邊幾張連外形描述都冇（出圖會變成「AI 自己想像」） */
  const thin = Object.entries(cards)
    .filter(([, v]) => !v.copy.look && !v.copy.habitat)
    .map(([id, v]) => `${id} ${v.name}`);
  if (thin.length) {
    console.log(`\n⚠️  ${thin.length} 張冇「外形／棲地」可寫入 prompt（出圖會較不準，建議先補資料）：`);
    console.log('   ' + thin.slice(0, 24).join('、') + (thin.length > 24 ? ' …' : ''));
  }
}

main();
