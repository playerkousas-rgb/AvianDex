import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { getEntry, requestCard, retryCard, subscribe } from '../lib/cardImage';

/**
 * 訂閱單張卡片的載入狀態。
 * 排隊動作放在 effect 內做（不要在 render 期間改全域狀態，
 * 否則會在 StrictMode 下觸發「render 期間更新另一個元件」的警告）。
 */
export function useCardImage(id: string) {
  const entry = useSyncExternalStore(
    subscribe,
    () => getEntry(id),
    () => getEntry(id),
  );

  useEffect(() => {
    requestCard(id);
  }, [id]);

  const retry = useCallback(() => retryCard(id), [id]);
  return { ...entry, retry };
}

export { requestCard, retryCard };
