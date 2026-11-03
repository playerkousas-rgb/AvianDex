import { Bird } from '../types';
import birdsRawData from './birds.json';
import { TOTAL_SLOTS, cardUrl } from '../config';

// id → 中文名 查表（O(1)）
const nameById = new Map<string, string>(birdsRawData.map((b) => [b.id, b.name]));
const enById = new Map<string, string>(
  birdsRawData.filter((b): b is { id: string; name: string; en: string } => Boolean(b.en)).map((b) => [b.id, b.en]),
);

/** 未收錄鳥種的占位資料（與 useBirds 的 ??? 佔位保持一致） */
const PLACEHOLDER = {
  name: '???',
  scientificName: '???',
  category: '???',
  height: '???',
  weight: '???',
  description: 'This species has not been documented yet. Keep exploring to uncover its secrets!',
  habitat: '???',
  diet: '???',
  rarity: 'Common',
} as const;

/**
 * 全部圖鑑槽位。
 * - `discovered` 代表「資料庫有冇呢隻雀」（有中文名）
 * - 「有冇圖卡」由 cardImage 載入器即時判斷，唔再靠 discovered 推算
 * - imageUrl 只係預設猜測（avif），真正網址由載入器逐個副檔名試出嚟
 */
export const mockBirds: Bird[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const idString = String(i + 1).padStart(4, '0');
  const knownName = nameById.get(idString);

  return {
    id: idString,
    imageUrl: cardUrl(idString),
    ...PLACEHOLDER,
    name: knownName || PLACEHOLDER.name,
    englishName: enById.get(idString) || PLACEHOLDER.name,
    discovered: Boolean(knownName),
  };
});

/** 已收錄鳥種數（有正式中文名） */
export const SPECIES_IN_DB = mockBirds.filter((b) => b.discovered).length;
