// api/ebird.js
// ============================================================
// eBird 觀察紀錄代理（保護 EBIRD_API_KEY 不外洩到前端）
// 用法：GET /api/ebird?hotspot=L922779
//      GET /api/ebird?region=HK
//      GET /api/ebird?near=22.47,114.05&dist=25&back=14&max=200   ← 地圖用
//      GET /api/ebird?hotspots=1&region=HK                         ← 熱點清單
//
// ⚠️ 瘦身守則：本檔只使用 Node 18+ 內建 global fetch，
//    嚴禁再加回 node-fetch 等第三方依賴。
// ============================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '請使用 GET 請求' });
  }

  const apiKey = process.env.EBIRD_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'EBIRD_API_KEY 未設定',
      hint: '請至 Vercel Settings 設定 EBIRD_API_KEY',
    });
  }

  const { hotspot, region = 'HK', days = '14', max = '50', near, dist, back, hotspots } = req.query || {};

  /* ------------------------------------------------------------
   * 地圖用：熱點清單（含經緯度）
   *   GET /api/ebird?hotspots=1&region=HK
   * 熱點座標比逐點查詢重要 —— 舊版地圖的座標是手寫的近似值，
   * 用官方 hotspot 座標才能與 eBird 的觀察紀錄對得上。
   * ------------------------------------------------------------ */
  if (hotspots) {
    try {
      const r = await fetch(
        `https://api.ebird.org/v2/ref/hotspot/${encodeURIComponent(region)}?fmt=json&locale=zh`,
        { headers: { 'X-eBirdApiToken': apiKey } },
      );
      const text = await r.text();
      if (!r.ok) return res.status(r.status).json({ error: 'eBird 熱點 API 錯誤', details: text.slice(0, 300) });
      const rows = JSON.parse(text);
      const spots = (rows || []).map((h) => ({
        locId: h.locId,
        name: h.name,
        lat: h.lat,
        lng: h.lng,
        numSpecies: h.numSpeciesAllTime ?? h.numSpecies ?? null,
        lastObsDt: h.latestObsDt || null,
      }));
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
      return res.status(200).json({ region, count: spots.length, hotspots: spots });
    } catch (e) {
      return res.status(500).json({ error: 'eBird 熱點通訊失敗', details: e.message });
    }
  }

  let url;
  /* ------------------------------------------------------------
   * 地圖用：以座標為中心的近期觀察
   *   GET /api/ebird?near=22.47,114.05&dist=25
   * dist 上限 50 km（eBird 官方限制），所以前端要用多個圓心拼成覆蓋網。
   * back 上限 30 日，避免一次拉太多。
   * ------------------------------------------------------------ */
  if (near) {
    const [latRaw, lngRaw] = String(near).split(',');
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'near 格式應為 lat,lng' });
    }
    const d = Math.min(50, Math.max(1, Number(dist) || 25));
    const b = Math.min(30, Math.max(1, Number(back) || Number(days) || 14));
    const m = Math.min(500, Math.max(1, Number(max) || 200));
    url = `https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${d}&back=${b}&maxResults=${m}`;
  } else if (hotspot) {
    // 熱點近期觀察
    url = `https://api.ebird.org/v2/data/obs/${encodeURIComponent(hotspot)}/recent?back=${days}&maxResults=${max}`;
  } else {
    // 地區近期觀察
    url = `https://api.ebird.org/v2/data/obs/${encodeURIComponent(region)}/recent?back=${days}&maxResults=${max}`;
  }

  try {
    const r = await fetch(url, {
      headers: { 'X-eBirdApiToken': apiKey },
    });
    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({
        error: 'eBird API 錯誤',
        details: text.slice(0, 300),
      });
    }
    let data;
    try { data = JSON.parse(text); } catch {
      return res.status(502).json({ error: 'eBird 回傳非 JSON' });
    }

    // 標準化欄位
    const observations = (data || []).map((o) => ({
      speciesCode: o.speciesCode,
      comName: o.comName,
      sciName: o.sciName,
      locName: o.locName,
      obsDt: o.obsDt,
      howMany: o.howMany,
      lat: o.lat,
      lng: o.lng,
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({
      hotspot: hotspot || null,
      region: hotspot ? null : region,
      count: observations.length,
      observations,
    });
  } catch (e) {
    return res.status(500).json({ error: 'eBird 通訊失敗', details: e.message });
  }
}
