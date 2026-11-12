import { hasInfoCard, infoCardLayout } from './infoCards';

export const MOBILE_CARD_PAGES = [
  { key: 'artwork', zh: '插畫', en: 'Artwork' },
  { key: 'features', zh: '像素圖及四部位', en: 'Pixel art & features' },
  { key: 'scores', zh: '能力值', en: 'Scores' },
  { key: 'distribution', zh: '分佈圖', en: 'Distribution' },
  { key: 'similar', zh: '容易相混的鳥', en: 'Similar birds' },
] as const;
export type MobileCardPage = typeof MOBILE_CARD_PAGES[number]['key'] | 'original';

/** Only slice templates with confirmed coordinates. Legacy uploads have no layout metadata. */
export function mobileCardPages(id: string) {
  if (!hasInfoCard(id)) return [MOBILE_CARD_PAGES[0]];
  if (infoCardLayout(id) === 'slim') return [...MOBILE_CARD_PAGES];
  return [MOBILE_CARD_PAGES[0], { key: 'original' as const, zh: '完整資訊卡', en: 'Info card' }];
}

export function nextMobileCardPage(current: number, delta: number, count: number) {
  return Math.max(0, Math.min(count - 1, current + delta));
}

/** Viewboxes are in the compose-card.py slim template's 1024 × 1536 coordinate system. */
export const SLIM_PAGE_BOXES = {
  features: [36, 36, 952, 624],
  distribution: [36, 1186, 504, 314],
  similar: [556, 1186, 432, 314],
} as const;
