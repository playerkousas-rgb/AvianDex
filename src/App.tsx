import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FlipCard } from './components/FlipCard.tsx';
import { PokedexDevice } from './components/PokedexDevice.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { SideToolBalls } from './components/SideToolBalls.tsx';
import { FieldFeathers } from './components/FieldFeathers.tsx';
import { TopBar } from './components/TopBar.tsx';
import { UpdateToast } from './components/UpdateToast.tsx';
import { BirdingMapModal } from './components/BirdingMapModal.tsx';
import { CardLoadDiagnostics } from './components/CardLoadDiagnostics.tsx';
import { ExplorerPanel } from './components/ExplorerPanel.tsx';
import { FieldGuideModal, type GuideKind } from './components/FieldGuideModal.tsx';
import { useBirds } from './hooks/useBirds';
import { useCardStats } from './hooks/useCardStats';
import { getLoadedIds, resetAll, requestCard } from './lib/cardImage';
import { APP_VERSION, CARDS_PER_PAGE, DEFAULT_SORT_MODE } from './config';
import { sortBirds, searchBirds, type SortMode } from './lib/pokedexOrder';
import { filterByFacets, searchIndex, emptyFacets, hasActiveFacets, type Facets, type Lang } from './lib/explorer';
import { resolveBirdId } from './data/nameAliases';
import { AnimatePresence } from 'framer-motion';
import {
  Bird as BirdIcon,
  RefreshCw,
  Search,
  Sparkles,
  Wifi,
  BatteryFull,
  Map as MapIcon,
  Footprints,
  Backpack,
  Layers,
  Languages,
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export { APP_VERSION };

/** Local capture records received from the sibling BIRD-DEX app. */
export const CAPTURE_UNLOCKS_KEY = 'aviandex.capture-unlocks.v1';

function App() {
  const { birds, loading, error } = useBirds();
  // 注意：用「編號」而唔係「陣列索引」記錄目前打開的卡，
  // 因為排序（eBird / 中文 / 編號）會令同一張卡嘅索引變來變去。
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const dexHeading = useRef<HTMLHeadingElement>(null);
  const focusAfterHatching = useRef(false);
  const enterDex = useCallback(() => {
    focusAfterHatching.current = true;
    setIsOpened(true);
  }, []);
  useEffect(() => {
    if (isOpened && focusAfterHatching.current) {
      dexHeading.current?.focus({ preventScroll: true });
      focusAfterHatching.current = false;
    }
  }, [isOpened]);
  const [query, setQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  // 分頁顯示：一次過 render 569 張卡會同時觸發幾百個圖片請求（r2.dev 會限流）
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_PAGE);
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  // 排序：預設跟 eBird/Clements（目 → 科 → 種）；只影響畫面次序，NO. 編號永不變
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE);
  const cardStats = useCardStats();


  // 介面語言：'zh' ＝ 全中文（香港繁體）；'en' ＝ 全英文。
  // 選擇會記住；卡面文案、搜尋排序、觀鳥禮儀／裝備都會跟住轉。
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const v = localStorage.getItem('aviandex.lang');
      if (v === 'en' || v === 'zh') return v;
    } catch { /* 私隱模式 */ }
    return 'zh';
  });
  useEffect(() => {
    try { localStorage.setItem('aviandex.lang', lang); } catch { /* ignore */ }
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant-HK';
  }, [lang]);

  /** 介面文字：'en' 時全英文，唔會中英夾雜 */
  const L = useCallback((zh: string, en: string) => (lang === 'en' ? en : zh), [lang]);

  // 多線索搜尋面板（屬性篩選）；同一個 query 亦餵落卡片網格
  const [showExplorer, setShowExplorer] = useState(false);
  const [facets, setFacets] = useState<Facets>(emptyFacets);
  const activeFilterCount = facets.diet.length + facets.habitat.length + (facets.size?.length || 0) + (facets.iucn?.length || 0);

  // 觀鳥禮儀 / 觀鳥裝備
  const [guideKind, setGuideKind] = useState<GuideKind | null>(null);
  // ============================================================
  // 跨 App 深層連結（與「捕捉 App / BIRD-DEX 3」共用同一套編號）
  // 支援 BirdEx 3 回傳 ?unlock=0008；亦支援通用 ?id=12 / ?id=0012 與 ?search=中文名。
  // 捕捉編號會記入本機，並直接開啟對應圖鑑鳥種。
  // ============================================================
  useEffect(() => {
    if (!birds.length) return;
    let params: URLSearchParams;
    try { params = new URLSearchParams(window.location.search); }
    catch { return; }

    const rawUnlock = params.get('unlock');
    const rawId = params.get('id') || rawUnlock;
    const rawSearch = params.get('search');
    if (!rawId && !rawSearch) return;

    let idx = -1;

    // 1) 以編號比對（容許 12 / 0012 / "12 " 等寫法）
    if (rawId != null && rawId.trim() !== '') {
      const digits = rawId.trim().replace(/\D/g, '');
      if (digits) {
        const padded = digits.padStart(4, '0');
        idx = birds.findIndex((b) => b.id === padded);
      }
    }

    // 2) 後備：以中文名 / 英文名 / 學名比對
    if (idx < 0 && rawSearch != null && rawSearch.trim() !== '') {
      const term = rawSearch.trim();
      idx = birds.findIndex((b) => b.id === term || b.name === term);
      if (idx < 0) {
        const resolved = resolveBirdId(term);
        if (resolved) idx = birds.findIndex((b) => b.id === resolved);
      }
      if (idx < 0) {
        const low = term.toLowerCase();
        idx = birds.findIndex(
          (b) =>
            b.name?.toLowerCase().includes(low) ||
            (b.englishName ? b.englishName.toLowerCase().includes(low) : false),
        );
      }
    }

    if (idx >= 0) {
      if (rawUnlock) {
        const no = birds[idx].id;
        try {
          const old = JSON.parse(localStorage.getItem(CAPTURE_UNLOCKS_KEY) || '[]') as Array<{ no?: string; unlocked_at?: string; source?: string }>;
          const records = Array.isArray(old) ? old : [];
          if (!records.some((record) => record?.no === no)) {
            records.push({ no, unlocked_at: new Date().toISOString(), source: 'birddex3' });
            localStorage.setItem(CAPTURE_UNLOCKS_KEY, JSON.stringify(records));
          }
        } catch { /* private mode / malformed prior value: still navigate to the species */ }
      }
      // 深層連結：birds 是異步載入的，只能在 effect 中、資料就緒後套用網址參數
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: apply ?id=/?search= after async data load
      setIsOpened(true);        // 跳過開機畫面，直接進入
      setSelectedBirdId(birds[idx]?.id ?? null);    // 打開該鳥的圖鑑機
    }

    // 清掉網址參數，避免重新整理時又彈出
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('unlock');
      url.searchParams.delete('search');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch { /* ignore URL errors */ }
  }, [birds]);

  useEffect(() => {
    const anyModalOpen =
      selectedBirdId !== null || showMap || !!guideKind;
    document.body.style.overflow = anyModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedBirdId, showMap, guideKind]);

  const candidateBirds = useMemo(() => {
    let base = searchBirds(birds, query);
    // Retain name-match priority, then add taxonomy/diet/habitat matches from the shared index.
    if (query.trim()) {
      const seen = new Set(base.map(b => b.id));
      const byId = new Map(birds.map(b => [b.id, b]));
      for (const hit of searchIndex(query, lang)) {
        const bird = byId.get(hit.id);
        if (bird && !seen.has(hit.id)) { base.push(bird); seen.add(hit.id); }
      }
    }
    if (onlyUnlocked) {
      const loaded = getLoadedIds();
      base = base.filter(b => loaded.has(b.id));
    }
    return query.trim() ? base : sortBirds(base, sortMode);
    // cardStats is the trigger when loaded-image status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birds, query, lang, onlyUnlocked, sortMode, cardStats]);

  const filteredBirds = useMemo(() => {
    if (!hasActiveFacets(facets)) return candidateBirds;
    const keep = new Set(filterByFacets(candidateBirds.map(b => b.id), facets));
    return candidateBirds.filter(b => keep.has(b.id));
  }, [candidateBirds, facets]);

  const pagedBirds = useMemo(() => filteredBirds.slice(0, visibleCount), [filteredBirds, visibleCount]);

  /**
   * 圖鑑機（左右箭頭切換）用的清單。
   * 跟 eBird 排序時，在這裡切換就會由「目 → 科 → 種」逐隻行；
   * 但 PokedexDevice 內部是用「索引」定位，所以要用 filtered 清單，
   * 否則排序一改，開出來嘅卡就會跳錯。
   */
  const dexBirds = filteredBirds;
  const dexIndex = useMemo(() => {
    if (selectedBirdId === null) return 0;
    const i = dexBirds.findIndex((b) => b.id === selectedBirdId);
    return i >= 0 ? i : 0;
  }, [dexBirds, selectedBirdId]);


  // 圖鑑收錄的鳥種總數（已正式記錄、非 ??? 佔位）
  const speciesCount = useMemo(
    () => birds.filter((b) => b.discovered).length,
    [birds],
  );

  if (error) {
    return (
      <div className="min-h-screen bg-[#313131] flex items-center justify-center">
        <div className="bg-red-500 text-white p-6 rounded-xl font-bold shadow-2xl">
          Error loading Dex: {(error as Error)?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence initial={false}>
        {!isOpened && <WelcomeScreen key="welcome" lang={lang} onOpen={enterDex} />}
      </AnimatePresence>

      <div
        inert={!isOpened}
        className={`min-h-[100dvh] font-sans pb-32 sm:pb-24 relative ${isOpened ? '' : 'invisible h-dvh overflow-hidden'}`}
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(255,220,150,0.12), transparent 60%),
            radial-gradient(ellipse at bottom, rgba(0,0,0,0.4), transparent 70%),
            linear-gradient(180deg, #1a4d2e 0%, #0d2818 100%)
          `,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px, 30px 30px',
          }}
        />

        <header className="relative z-20">
          <div className="field-camo border-b-[6px] border-black shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-gray-900 border border-[#4b4635]" />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-gray-900 border border-[#4b4635]" />
            <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-gray-900 border border-[#4b4635]" />
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-gray-900 border border-[#4b4635]" />
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 flex items-center justify-between gap-2 relative">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 sm:flex-none">
                <img
                  src="/icons/icon-192-v2.png"
                  alt=""
                  width={192}
                  height={192}
                  className="h-12 w-12 shrink-0 rounded-full border-[3px] border-[#e4dbc3] shadow-[0_3px_0_#15201980] sm:h-16 sm:w-16"
                />
                <div className="min-w-0">
                  <h1 ref={dexHeading} tabIndex={-1} className="text-xl sm:text-3xl md:text-4xl font-black italic tracking-tight text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.5)] leading-none flex items-center gap-2 focus:outline-none">
                    AvianDex
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-300 animate-pulse hidden sm:block" />
                  </h1>
                  <p className="text-yellow-300 font-mono text-[9px] sm:text-[11px] md:text-xs tracking-[0.2em] sm:tracking-[0.3em] mt-1 drop-shadow-md truncate">
                    BIRD FIELD GUIDE · {APP_VERSION}
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setShowMap(true)}
                  className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-400/20 text-yellow-200 font-black text-xs tracking-wider transition-all active:scale-95"
                  title="香港觀鳥地圖"
                >
                  <MapIcon className="w-4 h-4" /> {lang === 'en' ? 'Map' : '觀鳥地圖'}
                </button>
                <button
                  onClick={() => setGuideKind('etiquette')}
                  className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-emerald-400/25 text-emerald-200 font-black text-xs tracking-wider transition-all active:scale-95"
                  title={lang === 'en' ? 'Birding etiquette' : '觀鳥禮儀'}
                >
                  <Footprints className="w-4 h-4" /> {lang === 'en' ? 'Etiquette' : '觀鳥禮儀'}
                </button>
                <button
                  onClick={() => setGuideKind('gear')}
                  className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-amber-400/25 text-amber-200 font-black text-xs tracking-wider transition-all active:scale-95"
                  title={lang === 'en' ? 'Birding gear' : '觀鳥裝備'}
                >
                  <Backpack className="w-4 h-4" /> {lang === 'en' ? 'Gear' : '觀鳥裝備'}
                </button>
                <div className="flex gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1.5 border border-white/10">
                  <FieldFeathers className="gap-1.5 text-xs" />
                </div>
                <div className="hidden lg:flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-md px-3 py-1.5 border border-white/10 font-mono text-[10px] text-green-300">
                  <Wifi className="w-3 h-3" />
                  <span>ONLINE</span>
                  <span className="text-white/30">|</span>
                  <BatteryFull className="w-3 h-3" />
                  <span>100%</span>
                </div>
                {/* 全中文 / 全英文：一撳即刻換整個介面＋卡面文案，不是逐段機翻 */}
                <button
                  onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                  title={lang === 'en' ? 'Switch to 全中文' : 'Switch to English only'}
                  aria-label="切換語言 / Switch language"
                  className="flex items-center gap-1 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-2 border border-cyan-300/30 text-cyan-200 font-black text-[11px] tracking-wider transition-all active:scale-95"
                >
                  <Languages className="w-4 h-4" />
                  {lang === 'en' ? 'EN' : '中文'}
                </button>
                <div className="hidden md:block">
                  <TopBar lang={lang} />
                </div>
              </div>

              {/* 手機：語言直接可見（不用開選單）。
                  用戶要求「中英轉換不用點三橫才能看到，在上方直接有 1 個顯示 EN 中」。
                  用一個 2 段式開關：中 | EN，現時語言反白。 */}
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                aria-label={lang === 'en' ? '切換到中文' : 'Switch to English'}
                className="md:hidden flex items-center bg-black/45 border-2 border-cyan-300/35 rounded-lg overflow-hidden shrink-0 active:scale-95"
              >
                <span className={`px-2 py-2 text-[11px] font-black ${lang === 'zh' ? 'bg-cyan-400 text-gray-900' : 'text-cyan-200/60'}`}>中</span>
                <span className={`px-2 py-2 text-[11px] font-black ${lang === 'en' ? 'bg-cyan-400 text-gray-900' : 'text-cyan-200/60'}`}>EN</span>
              </button>

              {/* 「加入主畫面」搬到頂欄（用戶第 2 點：不要浮在右邊球上方，
                  否則左右兩排球一邊重一邊輕）。 */}
              <div className="md:hidden shrink-0">
                <TopBar lang={lang} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-yellow-300 to-yellow-400 border-b-[6px] border-black shadow-md relative">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
                <div className="flex items-center gap-2 shrink-0 bg-black/15 border-2 border-black/40 rounded-lg px-3 py-1.5 shadow-inner">
                  <BirdIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-900 shrink-0" strokeWidth={2.5} />
                  <div className="flex flex-col leading-none">
                    <span className="font-mono text-[8px] sm:text-[9px] text-red-900 font-black tracking-widest">
                      {L('圖鑑收錄 · SPECIES', 'SPECIES IN DEX')}
                    </span>
                    <span className="font-black text-gray-900 text-sm sm:text-base md:text-lg leading-tight">
                      {speciesCount}
                      <span className="text-gray-700 text-[10px] sm:text-xs font-mono"> {L('種', 'spp.')}</span>
                    </span>
                  </div>
                </div>

                {/* 圖卡解鎖進度：直接講清楚「R2 有幾多張圖」，唔使靠估 */}
                <div
                  className="flex items-center gap-2 shrink-0 bg-black/15 border-2 border-black/40 rounded-lg px-3 py-1.5 shadow-inner"
                  title="已由 Cloudflare R2 成功載入的圖卡數量"
                >
                  <span className="text-base leading-none">🖼️</span>
                  <div className="flex flex-col leading-none">
                    <span className="font-mono text-[8px] sm:text-[9px] text-red-900 font-black tracking-widest">
                      {L('已解鎖圖卡 · CARDS', 'CARDS LOADED')}
                    </span>
                    <span className="font-black text-gray-900 text-sm sm:text-base md:text-lg leading-tight">
                      {cardStats.loaded}
                      <span className="text-gray-700 text-[10px] sm:text-xs font-mono"> {L('張', 'cards')}</span>
                      {cardStats.error > 0 && (
                        <span className="ml-1.5 text-[9px] font-mono text-red-800">⚠ {cardStats.error} {L('失敗', 'failed')}</span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    resetAll();
                    // 重新排隊：由第一張開始逐張 revalidate
                  birds.slice(0, visibleCount).forEach((b) => requestCard(b.id));
                  }}
                  title={L('重新向 R2 探測所有圖卡（剛上傳完圖可按）', 'Re-check every card on R2 (use after uploading art)')}
                  className="shrink-0 flex items-center gap-1.5 bg-white/70 hover:bg-white border-2 border-black/50 rounded-lg px-2.5 py-2 font-black text-[10px] text-gray-900 tracking-wider active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {L('重新掃描', 'Rescan')}
                </button>

                <label className="shrink-0 flex items-center gap-2 bg-white/60 border-2 border-black/40 rounded-lg px-2.5 py-2 font-black text-[10px] text-gray-900 tracking-wider cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyUnlocked}
                    onChange={(e) => {
                      setOnlyUnlocked(e.target.checked);
                      setVisibleCount(CARDS_PER_PAGE);
                    }}
                    className="w-3.5 h-3.5 accent-red-700"
                  />
                  {L('只看有圖', 'With image only')}
                </label>

                <div className="shrink-0 flex items-center bg-white/70 border-2 border-black/50 rounded-lg overflow-hidden">
                  <span className="px-1.5 font-mono text-[8px] font-black text-gray-700 tracking-wider border-r border-black/20 py-2">
                    {L('排序', 'SORT')}
                  </span>
                  {(
                    [
                      { key: 'ebird', label: 'eBird', title: L('跟 eBird/Clements 演化排序（目 → 科 → 種）', 'eBird/Clements order (order → family → species)') },
                      { key: 'pokedex', label: 'NO.', title: L('原本 NO.0001 → NO.0583 次序', 'Original NO.0001 → NO.0583 order') },
                      { key: 'chinese', label: '中文', title: L('按中文名排序', 'Sort by Chinese name') },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      title={m.title}
                      onClick={() => {
                        setSortMode(m.key);
                        setVisibleCount(CARDS_PER_PAGE);
                      }}
                      className={`px-2 py-2 font-black text-[10px] tracking-wider transition-colors ${
                        sortMode === m.key ? 'bg-red-700 text-yellow-200' : 'text-gray-900 hover:bg-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center bg-white rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.4)] overflow-hidden">
                <Search className="w-4 h-4 text-gray-600 ml-3 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setVisibleCount(CARDS_PER_PAGE); }}
                  placeholder={lang === 'en'
                    ? 'English / scientific / Chinese / no.…'
                    : '英文名 / 學名 / 中文 / 編號…'}
                  className="bg-transparent px-2.5 py-1.5 text-sm font-bold text-gray-900 placeholder:text-gray-500 outline-none w-full sm:w-44"
                />
              </div>
              <button
                onClick={() => setShowExplorer((v) => !v)}
                title={lang === 'en' ? 'Filter by size, IUCN status, diet or habitat' : '按大小、瀕危等級、食物或生境篩選鳥類'}
                className={`shrink-0 flex items-center gap-1.5 border-2 border-black rounded-lg px-2.5 py-2 font-black text-[10px] tracking-wider shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none transition-all ${
                  showExplorer || hasActiveFacets(facets)
                    ? 'bg-cyan-700 text-white'
                    : 'bg-white/70 text-gray-900 hover:bg-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Filters' : '多線索'}
                {activeFilterCount > 0 && (
                  <span className="bg-yellow-400 text-gray-900 rounded-full px-1.5">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10 relative z-10">
          {!loading && (
            <CardLoadDiagnostics visibleIds={pagedBirds.map((b) => b.id)} />
          )}
          {!loading && showExplorer && (
            <ExplorerPanel lang={lang} query={query}
              onQueryChange={(q) => { setQuery(q); setVisibleCount(CARDS_PER_PAGE); }}
              orderedIds={candidateBirds.map(b => b.id)}
              facets={facets}
              onFacetsChange={(next) => { setFacets(next); setVisibleCount(CARDS_PER_PAGE); }}
              onPick={id => setSelectedBirdId(id)} />
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32 bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-yellow-400/30">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-[6px] sm:border-8 border-white/20 border-t-yellow-400 rounded-full animate-spin mb-4 sm:mb-6 shadow-xl" />
              <p className="text-yellow-300 font-black tracking-widest text-lg sm:text-2xl drop-shadow-md">
                INITIALIZING DEX...
              </p>
              <p className="text-white/50 font-mono text-[10px] sm:text-xs mt-2 tracking-wider">
                Loading species database
              </p>
            </div>
          ) : filteredBirds.length === 0 ? (
            <div>

              <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                <BirdIcon className="w-20 h-20 sm:w-24 sm:h-24 text-yellow-300/40 mb-4" strokeWidth={1.5} />
                <p className="text-yellow-200/80 font-black text-lg sm:text-xl">
                  {L('沒有找到符合的鳥種', 'No species matched')}
                </p>
                <p className="text-white/40 font-mono text-xs mt-2">
                  {L('試下換個關鍵字，或清除／減少篩選條件', 'Try another keyword, or clear / reduce the filters')}
                </p>
              </div>
            </div>
          ) : (
            <>

              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent rounded min-w-[20px]" />
                <h2 className="text-yellow-300 font-black text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] flex items-center gap-1.5 sm:gap-2">
                  <BirdIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  SPECIMEN ARCHIVE
                  <span className="font-mono text-[9px] tracking-widest text-yellow-200/50 normal-case">
                    {query.trim()
                      ? L('· 搜尋結果', '· SEARCH')
                      : sortMode === 'ebird'
                        ? L('· eBird 分類序', '· eBird order')
                        : sortMode === 'chinese'
                          ? L('· 中文名序', '· Chinese name')
                          : L('· NO. 編號序', '· Dex number')}
                  </span>
                </h2>
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent rounded min-w-[20px]" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5 relative z-10">
                {pagedBirds.map((bird) => (
                  <FlipCard
                    key={bird.id}
                    bird={bird}
                    lang={lang}
                    isActive={selectedBirdId === bird.id}
                    onOpen={() => setSelectedBirdId(bird.id)}
                  />
                ))}
              </div>

              {/* 載入更多：每次只 render 一批，避免一次過打幾百個 R2 請求 */}
              {visibleCount < filteredBirds.length && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <button
                    onClick={() => setVisibleCount((n) => n + CARDS_PER_PAGE)}
                    className="bg-gradient-to-b from-yellow-300 to-yellow-500 text-gray-900 font-black px-8 py-3 rounded-xl border-[3px] border-black shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-none transition-all"
                  >
                    {L('載入更多 · LOAD MORE', 'LOAD MORE')}（{pagedBirds.length} / {filteredBirds.length}）
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredBirds.length)}
                    className="text-yellow-200/60 font-mono text-[10px] tracking-widest underline underline-offset-2"
                  >
                    {L(`全部顯示（${filteredBirds.length} 張，圖片會排隊慢慢載入）`, `Show all ${filteredBirds.length} cards (images load in a queue)`)}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8 pb-4">
          <div className="bg-black/40 backdrop-blur-sm border-2 border-yellow-400/20 rounded-xl p-3 sm:p-4 font-mono text-[9px] sm:text-[11px] text-yellow-200/60 leading-relaxed">
            <p className="text-yellow-300 font-black tracking-widest mb-1">► CREDITS & DATA SOURCES ({APP_VERSION})</p>
            <p>分類權威：eBird / Clements Checklist（Cornell Lab of Ornithology）</p>
            <p>科學數據：Cornell Lab · eBird · Macaulay Library · Xeno-canto</p>
            <p className="text-white/30 mt-1">© Scout System</p>
          </div>
        </footer>
      </div>

      {/* 工具球（兩排各 3 粒）：左＝讚好／收藏・禮儀・裝備；右＝地圖・回報・BIRD-DEX 3。
          次序喺 src/config.ts 的 TOOL_BALLS 唯一來源；有 modal 打開就兩排一齊收埋。 */}
      <SideToolBalls
        lang={lang}
        onGuide={(k) => setGuideKind(k)}
        onOpenMap={() => setShowMap(true)}
        hidden={!isOpened || selectedBirdId !== null || showMap || !!guideKind}
      />

      {/* 有新版本時的頂部橫幅（由 service worker 偵測，用戶按才換版） */}
      <UpdateToast lang={lang} />

      {/* 加入主畫面（右上角細球，已安裝或已按「暫時不要」就自動消失） */}

      <PokedexDevice
        lang={lang}
        birds={dexBirds}
        initialIndex={dexIndex}
        isOpen={selectedBirdId !== null}
        onClose={() => setSelectedBirdId(null)}
        onOpenGuide={(k) => setGuideKind(k)}
        onOpenMap={() => setShowMap(true)}
      />

      <BirdingMapModal isOpen={showMap} onClose={() => setShowMap(false)} />

      <FieldGuideModal
        open={guideKind !== null}
        kind={guideKind || 'etiquette'}
        lang={lang}
        onClose={() => setGuideKind(null)}
        onSwitchKind={(k) => setGuideKind(k)}
      />

      <Analytics />
    </>
  );
}

export default App;
