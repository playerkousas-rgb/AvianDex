import React, { useState, useEffect } from 'react';
import { BirdCard } from './components/BirdCard.tsx';
import { PokedexDevice } from './components/PokedexDevice.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { useBirds } from './hooks/useBirds';

function App() {
  const { birds, loading, error } = useBirds();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpened, setIsOpened] = useState(false);

  // --- 新增：音訊分析與自動跳轉邏輯 ---
  const analyzeAudio = async (file: File | Blob) => {
    console.log("🚀 [App] 接收到音訊檔案，準備開始分析...", file);
    
    // 這裡目前是「模擬模式」，確認流程完全打通
    // 未來我們會將此處換成真正的 API 請求
    setTimeout(() => {
      // 模擬辨識結果：你可以改這兩個字來測試不同的鳥
      const mockResult = "小葵花鳳頭鸚鵡"; 
      console.log("✅ [App] 分析完成，辨識結果：", mockResult);

      // 在現有的鳥類清單中尋找匹配項 (支援中文名或英文名部分匹配)
      const foundIndex = birds.findIndex(b => 
        b.name.includes(mockResult) || 
        (b.englishName && b.englishName.includes(mockResult))
      );

      if (foundIndex !== -1) {
        console.log("🎯 [App] 找到匹配鳥種，自動切換至索引：", foundIndex);
        setSelectedIndex(foundIndex);
      } else {
        console.warn("⚠️ [App] 辨識完成但圖鑑資料庫中找不到名為 " + mockResult + " 的鳥類");
        alert("辨識結果為：" + mockResult + "，但圖鑑中尚無此資料。");
      }
    }, 1500); 
  };

  // 修正：當圖鑑打開時，鎖定底層捲動
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

      {/* 3. 圖鑑機細節彈窗 - 傳入 onAnalyze */}
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
