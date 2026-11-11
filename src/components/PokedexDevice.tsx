import React, { useCallback, useEffect, useState } from 'react';
import { Bird } from '../types';
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Mic,      // 加入這一個
  Camera,     // 視覺圖庫
  Maximize2,
  RotateCw,   // 翻轉（放大檢視／螢幕）
  FileText,   // 詳細資料（文字）
  Compass,    // 科學研究中心
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaCapturePanel, MediaKind } from './MediaCapturePanel.tsx';
import { BirdSilhouette } from './BirdSilhouette';
import { useCardImage, useInfoCard } from '../hooks/useCardImage';
import { searchBirds } from '../lib/pokedexOrder';
import { BirdDetailPage } from './BirdDetailPage';
import { ResearchHubPage } from './ResearchHubPage';
import { PokedexTabs, type PokedexPage } from './PokedexTabs';
import type { GuideKind } from './FieldGuideModal';
import { ENTRIES, type Lang } from '../lib/explorer';
import { loadDetails, useCardDetail } from '../lib/cardDetailsStore';

// 捕精靈 App（BIRD-DEX 2）網址
const BIRDDEX2_URL = 'https://skw-birdex2.vercel.app';

// 精靈球小圖示（用於跳轉 BIRD-DEX 2 的按鈕）
const PokeballIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="46" fill="#fff" stroke="#111" strokeWidth="6" />
    <path d="M5 50a45 45 0 0 1 90 0Z" fill="#ef4444" stroke="#111" strokeWidth="6" />
    <line x1="4" y1="50" x2="96" y2="50" stroke="#111" strokeWidth="6" />
    <circle cx="50" cy="50" r="14" fill="#fff" stroke="#111" strokeWidth="6" />
  </svg>
);

// 圖卡未載入／不存在時顯示於螢幕內（不再只是空白或轉圈）
const CardImageFallback: React.FC<{
  id: string;
  status: 'idle' | 'queued' | 'loading' | 'loaded' | 'missing' | 'error';
  onRetry: () => void;
  compact?: boolean;
}> = ({ id, status, onRetry, compact = false }) => {
  const busy = status === 'idle' || status === 'queued' || status === 'loading' || status === 'loaded';
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-2 text-center ${
        compact ? 'p-3' : 'p-6'
      }`}
      style={{ background: 'radial-gradient(ellipse at center, #4a3520 0%, #2b1d10 70%, #1a1208 100%)' }}
    >
      {busy ? (
        <>
          <div className={`${compact ? 'w-7 h-7' : 'w-10 h-10'} border-4 border-yellow-700/30 border-t-yellow-500 rounded-full animate-spin`} />
          <p className="text-yellow-200/70 font-mono text-[9px] tracking-widest uppercase">Loading NO.{id}</p>
        </>
      ) : (
        <>
          <BirdSilhouette id={id} className={`${compact ? 'w-12 h-12' : 'w-20 h-20'} text-black/85`} />
          <p className="text-yellow-300 font-black text-[11px] tracking-[0.2em]">UNDISCOVERED</p>
          <p className="text-yellow-200/50 font-mono text-[8px] tracking-widest leading-relaxed">
            {status === 'error' ? '圖卡載入失敗（網絡／CORS）' : `R2 內未有 ${id}.avif`}
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRetry(); }}
            className="mt-1 bg-black/60 hover:bg-black/80 border border-yellow-400/30 rounded px-2 py-1 text-yellow-200/80 font-mono text-[8px] tracking-widest active:scale-95"
          >
            RETRY / 重新探測
          </button>
        </>
      )}
    </div>
  );
};

interface PokedexDeviceProps {
  birds: Bird[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  /** 舊版簽名：只傳檔案；內部會用 MIME 判斷聲音 / 圖片 */
  onAnalyze?: (file: File | Blob) => void;
  /** 新版簽名：明確指定 'audio' 或 'image' */
  onAnalyzeMedia?: (file: File | Blob, kind: 'audio' | 'image') => void;
  /** 介面語言：全中文 / 全英文 */
  lang?: Lang;
  /** 打開觀鳥禮儀 / 觀鳥裝備 */
  onOpenGuide?: (kind: GuideKind) => void;
}

export const PokedexDevice: React.FC<PokedexDeviceProps> = ({ 
  birds, 
  initialIndex, 
  isOpen, 
  onClose,
  onAnalyze, // 舊版相容
  onAnalyzeMedia, // 新版：可同時做聲音/圖片
  lang = 'zh',
  onOpenGuide,
}) => {
  // --- 媒體擷取面板 ---
  const [captureKind, setCaptureKind] = useState<MediaKind | null>(null);
  const dispatchMedia = (file: File | Blob, kind: MediaKind) => {
    if (onAnalyzeMedia) { onAnalyzeMedia(file, kind); return; }
    if (onAnalyze) onAnalyze(file);
  };
  // --- 1. 核心狀態 ---
  const [page, setPage] = useState<PokedexPage>(1);
  const [detailReady, setDetailReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 下一隻
  const handleNext = useCallback(() => {
    if (currentIndex < birds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, birds.length]);

  // 上一隻
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

 // 1. 當圖鑑打開或切換全螢幕時，控制網頁滾動
  useEffect(() => {
    if (isOpen) {
      // 只要圖鑑打開，就禁止背景網頁捲動，避免出現拉假的捲軸
      document.body.style.overflow = 'hidden';
      // 圖鑑機元件常駐（關閉時 return null），重新打開時必須同步到最新編號
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resync index when device reopens
      setCurrentIndex(initialIndex);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialIndex]);

  // 4. 鍵盤快捷鍵邏輯 (ESC 退出, 左右鍵切換)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
        return;
      }

      // 如果不是在搜尋狀態，允許左右鍵切換
      if (!isSearching && !isFullscreen) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, isSearching, handleNext, handlePrev, onClose]);

  // 跳轉功能 (優化清單顯示)
  const jumpToBird = (id: string) => {
    const idx = birds.findIndex(b => b.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
    setSearchTerm('');
    setIsSearching(false);
  };

  // 搜尋提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    // 以英文名為主（英文俗名 > 學名 > 中文名 > 編號），與首頁搜尋同一套規則
    const hits = searchBirds(birds, term);
    if (hits[0]) {
      jumpToBird(hits[0].id);
    }
  };

  const currentBird = birds[Math.min(currentIndex, birds.length - 1)] ?? birds[0];
  // 圖卡狀態（與首頁卡片共用同一個載入器，已載入的圖即時顯示，不會再請求一次）
  const currentImage = useCardImage(currentBird?.id ?? '0001');
  // 資訊圖卡（翻轉面）：只有用戶真的翻開才探測，避免 569 次 404
  const infoImage = useInfoCard(currentBird?.id ?? '0001');
  const [screenFlipped, setScreenFlipped] = useState(false);
  const screenDetail = useCardDetail(currentBird?.id ?? '0001', lang);

  useEffect(() => {
    if (screenFlipped) void infoImage.probe();
  }, [screenFlipped, infoImage]);

  // 未做資訊圖卡的雀：翻轉面用文字欄位砌，文字同樣來自維基原文
  useEffect(() => {
    if (screenFlipped) loadDetails(lang);
  }, [screenFlipped, lang]);

  /* 換雀就轉回正面，否則會停在上次的背面。
     ⚠️ 一定要用 currentBird?.id：birds.json 未載入完成時 currentBird 是 undefined，
        寫 currentBird.id 會即刻拋 TypeError → 整個 React tree 消失 → 一開就白屏。
     用 render 期間比對而不是 useEffect：換雀是「衍生狀態」，
     用 effect 會先畫一格舊背面再翻返，閃一下。 */
  const currentId = currentBird?.id ?? '';
  /* 螢幕上的插畫是否已 decode 完成（避免破圖／alt 文字閃出） */
  const [screenArtReady, setScreenArtReady] = useState(false);
  const [flippedFor, setFlippedFor] = useState(currentId);
  if (flippedFor !== currentId) {
    setFlippedFor(currentId);
    setScreenFlipped(false);
    setScreenArtReady(false);
  }
  // 科研終端的外部網站（All About Birds / Flickr / Xeno-canto）只認英文俗名，
  // 用中文名搜尋等於一定查無此鳥 —— 呢個就係舊版六宮格「撳完冇嘢睇」的原因。
  const sciQuery = currentBird
    ? (currentBird.englishName && currentBird.englishName !== '???' ? currentBird.englishName : currentBird.name)
        .replace(/\s+/g, ' ')
        .trim()
    : '';
  // 索引資料（名稱／分類／屬性）—— 幾十 KB，唔會拖慢圖鑑機
  const entry = currentBird ? ENTRIES[currentBird.id] : undefined;
  /** 全中文 / 全英文介面小幫手 */
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);

  if (!isOpen || !currentBird) return null;

  return (
    <AnimatePresence>
{/* ============================================================
          SECTION 1: 全螢幕觀察模式 (原生縮放與手勢優先版)
          ============================================================ */}
      {isFullscreen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          /* 關鍵修正 1：移除最外層所有的 flex 置中邏輯
             className 從 'flex items-center justify-center' 改為 'block'
             這能讓行動瀏覽器的原生滾動條（Scrollbar）正確認識內容高度。
          */
          className="fixed inset-0 z-[100] bg-black/98 block overflow-x-hidden overflow-y-auto"
          onClick={() => setIsFullscreen(false)}
          /* 關鍵修正 2：在最外層鎖定 dvh，防止行動端工具列跑出來擋圖 */
          style={{ height: '100dvh', width: '100vw' }}
        >
          {/* --- 1. 固定頂部 (僅保留關閉與名字，且 z-index 最高) --- */}
          {/* 加入 sticky top-0 確保它隨捲動浮動，不遮擋圖片主體 */}
          {/* --- 1. 固定頂部 ---
              只在左邊放一個細標籤、右邊放關閉鈕，不加任何卡片或方框。
              用戶指出「手機看時中間出現了正方形框」—— 那是我上一版留下的
              一個獨立浮動方塊（標題卡）壓在圖上；現在全部收成貼邊的細標籤。 */}
          <div className="sticky top-0 left-0 w-full pt-3 px-3 md:pt-5 md:px-6 flex justify-between items-start z-[150] pointer-events-none">
            <div className="bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/12 pointer-events-auto">
              <span className="text-yellow-400 font-bold text-[11px] md:text-sm">
                NO.{currentBird.id} · {currentBird.name}
              </span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
              aria-label={t('關閉', 'Close')}
              className="pointer-events-auto bg-black/55 hover:bg-red-600 backdrop-blur-md border border-white/20 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* --- 核心：一張大卡（插畫 ↔ 資訊圖卡） ---
              用戶指出：「同一版面，上方已經有鳥卡或反轉的資訊圖卡了，
              下方就不用有張大一點的鳥卡」。
              所以這個全螢幕檢視只保留**一張**圖，不再上下各一張。
              點圖翻轉；下方的字只用來說明「現在看的是哪一面」。 */}
          <div className="w-full flex flex-col items-center px-3 pt-3 pb-28" onClick={(e) => e.stopPropagation()}>
            <div
              className="relative w-full max-w-3xl [perspective:1600px] cursor-pointer"
              onClick={() => setScreenFlipped((v) => !v)}
            >
              <motion.div
                animate={{ rotateY: screenFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                className="relative w-full [transform-style:preserve-3d]"
              >
                {/* 正面：插畫（1:1 正方形，所以本體就是正方形，不會有奇怪留白） */}
                <div className="relative w-full aspect-square [backface-visibility:hidden] rounded-xl overflow-hidden bg-[#0e0d0b]">
                  {currentImage.url ? (
                    <img
                      src={currentImage.url}
                      alt={currentBird.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <CardImageFallback id={currentBird.id} status={currentImage.status} onRetry={currentImage.retry} />
                  )}
                </div>

                {/* 背面：資訊圖卡（A4 直向 → object-contain，不裁走字） */}
                <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-xl overflow-hidden bg-[#f7f4ea]">
                  {infoImage.status === 'loaded' && infoImage.url ? (
                    <img
                      src={infoImage.url}
                      alt={t(`${currentBird.name} 資訊圖卡`, `${currentBird.name} info card`)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#171512] p-4 flex flex-col">
                      <p className="text-white font-black text-base leading-tight">{currentBird.name}</p>
                      <p className="text-white/40 font-mono text-[10px] italic">{entry?.s}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 content-start">
                        {(['range', 'habitat', 'diet', 'look'] as const).map((k) => {
                          const raw = (screenDetail as Record<string, string | string[]> | null)?.[k];
                          const val = Array.isArray(raw) ? raw.filter(Boolean).join('；') : String(raw ?? '').trim();
                          const labels: Record<string, string> = { range: '分佈', habitat: '環境', diet: '食物', look: '外形' };
                          return (
                            <div key={k} className="bg-black/30 rounded p-2 leading-tight">
                              <p className="text-amber-300/80 text-[10px] font-black">{labels[k]}</p>
                              <p className="text-white/70 text-[11px] mt-0.5">{val || t('資料待查', 'Pending')}</p>
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-auto text-white/25 text-[9px]">
                        {t('資訊圖卡未完成，以上為文字簡版', 'Info card not ready — text version')}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* 一行說明 ＋ 翻轉掣（不疊在圖上，不會遮住圖） */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-white/40 font-mono text-[9.5px] tracking-widest">
                {screenFlipped ? t('資訊圖卡', 'INFO CARD') : t('插畫', 'ARTWORK')}
              </span>
              <button
                type="button"
                onClick={() => setScreenFlipped((v) => !v)}
                className="bg-white/12 hover:bg-white/25 border border-white/25 text-white font-black text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                {screenFlipped ? t('轉回插畫', 'Artwork') : t('翻轉看資料', 'Flip')}
              </button>
            </div>
          </div>

          {/* --- 兩邊浮球：左 3 個（地圖／禮儀／裝備），右 3 個（聽聲／拍照／精靈球）
              用戶要求：「那些球也是左右各 3 個，那就剛好不會遮到圖」。
              所以手機上一律貼邊、垂直排列，中間完全留空給圖。 */}
          <div className="fixed left-2 bottom-6 z-[160] flex flex-col gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); setPage(3); }}
              aria-label={t('科學研究中心', 'Research')}
              className="w-11 h-11 rounded-full bg-emerald-600/85 border-[3px] border-gray-900 text-white flex items-center justify-center active:scale-90 shadow-lg"
            >
              <Compass className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); setPage(2); }}
              aria-label={t('詳細資料', 'Details')}
              className="w-11 h-11 rounded-full bg-yellow-500/90 border-[3px] border-gray-900 text-gray-900 flex items-center justify-center active:scale-90 shadow-lg"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              aria-label={t('上一隻', 'Previous')}
              className="w-11 h-11 rounded-full bg-black/70 border-[3px] border-gray-900 text-amber-200 flex items-center justify-center active:scale-90 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="fixed right-2 bottom-6 z-[160] flex flex-col gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setCaptureKind('audio'); }}
              aria-label={t('聽聲認雀', 'Sound ID')}
              className="w-11 h-11 rounded-full bg-cyan-600/85 border-[3px] border-gray-900 text-white flex items-center justify-center active:scale-90 shadow-lg"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCaptureKind('image'); }}
              aria-label={t('看圖認雀', 'Photo ID')}
              className="w-11 h-11 rounded-full bg-fuchsia-600/85 border-[3px] border-gray-900 text-white flex items-center justify-center active:scale-90 shadow-lg"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              aria-label={t('下一隻', 'Next')}
              className="w-11 h-11 rounded-full bg-black/70 border-[3px] border-gray-900 text-amber-200 flex items-center justify-center active:scale-90 shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
 
      {/* ============================================================
          SECTION 2: 主圖鑑機設備界面
          ============================================================ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 perspective-1000">
          <motion.div
            initial={{ scale: 0.8, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="w-full max-w-5xl h-[92vh] md:h-[88vh] flex flex-col md:flex-row shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_60px_rgba(250,204,21,0.15)] relative drop-shadow-2xl"
          >
            {/* 總開關關閉按鈕 */}
            <button 
              onClick={onClose}
              className="absolute -top-5 -right-5 md:-right-10 md:-top-10 z-[60] p-3 bg-white rounded-full text-red-600 shadow-2xl border-4 border-gray-800 hover:rotate-90 transition-transform duration-500"
            >
              <X className="w-8 h-8" />
            </button>

          {/* --- 左半部分：圖鑑顯示面板 (修正版) --- */}
<div className="w-full md:w-1/2 min-h-[50%] md:h-full bg-gradient-to-br from-[#E3350D] via-[#c92b0a] to-[#9a2208] border-[6px] md:border-[10px] border-gray-900 rounded-t-[40px] md:rounded-l-[40px] md:rounded-tr-none flex flex-col relative z-20 shadow-[inset_-15px_0_40px_rgba(0,0,0,0.3),inset_0_3px_8px_rgba(255,255,255,0.15)]">
  
  {/* 行動端專用 HUD - 聲音/影像 AI 辨識 + 精靈球跳轉 */}
  <div className="md:hidden absolute top-20 left-4 right-4 flex justify-between items-center z-30 pointer-events-none">
    <div className="flex gap-3">
      <button 
        onClick={(e) => { e.stopPropagation(); setCaptureKind('audio'); }}
        title="聲音辨識"
        className="pointer-events-auto w-12 h-12 rounded-full bg-cyan-500/30 backdrop-blur-md border-2 border-cyan-400/70 flex items-center justify-center text-cyan-300 active:scale-90 active:bg-cyan-400 active:text-black shadow-lg shadow-cyan-500/30"
      >
        <Mic className="w-5 h-5" /> 
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); setCaptureKind('image'); }}
        title="看圖認雀"
        className="pointer-events-auto w-12 h-12 rounded-full bg-fuchsia-500/30 backdrop-blur-md border-2 border-fuchsia-400/70 flex items-center justify-center text-fuchsia-300 active:scale-90 active:bg-fuchsia-400 active:text-black shadow-lg shadow-fuchsia-500/30"
      >
        <Camera className="w-5 h-5" />
      </button>
    </div>
    {/* 精靈球：跳轉去 BIRD-DEX 2 捕捉精靈 */}
    <button 
      onClick={(e) => { e.stopPropagation(); window.open(BIRDDEX2_URL, '_blank'); }}
      title="前往 BIRD-DEX 2 捕捉精靈"
      aria-label="前往 BIRD-DEX 2 捕捉精靈"
      className="pointer-events-auto w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border-2 border-gray-900 flex items-center justify-center p-1.5 active:scale-90 shadow-lg shadow-red-500/30"
    >
      <PokeballIcon className="w-full h-full" />
    </button>
  </div>

  {/* 頂部感應燈區塊 + 電腦版上傳中心 */}
  <div className="flex items-center justify-between p-2 md:p-3 border-b-4 border-red-900/40 bg-gradient-to-b from-red-400 to-transparent">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center border-[3px] border-gray-800 shadow-md">
        <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#31A5E8] border-[2px] border-white shadow-[0_0_10px_rgba(49,165,232,0.8)] relative overflow-hidden">
          <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full blur-[1px]" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-600 border border-black/30 shadow-inner" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black/30 shadow-inner" />
        <div className="w-3 h-3 rounded-full bg-green-500 border border-black/30 shadow-inner" />
      </div>
    </div>

    {/* 電腦版 AI 辨識中心 - ACOUSTIC + VISUAL */}
    <div className="hidden md:flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-black/40 group relative z-50">
      <div className="text-right">
        <p className="text-[8px] text-white/40 font-mono uppercase">Analysis Engine</p>
        <p className="text-[10px] text-cyan-400 font-black uppercase">Acoustic / Visual</p>
      </div>
      {/* 聲音辨識 */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setCaptureKind('audio'); }}
        title="聲音辨識 / Listen"
        className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40 hover:bg-cyan-500 hover:text-black transition-all active:scale-90"
      >
        <Mic className="w-4 h-4" />
      </button>
      {/* 影像辨識 */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setCaptureKind('image'); }}
        title="看圖認雀 / Snap"
        className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/40 hover:bg-fuchsia-500 hover:text-black transition-all active:scale-90"
      >
        <Camera className="w-4 h-4" />
      </button>
      {/* 精靈球：跳轉去 BIRD-DEX 2 */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); window.open(BIRDDEX2_URL, '_blank'); }}
        title="前往 BIRD-DEX 2 捕捉精靈"
        aria-label="前往 BIRD-DEX 2 捕捉精靈"
        className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center border border-gray-900 p-1 hover:scale-110 transition-all active:scale-90"
      >
        <PokeballIcon className="w-full h-full" />
      </button>
    </div>
  </div>

  {/* 螢幕核心區域 */}
  <div className="flex-1 p-2 md:p-3 flex flex-col items-center justify-center overflow-hidden">
    <div className="w-full h-full bg-[#f3ecd8] rounded-t-lg rounded-bl-lg rounded-br-[32px] p-1.5 md:p-2 border-2 border-gray-900 relative flex flex-col overflow-hidden">
      <div className="flex justify-center gap-3 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-600/80" />
        <div className="w-1.5 h-1.5 rounded-full bg-red-600/80" />
      </div>

      {/* 螢幕：先見鳥，點一下翻轉看資料。
          跟圖鑑格仔同一套規矩 —— 正面插畫（birdcards），背面資訊卡（aviandex）；
          未做資訊卡就用文字欄位即時砌，所以不會翻出一個空盒。 */}
      <div className="flex-1 bg-[#12100d] rounded-md border border-black/70 relative overflow-hidden flex flex-col group">
        <div
          className="flex-1 relative flex items-center justify-center [perspective:1200px] cursor-pointer"
          onClick={() => setScreenFlipped((v) => !v)}
        >
          <motion.div
            animate={{ rotateY: screenFlipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 190, damping: 22 }}
            className="relative w-full h-full [transform-style:preserve-3d]"
          >
            {/* 正面：插畫。
                ⚠️ 用戶回報「圖鑑機中間出現破圖（alt 文字＋破圖示）」。
                   原因：圖鑑機用 object-contain 顯示 1:1 插畫，但螢幕高度只夠
                   好窄一條，圖未 decode 完就已經 alt 顯示；而且有些環境會擋
                   referrer。現在改成 object-cover 填滿螢幕（插畫是正方形，
                   裁邊比留一條白邊好看），並加 onLoad/onError 與載入中狀態。 */}
            <div className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] bg-[#12100d]">
              {currentImage.url ? (
                <>
                  {!(screenArtReady && currentImage.status === 'loaded') && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    key={currentImage.url}
                    src={currentImage.url}
                    alt={currentBird.name}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    onLoad={() => setScreenArtReady(true)}
                    onError={() => setScreenArtReady(false)}
                    className={`w-full h-full object-cover ${screenArtReady && currentImage.status === 'loaded' ? 'block' : 'hidden'}`}
                  />
                </>
              ) : (
                <CardImageFallback id={currentBird.id} status={currentImage.status} onRetry={currentImage.retry} compact />
              )}
            </div>

            {/* 背面：資訊圖卡 → 冇就用文字簡版 */}
            <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden bg-[#f7f4ea]">
              {infoImage.status === 'loaded' && infoImage.url ? (
                <img
                  src={infoImage.url}
                  alt={`${currentBird.name} 資訊圖卡`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-[#171512] p-3 flex flex-col">
                  <p className="text-white font-black text-[14px] leading-tight">{currentBird.name}</p>
                  <p className="text-white/40 font-mono text-[9px] italic">{entry?.s}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 overflow-hidden">
                    {(['range', 'habitat', 'diet', 'look'] as const).map((k) => {
                      const raw = (screenDetail as Record<string, string | string[]> | null)?.[k];
                      const val = Array.isArray(raw) ? raw.filter(Boolean).join('；') : String(raw ?? '').trim();
                      const labels: Record<string, string> = { range: '分佈', habitat: '環境', diet: '食物', look: '外形' };
                      return (
                        <div key={k} className="bg-black/30 rounded p-1.5 leading-tight">
                          <p className="text-amber-300/80 text-[9px] font-black">{labels[k]}</p>
                          <p className="text-white/60 text-[9.5px] mt-0.5">
                            {val || '資料待查'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-auto text-white/25 text-[8px]">按一下返回插畫</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* 放大鏡：細細一粒，避免搶走翻轉點擊 */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
            className="absolute bottom-1.5 right-1.5 z-10 bg-black/60 hover:bg-black/85 text-white/70 rounded-full w-6 h-6 flex items-center justify-center"
            aria-label={t('放大', 'Expand')}
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 右下角喇叭孔 */}
      <div className="absolute bottom-3 right-6 flex flex-col gap-1 opacity-40">
        <div className="w-6 h-1 bg-gray-800 rounded-full" />
        <div className="w-6 h-1 bg-gray-800 rounded-full" />
        <div className="w-6 h-1 bg-gray-800 rounded-full" />
      </div>
    </div>
  </div>
</div> {/* 左面板結束 */}

                 {/* --- 右半部分：控制與資料面板 --- */}
          <div className="w-full md:w-1/2 min-h-[60%] md:h-full bg-[#221b17] border-[4px] md:border-[6px] border-gray-900 rounded-b-[28px] md:rounded-r-[28px] md:rounded-bl-none flex flex-col p-3 md:p-4 gap-2 relative overflow-y-auto">
              <PokedexTabs
                page={page}
                onChange={setPage}
                lang={lang}
                detailLoading={page !== 2 && !detailReady}
              />

              <AnimatePresence mode="wait">
                {page === 1 && (
                  /* --- Page 1: 基礎數據 --- */
                  <motion.div
                    key="data-page"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col justify-start min-h-max w-full gap-4 relative z-10 pb-10"
                  >
                    {/* 1. 頂部編號螢幕 */}
                    <div className="flex items-baseline justify-between border-b border-white/10 pb-1.5">
                      <span className="text-emerald-300/80 font-mono text-[11px] tracking-[0.18em]">
                        ID-{currentBird.id}
                      </span>
                      <span className="text-white/25 font-mono text-[9px]">
                        {currentIndex + 1} / {birds.length}
                      </span>
                    </div>

                    {/* 2. 中文名稱顯示 */}
                    <div className="py-1">
                      <p className={`text-white font-black tracking-wide leading-tight ${
                        currentBird.name.length > 5 ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
                      }`}>
                        {lang === 'en' ? (entry?.e || sciQuery) : currentBird.name}
                      </p>
                      <p className="text-white/40 text-[11px] italic mt-0.5">{sciQuery}</p>
                    </div>

                    {/* 2.5 未有自己圖卡時：一鍵去 Google 圖片／eBird 睇真身 */}
                    {!currentImage.url && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${sciQuery} bird`)}`,
                              '_blank',
                            )
                          }
                          className="bg-emerald-700/70 hover:bg-emerald-600 text-white font-black text-[11px] py-2.5 rounded-xl border-b-4 border-emerald-950 active:translate-y-0.5 active:border-b-0 transition-all"
                        >
                          {t('睇真身 · GOOGLE 圖', 'See it · GOOGLE IMAGES')}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `https://ebird.org/species/search?q=${encodeURIComponent(sciQuery)}`,
                              '_blank',
                            )
                          }
                          className="bg-sky-700/70 hover:bg-sky-600 text-white font-black text-[11px] py-2.5 rounded-xl border-b-4 border-sky-950 active:translate-y-0.5 active:border-b-0 transition-all"
                        >
                          {t('物種頁 · eBIRD', 'SPECIES PAGE · eBIRD')}
                        </button>
                      </div>
                    )}

                    {/* 3. 搜尋與快速跳轉 */}
                    <div className="space-y-2">
                      <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                          type="text"
                          placeholder={t('搜尋名稱或編號...', 'Name or number...')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-black/35 border border-white/15 rounded-lg py-2.5 px-3 pr-10 text-white placeholder:text-white/35 text-[13px] outline-none focus:border-amber-400/50"
                        />
                        <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white">
                          <Search className="w-4 h-4" />
                        </button>
                      </form>
                      
                      <div className="relative">
                        <select
                          onChange={(e) => jumpToBird(e.target.value)}
                          value={currentBird.id}
                          className="w-full appearance-none bg-black/35 border border-white/15 rounded-lg py-2.5 px-3 pr-9 text-white text-[12px] cursor-pointer outline-none focus:border-amber-400/50"
                        >
                          {birds.map(bird => (
                            <option key={bird.id} value={bird.id}>{bird.id} ➟ {lang === 'en' ? (ENTRIES[bird.id]?.e || bird.name) : bird.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 pointer-events-none" />
                      </div>
                    </div>

                    {/* 4. 底部導航按鈕 */}
                    <div className="flex justify-between items-center gap-2 pt-1">
                      <button onClick={handlePrev} disabled={currentIndex === 0} className={`w-11 h-11 rounded-full border border-white/15 flex items-center justify-center transition-colors ${currentIndex === 0 ? 'bg-white/5 text-white/20' : 'bg-white/10 hover:bg-white/20 text-amber-200'}`}>
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <span className="text-white/25 font-mono text-[9px] tracking-[0.18em]">NAV</span>
                      <button onClick={handleNext} disabled={currentIndex === birds.length - 1} className={`w-11 h-11 rounded-full border border-white/15 flex items-center justify-center transition-colors ${currentIndex === birds.length - 1 ? 'bg-white/5 text-white/20' : 'bg-white/10 hover:bg-white/20 text-amber-200'}`}>
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>

                    {/* 下一頁：詳細資料（文字） */}
                    <button
                      onClick={() => setPage(2)}
                      className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-gray-900 font-black py-3.5 rounded-xl border-[4px] border-yellow-800 shadow-[0_4px_0_rgba(133,77,14,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      {t('詳細資料（文字）', 'DETAILS (TEXT)')}
                    </button>
                    <button
                      onClick={() => setPage(3)}
                      className="w-full bg-black/35 hover:bg-black/55 text-amber-100 font-black py-3 rounded-xl border-2 border-amber-400/35 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-[12px]"
                    >
                      {t('科學研究中心（相片／聲音／紀錄）', 'RESEARCH (PHOTOS / SOUND / RECORDS)')}
                    </button>

                    {/* 三行完整的內容 */}
  <div className="flex flex-col gap-1">
    <p className="text-white/90 text-[13px] font-bold leading-snug">
      {t('1. 本機中文名稱由 AI 輔助生成，部分生僻字可能不夠精確。', '1. Chinese names are AI-assisted; rare characters may be inaccurate.')}
    </p>
    <p className="text-white/90 text-[13px] font-bold leading-snug">
      {t('2. 建議參考右側校對過的資訊，或以英文學名為準。', '2. Trust the checked copy in Details, or the scientific name.')}
    </p>
    <p className="text-amber-200/80 text-[11px] font-medium italic mt-1">
      {t('* 如需權威數據，請按「詳細資料」再開 eBird／Macaulay。', '* For authoritative data, open Details, then eBird or Macaulay.')}
    </p>
  </div>
                  </motion.div>
                )}

                {page === 2 && (
                  /* --- Page 2: 詳細資料（純文字：12 欄 + 相似鳥 + 禮儀／裝備） --- */
                  <BirdDetailPage
                    bird={currentBird}
                    lang={lang}
                    onBack={() => setPage(1)}
                    onJump={(id) => jumpToBird(id)}
                    onOpenGuide={(k) => onOpenGuide?.(k)}
                    onLoaded={() => setDetailReady(true)}
                  />
                )}

                {page === 3 && (
                  /* --- Page 3: 科學研究中心（六格分工 + 本站合成圖卡） --- */
                  <ResearchHubPage
                    zhName={currentBird.name}
                    enName={currentBird.englishName && currentBird.englishName !== '???' ? currentBird.englishName : ''}
                    sciName={sciQuery}
                    speciesCode={entry?.code}
                    lang={lang}
                    cardUrl={currentImage.url}
                    infoUrl={infoImage.status === 'loaded' ? infoImage.url : undefined}
                    onBackToCard={() => setPage(1)}
                  />
                )}
      </AnimatePresence>
      <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-red-950/20 border-4 border-red-900/10 pointer-events-none" />
    </div>
  </motion.div>
</div>
)}

      {/* === AI 媒體擷取面板 (錄音 / 拍照 / 上傳) === */}
      {captureKind && (
        <MediaCapturePanel
          open={!!captureKind}
          kind={captureKind}
          onClose={() => setCaptureKind(null)}
          onCapture={(file, kind) => dispatchMedia(file, kind)}
        />
      )}
</AnimatePresence>
);
};

export default PokedexDevice;
