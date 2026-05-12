import { useState, useEffect } from 'react';
import { Bird } from '../types';
import { mockBirds } from '../data/mockBirds';

const TOTAL_SLOTS = 151; // 預產生 151 個槽位

export function useBirds() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirds = async () => {
      setLoading(true);
      // 模擬網路延遲
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allBirds: Bird[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
        const id = String(i + 1).padStart(4, '0');
        const existing = mockBirds.find(b => b.id === id);
        
        // 如果 mock 資料中已經有這隻鳥，就使用現有資料
        if (existing) return existing;
        
        // 否則創建一個占位符（加上 englishName 欄位以符合型別檢查）
        return {
          id,
          name: '???',
          englishName: '???', // 👈 補上這一行，解決 TS 報錯
          scientificName: '???',
          category: '???',
          height: '???',
          weight: '???',
          description: 'This species has not been documented yet. Keep exploring to uncover its secrets!',
          imageUrl: `/images/${id}.png`,
          habitat: '???',
          diet: '???',
          rarity: 'Common',
          discovered: false,
        };
      });

      setBirds(allBirds);
      setLoading(false);
    };

    fetchBirds();
  }, []);

  return { birds, loading, error: null };
}
