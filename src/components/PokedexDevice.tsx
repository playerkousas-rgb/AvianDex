import React, { useEffect, useState, useRef, MouseEvent } from 'react';
import { Bird } from '../types';
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  ZoomIn 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirdSilhouette } from './BirdSilhouette.tsx';

interface PokedexDeviceProps {
  birds: Bird[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PokedexDevice: React.FC<PokedexDeviceProps> = ({ 
  birds, 
  initialIndex, 
  isOpen, 
  onClose 
}) => {
  // --- 1. 核心狀態 ---
  const [showDetails, setShowDetails] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- 2. 教學模式與放大鏡專用狀態 ---
  // 注意：這裡只定義一次 viewMode 和 zoomScale
  const [viewMode, setViewMode] = useState<'lens' | 'zoom'>('lens');
  const [zoomScale, setZoomScale] = useState(1); 
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [isLensVisible, setIsLensVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // --- 3. 引用與配置 ---
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ZOOM_LEVEL = 4;      // 4倍放大
  const LENS_SIZE = 280;     // 放大鏡直徑

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

  // 2. 切換全螢幕狀態時的額外處理
  useEffect(() => {
    if (!isFullscreen) {
      // 退出全螢幕時，重置縮放倍率和模式，確保下次進入是乾淨的
      setZoomScale(1);
      setViewMode('lens');
    }
  }, [isFullscreen]);

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

  // 核心放大鏡移動計算法
  const handleMagnifierMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    
    // 計算滑鼠相對於圖片的位置
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 檢查滑鼠是否在圖片範圍內
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setLensPosition({ x, y });
      setCursorPos({ x: e.clientX, y: e.clientY });
      setIsLensVisible(true);
    } else {
      setIsLensVisible(false);
    }
  };

  if (!isOpen) return null;

  const currentBird = birds[currentIndex];

  return (
    <AnimatePresence>
      {/* ============================================================
          SECTION 1: 全螢幕教學觀察模式 (放大鏡模式)
          ============================================================ */}
      {isFullscreen && (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    /* 根據 viewMode 切換游標顯示：放大鏡模式隱藏游標(因為有鏡面)，縮放模式顯示游標 */
    className={`fixed inset-0 z-[100] bg-black/95 flex items-center justify-center overflow-hidden ${viewMode === 'lens' ? 'cursor-none' : 'cursor-default'}`}
    onMouseMove={viewMode === 'lens' ? handleMagnifierMouseMove : undefined}
    onClick={() => setIsFullscreen(false)}
  >
    {/* --- 1. 教學標頭導覽 (保持原樣，僅調整 z-index) --- */}
    <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-[110] pointer-events-none">
      <div className="bg-black/60 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center gap-6 shadow-2xl">
        <div className="bg-yellow-400 p-3 rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.4)]">
          <ZoomIn className="w-10 h-10 text-black animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-green-400 font-black text-3xl tracking-widest uppercase">Micro-Observation</span>
          <span className="text-white text-xl font-bold">【NO.{currentBird.id}】{currentBird.name}</span>
        </div>
      </div>
      
      <div className="hidden lg:flex flex-col items-end gap-2 text-white/70 font-mono text-sm">
        <p>MODE: {viewMode === 'lens' ? 'PHYSICAL_LENS' : 'DIGITAL_ZOOM'}</p>
        <p>MAGNIFICATION: {viewMode === 'lens' ? ZOOM_LEVEL : zoomScale.toFixed(1)}X</p>
        <p>STATUS: ACTIVE_RESEARCH</p>
      </div>
    </div>

    {/* --- 2. 🚀 新增：中央頂部模式切換與 +- 控制器 --- */}
    <div 
      className="absolute top-32 md:top-10 left-1/2 -translate-x-1/2 z-[130] flex flex-col items-center gap-4 pointer-events-auto"
      onClick={(e) => e.stopPropagation()} // 防止點擊控制按鈕時關閉全螢幕
    >
      {/* 模式切換按鈕 */}
      <div className="bg-gray-900/80 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl flex gap-1 shadow-2xl">
        <button 
          onClick={() => setViewMode('lens')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${viewMode === 'lens' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/10'}`}
        >
          🔍 放大鏡
        </button>
        <button 
          onClick={() => { setViewMode('zoom'); if(zoomScale === 1) setZoomScale(1.5); }}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${viewMode === 'zoom' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/10'}`}
        >
          🖼️ 縮放模式
        </button>
      </div>

      {/* 縮放專用控制 +- (僅在 zoom 模式顯示) */}
      {viewMode === 'zoom' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl flex items-center gap-4 px-4 shadow-xl"
        >
          <button 
            onClick={() => setZoomScale(s => Math.max(1, s - 0.5))}
            className="w-10 h-10 rounded-lg bg-white/20 text-white hover:bg-white/40 font-black text-2xl flex items-center justify-center"
          >−</button>
          <span className="text-yellow-400 font-mono font-bold text-xl min-w-[60px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button 
            onClick={() => setZoomScale(s => Math.min(5, s + 0.5))}
            className="w-10 h-10 rounded-lg bg-white/20 text-white hover:bg-white/40 font-black text-2xl flex items-center justify-center"
          >＋</button>
        </motion.div>
      )}
    </div>

  {/* --- 3. 觀察對象主體圖片 (修正版：放大不吃頭) --- */}
<div 
  className={`relative flex w-full h-full p-4 md:p-10 transition-all ${
    viewMode === 'zoom' 
      ? 'overflow-y-auto items-start justify-center pt-20 pb-32' // 縮放模式：靠頂部、允許垂直捲動、預留上下呼吸空間
      : 'items-center justify-center overflow-hidden'         // 放大鏡模式：保持置中、禁止溢出
  }`}
  onClick={(e) => e.stopPropagation()}
>
  <motion.img 
    ref={imgRef}
    src={currentBird.imageUrl} 
    alt={currentBird.name} 
    style={{ 
      /* 核心切換邏輯 */
      transform: viewMode === 'zoom' ? `scale(${zoomScale})` : 'scale(1)',
      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: viewMode === 'zoom' ? 'grab' : 'none',
      
      /* 🌟 關鍵修正：縮放模式時從頂部放大，保證頭部文字永遠在捲動起點 */
      transformOrigin: viewMode === 'zoom' ? 'top center' : 'center center'
    }}
    /* 縮放模式下取消 max-h 限制，否則會被強制壓扁 */
    className={`object-contain rounded-lg shadow-[0_0_80px_rgba(255,255,255,0.1)] ${
      viewMode === 'zoom' ? 'max-w-[85%] h-auto' : 'max-w-[90%] max-h-[90%]'
    }`}
    onWheel={(e) => {
      if (viewMode === 'zoom') {
        const delta = e.deltaY > 0 ? -0.1 : 0.1; // 步長小一點，縮放更順滑
        setZoomScale(s => Math.min(5, Math.max(1, s + delta)));
      }
    }}
  />
      
      {/* 4. 實體放大鏡鏡面效果 (僅在 lens 模式顯示) */}
      {viewMode === 'lens' && isLensVisible && (
        <div 
          className="pointer-events-none fixed z-[120] border-[8px] border-white/90 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden rounded-full"
          style={{
            width: `${LENS_SIZE}px`,
            height: `${LENS_SIZE}px`,
            left: `${cursorPos.x - LENS_SIZE / 2}px`,
            top: `${cursorPos.y - LENS_SIZE / 2}px`,
            backgroundImage: `url('${currentBird.imageUrl}')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: imgRef.current 
              ? `${imgRef.current.width * ZOOM_LEVEL}px ${imgRef.current.height * ZOOM_LEVEL}px` 
              : 'auto',
            backgroundPosition: `-${lensPosition.x * ZOOM_LEVEL - LENS_SIZE / 2}px -${lensPosition.y * ZOOM_LEVEL - LENS_SIZE / 2}px`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
          <div className="absolute top-4 left-1/4 w-12 h-4 bg-white/20 rounded-full blur-sm rotate-12" />
        </div>
      )}
    </div>

    {/* 右下角關閉引導 (保持原樣，增加 pointer-events-auto) */}
    <div className="absolute bottom-10 right-10 z-[140] pointer-events-auto">
      <button 
        className="bg-red-600 hover:bg-red-500 text-white p-5 rounded-full shadow-2xl transition-all active:scale-90 flex items-center gap-3"
        onClick={() => setIsFullscreen(false)}
      >
        <span className="font-bold px-2 text-xl">退出觀察</span>
        <X className="w-8 h-8" />
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
            className="w-full max-w-5xl h-[92vh] md:h-[88vh] flex flex-col md:flex-row shadow-2xl relative"
          >
            {/* 總開關關閉按鈕 */}
            <button 
              onClick={onClose}
              className="absolute -top-5 -right-5 md:-right-10 md:-top-10 z-[60] p-3 bg-white rounded-full text-red-600 shadow-2xl border-4 border-gray-800 hover:rotate-90 transition-transform duration-500"
            >
              <X className="w-8 h-8" />
            </button>

           {/* --- 左半部分：圖鑑顯示面板 --- */}
<div className="w-full md:w-1/2 h-[55%] md:h-full bg-[#E3350D] border-[6px] md:border-[10px] border-gray-800 rounded-t-[40px] md:rounded-l-[40px] md:rounded-tr-none flex flex-col relative z-20 shadow-[inset_-15px_0_40px_rgba(0,0,0,0.3)]">
  
  {/* 頂部感應燈區塊：大幅壓縮垂直空間 (p-6 -> p-2) */}
  <div className="flex items-center gap-4 p-2 md:p-3 border-b-4 border-red-900/40 bg-gradient-to-b from-red-400 to-transparent">
    {/* 大號藍色主感應燈：從 w-24 縮小到 w-12 */}
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center border-[3px] border-gray-800 shadow-md">
      <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#31A5E8] border-[2px] border-white shadow-[0_0_10px_rgba(49,165,232,0.8)] relative overflow-hidden">
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full blur-[1px]" />
      </div>
    </div>
    
    {/* 三色狀態燈：縮小尺寸 (w-5 -> w-3) */}
    <div className="flex gap-2">
      <div className="w-3 h-3 rounded-full bg-red-600 border border-black/30 shadow-inner" />
      <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black/30 shadow-inner" />
      <div className="w-3 h-3 rounded-full bg-green-500 border border-black/30 shadow-inner" />
    </div>
  </div>

  {/* 螢幕核心區域：將內距縮到最小 (p-6/8 -> p-2/3) */}
  <div className="flex-1 p-2 md:p-3 flex flex-col items-center justify-center overflow-hidden">
    {/* 灰色內框螢幕：減少 Padding (p-6 -> p-2) */}
    <div className="w-full h-full bg-[#DEDEDE] rounded-t-xl rounded-bl-xl rounded-br-[40px] p-2 md:p-3 border-[5px] border-gray-800 shadow-[inset_0_0_15px_rgba(0,0,0,0.2)] relative flex flex-col overflow-hidden">
      
      {/* 螢幕上方雙指示燈：縮小間距 (mb-4 -> mb-1) */}
      <div className="flex justify-center gap-4 mb-1">
        <div className="w-2 h-2 rounded-full bg-red-600 border border-red-900 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-red-600 border border-red-900" />
      </div>

      {/* 黑色顯示區域：這塊現在會變得超級大！ */}
      <div 
        className="flex-1 bg-[#1a1a1a] rounded-lg border-[4px] border-gray-700 relative overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-2xl"
        onClick={() => setIsFullscreen(true)}
      >
        {imgStatus === 'loading' && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-3 border-gray-600 border-t-green-400 rounded-full animate-spin" />
            <span className="text-green-400 font-mono text-[10px] animate-pulse">LOADING...</span>
          </div>
        )}
        
        <motion.img 
          key={currentBird.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          src={currentBird.imageUrl} 
          onLoad={() => setImgStatus('loaded')}
          className={`w-full h-full object-contain z-10 p-1 transition-transform duration-700 group-hover:scale-105 ${imgStatus === 'loaded' ? 'block' : 'hidden'}`}
        />

        {/* 懸浮引導：縮小尺寸以免擋圖 */}
        {imgStatus === 'loaded' && (
          <div className="absolute bottom-3 right-3 z-20 scale-75 md:scale-100 origin-bottom-right">
            <div className="bg-yellow-400/90 text-black font-black px-3 py-1 rounded-lg shadow-xl flex items-center gap-2 transform translate-y-10 group-hover:translate-y-0 transition-transform">
              <ZoomIn className="w-4 h-4" />
              <span className="text-xs">點擊觀測</span>
            </div>
          </div>
        )}
      </div>

      {/* 右下角喇叭孔：縮小尺寸 (w-10 -> w-6) */}
      <div className="absolute bottom-3 right-6 flex flex-col gap-1 opacity-40">
        <div className="w-6 h-1 bg-gray-800 rounded-full" />
        <div className="w-6 h-1 bg-gray-800 rounded-full" />
        <div className="w-6 h-1 bg-gray-800 rounded-full" />
      </div>
    </div>
  </div>
</div>

            {/* --- 中間摺疊轉軸 --- */}
            <div className="hidden md:flex w-16 bg-[#C02A0A] border-y-[10px] border-gray-800 flex-col justify-around py-20 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] z-10 relative">
              <div className="w-full h-1 bg-black/20" />
              <div className="w-full h-1 bg-black/20" />
              <div className="w-full h-1 bg-black/20" />
              <div className="w-full h-1 bg-black/20" />
              <div className="w-full h-1 bg-black/20" />
              <div className="w-full h-1 bg-black/20" />
            </div>

                  {/* --- 右半部分：控制與資料面板 --- */}
<div className="w-full md:w-1/2 h-2/5 md:h-full bg-[#E3350D] border-[6px] md:border-[10px] border-gray-800 rounded-b-[40px] md:rounded-r-[40px] md:rounded-bl-none flex flex-col p-6 md:p-8 shadow-[inset_15px_0_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
  
  {/* 內部容器 - 加入分頁邏輯 */}
  <AnimatePresence mode="wait">
    {!showDetails ? (
      /* ==========================================
         第一頁：基礎資料 (原本的內容)
         ========================================== */
      <motion.div
        key="page1"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col justify-start min-h-max w-full gap-4 relative z-10 pb-10 h-full"
      >
        {/* 1. 頂部編號螢幕 */}
        <div className="bg-[#1a1a1a] border-[4px] border-gray-600 rounded-xl p-2 md:p-3 flex items-center justify-center relative shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
          <span className="text-green-400 font-mono text-2xl md:text-4xl font-black z-10 tracking-[0.1em] drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
            ID-{currentBird.id}
          </span>
        </div>

        {/* 2. 中文名稱螢幕 */}
        <div className="bg-[#1a1a1a] border-[4px] border-gray-600 rounded-xl p-3 md:p-4 flex items-center justify-center relative shadow-[inset_0_0_15px_rgba(0,0,0,1)] min-h-[60px] md:min-h-[80px]">
          <span className={`text-green-400 font-bold z-10 tracking-wider drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] text-center leading-tight ${
            currentBird.name.length > 5 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'
          }`}>
            {currentBird.name}
          </span>
        </div>

        {/* 3. 搜尋與快速跳轉 */}
        <div className="bg-red-900/30 p-4 rounded-[30px] border-2 border-red-900/20 space-y-3 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="搜尋..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#DEDEDE] border-[4px] border-gray-800 rounded-xl py-3 px-4 font-black text-gray-900 text-lg outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-lg"><Search className="w-5 h-5 text-white" /></button>
          </form>
          
          <select
            onChange={(e) => jumpToBird(e.target.value)}
            value={currentBird.id}
            className="w-full bg-yellow-400 border-[4px] border-gray-800 rounded-xl py-3 px-4 font-black text-gray-900 text-lg shadow-lg"
          >
            {birds.map(bird => (
              <option key={bird.id} value={bird.id}>{bird.id} ➟ {bird.name}</option>
            ))}
          </select>
        </div>

        {/* 4. 底部導航按鈕 */}
        <div className="flex justify-between items-center bg-black/20 p-2 rounded-[20px]">
          <button onClick={handlePrev} disabled={currentIndex === 0} className={`w-14 h-14 rounded-full border-[4px] border-gray-800 flex items-center justify-center shadow-lg active:scale-95 transition-all ${currentIndex === 0 ? 'bg-gray-500 opacity-50' : 'bg-[#31A5E8] hover:bg-blue-400'}`}>
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <span className="text-red-900 font-black text-[9px] uppercase tracking-tighter">NAV SYSTEM</span>
          <button onClick={handleNext} disabled={currentIndex === birds.length - 1} className={`w-14 h-14 rounded-full border-[4px] border-gray-800 flex items-center justify-center shadow-lg active:scale-95 transition-all ${currentIndex === birds.length - 1 ? 'bg-gray-500 opacity-50' : 'bg-[#31A5E8] hover:bg-blue-400'}`}>
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* 🚀 關鍵：切換分頁按鈕 (放在原本系統告示的上方) */}
        <button 
          onClick={() => setShowDetails(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl border-[4px] border-blue-900 shadow-[0_5px_0_rgba(30,58,138,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 mt-2"
        >
          <BookOpen className="w-6 h-6" /> 詳細自學資料
        </button>

        {/* 5. 原本的系統告示 (稍微壓縮) */}
        <div className="bg-black/60 p-4 rounded-2xl border-2 border-red-900/40 text-[10px] text-white/70 leading-tight">
          <p className="text-yellow-400 font-black mb-1 flex items-center gap-2">
             【 SYSTEM V2.4.0 】
          </p>
          <p>若發現圖鑑細節與實體不符，請進入詳細模式連結科學數據庫。</p>
        </div>
      </motion.div>
    ) : (
      /* ==========================================
         第二頁：科學自學中心 (詳細資料模式)
         ========================================== */
      <motion.div
        key="page2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col w-full h-full gap-6 relative z-10"
      >
        {/* 頂部裝飾標題 */}
        <div className="bg-slate-900 border-b-4 border-blue-500 p-4 rounded-t-2xl">
           <h2 className="text-blue-400 font-black text-xl tracking-widest text-center uppercase">Research Center</h2>
        </div>

        <div className="flex-1 bg-black/40 rounded-2xl p-6 border-2 border-blue-500/30 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Globe className="w-10 h-10 text-blue-400 animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <p className="text-white/60 text-xs uppercase tracking-widest">目前檢索對象</p>
            <p className="text-white text-3xl font-black italic">{currentBird.name}</p>
          </div>

          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <p className="text-blue-200/80 text-sm leading-relaxed px-4">
            點擊下方按鈕，系統將自動穿透防火牆，連結至 <span className="text-white font-bold">康奈爾大學鳥類學實驗室</span> 或 <span className="text-white font-bold">維基百科</span> 提供深度自學內容。
          </p>

          <button 
            onClick={() => {
              const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(currentBird.name)}+site:allaboutbirds.org+OR+wikipedia.org`;
              window.open(searchUrl, '_blank');
            }}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-3 text-lg group"
          >
            啟動外部連結中心 <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        {/* 返回按鈕 */}
        <button 
          onClick={() => setShowDetails(false)}
          className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-200 font-bold py-3 rounded-xl border border-red-900/50 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" /> 返回基礎數據面板
        </button>

        <p className="text-[10px] text-center text-white/30 italic">
          * 外部連結內容非本機預載，請由導師陪同閱讀。
        </p>
      </motion.div>
    )}
  </AnimatePresence>

  {/* 右下角裝飾點 (不變) */}
  <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-red-950/20 border-4 border-red-900/10 pointer-events-none" />
</div>
