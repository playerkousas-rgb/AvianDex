import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bird as BirdIcon, Sparkles, Power, ExternalLink } from 'lucide-react';

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

        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-700 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-green-500 border border-green-700 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-blue-400 border border-blue-700 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
          </div>
          
          <button 
            onClick={() => window.open('https://skw-birdex2.vercel.app', '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/20 text-[10px] text-white/90 hover:bg-black/60 transition-colors pointer-events-auto shadow-lg backdrop-blur-sm"
          >
            <Sparkles size={12} className="text-yellow-400" />
            <span>前往 BIRD-DEX 2 捕捉精靈卡</span>
            <ExternalLink size={10} />
          </button>
        </div>

      </motion.div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <motion.button
          onClick={handleOpen}
          className="relative group focus:outline-none"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ scale: 0.93 }}
        >
          {/* 外圈光暈 */}
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-400/30 blur-2xl"
            animate={{ opacity: bootStep >= 2 ? [0.3, 0.7, 0.3] : 0.2, scale: bootStep >= 2 ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* 精靈球本體 */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-black shadow-[0_18px_40px_rgba(0,0,0,0.7),inset_0_-10px_20px_rgba(0,0,0,0.25)] overflow-hidden transition-transform duration-300 group-hover:scale-105">
            {/* 上半紅 */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#ff5b3d] to-[#d4280a]" />
            {/* 下半白 */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-[#ffffff] to-[#d9d9d9]" />
            {/* 中央黑帶 */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[14%] bg-black" />
            {/* 高光 */}
            <div className="absolute top-[14%] left-[20%] w-10 h-7 md:w-14 md:h-9 bg-white/40 rounded-full blur-md rotate-[-20deg]" />

            {/* 中央按鈕 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black flex items-center justify-center shadow-lg">
              <motion.div
                animate={{
                  boxShadow: bootStep >= 2
                    ? ['0 0 8px rgba(56,189,248,0.3)', '0 0 24px rgba(56,189,248,0.9)', '0 0 8px rgba(56,189,248,0.3)']
                    : '0 0 6px rgba(255,255,255,0.2)',
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-8 h-8 md:w-11 md:h-11 rounded-full border-[3px] flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${
                  bootStep >= 2 ? 'bg-white border-cyan-200' : 'bg-gray-100 border-gray-300'
                }`}
              >
                <div className="absolute top-1 left-1.5 w-2.5 h-2.5 bg-white rounded-full blur-[1px]" />
                <Power className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-500 ${bootStep >= 2 ? 'text-cyan-500' : 'text-gray-300'}`} strokeWidth={3} />
              </motion.div>
            </div>
          </div>
        </motion.button>
      </div>

      <motion.div
        className="h-1/2 bg-white relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
        animate={{ y: isOpening ? '100%' : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px)]" />

        <div className="h-full flex flex-col items-center justify-center pt-16">
          <div className="text-center space-y-4 px-6 relative z-10">
            {bootStep >= 1 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 text-red-600 drop-shadow-[0_2px_0_rgba(255,255,255,1)]">
                  <BirdIcon size={40} className="md:w-12 md:h-12" />
                  <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">AvianDex</h1>
                </div>
                <div className="bg-black text-yellow-400 px-4 py-1.5 rounded-full border-2 border-yellow-400 font-mono text-[10px] md:text-xs tracking-[0.3em] shadow-lg">
                  HONG KONG EDITION
                </div>
              </motion.div>
            ) : (
              <div className="h-[90px] md:h-[104px]" />
            )}

            <div className="space-y-2 mt-8">
              {bootStep >= 2 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] md:text-xs text-gray-500 font-mono tracking-widest">
                  SYSTEM INITIALIZED ...
                </motion.p>
              )}
              {bootStep >= 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                  <p className="text-[10px] md:text-xs text-gray-400 font-mono tracking-widest mb-4">
                    WAITING FOR OPERATOR
                  </p>
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-red-500 font-black text-sm tracking-widest"
                  >
                    ▼ TAP BUTTON TO START
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 w-full text-center">
          <p className="text-[8px] md:text-[10px] text-gray-400 font-mono font-bold tracking-widest px-4">
            POWERED BY · HUGGING FACE · NYCKEL · eBird · CORNELL LAB
          </p>
        </div>
      </motion.div>
    </div>
  );
};
