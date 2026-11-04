/* ============================================================
 *  AvianDex — 維基「科學分類表」解析器（純函數，可離線測試）
 * ============================================================
 *  輸入：zh.wikipedia `action=parse&section=0&variant=zh-hant&redirects=1`
 *        回傳 JSON 的 parse.text 字串（HTML→純文字後仍保留分類表）
 *  輸出：{ iucn, rank:{界,門,綱,目,科,屬,種}, latin:{...}, scientificName, subspecies:[], intro }
 *
 *  為何不用 AI 推斷？因為 AI 會把相近物種的分類套落去（例如把「磯鷸」寫成鷺科）。
 *  這裡只做「抽取」：抽不到就留空，交由人工補，絕對不猜。
 * ============================================================ */

const RANKS = ['界', '門', '綱', '目', '科', '屬', '種'];

/** 把 HTML 粗略轉成純文字（保留換行，方便逐行抽分類表） */
export function htmlToText(html = '') {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(tr|div|p|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#160;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** 中文名 + 拉丁名（例如「鳩鴿科 Columbidae」→ {zh:'鳩鴿科', la:'Columbidae'}） */
function splitZhLatin(value = '') {
  const v = value.replace(/\s+/g, ' ').trim();
  // 找最後一段連續的拉丁字母（屬名/科名/學名）
  const m = v.match(/^(.*?)[\s（(]*([A-Z][A-Za-z-]+(?:\s+[a-z][A-Za-z-]+)?)\s*[）)]?\s*$/);
  if (m && m[2]) {
    return { zh: m[1].replace(/[：:（(]\s*$/, '').trim(), la: m[2].trim() };
  }
  return { zh: v, la: '' };
}

/**
 * 從 section 0 的文字抽分類資料。
 * @param {string} text 純文字（htmlToText 之後）或原始 HTML 皆可
 */
export function parseTaxobox(text = '') {
  const plain = /<[a-z][\s\S]*>/i.test(text) ? htmlToText(text) : text;
  const lines = plain.split('\n').map((l) => l.trim());

  const out = {
    iucn: '',
    rank: {},
    latin: {},
    scientificName: '',
    authority: '',
    subspecies: [],
    intro: '',
  };

  // ── 保護狀況 ──
  for (let i = 0; i < lines.length; i += 1) {
    if (/^保護狀況|^保护状况/.test(lines[i])) {
      const next = lines.slice(i + 1, i + 3).find((l) => l && !/^保護狀況/.test(l));
      if (next) out.iucn = next.replace(/\s+/g, ' ').trim();
      break;
    }
  }

  // ── 科學分類：界門綱目科屬種 ──
  for (const rank of RANKS) {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const re = new RegExp(`^${rank}[：:]\\s*(.*)$`);
      const m = line.match(re);
      if (m) {
        let value = m[1].trim();
        // 值可能被換行推到下一行
        if (!value) {
          value = (lines[i + 1] || '').trim();
        }
        // 同義詞：只取第一個（「鴿形目 Columbiformes」）
        const { zh, la } = splitZhLatin(value);
        if (zh) out.rank[rank] = zh;
        if (la) out.latin[rank] = la;
        break;
      }
    }
  }

  // ── 二名法 / 學名 ──
  const nameIdx = lines.findIndex((l) => /^二名法$|^學名$|^学名$/.test(l));
  if (nameIdx >= 0) {
    const candidate = lines.slice(nameIdx + 1, nameIdx + 3).find((l) => /[A-Z][a-z]+\s+[a-z]+/.test(l));
    if (candidate) {
      const m = candidate.match(/([A-Z][a-z]+)\s+([a-z-]+)/);
      if (m) {
        out.scientificName = `${m[1]} ${m[2]}`;
        out.authority = candidate.replace(`${m[1]} ${m[2]}`, '').replace(/^[\s(（]+|[)）\s]+$/g, '');
      }
    }
  }

  // ── 亞種（抽得到就抽，純參考）──
  const subIdx = lines.findIndex((l) => /^亞種$|^亚种$/.test(l));
  if (subIdx >= 0) {
    for (let i = subIdx + 1; i < Math.min(subIdx + 12, lines.length); i += 1) {
      const l = lines[i];
      if (!l || /^異名|^次異名|^二名法/.test(l)) break;
      if (/^[\u4e00-\u9fff]/.test(l) && /[A-Z]\.\s*[a-z]/.test(l)) out.subspecies.push(l);
    }
  }

  // ── 首段（第一段有實質內容的文字）──
  const introLine = lines.find(
    (l) =>
      l.length > 30 &&
      /[\u4e00-\u9fff]/.test(l) &&
      !/^保護狀況|^科學分類|^界：|^門：|^綱：|^目：|^科：|^屬：|^種：/.test(l),
  );
  if (introLine) out.intro = introLine.replace(/\s*\[\d+\]|\s*\[\註 \d+\]/g, '').trim();

  return out;
}

/**
 * 產生「只准用這些事實」的提示詞段落。
 * 任何未列出的欄位 → 一律不准出現在卡上（避免 AI 自己補）。
 */
/**
 * 產生提示詞用的【已查證資料】段落。
 * @param {object|null} facts  維基 taxobox 解析結果（可為 null）
 * @param {{id:string,name:string,en?:string}} bird
 * @param {object|null} [taxonomy] eBird/Clements 權威分類（優先於維基的拉丁名）
 */
export function factsBlock(facts, bird, taxonomy = null) {
  if (!facts && !taxonomy) return '';
  const r = facts?.rank || {};
  const la = facts?.latin || {};
  const rows = [];
  const push = (label, zh, latin) => {
    if (zh && latin) rows.push(`${label}：${zh}（${latin}）`);
    else if (zh) rows.push(`${label}：${zh}`);
    else if (latin) rows.push(`${label}：中文待查（拉丁 ${latin}，eBird/Clements 權威）`);
  };
  push('目', r['目'], la['目'] || taxonomy?.order);
  push('科', r['科'], la['科'] || taxonomy?.family);
  push('屬', r['屬'], la['屬']);
  const sciName = taxonomy?.sciName || facts?.scientificName;
  if (sciName) rows.push(`學名：${sciName}`);
  if (facts?.iucn) rows.push(`IUCN：${facts.iucn}`);

  const missing = ['目', '科'].filter((k) => !r[k] && !(k === '目' ? taxonomy?.order : taxonomy?.family));

  return [
    '【已查證資料 — 只准使用以下數值，嚴禁自行補充或改用相近物種的資料】',
    `中文名：${bird.name}`,
    taxonomy?.comName || bird.en ? `英文名：${taxonomy?.comName || bird.en}（eBird 正式名）` : '',
    ...rows,
    missing.length
      ? `⚠️ 以下欄位未有可靠來源：${missing.join('、')} — 請在卡上留空或寫「資料待查」，不准猜。`
      : '',
    taxonomy ? `分類來源：eBird/Clements（species code ${taxonomy.speciesCode}）` : '',
    facts?.source?.url ? `中文資料來源：${facts.source.url}${facts.source.pageid ? `（pageid ${facts.source.pageid}）` : ''}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
