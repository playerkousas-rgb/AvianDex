import React, { useState, useEffect, useCallback } from 'react';
import { BirdCard } from './components/BirdCard.tsx';
import { PokedexDevice } from './components/PokedexDevice.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { RecognitionResultModal, Candidate } from './components/RecognitionResultModal.tsx';
import { useBirds } from './hooks/useBirds';
import { resolveBirdId } from './data/nameAliases';

type AnalyzeMode = 'audio' | 'image';

function App() {
  const { birds, loading, error } = useBirds();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpened, setIsOpened] = useState(false);

  // 辨識狀態
  const [recogOpen, setRecogOpen] = useState(false);
  const [recogLoading, setRecogLoading] = useState(false);
  const [recogMode, setRecogMode] = useState<AnalyzeMode | null>(null);
  const [recogError, setRecogError] = useState<string | null>(null);
  const [recogCandidates, setRecogCandidates] = useState<Candidate[]>([]);

  // --- 統一辨識函式（同時支援聲音與圖片）---
  const analyzeMedia = useCallback(
    async (file: File | Blob, mode: AnalyzeMode) => {
      console.log(`🚀 [App] 開始 ${mode} 辨識...`, file);

      // 開浮窗、顯示 loading
      setRecogMode(mode);
      setRecogError(null);
      setRecogCandidates([]);
      setRecogLoading(true);
      setRecogOpen(true);

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': (file as any).type || (mode === 'audio' ? 'audio/wav' : 'image/jpeg'),
            'X-Media-Type': mode,
          },
          body: file,
        });

        const text = await response.text();
        let payload: any = null;
        try { payload = JSON.parse(text); } catch {
          throw new Error(`伺服器回傳非預期內容：${text.slice(0, 200)}`);
        }

        if (!response.ok) {
          throw new Error(payload?.details || payload?.error || `HTTP ${response.status}`);
        }

        const results: { label: string; score: number }[] = payload?.results || [];
        console.log('✅ [API 回傳結果]', results);

        if (results.length === 0) {
          setRecogCandidates([]);
          setRecogLoading(false);
          return;
        }

        // 比對圖鑑中對應的鳥
        const candidates: Candidate[] = results.map((r) => {
          const id = resolveBirdId(r.label);
          const idx = id ? birds.findIndex((b) => b.id === id) : -1;
          return {
            label: r.label,
            score: r.score,
            matchedIndex: idx >= 0 ? idx : null,
            matchedBird: idx >= 0 ? birds[idx] : undefined,
          };
        });

        setRecogCandidates(candidates);
        setRecogLoading(false);

        // 若 Top-1 信心 >= 0.7 且在圖鑑內 → 自動跳轉
        const top = candidates[0];
        if (top && top.matchedIndex !== null && top.score >= 0.7) {
          console.log('🎯 高信心，自動跳轉到', top.matchedBird?.name);
          // 給使用者看一眼結果再跳
          setTimeout(() => {
            setSelectedIndex(top.matchedIndex);
            setRecogOpen(false);
          }, 1200);
        }
      } catch (err: any) {
        console.error('❌ 辨識失敗:', err);
        setRecogError(err?.message || '未知錯誤');
        setRecogLoading(false);
      }
    },
    [birds],
  );

  // 給舊版簽名相容（PokedexDevice 仍呼叫 onAnalyze(file)，預設當音訊）
  const analyzeAudio = useCallback(
    (file: File | Blob) => {
      // 透過 MIME 自動判斷
      const t = (file as any).type || '';
      const mode: AnalyzeMode = t.startsWith('image/') ? 'image' : 'audio';
      analyzeMedia(file, mode);
    },
    [analyzeMedia],
  );

  // 當圖鑑打開時，鎖定底層捲動
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#313131] flex items-center justify-center">
        <div className="bg-red-500 text-white p-6 rounded-xl font-bold shadow-2xl">
          Error loading Dex: {(error as any)?.message || 'Unknown error'}
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
        {/* Header */}
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
                  v1.3.0
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

        {/* 主要內容網格 */}
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

      {/* 3. 圖鑑機 */}
      <PokedexDevice
        birds={birds}
        initialIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onAnalyze={analyzeAudio}
        onAnalyzeMedia={analyzeMedia}
      />

      {/* 4. 辨識結果浮窗 */}
      <RecognitionResultModal
        isOpen={recogOpen}
        loading={recogLoading}
        mode={recogMode}
        error={recogError}
        candidates={recogCandidates}
        onClose={() => setRecogOpen(false)}
        onPick={(idx) => {
          setSelectedIndex(idx);
          setRecogOpen(false);
        }}
      />
    </>
  );
}

export default App;
