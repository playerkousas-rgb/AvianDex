import { useCallback, useSyncExternalStore } from 'react';
import { getEntry, requestCard, retryCard, resetAll, subscribe } from '../lib/cardImage';

/**
 * 訂閱單張卡片的載入狀態。
 * 卡片一掛載就自動排隊（交由 cardImage 的全域併發限制統一控制）。
 */
export function useCardImage(id: string) {
  const entry = useSyncExternalStore(
    subscribe,
    () => getEntry(id),
    () => getEntry(id),
  );

  if (entry.status === 'idle') requestCard(id);

  const retry = useCallback(() => retryCard(id), [id]);
  return { ...entry, retry };
}

export { requestCard, retryCard, resetAll };
