/* ============================================================
 *  圖鑑資訊卡測試（node:test）
 *  跑：node --test tests/dexCard.test.mjs（或 npm test）
 * ------------------------------------------------------------
 *  這裡守的是「卡面不可以講大話」，不是守像素。
 *    1) 公式：分數在 1–5、缺維度回 null、已校準的三隻雀對得住
 *    2) 卡面：中欄只放中文、英欄只放英文（唔准中文頂英文、唔准機翻）
 *    3) 卡面：抽唔到資料要寫「資料待查」／Data pending，不准留白或寫「暫無」
 *    4) 卡面：同一目一定同一色（用戶要的「按目換配色」）
 *    5) 卡面：12 個資料欄位都真的有人用（唔會砌完發現某格永遠空）
 *    6) 分數檔：dexScores.json 必須與公式即時算出的結果一致（防止手改）
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

/* 借 esbuild 直接 import TS 原始碼，測試的就是 app 用的同一份 */
const outdir = mkdtempSync(path.join(tmpdir(), 'dexcardtest-'));
await build({
  entryPoints: [path.join(root, 'src/lib/dexScore.ts')],
  bundle: true, format: 'esm', platform: 'neutral', outfile: path.join(outdir, 'score.mjs'),
});
await build({
  entryPoints: [path.join(root, 'src/lib/dexCardIcons.ts')],
  bundle: true, format: 'esm', platform: 'neutral', outfile: path.join(outdir, 'icons.mjs'),
});
await build({
  entryPoints: [path.join(root, 'src/lib/dexCardLayout.ts')],
  bundle: true, format: 'esm', platform: 'neutral', outfile: path.join(outdir, 'layout.mjs'),
});
const { starsSvg } = await import(pathToFileURL(path.join(outdir, 'icons.mjs')).href);
const { dexScore } = await import(pathToFileURL(path.join(outdir, 'score.mjs')).href);
const { renderDexCard, fit, bullets, DEX_CARD_CSS, LAYOUT } = await import(pathToFileURL(path.join(outdir, 'layout.mjs')).href);

const idx = read('src/data/explorerIndex.json');
const zhAll = read('src/data/cardDetails.zh.json').birds;
const enAll = read('src/data/cardDetails.en.json').birds;
const measAll = read('src/data/measurements.json');
const scoresAll = read('src/data/dexScores.json').scores;

const CJK = /[\u4e00-\u9fff]/;

/** 與 scripts/build-dex-card-preview.mjs 相同的組裝邏輯（單一來源的思想：兩邊都由此函式） */
function cardInput(id) {
  const e = idx.birds[id];
  const m = measAll[id] || {};
  const diet = Object.fromEntries(idx.dietTags.map((t) => [t.id, t]));
  const hab = Object.fromEntries(idx.habitatTags.map((t) => [t.id, t]));
  const meas = {};
  for (const k of ['wing', 'tail', 'tarsus', 'bill']) if (m[k]) meas[k] = String(m[k]);
  return {
    id,
    zhName: e.z, enName: e.e, sciName: e.s,
    orderLatin: e.o, orderZh: e.oz, familyLatin: e.f, familyZh: e.fz,
    zh: zhAll[id] || {}, en: enAll[id] || {},
    dietZh: (e.d || []).map((t) => diet[t]?.zh).filter(Boolean),
    dietEn: (e.d || []).map((t) => diet[t]?.en).filter(Boolean),
    habitatZh: (e.h || []).map((t) => hab[t]?.zh).filter(Boolean),
    habitatEn: (e.h || []).map((t) => hab[t]?.en).filter(Boolean),
    dietIds: e.d || [],
    habitatIds: e.h || [],
    dietLabels: idx.dietTags,
    habitatLabels: idx.habitatTags,
    meas,
    mass: m.mass ? String(m.mass) : '',
    lengthCm: e.len || 0,
    lengthEstimated: !!scoresAll[id]?.vEst,
    score: scoresAll[id],
    source: read('src/data/cardCopy.json')[id]?.source || '',
    artUrl: `https://example.test/birdcards/${id}.avif`,
  };
}

/* ------------------------------------------------------------------ 1. 公式 */

test('評分公式：維度都在 1–5，缺 3 個維度以上回 null', () => {
  const full = dexScore({
    iucn: '無危 LC', habitats: 2, diets: 2, lengthCm: 25, wingMm: 0,
    hasMigration: true, hasEtymology: true, hasHighlights: true,
    conservationText: '受威脅，數量下降',
  });
  for (const k of ['importance', 'adaptability', 'visibility', 'research', 'attention']) {
    assert.ok(full[k] >= 1 && full[k] <= 5, `${k} 應在 1–5，實際 ${full[k]}`);
  }
  assert.ok(full.overall >= 1 && full.overall <= 5);

  /* 乜資料都冇 → 只有「研究價值」的 1.0 底分，少於 3 個維度，不給綜合分。
     （唔可以靠一格分數冒充整體；亦唔可以因為 IUCN 無危就假設有分） */
  const one = dexScore({ iucn: undefined, habitats: 0, diets: 0, lengthCm: 0, wingMm: 0 });
  assert.equal(one.importance, null);
  assert.equal(one.visibility, null);
  assert.equal(one.scored, 1, `應只有 1 個維度有分，實際 ${one.scored}`);
  assert.equal(one.overall, null);

  /* 無危 + 有 tag + 有翼長 = 5 個維度都有分，一定有綜合分 */
  const all = dexScore({ iucn: '無危 LC', habitats: 2, diets: 2, lengthCm: 0, wingMm: 134 });
  assert.equal(all.scored, 5);
  assert.ok(all.overall != null);
});

test('評分公式：無體長時用 AVONET 翼長估算並標記，不會靜靜當成真數據', () => {
  const est = dexScore({ iucn: '無危 LC', habitats: 1, diets: 1, lengthCm: 0, wingMm: 134 });
  assert.equal(est.lengthEstimated, true);
  assert.ok(est.visibility > 1);
  const real = dexScore({ iucn: '無危 LC', habitats: 1, diets: 1, lengthCm: 25, wingMm: 134 });
  assert.equal(real.lengthEstimated, false);
});

test('評分公式：三隻已校準的雀（八哥／小葵花／青頭潛鴨）對得住', () => {
  assert.equal(scoresAll['0013'].i, 2);      // 無危刻意 2 分不是 1 分
  assert.equal(scoresAll['0013'].o, 3.1);
  assert.ok(scoresAll['0004'].c >= 4.5);     // 小葵花：受脅 + 極危
  assert.ok(scoresAll['0004'].a >= 1.8 && scoresAll['0004'].a <= 4.3);
  assert.equal(scoresAll['0049'].i, 5);      // 青頭潛鴨：極危
  assert.ok(scoresAll['0049'].o > scoresAll['0013'].o);
});

/* ------------------------------------------------------------- 2. 語言分欄 */

test('卡面：英文段落一定是英文、中文段落一定是中文（不互相頂替）', () => {
  for (const id of ['0013', '0004', '0049']) {
    const html = renderDexCard(cardInput(id));
    /* 抽 <p class="t-en"> 的內容，不可以有中文字 */
    for (const m of html.matchAll(/<p class="t-en[^"]*">([\s\S]*?)<\/p>/g)) {
      assert.ok(!CJK.test(m[1]), `${id} 英文欄出現中文：「${m[1].slice(0, 40)}」`);
    }
    /* 抽 <p class="t-zh"> 的內容，不可以是英文句子（允許學名／簡寫） */
    for (const m of html.matchAll(/<p class="t-zh[^"]*">([\s\S]*?)<\/p>/g)) {
      const letters = (m[1].match(/[A-Za-z]/g) || []).length;
      const han = (m[1].match(/[\u4e00-\u9fff]/g) || []).length;
      assert.ok(han >= letters / 4, `${id} 中文欄出現大量英文：「${m[1].slice(0, 40)}」`);
    }
  }
});

test('卡面：抽唔到資料寫「資料待查」／Data pending，不留白、不寫「暫無」', () => {
  /* 故意餵一隻只有分類、冇任何文案的雀 */
  const bare = {
    id: '0999', zhName: '測試鳥', enName: 'Test Bird', sciName: 'Testus testus',
    orderLatin: 'Passeriformes', orderZh: '雀形目', familyLatin: 'Testidae', familyZh: '測試科',
    zh: {}, en: {}, dietZh: [], dietEn: [], habitatZh: [], habitatEn: [],
    meas: {}, lengthCm: 0, artUrl: null,
  };
  const html = renderDexCard(bare);
  assert.ok(html.includes('資料待查'), '中文欄應有「資料待查」');
  assert.ok(html.includes('Data pending'), '英文欄應有 Data pending');
  assert.ok(!html.includes('暫無'), '不可以用「暫無」代替出處標示');
  /* 冇插畫網址就要有編號佔位，不可以空 <img> */
  assert.equal(html.includes('<img'), false);
  assert.ok(html.includes('NO.0999'));
});

/* --------------------------------------------------------------- 3. 配色 */

test('卡面：同一目一定同一色，不同目不同色', () => {
  const colorOf = (id) => (renderDexCard(cardInput(id)).match(/--c:(#[0-9a-f]{6})/i) || [])[1];
  const passer = Object.keys(idx.birds).filter((k) => idx.birds[k].o === 'Passeriformes').slice(0, 3);
  const anser = Object.keys(idx.birds).filter((k) => idx.birds[k].o === 'Anseriformes').slice(0, 2);
  const set = new Set(passer.map(colorOf));
  assert.equal(set.size, 1, `雀形目應同一色，實際 ${[...set].join(',')}`);
  assert.notEqual(colorOf(passer[0]), colorOf(anser[0]), '雁形目不應與雀形目同色');
});

test('卡面：23 個目都有專屬配色（不會有目掉進預設色）', () => {
  const orders = new Set(Object.values(idx.birds).map((b) => b.o));
  const seen = new Map();
  for (const o of orders) {
    const hit = Object.keys(idx.birds).find((k) => idx.birds[k].o === o);
    const c = (renderDexCard(cardInput(hit)).match(/--c:(#[0-9a-fa-f]{6})/) || [])[1];
    assert.ok(c, `${o} 冇配色`);
    assert.equal(seen.has(c), false, `${o} 與 ${seen.get(c)} 撞色（${c}）`);
    seen.set(c, o);
  }
  assert.equal(seen.size, orders.size);
});

/* ------------------------------------------------------------ 4. 欄位覆蓋 */

test('卡面：12 個可能欄位都真的有人用，唔會砌完發現某格永遠空', () => {
  const titles = ['棲地與食性', '量度', '分佈', '外形', '繁殖', '行為', '鳴聲',
    '身長', '體重', '保育級別', '圖鑑評分'];
  const html = renderDexCard(cardInput('0013'));
  for (const t of titles) {
    assert.ok(html.includes(t), `卡面缺少「${t}」區塊`);
  }
  /* 全 569 隻：至少有一隻用到 migration（否則這一欄就是死碼） */
  const anyMigration = Object.values(zhAll).some((v) => v.migration);
  assert.ok(anyMigration, '應有雀有 migration 資料');
});

test('fit()：收到句末，不會把句子切一半', () => {
  const long = '第一句話講完。第二句話也講完。第三句話很長很長很長很長很長很長很長很長。';
  const out = fit(long, 20);
  assert.ok(out.endsWith('。'), `應收在句號，實際：「${out}」`);
  assert.ok(!out.includes('，') || out.endsWith('。') || out.endsWith('…'));
  assert.equal(fit('短句。', 100), '短句。');
  assert.equal(fit('', 100), '');
});

/* ------------------------------------------------------- 5. 分數檔 vs 公式 */

test('dexScores.json 與公式即時算出的結果一致（防止手改數據）', () => {
  let checked = 0;
  for (const [id, s] of Object.entries(scoresAll)) {
    const e = idx.birds[id];
    const d = zhAll[id] || {};
    const m = measAll[id] || {};
    const calc = dexScore({
      iucn: d.iucn,
      habitats: (e.h || []).length,
      diets: (e.d || []).length,
      lengthCm: e.len || 0,
      wingMm: m.wing ? Number(m.wing) : 0,
      hasMigration: !!d.migration,
      hasEtymology: !!d.etymology,
      hasHighlights: !!d.highlights,
      conservationText: d.conservation,
    });
    const pick = (k, v) => (v == null ? undefined : v);
    assert.equal(s.i, pick('i', calc.importance), `${id}.i 與公式不符`);
    assert.equal(s.a, pick('a', calc.adaptability), `${id}.a 與公式不符`);
    assert.equal(s.v, pick('v', calc.visibility), `${id}.v 與公式不符`);
    assert.equal(s.r, pick('r', calc.research), `${id}.r 與公式不符`);
    assert.equal(s.c, pick('c', calc.attention), `${id}.c 與公式不符`);
    assert.equal(s.o, pick('o', calc.overall), `${id}.o 與公式不符`);
    checked += 1;
  }
  assert.equal(checked, 569);
});

/* ------------------------------------------------------------ 6. 版式尺寸 */

test('卡面 CSS 的高度預算對得住 1600（不會印出半格）', () => {
  /* 海報式版面的實際高度：由 CSS 抽出來加，不是靠常數自說自話 */
  const num = (re) => {
    const m = DEX_CARD_CSS.match(re);
    assert.ok(m, `CSS 找不到 ${String(re)}`);
    return Number(m[1]);
  };
  const poster = num(/\.dx \.poster\{position:relative;height:(\d+)px/);
  const row2 = num(/\.dx \.row-2\{height:(\d+)px/);
  const row4 = num(/\.dx \.row-4\{height:(\d+)px/);
  const score = num(/\.dx \.score\{margin:\d+px 26px 0;height:(\d+)px/);
  const foot = num(/\.dx \.foot\{margin-top:auto;height:(\d+)px/);
  const gaps = 18 + 16 + 18;      // row-2 / row-4 / score 的上下留白
  const total = poster + row2 + row4 + score + foot + gaps;
  assert.ok(total <= 1600, `高度合計 ${total}，超出 1600（會切走底部）`);
  assert.ok(total >= 1540, `高度合計 ${total}，底部會留一大條空白`);
});
/* ---------------------------------------------- 7. 設計要素（用戶逐點要求） */

test('設計：每張卡上方有目徽章 + 品牌球（用戶第 1 點）', () => {
  const passer = renderDexCard(cardInput('0013'));   // 雀形目
  const anser = renderDexCard(cardInput('0049'));    // 雁形目
  assert.ok(passer.includes('class="emblem"'), '主圖缺少目徽章');
  assert.ok(passer.includes('class="brand"'), '主圖缺少品牌標記');
  /* 同目的徽章要一樣、不同目的要不一樣 */
  const emblemOf = (h) => (h.match(/class="emblem"[^>]*><svg[^>]*>(.*?)<\/svg>/s) || [])[1];
  assert.equal(emblemOf(passer), emblemOf(renderDexCard(cardInput('0008'))),
    '同為雀形目，徽章應相同');
  assert.notEqual(emblemOf(passer), emblemOf(anser), '雀形目與雁形目徽章不應相同');
});

test('設計：海報式排版，有主次不是一排等大方格（用戶：「排版比文字位重要」）', () => {
  const html = renderDexCard(cardInput('0013'));
  /* 主圖出血 + 引言壓在圖上 */
  assert.ok(html.includes('class="poster"'), '應有海報主圖區');
  assert.ok(html.includes('poster-veil'), '主圖應有漸層暗幕（令白字讀得到）');
  /* 資料帶：四個數字一眼掃完 */
  assert.equal((html.match(/class="stat[ "]/g) || []).length, 4, '應有 4 個資料格');
  /* 下方四格 */
  assert.equal((html.match(/class="pane mini"/g) || []).length, 4, '應有 4 格小卡');
  /* 唔可以再係「13 個同尺寸方格」 */
  assert.equal((html.match(/class="pnl"/g) || []).length, 0, '不應再有舊的一排方格');
});

test('設計：長段落變列點；夠位就一個字都無改（用戶第 3 點）', () => {
  const long = '第一句話講完。第二句話也講完。第三句話同樣講完。第四句收尾。';
  /* 夠位：原文照登，一個字都不改 */
  const roomy = bullets(long, 3, long.length);
  assert.deepEqual(roomy, [long], '夠位時不應拆、不應刪字');

  /* 唔夠位：拆成多點，每點都收在句末，不會出現半句 */
  const tight = bullets(long, 3, 12);
  assert.ok(tight.length >= 2, `應拆成多點，實際 ${tight.length} 點`);
  for (const p of tight) {
    assert.ok(/[。！？]$/.test(p) || p.endsWith('…'), `「${p}」不是收在句末`);
  }
  /* 拆唔開的短句保持原樣，不硬切 */
  assert.deepEqual(bullets('短句。', 3, 100), ['短句。']);
});

test('設計：五維評分有星號、綜合有星號＋精靈球（用戶第 4、5 點）', () => {
  const html = renderDexCard(cardInput('0013'));
  const stars = (html.match(/class="stars"/g) || []).length;
  /* 新版：資料帶一組總分星（維度改用 bar，避免同一個分數畫兩次） */
  assert.ok(stars >= 1, `應有星號，實際 ${stars}`);
  assert.equal((html.match(/class="dim[ "]/g) || []).length, 5, '應有五個維度 bar');
  assert.ok(html.includes('pokeball'), '綜合評分應有精靈球');
  assert.ok(html.includes('o-v'), '綜合分數應顯示');
});

test('設計：星號由分數換算，不是另外打分', () => {
  /* 4.3 → 4 粒半（Math.round(4.3*2)/2 = 4.5） */
  assert.ok(starsSvg(4.3, 14).match(/opacity="\.55"/), '4.3 應顯示半粒星');
  /* 5.0 → 五粒實心 */
  assert.equal((starsSvg(5, 14).match(/opacity="\.55"/g) || []).length, 0);
  /* 無分 → 不畫星，避免「0 分」的錯覺 */
  assert.equal(starsSvg(undefined, 14), '');
});

test('設計：列點唔會食走英文空格、唔會切開數字（實測撞過的兩個 bug）', () => {
  /* 英文逗號後的空格：接返時不可以變成「common,the」 */
  const en = 'In winter, as insects are less common, the myna eats garbage.';
  const out = bullets(en, 3, 150, true);
  assert.equal(out.join(' ').replace(/\s+/g, ' ').includes('common,the'), false,
    `英文逗號後的空格被食走：${JSON.stringify(out)}`);
  /* 千位分隔的逗號不是斷句位 */
  const num = 'Its range is larger than 20,000 km and too large to be vulnerable.';
  const out2 = bullets(num, 3, 28, true);
  for (const seg of out2) {
    assert.equal(/20,$/.test(seg), false, `把 20,000 切開了：${JSON.stringify(out2)}`);
  }
});

test('設計：569 隻全砌一次都唔會出現壞字串或空圖示', () => {
  let bad = [];
  for (const id of Object.keys(idx.birds)) {
    const html = renderDexCard(cardInput(id));
    if (/undefined|NaN|\[object|\$\{/.test(html)) bad.push(id);
    /* 圖示一定要有內容（空 path 會變成空白圓圈） */
    for (const m of html.matchAll(/<svg class="ic[^>]*>(.*?)<\/svg>/gs)) {
      if (m[1].trim().length < 10) { bad.push(`${id}:空圖示`); break; }
    }
    if (bad.length > 5) break;
  }
  assert.deepEqual(bad, [], `以下雀的卡有問題：${bad.join(', ')}`);
});
