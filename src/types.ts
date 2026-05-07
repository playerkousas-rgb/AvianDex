export interface Bird {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  height: string;
  weight: string;
  description: string;
  imageUrl: string;
  habitat: string;
  diet: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  discovered: boolean;
}
