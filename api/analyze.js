import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允許 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Niroj/BirdNET-Pytorch",
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_HF_TOKEN}`, // 後端用 process.env
          "Content-Type": "application/octet-stream"
        },
        method: "POST",
        body: req.body, // 直接轉發音訊資料
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from Hugging Face' });
  }
}