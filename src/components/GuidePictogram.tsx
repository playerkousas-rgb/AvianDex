import React from 'react';

/**
 * 觀鳥禮儀 / 觀鳥裝備的插圖（inline SVG，零外部依賴）。
 *
 * 為甚麼要自己畫？
 *   這兩頁原本是長篇文字（每頁 5 節、共 15–17 條），用戶的原話是
 *   「一堆字，沒有人有心機看」。改成圖示之後，每一條都見到「做緊乜」，
 *   文字退到第二層（點開才看詳細）。
 *
 * 為甚麼用 inline SVG 而不是貼圖？
 *   1. 離線包要包得住 —— 外部圖片在野外沒有網絡時會變空白。
 *   2. 同一份圖可以在 app 內任意大小縮放而不模糊。
 *   3. 顏色可以跟主題（卡片色）走，不必另存六套配色。
 *
 * 風格：粗線條、少細節、單色 fill + 一個強調色，遠看都認得出。
 */

export type GuidePictogramId =
  /* 禮儀 */
  | 'distance' | 'sound' | 'feeding' | 'nest' | 'share' | 'law'
  /* 裝備 */
  | 'binoculars' | 'scope' | 'recorder' | 'camera' | 'notebook' | 'water'
  | 'rain' | 'pack' | 'shoes' | 'hat' | 'sun' | 'care';

interface Props {
  id: GuidePictogramId;
  className?: string;
}

const C = {
  ink: '#0f172a',      // 主線
  paper: '#f7f4ea',    // 底
  accent: '#c4543c',   // 強調（同卡面 ACCENT 一致）
  gold: '#ce9820',     // 次要強調（同卡面 GOLD 一致）
  green: '#11633f',    // 自然（同 DEEP 一致）
};

/** 共用外框：圓底 + 雙圈，跟卡面的 HUD 語言一致 */
const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <circle cx="32" cy="32" r="30" fill={C.paper} stroke={C.ink} strokeWidth="2.5" />
    <circle cx="32" cy="32" r="26" fill="none" stroke={C.ink} strokeWidth="0.8" strokeOpacity="0.25" />
    {children}
  </>
);

export const GuidePictogram: React.FC<Props> = ({ id, className }) => {
  /** 只給「線條」用；有 fill 的形狀自己寫，避免 fill 重複覆蓋 */
  const line = { stroke: C.ink, strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  const body = (() => {
    switch (id) {
      /* ---------------- 禮儀 ---------------- */
      case 'distance':
        /* 望遠鏡 + 一段虛線距離：用鏡，不用腳步 */
        return (
          <>
            <rect x="12" y="27" width="13" height="9" rx="3" fill={C.ink} />
            <rect x="24" y="29" width="6" height="5" rx="1.5" fill={C.ink} />
            <circle cx="18.5" cy="31.5" r="2" fill={C.paper} />
            <path d="M31 31.5 h6" stroke={C.accent} strokeWidth="2.4" strokeDasharray="2 2.5" strokeLinecap="round" />
            <path d="M38 31.5 a4 4 0 1 1 0 0.01" fill="none" stroke={C.accent} strokeWidth="2.2" />
            <path d="M40 24 l2 -2 M44 31.5 h2.5 M40 39 l2 2" {...line} strokeWidth="1.6" />
          </>
        );
      case 'sound':
        /* 喇叭 + 斜線（不要播放叫聲引人） */
        return (
          <>
            <path d="M20 28 h5 l7 -6 v20 l-7 -6 h-5 z" fill={C.ink} />
            <path d="M36 26 a8 8 0 0 1 0 12" {...line} strokeWidth="2.2" />
            <path d="M40 22 a13 13 0 0 1 0 20" {...line} strokeWidth="2.2" strokeOpacity="0.45" />
            <path d="M16 16 L48 48" stroke={C.accent} strokeWidth="3.4" strokeLinecap="round" />
          </>
        );
      case 'feeding':
        /* 手掌 + 食物 + 禁止 */
        return (
          <>
            <path d="M22 30 q0 -3 3 -3 t3 3 v-2 q0 -3 3 -3 t3 3 v3 q0 -3 3 -3 t3 3 v9 q0 9 -9 9 t-9 -9 z" fill={C.ink} fillOpacity="0.9" />
            <circle cx="33" cy="22" r="3.2" fill={C.gold} />
            <path d="M16 16 L48 48" stroke={C.accent} strokeWidth="3.4" strokeLinecap="round" />
          </>
        );
      case 'nest':
        /* 巢 + 蛋，外面一圈「不要靠近」 */
        return (
          <>
            <path d="M19 34 q13 -7 26 0 q-3 9 -13 9 t-13 -9 z" fill={C.ink} fillOpacity="0.85" />
            <ellipse cx="27" cy="33" rx="3.4" ry="4" fill={C.paper} stroke={C.ink} strokeWidth="1.6" />
            <ellipse cx="35" cy="33" rx="3.4" ry="4" fill={C.paper} stroke={C.ink} strokeWidth="1.6" />
            <circle cx="32" cy="32" r="19" fill="none" stroke={C.accent} strokeWidth="2.2" strokeDasharray="4 3" />
          </>
        );
      case 'share':
        /* 兩個人 + 眼睛（輪流看、不要圍堵） */
        return (
          <>
            <circle cx="24" cy="24" r="5" fill={C.ink} />
            <path d="M15 44 q9 -12 18 0" fill="none" {...line} strokeWidth="2.4" />
            <circle cx="41" cy="27" r="4.2" fill={C.ink} fillOpacity="0.5" />
            <path d="M33 44 q8 -10 16 0" fill="none" {...line} strokeWidth="2.2" strokeOpacity="0.5" />
            <path d="M30 20 l2 -3 l2 3" {...line} strokeWidth="1.8" />
          </>
        );
      case 'law':
        /* 盾 + 勾（場地規定、法例） */
        return (
          <>
            <path d="M32 14 l14 5 v11 q0 12 -14 18 q-14 -6 -14 -18 v-11 z" fill={C.ink} fillOpacity="0.9" />
            <path d="M25 32 l5 5 l9 -10" fill="none" stroke={C.paper} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );

      /* ---------------- 裝備 ---------------- */
      case 'binoculars':
        return (
          <>
            <rect x="16" y="26" width="13" height="18" rx="6" fill={C.ink} />
            <rect x="35" y="26" width="13" height="18" rx="6" fill={C.ink} />
            <rect x="28" y="31" width="8" height="6" fill={C.ink} />
            <circle cx="22.5" cy="37" r="4" fill={C.paper} />
            <circle cx="41.5" cy="37" r="4" fill={C.paper} />
            <circle cx="22.5" cy="37" r="1.6" fill={C.accent} />
            <circle cx="41.5" cy="37" r="1.6" fill={C.accent} />
            <path d="M21 26 v-6 M43 26 v-6" {...line} strokeWidth="2.2" />
          </>
        );
      case 'scope':
        return (
          <>
            <rect x="14" y="28" width="26" height="9" rx="4" fill={C.ink} transform="rotate(-12 32 32)" />
            <circle cx="42" cy="26" r="5" fill={C.ink} />
            <circle cx="42" cy="26" r="2.2" fill={C.paper} />
            <path d="M28 37 l-5 11 M24 48 h10" {...line} strokeWidth="2.4" />
            <path d="M18 26 l3 3" {...line} strokeWidth="2" />
          </>
        );
      case 'recorder':
        return (
          <>
            <rect x="24" y="14" width="16" height="26" rx="8" fill={C.ink} />
            <path d="M18 32 a14 14 0 0 0 28 0" {...line} strokeWidth="2.4" />
            <path d="M32 46 v6 M25 52 h14" {...line} strokeWidth="2.4" />
            <g fill={C.gold}>
              <rect x="28" y="22" width="2" height="10" rx="1" />
              <rect x="32" y="20" width="2" height="14" rx="1" />
              <rect x="36" y="24" width="2" height="7" rx="1" />
            </g>
          </>
        );
      case 'camera':
        return (
          <>
            <rect x="14" y="24" width="36" height="24" rx="5" fill={C.ink} />
            <rect x="24" y="19" width="12" height="6" rx="2" fill={C.ink} />
            <circle cx="32" cy="36" r="8" fill={C.paper} />
            <circle cx="32" cy="36" r="4" fill={C.accent} />
            <circle cx="43" cy="29" r="1.6" fill={C.gold} />
          </>
        );
      case 'notebook':
        return (
          <>
            <rect x="18" y="15" width="28" height="34" rx="3" fill={C.paper} stroke={C.ink} strokeWidth="2.6" />
            <path d="M24 24 h16 M24 31 h16 M24 38 h10" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.55" />
            <path d="M40 34 l6 -8 l3 2 l-6 8 z" fill={C.accent} />
          </>
        );
      case 'water':
        return (
          <>
            <path d="M28 14 h8 v8 l6 22 a6 6 0 0 1 -6 8 h-8 a6 6 0 0 1 -6 -8 l6 -22 z" fill={C.ink} fillOpacity="0.9" />
            <path d="M24 34 h16 l3 11 a5 5 0 0 1 -5 6 h-12 a5 5 0 0 1 -5 -6 z" fill={C.accent} fillOpacity="0.75" />
          </>
        );
      case 'rain':
        return (
          <>
            <path d="M32 16 q10 12 10 18 a10 10 0 0 1 -20 0 q0 -6 10 -18 z" fill={C.paper} stroke={C.ink} strokeWidth="2.6" />
            <path d="M18 44 l-3 6 M32 46 l-3 6 M46 44 l-3 6" stroke={C.accent} strokeWidth="2.6" strokeLinecap="round" />
          </>
        );
      case 'pack':
        return (
          <>
            <rect x="19" y="22" width="26" height="28" rx="7" fill={C.ink} />
            <path d="M26 22 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke={C.ink} strokeWidth="2.6" />
            <rect x="24" y="32" width="16" height="9" rx="2" fill={C.paper} fillOpacity="0.85" />
            <path d="M19 40 h-4 M45 40 h4" {...line} strokeWidth="2.2" />
          </>
        );
      case 'shoes':
        return (
          <>
            <path d="M14 40 q0 -8 6 -8 h6 l6 5 h8 q8 0 8 6 v3 h-34 z" fill={C.ink} />
            <path d="M14 44 h34" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
            <path d="M22 34 l3 4 M28 34 l3 4" stroke={C.paper} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />
          </>
        );
      case 'hat':
        return (
          <>
            <path d="M22 34 q0 -14 10 -14 t10 14 z" fill={C.ink} />
            <path d="M12 34 h40 q-2 6 -12 6 h-16 q-10 0 -12 -6 z" fill={C.ink} fillOpacity="0.75" />
            <path d="M22 33 h20" stroke={C.gold} strokeWidth="2.6" strokeLinecap="round" />
          </>
        );
      case 'sun':
        return (
          <>
            <circle cx="32" cy="32" r="9" fill={C.gold} />
            <g stroke={C.ink} strokeWidth="2.4" strokeLinecap="round">
              <path d="M32 14 v-4 M32 54 v-4 M14 32 h-4 M54 32 h-4" />
              <path d="M19 19 l-3 -3 M48 48 l3 3 M45 19 l3 -3 M16 48 l-3 3" />
            </g>
          </>
        );
      case 'care':
        return (
          <>
            <circle cx="28" cy="30" r="9" fill={C.ink} />
            <circle cx="28" cy="30" r="4" fill={C.paper} />
            <path d="M35 37 l6 6 v6 h-6 z" fill={C.ink} fillOpacity="0.7" />
            <path d="M38 24 q6 2 6 8" fill="none" stroke={C.gold} strokeWidth="2.4" strokeLinecap="round" />
          </>
        );
      default:
        return <circle cx="32" cy="32" r="12" fill={C.ink} />;
    }
  })();

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-hidden="true">
      <Frame>{body}</Frame>
    </svg>
  );
};

export default GuidePictogram;
