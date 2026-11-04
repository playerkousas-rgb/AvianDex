import type { Bird } from '../types';

/**
 * 圖鑑的三種次序。
 *
 *   ebird    = 跟 eBird / Clements 的演化排序（目 → 科 → 種），英文為權威
 *   pokedex  = 原本的固定編號次序（NO.0001 → NO.0569）＝ R2 圖卡檔名次序
 *   chinese  = 中文名筆劃／Unicode 次序（只影響顯示，不改任何編號）
 *
 * ⚠️ 次序只影響「畫面上排第幾」，**NO. 編號永遠不變**，
 *    因為編號 = R2 檔名 `avianded/NNNN.avif`，一改就全部對不上。
 */
export type SortMode = 'ebird' | 'pokedex' | 'chinese';

const byId = (a: Bird, b: Bird) => a.id.localeCompare(b.id);

export function sortBirds(list: Bird[], mode: SortMode): Bird[] {
  const copy = [...list];
  if (mode === 'pokedex') return copy.sort(byId);

  if (mode === 'chinese') {
    return copy.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant-HK') || byId(a, b));
  }

  // eBird：有 taxonOrder 的跟數字，未對上的（`???` 佔位）排最後、內部按編號
  return copy.sort((a, b) => {
    const ta = a.taxonomy?.taxonOrder;
    const tb = b.taxonomy?.taxonOrder;
    if (ta != null && tb != null && ta !== tb) return ta - tb;
    if (ta != null && tb == null) return -1;
    if (ta == null && tb != null) return 1;
    return byId(a, b);
  });
}

/**
 * 搜尋（以英文名為主）。
 *
 * 評分：英文俗名完全相同 > 學名完全相同 > 英文名開頭 > 英文名字中包含
 *       > 中文名完全相同 > 中文名包含 > 學名包含 > 編號
 *
 * 所以打 `dove` 會先出 Spotted Dove，打 `珠頸` 都搵得到（中文仍然可搜，只係排後）。
 */
export function searchBirds(list: Bird[], rawQuery: string): Bird[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return list;

  const scored: { bird: Bird; score: number }[] = [];

  for (const bird of list) {
    const en = (bird.taxonomy?.comName || bird.englishName || '').toLowerCase();
    const sci = (bird.taxonomy?.sciName || bird.scientificName || '').toLowerCase();
    const zh = bird.name.toLowerCase();
    let score = 0;

    if (en && en === q) score = 100;
    else if (sci && sci === q) score = 95;
    else if (en.startsWith(q)) score = 88;
    else if (en && en.includes(q)) score = 80;
    else if (zh === q) score = 70;
    else if (zh.includes(q)) score = 60;
    else if (sci.includes(q)) score = 50;
    else if (bird.id.includes(q)) score = 40;
    else if (bird.taxonomy?.family?.toLowerCase().includes(q)) score = 30;
    else if (bird.taxonomy?.order?.toLowerCase().includes(q)) score = 25;

    if (score > 0) scored.push({ bird, score });
  }

  return scored.sort((a, b) => b.score - a.score || byId(a.bird, b.bird)).map((x) => x.bird);
}
