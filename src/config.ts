// ============================================================
// AvianDex — 單一設定入口（Single Source of Truth）
// ------------------------------------------------------------
// 所有「會變嘅數字／網址」只准喺呢度出現一次：
//   版本號、R2 網域、圖卡資料夾、支援副檔名、圖鑑槽位數。
// ⚠️ 新增或改路徑時，只需改本檔；不要在元件內硬編字串。
// ============================================================
import birdsRawData from './data/birds.json';

/** 雙版號 V1：檔名／頁面標題／APP_VERSION／頁尾 必須一致 */
export const APP_VERSION = 'v1.9.0';

/**
 * 圖卡（鳥卡）來源 —— Cloudflare R2 公開網域。
 * 可用環境變數 VITE_R2_BASE_URL 覆寫（例如日後綁自訂網域 cdn.xxx.com）。
 * ⚠️ r2.dev 開發網域有速率限制，正式流量建議綁自訂網域（見 docs/APP_REVIEW）。
 */
export const R2_BASE_URL: string =
  (import.meta.env.VITE_R2_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://pub-a9333a974e814ccba1994639b6e79266.r2.dev';

/**
 * R2 上**兩個**資料夾，裝住兩種完全不同的東西。不要當它們是同一種。
 *
 *   aviandex/    資訊圖卡（排版好的文字卡）。已完成 21 張：0001–0021 有，其餘 404。
 *   birdcards/   BIRD-DEX 2 的插畫卡（整張畫好的鳥，1:1 正方形）。569 張齊。
 *
 * 卡面設計：正面 = birdcards 插畫；翻轉 = aviandex 資訊卡，
 * 該張未做就由 app 用文字欄位即時砌（見 CardInfoFace）。
 *
 * ⚠️ 之前程式用 'aviandex' 去找插畫，所以 569 張插畫全部 404，
 *    卡面永遠「未發現」。根因就是這一個字串。
 */
export const CARD_FOLDER = 'birdcards';

/** 插畫卡（正面）—— 569 張齊 */
export const ART_FOLDER = 'birdcards';

/** 資訊圖卡（翻轉後）—— 完成了的才存在 */
export const INFO_FOLDER = 'aviandex';

/** 插畫卡的嘗試次序（birdcards 優先，aviandex 作後備） */
export const CARD_FOLDERS = [ART_FOLDER, INFO_FOLDER] as const;

/** 資訊圖卡副檔名：已完成的 21 張實測是 avif */
export const INFO_EXTENSIONS = ['avif', 'webp', 'jpg', 'png'] as const;

/**
 * 圖卡副檔名嘗試順序。
 * 依 README 規範是 avif，但歷史上有人上傳過 webp／jpg，
 * 所以逐個試，避免「明明有圖但顯示未發現」。
 */
export const CARD_EXTENSIONS = ['avif', 'webp', 'jpg', 'jpeg', 'png'] as const;

/** 異圖（同一編號的第二款卡面）後綴，見 BIRD_ID_MAPPING.csv */
export const CARD_ALT_SUFFIX = '_UR';

/**
 * 圖鑑預設次序。
 *   'ebird'   = 跟 eBird/Clements 演化排序（目 → 科 → 種），英文為權威（預設）
 *   'pokedex' = 原本 NO.0001 → 0569 的固定次序
 *   'chinese' = 中文名次序
 * 只影響畫面排法，NO. 編號（＝R2 檔名）永不變。
 */
export const DEFAULT_SORT_MODE: 'ebird' | 'pokedex' | 'chinese' = 'ebird';

/** 圖鑑槽位總數：一律由 birds.json 決定（舊版兩處寫死 569 / 1500，會對不上） */
export const TOTAL_SLOTS = birdsRawData.length;

/**
 * 直連 R2 失敗時（學校／公司網絡封鎖 CDN、r2.dev 限流）的後備代理。
 * 由 api/card.js 提供；只在「網絡錯誤」時才試，避免無謂佔用 Vercel 流量。
 */
export const CARD_PROXY_PATH = '/api/card';

/** 插畫只從已知的 R2 birdcards 路徑／同源代理載入。
 * 不向其他網站猜測 /images/cards、/images/birds 等路徑。
 */

/** 可選 manifest（由 `npm run cards:probe` 產生），純加速用，不是必要 */
export const CARD_MANIFEST_PATH = '/data/card-manifest.json';

/** 首屏／每次載入更多顯示幾張卡（避免一次過打 569 個圖片請求） */
export const CARDS_PER_PAGE = 48;

/** 同時最多幾個圖片請求（r2.dev 對突發流量會 429） */
export const IMAGE_CONCURRENCY = 6;

/** 單張圖卡載入逾時（毫秒） */
export const IMAGE_TIMEOUT_MS = 15000;

export function cardBaseUrl(folder: string = CARD_FOLDER): string {
  return `${R2_BASE_URL}/${folder}`;
}

/** 代理網址（後備用） */
export function cardProxyUrl(id: string, ext: string = 'avif', folder: string = CARD_FOLDER): string {
  return (
    `${CARD_PROXY_PATH}?id=${encodeURIComponent(id.padStart(4, '0'))}` +
    `&ext=${encodeURIComponent(ext)}&folder=${encodeURIComponent(folder)}`
  );
}

/** 依編號＋副檔名組出圖卡網址（編號固定 4 位） */
export function cardUrl(id: string, ext: string = 'avif', alt = false, folder: string = CARD_FOLDER): string {
  const padded = id.padStart(4, '0');
  return `${cardBaseUrl(folder)}/${padded}${alt ? CARD_ALT_SUFFIX : ''}.${ext}`;
}

/** 插畫卡（正面）：birdcards/0008.avif */
export function artUrl(id: string, ext: string = 'avif'): string {
  return cardUrl(id, ext, false, ART_FOLDER);
}

/** 資訊圖卡（翻轉後）：aviandex/0008.avif */
export function infoCardUrl(id: string, ext: string = 'avif'): string {
  return cardUrl(id, ext, false, INFO_FOLDER);
}

/** 插畫的所有候選網址（birdcards 先、aviandex 後備） */
export function cardUrlCandidates(id: string, ext: string = 'avif', alt = false): string[] {
  return CARD_FOLDERS.map((f) => cardUrl(id, ext, alt, f));
}
