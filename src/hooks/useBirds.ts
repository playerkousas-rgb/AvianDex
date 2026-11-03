import { useState, useEffect } from 'react';
import { Bird } from '../types';
import { mockBirds } from '../data/mockBirds';

/**
 * 鳥種清單。
 * ⚠️ 槽位數一律由 src/data/mockBirds.ts（＝ birds.json 長度）決定，
 *    不要在別處再寫死數字（舊版一處 569、一處 1500，導致尾段全是永遠的 ???）。
 */
export function useBirds() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // 只要一個 microtask，讓「載入中」畫面有機會顯示，不需要假的 300ms 延遲
    Promise.resolve().then(() => {
      if (cancelled) return;
      setBirds(mockBirds);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { birds, loading, error: null as Error | null };
}
