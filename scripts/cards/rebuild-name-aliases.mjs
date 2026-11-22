#!/usr/bin/env node
/**
 * Rebuild src/data/nameAliases.ts strictly from the authoritative 583-species
 * roster (src/data/birds.json + src/data/birdTaxonomy.json + explorerIndex.json
 * + zh-name-codes.json keyed by exact eBird speciesCode).
 *
 * Replaces the legacy May 2026 alias table that paired species by Latin epithet
 * alone (e.g. mapping "暗綠繡眼鳥" -> 0017 普通鵟 and "白腰文鳥" -> 0010 灰胸秧雞).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const birds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birds.json'), 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birdTaxonomy.json'), 'utf8'));
const explorer = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/explorerIndex.json'), 'utf8')).birds || {};
const zhCodes = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/cards/zh-name-codes.json'), 'utf8')).species || [];

const toSimp = OpenCC.Converter({ from: 'hk', to: 'cn' });
const toTradHK = OpenCC.Converter({ from: 'cn', to: 'hk' });

const codeToZhNames = new Map();
for (const entry of zhCodes) {
  if (!entry.code || !entry.name) continue;
  if (!codeToZhNames.has(entry.code)) codeToZhNames.set(entry.code, new Set());
  codeToZhNames.get(entry.code).add(entry.name.trim());
  codeToZhNames.get(entry.code).add(toTradHK(entry.name.trim()));
}

const aliases = new Map();

function register(rawKey, id) {
  if (!rawKey) return;
  const key = String(rawKey).trim().toLowerCase();
  if (!key || key === 'unknown species' || key === 'scientific name' || key === '???') return;
  if (!aliases.has(key)) {
    aliases.set(key, id);
  }
}

// Pass 1: Primary authoritative names (HK Chinese, Clements English, Clements Scientific)
for (const bird of birds) {
  const id = bird.id;
  const tax = taxonomy[id] || {};
  register(bird.name, id);
  register(toSimp(bird.name), id);
  register(bird.en, id);
  register(tax.comName, id);
  register(tax.sciName, id);
}

// Pass 2: Explorer alternate names (TW checklist names) & exact eBird speciesCode Chinese synonyms
for (const bird of birds) {
  const id = bird.id;
  const tax = taxonomy[id] || {};
  const exp = explorer[id] || {};
  for (const alt of exp.n || []) {
    register(alt, id);
    register(toSimp(alt), id);
  }
  const extraZh = codeToZhNames.get(tax.speciesCode);
  if (extraZh) {
    for (const z of extraZh) {
      register(z, id);
      register(toSimp(z), id);
    }
  }
}

// Pass 3: Safe common vernacular synonyms in Hong Kong birding
const SAFE_HK_SYNONYMS = [
  ['麻雀', '0011'],
  ['相思', '0436'],
  ['暗綠繡眼鳥', '0436'],
  ['common buzzard', '0017'],
  ['eastern buzzard', '0017'],
];
for (const [k, id] of SAFE_HK_SYNONYMS) {
  register(k, id);
  register(toSimp(k), id);
}

const lines = [
  '// 此檔案由 scripts/cards/rebuild-name-aliases.mjs 依據 583 種權威名錄自動產生，請勿手動編輯。',
  '// 支援：香港中文名 / 台灣別名 / 簡體中文 / eBird 英文俗名 / Clements 學名 → 4 位圖鑑編號',
  '',
  'export const NAME_TO_ID: Record<string, string> = {',
];

for (const [k, id] of aliases.entries()) {
  lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(id)},`);
}

lines.push('};');
lines.push('');
lines.push('/** 把 AI 辨識或搜尋輸入的鳥名（英文俗名 / 學名 / 繁簡中文）轉成 4 位圖鑑 ID。 */');
lines.push('export function resolveBirdId(label: string): string | null {');
lines.push('  if (!label) return null;');
lines.push('  const key = label.trim().toLowerCase();');
lines.push('  if (!key) return null;');
lines.push('  if (NAME_TO_ID[key]) return NAME_TO_ID[key];');
lines.push("  if (key.includes('_')) {");
lines.push("    const parts = key.split('_').map((s) => s.trim()).filter(Boolean);");
lines.push('    for (const part of parts) {');
lines.push('      if (NAME_TO_ID[part]) return NAME_TO_ID[part];');
lines.push('    }');
lines.push('  }');
lines.push('  const norm = (s: string) => s.replace(/[\\s\\-\'’._()（）]+/g, \'\');');
lines.push('  const normKey = norm(key);');
lines.push('  if (normKey) {');
lines.push('    for (const [aliasKey, id] of Object.entries(NAME_TO_ID)) {');
lines.push('      if (norm(aliasKey) === normKey) return id;');
lines.push('    }');
lines.push('  }');
lines.push('  if (key.length >= 2) {');
lines.push('    let bestId: string | null = null;');
lines.push('    let bestLen = 0;');
lines.push('    for (const [aliasKey, id] of Object.entries(NAME_TO_ID)) {');
lines.push('      if (aliasKey.length < 2) continue;');
lines.push('      if (key.includes(aliasKey) && aliasKey.length > bestLen) {');
lines.push('        bestLen = aliasKey.length;');
lines.push('        bestId = id;');
lines.push('      }');
lines.push('    }');
lines.push('    if (bestId) return bestId;');
lines.push('  }');
lines.push('  return null;');
lines.push('}');
lines.push('');

const outPath = path.join(ROOT, 'src/data/nameAliases.ts');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Rebuilt src/data/nameAliases.ts with ${aliases.size} verified aliases across ${birds.length} species.`);
