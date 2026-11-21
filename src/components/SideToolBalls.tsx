import React from 'react';
import { motion } from 'framer-motion';
import { Footprints, Backpack, MapPin, Binoculars } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import type { GuideKind } from './FieldGuideModal';
import { BALL_BASE, BALL_SIZE, BALL_ICON, BALL_RAIL, BALL_LABEL } from './ballStyles';
import { LikeSaveButton } from './LikeSaveButton';
import { ReportBugButton } from './ReportBugButton';
import { toolBallsFor, type ToolBallId, type ToolBallSide } from '../config';
import { BIRD_CAPTURE_APP_URL } from '../config';

/**
 * 左右兩排球 —— 每邊 3 粒，次序由 `src/config.ts` 的 TOOL_BALLS 決定
 * （只准喺嗰度改次序，唔准喺元件內各自排序）。
 *
 *   左：讚好／收藏（去 APP STORE 詳情卡，readme SG18）・觀鳥禮儀・觀鳥裝備
 *   右：觀鳥地圖・回報問題（Scout Admin 統一回報）・前往 BIRD-DEX 3 拍鳥
 *
 * 用戶 2026-11-21 定案：「讚好／收藏」放左、「回報」放右——兩邊對稱兼就手。
 * 兩個新掣都係常駐、非阻塞（唔彈窗、唔倒數）；未準備好就唔 render（零死連）。
 */

interface Props {
  lang: Lang;
  onGuide: (kind: GuideKind) => void;
  onOpenMap: () => void;
  /** 有 modal 打開時隱藏，避免疊在上面 */
  hidden?: boolean;
}

/** 細工具球（純圖示）—— 尺寸／邊框跟 ballStyles 唯一來源 */
const iconButton = (
  { key, label, Icon, cls, onClick }: {
    key: string;
    label: string;
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    cls: string;
    onClick: () => void;
  },
  i: number,
  side: ToolBallSide,
) => (
  <motion.button
    key={key}
    initial={{ opacity: 0, x: side === 'left' ? -24 : 24 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.04 * i, type: 'spring', stiffness: 260, damping: 22 }}
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`${BALL_BASE} ${BALL_SIZE} ${cls}`}
  >
    <Icon className={BALL_ICON} strokeWidth={2.6} />
    <span className={BALL_LABEL(side)}>{label}</span>
  </motion.button>
);

/** 一格：可以係上面嘅細工具球，或者自帶邏輯嘅 App/收集掣 */
function renderBall(id: ToolBallId, i: number, side: ToolBallSide, lang: Lang, ctx: {
  onGuide: (k: GuideKind) => void; onOpenMap: () => void;
}): React.ReactNode {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  switch (id) {
    case 'like':
      return <LikeSaveButton key={id} lang={lang} index={i} side={side} />;
    case 'report':
      return <ReportBugButton key={id} lang={lang} index={i} side={side} />;
    case 'map':
      return iconButton(
        {
          key: 'map',
          label: t('觀鳥地圖', 'Map'),
          Icon: MapPin,
          cls: 'bg-gradient-to-br from-emerald-300 to-emerald-700 text-white',
          onClick: ctx.onOpenMap,
        }, i, side);
    case 'etiquette':
      return iconButton(
        {
          key: 'etiquette',
          label: t('觀鳥禮儀', 'Etiquette'),
          Icon: Footprints,
          cls: 'bg-gradient-to-br from-sky-300 to-sky-700 text-white',
          onClick: () => ctx.onGuide('etiquette'),
        }, i, side);
    case 'gear':
      return iconButton(
        {
          key: 'gear',
          label: t('觀鳥裝備', 'Gear'),
          Icon: Backpack,
          cls: 'bg-gradient-to-br from-amber-300 to-amber-700 text-white',
          onClick: () => ctx.onGuide('gear'),
        }, i, side);
    case 'birddex3':
      return (
        <motion.a
          key="birddex3"
          href={BIRD_CAPTURE_APP_URL}
          target="_blank"
          rel="noopener"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 * i, type: 'spring', stiffness: 260, damping: 22 }}
          title={t('前往 BIRD-DEX 3 拍鳥', 'Open BIRD-DEX 3 to photograph birds')}
          aria-label={t('前往 BIRD-DEX 3 拍鳥', 'Open BIRD-DEX 3 to photograph birds')}
          className={`${BALL_BASE} ${BALL_SIZE} bg-gradient-to-br from-[#f6e5bf] to-[#c9b278] text-[#263528] group`}
        >
          <Binoculars className={BALL_ICON} strokeWidth={2.4} aria-hidden="true" />
          <span className={`${BALL_LABEL('right')} group-focus-visible:opacity-100`}>
            {t('BIRD-DEX 3', 'BIRD-DEX 3')}
          </span>
        </motion.a>
      );
    default:
      return null;
  }
}

export const SideToolBalls: React.FC<Props> = ({ lang, onGuide, onOpenMap, hidden }) => {
  if (hidden) return null;
  const ctx = { onGuide, onOpenMap };
  const left = toolBallsFor('left');
  const right = toolBallsFor('right');

  return (
    <>
      <div className={`${BALL_RAIL} left-2 sm:left-4`}>
        {left.map((id, i) => renderBall(id, i, 'left', lang, ctx))}
      </div>
      <div className={`${BALL_RAIL} right-2 sm:right-4`}>
        {right.map((id, i) => renderBall(id, i, 'right', lang, ctx))}
      </div>
    </>
  );
};

export default SideToolBalls;
