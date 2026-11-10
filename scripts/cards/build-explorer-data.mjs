#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 圖鑑索引（搜尋／屬性／相似鳥）資料產生器
 * ------------------------------------------------------------
 *  一本真圖鑑要可以「用好多條線索搵到同一隻雀」：
 *    名稱（中文／英文／學名／別名／編號）
 *    分類（目／科，中英都要）
 *    屬性（食乜、住邊）
 *  然後由「屬性重疊」自動列出相似鳥類。
 *
 *  為什麼要另開一個檔？
 *    src/data/cardCopy.json 有 2.8 MB。如果瀏覽器為了「食昆蟲的雀有幾多隻」
 *    而載入全文，就太重。所以這裡只抽標籤（tags）＋分類，做成
 *    src/data/explorerIndex.json（幾十 KB），搜尋與相似鳥全部靠它。
 *
 *  ⚠️ 標籤只由 cardCopy 的既有文字比對「詞彙表」得出，不會新增任何未查證內容。
 *     對唔上就係空 —— 寧願少一個標籤，都唔好亂標。
 *
 *  跑：npm run cards:explorer
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATA = path.join(ROOT, 'src', 'data');
const OUT = path.join(DATA, 'explorerIndex.json');

/**
 * 食物詞彙表。
 *   zh / en = 顯示用的標籤（中英各一）
 *   re      = 判斷有沒有出現的條件（中文用中文卡文案，英文用英文卡文案）
 * 只收錄觀鳥圖鑑常見、而且中文維基／英文維基都會直接寫出來的分類。
 */
export const DIET_TAGS = [
  { id: 'insect', zh: '昆蟲', en: 'Insects', re: /昆蟲|食蟲|蟲|insect|beetle|moth|ant\b|termite|caterpillar|orthopter|mantis|dragonfl/i },
  { id: 'fish', zh: '魚', en: 'Fish', re: /魚|fish|piscivor/i },
  { id: 'amphibian', zh: '蛙類', en: 'Frogs', re: /蛙|蝌蚪|frog|tadpole|amphibian/i },
  { id: 'reptile', zh: '爬蟲', en: 'Reptiles', re: /蜥蜴|蛇|壁虎|lizard|snake|gecko|reptile/i },
  { id: 'crustacean', zh: '蟹蝦', en: 'Crabs & Shrimp', re: /蟹|蝦|crab|shrimp|prawn|crayfish|crustacean/i },
  { id: 'mollusc', zh: '螺貝', en: 'Snails & Shells', re: /蝸牛|螺|蜆|貝|蠔|snail|slug|mussel|clam|oyster|shellfish|mollusc/i },
  { id: 'worm', zh: '蠕蟲', en: 'Worms', re: /蠕蟲|蚯蚓|沙蠶|水蛭|蛭|worm|earthworm|polychaete|leech/i },
  { id: 'spider', zh: '蜘蛛', en: 'Spiders', re: /蜘蛛|spider/i },
  { id: 'fruit', zh: '果實', en: 'Fruit', re: /果實|漿果|無花果|榕果|fruit|berry|berries|fig\b/i },
  { id: 'seed', zh: '種子穀物', en: 'Seeds & Grain', re: /種子|穀物|稻|麥|粟|seed|grain|rice\b|millet/i },
  { id: 'nectar', zh: '花蜜', en: 'Nectar', re: /花蜜|蜜|nectar|honey/i },
  { id: 'bud', zh: '嫩芽花葉', en: 'Buds & Leaves', re: /嫩芽|芽|花葉|樹葉|葉片|bud|leaves|foliage|shoot/i },
  { id: 'carrion', zh: '腐肉', en: 'Carrion', re: /腐肉|腐屍|屍體|carrion|carcass|dead animal/i },
  { id: 'rodent', zh: '鼠類', en: 'Rodents', re: /鼠|rodent|rat\b|mouse|mice/i },
  { id: 'bird', zh: '其他鳥類', en: 'Other Birds', re: /其他鳥|雛鳥|鳥蛋|鳥卵|other bird|nestling|egg|chick/i },
  { id: 'plant', zh: '植物藻類', en: 'Plants & Algae', re: /水草|藻|海藻|植物|草|algae|aquatic plant|vegetation|grass/i },
  { id: 'omnivore', zh: '雜食', en: 'Omnivore', re: /雜食|omnivor|generalist/i },
];

/** 居住環境詞彙表（同樣只做比對，不新增內容）。 */
export const HABITAT_TAGS = [
  { id: 'forest', zh: '森林', en: 'Forest', re: /森林|林|forest|woodland/i },
  { id: 'wetland', zh: '濕地', en: 'Wetland', re: /濕地|沼澤|泥灘|紅樹林|wetland|marsh|mudflat|mangrove|swamp/i },
  { id: 'water', zh: '水邊', en: 'Waterside', re: /溪|河|池塘|水庫|湖|海|水邊|stream|river|pond|lake|reservoir|coast|sea\b|shore/i },
  { id: 'grassland', zh: '草地農田', en: 'Grassland & Farmland', re: /草地|草原|農田|耕地|田|grassland|farmland|field|cultivat|padd/i },
  { id: 'urban', zh: '城市公園', en: 'Urban & Parks', re: /城市|市區|公園|人類居住|庭院|urban|city|park|garden|human habitation|village/i },
  { id: 'mountain', zh: '山地', en: 'Mountains', re: /山|高地|mountain|montane|hill|highland/i },
  { id: 'open', zh: '開闊地', en: 'Open Country', re: /開闊|空曠|灌叢|灌木|open|scrub|bush|shrub/i },
];

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

/** 由一段文字比對詞彙表；返回符合的 id */
function matchTags(text, table) {
  if (!text) return [];
  return table.filter((t) => t.re.test(text)).map((t) => t.id);
}

/**
 * 取某欄的文字（餵去比對標籤）。
 *
 * ⚠️ 次序好重要：先用「校對過的短文案」（copy[id]），因為那是卡面會印的版本；
 *    fieldCopy 是維基原文全文，長篇大論會撈到「也會吃魚」之類一句就中標籤，
 *    結果每隻雀都變成雜食。原文只在短文案完全冇資料時才用。
 */
function fieldText(copy, id, lang) {
  const v = copy[id];
  if (typeof v === 'string' && v.trim()) return v;
  if (Array.isArray(v) && v.length) return v.join('；');

  const fc = copy.fieldCopy;
  if (Array.isArray(fc)) {
    const hit = fc.find((x) => x && x.id === id);
    if (hit) {
      const w = hit[lang];
      if (typeof w === 'string') return w;
      if (Array.isArray(w)) return w.join('；');
    }
  }
  return '';
}

/** 體長字串（"19 cm" / "19-21 cm"）→ 取平均值，方便比較體型 */
function parseLength(v) {
  if (typeof v !== 'string') return 0;
  const nums = v.match(/\d+(\.\d+)?/g);
  if (!nums) return 0;
  const a = parseFloat(nums[0]);
  const b = nums[1] ? parseFloat(nums[1]) : a;
  return Math.round(((a + b) / 2) * 10) / 10;
}

function main() {
  const birds = readJson(path.join(DATA, 'birds.json'));
  const tax = readJson(path.join(DATA, 'birdTaxonomy.json'));
  const copy = readJson(path.join(DATA, 'cardCopy.json'));
  const aliases = fs.existsSync(path.join(DATA, 'name-aliases.generated.json'))
    ? readJson(path.join(DATA, 'name-aliases.generated.json'))
    : {};
  /* 台灣鳥類名錄的中文名（npm run cards:tw 產生）：
     只做「搜尋別名」，唔會取代卡面的香港慣用名。
     兩套名字都是華文圈通行叫法，打邊一個都應該搵得到隻雀。 */
  const twNames = fs.existsSync(path.join(DATA, 'twNames.json'))
    ? readJson(path.join(DATA, 'twNames.json')).names || {}
    : {};

  const byId = new Map(birds.map((b) => [b.id, b]));
  const entries = {};

  for (const [id, c] of Object.entries(copy)) {
    if (!/^\d{4}$/.test(id)) continue;
    const b = byId.get(id) || {};
    const t = tax[id] || {};
    const dietZh = fieldText(c, 'diet', 'zh');
    const dietEn = fieldText(c, 'diet', 'en');
    const habZh = fieldText(c, 'habitat', 'zh');
    const habEn = fieldText(c, 'habitat', 'en');

    /* 先試中文文案（我們的權威版本），中文冇就用英文文案 */
    const diet = dietZh ? matchTags(dietZh, DIET_TAGS) : matchTags(dietEn, DIET_TAGS);
    const habitat = habZh ? matchTags(habZh, HABITAT_TAGS) : matchTags(habEn, HABITAT_TAGS);
    if (!diet.length && dietEn) diet.push(...matchTags(dietEn, DIET_TAGS));

    const zh = b.name || '';
    const en = t.comName || b.en || '';
    const aliasRaw = aliases[id] || aliases[zh] || [];
    /* name-aliases.generated.json 只放英文俗名＋學名（重複原文），唔算「別名」；
       真正額外別名（例如舊名、俗稱）才留。 */
    const alias = (aliasRaw.aliases || []).filter(
      (a) => a && a !== en && a.toLowerCase() !== en.toLowerCase() && a !== t.sciName,
    );

    /* 台灣名錄的中文名加入別名（同卡面名相同的唔重複加） */
    const twRec = twNames[id] || {};
    const tw = twRec.zh;
    if (tw && tw !== zh && !alias.includes(tw)) alias.push(tw);

    entries[id] = {
      z: zh,
      e: en,
      s: t.sciName || '',
      o: t.order || '',
      f: t.family || '',
      oz: t.orderZh || c.orderZh || '',
      fz: t.familyZh || c.familyZh || '',
      code: t.speciesCode || '',
      n: Array.isArray(alias) ? alias.slice(0, 6) : [],
      d: [...new Set(diet)],
      h: [...new Set(habitat)],
      len: parseLength(c.length),
      /* 台灣鳥類名錄的事實欄位（臺灣的數據，唔係香港的；UI 必須標明「臺灣」）。
         港、台兩地季候不同，直接當成本地數據會誤導。 */
      tws: twRec.status || '',
      twp: twRec.protect || '',
    };
  }

  const out = {
    _readme: {
      用途: '圖鑑索引：名稱／分類／屬性標籤。搜尋與「相似鳥類」只讀這份，不載入 2.8 MB 的 cardCopy.json。',
      產生: 'npm run cards:explorer（scripts/cards/build-explorer-data.mjs）',
      規則: '標籤只由 cardCopy 既有文案比對詞彙表得出；比對唔到就留空，不得憑印象加。',
      欄位: { z: '中文名', e: '英文名', s: '學名', o: '目（拉丁）', f: '科（拉丁）', oz: '目（中文）', fz: '科（中文）', code: 'eBird speciesCode', n: '別名', d: '食物屬性', h: '環境屬性', len: '體長（cm，取範圍中位）' },
    },
    dietTags: DIET_TAGS.map((t) => ({ id: t.id, zh: t.zh, en: t.en })),
    habitatTags: HABITAT_TAGS.map((t) => ({ id: t.id, zh: t.zh, en: t.en })),
    birds: entries,
  };

  fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');

  const total = Object.keys(entries).length;
  const noDiet = total - Object.values(entries).filter((e) => e.d.length).length;
  const noHab = total - Object.values(entries).filter((e) => e.h.length).length;
  console.log(`✅ ${path.relative(ROOT, OUT)}（${(fs.statSync(OUT).size / 1024).toFixed(0)} KB）`);
  console.log(`   收錄 ${total} 張卡｜無食物標籤 ${noDiet} 張｜無環境標籤 ${noHab} 張`);

  /* 覆蓋率：每個標籤有幾張卡（太少就代表詞彙表要補，太多就代表太粗） */
  const tally = (key) => {
    const m = {};
    for (const e of Object.values(entries)) for (const id of e[key]) m[id] = (m[id] || 0) + 1;
    return m;
  };
  const d = tally('d');
  const h = tally('h');
  console.log('   食物：' + DIET_TAGS.map((t) => `${t.zh} ${d[t.id] || 0}`).join('・'));
  console.log('   環境：' + HABITAT_TAGS.map((t) => `${t.zh} ${h[t.id] || 0}`).join('・'));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
