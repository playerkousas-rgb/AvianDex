#!/usr/bin/env node
/* ============================================================
 *  gen-card-prompts.mjs —— 由 repo 資料生成「鎖死資料」出圖 prompt
 * ------------------------------------------------------------
 *  用戶定案：由 agent 直接出圖，不用外求 Gemini 頁面。
 *  版面唯一權威 = 用戶已做好的卡（data/card-demo/ref/template-*.png）。
 *
 *  用法：
 *    node scripts/cards/gen-card-prompts.mjs 0008 0013 0245
 *    node scripts/cards/gen-card-prompts.mjs 0008 --write   （寫檔案）
 * ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const J = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

const idx = J('src/data/explorerIndex.json');
const zh = J('src/data/cardDetails.zh.json').birds;
const copy = J('src/data/cardCopy.json');
const meas = J('src/data/measurements.json');
const scores = J('src/data/dexScores.json').scores;
const tax = J('src/data/birdTaxonomy.json');

const n1 = (v) => (v == null ? '資料待查' : Number(v).toFixed(1));
const stars = (v) => {
  const n = Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
};
const sent = (s, max) => {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const i = s.search(/[。；]/);
  const out = i > 0 && i <= max ? s.slice(0, i + 1) : s.slice(0, max);
  return out + (out.length < s.length && !/[。；]$/.test(out) ? '…' : '');
};
const clauses = (s, max) =>
  String(s || '')
    .split(/[。；，\n]/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 2)
    .slice(0, max);

function cells(id) {
  const e = idx.birds[id], c = copy[id] || {}, m = meas[id] || {};
  const sc = scores[id] || {}, t = tax[id] || {};
  const genus = (e.s || '').split(' ')[0] || '';
  const epi = (e.s || '').split(' ').slice(1).join(' ');
  const look = clauses((zh[id] || {}).look || c.look, 4);
  const hl = Array.isArray(c.highlights) && c.highlights.length ? c.highlights : [c.look || ''];
  const hab = (e.h || []).map((x) => idx.habitatTags.find((y) => y.id === x)?.zh).filter(Boolean);
  const diet = (e.d || []).map((x) => idx.dietTags.find((y) => y.id === x)?.zh).filter(Boolean);

  const out = [];
  const add = (zone, lines) => out.push({ zone, lines: lines.filter(Boolean) });

  add('Z01 top title band', [
    'NO.' + id,
    e.z,
    e.e,
    e.s,
    '分類：' + (e.oz || '資料待查') + ' ' + (e.fz || '資料待查'),
  ]);
  add('Z02 under pixel-art box', ['▲ 像素圖鑑 / PIXEL ART']);
  add('Z03 three stat boxes', [
    '身長 ' + (e.len ? e.len + ' cm' : '資料待查'),
    '體重 ' + (m.mass ? m.mass + ' g' : '資料待查'),
    '保育級別 ' + (c.iucn || '資料待查'),
  ]);
  add('Z04 profile paragraph', [
    '圖鑑介紹 / PROFILE',
    sent((zh[id] || {}).look || c.habitat, 80) || '資料待查',
  ]);
  add('Z05 classification, 7 lines', [
    '界：動物界 Animalia',
    '門：脊索動物門 Chordata',
    '綱：鳥綱 Aves',
    '目：' + (e.oz || '資料待查') + ' ' + (e.o || t.order || ''),
    '科：' + (e.fz || '資料待查') + ' ' + (e.f || t.family || ''),
    '屬：' + (genus ? genus + ' 屬' : '資料待查'),
    '種：' + e.z + ' ' + (genus ? genus[0] + '. ' + epi : ''),
  ]);
  add('Z06 ecological habits, 4 lines', [
    '活動：日行性，清晨與黃昏最活躍',
    '棲地：' + (hab.join('、') || '資料待查'),
    '行為：' + (sent(c.behavior, 34) || '資料待查'),
    '食性：' + (diet.join('、') || '資料待查'),
  ]);
  add('Z07 food panel', [sent(c.diet, 58) || '資料待查']);
  add('Z08 distribution panel', [sent(c.range, 72) || '資料待查']);
  add('Z09 growth & reproduction', [sent(c.breeding, 84) || '資料待查']);
  add('Z10 key knowledge, numbered 1–5', hl.slice(0, 5).map((h, i) => i + 1 + ' ' + sent(h, 46)));
  add('Z11 trivia, 3 star bullets', [
    '★ ' + (sent(c.funFact, 44) || '資料待查'),
    '★ ' + (sent(c.voice, 44) || '資料待查'),
    '★ ' + (sent(c.etymology || c.conservation, 44) || '資料待查'),
  ]);
  add('Z12 score card (radar + total)', [
    '生物重要性 ' + n1(sc.i) + '/5',
    '物種適應力 ' + n1(sc.a) + '/5',
    '觀賞價值 ' + n1(sc.v) + '/5',
    '保育關注度 ' + n1(sc.c) + '/5',
    '研究價值 ' + n1(sc.r) + '/5',
    '總評分 ' + stars(sc.o) + ' ' + n1(sc.o) + ' / 5',
  ]);
  add('Z13 observation tips, 4 lines', [
    '最佳觀察時間：清晨與黃昏',
    '建議地點：' + (hab.slice(0, 2).join('、') || '資料待查'),
    '觀察重點：' + (look[0] || '資料待查'),
    '建議裝備：雙筒望遠鏡',
  ]);
  add('Z14 precautions, 3 lines', [
    '切勿捕捉或非法飼養',
    '勿餵食人類食物',
    '觀察時保持距離',
  ]);
  /* Z15：按關鍵字把 look 的子句配到真實部位，配不到就寫資料待查 */
  const SLOTS = [
    ['頭部／額羽', ['冠', '額', '頭', '眼', '喙', '嘴', '臉', '頸']],
    ['羽色',       ['羽', '體色', '黑', '白', '灰', '藍']],
    ['翼部',       ['翼', '翅', '飛']],
    ['腳部',       ['腳', '趾', '爪', '足']],
  ];
  const pool = (String((zh[id] || {}).look || c.look || '') + '。' + (Array.isArray(c.highlights) ? c.highlights.join('。') : '') + '。' + (c.etymology || ''))
    .split(/[。；，、\n]/).map(x=>x.trim()).filter(x=>x.length>=2);
  const used = [];
  const mags = SLOTS.map(([title, keys]) => {
    let pick = '';
    for (const cl of pool) {
      if (used.includes(cl)) continue;
      if (keys.some((k) => cl.includes(k))) { pick = cl; used.push(cl); break; }
    }
    return '「' + title + '」— ' + (pick ? sent(pick, 40) : '資料待查');
  });
  add('Z15 four magnifier circles (title + caption each)', [
    '第 1 個（頭部）：' + mags[0],
    '第 2 個（羽色）：' + mags[1],
    '第 3 個（翼部）：' + mags[2],
    '第 4 個（腳部）：' + mags[3],
  ]);
  add('Z16 similar species, 2 boxes', ['第一個物種名：資料待查', '第二個物種名：資料待查']);
  add('Z17 conservation status', [
    'IUCN ' + (c.iucn || '資料待查') + (c.iucnEn ? ' · ' + c.iucnEn : ''),
    sent(c.conservation, 46) || '資料待查',
  ]);
  add('Z18 call caption', [sent(c.voice, 46) || '資料待查']);
  return out;
}

export function buildPrompt(id) {
  const e = idx.birds[id];
  const c = cells(id);
  const printed = c
    .map((x) => '  [' + x.zone + ']\n' + x.lines.map((l) => '      ' + l).join('\n'))
    .join('\n');

  return [
    'Create ONE finished bird encyclopedia information card, front side only, 2:3 portrait, perfectly flat and facing the camera like a clean scan of a real printed card. No table, no hand, no tilt, no mockup, no watermark, no page curl.',

    'IMAGE 1 — LAYOUT TEMPLATE (supplied by me).\n' +
      '  Copy ONLY its layout: warm cream paper background, thin olive-green rounded outer frame, the exact grid of panels, the position and size of every panel, the small circular pictogram icons, the four magnifier circles down the right edge, the green radar chart, the bottom footer strip, and the typographic hierarchy.\n' +
      '  EVERY WORD, NUMBER, NAME, SPECIES, CAPTION AND LABEL INSIDE IMAGE 1 IS PLACEHOLDER NOISE belonging to a different species. None of it may appear on the finished card — not in the magnifier captions, not in the similar-species boxes, not in the reproduction panel, not in the footer. Do not translate it, do not keep it as decoration. Replace 100% of the text with the PRINTED TEXT block below.',

    'THE BIRD — paint ONE photorealistic ' + e.z + ' (' + e.e + ', ' + e.s + '), natural posture, complete body, clear head, correct plumage and bare-part colours for this species. Also paint a small pixel-art version of the same bird for the top-left box.',

    'PRINTED TEXT — fill the card with EXACTLY these strings, cell by cell. Print nothing else:\n' + printed,

    'CELL RULES\n' +
      '1. All 18 cells must be filled from above. No cell may be left blank and no cell may keep template text.\n' +
      '2. Render numbers exactly as written. Never round, convert or invent a number. If a cell says 資料待查, print 資料待查 exactly, in the same size and style as neighbouring text.\n' +
      '3. Each of the four magnifier circles needs its own title and one short caption from Z15.\n' +
      '4. Traditional Chinese only. No simplified characters, no extra English sentences beyond the given names, no slogans, no QR code, no barcode, no price, no advertisement, no second bird species.',

    'STYLE\n' +
      '  Warm cream paper with very fine fibre texture, thin olive/sage-green panel borders, flat matte print, crisp sharp type, tiny dark-green pictogram icons. No glow, no gradient mesh, no drop shadow, no foil.',

    'FINAL CHECK — re-read every printed string on your card and confirm that (a) no word from IMAGE 1 survived, (b) all 18 cells are present, (c) every number matches PRINTED TEXT. Silently repair anything that fails.',
  ].join('\n\n');
}

/* CLI */
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');
if (write && args.length) {
  const dir = path.join(root, 'deliver/card-prompts');
  mkdirSync(dir, { recursive: true });
  for (const id of args) {
    writeFileSync(path.join(dir, `prompt-${id}.txt`), buildPrompt(id), 'utf8');
  }
  console.log('已寫入 deliver/card-prompts/ 共 ' + args.length + ' 份');
} else {
  for (const id of args) {
    if (!idx.birds[id]) { console.error('冇呢個編號：' + id); continue; }
    console.log('════════ NO.' + id + ' ' + idx.birds[id].z + ' ════════');
    console.log(buildPrompt(id));
  }
}
