import { useState } from 'react';

export const useBirdNet = (onResult: (birdName: string) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    setError(null);
    console.log("BirdNET 引擎啟動：正在將音訊傳送至雲端分析...");

    try {
      // 1. 將 Blob 轉換為 Base64 (Hugging Face API 的要求格式)
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      const base64Audio = await base64Promise;

      // 2. 呼叫 Hugging Face 上的 BirdNET 模型
      // 註：這是一個開放的測試節點，如果失效，我們再換另一個
      const response = await fetch("https://tom-doerr-birdnet.hf.space/run/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [base64Audio]
        })
      });

      if (!response.ok) throw new Error("API 回應失敗");

      const json = await response.json();
      
      /* BirdNET 通常回傳格式：
         { "data": [ "Common Blackbird;0.98, Eurasian Blue Tit;0.01" ], "duration": ... }
      */
      const prediction = json.data[0]; 
      
      if (prediction) {
        // 擷取信心值最高的鳥名 (第一個分號前的內容)
        const topResult = prediction.split(';')[0].split(',')[0].trim();
        console.log("分析完成，偵測到：", topResult);
        
        // 觸發 App.tsx 的跳轉邏輯
        onResult(topResult);
      } else {
        setError("未能辨識出鳥鳴，請換一段試試。");
      }

    } catch (err) {
      setError("連線至辨識引擎失敗，請檢查網路。");
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeAudio, isLoading, error };
};
