#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 圖卡製作工作單（worklist）產生器
 * ============================================================
 *  目的：把「22–569 仲未做」變成一份可以照住做、可以分派、可以追進度的工作單。
 *
 *  輸出（reports/）：
 *    cards-todo.csv      Excel / Google Sheet 可直接開（每行一張卡＋兩套現成提示詞）
 *    cards-todo.json     給自動化／腳本用
 *    cards-todo.md       分批計劃（每批 20 張，附進度勾選格）
 *
 *  用法：
 *    node scripts/make-card-worklist.mjs                # 22–569 全部
 *    node scripts/make-card-worklist.mjs --from 22 --to 120
 *    node scripts/make-card-worklist.mjs --batch 20 --only 3   # 只出第 3 批
 *    node scripts/make-card-worklist.mjs --exclude-existing    # 讀 reports/card-audit.json 剔走已有圖
 *    node scripts/make-card-worklist.mjs --style birddex2      # 只出 Birddex2 插畫提示詞
 *    node scripts/make-card-worklist.mjs --priority            # 只出「香港常見 100 種」優先批次
 *
 *  提示詞來源：維護需知 txt（AvianDex 用 GPT 百科卡、Birddex2 用 BANANA 插畫卡）
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ARGS = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = ARGS.indexOf(name);
  return i >= 0 ? ARGS[i + 1] : fallback;
};
const has = (name) => ARGS.includes(name);

const FROM = Number(arg('--from', 22));
const TO = Number(arg('--to', 569));
const BATCH = Number(arg('--batch', 20));
const ONLY = arg('--only') ? Number(arg('--only')) : null;
const STYLE = arg('--style', 'both');
const EXCLUDE_EXISTING = has('--exclude-existing');
const PRIORITY_ONLY = has('--priority');

const birds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birds.json'), 'utf8'));

let existing = new Set();
const auditPath = path.join(ROOT, 'reports/card-audit.json');
if (EXCLUDE_EXISTING && fs.existsSync(auditPath)) {
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  existing = new Set((audit.found || []).map((r) => r.id));
  console.log(`📋 由 ${path.relative(ROOT, auditPath)} 讀到 ${existing.size} 張已有圖，會自動剔走`);
} else if (EXCLUDE_EXISTING) {
  console.log('⚠️  找不到 reports/card-audit.json，請先跑 npm run cards:probe（今次不會剔走任何卡）');
}

/** AvianDex（GPT）百科卡提示詞 —— 忠實保留維護需知的寫法，只把名字／編號換成該鳥 */
function aviandexPrompt(bird) {
  return [
    `Generate a high-quality vertical encyclopedia-style infographic for ${bird.name}（${bird.en}）.`,
    'This should not be a normal poster or a simple illustration. It should feel like a Pokédex that combines the clarity of a field guide, the structure of an encyclopedia page, Pokédex Arrangement, Celluloid Style, and the shareability of a strong social-media explainer.',
    `The image should include: A Pokemon code: NO.${bird.id}; a pixel art of the topic in the style of Pokémon; a clear and appealing main visual of the topic; several enlarged detail callouts; multiple rounded modular information sections; strong title hierarchy and highlighted key labels; concise but information-rich educational content; visual scoring, quick takeaways, or a Top 5 module.`,
    'Adapt the content sections automatically based on the topic. Useful categories include: Basic Overview, Classification, Appearance, Ecological Habits, Food, Distribution Areas (Hong Kong focus), Growth and Reproduction, Key Knowledge Points, Interesting Trivia, Precautions, Observation Tips, and Ecological Value Rating Card.',
    'Visual requirements: Pokédex layout, information density high but not crowded, publishable / collectible / repeatable knowledge-card format rather than an advertisement. Do not make it look like a commercial promo poster. Emphasize knowledge organization, modular information, and a Pokédex presentation.',
    'Text in Traditional Chinese (Hong Kong), bird names in Chinese + English scientific name. Vertical 3:4.',
  ].join(' ');
}

/** Birddex2（BANANA）精靈插畫提示詞 + 反向提示詞 */
function birddex2Prompt(bird) {
  return (
    `Pokemon concept art by Ken Sugimori, official character illustration, ${bird.en}, ` +
    '(anatomically correct realistic bird species:1.5), beautiful natural habitat background, ' +
    'edge-to-edge full illustration, highly detailed, vibrant colors, masterpiece, 8k, sunny day, ' +
    'soft natural lighting --ar 3:4'
  );
}

const NEGATIVE_PROMPT =
  'card frame, card border, text, hp, numbers, letters, logos, pokemon logo, trading card UI, ' +
  'white border, black border, watermarks, signature, human, hands';

// 香港最常撞到的鳥種（公園／屋邨／水塘／后海灣），未做過的先做這批 = 使用者最快感受到變化
// 排第一的是「街坊雀」；再來是水鳥、林鳥。可按你的實際觀察隨時改這個清單。
const PRIORITY_NAMES = [
  '麻雀', '珠頸斑鳩', '紅耳鵯', '白頭鵯', '鵲鴝', '黑鳶', '原鴿', '八哥', '黑領椋鳥', '大山雀',
  '暗綠繡眼鳥', '噪鵑', '小白鷺', '池鷺', '蒼鷺', '夜鷺', '大白鷺', '牛背鷺', '白胸苦惡鳥', '黑水雞',
  '普通翠鳥', '白胸翡翠', '斑文鳥', '白腰文鳥', '喜鵲', '紅嘴藍鵲', '黑臉噪眉', '畫眉', '叉尾太陽鳥', '長尾縫葉鶯',
  '黃眉柳鶯', '北紅尾鴝', '樹鷚', '灰鶺鴒', '白鶺鴒', '棕背伯勞', '黑卷尾', '家燕', '小白腰雨燕', '普通鵟',
  '鳳頭鷹', '遊隼', '紅隼', '褐翅鴉鵑', '黑臉琵鷺', '反嘴鷸', '黑翅長腳鷸', '環頸鴴', '磯鷸', '青腳鷸',
  '紅腳鷸', '綠翅鴨', '綠頭鴨', '琵嘴鴨', '赤頸鴨', '鳳頭潛鴨', '紅頭潛鴨', '小鸊鷉', '普通鸕鶿', '紅嘴鷗',
  '家八哥', '絲光椋鳥', '灰背椋鳥', '白腰鵲鴝', '黃腹鷦鶯', '純色鷦鶯', '棕扇尾鶯', '遠東樹鶯', '日本樹鶯', '白腹鶇',
  '白眉鶇', '藍磯鶇', '銅藍鶲', '北灰鶲', '紫綬帶', '戴勝', '黑枕黃鸝', '絨額鳾', '栗背短腳鵯', '綠翅短腳鵯',
  '白腰雨燕', '金腰燕', '灰頭鵐', '黃胸鵐', '栗鵐',
];
const PRIORITY_RANK = new Map(PRIORITY_NAMES.map((n, i) => [n, i]));

// ── 篩選 ──
let targets = birds.filter((b) => {
  const n = Number(b.id);
  return n >= FROM && n <= TO && !existing.has(b.id);
});

if (PRIORITY_ONLY) {
  targets = targets
    .filter((b) => PRIORITY_RANK.has(b.name))
    .sort((a, b) => PRIORITY_RANK.get(a.name) - PRIORITY_RANK.get(b.name));
}

if (ONLY) {
  const start = (ONLY - 1) * BATCH;
  targets = targets.slice(start, start + BATCH);
}

if (targets.length === 0) {
  console.log('✅ 這個範圍已經沒有要做／未做的卡。');
  process.exit(0);
}

const outDir = path.join(ROOT, 'reports');
fs.mkdirSync(outDir, { recursive: true });

// ── CSV ──
const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;
const header = [
  '編號',
  '中文名',
  '英文名',
  '上傳檔名',
  'R2 路徑',
  'AvianDex 提示詞(GPT)',
  'Birddex2 提示詞(BANANA)',
  '反向提示詞',
  '狀態',
];
const rows = targets.map((b) => {
  const file = `${b.id}.avif`;
  return [
    b.id,
    b.name,
    b.en || '',
    file,
    `aviandex/${file}`,
    STYLE === 'birddex2' ? '' : aviandexPrompt(b),
    STYLE === 'aviandex' ? '' : birddex2Prompt(b),
    STYLE === 'birddex2' ? NEGATIVE_PROMPT : '',
    '☐ 未開始',
  ];
});
const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
fs.writeFileSync(path.join(outDir, 'cards-todo.csv'), `\uFEFF${csv}`, 'utf8');

// ── JSON（自動化用）──
fs.writeFileSync(
  path.join(outDir, 'cards-todo.json'),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      range: [FROM, TO],
      count: targets.length,
      cards: targets.map((b) => ({
        id: b.id,
        name: b.name,
        en: b.en || '',
        file: `${b.id}.avif`,
        r2Path: `aviandex/${b.id}.avif`,
        prompts: {
          aviandex: aviandexPrompt(b),
          birddex2: birddex2Prompt(b),
          negative: NEGATIVE_PROMPT,
        },
      })),
    },
    null,
    2,
  )}\n`,
  'utf8',
);

// ── Markdown 分批計劃 ──
const batches = [];
for (let i = 0; i < targets.length; i += BATCH) batches.push(targets.slice(i, i + BATCH));

const md = [];
md.push('# 圖卡製作工作單（22–569）');
md.push('');
md.push(`- 產生時間：${new Date().toISOString()}`);
md.push(
  PRIORITY_ONLY
    ? `- 範圍：香港常見優先（編號不連續）${EXCLUDE_EXISTING ? '，已剔走 R2 上已有的卡' : ''}`
    : `- 範圍：${FROM}–${TO}${EXCLUDE_EXISTING ? '（已剔走 R2 上已有的卡）' : ''}`,
);
md.push(`- 待做：**${targets.length} 張**，每批 ${BATCH} 張 → **${batches.length} 批**${PRIORITY_ONLY ? '（香港常見優先批次）' : ''}`);
md.push(`- 檔名規則：4 位數字 + \`.avif\`，例如 \`${targets[0].id}.avif\`；上傳到 R2 的 \`aviandex/\` 資料夾`);
md.push('');
md.push('> 提示詞全文在 `reports/cards-todo.csv`（Excel 可開）同 `reports/cards-todo.json`。');
md.push('> 每做完一批：`npm run cards:probe` 確認 R2 讀得到 → 開網站按「重新掃描」驗收。');
md.push('');
targets.forEach(() => {});
batches.forEach((batch, idx) => {
  md.push(
    PRIORITY_ONLY
      ? `## 第 ${idx + 1} 批（${batch.length} 張，按常見度）`
      : `## 第 ${idx + 1} 批（${batch[0].id}–${batch[batch.length - 1].id}）`,
  );
  md.push('');
  md.push('| 狀態 | 編號 | 中文名 | 英文名 | 檔名 |');
  md.push('|:--:|---|---|---|---|');
  batch.forEach((b) => {
    md.push(`| ☐ | ${b.id} | ${b.name} | ${b.en || ''} | \`${b.id}.avif\` |`);
  });
  md.push('');
});
fs.writeFileSync(path.join(outDir, 'cards-todo.md'), `${md.join('\n')}\n`, 'utf8');

console.log(`📝 待做 ${targets.length} 張（${targets[0].id}–${targets[targets.length - 1].id}），分 ${batches.length} 批`);
console.log(`   reports/cards-todo.csv   ← 提示詞工作單（Excel／Google Sheet）`);
console.log(`   reports/cards-todo.json  ← 自動化用`);
console.log(`   reports/cards-todo.md    ← 分批進度表`);
