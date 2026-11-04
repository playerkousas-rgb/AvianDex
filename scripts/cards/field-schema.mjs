#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 卡面欄位表（中英雙語）＋ 自動選欄
 * ------------------------------------------------------------
 *  為什麼要有這一份？
 *    卡面是「有 10 項資料就揀 7 項最好看的印，只有 7 項就 7 項全印」。
 *    如果每支工具各自決定印邊 7 項，就會出現「卡面工作室印 A、Pillow 印 B」。
 *    所以欄位表 + 排優次序只有這一份，其他全部 import 佢。
 *
 *  欄位分三層：
 *    core    － 一有就幾乎一定印（分佈／棲息／食物／Top5）
 *    strong  － 好有價值，夠位就印（外形／繁殖／冷知識／小貼士）
 *    extra   － 補位用（鳴聲／行為／遷徙／保育／名稱由來／人與鳥／注意事項）
 *
 *  中英同步：每個欄位都有 zh / en 兩組文字。選欄時「兩邊都有」會加分，
 *  令同一批卡的中文版與英文版可以共用同一套選欄結果（版面一致）。
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 卡面最多印幾個「資訊格」（不含左欄基本介紹／分類、評分卡） */
export const MAX_PICKS = 7;

/**
 * slot：
 *   grid4   － 兩排四欄（每排 4 格），即最多 8 格
 *   header  － 標題列（身長／體重／常見度）
 *   column  － 左欄（基本介紹／分類）
 *   score   － 評分卡
 */
export const FIELDS = [
  { id: 'range',        zh: '分佈地區',      en: 'Distribution',   tier: 'core',   slot: 'grid4', icon: '分', kind: 'para' },
  { id: 'habitat',      zh: '棲息環境',      en: 'Habitat',        tier: 'core',   slot: 'grid4', icon: '居', kind: 'para' },
  { id: 'diet',         zh: '食物',          en: 'Diet',           tier: 'core',   slot: 'grid4', icon: '食', kind: 'para' },
  { id: 'highlights',   zh: 'Top 5 特色亮點', en: 'Top 5 Highlights', tier: 'core', slot: 'grid4', icon: '五', kind: 'list' },
  { id: 'look',         zh: '外形特徵',      en: 'Appearance',     tier: 'strong', slot: 'grid4', icon: '形', kind: 'para' },
  { id: 'breeding',     zh: '成長與繁殖',    en: 'Breeding',       tier: 'strong', slot: 'grid4', icon: '育', kind: 'para' },
  { id: 'funFact',      zh: '有趣冷知識',    en: 'Fun Fact',       tier: 'strong', slot: 'grid4', icon: '知', kind: 'para' },
  { id: 'tips',         zh: '觀察小貼士',    en: 'Field Tips',     tier: 'strong', slot: 'grid4', icon: '貼', kind: 'list' },
  { id: 'voice',        zh: '鳴聲',          en: 'Voice',          tier: 'extra',  slot: 'grid4', icon: '聲', kind: 'para' },
  { id: 'behavior',     zh: '行為習性',      en: 'Behaviour',      tier: 'extra',  slot: 'grid4', icon: '行', kind: 'para' },
  { id: 'migration',    zh: '遷徙',          en: 'Migration',      tier: 'extra',  slot: 'grid4', icon: '遷', kind: 'para' },
  { id: 'conservation', zh: '保育現況',      en: 'Conservation',   tier: 'extra',  slot: 'grid4', icon: '保', kind: 'para' },
  { id: 'humanRelation',zh: '人與鳥',        en: 'Birds & People', tier: 'extra',  slot: 'grid4', icon: '人', kind: 'para' },
  { id: 'etymology',    zh: '名稱由來',      en: 'Name Origin',    tier: 'extra',  slot: 'grid4', icon: '名', kind: 'para' },
  { id: 'caution',      zh: '注意事項',      en: 'Watch Out',      tier: 'extra',  slot: 'grid4', icon: '注', kind: 'list' },
];

export const FIELD_BY_ID = Object.fromEntries(FIELDS.map((f) => [f.id, f]));
export const FIELD_IDS = FIELDS.map((f) => f.id);

/** 中文標題 → 欄位 id（舊資料用中文 key，例如 { 分佈地區: ... }） */
export const ZH_TO_ID = Object.fromEntries(FIELDS.map((f) => [f.zh, f.id]));

/** 每個欄位的中、英字數上限（超出會被排版截斷＝漏字） */
export const LIMITS = {
  zh: { range: 46, habitat: 46, diet: 46, funFact: 60, look: 74, breeding: 160, voice: 60,
    behavior: 60, migration: 60, conservation: 70, humanRelation: 70, etymology: 90, caution: 3 },
  en: { range: 160, habitat: 160, diet: 160, funFact: 200, look: 260, breeding: 420, voice: 200,
    behavior: 200, migration: 200, conservation: 240, humanRelation: 240, etymology: 300, caution: 3 },
};

/** 列表欄位的項數上限 */
export const LIST_CAP = { highlights: 5, tips: 4, caution: 3 };

/** 這個欄位有沒有內容（字串或列表都支援） */
export function has(v) {
  if (Array.isArray(v)) return v.filter((x) => String(x || '').trim()).length > 0;
  return String(v == null ? '' : v).trim().length > 0;
}

/**
 * 選欄：回傳印在卡面的欄位 id（已排序，最多 maxPicks 個）。
 *
 * @param {object} copy   卡片文案（可能有 zh 層與 en 層）
 * @param {object} [opt]
 * @param {number} [opt.maxPicks=MAX_PICKS]
 * @param {string[]} [opt.force] 一定要包含的欄位（例如有真雀相時想印 look）
 * @returns {{ picks: string[], dropped: string[], why: Record<string,string> }}
 */
export function chooseFields(copy = {}, opt = {}) {
  const maxPicks = opt.maxPicks ?? MAX_PICKS;
  const force = new Set(opt.force || []);
  const en = copy.en || {};
  const why = {};

  const scored = [];
  for (const f of FIELDS) {
    if (f.slot !== 'grid4') continue;
    const v = copy[f.id];
    if (!has(v)) continue;
    let score = { core: 30, strong: 20, extra: 10 }[f.tier];
    const both = has(v) && has(en[f.id]);
    if (both) score += 4;                       /* 中英同步 → 加分（兩個語言版本都可出） */
    if (Array.isArray(v)) score += Math.min(v.length, 5); /* 列表項數多一點更好看 */
    const len = String(Array.isArray(v) ? v.join('') : v).length;
    if (len < 12) score -= 3;                   /* 太短：卡面會好空 */
    if (f.id === 'look' && !copy.photo) score += 2; /* 冇相時外形就是主圖區的替補 */
    if (force.has(f.id)) score += 100;
    scored.push({ id: f.id, score, both });
    why[f.id] = `${f.tier}(${score})${both ? '·中英' : ''}`;
  }

  scored.sort((a, b) => b.score - a.score);
  const picks = scored.slice(0, maxPicks).map((x) => x.id);
  /* 保持版面慣性：核心欄位（分佈／棲息／食物／Top5）永遠排前面 */
  const order = Object.fromEntries(FIELDS.map((f, i) => [f.id, i]));
  picks.sort((a, b) => order[a] - order[b]);
  const dropped = scored.slice(maxPicks).map((x) => x.id);
  return { picks, dropped, why };
}

/* CLI：--json → 輸出 scripts/cards/field-schema.json，供 Pillow 引擎讀取
 * （Python 不再重寫一次選欄規則，避免兩邊走樣） */
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && process.argv.includes('--json')) {
  const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'field-schema.json');
  fs.writeFileSync(out, JSON.stringify({ maxPicks: MAX_PICKS, fields: FIELDS }, null, 2) + '\n', 'utf8');
  console.log('✅ ' + path.relative(process.cwd(), out));
}

/** 舊格式（中文 key 直接寫在 copy 上）→ 標準格式（copy[fieldId]） */
export function normalizeCopy(raw = {}) {
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const id = ZH_TO_ID[k] || k;
    if (FIELD_BY_ID[id] || ['en', 'source', 'scores', 'score_notes', 'photo', 'sprite', 'aliases',
      'length', 'weight', 'rarity', 'iucn', 'intro_zh', 'intro_en', 'facts_note', 'notes', 'picks'].includes(id)) {
      out[id] = v;
    }
  }
  return out;
}
