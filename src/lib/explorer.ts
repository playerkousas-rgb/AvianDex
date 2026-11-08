/**
 * AvianDex — 圖鑑索引（搜尋 / 屬性 / 相似鳥）
 * ------------------------------------------------------------
 * 一隻雀可以由好多條線索搵到：名（中／英／學名／編號）、分類（目／科／綱）、
 * 屬性（食乜、住邊）。真人翻書就是這樣翻的，所以索引要一次過支援這幾條線。
 *
 * 資料來源：src/data/explorerIndex.json（由 npm run cards:explorer 產生），
 * 只有幾十 KB；不要為了搜尋而載入 2.8 MB 的 cardCopy.json。
 */
import raw from '../data/explorerIndex.json';

export type Lang = 'zh' | 'en';

export interface ExplorerEntry {
  z: string;
  e: string;
  s: string;
  o: string;
  f: string;
  oz: string;
  fz: string;
  code: string;
  n: string[];
  d: string[];
  h: string[];
  len: number;
}

export interface TagDef {
  id: string;
  zh: string;
  en: string;
}

export const DIET_TAGS = raw.dietTags as TagDef[];
export const HABITAT_TAGS = raw.habitatTags as TagDef[];
export const ENTRIES = raw.birds as Record<string, ExplorerEntry>;

const DIET_BY_ID = new Map(DIET_TAGS.map((t) => [t.id, t]));
const HABITAT_BY_ID = new Map(HABITAT_TAGS.map((t) => [t.id, t]));

export const tagLabel = (id: string, lang: Lang): string => {
  const t = DIET_BY_ID.get(id) || HABITAT_BY_ID.get(id);
  return t ? t[lang] : id;
};

export const dietLabel = (id: string, lang: Lang) => tagLabel(id, lang);
export const habitatLabel = (id: string, lang: Lang) => tagLabel(id, lang);

/** 屬性篩選：組內 OR、組間 AND（食昆蟲 ＋ 住森林 ＝ 兩樣都要中） */
export interface Facets {
  diet: string[];
  habitat: string[];
  /** 'any' = 有任一標籤；'all' = 全部標籤都要中（進階用） */
  mode?: 'any' | 'all';
}

export const emptyFacets = (): Facets => ({ diet: [], habitat: [], mode: 'any' });

const matchFacet = (have: string[], want: string[], mode: 'any' | 'all') => {
  if (!want.length) return true;
  return mode === 'all' ? want.every((w) => have.includes(w)) : want.some((w) => have.includes(w));
};

/** 用屬性標籤過濾一組 id；回傳仍然符合的 id（保持原次序） */
export function filterByFacets(ids: string[], facets: Facets): string[] {
  const mode = facets.mode || 'any';
  if (!facets.diet.length && !facets.habitat.length) return ids;
  return ids.filter((id) => {
    const e = ENTRIES[id];
    if (!e) return false;
    return matchFacet(e.d, facets.diet, mode) && matchFacet(e.h, facets.habitat, mode);
  });
}

/**
 * 搜尋評分。同 searchBirds 一樣「英文／學名為權威」，但多三條線索：
 *   中文目／科（雀形目、翠鳥科）、屬性（昆蟲、森林）、別名。
 * 分數只是次序，唔影響邊隻雀出現。
 */
export interface IndexHit {
  id: string;
  score: number;
  /** 命中原因，用於「為何這隻雀出現」提示 */
  via: 'name' | 'scientific' | 'taxonomy' | 'alias' | 'attribute' | 'id';
}

export function searchIndex(query: string, lang: Lang = 'zh'): IndexHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: IndexHit[] = [];
  for (const [id, e] of Object.entries(ENTRIES)) {
    const zh = e.z.toLowerCase();
    const en = e.e.toLowerCase();
    const sci = e.s.toLowerCase();
    let score = 0;
    let via: IndexHit['via'] = 'name';

    if (en && en === q) { score = 120; via = 'name'; }
    else if (sci && sci === q) { score = 115; via = 'scientific'; }
    else if (zh && zh === q) { score = 110; via = 'name'; }
    else if (e.code && e.code.toLowerCase() === q) { score = 108; via = 'taxonomy'; }
    else if (en.startsWith(q) || zh.startsWith(q)) { score = 96; via = 'name'; }
    else if (sci.startsWith(q)) { score = 92; via = 'scientific'; }
    else if (en.includes(q)) { score = 86; via = 'name'; }
    else if (zh.includes(q)) { score = 82; via = 'name'; }
    else if (sci.includes(q)) { score = 74; via = 'scientific'; }
    else if (e.n.some((a) => a.toLowerCase().includes(q))) { score = 70; via = 'alias'; }
    else if (e.fz.includes(q) || e.oz.includes(q)) { score = 62; via = 'taxonomy'; }
    else if (e.f.toLowerCase().includes(q) || e.o.toLowerCase().includes(q)) { score = 56; via = 'taxonomy'; }
    else if (id.includes(q)) { score = 50; via = 'id'; }
    else {
      /* 屬性：打「昆蟲」「森林」「食魚」都應該搵到 */
      const tagHit = [...e.d, ...e.h]
        .map((t) => tagLabel(t, lang))
        .filter((label) => label.toLowerCase().includes(q));
      if (tagHit.length) { score = 30 + tagHit.length; via = 'attribute'; }
    }

    if (score > 0) hits.push({ id, score, via });
  }

  return hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export interface SimilarBird {
  id: string;
  score: number;
  /** 相似原因（已翻譯），例如「同科・都食昆蟲」 */
  reasons: string[];
}

/**
 * 相似鳥類。
 * 權重：同科 40 ＞ 同目 15；每個共同食物標籤 8、共同環境標籤 6；
 * 體長相差 20% 以內 6 分（愈接近愈高）。同屬另外加 10。
 * 這正是書本做不到的事：一撳就見到「最易撈亂嘅幾隻」。
 */
export function similarBirds(id: string, limit = 8, lang: Lang = 'zh'): SimilarBird[] {
  const me = ENTRIES[id];
  if (!me) return [];
  const myGenus = (me.s.split(' ')[0] || '').toLowerCase();

  const out: SimilarBird[] = [];
  for (const [otherId, e] of Object.entries(ENTRIES)) {
    if (otherId === id) continue;
    let score = 0;
    const reasons: string[] = [];

    if (me.f && e.f === me.f) { score += 40; reasons.push(lang === 'en' ? 'Same family' : '同科'); }
    else if (me.o && e.o === me.o) { score += 15; reasons.push(lang === 'en' ? 'Same order' : '同目'); }

    if (myGenus && e.s.toLowerCase().startsWith(myGenus + ' ')) {
      score += 10;
      reasons.push(lang === 'en' ? 'Same genus' : '同屬');
    }

    const sharedDiet = e.d.filter((t) => me.d.includes(t));
    if (sharedDiet.length) {
      score += sharedDiet.length * 8;
      reasons.push((lang === 'en' ? 'Eats ' : '食') + sharedDiet.map((t) => tagLabel(t, lang)).join('、'));
    }

    const sharedHab = e.h.filter((t) => me.h.includes(t));
    if (sharedHab.length) {
      score += sharedHab.length * 6;
      reasons.push((lang === 'en' ? 'Lives in ' : '住') + sharedHab.map((t) => tagLabel(t, lang)).join('、'));
    }

    if (me.len > 0 && e.len > 0) {
      const diff = Math.abs(me.len - e.len) / me.len;
      if (diff <= 0.2) { score += 6; reasons.push(lang === 'en' ? 'Similar size' : '體型接近'); }
      else if (diff <= 0.4) score += 3;
    }

    if (score > 0) out.push({ id: otherId, score, reasons: reasons.slice(0, 3) });
  }

  return out.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
}

/** 覆蓋率統計（俾「資料完整度」頁用） */
export function coverage() {
  const all = Object.values(ENTRIES);
  return {
    total: all.length,
    withDiet: all.filter((e) => e.d.length).length,
    withHabitat: all.filter((e) => e.h.length).length,
    withAlias: all.filter((e) => e.n.length).length,
    withLength: all.filter((e) => e.len > 0).length,
  };
}
