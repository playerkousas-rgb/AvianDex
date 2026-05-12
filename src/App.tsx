import React, { useState, useEffect } from 'react';
import { BirdCard } from './components/BirdCard.tsx';
import { PokedexDevice } from './components/PokedexDevice.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { useBirds } from './hooks/useBirds';

function App() {
  const { birds, loading, error } = useBirds();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpened, setIsOpened] = useState(false);

  // --- 音訊分析與自動跳轉邏輯 ---
  const analyzeAudio = async (file: File | Blob) => {
    console.log("🚀 [App] 接收到音訊檔案，準備開始分析...", file);

    try {
      // 呼叫 Hugging Face 上的 BirdNET 模型
    const response = await fetch("/api/analyze", {
  method: "POST",
  body: file, // 直接把檔案丟給轉接頭
});

const result = await response.json();
      console.log("✅ [API 回傳結果]", result);

      // 判斷回傳是否為有效的辨識陣列
      if (Array.isArray(result) && result.length > 0) {
        const topResult = result[0].label; // 例如 "Spotted Dove"
        console.log("🎯 AI 辨識結果：", topResult);

        // 在 1500 隻鳥中尋找匹配項 (優先比對英文名，支援大小寫模糊匹配)
        const foundIndex = birds.findIndex(b => {
          const bird = b as any;
          const searchTag = topResult.toLowerCase();
          
          return (
            bird.englishName?.toLowerCase() === searchTag || 
            bird.name.toLowerCase().includes(searchTag) ||
            bird.englishName?.toLowerCase().includes(searchTag)
          );
        });

        if (foundIndex !== -1) {
          console.log("🎯 找到匹配鳥種，自動切換至索引：", foundIndex);
          setSelectedIndex(foundIndex);
        } else {
          console.warn("⚠️ 辨識完成但在圖鑑庫中找不到：" + topResult);
          alert(`辨識結果為：${topResult}，但圖鑑資料中尚無對應名稱。`);
        }
      } else {
        alert("無法辨識此音訊內容，請嘗試更清楚的錄音。");
      }
    } catch (err) {
      console.error("❌ API 請求失敗:", err);
      alert("分析失敗，請檢查網路連接或 API Token 權限。");
    }
  };

  // 當圖鑑打開時，鎖定底層捲動，優化 UI 體驗
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedIndex]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#313131] flex items-center justify-center">
        <div className="bg-red-500 text-white p-6 rounded-xl font-bold shadow-2xl">
          Error loading Dex: {(error as any)?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. 開場動畫螢幕 */}
      {!isOpened && <WelcomeScreen onOpen={() => setIsOpened(true)} />}

      {/* 2. 主程式容器 */}
      <div 
        className={`min-h-[100dvh] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#31A5E8] font-sans pb-12 transition-opacity duration-1000 ${
          isOpened ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'
        }`}
      >
        
        {/* Header - 圖鑑機風格頂欄 */}
        <header className="bg-[#E3350D] text-white py-4 sm:py-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative z-20 border-b-8 border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-gray-800 shadow-inner">
                <div className="w-12 h-12 rounded-full bg-[#31A5E8] border-2 border-white shadow-[0_0_15px_rgba(49,165,232,0.8)] relative overflow-hidden">
                  <div className="absolute top-1 left-2 w-4 h-4 bg-white/40 rounded-full blur-[2px]"></div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight drop-shadow-md">
                AvianDex
                <span className="text-sm sm:text-base font-mono text-yellow-300 ml-2 not-italic font-black block sm:inline">
                  v1.2.0
                </span>
              </h1>
            </div>

            <div className="hidden sm:flex gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-gray-800 shadow-sm"></div>
              <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-gray-800 shadow-sm"></div>
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-gray-800 shadow-sm"></div>
            </div>
          </div>
        </header>

        {/* 主要內容網格區 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/10 backdrop-blur-md rounded-3xl border-4 border-white/20">
               <div className="w-20 h-20 border-8 border-white/30 border-t-yellow-400 rounded-full animate-spin mb-6 shadow-xl"></div>
               <p className="text-white font-black tracking-widest text-2xl drop-shadow-md">INITIALIZING DEX...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 relative z-10">
              {birds.map((bird, index) => (
                <BirdCard 
                  key={bird.id} 
                  bird={bird} 
                  isActive={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)} 
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 3. 圖鑑機細節彈窗 */}
      <PokedexDevice 
        birds={birds}
        initialIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onAnalyze={analyzeAudio} 
      />
    </>
  );
}

export default App;
