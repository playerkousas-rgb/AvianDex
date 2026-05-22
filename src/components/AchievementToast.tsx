// ============================================================
// AvianDex - 成就徽章浮窗
// 當已發現鳥種數量首次達到 milestone 時，自動跳出徽章獎勵
// 使用 localStorage 記錄「已領取過」的徽章，避免重複跳出
// ============================================================
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, X } from 'lucide-react';

// 成就階梯（可隨意調整）
export const MILESTONES = [
  { count: 1,    title: '初次相遇',    subtitle: 'First Encounter',     emoji: '🐣', color: 'from-emerald-400 to-emerald-700' },
  { count: 10,   title: '見習觀鳥員',  subtitle: 'Novice Birder',       emoji: '🔍', color: 'from-cyan-400 to-cyan-700' },
  { count: 50,   title: '社區巡守員',  subtitle: 'Neighborhood Patrol', emoji: '🏘️', color: 'from-blue-400 to-blue-700' },
  { count: 100,  title: '鳥類達人',    subtitle: 'Bird Expert',         emoji: '🎖️', color: 'from-violet-400 to-violet-700' },
  { count: 250,  title: '香港百鳥圖',  subtitle: 'HK Avian Master',     emoji: '🏆', color: 'from-amber-400 to-amber-700' },
  { count: 500,  title: '生態學者',    subtitle: 'Ecologist',           emoji: '📚', color: 'from-rose-400 to-rose-700' },
  { count: 1000, title: '飛羽傳奇',    subtitle: 'Avian Legend',        emoji: '👑', color: 'from-fuchsia-400 to-fuchsia-700' },
  { count: 1500, title: '完美圖鑑',    subtitle: 'Perfect Dex',         emoji: '✨', color: 'from-yellow-300 to-yellow-600' },
];

const STORAGE_KEY = 'aviandex_unlocked_milestones';

function loadUnlocked(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveUnlocked(list: number[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

interface Props {
  /** 當前已發現鳥種數量 */
  discoveredCount: number;
}

export const AchievementToast: React.FC<Props> = ({ discoveredCount }) => {
  const [queue, setQueue] = useState<typeof MILESTONES>([]);
  const [current, setCurrent] = useState<typeof MILESTONES[0] | null>(null);

  // 偵測新解鎖
  useEffect(() => {
    if (discoveredCount <= 0) return;
    const unlocked = loadUnlocked();
    const newly = MILESTONES.filter(
      (m) => discoveredCount >= m.count && !unlocked.includes(m.count),
    );
    if (newly.length > 0) {
      setQueue((q) => [...q, ...newly]);
      saveUnlocked([...unlocked, ...newly.map((m) => m.count)]);
    }
  }, [discoveredCount]);

  // 從佇列取出顯示
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  // 自動關閉
  useEffect(() => {
    if (current) {
      const t = setTimeout(() => setCurrent(null), 5500);
      return () => clearTimeout(t);
    }
  }, [current]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.count}
          initial={{ opacity: 0, y: -80, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] w-[92vw] max-w-md"
        >
          {/* 外框 - 金色獎章質感 */}
          <div className="relative bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 rounded-2xl border-[5px] border-gray-900 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(250,204,21,0.4)] overflow-hidden">
            {/* 閃光動畫 */}
            <motion.div
              className="absolute -inset-x-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              animate={{ x: ['0%', '400%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />

            {/* 關閉鈕 */}
            <button
              onClick={() => setCurrent(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-4 sm:p-5 flex items-center gap-4 relative">
              {/* 徽章圖示 */}
              <div className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${current.color} border-[4px] border-gray-900 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_0_rgba(0,0,0,0.5)] flex items-center justify-center`}>
                {/* 旋轉星星 */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 text-yellow-200" fill="currentColor" />
                  <Sparkles className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-3 h-3 text-yellow-200" fill="currentColor" />
                </motion.div>
                {/* Emoji */}
                <span className="text-4xl sm:text-5xl drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
                  {current.emoji}
                </span>
                {/* 光暈 */}
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
              </div>

              {/* 文字 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-3 h-3 text-red-900" />
                  <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] text-red-900 font-black">
                    ACHIEVEMENT UNLOCKED
                  </p>
                </div>
                <h3 className="font-black text-xl sm:text-2xl text-gray-900 tracking-tight leading-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                  {current.title}
                </h3>
                <p className="font-mono text-[10px] sm:text-xs text-red-900/80 italic">
                  {current.subtitle}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 bg-black/30 text-yellow-200 px-2 py-0.5 rounded-full">
                  <span className="text-[10px] font-mono">已發現</span>
                  <span className="text-sm font-black">{current.count}</span>
                  <span className="text-[10px] font-mono">種</span>
                </div>
              </div>
            </div>

            {/* 底部色條 */}
            <div className={`h-2 bg-gradient-to-r ${current.color}`} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
