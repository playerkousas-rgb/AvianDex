import React from 'react';

/**
 * 精靈球圖示（App 右邊球 + 圖鑑機頂部都用這一個）。
 *
 * 用戶 2026-11-12：「右下的精靈球弄不乾淨」。舊版的毛病：
 *   · 圓比按鈕小，邊緣露出一圈白底；
 *   · 用漸變 + 一塊半透明高光，在小尺寸下變成髒髒的污點；
 *   · 右上角的綠色 GO 角標被 overflow-hidden 切成一小片綠邊。
 * 現在：純平塗、單一描邊寬度、圓填滿整個 viewBox、無角標、無高光。
 */
export const PokeballIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <defs>
      <clipPath id="pkb-clip"><circle cx="50" cy="50" r="50" /></clipPath>
    </defs>
    <g clipPath="url(#pkb-clip)">
      <rect width="100" height="100" fill="#fff" />
      <rect width="100" height="50" fill="#e63b2e" />
      <rect y="44" width="100" height="12" fill="#1a1a1a" />
    </g>
    <circle cx="50" cy="50" r="17" fill="#1a1a1a" />
    <circle cx="50" cy="50" r="10.5" fill="#fff" />
    <circle cx="50" cy="50" r="48" fill="none" stroke="#1a1a1a" strokeWidth="4" />
  </svg>
);

export default PokeballIcon;
