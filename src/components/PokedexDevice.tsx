import React, { useEffect, useState } from 'react';
import { Bird } from '../types';
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Globe, 
  BookOpen, 
  Mic,      // 加入這一個
  MapPin,     // 觀察雷達
  Camera,     // 視覺圖庫
  PlayCircle, // 影片中心
  Volume2,    // 鳴聲資料
  Download,   // 辨識裝備
  Award       // 鳴謝區
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirdSilhouette } from './BirdSilhouette.tsx';
import { MediaCapturePanel, MediaKind } from './MediaCapturePanel.tsx';

interface PokedexDeviceProps {
  birds: Bird[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  /** 舊版簽名：只傳檔案；內部會用 MIME 判斷聲音 / 圖片 */
  onAnalyze?: (file: File | Blob) => void;
  /** 新版簽名：明確指定 'audio' 或 'image' */
  onAnalyzeMedia?: (file: File | Blob, kind: 'audio' | 'image') => void;
}

export const PokedexDevice: React.FC<PokedexDeviceProps> = ({ 
  birds, 
  initialIndex, 
  isOpen, 
  onClose,
  onAnalyze, // 舊版相容
  onAnalyzeMedia, // 新版：可同時做聲音/圖片
}) => {
  // --- 媒體擷取面板 ---
  const [captureKind, setCaptureKind] = useState<MediaKind | null>(null);
  const dispatchMedia = (file: File | Blob, kind: MediaKind) => {
    if (onAnalyzeMedia) { onAnalyzeMedia(file, kind); return; }
    if (onAnalyze) onAnalyze(file);
  };
  // --- 1. 核心狀態 ---
  const [showDetails, setShowDetails] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

 // 1. 當圖鑑打開或切換全螢幕時，控制網頁滾動
  useEffect(() => {
    if (isOpen) {
      // 只要圖鑑打開，就禁止背景網頁捲動，避免出現拉假的捲軸
      document.body.style.overflow = 'hidden';
      setCurrentIndex(initialIndex);
      setImgStatus('loading');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialIndex]);

  // 3. 切換鳥類時觸發讀取狀態
  useEffect(() => {
    setImgStatus('loading');
  }, [currentIndex]);

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
  }, [isOpen, isFullscreen, isSearching, currentIndex]);

  // 下一隻
  const handleNext = () => {
    if (currentIndex < birds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // 上一隻
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

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
    // 同時支援編號與中文名搜尋
    const found = birds.find(b => b.id === term || b.name === term);
    if (found) {
      jumpToBird(found.id);
    }
  };

  if (!isOpen) return null;

  const currentBird = birds[currentIndex];

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
          <div className="sticky top-0 left-0 w-full p-4 md:p-10 flex justify-between items-center z-[150] pointer-events-none">
            {/* iPad/手機標題 (簡化並缩小以讓出空間) */}
            <div className="md:hidden bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto origin-top-left scale-90">
              <span className="text-yellow-400 font-bold text-xs">【{currentBird.id}】 {currentBird.name}</span>
            </div>

            {/* 電腦標題 (md以上顯示) */}
            <div className="hidden md:flex bg-black/60 backdrop-blur-md border border-white/20 p-6 rounded-2xl items-center gap-6 pointer-events-auto">
              <span className="text-white text-xl font-bold">【NO.{currentBird.id}】 {currentBird.name}</span>
            </div>

            {/* 右上角 X 關閉鈕：必備退出功能 */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
              className="pointer-events-auto bg-white/10 hover:bg-red-500 backdrop-blur-xl border border-white/20 text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl"
            >
              <X className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          </div>

          {/* --- 核心圖片顯示區：原生縮放優先（電腦滾輪 / 手機雙指）---
               已移除自訂放大鏡與縮放模式，改由瀏覽器/裝置內置縮放手勢處理。 */}
          <div 
            className="w-full h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-center py-6 md:py-10">
              {/* 圖片主體 */}
              <motion.img 
                src={currentBird.imageUrl} 
                alt={currentBird.name} 
                className="object-contain rounded-lg shadow-2xl w-[98%] md:max-w-[95%] h-auto md:max-h-[85vh]"
              />
            </div>
            
            {/* 詳細資料按鈕 / RESEARCH：確保它在圖片捲動範圍內，且容易按到 */}
            {currentBird.discovered && (
               <div className="w-full flex justify-center py-12 pb-24 md:hidden">
                 <button 
                   onClick={() => window.open(`https://www.allaboutbirds.org/guide/${currentBird.name.replace(/ /g, '_')}`, '_blank')}
                   className="bg-blue-600 text-white font-black px-12 py-5 rounded-2xl text-xl shadow-2xl active:scale-95 transition-all flex items-center gap-3"
                 >
                   <BookOpen className="w-6 h-6" />
                   詳細資料 / RESEARCH
                 </button>
               </div>
            )}
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
  
  {/* 行動端專用 HUD - 聲音/影像 AI 辨識 */}
  <div className="md:hidden absolute top-20 left-4 right-4 flex justify-between z-30 pointer-events-none">
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
    </div>
  </div>

  {/* 螢幕核心區域 */}
  <div className="flex-1 p-2 md:p-3 flex flex-col items-center justify-center overflow-hidden">
    <div className="w-full h-full bg-gradient-to-b from-[#fff8d6] to-[#f5e8a3] rounded-t-xl rounded-bl-xl rounded-br-[40px] p-2 md:p-3 border-[5px] border-gray-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.2)] relative flex flex-col overflow-hidden">
      <div className="flex justify-center gap-4 mb-1">
        <div className="w-2 h-2 rounded-full bg-red-600 border border-red-900 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-red-600 border border-red-900" />
      </div>

      <div 
        className="flex-1 bg-gradient-to-br from-[#1a1410] to-[#0a0805] rounded-lg border-[4px] border-amber-900/60 relative overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]"
        onClick={() => setIsFullscreen(true)}
      >
        <motion.img 
          key={currentBird.id}
          src={currentBird.imageUrl} 
          className="w-full h-full object-contain p-1"
        />
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
          <div className="w-full md:w-1/2 min-h-[60%] md:h-full bg-gradient-to-bl from-[#c92b0a] via-[#9a2208] to-[#6e1804] border-[6px] md:border-[10px] border-gray-900 rounded-b-[40px] md:rounded-r-[40px] md:rounded-bl-none flex flex-col p-6 md:p-8 shadow-[inset_15px_0_40px_rgba(0,0,0,0.3),inset_0_3px_8px_rgba(255,255,255,0.15)] relative overflow-y-auto">
              <AnimatePresence mode="wait">
                {!showDetails ? (
                  /* --- Page 1: 基礎數據 --- */
                  <motion.div
                    key="data-page"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col justify-start min-h-max w-full gap-4 relative z-10 pb-10"
                  >
                    {/* 1. 頂部編號螢幕 */}
                    <div className="bg-[#1a1a1a] border-[4px] border-gray-600 rounded-xl p-2 md:p-3 flex items-center justify-center relative shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
                      <span className="text-green-400 font-mono text-2xl md:text-4xl font-black z-10 tracking-[0.1em]">
                        ID-{currentBird.id}
                      </span>
                    </div>

                    {/* 2. 中文名稱顯示 */}
                    <div className="bg-[#1a1a1a] border-[4px] border-gray-600 rounded-xl p-3 md:p-4 flex items-center justify-center relative min-h-[60px] md:min-h-[80px]">
                      <span className={`text-green-400 font-bold z-10 tracking-wider text-center leading-tight ${
                        currentBird.name.length > 5 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'
                      }`}>
                        {currentBird.name}
                      </span>
                    </div>

                    {/* 3. 搜尋與快速跳轉 */}
                    <div className="bg-red-900/30 p-5 rounded-[30px] border-2 border-red-900/20 space-y-4 shadow-inner">
                      <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                          type="text"
                          placeholder="搜尋名稱或編號..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-[#DEDEDE] border-[5px] border-gray-800 rounded-xl py-3 px-4 font-black text-gray-900 outline-none"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-lg">
                          <Search className="w-5 h-5 text-white" />
                        </button>
                      </form>
                      
                      <div className="relative">
                        <select
                          onChange={(e) => jumpToBird(e.target.value)}
                          value={currentBird.id}
                          className="w-full appearance-none bg-yellow-400 border-[5px] border-gray-800 rounded-xl py-3 px-4 font-black text-gray-900 cursor-pointer"
                        >
                          {birds.map(bird => (
                            <option key={bird.id} value={bird.id}>{bird.id} ➟ {bird.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-900 pointer-events-none" />
                      </div>
                    </div>

                    {/* 4. 底部導航按鈕 */}
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded-[20px]">
                      <button onClick={handlePrev} disabled={currentIndex === 0} className={`w-14 h-14 rounded-full border-[4px] border-gray-800 flex items-center justify-center ${currentIndex === 0 ? 'bg-gray-500' : 'bg-gradient-to-b from-amber-300 to-amber-600 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3)]'}`}>
                        <ChevronLeft className="w-8 h-8 text-white" />
                      </button>
                      <span className="text-red-900 font-black text-[9px] uppercase">NAV SYSTEM</span>
                      <button onClick={handleNext} disabled={currentIndex === birds.length - 1} className={`w-14 h-14 rounded-full border-[4px] border-gray-800 flex items-center justify-center ${currentIndex === birds.length - 1 ? 'bg-gray-500' : 'bg-gradient-to-b from-amber-300 to-amber-600 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3)]'}`}>
                        <ChevronRight className="w-8 h-8 text-white" />
                      </button>
                    </div>

                    {/* 詳細資料按鈕 - 觸發換頁 */}
                    <button 
                      onClick={() => setShowDetails(true)}
                      className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-gray-900 font-black py-4 rounded-xl border-[4px] border-yellow-800 shadow-[0_4px_0_rgba(133,77,14,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      詳細資料 / RESEARCH
                    </button>

                    {/* 三行完整的內容 */}
  <div className="flex flex-col gap-1">
    <p className="text-white/90 text-[13px] font-bold leading-snug">
      1. 本機中文名稱由 AI 輔助生成，部分生僻字可能不夠精確。
    </p>
    <p className="text-white/90 text-[13px] font-bold leading-snug">
      2. 建議參考右側校對過的資訊，或以英文學名為準。
    </p>
    <p className="text-amber-200/80 text-[11px] font-medium italic mt-1">
      * 如需獲取權威數據，請點擊下方科研終端按鈕。
    </p>
  </div>
                  </motion.div>
                ) : (
             /* --- Page 2: 科學研究自學頁 (BIRDDEX 圖片導航版) --- */
          <motion.div
            key="research-page"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col w-full h-full gap-4 relative z-10"
          >
            {/* 核心功能：四宮格圖片容器 */}
            <div className="flex-1 bg-gradient-to-b from-amber-950/60 to-black/70 rounded-3xl p-5 border-2 border-amber-500/30 flex flex-col gap-4 overflow-hidden shadow-inner">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-amber-200 font-black text-lg tracking-tighter uppercase leading-none">科學研究中心</h3>
                  <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Research Hub / {currentBird.name}</p>
                </div>
              </div>

            {/* 六宮格圖片矩陣 */}
<div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
  
  {/* 1. 深度百科 */}
 <button 
  onClick={() => window.open(`https://www.allaboutbirds.org/guide/${currentBird.name.replace(/ /g, '_')}`, '_blank')}
  className="relative group rounded-2xl border-b-4 border-blue-950 overflow-hidden active:translate-y-0.5 transition-all"
>
    <img src="/images/hub_wiki.jpg" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Wiki" />
    <div className="absolute inset-0 bg-blue-900/40 group-hover:bg-blue-800/20 transition-colors" />
    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm p-2 flex flex-col items-center gap-1 border-t border-white/10">
      <BookOpen className="w-4 h-4 text-white/90" />
      <span className="text-white font-black text-[10px] tracking-tight">深度百科</span>
    </div>
  </button>

  {/* 2. 觀察雷達 */}
  <button 
    onClick={() => window.open(`https://ebird.org/region/HK`, '_blank')}
    className="relative group rounded-2xl border-b-4 border-emerald-950 overflow-hidden active:translate-y-0.5 transition-all"
  >
    <img src="/images/hub_radar.jpg" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Radar" />
    <div className="absolute inset-0 bg-emerald-900/40 group-hover:bg-emerald-800/20 transition-colors" />
    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm p-2 flex flex-col items-center gap-1 border-t border-white/10">
      <MapPin className="w-4 h-4 text-white/90" />
      <span className="text-white font-black text-[10px] tracking-tight">觀察雷達</span>
    </div>
  </button>

  {/* 3. 視覺圖庫 */}
  <button 
  onClick={() => window.open(`https://www.flickr.com/search/?text=${currentBird.name}`, '_blank')}
  className="relative group rounded-2xl border-b-4 border-purple-950 overflow-hidden active:translate-y-0.5 transition-all"
>
    <img src="/images/hub_photo.jpg" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Photos" />
    <div className="absolute inset-0 bg-purple-900/40 group-hover:bg-purple-800/20 transition-colors" />
    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm p-2 flex flex-col items-center gap-1 border-t border-white/10">
      <Camera className="w-4 h-4 text-white/90" />
      <span className="text-white font-black text-[10px] tracking-tight">視覺圖庫</span>
    </div>
  </button>

  {/* 4. 影片中心 */}
  <button 
    onClick={() => window.open(`https://www.youtube.com/results?search_query=${currentBird.name}+bird+wildlife`, '_blank')}
    className="relative group rounded-2xl border-b-4 border-red-950 overflow-hidden active:translate-y-0.5 transition-all"
  >
    <img src="/images/hub_video.jpg" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Videos" />
    <div className="absolute inset-0 bg-red-900/40 group-hover:bg-red-800/20 transition-colors" />
    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm p-2 flex flex-col items-center gap-1 border-t border-white/10">
      <PlayCircle className="w-4 h-4 text-white/90" />
      <span className="text-white font-black text-[10px] tracking-tight">影片中心</span>
    </div>
  </button>

  {/* 5. 鳴聲資料 */}
  <button 
    onClick={() => window.open(`https://xeno-canto.org/explore?query=${currentBird.name}`, '_blank')}
    className="relative group rounded-2xl border-b-4 border-orange-950 overflow-hidden active:translate-y-0.5 transition-all"
  >
    <img src="/images/hub_audio.jpg" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Audio" />
    <div className="absolute inset-0 bg-orange-900/40 group-hover:bg-orange-800/20 transition-colors" />
    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm p-2 flex flex-col items-center gap-1 border-t border-white/10">
      <Volume2 className="w-4 h-4 text-white/90" />
      <span className="text-white font-black text-[10px] tracking-tight">鳴聲資料</span>
    </div>
  </button>

  {/* 6. 辨識裝備 */}
<button 
  onClick={() => window.open('https://merlin.allaboutbirds.org/', '_blank')}
  className="relative group rounded-2xl border-b-4 border-slate-950 overflow-hidden active:translate-y-0.5 transition-all"
>
  <img src="/images/hub_download.jpg" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Download" />
  <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-800/20 transition-colors" />
  <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm p-2 flex flex-col items-center gap-1 border-t border-white/10">
    <Download className="w-4 h-4 text-white/90" />
    <span className="text-white font-black text-[10px] tracking-tight">辨識裝備</span>
  </div>
</button>
  
</div>
              {/* 鳴謝區 */}
              <div className="mt-auto p-3 bg-amber-900/30 rounded-xl border border-amber-400/20">
                <p className="text-[10px] text-amber-300 font-black tracking-widest uppercase mb-1 flex items-center gap-2">
                  <Award className="w-3 h-3" /> Credits & Sources
                </p>
                <p className="text-[9px] text-white/50 leading-relaxed italic">
                  本計畫之科學數據由 <span className="text-amber-300 font-bold">Cornell Lab</span> 提供。
                  鳴謝 eBird 及 Macaulay Library。
                </p>
              </div>
            </div> {/* <-- 剛才漏掉的這個容器關閉標籤 */}

            {/* 返回按鈕 */}
            <button 
              onClick={() => setShowDetails(false)}
              className="w-full bg-red-900/60 hover:bg-red-800 text-white font-black py-4 rounded-2xl border-b-4 border-red-950 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> 返回基礎數據面板
            </button>
          </motion.div>
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
