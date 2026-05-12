// api/analyze.js
import FormData from 'form-data';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // 必須關閉，我們手動處理二進制流
  },
};

// 輔助函式：讀取 Stream 轉成 Buffer
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '請使用 POST 請求' });
  }

  try {
    // 1. 獲取前端傳來的音訊 Buffer
    const buffer = await getRawBody(req);
    
    if (buffer.length === 0) {
      return res.status(400).json({ error: '接收到的音訊為空' });
    }

    // 2. 建立「懂鳥 API」要求的 Form Data 格式
    const form = new FormData();
    // 'file' 是懂鳥文件要求的欄位名，後面的 filename 隨便取但要有後綴
    form.append('file', buffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav', 
    });

    // 3. 呼叫懂鳥 API
    // 根據你提供的文檔網址：https://ai.open.hhodata.com/dongniao
    const response = await fetch("https://ai.open.hhodata.com/dongniao", {
      method: "POST",
      body: form,
      headers: form.getHeaders(), // 這會自動生成正確的 boundary
    });

    const result = await response.json();

    // 4. 格式化回傳結果給你的 AvianDex 前端
    // 懂鳥的回傳通常包含 code, msg, 和 data (內含 species 等)
    if (result.code === 200 || result.success) {
      // 這裡需要根據懂鳥實際回傳的 JSON 結構調整
      // 假設它回傳 data: [{ name: "珠頸斑鳩", score: 0.9 }]
      const formattedData = (result.data || []).map(item => ({
        label: item.name || item.species, // 懂鳥給的是中文名
        score: item.confidence || item.score || 1.0
      }));

      return res.status(200).json(formattedData);
    } else {
      return res.status(500).json({ 
        error: "懂鳥辨識失敗", 
        details: result.msg || "未知錯誤" 
      });
    }

  } catch (error) {
    console.error("懂鳥串接錯誤:", error);
    return res.status(500).json({ 
      error: "伺服器通訊錯誤", 
      details: error.message 
    });
  }
}
