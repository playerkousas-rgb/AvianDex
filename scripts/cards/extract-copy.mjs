#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 由中文維基原文「抽取」卡面文案（不生成、不推測）
 * ============================================================
 *  原則：卡上每一句話都必須係維基原文的完整句子。
 *        抽唔到就留空 → 卡上印「資料待查」。
 *        寧願空白，都不可以為湊字數而改寫。
 *
 *  為什麼要這樣做：
 *    用戶明確表示「沒有核對資料的能力」。所以本工具不做「AI 寫稿」，
 *    只做「原文抽取 + 標明出處」，任何一句都可以按 pageid 回去核對。
 *
 *  v2 改動（重要）：
 *    · 改讀 action=parse&prop=wikitext（整頁 wikitext），不再只讀首段 HTML。
 *      原因：實測 0291 赤翡翠／0294 白領翡翠等條目，食性／外形／棲地全部在
 *      正文同名章節，只讀首段會抽到 2/6 欄，白白留空。
 *    · 逐章節評分：食性→「食物與覓食／食性」章、分佈→「分佈」章、
 *      外形→「描述／形態」章、棲地→「棲息地」章；抽唔到才退回全文。
 *    · 自動核對：學名必須在 wikitext 出現（{{Speciesbox}}），否則不採用該頁。
 *    · 自動標記：{{Rough translation}}／{{Citation needed}}／[來源請求]、
 *      infobox 與引用互相矛盾（例如 status=VU 但引用寫「無危」）→ 寫入 notes。
 *    · 簡體→香港繁體只做字形轉換（opencc-js），不改詞、不改句。
 *
 *  用法：
 *    node scripts/cards/extract-copy.mjs --ids 0289,0290
 *    node scripts/cards/extract-copy.mjs --from 22 --to 41
 *    node scripts/cards/extract-copy.mjs --all --missing-only --delay 600
 *
 *  輸出：
 *    src/data/cardCopy.json        只寫入有新內容的卡，並保留你手寫過的欄位
 *    reports/copy-extract.md       每張卡抽到幾個欄位、缺哪幾個、來源 pageid
 *    .cache/wiki/                  原始 wikitext 快取（重跑不會再打維基）
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BIRDS = path.join(ROOT, 'src/data/birds.json');
const TAXONOMY = path.join(ROOT, 'src/data/birdTaxonomy.json');
const COPY = path.join(ROOT, 'src/data/cardCopy.json');
const REPORT = path.join(ROOT, 'reports/copy-extract.md');
const CACHE = path.join(ROOT, '.cache/wiki');
const UA = 'AvianDex-CopyExtractor/2.0 (educational; contact: ai@skwscout.org.hk)';

const s2hk = OpenCC.Converter({ from: 'cn', to: 'hk' });

const ARGS = process.argv.slice(2);
const arg = (n, d) => {
  const i = ARGS.indexOf(n);
  return i >= 0 ? ARGS[i + 1] : d;
};
const flag = (n) => ARGS.includes(n);
const DELAY = Number(arg('--delay', 600));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------
 * 一、wikitext → 純文字（純函數，可離線測試）
 * ------------------------------------------------------------------ */

/** 去掉最內層的 {{...}}，反覆執行直到沒有可去的（處理嵌套模板） */
function dropTemplates(wt = '') {
  let s = wt;
  for (let i = 0; i < 40; i += 1) {
    const next = s.replace(/\{\{[^{}]*\}\}/g, ' ');
    if (next === s) break;
    s = next;
  }
  return s;
}

/** wikitext → 可讀純文字：保留句子內容，丟掉模板／註腳／表格／檔案 */
export function stripWiki(wt = '') {
  let s = wt;
  s = s.replace(/<!--[\s\S]*?-->/g, ' '); // 註解
  s = s.replace(/<ref[^>]*\/>/gi, ' '); // 空 ref
  s = s.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, ' '); // ref 內容
  s = s.replace(/<ref[^>]*>[\s\S]*$/gi, ' '); // 未閉合 ref（吃掉尾段，安全）
  s = dropTemplates(s); // 模板（含 infobox／taxobox／noteTA／citation needed）
  s = s.replace(/\{\|[\s\S]*?\|\}/g, ' '); // 表格
  // 檔案／圖片語法（可能嵌套 [[...]]）→ 整行刪掉，避免留下 ]] 殘骸
  s = s.split('\n').filter((ln) => !/^\s*\[\[(?:File|Image|文件|檔案|图像|圖像):/i.test(ln)).join('\n');
  s = s.replace(/\[\[(?:File|Image|文件|檔案|图像|圖像):[\s\S]*?\]\]/gi, ' ');
  s = s.replace(/^={2,}.*?={2,}\s*$/gm, ' '); // 章節標題列（唔要「==分布与栖息地==」入句）
  s = s.replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1'); // [[A|B]] → B
  s = s.replace(/\[\[([^\]]*)\]\]/g, '$1'); // [[A]] → A
  s = s.replace(/\[(?:https?:)?\/\/\S+\s+([^\]]*)\]/g, '$1'); // 外部連結
  s = s.replace(/'''''|'''|''/g, ''); // 粗斜體
  // -{zh-cn:A;zh-tw:B;zh-hk:C;}- 這種標題轉換語法：優先取 zh-hk，其次 zh-tw，否則第一項
  s = s.replace(/-\{([^{}]*)\}-/g, (_m, inner) => {
    const parts = inner
      .split(';')
      .map((x) => x.split(':'))
      .filter((kv) => kv.length === 2 && /^[a-z]{2}(-[a-z]{2,4})?$/i.test(kv[0].trim()));
    if (!parts.length) return inner;
    const pick = parts.find((kv) => /zh-(hk|tw|hant)/i.test(kv[0])) || parts[0];
    return pick[1].trim();
  });
  s = s.replace(/<[^>]+>/g, ' '); // 其餘 HTML
  for (let i = 0; i < 3; i += 1) {
    s = s.replace(/[（(]\s*[)）]/g, ''); // 模板移除後的空括號
    s = s.replace(/[（(][^（）()]{0,8}[:：]\s*[)）]/g, ''); // 「（學名： ）」
  }
  s = s.replace(/&nbsp;/g, ' ');
  s = s.replace(/[ \t\u3000]+/g, ' ').replace(/\s+([，。、；：])/g, '$1');
  s = s.replace(/\n{2,}/g, '\n');
  return s.trim();
}

/** 由整頁 wikitext 切出章節：{ 章節標題(原文) : 內文 } */
export function splitSections(wt = '') {
  const out = [];
  // 只處理 == 到 == 的標題（不動 = 的頂層標題，通常只有「參考文獻」等）
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

/** 切句：只按句號／分號／問嘆號切，保留句尾標點（原文完整句） */
export function sentences(text = '') {
  return stripWiki(text)
    .replace(/\n+/g, '')
    .split(/(?<=[。！？；])/)
    .map((s) => s.trim())
    // 只收「以句號／分號／問嘆號結尾」的完整句：殘句（維基最後一句冇標點）一律唔要
    .filter((s) => s.length >= 8 && /[。！？；]$/.test(s));
}

const anyOf = (s, words) => words.some((w) => s.includes(w));

/** 章節標題 → 欄位（用標題關鍵詞判斷，唔靠猜內文） */
const SECTION_MATCH = {
  diet: ['食物', '食性', '覓食', '飲食', '捕食'],
  range: ['分佈', '分布', '範圍', '遷徙', '地理'],
  look: ['描述', '形態', '外形', '特徵'],
  habitat: ['棲息', '生境', ' habitat'],
  funFact: ['命名', '名稱', '文化', '行為', '生態'],
};

/** 句子評分規則：must 必須命中，any 命中加分 */
const RULES = {
  diet: {
    must: ['食', '捕食', '獵物', '覓食', '獵食'],
    any: ['昆蟲', '魚', '蛙', '蟹', '蝦', '果', '種子', '螺', '蠕蟲', '幼蟲', '蜥', '鼠', '鳥蛋', '花蜜', '漿果', '甲殼'],
    weight: 6,
  },
  range: {
    must: ['分布', '分佈', '見於', '產於', '繁殖於', '越冬', '範圍'],
    any: ['中國', '香港', '台灣', '亞洲', '東南亞', '印度', '歐洲', '非洲', '美洲', '澳洲', '廣東', '華南', '日本', '韓國', '非洲'],
    weight: 7,
  },
  habitat: {
    must: ['棲息', '生境', '生活於', '出沒', '偏好', '常見於'],
    any: ['森林', '濕地', '溪流', '河', '湖', '池塘', '沼澤', '草地', '農田', '紅樹林', '海岸', '山地', '灌木', '公園', '林緣', '水庫', '林地'],
    weight: 6,
  },
  look: {
    must: ['羽', '體長', '喙', '嘴', '翼', '尾', '頭', '背', '腹', '腳'],
    any: ['色', '斑', '紋', '冠', '眉', '喉', '胸', '淺', '深', '黑', '白', '褐', '灰', '紅', '黃', '藍', '綠', '橙'],
    weight: 6,
  },
  funFact: {
    must: ['俗稱', '又名', '唯一', '最小', '最大', '首次', '發現', '命名', '僅', '只分布', '只分佈', '來自'],
    any: [],
    weight: 5,
  },
};

/**
 * 在「首選章節 + 全文」中挑一句最貼題的原句。
 * 只回傳原文完整句（不改寫）；過長則截到完整分句。
 */
export function pickSentence(list, rule, maxLen = 60) {
  let best = '';
  let bestScore = 0;
  for (const s of list) {
    if (!anyOf(s, rule.must)) continue;
    let score = rule.weight;
    for (const w of rule.any) if (s.includes(w)) score += 2;
    if (s.length > 120) score -= 6; // 長句截短後容易只剩殘句，降低優先度
    if (s.length < 16) score -= 1;
    if (s.length > 90 && trimToLength(s, maxLen).length < 24) score -= 8; // 截完太短 → 不可用
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  if (!best) return '';
  return trimToLength(best, maxLen);
}

/** 截短但不改寫：只取前面的完整分句，最多 maxLen 個字。 */
export function trimToLength(s, maxLen) {
  const chars = [...s];
  if (chars.length <= maxLen) return s;
  const head = chars.slice(0, maxLen).join('');
  const cut = Math.max(head.lastIndexOf('，'), head.lastIndexOf('、'), head.lastIndexOf('；'));
  if (cut >= 12) return `${head.slice(0, cut)}。`;
  if (s.slice(0, maxLen).includes('。')) return s.slice(0, s.indexOf('。') + 1);
  return ''; // 截唔到完整分句 → 寧願留空，都唔切一半
}

/** 特徵標註片段：只保留原文子句（去掉句末標點與殘句尾巴），不改字 */
const TRAIT_WORDS = [
  '黑', '白', '褐', '灰', '紅', '黃', '藍', '綠', '橙', '紫', '棕', '栗', '粉',
  '長', '短', '寬', '窄', '粗', '細', '大', '小', '深', '淺', '鮮', '暗',
];

/**
 * 由原句取出「包含該部位詞的整個子句」作為標註（不改字、不補字）：
 *   例：「黑色的頭部，與白色的喉部、紫藍色的翅膀」+「喉」→「白色的喉部」
 */
function subclauseAt(sentence, word) {
  const segs = String(sentence || '').split(/[，、；。]/);
  const seg = segs.find((x) => x.includes(word));
  if (!seg) return '';
  const t = seg.trim();
  if ([...t].length < 3 || [...t].length > 12) return '';
  if (!TRAIT_WORDS.some((w) => t.includes(w))) return ''; // 冇顏色／性狀 → 唔夠具體，棄用
  return t;
}

/** 由「外形」句抽 1–3 個特徵標註（取原文片段，不改寫） */
export function pickCallouts(lookSentence, allSentences) {
  const marks = [];
  const BODY = [
    ['喙 BILL', ['喙', '嘴']],
    ['頭 HEAD', ['頭', '冠', '眉']],
    ['背 BACK', ['背', '翼', '肩']],
    ['身 BODY', ['腹', '胸', '身']],
    ['尾 TAIL', ['尾']],
    ['腳 FEET', ['腳', '趾', '爪']],
  ];
  const pool = [lookSentence, ...allSentences].filter(Boolean);
  for (const [label, words] of BODY) {
    for (const s of pool) {
      const idx = words
        .map((w) => s.indexOf(w))
        .filter((i) => i >= 0)
        .sort((a, b) => a - b)[0];
      if (idx === undefined) continue;
      const frag = subclauseAt(s, words.find((w) => s.includes(w)));
      if (frag && !marks.some((m) => m.text === frag)) {
        marks.push({ label, text: frag });
        break;
      }
    }
    if (marks.length >= 3) break;
  }
  return marks;
}

/* ------------------------------------------------------------------
 * 二、IUCN：由 infobox 抽，並自動偵測「infobox 與引用矛盾」
 * ------------------------------------------------------------------ */

const IUCN_LABEL = {
  LC: '無危 LC',
  NT: '近危 NT',
  VU: '易危 VU',
  EN: '瀕危 EN',
  CR: '極危 CR',
  EW: '野外滅絕 EW',
  EX: '滅絕 EX',
  DD: '數據缺乏 DD',
  NE: '未評估 NE',
};

/**
 * 回 { iucn, note }：
 *   · 正常 → { iucn: '無危 LC', note: '' }
 *   · 矛盾（infobox 寫一個級別，引用卻寫另一個）→ { iucn: '', note: '…' }
 *   · 無資料 → { iucn: '', note: '' }
 */
export function detectIucn(wt = '') {
  const status = (wt.match(/\|\s*status\s*=\s*([A-Z]{2})\b/) || [])[1] || '';
  const refBlock = (wt.match(/\|\s*status_ref\s*=([^\n]*)/) || [])[1] || '';
  const others = Object.entries(IUCN_LABEL).filter(([, zh]) => refBlock.includes(zh.split(' ')[0]));
  const conflict = status && others.length && !others.some(([code]) => code === status);
  if (conflict) {
    return {
      iucn: '',
      note: `⚠️ IUCN 未填：infobox 寫「${IUCN_LABEL[status]?.split(' ')[0] || status}」，但同頁引用寫「${others[0][1].split(' ')[0]}」，條目自身矛盾，兩個都不採用（需人工查 IUCN 紅色名錄）。`,
    };
  }
  return { iucn: IUCN_LABEL[status] || '', note: '' };
}

/* ------------------------------------------------------------------
 * 三、網路（沙盒／代理憑證問題的後備；不會靜默停用驗證）
 * ------------------------------------------------------------------ */

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (!/CERT|UNABLE_TO_VERIFY|self.signed|fetch failed/i.test(String(err?.cause?.code || err?.message)))
      throw err;
    return await new Promise((resolve, reject) => {
      https
        .get(
          url,
          { headers: { 'User-Agent': UA }, ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt') },
          (res) => {
            const c = [];
            res.on('data', (d) => c.push(d));
            res.on('end', () => {
              try {
                resolve(JSON.parse(Buffer.concat(c).toString('utf8')));
              } catch (e) {
                reject(e);
              }
            });
          },
        )
        .on('error', reject);
    });
  }
}

function cachePath(kind, name) {
  fs.mkdirSync(CACHE, { recursive: true });
  return path.join(CACHE, `${kind}-${name.replace(/[^\w\u4e00-\u9fa5.-]/g, '_').slice(0, 80)}.json`);
}

async function cachedJson(url, kind, name, noCache) {
  const file = cachePath(kind, name);
  if (!noCache && fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      /* 壞快取，重抓 */
    }
  }
  const json = await fetchJson(url);
  fs.writeFileSync(file, JSON.stringify(json));
  await sleep(DELAY);
  return json;
}

/* ------------------------------------------------------------------
 * 四、主流程
 * ------------------------------------------------------------------ */

/** 用學名搜條目，並核對該頁 wikitext 真的含此學名（避免抽錯相近物種） */
async function resolvePage(sciName, noCache) {
  const q = encodeURIComponent(`"${sciName}"`);
  const search = await cachedJson(
    `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&srlimit=5&format=json&formatversion=2`,
    'search',
    sciName,
    noCache,
  );
  const hits = search?.query?.search || [];
  for (const hit of hits) {
    const parse = await cachedJson(
      'https://zh.wikipedia.org/w/api.php?action=parse' +
        `&page=${encodeURIComponent(hit.title)}&prop=wikitext&variant=zh-hk&redirects=1&format=json&formatversion=2`,
      'wt',
      hit.title,
      noCache,
    );
    const wt = parse?.parse?.wikitext;
    if (!wt) continue;
    if (!wt.toLowerCase().includes(sciName.toLowerCase())) continue; // 學名對不上 → 跳過
    return { title: parse.parse.title, pageid: parse.parse.pageid, wt };
  }
  return null;
}

/** 由整頁 wikitext 抽六個欄位（純函數，可離線測試） */
export function extractCopy(wt, { sciName = '' } = {}) {
  const sections = splitSections(wt);
  const all = sentences(wt);
  const picked = {};
  const where = {};
  const notes = [];

  for (const [key, rule] of Object.entries(RULES)) {
    const keys = SECTION_MATCH[key] || [];
    const focused = sections
      .filter((s) => anyOf(s.title, keys))
      .flatMap((s) => sentences(s.body));
    let val = focused.length ? pickSentence(focused, rule) : '';
    let from = focused.length ? '章節' : '';
    if (!val) {
      val = pickSentence(all, rule);
      from = val ? '全文' : '';
    }
    if (val) {
      picked[key] = val;
      where[key] = from;
    }
  }

  if (picked.look) {
    const marks = pickCallouts(picked.look, sentences(wt));
    if (marks.length >= 2) picked.callouts = marks;
  }

  const { iucn, note: iucnNote } = detectIucn(wt);
  if (iucn) picked.iucn = iucn;
  if (iucnNote) notes.push(iucnNote);

  if (/\{\{\s*(Rough translation| rough translation|RoughTranslation)/i.test(wt)) {
    notes.push('⚠️ 維基條目掛有「翻譯品質不佳」標記；以下內容為原文照錄，字句未改。');
  }
  const srcReq = /\{\{\s*(Citation needed|citation needed|Fact|來源請求)/i.test(wt) || wt.includes('[來源請求]');
  if (srcReq) {
    const hitField = ['diet', 'range', 'look', 'habitat', 'funFact'].filter((k) => picked[k]);
    notes.push(
      `⚠️ 條目含「來源請求」標記（未經引註內容），受影響欄位：${hitField.join('、') || '未確定'}；已在卡面照錄，待日後以正式名錄覆核。`,
    );
  }

  // 簡體 → 香港繁體（只做字形轉換）
  const out = {};
  for (const [k, v] of Object.entries(picked)) {
    out[k] = k === 'callouts' ? v.map((m) => ({ label: s2hk(m.label), text: s2hk(m.text) })) : s2hk(v);
  }
  out.notes = notes.join(' ');
  out._where = where; // 內部用，寫入前會刪
  return out;
}

async function main() {
  const birds = JSON.parse(fs.readFileSync(BIRDS, 'utf8'));
  const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY, 'utf8'));
  const copyAll = fs.existsSync(COPY) ? JSON.parse(fs.readFileSync(COPY, 'utf8')) : { _readme: {} };

  let targets = birds.filter((b) => taxonomy[b.id]);
  const ids = arg('--ids');
  if (ids) {
    const set = new Set(ids.split(',').map((s) => s.trim().padStart(4, '0')));
    targets = targets.filter((b) => set.has(b.id));
  } else {
    const from = Number(arg('--from', 0));
    const to = Number(arg('--to', 9999));
    targets = targets.filter((b) => Number(b.id) >= from && Number(b.id) <= to);
  }
  if (flag('--missing-only')) {
    targets = targets.filter((b) => {
      const c = copyAll[b.id];
      return !c || !['diet', 'range', 'look', 'habitat'].every((k) => (c[k] || '').trim());
    });
  }
  if (flag('--limit')) targets = targets.slice(0, Number(arg('--limit', 20)));

  console.log(`📖 由中文維基原文抽取文案：${targets.length} 張卡（只抽原文，不改寫）`);

  const report = [];
  let filled = 0;

  for (const bird of targets) {
    const tax = taxonomy[bird.id];
    const existing = copyAll[bird.id] || {};
    let hit;
    try {
      hit = await resolvePage(tax.sciName, flag('--no-cache'));
    } catch (e) {
      console.log(`   ⚠️ ${bird.id} 連線失敗：${e.message}`);
      report.push({ id: bird.id, name: bird.name, status: 'network-error', note: e.message });
      continue;
    }

    if (!hit) {
      console.log(`   ❓ ${bird.id} ${bird.name} — 維基找不到學名 ${tax.sciName} 的條目`);
      report.push({ id: bird.id, name: bird.name, sci: tax.sciName, status: 'no-page' });
      continue;
    }

    const got = extractCopy(hit.wt, { sciName: tax.sciName });
    const where = got._where || {};
    delete got._where;

    // 只補「未有」的欄位：手寫內容永不覆蓋
    const out = { ...existing };
    const added = [];
    for (const k of ['diet', 'range', 'look', 'habitat', 'funFact', 'callouts', 'iucn']) {
      const v = got[k];
      if (!v) continue;
      const cur = out[k];
      const empty = k === 'callouts' ? !(Array.isArray(cur) && cur.length) : !(typeof cur === 'string' && cur.trim());
      if (empty) {
        out[k] = v;
        added.push(k);
      }
    }
    if (got.notes) out.notes = [existing.notes, got.notes].filter(Boolean).join(' ');
    const hadSource = (out.source || '').includes(String(hit.pageid));
    out.source = `zh.wikipedia ${hit.title} · pageid ${hit.pageid}（variant=zh-hk）· 分類：eBird/Clements`;
    out.orderZh = out.orderZh || tax.orderZh || '';
    out.familyZh = out.familyZh || tax.familyZh || '';

    // 只有「真的抽到內容」或者「本身已有文案」才寫入檔：
    // 避免一口氣寫入 559 個只有 source、冇內容的空殼（會令報告失真）
    const hadContent = ['diet', 'range', 'look', 'habitat', 'funFact', 'iucn']
      .some((k) => String(existing[k] || '').trim());
    const store = added.length > 0 || hadContent;
    if (store) {
      copyAll[bird.id] = out;
    }
    if (added.length || (!hadSource && store)) filled += 1;

    const missing = ['diet', 'range', 'look', 'habitat', 'funFact', 'iucn'].filter((k) => !String(out[k] || '').trim());
    console.log(
      `   ${added.length ? '✅' : '➖'} ${bird.id} ${bird.name} → ${hit.title}（補 ${added.length} 欄；缺 ${missing.length ? missing.join('/') : '無'}）`,
    );
    report.push({
      id: bird.id,
      name: bird.name,
      sci: tax.sciName,
      status: added.length ? 'filled' : store ? 'unchanged' : 'no-content',
      pageid: hit.pageid,
      title: hit.title,
      added,
      where,
      missing,
    });
  }

  fs.writeFileSync(COPY, `${JSON.stringify(copyAll, null, 2)}\n`);

  const okList = report.filter((r) => r.status === 'filled');
  const md = [
    '# 卡面文案抽取報告（原文抽取，不改寫）',
    '',
    `- 產生時間：${new Date().toISOString()}`,
    '- 原則：卡上每句話都係中文維基原文的完整句子；抽唔到就留空，卡面印「資料待查」',
    `- 處理：${report.length} 張`,
    `- ✅ 有新內容：${okList.length}`,
    `- ➖ 無新內容（已齊或原文無相關句）：${report.filter((r) => r.status === 'unchanged').length}`,
    `- ❓ 維基無對應條目：${report.filter((r) => r.status === 'no-page').length}`,
    `- ⬜ 有條目但抽唔到任何一段（條目本身太短）：${report.filter((r) => r.status === 'no-content').length}`,
    '',
    '| 編號 | 中文名 | 學名 | 條目 | pageid | 補到 | 取自 | 仍缺 |',
    '|---|---|---|---|---|---|---|---|',
    ...report
      .filter((r) => r.pageid)
      .map(
        (r) =>
          `| ${r.id} | ${r.name} | ${r.sci} | ${r.title} | ${r.pageid} | ${(r.added || []).join('、') || '—'} | ${
            Object.values(r.where || {})
              .filter(Boolean)
              .slice(0, 1)[0] || '—'
          } | ${(r.missing || []).join('、') || '無'} |`,
      ),
    '',
  ];
  const noContent = report.filter((r) => r.status === 'no-content');
  if (noContent.length) {
    md.push(
      '## ⬜ 有維基條目，但抽唔到任何一段（條目太短，需換來源）',
      '',
      '| 編號 | 中文名 | 學名 | 條目 | pageid |',
      '|---|---|---|---|---|',
    );
    noContent.forEach((r) => md.push(`| ${r.id} | ${r.name} | ${r.sci} | ${r.title} | ${r.pageid} |`));
    md.push('');
  }
  const noPage = report.filter((r) => r.status === 'no-page');
  if (noPage.length) {
    md.push('## ❓ 維基找不到條目（需另找來源：HKBWS 名錄／香港鳥類圖鑑）', '', '| 編號 | 中文名 | 學名 |', '|---|---|---|');
    noPage.forEach((r) => md.push(`| ${r.id} | ${r.name} | ${r.sci} |`));
    md.push('');
  }
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, `${md.join('\n')}\n`);

  console.log('');
  console.log(`✅ 完成：${okList.length} 張補到內容（共處理 ${report.length} 張）`);
  console.log('📄 src/data/cardCopy.json');
  console.log('📄 reports/copy-extract.md');
}

const invokedDirectly = process.argv[1] && /extract-copy\.mjs$/.test(process.argv[1]);
if (invokedDirectly) {
  main().catch((e) => {
    console.error('❌ 執行失敗：', e);
    process.exit(1);
  });
}
