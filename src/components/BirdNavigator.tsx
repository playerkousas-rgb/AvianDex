import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lang } from '../lib/explorer';

/** Species navigation is shared by Basics, Details and Research, not tied to a tab. */
export function BirdNavigator({ lang, id, name, index, total, onPrevious, onNext, overlay = false }: {
  lang: Lang; id: string; name: string; index: number; total: number;
  onPrevious: () => void; onNext: () => void; overlay?: boolean;
}) {
  const t = (zh: string, en: string) => lang === 'en' ? en : zh;
  if (overlay) return <nav data-mobile-bird-navigation aria-label={t('切換鳥種', 'Browse birds')}
    className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none">
    <button type="button" aria-label={t('上一隻鳥', 'Previous bird')} disabled={index <= 0}
      onClick={e => { e.stopPropagation(); onPrevious(); }}
      className="pointer-events-auto w-10 h-10 rounded-full bg-white/35 text-black/80 backdrop-blur-sm border border-white/30 shadow-sm flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed">
      <ChevronLeft className="w-5 h-5" />
    </button>
    <button type="button" aria-label={t('下一隻鳥', 'Next bird')} disabled={index >= total - 1}
      onClick={e => { e.stopPropagation(); onNext(); }}
      className="pointer-events-auto w-10 h-10 rounded-full bg-white/35 text-black/80 backdrop-blur-sm border border-white/30 shadow-sm flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed">
      <ChevronRight className="w-5 h-5" />
    </button>
  </nav>;
  return <nav aria-label={t('切換鳥種', 'Browse birds')} className="flex items-center justify-between gap-2 rounded-lg bg-black/35 border border-white/15 px-1 py-1">
    <button type="button" aria-label={t('上一隻鳥', 'Previous bird')} disabled={index <= 0} onClick={onPrevious}
      className="min-w-11 h-11 flex items-center justify-center rounded-lg text-amber-200 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed">
      <ChevronLeft className="w-5 h-5" /><span className="text-[11px] font-bold">{t('上一隻', 'Prev')}</span>
    </button>
    <p className="min-w-0 text-center" aria-live="polite"><span className="block text-[10px] font-mono text-emerald-300">NO.{id}</span><span className="block truncate text-xs font-bold text-white">{name}</span></p>
    <button type="button" aria-label={t('下一隻鳥', 'Next bird')} disabled={index >= total - 1} onClick={onNext}
      className="min-w-11 h-11 flex items-center justify-center rounded-lg text-amber-200 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed">
      <span className="text-[11px] font-bold">{t('下一隻', 'Next')}</span><ChevronRight className="w-5 h-5" />
    </button>
  </nav>;
}
