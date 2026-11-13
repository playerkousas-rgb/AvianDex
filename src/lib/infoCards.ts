import data from '../data/infoCards.json';

/**
 * 這隻鳥的資訊圖卡是否已登記（`src/data/infoCards.json`）。
 *
 * 名單只影響「用哪個模板顯示」，不再影響「可否翻轉」：
 *   - 登記 + slim  → 手機分頁（插畫／四部位／能力值／分佈圖／易混鳥）
 *   - 登記 + 舊版  → 插畫 + 原圖
 *   - 未登記       → 插畫 + 原圖（照樣可翻，見 canFlipInfoCard）
 *
 * 為甚麼不再用名單當閘門？
 *   2026-11 用戶回報：0022–0100 早已上載 R2，但 0040 等卡連翻轉掣都沒有，
 *   因為名單只有 0001–0021；名單未更新就等於整批卡「在 app 裡不存在」。
 *   所以改為「寧願翻開後見到『未上載』，都好過連檢查入口都無」。
 */
const SET = new Set<string>((data as { ids: string[] }).ids);

/** 試做／預覽用的本機資訊圖卡（public/demo/）。 */
const LOCAL_INFO: Record<string, string> = {
  '0058': `${import.meta.env.BASE_URL}demo/info-0058.webp`,
};

/**
 * 已確認「R2 上真的沒有」的編號。
 *
 * 只有在你確定某隻雀短期內不會有資訊圖卡時才加入，例如剛失敗過的批次。
 * 名單為空 = 每隻雀都可以翻，翻開後由載入器回報有／無（404 只會試一次，
 * 結果會記在快取，同一隻雀不會重複打）。
 */
const KNOWN_ABSENT = new Set<string>([]);

export function localInfoCardUrl(id: string | undefined | null): string | undefined {
  return id ? LOCAL_INFO[id.padStart(4, '0')] : undefined;
}

/** 已登記在 infoCards.json（或本機 demo）的卡。 */
export function hasInfoCard(id: string | undefined | null): boolean {
  return !!id && (SET.has(id.padStart(4, '0')) || !!LOCAL_INFO[id.padStart(4, '0')]);
}

/**
 * 可否翻轉看資訊圖卡。
 *
 * 原則：有圖就給翻，沒有圖（或已知一定沒有）才不給翻。
 * 未登記但可能已上載 R2 的卡一律允許翻 —— 翻開後由 requestInfoCard() 判斷
 * 200 還是 404，並把結果記住。純文字簡版（用 cardCopy 即時砌）已經廢除，
 * 所以背面不會出現假的「資料卡」。
 */
export function canFlipInfoCard(id: string | undefined | null): boolean {
  if (!id) return false;
  const padded = id.padStart(4, '0');
  if (LOCAL_INFO[padded]) return true;
  return !KNOWN_ABSENT.has(padded);
}

/** Only cards composed with the slim template may use its panel viewports. */
export function infoCardLayout(id: string): 'slim' | 'legacy' {
  const padded = id.padStart(4, '0');
  const layouts = data.layouts as Record<string, string>;
  return padded === '0058' || layouts[padded] === 'slim' ? 'slim' : 'legacy';
}

/**
 * 這張卡在「四部位／易混鳥」兩頁有沒有可信的裁切座標。
 *
 * compose-card.py 產生的 slim 卡全部 1024×1536、分區位置固定，所以單看模板
 * 就夠 —— 包括 0041–0043。
 *
 * 2026-11 用戶回報：0041–0043 翻到「四部位」及「易混鳥」兩頁時，整張長卡被塞
 * 進那一頁。原因是先前把「這三張沒有本機 spec 的 featureCrops」誤當成「卡上
 * 沒有那個分區」，於是把該兩頁換成完整資訊卡。實際上三張已交付的卡都是 slim
 * 版式：地圖／易混鳥模組邊框落在 x 41–987、y 1191–1499，四部位圓圈落在
 * y 432–660，與 SLIM_PAGE_BOXES 吻合（已逐張量三張卡的邊框位置）。缺的只是
 * 「重新生成這張卡」所需的座標，不是「顯示這張卡」所需的座標。
 */
export function hasFeatureCrops(id: string | undefined | null): boolean {
  return !!id;
}

/** Extend the confirmed slim panel surface into mobile letterboxing without stretching art/text. */
export function infoCardPanelColor(id: string): string {
  const colors = data.panelColors as Record<string, string>;
  return colors[id.padStart(4, '0')] || '#102c3d';
}
