import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bird as BirdIcon, Sparkles, Power } from 'lucide-react';

export const WelcomeScreen: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    const steps = [400, 700, 1100, 1500];
    const timers = steps.map((delay, i) => setTimeout(() => setBootStep(i + 1), delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => onOpen(), 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-black">
      <motion.div
        className="h-1/2 bg-gradient-to-b from-[#E3350D] to-[#a82409] border-b-8 border-black relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 overflow-hidden"
        animate={{ y: isOpening ? '-100%' : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        <div className="absolute top-6 left-6 w-5 h-5 rounded-full bg-gray-900 border-2 border-red-900 shadow-inner flex items-center justify-center">
          <div className="w-2 h-0.5 bg-gray-600 rotate-45" />
        </div>
        <div className="absolute top-6 right-6 w-5 h-5 rounded-full bg-gray-900 border-2 border-red-900 shadow-inner flex items-center justify-center">
          <div className="w-2 h-0.5 bg-gray-600 -rotate-45" />
        </div>

        <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center px-4 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 justify-center flex-wrap"
          >
            <BirdIcon className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300" strokeWidth={2.5} />
            <h1 className="text-white font-black text-2xl sm:text-4xl md:text-5xl tracking-wider italic drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]">
              AVIANDEX
            </h1>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-yellow-300 font-mono text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] mt-2"
          >
            TRAINER'S FIELD GUIDE · v1.4.0
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-44 h-44 sm:w-52 sm:h-52 z-30">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white to-gray-300 rounded-full border-[5px] border-black flex items-center justify-center">
              <button
                onClick={handleOpen}
                disabled={isOpening}
                className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#5bc0f8] to-[#1d80c4] rounded-full border-[5px] border-black shadow-[inset_0_-6px_12px_rgba(0,0,0,0.3),0_0_30px_rgba(49,165,232,0.9)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-2 left-4 w-10 h-6 bg-white/40 rounded-full blur-sm" />
                <div className="absolute inset-0 rounded-full bg-cyan-300/30 animate-ping" />
                <Power className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] relative z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-3 text-white font-black text-[10px] tracking-[0.3em] z-10 group-hover:opacity-0 transition-opacity">
                  PRESS
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="h-1/2 bg-gradient-to-b from-[#a82409] to-[#7a1b08] border-t-8 border-black relative z-10 overflow-hidden"
        animate={{ y: isOpening ? '100%' : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.5) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        <div className="absolute top-16 left-0 right-0 px-4 sm:px-6">
          <div className="max-w-md mx-auto bg-black/60 backdrop-blur-sm rounded-xl border-2 border-yellow-400/30 p-4 sm:p-5 font-mono text-[10px] sm:text-xs leading-relaxed shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-green-500/30 pb-2">
              <span className="text-green-400 font-black tracking-widest">► SYSTEM BOOT</span>
              <span className="text-green-300/60 text-[10px]">[OK]</span>
            </div>
            <div className="space-y-1 text-green-300">
              {bootStep >= 1 && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  &gt; Initializing AvianDex OS v1.4.0... <span className="text-green-500">DONE</span>
                </motion.p>
              )}
              {bootStep >= 2 && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  &gt; Loading 569 HK species database... <span className="text-green-500">DONE</span>
                </motion.p>
              )}
              {bootStep >= 3 && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  &gt; Calibrating AI sensors... <span className="text-cyan-400">READY</span>
                </motion.p>
              )}
              {bootStep >= 4 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-yellow-300 font-black mt-2 pt-2 border-t border-green-500/30">
                  ► PRESS POWER BUTTON TO START
                </motion.p>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-full px-4">
          <p className="text-yellow-300/70 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em]">
            POWERED BY · HUGGING FACE · NYCKEL · eBird · CORNELL LAB
          </p>
          <p className="text-white/30 font-mono text-[9px] mt-1">
            © SKWAI · 香港童軍總會筲箕灣區
          </p>
        </div>
      </motion.div>
    </div>
  );
};
