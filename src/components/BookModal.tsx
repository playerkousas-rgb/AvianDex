import React, { useEffect, useState } from 'react';
import { Bird } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirdSilhouette } from './BirdSilhouette.tsx';

interface BookModalProps {
  birds: Bird[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const BookModal: React.FC<BookModalProps> = ({ birds, initialIndex, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImgStatus('loading');
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    // Reset image status when changing pages
    setImgStatus('loading');
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' && currentIndex < birds.length - 1) handleNext();
      if (e.key === 'ArrowLeft' && currentIndex > 0) handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, birds.length, onClose]);

  const handleNext = () => {
    if (currentIndex < birds.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const currentBird = birds[currentIndex];
  const isVisuallyDiscovered = imgStatus === 'loaded';
  const hasData = currentBird.name !== '???';

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction < 0 ? 45 : -45
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 md:p-8 perspective-1000">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[60] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          <div className="relative w-full max-w-6xl h-[85vh] sm:h-[80vh] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 }, rotateY: { duration: 0.4 } }}
                className="absolute w-full h-full max-h-[800px] flex flex-col md:flex-row bg-white rounded-xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* Left Page - Image Area */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-[#f2f2f2] border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
                  <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
                    <span className="text-xl sm:text-3xl font-black text-white font-mono drop-shadow-md">
                      No. {currentBird.id}
                    </span>
                    {isVisuallyDiscovered && hasData && (
                      <span className="bg-[#31A5E8] text-white text-xs sm:text-sm px-3 py-1 rounded-full font-bold shadow-lg border-2 border-white/20">
                        {currentBird.category}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
                    {imgStatus === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#31A5E8] rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    <img 
                      src={currentBird.imageUrl} 
                      alt={currentBird.name} 
                      onLoad={() => setImgStatus('loaded')}
                      onError={() => setImgStatus('error')}
                      className={`w-full h-full object-contain drop-shadow-2xl ${imgStatus === 'loaded' ? 'block' : 'hidden'}`}
                    />

                    {imgStatus === 'error' && (
                      <BirdSilhouette className="w-2/3 h-2/3 text-gray-300 drop-shadow-md" />
                    )}
                  </div>
                  <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
                </div>

                {/* Right Page - Data Area */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#faf8f5] p-4 sm:p-6 md:p-10 flex flex-col overflow-y-auto relative">
                  <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
                  
                  <div className="pl-0 md:pl-4 flex-1 flex flex-col">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#313131] tracking-tight mb-1 sm:mb-2 leading-tight">
                      {isVisuallyDiscovered && hasData ? currentBird.name : '???'}
                    </h2>
                    
                    <p className="text-gray-500 italic text-sm sm:text-base md:text-lg mb-4 sm:mb-8 font-serif min-h-[1.5rem]">
                      {isVisuallyDiscovered && hasData ? currentBird.scientificName : ''}
                    </p>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-inner border border-amber-900/10 mb-4 sm:mb-8">
                      <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium">
                        {isVisuallyDiscovered && hasData ? currentBird.description : 'This species has not been documented yet. Keep exploring!'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-auto">
                      <div className={`${isVisuallyDiscovered && hasData ? 'bg-[#30a7d7]' : 'bg-gray-300'} rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-md transition-colors`}>
                        <h4 className="text-white/80 text-xs sm:text-sm font-bold mb-1 uppercase tracking-wider">Height</h4>
                        <p className="text-xl sm:text-2xl font-black">{isVisuallyDiscovered && hasData ? currentBird.height : '???'}</p>
                      </div>
                      <div className={`${isVisuallyDiscovered && hasData ? 'bg-[#30a7d7]' : 'bg-gray-300'} rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-md transition-colors`}>
                        <h4 className="text-white/80 text-xs sm:text-sm font-bold mb-1 uppercase tracking-wider">Weight</h4>
                        <p className="text-xl sm:text-2xl font-black">{isVisuallyDiscovered && hasData ? currentBird.weight : '???'}</p>
                      </div>
                      <div className="bg-amber-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-amber-200">
                        <h4 className="text-amber-800/60 text-xs sm:text-sm font-bold mb-1 uppercase tracking-wider">Habitat</h4>
                        <p className="text-amber-900 font-bold text-sm sm:text-lg leading-tight">{isVisuallyDiscovered && hasData ? currentBird.habitat : '???'}</p>
                      </div>
                      <div className="bg-amber-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-amber-200">
                        <h4 className="text-amber-800/60 text-xs sm:text-sm font-bold mb-1 uppercase tracking-wider">Diet</h4>
                        <p className="text-amber-900 font-bold text-sm sm:text-lg leading-tight">{isVisuallyDiscovered && hasData ? currentBird.diet : '???'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              className={`absolute left-0 sm:-left-16 md:-left-20 z-10 p-2 sm:p-4 rounded-full backdrop-blur-md transition-all transform -translate-y-1/2 top-1/2 ${
                currentIndex > 0 ? 'bg-white/20 text-white hover:bg-white/40 hover:scale-110 cursor-pointer' : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12" />
            </button>

            <button
              className={`absolute right-0 sm:-right-16 md:-right-20 z-10 p-2 sm:p-4 rounded-full backdrop-blur-md transition-all transform -translate-y-1/2 top-1/2 ${
                currentIndex < birds.length - 1 ? 'bg-white/20 text-white hover:bg-white/40 hover:scale-110 cursor-pointer' : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              disabled={currentIndex === birds.length - 1}
            >
              <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12" />
            </button>

            <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 transform -translate-x-1/2 text-white/50 font-mono text-sm sm:text-base font-bold tracking-widest bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
              PAGE {currentIndex + 1} OF {birds.length}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
