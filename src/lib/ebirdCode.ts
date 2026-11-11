import { ENTRIES } from './explorer';

/**
 * eBird speciesCode ↔ 本圖鑑 NO. 編號 的對照。
 *
 * 為甚麼需要這一層？
 *   eBird 的所有 API 都只認 speciesCode（例如 bkbkin1），
 *   而我們的地圖與圖鑑用的是 NO.（0001–0569）。
 *   兩邊要互通（「搵隻雀 → 邊個熱點有」／「點熱點 → 有咩雀」），
 *   就必須有這張表。
 *
 * 資料來源：src/data/explorerIndex.json 內每一隻雀的 `code` 欄位
 * （569 隻之中有 566 隻有 code；餘下 3 隻在 eBird 沒有對應代碼，
 *  查詢時會回「沒有紀錄」，不會假裝有）。
 */

let cache: { byCode: Map<string, string>; byId: Map<string, string> } | null = null;

function build() {
  if (cache) return cache;
  const byCode = new Map<string, string>();
  const byId = new Map<string, string>();
  for (const [id, e] of Object.entries(ENTRIES)) {
    const code = e.code;
    if (!code) continue;
    byCode.set(code, id);
    byId.set(id, code);
  }
  cache = { byCode, byId };
  return cache;
}

/** eBird code → NO.（找唔到回 null，不要亂猜） */
export function idForCode(code: string | undefined | null): string | null {
  if (!code) return null;
  return build().byCode.get(code) ?? null;
}

/** NO. → eBird code */
export function codeForId(id: string): string | null {
  return build().byId.get(id) ?? null;
}

/** eBird code → 中文名（唔在本圖鑑內就回原本的英文名） */
export function nameForCode(code: string, fallback?: string): string {
  const id = idForCode(code);
  if (id) return ENTRIES[id].z;
  return fallback || code;
}
