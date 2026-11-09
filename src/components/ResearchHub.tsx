import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { buildHubLinks } from '../lib/researchHub';

/**
 * 「科學研究中心」六宮格 —— 每一格負責一種找資料的方式，不是六個隨便的連結。
 *
 *   1 深度百科  → 文字資料（All About Birds，Cornell）
 *   2 觀察雷達  → 香港出現紀錄（eBird 地區熱點）
 *   3 視覺圖庫  → 相片（Macaulay Library，Cornell；Flickr 作備用）
 *   4 影片中心  → 動態行為（YouTube）
 *   5 鳴聲資料  → 聲音（Xeno-canto）
 *   6 辨識裝備  → 工具（Merlin Bird ID）
 *
 * 每一個 URL 都用該雀的英文俗名／eBird 代碼組成，所以不會「撳完查無此鳥」。
 * 六格全部保留，唔可以為了版面而刪；刪一格＝少一種找資料的門。
 */

interface ResearchHubProps {
  /** 英文俗名（權威查詢字） */
  sciQuery: string;
  /** eBird speciesCode（有就用，冇就退回英文名） */
  speciesCode?: string;
  lang: Lang;
  /** 點格；預設開新視窗 */
  onOpen?: (url: string) => void;
}

export const ResearchHub: React.FC<ResearchHubProps> = ({ sciQuery, speciesCode, lang, onOpen }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const links = buildHubLinks(sciQuery, speciesCode, lang);
  const open = (url: string) => {
    if (onOpen) { onOpen(url); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-b from-amber-950/60 to-black/70 rounded-3xl p-4 border-2 border-amber-500/30 flex flex-col gap-3 shadow-inner">
      <div className="flex items-start gap-3">
        <div className="bg-amber-500/20 p-2 rounded-lg shrink-0">
          <BookOpen className="w-5 h-5 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-amber-200 font-black text-base tracking-tight leading-none">
            {t('科學研究中心', 'RESEARCH HUB')}
          </h3>
          <p className="text-white/45 text-[10px] mt-1">
            {t('六個入口，各找一種資料：文字・紀錄・相片・影片・聲音・工具',
              'Six doors, six kinds of evidence: text · records · photos · video · sound · tools')}
          </p>
          <p className="text-[8.5px] text-amber-300/70 leading-snug mt-1 italic">
            {t('數據鳴謝：Cornell Lab（eBird／Macaulay）、Xeno-canto、Merlin',
              'Data credit: Cornell Lab (eBird / Macaulay), Xeno-canto, Merlin')}
          </p>
        </div>
      </div>

      {/* 六宮格：固定正方形，390px 都按得到 */}
      <div className="grid grid-cols-2 gap-2.5">
        {links.map((link) => (
          <button
            key={link.key}
            type="button"
            onClick={() => open(link.url)}
            title={link.url}
            className="relative rounded-2xl border-b-4 border-black/60 overflow-hidden aspect-square active:translate-y-0.5 transition-all text-left"
          >
            <img
              src={link.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${link.accent} via-black/35 to-black/10`} />
            <div className="absolute top-2 left-2 bg-black/60 rounded-md p-1.5">
              <link.Icon className="w-4 h-4 text-white/90" />
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-sm px-2 py-1.5 border-t border-white/10">
              <p className="text-white font-black text-[11px] leading-tight">{link.title}</p>
              <p className="text-white/55 text-[8.5px] leading-tight mt-0.5 truncate">{link.subtitle}</p>
            </div>
            <ExternalLink className="absolute top-2 right-2 w-3 h-3 text-white/40" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResearchHub;
