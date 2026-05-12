// api/analyze.js
export const config = {
  api: {
    bodyParser: false, // 必須關閉，否則音訊檔會被破壞
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '請使用 POST 請求' });
  }

  try {
    // 1. 讀取原始音訊二進制數據
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    console.log("接收到的音訊大小:", buffer.length, "bytes");

    // 2. 準備 Token
    const token = process.env.VITE_HF_TOKEN;
    if (!token) {
      return res.status(500).json({ error: '找不到 API Token，請檢查 Vercel 環境變數' });
    }

    // 3. 呼叫 Hugging Face (換一個更穩定的官方接口測試)
    // 我們先試著用這個最穩定的 BirdNET 模型路徑
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/Niroj/BirdNET-Pytorch",
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
        method: "POST",
        body: buffer,
      }
    );

    const resultText = await hfResponse.text();
    console.log("HF 回傳原始內容:", resultText.substring(0, 100));

    // 4. 處理回傳結果
    try {
      const data = JSON.parse(resultText);
      
      // 如果 HF 回傳的是錯誤訊息 (例如模型還在加載)
      if (data.error && data.error.includes("loading")) {
        return res.status(503).json({ error: "AI 正在暖機中，請過 10 秒再試一次" });
      }

      return res.status(200).json(data);
    } catch (e) {
      // 如果解析 JSON 失敗，代表回傳的是 HTML (那個 < 符號的來源)
      return res.status(500).json({ 
        error: "HF 伺服器拒絕請求", 
        debug: resultText.substring(0, 50) 
      });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "伺服器內部錯誤", details: error.message });
  }
}
