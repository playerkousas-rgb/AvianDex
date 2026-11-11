import React, { useEffect, useState } from 'react';
import { Download, Share, Plus, Smartphone, X } from 'lucide-react';
import type { Lang } from '../lib/explorer';

/**
 * 頂部橫條：語言切換 + 「加入主畫面」。
 *
 * ── 為甚麼「加入主畫面」由右下角搬到最上方？（用戶第 2 點）──
 *   原本安裝提示是一個浮動小球，用 translateY(-190px) 硬浮在**右邊**那排球上方。
 *   結果：左邊 3 個球、右邊 3 個球 + 1 個安裝球 = 視覺上一邊重一邊輕，
 *   而且那個 translateY 是魔法數字，換螢幕尺寸就會飄到怪位置。
 *   搬到頂欄之後，左右兩排球回到嚴格對稱（3 : 3）。
 *
 * ── 為甚麼仍然不是自動彈窗？──
 *   用戶原本的要求是「不要靜靜自動換版」，同一原則適用於安裝提示：
 *   頂欄一個細按鈕，用戶想裝才按。按下去才展開圖文步驟。
 *
 * 三種情況（與之前一致，只是換了位置）：
 *   1 Android/Chrome  beforeinstallprompt → 一按即裝
 *   2 iOS Safari      冇 API → 圖文步驟（分享 → 加入主畫面）
 *   3 已安裝 / standalone 模式 → 完全不顯示
 */

type BipEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: string }> };

const SNOOZE_KEY = 'aviandex:install-snooze';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export const TopBar: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const [bip, setBip] = useState<BipEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [snoozed, setSnoozed] = useState(true);

  useEffect(() => {
    /* 已用主畫面模式開 → 不用再提。推去下一個 task 才 setState，
       避免 effect 內同步 setState 觸發連鎖 render（react-hooks/set-state-in-effect）。 */
    const init = setTimeout(() => {
      if (isStandalone()) { setInstalled(true); return; }
      try {
        const at = Number(localStorage.getItem(SNOOZE_KEY) || 0);
        setSnoozed(Date.now() - at < SNOOZE_MS);
      } catch { setSnoozed(false); }
    }, 0);

    const onBip = (e: Event) => { e.preventDefault(); setBip(e as BipEvent); };
    const onInstalled = () => { setInstalled(true); setOpen(false); };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      clearTimeout(init);
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const snooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now())); } catch { /* 私密模式無 localStorage */ }
    setOpen(false);
    setSnoozed(true);
  };

  const install = async () => {
    if (!bip) { setOpen(true); return; }
    await bip.prompt();
    const choice = await bip.userChoice;
    if (choice?.outcome === 'accepted') setInstalled(true);
    setBip(null);
    setOpen(false);
  };

  /* 已安裝或 14 日內按過「唔駛」→ 頂欄只留語言，不加安裝鍵 */
  const showInstall = !installed && !snoozed;

  return (
    <>
      <div className="flex items-center gap-1.5">
        {showInstall && (
          <button
            type="button"
            onClick={install}
            title={t('加入主畫面', 'Add to home screen')}
            aria-label={t('加入主畫面', 'Add to home screen')}
            className="relative flex items-center gap-1.5 rounded-full border-2 border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-black text-cyan-100 hover:bg-cyan-500/25 active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2.6} />
            <span className="hidden sm:inline">{t('加入主畫面', 'Install')}</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[210] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm bg-[#1b1a17] border-[4px] border-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('加入主畫面', 'Add to home screen')}
          >
            <div className="bg-gradient-to-b from-[#1f3d2b] to-[#122318] px-4 py-3 flex items-center gap-2 border-b border-yellow-400/25">
              <Smartphone className="w-5 h-5 text-yellow-300 shrink-0" />
              <h2 className="text-white font-black text-sm flex-1">{t('加入主畫面', 'Add to home screen')}</h2>
              <button onClick={() => setOpen(false)} aria-label={t('關閉', 'Close')} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-white/65 text-[12px] leading-relaxed">
                {t(
                  '加到主畫面之後，一打開就是全螢幕圖鑑（沒有網址欄），而且有新版會提示你更新。',
                  'Installed, it opens full-screen like an app — and new versions are offered, never swapped silently.',
                )}
              </p>

              {bip ? (
                <button
                  type="button"
                  onClick={install}
                  className="w-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-gray-900 font-black py-3 rounded-xl border-2 border-yellow-700 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('立即安裝', 'Install now')}
                </button>
              ) : (
                <ol className="space-y-2">
                  <li className="flex items-start gap-2 bg-black/30 rounded-lg p-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/25 text-cyan-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span className="text-white/70 text-[11.5px] leading-snug flex-1">
                      {t('撳瀏覽器的分享圖示', 'Tap the browser Share icon')}
                    </span>
                    <Share className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  </li>
                  <li className="flex items-start gap-2 bg-black/30 rounded-lg p-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/25 text-cyan-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span className="text-white/70 text-[11.5px] leading-snug flex-1">
                      {t('揀「加入主畫面」', 'Choose “Add to Home Screen”')}
                    </span>
                    <Plus className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  </li>
                </ol>
              )}

              <button onClick={snooze} className="w-full text-white/35 hover:text-white/60 text-[10.5px] py-1">
                {t('暫時不用（14 日後再提）', 'Not now (remind me in 14 days)')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
