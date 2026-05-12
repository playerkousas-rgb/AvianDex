import { useState } from 'react';

export const useBirdNet = (onResult: (birdName: string) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    setError(null);
    console.log("啟動 BirdNET 辨識引擎...");

    try {
      // 這裡暫時模擬 API 請求流程
      // 未來我們會在這裡發送真正的 fetch 到 Hugging Face 或你的後端
      const formData = new FormData();
      formData.append("file", audioBlob);

      // 模擬網路延遲 2 秒
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 假設辨識結果回傳了 "Rock Pigeon" (原鴿)
      const mockResult = "Rock Pigeon"; 
      
      console.log("辨識成功:", mockResult);
      onResult(mockResult); // 這裡會觸發外面傳進來的 findAndSelectBird 邏輯

    } catch (err) {
      setError("辨識過程中發生錯誤");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeAudio, isLoading, error };
};
