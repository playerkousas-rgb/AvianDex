import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bird, Camera, Settings, Database, Github, ExternalLink } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-72 h-full bg-gray-900 border-l-4 border-red-600 shadow-2xl z-[110] flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-3 text-red-500">
                <Bird size={28} />
                <h2 className="text-2xl font-black italic tracking-tighter text-white">AvianDex</h2>
              </div>
              <p className="text-yellow-400 font-mono text-[10px] tracking-widest">SYSTEM V1.4.0</p>
            </div>

            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button 
                onClick={() => { window.open('https://skw-birdex2.vercel.app', '_blank'); onClose(); }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold hover:brightness-110 transition shadow-lg mb-4"
              >
                <div className="flex items-center gap-3">
                  <Camera size={20} className="text-yellow-300" />
                  <span className="tracking-wide">BIRD-DEX 2 捕捉模式</span>
                </div>
                <ExternalLink size={16} className="text-white/50" />
              </button>

              <div className="text-xs font-bold text-gray-500 tracking-widest px-2 mb-2 mt-6">EXTERNAL RESOURCES</div>
              
              <a href="https://ebird.org" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 transition">
                <Database size={18} />
                <span>eBird 觀察數據</span>
              </a>
              <a href="https://github.com/playerkousas-rgb" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 transition">
                <Github size={18} />
                <span>GitHub Source</span>
              </a>
            </div>

            <div className="p-4 border-t border-white/10">
              <p className="text-[10px] text-gray-500 font-mono text-center">
                CREATED BY SKWSCOUT © 2026
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
