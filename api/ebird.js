// api/ebird.js
// ============================================================
// eBird 觀察紀錄代理（保護 EBIRD_API_KEY 不外洩到前端）
// 用法：GET /api/ebird?hotspot=L922779
//      GET /api/ebird?region=HK
// ============================================================

import fetch from 'node-fetch';

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

  const { hotspot, region = 'HK', days = '14', max = '50' } = req.query || {};

  let url;
  if (hotspot) {
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
