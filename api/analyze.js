// api/analyze.js
// ============================================================
// AvianDex 統一辨識代理 (Vercel Serverless Function)
// 支援：
//   • 音訊辨識（BirdNET on Hugging Face Space，免費）
//   • 圖片辨識（Nyckel Bird Identifier，免費 1,000/月）
// ============================================================
//
// 環境變數（請在 Vercel → Settings → Environment Variables 設定）：
//   NYCKEL_CLIENT_ID      （由 https://www.nyckel.com 註冊取得）
//   NYCKEL_CLIENT_SECRET  （同上）
//   BIRDNET_SPACE_URL     （可選，預設用公開 Space；如自架填自己網址）
// ============================================================

import FormData from 'form-data';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // 我們手動處理 binary stream
  },
};

// ────────────────────────────────────────────────────────────
// Helper: 讀取請求的原始 binary
// ────────────────────────────────────────────────────────────
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// ────────────────────────────────────────────────────────────
// 判斷上傳檔案類型：音訊 vs 圖片
// 透過 Content-Type header 或 magic bytes
// ────────────────────────────────────────────────────────────
function detectMediaType(buffer, contentTypeHeader = '') {
  const ct = (contentTypeHeader || '').toLowerCase();
  if (ct.startsWith('audio/')) return 'audio';
  if (ct.startsWith('image/')) return 'image';

  // Magic bytes fallback
  if (buffer.length >= 4) {
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image';
    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image';
    // WebP: RIFF....WEBP
    if (buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP') return 'image';
    // GIF
    if (buffer.slice(0, 3).toString() === 'GIF') return 'image';
    // WAV: RIFF....WAVE
    if (buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WAVE') return 'audio';
    // MP3: ID3 or FF Fx
    if (buffer.slice(0, 3).toString() === 'ID3') return 'audio';
    if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return 'audio';
    // OGG
    if (buffer.slice(0, 4).toString() === 'OggS') return 'audio';
    // WebM (also used by MediaRecorder)
    if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
      // 可能 webm 音訊或視訊，預設當音訊（MediaRecorder 預設）
      return 'audio';
    }
  }

  return 'unknown';
}

// ────────────────────────────────────────────────────────────
// 圖片辨識：呼叫 Nyckel
// ────────────────────────────────────────────────────────────
async function identifyImageWithNyckel(buffer, contentType) {
  const clientId = process.env.NYCKEL_CLIENT_ID;
  const clientSecret = process.env.NYCKEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Nyckel API 金鑰未設定。請至 Vercel 設定 NYCKEL_CLIENT_ID 與 NYCKEL_CLIENT_SECRET。');
  }

  // 1) 取 OAuth access token
  const tokenRes = await fetch('https://www.nyckel.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
  });

  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    throw new Error(`Nyckel token 取得失敗：${t}`);
  }
  const { access_token } = await tokenRes.json();

  // 2) 呼叫 bird-identifier 預訓練分類器（回傳 Top-N）
  // 文件：https://www.nyckel.com/docs/functions-api#invoke-a-function
  // 預訓練 function id = "bird-identifier"
  const form = new FormData();
  form.append('data', buffer, {
    filename: 'bird.jpg',
    contentType: contentType || 'image/jpeg',
  });

  const invokeRes = await fetch(
    'https://www.nyckel.com/v1/functions/bird-identifier/invoke?includeMetadata=true&topN=5',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...form.getHeaders(),
      },
      body: form,
    },
  );

  const text = await invokeRes.text();
  if (!invokeRes.ok) {
    throw new Error(`Nyckel 辨識失敗 (${invokeRes.status}): ${text}`);
  }

  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!json) throw new Error('Nyckel 回傳非 JSON');

  // Nyckel 預訓練 invoke 可回傳：
  //   { labelName, confidence, labelId } 或 { labels: [...] }
  // 我們統一成 [{ label, score }]
  let candidates = [];
  if (Array.isArray(json.labels)) {
    candidates = json.labels.map((l) => ({
      label: l.name || l.labelName,
      score: l.confidence ?? l.score ?? 0,
    }));
  } else if (json.labelName) {
    candidates = [{ label: json.labelName, score: json.confidence ?? 1 }];
  }
  return candidates;
}

// ────────────────────────────────────────────────────────────
// 音訊辨識：呼叫 BirdNET on Hugging Face Space
// 預設用一個公開的 BirdNET Gradio Space。
// 若失效，可至 https://huggingface.co/spaces 找其他 BirdNET Space，
// 或自架（fork birdnet-team/BirdNET-Analyzer 並包 Gradio 介面）。
// ────────────────────────────────────────────────────────────
async function identifyAudioWithBirdNet(buffer, contentType) {
  const spaceBase =
    process.env.BIRDNET_SPACE_URL || 'https://birdnet-team-birdnet-demo.hf.space';

  // Gradio 3+ 的 API：先 POST 上傳檔案 → 拿到 file_url，再 POST 到 /run/predict
  // 不同 Space 介面不同，這裡採通用做法：用 multipart/form-data 上傳到 /api/predict
  // 失敗時降級回傳 unknown，前端會給友善訊息。
  try {
    const form = new FormData();
    const ext = contentType?.includes('mp3') ? 'mp3'
              : contentType?.includes('webm') ? 'webm'
              : contentType?.includes('ogg')  ? 'ogg'
              : 'wav';
    form.append('audio', buffer, {
      filename: `clip.${ext}`,
      contentType: contentType || 'audio/wav',
    });

    // Gradio queue API
    const res = await fetch(`${spaceBase}/api/predict`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`BirdNET Space 回應 ${res.status}: ${text.slice(0, 300)}`);
    }
    const json = JSON.parse(text);

    // Gradio 回傳：{ data: [ ...prediction... ] }
    // 各 Space 格式不同，盡量寬容處理
    const raw = json?.data?.[0];
    let candidates = [];

    if (typeof raw === 'string') {
      // "Common Blackbird;0.98, Eurasian Blue Tit;0.01"
      candidates = raw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const [label, score] = s.split(/[;:\t]/);
          return { label: (label || '').trim(), score: parseFloat(score) || 0 };
        });
    } else if (raw && typeof raw === 'object' && raw.confidences) {
      // Gradio Label component: { label, confidences: [{label, confidence}] }
      candidates = raw.confidences.map((c) => ({
        label: c.label,
        score: c.confidence,
      }));
    } else if (Array.isArray(raw)) {
      candidates = raw.map((c) => ({
        label: c.label || c.name || c.species,
        score: c.confidence || c.score || 0,
      }));
    }

    return candidates.filter((c) => c.label);
  } catch (err) {
    console.error('[BirdNET] 失敗:', err.message);
    throw new Error(
      'BirdNET 聲音辨識服務暫時無法連線。可能是 Hugging Face Space 在冷啟動，請稍候 30 秒重試，或考慮自架 BirdNET-Analyzer。',
    );
  }
}

// ────────────────────────────────────────────────────────────
// 主處理器
// ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // 允許從 Google Sites iframe 嵌入
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Media-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '請使用 POST 請求' });
  }

  try {
    const buffer = await getRawBody(req);
    if (buffer.length === 0) {
      return res.status(400).json({ error: '接收到的檔案為空' });
    }

    const contentType = req.headers['content-type'] || '';
    // 前端可以用自訂 header 明確指定型別
    const explicit = (req.headers['x-media-type'] || '').toLowerCase();
    const mediaType = explicit || detectMediaType(buffer, contentType);

    console.log(`[analyze] ${(buffer.length / 1024).toFixed(1)}KB, type=${mediaType}, ct=${contentType}`);

    let candidates = [];
    if (mediaType === 'image') {
      candidates = await identifyImageWithNyckel(buffer, contentType);
    } else if (mediaType === 'audio') {
      candidates = await identifyAudioWithBirdNet(buffer, contentType);
    } else {
      return res.status(415).json({ error: '無法判斷檔案類型，請上傳音訊或圖片。' });
    }

    // 統一回傳格式
    return res.status(200).json({
      mediaType,
      results: candidates.slice(0, 5),
    });
  } catch (error) {
    console.error('[analyze] 錯誤:', error);
    return res.status(500).json({
      error: '辨識失敗',
      details: error.message,
    });
  }
}
