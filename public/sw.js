// public/sw.js
// ============================================================
// AvianDex Service Worker —— 野外離線用
// ------------------------------------------------------------
// 為甚麼要 Service Worker？
//   用戶的目標是「帶去郊野公園，取代翻書」。郊野公園冇訊號，
//   所以 app 外殼（HTML／JS／CSS）同已看過的圖卡都要留在本機。
//
// 策略：
//   · app 外殼（navigation／js／css）：network-first，成功就更新快取
//   · 圖卡（R2／BIRD-DEX 2／public demo）：cache-first，成功就長留
//   · 其他（API）：不攔截，避免影響辨識功能
//   · 地圖／外部連結：不攔截
// ============================================================

/* 版本號：build 時由 vite.config.ts 的 stampServiceWorker 把 __BUILD_ID__ 換成「部署 commit／時間」。
   → 每次部署 sw.js 的內容都不同，瀏覽器才會偵測到「有新版 sw」→ 跳出「立即更新」。
   （舊做法是手動改 v5 → v6，忘記改就永遠不更新，已安裝到主畫面的用戶會一直停在舊版。）
   快取名跟著版本走：activate 時只保留「這一版的外殼 + 圖卡快取」，舊外殼自動清走。 */
const BUILD = '__BUILD_ID__';
const SHELL = 'aviandex-shell-' + BUILD;
const CARDS = 'aviandex-cards-v1';  /* 圖卡不動：內容以 URL 區分，不需要清 */

const SHELL_URLS = [
  '/', '/index.html', '/manifest.webmanifest',
  '/icons/favicon-v2.ico', '/icons/favicon-32-v2.png', '/icons/apple-touch-icon-v2.png',
  '/icons/icon-192-v2.png', '/icons/icon-512-v2.png', '/icons/icon-maskable-192-v2.png', '/icons/icon-maskable-512-v2.png',
];

const CARD_HOSTS = ['r2.dev', 'birdex2.vercel.app', 'localhost'];

self.addEventListener('install', (event) => {
  /* 不再 skipWaiting：新版先停在 waiting，由畫面彈「立即更新」，用戶按了才接手（跟 SCOUTBOOK 一樣）。
     預快取用 cache:'reload'，避免拿 HTTP 快取的舊檔填新快取。 */
  event.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await Promise.allSettled(SHELL_URLS.map((u) => c.add(new Request(u, { cache: 'reload' }))));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![SHELL, CARDS].includes(k))
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  /* main.tsx 發現有新版本時會發這個訊息，叫新 sw 立即接手 */
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data?.type === 'PRECACHE_SHELL') {
    event.waitUntil(
      caches.open(SHELL).then((c) => c.addAll(['/', '/index.html', '/manifest.webmanifest']).catch(() => undefined)),
    );
  }
});

function isCard(url) {
  if (!/\.(avif|webp|png|jpe?g)$/i.test(url.pathname)) return false;
  return CARD_HOSTS.some((h) => url.hostname.includes(h)) || url.pathname.includes('/demo/');
}

function isShell(url, request) {
  if (request.mode === 'navigate') return true;
  return /\.(js|css|woff2?|json)$/i.test(url.pathname) && url.origin === self.location.origin;
}

/**
 * 導覽請求（即「打開 App」）用 network-first，並且**每次**都 bypass HTTP 快取。
 *
 * 為甚麼要 cache: 'no-store'？
 *   Vercel 的 index.html 有 s-maxage，瀏覽器可能直接用本機 HTTP 快取，
 *   連 service worker 的 network-first 都拿不到新版。
 *   加了 no-store，每次開 App 都真的去問伺服器一次 —— 這就是用戶要的
 *   「一打開就更新」。網絡失敗時照舊回退快取，所以野外仍然可用。
 */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isCard(url)) {
    event.respondWith(
      caches.open(CARDS).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        try {
          const res = await fetch(request);
          // 只快取成功的圖；404 不要留
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch (err) {
          const any = await cache.match(request, { ignoreSearch: true });
          if (any) return any;
          throw err;
        }
      }),
    );
    return;
  }

  if (isShell(url, request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL);
        try {
          const res = await fetch(request.mode === 'navigate' ? new Request(request, { cache: 'no-store' }) : request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch (err) {
          const hit = await cache.match(request) || await cache.match('/index.html');
          if (hit) return hit;
          throw err;
        }
      })(),
    );
  }
});
