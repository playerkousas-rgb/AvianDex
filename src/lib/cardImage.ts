import {
  CARD_EXTENSIONS,
  IMAGE_CONCURRENCY,
  IMAGE_TIMEOUT_MS,
  cardProxyUrl,
  cardUrl,
} from '../config';

// ============================================================
// 圖卡載入器（Card Image Loader）
// ------------------------------------------------------------
// 為什麼要自己排隊載圖？
//  1) 一次過 569 張卡 = 569 個請求，r2.dev 開發網域會限流（429）→ 全部變「未發現」
//  2) 舊版用 <img loading="lazy"> 但同時用 display:none 隱藏圖片，
//     Chrome 的 lazy loading 對 display:none 的圖片「永遠不會觸發」→ 卡永遠轉圈
//  3) 舊版只試 .avif，有人上傳 .webp／.jpg 就永遠讀不到
//
// 本模組：單一快取 + 併發上限 + 副檔名自動試 + 可重試
// ============================================================

export type CardImageStatus = 'idle' | 'queued' | 'loading' | 'loaded' | 'missing' | 'error';

export interface CardImageEntry {
  status: CardImageStatus;
  url?: string;
  /** 已試過的副檔名 */
  tried: string[];
  /** 上一次失敗原因（除錯用） */
  error?: string;
}

const IDLE: CardImageEntry = { status: 'idle', tried: [] };

const entries = new Map<string, CardImageEntry>();
const listeners = new Set<() => void>();
const queue: string[] = [];
const scheduled = new Set<string>();

let inflight = 0;
let consecutiveMisses = 0;
let allExtensions = true;

/** 連續幾張都完全找不到 → 之後只試 avif，避免無謂請求 */
const MISS_BUDGET = 12;

let version = 0;

/**
 * 直連 R2 連續失敗幾次 → 之後自動改用 /api/card 代理。
 * 只在「網絡／CORS 錯誤」時觸發；404 代表 R2 真係冇呢張圖，不會觸發。
 */
const PROXY_AFTER_FAILURES = 3;
let networkFailures = 0;
let useProxy = false;

/**
 * 本機試作卡（public/demo/card-0013.png）。
 * 用來在未上傳 R2 之前預覽新卡面；連續幾張都冇就自動關掉，唔會拖慢正式環境。
 */
let localMisses = 0;
const LOCAL_MISS_BUDGET = 3;

function localCardUrl(id: string): string {
  return `${import.meta.env.BASE_URL}demo/card-${id.padStart(4, '0')}.png`;
}

let manifest: Record<string, string> | null = null;
let manifestPromise: Promise<void> | null = null;

function emit() {
  version += 1;
  listeners.forEach((fn) => fn());
}

/** 每次狀態有變就 +1，供 useSyncExternalStore 做快照 */
export function getVersion(): number {
  return version;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getEntry(id: string): CardImageEntry {
  return entries.get(id) ?? IDLE;
}

function patch(id: string, next: Partial<CardImageEntry>) {
  const current = entries.get(id) ?? IDLE;
  entries.set(id, { ...current, ...next });
  emit();
}

/** 可選清單：由 `npm run cards:probe -- --manifest` 產生，令首屏只需 1 個請求判斷存在性 */
async function ensureManifest(): Promise<void> {
  if (manifest || manifestPromise) return manifestPromise ?? Promise.resolve();
  manifestPromise = (async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${import.meta.env.BASE_URL}data/card-manifest.json`, {
        signal: controller.signal,
        cache: 'no-cache',
      });
      clearTimeout(timer);
      if (!res.ok) return;
      const data: unknown = await res.json();
      if (data && typeof data === 'object' && 'cards' in data) {
        const cards = (data as { cards: Record<string, string> }).cards;
        if (cards && typeof cards === 'object') manifest = cards;
      }
    } catch {
      /* 沒有 manifest 是正常情況（純加速用） */
    }
  })();
  return manifestPromise;
}

function probeOnce(url: string, proxy = false): Promise<'ok' | 'missing' | 'error'> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = (result: 'ok' | 'missing' | 'error') => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(result);
    };
    const timer = setTimeout(() => finish('error'), IMAGE_TIMEOUT_MS);
    img.onload = () => finish('ok');
    // 404 與網絡錯誤在 <img> 都是 onerror，分不清 → 交由 fetch 覆核
    img.onerror = async () => {
      try {
        const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        // 代理回 404 一定代表 R2 冇圖；直連回 403 可能係 CORS／權限，當 missing 處理
        finish(res.ok ? 'ok' : res.status === 404 || res.status === 403 ? 'missing' : 'error');
        // 代理的 JSON 錯誤也當 missing，避免無限重試
        void proxy;
      } catch {
        finish('error');
      }
    };
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}

async function load(id: string): Promise<void> {
  await ensureManifest();
  patch(id, { status: 'loading' });

  /* 先試本機試作卡：新卡面未上 R2 時都可以即刻睇到 */
  if (localMisses < LOCAL_MISS_BUDGET) {
    const local = localCardUrl(id);
    const localResult = await probeOnce(local);
    if (localResult === 'ok') {
      patch(id, { status: 'loaded', url: local, tried: ['local-png'], error: undefined });
      return;
    }
    if (localResult === 'missing') localMisses += 1;
  }

  const fromManifest = manifest?.[id];
  const exts: string[] = fromManifest
    ? [fromManifest]
    : allExtensions
      ? [...CARD_EXTENSIONS]
      : [CARD_EXTENSIONS[0]];

  const tried: string[] = [];
  for (const ext of exts) {
    const direct = cardUrl(id, ext);
    tried.push(ext);

    const result = useProxy ? 'error' : await probeOnce(direct);
    if (result === 'ok') {
      consecutiveMisses = 0;
      networkFailures = 0;
      patch(id, { status: 'loaded', url: direct, tried, error: undefined });
      return;
    }

    if (result === 'missing') continue; // R2 真係冇呢個格式，試下一個

    // 網絡／CORS 失敗：先試代理，成功就記住以後都用代理
    const proxied = cardProxyUrl(id, ext);
    const proxyResult = await probeOnce(proxied, true);
    if (proxyResult === 'ok') {
      networkFailures += PROXY_AFTER_FAILURES; // 即刻切去代理模式
      useProxy = true;
      consecutiveMisses = 0;
      patch(id, { status: 'loaded', url: proxied, tried, error: undefined });
      return;
    }

    networkFailures += 1;
    if (networkFailures >= PROXY_AFTER_FAILURES) useProxy = true;
    patch(id, {
      status: 'error',
      tried,
      error: useProxy
        ? '直連 R2 及代理都失敗，請檢查網絡'
        : '網絡或 CORS 問題，未能讀取圖卡',
    });
    return;
  }

  consecutiveMisses += 1;
  if (consecutiveMisses >= MISS_BUDGET) allExtensions = false;
  patch(id, { status: 'missing', tried, error: 'R2 內沒有這個編號的圖卡' });
}

function drain() {
  while (inflight < IMAGE_CONCURRENCY && queue.length > 0) {
    const id = queue.shift()!;
    inflight += 1;
    load(id)
      .catch((err: unknown) => {
        patch(id, { status: 'error', error: err instanceof Error ? err.message : String(err) });
      })
      .finally(() => {
        inflight -= 1;
        drain();
      });
  }
}

/** 排隊載入某張卡（重複呼叫安全） */
export function requestCard(id: string): void {
  const entry = entries.get(id);
  if (entry && (entry.status === 'loaded' || entry.status === 'loading' || entry.status === 'queued')) {
    return;
  }
  if (scheduled.has(id)) return;
  if (entry && entry.status === 'missing') return; // 已確認不存在，除非手動 retry
  scheduled.add(id);
  patch(id, { status: 'queued' });
  queue.push(id);
  drain();
}

/** 使用者手動重試（例如剛上傳完圖） */
export function retryCard(id: string): void {
  entries.delete(id);
  scheduled.delete(id);
  patch(id, { status: 'idle', url: undefined, tried: [] });
  consecutiveMisses = 0;
  allExtensions = true;
  requestCard(id);
}

/** 全域重新探測（例如上傳後按「重新整理圖鑑」） */
export function resetAll(): void {
  entries.clear();
  scheduled.clear();
  queue.length = 0;
  consecutiveMisses = 0;
  allExtensions = true;
  networkFailures = 0;
  manifest = null;
  manifestPromise = null;
  emit();
}

/** 已確認有圖的編號（供「只顯示已解鎖」過濾用） */
export function getLoadedIds(): Set<string> {
  const set = new Set<string>();
  entries.forEach((e, id) => {
    if (e.status === 'loaded') set.add(id);
  });
  return set;
}

/** 給統計／除錯用 */
export function getStats() {
  let loaded = 0;
  let missing = 0;
  let error = 0;
  entries.forEach((e) => {
    if (e.status === 'loaded') loaded += 1;
    else if (e.status === 'missing') missing += 1;
    else if (e.status === 'error') error += 1;
  });
  return { loaded, missing, error, queued: queue.length, inflight, useProxy };
}
