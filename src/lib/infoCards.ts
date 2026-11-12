import data from '../data/infoCards.json';

/**
 * 這隻鳥有冇資訊圖卡（翻轉面）？
 * 名單由 src/data/infoCards.json 提供，所以不用逐隻去探測 R2（探測＝一堆 404、r2.dev 會限流）。
 * 沒有資訊圖卡 → 介面完全不出現翻轉掣，也不翻出一個「文字簡版」，只看插圖。
 */
const SET = new Set<string>((data as { ids: string[] }).ids);

export function hasInfoCard(id: string | undefined | null): boolean {
  return !!id && SET.has(id.padStart(4, '0'));
}
