export interface Bird {
  id: string;
  name: string;
  imageUrl: string;
  // 以下全部加個問號，代表「選填」，就不會報錯了
  scientificName?: string;
  category?: string;
  height?: string;
  weight?: string;
  description?: string;
  habitat?: string;
  diet?: string;
  rarity?: string;
  discovered?: boolean;
}
