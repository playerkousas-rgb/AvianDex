#!/usr/bin/env node
/* 輸出每隻鳥「卡面要印的字」成 JSON，給 compose-card.py 用（所有數字／名稱都來自 repo 資料，不經 AI）
 * 用法：node scripts/cards/export-card-fields.mjs [輸出檔，預設 stdout] */
import fs from 'node:fs';
import { liteFields } from './gen-card-prompts.mjs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const idx = JSON.parse(fs.readFileSync(path.join(root, 'src/data/explorerIndex.json'), 'utf8'));
const out = {};
for (const id of Object.keys(idx.birds).sort()) {
  const f = liteFields(id), e = f.e, sc = f.sc || {};
  const n1 = (x) => (x == null || x === '' || Number.isNaN(Number(x)) ? null : Number(x).toFixed(1));
  out[id] = {
    id, z: e.z, e: e.e, s: e.s, order: [e.oz || null, e.o || null], family: [e.fz || null, e.f || null],
    genus: f.genus || null, epithet: f.epi || null,
    len: f.len, mass: f.mass,
    iucn: { code: f.code, zh: f.iucnZh },
    hab: f.hab, diet: f.diet, sim: f.sim, range: String(f.c.range || '').slice(0, 120),
    score: { i: n1(sc.i), a: n1(sc.a), r: n1(sc.r), c: n1(sc.c), v: n1(sc.v), o: n1(sc.o) },
  };
}
const json = JSON.stringify(out, null, 1);
if (process.argv[2]) fs.writeFileSync(process.argv[2], json); else console.log(json);
