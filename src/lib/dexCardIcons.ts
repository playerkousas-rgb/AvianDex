/**
 * 卡面用的圖示集（inline SVG，零外部依賴）。
 *
 * 為甚麼自己畫，不用網上 icon library？
 *   1. 卡面要出 PNG，外部字型／圖示在 canvas 轉圖時會變成豆腐；
 *      內嵌 SVG 無論在預覽、PNG 匯出、列印都一模一樣。
 *   2. 圖鑑用色跟「目」走（23 套主色），圖示要跟得住 `currentColor`；
 *      成套 library 匯入會拖大 bundle（用戶 repo 的瘦身規矩）。
 *   3. 風格要統一：圓角粗線、雙色（主色＋奶油底），遠看都認得。
 *
 * 只畫「有真實數據支撐」的東西：
 *   食性 17 種、棲地 7 種、章節 9 個、IUCN 5 級。
 *   唔會畫「常見度」「特徵放大圈」——因為我們沒有那兩樣數據，
 *   畫上去就是假圖。
 */

export interface IconDef {
  /** SVG 內容（viewBox 0 0 48 48），用 currentColor 為線／主色 */
  body: string;
  /** 中文名 */
  zh: string;
  /** 英文名 */
  en: string;
}

/* 共用畫法：粗線、圓頭、圓角轉接，24 分格對齊 */
const S = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="currentColor"';

/* ------------------------------------------------------------------
 * 食性（對應 explorerIndex.json 的 dietTags id）
 * ------------------------------------------------------------------ */
export const DIET_ICONS: Record<string, IconDef> = {
  insect: {
    zh: '昆蟲', en: 'Insects',
    body: `<g ${S}><ellipse cx="24" cy="27" rx="7" ry="9"/><path d="M24 18v18M17.5 21h13M18 27h12M18.5 33l-3 5M29.5 33l3 5M19 22l-7-6M29 22l7-6M21 19l-4-7M27 19l4-7"/></g>`,
  },
  fish: {
    zh: '魚類', en: 'Fish',
    body: `<g ${S}><path d="M8 24c5-8 15-9 22-5l8-5v10l8 5-8 5v10l-8-5c-7 4-17 3-22-5a7 7 0 0 1 0 0z" transform="translate(-4 0) scale(.86)"/><circle cx="17" cy="22" r="1.8" ${F}/></g>`,
  },
  amphibian: {
    zh: '蛙類', en: 'Frogs',
    body: `<g ${S}><ellipse cx="24" cy="26" rx="12" ry="9"/><circle cx="16.5" cy="17" r="4"/><circle cx="31.5" cy="17" r="4"/><circle cx="16.5" cy="17" r="1.2" ${F}/><circle cx="31.5" cy="17" r="1.2" ${F}/><path d="M13 32l-4 8M35 32l4 8M18 35v7M30 35v7M20 25h8"/></g>`,
  },
  reptile: {
    zh: '爬蟲類', en: 'Reptiles',
    body: `<g ${S}><path d="M9 30c6-10 18-12 25-7 3 2 5 6 5 6M9 30l-3 4M14 26l-4-4M20 23l-2-6M27 22v-6M33 24l3-5"/><circle cx="40" cy="27" r="1.6" ${F}/></g>`,
  },
  crustacean: {
    zh: '蟹蝦', en: 'Crabs & Shrimp',
    body: `<g ${S}><ellipse cx="24" cy="27" rx="9" ry="7"/><path d="M15 23l-6-5M33 23l6-5M15 29l-8 2M33 29l8 2M18 33l-4 7M22 34l-1 7M26 34l1 7M30 33l4 7"/><path d="M9 18l-5-3M39 18l5-3"/></g>`,
  },
  mollusc: {
    zh: '螺貝', en: 'Shells',
    body: `<g ${S}><path d="M24 10a13 13 0 1 1-9 22c-4-4-4-11 0-15a7 7 0 1 1 10 10"/><path d="M12 34h24a4 4 0 0 1-4 6H16a4 4 0 0 1-4-6z"/></g>`,
  },
  worm: {
    zh: '蠕蟲', en: 'Worms',
    body: `<g ${S}><path d="M8 30c4-10 10 8 14-2s10 8 14-2"/><path d="M8 38c4-10 10 8 14-2s10 8 14-2"/><circle cx="41" cy="26" r="1.4" ${F}/></g>`,
  },
  spider: {
    zh: '蜘蛛', en: 'Spiders',
    body: `<g ${S}><circle cx="24" cy="27" r="7"/><path d="M18 22l-9-6M30 22l9-6M17 27h-11M31 27h11M18 32l-9 7M30 32l9 7M20 34l-7 10M28 34l7 10"/><circle cx="24" cy="27" r="1.6" ${F}/></g>`,
  },
  fruit: {
    zh: '果實', en: 'Fruit',
    body: `<g ${S}><circle cx="24" cy="28" r="12"/><path d="M24 16V9M24 12c4-4 9-4 11-2-2 4-7 5-11 2z" ${F}/><path d="M18 24a5 5 0 0 1 4-4"/></g>`,
  },
  seed: {
    zh: '種子穀物', en: 'Seeds & Grain',
    body: `<g ${S}><path d="M24 40V14"/><path d="M24 20c-5 0-9-4-9-9 5 0 9 4 9 9z" ${F}/><path d="M24 28c5 0 9-4 9-9-5 0-9 4-9 9z" ${F}/><path d="M24 36c-5 0-9-4-9-9 5 0 9 4 9 9z" ${F}/></g>`,
  },
  nectar: {
    zh: '花蜜', en: 'Nectar',
    body: `<g ${S}><circle cx="24" cy="20" r="4"/><path d="M24 24c-6 0-10 4-10 8s4 6 10 6 10-2 10-6-4-8-10-8z"/><path d="M24 16V8M17 18l-6-4M31 18l6-4"/></g>`,
  },
  bud: {
    zh: '嫩芽花葉', en: 'Buds & Leaves',
    body: `<g ${S}><path d="M10 38c0-14 10-24 26-26 0 16-10 26-26 26z" ${F}/><path d="M10 38c6-8 13-14 22-19"/></g>`,
  },
  carrion: {
    zh: '腐肉', en: 'Carrion',
    body: `<g ${S}><path d="M14 34l20-20"/><circle cx="11" cy="37" r="4"/><circle cx="17" cy="31" r="3.4"/><circle cx="31" cy="17" r="3.4"/><circle cx="37" cy="11" r="4"/></g>`,
  },
  rodent: {
    zh: '鼠類', en: 'Rodents',
    body: `<g ${S}><path d="M12 32c0-8 5-14 13-14s12 4 12 10-5 10-12 10H14"/><circle cx="15" cy="15" r="5"/><path d="M12 32c-4 0-6 3-6 6M37 30c4 2 5 5 3 8"/><circle cx="32" cy="26" r="1.4" ${F}/></g>`,
  },
  bird: {
    zh: '其他鳥類', en: 'Other Birds',
    body: `<g ${S}><path d="M10 32c6-2 8-8 12-10s9-1 12 3c2 3 2 6 1 9M10 32l-3 6M35 34l4 4"/><circle cx="30" cy="24" r="1.4" ${F}/><path d="M22 22l-3-6"/></g>`,
  },
  plant: {
    zh: '植物藻類', en: 'Plants & Algae',
    body: `<g ${S}><path d="M10 38c8-2 12-8 14-18 6 4 8 10 6 16-4 4-14 4-20 2z"/><path d="M18 20c2-6 7-9 14-8-1 7-6 11-14 8z" ${F}/><path d="M24 38v6M16 40v4M32 40v4"/></g>`,
  },
  omnivore: {
    zh: '雜食', en: 'Omnivore',
    body: `<g ${S}><path d="M8 26h32a16 16 0 0 1-32 0z"/><path d="M8 40h32"/><path d="M20 20c-3-3-3-7 0-10 3 3 3 7 0 10z" ${F}/><path d="M30 20c0-4 2-7 5-8 1 4-1 8-5 8z" ${F}/></g>`,
  },
};

/* ------------------------------------------------------------------
 * 棲地（對應 habitatTags id）
 * ------------------------------------------------------------------ */
export const HABITAT_ICONS: Record<string, IconDef> = {
  forest: {
    zh: '森林', en: 'Forest',
    body: `<g ${S}><path d="M17 8l9 13h-5l7 10H6l7-10h-5z" ${F}/><path d="M17 31v9M32 14l8 12h-4l6 9H24l5-9h-3z" ${F}/><path d="M32 35v5M8 44h32"/></g>`,
  },
  wetland: {
    zh: '濕地', en: 'Wetland',
    body: `<g ${S}><path d="M16 40V14M16 24c-6 0-8-4-8-8 5 0 8 4 8 8zM16 32c6 0 8-4 8-8-5 0-8 4-8 8z" ${F}/><path d="M30 40V22"/><ellipse cx="30" cy="19" rx="4" ry="6" ${F}/><path d="M6 40h36M4 45h40"/></g>`,
  },
  water: {
    zh: '水邊', en: 'Waterside',
    body: `<g ${S}><path d="M6 24c5 0 5-4 10-4s5 4 10 4 5-4 10-4 5 4 6 4"/><path d="M6 32c5 0 5-4 10-4s5 4 10 4 5-4 10-4 5 4 6 4"/><path d="M6 40c5 0 5-4 10-4s5 4 10 4 5-4 10-4 5 4 6 4"/><path d="M14 12l4-6M22 12l4-6"/></g>`,
  },
  grassland: {
    zh: '草地農田', en: 'Grassland & Farmland',
    body: `<g ${S}><path d="M8 40V26M14 40V20M20 40V28M26 40V22M32 40V27M38 40V23"/><path d="M12 20l2-8 2 8M24 16l2-9 2 9" ${F}/><path d="M4 44h40"/></g>`,
  },
  urban: {
    zh: '城市公園', en: 'Urban & Parks',
    body: `<g ${S}><path d="M6 42V22h12v20M18 42V14h13v28M31 42V26h11v16" /><path d="M10 27h4M10 33h4M23 20h3M23 26h3M23 32h3M35 31h3M35 37h3" ${F}/><path d="M3 44h42"/></g>`,
  },
  mountain: {
    zh: '山地', en: 'Mountains',
    body: `<g ${S}><path d="M4 40l12-22 8 12 5-7 11 17z" ${F}/><path d="M13 25l3-5 3 5-3 2z" fill="#fff"/><path d="M25 30l4-6 4 7-4 2z" fill="#fff"/></g>`,
  },
  open: {
    zh: '開闊地', en: 'Open Country',
    body: `<g ${S}><circle cx="24" cy="16" r="6"/><path d="M4 34h40M4 40h40M10 28h28"/><path d="M14 28l4-6M24 28v-6M34 28l-4-6"/></g>`,
  },
};

/* ------------------------------------------------------------------
 * 章節／介面圖示
 * ------------------------------------------------------------------ */
export const UI_ICONS: Record<string, IconDef> = {
  taxonomy: { zh: '分類', en: 'Taxonomy', body: `<g ${S}><rect x="17" y="6" width="14" height="9" rx="2"/><rect x="4" y="33" width="14" height="9" rx="2"/><rect x="30" y="33" width="14" height="9" rx="2"/><path d="M24 15v9M11 33v-9h26v9"/></g>` },
  ruler: { zh: '量度', en: 'Measurements', body: `<g ${S}><rect x="4" y="18" width="40" height="12" rx="2"/><path d="M12 18v6M20 18v9M28 18v6M36 18v9"/></g>` },
  map: { zh: '分佈', en: 'Range', body: `<g ${S}><path d="M6 12l12-4 12 4 12-4v28l-12 4-12-4-12 4z"/><path d="M18 8v28M30 12v28"/><circle cx="24" cy="22" r="4" ${F}/></g>` },
  feather: { zh: '外形', en: 'Appearance', body: `<g ${S}><path d="M38 8c-14 0-24 10-24 22l-6 10"/><path d="M38 8c2 12-8 24-20 24-4 0-4-4-4-4"/><path d="M36 12l-20 24M33 20l-13 3"/></g>` },
  feed: { zh: '食物', en: 'Feeding', body: `<g ${S}><path d="M10 10v10c0 5 4 8 8 8s8-3 8-8V10M18 28v12"/><path d="M34 10c-4 0-6 5-6 11s2 9 6 9 6-3 6-9-2-11-6-11z" ${F}/></g>` },
  nest: { zh: '繁殖', en: 'Breeding', body: `<g ${S}><path d="M6 26a18 12 0 0 0 36 0z" ${F}/><ellipse cx="18" cy="20" rx="5" ry="7"/><ellipse cx="27" cy="19" rx="4.4" ry="6"/><path d="M6 26h36"/></g>` },
  behaviour: { zh: '行為', en: 'Behaviour', body: `<g ${S}><path d="M14 20c0-4 4-6 8-6s8 2 8 6c0 6-6 8-6 12"/><circle cx="19" cy="14" r="5"/><circle cx="32" cy="34" r="4"/><circle cx="20" cy="36" r="4"/><circle cx="40" cy="20" r="3"/></g>` },
  funfact: { zh: '冷知識', en: 'Fun fact', body: `<g ${S}><path d="M16 32a12 12 0 1 1 16 0c-2 2-2 4-2 6H18c0-2 0-4-2-6z"/><path d="M19 42h10M20 45h8"/></g>` },
  voice: { zh: '鳴聲', en: 'Voice', body: `<g ${S}><path d="M12 30h6l8 8V10l-8 8h-6z" ${F}/><path d="M32 18c4 3 4 9 0 12M37 13c7 6 7 16 0 22"/></g>` },
  iucn: { zh: 'IUCN', en: 'IUCN', body: `<g ${S}><path d="M24 6l16 8v11c0 9-7 15-16 17-9-2-16-8-16-17V14z"/><path d="M17 24l5 6 10-11"/></g>` },
  source: { zh: '出處', en: 'Sources', body: `<g ${S}><path d="M10 6h18l10 10v26H10z"/><path d="M28 6v10h10M16 26h16M16 34h16"/></g>` },
  migration: { zh: '遷徙', en: 'Migration', body: `<g ${S}><path d="M6 34h20a6 6 0 0 0 0-12H14a6 6 0 0 1 0-12h16"/><path d="M26 6l6 4-6 4M22 38l-6 4 6 4" ${F}/></g>` },
  people: { zh: '人與鳥', en: 'People', body: `<g ${S}><circle cx="17" cy="15" r="6"/><path d="M6 40c0-7 5-11 11-11s11 4 11 11"/><circle cx="34" cy="18" r="4.5"/><path d="M28 40c0-6 3-9 6-9s6 3 6 9"/></g>` },
  shield: { zh: '保育', en: 'Conservation', body: `<g ${S}><path d="M24 6l15 7v11c0 9-6 15-15 17-9-2-15-8-15-17V13z"/><path d="M18 24h12M24 18v12" ${F}/></g>` },
  length: { zh: '身長', en: 'Length', body: `<g ${S}><path d="M4 24h40M4 18v12M44 18v12M14 20v8M24 20v8M34 20v8"/></g>` },
  weight: { zh: '體重', en: 'Mass', body: `<g ${S}><path d="M12 16h24l4 24H8z"/><path d="M18 16a6 6 0 0 1 12 0"/><path d="M24 24v8M20 28h8"/></g>` },
};

/** 由 id 找圖示；食性／棲地／介面三張表一齊查 */
export function icon(id: string): IconDef | undefined {
  return DIET_ICONS[id] || HABITAT_ICONS[id] || UI_ICONS[id];
}

/** 產生可直接塞入 HTML 字串的 inline SVG */
export function svgIcon(id: string, size = 24, cls = ''): string {
  const def = icon(id);
  if (!def) return '';
  return `<svg class="ic ${cls}" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">${def.body}</svg>`;
}

/** 五級 IUCN → 護盾顏色（卡面的量尺用） */
export const IUCN_LEVELS = [
  { code: 'LC', zh: '無危', en: 'Least Concern', color: '#1c7a4e' },
  { code: 'NT', zh: '近危', en: 'Near Threatened', color: '#8a7c12' },
  { code: 'VU', zh: '易危', en: 'Vulnerable', color: '#a87413' },
  { code: 'EN', zh: '瀕危', en: 'Endangered', color: '#b04a1e' },
  { code: 'CR', zh: '極危', en: 'Critically Endangered', color: '#8f1f22' },
] as const;

export function iucnIndex(raw?: string): number {
  if (!raw) return -1;
  const s = String(raw);
  for (let i = IUCN_LEVELS.length - 1; i >= 0; i -= 1) {
    if (new RegExp(`\\b${IUCN_LEVELS[i].code}\\b`).test(s) || s.includes(IUCN_LEVELS[i].zh)) return i;
  }
  if (s.includes('數據缺乏') || /\bDD\b/.test(s)) return -1;
  return -1;
}
