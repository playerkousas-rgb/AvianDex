import { Bird } from '../types';
import birdsRawData from './birds.json'; // 引入 JSON

const R2_DOMAIN = "https://pub-a9333a974e814ccba1994639b6e79266.r2.dev";
const FOLDER = "aviandex";
const TOTAL_SLOTS = 1500;

export const mockBirds: Bird[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const idNumber = i + 1;
  const idString = String(idNumber).padStart(4, '0');
  
  // 在 JSON 中尋找對應的鳥類資料
  const knownInfo = birdsRawData.find(b => b.id === idString);

  return {
    id: idString,
    name: knownInfo?.name || '???',
    imageUrl: `${R2_DOMAIN}/${FOLDER}/${idString}.avif`,
    // 刪除了所有會報錯的 scientificName, category, description 等等
  };
});
