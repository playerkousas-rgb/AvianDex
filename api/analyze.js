// api/analyze.js
export const config = {
  api: { bodyParser: false },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const rawBody = await getRawBody(req);
    const token = process.env.VITE_HF_TOKEN;

    // 呼叫 Hugging Face 的函數
    const queryHF = async () => {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Niroj/BirdNET-Pytorch",
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/octet-stream" },
          method: "POST",
          body: rawBody,
        }
      );
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        // 如果回傳的是 HTML (就是那個 < )，拋出錯誤觸發重試
        throw new Error("Model is loading or busy");
      }
    };

    // 嘗試第一次
    try {
      const data = await queryHF();
      return res.status(200).json(data);
    } catch (e) {
      // 如果失敗，等 3 秒再試第二次（給模型熱機時間）
      await new Promise(resolve => setTimeout(resolve, 3000));
      const data = await queryHF();
      return res.status(200).json(data);
    }

  } catch (error) {
    res.status(500).json({ error: "辨識失敗", details: "模型可能正在初始化，請等 10 秒後再試一次。" });
  }
}
