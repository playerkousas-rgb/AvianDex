import React from 'react';
import { Heart } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { useStoreSupportUrl } from '../hooks/useStoreSupport';
import { BALL_BASE, BALL_ICON, BALL_LABEL, BALL_SIZE } from './ballStyles';

/**
 * 「讚好／收藏」掣（readme SG18 / docs/60 —— 所有 App 必做）
 *
 * 做嘅事只有一件：開新分頁去 SCOUT APP STORE 嘅 AvianDex 詳情卡，
 * 由用家喺主站撳 ❤️／⭐，統計入 APP STORE 後台（SG10）。
 *
 * 硬規則（測試：tests/supportButton.test.mjs）
 *   ① `target="_blank" rel="noopener"`，常駐、非阻塞（唔彈窗、唔倒數、唔遮內容）
 *   ② 網址只由 ScoutStoreGate.getAppStoreUrl(APP_STORE_SLUG) 組出；
 *      helper 未載入 → **唔 render**（零死連）
 *   ③ **零新增 localStorage key**：子 App 唔記錄、唔寫入主站資料庫、
 *      唔呼叫 bump_hearts／bump_stars —— 收藏清單只存喺主站同源 localStorage
 *   ④ 中英同步、觸控 ≥40px、`@media print` 隱藏（index.css）
 *
 * 兩個版面：
 *   variant="ball"（預設）→ 側欄浮動球，48／56px
 *   variant="row"        → 詳細資料頁嘅一行文字掣（同「觀鳥禮儀／裝備」同一排）
 */

interface Props {
  lang: Lang;
  /** 有 modal 打開時隱藏，避免疊在上面（同其他球一致） */
  hidden?: boolean;
  /** 由 SideToolBalls 決定動畫次序 */
  index?: number;
  /** 桌面 hover 標籤方向（左排用左邊） */
  side?: 'left' | 'right';
  variant?: 'ball' | 'row';
}

export const LikeSaveButton: React.FC<Props> = ({
  lang, hidden, index = 0, side = 'left', variant = 'ball',
}) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const url = useStoreSupportUrl();
  const label = t('讚好／收藏', 'Like / Save');

  /* helper 未載入 ＝ 唔 render（SG18 ③ fail-safe，寧願唔見都不出死連） */
  if (hidden || !url) return null;

  const aria = t(
    '去 SCOUT APP STORE 讚好或收藏 AvianDex（開新分頁）',
    'Like or save AvianDex on SCOUT APP STORE (opens a new tab)',
  );

  if (variant === 'row') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener"
        title={aria}
        aria-label={aria}
        data-store-support="like-save"
        className="min-h-10 flex items-center justify-center gap-1.5 bg-rose-900/45 hover:bg-rose-800/65 border border-rose-400/30 text-white/85 font-bold py-2.5 rounded-lg text-[11.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
      >
        <Heart className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true" />
        {label}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      title={label}
      aria-label={aria}
      data-store-support="like-save"
      className={`${BALL_BASE} ${BALL_SIZE} bg-gradient-to-br from-rose-300 to-rose-700 text-white`}
      style={{ animationDelay: `${0.04 * index}s` }}
    >
      <Heart
        className={`${BALL_ICON} drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]`}
        strokeWidth={2.6}
        fill="currentColor"
      />
      <span className={BALL_LABEL(side)}>{label}</span>
    </a>
  );
};

export default LikeSaveButton;
