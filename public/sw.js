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

const SHELL = 'aviandex-shell-v1';
const CARDS = 'aviandex-cards-v1';

const CARD_HOSTS = ['r2.dev', 'birdex2.vercel.app', 'localhost'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/index.html']).catch(() => undefined)));
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
          const res = await fetch(request);
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
