import data from '../data/infoCards.json';

/**
 * 這隻鳥有冇資訊圖卡（翻轉面）？
 * 名單由 src/data/infoCards.json 提供，所以不用逐隻去探測 R2（探測＝一堆 404、r2.dev 會限流）。
 * 沒有資訊圖卡 → 介面完全不出現翻轉掣，也不翻出一個「文字簡版」，只看插圖。
 */
const SET = new Set<string>((data as { ids: string[] }).ids);

/** 試做／預覽用的本機資訊圖卡（public/demo/）。還沒上傳 R2 的新版圖卡先放這裡，翻轉面直接讀本機檔。
 *  新版手機精簡圖卡目前只有 0058 一張樣品；批量出卡上傳 R2 後，改填 infoCards.json，這裡可以清空。 */
const LOCAL_INFO: Record<string, string> = {
  '0058': `${import.meta.env.BASE_URL}demo/info-0058.webp`,
};

export function localInfoCardUrl(id: string | undefined | null): string | undefined {
  return id ? LOCAL_INFO[id.padStart(4, '0')] : undefined;
}

export function hasInfoCard(id: string | undefined | null): boolean {
  return !!id && (SET.has(id.padStart(4, '0')) || !!LOCAL_INFO[id.padStart(4, '0')]);
}

/** Only cards composed with the slim template may use its panel viewports. */
export function infoCardLayout(id: string): 'slim' | 'legacy' {
  return id.padStart(4, '0') === '0058' ? 'slim' : 'legacy';
}
