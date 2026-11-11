#!/usr/bin/env node
/* ============================================================
 *  build-aviandex-page.mjs —— 單頁 AvianDex 出圖頁（自用，prompt 合併在頁內）
 * ------------------------------------------------------------
 *  用戶指示（2026-11）：
 *    「這個是自己用的所以可以把 prompt 也合進去」
 *    「只為生成 aviandex 資訊卡的出圖頁，連參考圖也可以以 base64 方式附加」
 *    「資料則像另一個 html 的方式定向指示他按編號到這個地方找答案，不準亂找」
 *
 *  所以這一頁做四件事：
 *    1. 打編號 → 由 repo 資料即刻砌出「准印文字」（PRINTED TEXT）
 *    2. 「資料來源」區明文列出每一格出自哪個檔／pageid，
 *       並在 prompt 內寫「只准用 SOURCE 區的內容，不准上網找、不准自己作」
 *    3. 參考圖（相片／插畫）以 base64 一併 POST 去 Gemini（inlineData）
 *    4. 出圖 + 下載；亦可只複製 prompt
 *
 *  用法：node scripts/cards/build-aviandex-page.mjs
 *  輸出：public/aviandex-gen.html
 * ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const J = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

const idx = J('src/data/explorerIndex.json');
const zh = J('src/data/cardDetails.zh.json').birds;
const en = J('src/data/cardDetails.en.json').birds;
const copy = J('src/data/cardCopy.json');
const meas = J('src/data/measurements.json');
const scores = J('src/data/dexScores.json').scores;
const sources = J('src/data/cardSources.json').sources;

/* 只帶出圖需要的欄位（唔好將 2.8MB 全部塞入 HTML） */
const KEEP = ['iucn', 'diet', 'range', 'look', 'habitat', 'funFact', 'callouts',
  'source', 'breeding', 'voice', 'behavior', 'migration', 'conservation',
  'humanRelation', 'etymology', 'highlights', 'length', 'weight', 'commonness'];

const BIRDS = {};
for (const id of Object.keys(idx.birds)) {
  const e = idx.birds[id];
  const c = copy[id] || {};
  const m = meas[id] || {};
  const sc = scores[id] || {};
  const slim = {};
  for (const k of KEEP) if (c[k]) slim[k] = c[k];
  BIRDS[id] = {
    z: e.z || '', e: e.e || '', s: e.s || '', oz: e.oz || '', fz: e.fz || '',
    o_lat: e.o || '', f_lat: e.f || '',
    len: e.len || '', mass: m.mass || '', wing: m.wing || '', tail: m.tail || '',
    bill: m.bill || '', tarsus: m.tarsus || '',
    o: sc.o ?? null,
    i: sc.i ?? null, a: sc.a ?? null, v: sc.v ?? null, r: sc.r ?? null,
    cc: sc.c ?? null,
    h: (e.h || []).map((t) => idx.habitatTags.find((x) => x.id === t)?.zh).filter(Boolean),
    d: (e.d || []).map((t) => idx.dietTags.find((x) => x.id === t)?.zh).filter(Boolean),
    zhLook: (zh[id] || {}).look || '',
    enHas: !!(en[id] && Object.keys(en[id]).length),
    copy: slim,
    src: sources[id] || '',
  };
}

const html = `<!doctype html>
<html lang="zh-Hant-HK">
<head>
<meta charset="utf-8">
<title>AvianDex 資訊卡出圖</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<style>
  :root{--bg:#0B0F0C;--card:#141A15;--card2:#1A2119;--line:#26302A;--ink:#EFF3EC;--soft:#94A398;
        --faint:#5A6459;--lime:#E8FF47;--deep:#11402A;--gold:#CE9820;--miss:#C26A5A;--ok:#4F9D6A;
        --mono:ui-monospace,SFMono-Regular,Menlo,monospace}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
    font:13.5px/1.65 "Noto Sans TC","PingFang HK","Microsoft JhengHei",system-ui,sans-serif}
  header{position:sticky;top:0;z-index:20;display:flex;gap:14px;align-items:center;flex-wrap:wrap;
    padding:12px 18px;background:rgba(11,15,12,.92);backdrop-filter:blur(14px);
    border-bottom:1px solid var(--line)}
  header h1{margin:0;font-size:14px}
  header p{margin:0;font-size:11.5px;color:var(--soft)}
  .wrap{max-width:1320px;margin:0 auto;padding:16px 18px 80px;
    display:grid;grid-template-columns:400px 1fr;gap:16px;align-items:start}
  @media (max-width:940px){.wrap{grid-template-columns:1fr}}
  .panel{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px}
  .panel+.panel{margin-top:12px}
  .panel h2{margin:0 0 9px;font-size:11px;letter-spacing:.15em;color:var(--soft);font-weight:800}
  input[type=text],select,textarea{width:100%;padding:9px 11px;border-radius:9px;
    border:1px solid var(--line);background:#090C0A;color:var(--ink);font:13px/1.6 inherit}
  input.mono{font-family:var(--mono);letter-spacing:.12em;font-size:15px}
  textarea{font-family:var(--mono);font-size:11px;line-height:1.75;min-height:260px;resize:vertical}
  .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  button{padding:9px 13px;border-radius:9px;border:1px solid var(--line);background:#1C241C;
    color:var(--ink);font:700 12.5px/1 inherit;cursor:pointer}
  button:hover{background:#243020}
  button.main{background:var(--lime);color:#0B0F0C;border-color:var(--lime)}
  button.mini{padding:6px 10px;font-size:11.5px}
  label{display:block;font-size:11.5px;color:var(--soft);margin:9px 0 4px}
  .src{border-left:2px solid var(--line);padding-left:10px;margin:4px 0 8px;font-size:12px}
  .src b{color:var(--gold);font-weight:800}
  .src .v{display:block;color:var(--soft);font-size:11.5px;margin-top:2px;
    max-height:44px;overflow:hidden}
  .check{font-size:12px}
  .check .r{display:flex;gap:7px;padding:4px 0;border-bottom:1px dashed #1F2822}
  .check .r:last-child{border-bottom:0}
  .dot{width:7px;height:7px;border-radius:50%;margin-top:6px;flex:0 0 auto}
  .yes{background:var(--ok)}.no{background:var(--miss)}
  .check .k{font-weight:700;min-width:64px}
  .check .v2{margin-left:auto;color:var(--soft);text-align:right;max-width:60%;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .preview{background:#090C0A;border:1px solid var(--line);border-radius:13px;min-height:460px;
    display:flex;align-items:center;justify-content:center;overflow:hidden}
  .preview img{max-width:100%;display:block}
  .thumb{width:100%;border-radius:9px;border:1px solid var(--line);margin-top:8px}
  .hint{font-size:11.5px;color:var(--soft);line-height:1.6;margin:6px 0 0}
  .toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#1D3A29;
    border:1px solid #2F6B4C;color:#D7EAD9;padding:9px 17px;border-radius:999px;font-size:12px;
    opacity:0;pointer-events:none;transition:.25s;z-index:60}
  .toast.on{opacity:1}
  .tag{display:inline-block;font-size:10.5px;padding:2px 8px;border-radius:999px;
    background:#1E2A20;border:1px solid var(--line);margin:0 5px 4px 0}
  .warn{background:#2A1D16;border:1px solid #5A3A2A;color:#E8C7B4;padding:8px 10px;
    border-radius:9px;font-size:11.5px;margin-top:8px;line-height:1.6}
</style>
</head>
<body>
<header>
  <h1>AvianDex 資訊卡 · 出圖</h1>
  <p>打編號 → 資料定向鎖定（不准亂找）→ 出圖｜prompt 已內建</p>
</header>

<div class="wrap">
  <div>
    <section class="panel">
      <h2>① 編號</h2>
      <div class="row">
        <input id="no" class="mono" type="text" value="0013" inputmode="numeric" style="flex:1;min-width:100px">
        <button class="mini" id="prev">←</button>
        <button class="mini" id="next">→</button>
      </div>
      <div id="who" style="margin-top:10px"></div>
      <div id="risk"></div>
    </section>

    <section class="panel">
      <h2>② 參考圖（base64 一併送出）</h2>
      <input type="file" id="refFile" accept="image/*">
      <p class="hint">上載插畫／相片 → 直接以 <code>inlineData</code> 附在請求內，AI 只負責重繪，不能改變物種。</p>
      <img id="refThumb" class="thumb" style="display:none" alt="參考圖">
      <div class="row" style="margin-top:8px">
        <button class="mini" id="clearRef">清除參考圖</button>
      </div>
    </section>

    <section class="panel">
      <h2>③ 資料來源（AI 只准用這些，不准上網找）</h2>
      <div id="srcList"></div>
      <p class="hint">每一項都寫明來自哪個檔與 pageid。Prompt 內會明文禁止改用其他來源。</p>
    </section>

    <section class="panel">
      <h2>④ 出圖</h2>
      <label>Gemini API Key（留空＝只複製 prompt 去 Gemini 網頁）</label>
      <input id="key" type="text" placeholder="AIza..." autocomplete="off">
      <label>模型（失敗會自動試下一個）</label>
      <select id="model">
        <option value="gemini-2.5-flash-image">gemini-2.5-flash-image（快）</option>
        <option value="gemini-3-pro-image-preview">gemini-3-pro-image-preview（靚、慢）</option>
      </select>
      <label>比例</label>
      <select id="aspect">
        <option value="3:4">3:4（預設，資訊卡）</option>
        <option value="2:3">2:3</option>
        <option value="1:1">1:1</option>
        <option value="4:5">4:5</option>
      </select>
      <div class="row" style="margin-top:11px">
        <button class="main" id="gen">出圖</button>
        <button id="copy">複製 prompt</button>
        <a id="dl" download style="display:none"><button>下載 PNG</button></a>
      </div>
    </section>
  </div>

  <div>
    <div class="preview" id="preview"><span style="color:var(--faint);font-size:12.5px">未有圖</span></div>
    <section class="panel" style="margin-top:12px">
      <h2>Prompt（內建，只由資料砌出來）</h2>
      <textarea id="prompt" readonly></textarea>
      <div class="row" style="margin-top:8px">
        <button class="mini" id="copy2">複製 prompt</button>
        <button class="mini" id="openGemini">開 Gemini 網頁</button>
      </div>
    </section>
  </div>
</div>
<div class="toast" id="toast">已複製</div>

<script>
const BIRDS = ${JSON.stringify(BIRDS)};
const IDS = Object.keys(BIRDS).sort();
const $ = (id) => document.getElementById(id);
let cur = '0013';
let refB64 = null, refMime = null;

const padn = (s) => String(s || '').replace(/\\D/g, '').padStart(4, '0');
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function sent(s, n){
  s = String(s || '').replace(/\\s+/g, ' ').trim();
  if (!s) return '';
  const i = s.search(/[。；]/);
  const out = (i > 0 && i <= n) ? s.slice(0, i + 1) : s.slice(0, n);
  return out + (out.length < s.length && !/[。；]$/.test(out) ? '…' : '');
}
function stars(v){
  const n = Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

/* ── 卡面准印文字：只由資料產生 ── */
function printedText(id, b){
  const c = b.copy || {};
  const L = [
    ['編號', 'NO.' + id],
    ['中文名', b.z],
    ['學名', b.s],
    ['英文名', b.e],
    ['目 · 科', (b.oz || '') + ' · ' + (b.fz || '')],
    ['體長', b.len ? b.len + ' cm' : '資料待查'],
    ['體重', b.mass ? b.mass + ' g' : '資料待查'],
    ['翼長', b.wing ? b.wing + ' mm' : '資料待查'],
    ['保育級別', c.iucn || '資料待查'],
    ['圖鑑評分', b.o != null ? Number(b.o).toFixed(1) + '/5 ' + stars(b.o) : '資料待查'],
    ['棲地', (b.h.join('、') || '資料待查')],
    ['食性', (b.d.join('、') || '資料待查')],
    ['外形', sent(b.zhLook || c.look, 46) || '資料待查'],
    ['食性說明', sent(c.diet, 46) || '資料待查'],
    ['鳴聲', sent(c.voice, 46) || '資料待查'],
    ['冷知識', sent(c.funFact, 48) || '資料待查'],
    ['分佈', sent(c.range, 46) || '資料待查'],
    ['出處', b.src || '資料待查'],
  ];
  return L;
}

/* ── 資料來源清單（給人看，亦寫入 prompt） ── */
function sourceList(id, b){
  const c = b.copy || {};
  const out = [];
  const push = (k, file, field, v) => {
    if (!v) return;
    out.push({ k, file, field, v: String(v).replace(/\\s+/g, ' ').slice(0, 160) });
  };
  push('中文名 / 英文名 / 學名 / 目科', 'src/data/explorerIndex.json', 'birds["' + id + '"]', [b.z, b.e, b.s, b.oz, b.fz].filter(Boolean).join(' · '));
  push('身長', 'src/data/explorerIndex.json', 'birds["' + id + '"].len', b.len ? b.len + ' cm' : '');
  push('量度（AVONET）', 'src/data/measurements.json', '["' + id + '"]', [b.wing && ('翼長 ' + b.wing + 'mm'), b.tail && ('尾長 ' + b.tail + 'mm'), b.mass && ('體重 ' + b.mass + 'g')].filter(Boolean).join(' · '));
  push('圖鑑評分（自訂指標）', 'src/data/dexScores.json', 'scores["' + id + '"]', b.o != null ? ('綜合 ' + Number(b.o).toFixed(2) + ' / 5') : '');
  push('棲地標籤', 'src/data/explorerIndex.json', 'habitatTags', b.h.join('、'));
  push('食性標籤', 'src/data/explorerIndex.json', 'dietTags', b.d.join('、'));
  for (const [label, field] of [['外形', 'look'], ['食性說明', 'diet'], ['鳴聲', 'voice'],
    ['冷知識', 'funFact'], ['分佈', 'range'], ['繁殖', 'breeding'], ['行為', 'behavior'],
    ['遷徙', 'migration'], ['保育', 'conservation'], ['人與鳥', 'humanRelation'],
    ['名稱由來', 'etymology']]) {
    const v = field === 'look' ? (b.zhLook || c.look) : c[field];
    push(label, 'src/data/cardCopy.json + cardDetails.zh.json', '["' + id + '"].' + field, v);
  }
  push('出處（pageid）', 'src/data/cardSources.json', 'sources["' + id + '"]', b.src);
  return out;
}

/* ── Prompt：PRINTED TEXT 與 COMPOSITION 分開；資料定向鎖定 ── */
function buildPrompt(id, b, aspect, hasRef){
  const lines = printedText(id, b);
  const printed = lines.map(([k, v]) => '  - ' + k + '：' + v).join('\\n');

  const srcBlock = sourceList(id, b)
    .map((s) => '  · ' + s.k + ' ← ' + s.file + ' · ' + s.field + '\\n      ' + s.v)
    .join('\\n');

  return [
    'Create ONE finished AvianDex bird encyclopedia card (front side only), perfectly flat and facing the camera, like a clean product photo of a real printed card. No table, no hands, no tilt, no mockup, no watermark.',

    hasRef
      ? 'The attached reference image shows the EXACT bird and the exact artwork to use. Repaint/recompose it into the card layout below; keep the species, plumage colours, head shape and beak identical. Never substitute a different species.'
      : 'The card shows ONE single bird, photorealistic, the exact species described in the PRINTED TEXT block below.',

    'DATA SOURCE — DIRECTIONAL LOCK (hard rule):',
    '  Every fact on this card must come from the SOURCE BLOCK below, which was read from this project\\'s own data files by bird number ' + id + '.',
    srcBlock,
    '  You are FORBIDDEN to browse, search, recall or invent any other source. If a value is not in the SOURCE BLOCK, the card must print 資料待查 for that field. Do not guess, do not round, do not convert units.',

    'PRINTED TEXT — the ONLY words, letters and numbers allowed on the card:',
    printed,

    'COMPOSITION DIRECTION — paint these into the artwork; NEVER print them as words on the card:',
    '  - Layout: portrait ' + aspect + '. (1) dark green header band across the top: large Traditional Chinese name on the left, italic scientific name beneath, a white pill with the English name on the right, a round IUCN badge at the far right.',
    '    (2) One large rounded portrait window occupying more than half the card height, holding ONE photorealistic bird: complete body, clear head, natural posture.',
    '    (3) A small vertical stack of 2–3 dark green habitat chips with white pictograms at the left of the portrait.',
    '    (4) Below the portrait: three game-style stat bars — gold fill on a cream track, a dark green rounded label on the left, the value on the right.',
    '    (5) Below that: one row of four small white plaques, each with a slim dark green label and one sentence from PRINTED TEXT.',
    '    (6) A slim dark green footer strip: NO. number, Chinese name (scientific name), version tag.',
    '  - Style: premium printed naturalist field-guide card, thick dark forest-green rounded frame with a subtle inner bevel, warm cream paper with fine fibre texture, flat print design.',
    '  - Palette: deep green #11402A, cream #F7F3E9, gold #CE9820.',
    '  - Stat bars: gold fill on cream track; labels dark green; numbers dark green, bold.',

    'RENDERING RULES:',
    '1. Full-bleed illustration inside a proper frame and borders. Flat matte letterpress paper finish.',
    '2. TEXT: render ONLY the PRINTED TEXT lines, exactly as written, in clean legible Traditional Chinese typography. Every line must appear COMPLETE and UNABRIDGED — keep the label and its value together (e.g. "體重：116.3 g" must keep the "體重：" part). Omitting or shortening any line, label or character is a rendering failure.',
    '3. If a field says 資料待查, print 資料待查 — never replace it with a number.',
    '4. NEVER include: invented statistics, extra slogans, QR codes, barcodes, price tags, advertisement text, simplified Chinese characters, a second bird, a different species.',
    '5. No holographic foil, no gradient glow, no neon, no drop shadow.',
    '6. FINAL CHECK: before finishing, verify every PRINTED TEXT line is present with correct characters and that no number differs from the SOURCE BLOCK; silently fix any defect.',
  ].join('\\n\\n');
}

/* ── 畫面 ── */
function show(id){
  const b = BIRDS[id];
  if (!b) { $('who').innerHTML = '<span class="tag">找不到 NO.' + id + '</span>'; return; }
  cur = id; $('no').value = id;

  $('who').innerHTML = '<div style="font-size:21px;font-weight:900;line-height:1.2">' + esc(b.z) + '</div>'
    + '<div style="font-style:italic;color:var(--soft);font-size:12px">' + esc(b.s) + ' · ' + esc(b.e) + '</div>'
    + '<div style="margin-top:7px">'
    + [b.oz, b.fz, b.copy.iucn].filter(Boolean).map((t) => '<span class="tag">' + esc(t) + '</span>').join('')
    + '</div>';

  /* 風險提示：缺資料會令卡面出現「資料待查」 */
  const lines = printedText(id, b);
  const missing = lines.filter(([, v]) => v === '資料待查').map(([k]) => k);
  $('risk').innerHTML = missing.length
    ? '<div class="warn">' + missing.length + ' 項會印「資料待查」：' + missing.join('、')
      + '<br>（不會由 AI 補，這是刻意的）</div>'
    : '<div class="warn" style="background:#16281C;border-color:#2C5238;color:#BFE4CB">資料齊全</div>';

  /* 資料來源 */
  const sl = sourceList(id, b);
  $('srcList').innerHTML = sl.length
    ? sl.map((s) => '<div class="src"><b>' + esc(s.k) + '</b>'
      + '<span style="color:var(--faint);font-size:11px"> ← ' + esc(s.file) + '</span>'
      + '<span class="v">' + esc(s.v) + '</span></div>').join('')
    : '<div class="hint">這個編號在 repo 內沒有資料。</div>';

  refreshPrompt();
}

function refreshPrompt(){
  const b = BIRDS[cur];
  if (!b) return;
  $('prompt').value = buildPrompt(cur, b, $('aspect').value, !!refB64);
}

$('aspect').addEventListener('change', refreshPrompt);
$('no').addEventListener('keydown', (e) => { if (e.key === 'Enter') show(padn($('no').value)); });
$('no').addEventListener('change', () => show(padn($('no').value)));
$('prev').onclick = () => { const i = IDS.indexOf(cur); if (i > 0) show(IDS[i - 1]); };
$('next').onclick = () => { const i = IDS.indexOf(cur); if (i >= 0 && i < IDS.length - 1) show(IDS[i + 1]); };

/* 參考圖 → base64 */
$('refFile').addEventListener('change', (ev) => {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const s = String(r.result);
    const m = s.match(/^data:([^;]+);base64,(.*)$/);
    if (!m) { toast('讀取失敗'); return; }
    refMime = m[1]; refB64 = m[2];
    $('refThumb').src = s; $('refThumb').style.display = 'block';
    toast('已附加參考圖（' + Math.round(refB64.length * 0.75 / 1024) + ' KB）');
    refreshPrompt();
  };
  r.readAsDataURL(f);
});
$('clearRef').onclick = () => {
  refB64 = null; refMime = null;
  $('refFile').value = ''; $('refThumb').style.display = 'none';
  refreshPrompt(); toast('已清除參考圖');
};

/* 複製 */
async function copyPrompt(){
  const t = $('prompt').value;
  try { await navigator.clipboard.writeText(t); toast('已複製 prompt'); }
  catch { $('prompt').select(); document.execCommand('copy'); toast('已複製 prompt'); }
}
$('copy').onclick = copyPrompt;
$('copy2').onclick = copyPrompt;
$('openGemini').onclick = () => {
  window.open('https://gemini.google.com/app', '_blank', 'noopener');
  toast('已開 Gemini：貼上 prompt（參考圖要另外上載）');
};

/* 出圖 */
const FALLBACK = ['gemini-2.5-flash-image', 'gemini-3-pro-image-preview'];

async function callImage(prompt, key, model, aspect){
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model
    + ':generateContent' + (key ? '?key=' + encodeURIComponent(key) : '');
  const parts = [];
  if (refB64) parts.push({ inlineData: { mimeType: refMime || 'image/png', data: refB64 } });
  parts.push({ text: prompt });
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { imageConfig: { aspectRatio: aspect } },
  };
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json.error && json.error.message) || ('HTTP ' + res.status);
    const e = new Error(msg); e.status = res.status; throw e;
  }
  const cand = (json.candidates || [])[0];
  const ps = (cand && cand.content && cand.content.parts) || [];
  const p = ps.find((x) => x.inlineData || x.inline_data);
  if (!p) {
    const reason = (cand && cand.finishReason) || 'unknown';
    throw new Error(reason === 'IMAGE_SAFETY' || reason === 'SAFETY'
      ? '內容被安全過濾器擋住，請改參考圖或描述再試'
      : 'AI 冇返回圖片（' + reason + '）');
  }
  const d = p.inlineData || p.inline_data;
  return 'data:' + (d.mimeType || d.mime_type || 'image/png') + ';base64,' + d.data;
}

$('gen').onclick = async () => {
  const key = $('key').value.trim();
  const prompt = $('prompt').value;
  const aspect = $('aspect').value;
  const first = $('model').value;
  const queue = [first].concat(FALLBACK.filter((m) => m !== first));
  const pv = $('preview');
  pv.innerHTML = '<span style="color:var(--soft);font-size:12.5px">出圖中…（30–90 秒）</span>';
  let lastErr = null;
  for (const model of queue) {
    try {
      const dataUrl = await callImage(prompt, key, model, aspect);
      pv.innerHTML = '';
      const img = new Image(); img.src = dataUrl; img.alt = 'NO.' + cur; pv.appendChild(img);
      const a = $('dl'); a.href = dataUrl; a.download = 'aviandex-' + cur + '.png';
      a.style.display = 'inline-block';
      toast('完成 · ' + model);
      return;
    } catch (e) {
      lastErr = e;
      if (e.status === 400 || e.status === 403) break;
    }
  }
  pv.innerHTML = '<div style="padding:22px;text-align:center;color:var(--miss);font-size:12.5px;line-height:1.7">'
    + '出圖失敗：' + esc(lastErr ? lastErr.message : '未知錯誤')
    + '<br><br>沒有 Key 就按「複製 prompt」去 Gemini 網頁出圖。</div>';
};

let tt;
function toast(m){ const el = $('toast'); el.textContent = m; el.classList.add('on');
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 1900); }

show('0013');
</script>
</body>
</html>
`;

writeFileSync(path.join(root, 'public/aviandex-gen.html'), html, 'utf8');
const kb = Math.round(Buffer.byteLength(html) / 1024);
console.log('已寫入 public/aviandex-gen.html（' + Object.keys(BIRDS).length + ' 隻 · ' + kb + ' KB）');
