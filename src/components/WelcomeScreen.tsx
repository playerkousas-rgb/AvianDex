import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const WelcomeScreen: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 1000); // Wait for the split animation to finish
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-black">
      {/* Top Half */}
      <motion.div 
        className="h-1/2 bg-[#E3350D] border-b-8 border-black relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20"
        animate={{ y: isOpening ? '-100%' : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-48 h-48 bg-black rounded-full z-10 flex items-center justify-center">
          <div className="w-36 h-36 bg-white rounded-full border-4 border-black flex items-center justify-center">
            <button 
              onClick={handleOpen}
              disabled={isOpening}
              className="w-28 h-28 bg-[#31A5E8] rounded-full border-4 border-black shadow-[0_0_20px_rgba(49,165,232,0.8)] hover:bg-[#5bc0f8] transition-colors flex items-center justify-center group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
              <span className="text-white font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity z-10">OPEN</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Half */}
      <motion.div 
        className="h-1/2 bg-[#E3350D] border-t-8 border-black relative z-10"
        animate={{ y: isOpening ? '100%' : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-black/30 font-black text-2xl tracking-widest font-mono">
          AvianDex v1.3.0
        </div>
      </motion.div>
    </div>
  );
};
