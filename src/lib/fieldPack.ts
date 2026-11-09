/**
 * 野外離線包（Field Pack）
 *
 * 為甚麼要做？
 *   用戶的目標是「取代帶書去野外翻」。所以真正的考驗不是有幾多欄，
 *   而是：在沒有網絡的郊野公園，撳落去仲有冇嘢睇。
 *
 * 本模組負責：
 *   1. 把「野外要用的最小資料集」寫進 localStorage（可離線）
 *   2. 圖卡本身交給 Service Worker 快取（見 public/sw.js）
 *   3. 讓 UI 顯示「已下載」與資料日期，唔會假裝有最新資料
 *
 * 最小資料集（每隻雀約 1–2 KB）：
 *   id / 中文名 / 英文名 / 學名 / 目 / 科 / 食性標籤 / 生境標籤 /
 *   12 欄文字（截短至每欄 300 字）/ 相似鳥不需要（可即時算）
 *
 * 為甚麼截短？
 *   569 隻 × 12 欄全文 ≈ 3.7 MB，localStorage 上限約 5 MB，會爆。
 *   離線時要的是「認得、講得出重點」，不是逐字全文。
 */

import type { Lang } from './explorer';

const PACK_KEY = 'aviandex.fieldpack.v1';
const PACK_META = 'aviandex.fieldpack.meta.v1';
const MAX_CHARS_PER_FIELD = 300;

export interface FieldPackBird {
  z: string;          // 中文名
  e: string;          // 英文名
  s: string;          // 學名
  oz?: string;        // 目（中文）
  fz?: string;        // 科（中文）
  o?: string;         // 目（拉丁）
  f?: string;         // 科（拉丁）
  d?: string[];       // 食性標籤 id
  h?: string[];       // 生境標籤 id
  t?: Record<string, string>;   // 12 欄文字（已截短）
}

export type FieldPack = Record<string, FieldPackBird>;

export interface FieldPackMeta {
  savedAt: string;
  count: number;
  lang: Lang;
  bytes: number;
}

const FIELDS = [
  'look', 'diet', 'habitat', 'range', 'breeding', 'funFact',
  'voice', 'behavior', 'migration', 'conservation', 'humanRelation', 'etymology',
] as const;

function trimField(v: unknown): string {
  if (typeof v === 'string') return v.slice(0, MAX_CHARS_PER_FIELD);
  if (Array.isArray(v)) return v.filter(Boolean).join('；').slice(0, MAX_CHARS_PER_FIELD);
  return '';
}

/** 由 explorer 索引 + 詳細資料建立離線包（不依賴網絡） */
export function buildPack(
  index: Record<string, { z?: string; e?: string; s?: string; oz?: string; fz?: string; o?: string; f?: string; d?: string[]; h?: string[] }>,
  details: Record<string, Record<string, string | string[]>>,
): FieldPack {
  const pack: FieldPack = {};
  for (const [id, e] of Object.entries(index)) {
    const t: Record<string, string> = {};
    const src = details[id] ?? {};
    for (const f of FIELDS) {
      const v = trimField(src[f]);
      if (v) t[f] = v;
    }
    pack[id] = {
      z: e.z ?? '', e: e.e ?? '', s: e.s ?? '',
      oz: e.oz, fz: e.fz, o: e.o, f: e.f,
      d: e.d, h: e.h, t,
    };
  }
  return pack;
}

export function savePack(pack: FieldPack, lang: Lang): FieldPackMeta {
  const json = JSON.stringify(pack);
  const meta: FieldPackMeta = {
    savedAt: new Date().toISOString(),
    count: Object.keys(pack).length,
    lang,
    bytes: new Blob([json]).size,
  };
  localStorage.setItem(PACK_KEY, json);
  localStorage.setItem(PACK_META, JSON.stringify(meta));
  return meta;
}

export function loadPack(): FieldPack | null {
  try {
    const raw = localStorage.getItem(PACK_KEY);
    return raw ? (JSON.parse(raw) as FieldPack) : null;
  } catch {
    return null;
  }
}

export function readMeta(): FieldPackMeta | null {
  try {
    const raw = localStorage.getItem(PACK_META);
    return raw ? (JSON.parse(raw) as FieldPackMeta) : null;
  } catch {
    return null;
  }
}

export function clearPack(): void {
  localStorage.removeItem(PACK_KEY);
  localStorage.removeItem(PACK_META);
}

/** 離線時用這一份查（有就用，冇就回 undefined，UI 會照實講「未下載」） */
export function getOfflineBird(id: string): FieldPackBird | undefined {
  return loadPack()?.[id];
}

export function isOfflineReady(): boolean {
  return !!readMeta();
}
