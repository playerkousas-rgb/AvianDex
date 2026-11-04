export interface Bird {
  id: string;
  name: string;
  englishName?: string;
  scientificName: string;
  category: string;
  height: string;
  weight: string;
  description: string;
  imageUrl: string;
  habitat: string;
  diet: string;
  rarity: string;
  discovered: boolean;
  /** eBird/Clements 權威分類（有對上才有；見 src/data/birdTaxonomy.json） */
  taxonomy?: {
    speciesCode: string;
    comName: string;
    sciName: string;
    order: string;
    family: string;
    /** eBird/Clements 演化排序號（目 → 科 → 種） */
    taxonOrder: number;
  };
}

// 如果你還有其他型別定義，接在下面即可
