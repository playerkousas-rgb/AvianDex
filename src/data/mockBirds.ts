import { Bird } from '../types';
import birdsRawData from './birds.json';

const R2_DOMAIN = "https://pub-a9333a974e814ccba1994639b6e79266.r2.dev";
const FOLDER = "aviandex";
const TOTAL_SLOTS = 1500;

// id → 中文名 查表（O(1)；舊版每隻鳥线性 find 一遍，1500×569 次比對）
const nameById = new Map<string, string>(birdsRawData.map((b) => [b.id, b.name]));

// 未收錄鳥種的占位資料（與 useBirds.ts 的 ??? 占位保持一致）
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
  discovered: false,
} as const;

export const mockBirds: Bird[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const idNumber = i + 1;
  const idString = String(idNumber).padStart(4, '0');
  const knownName = nameById.get(idString);

  return {
    id: idString,
    imageUrl: `${R2_DOMAIN}/${FOLDER}/${idString}.avif`,
    ...PLACEHOLDER,
    name: knownName || PLACEHOLDER.name, // 已收錄用真名，未收錄用 ???
  };
});
