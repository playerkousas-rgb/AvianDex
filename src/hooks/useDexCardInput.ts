import { useEffect, useState } from 'react';
import { ENTRIES, DIET_TAGS, HABITAT_TAGS, type Lang } from '../lib/explorer';
import { APP_VERSION } from '../config';
import type { DexCardInput } from '../lib/dexCard';

/**
 * 把散在四個 JSON 的資料，砌成「一張圖鑑資訊卡」需要的輸入。
 *
 * 為什麼要一個 hook 而不是在元件裡東拉西扯：
 *   · 資料細檔按需求載入（cardDetails 每語言 2.8 MB，不能放進主 bundle）
 *   · 同一隻雀的卡在「詳細頁」與「下載」都要砌，砌法必須一樣
 *
 * 全部資料都是 repo 內已核實的 JSON，這裡只做搬運與 tag 解碼，不改寫內容。
 * 任何一格抽不到就留空，由 renderDexCard 印「資料待查」，不在這裡補值。
 */

const DIET_BY_ID = new Map(DIET_TAGS.map((t) => [t.id, t]));
const HAB_BY_ID = new Map(HABITAT_TAGS.map((t) => [t.id, t]));

type Details = Record<string, Record<string, string | string[]>>;
type Scores = Record<string, { i?: number; a?: number; v?: number; r?: number; c?: number; o?: number; vEst?: number }>;
type Meas = Record<string, Record<string, string>>;

const CACHE = new Map<Lang, Promise<Details>>();
const scoreCache: { p?: Promise<Scores> } = {};
const measCache: { p?: Promise<Meas> } = {};
const srcCache: { p?: Promise<Record<string, string>> } = {};

/** 每隻雀一句出處（pageid），約 70 KB，不再整份 2.8 MB 的 cardCopy 拉下來 */
function loadSources(): Promise<Record<string, string>> {
  if (!srcCache.p) {
    srcCache.p = import('../data/cardSources.json')
      .then((m) => (m as { default: { sources: Record<string, string> } }).default.sources);
  }
  return srcCache.p;
}

function loadDetails(lang: Lang): Promise<Details> {
  if (!CACHE.has(lang)) {
    const p = (lang === 'en'
      ? import('../data/cardDetails.en.json')
      : import('../data/cardDetails.zh.json')
    ).then((m) => (m as { default: { birds: Details } }).default.birds);
    CACHE.set(lang, p);
  }
  return CACHE.get(lang)!;
}

function loadScores(): Promise<Scores> {
  if (!scoreCache.p) {
    scoreCache.p = import('../data/dexScores.json')
      .then((m) => (m as { default: { scores: Scores } }).default.scores);
  }
  return scoreCache.p;
}

function loadMeas(): Promise<Meas> {
  if (!measCache.p) {
    measCache.p = import('../data/measurements.json')
      .then((m) => (m as { default: Meas }).default);
  }
  return measCache.p;
}

/** 卡面語言：'both' 中英並列（要兩個檔）；'zh'／'en' 單語（只拿一個檔，省 ~600 KB） */
export type DexCardLang = 'both' | 'zh' | 'en';

export interface DexCardState {
  input: DexCardInput | null;
  loading: boolean;
  failed: boolean;
}

export function useDexCardInput(
  id: string,
  source: string,
  artUrl: string | null,
  lang: DexCardLang = 'both',
  /** false＝先不要砌（例如卡面未翻開，避免 48 格一齊拉詳細資料） */
  enabled = true,
): DexCardState {
  const [state, setState] = useState<DexCardState>({ input: null, loading: true, failed: false });
  /* 換雀就即刻回到「載入中」，但不在 effect 內同步 setState（會觸發連鎖 render）。
     用上一次砌好的 key 判斷：key 不同＝這是另一隻雀，render 時就當成未載入。 */
  const key = `${id}|${artUrl ?? ''}|${source}|${lang}`;
  const [builtFor, setBuiltFor] = useState(key);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;

    /* 單語卡就不要白白下載另一個語言檔（每個 ~600 KB，手機上很痛） */
    const needZh = lang !== 'en';
    const needEn = lang !== 'zh';
    const empty = Promise.resolve({} as Details);
    Promise.all([
      needZh ? loadDetails('zh') : empty,
      needEn ? loadDetails('en') : empty,
      loadScores(),
      loadMeas(),
      loadSources(),
    ])
      .then(([zh, en, scores, measAll, sources]) => {
        if (!alive) return;
        const e = ENTRIES[id];
        if (!e) {
          setState({ input: null, loading: false, failed: true });
          return;
        }
        const m = measAll[id] || {};
        const meas: Record<string, string> = {};
        for (const k of ['wing', 'tail', 'tarsus', 'bill']) {
          if (m[k]) meas[k] = String(m[k]);
        }
        const score = scores[id];
        setBuiltFor(key);
        setState({
          loading: false,
          failed: false,
          input: {
            id,
            zhName: e.z,
            enName: e.e,
            sciName: e.s,
            orderLatin: e.o,
            orderZh: e.oz,
            familyLatin: e.f,
            familyZh: e.fz,
            zh: zh[id] || {},
            en: en[id] || {},
            dietZh: (e.d || []).map((t) => DIET_BY_ID.get(t)?.zh).filter(Boolean) as string[],
            dietEn: (e.d || []).map((t) => DIET_BY_ID.get(t)?.en).filter(Boolean) as string[],
            habitatZh: (e.h || []).map((t) => HAB_BY_ID.get(t)?.zh).filter(Boolean) as string[],
            habitatEn: (e.h || []).map((t) => HAB_BY_ID.get(t)?.en).filter(Boolean) as string[],
            dietIds: e.d || [],
            habitatIds: e.h || [],
            dietLabels: DIET_TAGS,
            habitatLabels: HABITAT_TAGS,
            meas,
            mass: m.mass ? String(m.mass) : '',
            wing: m.wing ? String(m.wing) : '',
            lengthCm: e.len || 0,
            lengthEstimated: !!score?.vEst,
            score,
            source: sources[id] || source,
            sources: sources[id] || '',
            version: `v${APP_VERSION.replace(/^v/, '')}`,
            artUrl,
          },
        });
      })
      .catch(() => {
        if (alive) { setBuiltFor(key); setState({ input: null, loading: false, failed: true }); }
      });

    return () => { alive = false; };
  }, [key, id, source, artUrl, lang, enabled]);

  /* key 變了但新卡未砌好 → 回「載入中」，避免顯示上一隻雀的卡 */
  if (builtFor !== key) return { input: null, loading: enabled, failed: false };
  return state;
}
