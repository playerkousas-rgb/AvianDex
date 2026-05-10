import React, { useEffect, useState, useRef, MouseEvent } from 'react';
import { Bird } from '../types';
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Globe, 
  BookOpen, 
  Maximize2, 
  ZoomIn, 
  MapPin,     // 觀察雷達
  Camera,     // 視覺圖庫
  PlayCircle, // 影片中心
  Volume2,    // 鳴聲資料
  Download,   // 辨識裝備
  Award       // 鳴謝區
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

          {/* --- 2. 模式切換器：僅在電腦版顯示，行動端完全移除 (hidden md:flex) --- */}
          <div 
            className="absolute top-10 left-1/2 -translate-x-1/2 z-[130] hidden md:flex flex-col items-center gap-4 pointer-events-auto"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="bg-gray-900/80 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl flex gap-1 shadow-2xl">
              <button onClick={() => setViewMode('lens')} className={`px-6 py-2 rounded-xl font-bold ${viewMode === 'lens' ? 'bg-yellow-400 text-black' : 'text-white'}`}>🔍 放大鏡</button>
              <button onClick={() => setViewMode('zoom')} className={`px-6 py-2 rounded-xl font-bold ${viewMode === 'zoom' ? 'bg-yellow-400 text-black' : 'text-white'}`}>🖼️ 縮放模式</button>
            </div>
          </div>

          {/* --- 3. 核心圖片顯示區：釋放容器限制 --- */}
          <div 
            /* 關鍵修正 3：移除所有置中、overflow 限制
               改用一個獨立的捲動層，並加入 WebkitOverflowScrolling 確保 iOS 慣性。
            */
            className="w-full h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-center py-6 md:py-10">
              {/* 圖片主體 */}
              <motion.img 
                ref={imgRef}
                src={currentBird.imageUrl} 
                alt={currentBird.name} 
                /* 邏輯保留：電腦版 viewMode */
                style={{ 
                  transform: viewMode === 'zoom' ? `scale(${zoomScale})` : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: viewMode === 'zoom' ? 'grab' : 'none',
                  transformOrigin: 'center center' 
                }}
                /* 關鍵修正 4：行動端放寬 max-w 到 98% 甚至 100%，
                   並移除 max-h-screen 限制，讓圖片長度決定捲動範圍。
                */
                className={`object-contain rounded-lg shadow-2xl transition-all ${
                  viewMode === 'zoom' ? 'w-[98%] md:w-[85%] h-auto' : 'w-[98%] md:max-w-[95%] h-auto md:max-h-[85vh]'
                }`}
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
 
     看到這些 TS 錯誤（特別是 TS17008 和 TS17002），我完全理解你的心情——這就像是在組裝模型時，發現零件對不上，而且還剩下一堆螺絲。這通常是因為 HTML 標籤（如 <div>）或 React 的組件（如 <motion.div>）沒有成雙成對地閉合。

別擔心，我們不亂刪代碼，我們來把「門」關好。

根據你提供的錯誤行號，問題出在我們改動外殼時，標籤的開關順序亂了。請將你的代碼中 SECTION 2 之後的所有代碼 替換為以下這個版本。我保證：

你的搜尋功能、六宮格、文字備註全部都在。

所有標籤都已閉合（解決那堆 TS 錯誤）。

iPad 捲動修正已經包含在內。

TypeScript
      {/* ============================================================
          SECTION 2: 主圖鑑機設備界面 (修正標籤閉合與 iPad 捲動版)
          ============================================================ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 perspective-1000">
          <motion.div
            initial={{ scale: 0.8, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            /* 修正 iPad 捲動：在行動端取消固定高度，改為 overflow-y-auto */
            className="w-full max-w-5xl flex flex-col md:flex-row shadow-2xl relative bg-[#E3350D] 
                       fixed inset-0 md:static md:h-[88vh] md:rounded-[40px] md:border-[10px] border-gray-800 
                       overflow-y-auto md:overflow-hidden"
          >
            {/* 總開關關閉按鈕 */}
            <button 
              onClick={onClose}
              className="fixed top-4 right-4 md:absolute md:-top-5 md:-right-10 z-[70] p-3 bg-white rounded-full text-red-600 shadow-2xl border-4 border-gray-800 hover:rotate-90 transition-transform duration-500"
            >
              <X className="w-8 h-8" />
            </button>

            {/* --- 左半部分：圖鑑顯示面板 --- */}
            <div className="w-full md:w-1/2 flex-none bg-[#E3350D] border-[6px] md:border-[10px] border-gray-800 rounded-t-[40px] md:rounded-l-[40px] md:rounded-tr-none flex flex-col relative z-20 md:shadow-[inset_-15px_0_40px_rgba(0,0,0,0.3)]">
              {/* 頂部感應燈區塊 */}
              <div className="flex items-center gap-4 p-2 md:p-3 border-b-4 border-red-900/40 bg-gradient-to-b from-red-400 to-transparent pt-14 md:pt-3">
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

              {/* 螢幕核心區域 */}
              <div className="flex-1 p-2 md:p-3 flex flex-col items-center justify-center">
                <div className="w-full aspect-[4/3] md:h-full bg-[#DEDEDE] rounded-t-xl rounded-bl-xl rounded-br-[40px] p-2 md:p-3 border-[5px] border-gray-800 shadow-[inset_0_0_15px_rgba(0,0,0,0.2)] relative flex flex-col overflow-hidden">
                  <div className="flex justify-center gap-4 mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-600 border border-red-900 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-red-600 border border-red-900" />
                  </div>
                  <div 
                    className="flex-1 bg-[#1a1a1a] rounded-lg border-[4px] border-gray-700 relative overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-2xl"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <motion.img 
                      key={currentBird.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={currentBird.imageUrl} 
                      className="w-full h-full object-contain z-10 p-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- 中間摺疊轉軸 --- */}
            <div className="hidden md:flex w-16 bg-[#C02A0A] border-y-[10px] border-gray-800 flex-col justify-around py-20 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] z-10 relative">
              {[...Array(6)].map((_, i) => <div key={i} className="w-full h-1 bg-black/20" />)}
            </div>

            {/* --- 右半部分：控制與資料面板 --- */}
            <div className="w-full md:w-1/2 flex-1 min-h-max bg-[#E3350D] border-[6px] md:border-[10px] border-gray-800 rounded-b-[40px] md:rounded-r-[40px] md:rounded-bl-none flex flex-col p-6 md:p-8 md:shadow-[inset_15px_0_40px_rgba(0,0,0,0.3)] relative">
              <AnimatePresence mode="wait">
                {!showDetails ? (
                  /* --- Page 1: 基礎數據 --- */
                  <motion.div key="data-page" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                    <div className="bg-[#1a1a1a] border-[4px] border-gray-600 rounded-xl p-3 flex items-center justify-center shadow-inner">
                      <span className="text-green-400 font-mono text-2xl md:text-4xl font-black tracking-[0.1em]">ID-{currentBird.id}</span>
                    </div>
                    <div className="bg-[#1a1a1a] border-[4px] border-gray-600 rounded-xl p-4 flex items-center justify-center min-h-[80px]">
                      <span className={`text-green-400 font-bold text-center ${currentBird.name.length > 5 ? 'text-xl' : 'text-3xl'}`}>{currentBird.name}</span>
                    </div>

                    {/* 搜尋與跳轉 (恢復你原本的功能) */}
                    <div className="bg-red-900/30 p-5 rounded-[30px] border-2 border-red-900/20 space-y-4">
                      <form onSubmit={handleSearchSubmit} className="relative">
                        <input type="text" placeholder="搜尋名稱或編號..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#DEDEDE] border-[5px] border-gray-800 rounded-xl py-3 px-4 font-black text-gray-900 outline-none" />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-lg"><Search className="w-5 h-5 text-white" /></button>
                      </form>
                      <div className="relative">
                        <select onChange={(e) => jumpToBird(e.target.value)} value={currentBird.id} className="w-full appearance-none bg-yellow-400 border-[5px] border-gray-800 rounded-xl py-3 px-4 font-black text-gray-900 cursor-pointer">
                          {birds.map(bird => <option key={bird.id} value={bird.id}>{bird.id} ➟ {bird.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-900 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-black/20 p-2 rounded-[20px]">
                      <button onClick={handlePrev} disabled={currentIndex === 0} className="w-14 h-14 rounded-full border-[4px] border-gray-800 bg-[#31A5E8] flex items-center justify-center"><ChevronLeft className="w-8 h-8 text-white" /></button>
                      <button onClick={handleNext} disabled={currentIndex === birds.length - 1} className="w-14 h-14 rounded-full border-[4px] border-gray-800 bg-[#31A5E8] flex items-center justify-center"><ChevronRight className="w-8 h-8 text-white" /></button>
                    </div>

                    <button onClick={() => setShowDetails(true)} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl border-[4px] border-blue-800 shadow-[0_4px_0_rgba(30,58,138,1)] active:translate-y-1">詳細資料 / RESEARCH</button>
                    
                    <div className="flex flex-col gap-1 text-white/90 text-[13px] font-bold">
                      <p>1. 本機中文名稱由 AI 輔助生成。</p>
                      <p>2. 建議參考右側校對過的資訊。</p>
                    </div>
                  </motion.div>
                ) : (
                  /* --- Page 2: 六宮格 (恢復原本的連結與圖標) --- */
                  <motion.div key="details-page" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* 六宮格按鈕保持原樣 */}
                      <button onClick={() => window.open(`https://www.allaboutbirds.org/guide/${currentBird.name}`, '_blank')} className="bg-blue-900/40 p-4 rounded-xl border-b-4 border-blue-950 flex flex-col items-center gap-2">
                        <BookOpen className="text-white" /> <span className="text-white text-xs font-black">百科</span>
                      </button>
                      <button onClick={() => window.open(`https://ebird.org/region/HK`, '_blank')} className="bg-emerald-900/40 p-4 rounded-xl border-b-4 border-emerald-950 flex flex-col items-center gap-2">
                        <MapPin className="text-white" /> <span className="text-white text-xs font-black">雷達</span>
                      </button>
                      <button onClick={() => window.open(`https://www.flickr.com/search/?text=${currentBird.name}`, '_blank')} className="bg-purple-900/40 p-4 rounded-xl border-b-4 border-purple-950 flex flex-col items-center gap-2">
                        <Camera className="text-white" /> <span className="text-white text-xs font-black">圖庫</span>
                      </button>
                      <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${currentBird.name}`, '_blank')} className="bg-red-900/40 p-4 rounded-xl border-b-4 border-red-950 flex flex-col items-center gap-2">
                        <PlayCircle className="text-white" /> <span className="text-white text-xs font-black">影片</span>
                      </button>
                      <button onClick={() => window.open(`https://xeno-canto.org/explore?query=${currentBird.name}`, '_blank')} className="bg-orange-900/40 p-4 rounded-xl border-b-4 border-orange-950 flex flex-col items-center gap-2">
                        <Volume2 className="text-white" /> <span className="text-white text-xs font-black">鳴聲</span>
                      </button>
                      <button onClick={() => window.open('https://merlin.allaboutbirds.org/', '_blank')} className="bg-slate-900/40 p-4 rounded-xl border-b-4 border-slate-950 flex flex-col items-center gap-2">
                        <Download className="text-white" /> <span className="text-white text-xs font-black">裝備</span>
                      </button>
                    </div>
                    <button onClick={() => setShowDetails(false)} className="w-full bg-red-900/60 text-white font-black py-4 rounded-xl">返回基礎數據</button>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* 關鍵墊片：防止 iPad 底部遮擋 */}
              <div className="h-32 w-full md:hidden flex-none"></div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-red-950/20 border-4 border-red-900/10 pointer-events-none" />
    </div>
  </motion.div>
</div>
   <div className="h-32 w-full md:hidden flex-none"></div>
)}
</AnimatePresence>
);
};

export default PokedexDevice;
