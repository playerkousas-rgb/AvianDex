/* ============================================================
 *  AvianDex — 簡體 → 香港繁體（字形轉換，不改詞、不改句）
 * ------------------------------------------------------------
 *  為什麼要有這一支？
 *    中文維基有不少鳥類條目是簡體（或繁簡混排），抽取器取的是原文。
 *    卡面是香港繁體介面，所以要轉字形：
 *      这种翠鸟含有鱼类  →  這種翠鳥含有魚類
 *
 *  ⚠️ 這不是「機翻」，也不是「改寫」：
 *     · 只轉字形（簡↔繁對應），詞與句的結構完全不動
 *     · 專有名詞、數字、學名、英文一律原樣保留
 *     · 轉完仍然可以逐句對回維基原文（pageid 有記錄）
 *
 *  為什麼用 opencc-js 而唔自己寫對照表？
 *    自己寫一定漏字（第一版只覆蓋常用 80 字，「河谷」變「河穀」、「若干」變「若乾」）。
 *    OpenCC 是社區維護的詞組級轉換表，會按上下文判斷。
 *
 *  兩個必須處理的 OpenCC 副作用（實測）：
 *    1) 純繁體句照樣過 OpenCC 會被改壞：
 *         群→羣、岩→巖、台→臺、里→裏、厘米→釐米、干擾→幹擾、了解→瞭解
 *       → 所以先逐字判斷「這句有冇真正的簡體字」，冇就一個字都唔改。
 *    2) `to:'hk'` 保留「于」（棲息于）；`to:'t'` 轉「於」但把「為」變「爲」、
 *       「裡」變「裏」、「台灣」變「臺灣」。香港寫法係「於／為／裡／台灣」，
 *       所以用 `t` 再逐項修回（跟 scripts/cards/zh-hk.py 的 POST_* 表一致）。
 * ============================================================ */
import * as OpenCC from 'opencc-js';

/* ------------------------------------------------------------------
 * 一、哪些字要當成「簡體跡象」
 * ------------------------------------------------------------------ */

/**
 * 「繁體也通用」的字：OpenCC 會改，但唔應該因此觸發轉換。
 * 例：「群島」「岩石」「台灣」「公里」「干擾」「厘米」本身完全正確。
 */
const SAFE_TRAD = new Set('群岩台里干厘后游峰咸于余征徵');

/** 逐字轉換快取（同一句唔會重複算） */
const charConv = new Map();
function charIsSimplified(ch) {
  if (SAFE_TRAD.has(ch)) return false;
  if (!charConv.has(ch)) charConv.set(ch, conv(ch));
  return charConv.get(ch) !== ch;
}

/* ------------------------------------------------------------------
 * 二、轉換後的修正表（只改實測到的錯例）
 * ------------------------------------------------------------------ */

/** 異體字：OpenCC s2t 會出古體，香港通用寫法係右邊那個 */
const CHAR_FIX = { 爲: '為', 羣: '群', 裏: '裡' };

/** 詞組修正（apply 在轉換之後，順序有意義） */
const WORD_FIX = [
  ['臺灣', '台灣'],        /* 香港寫「台灣」 */
  ['釐米', '厘米'],        /* 香港寫「厘米」 */
  ['公釐', '毫米'],
  ['烏裡', '烏里'],        /* 音譯地名：達烏里寒鴉 Daurian Jackdaw */
  ['烏裏', '烏里'],
  ['巖', '岩'],
  ['幹擾', '干擾'],
  ['幹涉', '干涉'],
  ['幹旱', '乾旱'],
  ['幹燥', '乾燥'],
  ['瞭解', '了解'],
  /* OpenCC 詞組表把「小云雀」當專名保留，但繁體應作「小雲雀」 */
  ['小云雀', '小雲雀'],
];

/**
 * 「X于」→「X於」：OpenCC 在動詞後面常常漏轉（棲息于 / 分布于 / 築巢于）。
 * 只認這些動詞字，避免誤改人名（單于）、「于」姓。
 */
const YU_VERBS = '布息巢活沒留見產棲歇殖冬翔隱藏居停分';
const YU_RE = new RegExp(`([${YU_VERBS}])于`, 'g');

/* ------------------------------------------------------------------
 * 三、對外 API
 * ------------------------------------------------------------------ */

const conv = OpenCC.Converter({ from: 'cn', to: 't' });

/**
 * 簡體 → 香港繁體。已是繁體的字串原樣返回（零改動）。
 * @param {string} text
 * @returns {string}
 */
export function toHk(text) {
  if (typeof text !== 'string' || !text) return text;

  /* 1) 只有見到真正的簡體字才過 OpenCC（繁體原句零改動） */
  let out = text;
  for (const ch of text) {
    if (charIsSimplified(ch)) { out = conv(text); break; }
  }

  /* 2) 異體字 → 香港通用寫法 */
  out = out.replace(/[爲羣裏]/g, (ch) => CHAR_FIX[ch] || ch);

  /* 3) 詞組修正 */
  for (const [a, b] of WORD_FIX) if (out.includes(a)) out = out.split(a).join(b);

  /* 4) 介詞「于」漏轉 */
  out = out.replace(YU_RE, '$1於');

  return out;
}

/** 逐層轉換（物件／陣列／字串都支援；用來轉 fieldCopy 之類的巢狀結構） */
export function toHkDeep(value) {
  if (typeof value === 'string') return toHk(value);
  if (Array.isArray(value)) return value.map((x) => toHkDeep(x));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toHkDeep(v);
    return out;
  }
  return value;
}

/** 有冇簡體跡象（測試與報告用） */
export function looksSimplified(text) {
  if (typeof text !== 'string' || !text) return false;
  for (const ch of text) if (charIsSimplified(ch)) return true;
  return false;
}
