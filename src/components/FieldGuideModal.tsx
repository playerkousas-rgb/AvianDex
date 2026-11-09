import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Footprints, Backpack, ExternalLink, ShieldCheck } from 'lucide-react';
import { guideFor } from '../data/fieldGuide';
import type { Lang } from '../lib/explorer';

export type GuideKind = 'etiquette' | 'gear';

interface FieldGuideModalProps {
  open: boolean;
  kind: GuideKind;
  lang: Lang;
  onClose: () => void;
  onSwitchKind?: (kind: GuideKind) => void;
}

/**
 * 觀鳥禮儀 / 觀鳥裝備 兩頁。
 * 內容是「通用知識」（src/data/fieldGuide.ts），不是某一隻雀的資料，
 * 所以用同一個 modal 切 tab，唔需要每張卡各寫一份。
 */
export const FieldGuideModal: React.FC<FieldGuideModalProps> = ({
  open,
  kind,
  lang,
  onClose,
  onSwitchKind,
}) => {
  /* 哪一頁由父層（App 的 guideKind）決定，唔在 modal 內另存一份 state，
     否則「外部撳裝備、modal 仍停禮儀」這類不同步就會出現。 */
  const tab: GuideKind = kind;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const guide = guideFor(tab, lang);
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 24, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#1a1814] border-[5px] border-gray-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="bg-gradient-to-b from-[#c92b0a] to-[#8a1e06] border-b-4 border-black px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/40 border-2 border-yellow-400/40 flex items-center justify-center shrink-0">
                {tab === 'etiquette' ? (
                  <Footprints className="w-5 h-5 text-yellow-300" />
                ) : (
                  <Backpack className="w-5 h-5 text-yellow-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white font-black text-lg leading-tight truncate">{guide.title}</h2>
                <p className="text-yellow-200/70 text-[10px] truncate">{guide.subtitle}</p>
              </div>
              <button
                onClick={onClose}
                aria-label={t('關閉', 'Close')}
                className="w-9 h-9 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center active:scale-90 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b-2 border-black/60 bg-black/30">
              {([
                { key: 'etiquette' as const, zh: '觀鳥禮儀', en: 'Etiquette', Icon: Footprints },
                { key: 'gear' as const, zh: '觀鳥裝備', en: 'Gear', Icon: Backpack },
              ]).map(({ key, zh, en, Icon }) => (
                <button
                  key={key}
                  onClick={() => { onSwitchKind?.(key); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-black text-xs tracking-wider transition-colors ${
                    tab === key ? 'bg-yellow-400 text-gray-900' : 'text-yellow-200/70 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {lang === 'en' ? en : zh}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {guide.sections.map((sec) => (
                <section key={sec.id} className="bg-black/35 border border-amber-500/20 rounded-xl p-3.5">
                  <h3 className="text-yellow-300 font-black text-sm tracking-wide">{sec.title}</h3>
                  <p className="text-amber-100/60 text-[11px] italic mb-2">{sec.lead}</p>
                  <div className="space-y-2">
                    {sec.items.map((it) => (
                      <div key={it.title} className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                        <p className="text-white font-bold text-[12px] leading-snug">{it.title}</p>
                        <p className="text-white/65 text-[11.5px] leading-relaxed mt-0.5">{it.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              <section className="bg-emerald-950/40 border border-emerald-500/25 rounded-xl p-3.5">
                <h3 className="text-emerald-300 font-black text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> {t('官方資料', 'Official sources')}
                </h3>
                <div className="mt-2 flex flex-col gap-1.5">
                  {guide.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-2 text-[11.5px] text-emerald-200/90 hover:text-white bg-black/30 rounded-lg px-2.5 py-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold">{l.label}</span>
                      <span className="text-white/35 truncate">· {l.note}</span>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
