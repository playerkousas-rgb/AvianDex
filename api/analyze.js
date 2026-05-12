import type { VercelRequest, VercelResponse } from '@vercel/node';

// 強制 Vercel 不要解析 body（這點非常重要，不然 binary 會壞掉）
export const config = {
  api: {
    bodyParser: false,
  },
};

// 輔助函數：將 Request 流轉為 Buffer
async function getRawBody(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const token = process.env.VITE_HF_TOKEN;

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
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Backend failed to process audio' });
  }
}
