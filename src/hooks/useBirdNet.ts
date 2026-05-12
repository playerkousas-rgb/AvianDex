// src/hooks/useBirdNet.ts
export const useBirdNet = () => {
  const analyzeAudio = async (audioBlob: Blob) => {
    console.log("啟動 BirdNET 辨識引擎...");
    // 這裡放我們剛才討論的 fetch Hugging Face 的邏輯
    // 這是核心辨識邏輯 (Pseudo-code)
async function identifyBirdSound(audioBlob: Blob) {
  setIsLoading(true); // 啟動 UI 的分析動畫
  
  try {
    // 1. 將音檔封裝進 FormData
    const formData = new FormData();
    formData.append("files", audioBlob, "recording.wav");

    // 2. 這裡調用 Hugging Face 的 API 節點
    // 註：這通常是 https://[你的SpaceID].hf.space/run/predict
    const response = await fetch("https://monet-pigeon-birdnet-analyzer.hf.space/run/predict", {
      method: "POST",
      body: JSON.stringify({
        data: [
          {"data": "base64_audio_string...", "name": "audio.wav"}, // 視 API 要求而定
          0.1, // 信心值門檻
        ]
      }),
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();
    
    // 3. 處理結果
    const birdName = result.data[0].label; // 假設回傳：'Rock Pigeon'
    const confidence = result.data[0].conf;
    
    // 4. 自動定位到圖鑑
    if (confidence > 0.7) {
       findAndSelectBird(birdName); 
    }
  } catch (error) {
    console.error("辨識失敗", error);
  } finally {
    setIsLoading(false);
  }
}
    };

  return { analyzeAudio };
};
