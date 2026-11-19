import { useEffect, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bird as BirdIcon } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { FieldFeathers } from './FieldFeathers';
import { HatchingEgg } from './HatchingEgg';

const HATCH_MS = 680;
const PANEL_DELAY_MS = 230;
const OPEN_MS = 840;

export function WelcomeScreen({ onOpen, lang = 'zh' }: { onOpen: () => void; lang?: Lang }) {
  const [isOpening, setIsOpening] = useState(false);
  const reduceMotion = useReducedMotion();
  const english = lang === 'en';

  useEffect(() => {
    if (!isOpening) return;
    const timer = window.setTimeout(onOpen, OPEN_MS);
    return () => window.clearTimeout(timer);
  }, [isOpening, onOpen]);

  function hatch() {
    if (isOpening) return;
    if (reduceMotion) onOpen();
    else setIsOpening(true);
  }

  const panelTransition = {
    delay: isOpening ? PANEL_DELAY_MS / 1000 : 0,
    duration: (OPEN_MS - PANEL_DELAY_MS) / 1000,
    ease: 'easeInOut' as const,
  };
  const reveal = (delay: number, y = 0) => ({
    initial: reduceMotion ? false as const : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reduceMotion ? 0 : delay, duration: reduceMotion ? 0 : .25 },
  });

  return (
    <motion.section
      aria-labelledby="welcome-title"
      className="welcome-screen fixed inset-0 z-[100] flex flex-col overflow-hidden bg-black font-sans"
      data-opening={isOpening}
      style={{ '--hatch-duration': `${HATCH_MS}ms` } as CSSProperties}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : .16 }}
    >
      <motion.div
        className="welcome-cover field-camo relative z-20 h-1/2 shrink-0 overflow-hidden border-b-8 border-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        aria-hidden="true"
        animate={{ y: isOpening ? '-100%' : 0 }}
        transition={panelTransition}
      >
        <div className="absolute top-6 left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#453f2f] bg-gray-900 shadow-inner">
          <div className="h-0.5 w-2 rotate-45 bg-gray-600" />
        </div>
        <div className="absolute top-6 right-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#453f2f] bg-gray-900 shadow-inner">
          <div className="h-0.5 w-2 -rotate-45 bg-gray-600" />
        </div>
        <FieldFeathers className="welcome-feathers absolute bottom-6 left-6 gap-2 text-[15px]" />
      </motion.div>

      <button
        type="button"
        onClick={hatch}
        aria-label={english ? 'Tap the egg to open the AvianDex field guide' : '撳鳥蛋，開啟 AvianDex 圖鑑'}
        disabled={isOpening}
        className="welcome-start absolute top-1/2 left-1/2 z-30 block -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
      >
        <HatchingEgg />
      </button>

      <motion.div
        className="welcome-notes relative z-10 h-1/2 shrink-0 overflow-hidden bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
        animate={{ y: isOpening ? '100%' : 0 }}
        transition={panelTransition}
      >
        <div aria-hidden="true" className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px)]" />
        <div className="welcome-boot-copy relative flex h-full flex-col items-center justify-center px-5 pt-16 text-center">
          <motion.div {...reveal(.4, 10)} className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 text-red-600 drop-shadow-[0_2px_0_rgba(255,255,255,1)]">
              <BirdIcon className="h-10 w-10 md:h-12 md:w-12" aria-hidden="true" />
              <h1 id="welcome-title" className="text-4xl md:text-5xl font-black italic tracking-tighter">AvianDex</h1>
            </div>
            <div className="rounded-full border-2 border-yellow-400 bg-black px-4 py-1.5 font-mono text-[10px] tracking-[0.3em] text-yellow-400 shadow-lg md:text-xs">
              HONG KONG EDITION
            </div>
          </motion.div>

          <div className="welcome-status mt-8 space-y-2">
            <motion.p {...reveal(.7)} className="welcome-status-line font-mono text-[10px] tracking-widest text-gray-500 md:text-xs">
              SYSTEM INITIALIZED ...
            </motion.p>
            <motion.div {...reveal(1.1)} className="flex flex-col items-center gap-2">
              <p className="welcome-status-line mb-4 font-mono text-[10px] tracking-widest text-gray-400 md:text-xs">
                WAITING FOR OPERATOR
              </p>
              <p className="text-sm font-black tracking-widest text-red-500">
                {english ? '▲ TAP THE EGG TO START' : '▲ 撳鳥蛋，開啟圖鑑'}
              </p>
            </motion.div>
          </div>
        </div>

        <p className="welcome-credits absolute bottom-4 w-full px-4 text-center font-mono text-[8px] font-bold tracking-widest text-gray-400 md:text-[10px]">
          POWERED BY · HUGGING FACE · NYCKEL · eBird · CORNELL LAB
        </p>
      </motion.div>
    </motion.section>
  );
}
