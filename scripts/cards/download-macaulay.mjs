#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 由 Macaulay Library（康奈爾鳥類學實驗室）取得「英文 + 相片」
 * ------------------------------------------------------------
 *  為什麼不用英文維基：
 *    eBird / Macaulay 是康奈爾出品，卡面的分類權威本來就是 eBird/Clements；
 *    英文名已有（birdTaxonomy.json）。英文「描述」在 eBird 只有極短一句，
 *    真正有價值的英文素材是①物種簡介 ②**真實照片與授權**。
 *
 *  這支工具做三件事（不需要 API key）：
 *    1) 用 eBird 物種代碼查 Macaulay 物種頁，取得物種簡介與照片清單
 *    2) 逐張照片核對授權（CC0 / CC BY / CC BY-NC…）與作者
 *    3) 下載「可商用／可再用」的照片到 cards/art/NNNN-photo.<ext>
 *       並寫出 cards/art/Credits.md（作者・授權・原始網址）
 *
 *  ⚠️ 這個工具**未在沙盒驗證過**（沙盒封鎖 macaulaylibrary.org）。
 *     第一次請先跑 --check 看結構；如果兩個端點都改了，工具會明確報
 *     「fetch-failed」，不會靜靜當成功。
 *
 *  ⚠️ 授權是硬規則：
 *      · 只自動下載 CC0 / CC BY / CC BY-SA（可再用、需標註）
 *      · CC BY-NC / 版權所有 → 只記錄連結，**不下載**（除非加 --allow-nc）
 *      · 任何情況下都保留原始連結，方便日後覆核
 *
 *  用法：
 *    node scripts/cards/download-macaulay.mjs --check            # 只查一隻，看 JSON 結構
 *    node scripts/cards/download-macaulay.mjs --ids 0008
 *    node scripts/cards/download-macaulay.mjs --from 1 --to 20
 *    node scripts/cards/download-macaulay.mjs --all --limit 50
 *    node scripts/cards/download-macaulay.mjs --ids 0008 --dry-run
 *
 *  輸出：
 *    cards/art/NNNN-photo.jpg        相片（已裁成 3:4，長邊 1600）
 *    cards/art/Credits.md            授權清單（作者／授權／原連結）
 *    reports/photos.md               每張卡找到幾張可用相片
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'src/data');
const ART = path.join(ROOT, 'cards/art');
const REPORT = path.join(ROOT, 'reports/photos.md');
const UA = 'AvianDex-PhotoFetcher/1.0 (educational; contact: ai@skwscout.org.hk)';

const ARGS = process.argv.slice(2);
const arg = (n, d) => { const i = ARGS.indexOf(n); return i >= 0 ? ARGS[i + 1] : d; };
const flag = (n) => ARGS.includes(n);
const DELAY = Number(arg('--delay', 1200));
const MAX_W = Number(arg('--max-w', 1600));
/* 卡面右欄約 900px 高 → 原圖短邊太細會糊；低於此值唔用 */
const MIN_W = Number(arg('--min-w', 900));
const OK_LICENCE = /^(cc0|cc by|cc-by|public domain|pd)/i;
const NC_LICENCE = /nc/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

async function get(url, asJson = true) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: asJson ? 'application/json' : '*/*' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return asJson ? res.json() : Buffer.from(await res.arrayBuffer());
}

/* ------------------------------------------------------------------
 * Macaulay Library 的公開端點（不需要 key）
 *   · 物種頁：https://search.macaulaylibrary.org/catalog?taxonCode=magrob&mediaType=photo
 *   · 資料端點：https://search.macaulaylibrary.org/api/v1/search?taxonCode=...&mediaType=photo
 *   端點日後可能改；所以本工具會：
 *      1) 先試 JSON API
 *      2) 失敗就退回去抓 HTML 頁面的 asset id（og:image / /asset/ 連結）
 *      3) 兩者都失敗 → 報告寫「此編號需人手處理」，不會靜靜當成功
 * ------------------------------------------------------------------ */

/** 把各種寫法的授權統一成一個短標籤；認不出就原樣返回 */
function normaliseLicence(v) {
  const s = String(v || '').toLowerCase();
  if (!s) return '';
  if (/cc0|public domain|cc-zero/.test(s)) return /public domain/.test(s) ? 'Public Domain' : 'CC0';
  const by = /\bby\b|attribution/.test(s);
  const nc = /\bnc\b|non-?commercial/.test(s);
  const sa = /\bsa\b|share-?alike/.test(s);
  const nd = /\bnd\b|no-?deriv/.test(s);
  if (by) return 'CC BY' + (nc ? '-NC' : '') + (sa ? '-SA' : '') + (nd ? '-ND' : '');
  if (/all rights reserved|copyright|©/.test(s)) return 'All rights reserved';
  return String(v).trim();
}

/** 第一步：試 JSON API */
async function viaApi(code) {
  const url = `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${encodeURIComponent(code)}`
    + '&mediaType=photo&sort=rating_rank_desc&count=12';
  const data = await get(url);
  const items = data.results?.content || data.content || data.results || [];
  return (Array.isArray(items) ? items : []).map((it) => {
    const assetId = String(it.assetId || it.id || it.assetID || '');
    return {
      assetId,
      author: it.userDisplayName || it.observer || it.authorName || it.photographer || '',
      licence: normaliseLicence(it.licenseName || it.license || it.licence || it.mediaLicense || ''),
      pageUrl: assetId ? `https://macaulaylibrary.org/asset/${assetId}` : '',
      /* 圖片欄名各版本不同，逐個試；最後才用 CDN 前綴拼 */
      imageUrl: it.previewUrl || it.mediaUrl || it.medUrl || it.largeUrl || it.imageUrl
        || (it.assetId ? `https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${it.assetId}/1200` : ''),
      width: it.width || it.originalWidth || 0,
    };
  }).filter((x) => x.assetId || x.imageUrl);
}

/** 第二步：退回抓 HTML（只拿 asset id 與圖片網址） */
async function viaHtml(code) {
  const url = `https://search.macaulaylibrary.org/catalog?taxonCode=${encodeURIComponent(code)}&mediaType=photo&sort=rating_rank_desc`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTML HTTP ${res.status}`);
  const html = await res.text();
  const ids = [...new Set([...html.matchAll(/\/asset\/(\d{6,})/g)].map((m) => m[1]))].slice(0, 12);
  const imgs = [...html.matchAll(/https:\/\/cdn\.download\.ams\.birds\.cornell\.edu\/[^"'\s]+/g)].map((m) => m[0]);
  const list = ids.map((id, i) => ({
    assetId: id,
    author: '',
    licence: '',
    pageUrl: `https://macaulaylibrary.org/asset/${id}`,
    imageUrl: imgs[i] || '',
    width: 0,
  }));
  /* 零結果 = 版式改了，不是「這隻雀冇相」——要分得清，唔好靜靜當成功 */
  if (!list.length) throw new Error('HTML 頁面找不到 /asset/ 連結（版式可能已改）');
  return list;
}

/** 第三步：取單張照片的授權／作者（asset 頁） */
async function assetMeta(assetId) {
  for (const u of [
    `https://search.macaulaylibrary.org/api/v1/asset/${assetId}`,
    `https://macaulaylibrary.org/asset/${assetId}`,
  ]) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': UA } });
      if (!res.ok) continue;
      const txt = await res.text();
      if (u.includes('/api/')) {
        const j = JSON.parse(txt);
        return {
          author: j.userDisplayName || j.photographer || j.authorName || '',
          licence: normaliseLicence(j.licenseName || j.license || j.licence || ''),
          imageUrl: j.previewUrl || j.mediaUrl || j.largeUrl || '',
        };
      }
      const author = (txt.match(/"userDisplayName"\s*:\s*"([^"]+)"/) || [])[1]
        || (txt.match(/Photographer[^<]*<\/[^>]+>\s*<[^>]+>([^<]{2,60})/i) || [])[1] || '';
      const licence = (txt.match(/(CC0[^"<]{0,24}|CC[ -]BY(?:-NC|-SA|-ND)?(?:[ -]\d\.\d)?|All rights reserved|Public Domain)/i) || [])[1] || '';
      const imageUrl = (txt.match(/https:\/\/cdn\.download\.ams\.birds\.cornell\.edu\/[^"'\s]+/) || [])[0] || '';
      return { author: author.trim(), licence: licence.trim(), imageUrl };
    } catch { /* 試下一個 */ }
  }
  return null;
}

function licenceAllows(lic) {
  if (!lic) return false;                               /* 未知授權 → 不下載 */
  if (NC_LICENCE.test(lic) && !flag('--allow-nc')) return false;
  if (/all rights reserved|©|copyright/i.test(lic)) return false;
  return OK_LICENCE.test(lic.trim());
}

/** 讀圖片的寬高（用 ImageMagick identify；裝唔到就當未知） */
function imageSize(file) {
  const r = spawnSync('identify', ['-format', '%w %h', file], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  const [w, h] = String(r.stdout).trim().split(/\s+/).map(Number);
  return w && h ? { w, h } : null;
}

function hasMagick() {
  const r = spawnSync('convert', ['-version'], { encoding: 'utf8' });
  if (r.status === 0) return 'convert';
  const r2 = spawnSync('magick', ['-version'], { encoding: 'utf8' });
  return r2.status === 0 ? 'magick' : '';
}

async function downloadTo(url, dest) {
  const bin = hasMagick();
  if (!bin) throw new Error('找不到 ImageMagick（convert / magick）');
  /* 支援 file:// 或本機路徑（離線測試用）；其餘照抓網 */
  const local = url.startsWith('file://') ? url.slice(7) : (/^[a-z]+:\/\//i.test(url) ? '' : url);
  const buf = local && fs.existsSync(local) ? fs.readFileSync(local) : await get(url, false);
  const tmp = dest + '.orig';
  fs.writeFileSync(tmp, buf);

  const size = imageSize(tmp);
  if (!size) { fs.unlinkSync(tmp); throw new Error('下載到的檔案唔似圖片（可能係錯誤頁）'); }
  const shortEdge = Math.min(size.w, size.h);
  if (shortEdge < MIN_W) {
    fs.unlinkSync(tmp);
    throw new Error(`解析度太低（${size.w}×${size.h}，短邊 < ${MIN_W}）`);
  }

  /* 統一裁成 3:4、長邊 ≤1600（卡面右欄就是 3:4） */
  const args = [tmp, '-auto-orient', '-resize', `${MAX_W}x${MAX_W}>`,
    '-gravity', 'center', '-crop', '3:4', '+repage', '-quality', '86', dest];
  const r = spawnSync(bin, args);
  fs.unlinkSync(tmp);
  if (r.status !== 0) throw new Error('ImageMagick 轉檔失敗');
  return fs.statSync(dest).size;
}

function appendCredit(id, name, sci, photo) {
  fs.mkdirSync(ART, { recursive: true });
  const f = path.join(ART, 'Credits.md');
  if (!fs.existsSync(f)) {
    fs.writeFileSync(f, '# 相片授權清單\n\n'
      + '> 由 `scripts/cards/download-macaulay.mjs` 自動產生。\n'
      + '> 每一張卡面用到的相片都必須在這裡有一行，否則不能對外發布。\n\n'
      + '| 編號 | 名稱 | 作者 | 授權 | 來源 | 下載日 |\n|---|---|---|---|---|---|\n');
  }
  const row = `| ${id} | ${name}（${sci}） | ${photo.author || '（未標明）'} | ${photo.licence || '（未標明）'} | ${photo.pageUrl} | ${new Date().toISOString().slice(0, 10)} |\n`;
  const txt = fs.readFileSync(f, 'utf8');
  if (!txt.includes(photo.pageUrl)) fs.appendFileSync(f, row);
}

async function main() {
  const birds = read('birds.json');
  const tax = read('birdTaxonomy.json');

  let targets = birds.filter((b) => tax[b.id]?.speciesCode);
  if (arg('--ids')) {
    const set = new Set(arg('--ids').split(',').map((s) => s.trim().padStart(4, '0')));
    targets = targets.filter((b) => set.has(b.id));
  } else {
    const from = Number(arg('--from', 0));
    const to = Number(arg('--to', 9999));
    targets = targets.filter((b) => Number(b.id) >= from && Number(b.id) <= to);
  }
  if (flag('--limit')) targets = targets.slice(0, Number(arg('--limit', 50)));

  if (flag('--check')) {
    const one = targets[0];
    if (!one) { console.log('冇目標'); return; }
    const code = tax[one.id].speciesCode;
    console.log(`🔎 檢查 ${one.id} ${one.name}（eBird code: ${code}）`);
    console.log(`   ImageMagick：${hasMagick() || '❌ 未安裝（下載時會失敗，請先安裝）'}`);
    try {
      const list = await viaApi(code);
      console.log(`   JSON API：${list.length} 張`);
      console.log(JSON.stringify(list.slice(0, 2), null, 2));
      if (list[0]?.assetId) console.log('   單張授權：', JSON.stringify(await assetMeta(list[0].assetId)));
    } catch (e) {
      console.log('   JSON API 失敗：' + e.message + '（改用 HTML）');
      try {
        const list = await viaHtml(code);
        console.log(`   HTML：${list.length} 張`);
        console.log(JSON.stringify(list.slice(0, 2), null, 2));
        if (list[0]?.assetId) console.log('   單張授權：', JSON.stringify(await assetMeta(list[0].assetId)));
      } catch (e2) { console.log('   HTML 也失敗：' + e2.message); }
    }
    console.log('\n   ↳ 請把以上輸出（尤其 JSON 的欄位名）貼回對話，我會按真實結構修正解析。');
    return;
  }

  fs.mkdirSync(ART, { recursive: true });
  const rows = [];
  let got = 0;

  for (const bird of targets) {
    const t = tax[bird.id];
    const code = t.speciesCode;
    const dest = path.join(ART, `${bird.id}-photo.jpg`);
    if (fs.existsSync(dest) && !flag('--force')) {
      rows.push({ id: bird.id, name: bird.name, status: 'skip（已有）', n: 0 });
      continue;
    }

    let list = [];
    try {
      list = await viaApi(code);
    } catch (e) {
      console.log(`   ⚠️ ${bird.id} JSON API 失敗，改抓 HTML：${e.message}`);
      try { list = await viaHtml(code); } catch (e2) {
        console.log(`   ❌ ${bird.id} 兩條路都失敗：${e2.message}`);
        rows.push({ id: bird.id, name: bird.name, status: 'fetch-failed', n: 0 });
        continue;
      }
    }
    await sleep(DELAY);

    /* 大圖優先；再逐張補授權／作者，試到成功為止。
     * 只試第一張就一定失敗的物種會白白浪費一整輪，所以放寬到 MAX_TRY 張。 */
    const MAX_TRY = 6;
    const cands = [...list]
      .sort((a, b) => (b.width || 0) - (a.width || 0))
      .slice(0, MAX_TRY);
    let picked = null;
    const why = [];
    for (const cand of cands) {
      const meta = cand.licence ? null : await assetMeta(cand.assetId).catch(() => null);
      const photo = { ...cand, ...(meta || {}) };
      if (!photo.imageUrl) { why.push(`${cand.assetId || '?'} 無圖片網址`); continue; }
      if (!licenceAllows(photo.licence)) {
        why.push(`${cand.assetId || '?'} 授權「${photo.licence || '未標明'}」`);
        continue;
      }
      if (photo.width && photo.width < MIN_W) { why.push(`${cand.assetId} 太細（${photo.width}px）`); continue; }
      if (flag('--dry-run')) {
        picked = photo;
        break;
      }
      try {
        const bytes = await downloadTo(photo.imageUrl, dest);
        picked = photo;
        why.length = 0;
        got += 1;
        appendCredit(bird.id, bird.name, t.sciName, picked);
        console.log(`   ✅ ${bird.id} ${bird.name} → ${path.basename(dest)}（${Math.round(bytes / 1024)} KB，${picked.licence}，${picked.author || '未標明作者'}）`);
        rows.push({ id: bird.id, name: bird.name, status: 'downloaded', n: list.length });
        break;
      } catch (e) {
        why.push(`${cand.assetId || '?'} 下載／轉檔失敗：${e.message}`);
        picked = null;
      }
    }

    if (!picked && !rows.some((r) => r.id === bird.id && r.status === 'downloaded')) {
      const allLicence = cands.every((c) => c.licence) &&
        cands.filter((c) => c.licence).length > 0 &&
        cands.every((c) => !licenceAllows(c.licence));
      const status = allLicence ? 'no-licensed-photo' : 'download-failed';
      console.log(`   ⚠️ ${bird.id} ${bird.name}：${allLicence ? '冇可再用授權（只記錄連結）' : '下載失敗'}`);
      for (const w of why.slice(0, 6)) console.log(`     · ${w}`);
      rows.push({ id: bird.id, name: bird.name, status, n: list.length });
      if (allLicence && list[0]) {
        appendCredit(bird.id, bird.name, t.sciName, { ...list[0], licence: list[0].licence || '（需人手核對）' });
      }
    } else if (picked && flag('--dry-run')) {
      console.log(`   ✓ ${bird.id} ${bird.name} → 可用（${picked.licence}，${picked.author || '未標明作者'}）`);
      rows.push({ id: bird.id, name: bird.name, status: 'dry-run', n: list.length });
    }
    await sleep(DELAY);
  }

  const md = ['# 相片取得報告', '', `- 執行：${new Date().toISOString()}`, `- 目標：${targets.length} 張`,
    `- 成功下載：${got} 張`, '', '| 編號 | 名稱 | 狀態 | 找到相片數 |', '|---|---|---|---|'];
  for (const r of rows) md.push(`| ${r.id} | ${r.name} | ${r.status} | ${r.n} |`);
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, md.join('\n') + '\n');
  console.log(`\n📄 ${path.relative(ROOT, REPORT)}`);
  console.log(`📄 ${path.relative(ROOT, path.join(ART, 'Credits.md'))}`);
  console.log(got ? `\n✅ 完成 ${got} 張，已寫入 ${path.relative(ROOT, ART)}` : '\n⚠️ 冇下載到相片，請看報告');
}

/* 只有直接執行才跑主流程；被測試 import 時唔會亂跑（亦唔會誤抓網） */
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch((e) => { console.error('✗ ' + e.message); process.exit(1); });

export { normaliseLicence, licenceAllows, imageSize, hasMagick, downloadTo, MAX_W, MIN_W };
