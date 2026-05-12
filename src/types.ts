eexport interface Bird {
  id: string;
  name: string;
  englishName?: string; // 👈 這裡一定要有，不然上面那段還是會報錯
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
