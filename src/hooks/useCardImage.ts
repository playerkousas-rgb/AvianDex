import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  getEntry, requestCard, retryCard, subscribe,
  getInfoEntry, requestInfoCard,
} from '../lib/cardImage';

/**
 * 訂閱單張卡的**插畫**（正面）載入狀態。
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

/**
 * 訂閱單張卡的**資訊圖卡**（翻轉面）。
 *
 * 跟插畫不同：這裡**不會自動載入**。569 張之中只有 21 張做過資訊卡，
 * 若果每張都預探，等於白白打五百幾個 404，r2.dev 會限流。
 * 所以只有用戶真的翻開那張卡，才呼叫 probe()。
 */
export function useInfoCard(id: string) {
  const entry = useSyncExternalStore(
    subscribe,
    () => getInfoEntry(id),
    () => getInfoEntry(id),
  );

  const probe = useCallback(() => requestInfoCard(id), [id]);

  return { ...entry, probe };
}

export { requestCard, retryCard };
