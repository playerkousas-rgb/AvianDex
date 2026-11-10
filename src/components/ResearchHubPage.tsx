import React from 'react';
import { motion } from 'framer-motion';
import {
  Radar, Camera, PlayCircle, Volume2, BookOpen, Smartphone,
  ExternalLink, ArrowUpRight,
} from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { CARD_SOURCES, type CardSourceKey } from '../lib/cardSources';
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
  /** 本站合成圖卡（有就顯示第 7 格） */
  cardUrl?: string;
  /** 圖卡狀態，用來寫「下載中／未生成」 */
  cardStatus?: 'idle' | 'queued' | 'loading' | 'loaded' | 'missing' | 'error';
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
  zhName, enName, sciName, speciesCode, lang, cardUrl, cardStatus, onBackToCard,
}) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
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
      <div className="bg-[#1b1a17]/85 border border-amber-500/25 rounded-lg p-3">
        <h3 className="text-amber-100 font-black text-[15px] leading-tight">
          {t('科學研究中心', 'Research centre')}
        </h3>
        <p className="text-white/45 text-[10.5px] mt-1 leading-relaxed">
          {t('六個入口，各找一種資料。全部用同一隻雀的英文俗名／eBird 代碼查，唔會查錯雀。',
            'Six doors, six kinds of evidence. All keyed to this bird’s English name / eBird code.')}
        </p>
        <p className="text-[9px] text-amber-300/60 mt-1">
          {t('鳴謝：Cornell Lab（eBird／Macaulay）、Xeno-canto、Merlin',
            'Credit: Cornell Lab (eBird / Macaulay), Xeno-canto, Merlin')}
        </p>
      </div>

      {/* 六格：一列式清單（唔再做 icon-topped 卡片陣） */}
      <div className="flex flex-col gap-1">
        {sources.map((s, i) => {
          const Icon = ICONS[s.key];
          return (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center gap-2.5 bg-black/25 hover:bg-black/40 border border-white/10 hover:border-amber-400/35 rounded-lg px-2.5 py-2 transition-colors"
            >
              <span className="font-mono text-[9px] text-amber-300/45 w-3 shrink-0">{i + 1}</span>
              <Icon className="w-4 h-4 text-amber-200/70 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-white/90 font-bold text-[12px] leading-tight truncate">
                  {lang === 'en' ? s.en : s.zh}
                </span>
                <span className="block text-white/40 text-[9.5px] leading-tight truncate">
                  {lang === 'en' ? s.enNote : s.zhNote}
                </span>
              </span>
              <span className="hidden xs:block sm:block font-mono text-[8.5px] text-white/25 shrink-0">
                {s.host}
              </span>
              <ArrowUpRight className="w-3 h-3 text-white/30 group-hover:text-amber-300 shrink-0" />
            </a>
          );
        })}
      </div>

      {/* 第 7 格：本站合成圖卡 */}
      <div className="bg-black/30 border border-white/12 rounded-lg p-2.5">
        <p className="text-white/40 text-[9.5px] tracking-[0.14em] mb-1.5">
          {t('本站合成圖卡', 'THIS APP · COMPOSITE CARD')}
        </p>
        {cardUrl ? (
          <div className="flex items-center gap-2">
            <a
              href={cardUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-400/30 text-amber-100 font-bold py-2 rounded-md text-[11.5px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />{t('開原圖（PNG）', 'Open full-size PNG')}
            </a>
            <a
              href={cardUrl}
              download={`aviandex-${encodeURIComponent(zhName)}.png`}
              className="flex items-center justify-center gap-1.5 bg-black/40 hover:bg-black/60 border border-white/15 text-white/70 font-bold py-2 px-3 rounded-md text-[11.5px]"
            >
              {t('下載', 'Save')}
            </a>
          </div>
        ) : (
          <p className="text-white/35 text-[11px] leading-relaxed">
            {cardStatus === 'missing' || cardStatus === 'error'
              ? t('這隻雀暫時未生成合成圖卡。可用上面第 3 格 Macaulay 的相片自行核對。',
                'No composite card for this bird yet. Use Macaulay (door 3) to check photos.')
              : t('圖卡下載中…', 'Card is loading…')}
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
