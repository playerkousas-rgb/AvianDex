#!/usr/bin/env node
/* ============================================================
 *  build-card-gallery.mjs —— 手機可直接打開的「成品圖」預覽頁
 * ------------------------------------------------------------
 *  為甚麼要有這一頁？
 *    用戶不想再經 Vercel／部署／開 token 才看到圖。
 *    workspace 本身有 dev server（vite），所以把「已經畫好的成品 JPG」
 *    排成一頁，用手機開 `<網址>/card-gallery.html` 就見到。
 *
 *  它不重畫卡片、不改任何文字：
 *    · 圖：public/demo/ 內已有的成品（由 scripts/render-card-png.py 畫）
 *    · 版面說明：只寫「這張卡有哪幾段」，不是新文案
 *
 *  用法：
 *    node scripts/build-card-gallery.mjs
 *    node scripts/build-card-gallery.mjs 0013 0004      # 指定卡的標題列
 * ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const demoDir = path.join(root, 'public/demo');

/* 成品圖命名：card-<NO>-new.jpg（PIL 畫的），舊的 card-<NO>.png 不列，
   免得新舊混在一起又令人以為「睇極都係舊卡」。 */
const files = existsSync(demoDir)
  ? readdirSync(demoDir).filter((f) => /^card-\d{4}-new\.(jpg|png)$/.test(f)).sort()
  : [];

const idx = JSON.parse(readFileSync(path.join(root, 'src/data/explorerIndex.json'), 'utf8'));
const birds = idx.birds;

const cards = files.map((f) => {
  const id = f.match(/card-(\d{4})/)[1];
  const e = birds[id] || {};
  return {
    id,
    file: f,
    zh: e.z || '',
    en: e.e || '',
    sci: e.s || '',
    order: e.oz || '',
    family: e.fz || '',
  };
});

const html = `<!doctype html>
<html lang="zh-Hant-HK">
<head>
<meta charset="utf-8">
<title>圖鑑資訊卡 · 成品圖預覽</title>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<style>
  :root{ --bg:#14180f; --ink:#eef2ea; --dim:#9aa892; --acc:#d8a21c; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
    font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;
    -webkit-text-size-adjust:100%}
  header{padding:16px 16px 10px;border-bottom:1px solid rgba(255,255,255,.1);position:sticky;top:0;
    background:rgba(20,24,15,.94);backdrop-filter:blur(8px);z-index:2}
  h1{margin:0;font-size:16px;letter-spacing:.02em}
  header p{margin:4px 0 0;font-size:12px;color:var(--dim);line-height:1.5}
  main{padding:14px 12px 48px;display:flex;flex-direction:column;gap:22px}
  figure{margin:0}
  figure a{display:block}
  img{display:block;width:100%;height:auto;border-radius:12px;
    box-shadow:0 6px 20px rgba(0,0,0,.45);background:#0b0d08}
  figcaption{display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;
    font-size:12px;color:var(--dim);padding:8px 2px 0}
  figcaption b{font-family:ui-monospace,monospace;color:var(--acc);font-size:12px}
  figcaption .zh{color:var(--ink);font-weight:700;font-size:13px}
  .empty{padding:32px 16px;color:var(--dim);font-size:13px;line-height:1.7}
  @media (min-width:760px){
    main{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));
      gap:22px;max-width:1200px;margin:0 auto}
  }
</style>
</head>
<body>
<header>
  <h1>圖鑑資訊卡 · 成品圖</h1>
  <p>1200×1600 原始尺寸 · 點圖可放大或另存 · 一套版式按「目」換色</p>
</header>
<main>
${cards.length === 0
  ? '<p class="empty">public/demo/ 內未有成品圖。<br>先跑 <code>python3 scripts/render-card-png.py 0013</code>。</p>'
  : cards.map((c) => `  <figure>
    <a href="/demo/${c.file}" target="_blank" rel="noopener">
      <img src="/demo/${c.file}" alt="${c.zh} 資訊卡" loading="lazy" decoding="async">
    </a>
    <figcaption>
      <b>NO.${c.id}</b>
      <span class="zh">${c.zh}</span>
      <span>${c.en}</span>
      <span>${c.order} · ${c.family}</span>
    </figcaption>
  </figure>`).join('\n')}
</main>
</body></html>
`;

const out = path.join(root, 'tools/card-pages/card-gallery.html');
writeFileSync(out, html, 'utf8');
console.log(`已寫入 tools/card-pages/card-gallery.html（${cards.length} 張：${cards.map((c) => c.id).join(', ') || '無'}）`);
