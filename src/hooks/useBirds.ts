import { useState, useEffect } from 'react';
import { Bird } from '../types';
import { mockBirds } from '../data/mockBirds';

const TOTAL_SLOTS = 151; // Pre-generate slots so you just need to drop PNGs

export function useBirds() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirds = async () => {
      setLoading(true);
      // Simulate network
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allBirds: Bird[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
        const id = String(i + 1).padStart(4, '0');
        const existing = mockBirds.find(b => b.id === id);
        
        // If data exists in backend/mock, use it
        if (existing) return existing;
        
        // Otherwise create a placeholder slot.
        // It will automatically display the image if {id}.png is dropped into public/images/
        return {
          id,
          name: '???',
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
