// ============================================================
// AvianDex — 單一設定入口（Single Source of Truth）
// ------------------------------------------------------------
// 所有「會變嘅數字／網址」只准喺呢度出現一次：
//   版本號、R2 網域、圖卡資料夾、支援副檔名、圖鑑槽位數。
// ⚠️ 新增或改路徑時，只需改本檔；不要在元件內硬編字串。
// ============================================================
import birdsRawData from './data/birds.json';
import infoCardsData from './data/infoCards.json';

/** 雙版號 V1：檔名／頁面標題／APP_VERSION／頁尾 必須一致 */
export const APP_VERSION = 'v1.10.0';

/** The separate capture-game app; AvianDex itself remains the authoritative field guide. */
export const BIRD_CAPTURE_APP_URL = 'https://birddex3.vercel.app';

// ============================================================
// 主站回跳（readme SG18：所有 App 都要有「讚好／收藏」一鍵掣）
// ------------------------------------------------------------
// 網址**一律**由 public/store_gate_v1.0.js 的 ScoutStoreGate.getAppStoreUrl(slug) 組出，
// 唔准喺元件內寫死 https://scoutappstore.vercel.app（改主站域名會四圍漏）。
// 元件未拿到 helper 就保持 hidden —— 零死連（見 src/hooks/useStoreSupport.ts）。
// ============================================================

/**
 * APP STORE 嘅 slug —— 按正式 Vercel host 對過
 * `website/migrations/20261116-app-slug-seed.sql`：
 *   ('avian-dex.vercel.app', 'aviandex')
 * ⚠️ 嚴禁用 repo 名猜（例如 AvianDex → avian-dex 就錯）。
 */
export const APP_STORE_SLUG = 'aviandex';

// ============================================================
// 問題回報（Scout Admin 統一回報格式 v1）
// ------------------------------------------------------------
// 全家標準：所有 App 共用同一條 Apps Script 接收端、同一個 payload、
// 同一組 Sheet 欄位；新系統只需指定「來源系統」名稱（sourceApp）。
// 參考實作：HKMAP/js/report.js、scout-circulars（SCOUT_ADMIN_ENDPOINT）。
//
// 本 App 冇 Supabase、冇後端資料庫，所以：
//   ・只送 type/issue 個 8 個標準欄位；sourcePage／appVersion／標題前綴
//     全部併入 title／desc（Apps Script 會自動補欄，唔會漏單）。
//   ・不直連任何資料庫、不需要 API Key、可匿名。
// ============================================================

/** Google Apps Script Web App（/exec）—— 同 scout-admin 說明書公開嗰條一樣 */
export const SCOUT_ADMIN_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxj5BDDGgjs559smkK4Z5aYImWYeXbN5af8U1ObON0z9WnsN6QJW4I1XWolhs5kQ_H-UQ/exec';

/** 管理後台（widget 未載入時嘅後備獨立回報頁用） */
export const SCOUT_ADMIN_APP_URL = 'https://scout-admin-blue.vercel.app/';

/**
 * 來源系統名稱。Scout Admin 後台「來源膠囊」靠呢個字串分流；
 * 未登記嘅名稱照收（後台顯示 🔹 原樣名稱），所以寫成點認得就寫點。
 */
export const REPORT_SOURCE_APP = 'AvianDex 鳥類圖鑑';

/** 純前端 widget（右下角 FAB）—— 本 App 會即時隱藏佢個 FAB，入口只用我哋自己粒球 */
export const SCOUT_ADMIN_WIDGET_URL = 'https://scout-admin-blue.vercel.app/widget.js';

/** 「回報」入口可以直接開獨立回報頁（widget 未載入／被封鎖時嘅 fail-safe） */
export function scoutReportPageUrl(): string {
  return `${SCOUT_ADMIN_APP_URL}report.html?app=${encodeURIComponent(REPORT_SOURCE_APP)}`;
}

/**
 * 左右兩排球嘅**唯一來源**：每粒球寫明喺邊一排，次序＝物件 key 次序（由上而下）。
 * 用戶 2026-11-21 定案：「讚好／收藏」放左邊，「回報」放右邊，兩邊各 3 粒對稱。
 * 加新球只改呢個物件；側欄（SideToolBalls.tsx）同詳細資料頁（BirdDetailPage.tsx）
 * 都讀同一份，唔會再出現「兩邊唔同次序」。
 */
export const TOOL_BALLS = {
  // 左排（由上而下）
  like: 'left',
  etiquette: 'left',
  gear: 'left',
  // 右排（由上而下）
  map: 'right',
  report: 'right',
  birddex3: 'right',
} as const;

export type ToolBallId = keyof typeof TOOL_BALLS;
export type ToolBallSide = (typeof TOOL_BALLS)[ToolBallId];

/** 某一排嘅球（次序跟 TOOL_BALLS 宣告次序） */
export function toolBallsFor(side: ToolBallSide): ToolBallId[] {
  return (Object.keys(TOOL_BALLS) as ToolBallId[]).filter((id) => TOOL_BALLS[id] === side);
}

export function toolBallSide(id: ToolBallId): ToolBallSide {
  return TOOL_BALLS[id];
}

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
    `&ext=${encodeURIComponent(ext)}&folder=${encodeURIComponent(folder)}` + infoRevisionQuery(id, folder, '&')
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
function infoRevisionQuery(id: string, folder: string, separator: '?' | '&'): string {
  const revisions = infoCardsData.revisions as Record<string, string>;
  const revision = folder === INFO_FOLDER ? revisions[id.padStart(4, '0')] : undefined;
  return revision ? `${separator}v=${encodeURIComponent(revision)}` : '';
}

export function infoCardUrl(id: string, ext: string = 'avif'): string {
  return cardUrl(id, ext, false, INFO_FOLDER) + infoRevisionQuery(id, INFO_FOLDER, '?');
}

/** 插畫的所有候選網址（birdcards 先、aviandex 後備） */
export function cardUrlCandidates(id: string, ext: string = 'avif', alt = false): string[] {
  return CARD_FOLDERS.map((f) => cardUrl(id, ext, alt, f));
}
