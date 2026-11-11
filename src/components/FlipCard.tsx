import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Info, ScanLine, RotateCw, Maximize2 } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { ENTRIES } from '../lib/explorer';
import { useCardImage, useInfoCard } from '../hooks/useCardImage';
import { useDexCardInput } from '../hooks/useDexCardInput';
import { DexCard } from './DexCard';
import { loadDetails, useCardDetail } from '../lib/cardDetailsStore';
import { BirdSilhouette } from './BirdSilhouette';
import type { Bird } from '../types';

/**
 * 圖鑑格仔的卡。
 *
 * ── 互動設計（2026-11 依用戶指示重做）──────────────────────────
 * 用戶的原話：
 *   「應該是看到鳥圖，點 1 下就會詳細資料與放大」
 *   「點一下鳥圖就會翻轉成資訊圖卡」
 *
 * 所以：
 *   格仔（這一個檔案）  點 1 下        → 開詳細頁（順便把鳥圖放大）
 *                       右下角 ⟳ 細掣  → 在原地翻轉看資訊卡
 *   詳細頁（BirdDetailPage）點上方的鳥圖 → 翻轉成資訊卡
 *
 * 之前的錯誤：我把「翻轉」當成格仔的主要動作，翻轉吃掉了進入詳細頁的入口。
 * 用戶要的是「點卡＝入去睇」，翻轉只是順手可以玩的一個小動作。
 * ────────────────────────────────────────────────────────
 *
 * 兩面分別是甚麼：
 *   正面（art）   birdcards/<NO>.avif —— BIRD-DEX 2 的整張插畫，1:1 正方形
 *   背面（info）  aviandex/<NO>.avif —— 已排版的資訊圖卡（目前 21 張）
 *                 未做的雀用 cardDetails 的文字即時砌簡版，不出現空盒
 */

interface FlipCardProps {
  bird: Bird;
  lang: Lang;
  isActive?: boolean;
  listPosition?: number;
  /** 點卡 / 按放大 → 開詳細頁（含放大鳥圖） */
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

  /* 即時砌卡：只在真正翻開之後才開始砌（避免 48 格一齊拉兩個 600 KB 的語言檔）。
     砌法與詳細頁、PNG 匯出完全一樣，三處不會走樣。 */
  const ownCard = useDexCardInput(
    bird.id, '', art.url ?? null, lang === 'en' ? 'en' : 'both', flipped,
  );

  const enName = bird.taxonomy?.comName || (bird.englishName && bird.englishName !== '???' ? bird.englishName : '');
  const title = lang === 'en' ? enName || bird.name : bird.name;

  /* 主動作＝開詳細頁。翻轉只有右下角那個細掣會做，不會搶走主動作。 */
  const flipOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlipped((v) => !v);
  };

  return (
    <div className="relative [perspective:1200px] select-none">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={t(`${bird.name}，按一下看詳細資料`, `${enName || bird.name}, open details`)}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); }
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
            <p className="text-white/50 text-[8.5px] leading-tight truncate">{t('按一下看詳細資料', 'tap to open')}</p>
          </div>

          <div className="absolute top-1.5 left-1.5 bg-black/75 rounded px-1.5 py-0.5 pointer-events-none">
            <span className="font-mono font-black text-yellow-300 text-[9px] tracking-wide">NO.{bird.id}</span>
          </div>

          {/* 放大：明確表示「會放大」，跟主動作同一個目的地 */}
          <span className="absolute top-1 right-1 w-7 h-7 rounded-md bg-black/70 border border-white/25 text-white flex items-center justify-center pointer-events-none">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>

          {/* 翻轉：一個細掣，不搶主動作 */}
          <button
            type="button"
            onClick={flipOnly}
            aria-label={t('翻轉看資訊卡', 'Flip to info card')}
            title={t('翻轉看資訊卡', 'Flip to info card')}
            className="absolute bottom-1.5 right-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/90 active:scale-90 border border-white/30 text-amber-200 flex items-center justify-center"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {listPosition != null && (
            <div className="absolute top-1.5 right-10 bg-black/55 rounded px-1.5 py-0.5 pointer-events-none">
              <span className="font-mono text-white/60 text-[8px]">#{listPosition}</span>
            </div>
          )}
        </div>

        {/* 背面：資訊卡。rotateY(180deg) 反轉，令文字不會左右倒轉 */}
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
          ) : ownCard.input ? (
            /* 沒有現成 avif 的 548 隻，用同一套 renderer 即時砌（與詳細頁、下載同一版） */
            <div className="absolute inset-0 overflow-auto bg-[#f7f4ea] flex items-start justify-center">
              <DexCard data={ownCard.input} lang={lang === 'en' ? 'en' : 'both'} width={520} />
            </div>
          ) : (
            /* 砌唔到（資料檔未載入）才退回文字簡版，並講清楚這是暫時的 */
            <CardInfoFace bird={bird} lang={lang} />
          )}

          {/* 背面一樣按一下＝開詳細頁（背面才是「詳細資料」的所在） */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-center pb-1 pointer-events-none">
            <span className="text-white/70 text-[9px] font-bold">
              {t('按一下看完整詳細資料', 'tap for full details')}
            </span>
          </div>

          <button
            type="button"
            onClick={flipOnly}
            aria-label={t('轉回插畫', 'Back to artwork')}
            className="absolute bottom-1.5 right-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/90 active:scale-90 border border-white/30 text-amber-200 flex items-center justify-center"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* 卡下一行：講清楚按卡會去邊 */}
      <button
        type="button"
        onClick={onOpen}
        className="mt-1 w-full py-2 text-[10px] text-white/35 hover:text-white/75 font-mono tracking-wide text-center"
      >
        {t('按卡面 → 詳細資料 · 右下 ⟳ 翻轉', 'tap → details · ⟳ flips')}
      </button>
    </div>
  );
};

export default FlipCard;
