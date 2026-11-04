/* ============================================================
 *  AvianDex — 圖卡提示詞產生器
 * ------------------------------------------------------------
 *  兩套風格（同維護需知 txt 一致）：
 *    encyclopedia = AvianDex（Pokédex 百科卡，資訊量高）
 *    illustration = Birddex2（Ken Sugimori 精靈插畫，無字）
 *
 *  用法（CLI）：
 *    node scripts/cards/prompt-builder.mjs 0289
 *    node scripts/cards/prompt-builder.mjs 0289 --style illustration
 *    node scripts/cards/prompt-builder.mjs 0289 --file cards/prompts/0289.txt
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

let cachedBirds = null;
export function loadBirds() {
  if (!cachedBirds) {
    cachedBirds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birds.json'), 'utf8'));
  }
  return cachedBirds;
}

export function findBird(id) {
  const padded = String(id).replace(/\D/g, '').padStart(4, '0');
  const bird = loadBirds().find((b) => b.id === padded);
  if (!bird) throw new Error(`找不到編號 ${padded}`);
  return bird;
}

const HK_SECTIONS = [
  'Basic Overview',
  'Classification',
  'Appearance',
  'Ecological Habits',
  'Food',
  'Distribution Areas (with Hong Kong focus)',
  'Growth and Reproduction',
  'Key Knowledge Points',
  'Interesting Trivia',
  'Observation Tips',
  'Ecological Value Rating Card',
];

/** 百科卡（AvianDex／GPT）——忠實保留維護需知的句式，只換名字與編號 */
export function encyclopediaPrompt(bird, opts = {}) {
  const en = bird.en || '';
  return `Generate a high-quality vertical encyclopedia-style infographic for ${bird.name}${en ? ` (${en})` : ''}.

This should not be a normal poster or a simple illustration. It should feel like a Pokédex that combines the clarity of a field guide, the structure of an encyclopedia page, Pokédex Arrangement, Celluloid Style, and the shareability of a strong social-media explainer.

The image should include:
- A Pokemon code: NO.${bird.id}
- A pixel art of the topic in the style of Pokémon
- A clear and appealing main visual of the topic
- Several enlarged detail callouts
- Multiple rounded modular information sections
- Strong title hierarchy and highlighted key labels
- Concise but information-rich educational content
- Visual scoring, quick takeaways, or a Top 5 module

Adapt the content sections automatically based on the topic. Useful categories include:
${HK_SECTIONS.join(' / ')}.

Visual requirements:
The overall design should resemble a Pokédex layout. The information density should be high but not crowded, and the final image should feel publishable, collectible, and repeatable as a knowledge-card format rather than an advertisement.

Do not make it look like a commercial promo poster. Emphasize knowledge organization, modular information, and a Pokédex presentation.

Text should be Traditional Chinese (Hong Kong) with the English name and scientific name shown. Vertical 3:4 portrait, edge-to-edge, no outer card frame, no watermark.${opts.width ? ` Target ${opts.width}×${opts.height} px.` : ''}`;
}

/** 插畫卡（Birddex2／BANANA） */
export function illustrationPrompt(bird) {
  return `Pokemon concept art by Ken Sugimori, official character illustration, ${bird.en || bird.name}, (anatomically correct realistic bird species:1.5), beautiful natural habitat background, edge-to-edge full illustration, highly detailed, vibrant colors, masterpiece, 8k, sunny day, soft natural lighting --ar 3:4`;
}

export const ILLUSTRATION_NEGATIVE =
  'card frame, card border, text, hp, numbers, letters, logos, pokemon logo, trading card UI, ' +
  'white border, black border, watermarks, signature, human, hands';

export function buildPrompt(id, style = 'encyclopedia') {
  const bird = findBird(id);
  return style === 'illustration' ? illustrationPrompt(bird) : encyclopediaPrompt(bird);
}

// ── CLI ──
const invokedDirectly = process.argv[1]?.endsWith('prompt-builder.mjs');
if (invokedDirectly) {
  const id = process.argv[2];
  const styleArg = process.argv.indexOf('--style');
  const style = styleArg > -1 ? process.argv[styleArg + 1] : 'encyclopedia';
  const fileArg = process.argv.indexOf('--file');
  if (!id) {
    console.error('用法：node scripts/cards/prompt-builder.mjs 0289 [--style illustration] [--file out.txt]');
    process.exit(1);
  }
  const text = buildPrompt(id, style);
  if (fileArg > -1) {
    const target = path.resolve(process.cwd(), process.argv[fileArg + 1]);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${text}\n`);
    console.log(`✅ 已寫入 ${path.relative(process.cwd(), target)}`);
  } else {
    process.stdout.write(`${text}\n`);
  }
}
