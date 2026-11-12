import type { Lang } from '../lib/explorer';
import { infoCardLayout } from '../lib/infoCards';
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
export function InfoCardScores({ id, lang }: { id: string; lang: Lang }) {
  const sc = scores[id];
  if (!sc) return null;
  const t = (zh: string, en: string) => lang === 'en' ? en : zh;
  const value = (n: number | null | undefined) => n == null ? t('待查', 'Pending') : n.toFixed(1);
  return (
    <section aria-label={t('圖鑑評分', 'Dex scores')} className="border border-[#debc70]/60 rounded-xl bg-[#102c3d] text-[#fff0c2] p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold">{t('能力值', 'Dex scores')}</h3>
        <p className="text-sm">{t('總分', 'Overall')} <strong className="text-3xl tabular-nums">{value(sc.o)}</strong><span> / 5</span></p>
      </div>
      <svg viewBox="0 0 320 270" className="block w-full" role="img" aria-label={t('五項能力值雷達圖，數值詳列於下方', 'Five-axis radar chart; all values listed below')}>
        {[1, 2, 3, 4, 5].map(level => <polygon key={level} points={polygon(AXES.map(() => level * 16))} fill="none" stroke="#debc70" strokeOpacity={level === 5 ? .8 : .25} />)}
        {AXES.map(([key], i) => <line key={key} x1={160} y1={134} x2={point(i, 80)[0]} y2={point(i, 80)[1]} stroke="#debc70" strokeOpacity=".3" />)}
        <polygon points={polygon(AXES.map(([key]) => Math.max(0, Math.min(5, sc[key] ?? 0)) * 16))} fill="#ffce5a" fillOpacity=".45" stroke="#ffe282" strokeWidth="2" />
        {AXES.map(([key, zh, en], i) => {
          const [x, y] = point(i, 119);
          return <text key={key} x={x} y={y - 3} textAnchor="middle" fill="#fff0c2" fontSize={lang === 'en' ? 12 : 15} fontWeight="700">
            <tspan x={x}>{t(zh, en)}</tspan><tspan x={x} dy="22" fontSize="20">{value(sc[key])}</tspan>
          </text>;
        })}
      </svg>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {AXES.map(([key, zh, en]) => <div key={key} className="flex justify-between gap-2 rounded bg-white/5 px-2 py-1.5"><dt>{t(zh, en)}</dt><dd className="font-bold tabular-nums">{value(sc[key])}</dd></div>)}
      </dl>
      <p className="mt-3 text-xs text-amber-100/65">{t('圖鑑自訂指標，非學術評分；缺資料不補分。', 'Custom dex indicators, not academic ratings. Missing values are not estimated.')}</p>
    </section>
  );
}

/** Coordinates refer ONLY to the compose-card.py slim template (1024 × 1536).
 * Explicit layout metadata prevents legacy full cards from being sliced incorrectly.
 * The original URL remains the download target; these are display-only viewports.
 */
function CardPanel({ url, box, label }: { url: string; box: [number, number, number, number]; label: string }) {
  return <svg viewBox={box.join(' ')} className="block w-full h-auto" role="img" aria-label={label}>
    <image href={url} width="1024" height="1536" />
  </svg>;
}

export function InfoCardReader({ id, url, name, lang }: { id: string; url: string; name: string; lang: Lang }) {
  const t = (zh: string, en: string) => lang === 'en' ? en : zh;
  return <div data-info-reader className="w-full min-w-0 bg-[#0c202b] text-white cursor-auto" onClick={e => e.stopPropagation()}>
    <p className="px-3 py-2 text-xs text-amber-100/75">{t('向下滑動看完整資料 · 下載保留原裝直向圖卡', 'Scroll for all details · Downloads keep the original portrait card')}</p>
    {infoCardLayout(id) === 'slim' ? <div className="space-y-3 p-2">
      <div className="grid grid-cols-[1fr_1.7fr] items-center gap-2">
        <CardPanel url={url} box={[36, 36, 320, 380]} label={t(`${name} 像素圖與保育級別`, `${name}: pixel art and conservation status`)} />
        <CardPanel url={url} box={[372, 36, 616, 380]} label={t('分類階層', 'Taxonomy')} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <CardPanel url={url} box={[36, 432, 476, 228]} label={t('頭部與羽色', 'Head and plumage')} />
        <CardPanel url={url} box={[512, 432, 476, 228]} label={t('翼部與腳部', 'Wings and feet')} />
      </div>
      <InfoCardScores id={id} lang={lang} />
      <CardPanel url={url} box={[36, 1186, 504, 314]} label={t('分佈圖', 'Distribution')} />
      <CardPanel url={url} box={[556, 1186, 432, 314]} label={t('相似鳥', 'Similar species')} />
    </div> : <>
      <img src={url} alt={t(`${name} 資訊圖卡`, `${name} info card`)} referrerPolicy="no-referrer" className="block w-full h-auto" />
      <div className="p-2"><InfoCardScores id={id} lang={lang} /></div>
    </>}
  </div>;
}
