import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ExternalLink, Utensils, Trees, MapPin, Feather,
  Baby, Lightbulb, Volume2, Footprints, Shield, Users, BookMarked, Telescope,
  Backpack, ChevronDown, ChevronUp,
} from 'lucide-react';
import { similarBirds, dietLabel, habitatLabel, ENTRIES, type Lang } from '../lib/explorer';
import type { GuideKind } from './FieldGuideModal';
import type { Bird } from '../types';
import { getOfflineBird } from '../lib/fieldPack';
import { FieldPackPanel } from './FieldPackPanel';

/**
 * 第 2 頁：詳細資料。
 *
 * 只放「文字」。外部連結（相片／聲音／影片／紀錄）全部搬去第 3 頁「科學研究中心」，
 * 唔會再同文字資料搶位置。
 *
 * 兩個原則不變：
 *  1. 中英分開兩個檔（cardDetails.zh.json / cardDetails.en.json），只在撳入這一頁時才載入。
 *  2. 英文版缺資料就印 "Data pending"，不用中文頂替、不機翻。
 */
type DetailFields = Record<string, string | string[]>;
type DetailMap = Record<string, DetailFields>;

const CACHE = new Map<Lang, Promise<DetailMap>>();

async function loadDetails(lang: Lang): Promise<DetailMap> {
  if (!CACHE.has(lang)) {
    const p = lang === 'en'
      ? import('../data/cardDetails.en.json')
      : import('../data/cardDetails.zh.json');
    CACHE.set(lang, p.then((m) => ((m as { default: { birds: DetailMap } }).default.birds)));
  }
  return CACHE.get(lang)!;
}

interface FieldDef {
  id: string;
  zh: string;
  en: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const FIELDS: FieldDef[] = [
  { id: 'look', zh: '外形特徵', en: 'Appearance', Icon: Feather },
  { id: 'diet', zh: '食物', en: 'Diet', Icon: Utensils },
  { id: 'habitat', zh: '棲息環境', en: 'Habitat', Icon: Trees },
  { id: 'range', zh: '分佈地區', en: 'Distribution', Icon: MapPin },
  { id: 'breeding', zh: '成長與繁殖', en: 'Breeding', Icon: Baby },
  { id: 'funFact', zh: '有趣冷知識', en: 'Fun Fact', Icon: Lightbulb },
  { id: 'voice', zh: '鳴聲', en: 'Voice', Icon: Volume2 },
  { id: 'behavior', zh: '行為習性', en: 'Behaviour', Icon: Footprints },
  { id: 'migration', zh: '遷徙', en: 'Migration', Icon: MapPin },
  { id: 'conservation', zh: '保育現況', en: 'Conservation', Icon: Shield },
  { id: 'humanRelation', zh: '人與鳥', en: 'Birds & People', Icon: Users },
  { id: 'etymology', zh: '名稱由來', en: 'Name Origin', Icon: BookMarked },
];

/** 一頁只顯示前 6 欄，其餘收埋，避免一路拉到尾 */
const FIRST_FIELDS = 6;

interface BirdDetailPageProps {
  bird: Bird;
  lang: Lang;
  /** 由外部（PokedexDevice）控制返回哪一頁 */
  onBack?: () => void;
  onJump: (id: string) => void;
  onOpenGuide: (kind: GuideKind) => void;
  /** 這隻雀有冇已載入／下載中的圖卡 */
  hasCard?: boolean;
  /** 通知外層「詳細資料已載入完成」（給分頁上的小點用） */
  onLoaded?: () => void;
}

export const BirdDetailPage: React.FC<BirdDetailPageProps> = ({
  bird, lang, onBack, onJump, onOpenGuide, onLoaded,
}) => {
  const [data, setData] = React.useState<DetailMap | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);

  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const PENDING = t('資料待查', 'Data pending');

  React.useEffect(() => {
    let cancelled = false;
    loadDetails(lang)
      .then((d) => {
        if (!cancelled) { setData(d); onLoaded?.(); }
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [lang, onLoaded]);

  const entry = ENTRIES[bird.id];
  const offline = React.useMemo(() => getOfflineBird(bird.id), [bird.id]);

  // 量度值（AVONET／BoW，mm／g，按用戶指示不換算）
  const [meas, setMeas] = React.useState<Record<string, string> | null>(null);
  React.useEffect(() => {
    let alive = true;
    import('../data/measurements.json')
      .then((m) => {
        if (!alive) return;
        const all = (m as { default: Record<string, Record<string, string>> }).default;
        setMeas(all[bird.id] ?? {});
      })
      .catch(() => { if (alive) setMeas(null); });
    return () => { alive = false; };
  }, [bird.id]);
  const fields = React.useMemo<DetailFields>(() => {
    if (data && data[bird.id]) return data[bird.id];
    // 冇網絡／未載入到 JSON 時，用野外離線包（已在野外下載過就一定有）
    return (offline?.t ?? {}) as DetailFields;
  }, [data, bird.id, offline]);
  const usingOffline = !data && !!offline;
  const similar = React.useMemo(() => similarBirds(bird.id, 4, lang), [bird.id, lang]);

  const zhName = bird.name;
  const enName = bird.englishName && bird.englishName !== '???' ? bird.englishName : '';
  const sciName = entry?.s || bird.scientificName || enName;
  const title = lang === 'en' ? enName || sciName : zhName;
  const subtitle = lang === 'en' ? '' : enName;
  const altNames = (entry?.n || []).filter((n) => n && n !== zhName);
  const dietTags = (entry?.d || []).map((id) => dietLabel(id, lang));
  const habTags = (entry?.h || []).map((id) => habitatLabel(id, lang));

  const visibleFields = showAll ? FIELDS : FIELDS.slice(0, FIRST_FIELDS);
  const pendingCount = FIELDS.filter(({ id }) => {
    const raw = fields[id];
    const val = Array.isArray(raw) ? raw.filter(Boolean).join('；') : raw;
    return !val || !String(val).trim();
  }).length;

  return (
    <motion.div
      key="detail-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16 }}
      className="flex flex-col gap-2.5 relative z-10 pb-8 w-full"
    >
      {/* 標題：編號 + 名稱 + 學名 + 目科 */}
      <div className="bg-[#1b1a17]/85 border border-amber-500/25 rounded-lg p-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-yellow-300/80 bg-black/50 rounded px-1.5 py-0.5">NO.{bird.id}</span>
          <h3 className="text-white font-black text-lg leading-tight">{title || PENDING}</h3>
          {subtitle && <span className="text-yellow-200/60 text-[11px]">{subtitle}</span>}
        </div>
        <p className="text-white/45 text-[10.5px] italic mt-0.5">{sciName}</p>
        {/* 台灣名錄的中文名：只作別名顯示，唔改主名。兩套叫法都通行，見得到就好。 */}
        {lang === 'zh' && altNames.length > 0 && (
          <p className="text-white/35 text-[10px] mt-0.5">
            {t('台灣名錄作', 'TW list: ')}
            <span className="text-amber-200/70">{altNames.join('、')}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {lang === 'zh' && [entry?.oz, entry?.fz].filter(Boolean).map((v) => (
            <span key={v} className="bg-emerald-500/12 border border-emerald-400/20 text-emerald-200/90 text-[10px] rounded px-1.5 py-0.5">{v}</span>
          ))}
          {bird.taxonomy?.order && (
            <span className="bg-white/5 border border-white/12 text-white/45 font-mono text-[10px] rounded px-1.5 py-0.5">{bird.taxonomy.order}</span>
          )}
          {bird.taxonomy?.family && (
            <span className="bg-white/5 border border-white/12 text-white/45 font-mono text-[10px] rounded px-1.5 py-0.5">{bird.taxonomy.family}</span>
          )}
        </div>
      </div>

      {usingOffline && (
        <p className="text-emerald-300/70 text-[10px] bg-emerald-900/20 border border-emerald-400/20 rounded px-2 py-1">
          {t('離線模式：顯示已下載的野外離線包（文字已截短）', 'Offline: showing the downloaded field pack (text is abridged)')}
        </p>
      )}

      {/* 量度值：用戶指示「不換算，直接用 mm／g」 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {[
          { k: 'wing', zh: '翼長', en: 'WING', u: 'mm' },
          { k: 'tail', zh: '尾長', en: 'TAIL', u: 'mm' },
          { k: 'tarsus', zh: '跗跖', en: 'TARSUS', u: 'mm' },
          { k: 'bill', zh: '喙長', en: 'BILL', u: 'mm' },
          { k: 'mass', zh: '體重', en: 'MASS', u: 'g' },
        ].map((row) => {
          const v = meas?.[row.k];
          const shown = v ? `${v} ${row.u}` : (row.k === 'mass' ? (fields.weight || bird.weight || '') : '');
          return (
            <div key={row.k} className="bg-black/30 border border-white/10 rounded px-2 py-1.5">
              <p className="text-white/35 text-[9px] tracking-widest">{lang === 'en' ? row.en : row.zh}</p>
              <p className={`text-[12px] font-black ${shown ? 'text-white/90' : 'text-white/25'}`}>
                {shown || PENDING}
              </p>
            </div>
          );
        })}
      </div>
      {meas?.source && (
        <p className="text-white/25 text-[9px] -mt-1">
          {t(`量度來源：${meas.source === 'AVONET' ? 'AVONET（Tobias et al. 2022）' : 'Birds of the World'}，單位 mm／g，未換算`,
            `Measurements: ${meas.source}, mm / g, not converted`)}
        </p>
      )}

      {/* 屬性標籤：唔用 emoji，用細色點 */}
      {(dietTags.length > 0 || habTags.length > 0) && (
        <div className="bg-black/25 border border-white/10 rounded-lg px-2.5 py-2">
          <p className="text-white/40 text-[9.5px] tracking-[0.14em] mb-1">
            {t('食性 · 生境', 'DIET · HABITAT')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dietTags.map((v) => (
              <span key={`d-${v}`} className="inline-flex items-center gap-1 border border-amber-300/30 text-amber-100/90 text-[10.5px] rounded px-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{v}
              </span>
            ))}
            {habTags.map((v) => (
              <span key={`h-${v}`} className="inline-flex items-center gap-1 border border-emerald-300/30 text-emerald-100/90 text-[10.5px] rounded px-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 文字欄目 */}
      {failed ? (
        <p className="text-red-200/80 text-[12px] bg-red-900/25 border border-red-500/25 rounded-lg p-3">
          {t('詳細資料載入失敗，請重新整理。', 'Could not load the details file. Please reload.')}
        </p>
      ) : !data ? (
        <div className="flex items-center gap-2 text-white/45 text-[12px] py-6 justify-center">
          <div className="w-4 h-4 border-2 border-white/20 border-t-yellow-300 rounded-full animate-spin" />
          {t('載入詳細資料…', 'Loading details…')}
        </div>
      ) : Object.keys(fields).length === 0 ? (
        <div className="bg-amber-900/20 border border-amber-500/25 rounded-lg p-3">
          <p className="text-amber-100 font-black text-[12px]">
            {t('這張卡暫時只有上面的基本資料', 'This card only has the basics for now')}
          </p>
          <p className="text-amber-100/60 text-[11px] mt-1 leading-relaxed">
            {t('未查到可靠原文，所以唔會亂填。可以去第 3 頁「科學研究中心」用 eBird／Macaulay 自己核對。',
              'No reliable source was found, so nothing is filled in. Use page 3 (Research) to check eBird / Macaulay.')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {visibleFields.map(({ id, zh, en, Icon }) => {
              const raw = fields[id];
              const val = Array.isArray(raw) ? raw.filter(Boolean).join('；') : raw;
              const missing = !val || !String(val).trim();
              return (
                <div key={id} className="bg-black/25 border border-white/8 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`w-3 h-3 ${missing ? 'text-white/20' : 'text-yellow-300/70'}`} />
                    <span className={`text-[10.5px] font-black ${missing ? 'text-white/30' : 'text-yellow-200/90'}`}>
                      {lang === 'en' ? en : zh}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-[1.6] ${missing ? 'text-white/22 italic' : 'text-white/72'}`}>
                    {missing ? PENDING : String(val)}
                  </p>
                </div>
              );
            })}
          </div>

          {FIELDS.length > FIRST_FIELDS && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="w-full flex items-center justify-center gap-1 bg-black/25 hover:bg-black/40 border border-white/10 text-white/65 text-[11px] font-bold py-2 rounded-lg"
            >
              {showAll
                ? <><ChevronUp className="w-3.5 h-3.5" />{t('收起', 'Show less')}</>
                : <><ChevronDown className="w-3.5 h-3.5" />{t(`其餘 ${FIELDS.length - FIRST_FIELDS} 欄（另有 ${pendingCount} 欄待查）`, `Show ${FIELDS.length - FIRST_FIELDS} more fields`)}</>}
            </button>
          )}
        </>
      )}

      {/* 相似鳥類 */}
      <div className="bg-black/30 border border-cyan-400/20 rounded-lg p-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Telescope className="w-3.5 h-3.5 text-cyan-300/80" />
          <h4 className="text-cyan-100/90 font-black text-[12px]">{t('相似鳥類', 'Look-alikes')}</h4>
          <span className="text-white/30 text-[9.5px]">
            {t('同科／同屬／同食物／同環境／體型接近', 'same family, genus, diet, habitat or size')}
          </span>
        </div>
        {similar.length === 0 ? (
          <p className="text-white/30 text-[11px]">{t('暫時冇足夠資料找相似鳥。', 'Not enough data yet.')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {similar.map((s) => {
              const e = ENTRIES[s.id];
              if (!e) return null;
              const nm = lang === 'en' ? e.e || e.z : e.z || e.e;
              return (
                <button
                  key={s.id}
                  onClick={() => onJump(s.id)}
                  className="text-left bg-white/5 hover:bg-cyan-500/12 border border-white/10 hover:border-cyan-300/30 rounded-md px-2 py-1.5 transition-colors"
                >
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-[9px] text-yellow-300/70">NO.{s.id}</span>
                    <span className="text-white/90 font-bold text-[11px] truncate">{nm}</span>
                  </div>
                  <p className="text-cyan-300/60 text-[9px] truncate">{s.reasons.join('・')}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 觀鳥禮儀 / 裝備 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onOpenGuide('etiquette')}
          className="flex items-center justify-center gap-1.5 bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-400/25 text-white/85 font-bold py-2.5 rounded-lg text-[11.5px]"
        >
          <Users className="w-3.5 h-3.5" /> {t('觀鳥禮儀', 'Etiquette')}
        </button>
        <button
          onClick={() => onOpenGuide('gear')}
          className="flex items-center justify-center gap-1.5 bg-amber-900/45 hover:bg-amber-800/65 border border-amber-400/25 text-white/85 font-bold py-2.5 rounded-lg text-[11.5px]"
        >
          <Backpack className="w-3.5 h-3.5" /> {t('觀鳥裝備', 'Gear')}
        </button>
      </div>

      <FieldPackPanel lang={lang} compact />

      {/* 極簡頁腳：文字來源只留一句，其餘去第 3 頁 */}
      <div className="flex items-center justify-between gap-2 text-[9.5px] text-white/30 border-t border-white/8 pt-2">
        <span>{t('文字：維基百科原文抽取（不改寫）· 分類：eBird–Clements', 'Text: Wikipedia (verbatim) · Taxonomy: eBird–Clements')}</span>
        <a
          href={`https://zh.wikipedia.org/wiki/${encodeURIComponent(zhName)}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-0.5 text-white/45 hover:text-white/80 shrink-0"
        >
          <ExternalLink className="w-2.5 h-2.5" />{t('維基', 'Wiki')}
        </a>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="w-full bg-black/30 hover:bg-black/50 border border-white/12 text-white/70 font-bold py-2.5 rounded-lg text-[11.5px] flex items-center justify-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> {t('返回基礎數據', 'Back to basics')}
        </button>
      )}
    </motion.div>
  );
};

export default BirdDetailPage;
