import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Layers, Utensils, Trees, Compass, Sparkles, Telescope } from 'lucide-react';
import {
  DIET_TAGS, HABITAT_TAGS, ENTRIES,
  searchIndex, similarBirds, filterByFacets, emptyFacets, tagLabel,
  type Facets, type Lang,
} from '../lib/explorer';

interface ExplorerPanelProps {
  lang: Lang;
  /** 點一隻雀 → 開圖鑑機 */
  onPick: (id: string) => void;
  /** 目前搜索字（受控，與頂欄搜尋同步） */
  query: string;
  onQueryChange: (q: string) => void;
  /** 已顯示的卡（保留原本 sortMode 次序） */
  orderedIds: string[];
}

/**
 * 「多線索搜尋」面板。
 *
 * 一本真圖鑑不是只有一條 A–Z：你可以用中文名、英文名、學名、目、科、
 * 食乜（昆蟲／魚／果實…）、住邊（森林／濕地／城市…）去搵同一隻雀，
 * 再一撳「相似鳥類」。這些全部只讀 explorerIndex.json（幾十 KB），
 * 不影響 2.8 MB 的卡面文案。
 */
export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({
  lang, onPick, query, onQueryChange, orderedIds,
}) => {
  const [facets, setFacets] = useState<Facets>(emptyFacets);
  const [mode, setMode] = useState<'any' | 'all'>('any');
  const [similarOf, setSimilarOf] = useState<string | null>(null);
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);

  const toggle = (group: 'diet' | 'habitat', id: string) => {
    setFacets((f) => ({
      ...f,
      [group]: f[group].includes(id) ? f[group].filter((x) => x !== id) : [...f[group], id],
    }));
    setSimilarOf(null);
  };

  const active = facets.diet.length + facets.habitat.length > 0;
  const clearAll = () => { setFacets(emptyFacets()); setSimilarOf(null); };

  const hits = useMemo(() => {
    const q = query.trim();
    const base = q ? searchIndex(q, lang).map((h) => h.id) : orderedIds;
    /* 搜尋結果先跟相關度；再加屬性篩選 */
    const filtered = filterByFacets(base, { ...facets, mode });
    return filtered.slice(0, 60);
  }, [query, lang, orderedIds, facets, mode]);

  const similar = useMemo(
    () => (similarOf ? similarBirds(similarOf, 8, lang) : []),
    [similarOf, lang],
  );

  const shown = similarOf ? similar.map((s) => s.id) : hits;

  return (
    <section className="mb-5 rounded-2xl border-2 border-cyan-300/30 bg-black/45 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border-b border-cyan-300/20">
        <Compass className="w-4 h-4 text-cyan-300 shrink-0" />
        <h2 className="text-cyan-200 font-black text-xs tracking-[0.2em]">
          {t('多線索搜尋', 'MULTI-FIELD SEARCH')}
        </h2>
        <span className="text-white/35 font-mono text-[9px] tracking-wider truncate">
          {t('名・目科・食乜・住邊 → 相似鳥', 'name · order · family · diet · habitat → look-alikes')}
        </span>
        {(active || similarOf) && (
          <button
            onClick={clearAll}
            className="ml-auto shrink-0 flex items-center gap-1 bg-black/40 hover:bg-black/60 border border-white/15 rounded px-2 py-1 text-[10px] text-white/70"
          >
            <X className="w-3 h-3" /> {t('清除', 'Clear')}
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* 關鍵字：與頂欄共用同一個 query */}
        <div className="flex items-center bg-white rounded-lg border-2 border-black/60 shadow-[0_3px_0_rgba(0,0,0,0.35)] overflow-hidden">
          <Search className="w-4 h-4 text-gray-600 ml-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => { onQueryChange(e.target.value); setSimilarOf(null); }}
            placeholder={t(
              '中文名 / 英文名 / 學名 / 目 / 科 / 編號 / 昆蟲 / 森林…',
              'Chinese / English / scientific / order / family / insects / forest…',
            )}
            className="bg-transparent px-2.5 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-500 outline-none w-full"
          />
          {query && (
            <button onClick={() => onQueryChange('')} className="px-2 text-gray-500 hover:text-gray-900">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 食乜 */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Utensils className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-amber-200 font-black text-[10px] tracking-[0.2em]">
              {t('食乜 · DIET', 'DIET')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DIET_TAGS.map((tag) => {
              const on = facets.diet.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggle('diet', tag.id)}
                  className={`px-2 py-1 rounded-full border text-[11px] font-bold transition-colors ${
                    on
                      ? 'bg-amber-400 text-gray-900 border-amber-200'
                      : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10'
                  }`}
                >
                  {lang === 'en' ? tag.en : tag.zh}
                </button>
              );
            })}
          </div>
        </div>

        {/* 住邊 */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Trees className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-200 font-black text-[10px] tracking-[0.2em]">
              {t('住邊 · HABITAT', 'HABITAT')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {HABITAT_TAGS.map((tag) => {
              const on = facets.habitat.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggle('habitat', tag.id)}
                  className={`px-2 py-1 rounded-full border text-[11px] font-bold transition-colors ${
                    on
                      ? 'bg-emerald-400 text-gray-900 border-emerald-200'
                      : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10'
                  }`}
                >
                  {lang === 'en' ? tag.en : tag.zh}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-black/40 border border-white/15 rounded-lg overflow-hidden">
            {([
              { key: 'any' as const, zh: '任一', en: 'ANY' },
              { key: 'all' as const, zh: '全部', en: 'ALL' },
            ]).map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                title={t('組內標籤：任一＝符合一個就夠；全部＝要全部符合', 'Within a group: ANY = at least one; ALL = every tag')}
                className={`px-2.5 py-1 text-[10px] font-black tracking-wider ${
                  mode === m.key ? 'bg-cyan-400 text-gray-900' : 'text-white/60 hover:bg-white/10'
                }`}
              >
                {lang === 'en' ? m.en : m.zh}
              </button>
            ))}
          </div>
          <span className="text-white/45 font-mono text-[10px]">
            {similarOf
              ? t('相似鳥類', 'Look-alikes')
              : `${t('符合', 'Match')} ${hits.length}${hits.length >= 60 ? '+' : ''} ${t('張', 'cards')}`}
          </span>
          {active && !similarOf && (
            <span className="text-cyan-200/60 font-mono text-[10px] truncate">
              {[...facets.diet, ...facets.habitat].map((id) => tagLabel(id, lang)).join(' ＋ ')}
            </span>
          )}
        </div>

        {/* 結果：小磚，一撳就開圖鑑機 */}
        {shown.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {shown.map((id) => {
              const e = ENTRIES[id];
              if (!e) return null;
              const sim = similar.find((s) => s.id === id);
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onPick(id)}
                  className="text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-300/50 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-[9px] text-yellow-300/80">NO.{id}</span>
                    <span className="text-white font-bold text-[11.5px] truncate">
                      {lang === 'en' ? e.e || e.z : e.z || e.e}
                    </span>
                  </div>
                  <p className="text-white/40 font-mono text-[9px] truncate">
                    {[e.fz, e.f].filter(Boolean).join(' ') || e.s}
                  </p>
                  {sim && sim.reasons.length > 0 && (
                    <p className="text-cyan-300/70 text-[9px] truncate mt-0.5">{sim.reasons.join('・')}</p>
                  )}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <p className="text-white/40 text-[11px] py-2">
            {t(
              '冇符合的雀。試下少揀一兩個標籤，或者清除關鍵字。',
              'Nothing matched. Try removing a tag or clearing the keyword.',
            )}
          </p>
        )}

        {/* 相似鳥提示 */}
        {similarOf && ENTRIES[similarOf] && (
          <button
            onClick={() => onPick(similarOf)}
            className="w-full flex items-center gap-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-300/30 rounded-lg px-3 py-2 text-left"
          >
            <Telescope className="w-4 h-4 text-cyan-300 shrink-0" />
            <span className="text-white/80 text-[11px]">
              {t('查看本尊：', 'Back to the bird: ')}
              <b className="text-white">
                {lang === 'en' ? ENTRIES[similarOf].e : ENTRIES[similarOf].z}
              </b>
            </span>
            <Layers className="w-3.5 h-3.5 text-white/30 ml-auto" />
          </button>
        )}

        {!similarOf && shown.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <Sparkles className="w-3 h-3 text-yellow-300/70" />
            <span className="text-white/35 text-[10px]">
              {t('撳一張卡，再在卡內撳「相似鳥類」', 'Open a card, then tap “Look-alikes” inside it')}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExplorerPanel;
