import { canFlipInfoCard, hasFeatureCrops, hasInfoCard, infoCardLayout } from './infoCards';

export const MOBILE_CARD_PAGES = [
  { key: 'artwork', zh: '插畫', en: 'Artwork' },
  { key: 'features', zh: '像素圖及四部位', en: 'Pixel art & features' },
  { key: 'scores', zh: '能力值', en: 'Scores' },
  { key: 'distribution', zh: '分佈圖', en: 'Distribution' },
  { key: 'similar', zh: '容易相混的鳥', en: 'Similar birds' },
] as const;
export type MobileCardPage = typeof MOBILE_CARD_PAGES[number]['key'] | 'original';

/**
 * 手機分頁。
 *
 *  - slim 模板（已登記）→ 插畫／四部位／能力值／分佈圖／易混鳥五頁
 *    （0041–0043 也是 slim：三張卡的模組位置與模板一致，照樣切五頁，
 *      見 infoCards.ts 的 hasFeatureCrops 說明；不要再換成完整資訊卡）
 *  - 舊版完整卡或**未登記但可能已上載**的卡 → 插畫 + 完整資訊卡
 *  - 只有確認 R2 上沒有（canFlipInfoCard 為 false）→ 只有插畫
 *
 * 未登記的卡照樣給「完整資訊卡」一頁，是因為 0022–0100 早已上載 R2 但
 * infoCards.json 未更新；若照舊只給插畫，用戶連檢查那張卡在不在的入口都沒有。
 */
export function mobileCardPages(id: string, infoAvailable = false) {
  if (!canFlipInfoCard(id)) return [MOBILE_CARD_PAGES[0]];
  if (hasInfoCard(id) && infoCardLayout(id) === 'slim' && hasFeatureCrops(id)) {
    return [...MOBILE_CARD_PAGES];
  }
  /* 已登記的舊版卡，或未登記但已經成功讀到圖的卡 → 多一頁「完整資訊卡」。
     未登記又未讀到圖時只留插畫，避免每次點圖都翻出一張空頁；要檢查某張卡
     在不在，用右上角 ⟳／放大掣，讀到就自動多出這一頁。 */
  if (hasInfoCard(id) || infoAvailable) {
    return [MOBILE_CARD_PAGES[0], { key: 'original' as const, zh: '完整資訊卡', en: 'Info card' }];
  }
  return [MOBILE_CARD_PAGES[0]];
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

/** Match the phone screen to the active content instead of letterboxing it in a fixed tall box. */
export function mobileCardAspect(page: MobileCardPage): number {
  if (page === 'features' || page === 'distribution' || page === 'similar') {
    const box = SLIM_PAGE_BOXES[page];
    return box[2] / box[3];
  }
  return page === 'original' ? 2 / 3 : 1;
}
