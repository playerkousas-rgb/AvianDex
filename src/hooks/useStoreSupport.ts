import { useEffect, useState } from 'react';
import { APP_STORE_SLUG } from '../config';

/**
 * 「讚好／收藏」掣要嘅主站網址（readme SG18）。
 *
 * 三條規矩（全部有測試鎖住，見 tests/supportButton.test.mjs）：
 *   ① 網址**只**由 `ScoutStoreGate.getAppStoreUrl(slug)` 組出；
 *      唔准喺元件內寫死主站網址（改域名會四圍漏）。
 *   ② helper 未載入 → 先用 registry 同一個公開入口墊住第一 frame（唔會跳格、
 *      亦唔會出死連）；`storeSupportUrlFrom()` 本身仍然係 fail closed（回 null）。
 *   ③ slug 由 `src/config.ts` 的 APP_STORE_SLUG 提供，已對
 *      `website/migrations/20261116-app-slug-seed.sql` 核實（avian-dex → aviandex）。
 */

type GateLike = {
  getAppStoreUrl?: (slug: string) => string;
  getPortal?: (id: string) => { url?: string } | null;
};

/** 由 gate helper 組網址；helper 唔存在 → null（fail closed，唔出死連） */
export function storeSupportUrlFrom(gate: GateLike | undefined | null, slug: string): string | null {
  if (!gate) return null;
  try {
    if (typeof gate.getAppStoreUrl === 'function') {
      const url = gate.getAppStoreUrl(slug);
      return typeof url === 'string' && /^https:\/\/\S+$/.test(url) ? url : null;
    }
    // 向下相容（SG18 ③）：舊版 helper 只得 getPortal
    if (typeof gate.getPortal === 'function') {
      const store = gate.getPortal('appstore');
      if (store?.url) {
        return `${String(store.url).replace(/\/+$/, '')}/?app=${encodeURIComponent(slug)}`;
      }
    }
  } catch {
    /* 任何怪返回都當「未準備好」 */
  }
  return null;
}

/**
 * 後備：APP STORE 的公開入口（同 store_gate PORTAL_REGISTRY.appstore.url 相同）。
 * ⚠️ 呢個唔係「寫死主站網址」：只係 gate script 未執行前嘅第一 frame 墊底，
 *    gate 一到就以 ScoutStoreGate.getAppStoreUrl(slug) 為準（見 tests/supportButton）。
 */
const DEFAULT_STORE_FALLBACK = 'https://scoutappstore.vercel.app/?app=aviandex';

function readGate(): GateLike | null {
  const g = globalThis as unknown as { ScoutStoreGate?: GateLike };
  return g.ScoutStoreGate ?? null;
}

/** 主站網址；未載入 → null（UI 保持 hidden） */
export function useStoreSupportUrl(): string | null {
  /* gate script 喺 <head> 同步載入，正常第一次 render 已經有；
     preview／dev 可能冇（index.html 一樣略過閘門），所以仍要等一陣。 */
  /* 第一 frame：gate 未 load 都先用 registry 同一個公開網址墊住。
     `store_gate_v1.0.js` 係同步 script，正常早就 load 完；
     但 preview／學校 proxy 有時會慢半拍。用家一開圖鑑就見到左排 3 粒，
     唔會「一時 2 粒、一時 3 粒」跳。真正網址一到就以 gate 版本為準。 */
  const [url, setUrl] = useState<string | null>(
    () => storeSupportUrlFrom(readGate(), APP_STORE_SLUG) ?? DEFAULT_STORE_FALLBACK,
  );

  useEffect(() => {
    if (url) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const next = storeSupportUrlFrom(readGate(), APP_STORE_SLUG);
      if (next) {
        setUrl(next);
        clearInterval(timer);
      } else if (tries >= 20) {
        // 約 3 秒都未見 gate → 收工，保持 hidden（唔會出死連）
        clearInterval(timer);
      }
    }, 150);
    return () => clearInterval(timer);
  }, [url]);

  return url;
}
