import React, { useEffect, useState } from 'react';
import { Bird } from '../types';
import { Search, ChevronDown, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirdSilhouette } from './BirdSilhouette.tsx';

interface PokedexDeviceProps {
  birds: Bird[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PokedexDevice: React.FC<PokedexDeviceProps> = ({ birds, initialIndex, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImgStatus('loading');
      setIsFullscreen(false);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    setImgStatus('loading');
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
        return;
      }

      if (isSearching) return; 
      
      if (e.key === 'ArrowRight' && currentIndex < birds.length - 1) handleNext();
      if (e.key === 'ArrowLeft' && currentIndex > 0) handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, birds.length, onClose, isSearching, isFullscreen]);

  const handleNext = () => {
    if (currentIndex < birds.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const jumpToBird = (id: string) => {
    const idx = birds.findIndex(b => b.id === id);
    if (idx !== -1) setCurrentIndex(idx);
    setSearchTerm('');
    setIsSearching(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 這裡支援編號或中文名搜尋
    const found = birds.find(b => b.id === searchTerm || b.name === searchTerm);
    if (found) {
      jumpToBird(found.id);
    }
  };

  if (!isOpen) return null;

  const currentBird = birds[currentIndex];

  // Fullscreen Image View - 點擊圖片後的放大模式
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-zoom-out" onClick={() => setIsFullscreen(false)}>
        <button className="absolute top-6 right-6 text-white/50 hover:text-white z-50">
          <X className="w-10 h-10" />
        </button>
        <motion.img 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          src={currentBird.imageUrl} 
          alt={currentBird.name} 
          className="max-w-[95%] max-h-[95%] object-contain shadow-2xl"
        />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 perspective-1000">
          
          <motion.div
            initial={{ scale: 0.8, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="w-full max-w-5xl h-[90vh] md:h-[85vh] flex flex-col md:flex-row shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute -top-4 -right-4 md:-right-8 md:-top-8 z-50 p-2 bg-white rounded-full text-red-600 shadow-lg hover:bg-gray-100 transition-colors border-4 border-gray-800"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* LEFT HALF - The Card Display Screen */}
            <div className="w-full md:w-1/2 h-2/3 md:h-full bg-[#E3350D] border-4 md:border-8 border-gray-800 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none flex flex-col relative z-20 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]">
              
              {/* Top Sensor Array */}
              <div className="flex items-center gap-4 p-4 border-b-4 border-red-900/50 bg-gradient-to-b from-red-500 to-transparent">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center border-4 border-gray-800 shadow-inner">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#31A5E8] border-2 border-white shadow-[0_0_15px_rgba(49,165,232,0.8)] relative overflow-hidden">
                    <div className="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full blur-[2px]"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 border border-gray-800 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border border-gray-800 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 border border-gray-800 shadow-sm"></div>
                </div>
              </div>

              {/* Main Display Screen - 加上 overflow-hidden 解決圖片超出灰色框框 */}
              <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full h-full max-h-[600px] bg-[#DEDEDE] rounded-t-xl rounded-bl-xl rounded-br-[40px] p-4 border-4 border-gray-800 shadow-inner relative flex flex-col overflow-hidden">
                  
                  {/* Little red lights */}
                  <div className="flex justify-center gap-4 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 border border-red-800"></div>
                    <div className="w-2 h-2 rounded-full bg-red-500 border border-red-800"></div>
                  </div>

                  {/* Actual Screen Area - 點擊觸發放大 */}
                  <div 
                    className="flex-1 bg-[#232323] rounded-xl border-4 border-gray-600 relative overflow-hidden flex items-center justify-center cursor-zoom-in group"
                    onClick={() => setIsFullscreen(true)}
                  >
                    {imgStatus === 'loading' && (
                      <div className="w-12 h-12 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin"></div>
                    )}
                    
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentBird.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        src={currentBird.imageUrl} 
                        alt={currentBird.name} 
                        onLoad={() => setImgStatus('loaded')}
                        onError={() => setImgStatus('error')}
                        className={`w-full h-full object-contain z-0 transition-transform duration-300 group-hover:scale-105 ${imgStatus === 'loaded' ? 'block' : 'hidden'}`}
                      />
                    </AnimatePresence>

                    {imgStatus === 'loaded' && (
                      <div className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 z-20">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    )}

                    {imgStatus === 'error' && (
                      <div className="flex flex-col items-center">
                        <BirdSilhouette className="w-24 h-24 text-gray-600 mb-4" />
                        <span className="text-gray-500 font-mono text-xl">NO DATA</span>
                      </div>
                    )}
                  </div>

                  {/* Speaker grill */}
                  <div className="absolute bottom-4 right-6 flex flex-col gap-1">
                    <div className="w-6 h-1 bg-gray-800 rounded-full"></div>
                    <div className="w-6 h-1 bg-gray-800 rounded-full"></div>
                    <div className="w-6 h-1 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Hinge */}
            <div className="hidden md:flex w-12 bg-[#C02A0A] border-y-8 border-gray-800 flex-col justify-between py-12 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-10">
              <div className="w-full h-1 bg-gray-800/50"></div>
              <div className="w-full h-1 bg-gray-800/50"></div>
              <div className="w-full h-1 bg-gray-800/50"></div>
            </div>

            {/* RIGHT HALF - Controls Area */}
            <div className="w-full md:w-1/2 h-1/3 md:h-full bg-[#E3350D] border-4 md:border-8 border-gray-800 rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none flex flex-col p-4 md:p-8 shadow-[inset_10px_0_20px_rgba(0,0,0,0.2)] justify-between">
              
              <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full gap-4">
                
                {/* 1. 編號顯示螢幕 */}
                <div className="bg-[#232323] border-4 border-gray-600 rounded-xl p-4 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                  <span className="text-green-400 font-mono text-4xl md:text-5xl font-black z-20 tracking-widest drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                    NO.{currentBird.id}
                  </span>
                </div>

                {/* 2. 中文姓名顯示螢幕 (樣式同步編號螢幕) */}
                <div className="bg-[#232323] border-4 border-gray-600 rounded-xl p-4 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                  <span className="text-green-400 font-bold text-3xl md:text-4xl z-20 tracking-tight drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] text-center">
                    {currentBird.name || '未發現'}
                  </span>
                </div>

                {/* Search & Jump Controls */}
                <div className="bg-red-900/20 p-4 rounded-2xl border-2 border-red-900/30 flex flex-col gap-4">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="搜尋名稱或編號..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearching(true)}
                      onBlur={() => setIsSearching(false)}
                      className="w-full bg-[#DEDEDE] border-4 border-gray-800 rounded-lg py-3 pl-4 pr-12 font-bold text-gray-900 placeholder-gray-500 text-lg focus:outline-none focus:bg-white transition-colors"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-800 p-1.5 rounded hover:bg-gray-700 transition-colors">
                      <Search className="w-5 h-5 text-white" />
                    </button>
                  </form>
                  
                  <div className="relative">
                    <select
                      onChange={(e) => jumpToBird(e.target.value)}
                      value={currentBird.id}
                      className="w-full appearance-none bg-yellow-400 border-4 border-gray-800 rounded-lg py-3 pl-4 pr-12 font-black text-gray-900 text-lg cursor-pointer hover:bg-yellow-300 transition-colors shadow-sm"
                    >
                      {birds.map(bird => (
                        <option key={bird.id} value={bird.id}>
                          JUMP TO NO.{bird.id}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-900 pointer-events-none" />
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-between items-center bg-gray-900/10 p-4 rounded-2xl">
                  <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-gray-800 shadow-md transition-transform active:scale-95 ${currentIndex === 0 ? 'bg-gray-400' : 'bg-[#31A5E8] hover:bg-blue-400'}`}
                  >
                    <ChevronLeft className={`w-8 h-8 ${currentIndex === 0 ? 'text-gray-600' : 'text-white'}`} />
                  </button>
                  
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex gap-2">
                      <div className="w-8 h-2 bg-gray-800 rounded-full"></div>
                      <div className="w-8 h-2 bg-gray-800 rounded-full"></div>
                    </div>
                    <span className="text-red-900 font-bold text-[10px] uppercase">Page Nav</span>
                  </div>

                  <button 
                    onClick={handleNext}
                    disabled={currentIndex === birds.length - 1}
                    className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-gray-800 shadow-md transition-transform active:scale-95 ${currentIndex === birds.length - 1 ? 'bg-gray-400' : 'bg-[#31A5E8] hover:bg-blue-400'}`}
                  >
                    <ChevronRight className={`w-8 h-8 ${currentIndex === birds.length - 1 ? 'text-gray-600' : 'text-white'}`} />
                  </button>
                </div>

                {/* System Notice Section - 顏色改深增加對比 */}
                <div className="bg-black/30 p-3 rounded-lg border border-red-900/20 text-[10px] text-white/90 leading-relaxed font-sans shadow-inner">
                  <p className="text-yellow-200 font-black mb-1 underline tracking-widest">【 系統告示 / SYSTEM NOTICE 】</p>
                  <p>1. 本機螢幕顯示之「中文名稱」為校對標準。</p>
                  <p>2. 圖鑑卡由 AI 生成，部分細節若有偏差，請以本機編號為準。</p>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
