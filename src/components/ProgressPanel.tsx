// ============================================================
// AvianDex - 我的進度面板
// 顯示總收集進度、各成就解鎖狀態、最近發現
// ============================================================
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Trophy, Bird as BirdIcon, RefreshCcw, Sparkles } from 'lucide-react';
import { Bird } from '../types';
import { MILESTONES } from './AchievementToast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  birds: Bird[];
  onPick?: (index: number) => void;
}

const STORAGE_KEY = 'aviandex_unlocked_milestones';

function loadUnlocked(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveUnlocked(list: number[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

export const ProgressPanel: React.FC<Props> = ({ isOpen, onClose, birds, onPick }) => {
  const [unlocked, setUnlocked] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) setUnlocked(loadUnlocked());
  }, [isOpen]);

  const discovered = useMemo(
    () => birds.filter((b) => b.name && b.name !== '???'),
    [birds],
  );
  const discoveredCount = discovered.length;
  const total = birds.length;
  const progress = total > 0 ? (discoveredCount / total) * 100 : 0;

  // 找下一個目標
  const nextMilestone = MILESTONES.find((m) => discoveredCount < m.count);

  // 最近發現的 6 隻（後段已發現的）
  const recent = useMemo(() => discovered.slice(-6).reverse(), [discovered]);

  const resetAchievements = () => {
    if (window.confirm('確定要重置所有成就嗎？（已發現的鳥種不會被清除）')) {
      saveUnlocked([]);
      setUnlocked([]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[190] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border-[5px] sm:border-[6px] border-gray-900 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden my-0 sm:my-4 max-h-[95dvh] sm:max-h-[90vh] flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #c92b0a 0%, #9a2208 50%, #6e1804 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-b from-black/50 to-black/30 border-b-[3px] border-yellow-400/30 px-4 sm:px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-900 border border-red-900" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-900 border border-red-900" />
              <Trophy className="w-7 h-7 text-yellow-300 drop-shadow" />
              <div className="flex-1">
                <p className="text-[10px] text-yellow-300 font-mono uppercase tracking-widest">
                  Trainer Profile
                </p>
                <h2 className="text-white font-black text-base sm:text-lg tracking-tight drop-shadow">
                  我的進度
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500 border-2 border-white/30 text-white flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body：黃色 LCD 內頁 */}
            <div
              className="overflow-y-auto p-4 sm:p-6 flex-1"
              style={{ background: 'linear-gradient(180deg, #fff8d6 0%, #f5e8a3 100%)' }}
            >
              {/* 統計卡片 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-5">
                <div className="bg-white/80 rounded-xl border-[3px] border-gray-900 p-3 shadow-[0_3px_0_rgba(0,0,0,0.5)]">
                  <p className="text-[10px] text-amber-700 font-mono uppercase tracking-widest">已發現</p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-900 leading-none mt-1">
                    {discoveredCount}
                  </p>
                  <p className="text-[10px] text-amber-600 font-mono">/ {total}</p>
                </div>
                <div className="bg-white/80 rounded-xl border-[3px] border-gray-900 p-3 shadow-[0_3px_0_rgba(0,0,0,0.5)]">
                  <p className="text-[10px] text-amber-700 font-mono uppercase tracking-widest">完成度</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-700 leading-none mt-1">
                    {progress.toFixed(1)}%
                  </p>
                  <div className="mt-1 h-1.5 w-full bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl border-[3px] border-gray-900 p-3 shadow-[0_3px_0_rgba(0,0,0,0.5)] col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-amber-700 font-mono uppercase tracking-widest">獎章</p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-800 leading-none mt-1">
                    {unlocked.length}
                    <span className="text-amber-600 text-base font-mono"> / {MILESTONES.length}</span>
                  </p>
                </div>
              </div>

              {/* 下個目標 */}
              {nextMilestone && (
                <div className="mb-5 p-3 sm:p-4 rounded-xl bg-amber-100/80 border-[3px] border-dashed border-amber-700/60">
                  <p className="text-[10px] text-amber-800 font-mono uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 下個目標
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${nextMilestone.color} border-[3px] border-gray-900 flex items-center justify-center shadow-md`}>
                      <span className="text-2xl">{nextMilestone.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-amber-900 text-base">{nextMilestone.title}</p>
                      <p className="text-[10px] text-amber-700 font-mono italic truncate">{nextMilestone.subtitle}</p>
                      <div className="mt-1 h-2 w-full bg-amber-200 rounded-full overflow-hidden border border-amber-700/30">
                        <div
                          className={`h-full bg-gradient-to-r ${nextMilestone.color}`}
                          style={{ width: `${(discoveredCount / nextMilestone.count) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-amber-700 font-mono mt-1 font-black">
                        還差 {nextMilestone.count - discoveredCount} 隻 → 解鎖
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 成就清單 */}
              <h3 className="text-amber-900 font-black text-sm tracking-widest mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" /> 成就獎章
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                {MILESTONES.map((m) => {
                  const got = unlocked.includes(m.count);
                  return (
                    <div
                      key={m.count}
                      className={`relative p-2 rounded-lg border-[2px] text-center transition-all ${
                        got
                          ? `bg-gradient-to-br ${m.color} border-gray-900 shadow-md`
                          : 'bg-amber-200/50 border-amber-700/30 grayscale'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1" style={{ filter: got ? 'none' : 'opacity(0.4)' }}>
                        {got ? m.emoji : '🔒'}
                      </div>
                      <p className={`font-black text-[10px] leading-tight ${got ? 'text-white drop-shadow' : 'text-amber-700/60'}`}>
                        {m.title}
                      </p>
                      <p className={`font-mono text-[9px] mt-0.5 ${got ? 'text-white/90' : 'text-amber-700/50'}`}>
                        {m.count} 隻
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* 最近發現 */}
              {recent.length > 0 && (
                <>
                  <h3 className="text-amber-900 font-black text-sm tracking-widest mb-2 flex items-center gap-2">
                    <BirdIcon className="w-4 h-4" /> 最近發現
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    {recent.map((b) => {
                      const idx = birds.findIndex((x) => x.id === b.id);
                      return (
                        <button
                          key={b.id}
                          onClick={() => {
                            if (onPick) {
                              onPick(idx);
                              onClose();
                            }
                          }}
                          className="aspect-[3/4] rounded-lg overflow-hidden border-[2px] border-gray-900 shadow-md hover:scale-105 active:scale-95 transition-transform relative group bg-amber-200"
                          title={b.name}
                        >
                          <img
                            src={b.imageUrl}
                            alt={b.name}
                            className="w-full h-full object-cover"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[9px] font-black text-center px-1 py-0.5 truncate">
                            {b.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* 重置 */}
              <div className="pt-3 border-t border-amber-700/30">
                <button
                  onClick={resetAchievements}
                  className="text-amber-700 hover:text-red-700 font-mono text-[10px] tracking-widest uppercase flex items-center gap-1"
                >
                  <RefreshCcw className="w-3 h-3" /> 重置成就記錄
                </button>
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 border-t-2 border-gray-900 shrink-0" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
