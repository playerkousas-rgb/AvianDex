import React, { useState } from 'react';
import { Bird } from '../types';
import { motion } from 'framer-motion';
import { Bird as BirdIcon } from 'lucide-react'; // 加上這一行就解決了！

interface BirdCardProps {
  bird: Bird;
  onClick: () => void;
  isActive?: boolean;
}

export const BirdCard: React.FC<BirdCardProps> = ({ bird, onClick, isActive = false }) => {
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-4 shadow-lg aspect-[3/4] bg-[#232323] ${
        isActive 
          ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' 
          : 'border-gray-800 hover:border-gray-500'
      }`}
      onClick={onClick}
    >
      {/* Loading State */}
      {imgStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#DEDEDE]">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin"></div>
        </div>
      )}

      {/* The Actual Card Image */}
      <img 
        src={bird.imageUrl} 
        alt={`Card No. ${bird.id}`} 
        onLoad={() => setImgStatus('loaded')}
        onError={() => setImgStatus('error')}
        className={`w-full h-full object-cover ${imgStatus === 'loaded' ? 'block' : 'hidden'}`}
      />

     {/* Fallback (未發現狀態) - 使用穩定內置圖示 */}
      {imgStatus === 'error' && (
        <div className="absolute inset-0 bg-[#DEDEDE] flex flex-col items-center justify-center p-4">
          {/* 編號標籤 */}
          <div className="bg-black/10 px-3 py-1 rounded-full mb-3">
            <span className="font-mono font-bold text-gray-500 text-xs">No.{bird.id}</span>
          </div>

          {/* 換成內置的 Bird 圖示，這絕對跑不掉 */}
          <div className="w-20 h-20 flex items-center justify-center my-2">
            <BirdIcon className="w-16 h-16 text-gray-400 opacity-60" strokeWidth={1.5} />
          </div>

          <p className="mt-2 text-gray-500 font-black text-[11px] tracking-[0.2em] uppercase">
            Undiscovered
          </p>
        </div>
      )}
    </motion.div>
  );
};
