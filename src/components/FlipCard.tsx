import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Info, ScanLine, RotateCw, Maximize2, ChevronRight } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { ENTRIES } from '../lib/explorer';
import { useCardImage, useInfoCard } from '../hooks/useCardImage';
import { loadDetails, useCardDetail } from '../lib/cardDetailsStore';
import { BirdSilhouette } from './BirdSilhouette';
import type { Bird } from '../types';

/**
 * 圖鑑格仔的「翻轉卡」。
 *
 * 兩面分別是甚麼：
 *   正面（art）   birdcards/<NO>.avif —— BIRD-DEX 2 的整張插畫，1:1 正方形。
 *   背面（info）  aviandex/<NO>.avif —— 已排版的資訊圖卡（目前 21 張）。
 *                 未做的雀由 app 用 cardDetails 的文字即時砌簡版，不出現空盒。
 *
 * ⚠️ 2026-11 修正（用戶回報）：之前整個卡面只有「翻轉」一個動作，
 *    翻到背面全部字都細到睇唔到，而「進入詳細資料」的入口又被翻轉吃掉了，
 *    變成「唔知有詳細資料頁就永遠入唔到」。現在改成三個各自獨立、看得見的出口：
 *
 *      1. 卡面本身      翻轉（看插畫 / 看資料）
 *      2. 右上角 ⤢       放大（進入圖鑑機全螢幕檢視，裡面一樣可以翻轉）
 *      3. 背面底部       「詳細資料」大按鈕（進入圖鑑機第 2 頁的文字詳情）
 *
 *    三個動作互不覆蓋，任何一個都不需要用戶先知道另一個存在。
 */

interface FlipCardProps {
  bird: Bird;
  lang: Lang;
  isActive?: boolean;
  listPosition?: number;
  /** 進入全螢幕（圖鑑機放大檢視） */
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
    <div className="absolute inset-0 flex flex-col bg-[#171512] p-2.5 pb-9">
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

  const toggle = () => setFlipped((v) => !v);

  return (
    <div className="relative [perspective:1200px] select-none">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={t(`${bird.name}，按一下翻轉看資料`, `${enName || bird.name}, tap to flip`)}
        onClick={toggle}
        onKeyDown={(e) => {
          /* Space＝翻轉、Enter＝放大，符合「按鈕」與「連結」的分工 */
          if (e.key === ' ') { e.preventDefault(); toggle(); }
          if (e.key === 'Enter') { e.preventDefault(); onOpen(); }
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
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2 pt-6 pb-1.5 pointer-events-none">
            <p className="text-white font-black text-[12.5px] leading-tight truncate drop-shadow">{title}</p>
            <p className="text-white/55 text-[8.5px] leading-tight truncate">{t('按卡面看資料', 'tap card for facts')}</p>
          </div>

          <div className="absolute top-1.5 left-1.5 bg-black/75 rounded px-1.5 py-0.5 pointer-events-none">
            <span className="font-mono font-black text-yellow-300 text-[9px] tracking-wide">NO.{bird.id}</span>
          </div>

          {/* 放大：右上角，永遠看得見。這是「進入詳細頁」的入口之一 */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            aria-label={t(`放大 ${bird.name}`, `Open ${bird.name}`)}
            title={t('放大（全螢幕）', 'Open full screen')}
            className="absolute top-1 right-1 w-7 h-7 rounded-md bg-black/70 hover:bg-black/90 active:scale-90 border border-white/25 text-white flex items-center justify-center"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {listPosition != null && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/55 rounded px-1.5 py-0.5 pointer-events-none">
              <span className="font-mono text-white/60 text-[8px]">#{listPosition}</span>
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
              className="w-full h-full object-contain bg-[#f7f4ea] pb-9"
            />
          ) : info.status === 'loading' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
            </div>
          ) : (
            <CardInfoFace bird={bird} lang={lang} />
          )}

          {/* 背面底部：「詳細資料」大按鈕。
              之前背面只有一個 8.5px 的「開全圖」細掣，等於冇入口，
              所以用戶完全唔知道有詳細資料頁。 */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="absolute inset-x-1.5 bottom-1.5 h-7 rounded-md bg-gradient-to-b from-yellow-400 to-yellow-600 border border-yellow-800 text-gray-900 font-black text-[10.5px] flex items-center justify-center gap-1 active:scale-[0.98]"
          >
            {t('詳細資料與放大', 'DETAILS & FULL VIEW')}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* 卡下兩個動作，寫明文字，不用猜 */}
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          onClick={toggle}
          className="flex-1 flex items-center justify-center gap-1 rounded bg-black/30 hover:bg-black/55 border border-white/10 text-white/55 hover:text-white text-[8.5px] font-bold py-1"
        >
          <RotateCw className="w-2.5 h-2.5" />
          {flipped ? t('睇插畫', 'Artwork') : t('睇資料', 'Facts')}
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-1 rounded bg-black/30 hover:bg-black/55 border border-white/10 text-amber-200/80 hover:text-amber-100 text-[8.5px] font-bold py-1"
        >
          <Maximize2 className="w-2.5 h-2.5" />
          {t('放大', 'Open')}
        </button>
      </div>
    </div>
  );
};

export default FlipCard;
