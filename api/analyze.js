// api/analyze.js

// 關閉 Vercel 的自動 Body 解析，確保音訊二進位檔不被破壞
export const config = {
  api: {
    bodyParser: false,
  },
};

// 輔助函數：讀取原始數據流
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    // 注意：後端用 process.env
    const token = process.env.VITE_HF_TOKEN;

    if (!token) {
      return res.status(500).json({ error: 'HF Token is missing in environment variables' });
    }

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/Niroj/BirdNET-Pytorch",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream"
        },
        method: "POST",
        body: rawBody,
      }
    );

    const data = await hfResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Backend failed', details: error.message });
  }
}
