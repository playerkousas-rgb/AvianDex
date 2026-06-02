import React, { useState } from 'react';
import { Bird } from '../types';
import { motion } from 'framer-motion';
import { HelpCircle, Footprints } from 'lucide-react';
import { BirdSilhouette } from './BirdSilhouette';

interface BirdCardProps {
  bird: Bird;
  onClick: () => void;
  isActive?: boolean;
}

export const BirdCard: React.FC<BirdCardProps> = ({
  bird,
  onClick,
  isActive = false,
}) => {
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const discovered = bird.name && bird.name !== '???';

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03, rotate: -0.5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all aspect-[3/4] border-[5px] ${
        isActive
          ? 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.85),0_8px_20px_rgba(0,0,0,0.5)]'
          : 'border-gray-900 shadow-[0_6px_0_rgba(0,0,0,0.6),0_10px_20px_rgba(0,0,0,0.4)] hover:border-cyan-300'
      }`}
      style={{
        background: 'linear-gradient(160deg, #FFE680 0%, #FFD43B 40%, #E0A800 100%)',
      }}
      onClick={onClick}
    >
      <div className="absolute top-2 left-2 z-30 bg-black/85 backdrop-blur-sm rounded-md px-2 py-0.5 border border-yellow-300/50 shadow-md">
        <span className="font-mono font-black text-yellow-300 text-[10px] tracking-wider">
          NO.{bird.id}
        </span>
      </div>
      <div className="absolute top-2 right-2 z-30 w-3 h-3 rounded-full bg-red-600 border-2 border-red-900 shadow-inner" />

      {imgStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300">
          <div className="w-8 h-8 border-4 border-yellow-700/30 border-t-yellow-700 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden">
        <img
          src={bird.imageUrl}
          alt={`Card No. ${bird.id}`}
          onLoad={() => setImgStatus('loaded')}
          onError={() => setImgStatus('error')}
          className={`w-full h-full object-cover ${imgStatus === 'loaded' ? 'block' : 'hidden'}`}
        />
      </div>

      {imgStatus === 'loaded' && discovered && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2 pt-6">
          <p className="text-white font-black text-xs sm:text-sm tracking-tight truncate drop-shadow-lg text-center">
            {bird.name}
          </p>
        </div>
      )}

      {imgStatus === 'error' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-3 overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at center, #4a3520 0%, #2b1d10 70%, #1a1208 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(250,204,21,0.25) 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}
          />
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(250,204,21,0.4) 0, rgba(250,204,21,0.4) 1px, transparent 1px, transparent 14px)',
            }}
          />
          <div className="absolute inset-2 border-2 border-dashed border-yellow-400/30 rounded-xl pointer-events-none" />

          <Footprints className="absolute top-7 right-3 w-3 h-3 text-yellow-400/30 rotate-12" />
          <Footprints className="absolute bottom-12 left-3 w-3 h-3 text-yellow-400/30 -rotate-12" />

          <div className="relative w-20 h-20 sm:w-24 sm:h-24 my-1">
            <div className="absolute inset-0 rounded-full bg-yellow-400/10 blur-xl" />
            <BirdSilhouette
              id={bird.id}
              className="relative w-full h-full text-black/85 drop-shadow-[0_2px_0_rgba(250,204,21,0.3)]"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center shadow-lg">
              <HelpCircle className="w-4 h-4 text-black" strokeWidth={3} />
            </div>
          </div>

          <p className="mt-3 text-yellow-300 font-black text-[11px] tracking-[0.25em] uppercase drop-shadow-md">
            ? ? ?
          </p>
          <p className="mt-0.5 text-yellow-200/50 font-mono text-[8px] tracking-widest uppercase">
            UNDISCOVERED
          </p>
          <div className="absolute bottom-2 inset-x-2 bg-black/60 border border-yellow-400/30 rounded px-2 py-0.5 text-center">
            <span className="text-yellow-200/70 font-mono text-[8px] tracking-widest">
              ◆ DATA LOCKED ◆
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/0 via-cyan-400/0 to-cyan-300/0 group-hover:from-cyan-400/10 group-hover:to-cyan-300/20 transition-all pointer-events-none z-10" />
      {imgStatus === 'loaded' && (
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-yellow-300/40 rounded-full blur-xl pointer-events-none" />
      )}
    </motion.div>
  );
};
