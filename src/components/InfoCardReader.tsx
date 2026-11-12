import type { Lang } from '../lib/explorer';
import { useId, useRef, useState, type ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
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
  navigation?: ReactNode;
  infoUrl?: string;
  infoStatus: CardImageStatus;
  onInfo: () => void;
  onExpand: (information: boolean) => void;
};

/** Mobile device only. Expanding exits pagination and opens the untouched portrait card.
 * Parent keys this component by bird ID so navigation always starts at artwork on a new bird.
 */
export function MobileCardPages({ id, name, lang, artwork, navigation, infoUrl, infoStatus, onInfo, onExpand }: Props) {
  const pages = mobileCardPages(id);
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const page = pages[index];
  const t = (zh: string, en: string) => lang === 'en' ? en : zh;
  const select = (next: number) => {
    setIndex(next);
    if (next > 0) onInfo();
  };
  const advance = () => select((index + 1) % pages.length);
  return <div data-mobile-card-pages className="md:hidden absolute inset-0 text-amber-100 select-none"
    tabIndex={0} role="region" aria-label={t('圖卡：點一下換頁，亦可左右掃', 'Card: tap to change section or swipe left or right')}
    onKeyDown={e => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); e.stopPropagation(); advance();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); e.stopPropagation();
        select(nextMobileCardPage(index, e.key === 'ArrowRight' ? 1 : -1, pages.length));
      }
    }}
    onClick={e => {
      e.stopPropagation();
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea') || Date.now() < suppressClickUntil.current) return;
      advance();
    }}
    onTouchStart={e => {
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
      const p = e.touches[0]; touch.current = { x: p.clientX, y: p.clientY };
      suppressClickUntil.current = 0;
    }}
    onTouchCancel={() => { touch.current = null; suppressClickUntil.current = Date.now() + 500; }}
    onTouchEnd={e => {
      const start = touch.current;
      touch.current = null;
      if (!start) return;
      const end = e.changedTouches[0];
      const dx = end.clientX - start.x;
      const dy = end.clientY - start.y;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) suppressClickUntil.current = Date.now() + 500;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        select(nextMobileCardPage(index, dx < 0 ? 1 : -1, pages.length));
      }
    }}>
    <div id={`mobile-card-panel-${id}`} role="group" aria-label={t(page.zh, page.en)} data-card-page={page.key}
      className="absolute inset-0 overflow-hidden touch-pan-y">
      {index === 0 ? artwork : infoUrl && infoStatus === 'loaded' ? (
        page.key === 'scores' ? <InfoCardScores id={id} lang={lang} compact /> :
        page.key === 'original' ? <OriginalInfoCard url={infoUrl} name={name} lang={lang} fitted /> :
        <CardPanel url={infoUrl} box={SLIM_PAGE_BOXES[page.key as keyof typeof SLIM_PAGE_BOXES]} label={t(page.zh, page.en)} />
      ) : <div className="h-full flex items-center justify-center text-sm text-center" role="status">
        {infoStatus === 'missing' || infoStatus === 'error' ? <span className="p-3">{t('暫時未能讀取圖卡，請稍後重新開啟。', 'Card unavailable. Please reopen it later.')}</span> : t('載入圖卡…', 'Loading card…')}
      </div>}
    </div>
    <span className="sr-only" aria-live="polite">{t(page.zh, page.en)}</span>
    {navigation}
    <button type="button" aria-label={t('放大完整圖卡', 'Expand full card')}
      onClick={e => { e.stopPropagation(); onExpand(index > 0); }}
      className="absolute bottom-2 right-2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20">
      <Maximize2 className="w-4 h-4" />
    </button>
  </div>;
}
