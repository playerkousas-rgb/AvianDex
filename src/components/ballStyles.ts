/**
 * 浮動球（左 3 / 右 3）的尺寸與位置的**唯一來源**。
 *
 * 為甚麼要抽出來？
 *   左右兩排球原本各寫各的 class：
 *     左邊（SideToolBalls）   w-11 h-11 md:w-[52px] lg:w-14   → 手機 44px
 *     右邊（App）             w-14 h-14 sm:w-16 sm:h-16      → 手機 56px
 *   用戶在預覽一眼就看出「兩邊功能球大小不一」。同一件事寫在兩個檔，
 *   就一定會走樣；所以集中到這裡，三處（左、右、安裝球）都讀同一組數值。
 *
 * 尺寸決定（同時滿足兩個約束）：
 *   · 手機手指最小舒適尺寸 44px（WCAG 2.5.5 Target Size）
 *   · 用戶原話「電腦用滑鼠（雞爪）細小目標要加大」→ 桌面 56px
 *   所以：手機 48px、桌面 56px。三排都用同一組，視覺才會齊。
 *
 * 位置也用同一組：左 right／右 right 對稱，底部間距一致，
 * 安裝球不再用 translateY(-190px) 硬浮在右排球上方（那正是「兩邊不平衡」的來源）。
 */

/** 球本體：圓形 + 深色粗邊 + 立體陰影。尺寸由 BALL_SIZE 決定。 */
export const BALL_BASE =
  'group relative rounded-full border-[3px] sm:border-[4px] border-gray-900 ' +
  'shadow-[0_5px_0_rgba(0,0,0,0.7)] active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.7)] ' +
  'transition-all flex items-center justify-center shrink-0';

/** 三排球共用的尺寸：手機 48px、sm 以上 56px */
export const BALL_SIZE = 'w-12 h-12 sm:w-14 sm:h-14';

/** 內裡的圖示：比球小一號，兩種尺寸都一致 */
export const BALL_ICON = 'w-5 h-5 sm:w-6 sm:h-6';

/** 左右兩排球的外框容器（位置對稱：left-2 / right-2） */
export const BALL_RAIL =
  'fixed bottom-5 sm:bottom-6 z-30 flex flex-col gap-2 sm:gap-2.5';

export const BALL_RAIL_LEFT = `${BALL_RAIL} left-2 sm:left-4`;
export const BALL_RAIL_RIGHT = `${BALL_RAIL} right-2 sm:right-4`;

/** 桌機 hover 才顯示的名稱標籤（手機沒有 hover，也沒有空間） */
export const BALL_LABEL = (side: 'left' | 'right') =>
  `hidden md:block absolute ${side === 'left' ? 'left-full ml-2' : 'right-full mr-2'} ` +
  'top-1/2 -translate-y-1/2 bg-black/85 text-white text-[11px] font-black px-2 py-1 rounded ' +
  'opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none';
