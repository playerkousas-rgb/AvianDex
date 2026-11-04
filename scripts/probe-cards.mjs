#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 圖卡體檢工具（R2 上有幾多張圖？邊幾張唔見？）
 * ============================================================
 *  用途：一次過探測 0001..0569 的圖卡是否存在，輸出：
 *    1) public/data/card-manifest.json  → 前端加速用（可選）
 *    2) reports/card-audit.json / .md   → 缺圖清單（可直接照住上傳）
 *
 *  用法：
 *    node scripts/probe-cards.mjs                    # 全部檢查 + 寫報告 + manifest
 *    node scripts/probe-cards.mjs --limit 60         # 只查頭 60 張（快）
 *    node scripts/probe-cards.mjs --no-manifest      # 只寫報告
 *    node scripts/probe-cards.mjs --base https://cdn.example.com/aviandex
 *
 *  ⚠️ r2.dev 開發網域有速率限制：本工具限 6 個併發 + 自動重試，
 *     真的跑到大量 429 時會自動降速。
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ARGS = process.argv.slice(2);
const getArg = (name) => {
  const i = ARGS.indexOf(name);
  return i >= 0 ? ARGS[i + 1] : undefined;
};
const has = (name) => ARGS.includes(name);

const DEFAULT_BASE = 'https://pub-a9333a974e814ccba1994639b6e79266.r2.dev/aviandex';
const envBase = process.env.VITE_R2_BASE_URL
  ? `${process.env.VITE_R2_BASE_URL.replace(/\/+$/, '')}/aviandex`
  : null;
const BASE = (getArg('--base') || envBase || DEFAULT_BASE).replace(/\/+$/, '');
const EXTENSIONS = ['avif', 'webp', 'jpg', 'jpeg', 'png'];
const CONCURRENCY = Number(getArg('--concurrency') || 6);
const TIMEOUT_MS = Number(getArg('--timeout') || 15000);

const birds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birds.json'), 'utf8'));
const LIMIT = Number(getArg('--limit') || birds.length);
const targets = birds.slice(0, LIMIT);

async function head(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'AvianDex-CardAudit/1.0' },
      });
      clearTimeout(timer);
      if (res.status === 429 || res.status === 503) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      return {
        ok: res.ok,
        status: res.status,
        type: res.headers.get('content-type') || '',
        length: Number(res.headers.get('content-length') || 0),
      };
    } catch (err) {
      clearTimeout(timer);
      if (attempt === 2) return { ok: false, status: 0, type: '', length: 0, error: err.message };
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  return { ok: false, status: 429, type: '', length: 0, error: 'rate limited' };
}

async function probeBird(bird) {
  for (const ext of EXTENSIONS) {
    const url = `${BASE}/${bird.id}.${ext}`;
    const res = await head(url);
    if (res.ok) return { ...bird, ext, url, bytes: res.length, type: res.type };
    // 429 / 5xx 唔算「冇圖」，要標記出嚟免得亂下結論
    if (res.status !== 404 && res.status !== 403) {
      return { ...bird, ext: null, url: null, bytes: 0, error: `HTTP ${res.status} ${res.error || ''}`.trim() };
    }
  }
  return { ...bird, ext: null, url: null, bytes: 0 };
}

async function run() {
  console.log(`🔍 檢查 ${targets.length} 個編號 …`);
  console.log(`   來源：${BASE}`);
  const results = [];
  let cursor = 0;
  let done = 0;

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < targets.length) {
        const bird = targets[cursor++];
        const r = await probeBird(bird);
        results.push(r);
        done += 1;
        if (done % 25 === 0 || done === targets.length) {
          process.stdout.write(`   … ${done}/${targets.length}\n`);
        }
      }
    }),
  );

  results.sort((a, b) => a.id.localeCompare(b.id));
  const found = results.filter((r) => r.ext);
  const missing = results.filter((r) => !r.ext && !r.error);
  const broken = results.filter((r) => r.error);
  const totalBytes = found.reduce((s, r) => s + r.bytes, 0);

  // ── manifest（前端加速用）──
  if (!has('--no-manifest')) {
    const map = Object.fromEntries(found.map((r) => [r.id, r.ext]));
    const outFile = path.join(ROOT, 'public/data/card-manifest.json');
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(
      outFile,
      JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, cards: map }, null, 0) + '\n',
    );
    console.log(`✅ 已寫入 ${path.relative(ROOT, outFile)}（${Object.keys(map).length} 張）`);
  }

  // ── 報告 ──
  const reportDir = path.join(ROOT, 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const json = { generatedAt: new Date().toISOString(), base: BASE, total: results.length, found, missing, broken };
  fs.writeFileSync(path.join(reportDir, 'card-audit.json'), JSON.stringify(json, null, 2));

  const lines = [
    '# 圖卡體檢報告（card audit）',
    '',
    `- 產生時間：${new Date().toISOString()}`,
    `- 來源：\`${BASE}\``,
    `- 檢查編號：${results.length}`,
    `- ✅ 有圖：${found.length}`,
    `- ❌ 冇圖（R2 404）：${missing.length}`,
    `- ⚠️ 探測失敗（429／5xx／網絡，唔代表冇圖）：${broken.length}`,
    `- 圖片總大小：${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
    '',
    '## 需要上傳的編號',
    '',
    missing.length === 0
      ? broken.length === results.length && results.length > 0
        ? '⚠️ 全部探測失敗（網絡問題），唔代表冇圖 —— 請重跑。'
        : missing.length === 0 && broken.length > 0
          ? `已探測到的全部有圖（另有 ${broken.length} 個探測失敗，請重跑確認）。`
          : '全部都有圖 🎉'
      : '```\n' + missing.map((r) => `${r.id}.avif   ${r.name}`).join('\n') + '\n```',
    '',
    broken.length === 0
      ? ''
      : '## 探測失敗（請重跑一次）\n\n```\n' +
        broken.map((r) => `${r.id}  ${r.error}`).join('\n') +
        '\n```\n',
    found.length === 0
      ? ''
      : '## 已存在的圖（副檔名分佈）\n\n' +
        Object.entries(
          found.reduce((acc, r) => ({ ...acc, [r.ext]: (acc[r.ext] || 0) + 1 }), {}),
        )
          .map(([ext, n]) => `- .${ext}：${n}`)
          .join('\n') +
        '\n',
  ];
  fs.writeFileSync(path.join(reportDir, 'card-audit.md'), lines.join('\n'));

  console.log('');
  console.log(`✅ 有圖 ${found.length} / ${results.length}`);
  console.log(`❌ 冇圖 ${missing.length}`);
  if (broken.length) console.log(`⚠️  探測失敗 ${broken.length}（重跑一次再判斷）`);
  console.log(`📄 報告：reports/card-audit.md`);
  if (missing.length) {
    console.log(`\n頭 15 個要上傳：`);
    console.log(missing.slice(0, 15).map((r) => `  ${r.id}.avif  ${r.name}`).join('\n'));
  }
}

run().catch((e) => {
  console.error('❌ 檢查失敗：', e);
  process.exit(1);
});
