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
  // 基礎狀態控制
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // 放大鏡專用狀態
  // 新增：切換模式 (lens: 放大鏡, zoom: 自由縮放)
  const [viewMode, setViewMode] = useState<'lens' | 'zoom'>('lens');
  const [scale, setScale] = useState(1); // 用於自由縮放模式
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [isLensVisible, setIsLensVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  
  // 引用圖片 DOM 以計算放大位置
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 放大參數配置
  const ZOOM_LEVEL = 4;      // 4倍放大
  const LENS_SIZE = 280;     // 放大鏡直徑

  // 當圖鑑打開時，初始化索引
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImgStatus('loading');
      setIsFullscreen(false);
    }
  }, [isOpen, initialIndex]);

  // 切換鳥類時觸發讀取狀態
  useEffect(() => {
    setImgStatus('loading');
  }, [currentIndex]);

  // 鍵盤快捷鍵邏輯 (ESC 退出, 左右鍵切換)
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

      // 搜尋時禁用箭頭切換
      if (isSearching) return; 
      
      if (e.key === 'ArrowRight' && currentIndex < birds.length - 1) {
        handleNext();
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, birds.length, onClose, isSearching, isFullscreen]);

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
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-none overflow-hidden" 
          onMouseMove={handleMagnifierMouseMove}
          onClick={() => setIsFullscreen(false)}
        >
          {/* 教學標頭導覽 */}
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
              <p>MAGNIFICATION: {ZOOM_LEVEL}.0X</p>
              <p>LENS DIAMETER: {LENS_SIZE}PX</p>
              <p>STATUS: ACTIVE_RESEARCH</p>
            </div>
          </div>

          {/* 右下角關閉引導 */}
          <div className="absolute bottom-10 right-10 z-[110]">
            <button 
              className="bg-red-600 hover:bg-red-500 text-white p-5 rounded-full shadow-2xl transition-all active:scale-90 flex items-center gap-3"
              onClick={() => setIsFullscreen(false)}
            >
              <span className="font-bold px-2">退出觀察</span>
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* 觀察對象主體圖片 */}
          <div className="relative flex items-center justify-center w-full h-full p-10">
            <img 
              ref={imgRef}
              src={currentBird.imageUrl} 
              alt={currentBird.name} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_80px_rgba(255,255,255,0.05)]"
            />
            
            {/* 實體放大鏡鏡面效果 */}
            {isLensVisible && (
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
                {/* 鏡面反光裝飾 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
                <div className="absolute top-4 left-1/4 w-12 h-4 bg-white/20 rounded-full blur-sm rotate-12" />
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
            <div className="w-full md:w-1/2 h-3/5 md:h-full bg-[#E3350D] border-[6px] md:border-[10px] border-gray-800 rounded-t-[40px] md:rounded-l-[40px] md:rounded-tr-none flex flex-col relative z-20 shadow-[inset_-15px_0_40px_rgba(0,0,0,0.3)]">
              
              {/* 頂部感應燈區塊 */}
              <div className="flex items-center gap-6 p-6 border-b-8 border-red-900/40 bg-gradient-to-b from-red-400 to-transparent">
                {/* 大號藍色主感應燈 */}
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center border-[6px] border-gray-800 shadow-xl">
                  <div className="w-12 h-12 md:w-18 md:h-18 rounded-full bg-[#31A5E8] border-[4px] border-white shadow-[0_0_25px_rgba(49,165,232,1)] relative overflow-hidden">
                    <div className="absolute top-2 left-2 w-5 h-5 bg-white/50 rounded-full blur-[2px]" />
                  </div>
                </div>
                {/* 三色狀態燈 */}
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-black/30 shadow-inner" />
                  <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-black/30 shadow-inner" />
                  <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-black/30 shadow-inner" />
                </div>
              </div>

              {/* 螢幕核心區域 */}
              <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center">
                {/* 灰色內框螢幕 */}
                <div className="w-full h-full bg-[#DEDEDE] rounded-t-2xl rounded-bl-2xl rounded-br-[60px] p-6 border-[6px] border-gray-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] relative flex flex-col overflow-hidden">
                  
                  {/* 螢幕上方雙指示燈 */}
                  <div className="flex justify-center gap-6 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-red-900 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-red-900" />
                  </div>

                  {/* 黑色顯示區域 (點擊進入觀察模式) */}
                  <div 
                    className="flex-1 bg-[#1a1a1a] rounded-2xl border-[6px] border-gray-700 relative overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-2xl"
                    onClick={() => setIsFullscreen(true)}
                  >
                    {imgStatus === 'loading' && (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin" />
                        <span className="text-green-400 font-mono text-sm animate-pulse">LOADING_DATA...</span>
                      </div>
                    )}
                    
                    <motion.img 
                      key={currentBird.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={currentBird.imageUrl} 
                      onLoad={() => setImgStatus('loaded')}
                      onError={() => setImgStatus('error')}
                      className={`w-full h-full object-contain z-10 p-2 transition-transform duration-700 group-hover:scale-110 ${imgStatus === 'loaded' ? 'block' : 'hidden'}`}
                    />

                    {/* 懸浮引導 */}
                    {imgStatus === 'loaded' && (
                      <div className="absolute bottom-6 right-6 z-20">
                        <div className="bg-yellow-400 text-black font-black px-5 py-2 rounded-xl shadow-2xl flex items-center gap-3 transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                          <ZoomIn className="w-5 h-5" />
                          <span>進入放大觀察模式</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 右下角喇叭開孔裝置 */}
                  <div className="absolute bottom-6 right-10 flex flex-col gap-2">
                    <div className="w-10 h-2 bg-gray-800 rounded-full opacity-80" />
                    <div className="w-10 h-2 bg-gray-800 rounded-full opacity-80" />
                    <div className="w-10 h-2 bg-gray-800 rounded-full opacity-80" />
                    <div className="w-10 h-2 bg-gray-800 rounded-full opacity-80" />
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
           {/* 右半部分：控制與資料面板 */}
<div className="w-full md:w-1/2 h-2/5 md:h-full bg-[#E3350D] border-[6px] md:border-[10px] border-gray-800 rounded-b-[40px] md:rounded-r-[40px] md:rounded-bl-none flex flex-col p-6 md:p-8 shadow-[inset_15px_0_40px_rgba(0,0,0,0.3)] relative overflow-y-auto scrollbar-hide">
  {/* 內部容器加入 gap 並確保不會被壓縮 */}
  <div className="flex flex-col justify-start min-h-max w-full gap-4 relative z-10 pb-10">
                
                {/* 1. 頂部編號螢幕 (螢幕化) */}
                <div className="bg-[#1a1a1a] border-[5px] border-gray-600 rounded-2xl p-5 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                  <span className="text-green-400 font-mono text-4xl md:text-6xl font-black z-10 tracking-[0.2em] drop-shadow-[0_0_12px_rgba(74,222,128,0.6)] uppercase">
                    ID-{currentBird.id}
                  </span>
                </div>

                {/* 2. 中文名稱顯示螢幕 (螢幕化) */}
                <div className="bg-[#1a1a1a] border-[5px] border-gray-600 rounded-2xl p-6 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                  <span className="text-green-400 text-4xl md:text-5xl font-bold z-10 tracking-wider drop-shadow-[0_0_12px_rgba(74,222,128,0.6)] text-center">
                    {currentBird.name}
                  </span>
                </div>

                {/* 3. 搜尋與快速跳轉 */}
                <div className="bg-red-900/30 p-6 rounded-[30px] border-2 border-red-900/20 space-y-5 shadow-inner">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="輸入名稱或編號..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearching(true)}
                      onBlur={() => setIsSearching(false)}
                      className="w-full bg-[#DEDEDE] border-[5px] border-gray-800 rounded-xl py-4 px-6 font-black text-gray-900 placeholder-gray-500 text-xl focus:bg-white transition-all outline-none"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 p-2.5 rounded-lg hover:bg-gray-700 transition-colors">
                      <Search className="w-6 h-6 text-white" />
                    </button>
                  </form>
                  
                  <div className="relative">
                    <select
                      onChange={(e) => jumpToBird(e.target.value)}
                      value={currentBird.id}
                      className="w-full appearance-none bg-yellow-400 border-[5px] border-gray-800 rounded-xl py-4 px-6 font-black text-gray-900 text-xl cursor-pointer hover:bg-yellow-300 transition-all shadow-lg"
                    >
                      {birds.map(bird => (
                        <option key={bird.id} value={bird.id}>
                          {bird.id} ➟ {bird.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-900 pointer-events-none" />
                  </div>
                </div>

                {/* 4. 底部導航大按鈕 */}
                <div className="flex justify-between items-center bg-black/20 p-6 rounded-[35px]">
                  <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-[6px] border-gray-800 flex items-center justify-center shadow-2xl active:scale-90 transition-all ${currentIndex === 0 ? 'bg-gray-500 opacity-50' : 'bg-[#31A5E8] hover:bg-blue-400'}`}
                  >
                    <ChevronLeft className="w-12 h-12 text-white" />
                  </button>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-3">
                      <div className="w-12 h-3 bg-gray-800 rounded-full opacity-30" />
                      <div className="w-12 h-3 bg-gray-800 rounded-full opacity-30" />
                    </div>
                    <span className="text-red-900 font-black text-xs uppercase tracking-tighter">Navigation System</span>
                  </div>

                  <button 
                    onClick={handleNext}
                    disabled={currentIndex === birds.length - 1}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-[6px] border-gray-800 flex items-center justify-center shadow-2xl active:scale-90 transition-all ${currentIndex === birds.length - 1 ? 'bg-gray-500 opacity-50' : 'bg-[#31A5E8] hover:bg-blue-400'}`}
                  >
                    <ChevronRight className="w-12 h-12 text-white" />
                  </button>
                </div>

                {/* 5. 系統告示與裝飾 */}
                <div className="bg-black/60 p-5 rounded-2xl border-2 border-red-900/40 text-xs text-white/90 leading-relaxed shadow-2xl">
                  <p className="text-yellow-400 font-black mb-2 underline decoration-red-600 decoration-2 underline-offset-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,1)]" />
                    【 系統告示 / SYSTEM NOTICE 】
                  </p>
                  <p className="font-bold opacity-80">1. 本機之中文名稱為唯一校對標準，請仔細比對。</p>
                  <p className="font-bold opacity-80">2. 若發現圖鑑細節與實體不符，請點擊螢幕進入放大模式。</p>
                  <p className="font-bold opacity-80">3. 圖鑑機系統版本：V2.4.0 (教學強化版)</p>
                </div>

              </div>

              {/* 右下角機械裝飾點 */}
              <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-red-950/20 border-4 border-red-900/10 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
