import { useSyncExternalStore } from 'react';
import type { Lang } from './explorer';

/**
 * 「詳細資料」文字的小快取。
 *
 * 為甚麼要有這個 store，而不是在元件裡 useEffect + setState？
 *   1) 翻轉卡一次會開好多張，每張各自 dynamic import 同一個 608 KB 的 JSON，
 *      雖然瀏覽器會重用 module，但每個元件各自存一份 state 仍然浪費；
 *   2) 在 effect 內 setState 會先畫一格「載入中」，然後跳成內容 —— 視覺上閃一下；
 *   3) React 的 lint 規則（set-state-in-effect）也視這種寫法為問題。
 *
 * 做法：module 層存一份資料 + 訂閱名單；元件用 useSyncExternalStore 讀。
 * 載入只在 effect 內「觸發」，不 setState，所以不會有連鎖 render。
 */

export type DetailFields = Record<string, string | string[]>;

const cache: Partial<Record<Lang, Record<string, DetailFields>>> = {};
/** 找不到這隻雀時回同一個空物件 —— 一定要穩定，見 useCardDetail 的註解 */
const EMPTY: DetailFields = {};
const listeners = new Set<() => void>();
const loading = new Set<Lang>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** 觸發載入（重複呼叫安全） */
export function loadDetails(lang: Lang): void {
  if (cache[lang] || loading.has(lang)) return;
  loading.add(lang);
  (async () => {
    try {
      const mod = lang === 'en'
        ? await import('../data/cardDetails.en.json')
        : await import('../data/cardDetails.zh.json');
      const birds = (mod as { default: { birds: Record<string, DetailFields> } }).default.birds;
      cache[lang] = birds;
    } catch {
      cache[lang] = {};
    } finally {
      loading.delete(lang);
      emit();
    }
  })();
}

/**
 * 讀某隻雀的詳細資料。
 * 未載入完成 → 回 null（呼叫者自己決定顯示 loading 定係留白）。
 */
export function useCardDetail(id: string, lang: Lang): DetailFields | null {
  /* ⚠️ getSnapshot 必須每次都回傳**同一個**引用。
     useSyncExternalStore 每次 render 都會叫一次 getSnapshot，然後用 Object.is 比對；
     如果每次都回一個新的 {}，React 會判定「store 又變了」→ 強制重畫 → 又叫 getSnapshot
     → 無限迴圈 → 整個 App 白屏。 */
  const snap = useSyncExternalStore(
    subscribe,
    () => (cache[lang] ? cache[lang]![id] ?? EMPTY : null),
    () => (cache[lang] ? cache[lang]![id] ?? EMPTY : null),
  );
  return snap;
}

/** 已經載入完成沒有（給 UI 判斷是否要繼續轉圈） */
export function isLoaded(lang: Lang): boolean {
  return !!cache[lang];
}
