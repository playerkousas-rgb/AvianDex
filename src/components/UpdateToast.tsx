import React, { useSyncExternalStore, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, RefreshCw } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { applyUpdate, dismissUpdate, isApplying, isUpdateAvailable, subscribe } from '../lib/updateStore';

/**
 * 有新版本時的橫幅。
 *
 * 用戶的要求（原話）：「你弄好了可以有更新就即時知道我就把他加進主畫面了」。
 *
 * 所以這個元件要做三件事：
 *   1 即時知道 —— service worker 一裝好新版就顯示，不必等用戶自己發現
 *   2 由用戶決定 —— 按「立即更新」才換版，不會看到一半被踢走
 *   3 不擋路 —— 貼在頂部的一條橫幅，不彈窗、不遮住圖卡
 *
 * 為甚麼要 sticky 而不是 fixed 在底部？
 *   底部右邊已經有 3 個 AI 球、左邊 3 個工具球，再加一個會打架。
 *   頂部橫幅在手機上只佔約 44px，而且只在新版本出現時短暫存在。
 */
export const UpdateToast: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);

  const available = useSyncExternalStore(subscribe, isUpdateAvailable, isUpdateAvailable);
  const applying = useSyncExternalStore(subscribe, isApplying, isApplying);

  /* 不要一開 App 就閃出來：等 1.5 秒，讓首屏畫完才提
     （否則用戶在開機動畫期間就見到橫幅，很突兀） */
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setArmed(true), 1500);
    return () => clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {available && armed && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed top-0 inset-x-0 z-[220] px-2 pt-2 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto pointer-events-auto bg-gradient-to-r from-[#12352a] to-[#0d2818] border-2 border-emerald-400/50 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.6)] px-3 py-2 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              {applying
                ? <RefreshCw className="w-4 h-4 text-emerald-300 animate-spin" />
                : <Download className="w-4 h-4 text-emerald-300" />}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-emerald-100 font-black text-[12.5px] leading-tight truncate">
                {applying
                  ? t('更新中…', 'Updating…')
                  : t('有新版本', 'Update available')}
              </p>
              <p className="text-emerald-200/50 text-[10px] leading-tight truncate">
                {applying
                  ? t('馬上重新載入，只會用幾秒', 'Reloading in a moment')
                  : t('已下載好，按一下即換新版', 'Already downloaded — tap to switch')}
              </p>
            </div>

            <button
              type="button"
              onClick={applyUpdate}
              disabled={applying}
              className="shrink-0 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 text-emerald-950 font-black text-[11.5px] px-3 py-2 rounded-lg active:scale-95 transition-all"
            >
              {applying ? t('更新中', 'Updating') : t('立即更新', 'Update')}
            </button>

            {!applying && (
              <button
                type="button"
                onClick={dismissUpdate}
                aria-label={t('稍後', 'Later')}
                className="shrink-0 w-7 h-7 rounded-lg text-emerald-200/50 hover:text-white hover:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateToast;
