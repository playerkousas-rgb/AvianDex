#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 由中文／英文維基原文抽卡面資料（中英同步）
 * ------------------------------------------------------------
 *  跟 extract-copy.mjs（v2）的分別：
 *    1) 一次抓「中文 + 英文」兩份 wikitext，輸出同一張卡的 zh 與 en
 *    2) 欄位由 6 個擴到 15 個（分佈／棲息／食物／外形／繁殖／冷知識／鳴聲／
 *       行為／遷徙／保育／人與鳥／名稱由來／小貼士／注意事項／Top5）
 *    3) 選欄交給 field-schema.mjs：有 15 項就揀 7 項印，只有 7 項就 7 項全印
 *    4) 來源一定用「學名核對 + pageid」，唔靠標題搜尋（舊版抽出過跨物種污染）
 *
 *  鐵律（不可改）：
 *    · 只抽維基原文整句，不改寫、不生成、不翻譯式改寫
 *    · 抽唔到就留空 → 卡面印「資料待查」
 *    · 句首就係別隻雀的名字 → 整句丟棄（跨物種污染）
 *    · 英文欄位只放英文原文；中文欄位只放中文原文（不做機翻）
 *
 *  用法：
 *    node scripts/cards/extract-bilingual.mjs --ids 0008,0290
 *    node scripts/cards/extract-bilingual.mjs --from 1 --to 60 --limit 10
 *    node scripts/cards/extract-bilingual.mjs --all --missing-only
 *    node scripts/cards/extract-bilingual.mjs --self-test          （離線測試解析器）
 *    node scripts/cards/extract-bilingual.mjs --api-zh URL --api-en URL
 *
 *  輸出：
 *    src/data/cardCopy.json     加 fieldCopy：[{ id, zh?, en? }]，並保留舊欄位（向後相容）
 *    reports/copy-bilingual.md  每張卡抽到幾欄、缺幾欄
 *    .cache/wiki/               原文快取（重跑不重抓）
 *
 *  ⚠️ 沙盒封鎖 zh/en.wikipedia.org。請在 GitHub Actions 跑：
 *     .github/workflows/extract-bilingual.yml（手動觸發，只會開 PR 不會直接改 main）
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { FIELDS, FIELD_IDS, LIMITS, has, chooseFields } from './field-schema.mjs';
import { toHk } from './zh-hk.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BIRDS_F = path.join(ROOT, 'src/data/birds.json');
const TAX_F = path.join(ROOT, 'src/data/birdTaxonomy.json');
const COPY_F = path.join(ROOT, 'src/data/cardCopy.json');
const REPORT_F = path.join(ROOT, 'reports/copy-bilingual.md');
const CACHE = path.join(ROOT, '.cache/wiki');
const UA = 'AvianDex-BilingualExtractor/3.0 (educational; contact: ai@skwscout.org.hk)';

const ARGS = process.argv.slice(2);
const arg = (n, d) => { const i = ARGS.indexOf(n); return i >= 0 ? ARGS[i + 1] : d; };
const flag = (n) => ARGS.includes(n);
const DELAY = Number(arg('--delay', 700));
const API_ZH = arg('--api-zh', process.env.AVIANDEX_WIKI_ZH || 'https://zh.wikipedia.org/w/api.php').replace(/\/+$/, '');
const API_EN = arg('--api-en', process.env.AVIANDEX_WIKI_EN || 'https://en.wikipedia.org/w/api.php').replace(/\/+$/, '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 原子寫入：先寫 .tmp 再 rename，中途 Ctrl-C／斷電都唔會留半個壞 JSON */
export function saveAll(obj, file) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, `${JSON.stringify(obj, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

/** 顯示寬度：全形字（中文／中日韓標點）算 2 欄 */
const dispW = (s) => [...String(s)].reduce((n, ch) => n
  + (/[\u1100-\u115F\u2E80-\uA4CF\uA960-\uA97F\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(ch) ? 2 : 1), 0);

/** 用方框印出「檔案在哪」，方便唔熟路徑的人照抄 */
function printBox(lines) {
  const w = Math.max(...lines.map(([a, b]) => dispW(a) + (b ? 2 + dispW(b) : 0))) + 2;
  console.log('\n┌' + '─'.repeat(w) + '┐');
  for (const [a, b] of lines) {
    const used = dispW(a) + (b ? 2 + dispW(b) : 0);
    console.log('│ ' + a + (b ? '  ' + b : '') + ' '.repeat(Math.max(0, w - used)) + ' │');
  }
  console.log('└' + '─'.repeat(w) + '┘');
}

/* ------------------------------------------------------------------
 * 一、wikitext → 純文字（純函數，可離線測試）
 * ------------------------------------------------------------------ */
function dropTemplates(wt = '') {
  let s = wt;
  for (let i = 0; i < 40; i += 1) {
    const next = s.replace(/\{\{[^{}]*\}\}/g, ' ');
    if (next === s) break;
    s = next;
  }
  return s;
}

export function stripWiki(wt = '') {
  let s = wt;
  /* 0) 先整個拆掉內嵌檔案／圖片連結（含嵌套 [[...]] 的說明）。
   * 舊版逐個 [[...]] 拆，嵌套寫法（File:A.jpg|thumb|見 [[B.jpg]]）會漏，
   * 結果「xxx.jpg|female, India」這類圖說混入正文，變成卡面文案。 */
  s = stripFileLinks(s);
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<ref[^>]*\/>/gi, ' ');
  s = s.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, ' ');
  s = s.replace(/<ref[^>]*>[\s\S]*$/gi, ' ');
  s = dropTemplates(s);
  s = s.replace(/\{\|[\s\S]*?\|\}/g, ' ');
  s = s.split('\n').filter((ln) => !/^\s*\[\[(?:File|Image|文件|檔案|图像|圖像):/i.test(ln)).join('\n');
  s = s.replace(/\[\[(?:File|Image|文件|檔案|图像|圖像):[\s\S]*?\]\]/gi, ' ');
  s = s.replace(/^={2,}.*?={2,}\s*$/gm, ' ');
  s = s.replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1');
  s = s.replace(/\[\[([^\]]*)\]\]/g, '$1');
  s = s.replace(/\[(?:https?:)?\/\/\S+\s+([^\]]*)\]/g, '$1');
  s = s.replace(/'''''|'''|''/g, '');
  s = s.replace(/-\{([^{}]*)\}-/g, (_m, inner) => {
    const parts = inner.split(';').map((x) => x.split(':')).filter((kv) => kv.length === 2);
    if (!parts.length) return inner;
    const p = parts.find((kv) => /zh-(hk|tw|hant)/i.test(kv[0])) || parts[0];
    return p[1].trim();
  });
  s = s.replace(/<[^>]+>/g, ' ');
  for (let i = 0; i < 3; i += 1) {
    s = s.replace(/[（(]\s*[)）]/g, '');
    s = s.replace(/[（(][^（）()]{0,8}[:：]\s*[)）]/g, '');
  }
  s = s.replace(/&nbsp;/g, ' ');
  s = s.replace(/[ \t\u3000]+/g, ' ').replace(/\s+([，。、；：])/g, '$1');
  s = s.replace(/\n{2,}/g, '\n');
  return s.trim();
}

export function splitSections(wt = '') {
  const out = [];
  const re = /^={2,}\s*(.+?)\s*={2,}\s*$/gm;
  const marks = [];
  let m;
  while ((m = re.exec(wt))) marks.push({ title: m[1], start: m.index + m[0].length, end: wt.length });
  for (let i = 0; i < marks.length; i += 1) {
    if (i + 1 < marks.length) marks[i].end = re.lastIndex = marks[i + 1].start;
    out.push({ title: marks[i].title, body: wt.slice(marks[i].start, marks[i].end) });
  }
  return out;
}

/** 切句：中文按 。！？； ／英文按 .!? （後面要接空白或結尾，避免把小數點切開） */
export function sentences(text = '', lang = 'zh') {
  const clean = stripWiki(text).replace(/\n+/g, ' ');
  const parts = lang === 'zh'
    ? clean.split(/(?<=[。！？；])/)
    : clean.split(/(?<=[.!?])\s+/);
  return parts
    .map((s) => s.trim())
    .filter((s) => !MEDIA_JUNK.test(s))          /* 圖說／檔名碎片 → 丟 */
    .map((s) => (lang === 'en' ? s.replace(/^[)"'\]\s]+/, '') : s))
    .filter((s) => (lang === 'zh'
      ? s.length >= 8 && /[。！？；]$/.test(s) && !/[A-Za-z]{3,}\s+[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(s)
      : s.length >= 15 && /[.!?]["')\]]?$/.test(s) && /[a-z]/i.test(s) && /\s/.test(s)));
}

/**
 * 砍到上限。只砍在完整分句邊界，唔留半句。
 *
 * ⚠️ 舊版門檻係「截斷點要過 50%」，結果一整類條目永遠抽唔到：
 *    「分布于阿富汗、巴基斯坦、…、北京等地，主要栖息于海拔350-2800米间开阔沟谷…」
 *    這句 122 字，range 上限 46 字，46 字內只到「青海」（約 37%）→ 舊版整句丟棄，
 *    明明寫了分佈卻變成「資料待查」。
 *    改為 35%，並且截到最後一個完整分句（唔會留「、」或「，」尾巴）。
 *    截短時句尾加分號，令讀者知這句未完（卡面唔會假裝是完整句）。
 */
export function trimToLength(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const stops = ['。', '；', '，', '、', '. ', '; ', ', '];
  let best = -1;
  for (const d of stops) best = Math.max(best, cut.lastIndexOf(d));
  if (best > max * 0.35) {
    const kept = cut.slice(0, best + (cut[best] === ' ' ? 0 : 1)).trim()
      .replace(/[，、；,;]$/, '');
    if (kept.length < 10) return '';
    return /[。！？.]$/.test(kept) ? kept : `${kept}…`;
  }
  return '';
}

const anyOf = (s, words) => words.some((w) => s.includes(w));

/* ------------------------------------------------------------------
 * 一b. infobox（taxobox / Speciesbox）→ 數字欄位
 *     卡面右上角「身長／體重」同 IUCN 一直幾乎全空，因為舊抽取器只掃正文。
 *     這裡直接讀模板參數（{{Speciesbox | status = LC | ...}}），比正文準。
 * ------------------------------------------------------------------ */
/** 取模板內某個參數的原始值（支援嵌套模板／連結，容許 `| key =` 前有空白） */
export function templateParam(wt, key) {
  const re = new RegExp(`\\|\\s*${key}\\s*=\\s*([^\\n]*)`, 'i');
  const m = wt.match(re);
  return m ? m[1].trim() : '';
}

/** 把 infobox 的長度寫法正規化："19-21 cm" / "19–21 cm" / "{{convert|19|cm}}" */
export function parseLength(wt) {
  const raw = templateParam(wt, 'length') || templateParam(wt, 'size');
  // 只在「同一個 convert 模板」內找，避免跨到隔壁的模板
  const conv = (wt.match(/\{\{\s*convert\s*\|[^{}]*\}\}/gi) || [])
    .map((tpl) => {
      /* 逐個參數拆開，比用 regex 猜分隔符可靠 */
      const parts = tpl.replace(/^\{\{\s*convert\s*/i, '').replace(/\}\}$/, '').split('|').map((x) => x.trim());
      const nums = parts.filter((x) => /^\d+(?:\.\d+)?$/.test(x));
      const unit = parts.find((x) => /^(cm|mm|in)$/i.test(x));
      if (!unit || !nums.length) return null;
      return [null, nums[0], nums[1], unit];
    })
    .find(Boolean);
  let m = /convert/i.test(raw) ? null
    : raw.match(/(\d+(?:\.\d+)?)\s*(?:[-–—~至]\s*(\d+(?:\.\d+)?))?\s*(cm|mm|in|厘米|公分|毫米)?/i);
  if (!m && conv) m = conv;
  if (!m) return '';
  const unit = (m[3] || 'cm').toLowerCase();
  const u = /mm|毫米/.test(unit) ? 'mm' : /in|吋|英寸/.test(unit) ? 'in' : 'cm';
  return m[2] ? `${m[1]}–${m[2]} ${u}` : `${m[1]} ${u}`;
}

/** 體重："29-51.3 g" / "{{convert|29|to|51|g}}" */
export function parseWeight(wt) {
  const raw = templateParam(wt, 'weight') || templateParam(wt, 'mass');
  const conv = (wt.match(/\{\{\s*convert\s*\|[^{}]*\}\}/gi) || [])
    .map((tpl) => {
      const parts = tpl.replace(/^\{\{\s*convert\s*/i, '').replace(/\}\}$/, '').split('|').map((x) => x.trim());
      const nums = parts.filter((x) => /^\d+(?:\.\d+)?$/.test(x));
      const unit = parts.find((x) => /^(g|kg|oz)$/i.test(x));
      if (!unit || !nums.length) return null;
      return [null, nums[0], nums[1], unit];
    })
    .find(Boolean);
  let m = /convert/i.test(raw) ? null
    : raw.match(/(\d+(?:\.\d+)?)\s*(?:[-–—~至]\s*(\d+(?:\.\d+)?))?\s*(g|kg|oz|克|公斤|公克)?/i);
  if (!m && conv) m = conv;
  if (!m) return '';
  const unit = (m[3] || 'g').toLowerCase();
  const u = /kg|公斤/.test(unit) ? 'kg' : /oz/.test(unit) ? 'oz' : 'g';
  return m[2] ? `${m[1]}–${m[2]} ${u}` : `${m[1]} ${u}`;
}

/** IUCN：只接受標準代碼，回傳「無危 LC」這種寫法；矛盾／未填就回空 */
export function parseIucn(wt, lang = 'zh') {
  const code = (templateParam(wt, 'status') || '').toUpperCase().trim();
  const MAP = {
    LC: ['無危 LC', 'Least Concern (LC)'],
    NT: ['近危 NT', 'Near Threatened (NT)'],
    VU: ['易危 VU', 'Vulnerable (VU)'],
    EN: ['瀕危 EN', 'Endangered (EN)'],
    CR: ['極危 CR', 'Critically Endangered (CR)'],
    EW: ['野外滅絕 EW', 'Extinct in the Wild (EW)'],
    EX: ['滅絕 EX', 'Extinct (EX)'],
    DD: ['數據缺乏 DD', 'Data Deficient (DD)'],
    NE: ['未評估 NE', 'Not Evaluated (NE)'],
  };
  const hit = MAP[code.slice(0, 2)];
  if (!hit) return '';
  return lang === 'en' ? hit[1] : hit[0];
}

/** 別名（中文維基 infobox 的「別名」欄，或首段的「又名」） */
export function parseAliases(wt) {
  const raw = templateParam(wt, '別名') || templateParam(wt, '别名') || templateParam(wt, 'synonyms');
  if (!raw) return [];
  return stripWiki(raw.replace(/\}\}/g, ''))
    .split(/[、,，;；]/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 2 && x.length <= 8)
    .slice(0, 6);
}

/* ------------------------------------------------------------------
 * 二、欄位規則（中英各一套）
 * ------------------------------------------------------------------ */
export const SECTIONS_ZH = {
  range: ['分佈', '分布', '範圍', '地理', '遷徙'],
  habitat: ['棲息', '生境', ' habitat'],
  diet: ['食物', '食性', '覓食', '飲食', '捕食'],
  look: ['描述', '形態', '外形', '特徵', '羽色'],
  breeding: ['繁殖', '育雛', '巢', '生長', '發育'],
  funFact: ['文化', '命名', '趣聞', '人類', '象徵'],
  voice: ['鳴', '叫聲', '歌聲', '聲音'],
  behavior: ['行為', '習性', '生態'],
  migration: ['遷徙', '越冬', '過境'],
  conservation: ['保育', '保護', '威脅', '現況', '種群'],
  humanRelation: ['人類', '文化', '馴養', '觀賞', '與人'],
  etymology: ['命名', '名稱', '學名', '詞源', '由來'],
};

export const SECTIONS_EN = {
  range: ['Distribution', 'Range', 'Habitat and distribution', 'Occurrence'],
  habitat: ['Habitat', 'Ecology', 'Distribution and habitat'],
  diet: ['Diet', 'Feeding', 'Food', 'Foraging'],
  look: ['Description', 'Appearance', 'Morphology', 'Plumage', 'Identification'],
  breeding: ['Breeding', 'Reproduction', 'Nesting', 'Life cycle', 'Growth'],
  funFact: ['Behaviour and ecology', 'Behaviour', 'Behavior', 'In culture', 'Cultural'],
  voice: ['Voice', 'Vocalisation', 'Vocalization', 'Song', 'Call'],
  behavior: ['Behaviour', 'Behavior', 'Habits', 'Ecology'],
  migration: ['Migration', 'Movements', 'Vagrancy'],
  conservation: ['Conservation', 'Status', 'Threats', 'Conservation status'],
  humanRelation: ['In culture', 'Relationship with humans', 'Aviculture', 'As food', 'Cultural'],
  etymology: ['Etymology', 'Taxonomy', 'Name', 'Nomenclature'],
};

const RULES_ZH = {
  range: { must: ['分布', '分佈', '見於', '產於', '繁殖於', '越冬', '範圍', '棲於'], any: ['中國', '香港', '台灣', '亞洲', '東南亞', '印度', '歐洲', '非洲', '美洲', '澳洲', '廣東', '華南', '日本', '韓國'], weight: 7 },
  habitat: { must: ['棲息', '生境', '生活於', '出沒', '偏好', '常見於'], any: ['森林', '濕地', '溪流', '河', '湖', '池塘', '沼澤', '草地', '農田', '紅樹林', '海岸', '山地', '灌木', '公園', '林緣', '水庫', '林地'], weight: 6 },
  diet: { must: ['食', '捕食', '獵物', '覓食', '獵食'], any: ['昆蟲', '魚', '蛙', '蟹', '蝦', '果', '種子', '螺', '蠕蟲', '幼蟲', '蜥', '鼠', '鳥蛋', '花蜜', '漿果', '甲殼'], weight: 6 },
  look: { must: ['羽', '體長', '喙', '嘴', '翼', '尾', '頭', '背', '腹', '腳'], any: ['色', '斑', '紋', '冠', '眉', '喉', '胸', '淺', '深', '黑', '白', '褐', '灰', '紅', '黃', '藍', '綠', '橙'], weight: 6 },
  breeding: { must: ['繁殖', '孵', '巢', '蛋', '雛', '育'], any: ['月', '季', '天', '週', '顆', '隻', '雌', '雄'], weight: 6 },
  funFact: { must: ['俗稱', '又名', '唯一', '最小', '最大', '首次', '發現', '命名', '僅', '只分布', '只分佈', '來自', '象徵', '國鳥'], any: [], weight: 5 },
  voice: { must: ['鳴', '叫聲', '歌聲', '叫'], any: ['響亮', '婉轉', '模仿', '哨', '粗', '尖'], weight: 6 },
  behavior: { must: ['行為', '習性', '常', '會', '喜歡', '成群', '獨居', '活動'], any: ['晨', '昏', '夜', '日間', '遷', '群', '領域'], weight: 4 },
  migration: { must: ['遷徙', '越冬', '過境', '留鳥', '候鳥'], any: ['冬', '春', '秋', '南', '北'], weight: 6 },
  conservation: { must: ['保育', '保護', '威脅', '減少', '瀕', '受危', '數量'], any: ['棲地', '污染', '捕獵', '氣候', '競爭'], weight: 6 },
  humanRelation: { must: ['人類', '文化', '馴養', '觀賞', '寵物', '食用', '象徵', '國鳥'], any: ['傳統', '詩', '畫', '節慶', '飼養'], weight: 5 },
  etymology: { must: ['命名', '名稱', '學名', '源自', '來自', '意為', '由來', '詞源'], any: ['拉丁', '希臘', '英語', '俗名'], weight: 6 },
};

const RULES_EN = {
  range: { must: ['found', 'occurs', 'distributed', 'range', 'endemic', 'breeding range', 'resident', 'migrates'], any: ['Asia', 'China', 'India', 'Europe', 'Africa', 'America', 'Australia', 'Hong Kong', 'Southeast'], weight: 7 },
  habitat: { must: ['habitat', 'inhabits', 'found in', 'occurs in', 'prefers', 'woodland', 'forest', 'wetland'], any: ['forest', 'woodland', 'marsh', 'grassland', 'garden', 'urban', 'river', 'coast', 'scrub'], weight: 6 },
  diet: { must: ['feeds', 'diet', 'eat', 'prey', 'forage', 'insects', 'food'], any: ['insect', 'fish', 'fruit', 'seed', 'worm', 'crustacean', 'nectar', 'lizard', 'frog'], weight: 6 },
  look: { must: ['plumage', 'bill', 'wing', 'tail', 'head', 'upperpart', 'underpart', 'cm', 'mm', 'weigh'], any: ['black', 'white', 'grey', 'gray', 'brown', 'rufous', 'blue', 'green', 'yellow', 'red', 'streak', 'patch'], weight: 6 },
  breeding: { must: ['breed', 'nest', 'egg', 'incubat', 'chick', 'clutch', 'fledge'], any: ['season', 'month', 'days', 'weeks', 'male', 'female'], weight: 6 },
  funFact: { must: ['named', 'known', 'considered', 'national bird', 'only', 'smallest', 'largest', 'first', 'called'], any: [], weight: 5 },
  voice: { must: ['song', 'call', 'vocal', 'sing'], any: ['loud', 'whistle', 'mimic', 'harsh', 'melodious'], weight: 6 },
  behavior: { must: ['behaviour', 'behavior', 'habit', 'forages', 'perches', 'usually', 'often'], any: ['ground', 'tree', 'flock', 'territorial', 'dawn', 'dusk'], weight: 4 },
  migration: { must: ['migrat', 'winter', 'passage', 'resident', 'vagrant'], any: ['north', 'south', 'spring', 'autumn', 'winter'], weight: 6 },
  conservation: { must: ['conservation', 'threat', 'declin', 'endangered', 'vulnerable', 'population'], any: ['habitat loss', 'pollution', 'hunting', 'climate', 'trapping'], weight: 6 },
  humanRelation: { must: ['culture', 'human', 'kept', 'cagebird', 'pet', 'hunted', 'symbol', 'national'], any: ['tradition', 'poem', 'art', 'festival', 'aviculture'], weight: 5 },
  etymology: { must: ['name', 'etymolog', 'genus', 'specific epithet', 'derives', 'from Latin', 'from Greek', 'means'], any: ['Latin', 'Greek', 'Hindi', 'named after'], weight: 6 },
};

/** 跨物種污染守衛：句首就是別隻雀的名字 → 丟棄 */
const OTHER_BIRD = /^(?:[A-Z][a-z]+ (?:magpie-robin|robin|duck|goose|swan|egret|heron|kite|eagle|hawk|falcon|cuckoo|swift|swallow|warbler|flycatcher|tit|bulbul|starling|myna|crow|jay|magpie|sparrow|finch|bunting|wren|thrush|chat|shrike|oriole|drongo|pigeon|dove|kingfisher|bee-eater|roller|cormorant|gull|tern|sandpiper|plover|snipe|curlew|godwit|tern))\b/;
/* 句首「XXX體長…／XXX體重…／XXX又名…」：主語係一隻雀（唔一定係本卡嘅雀）。
 * 只認「雀名語素 + 屬性詞」，唔可以認「棲息於…」「分佈於…」這類以動詞開頭的句子。 */
const BIRD_MORPH = '鳥|鴨|鵰|鷹|鷲|鷗|鷸|鴴|鶯|鵯|鶇|鶥|鶲|鵑|雀|燕|鴉|鵲|鷺|鸚|鵡|鴞|雉|雞|鶴|鸛|鴴|鳽|鵜|鸕|鶿|鴿|鳩|鵐|鶺|鴒|鷚|䴉|鸝|鳾|鵟|隼|鳶|鵂|鶹|鴷|鶉|鴇|鷸|鸊|鷈';
const OTHER_BIRD_ZH = new RegExp(`^[\\u4e00-\\u9fff]{0,6}(?:${BIRD_MORPH})(?:體長|身長|體重|翼長|嘴峯|喙長|又名|俗稱|屬|的|為|是|分布|分佈)`);

/**
 * 跨物種污染守衛。
 * @param {string} sentence 候選句
 * @param {'zh'|'en'} lang
 * @param {string} [ownName] 本卡物種的中文名／英文名（句首就係自己 → 一定唔算污染）
 */
export function contaminated(sentence, lang, ownName = '', knownNames = null) {
  if (ownName && sentence.startsWith(ownName)) return false;
  if (lang === 'zh' && Array.isArray(knownNames) && knownNames.length) {
    /* 先用物種名單（最準）：句首係另一隻雀的名字 → 污染 */
    for (const n of knownNames) {
      if (n.length >= 2 && sentence.startsWith(n)) return true;
    }
  }
  return lang === 'zh' ? OTHER_BIRD_ZH.test(sentence) : OTHER_BIRD.test(sentence);
}

/** 在候選句中挑一句：規則命中 → 分數最高；句子長度要在上限內或可截 */
/** 遮住雀名（同一長度，位置不變），避免雀名內的「腹／尾／頭」被當成外形關鍵詞 */
const NAME_MASK = '\u0000';
const maskOwnName = (s, ownName) =>
  (ownName ? s.split(ownName).join(NAME_MASK.repeat(ownName.length)) : s);
const unmaskOwnName = (s) => s.split(NAME_MASK).join('');

/**
 * 分類學首句（「XX（學名：Abc def）又名YY，為X科Y屬的鳥類。」）唔係「有趣冷知識」，
 * 但入面嘅別名（又名／俗名）係真資料。只抽別名那一段，其餘丟棄；
 * 冇別名就回空 → 卡面印「資料待查」，好過印一句分類學廢話。
 */
export function leadNameFragment(s) {
  if (!/學名[:：]/.test(s)) return '';
  const m = s.match(/(?:又名|俗名|別名)[：: ]?([^，。；]{1,12})/);
  return m ? `${m[0].replace(/[：: ]/g, '')}` : '';
}

/**
 * 長句只抽「命中關鍵詞之後那一截」。
 *
 * 例：「棕腹大仙鶲（学名：Niltava davidi）为鶲科仙鶲属的鸟类，分布于四川、云南…」
 *    抽 range 時如果照頭截 46 字，會抽到「棕腹大仙鶲（學名：Niltava davidi）為鶲科
 *    仙鶲屬的鳥類，」——一句分類學廢話，完全唔係分佈。
 *    所以要由最左邊一個命中詞（「分布于」）開始抽，並退到前一個分句邊界。
 *
 * @param {string} s 原句
 * @param {{must: string[]}} rule 欄位規則
 * @param {number} maxLen 上限
 * @returns {string} 由命中處開始的片段（可能仍然過長，交 trimToLength 處理）
 */
export function excerptAround(s, rule, maxLen) {
  if (s.length <= maxLen) return s;
  const at = rule.must
    .map((w) => s.indexOf(w))
    .filter((i) => i > 0)
    .sort((a, b) => a - b)[0];
  if (at === undefined) return s;                 /* 關鍵詞在句首 → 照原句處理 */
  const head = s.slice(0, at);
  const boundary = Math.max(head.lastIndexOf('，'), head.lastIndexOf('、'),
    head.lastIndexOf('；'), head.lastIndexOf('。'));
  return s.slice(boundary >= 0 ? boundary + 1 : at).trim();
}

export function pickSentence(list, rule, maxLen, lang = 'zh', ownName = '', knownNames = null) {
  let best = '';
  let bestScore = 0;
  for (const s of list) {
    if (contaminated(s, lang, ownName, knownNames)) continue;
    if (lang === 'zh' && /[A-Za-z]{3,}\s+[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(s)) continue;
    /* 用「遮住自己名字」的版本做關鍵詞比對：
       雀名本身可能含「腹／尾／頭／腳」（棕腹大仙鶲、白頭鵯），
       唔遮住就會把「棕腹大仙鶲（學名…）為鶲科…」當成『外形特徵』。 */
    const masked = maskOwnName(s, ownName);
    if (!anyOf(masked, rule.must)) continue;
    const base = unmaskOwnName(excerptAround(masked, rule, maxLen));
    if (!anyOf(base, rule.must)) continue;        /* 抽完冇關鍵詞 → 唔用 */
    let score = rule.weight;
    for (const w of rule.any) if (base.includes(w)) score += 2;
    const t = trimToLength(base, maxLen);
    if (!t) continue;                         /* 截唔到完整句 → 唔用 */
    if (s.length > maxLen * 2) score -= 6;
    if (base.length < (lang === 'zh' ? 16 : 40)) score -= 1;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return best;
}

/**
 * 拆掉 [[File:...]]／[[Image:...]]／[[文件:...]]，支援一層或多層嵌套。
 * 由內而外逐層拆，最後連殘留的檔名尾巴都唔會剩。
 */
export function stripFileLinks(wt = '') {
  const FILE = /\[\[(?:File|Image|文件|檔案|图像|圖像|媒體|媒体)\s*:[\s\S]*?\]\]/gi;
  let s = wt;
  for (let i = 0; i < 12; i += 1) {
    const next = s.replace(FILE, ' ');
    if (next === s) break;
    s = next;
  }
  /* 中文維基間中用「檔案:」全形冒號 / 無連結的檔名行 */
  s = s.split('\n').filter((ln) => !/^\s*(?:File|Image|文件|檔案|图像|圖像)\s*[:：]/i.test(ln)).join('\n');
  return s;
}

/** 殘留的圖說／檔名碎片（保險網：任何欄位都唔應該含這些） */
const MEDIA_JUNK = /\.(?:jpe?g|png|gif|svg|tiff?|webp)\b|\bPhotograph by\b|\bthumb\b|\|\s*$|\bFile:/i;

/** 由整頁 wikitext 抽 15 個欄位（純函數） */
export function extractFields(wtRaw, { lang = 'zh', sciName = '', ownName = '', knownNames = null, maxPicks = 7, only = null } = {}) {
  /* 簡體 → 香港繁體，在「抽取之前」做：
     1) 規則表寫的是繁體（棲息／分佈），原文若是簡體（栖息／分布）就永遠對不上；
     2) 卡面本來就要香港繁體，與其出圖前再轉，不如入庫前轉一次；
     3) toHk 只轉字形（不改詞、不改句、不動英文／學名），可逐句對回原文。 */
  const wt = lang === 'zh' ? toHk(wtRaw) : wtRaw;
  const sections = splitSections(wt);
  const sectionMatch = lang === 'zh' ? SECTIONS_ZH : SECTIONS_EN;
  const rules = lang === 'zh' ? RULES_ZH : RULES_EN;
  const limits = LIMITS[lang];
  const all = sentences(wt, lang);
  const out = {};

  for (const id of FIELD_IDS) {
    if (only && !only.includes(id)) continue;
    if (!rules[id]) continue;
    const keys = sectionMatch[id] || [];
    const focused = sections
      .filter((s) => (lang === 'zh'
        ? keys.some((k) => s.title.includes(k))
        : keys.some((k) => s.title.toLowerCase().includes(k.toLowerCase()))))
      .flatMap((s) => sentences(s.body, lang));
    let val = focused.length ? pickSentence(focused, rules[id], limits[id], lang, ownName, knownNames) : '';
    if (!val) val = pickSentence(all, rules[id], limits[id], lang, ownName, knownNames);
    /* 冷知識／名稱由來如果抽到的只是分類學首句，只保留別名那一段 */
    if (val && (id === 'funFact' || id === 'etymology') && /學名[:：]/.test(val)) {
      val = leadNameFragment(val);
    }
    if (val) out[id] = val;
  }

  /* infobox 直接讀：長度／體重／IUCN／別名（比正文準，且唔會抽到別隻雀） */
  const len = parseLength(wt);
  if (len) out.length = len;
  const wgt = parseWeight(wt);
  if (wgt) out.weight = wgt;
  const iucn = parseIucn(wt, lang);
  if (iucn) out.iucn = iucn;
  if (lang === 'zh') {
    const al = parseAliases(wt);
    if (al.length) out.aliases = al;
  }

  /* Top 5：由「外形／行為／鳴聲」各抽一句短句湊夠，最多 5 條 */
  const pool = [out.look, out.voice, out.behavior, out.habitat, out.diet, out.migration].filter(Boolean);
  const hi = [];
  for (const s of pool) {
    const t = lang === 'zh'
      ? trimToLength(s, 40) : trimToLength(s, 110);
    if (t && !hi.some((x) => x === t)) hi.push(t);
    if (hi.length >= 5) break;
  }
  if (hi.length >= 3) out.highlights = hi.slice(0, 5);

  return out;
}

/* ------------------------------------------------------------------
 * 三、抓維基（學名核對 + pageid）
 * ------------------------------------------------------------------ */
function cachePath(kind, name) {
  fs.mkdirSync(CACHE, { recursive: true });
  return path.join(CACHE, `${kind}-${String(name).replace(/[^\w\u4e00-\u9fa5.-]/g, '_').slice(0, 90)}.json`);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = /^http:\/\//i.test(url) ? http : https;
    const req = lib.get(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } }, (res) => {
      if (res.statusCode >= 300 && res.headers.location) {
        res.resume();
        fetchJson(res.headers.location).then(resolve, reject);
        return;
      }
      const c = [];
      res.on('data', (d) => c.push(d));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(c).toString('utf8'))); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  });
}

async function cached(url, kind, name, noCache) {
  const f = cachePath(kind, name);
  if (!noCache && fs.existsSync(f)) {
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* 重抓 */ }
  }
  const json = await fetchJson(url);
  fs.writeFileSync(f, JSON.stringify(json));
  await sleep(DELAY);
  return json;
}

/**
 * 用學名找條目：先用 API 搜尋，再用「wikitext 內真的含學名」核對。
 * 核對很重要：舊版靠標題搜尋，結果 暗綠繡眼鳥 抓到「東方鵟」、灰面鷲 抓到「普通秧雞」。
 */
async function resolveBySciName(api, sciName, noCache, lang) {
  const q = encodeURIComponent(`"${sciName}"`);
  const search = await cached(
    `${api}?action=query&list=search&srsearch=${q}&srlimit=5&format=json&formatversion=2`,
    `search-${lang}`, sciName, noCache,
  );
  for (const hit of search?.query?.search || []) {
    const parse = await cached(
      `${api}?action=parse&page=${encodeURIComponent(hit.title)}&prop=wikitext&redirects=1&format=json&formatversion=2` +
      (lang === 'zh' ? '&variant=zh-hk' : ''),
      `wt-${lang}`, hit.title, noCache,
    );
    const wt = parse?.parse?.wikitext;
    if (!wt) continue;
    if (!wt.toLowerCase().includes(sciName.toLowerCase())) continue;   /* 學名對不上 → 跳過 */
    return { title: parse.parse.title, pageid: parse.parse.pageid, wt };
  }
  return null;
}

/* ------------------------------------------------------------------
 * 四、主流程
 * ------------------------------------------------------------------ */
async function main() {
  if (flag('--self-test')) return selfTest();

  const birds = JSON.parse(fs.readFileSync(BIRDS_F, 'utf8'));
  const tax = JSON.parse(fs.readFileSync(TAX_F, 'utf8'));
  const IN_F = arg('--in', '');
  const OUT_F = arg('--out', '');
  const readF = IN_F ? path.resolve(IN_F) : COPY_F;
  const writeF = OUT_F ? path.resolve(OUT_F) : COPY_F;
  /* 輸出目錄可能未存在（例如全新 clone 冇 data/ 目錄）→ 先建立，免得第一張就 ENOENT */
  fs.mkdirSync(path.dirname(writeF), { recursive: true });
  /* --out 指定新檔案但未存在時，用 src/data/cardCopy.json 做底稿：
   * 咁樣 --out 唔會由零開始，舊資料（中文欄）都保留得住 */
  const baseF = fs.existsSync(readF) ? readF : (OUT_F && fs.existsSync(COPY_F) ? COPY_F : '');
  const copyAll = baseF ? JSON.parse(fs.readFileSync(baseF, 'utf8')) : { _readme: {} };
  if (baseF && baseF !== readF) {
    console.log(`📋 底稿：${path.relative(ROOT, baseF)}（--out 係新檔，先以現有資料做底）`);
  }
  const noCache = flag('--no-cache');
  const lang = arg('--lang', 'zh') === 'en' ? 'en' : 'zh';
  const missingOnly = flag('--missing-only');
  const birdNames = [...new Set(birds.map((b) => b.name).filter(Boolean))];

  let targets = birds.filter((b) => tax[b.id] && tax[b.id].sciName);
  if (arg('--ids')) {
    const set = new Set(arg('--ids').split(',').map((s) => s.trim().padStart(4, '0')));
    targets = targets.filter((b) => set.has(b.id));
  } else {
    const from = Number(arg('--from', 0));
    const to = Number(arg('--to', 9999));
    targets = targets.filter((b) => Number(b.id) >= from && Number(b.id) <= to);
  }
  if (missingOnly) {
    targets = targets.filter((b) => {
      const fe = copyAll[b.id]?.fieldCopy;
      return !Array.isArray(fe) || fe.length < 5;
    });
  }
  if (flag('--limit')) targets = targets.slice(0, Number(arg('--limit', 20)));
  /* --resume：跳過「中英都已經有 ≥5 欄」的卡（斷線／中途停都可以續跑） */
  if (flag('--resume')) {
    const before = targets.length;
    targets = targets.filter((b) => {
      const c = copyAll[b.id];
      const fe = c?.fieldCopy;
      /* 完全搜唔到條目（中英都冇）→ 重試都係一樣，跳過，避免 --resume 每次重撞 */
      if (c && c.lang && c.lang.zh === false && c.lang.en === false) return false;
      if (Array.isArray(copyAll._done)) return !copyAll._done.includes(b.id);
      if (!Array.isArray(fe)) return true;
      const zhN = fe.filter((x) => x.zh).length;
      const enN = fe.filter((x) => x.en).length;
      /* 舊檔案冇 _done：網絡斷過會留低「中 0 英 12」這種半截結果，未夠 5 欄一律重試 */
      return zhN < 5 || enN < 5;
    });
    console.log(`   --resume：已完成 ${copyAll._done?.length || 0} 張，本次要跑 ${targets.length} 張`);
    console.log(`   --resume：跳過 ${before - targets.length} 張已齊（中英各 ≥5 欄）`);
  }

  console.log(`🌐 中英雙語抽取：${targets.length} 張（只抽原文，不改寫、不機翻）`);
  console.log(`   中文：${API_ZH}\n   英文：${API_EN}`);

  const report = [];
  let done = 0;
  for (const bird of targets) {
    const t = tax[bird.id];
    const sci = t.sciName;
    const existing = copyAll[bird.id] || {};

    let zh = null;
    let en = null;
    try {
      zh = await resolveBySciName(API_ZH, sci, noCache, 'zh');
    } catch (e) {
      console.log(`   ⚠️ ${bird.id} 中文維基失敗：${e.message}`);
    }
    try {
      en = await resolveBySciName(API_EN, sci, noCache, 'en');
    } catch (e) {
      console.log(`   ⚠️ ${bird.id} 英文維基失敗：${e.message}`);
    }
    if (!zh && !en) {
      console.log(`   ❓ ${bird.id} ${bird.name} — 中英維基都找不到學名 ${sci}`);
      report.push({ id: bird.id, name: bird.name, sci, zh: 0, en: 0, doc: '—', pageid: '' });
      done += 1;
      continue;
    }

    const knownNames = birdNames.filter((n) => n !== bird.name);
    const z = zh ? extractFields(zh.wt, { lang: 'zh', sciName: sci, ownName: bird.name || '', knownNames }) : {};
    const e = en ? extractFields(en.wt, { lang: 'en', sciName: sci, ownName: t.comName || bird.en || '' }) : {};

    /* 合併成 [{ id, zh, en }]：字段順序跟 field-schema，方便人眼核對 */
    const fieldCopy = FIELDS.filter((f) => f.slot === 'grid4')
      .map((f) => ({ id: f.id, zh: z[f.id] || '', en: e[f.id] || '' }))
      .filter((x) => x.zh || x.en);

    /* 舊欄位仍然寫一份（向後相容：Pillow 引擎與舊測試都讀它），但只補空位 */
    const out = { ...existing };
    for (const k of ['range', 'habitat', 'diet', 'look', 'breeding', 'funFact', 'voice', 'behavior',
      'migration', 'conservation', 'humanRelation', 'etymology']) {
      if (has(out[k])) continue;
      if (z[k]) out[k] = z[k];
    }
    if (!has(out.highlights) && z.highlights) out.highlights = z.highlights;

    out.fieldCopy = fieldCopy;
    out.lang = { zh: Boolean(zh), en: Boolean(en) };
    const src = [];
    if (zh) src.push(`zh.wikipedia ${zh.title} · pageid ${zh.pageid}`);
    if (en) src.push(`en.wikipedia ${en.title} · pageid ${en.pageid}`);
    out.source = src.join(' ｜ ') + ' · 分類：eBird/Clements';

    /* header 用嘅數字（長度／體重／IUCN／別名）：英文版優先英文維基，中文版優先中文維基 */
    const primary = lang === 'en' ? e : z;
    const secondary = lang === 'en' ? z : e;
    out.length = out.length || primary.length || secondary.length || '';
    out.weight = out.weight || primary.weight || secondary.weight || '';
    /* IUCN 分開存：中文卡印「無危 LC」、英文卡印「Least Concern (LC)」，
     * 兩邊都留，出圖時按 --lang 揀，唔會臨時翻譯 */
    const codeOf = (v) => ({ 無危: 'LC', 近危: 'NT', 易危: 'VU', 瀕危: 'EN', 極危: 'CR',
      數據缺乏: 'DD', 未評估: 'NE', 野外滅絕: 'EW', 滅絕: 'EX' }[String(v).split(' ')[0]] || '');
    const iucnZh = [z.iucn, e.iucn].find((v) => v && codeOf(v)) || '';
    if (iucnZh) out.iucn = iucnZh;
    if (e.iucn) out.iucnEn = e.iucn;
    if (primary.aliases && primary.aliases.length) out.aliases = primary.aliases;

    const sel = chooseFields({ ...out, photo: out.photo }, {});
    out.picks = sel.picks;
    out.fetchedAt = new Date().toISOString().slice(0, 10);
    copyAll[bird.id] = out;
    /* _done：記錄「這張已經完整抽過」，--resume 靠它判斷（唔靠欄數，避免半截結果被當完成） */
    const okZh = Boolean(zh);
    const okEn = Boolean(en);
    const doneList = new Set(copyAll._done || []);
    if (okZh && okEn) doneList.add(bird.id); else doneList.delete(bird.id);
    copyAll._done = [...doneList].sort();

    /* 每 10 張寫一次（548 張寫 55 次，唔會拖慢）；Ctrl-C 最多蝕 10 張 */
    done += 1;
    if (!flag('--dry-run') && done % 10 === 0) saveAll(copyAll, writeF);

    const zhN = fieldCopy.filter((x) => x.zh).length;
    const enN = fieldCopy.filter((x) => x.en).length;
    console.log(`   ${zhN || enN ? '✅' : '➖'} [${done}/${targets.length}] ${bird.id} ${bird.name} — 中 ${zhN} 欄／英 ${enN} 欄，印 ${sel.picks.length} 格（${sel.picks.join('/') || '—'}）`);
    report.push({ id: bird.id, name: bird.name, sci, zh: zhN, en: enN, doc: `${zhN}/${enN}`, pageid: zh?.pageid || en?.pageid || '' });
  }

  if (!flag('--dry-run')) saveAll(copyAll, writeF);
  const total = Object.keys(copyAll).filter((k) => !k.startsWith('_')).length;
  const gotN = report.filter((r) => r.zh || r.en).length;
  const inPlace = path.resolve(writeF) === path.resolve(COPY_F);
  console.log(`\n💾 已寫入 ${path.relative(ROOT, writeF)}（檔案共 ${total} 張，本次有更新 ${gotN} 張）`);
  console.log(`   絕對路徑：${writeF}`);
  if (inPlace) {
    /* 直接寫入 cardCopy.json：唔需要再上傳、唔需要第二個 --write 步驟 */
    printBox([
      ['✅ 文案已經入到 src/data/cardCopy.json', '（唔使上傳任何檔案）'],
      ['① 重算覆蓋率', '   npm run cards:report'],
      ['② 重出詳細資料', '   npm run cards:data'],
      ['③ 存檔', '   git add src/data/cardCopy.json && git commit -m "copy: 補 25 張中文文案"'],
    ]);
  } else {
    printBox([
      ['① 這兩個檔案就是成品', ''],
      ['   ' + writeF, '（要上傳給我）'],
      ['   ' + REPORT_F, '（可以不上傳）'],
      ['② 想即時睇結果', `   node scripts/cards/show-picks.mjs --file ${path.relative(ROOT, writeF)} --ids 0008`],
      ['③ 想合併入 repo', '   node scripts/cards/show-picks.mjs --file ' + path.relative(ROOT, writeF) + ' --write'],
    ]);
  }

  const zero = report.filter((r) => !r.zh && !r.en);
  const halfZh = report.filter((r) => r.zh && !r.en);
  const halfEn = report.filter((r) => !r.zh && r.en);
  const list = (arr) => (arr.length ? arr.slice(0, 30).map((r) => `${r.id} ${r.name}`).join('、') + (arr.length > 30 ? ` …共 ${arr.length} 張` : '') : '—');
  console.log(`\n📊 本次 ${report.length} 張：中英齊 ${report.length - zero.length - halfZh.length - halfEn.length}、`
    + `只有中文 ${halfZh.length}、只有英文 ${halfEn.length}、兩邊都冇 ${zero.length}`);
  if (halfZh.length) console.log(`   ⚠️ 只有中文（英文維基冇條目／學名對不上）：${list(halfZh)}`);
  if (halfEn.length) console.log(`   ⚠️ 只有英文（中文維基冇條目）：${list(halfEn)}`);
  if (zero.length) console.log(`   ❌ 兩邊都冇：${list(zero)}`);

  const md = ['# 中英雙語抽取報告', '', `- 執行：${new Date().toISOString()}`, `- 目標：${targets.length} 張`,
    '', '| 編號 | 中文名 | 學名 | 中文欄 | 英文欄 | pageid |', '|---|---|---|---|---|---|'];
  for (const r of report) md.push(`| ${r.id} | ${r.name} | ${r.sci} | ${r.zh} | ${r.en} | ${r.pageid} |`);
  fs.mkdirSync(path.dirname(REPORT_F), { recursive: true });
  fs.writeFileSync(REPORT_F, md.join('\n') + '\n');
  console.log(`\n📄 ${path.relative(ROOT, REPORT_F)}`);
}

/* ------------------------------------------------------------------
 * 五、離線自測（CI 不需要網路）
 * ------------------------------------------------------------------ */
function selfTest() {
  const en = `{{Speciesbox|name=Oriental magpie-robin|status=LC}}
The '''Oriental magpie-robin''' (''Copsychus saularis'') is a small passerine bird. The males are distinctive black and white birds with a long tail.

==Description==
This species is 19 cm long, including the long tail, which is usually held cocked upright. The male has black upperparts, head and throat apart from a white shoulder patch. The underparts and the sides of the long tail are white.

==Distribution and habitat==
This magpie-robin is a resident breeder in tropical southern Asia from Nepal, Bangladesh, India, Sri Lanka and eastern Pakistan.

The Oriental magpie-robin is found in open woodland and cultivated areas often close to human habitations.

==Behaviour and ecology==
It feeds on insects, earthworms and small vertebrates. The song is loud and melodious, and they mimic other birds.

==Breeding==
Breeding takes place from March to July. The nest is built in a hole in a tree or wall, and two to five eggs are laid.
`;
  const zh = `{{Speciesbox|name=鵲鴝}}
'''鵲鴝'''（學名：''Copsychus saularis''）是雀形目鶲科鵲鴝屬的鳥類。

== 描述 ==
鵲鴝體長19至21厘米，雄鳥上半部為黑色並帶有藍色光澤，雌鳥則為灰色，兩翼有白斑。

== 分佈與棲息地 ==
分佈於尼泊爾、孟加拉國、印度、斯里蘭卡和巴基斯坦東部。

棲息於開闊的林地和經耕作的地區，經常靠近人類居住地。

== 食物 ==
主要以昆蟲為食，亦取食花蜜、壁虎、水蛭、蝸牛甚至小魚。

== 繁殖 ==
繁殖期為3月至7月，每窩4至5顆蛋，孵化期約8至14天。

== 其他 ==
普通鵟體重約759.1克，翼長約395毫米，嘴峯長約34.5毫米。
`;
  const e = extractFields(en, { lang: 'en', sciName: 'Copsychus saularis', ownName: 'Oriental magpie-robin' });
  const z = extractFields(zh, { lang: 'zh', sciName: 'Copsychus saularis', ownName: '鵲鴝',
    knownNames: ['普通鵟', '黑鳶', '白頭鵯', '麻雀'] });
  const checks = [
    ['英文 look 抽到（含 cm／plumage）', Boolean(e.look) && /cm|black|white/.test(e.look)],
    ['英文 habitat 抽到 open woodland', Boolean(e.habitat) && /woodland|cultivated/.test(e.habitat)],
    ['英文 diet 抽到 insects', Boolean(e.diet) && /insect/i.test(e.diet)],
    ['英文 breeding 抽到 nest／egg', Boolean(e.breeding) && /nest|egg/i.test(e.breeding)],
    ['英文 highlights 至少 3 條', Array.isArray(e.highlights) && e.highlights.length >= 3],
    ['中文 look 抽到', Boolean(z.look) && z.look.includes('黑')],
    ['中文 habitat 抽到', Boolean(z.habitat) && z.habitat.includes('林地')],
    ['中文 diet 抽到', Boolean(z.diet) && z.diet.includes('昆蟲')],
    ['中文 breeding 抽到', Boolean(z.breeding) && /繁殖|蛋|孵化/.test(z.breeding)],
    ['跨物種守衛：普通鵟句被丟棄', !JSON.stringify(z).includes('普通鵟')],
    ['英文唔會出現中文', !/[\u4e00-\u9fff]/.test(Object.values(e).join(' '))],
    ['中文唔會出現長段英文', !/[A-Za-z]{4,} [A-Za-z]{4,} [A-Za-z]{4,}/.test(Object.values(z).join(' '))],
  ];
  let bad = 0;
  for (const [label, ok] of checks) {
    console.log(`${ok ? '✅' : '❌'} ${label}`);
    if (!ok) bad += 1;
  }
  console.log(bad ? `\n❌ ${bad} 項失敗` : '\n✅ 全部通過');
  process.exit(bad ? 1 : 0);
}

/* 只有「直接執行」才跑主流程；被 import 做測試時唔會誤抓維基、唔會改檔案 */
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => {
    console.error('✗ ' + e.message);
    process.exit(1);
  });
}
