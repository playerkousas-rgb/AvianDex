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
        <button
          onClick={handleOpen}
          className="relative group focus:outline-none"
        >
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full border-[12px] border-black flex items-center justify-center shadow-[0_0_0_8px_rgba(255,255,255,0.1),0_15px_30px_rgba(0,0,0,0.8)] overflow-hidden transition-transform duration-300 group-active:scale-95 group-hover:shadow-[0_0_0_8px_rgba(255,255,255,0.2),0_15px_30px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-gray-400" />
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full border-4 border-gray-300 shadow-inner flex items-center justify-center relative z-10 group-hover:border-gray-400 transition-colors">
              <motion.div
                animate={{
                  opacity: bootStep >= 2 ? [0.5, 1, 0.5] : 0.5,
                  boxShadow: bootStep >= 2 ? ['0 0 10px rgba(56,189,248,0)', '0 0 20px rgba(56,189,248,0.6)', '0 0 10px rgba(56,189,248,0)'] : 'none',
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute top-1 left-2 w-4 h-4 bg-white rounded-full blur-[2px]" />
                <Power className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-500 ${bootStep >= 2 ? 'text-blue-500' : 'text-gray-300'}`} />
              </motion.div>
            </div>
          </div>
        </button>
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
