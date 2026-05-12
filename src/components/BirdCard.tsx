import React, { useState } from 'react';
import { Bird } from '../types';
import { motion } from 'framer-motion';
import { BirdSilhouette } from './BirdSilhouette.tsx';

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

      {/* The Actual Card Image (User provided) */}
      <img 
        src={bird.imageUrl} 
        alt={`Card No. ${bird.id}`} 
        onLoad={() => setImgStatus('loaded')}
        onError={() => setImgStatus('error')}
        className={`w-full h-full object-cover ${imgStatus === 'loaded' ? 'block' : 'hidden'}`}
      />

     {/* Fallback if user hasn't uploaded the card yet (未發現狀態) */}
      {imgStatus === 'error' && (
        <div className="absolute inset-0 bg-[#DEDEDE] flex flex-col items-center justify-center p-4">
          {/* 編號標籤 */}
          <div className="bg-black/5 px-3 py-1 rounded-full mb-3">
            <span className="font-mono font-bold text-gray-500 text-xs">No.{bird.id}</span>
          </div>

          {/* 替換：使用 PhyloPic 的精美鳥類剪影 */}
          <div className="w-20 h-20 relative my-2">
            <img 
              src="https://images.phylopic.org/images/049f5309-808b-4a57-817c-a0e060000000/vector.svg" 
              alt="Bird Silhouette"
              className="w-full h-full object-contain opacity-40 grayscale brightness-0" 
            />
          </div>

          {/* 狀態文字 */}
          <p className="mt-2 text-gray-400 font-black text-[10px] tracking-[0.2em] uppercase">
            Undiscovered
          </p>
        </div>
      )}
