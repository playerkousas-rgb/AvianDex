/* ============================================================
 *  AvianDex — 圖卡提示詞產生器（資料準確優先）
 * ------------------------------------------------------------
 *  核心原則：
 *    1) 分類（目／科／屬／學名／IUCN）只准用「已查證」的資料
 *    2) 查唔到 → 提示詞會被要求寫「資料待查」，不准 AI 自己填
 *    3) 每張卡的提示詞都可以追溯來源（維基 pageid）
 *
 *  三種風格：
 *    encyclopedia = 兩步法（AI 出插畫 → 排版引擎寫字，文字 100% 準）
 *    onepass      = 一次過（AI 直接出整張卡，prompt 內含全部要印的字）
 *    illustration = Birddex2（Ken Sugimori 精靈插畫，無字）
 *
 *  用法：
 *    node scripts/cards/prompt-builder.mjs 0289
 *    node scripts/cards/prompt-builder.mjs 0289 --style illustration
 *    node scripts/cards/prompt-builder.mjs 0289 --no-facts     # 未查證時（不建議）
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { factsBlock } from './parse-taxobox.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

let cachedBirds = null;
let cachedFacts = null;
let cachedTaxonomy = null;
let cachedCopy = null;

export function loadBirds() {
  if (!cachedBirds) {
    cachedBirds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birds.json'), 'utf8'));
  }
  return cachedBirds;
}

export function loadFacts() {
  if (cachedFacts === null) {
    const file = path.join(ROOT, 'src/data/birdFacts.json');
    try {
      cachedFacts = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      cachedFacts = {};
    }
  }
  return cachedFacts;
}

/**
 * eBird/Clements 權威分類（由 scripts/cards/enrich-birds.mjs 產生）。
 * 有這份，即使未跑維基查證，提示詞仍然有可信的英文名／學名／目／科可用。
 */
export function loadTaxonomy() {
  if (cachedTaxonomy === null) {
    try {
      cachedTaxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birdTaxonomy.json'), 'utf8'));
    } catch {
      cachedTaxonomy = {};
    }
  }
  return cachedTaxonomy;
}

/** 卡面文案（diet/range/look/habitat…），一次過出圖時要整段寫入 prompt */
export function loadCardCopy() {
  if (cachedCopy === null) {
    try {
      cachedCopy = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/cardCopy.json'), 'utf8'));
    } catch {
      cachedCopy = {};
    }
  }
  return cachedCopy;
}

export function getCardCopy(id) {
  return loadCardCopy()[String(id).padStart(4, '0')] || null;
}

export function getTaxonomy(id) {
  return loadTaxonomy()[String(id).padStart(4, '0')] || null;
}

/** 只有「對得上 eBird」才算 authority-verified：英文名／學名／目／科 */
export function hasEbirdAuthority(id) {
  const tax = getTaxonomy(id);
  return Boolean(tax?.sciName && tax?.order && tax?.family);
}

export function findBird(id) {
  const padded = String(id).replace(/\D/g, '').padStart(4, '0');
  const bird = loadBirds().find((b) => b.id === padded);
  if (!bird) throw new Error(`找不到編號 ${padded}`);
  return bird;
}

export function getFacts(id) {
  return loadFacts()[String(id).padStart(4, '0')] || null;
}

/**
 * 查證狀態：
 *   verified = eBird 對得上，而且維基中文目／科／學名都齊
 *   partial  = 有部分資料（例如只有 eBird 的英文分類，未有中文目／科）
 *   missing  = 完全冇
 */
export function factStatus(id) {
  const f = getFacts(id);
  const tax = getTaxonomy(id);
  const ebirdOk = Boolean(tax?.sciName && tax?.order && tax?.family);
  const wikiOk = Boolean(f?.rank?.['目'] && f?.rank?.['科'] && f?.scientificName);
  if (ebirdOk && wikiOk) return 'verified';
  if (ebirdOk || f) return 'partial';
  return 'missing';
}

/** 這張卡的分類資料來自哪裡（用於提示詞與報告，方便追溯） */
export function factProvenance(id) {
  const f = getFacts(id);
  const tax = getTaxonomy(id);
  return {
    ebird: tax ? { speciesCode: tax.speciesCode, source: 'eBird/Clements' } : null,
    wiki: f?.source?.url ? { url: f.source.url, pageid: f.source.pageid } : null,
  };
}

const HK_SECTIONS = [
  'Basic Overview',
  'Classification（必須用「已查證資料」那幾行，逐字照抄，不准改）',
  'Appearance',
  'Ecological Habits',
  'Food',
  'Distribution Areas (Hong Kong focus)',
  'Key Knowledge Points',
  'Interesting Trivia',
  'Observation Tips',
  'Ecological Value Rating Card',
];

/**
 * 百科卡（AvianDex／GPT 風）
 * @param {{id:string,name:string,en?:string}} bird
 * @param {{facts?:object, width?:number,height?:number}} [opts]
 */
export function encyclopediaPrompt(bird, opts = {}) {
  const tax = opts.taxonomy === undefined ? getTaxonomy(bird.id) : opts.taxonomy;
  const en = tax?.comName || bird.en || '';
  const verified = tax || opts.facts ? factsBlock(opts.facts, bird, tax) : '';

  return `Generate a high-quality vertical encyclopedia-style infographic for ${bird.name}${en ? ` (${en})` : ''} — AvianDex NO.${bird.id}.

[資料準則 — 最高優先]
1. 分類欄位（目／科／屬／學名／IUCN）只准使用下面【已查證資料】所載數值，逐字照抄，不得改寫、翻譯、或替換成相近物種。
2. 嚴禁沿用任何過往生成過的圖鑑資料作填充；每個欄位必須對應本物種。
3. 若某欄位在【已查證資料】內不存在，卡上必須寫「資料待查」，絕對不准自行推測或編造。
4. 其餘生物學描述（外形、習性、食性）只准寫與本物種相關且不會誤導的內容；不確定就省略該句，不要湊字數。
5. 不要把其他鳥種的特徵、分佈或叫聲寫進本卡。

${verified || '【已查證資料】\n（本物種尚未查證 — 分類相關欄位一律寫「資料待查」，其餘只可作一般性描述）'}

[版面要求]
This should not be a normal poster or a simple illustration. It should feel like a Pokédex that combines the clarity of a field guide, the structure of an encyclopedia page, Pokédex Arrangement, Celluloid Style, and the shareability of a strong social-media explainer.

The image should include:
- A Pokemon code: NO.${bird.id}（必須與上面一致）
- A pixel art of this species in the style of Pokémon
- A clear and appealing main visual of this species
- Several enlarged detail callouts (beak, wings, tail, feet — 只用本物種真實特徵)
- Multiple rounded modular information sections
- Strong title hierarchy and highlighted key labels
- Concise but information-rich educational content
- Visual scoring, quick takeaways, or a Top 5 module

Content sections (adapt to the species, do not pad):
${HK_SECTIONS.join(' / ')}.

[視覺規格]
Pokédex layout; information density high but not crowded; publishable, collectible, repeatable knowledge-card format — not an advertisement.
Text MUST be Traditional Chinese (Hong Kong). 不准出現簡體字。不准出現亂碼方塊字。
Colour palette: deep teal #0E3B2E, cream #FFF8D6, Pokédex red #E3350D, accent yellow #FACC15.
Vertical 3:4 portrait, edge-to-edge, no outer card frame, no watermark, no fake QR code, no fake logo.${opts.width ? ` Target ${opts.width}×${opts.height} px.` : ''}`;
}

/**
 * 一次過（one-pass）提示詞：把「要印的每一個字」都寫進 prompt，讓 AI 一次出整張卡。
 *
 * 適合：字少的卡（鳥卡：編號 + 中文名 + 英文名 + 學名）。
 * 不適合：字多的資訊圖卡 —— 實測 AI 會漏字、錯字、把分類寫成相近物種。
 */
export function onepassPrompt(bird, opts = {}) {
  const tax = opts.taxonomy === undefined ? getTaxonomy(bird.id) : opts.taxonomy;
  const facts = opts.facts === undefined ? getFacts(bird.id) : opts.facts;
  const rank = facts?.rank || {};
  const zh = bird.name;
  const en = tax?.comName || bird.en || '';
  const sci = tax?.sciName || facts?.scientificName || '';
  const orderZh = rank['目'] || '';
  const familyZh = rank['科'] || '';
  const code = tax?.speciesCode || '';
  const iucn = (facts?.iucn || '').replace(/（.*?）/g, '').trim();

  const lines = [
    `NO.${bird.id}`,
    `中文名：${zh}`,
    en ? `英文名：${en}` : '',
    sci ? `學名：${sci}` : '',
    orderZh || tax?.order ? `目：${orderZh || '資料待查'}${tax?.order ? `（${tax.order}）` : ''}` : '',
    familyZh || tax?.family ? `科：${familyZh || '資料待查'}${tax?.family ? `（${tax.family}）` : ''}` : '',
    code ? `species code：${code}` : '',
    iucn ? `IUCN：${iucn}` : '',
  ].filter(Boolean);

  const layoutCount = opts.layout === 'bird' ? 'bird' : 'info';
  const copy = opts.layout === 'bird' ? null : opts.copy === undefined ? getCardCopy(bird.id) : opts.copy;

  // 資訊圖卡的文案：只寫入已填寫（有 source）的欄位，其餘不出現
  const panels = [];
  if (copy) {
    const push = (label, value) => {
      const v = (value || '').trim();
      if (v) panels.push(`${label}：${v}`);
    };
    push('食性 · DIET', copy.diet);
    push('分佈 · RANGE', copy.range);
    push('外形特徵 · FIELD MARKS', copy.look);
    push('棲地 · HABITAT', copy.habitat);
    push('冷知識 · TRIVIA', copy.funFact);
    if (copy.orderZh) push('目（中文）', copy.orderZh);
    if (copy.familyZh) push('科（中文）', copy.familyZh);
    if (copy.iucn) push('IUCN 中文寫法', copy.iucn);
  }

  const layout =
    layoutCount === 'bird'
      ? `LAYOUT (simple bird card): pale cream card with a thin gold border; "NO.${bird.id}" small in the top-left corner; the bird illustration filling most of the card; at the bottom, the Chinese name in large black type, the scientific name in small italic grey under it, and the English name in small gold bold type at the very bottom. Nothing else. No data panels, no charts, no numbers.`
      : `LAYOUT (encyclopedia infographic): top red header bar with the word "AvianDex" and a black rounded pill reading "NO." above "${bird.id}"; a large title block underneath; a big illustration panel on pale cream; a 2x2 grid of rounded dark panels below it; a bottom status strip. Rounded modular panels, strong title hierarchy, publishable collectible finish.`;

  return `Generate ONE high-quality vertical card (3:4 portrait, edge-to-edge, no outer border wrapper, no watermark, no logo) for ${zh}${en ? ` (${en})` : ''} — AvianDex NO.${bird.id}.

[文字準則 — 最高優先]
1. 卡上所有中文一律用「香港繁體」，不可出現簡體字、不可出現方塊亂碼。
2. 下面的字逐字照抄，不可以改寫、翻譯、簡化、或替換成相近物種。
3. 只用下面列出的資料；沒有列出的欄位就不要出現在卡上，絕對不可自行補充數字或分類。

[必須出現的完整文字]
${lines.join('\n')}${panels.length ? `\n\n[必須出現的文案（逐字照抄）]\n${panels.join('\n')}` : ''}

${layout}

[插畫要求]
semi-realistic scientific field-guide plate of this exact species, side profile, whole bird visible, correct plumage colours and bill shape for this species, plain pale cream background inside the illustration panel, soft even museum lighting, crisp feather detail.

[色票]
deep teal #0E3B2E body, cream #FFF8D6 text, Pokédex red #E3350D header, accent yellow #FACC15 highlights, fine gold hairline borders.

[禁止]
不可出現額外數據（體長、體重、評分、排名、假的圖表數字）、不可出現 QR code 或品牌 logo、不可出現其他鳥種、不可出現英文以外的其他語言。`;
}

/** 插畫卡（Birddex2／BANANA）——無字，所以沒有資料準確問題，但仍用正確物種英文名 */
export function illustrationPrompt(bird) {
  const en = bird.en || bird.name;
  return `Pokemon concept art by Ken Sugimori, official character illustration, ${en}, (anatomically correct realistic bird species:1.5), beautiful natural habitat background, edge-to-edge full illustration, highly detailed, vibrant colors, masterpiece, 8k, sunny day, soft natural lighting --ar 3:4`;
}

export const ILLUSTRATION_NEGATIVE =
  'card frame, card border, text, hp, numbers, letters, logos, pokemon logo, trading card UI, ' +
  'white border, black border, watermarks, signature, human, hands';

export function buildPrompt(id, style = 'encyclopedia', opts = {}) {
  const bird = findBird(id);
  if (style === 'onepass') {
    return onepassPrompt(bird, {
      facts: opts.noFacts ? null : getFacts(bird.id),
      taxonomy: getTaxonomy(bird.id),
      layout: opts.layout,
      copy: opts.noFacts ? null : getCardCopy(bird.id),
    });
  }
  if (style === 'illustration') return illustrationPrompt(bird);
  return encyclopediaPrompt(bird, {
    facts: opts.noFacts ? null : getFacts(bird.id),
    taxonomy: getTaxonomy(bird.id),
  });
}

// ── CLI ──
const invokedDirectly = process.argv[1]?.endsWith('prompt-builder.mjs');
if (invokedDirectly) {
  const id = process.argv[2];
  const layoutArg = process.argv.indexOf('--layout');
  const layout = layoutArg > -1 ? process.argv[layoutArg + 1] : undefined;
  const styleArg = process.argv.indexOf('--style');
  const style = styleArg > -1 ? process.argv[styleArg + 1] : 'encyclopedia';
  const fileArg = process.argv.indexOf('--file');
  const noFacts = process.argv.includes('--no-facts');

  if (!id) {
    console.error(
      '用法：node scripts/cards/prompt-builder.mjs 0289 [--style encyclopedia|onepass|illustration] [--layout bird|info] [--file out.txt] [--no-facts]',
    );
    process.exit(1);
  }
  const bird = findBird(id);
  const status = factStatus(bird.id);
  if (style !== 'illustration') {
    const icon = status === 'verified' ? '✅' : status === 'partial' ? '⚠️' : '❌';
    console.error(`${icon} 資料狀態：${status}（${bird.id} ${bird.name}）`);
    if (status !== 'verified') {
      console.error('   建議先跑：npm run facts:fetch -- --ids ' + bird.id);
    }
  }
  const text = buildPrompt(id, style, { noFacts, layout });
  if (fileArg > -1) {
    const target = path.resolve(process.cwd(), process.argv[fileArg + 1]);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${text}\n`);
    console.log(`✅ 已寫入 ${path.relative(process.cwd(), target)}`);
  } else {
    process.stdout.write(`${text}\n`);
  }
}
