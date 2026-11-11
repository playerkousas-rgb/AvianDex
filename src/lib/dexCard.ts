/**
 * 圖鑑資訊卡（1200×1600）—— 一套版式，569 隻共用。
 *
 * 設計來源：用戶自製的兩張參考卡（八哥 NO.0013 / 小葵花鳳頭鸚鵡 NO.0004）。
 * 保留的語言：編號膠囊、像素插畫、引線特徵圈、分區小卡、底部五維評分、條碼底欄。
 *
 * 三條規矩（用戶明確要求）：
 *   1. **不另製鳥圖**。插畫一律用 R2 `birdcards/<NO>.avif`（BIRD-DEX 2 現成 569 張）。
 *      卡面本身只提供 <img>，載入失敗就顯示編號佔位，不會偷偷畫一隻假鳥。
 *   2. **文字全部由 git 內的 JSON 注入**，唔手抄、唔機翻、唔改寫。
 *      中欄只放中文、英欄只放英文；缺資料就印「資料待查」／"Data pending"。
 *   3. **配色由「目」（order）決定**，同目同色。色表在 ORDER_THEME，23 個目各一色。
 *
 * 版式是固定 1200×1600 的絕對定位畫布：這尺寸同時是下載 PNG 的尺寸，
 * 所以卡面在瀏覽器看到的，就是下載到的（所見即所得）。
 */

export interface DexCardInput {
  id: string;
  zhName: string;
  enName: string;
  sciName: string;
  orderLatin: string;
  orderZh: string;
  familyLatin: string;
  familyZh: string;
  /** 中文欄位（cardDetails.zh.json） */
  zh: Record<string, string | string[]>;
  /** 英文欄位（cardDetails.en.json） */
  en: Record<string, string | string[]>;
  /** explorerIndex 的 tag 中文名（已解碼） */
  dietZh: string[];
  dietEn: string[];
  habitatZh: string[];
  habitatEn: string[];
  /** AVONET 量度（原字串，mm／g，不換算）。鍵：wing/tail/tarsus/bill/mass */
  meas?: Record<string, string>;
  mass?: string;
  wing?: string;
  /** 體長 cm（0＝沒有） */
  lengthCm: number;
  /** 是否由翼長估算 */
  lengthEstimated?: boolean;
  /** 圖鑑評分（src/data/dexScores.json） */
  score?: { i?: number; a?: number; v?: number; r?: number; c?: number; o?: number };
  /** 資料出處（pageid／授權），顯示在卡底 */
  source?: string;
  /** 插畫網址（R2 birdcards）；null＝未知，卡面顯示佔位 */
  artUrl?: string | null;
  /** 卡面底欄的版本標示。由 app 的 APP_VERSION／package.json 傳入，不寫死日期。 */
  version?: string;
  /** 每隻雀的資料出處字串（cardSources.json），例如
   *  「zh.wikipedia 八哥 · pageid 65246 ｜ en.wikipedia Crested myna · pageid 1350552 · 分類：eBird/Clements」 */
  sources?: string;
}

/* ------------------------------------------------------------------
 * 目 → 配色。同目同色，所以同一個目的雀排在一起會一眼認出是一家人。
 * c = 主色（深，用於標題／評分柱）、t = 淡底（卡面底色）、a = 強調（編號膠囊）
 * 顏色按「目」的直覺配：雀形目＝品牌深綠、雁形目＝水藍、鴴形目＝沙棕、
 * 鷹形目＝赭紅、鴞形目＝夜紫 … 其餘採相鄰色相平均分配。
 * ------------------------------------------------------------------ */
export interface OrderTheme {
  c: string;   // 主色
  t: string;   // 淡底
  a: string;   // 強調色（膠囊、評分）
}

export const ORDER_THEME: Record<string, OrderTheme> = {
  Passeriformes:      { c: '#17553c', t: '#f3f7f1', a: '#d8a21c' }, // 雀形目 — 品牌綠
  Charadriiformes:    { c: '#4a6b3a', t: '#f6f5ec', a: '#c9a227' }, // 鴴形目 — 沙岸芥黃
  Anseriformes:       { c: '#1d5c72', t: '#eef6f8', a: '#2f9fb8' }, // 雁形目 — 水藍
  Accipitriformes:    { c: '#7a3b22', t: '#fbf1ea', a: '#c4661f' }, // 鷹形目 — 赭紅
  Pelecaniformes:     { c: '#2c5b52', t: '#eef5f2', a: '#4f9d86' }, // 鵜形目 — 灰綠
  Cuculiformes:       { c: '#5a5130', t: '#f8f5e9', a: '#a08a2e' }, // 杜鵑目 — 枯葉
  Gruiformes:         { c: '#3f5347', t: '#f0f4f0', a: '#7d9c6a' }, // 鶴形目 — 蘆葦
  Columbiformes:      { c: '#4b556b', t: '#f2f4f8', a: '#7c8aa8' }, // 鴿形目 — 石板
  Strigiformes:       { c: '#3b2f57', t: '#f3f0f8', a: '#7a63a8' }, // 鴞形目 — 夜紫
  Coraciiformes:      { c: '#155e6b', t: '#ecf7f8', a: '#17a2b8' }, // 佛法僧目 — 翡翠
  Suliformes:         { c: '#204a63', t: '#eef4f8', a: '#3d7ea6' }, // 鰹鳥目 — 海深藍
  Piciformes:         { c: '#6b4423', t: '#faf3ea', a: '#b5772f' }, // 鴷形目 — 樹皮
  Apodiformes:        { c: '#2f4858', t: '#f0f5f8', a: '#5d8aa0' }, // 雨燕目 — 天灰
  Procellariiformes:  { c: '#1c3f57', t: '#edf3f7', a: '#48799c' }, // 鸌形目 — 遠洋
  Psittaciformes:     { c: '#1f6448', t: '#eef7f1', a: '#e0a92b' }, // 鸚形目 — 羽綠（配鮮黃）
  Podicipediformes:   { c: '#2a5a63', t: '#eef6f7', a: '#4f939c' }, // 鷉形目 — 湖面
  Falconiformes:      { c: '#733527', t: '#fbf1ee', a: '#b8632f' }, // 隼形目 — 赤褐
  Galliformes:        { c: '#5c4322', t: '#f8f3e8', a: '#a98030' }, // 雞形目 — 土褐
  Gaviiformes:        { c: '#274b5e', t: '#eff4f7', a: '#4c7f96' }, // 潛鳥目 — 北水
  Caprimulgiformes:   { c: '#4a3d33', t: '#f7f3ee', a: '#8d7560' }, // 夜鷹目 — 泥灰
  Ciconiiformes:      { c: '#6a2f33', t: '#fbf1f1', a: '#a85a5e' }, // 鸛形目 — 朱紅
  Bucerotiformes:     { c: '#7a5a14', t: '#faf6e8', a: '#c19a22' }, // 犀鳥目 — 象牙
  Phaethontiformes:   { c: '#7a4b6b', t: '#fbf2f7', a: '#b06a94' }, // 熱帶鳥目 — 洋紫
};

const FALLBACK: OrderTheme = { c: '#17553c', t: '#f4f6f2', a: '#d8a21c' };

export function orderTheme(orderLatin: string): OrderTheme {
  return ORDER_THEME[orderLatin] || FALLBACK;
}

/** 五個維度的定義：單一來源，卡面與測試都讀這裡 */
export const SCORE_DIMS = [
  { k: 'i', zh: '生物重要性', en: 'Ecological importance', from: 'IUCN 紅色名錄級別' },
  { k: 'a', zh: '適應力',     en: 'Adaptability',          from: '食性 × 棲地 tag 數' },
  { k: 'v', zh: '觀賞價值',   en: 'Showiness',             from: '體長（AVONET 翼長後備）' },
  { k: 'r', zh: '研究價值',   en: 'Research value',        from: '遷徙／語源／要點' },
  { k: 'c', zh: '保育關注度', en: 'Conservation concern',  from: '受脅註記 + IUCN' },
] as const;

/** 「資料待查」——兩種語言都不准用另一種頂替 */
export const PENDING_ZH = '資料待查';
export const PENDING_EN = 'Data pending';

export const CARD_W = 1200;
export const CARD_H = 1600;

/** 乾淨的文字：把 JSON 內的雙引號換成中文引號，避免塞進 innerHTML 時弄破標記 */
function clean(s: string | undefined): string {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '“')
    .trim();
}

export function esc(s: string | undefined): string {
  return clean(s);
}

/** 由陣列／字串取出多行文字（highlights 是陣列） */
export function lines(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map((x) => clean(x)).filter(Boolean);
}

/** 單一段落（多行用 。／； 連接，適合小卡） */
export function para(v: string | string[] | undefined): string {
  return lines(v).join(' ');
}
