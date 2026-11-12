import type { Lang } from '../lib/explorer';
import { useId, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { mobileCardPages, nextMobileCardPage, SLIM_PAGE_BOXES } from '../lib/mobileInfoPages';
import type { CardImageStatus } from '../lib/cardImage';
import scoresData from '../data/dexScores.json';

const AXES = [
  ['i', '重要性', 'Importance'], ['a', '適應力', 'Adaptability'],
  ['r', '研究', 'Research'], ['c', '保育', 'Conservation'], ['v', '觀賞', 'Viewing'],
] as const;
type Scores = Partial<Record<'i' | 'a' | 'r' | 'c' | 'v' | 'o', number | null>>;
const scores = scoresData.scores as Record<string, Scores>;
const point = (i: number, radius: number) => {
  const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
  return [160 + Math.cos(angle) * radius, 134 + Math.sin(angle) * radius];
};
const polygon = (values: number[]) => values.map((v, i) => point(i, v).join(',')).join(' ');

/** Live text, not the tiny lettering baked into the downloadable image. */
export function InfoCardScores({ id, lang, compact = false }: { id: string; lang: Lang; compact?: boolean }) {
  const sc = scores[id];
  if (!sc) return null;
  const t = (zh: string, en: string) => lang === 'en' ? en : zh;
  const value = (n: number | null | undefined) => n == null ? t('待查', 'Pending') : n.toFixed(1);
  return (
    <section aria-label={t('圖鑑評分', 'Dex scores')} className={`border border-[#debc70]/60 rounded-xl bg-[#102c3d] text-[#fff0c2] ${compact ? 'h-full min-h-0 flex flex-col p-1.5' : 'p-3'}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold">{t('能力值', 'Dex scores')}</h3>
        <p className="text-sm">{t('總分', 'Overall')} <strong className="text-3xl tabular-nums">{value(sc.o)}</strong><span> / 5</span></p>
      </div>
      <svg viewBox="0 0 320 270" className={compact ? 'block w-full flex-1 min-h-0' : 'block w-full'} role="img" aria-label={compact ? t('五項能力值雷達圖', 'Five-axis radar chart') : t('五項能力值雷達圖，數值詳列於下方', 'Five-axis radar chart; all values listed below')}>
        {[1, 2, 3, 4, 5].map(level => <polygon key={level} points={polygon(AXES.map(() => level * 16))} fill="none" stroke="#debc70" strokeOpacity={level === 5 ? .8 : .25} />)}
        {AXES.map(([key], i) => <line key={key} x1={160} y1={134} x2={point(i, 80)[0]} y2={point(i, 80)[1]} stroke="#debc70" strokeOpacity=".3" />)}
        <polygon points={polygon(AXES.map(([key]) => Math.max(0, Math.min(5, sc[key] ?? 0)) * 16))} fill="#ffce5a" fillOpacity=".45" stroke="#ffe282" strokeWidth="2" />
        {AXES.map(([key, zh, en], i) => {
          const [x, y] = point(i, 119);
          return <text key={key} x={x} y={y - 3} textAnchor="middle" fill="#fff0c2" fontSize={lang === 'en' ? 13 : 18} fontWeight="700">
            <tspan x={x}>{t(zh, en)}</tspan><tspan x={x} dy="22" fontSize="24">{value(sc[key])}</tspan>
          </text>;
        })}
      </svg>
      {!compact && <dl className="grid grid-cols-2 gap-2 text-sm">
        {AXES.map(([key, zh, en]) => <div key={key} className="flex justify-between gap-2 rounded bg-white/5 px-2 py-1.5"><dt>{t(zh, en)}</dt><dd className="font-bold tabular-nums">{value(sc[key])}</dd></div>)}
      </dl>}
      <p className={`${compact ? 'text-[10px]' : 'mt-3 text-xs'} text-amber-100/65`}>{t('圖鑑自訂指標，非學術評分；缺資料不補分。', 'Custom dex indicators, not academic ratings. Missing values are not estimated.')}</p>
    </section>
  );
}


/** Original download image, never reconstructed or sliced on desktop / in fullscreen. */
export function OriginalInfoCard({ url, name, lang, fitted = false }: { url: string; name: string; lang: Lang; fitted?: boolean }) {
  return <img data-original-info-card src={url} alt={lang === 'en' ? `${name} info card` : `${name} 資訊圖卡`}
    referrerPolicy="no-referrer" className={fitted ? 'block w-full h-full object-contain' : 'block w-full h-auto'} />;
}

export function CardPanel({ url, box, label }: { url: string; box: readonly number[]; label: string }) {
  const clipId = useId();
  return <svg viewBox={box.join(' ')} className="block w-full h-full" role="img" aria-label={label}>
    {/* viewBox alone does not crop content that lands in letterboxing space. */}
    <defs><clipPath id={clipId}><rect x={box[0]} y={box[1]} width={box[2]} height={box[3]} /></clipPath></defs>
    <image href={url} width="1024" height="1536" clipPath={`url(#${clipId})`} />
  </svg>;
}

type Props = {
  id: string;
  name: string;
  lang: Lang;
  artwork: ReactNode;
  infoUrl?: string;
  infoStatus: CardImageStatus;
  onInfo: () => void;
  onExpand: (information: boolean) => void;
};

/** Mobile device only. Expanding exits pagination and opens the untouched portrait card.
 * Parent keys this component by bird ID so navigation always starts at artwork on a new bird.
 */
export function MobileCardPages({ id, name, lang, artwork, infoUrl, infoStatus, onInfo, onExpand }: Props) {
  const pages = mobileCardPages(id);
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const page = pages[index];
  const t = (zh: string, en: string) => lang === 'en' ? en : zh;
  const select = (next: number) => {
    setIndex(next);
    if (next > 0) onInfo();
  };
  return <div data-mobile-card-pages className="md:hidden absolute inset-0 flex flex-col bg-[#0c202b] text-amber-100 select-none"
    onClick={e => e.stopPropagation()}
    onTouchStart={e => { const p = e.touches[0]; touch.current = { x: p.clientX, y: p.clientY }; }}
    onTouchEnd={e => {
      const start = touch.current;
      touch.current = null;
      if (!start) return;
      const end = e.changedTouches[0];
      const dx = end.clientX - start.x;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(end.clientY - start.y) * 1.5) {
        select(nextMobileCardPage(index, dx < 0 ? 1 : -1, pages.length));
      }
    }}>
    <div className="flex items-center justify-between px-2 py-1 shrink-0 gap-2">
      <span aria-live="polite" className="text-xs font-bold">{index + 1}/{pages.length} · {t(page.zh, page.en)}</span>
      <button type="button" aria-label={t('放大完整圖卡', 'Expand full card')} onClick={() => onExpand(index > 0)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10"><Maximize2 className="w-4 h-4" /></button>
    </div>
    <div id={`mobile-card-panel-${id}`} role="tabpanel" aria-label={t(page.zh, page.en)} data-card-page={page.key}
      className="flex-1 min-h-0 relative p-1 overflow-hidden touch-pan-y">
      {index === 0 ? artwork : infoUrl && infoStatus === 'loaded' ? (
        page.key === 'scores' ? <InfoCardScores id={id} lang={lang} compact /> :
        page.key === 'original' ? <OriginalInfoCard url={infoUrl} name={name} lang={lang} fitted /> :
        <CardPanel url={infoUrl} box={SLIM_PAGE_BOXES[page.key as keyof typeof SLIM_PAGE_BOXES]} label={t(page.zh, page.en)} />
      ) : <div className="h-full flex items-center justify-center text-sm text-center" role="status">
        {infoStatus === 'missing' || infoStatus === 'error' ? <span className="p-3">{t('暫時未能讀取圖卡，請稍後重新開啟。', 'Card unavailable. Please reopen it later.')}</span> : t('載入圖卡…', 'Loading card…')}
      </div>}
    </div>
    {pages.length > 1 && <nav aria-label={t('圖卡分頁', 'Card pages')} className="flex items-center justify-between gap-1 px-1 py-1 shrink-0 border-t border-white/10">
      <button type="button" aria-label={t('上一頁圖卡', 'Previous card page')} disabled={index === 0} onClick={() => select(index - 1)} className="w-9 h-9 flex items-center justify-center disabled:opacity-25"><ChevronLeft className="w-5 h-5" /></button>
      <div role="tablist" aria-label={t('選擇圖卡頁', 'Choose card page')} className="flex flex-1 justify-center gap-1" onKeyDown={e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const next = nextMobileCardPage(index, e.key === 'ArrowRight' ? 1 : -1, pages.length);
        select(next);
        e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
      }}>
        {pages.map((p, i) => <button key={p.key} type="button" role="tab" aria-controls={`mobile-card-panel-${id}`} aria-selected={i === index}
          aria-label={t(p.zh, p.en)} tabIndex={i === index ? 0 : -1} onClick={() => select(i)}
          className={`w-8 h-9 rounded flex items-center justify-center text-xs font-bold ${i === index ? 'bg-amber-300 text-[#102c3d]' : 'bg-white/5 text-amber-100/60'}`}>{i + 1}</button>)}
      </div>
      <button type="button" aria-label={t('下一頁圖卡', 'Next card page')} disabled={index === pages.length - 1} onClick={() => select(index + 1)} className="w-9 h-9 flex items-center justify-center disabled:opacity-25"><ChevronRight className="w-5 h-5" /></button>
    </nav>}
  </div>;
}
