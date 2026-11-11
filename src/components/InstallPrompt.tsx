import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';
import type { Lang } from '../lib/explorer';

/**
 * 「加入主畫面」提示。
 *
 * 為甚麼要做？
 *   用戶的原話：「想像 REPO 那堆 BOOK 那樣讓用戶加入主畫面，
 *   之後有更新可以一打開時就更新，那就更像一本隨身圖鑑了。」
 *
 *   這件事在技術上已經大部分做好：
 *     · public/manifest.webmanifest 已存在（standalone、icon 齊、theme 色）
 *     · public/sw.js 已有 service worker（app 外殼 network-first，
 *       即一開就抓新版；圖卡 cache-first）
 *     · src/main.tsx 已在 PROD 註冊 sw
 *   缺的只是「告訴用戶怎樣加」。iOS Safari 沒有自動安裝提示，
 *   所以要自己畫一段圖文（分享 → 加入主畫面）。
 *
 * 三種情況：
 *   1 Android/Chrome   有 beforeinstallprompt → 出「安裝」大按鈕，一按即裝
 *   2 iOS Safari       冇 API → 出圖文步驟（分享圖示 → 加入主畫面）
 *   3 已經裝了/在 standalone 模式 → 完全不顯示
 *
 * 顯示時機：右下角一個小球，按下去才展開 —— 不主動彈窗遮住圖鑑。
 * 用 localStorage 記住「已收起」，但只記 14 日，之後再提一次
 * （換手機、清了資料的情況很常見）。
 */

interface Props {
  lang: Lang;
}

type BipEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: string }> };

const SNOOZE_KEY = 'aviandex:install-snooze';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    /* iOS Safari 專用欄位 */
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
}

export const InstallPrompt: React.FC<Props> = ({ lang }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const [bip, setBip] = useState<BipEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [snoozed, setSnoozed] = useState(true);

  useEffect(() => {
    /* 已經用主畫面模式開 → 不用再提。
       用 setTimeout(0) 才 setState：effect 內同步 setState 會觸發
       連鎖 render（react-hooks/set-state-in-effect），推去下一個 task 就無問題。 */
    const init = setTimeout(() => {
      if (isStandalone()) { setInstalled(true); return; }
      /* 14 日內按過「唔駛」就暫時不提 */
      try {
        const at = Number(localStorage.getItem(SNOOZE_KEY) || 0);
        setSnoozed(Date.now() - at < SNOOZE_MS);
      } catch { setSnoozed(false); }
    }, 0);

    const onBip = (e: Event) => {
      /* 阻止預設的迷你資訊列，改用我們自己的按鈕 */
      e.preventDefault();
      setBip(e as BipEvent);
    };
    const onInstalled = () => { setInstalled(true); setOpen(false); };

    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      clearTimeout(init);
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!bip) return;
    await bip.prompt();
    const choice = await bip.userChoice;
    if (choice?.outcome === 'accepted') setInstalled(true);
    setOpen(false);
  };

  const snooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now())); } catch { /* 無痕模式 */ }
    setSnoozed(true);
    setOpen(false);
  };

  if (installed || snoozed) return null;

  return (
    <>
      {/* 右下角一個細球：跟右邊那排球同一條線，但排在最上 */}
      <button
        onClick={() => setOpen(true)}
        aria-label={t('加入主畫面', 'Add to home screen')}
        title={t('加入主畫面', 'Add to home screen')}
        className="fixed bottom-5 right-3 sm:bottom-6 sm:right-6 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-200 to-cyan-600 border-[3px] border-gray-900 shadow-[0_4px_0_rgba(0,0,0,0.6)] flex items-center justify-center active:translate-y-0.5 active:shadow-none transition-all"
        style={{ transform: 'translateY(-190px)' }}
      >
        <Download className="w-5 h-5 text-white" strokeWidth={2.6} />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#1b1a17] border-[4px] border-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-b from-[#1f3d2b] to-[#122318] px-4 py-3 flex items-center gap-2 border-b border-yellow-400/25">
                <Smartphone className="w-5 h-5 text-yellow-300 shrink-0" />
                <h2 className="text-white font-black text-sm flex-1">
                  {t('加入主畫面，當一本隨身圖鑑', 'Add to home screen')}
                </h2>
                <button onClick={() => setOpen(false)} aria-label={t('關閉', 'Close')} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-white/65 text-[12px] leading-relaxed">
                  {t(
                    '加入之後，圖鑑會像 App 一樣由主畫面直接打開（沒有網址欄），而且每次打開都會自動檢查更新 —— 換句話說，你手上永遠是最新一版。',
                    'Once installed it opens from your home screen like an app, with no address bar — and checks for updates every time you open it.',
                  )}
                </p>

                {bip ? (
                  <button
                    onClick={() => void install()}
                    className="w-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-gray-900 font-black py-3 rounded-xl border-2 border-yellow-700 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t('一按安裝', 'Install now')}
                  </button>
                ) : isIOS() ? (
                  /* iOS Safari 沒有安裝 API，只可以教用戶手動做 */
                  <ol className="space-y-2">
                    <li className="flex items-start gap-2 bg-black/30 rounded-lg p-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/25 text-cyan-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span className="text-white/70 text-[11.5px] leading-snug flex-1">
                        {t('按瀏覽器底部的「分享」圖示', 'Tap the Share icon in Safari')}
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
                    <li className="flex items-start gap-2 bg-black/30 rounded-lg p-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/25 text-cyan-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span className="text-white/70 text-[11.5px] leading-snug flex-1">
                        {t('按「加入」，之後由主畫面打開', 'Tap “Add”, then open it from the home screen')}
                      </span>
                    </li>
                  </ol>
                ) : (
                  <p className="text-white/55 text-[11.5px] leading-relaxed">
                    {t(
                      '在你的瀏覽器選單（⋮ 或 ⋯）找「安裝應用程式」或「加入主畫面」。',
                      'Look for “Install app” or “Add to Home screen” in your browser menu (⋮ or ⋯).',
                    )}
                  </p>
                )}

                <button onClick={snooze} className="w-full text-white/35 hover:text-white/60 text-[10.5px] py-1">
                  {t('暫時不要（14 日後再提）', 'Not now (ask again in 14 days)')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPrompt;
