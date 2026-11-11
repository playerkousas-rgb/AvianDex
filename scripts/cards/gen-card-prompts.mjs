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
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..', '..');
const J = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

const idx = J('src/data/explorerIndex.json');
const zh = J('src/data/cardDetails.zh.json').birds;
const copy = J('src/data/cardCopy.json');
const meas = J('src/data/measurements.json');
const scores = J('src/data/dexScores.json').scores;
const tax = J('src/data/birdTaxonomy.json');

const n1 = (v) => (v == null ? '資料待查' : Number(v).toFixed(1));
const tc = (t) => String(t || '').replace(/缅/g, '緬');
const stars = (v) => {
  const n = Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
};
const sent = (s, max) => {
  s = String(s || '').replace(/\s+/g, ' ').replace(/^[*＊•·\s]+/, '').trim();
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


/* 體長文字：優先用 Wikipedia 區間；否則用 AVONET 估算單值並標「約」 */
function lenText(e, c) {
  const raw = c && c.length ? String(c.length).trim() : '';
  // 只接受 cm 或純數字；in / mm 之類不印在卡面，改用 AVONET 單值
  const m = raw.match(/^(\d+(?:\.\d+)?(?:\s*[–-]\s*\d+(?:\.\d+)?)?)\s*(cm)?$/i);
  if (m) {
    let v = m[1].replace(/\s*[–-]\s*/, '–');
    // 明顯倒轉的區間（如 48–33）視為無效
    const rr = v.split('–').map(Number);
    if (rr.length === 2 && rr[0] > rr[1]) v = '';
    if (v) return v + ' cm';
  }
  if (e && e.len) return '約 ' + e.len + ' cm';
  return '資料待查';
}

/* 同科近緣種：同科、體長最接近、且在本圖鑑內 */
function similarSpecies(id) {
  const e = idx.birds[id] || {};
  const fam = e.fz || '';
  if (!fam) return ['第一個物種名：資料待查', '第二個物種名：資料待查'];
  const self = Number(e.len) || Number((copy[id] || {}).length?.replace(/\D.*/, '')) || 0;
  const peers = Object.keys(idx.birds)
    .filter((k) => k !== id && idx.birds[k].fz === fam && idx.birds[k].len)
    .map((k) => ({ k, z: tc(idx.birds[k].z), d: Math.abs(Number(idx.birds[k].len) - self) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 2);
  if (!peers.length) return ['第一個物種名：資料待查', '第二個物種名：資料待查'];
  return peers.map((p, i) => (i === 0 ? '第一個' : '第二個') + '：同科近緣 ' + p.z);
}

export function cells(id) {
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
    '身長 ' + lenText(e, c),
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
  add('Z10 key knowledge, numbered 1–5', Array.from({ length: 5 }, (_, i) => i + 1 + ' ' + (sent(hl[i], 46) || '資料待查')));
  add('Z11 trivia, 3 star bullets', [
    '★ ' + (sent(c.funFact, 44) || '資料待查'),
    '★ ' + (sent(c.voice, 44) || '資料待查'),
    '★ ' + (sent(c.etymology || c.conservation, 44) || '資料待查'),
  ]);
  add('Z12 score card (radar pentagon, vertices clockwise from the top: 生物重要性, 物種適應力, 研究價值, 保育關注度, 觀賞價值; each label sits next to its own vertex)', [
    '生物重要性 ' + n1(sc.i) + '/5',
    '物種適應力 ' + n1(sc.a) + '/5',
    '研究價值 ' + n1(sc.r) + '/5',
    '保育關注度 ' + n1(sc.c) + '/5',
    '觀賞價值 ' + n1(sc.v) + '/5',
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
  add('Z16 similar species, 2 boxes', similarSpecies(id));
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

/* 精簡版（給 generate_image：附 2 張圖＝去字位圖＋參考卡）。
 * v2 修正（0023 實測）：只准 4 個放大鏡、雷達標籤固定順時針、Z10 補滿 5 項。 */
export const SECTION_TITLES = [
  ['Z04', '圖鑑介紹 / PROFILE'], ['Z05', '分類資訊 / CLASSIFICATION'], ['Z06', '生態習性 / ECOLOGICAL HABITS'],
  ['Z07', '食物 / DIET'], ['Z08', '分佈地區 / DISTRIBUTION'], ['Z09', '成長與繁殖 / GROWTH & REPRODUCTION'],
  ['Z10', '關鍵知識 / KEY KNOWLEDGE'], ['Z11', '趣味冷知識 / TRIVIA'], ['Z12', '生態價值評分卡 / ECOLOGICAL VALUE CARD'],
  ['Z13', '觀察小貼士 / OBSERVATION TIPS'], ['Z14', '注意事項 / PRECAUTIONS'], ['Z15', '特徵放大鏡 / DETAIL CALL-OUTS'],
  ['Z16', '可混淆物種 / SIMILAR SPECIES'], ['Z17', '保育狀態 / CONSERVATION STATUS'], ['Z18', '叫聲 / CALL'],
];

export function buildAgentPrompt(id) {
  const e = idx.birds[id];
  const printed = cells(id)
    .map((x) => '  [' + x.zone + ']\n' + x.lines.map((l) => '      ' + l).join('\n'))
    .join('\n');
  return [
    'Create ONE finished bird encyclopedia information card, front side only, 2:3 portrait, perfectly flat and facing the camera like a clean scan of a real printed card. No table, no hand, no tilt, no mockup, no watermark, no page curl.',
    'IMAGE 1 = blank LAYOUT ZONE MAP (boxes only, no species text): copy its exact grid of panels, positions and sizes.\nIMAGE 2 = a finished reference card (its species is irrelevant) for visual style, typography, icons, radar chart and magnifier circles ONLY. Paint the new bird fresh; do not copy its bird. EVERY WORD, NUMBER, NAME, CAPTION AND LABEL IN IMAGE 2 IS PLACEHOLDER NOISE for another species and must NOT appear. Replace 100% of the text with the PRINTED TEXT below.',
    'THE BIRD — paint ONE photorealistic ' + e.z + ' (' + e.e + ', ' + e.s + '), natural posture, complete body, clear head, correct plumage and bare-part colours for this species. Also paint a small pixel-art version of the same bird for the top-left box.',
    'PRINTED TEXT — fill the card with EXACTLY these strings, cell by cell. Print nothing else:\n' + printed,
    'SECTION TITLES — print each exactly as written. They REPLACE the grey position labels (such as "Z06 ECOLOGICAL HABITS") on IMAGE 1. Those grey labels, every "Zxx" code and every English word of IMAGE 1 are position markers only and must NEVER appear on the finished card:\n' + SECTION_TITLES.map(([z, t]) => '  ' + z + '  →  ' + t).join('\n'),
    'CELL RULES\n1. All 18 cells must be filled; none may keep template text.\n2. Render numbers exactly as written. Never round or invent a number. If a cell says 資料待查, print 資料待查 exactly.\n3. EXACTLY FOUR magnifier circles in the right column (頭部, 羽色, 翼部, 腳部), each a close-up painting of that body part of the new bird, each with its own title and one short caption. No fifth circle, no circle numbers, no duplicate titles.\n4. Key knowledge (Z10) has exactly five numbered lines 1,2,3,4,5 in order.\n5. Radar chart: each of the five numbers sits beside its own label exactly as in Z12; do not swap values between labels.\n6. Traditional Chinese only, no simplified characters, no extra English sentences, no slogans, no QR code, no price, no second bird species. Similar-species boxes show only a small icon plus the name.',
    'STYLE: warm cream paper with fine fibre texture, thin olive/sage-green panel borders, flat matte print, crisp sharp type, tiny dark-green pictogram icons. No glow, no drop shadow, no foil.',
    'FINAL CHECK — re-read every printed string and confirm no word from IMAGE 2 survived, all 18 cells present, every number matches. Silently repair anything that fails.',
  ].join('\n\n');
}

/* ── 精簡圖示卡（只有名稱／數字／短標籤＋圖示；固定標題已寫死在 lite-template.png）── */
export function liteFields(id) {
  const e = idx.birds[id], c = copy[id] || {}, m = meas[id] || {};
  const sc = scores[id] || {}, t = tax[id] || {};
  const genus = (e.s || '').split(' ')[0] || '';
  const epi = (e.s || '').split(' ').slice(1).join(' ');
  const hab = (e.h || []).map((x) => idx.habitatTags.find((y) => y.id === x)?.zh).filter(Boolean).slice(0, 4);
  const diet = (e.d || []).map((x) => idx.dietTags.find((y) => y.id === x)?.zh).filter(Boolean).slice(0, 4);
  const sim = similarSpecies(id).map((x) => (x.includes('：') ? x.split('：')[1] : x).replace(/^同科近緣 /, ''));
  const iucnZh = String(c.iucn || '').split(' ')[0] || '資料待查';
  const code = (String(c.iucn || '').match(/\b([A-Z]{2})\b/) || [])[1] || '';
  return {
    e, c, hab, diet, sim, genus, epi, code, iucnZh, sc,
    len: lenText(e, c), mass: m.mass ? m.mass + ' g' : '資料待查',
  };
}

export function buildLitePrompt(id) {
  const f = liteFields(id);
  const { e, c, sc } = f;
  const slotList = (arr, n) => !arr.length ? 'NO DATA: erase all four circles and tag boxes, and print the single word 資料待查 centred in the panel' : Array.from({ length: n }, (_, i) => (arr[i] ? `circle ${i + 1}: icon of "${arr[i]}", tag text: ${arr[i]}` : `circle ${i + 1}: NOT USED — erase this circle and its tag box completely`)).join('\n      ');
  return [
    'Create ONE finished bird info card, front side only, 2:3 portrait, flat like a clean scan. No table, no hand, no mockup, no watermark.',
    'IMAGE 1 is the card TEMPLATE. Keep its layout, panels, colours, frame, and ALL text already printed on it EXACTLY as is (titles like 身長, 體重, 分類資訊, 棲息環境, 食物, 分佈地區, 成長與繁殖, 生態價值評分, 叫聲, 可混淆物種, 保育狀態, 頭部/羽色/翼部/腳部, 界/門/綱/目/科/屬/種, radar axis names, IUCN, NO.). Do NOT redraw, retype, translate or restyle those printed words. Your job is only to fill the empty light-outlined SLOTS and the empty picture frames, and then remove the slot outlines.',
    'THE BIRD — ' + e.z + ' (' + e.e + ', ' + e.s + '). Correct plumage and bare-part colours for this species. One bird species only.',
    'FILL THE PICTURE FRAMES (no text inside any picture):\n' +
      '  · Pixel-art frame (top-left): small 16-bit pixel art of the bird, side view.\n' +
      '  · Large centre frame: photorealistic ' + e.z + ' in natural habitat, whole bird, natural posture.\n' +
      '  · Four magnifier circles, top to bottom: (1) close-up of head and bill, (2) close-up of plumage pattern, (3) close-up of folded or spread wing, (4) close-up of feet and legs. Labels beside them are already printed — keep them.\n' +
      '  · 分佈地區 panel: a flat world/regional map with the species range shaded green. Guide (do NOT print): ' + (String(c.range || '').slice(0, 120) || 'unknown, leave a plain map') + '\n' +
      '  · 成長與繁殖 panel: three small icons in the three circles: nest, eggs, chick (draw typical for this species; no text). Guide (do NOT print): ' + (String(c.breeding || '').slice(0, 100) || 'generic') + '\n' +
      '  · 可混淆物種 panel: two small bird portraits in the two circles.\n' +
      '  · 叫聲 panel: keep the waveform as printed.',
    'PRINT EXACTLY THESE STRINGS IN THE EMPTY SLOTS — nothing else:\n' +
      '  [Header chip] the prefix "NO." is ALREADY printed — keep it and add only the four digits right after it, so it reads: NO.' + id + '\n' +
      '  [Dark green name band] line 1 large: ' + e.z + '   line 2: ' + e.e + '   line 3 italic: ' + e.s + '\n' +
      '  [Top-right chip] 目: ' + (e.oz || '資料待查') + '   科: ' + (e.fz || '資料待查') + '\n' +
      '  [身長 slot] ' + f.len + '\n' +
      '  [體重 slot] ' + f.mass + '\n' +
      '  [保育級別 slot] ' + f.iucnZh + (f.code ? ' ' + f.code : '') + '\n' +
      '  [分類資訊 panel: 7 rows top to bottom] rows 1–3 (界 動物界 Animalia / 門 脊索動物門 Chordata / 綱 鳥綱 Aves) are ALREADY PRINTED — keep them untouched. Fill ONLY the four empty slots, each in its own row beside its own label:\n' +
      '      row 4 slot beside 目: ' + (e.oz || '資料待查') + ' ' + (e.o || '') + '\n' +
      '      row 5 slot beside 科: ' + (e.fz || '資料待查') + ' ' + (e.f || '') + '\n' +
      '      row 6 slot beside 屬: ' + (f.genus ? f.genus + ' 屬' : '資料待查') + '\n' +
      '      row 7 slot beside 種: ' + e.z + ' ' + (f.genus ? f.genus[0] + '. ' + f.epi : '') + '\n' +
      '  [棲息環境, 2×2 circles + tag boxes]\n      ' + slotList(f.hab, 4) + '\n' +
      '  [食物, 2×2 circles + tag boxes]\n      ' + slotList(f.diet, 4) + '\n' +
      '  [生態價值評分 radar, five vertices clockwise from top] 重要性 ' + n1(sc.i) + ' | 適應力 ' + n1(sc.a) + ' | 研究 ' + n1(sc.r) + ' | 保育 ' + n1(sc.c) + ' | 觀賞 ' + n1(sc.v) + ' (print each number in the small box beside its own axis name, and draw the radar polygon to match these values out of 5)\n' +
      '  [總評分 slot] ' + stars(sc.o) + ' ' + n1(sc.o) + ' / 5\n' +
      '  [可混淆物種 name boxes] ' + f.sim.map((x, i) => (i ? 'right box' : 'left box') + ' = ' + x).join(' | ') + ' (print only the species name, no numbering)' + '\n' +
      '  [保育狀態] small badge slot: ' + (f.code || '—') + ' | line 1: ' + f.iucnZh + ' | line 2: ' + (c.iucnEn || ''),
    'RULES\n1. Print ONLY the strings listed above. No sentences, no extra words, no dates, no version, no footer, no logo, no QR/barcode.\n2. Render every number exactly as written; never round or invent. 資料待查 means print exactly 資料待查.\n3. Traditional Chinese only. Do not print any template/placeholder word that is not in the list.\n4. Any circle marked NOT USED must be painted over with the plain panel background: no circle outline, no empty tag box, and never repeat another circle's tag. Do not add empty boxes under the 成長與繁殖 icons.\n5. Style: warm cream paper, thin olive-green borders, flat matte print, crisp type, dark-green line icons. No glow, no shadows.',
    'FINAL CHECK — compare every printed string with the list; fix any typo; make sure no pre-printed template word was altered.',
  ].join('\n\n');
}

/* CLI */
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
const args = isMain ? process.argv.slice(2).filter((a) => !a.startsWith('--')) : [];
const write = process.argv.includes('--write');
const agent = process.argv.includes('--agent');
const lite = process.argv.includes('--lite');
if (write && args.length) {
  const dir = path.join(root, 'deliver/card-prompts');
  mkdirSync(dir, { recursive: true });
  for (const id of args) {
    writeFileSync(path.join(dir, `prompt-${id}.txt`), (lite ? buildLitePrompt(id) : agent ? buildAgentPrompt(id) : buildPrompt(id)), 'utf8');
  }
  console.log('已寫入 deliver/card-prompts/ 共 ' + args.length + ' 份');
} else {
  for (const id of args) {
    if (!idx.birds[id]) { console.error('冇呢個編號：' + id); continue; }
    console.log('════════ NO.' + id + ' ' + idx.birds[id].z + ' ════════');
    console.log(lite ? buildLitePrompt(id) : agent ? buildAgentPrompt(id) : buildPrompt(id));
  }
}
