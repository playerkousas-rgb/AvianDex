#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 圖卡批次生成器（免費／本機路線）
 * ============================================================
 *  設計目標：
 *   · 斷點續傳（.done 標記）→ 你隨時 Ctrl+C、第二日再跑
 *   · 你只需要提供一個「生成 API 網址」，其他全部幫你做好
 *   · 自動轉 3:4 直式、自動轉 AVIF（壓到 ~150KB）、自動命名 NNNN.avif
 *   · 可選自動上傳（rclone / wrangler / Cloudflare API）
 *
 *  ── 用法 ──────────────────────────────────────────────
 *   1) 只出提示詞（自己貼去 GPT／BANANA／WebUI）
 *      node scripts/cards/generate.mjs --ids 0289 --print-prompt
 *
 *   2) 用你自己的生成 API（可以是本機 Stable Diffusion WebUI／ComfyUI／
 *      Pollinations 等任何「送 JSON、回圖片」的服務）
 *      GPT_CARD_ENDPOINT=http://127.0.0.1:7860/sdapi/v1/txt2img \
 *      GPT_CARD_RESPONSE=json \
 *      node scripts/cards/generate.mjs --ids 0289 --style encyclopedia
 *
 *   3) 之後隨時補跑（已完成的會自動跳過）
 *      node scripts/cards/generate.mjs --priority
 *
 *   4) 出圖後上 R2（三選一，見 docs/CARD_PRODUCTION.md §上傳）
 *      node scripts/cards/generate.mjs --upload rclone
 *
 *  ── 環境變數 ──────────────────────────────────────────
 *   GPT_CARD_ENDPOINT   生成 API 網址（必填，除 --print-prompt）
 *   GPT_CARD_TOKEN      若 API 要 Bearer token
 *   GPT_CARD_BODY       額外 JSON 欄位（可選，例如 '{"steps":30}'）
 *   GPT_CARD_RESPONSE   png | base64 | url | json（預設 png）
 *                        · png    直接回圖片位元組
 *                        · base64 JSON 內含 b64_json / images[0]
 *                        · url    JSON 內含 url / data[0].url
 *                        · json   Structured-output：{ dataURL } 或 { b64 }
 *
 *  ── 注意 ──────────────────────────────────────────────
 *   · 本腳本不內含任何 API key；金鑰只放你自己的 .env.local
 *   · 免費服務通常有速率限制，預設每張之間停 1.5 秒（--delay 可調）
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encyclopediaPrompt, illustrationPrompt, findBird, loadBirds, ROOT } from './prompt-builder.mjs';

const ARGS = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = ARGS.indexOf(name);
  return i >= 0 ? ARGS[i + 1] : fallback;
};
const has = (name) => ARGS.includes(name);

const OUT_DIR = path.resolve(ROOT, arg('--out', 'cards/out'));
const DONE_DIR = path.join(OUT_DIR, '.done');
const LOG = path.join(OUT_DIR, 'log.csv');

const STYLE = arg('--style', 'encyclopedia');
const DELAY_MS = Number(arg('--delay', 1500));
const WIDTH = Number(arg('--width', 1400));
const HEIGHT = Number(arg('--height', 1867));
const QUALITY = Number(arg('--quality', 55));
const UPLOAD = arg('--upload', ''); // '', rclone, wrangler, api
const MAX_RETRY = Number(arg('--retry', 2));
const PROMPT_DIR = path.resolve(ROOT, arg('--prompt-dir', 'cards/prompts'));

const ENDPOINT = process.env.GPT_CARD_ENDPOINT || '';
const TOKEN = process.env.GPT_CARD_TOKEN || '';
const RESPONSE_MODE = (process.env.GPT_CARD_RESPONSE || 'png').toLowerCase();
const EXTRA_BODY = process.env.GPT_CARD_BODY || '';

/** --ids 0289,0290 / --priority / --from 22 --to 41 */
function pickIds() {
  const ids = arg('--ids');
  if (ids) return ids.split(',').map((s) => s.trim().padStart(4, '0'));
  let list = loadBirds().map((b) => b.id);
  const from = arg('--from');
  const to = arg('--to');
  if (from || to) {
    const lo = Number(from || 1);
    const hi = Number(to || 569);
    list = list.filter((id) => Number(id) >= lo && Number(id) <= hi);
  }
  if (has('--priority')) {
    const priority = (arg('--priority-list') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (priority.length) list = priority;
  }
  return list;
}

function ensureDirs() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(DONE_DIR, { recursive: true });
  if (!fs.existsSync(LOG)) fs.writeFileSync(LOG, 'time,id,status,file,bytes,note\n');
}

function logLine(id, status, file, bytes, note = '') {
  const safe = (v) => `"${String(v).replace(/"/g, '""')}"`;
  fs.appendFileSync(LOG, [new Date().toISOString(), safe(id), safe(status), safe(file), bytes, safe(note)].join(',') + '\n');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ────────────────────────────────────────────────────────────
// 1. 呼叫生成 API
// ────────────────────────────────────────────────────────────
async function callGenerator(prompt, negative) {
  const payload = { prompt };
  if (negative) payload.negative_prompt = negative;
  if (EXTRA_BODY) {
    try {
      Object.assign(payload, JSON.parse(EXTRA_BODY));
    } catch {
      console.warn('⚠️  GPT_CARD_BODY 不是合法 JSON，已忽略');
    }
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`生成 API ${res.status}：${text.slice(0, 200)}`);
  }

  if (RESPONSE_MODE === 'png') {
    return Buffer.from(await res.arrayBuffer());
  }

  const json = await res.json();
  const findBase64 = (o) => {
    if (!o) return null;
    if (typeof o === 'string') return o.startsWith('data:') ? o.split(',')[1] : null;
    if (Array.isArray(o)) {
      for (const item of o) {
        const found = findBase64(item);
        if (found) return found;
      }
      return null;
    }
    if (typeof o === 'object') {
      for (const key of ['b64_json', 'b64', 'base64', 'dataURL', 'image', 'images']) {
        if (o[key]) {
          const found = findBase64(o[key]);
          if (found) return found;
        }
      }
      for (const v of Object.values(o)) {
        const found = findBase64(v);
        if (found) return found;
      }
    }
    return null;
  };

  if (RESPONSE_MODE === 'url') {
    const findUrl = (o) => {
      if (!o) return null;
      if (typeof o === 'string') return /^https?:\/\//.test(o) ? o : null;
      if (Array.isArray(o)) {
        for (const item of o) {
          const found = findUrl(item);
          if (found) return found;
        }
        return null;
      }
      if (typeof o === 'object') {
        for (const key of ['url', 'image_url', 'images', 'data']) {
          if (o[key]) {
            const found = findUrl(o[key]);
            if (found) return found;
          }
        }
      }
      return null;
    };
    const url = findUrl(json);
    if (!url) throw new Error('回應內找不到圖片網址（用 GPT_CARD_RESPONSE=url）');
    const img = await fetch(url);
    if (!img.ok) throw new Error(`下載生成圖失敗 ${img.status}`);
    return Buffer.from(await img.arrayBuffer());
  }

  // base64 / json
  const b64 = findBase64(json);
  if (!b64) throw new Error(`回應內找不到 base64 圖片（模式 ${RESPONSE_MODE}）`);
  return Buffer.from(b64, 'base64');
}

// ────────────────────────────────────────────────────────────
// 2. 正規化：裁成 3:4 → AVIF（ImageMagick，唔使裝任何 npm 套件）
// ────────────────────────────────────────────────────────────
function hasImageMagick() {
  try {
    execFileSync('convert', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function normalize(inputBuf, id) {
  const rawPath = path.join(OUT_DIR, `${id}-raw.png`);
  const finalPath = path.join(OUT_DIR, `${id}.avif`);
  fs.writeFileSync(rawPath, inputBuf);

  if (!hasImageMagick()) {
    // 沒有 ImageMagick：保留原圖，之後用 squoosh.app 手動轉
    const fallback = path.join(OUT_DIR, `${id}.png`);
    fs.renameSync(rawPath, fallback);
    return { file: fallback, bytes: fs.statSync(fallback).size, note: '未安裝 ImageMagick，輸出 PNG（請手動轉 AVIF）' };
  }

  execFileSync('convert', [
    rawPath,
    '-resize', `${WIDTH}x${HEIGHT}^`,
    '-gravity', 'center',
    '-extent', `${WIDTH}x${HEIGHT}`,
    '-strip',
    '-quality', String(QUALITY),
    finalPath,
  ]);
  fs.unlinkSync(rawPath);
  return { file: finalPath, bytes: fs.statSync(finalPath).size, note: 'AVIF' };
}

// ────────────────────────────────────────────────────────────
// 3. 上傳（可選）
// ────────────────────────────────────────────────────────────
function upload(file) {
  const name = path.basename(file);
  try {
    if (UPLOAD === 'rclone') {
      const remote = process.env.R2_RCLONE_REMOTE || 'r2';
      const bucket = process.env.R2_BUCKET || 'aviandex';
      execFileSync('rclone', ['copy', file, `${remote}:${bucket}/aviandex/`], { stdio: 'inherit' });
      return `rclone → ${remote}:${bucket}/aviandex/${name}`;
    }
    if (UPLOAD === 'wrangler') {
      const bucket = process.env.R2_BUCKET || 'aviandex';
      execFileSync('npx', ['wrangler', 'r2', 'object', 'put', `${bucket}/aviandex/${name}`, '--file', file], {
        stdio: 'inherit',
      });
      return `wrangler → ${bucket}/aviandex/${name}`;
    }
    if (UPLOAD === 'api') {
      const account = process.env.CF_ACCOUNT_ID;
      const bucket = process.env.R2_BUCKET;
      const token = process.env.CF_API_TOKEN;
      if (!account || !bucket || !token) throw new Error('缺 CF_ACCOUNT_ID / R2_BUCKET / CF_API_TOKEN');
      const body = fs.readFileSync(file);
      const res = fetch(
        `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${bucket}/objects/aviandex/${name}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/avif' },
          body,
        },
      );
      void res;
      return 'api → 已送出（請用 cards:probe 驗收）';
    }
    return '';
  } catch (err) {
    return `上傳失敗：${err.message}`;
  }
}

// ────────────────────────────────────────────────────────────
// 4. 主流程
// ────────────────────────────────────────────────────────────
async function main() {
  const ids = pickIds();
  ensureDirs();

  if (has('--print-prompt')) {
    for (const id of ids) {
      const bird = findBird(id);
      const customFile = path.join(PROMPT_DIR, `${id}.txt`);
      const custom = fs.existsSync(customFile) ? fs.readFileSync(customFile, 'utf8').trim() : '';
      const prompt =
        custom ||
        (STYLE === 'illustration' ? illustrationPrompt(bird) : encyclopediaPrompt(bird));
      console.log(`\n===== ${bird.id} ${bird.name}${custom ? '（自訂提示詞）' : ''} =====\n${prompt}`);
    }
    return;
  }

  if (!ENDPOINT) {
    console.error(
      [
        '❌ 未設定生成 API。',
        '',
        '兩種做法：',
        '  1) 只想要提示詞：node scripts/cards/generate.mjs --ids 0289 --print-prompt',
        '  2) 有本機／免費生成服務：',
        '     GPT_CARD_ENDPOINT=http://127.0.0.1:7860/sdapi/v1/txt2img \\',
        '     GPT_CARD_RESPONSE=json \\',
        '     node scripts/cards/generate.mjs --ids 0289',
        '',
        '詳見 docs/CARD_PRODUCTION.md',
      ].join('\n'),
    );
    process.exit(1);
  }

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of ids) {
    const marker = path.join(DONE_DIR, id);
    const existing = fs.existsSync(path.join(OUT_DIR, `${id}.avif`)) || fs.existsSync(path.join(OUT_DIR, `${id}.png`));
    if (fs.existsSync(marker) || (existing && !has('--force'))) {
      skipped += 1;
      continue;
    }

    const bird = findBird(id);
    // 你手寫的提示詞優先（cards/prompts/NNNN.txt），否則用內建模板
    const customFile = path.join(PROMPT_DIR, `${id}.txt`);
    const custom = fs.existsSync(customFile) ? fs.readFileSync(customFile, 'utf8').trim() : '';
    const prompt =
      custom ||
      (STYLE === 'illustration' ? illustrationPrompt(bird) : encyclopediaPrompt(bird));
    if (custom) process.stdout.write(`📝 用自訂提示詞 ${path.relative(ROOT, customFile)}\n`);
    const negative =
      STYLE === 'illustration'
        ? 'card frame, card border, text, hp, numbers, letters, logos, trading card UI, watermarks, signature, human, hands'
        : '';

    let attempt = 0;
    let ok = false;
    while (attempt <= MAX_RETRY && !ok) {
      attempt += 1;
      try {
        process.stdout.write(`🎨 ${id} ${bird.name}（第 ${attempt} 次）… `);
        const buf = await callGenerator(prompt, negative);
        if (buf.length < 5000) throw new Error(`回傳檔案太細（${buf.length} B），可能失敗`);
        const { file, bytes, note } = normalize(buf, id);
        const up = UPLOAD ? upload(file) : '';
        fs.writeFileSync(marker, new Date().toISOString());
        logLine(id, 'ok', path.basename(file), bytes, [note, up].filter(Boolean).join(' | '));
        console.log(`✅ ${(bytes / 1024).toFixed(0)} KB → ${path.basename(file)}${up ? ` · ${up}` : ''}`);
        done += 1;
        ok = true;
      } catch (err) {
        logLine(id, 'fail', '', 0, err.message);
        console.log(`❌ ${err.message}`);
        if (attempt > MAX_RETRY) failed += 1;
        else await sleep(1200 * attempt);
      }
    }
    await sleep(DELAY_MS);
  }

  console.log('');
  console.log(`✅ 完成 ${done} · 跳過 ${skipped} · 失敗 ${failed}`);
  console.log(`📁 輸出：${path.relative(ROOT, OUT_DIR)}/`);
  console.log('下一步：npm run cards:probe（確認 R2）→ 開網站按「重新掃描」');
}

main().catch((err) => {
  console.error('❌ 執行失敗：', err);
  process.exit(1);
});
