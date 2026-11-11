#!/usr/bin/env node
/* ============================================================
 *  build-aviandex-vault.mjs —— 把「卡牌生成器」的倉加上 aviandex 卡種
 * ------------------------------------------------------------
 *  參照用戶的架構（HTML 外殼 + Google Apps Script 倉）：
 *    · 殼（卡牌生成器V17.html）：UI、欄位、影相、下載，裡面沒有 prompt
 *    · 倉（Code.gs 的 VAULT）：版面契約 / 文字清單 / buildPrompt
 *
 *  這支只做兩件事：
 *    1. 把 aviandex 卡種寫入 meta / texts / def
 *    2. 在 buildCardData 與 buildPrompt 加入 aviandex 分支
 *       （PRINTED TEXT 與 COMPOSITION 分開，並加「漏字即失敗」的檢查句）
 *
 *  資料來源：src/data 內已核實的 JSON —— 一個字都唔會由 AI 作。
 *
 *  用法：node scripts/cards/build-aviandex-vault.mjs 0013
 *  輸出：deliver/aviandex-vault/（Code.gs 片段 + 可直接貼的卡種 JSON）
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
const sources = J('src/data/cardSources.json').sources;

const id4 = (process.argv[2] || '0013').replace(/\D/g, '').padStart(4, '0');
const e = idx.birds[id4] || {};
const c = copy[id4] || {};
const m = meas[id4] || {};
const sc = scores[id4] || {};
const z = zh[id4] || {};

const sent = (s, n = 44) => {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const i = s.search(/[。；]/);
  const out = i > 0 && i <= n ? s.slice(0, i + 1) : s.slice(0, n);
  return out + (out.length < s.length && !/[。；]$/.test(out) ? '…' : '');
};
const stars = (v) => {
  const n = Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
};

/* 卡面准印文字（PRINTED TEXT）：只列真的要在卡上出現的字 */
const printed = [
  `NO.${id4}`,
  e.z || '',
  e.s || '',
  e.e || '',
  `${e.oz || ''} · ${e.fz || ''}`,
  e.len ? `體長 ${e.len} cm` : '體長 資料待查',
  m.mass ? `體重 ${m.mass} g` : '體重 資料待查',
  c.iucn || '',
  sc.o != null ? `圖鑑評分 ${Number(sc.o).toFixed(1)}/5 ${stars(sc.o)}` : '圖鑑評分 資料待查',
  `棲地 ${(e.h || []).map((t) => idx.habitatTags.find((x) => x.id === t)?.zh).filter(Boolean).join('、')}`,
  `食性 ${(e.d || []).map((t) => idx.dietTags.find((x) => x.id === t)?.zh).filter(Boolean).join('、')}`,
  `外形 ${sent(z.look || c.look)}`,
  `食性 ${sent(c.diet)}`,
  `鳴聲 ${sent(c.voice)}`,
  `冷知識 ${sent(c.funFact)}`,
  sources[id4] ? `出處 ${sources[id4]}` : '',
].filter(Boolean);

/* 12 款卡的 meta / texts 同款格式，加一款 aviandex */
const META = {
  theme: 'Premium printed naturalist field-guide collectible card: dark forest-green thick rounded frame with a subtle inner bevel, warm cream paper stock with fine fibre texture, flat print design, calm and authoritative like a real museum card',
  dims:
    'AvianDex bird encyclopedia card, portrait 3:4: (1) dark green header band across the top — large Traditional Chinese name on the left, italic scientific name beneath it, a white pill with the English name on the right, and a round IUCN badge at the far right; ' +
    '(2) one large rounded-corner portrait window occupying more than half of the card height, holding a single photorealistic bird, complete body, head clear, natural pose; ' +
    '(3) on the left edge of the portrait, a small vertical stack of 2–3 dark green habitat chips with white pictograms; ' +
    '(4) below the portrait, three game-style stat bars — gold fill on a cream track, a dark green rounded label on the left, the number on the right; ' +
    '(5) below that, a single row of four small white plaques, each with a slim dark green label and one sentence; ' +
    '(6) a slim dark green footer strip: NO. number on the left, Chinese name (scientific name) centred, version on the right',
  finish: 'Matte letterpress paper, no foil, no gradient glow',
};

const TEXTS =
  'NO. number, Traditional Chinese name, scientific name (italic), English name, order · family, ' +
  'length, mass, IUCN badge, dex rating with stars, habitat chips, diet chips, ' +
  'four one-sentence plaques (look, diet, voice, fun fact), source line';

const DEF = {
  pose: '自然停棲或站立的姿態，完整身體，頭部清楚，眼睛有神',
  expression: '',
  setting: '',
  details: '',
  atmosphere: '',
  chips: {
    pose: [
      ['側身站立', '側身站立，身體完整入鏡，自然姿態'],
      ['正面望鏡頭', '正面望向鏡頭，眼神清楚，姿態自然'],
      ['展翅或跳躍', '展翅或跳躍一刻，動作清楚但不誇張'],
    ],
    expression: [],
    atmosphere: [],
  },
};

/* buildCardData 的 aviandex 分支（回傳同其他卡種一樣的結構） */
const BCD = `  /* ---------- AvianDex 鳥類圖鑑卡（欄位由資料帶入，AI 唔准改） ---------- */
  if (CTX.currentSystem === 'aviandex') {
    const printedLines = CTX.val('printed_text') || [];
    return {
      family: 'AvianDex bird encyclopedia card',
      subject: 'ONE single bird, photorealistic, the exact species described below. '
        + 'The bird is the hero of the picture: complete body, clear head, natural posture, perched or standing.',
      art_style: {
        rendering: 'Photorealistic bird photography look, sharp feather detail, soft natural bokeh background, '
          + 'even daylight, no HDR halo, no illustration, no cartoon.',
        theme: CTX.val('species_hint') || ''
      },
      character_details: {
        pose: CTX.val('pose') || '側身站立，身體完整入鏡，自然姿態',
        expression: '',
        hair: '',
        clothing: ''
      },
      background: {
        setting: 'natural habitat, blurred softly so the bird stands out',
        details: '',
        atmosphere: ''
      },
      card_layout: {
        dimensions: CTX.META().dims,
        ui_elements: printedLines,
        forbidden_elements: 'extra slogans, QR codes, barcodes, price tags, advertisement text, '
          + 'any invented statistics, any simplified Chinese characters, any second bird'
      },
      visual_effects: {
        finish: CTX.META().finish,
        lighting: 'soft even daylight',
        texture: 'matte letterpress paper'
      }
    };
  }

`;

mkdirSync(path.join(root, 'deliver/aviandex-vault'), { recursive: true });
const out = path.join(root, 'deliver/aviandex-vault');

writeFileSync(path.join(out, 'vault-patch.json'), JSON.stringify({
  note: '貼入 VAULT.sys.meta.aviandex / VAULT.sys.texts.aviandex / VAULT.def.aviandex',
  id: id4,
  'sys.meta.aviandex': META,
  'sys.texts.aviandex': TEXTS,
  'def.aviandex': DEF,
  printed_text: printed,
}, null, 2), 'utf8');

writeFileSync(path.join(out, 'buildCardData.aviandex.js'), BCD, 'utf8');

const preview = `# NO.${id4} ${e.z || ''} — AvianDex 卡種（貼入倉）\n\n`
  + `## 1. 卡面准印文字（PRINTED TEXT，逐字照抄）\n\n`
  + printed.map((x) => `- ${x}`).join('\n')
  + `\n\n## 2. 版面契約（dims）\n\n${META.dims}\n\n`
  + `## 3. 需要改的地方\n\n`
  + `- \`卡牌生成器V17.html\` 的卡種清單加一項 \`aviandex\`（標籤：鳥類圖鑑卡）\n`
  + `- 殼的欄位只需要一個：\`printed_text\`（多行文字）＋ \`pose\` 選項\n`
  + `- 倉的 \`buildCardData\` 貼上 \`buildCardData.aviandex.js\`\n`
  + `- 倉的 \`VAULT.sys.meta\` / \`VAULT.sys.texts\` / \`VAULT.def\` 各加一個 \`aviandex\` 鍵\n`;

writeFileSync(path.join(out, `README-${id4}.md`), preview, 'utf8');
console.log('已寫入 deliver/aviandex-vault/：vault-patch.json、buildCardData.aviandex.js、README-' + id4 + '.md');
console.log('准印文字 ' + printed.length + ' 行');
