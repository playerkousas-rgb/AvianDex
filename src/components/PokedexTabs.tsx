import React from 'react';
import { Database, FileText, Compass } from 'lucide-react';
import type { Lang } from '../lib/explorer';

/**
 * 圖鑑機的三頁分頁。
 *
 * 原本一個面板塞滿「編號屏 + 搜尋 + 詳細資料 + 六宮格 + 相似鳥 + 禮儀 + 連結」，
 * 一路拉到尾都唔知自己睇緊邊一層。現在固定三頁，每頁只做一件事：
 *
 *   1 基礎數據   → 你現在睇緊邊隻、搵另一隻（編號、名稱、搜尋、上一隻／下一隻）
 *   2 詳細資料   → 這隻雀的文字（12 欄 + 體長體重 + 相似鳥 + 觀鳥禮儀／裝備）
 *   3 科學研究中心 → 去外面搵資料（相片／聲音／影片／紀錄／百科／工具，六格各一分工）
 */

export type PokedexPage = 1 | 2 | 3;

interface PokedexTabsProps {
  page: PokedexPage;
  onChange: (page: PokedexPage) => void;
  lang: Lang;
  /** 詳細資料未載入完成時，tab 上顯示小點 */
  detailLoading?: boolean;
}

const TABS: { id: PokedexPage; zh: string; en: string; shortZh: string; shortEn: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 1, zh: '基礎數據', en: 'Basics', shortZh: '基礎', shortEn: 'BASICS', Icon: Database },
  { id: 2, zh: '詳細資料', en: 'Details', shortZh: '詳細', shortEn: 'DETAILS', Icon: FileText },
  { id: 3, zh: '科學研究中心', en: 'Research', shortZh: '研究', shortEn: 'RESEARCH', Icon: Compass },
];

export const PokedexTabs: React.FC<PokedexTabsProps> = ({ page, onChange, lang, detailLoading }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  return (
    <div
      role="tablist"
      aria-label={t('圖鑑分頁', 'Dex pages')}
      className="grid grid-cols-3 gap-1.5 shrink-0"
    >
      {TABS.map((tab) => {
        const active = page === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 border transition-colors ${
              active
                ? 'bg-[#1b1a17] border-amber-400/60 text-amber-200'
                : 'bg-black/25 border-white/10 text-white/55 hover:bg-black/40 hover:text-white/80'
            }`}
          >
            <tab.Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black leading-none tracking-tight">
              <span className="hidden sm:inline">{lang === 'en' ? tab.en : tab.zh}</span>
              <span className="sm:hidden">{lang === 'en' ? tab.shortEn : tab.shortZh}</span>
            </span>
            {active && <span className="absolute inset-x-3 -bottom-px h-px bg-amber-400/80" />}
            {tab.id === 2 && detailLoading && !active && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PokedexTabs;
