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
const MAX_W = 1600;
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

/** 第一步：試 JSON API */
async function viaApi(code) {
  const url = `https://search.macaulaylibrary.org/api/v1/search?taxonCode=${encodeURIComponent(code)}`
    + '&mediaType=photo&sort=rating_rank_desc&count=12';
  const data = await get(url);
  const items = data.results?.content || data.content || data.results || [];
  return (Array.isArray(items) ? items : []).map((it) => ({
    assetId: it.assetId || it.id || '',
    author: it.userDisplayName || it.observer || '',
    licence: it.licenseName || it.license || '',
    pageUrl: it.assetId ? `https://macaulaylibrary.org/asset/${it.assetId}` : '',
    imageUrl: it.previewUrl || it.mediaUrl || it.largeUrl || '',
    width: it.width || it.originalWidth || 0,
  })).filter((x) => x.imageUrl);
}

/** 第二步：退回抓 HTML（只拿 asset id 與圖片網址） */
async function viaHtml(code) {
  const url = `https://search.macaulaylibrary.org/catalog?taxonCode=${encodeURIComponent(code)}&mediaType=photo&sort=rating_rank_desc`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTML HTTP ${res.status}`);
  const html = await res.text();
  const ids = [...new Set([...html.matchAll(/\/asset\/(\d{6,})/g)].map((m) => m[1]))].slice(0, 12);
  const imgs = [...html.matchAll(/https:\/\/cdn\.download\.ams\.birds\.cornell\.edu\/[^"'\s]+/g)].map((m) => m[0]);
  return ids.map((id, i) => ({
    assetId: id,
    author: '',
    licence: '',
    pageUrl: `https://macaulaylibrary.org/asset/${id}`,
    imageUrl: imgs[i] || '',
    width: 0,
  }));
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
          author: j.userDisplayName || j.photographer || '',
          licence: j.licenseName || j.license || '',
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

async function downloadTo(url, dest) {
  const buf = await get(url, false);
  const tmp = dest + '.orig';
  fs.writeFileSync(tmp, buf);
  /* 統一裁成 3:4、長邊 1600（卡面右欄就是 3:4） */
  const r = spawnSync('convert', [tmp, '-auto-orient',
    '-resize', `${MAX_W}x${MAX_W}>`, '-gravity', 'center',
    '-crop', '3:4', '+repage', '-quality', '86', dest]);
  fs.unlinkSync(tmp);
  if (r.status !== 0) throw new Error('convert 失敗（請確認已安裝 ImageMagick）');
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
    try {
      const list = await viaApi(code);
      console.log(`   JSON API：${list.length} 張`);
      console.log(JSON.stringify(list.slice(0, 2), null, 2));
      if (list[0]?.assetId) console.log('   授權：', JSON.stringify(await assetMeta(list[0].assetId)));
    } catch (e) {
      console.log('   JSON API 失敗：' + e.message + '（會改用 HTML）');
      try {
        const list = await viaHtml(code);
        console.log(`   HTML：${list.length} 張`);
        console.log(JSON.stringify(list.slice(0, 2), null, 2));
      } catch (e2) { console.log('   HTML 也失敗：' + e2.message); }
    }
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

    /* 逐張檢查授權，取第一張可用的 */
    let picked = null;
    for (const cand of list.slice(0, 8)) {
      const meta = cand.licence ? cand : (await assetMeta(cand.assetId).catch(() => null) || cand);
      const photo = { ...cand, ...meta };
      if (!photo.imageUrl) continue;
      if (!licenceAllows(photo.licence)) {
        console.log(`     · ${cand.assetId} 授權「${photo.licence || '未標明'}」→ 跳過`);
        continue;
      }
      picked = photo;
      break;
    }

    if (!picked) {
      console.log(`   ⚠️ ${bird.id} ${bird.name}：找不到可再用的授權相片（只記錄連結）`);
      rows.push({ id: bird.id, name: bird.name, status: 'no-licensed-photo', n: list.length });
      if (list[0]) {
        appendCredit(bird.id, bird.name, t.sciName, { ...list[0], licence: list[0].licence || '（需人手核對）' });
      }
      continue;
    }

    if (flag('--dry-run')) {
      console.log(`   ✓ ${bird.id} ${bird.name} → 可用（${picked.licence}，${picked.author}）`);
      rows.push({ id: bird.id, name: bird.name, status: 'dry-run', n: list.length });
      continue;
    }

    try {
      const bytes = await downloadTo(picked.imageUrl, dest);
      appendCredit(bird.id, bird.name, t.sciName, picked);
      got += 1;
      console.log(`   ✅ ${bird.id} ${bird.name} → ${path.basename(dest)}（${Math.round(bytes / 1024)} KB，${picked.licence}）`);
      rows.push({ id: bird.id, name: bird.name, status: 'downloaded', n: list.length });
    } catch (e) {
      console.log(`   ❌ ${bird.id} 下載失敗：${e.message}`);
      rows.push({ id: bird.id, name: bird.name, status: 'download-failed', n: list.length });
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

main().catch((e) => { console.error('✗ ' + e.message); process.exit(1); });
