#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 圖卡渲染（Node 包裝，內部呼叫 Python 排版引擎）
 * ============================================================
 *  為甚麼要一個 Node 包裝？
 *    1) 其他腳本／CI 都係 Node，唔想兩套指令並存
 *    2) 可以在這裡集中檢查環境（Python、Pillow、numpy、ImageMagick、字型），
 *       缺嘢就清楚講「裝咩」，唔會出一個半成品
 *    3) 把「插畫 → 卡面 → AVIF」一次過做完，減少手動步驟
 *
 *  用法：
 *    npm run cards:render -- 0289
 *    npm run cards:render -- --all
 *    npm run cards:render -- 0289 --preview     # 只出 PNG
 *    npm run cards:render -- 0289 --quality 55  # AVIF 品質（細啲）
 *
 *  前置（本機第一次用）：
 *    pip3 install pillow numpy
 *    # 字型：把 NotoSansTC-{Black,Bold,Regular}.otf 放入 ~/.fonts 或設 AVIANDEX_FONT_DIR
 *    #      下載：https://github.com/notofonts/noto-cjk（Sans/SubsetOTF/TC）
 *  插畫：自行放到 cards/art/<ID>.png（AI 只畫鳥，文字由排版引擎寫）
 * ============================================================ */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PY = process.env.AVIANDEX_PYTHON || 'python3';
const FONT_DIR = process.env.AVIANDEX_FONT_DIR || path.join(process.env.HOME || '', '.fonts');
const SCRIPT = path.join(ROOT, 'scripts/cards/render-card.py');

function fail(msg, hint) {
  console.error(`❌ ${msg}`);
  if (hint) console.error(`   ${hint}`);
  process.exit(1);
}

// ── 1. Python 同套件 ──
const pyCheck = spawnSync(PY, ['-c', 'import PIL, numpy; print("ok")'], { encoding: 'utf8' });
if (pyCheck.status !== 0) {
  fail(
    '找唔到 Python 或 Pillow／numpy',
    '安裝：pip3 install pillow numpy（macOS 可用 brew install python3）',
  );
}

// ── 2. ImageMagick（寫 AVIF 用；--preview 時可以冇）──
const wantsAvif = !process.argv.includes('--preview');
const imCheck = spawnSync('convert', ['-version'], { encoding: 'utf8' });
if (wantsAvif && imCheck.status !== 0) {
  fail(
    '找唔到 ImageMagick（用嚟輸出 AVIF）',
    '安裝：brew install imagemagick（或 apt install imagemagick）；只想要 PNG 可加 --preview',
  );
}

// ── 3. 中文字型 ──
const fonts = ['NotoSansTC-Black.otf', 'NotoSansTC-Bold.otf', 'NotoSansTC-Regular.otf'];
const missing = fonts.filter((f) => !fs.existsSync(path.join(FONT_DIR, f)));
if (missing.length) {
  fail(
    `字型不足：${missing.join('、')}（找過 ${FONT_DIR}）`,
    '下載 https://github.com/notofonts/noto-cjk （Sans/SubsetOTF/TC），或用 AVIANDEX_FONT_DIR 指定資料夾',
  );
}

// ── 4. 插畫檢查（早 fail，好過排版到一半才發現）──
const artDir = path.join(ROOT, 'cards/art');
fs.mkdirSync(artDir, { recursive: true });
const ids = process.argv.slice(2).filter((a) => /^\d{1,4}$/.test(a));
if (!process.argv.includes('--all')) {
  if (ids.length === 0) {
    fail('未指定編號', '例：npm run cards:render -- 0289');
  }
  const noArt = ids.filter((id) => !fs.existsSync(path.join(artDir, `${String(id).padStart(4, '0')}.png`)));
  if (noArt.length) {
    console.warn(`⚠️  以下編號冇插畫（cards/art/<ID>.png）：${noArt.join(' ')}`);
    console.warn('   卡會照出，但插畫位置顯示「未提供插畫」。');
  }
}

// ── 5. 交棒給 Python 排版引擎 ──
const args = [SCRIPT, ...process.argv.slice(2)];
const run = spawnSync(PY, args, { stdio: 'inherit', env: { ...process.env, AVIANDEX_FONT_DIR: FONT_DIR } });
process.exit(run.status ?? 1);
