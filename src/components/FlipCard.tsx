import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Info, ScanLine } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { ENTRIES } from '../lib/explorer';
import { useCardImage, useInfoCard } from '../hooks/useCardImage';
import { loadDetails, useCardDetail } from '../lib/cardDetailsStore';
import { BirdSilhouette } from './BirdSilhouette';
import type { Bird } from '../types';

/**
 * 圖鑑格仔的「翻轉卡」。
 *
 * 為甚麼要翻轉？
 *   野外用的時候，你要的是「一眼認得隻雀」——所以正面必須是畫（插畫），
 *   不能一開始就一堆字。文字要在你需要的時候才出現，所以翻到背面。
 *
 * 兩面分別是甚麼：
 *   正面（art）   birdcards/<NO>.avif —— BIRD-DEX 2 的整張插畫，1:1 正方形。
 *                 插畫本身已經滿版，所以只加極淡的 NO. 與中文名貼底，
 *                 再加框加字只會遮住隻雀。
 *   背面（info）  aviandex/<NO>.avif —— 已經排好版的資訊圖卡（目前 21 張）。
 *                 未做的雀就由 app 用 cardCopy 的文字即時砌一個簡版，
 *                 不會出現「這張卡未有資料」這種 dead end。
 *
 * 為甚麼要自己寫 flip 而不用 rotateY 的 backface-visibility？
 *   因為兩張圖尺寸不同（插畫 1:1、資訊卡 A4 直向）。
 *   如果硬塞在同一個盒子裡旋轉，其中一面一定會被拉長或裁走。
 *   所以做法是：整個盒子旋轉，但兩面各自用自己的 aspect-ratio 排版，
 *   容器高度 = 兩面較高者。這樣兩種比例都不會變形。
 */

interface FlipCardProps {
  bird: Bird;
  lang: Lang;
  isActive?: boolean;
  listPosition?: number;
  onOpen: () => void;
}

const FIELD_ORDER = ['range', 'habitat', 'diet', 'look', 'voice', 'behavior', 'breeding', 'funFact'] as const;

/** 背面（未做資訊圖卡的雀）：用現成文字欄位砌一個簡版，不造假、不留白框 */
const CardInfoFace: React.FC<{ bird: Bird; lang: Lang }> = ({ bird, lang }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const entry = ENTRIES[bird.id];

  /* 文字由模組層快取讀（見 lib/cardDetailsStore）。
     這樣 569 張卡只載入同一個 JSON 一次，翻卡時不會再閃「載入中」。 */
  const fields = useCardDetail(bird.id, lang);
  React.useEffect(() => {
    loadDetails(lang);
  }, [lang]);

  const label: Record<string, [string, string]> = {
    range: ['分佈', 'Range'],
    habitat: ['環境', 'Habitat'],
    diet: ['食物', 'Diet'],
    look: ['外形', 'Look'],
    voice: ['鳴聲', 'Voice'],
    behavior: ['習性', 'Habits'],
    breeding: ['繁殖', 'Breeding'],
    funFact: ['冷知識', 'Fact'],
  };

  const rows = fields
    ? FIELD_ORDER
      .map((id) => [id, fields[id]] as const)
      .filter(([, v]) => (Array.isArray(v) ? v.filter(Boolean).length > 0 : !!String(v ?? '').trim()))
      .slice(0, 5)
    : [];

  return (
    <div className="absolute inset-0 flex flex-col bg-[#171512] p-2.5">
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[9px] text-yellow-300/70">NO.{bird.id}</span>
        <span className="text-white font-black text-[13px] leading-tight truncate">{bird.name}</span>
      </div>
      <p className="text-white/40 font-mono text-[8px] italic truncate">{entry?.s || ''}</p>

      {fields === null ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-white/25 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-1 text-center">
          <Info className="w-4 h-4 text-white/20" />
          <p className="text-white/30 text-[9px] leading-snug">
            {t('這隻雀的文字仍在核對，寧願留空。', 'Text for this bird is still being checked.')}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-1 mt-1.5 overflow-hidden">
          {rows.map(([id, v]) => (
            <div key={id} className="leading-tight">
              <span className="text-amber-300/80 text-[8.5px] font-black mr-1">
                {t(label[id][0], label[id][1])}
              </span>
              <span className="text-white/65 text-[9px]">
                {Array.isArray(v) ? v.filter(Boolean).join('；') : String(v)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-1 flex items-center justify-between text-[8px] text-white/25">
        <span>{t('資料待查＝刻意留空', 'blank = on purpose')}</span>
        <ScanLine className="w-2.5 h-2.5" />
      </div>
    </div>
  );
};

export const FlipCard: React.FC<FlipCardProps> = ({ bird, lang, isActive, listPosition, onOpen }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const art = useCardImage(bird.id);
  const info = useInfoCard(bird.id);

  const [flipped, setFlipped] = React.useState(false);
  const [artReady, setArtReady] = React.useState(false);

  /* 翻開才去探測資訊卡：569 張全部預探會打 569 個 404，r2.dev 會限流 */
  React.useEffect(() => {
    if (flipped) void info.probe();
  }, [flipped, info]);

  const enName = bird.taxonomy?.comName || (bird.englishName && bird.englishName !== '???' ? bird.englishName : '');
  const title = lang === 'en' ? enName || bird.name : bird.name;

  const handleClick = () => {
    setFlipped((v) => !v);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen();
  };

  return (
    <div className="relative [perspective:1200px] select-none">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={t(`${bird.name}，按一下翻轉看資料`, `${enName || bird.name}, tap to flip`)}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 190, damping: 22 }}
        className="relative w-full cursor-pointer [transform-style:preserve-3d] rounded-2xl"
      >
        {/* 正面：插畫。1:1，跟 BIRD-DEX 的原圖比例一致，不裁走花朵與樹枝 */}
        <div
          className={`relative w-full aspect-square rounded-2xl overflow-hidden border-[4px] transition-colors [backface-visibility:hidden] ${
            isActive
              ? 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.8)]'
              : 'border-gray-900 shadow-[0_5px_0_rgba(0,0,0,0.55)] hover:border-cyan-300'
          }`}
          style={{ background: 'linear-gradient(160deg,#FFE680,#FFD43B 45%,#E0A800)' }}
        >
          {(art.status === 'idle' || art.status === 'queued' || art.status === 'loading'
            || (art.status === 'loaded' && !artReady)) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 border-4 border-yellow-800/25 border-t-yellow-800 rounded-full animate-spin" />
            </div>
          )}

          {art.url && (
            <img
              key={art.url}
              src={art.url}
              alt={bird.name}
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setArtReady(true)}
              onError={() => setArtReady(false)}
              className={`w-full h-full object-cover ${art.status === 'loaded' && artReady ? 'block' : 'hidden'}`}
            />
          )}

          {/* 未發現：剪影 + 編號，不用一堆字 */}
          {(art.status === 'missing' || art.status === 'error') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2b1d10]">
              <BirdSilhouette id={bird.id} className="w-16 h-16 text-black/80" />
              <p className="mt-2 text-yellow-300/80 font-black text-[10px] tracking-[0.2em]">NO.{bird.id}</p>
            </div>
          )}

          {/* 名稱貼底：插畫滿版，所以用漸層而不是方塊 */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2 pt-5 pb-1.5 pointer-events-none">
            <p className="text-white font-black text-[12px] leading-tight truncate drop-shadow">{title}</p>
          </div>

          <div className="absolute top-1.5 left-1.5 bg-black/75 rounded px-1.5 py-0.5 pointer-events-none">
            <span className="font-mono font-black text-yellow-300 text-[9px] tracking-wide">NO.{bird.id}</span>
          </div>
          {listPosition != null && (
            <div className="absolute top-1.5 right-1.5 bg-black/55 rounded px-1.5 py-0.5 pointer-events-none">
              <span className="font-mono text-white/70 text-[8px]">#{listPosition}</span>
            </div>
          )}
        </div>

        {/* 背面：資訊。rotateY(180deg) 反轉，令文字不會左右倒轉 */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-2xl overflow-hidden border-[4px] border-gray-900 bg-[#171512] shadow-[0_5px_0_rgba(0,0,0,0.55)]">
          {info.status === 'loaded' && info.url ? (
            <img
              src={info.url}
              alt={t(`${bird.name} 資訊圖卡`, `${bird.name} info card`)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain bg-[#f7f4ea]"
            />
          ) : info.status === 'loading' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
            </div>
          ) : (
            <CardInfoFace bird={bird} lang={lang} />
          )}

          {/* 已完成的資訊圖卡：角上一個「開全圖」細掣 */}
          {info.status === 'loaded' && (
            <button
              type="button"
              onClick={handleOpen}
              className="absolute bottom-1.5 right-1.5 bg-black/70 hover:bg-black/90 text-white/80 text-[8.5px] font-bold px-1.5 py-1 rounded"
            >
              {t('開全圖', 'Open')}
            </button>
          )}
        </div>
      </motion.div>

      {/* 翻轉提示：細細一行，不搶戲 */}
      <button
        type="button"
        onClick={handleClick}
        className="mt-1 w-full text-[8.5px] text-white/24 hover:text-white/60 font-mono tracking-wide text-center"
      >
        {flipped ? t('按此看正面', 'tap for artwork') : t('按此看資料', 'tap for facts')}
      </button>
    </div>
  );
};

export default FlipCard;
