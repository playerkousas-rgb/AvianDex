import { Bird } from '../types';
import birdsRawData from './birds.json';

const R2_DOMAIN = "https://pub-a9333a974e814ccba1994639b6e79266.r2.dev";
const FOLDER = "aviandex";
const TOTAL_SLOTS = 1500;

// 將結果強制轉為 any，再轉回 Bird[]，這會讓 TS 停止檢查屬性是否齊全
export const mockBirds: Bird[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const idNumber = i + 1;
  const idString = String(idNumber).padStart(4, '0');
  const knownInfo = birdsRawData.find(b => b.id === idString);

  return {
    id: idString,
    name: knownInfo?.name || '???',
    imageUrl: `${R2_DOMAIN}/${FOLDER}/${idString}.avif`,
  } as any; // 👈 關鍵：加上 as any，強制讓 TS 忽略缺少的 scientificName 等欄位
}) as unknown as Bird[];
