// api/card.js
// ============================================================
// 圖卡代理（只在前端直接連 R2 失敗時才用）
// ------------------------------------------------------------
// 為什麼需要？
//   圖卡正常是由瀏覽器直接向 Cloudflare R2（*.r2.dev）取圖。
//   但學校／公司網絡常會封鎖第三方 CDN 網域，r2.dev 開發網域亦會限流，
//   結果就是「有圖但一張都 load 唔出」。
//   這個 proxy 由 Vercel 代取，前端只在直連失敗時才 fallback 過來。
//
// 用法：GET /api/card?id=0001&ext=avif
// 安全：id 只准 4 位數字、ext 只准白名單 → 不可能變成任取檔案（SSRF 防護 fail closed）
// 瘦身：只用 Node 18+ 內建 fetch，不引入任何依賴；圖片在邊緣快取一年。
// ============================================================

const R2_BASE_URL = (process.env.R2_BASE_URL || 'https://pub-a9333a974e814ccba1994639b6e79266.r2.dev').replace(/\/+$/, '');
/* 兩個資料夾，兩種圖：
     birdcards/  BIRD-DEX 插畫（569 張，卡面正面）
     aviandex/   資訊圖卡（已完成 21 張，翻轉面）
   之前預設 'aviandex' 令 569 張插畫全部 404 —— 呢個係「張張都未發現」的根因。 */
const CARD_FOLDER = process.env.R2_CARD_FOLDER || 'birdcards';
const ALLOWED_FOLDERS = new Set(['birdcards', 'aviandex']);
const ALLOWED_EXT = new Set(['avif', 'webp', 'jpg', 'jpeg', 'png']);

function bad(res, status, message) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify({ error: message }));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return bad(res, 405, '請使用 GET 請求');
  }

  const { id, ext, folder } = req.query || {};
  const idStr = String(id || '').trim();

  // fail closed：只接受 1–4 位純數字，統一補成 4 位
  if (!/^\d{1,4}$/.test(idStr)) return bad(res, 400, 'id 必須是 1–4 位數字，例如 ?id=0021');
  const paddedId = idStr.padStart(4, '0');

  const extStr = String(ext || 'avif').trim().toLowerCase();
  if (!ALLOWED_EXT.has(extStr)) return bad(res, 400, '不支援的圖片格式');

  /* fail closed：folder 只准白名單，防止用參數亂讀 R2 其他路徑 */
  const folderStr = String(folder || CARD_FOLDER).trim();
  if (!ALLOWED_FOLDERS.has(folderStr)) return bad(res, 400, '不支援的資料夾');

  const target = `${R2_BASE_URL}/${folderStr}/${paddedId}.${extStr}`;

  let upstream;
  try {
    upstream = await fetch(target, {
      headers: { Accept: 'image/*' },
      // Vercel 邊緣快取會處理重複請求，這裡多一層保險
      cache: 'force-cache',
    });
  } catch (err) {
    return bad(res, 502, `上游 R2 連線失敗：${err.message}`);
  }

  if (!upstream.ok) {
    return bad(res, upstream.status === 404 ? 404 : 502, `R2 回應 ${upstream.status}`);
  }

  const contentType = upstream.headers.get('content-type') || `image/${extStr}`;
  if (!contentType.startsWith('image/')) {
    return bad(res, 502, 'R2 回傳的不是圖片');
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', String(buffer.length));
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
  res.setHeader('X-Card-Source', 'r2-proxy');
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).send(buffer);
}
