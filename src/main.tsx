import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/* ============================================================
 *  Service Worker：離線可用 ＋ 一打開就更新
 * ------------------------------------------------------------
 *  用戶的目標是「加入主畫面之後，一打開就自動更新，像一本隨身圖鑑」。
 *
 *  所以這裡做三件事：
 *    1 註冊（本身已有）
 *    2 每次載入都主動 update()：問瀏覽器「sw.js 有冇新版」
 *       —— 只在 load 時註冊是不夠的，瀏覽器會自己在背景檢查，
 *          但可能要等 24 小時；主動 update 令它每次開都查一次。
 *    3 發現有新 sw 在等待 → 直接 skipWaiting + 重新載入一次。
 *       圖鑑是「資料型」App，不是有未存草稿的編輯器，
 *       所以主動換版比留住舊畫面更符合用戶期望；
 *       而且換版後文字／圖卡都會重新由快取提供，不會不見。
 * ============================================================ */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        /* 2. 每次開都問一次有沒有新版 */
        void reg.update().catch(() => undefined);

        /* 3. 有新 sw 下載好、正等待接手 → 叫它立即接手，然後重整一次 */
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              sw.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(() => {
        /* 註冊失敗不影響正常使用（例如 http 環境不支援） */
      });

    /* 新的 sw 接手之後，重整一次以載入新資產（只做一次，避免迴圈） */
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
