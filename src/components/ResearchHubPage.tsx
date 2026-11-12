import React from 'react';
import { motion } from 'framer-motion';
import {
  Radar, Camera, PlayCircle, Volume2, BookOpen, Smartphone,
  ExternalLink, ArrowUpRight,
} from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { CARD_SOURCES, SOURCE_IMAGES, type CardSourceKey } from '../lib/cardSources';
import { SourcesPage } from './SourcesPage';

/**
 * 第 3 頁：科學研究中心。
 *
 * 六格＝六種找資料的方法（不是六個隨便的連結）：
 *   1 深度百科   文字        All About Birds（Cornell）
 *   2 觀察雷達   出現紀錄    eBird 物種頁（香港）
 *   3 視覺圖庫   相片        Macaulay Library（Cornell）
 *   4 影片中心   動態行為    YouTube
 *   5 鳴聲資料   鳥聲        Xeno-canto
 *   6 辨識裝備   工具        Merlin Bird ID
 *
 * 第 7 格（新）＝本站合成圖卡：直接開／下載 PNG，一鍵返回第 1 頁。
 */

interface ResearchHubPageProps {
  zhName: string;
  enName: string;
  sciName: string;
  speciesCode?: string;
  lang: Lang;
  /** 插畫原圖（birdcards/），作次要的下載選項 */
  cardUrl?: string;
  /** 資訊圖卡（aviandex/）—— 這是主要的下載目標 */
  infoUrl?: string;
  onBackToCard?: () => void;
}

const ICONS: Record<CardSourceKey, React.ComponentType<{ className?: string }>> = {
  wiki: BookOpen,
  radar: Radar,
  photo: Camera,
  video: PlayCircle,
  audio: Volume2,
  gear: Smartphone,
};

export const ResearchHubPage: React.FC<ResearchHubPageProps> = ({
  zhName, enName, sciName, speciesCode, lang, cardUrl, infoUrl, onBackToCard,
}) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  // Keep the original format: the local 0058 sample is WebP, remote cards may be AVIF.
  const infoExtension = infoUrl?.split(/[?#]/)[0].match(/\.(avif|webp|png|jpe?g)$/i)?.[1]?.toLowerCase() || 'avif';
  const query = (enName || sciName || zhName).trim();
  const sources = CARD_SOURCES.map((s) => ({ ...s, url: s.url(query, speciesCode) }));

  return (
    <motion.div
      key="research-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16 }}
      className="flex flex-col gap-2.5 relative z-10 pb-8 w-full"
    >
      {/* 標題：一行講完。
          之前是三行（標題 + 兩句說明 + 鳴謝），一頁未開始就一堆字。
          小朋友不會讀那兩句，所以收成一句可以講出口的：
          「想知多啲？揀一個地方去睇。」 */}
      <div className="flex items-baseline gap-2 px-0.5">
        <h3 className="text-amber-100 font-black text-[15px] leading-tight">
          {t('去邊度搵資料', 'Where to look')}
        </h3>
        <span className="text-white/30 text-[9.5px]">
          {t('已用這隻雀的名字接好', 'pre-filled with this bird')}
        </span>
      </div>

      {/* 六格：用已經畫好的六張 HUD 插圖做主體。
          之前係一列純文字連結（icon 16px + 兩行字），用戶反應「一堆字冇人睇」。
          六張圖一直在 public/images 但冇被引用 —— 所以不是要另製圖，是接返上去。
          圖上面只留「類別名 + 一句用途」，其餘交給圖本身講。 */}
      <div className="grid grid-cols-2 gap-2">
        {sources.map((s) => {
          const Icon = ICONS[s.key];
          return (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative rounded-xl overflow-hidden border border-white/12 hover:border-amber-400/50 transition-colors active:scale-[0.99] bg-[#0d1a24]"
            >
              <img
                src={SOURCE_IMAGES[s.key]}
                alt=""
                aria-hidden
                loading="lazy"
                className="w-full aspect-[3/2] object-cover opacity-85 group-hover:opacity-100 transition-opacity"
              />
              {/* 文字壓在圖底部：用漸層，不蓋住圖中央的主體 */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/70 to-transparent px-2 pt-6 pb-1.5">
                <div className="flex items-center gap-1">
                  <Icon className="w-3 h-3 text-amber-300/90 shrink-0" />
                  <span className="text-white font-black text-[11.5px] leading-tight truncate">
                    {lang === 'en' ? s.en : s.zh}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-white/40 group-hover:text-amber-300 ml-auto shrink-0" />
                </div>
                <span className="block text-white/50 text-[8.5px] leading-tight truncate">
                  {lang === 'en' ? s.enNote : s.zhNote}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* 第 7 格：本站圖卡
          ────────────────────────────────────────────────────────
          用戶的判斷（2026-11）：
            「下載我們那張合成圖卡雖然可以但作用不大，
              反而未來下載我們的資訊圖卡作用大很多」
          —— 正確。合成圖卡只是插畫加幾行字，玩家真正想收藏／列印的是
             排版好的資訊圖卡（aviandex/ 那批）。所以這裡的主次對調：

              主  資訊圖卡（aviandex/<NO>.avif）→ 開原圖 / 下載
              次  插畫（birdcards/<NO>.avif）    → 只有一行細字

          資訊圖卡未做的雀（目前 548 隻）不造假、不留空按鈕，
          直接寫「未完成」，並指向詳細資料頁看文字版。
          ──────────────────────────────────────────────────────── */}
      <div className="bg-black/30 border border-amber-400/25 rounded-lg p-2.5">
        <p className="text-white/45 text-[9.5px] tracking-[0.14em] mb-1.5">
          {t('下載這隻雀的資訊圖卡', 'DOWNLOAD THIS BIRD’S INFO CARD')}
        </p>

        {infoUrl ? (
          <div className="flex items-center gap-2">
            <a
              href={infoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/40 text-amber-100 font-black py-2.5 rounded-md text-[12px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />{t('開原圖', 'Open full size')}
            </a>
            <a
              href={infoUrl}
              download={`aviandex-${encodeURIComponent(zhName)}-info.${infoExtension}`}
              className="flex items-center justify-center gap-1.5 bg-black/45 hover:bg-black/65 border border-white/20 text-white/80 font-bold py-2.5 px-3 rounded-md text-[12px]"
            >
              {t('下載', 'Save')}
            </a>
          </div>
        ) : (
          <div className="rounded-md bg-black/35 border border-white/10 px-2.5 py-2">
            <p className="text-white/45 text-[11px] leading-snug">
              {t(
                '這隻雀的資訊圖卡仍在製作。文字版資料在「詳細資料」頁，上面的六格可以去找相片與紀錄。',
                'This bird’s info card is still being made. Text details are on the Details tab; the six doors above lead to photos and records.',
              )}
            </p>
          </div>
        )}

        {/* 插畫下載：作用小，所以收成一行細字，不搶位置 */}
        {cardUrl && (
          <p className="mt-1.5 text-white/30 text-[9.5px]">
            {t('只想存插畫？', 'Just the artwork?')}{' '}
            <a
              href={cardUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/50 hover:text-amber-200 underline underline-offset-2"
            >
              {t('開插畫原圖', 'open the illustration')}
            </a>
          </p>
        )}
        {onBackToCard && (
          <button
            type="button"
            onClick={onBackToCard}
            className="mt-1.5 w-full text-white/40 hover:text-white/70 text-[10px]"
          >
            {t('← 返回基礎數據看圖卡', '← Back to the card view')}
          </button>
        )}
      </div>

      {/* 第 8 格：來源與鳴謝（名稱／內文／分類／量度各有出處，逐項列明） */}
      <SourcesPage lang={lang} />
    </motion.div>
  );
};

export default ResearchHubPage;
