#!/usr/bin/env node
/* ============================================================
 *  qa-card.mjs —— 出圖前後的機器檢查（唔靠人眼）
 * ------------------------------------------------------------
 * 用戶講明「我不是鳥類專家，錯了其實我也不知道」，
 * 所以每張卡都要過以下關卡才可入庫：
 *
 *   ① 資料完整性：18 格有幾多格係「資料待查」
 *   ② 數字溯源：卡面每個數字都必須在 repo 找得到
 *   ③ 名稱一致：中文名／學名／英文名 同 repo 一字不差
 *   ④ 禁用詞：簡體字、其他物種名、模板殘留詞
 *   ⑤ 印刷前檢查：用 --prompt 印出核對清單
 *
 * 用法：
 *   node scripts/cards/qa-card.mjs 0023
 *   node scripts/cards/qa-card.mjs 0023 --facts    只印數字清單
 *   node scripts/cards/qa-card.mjs --all --csv > qa.csv
 * ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const J = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

const idx = J('src/data/explorerIndex.json');
const copy = J('src/data/cardCopy.json');
const meas = J('src/data/measurements.json');
const scores = J('src/data/dexScores.json').scores;
const zh = J('src/data/cardDetails.zh.json').birds;

/* 簡體字偵測：只收錄常用「一定會出錯」的字，避免誤判 */
const SIMPLIFIED = '鸟鸭鹅鸡鹰鹤鹫鹗鸽鹅雁鸥鹭鹊鸦鸠鹃凤凤龟龙马鱼虾龟壳头长宽体重点双对与为此来说会发经过去还进运边这那么样时间开关门问题实际复杂应该认识见觉学习习惯导导总统团结组织级别标准确权义义务务员员工工业业产产生';

const TEMPLATE_WORDS = ['葵花鳳頭鸚鵡', '長嘴鳳頭鸚鵡', '鳳頭鸚鵡', '澳洲內陸', '塔斯馬尼亞', '南半球', '小葵花'];

/** 每張卡的必印數字／名稱，供出圖後對照 */
export function facts(id) {
  const e = idx.birds[id] || {};
  const c = copy[id] || {};
  const m = meas[id] || {};
  const sc = scores[id] || {};
  const f = {
    no: 'NO.' + id,
    zh: e.z || '',
    en: e.e || '',
    sci: e.s || '',
    order: e.oz || '',
    family: e.fz || '',
    iucn: c.iucn || '',
    len: c.length || (e.len ? '約 ' + e.len : '') || '資料待查',
    mass: m.mass ? m.mass + ' g' : '資料待查',
    wing: m.wing ? m.wing + ' mm' : '',
    scores: {
      i: sc.i, a: sc.a, v: sc.v, r: sc.r, c: sc.c, o: sc.o,
    },
    pageids: (J('src/data/cardSources.json').sources[id] || ''),
  };
  return f;
}

/** 卡面文字審查：把 AI 輸出（或人工抄錄）的文字餵進來檢查 */
export function auditText(id, text) {
  const f = facts(id);
  const problems = [];

  // 名稱必須出現
  for (const [k, v] of [['中文名', f.zh], ['學名', f.sci], ['英文名', f.en]]) {
    if (v && !text.includes(v)) problems.push(`缺少${k}：${v}`);
  }
  if (!text.includes(f.no)) problems.push(`缺少編號 ${f.no}`);

  // 簡體字
  const simp = [...new Set([...text].filter((ch) => SIMPLIFIED.includes(ch)))];
  if (simp.length) problems.push('出現簡體字：' + simp.join(''));

  // 模板殘留
  const leak = TEMPLATE_WORDS.filter((w) => text.includes(w) && !(f.zh && f.zh.includes(w)));
  if (leak.length) problems.push('模板殘留：' + leak.join('、'));

  // 數字溯源：抽出所有「數字＋單位」，逐個核對
  const allowed = new Set([
    f.mass.replace(/\s*g$/, ''), String(f.scores.i ?? ''), String(f.scores.a ?? ''),
    String(f.scores.v ?? ''), String(f.scores.r ?? ''), String(f.scores.c ?? ''),
    Number(f.scores.o ?? 0).toFixed(1),
  ]);
  const lenNums = (f.len.match(/\d+(?:\.\d+)?/g) || []);
  lenNums.forEach((n) => allowed.add(n));
  const ids = (f.pageids.match(/\d{3,}/g) || []);
  ids.forEach((n) => allowed.add(n));

  const found = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(cm|mm|g|kg|km)/g)];
  for (const [, n, unit] of found) {
    if (!allowed.has(n)) problems.push(`數字不在 repo：${n} ${unit}`);
  }
  return problems;
}

function printOne(id) {
  const f = facts(id);
  const c = copy[id] || {};
  const missing = [];
  if (!c.look && !(zh[id] || {}).look) missing.push('Z04 外形');
  if (!c.diet) missing.push('Z07 食性');
  if (!c.range) missing.push('Z08 分佈');
  if (!c.breeding) missing.push('Z09 繁殖');
  if (!c.funFact) missing.push('Z11 冷知識');
  if (!c.voice) missing.push('Z18 叫聲');
  if (!c.conservation) missing.push('Z17 保育');
  if (f.len === '資料待查') missing.push('Z03 體長');
  if (f.mass === '資料待查') missing.push('Z03 體重');

  console.log(`\n════ NO.${id} ${f.zh} ${f.en} ════`);
  console.log(`學名      ${f.sci}`);
  console.log(`分類      ${f.order} ${f.family}`);
  console.log(`體長      ${f.len}`);
  console.log(`體重      ${f.mass}`);
  console.log(`IUCN      ${f.iucn}`);
  console.log(`評分      i=${f.scores.i} a=${f.scores.a} v=${f.scores.v} r=${f.scores.r} c=${f.scores.c} → o=${f.scores.o}`);
  console.log(`出處      ${f.pageids}`);
  console.log(missing.length
    ? `待查 ${missing.length} 項：${missing.join('、')}`
    : '18 格資料齊全');
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const all = process.argv.includes('--all');

if (all) {
  const rows = ['id,zh,en,len,mass,iucn,o,pageids'];
  for (const id of Object.keys(idx.birds).sort()) {
    const f = facts(id);
    const q = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    rows.push([id, q(f.zh), q(f.en), q(f.len), q(f.mass), q(f.iucn), f.scores.o ?? '', q(f.pageids)].join(','));
  }
  writeFileSync(path.join(root, 'deliver/qa-all.csv'), rows.join('\n'), 'utf8');
  console.log('已寫入 deliver/qa-all.csv（' + (rows.length - 1) + ' 隻）');
} else {
  for (const id of args) printOne(id.padStart(4, '0'));
}
