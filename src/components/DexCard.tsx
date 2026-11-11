import React from 'react';
import { renderDexCard, DEX_CARD_CSS } from '../lib/dexCardLayout';
import type { DexCardInput } from '../lib/dexCard';

/**
 * 圖鑑資訊卡（1200×1600 版式）。
 *
 * 兩個用途、同一份 renderer：
 *   1. 詳細頁頂圖翻轉後的背面 —— 用 `scale` 縮到容器寬度
 *   2. 下載／列印 —— 用 `scale=1` 的 1200×1600 原尺寸
 *
 * 版式是固定像素，所以縮放要用 transform，不可以改字級，
 * 否則「螢幕看到的」與「下載到的」會變成兩張不同的卡。
 */

const CSS_INJECTED = 'avx-dexcard-css';

function useCardCss() {
  React.useEffect(() => {
    if (document.getElementById(CSS_INJECTED)) return;
    const el = document.createElement('style');
    el.id = CSS_INJECTED;
    el.textContent = DEX_CARD_CSS;
    document.head.appendChild(el);
  }, []);
}

interface DexCardProps {
  data: DexCardInput;
  /** 'both' 中英並列；'zh'／'en' 單語 */
  lang?: 'both' | 'zh' | 'en';
  /** 目標寬度（px）。預設 1200＝原尺寸 */
  width?: number;
  className?: string;
  /** 卡面砌好後回呼（下載 PNG 要用 DOM） */
  onReady?: (el: HTMLDivElement | null) => void;
}

export const DexCard: React.FC<DexCardProps> = ({ data, lang = 'both', width = 1200, className = '', onReady }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useCardCss();

  const html = React.useMemo(() => renderDexCard(data, { lang }), [data, lang]);
  const scale = width / 1200;

  React.useEffect(() => {
    onReady?.(ref.current);
  }, [onReady, html]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height: Math.round(1600 * scale), overflow: 'hidden' }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};
