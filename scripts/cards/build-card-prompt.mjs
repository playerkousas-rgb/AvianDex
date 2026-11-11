#!/usr/bin/env node
/* ============================================================
 *  build-card-prompt.mjs —— 打編號 → 出「可直接貼去 Gemini」的卡面 prompt
 * ------------------------------------------------------------
 *  為甚麼要這支？
 *    用戶在 Gemini 那邊打編號慢慢出圖，所以需要一個「每次打好資料」的來源。
 *    實測（本機跑 Gemini 出整張卡）發現：放手讓 AI 出整張卡，版面可以很靚，
 *    但佢會自己編數字（體長寫 25-28 cm、體重寫 100-140 g，同我們資料不符）。
 *    所以這裡把**所有要印在卡上的字**明文列在 prompt 內，
 *    並且明令「不准改寫、不准補數字、不准加未列出嘅字」。
 *
 *  用法：
 *    node scripts/cards/build-card-prompt.mjs 0013            # 印出 prompt
 *    node scripts/cards/build-card-prompt.mjs 0013 --md       # 存成 .md 檔
 *    node scripts/cards/build-card-prompt.mjs 0013 --html     # 存成可複製頁
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
const wantMd = process.argv.includes('--md');
const wantHtml = process.argv.includes('--html');

const e = idx.birds[id4] || {};
const c = copy[id4] || {};
const m = meas[id4] || {};
const sc = scores[id4] || {};
const z = zh[id4] || {};

const sent = (s, n = 60) => {
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

const len = e.len ? `${e.len} cm` : '';
const mass = m.mass ? `${m.mass} g` : '';
const wing = m.wing ? `${m.wing} mm` : '';
const iucn = c.iucn || '';

/* 要印在卡上的所有字（一份清單，AI 只可以照排，不可以改） */
const LINES = [
  `卡面編號：NO.${id4}`,
  `中文名：${e.z || ''}`,
  `學名（斜體）：${e.s || ''}`,
  `英文名：${e.e || ''}`,
  `目／科：${e.oz || ''} · ${e.fz || ''}`,
  len ? `體長數值：${len}` : '體長數值：（這格留空，寫「資料待查」）',
  mass ? `體重數值：${mass}` : '體重數值：（這格留空，寫「資料待查」）',
  wing ? `翼長數值：${wing}` : '',
  iucn ? `保育級別：${iucn}` : '',
  sc.o ? `圖鑑評分：${Number(sc.o).toFixed(1)} / 5（${stars(sc.o)}）` : '圖鑑評分：（留空）',
  `棲地標籤：${(e.h || []).map((t) => idx.habitatTags.find((x) => x.id === t)?.zh).filter(Boolean).join('、')}`,
  `食性標籤：${(e.d || []).map((t) => idx.dietTags.find((x) => x.id === t)?.zh).filter(Boolean).join('、')}`,
  `外形一句（原文照登）：${sent(z.look, 42) || sent(c.look, 42)}`,
  `食性一句：${sent(c.diet, 42)}`,
  `鳴聲一句：${sent(c.voice, 42) || '（留空）'}`,
  `冷知識一句：${sent(c.funFact, 46) || '（留空）'}`,
  `出處細字：${sources[id4] || ''}`,
].filter(Boolean);

const prompt = `畫一張 AvianDex 鳥類圖鑑卡，3:4 直向，印刷品質的收藏卡。

【版面規格（固定，所有卡一致）】
1. 厚深綠外框（圓角、內側有金屬倒邊），卡紙米白，有極細紙紋。
2. 頂部深綠橫帶：左邊大字中文名，下面斜體學名；右邊一個白色膠囊放英文名；右端一個圓徽章放 IUCN 級別。
3. 中央一個大圓角相框（佔卡面一半以上），放單一隻鳥的寫實相片，鳥要完整、頭部清楚、自然姿態。
4. 相框左邊：一排 2–3 個深綠小方塊圖示（棲地、食性）。
5. 相框下面：三條遊戲式數值條（金黃色填在米白軌道上），每條左邊一個深綠圓角標籤寫欄目名，右邊寫數字。
6. 再下面：四塊小白牌，每塊一個細深綠標籤 + 一句原文。
7. 底部深綠細條：左 NO. 編號、中間中文名（學名）、右邊版本號。

【卡上的字：只准用以下內容，逐字照抄，不准改寫、不准翻譯、不准自行補充任何數字或事實】
${LINES.map((l) => `· ${l}`).join('\n')}

【絕對禁止】
· 不准自己發明體長／體重／評分／星數（上面沒有的就不准寫）
· 不准加任何未列出的欄目、標語、廣告字、二維碼
· 不准出現簡體字
· 不准把中文名或學名寫錯

【風格】
印刷收藏卡、乾淨、留白足夠、圓角、實色（不要漸層光暈、不要立體陰影、不要霓虹）。
深綠主色 #11402A，米白 #F7F3E9，金黃 #CE9820。

【構圖提示】
鳥：${e.e || ''}（${e.s || ''}），${sent(z.look, 30)}`;

if (wantMd) {
  const dir = path.join(root, 'deliver', 'card-prompts');
  mkdirSync(dir, { recursive: true });
  const f = path.join(dir, `${id4}.md`);
  writeFileSync(f, `# NO.${id4} ${e.z || ''} — 卡面 prompt\n\n\`\`\`\n${prompt}\n\`\`\`\n`, 'utf8');
  console.log('已寫入', path.relative(root, f));
} else if (wantHtml) {
  const dir = path.join(root, 'deliver', 'card-prompts');
  mkdirSync(dir, { recursive: true });
  const f = path.join(dir, `${id4}.html`);
  writeFileSync(f, `<!doctype html><meta charset="utf-8"><title>NO.${id4} prompt</title>
<body style="margin:0;background:#14180f;color:#eef2ea;font:14px/1.7 system-ui;padding:20px">
<h1 style="font-size:16px">NO.${id4} ${e.z || ''} · 卡面 prompt</h1>
<p style="color:#9aa892;font-size:12px">全選下面文字 → 貼去 Gemini（或 Gemini Canvas 的生圖欄）</p>
<textarea style="width:100%;height:70vh;background:#0d1109;color:#dfe7d8;border:1px solid #2b3326;border-radius:10px;padding:14px;font:13px/1.6 ui-monospace,monospace">${prompt.replace(/</g, '&lt;')}</textarea>
</body>`, 'utf8');
  console.log('已寫入', path.relative(root, f));
} else {
  console.log(prompt);
}
