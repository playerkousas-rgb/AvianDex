#!/usr/bin/env node
/* ============================================================
 *  pack-cards.mjs —— 把出好的卡壓成 WebP、分卷、算校驗
 * ------------------------------------------------------------
 * 卡面成品不應該進 Git（569 張原圖約 900 MB，Git 會爆）。
 * 正確做法：
 *   ① 卡面壓成 WebP（quality 86，長邊 1400px）→ 每張約 200–300 KB
 *   ② 每 50 張打包一個 zip → 約 12–15 MB 一卷，易上傳
 *   ③ 生成 manifest.json（編號、尺寸、bytes、sha256）＋ SHA256SUMS
 *
 * 上傳去 Google Drive / R2 之後，app 只需要讀 manifest.json。
 *
 * 用法：
 *   node scripts/cards/pack-cards.mjs --in data/card-demo/out --out deliver/cards
 *   node scripts/cards/pack-cards.mjs --in data/card-demo/out --out deliver/cards --per 50
 * ============================================================ */
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync, createReadStream, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : dflt;
};

const inDir = opt('in', 'data/card-demo/out');
const outDir = opt('out', 'deliver/cards');
const per = Number(opt('per', 50));
const longEdge = Number(opt('long', 1400));
const quality = Number(opt('q', 86));

if (!existsSync(inDir)) {
  console.error('找不到輸入目錄：' + inDir);
  process.exit(1);
}
mkdirSync(path.join(outDir, 'webp'), { recursive: true });
mkdirSync(path.join(outDir, 'zips'), { recursive: true });

const files = readdirSync(inDir)
  .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
  .sort();

if (!files.length) {
  console.error('目錄內沒有圖：' + inDir);
  process.exit(1);
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const manifest = [];
let total = 0;

for (const f of files) {
  const id = (f.match(/(\d{3,4})/) || [])[1] || f.replace(/\.[^.]+$/, '');
  const src = path.join(inDir, f);
  const dst = path.join(outDir, 'webp', 'aviandex-' + id + '.webp');

  // 用 sharp 轉檔（有就用，冇就 fallback 到 cwebp 或直接複製）
  let ok = false;
  try {
    execFileSync('node', ['-e', `
      const sharp = require('sharp');
      sharp(${JSON.stringify(src)})
        .resize({ width: ${longEdge}, height: ${longEdge}, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: ${quality} })
        .toFile(${JSON.stringify(dst)}).then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });
    `], { stdio: 'pipe' });
    ok = true;
  } catch {
    try {
      execFileSync('cwebp', ['-q', String(quality), '-resize', String(longEdge), '0', src, '-o', dst], { stdio: 'pipe' });
      ok = true;
    } catch { ok = false; }
  }
  if (!ok) {
    console.warn('⚠️ 轉檔失敗，跳過：' + f);
    continue;
  }

  const buf = readFileSync(dst);
  total += buf.length;
  manifest.push({
    id,
    file: 'webp/aviandex-' + id + '.webp',
    bytes: buf.length,
    sha256: sha(buf),
  });
}

// 分卷打包
const zipGroups = [];
for (let i = 0; i < manifest.length; i += per) {
  const chunk = manifest.slice(i, i + per);
  const name = `aviandex-cards-${String(i / per + 1).padStart(2, '0')}-`
    + chunk[0].id + '-' + chunk[chunk.length - 1].id + '.zip';
  const zipPath = path.join(outDir, 'zips', name);
  const listFile = path.join(outDir, 'zips', '_list-' + name + '.txt');
  writeFileSync(listFile, chunk.map((m) => path.join(outDir, path.dirname(m.file), path.basename(m.file))).join('\n'), 'utf8');
  try {
    execFileSync('zip', ['-q', '-j', zipPath, ...chunk.map((m) => path.join(outDir, m.file))], { stdio: 'pipe' });
    zipGroups.push({ file: 'zips/' + name, count: chunk.length, bytes: statSync(zipPath).size });
  } catch (e) {
    console.warn('⚠️ 打包失敗（可能未安裝 zip）：' + name);
  }
}

writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  count: manifest.length,
  longEdge,
  quality,
  totalBytes: total,
  cards: manifest,
  zips: zipGroups,
}, null, 1), 'utf8');

writeFileSync(path.join(outDir, 'SHA256SUMS'),
  manifest.map((m) => m.sha256 + '  ' + m.file).join('\n') + '\n', 'utf8');

const mb = (n) => (n / 1048576).toFixed(1) + ' MB';
console.log(`完成 ${manifest.length} 張`);
console.log(`WebP 合計 ${mb(total)}（平均 ${Math.round(total / manifest.length / 1024)} KB/張）`);
zipGroups.forEach((g) => console.log(`  ${g.file}  ${g.count} 張  ${mb(g.bytes)}`));
console.log(`manifest.json + SHA256SUMS 已寫入 ${outDir}`);
