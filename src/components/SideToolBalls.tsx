import React from 'react';
import { motion } from 'framer-motion';
import { Footprints, Backpack } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import type { GuideKind } from './FieldGuideModal';
import { BALL_BASE, BALL_SIZE, BALL_ICON, BALL_RAIL_LEFT, BALL_LABEL } from './ballStyles';

/** 左側兩個圖鑑輔助工具球：觀鳥禮儀與觀鳥裝備。 */

interface Props {
  lang: Lang;
  onGuide: (kind: GuideKind) => void;
  /** 有 modal 打開時隱藏，避免疊在上面 */
  hidden?: boolean;
}

/* 尺寸與位置全部由 ballStyles.ts 提供 —— 左、右、安裝球三處讀同一組數值。
   之前左邊寫在這裡、右邊寫在 App.tsx，結果手機上左 44px、右 56px，
   用戶一眼就看到「兩邊功能球大小不一」。 */
const BTN = `${BALL_BASE} ${BALL_SIZE}`;

export const SideToolBalls: React.FC<Props> = ({ lang, onGuide, hidden }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);

  const items = [
    {
      key: 'etiquette',
      label: t('觀鳥禮儀', 'Etiquette'),
      Icon: Footprints,
      cls: 'bg-gradient-to-br from-sky-300 to-sky-700 text-white',
      onClick: () => onGuide('etiquette'),
    },
    {
      key: 'gear',
      label: t('觀鳥裝備', 'Gear'),
      Icon: Backpack,
      cls: 'bg-gradient-to-br from-amber-300 to-amber-700 text-white',
      onClick: () => onGuide('gear'),
    },
  ];

  if (hidden) return null;

  return (
    <div className={BALL_RAIL_LEFT}>
      {items.map(({ key, label, Icon, cls, onClick }, i) => (
        <motion.button
          key={key}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 * i, type: 'spring', stiffness: 260, damping: 22 }}
          onClick={onClick}
          title={label}
          aria-label={label}
          className={`${BTN} ${cls}`}
        >
          <Icon className={BALL_ICON} strokeWidth={2.6} />
          {/* 桌機用 hover 顯示名稱；手機不顯示（沒有 hover，也沒有空間） */}
          <span className={BALL_LABEL('left')}>{label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default SideToolBalls;
