/* ============================================================
 *  AvianDex — 圖卡提示詞產生器（資料準確優先）
 * ------------------------------------------------------------
 *  核心原則：
 *    1) 分類（目／科／屬／學名／IUCN）只准用「已查證」的資料
 *    2) 查唔到 → 提示詞會被要求寫「資料待查」，不准 AI 自己填
 *    3) 每張卡的提示詞都可以追溯來源（維基 pageid）
 *
 *  兩種風格：
 *    encyclopedia = AvianDex（Pokédex 百科卡，有字有數據）
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

export function findBird(id) {
  const padded = String(id).replace(/\D/g, '').padStart(4, '0');
  const bird = loadBirds().find((b) => b.id === padded);
  if (!bird) throw new Error(`找不到編號 ${padded}`);
  return bird;
}

export function getFacts(id) {
  return loadFacts()[String(id).padStart(4, '0')] || null;
}

/** 查證狀態：verified / partial / missing */
export function factStatus(id) {
  const f = getFacts(id);
  if (!f) return 'missing';
  if (f.rank?.['目'] && f.rank?.['科'] && f.scientificName) return 'verified';
  return 'partial';
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
  const en = bird.en || '';
  const verified = opts.facts ? factsBlock(opts.facts, bird) : '';

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
  if (style === 'illustration') return illustrationPrompt(bird);
  return encyclopediaPrompt(bird, { facts: opts.noFacts ? null : getFacts(bird.id) });
}

// ── CLI ──
const invokedDirectly = process.argv[1]?.endsWith('prompt-builder.mjs');
if (invokedDirectly) {
  const id = process.argv[2];
  const styleArg = process.argv.indexOf('--style');
  const style = styleArg > -1 ? process.argv[styleArg + 1] : 'encyclopedia';
  const fileArg = process.argv.indexOf('--file');
  const noFacts = process.argv.includes('--no-facts');

  if (!id) {
    console.error('用法：node scripts/cards/prompt-builder.mjs 0289 [--style illustration] [--file out.txt] [--no-facts]');
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
  const text = buildPrompt(id, style, { noFacts });
  if (fileArg > -1) {
    const target = path.resolve(process.cwd(), process.argv[fileArg + 1]);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${text}\n`);
    console.log(`✅ 已寫入 ${path.relative(process.cwd(), target)}`);
  } else {
    process.stdout.write(`${text}\n`);
  }
}
