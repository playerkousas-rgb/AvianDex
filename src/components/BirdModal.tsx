import React, { useEffect } from 'react';
import { Bird } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BirdModalProps {
  bird: Bird | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const BirdModal: React.FC<BirdModalProps> = ({ bird, isOpen, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!bird) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

         {/* Modal Container */}
          <motion.div
            key={bird.id} // Re-animate when bird changes
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            /* 修正：在行動端使用 h-[90dvh] 確保高度計算精確，並移除原本可能鎖死滾動的 overflow-hidden */
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col h-[90vh] md:max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex-none flex justify-between items-center p-5 border-b border-gray-100 bg-white z-10">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-400 font-mono">No. {bird.id}</span>
                <h2 className="text-3xl font-black text-[#313131] tracking-tight">{bird.discovered ? bird.name : '???'}</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#31A5E8]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div 
              /* 修正：添加 WebkitOverflowScrolling 確保 iOS 順暢度，touch-pan-y 確保手勢只在垂直方向觸發 */
              className="flex-1 overflow-y-auto p-6 md:p-8 bg-white touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column - Image */}
                <div className="w-full md:w-1/2 flex flex-col items-center">
                  <div className="w-full aspect-square bg-[#f2f2f2] rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-gray-200">
                    {bird.discovered ? (
                      <img 
                        src={bird.imageUrl} 
                        alt={bird.name} 
                        className="w-full h-full object-cover rounded-xl shadow-md" 
                      />
                    ) : (
                      <div className="text-8xl text-gray-300 font-bold">?</div>
                    )}
                  </div>
                </div>

                {/* Right Column - Data */}
                <div className="w-full md:w-1/2 flex flex-col gap-6">
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {bird.discovered ? bird.description : 'This species has not been documented yet.'}
                  </p>

                  <div className="bg-[#30a7d7] rounded-2xl p-6 text-white grid grid-cols-2 gap-y-6 gap-x-4 shadow-lg">
                    <div>
                      <h4 className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider">Height</h4>
                      <p className="text-2xl font-black">{bird.height}</p>
                    </div>
                    <div>
                      <h4 className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider">Weight</h4>
                      <p className="text-2xl font-black">{bird.weight}</p>
                    </div>
                    <div>
                      <h4 className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider">Category</h4>
                      <p className="text-xl font-bold">{bird.category}</p>
                    </div>
                    <div>
                      <h4 className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider">Rarity</h4>
                      <p className="text-xl font-bold">{bird.rarity}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/20">
                      <h4 className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider">Scientific Name</h4>
                      <p className="text-xl font-bold italic">{bird.scientificName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 rounded-xl p-5 border border-gray-200">
                      <h4 className="text-gray-500 text-sm font-bold mb-2 uppercase tracking-wider">Habitat</h4>
                      <p className="text-gray-800 font-bold text-lg">{bird.discovered ? bird.habitat : 'Unknown'}</p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-5 border border-gray-200">
                      <h4 className="text-gray-500 text-sm font-bold mb-2 uppercase tracking-wider">Diet</h4>
                      <p className="text-gray-800 font-bold text-lg">{bird.discovered ? bird.diet : 'Unknown'}</p>
                    </div>
                  </div>

                  {/* 墊片：在行動端最後預留空間，確保不會滑不到底 */}
                  <div className="h-4 md:hidden"></div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex-none bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center z-10">
              <button 
                onClick={onPrev} 
                disabled={!hasPrev}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  hasPrev 
                    ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#31A5E8] hover:text-[#31A5E8] shadow-sm active:scale-95' 
                    : 'bg-transparent text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              
              <div className="hidden sm:block text-gray-400 font-mono text-sm font-bold uppercase tracking-widest">
                Use arrow keys to navigate
              </div>

              <button 
                onClick={onNext} 
                disabled={!hasNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  hasNext 
                    ? 'bg-[#E3350D] text-white hover:bg-red-700 shadow-md active:scale-95' 
                    : 'bg-transparent text-gray-300 cursor-not-allowed'
                }`}
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
