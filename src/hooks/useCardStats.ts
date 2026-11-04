import { useEffect, useState, useSyncExternalStore } from 'react';
import { getStats, getVersion, subscribe } from '../lib/cardImage';

export interface CardStats {
  loaded: number;
  missing: number;
  error: number;
}

/** 圖卡整體進度（已解鎖 / 找不到 / 出錯），用於頁首計數 */
export function useCardStats(): CardStats {
  const version = useSyncExternalStore(subscribe, getVersion, getVersion);
  const [stats, setStats] = useState<CardStats>(() => {
    const s = getStats();
    return { loaded: s.loaded, missing: s.missing, error: s.error };
  });

  useEffect(() => {
    // 狀態每變一次就重算會太密（569 張 × 多副檔名），用 microtask 合併
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const s = getStats();
      setStats((prev) =>
        prev.loaded === s.loaded && prev.missing === s.missing && prev.error === s.error
          ? prev
          : { loaded: s.loaded, missing: s.missing, error: s.error },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return stats;
}
