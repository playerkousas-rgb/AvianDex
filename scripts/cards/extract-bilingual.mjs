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
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { FIELDS, FIELD_IDS, LIMITS, has, chooseFields } from './field-schema.mjs';

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
    .filter((s) => (lang === 'zh'
      ? s.length >= 8 && /[。！？；]$/.test(s)
      : s.length >= 15 && /[.!?]$/.test(s) && /[a-z]/i.test(s) && /\s/.test(s)));
}

/** 砍到上限（只砍在完整分句／子句邊界，不留半句） */
export function trimToLength(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const stops = ['。', '；', '，', '. ', '; ', ', '];
  let best = -1;
  for (const d of stops) best = Math.max(best, cut.lastIndexOf(d));
  if (best > max * 0.5) return cut.slice(0, best + (cut[best] === ' ' ? 0 : 1)).trim();
  return '';
}

const anyOf = (s, words) => words.some((w) => s.includes(w));

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
export function pickSentence(list, rule, maxLen, lang = 'zh', ownName = '', knownNames = null) {
  let best = '';
  let bestScore = 0;
  for (const s of list) {
    if (contaminated(s, lang, ownName, knownNames)) continue;
    if (!anyOf(s, rule.must)) continue;
    let score = rule.weight;
    for (const w of rule.any) if (s.includes(w)) score += 2;
    const t = trimToLength(s, maxLen);
    if (!t) continue;                         /* 截唔到完整句 → 唔用 */
    if (s.length > maxLen * 2) score -= 6;
    if (s.length < (lang === 'zh' ? 16 : 40)) score -= 1;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return best;
}

/** 由整頁 wikitext 抽 15 個欄位（純函數） */
export function extractFields(wt, { lang = 'zh', sciName = '', ownName = '', knownNames = null, maxPicks = 7, only = null } = {}) {
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
    if (val) out[id] = val;
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
    const req = https.get(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } }, (res) => {
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
  const copyAll = fs.existsSync(COPY_F) ? JSON.parse(fs.readFileSync(COPY_F, 'utf8')) : { _readme: {} };
  const noCache = flag('--no-cache');
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

  console.log(`🌐 中英雙語抽取：${targets.length} 張（只抽原文，不改寫、不機翻）`);
  console.log(`   中文：${API_ZH}\n   英文：${API_EN}`);

  const report = [];
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
    if (!has(out.iucn) && z.iucn) out.iucn = z.iucn;

    out.fieldCopy = fieldCopy;
    out.lang = { zh: Boolean(zh), en: Boolean(en) };
    const src = [];
    if (zh) src.push(`zh.wikipedia ${zh.title} · pageid ${zh.pageid}`);
    if (en) src.push(`en.wikipedia ${en.title} · pageid ${en.pageid}`);
    out.source = src.join(' ｜ ') + ' · 分類：eBird/Clements';

    const sel = chooseFields({ ...out, photo: out.photo }, {});
    out.picks = sel.picks;
    copyAll[bird.id] = out;

    const zhN = fieldCopy.filter((x) => x.zh).length;
    const enN = fieldCopy.filter((x) => x.en).length;
    console.log(`   ${zhN || enN ? '✅' : '➖'} ${bird.id} ${bird.name} — 中 ${zhN} 欄／英 ${enN} 欄，印 ${sel.picks.length} 格（${sel.picks.join('/') || '—'}）`);
    report.push({ id: bird.id, name: bird.name, sci, zh: zhN, en: enN, doc: `${zhN}/${enN}`, pageid: zh?.pageid || en?.pageid || '' });
  }

  fs.writeFileSync(COPY_F, `${JSON.stringify(copyAll, null, 2)}\n`);

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
