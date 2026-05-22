#!/usr/bin/env node
/* ============================================================
 *  AvianDex - 自動產生 birds.json + nameAliases.ts
 * ============================================================
 *  資料來源：
 *    1) Wikipedia 「List of birds of Hong Kong」 (英文名 + 學名)
 *    2) Avibase「香港鳥類完整名錄」(中文名對照)
 *    3) eBird Taxonomy CSV (作為英文名後備)
 *
 *  用法：
 *    node scripts/build-aliases.mjs                 # 全自動，下載並更新
 *    node scripts/build-aliases.mjs --dry           # 只輸出到 stdout
 *    node scripts/build-aliases.mjs --start 22      # 從 ID 0022 開始編號
 *
 *  注意：
 *    - 已存在 birds.json 中的鳥種會「保留中文名」，僅補充 alias
 *    - 你可以隨時手動編輯 birds.json 把 AI 翻譯的中文改成你喜歡的
 * ============================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BIRDS_JSON = path.join(ROOT, 'src/data/birds.json');
const ALIASES_TS = path.join(ROOT, 'src/data/nameAliases.ts');

const ARGS = process.argv.slice(2);
const DRY = ARGS.includes('--dry');
const startArg = ARGS.find((a) => a.startsWith('--start'));
const START_ID = startArg ? parseInt(startArg.split('=')[1] || ARGS[ARGS.indexOf(startArg) + 1], 10) : null;

// ────────────────────────────────────────────────────────────
// 1. 從 Wikipedia 抓「香港鳥類列表」
// ────────────────────────────────────────────────────────────
async function fetchHKBirdList() {
  console.log('📡 [1/3] 從 Wikipedia 下載香港鳥類列表...');
  const url = 'https://en.wikipedia.org/wiki/List_of_birds_of_Hong_Kong';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wikipedia 回應錯誤：${res.status}`);
  const html = await res.text();

  // 抓所有 <li>...<i>Scientific name</i>...</li> 或 「Common name <i>(Sci name)</i>」
  // Wikipedia 的格式通常是：
  //   <li><a href="/wiki/Common_name" title="...">Common Name</a> <i><a ...>Scientific name</a></i></li>
  // 或：
  //   <li>Common Name <i>Scientific name</i></li>
  const birds = [];
  const seen = new Set();

  // 匹配：<li>...>Common Name</a>, <i>Scientific name</i>...
  // 或：<li>Common Name, <i>Scientific name</i>
  const re = /<li>[^<]*(?:<a[^>]*>([^<]+)<\/a>|([A-Z][A-Za-z'’\-\s]+?))[^<]*<i>(?:<a[^>]*>)?([A-Z][a-z]+(?:\s+[a-z]+)+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const common = (m[1] || m[2] || '').trim().replace(/\s+/g, ' ');
    const sci = m[3].trim();
    if (!common) continue;
    const key = sci.toLowerCase();
    if (seen.has(key)) continue;
    // 過濾掉非鳥種文字（家族名、目名等）
    if (common.length < 2 || common.length > 60) continue;
    if (sci.split(/\s+/).length < 2) continue;
    seen.add(key);
    birds.push({ commonName: common, scientificName: sci });
  }

  console.log(`   → 找到 ${birds.length} 個物種`);
  return birds;
}

// ────────────────────────────────────────────────────────────
// 2. 從 Avibase 抓中文名對照（多語系名錄）
// ────────────────────────────────────────────────────────────
async function fetchZhWikipediaChinese() {
  console.log('📡 [2/3] 從中文 Wikipedia 下載「香港鳥類列表」中文名對照...');
  const url = 'https://zh.wikipedia.org/wiki/%E9%A6%99%E6%B8%AF%E9%B3%A5%E9%A1%9E%E5%88%97%E8%A1%A8';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 AvianDex-Builder' },
    });
    if (!res.ok) {
      console.warn(`   ⚠️ Wikipedia 中文版回應 ${res.status}，跳過`);
      return new Map();
    }
    const html = await res.text();

    // 格式：<li><a ...>中文名</a> - <i>Scientific Name</i> ※...</li>
    // 學名可能有錯字（如 Steptopelia → Streptopelia），我們建立 sci → zh 映射
    const re = /<li>(?:<[^>]+>)*([\u4e00-\u9fff]+?)<\/a>[^<]*<i>([A-Z][a-z]+(?:\s+[a-z]+){1,2})/g;
    const sciToZh = new Map();
    let m;
    while ((m = re.exec(html)) !== null) {
      const zh = m[1].trim();
      let sci = m[2].trim();
      if (zh.length < 2 || zh.length > 10) continue;
      // 修正常見學名 typo
      sci = sci.replace(/^Steptopelia/, 'Streptopelia');
      sciToZh.set(sci.toLowerCase(), zh);
    }
    // 額外建立「種小名 → zh」表，用於屬名不同但種小名相同的情況
    const speciesEpithetToZh = new Map();
    for (const [sci, zh] of sciToZh.entries()) {
      const parts = sci.split(/\s+/);
      if (parts.length >= 2) {
        const epithet = parts[parts.length - 1];
        if (!speciesEpithetToZh.has(epithet)) speciesEpithetToZh.set(epithet, zh);
      }
    }
    sciToZh._speciesEpithetToZh = speciesEpithetToZh;
    console.log(`   → 找到 ${sciToZh.size} 個中文名對照 (含 ${speciesEpithetToZh.size} 個種小名映射)`);
    return sciToZh;
  } catch (e) {
    console.warn(`   ⚠️ 中文 Wikipedia 抓取失敗：${e.message}`);
    return new Map();
  }
}

// ────────────────────────────────────────────────────────────
// 3. 內建中英常用對照（部分常見鳥種，可逐步擴充）
// ────────────────────────────────────────────────────────────
const BUILTIN_CN = new Map(Object.entries({
  'Spotted Dove': '珠頸斑鳩',
  'Black Kite': '黑鳶',
  'Rock Pigeon': '原鴿',
  'Rock Dove': '原鴿',
  'Yellow-crested Cockatoo': '小葵花鳳頭鸚鵡',
  'Asian Koel': '噪鵑',
  'Red-whiskered Bulbul': '紅耳鵯',
  'Light-vented Bulbul': '白頭鵯',
  'Chinese Bulbul': '白頭鵯',
  'Oriental Magpie-Robin': '鵲鴝',
  'Masked Laughingthrush': '黑臉噪眉',
  'White-rumped Munia': '白腰文鳥',
  'Eurasian Tree Sparrow': '麻雀',
  'Tree Sparrow': '麻雀',
  'Black-collared Starling': '黑領椋鳥',
  'Crested Myna': '八哥',
  'Oriental Magpie': '喜鵲',
  'Eurasian Magpie': '喜鵲',
  'Red-billed Blue Magpie': '紅嘴藍鵲',
  'Great Tit': '大山雀',
  'Cinereous Tit': '大山雀',
  'Japanese White-eye': '暗綠繡眼鳥',
  "Swinhoe's White-eye": '暗綠繡眼鳥',
  'Chinese Hwamei': '畫眉',
  'Hwamei': '畫眉',
  'Fork-tailed Sunbird': '叉尾太陽鳥',
  'Common Tailorbird': '長尾縫葉鶯',
  'Alexandrine Parakeet': '亞歷山大鸚鵡',
  // ─── 補充常見香港鳥種 ───
  'Little Egret': '小白鷺',
  'Great Egret': '大白鷺',
  'Cattle Egret': '牛背鷺',
  'Chinese Pond-Heron': '池鷺',
  'Chinese Pond Heron': '池鷺',
  'Grey Heron': '蒼鷺',
  'Black-crowned Night-Heron': '夜鷺',
  'Black-crowned Night Heron': '夜鷺',
  'Eastern Cattle Egret': '牛背鷺',
  'Common Kingfisher': '普通翠鳥',
  'White-throated Kingfisher': '白胸翡翠',
  'Black-capped Kingfisher': '藍翡翠',
  'Pied Kingfisher': '斑魚狗',
  'Common Sandpiper': '磯鷸',
  'Little Ringed Plover': '金眶鴴',
  'Eurasian Coot': '白骨頂',
  'Common Moorhen': '黑水雞',
  'White-breasted Waterhen': '白胸苦惡鳥',
  'Black-winged Stilt': '黑翅長腳鷸',
  'Pied Avocet': '反嘴鷸',
  'Eurasian Hoopoe': '戴勝',
  'Common Hoopoe': '戴勝',
  'Crested Goshawk': '鳳頭鷹',
  'Common Buzzard': '普通鵟',
  'Eastern Buzzard': '普通鵟',
  'Peregrine Falcon': '遊隼',
  'Common Kestrel': '紅隼',
  'Eurasian Sparrowhawk': '雀鷹',
  'Besra': '松雀鷹',
  'White-bellied Sea-Eagle': '白腹海鵰',
  'Osprey': '魚鷹',
  'Western Osprey': '魚鷹',
  'Greater Coucal': '褐翅鴉鵑',
  'Lesser Coucal': '小鴉鵑',
  'Plaintive Cuckoo': '八聲杜鵑',
  'Asian Emerald Cuckoo': '翠金鵑',
  'House Swift': '小白腰雨燕',
  'Pacific Swift': '白腰雨燕',
  'Barn Swallow': '家燕',
  'Red-rumped Swallow': '金腰燕',
  'Pacific Swallow': '洋燕',
  'Asian House Martin': '煙腹毛腳燕',
  'Common Myna': '家八哥',
  'White-shouldered Starling': '灰背椋鳥',
  'Silky Starling': '絲光椋鳥',
  'Red-billed Starling': '絲光椋鳥',
  'Black-faced Spoonbill': '黑臉琵鷺',
  'Eurasian Spoonbill': '白琵鷺',
  'Common Greenshank': '青腳鷸',
  'Common Redshank': '紅腳鷸',
  'Whimbrel': '中杓鷸',
  'Eurasian Curlew': '白腰杓鷸',
  'Black-faced Bunting': '灰頭鵐',
  'Yellow-breasted Bunting': '黃胸鵐',
  'Crested Serpent-Eagle': '蛇鵰',
  'Crested Serpent Eagle': '蛇鵰',
  'Mountain Bulbul': '綠翅短腳鵯',
  'Chestnut Bulbul': '栗背短腳鵯',
  'Greater Necklaced Laughingthrush': '大噪眉',
  'Greater Necklaced Laughingthrush ': '大噪眉',
  'Lesser Necklaced Laughingthrush': '小黑領噪眉',
  'Velvet-fronted Nuthatch': '絨額鳾',
  'Pin-tailed Whydah': '針尾維達鳥',
  'Scaly-breasted Munia': '斑文鳥',
  'Tricolored Munia': '栗腹文鳥',
  'Japanese Tit': '遠東山雀',
  'Yellow-cheeked Tit': '黃頰山雀',
  'Black-throated Tit': '紅頭長尾山雀',
  'Black-throated Bushtit': '紅頭長尾山雀',
  'White-rumped Shama': '白腰鵲鴝',
  'Daurian Redstart': '北紅尾鴝',
  'Blue Rock-Thrush': '藍磯鶇',
  'Blue Rock Thrush': '藍磯鶇',
  'Pale Thrush': '白腹鶇',
  'Eyebrowed Thrush': '白眉鶇',
  'Yellow-browed Warbler': '黃眉柳鶯',
  'Pallas\'s Leaf Warbler': '黃腰柳鶯',
  'Arctic Warbler': '極北柳鶯',
  'Olive-backed Pipit': '樹鷚',
  'Richard\'s Pipit': '理氏鷚',
  'Grey Wagtail': '灰鶺鴒',
  'White Wagtail': '白鶺鴒',
  'Yellow Wagtail': '黃鶺鴒',
  'Eastern Yellow Wagtail': '黃鶺鴒',
  'Citrine Wagtail': '黃頭鶺鴒',
  'Black Drongo': '黑卷尾',
  'Hair-crested Drongo': '髮冠卷尾',
  'Ashy Drongo': '灰卷尾',
  'Bronzed Drongo': '古銅色卷尾',
  'Spangled Drongo': '輝卷尾',
  'Greater Racket-tailed Drongo': '大盤尾',
  'Common Iora': '黑翅雀鵯',
  'Black-naped Oriole': '黑枕黃鸝',
  'Long-tailed Shrike': '棕背伯勞',
  'Brown Shrike': '紅尾伯勞',
  'Tiger Shrike': '虎紋伯勞',
  'Red-throated Pipit': '紅喉鷚',
  'Yellow-bellied Prinia': '黃腹鷦鶯',
  'Plain Prinia': '純色鷦鶯',
  'Striated Prinia': '山鷦鶯',
  'Zitting Cisticola': '棕扇尾鶯',
  'Oriental White-eye': '暗綠繡眼鳥',
  'Indian White-eye': '暗綠繡眼鳥',
  'Japanese Bush-Warbler': '日本樹鶯',
  'Japanese Bush Warbler': '日本樹鶯',
  'Manchurian Bush-Warbler': '遠東樹鶯',
  'Mugimaki Flycatcher': '鴝姬鶲',
  'Verditer Flycatcher': '銅藍鶲',
  'Asian Brown Flycatcher': '北灰鶲',
  'Grey-streaked Flycatcher': '灰紋鶲',
  'Japanese Paradise-Flycatcher': '紫綬帶',
  'Amur Paradise-Flycatcher': '壽帶',
  'Eurasian Hobby': '燕隼',
  'Spotted Redshank': '鶴鷸',
  'Marsh Sandpiper': '澤鷸',
  'Wood Sandpiper': '林鷸',
  'Green Sandpiper': '白腰草鷸',
  'Terek Sandpiper': '翹嘴鷸',
  'Curlew Sandpiper': '彎嘴濱鷸',
  'Red-necked Stint': '紅頸濱鷸',
  'Long-toed Stint': '長趾濱鷸',
  'Temminck\'s Stint': '青腳濱鷸',
  'Dunlin': '黑腹濱鷸',
  'Sanderling': '三趾濱鷸',
  'Ruddy Turnstone': '翻石鷸',
  'Bar-tailed Godwit': '斑尾塍鷸',
  'Black-tailed Godwit': '黑尾塍鷸',
  'Mongolian Plover': '蒙古沙鴴',
  'Lesser Sand-Plover': '蒙古沙鴴',
  'Greater Sand-Plover': '鐵嘴沙鴴',
  'Kentish Plover': '環頸鴴',
  'Pacific Golden-Plover': '太平洋金斑鴴',
  'Pacific Golden Plover': '太平洋金斑鴴',
  'Grey Plover': '灰斑鴴',
  'Black-headed Gull': '紅嘴鷗',
  'Caspian Tern': '裏海燕鷗',
  'Whiskered Tern': '鬚浮鷗',
  'Common Tern': '普通燕鷗',
  'Gull-billed Tern': '鷗嘴噪鷗',
  'Little Tern': '白額燕鷗',
  'Brown-headed Gull': '棕頭鷗',
  'Saunders\'s Gull': '黑嘴鷗',
  'Pacific Reef-Heron': '岩鷺',
  'Pacific Reef Heron': '岩鷺',
  'Striated Heron': '綠鷺',
  'Yellow Bittern': '黃葦鳽',
  'Cinnamon Bittern': '栗葦鳽',
  'Schrenck\'s Bittern': '紫背葦鳽',
  'Great Cormorant': '普通鸕鶿',
  'Little Cormorant': '黑頸鸕鶿',
  'Garganey': '白眉鴨',
  'Northern Pintail': '針尾鴨',
  'Northern Shoveler': '琵嘴鴨',
  'Eurasian Wigeon': '赤頸鴨',
  'Common Teal': '綠翅鴨',
  'Eurasian Teal': '綠翅鴨',
  'Mallard': '綠頭鴨',
  'Spot-billed Duck': '斑嘴鴨',
  'Eastern Spot-billed Duck': '斑嘴鴨',
  'Tufted Duck': '鳳頭潛鴨',
  'Common Pochard': '紅頭潛鴨',
  'Ferruginous Duck': '白眼潛鴨',
}));

// ────────────────────────────────────────────────────────────
// 4. 主流程
// ────────────────────────────────────────────────────────────
async function main() {
  // 讀取現有資料
  let existing = [];
  if (fs.existsSync(BIRDS_JSON)) {
    existing = JSON.parse(fs.readFileSync(BIRDS_JSON, 'utf-8'));
    console.log(`📂 現有 birds.json 有 ${existing.length} 筆`);
  }

  const hkList = await fetchHKBirdList();
  const sciToZh = await fetchZhWikipediaChinese();

  console.log('🛠️  [3/3] 合併資料並產生輸出...');

  // 對既有的 id 建索引（中文名 → id）
  const cnToId = new Map(existing.map((b) => [b.name, b.id]));

  // 決定起始 ID
  const startId = START_ID ?? (existing.length > 0
    ? Math.max(...existing.map((b) => parseInt(b.id, 10))) + 1
    : 1);

  console.log(`   → 起始 ID：${String(startId).padStart(4, '0')}`);

  // 合併輸出
  const finalBirds = [...existing];
  const aliases = [];

  for (const { commonName, scientificName } of hkList) {
    // 嘗試找中文名：先看內建字典，再看 zh.wikipedia 學名對照
    // 多層 fallback：
    //  1) 內建英文常用名 → 中文
    //  2) 完整學名 → 中文
    //  3) 種小名 → 中文（屬名變動時的容錯）
    const sciLower = scientificName.toLowerCase();
    const epithet = sciLower.split(/\s+/).pop();
    const cn =
      BUILTIN_CN.get(commonName) ||
      sciToZh.get(sciLower) ||
      (sciToZh._speciesEpithetToZh && sciToZh._speciesEpithetToZh.get(epithet)) ||
      null;

    // 判斷是否已存在（用中文名）
    let id = cn && cnToId.has(cn) ? cnToId.get(cn) : null;

    if (!id) {
      // 新增一筆
      const nextNum = finalBirds.length + 1;
      id = String(nextNum).padStart(4, '0');
      finalBirds.push({
        id,
        name: cn || commonName, // 沒中文時暫用英文，等使用者補
      });
      if (cn) cnToId.set(cn, id);
    }

    aliases.push({
      id,
      commonName,
      scientificName,
      chineseName: cn,
    });
  }

  // ─── 產生 nameAliases.ts ───
  const aliasLines = [];
  aliasLines.push(`// ============================================================`);
  aliasLines.push(`// 英文/學名/中文 → 圖鑑 ID 對照表`);
  aliasLines.push(`// 由 scripts/build-aliases.mjs 自動生成於 ${new Date().toISOString()}`);
  aliasLines.push(`// 共 ${aliases.length} 個物種，${finalBirds.length} 個圖鑑 ID`);
  aliasLines.push(`// `);
  aliasLines.push(`// ⚠️ 請勿手動修改本檔，要新增請編輯 src/data/birds.json 後重跑：`);
  aliasLines.push(`//    node scripts/build-aliases.mjs`);
  aliasLines.push(`// ============================================================`);
  aliasLines.push(``);
  aliasLines.push(`export const NAME_TO_ID: Record<string, string> = {`);

  const usedKeys = new Set();
  for (const a of aliases) {
    const keys = [
      a.commonName.toLowerCase(),
      a.scientificName.toLowerCase(),
    ];
    if (a.chineseName) {
      keys.push(a.chineseName);
      // 簡體變繁體（簡單對應）
      const simpleMap = { '鵯': '鹎', '鳩': '鸠', '鸚': '鹦', '鵡': '鹉', '鴉': '鸦',
        '鸛': '鹳', '鴿': '鸽', '鵲': '鹊', '鶺': '鹡', '鴒': '鸰', '鶲': '鹟',
        '鵐': '鹀', '鶇': '鸫', '鵪': '鹌', '鶉': '鹑', '鶴': '鹤', '鷺': '鹭',
        '鷸': '鹬', '鴴': '鸻', '鷗': '鸥', '鷹': '鹰', '鳶': '鸢', '鴯': '鹋',
        '鷂': '鹞', '鷲': '鹫', '鵰': '雕', '鵟': '鵟', '鸊': '䴙', '鷿': '䴘',
        '鳾': '䴓', '鶸': '鹩', '鵑': '鹃', '鶯': '莺', '鴣': '鸪', '鵝': '鹅',
        '鵚': '秃', '鴗': '䴗', '鴞': '鸮', '鶻': '鹘', '鴨': '鸭', '鳥': '鸟' };
      let sim = a.chineseName;
      for (const [t, s] of Object.entries(simpleMap)) sim = sim.replaceAll(t, s);
      if (sim !== a.chineseName) keys.push(sim);
    }
    for (const k of keys) {
      const dedup = `${k}|${a.id}`;
      if (usedKeys.has(dedup)) continue;
      usedKeys.add(dedup);
      aliasLines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(a.id)},`);
    }
  }
  aliasLines.push(`};`);
  aliasLines.push(``);
  aliasLines.push(`/**`);
  aliasLines.push(` * 把 BirdNET / Nyckel 回傳的鳥名轉成圖鑑 ID。`);
  aliasLines.push(` */`);
  aliasLines.push(`export function resolveBirdId(label: string): string | null {`);
  aliasLines.push(`  if (!label) return null;`);
  aliasLines.push(`  const key = label.trim().toLowerCase();`);
  aliasLines.push(`  if (NAME_TO_ID[key]) return NAME_TO_ID[key];`);
  aliasLines.push(`  if (key.includes('_')) {`);
  aliasLines.push(`    const [common, sci] = key.split('_').map((s) => s.trim());`);
  aliasLines.push(`    if (NAME_TO_ID[common]) return NAME_TO_ID[common];`);
  aliasLines.push(`    if (NAME_TO_ID[sci]) return NAME_TO_ID[sci];`);
  aliasLines.push(`  }`);
  aliasLines.push(`  for (const [aliasKey, id] of Object.entries(NAME_TO_ID)) {`);
  aliasLines.push(`    if (key.includes(aliasKey) || aliasKey.includes(key)) return id;`);
  aliasLines.push(`  }`);
  aliasLines.push(`  return null;`);
  aliasLines.push(`}`);

  const aliasContent = aliasLines.join('\n');

  // ─── 輸出 ───
  if (DRY) {
    console.log('\n────── birds.json (前 30 筆) ──────');
    console.log(JSON.stringify(finalBirds.slice(0, 30), null, 2));
    console.log(`\n... 共 ${finalBirds.length} 筆`);
    console.log('\n────── nameAliases.ts (前 50 行) ──────');
    console.log(aliasContent.split('\n').slice(0, 50).join('\n'));
    console.log(`\n... 共 ${aliasContent.split('\n').length} 行`);
    return;
  }

  // 備份
  if (fs.existsSync(BIRDS_JSON)) {
    fs.copyFileSync(BIRDS_JSON, BIRDS_JSON + '.bak');
    console.log(`💾 備份舊版 birds.json → ${path.basename(BIRDS_JSON)}.bak`);
  }
  if (fs.existsSync(ALIASES_TS)) {
    fs.copyFileSync(ALIASES_TS, ALIASES_TS + '.bak');
    console.log(`💾 備份舊版 nameAliases.ts → ${path.basename(ALIASES_TS)}.bak`);
  }

  fs.writeFileSync(BIRDS_JSON, JSON.stringify(finalBirds, null, 2) + '\n');
  fs.writeFileSync(ALIASES_TS, aliasContent);

  console.log(`\n✅ 完成！`);
  console.log(`   ▸ birds.json：${finalBirds.length} 筆`);
  console.log(`   ▸ nameAliases.ts：${usedKeys.size} 個 alias`);
  const noCn = aliases.filter((a) => !a.chineseName).length;
  if (noCn > 0) {
    console.log(`\n⚠️  有 ${noCn} 隻鳥還沒有中文名（暫用英文俗名）`);
    console.log(`   你可以手動編輯 birds.json 把它們改成你想要的中文。`);
  }
}

main().catch((e) => {
  console.error('❌ 錯誤：', e);
  process.exit(1);
});
