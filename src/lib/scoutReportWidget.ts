/**
 * Scout Admin 統一回報 widget 的載入器 ＋ 開啟流程（單一入口）。
 *
 * 為咩要由 app 自己處理，而唔係喺 index.html 直接貼 <script>？
 *   ① widget 嗰粒右下角 FAB 會同我哋自己嘅「回報」球／安裝鍵打架，
 *      所以載入後即刻收埋佢（`#scoutw-fab{display:none!important}`，見 index.css）；
 *      入口只用本 App 自己嘅球（同 HKMAP 嘅做法一樣）。
 *   ② 用家第一次撳「回報」才載 widget，唔會拖慢首屏。
 *   ③ widget 未載入／被封鎖 → 照樣開得返 Scout Admin 獨立回報頁（零死連）。
 *
 * 全程唔經本 App 後端、唔需要 API Key、可以匿名 —— 資料直接送去
 * Scout Admin 嘅 Apps Script（統一回報格式 v1）。
 *
 * 測試：tests/scoutReport.test.mjs
 */

let loading: Promise<boolean> | null = null;

export function isScoutWidgetReady(doc?: Document): boolean {
  const d = doc ?? (typeof document === 'undefined' ? null : document);
  return !!d?.getElementById('scoutw-fab');
}

export function loadScoutAdminWidget(params: {
  url: string;
  sourceApp: string;
  /** 測試用：注入假 document */
  doc?: Document;
  /** script 等幾耐就當死（毫秒；預設 6 秒） */
  timeoutMs?: number;
}): Promise<boolean> {
  const doc = params.doc ?? (typeof document === 'undefined' ? null : document);
  if (!doc) return Promise.resolve(false);
  // widget 自己已有 window flag；但我哋連插都唔插第二次
  if (isScoutWidgetReady(doc) || doc.querySelector('script[data-scout-widget]')) {
    loading = loading ?? Promise.resolve(true);
    return loading;
  }
  if (loading) return loading;

  loading = new Promise<boolean>((resolve) => {
    const el = doc.createElement('script');
    el.src = params.url;
    el.async = true;
    el.setAttribute('data-app', params.sourceApp);
    el.setAttribute('data-scout-widget', '1');
    el.addEventListener('load', () => resolve(true));
    el.addEventListener('error', () => resolve(false));

    /* 死線：script 喺某些網絡會「永遠 pending」（學校 proxy 黑洞）。
       咁樣個 promise 一世都唔 resolve → 撳「回報」永遠冇反應。
       所以 6 秒（測試可調）之後一定收工回 false，UI 就會走 fail-safe 路線。 */
    const deadline = setTimeout(() => resolve(false), params.timeoutMs ?? 6000);
    el.addEventListener('load', () => clearTimeout(deadline));
    el.addEventListener('error', () => clearTimeout(deadline));

    doc.body.appendChild(el);
  });
  return loading;
}

/** 已經砌好嘅 widget modal → 直接開；未砌好回 false */
export function openScoutWidgetModal(doc?: Document): boolean {
  const d = doc ?? (typeof document === 'undefined' ? null : document);
  if (!d) return false;
  const overlay = d.getElementById('scoutw-overlay');
  if (overlay) {
    overlay.classList.add('open');
    d.getElementById('scoutw_i_title')?.focus?.({ preventScroll: true });
    return true;
  }
  return false;
}

/**
 * 用家撳「回報」嘅完整流程：
 *   1. 已載入 → 即刻開 modal
 *   2. 未載入 → 載入 widget，最多等 ~3 秒（每 150ms 試一次）
 *   3. 等唔到 → 回 'fallback'，由 UI 開獨立回報頁
 *
 * 唔會 throw；任何情況都會回一個結果，UI 一定有嘢做。
 */
export type OpenReportResult = 'opened' | 'fallback';

export async function openScoutReport(params: {
  widgetUrl: string;
  sourceApp: string;
  doc?: Document;
  /** 測試用：縮短等待（毫秒） */
  waitMs?: number;
  /** script 等幾耐就當死（毫秒；預設 6 秒） */
  timeoutMs?: number;
}): Promise<OpenReportResult> {
  const doc = params.doc ?? (typeof document === 'undefined' ? null : document);
  if (!doc) return 'fallback';

  if (openScoutWidgetModal(doc)) return 'opened';

  /* 唔 await 載入：一路等一路睇 modal 出現未，避免「等完 script 又再等」。
     最壞情況：waitMs（預設 3.5 秒）＋ 1 秒寬限 ≈ 4.5 秒一定有結果。 */
  const loaded = loadScoutAdminWidget({
    url: params.widgetUrl,
    sourceApp: params.sourceApp,
    doc,
    timeoutMs: params.timeoutMs,
  });

  const waitMs = params.waitMs ?? 3500;
  const step = 150;
  for (let waited = 0; waited <= waitMs; waited += step) {
    if (openScoutWidgetModal(doc)) return 'opened';
    await sleep(step);
  }

  /* 寬限：script 其實已經載入（ok=true）→ 再等 1 秒俾 widget 砌 DOM */
  const ok = await Promise.race([loaded, sleep(1000).then(() => false)]);
  return ok && openScoutWidgetModal(doc) ? 'opened' : 'fallback';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 測試用：重置載入狀態 */
export function __resetWidgetLoaderForTests(): void {
  loading = null;
}
