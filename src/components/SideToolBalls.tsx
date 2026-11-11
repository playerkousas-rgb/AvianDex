import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Footprints, Backpack } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import type { GuideKind } from './FieldGuideModal';

/**
 * 左側浮動工具球（觀鳥地圖 / 觀鳥禮儀 / 觀鳥裝備 / 語言）。
 *
 * 為甚麼要搬出來做浮動球？
 *   用戶的原話：「觀鳥地圖、禮儀和裝備可以像右方那 3 個球浮在左方方便按」。
 *
 *   原本這三個功能收在手機的漢堡選單裡面 —— 要點兩下（開選單、再揀），
 *   而且選單一開就蓋住整個列表。右邊的 AI 球（聽聲／拍照／精靈球）是
 *   一按即到，同樣重要的功能卻要挖兩層，很矛盾。
 *
 *   現在左右各一排球，中間留空：
 *     左：地圖、禮儀、裝備、語言
 *     右：聽聲、拍照、前往 BIRD-DEX 2
 *   在手機上（窄螢幕）兩排球都不會蓋到卡面中間，只在邊緣。
 *
 * 為甚麼是 3 個而不是 4 個？
 *   用戶後來修正：「語言不用變成球，左 3 右 3 平均點」。
 *   所以語言只留在頂欄那個「中 | EN」開關，不佔用球的額度；
 *   左邊剛好 3 個（地圖／禮儀／裝備），右邊 3 個（聽聲／拍照／精靈球），
 *   兩邊對稱，視覺上不會一邊重一邊輕。
 */

interface Props {
  lang: Lang;
  onMap: () => void;
  onGuide: (kind: GuideKind) => void;
  /** 有 modal 打開時隱藏，避免疊在上面 */
  hidden?: boolean;
}

/* 手機 44px（手指最小舒適尺寸）；平板／桌機 52px —— 用滑鼠時 44px 仍然偏細。 */
const BTN = 'group relative w-11 h-11 md:w-[52px] md:h-[52px] lg:w-14 lg:h-14 rounded-full border-[3px] border-gray-900 flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.6)] transition-all';

export const SideToolBalls: React.FC<Props> = ({ lang, onMap, onGuide, hidden }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);

  const items = [
    {
      key: 'map',
      label: t('觀鳥地圖', 'Map'),
      Icon: MapPin,
      cls: 'bg-gradient-to-br from-emerald-300 to-emerald-700 text-white',
      onClick: onMap,
    },
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
    <div className="fixed bottom-5 left-2 sm:bottom-6 sm:left-4 z-30 flex flex-col gap-2 sm:gap-2.5">
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
          <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.6} />
          {/* 桌機用 hover 顯示名稱；手機不顯示（沒有 hover，也沒有空間） */}
          <span className="hidden md:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black/85 text-white text-[11px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default SideToolBalls;
