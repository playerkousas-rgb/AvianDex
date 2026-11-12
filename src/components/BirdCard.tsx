import React, { useState } from 'react';
import { Bird } from '../types';
import { motion } from 'framer-motion';
import { HelpCircle, Footprints, RefreshCw, AlertTriangle } from 'lucide-react';
import { BirdSilhouette } from './BirdSilhouette';
import { useCardImage } from '../hooks/useCardImage';

interface BirdCardProps {
  bird: Bird;
  onClick: () => void;
  isActive?: boolean;
  /** 'en' ＝ 卡面只出英文（主標題英文名、副題中文名）；'zh' ＝ 相反 */
  lang?: 'zh' | 'en';
}

/**
 * 單一張鳥卡。
 * 圖片載入交由 useCardImage（全域排隊 + 併發上限 + 多副檔名），
 * 不再用 <img loading="lazy"> 配 display:none —— 呢個組合會令圖片永遠唔載入，
 * 卡就永遠停喺「載入中」或誤判成「未發現」。
 */
export const BirdCard: React.FC<BirdCardProps> = ({
  bird,
  onClick,
  isActive = false,
  lang = 'zh',
}) => {
  const image = useCardImage(bird.id);
  const [imgReady, setImgReady] = useState(false);
  const hasName = bird.name && bird.name !== '???';
  /* 全英文模式：主標題用英文俗名，副題才出中文名；中文模式相反 */
  const enName = bird.taxonomy?.comName || (bird.englishName && bird.englishName !== '???' ? bird.englishName : '');
  const title = lang === 'en' ? enName || bird.name : bird.name;
  const subName = lang === 'en' ? bird.name : enName;

  // 圖片已載入（onLoad 觸發）才算「已發現」；名字只用於顯示標題
  const showArtwork = image.status === 'loaded' && imgReady;
  const missing = image.status === 'missing' || image.status === 'error';

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
      <div className="absolute top-2 left-2 z-30 flex items-center gap-1">
        <div className="bg-black/85 backdrop-blur-sm rounded-md px-2 py-0.5 border border-yellow-300/50 shadow-md">
          <span className="font-mono font-black text-yellow-300 text-[10px] tracking-wider">
            NO.{bird.id}
          </span>
        </div>

      </div>
      <div className="absolute top-2 right-2 z-30 w-3 h-3 rounded-full bg-red-600 border-2 border-red-900 shadow-inner" />

      {(image.status === 'idle' ||
        image.status === 'queued' ||
        image.status === 'loading' ||
        (image.status === 'loaded' && !imgReady)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300">
          <div className="w-8 h-8 border-4 border-yellow-700/30 border-t-yellow-700 rounded-full animate-spin" />
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden">
        {image.url && (
          <img
            key={image.url}
            src={image.url}
            alt={hasName ? `${bird.name}（NO.${bird.id}）` : `Card No. ${bird.id}`}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImgReady(true)}
            onError={() => setImgReady(false)}
            className={`w-full h-full object-cover ${showArtwork ? 'block' : 'hidden'}`}
          />
        )}
      </div>

      {showArtwork && hasName && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2 pt-6">
          <p className="text-white font-black text-xs sm:text-sm tracking-tight truncate drop-shadow-lg text-center">
            {title}
          </p>
          {subName && (
            <p className="text-yellow-200/80 font-mono text-[8px] sm:text-[9px] tracking-tight truncate text-center leading-tight">
              {subName}
            </p>
          )}
          {bird.taxonomy?.sciName && (
            <p className="text-white/55 font-mono text-[7px] italic truncate text-center leading-tight">
              {bird.taxonomy.sciName}
            </p>
          )}
        </div>
      )}

      {missing && (
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
            {hasName ? title : '? ? ?'}
          </p>
          {subName && (
            <p className="mt-0.5 text-yellow-100/70 font-mono text-[7px] tracking-wide text-center px-2 truncate max-w-full">
              {subName}
            </p>
          )}
          {bird.taxonomy?.sciName && (
            <p className="text-yellow-100/40 font-mono text-[6px] italic tracking-wide text-center px-2 truncate max-w-full">
              {bird.taxonomy.sciName}
            </p>
          )}
          <p className="mt-0.5 text-yellow-200/50 font-mono text-[8px] tracking-widest uppercase">
            {image.status === 'error' ? 'LOAD ERROR' : 'UNDISCOVERED'}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              image.retry();
            }}
            className="absolute bottom-2 inset-x-2 bg-black/60 hover:bg-black/80 border border-yellow-400/30 rounded px-2 py-1 flex items-center justify-center gap-1 text-yellow-200/80 active:scale-95"
            aria-label={`重新載入 NO.${bird.id} 圖卡`}
          >
            {image.status === 'error' ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            <span className="font-mono text-[8px] tracking-widest">
              {image.status === 'error' ? 'RETRY LOAD' : 'RETRY / 重新探測'}
            </span>
          </button>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/0 via-cyan-400/0 to-cyan-300/0 group-hover:from-cyan-400/10 group-hover:to-cyan-300/20 transition-all pointer-events-none z-10" />
      {showArtwork && (
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-yellow-300/40 rounded-full blur-xl pointer-events-none" />
      )}
    </motion.div>
  );
};
