import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BirdCard } from './components/BirdCard.tsx';
import { PokedexDevice } from './components/PokedexDevice.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { RecognitionResultModal, Candidate } from './components/RecognitionResultModal.tsx';
import { MediaCapturePanel, MediaKind } from './components/MediaCapturePanel.tsx';
import { AchievementToast } from './components/AchievementToast.tsx';
import { ProgressPanel } from './components/ProgressPanel.tsx';
import { BirdingMapModal } from './components/BirdingMapModal.tsx';
import { useBirds } from './hooks/useBirds';
import { resolveBirdId } from './data/nameAliases';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bird as BirdIcon,
  Mic,
  Camera,
  Search,
  Sparkles,
  Wifi,
  BatteryFull,
  LayoutGrid,
  Crop,
  Trophy,
  Map as MapIcon,
  Menu,
  X as XIcon,
} from 'lucide-react';

export const APP_VERSION = 'v1.4.0';

type AnalyzeMode = 'audio' | 'image';

function App() {
  const { birds, loading, error } = useBirds();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [query, setQuery] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'card' | 'specimen'>(() => {
    try { return (localStorage.getItem('aviandex_view_mode') as any) || 'card'; }
    catch { return 'card'; }
  });
  useEffect(() => {
    try { localStorage.setItem('aviandex_view_mode', viewMode); } catch {}
  }, [viewMode]);

  const [globalCaptureKind, setGlobalCaptureKind] = useState<MediaKind | null>(null);
  const [recogOpen, setRecogOpen] = useState(false);
  const [recogLoading, setRecogLoading] = useState(false);
  const [recogMode, setRecogMode] = useState<AnalyzeMode | null>(null);
  const [recogError, setRecogError] = useState<string | null>(null);
  const [recogCandidates, setRecogCandidates] = useState<Candidate[]>([]);

  const analyzeMedia = useCallback(
    async (file: File | Blob, mode: AnalyzeMode) => {
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
        try { payload = JSON.parse(text); }
        catch { throw new Error(`伺服器回傳非預期內容：${text.slice(0, 200)}`); }

        if (!response.ok) {
          throw new Error(payload?.details || payload?.error || `HTTP ${response.status}`);
        }
        const results: { label: string; score: number }[] = payload?.results || [];

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

        const top = candidates[0];
        if (top && top.matchedIndex !== null && top.score >= 0.7) {
          setTimeout(() => {
            setSelectedIndex(top.matchedIndex);
            setRecogOpen(false);
          }, 1200);
        }
      } catch (err: any) {
        console.error('辨識失敗:', err);
        setRecogError(err?.message || '未知錯誤');
        setRecogLoading(false);
      }
    },
    [birds],
  );

  const analyzeAudio = useCallback((file: File | Blob) => {
    const t = (file as any).type || '';
    const mode: AnalyzeMode = t.startsWith('image/') ? 'image' : 'audio';
    analyzeMedia(file, mode);
  }, [analyzeMedia]);

  useEffect(() => {
    const anyModalOpen =
      selectedIndex !== null || showProgress || showMap || recogOpen || !!globalCaptureKind;
    document.body.style.overflow = anyModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedIndex, showProgress, showMap, recogOpen, globalCaptureKind]);

  const filteredBirds = useMemo(() => {
    if (!query.trim()) return birds;
    const q = query.trim().toLowerCase();
    return birds.filter((b) =>
      b.id.includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b as any).englishName?.toLowerCase?.().includes(q),
    );
  }, [birds, query]);

  const discoveredCount = useMemo(
    () => birds.filter((b) => b.name && b.name !== '???').length,
    [birds],
  );
  const progress = birds.length > 0 ? (discoveredCount / birds.length) * 100 : 0;

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
      {!isOpened && <WelcomeScreen onOpen={() => setIsOpened(true)} />}

      <div
        className={`min-h-[100dvh] font-sans pb-32 sm:pb-24 transition-opacity duration-1000 relative ${
          isOpened ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'
        }`}
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(255,220,150,0.12), transparent 60%),
            radial-gradient(ellipse at bottom, rgba(0,0,0,0.4), transparent 70%),
            linear-gradient(180deg, #1a4d2e 0%, #0d2818 100%)
          `,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px, 30px 30px',
          }}
        />

        <header className="relative z-20">
          <div className="bg-gradient-to-b from-[#E3350D] via-[#c92b0a] to-[#9a2208] border-b-[6px] border-black shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />
            <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-gray-900 border border-red-900" />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-gray-900 border border-red-900" />
            <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-gray-900 border border-red-900" />
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-gray-900 border border-red-900" />

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 flex items-center justify-between gap-2 relative">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 sm:flex-none">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center border-[3px] sm:border-4 border-gray-900 shadow-[0_4px_0_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.6)] shrink-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#5bc0f8] to-[#1d80c4] border-2 border-white shadow-[0_0_15px_rgba(49,165,232,0.9),inset_0_-3px_6px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <div className="absolute top-1 left-2 w-3 h-3 bg-white/70 rounded-full blur-[1px]" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-black italic tracking-tight text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.5)] leading-none flex items-center gap-2">
                    AvianDex
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-300 animate-pulse hidden sm:block" />
                  </h1>
                  <p className="text-yellow-300 font-mono text-[9px] sm:text-[11px] md:text-xs tracking-[0.2em] sm:tracking-[0.3em] mt-1 drop-shadow-md truncate">
                    BIRD FIELD GUIDE · {APP_VERSION}
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setShowMap(true)}
                  className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-400/20 text-yellow-200 font-black text-xs tracking-wider transition-all active:scale-95"
                  title="香港觀鳥地圖"
                >
                  <MapIcon className="w-4 h-4" /> 觀鳥地圖
                </button>
                <button
                  onClick={() => setShowProgress(true)}
                  className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-400/20 text-yellow-200 font-black text-xs tracking-wider transition-all active:scale-95"
                  title="我的進度"
                >
                  <Trophy className="w-4 h-4" /> 我的進度
                </button>
                <div className="flex gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1.5 border border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-900 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-700 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-800 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                </div>
                <div className="hidden lg:flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-md px-3 py-1.5 border border-white/10 font-mono text-[10px] text-green-300">
                  <Wifi className="w-3 h-3" />
                  <span>ONLINE</span>
                  <span className="text-white/30">|</span>
                  <BatteryFull className="w-3 h-3" />
                  <span>100%</span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="選單"
                className="md:hidden w-11 h-11 rounded-lg bg-black/40 border-2 border-yellow-400/30 text-yellow-200 flex items-center justify-center active:scale-90 shrink-0"
              >
                {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden md:hidden"
                >
                  <div className="bg-black/60 backdrop-blur-md border-t-2 border-yellow-400/20 px-3 py-3 grid grid-cols-2 gap-2 relative">
                    <button
                      onClick={() => { setShowMap(true); setMobileMenuOpen(false); }}
                      className="flex items-center gap-2 bg-black/40 active:bg-yellow-500/20 rounded-lg px-3 py-3 border border-yellow-400/30 text-yellow-200 font-black text-xs tracking-wider transition-all active:scale-95"
                    >
                      <MapIcon className="w-4 h-4 shrink-0" /> 觀鳥地圖
                    </button>
                    <button
                      onClick={() => { setShowProgress(true); setMobileMenuOpen(false); }}
                      className="flex items-center gap-2 bg-black/40 active:bg-yellow-500/20 rounded-lg px-3 py-3 border border-yellow-400/30 text-yellow-200 font-black text-xs tracking-wider transition-all active:scale-95"
                    >
                      <Trophy className="w-4 h-4 shrink-0" /> 我的進度
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-gradient-to-b from-yellow-300 to-yellow-400 border-b-[6px] border-black shadow-md relative">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex flex-col shrink-0">
                  <span className="font-mono text-[8px] sm:text-[10px] text-red-900 font-black tracking-widest">
                    COLLECTION
                  </span>
                  <span className="font-black text-gray-900 text-sm sm:text-base md:text-lg leading-none">
                    {discoveredCount}
                    <span className="text-gray-700 text-[10px] sm:text-xs font-mono"> / {birds.length}</span>
                  </span>
                </div>
                <div className="flex-1 h-4 bg-black/30 rounded-full border-2 border-black overflow-hidden relative shadow-inner min-w-0">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 transition-all duration-1000 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] sm:text-[10px] font-black text-white drop-shadow-md">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center bg-white rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.4)] overflow-hidden">
                <Search className="w-4 h-4 text-gray-600 ml-3 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="編號 / 名稱搜尋..."
                  className="bg-transparent px-2.5 py-1.5 text-sm font-bold text-gray-900 placeholder:text-gray-500 outline-none w-full sm:w-44"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32 bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-yellow-400/30">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-[6px] sm:border-8 border-white/20 border-t-yellow-400 rounded-full animate-spin mb-4 sm:mb-6 shadow-xl" />
              <p className="text-yellow-300 font-black tracking-widest text-lg sm:text-2xl drop-shadow-md">
                INITIALIZING DEX...
              </p>
              <p className="text-white/50 font-mono text-[10px] sm:text-xs mt-2 tracking-wider">
                Loading species database
              </p>
            </div>
          ) : filteredBirds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-center">
              <BirdIcon className="w-20 h-20 sm:w-24 sm:h-24 text-yellow-300/40 mb-4" strokeWidth={1.5} />
              <p className="text-yellow-200/80 font-black text-lg sm:text-xl">沒有找到符合的鳥種</p>
              <p className="text-white/40 font-mono text-xs mt-2">Try a different search term</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent rounded min-w-[20px]" />
                <h2 className="text-yellow-300 font-black text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] flex items-center gap-1.5 sm:gap-2">
                  <BirdIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  SPECIMEN ARCHIVE
                </h2>
                <div className="flex bg-black/50 border-2 border-yellow-400/40 rounded-lg overflow-hidden shadow-md">
                  <button
                    onClick={() => setViewMode('card')}
                    title="完整圖卡"
                    className={`px-2.5 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${
                      viewMode === 'card' ? 'bg-yellow-400 text-black' : 'text-yellow-300/70 hover:bg-white/5'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" /> CARD
                  </button>
                  <button
                    onClick={() => setViewMode('specimen')}
                    title="放大裁切"
                    className={`px-2.5 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${
                      viewMode === 'specimen' ? 'bg-yellow-400 text-black' : 'text-yellow-300/70 hover:bg-white/5'
                    }`}
                  >
                    <Crop className="w-3 h-3" /> ZOOM
                  </button>
                </div>
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent rounded min-w-[20px]" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5 relative z-10">
                {filteredBirds.map((bird) => {
                  const realIdx = birds.findIndex((b) => b.id === bird.id);
                  return (
                    <BirdCard
                      key={bird.id}
                      bird={bird}
                      isActive={selectedIndex === realIdx}
                      onClick={() => setSelectedIndex(realIdx)}
                      viewMode={viewMode}
                    />
                  );
                })}
              </div>
            </>
          )}
        </main>

        <div className="fixed bottom-5 right-3 sm:bottom-6 sm:right-6 z-30 flex flex-col gap-2.5 sm:gap-3">
          <button
            onClick={() => setGlobalCaptureKind('image')}
            title="看圖認雀"
            className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-fuchsia-400 to-fuchsia-700 border-[3px] sm:border-[4px] border-gray-900 shadow-[0_5px_0_rgba(0,0,0,0.7),0_8px_20px_rgba(232,121,249,0.5)] active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.7)] transition-all flex items-center justify-center"
          >
            <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]" />
            <span className="hidden md:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              看圖認雀
            </span>
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[8px] font-black px-1 rounded border border-black">
              AI
            </span>
          </button>
          <button
            onClick={() => setGlobalCaptureKind('audio')}
            title="聽聲認雀"
            className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-700 border-[3px] sm:border-[4px] border-gray-900 shadow-[0_5px_0_rgba(0,0,0,0.7),0_8px_20px_rgba(34,211,238,0.5)] active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.7)] transition-all flex items-center justify-center"
          >
            <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]" />
            <span className="hidden md:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              聽聲認雀
            </span>
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[8px] font-black px-1 rounded border border-black">
              AI
            </span>
          </button>
        </div>

        <footer className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8 pb-4">
          <div className="bg-black/40 backdrop-blur-sm border-2 border-yellow-400/20 rounded-xl p-3 sm:p-4 font-mono text-[9px] sm:text-[11px] text-yellow-200/60 leading-relaxed">
            <p className="text-yellow-300 font-black tracking-widest mb-1">► CREDITS & DATA SOURCES ({APP_VERSION})</p>
            <p>科學數據：Cornell Lab · eBird · Macaulay Library · Xeno-canto</p>
            <p>AI 引擎：Hugging Face (BirdSet) · Nyckel · BirdNET</p>
            <p className="text-white/30 mt-1">© SKWAI · 香港童軍總會筲箕灣區小助手</p>
          </div>
        </footer>
      </div>

      <PokedexDevice
        birds={birds}
        initialIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onAnalyze={analyzeAudio}
        onAnalyzeMedia={analyzeMedia}
      />

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

      <AchievementToast discoveredCount={discoveredCount} />

      <ProgressPanel
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        birds={birds}
        onPick={(idx) => setSelectedIndex(idx)}
      />

      <BirdingMapModal isOpen={showMap} onClose={() => setShowMap(false)} />

      {globalCaptureKind && (
        <MediaCapturePanel
          open={!!globalCaptureKind}
          kind={globalCaptureKind}
          onClose={() => setGlobalCaptureKind(null)}
          onCapture={(file, kind) => analyzeMedia(file, kind)}
        />
      )}
    </>
  );
}

export default App;
