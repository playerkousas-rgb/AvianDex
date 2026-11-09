import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ExternalLink, Utensils, Trees, MapPin, Feather,
  Baby, Lightbulb, Volume2, Footprints, Shield, Users, BookMarked, Telescope,
  Footprints as EtiquetteIcon, Backpack,
} from 'lucide-react';
import { similarBirds, dietLabel, habitatLabel, ENTRIES, type Lang } from '../lib/explorer';
import type { GuideKind } from './FieldGuideModal';
import { ResearchHub } from './ResearchHub';
import type { Bird } from '../types';

type DetailFields = Record<string, string | string[]>;
type DetailMap = Record<string, DetailFields>;

/**
 * 詳細資料頁。
 *
 * 兩個原則：
 *  1. 中英分開兩個檔（cardDetails.zh.json / cardDetails.en.json），
 *     只在撳「詳細資料」時才 dynamic import，首頁唔會多載 1.2 MB。
 *  2. 英文版缺資料就印 “Data pending”，絕不用中文頂替、不機翻。
 */
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

interface BirdDetailPageProps {
  bird: Bird;
  lang: Lang;
  onBack: () => void;
  /** 跳去同一個圖鑑機另一隻雀（相似鳥類） */
  onJump: (id: string) => void;
  onOpenGuide: (kind: GuideKind) => void;
}

export const BirdDetailPage: React.FC<BirdDetailPageProps> = ({ bird, lang, onBack, onJump, onOpenGuide }) => {
  /* 用 key = lang 記住載入結果，語言一轉就係「另一個檔」，
     唔需要在 effect 裡面先 setState(null) 再載入（會多一次 render）。 */
  const [loaded, setLoaded] = useState<{ lang: Lang; map: DetailMap } | null>(null);
  const [failed, setFailed] = useState(false);
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const PENDING = t('資料待查', 'Data pending');

  useEffect(() => {
    let cancelled = false;
    loadDetails(lang)
      .then((m) => { if (!cancelled) setLoaded({ lang, map: m }); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [lang]);

  const data = loaded && loaded.lang === lang ? loaded.map : null;

  const entry = ENTRIES[bird.id];
  const fields = data ? data[bird.id] || {} : {};
  const similar = useMemo(() => similarBirds(bird.id, 6, lang), [bird.id, lang]);

  const zhName = entry?.z || bird.name;
  const enName = entry?.e || bird.taxonomy?.comName || bird.englishName || '';
  const sciName = entry?.s || bird.taxonomy?.sciName || bird.scientificName || '';
  const title = lang === 'en' ? enName || zhName : zhName;
  const subtitle = lang === 'en' ? zhName : enName;

  const dietTags = (entry?.d || []).map((id) => dietLabel(id, lang));
  const habTags = (entry?.h || []).map((id) => habitatLabel(id, lang));

  return (
    <motion.div
      key="detail-page"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-3 relative z-10 pb-10 w-full"
    >
      {/* 標題 */}
      <div className="bg-black/45 border-2 border-amber-500/30 rounded-2xl p-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-yellow-300/80 bg-black/50 rounded px-1.5 py-0.5">NO.{bird.id}</span>
          <h3 className="text-white font-black text-xl leading-tight">{title || PENDING}</h3>
          {subtitle && <span className="text-yellow-200/60 text-[11px] font-mono">{subtitle}</span>}
        </div>
        <p className="text-white/45 font-mono text-[10px] italic mt-0.5">{sciName}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {/* 全英文模式只出拉丁目／科，唔會中英夾雜；中文模式先出中文目／科 */}
          {lang === 'zh' &&
            [entry?.oz, entry?.fz].filter(Boolean).map((v) => (
              <span key={v} className="bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 text-[10px] font-bold rounded-full px-2 py-0.5">
                {v}
              </span>
            ))}
          {bird.taxonomy?.order && (
            <span className="bg-white/5 border border-white/15 text-white/45 font-mono text-[10px] rounded-full px-2 py-0.5">
              {bird.taxonomy.order}
            </span>
          )}
          {bird.taxonomy?.family && (
            <span className="bg-white/5 border border-white/15 text-white/45 font-mono text-[10px] rounded-full px-2 py-0.5">
              {bird.taxonomy.family}
            </span>
          )}
        </div>
      </div>

      {/* 屬性標籤：即刻見到「食乜／住邊」，撳落去跳到同類 */}
      {(dietTags.length > 0 || habTags.length > 0) && (
        <div className="bg-black/35 border border-cyan-300/25 rounded-2xl p-3">
          <p className="text-cyan-200/80 font-black text-[10px] tracking-[0.2em] mb-1.5">
            {t('屬性 · 撳一下就係同類', 'ATTRIBUTES · TAP TO MATCH')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dietTags.map((v) => (
              <span key={v} className="bg-amber-400/20 border border-amber-300/40 text-amber-100 text-[11px] font-bold rounded-full px-2 py-0.5">
                🍽 {v}
              </span>
            ))}
            {habTags.map((v) => (
              <span key={v} className="bg-emerald-400/15 border border-emerald-300/35 text-emerald-100 text-[11px] font-bold rounded-full px-2 py-0.5">
                🌿 {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 科學研究中心：六格各有分工（文字／紀錄／相片／影片／聲音／工具） */}
      <ResearchHub
        sciQuery={enName || sciName || zhName}
        speciesCode={entry?.code}
        lang={lang}
      />

      {/* 資料卡 */}
      {failed ? (
        <p className="text-red-200/80 text-[12px] bg-red-900/30 border border-red-500/30 rounded-xl p-3">
          {t('詳細資料載入失敗，請重新整理。', 'Could not load the details file. Please reload.')}
        </p>
      ) : !data ? (
        <div className="flex items-center gap-2 text-white/50 text-[12px] py-6 justify-center">
          <div className="w-4 h-4 border-2 border-white/20 border-t-yellow-300 rounded-full animate-spin" />
          {t('載入詳細資料…', 'Loading details…')}
        </div>
      ) : Object.keys(fields).length === 0 ? (
        <div className="bg-amber-900/25 border border-amber-500/30 rounded-xl p-3">
          <p className="text-amber-100 font-black text-[12px]">
            {t('這張卡暫時只有上面的基本資料', 'This card only has the basics for now')}
          </p>
          <p className="text-amber-100/60 text-[11px] mt-1 leading-relaxed">
            {t(
              '未查到可靠的中文原文，所以唔會亂填。你可以用下面 eBird／Macaulay 的連結自己核對。',
              'No reliable source was found, so nothing is filled in. Use the eBird / Macaulay links below to check yourself.',
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FIELDS.map(({ id, zh, en, Icon }) => {
            const raw = fields[id];
            const val = Array.isArray(raw) ? raw.filter(Boolean).join('；') : raw;
            const missing = !val || !String(val).trim();
            return (
              <div
                key={id}
                className={`rounded-xl p-2.5 border ${missing ? 'bg-black/20 border-white/10' : 'bg-black/40 border-amber-500/20'}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${missing ? 'text-white/25' : 'text-yellow-300/80'}`} />
                  <span className={`font-black text-[11px] tracking-wide ${missing ? 'text-white/35' : 'text-yellow-200'}`}>
                    {lang === 'en' ? en : zh}
                  </span>
                </div>
                <p className={`text-[11.5px] leading-relaxed ${missing ? 'text-white/25 italic' : 'text-white/75'}`}>
                  {missing ? PENDING : String(val)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 體長 / 體重 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
          <p className="text-white/40 font-mono text-[9px] tracking-widest">{t('體長', 'LENGTH')}</p>
          <p className="text-white font-black text-sm">{fields.length || bird.height || PENDING}</p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
          <p className="text-white/40 font-mono text-[9px] tracking-widest">{t('體重', 'WEIGHT')}</p>
          <p className="text-white font-black text-sm">{fields.weight || bird.weight || PENDING}</p>
        </div>
      </div>

      {/* 相似鳥類 */}
      <div className="bg-gradient-to-b from-cyan-950/70 to-black/60 border-2 border-cyan-400/30 rounded-2xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Telescope className="w-4 h-4 text-cyan-300" />
          <h4 className="text-cyan-200 font-black text-sm">{t('相似鳥類', 'Look-alikes')}</h4>
          <span className="text-white/35 text-[10px]">
            {t('同科／同屬／同食物／同環境／體型接近', 'same family, genus, diet, habitat or size')}
          </span>
        </div>
        {similar.length === 0 ? (
          <p className="text-white/35 text-[11px]">{t('暫時冇足夠資料找相似鳥。', 'Not enough data to match look-alikes yet.')}</p>
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
                  className="text-left bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-300/40 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-[9px] text-yellow-300/70">NO.{s.id}</span>
                    <span className="text-white font-bold text-[11.5px] truncate">{nm}</span>
                  </div>
                  <p className="text-cyan-300/70 text-[9px] truncate">{s.reasons.join('・')}</p>
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
          className="flex items-center justify-center gap-1.5 bg-emerald-800/60 hover:bg-emerald-700 text-white font-black py-3 rounded-xl border-b-4 border-emerald-950 active:translate-y-0.5 active:border-b-0 text-[12px]"
        >
          <EtiquetteIcon className="w-4 h-4" /> {t('觀鳥禮儀', 'Etiquette')}
        </button>
        <button
          onClick={() => onOpenGuide('gear')}
          className="flex items-center justify-center gap-1.5 bg-amber-800/60 hover:bg-amber-700 text-white font-black py-3 rounded-xl border-b-4 border-amber-950 active:translate-y-0.5 active:border-b-0 text-[12px]"
        >
          <Backpack className="w-4 h-4" /> {t('觀鳥裝備', 'Gear')}
        </button>
      </div>

      {/* 補充連結：六宮格已覆蓋 Cornell／Macaulay／Xeno／Merlin，這裡只補文字來源與下載 */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: t('中文維基', 'Wikipedia (zh)'), url: `https://zh.wikipedia.org/wiki/${encodeURIComponent(zhName)}`, show: !!zhName },
          { label: t('英文維基', 'Wikipedia (en)'), url: `https://en.wikipedia.org/wiki/${encodeURIComponent((enName || '').replace(/\s+/g, '_'))}`, show: !!enName },
          { label: t('香港觀鳥會', 'HKBWS'), url: 'https://www.hkbws.org.hk/', show: true },
        ].filter((x) => x.show).map((x) => (
          <a
            key={x.label}
            href={x.url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1 bg-black/40 hover:bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-[10.5px] text-white/70 hover:text-white"
          >
            <ExternalLink className="w-3 h-3" /> {x.label}
          </a>
        ))}
      </div>

      {/* 資料來源說明：哪一個來源負責哪一種資料，避免「只有一個連結就不夠權威」 */}
      <div className="bg-black/25 border border-white/10 rounded-xl p-2.5">
        <p className="text-white/45 font-black text-[10px] tracking-[0.2em] mb-1">
          {t('資料來源分工', 'WHERE EACH FACT COMES FROM')}
        </p>
        <ul className="text-[10.5px] text-white/55 leading-relaxed space-y-0.5">
          <li>{t('分類／學名／分佈代碼：eBird–Clements（Cornell Lab）', 'Taxonomy, scientific names, species codes: eBird–Clements (Cornell Lab)')}</li>
          <li>{t('文字內容：中文維基百科（原文抽取，不改寫）＋英文維基百科（英文原文）', 'Text: Chinese Wikipedia (extracted verbatim) and English Wikipedia')}</li>
          <li>{t('相片：Macaulay Library（Cornell Lab，由生圖流程引用）', 'Photos: Macaulay Library (Cornell Lab)')}</li>
          <li>{t('鳥聲：Xeno-canto；香港名錄次序：香港觀鳥會', 'Sound: Xeno-canto; Hong Kong checklist order: HKBWS')}</li>
        </ul>
      </div>

      <button
        onClick={onBack}
        className="w-full bg-red-900/60 hover:bg-red-800 text-white font-black py-4 rounded-2xl border-b-4 border-red-950 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" /> {t('返回基礎數據面板', 'Back to the main panel')}
      </button>
    </motion.div>
  );
};
