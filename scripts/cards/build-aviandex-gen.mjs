#!/usr/bin/env node
/* ============================================================
 *  build-aviandex-gen.mjs —— AvianDex 出圖頁（照「卡牌生成器」的殼做）
 * ------------------------------------------------------------
 *  用戶的架構（我照抄）：
 *    · 殼只管 UI 同呼叫 API；prompt 由「倉」的 buildPrompt 砌
 *    · PRINTED TEXT（准印字）同 COMPOSITION（只准畫）分開兩塊
 *    · 加一句「漏字／漏標籤 = 渲染失敗」的檢查
 *
 *  同你原本殼的分別：
 *    · 卡種只有 aviandex 一款，欄位只有 編號 / 姿態 / 准印文字
 *    · 打編號 → 由 repo 的 JSON 自動填好「准印文字」，唔需要人手打
 *    · 出圖後可下載 PNG；亦可一鍵複製 prompt 去 Gemini 網頁慢慢出
 *
 *  用法：node scripts/cards/build-aviandex-gen.mjs
 *  輸出：public/aviandex-gen.html（Vercel 或本機 dev server 都開得）
 * ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const J = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

const idx = J('src/data/explorerIndex.json');
const zh = J('src/data/cardDetails.zh.json').birds;
const copy = J('src/data/cardCopy.json');
const meas = J('src/data/measurements.json');
const scores = J('src/data/dexScores.json').scores;
const sources = J('src/data/cardSources.json').sources;

const sent = (s, n = 44) => {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const i = s.search(/[。；]/);
  const out = i > 0 && i <= n ? s.slice(0, i + 1) : s.slice(0, n);
  return out + (out.length < s.length && !/[。；]$/.test(out) ? '…' : '');
};
const stars = (v) => {
  const n = Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
};

const BIRDS = {};
for (const id of Object.keys(idx.birds)) {
  const e = idx.birds[id];
  const c = copy[id] || {};
  const m = meas[id] || {};
  const sc = scores[id] || {};
  BIRDS[id] = {
    z: e.z || '', e: e.e || '', s: e.s || '',
    oz: e.oz || '', fz: e.fz || '',
    len: e.len || '', mass: m.mass || '', iucn: c.iucn || '',
    o: sc.o ?? null,
    h: (e.h || []).map((t) => idx.habitatTags.find((x) => x.id === t)?.zh).filter(Boolean),
    d: (e.d || []).map((t) => idx.dietTags.find((x) => x.id === t)?.zh).filter(Boolean),
    look: (zh[id] || {}).look || c.look || '',
    diet: c.diet || '', voice: c.voice || '', fact: c.funFact || '',
    src: sources[id] || '',
  };
}

const DIMS =
  'portrait 3:4 — (1) dark green header band across the top: large Traditional Chinese name on the left, ' +
  'italic scientific name beneath, a white pill with the English name on the right, a round IUCN badge at the far right; ' +
  '(2) one large rounded portrait window over half the card height holding ONE photorealistic bird, complete body, clear head, natural pose; ' +
  '(3) a small vertical stack of 2–3 dark green habitat chips with white pictograms at the left of the portrait; ' +
  '(4) below the portrait three game-style stat bars, gold fill on cream track, dark green rounded label left, number right; ' +
  '(5) a row of four small white plaques, each a slim dark green label plus one sentence; ' +
  '(6) a slim dark green footer strip with the NO. number, the Chinese name (scientific name) and a version tag';

const html = `<!doctype html>
<html lang="zh-Hant-HK">
<head>
<meta charset="utf-8">
<title>AvianDex 出圖 · 鳥類圖鑑卡</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<style>
  :root{--bg:#0E0E10;--bg2:#16161A;--card:#1C1C20;--line:#2A2A31;--ink:#F2F1ED;--soft:#9A9A96;
        --faint:#5A5A58;--lime:#E8FF47;--deep:#11402A;--gold:#CE9820;--miss:#C26A5A;--ok:#4F9D6A;
        --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.65 "Noto Sans TC","PingFang HK","Microsoft JhengHei",system-ui,sans-serif}
  body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:-1;
    background-image:radial-gradient(#26262C 1px,transparent 1px);background-size:24px 24px;opacity:.6}
  header{position:sticky;top:0;z-index:20;display:flex;gap:12px;align-items:center;flex-wrap:wrap;
    padding:14px 20px;background:rgba(14,14,16,.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
  header h1{margin:0;font-size:14.5px;letter-spacing:.02em}
  header p{margin:0;font-size:11.5px;color:var(--soft)}
  .wrap{max-width:1240px;margin:0 auto;padding:18px 20px 70px;display:grid;
    grid-template-columns:minmax(320px,420px) 1fr;gap:18px;align-items:start}
  @media (max-width:900px){.wrap{grid-template-columns:1fr}}
  .panel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
  .panel h2{margin:0 0 10px;font-size:11.5px;letter-spacing:.14em;color:var(--soft);font-weight:800}
  label{display:block;font-size:11.5px;color:var(--soft);margin:10px 0 4px}
  input[type=text],select,textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--line);
    background:#0B0F09;color:var(--ink);font:13px/1.6 inherit}
  input.mono{font-family:var(--mono);letter-spacing:.1em;font-size:15px}
  textarea{min-height:220px;font-family:var(--mono);font-size:11.5px;line-height:1.7;resize:vertical}
  .row{display:flex;gap:8px;flex-wrap:wrap}
  button{padding:10px 14px;border-radius:10px;border:1px solid var(--line);background:#1D241A;color:var(--ink);
    font:700 12.5px/1 inherit;cursor:pointer}
  button:hover{background:#243020}
  button.main{background:var(--lime);color:#0E0E10;border-color:var(--lime)}
  button.main:hover{filter:brightness(1.06)}
  button.ghost{background:transparent}
  .chk{display:flex;gap:8px;align-items:flex-start;font-size:12px;padding:5px 0;border-bottom:1px dashed #23232A}
  .chk:last-child{border-bottom:0}
  .dot{width:8px;height:8px;border-radius:50%;margin-top:6px;flex:0 0 auto}
  .yes{background:var(--ok)} .no{background:var(--miss)}
  .chk b{font-weight:700}
  .chk span.v{margin-left:auto;color:var(--soft);text-align:right;max-width:58%;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .preview{background:#0B0F09;border:1px solid var(--line);border-radius:14px;min-height:420px;
    display:flex;align-items:center;justify-content:center;overflow:hidden}
  .preview img{max-width:100%;display:block}
  .hint{font-size:11.5px;color:var(--soft);margin:6px 0 0;line-height:1.6}
  .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1D3A29;
    border:1px solid #2F6B4C;color:#D7EAD9;padding:10px 18px;border-radius:999px;font-size:12.5px;
    opacity:0;pointer-events:none;transition:.25s;z-index:60}
  .toast.on{opacity:1}
  .tag{display:inline-block;font-size:10.5px;padding:2px 8px;border-radius:999px;background:#22301F;
    border:1px solid var(--line);margin-right:6px}
</style>
</head>
<body>
<header>
  <h1>AvianDex 出圖 · 鳥類圖鑑卡</h1>
  <p>打編號 → 准印文字自動填好（由 repo 資料帶入）→ 出圖或複製 prompt</p>
</header>

<div class="wrap">
  <section class="panel">
    <h2>① 邊隻雀</h2>
    <div class="row">
      <input id="no" class="mono" type="text" value="0013" inputmode="numeric" style="flex:1;min-width:110px">
      <button class="ghost" id="prev">←</button>
      <button class="ghost" id="next">→</button>
    </div>
    <div id="who" style="margin-top:10px"></div>

    <h2 style="margin-top:16px">② 姿態</h2>
    <select id="pose">
      <option value="側身站立，身體完整入鏡，自然姿態">側身站立（預設）</option>
      <option value="正面望向鏡頭，眼神清楚，姿態自然">正面望鏡頭</option>
      <option value="展翅或跳躍一刻，動作清楚但不誇張">展翅／跳躍</option>
      <option value="停棲在樹枝上，身體完整，背景柔化">停在樹枝</option>
    </select>

    <h2 style="margin-top:16px">③ 卡面准印文字（自動填，勿改錯）</h2>
    <div id="check"></div>

    <h2 style="margin-top:16px">④ 出圖</h2>
    <label>Gemini API Key（用 Gemini 網頁出圖可留空）</label>
    <input id="key" type="text" placeholder="留空＝只複製 prompt" autocomplete="off">
    <div class="row" style="margin-top:10px">
      <button class="main" id="gen">出圖</button>
      <button id="copy">複製 prompt</button>
      <button id="openGemini">開 Gemini</button>
      <a id="dl" download style="display:none"><button>下載 PNG</button></a>
    </div>
    <p class="hint">出圖用 <code>gemini-2.5-flash-image</code>；失敗會自動試 <code>gemini-3-pro-image-preview</code>。
      出圖後請核對：所有准印文字是否逐字正確、有沒有漏行（漏字＝渲染失敗）。</p>
  </section>

  <section>
    <div class="preview" id="preview"><span style="color:var(--faint);font-size:12.5px">未有圖</span></div>
    <div class="panel" style="margin-top:14px">
      <h2>Prompt（外殼只負責組合，內容全部由資料帶入）</h2>
      <textarea id="prompt" readonly></textarea>
    </div>
  </section>
</div>
<div class="toast" id="toast">已複製</div>

<script>
const BIRDS = ${JSON.stringify(BIRDS)};
const IDS = Object.keys(BIRDS).sort();
const DIMS = ${JSON.stringify(DIMS)};
const $ = (id) => document.getElementById(id);
let cur = '0013';

const padn = (s) => String(s || '').replace(/\\D/g, '').padStart(4, '0');
function sent(s, n){ s = String(s||'').replace(/\\s+/g,' ').trim(); if(!s) return '';
  const i = s.search(/[。；]/); const out = (i>0 && i<=n) ? s.slice(0,i+1) : s.slice(0,n);
  return out + (out.length < s.length && !/[。；]$/.test(out) ? '…' : ''); }
function stars(v){ const n = Math.max(0, Math.min(5, Math.round(Number(v)||0)));
  return '★'.repeat(n) + '☆'.repeat(5-n); }

function printedLines(id, b){
  return [
    'NO.' + id,
    b.z, b.s, b.e,
    b.oz + ' · ' + b.fz,
    b.len ? '體長 ' + b.len + ' cm' : '體長 資料待查',
    b.mass ? '體重 ' + b.mass + ' g' : '體重 資料待查',
    b.iucn || '保育級別 資料待查',
    b.o != null ? '圖鑑評分 ' + Number(b.o).toFixed(1) + '/5 ' + stars(b.o) : '圖鑑評分 資料待查',
    '棲地 ' + (b.h.join('、') || '待查'),
    '食性 ' + (b.d.join('、') || '待查'),
    '外形 ' + (sent(b.look,44) || '待查'),
    '食性 ' + (sent(b.diet,44) || '待查'),
    '鳴聲 ' + (sent(b.voice,44) || '待查'),
    '冷知識 ' + (sent(b.fact,46) || '待查'),
    b.src ? '出處 ' + b.src : '',
  ].filter(Boolean);
}

function buildPrompt(id, b, pose){
  const printed = printedLines(id, b);
  return [
    'Create ONE finished AvianDex bird encyclopedia card (front side only), shown perfectly flat and facing the camera, like a clean product photo of a real printed card. No table, no hands, no tilt, no mockup, no watermark.',
    'The card shows ONE single bird, photorealistic, the exact species described below. The bird is the hero: complete body, clear head, natural posture, ' + pose + '. Background painted softly blurred, natural habitat, so the bird stands out.',
    '',
    'PRINTED TEXT — the ONLY words, letters and numbers allowed on the card:',
    printed.map((t) => '  - ' + t).join('\\n'),
    '',
    'COMPOSITION DIRECTION — paint these into the artwork; NEVER print them as words on the card:',
    '  - Card layout: ' + DIMS,
    '  - Style: premium printed naturalist field-guide card, dark forest-green thick rounded frame with subtle inner bevel, warm cream paper with fine fibre texture, flat print design.',
    '  - Palette: deep green #11402A, cream #F7F3E9, gold #CE9820.',
    '  - Stat bars: gold fill on a cream track, dark green rounded label on the left, number on the right.',
    '',
    'RENDERING RULES:',
    '1. Portrait 3:4 ratio, full-bleed illustration inside a proper frame and borders.',
    '2. TEXT: render ONLY the lines in the PRINTED TEXT block, exactly as written, in clean legible Traditional Chinese typography, spelled correctly. Every line must appear COMPLETE and UNABRIDGED — print the label and the value together (for example "體重 116.3 g" must keep the "體重" part; do NOT drop labels). Omitting or shortening any line, label or character is a rendering failure.',
    '3. Do NOT invent any statistic. If a number is not in the PRINTED TEXT block, it must NOT appear on the card. Never fill 資料待查 with a guess.',
    '4. NEVER include: extra slogans, QR codes, barcodes, price tags, advertisement text, simplified Chinese characters, a second bird.',
    '5. Flat matte letterpress paper finish. No holographic foil, no gradient glow, no neon, no drop shadow.',
    '6. FINAL CHECK: before finishing, verify every PRINTED TEXT line is present with correct characters — no missing lines, no missing labels, no wrong glyphs; silently fix any defect.',
  ].join('\\n');
}

function show(id){
  const b = BIRDS[id];
  if(!b){ $('who').innerHTML = '<span class="tag">找不到 NO.' + id + '</span>'; return; }
  cur = id; $('no').value = id;
  $('who').innerHTML = '<div style="font-size:22px;font-weight:900">' + b.z + '</div>'
    + '<div style="font-style:italic;color:var(--soft);font-size:12.5px">' + b.s + ' · ' + b.e + '</div>'
    + '<div style="margin-top:8px"><span class="tag">' + (b.oz||'') + '</span><span class="tag">'
    + (b.fz||'') + '</span><span class="tag">' + (b.iucn||'待查') + '</span></div>';

  const rows = [
    ['中文名', b.z], ['學名', b.s], ['英文名', b.e], ['體長', b.len ? b.len+' cm' : ''],
    ['體重', b.mass ? b.mass+' g' : ''], ['IUCN', b.iucn],
    ['圖鑑評分', b.o != null ? Number(b.o).toFixed(1) : ''],
    ['棲地', b.h.join('、')], ['食性', b.d.join('、')],
    ['外形', b.look], ['食性文', b.diet], ['鳴聲', b.voice], ['冷知識', b.fact], ['出處', b.src],
  ];
  $('check').innerHTML = rows.map(([k,v]) => {
    const ok = !!(v && String(v).trim());
    return '<div class="chk"><span class="dot ' + (ok?'yes':'no') + '"></span><b>' + k + '</b>'
      + '<span class="v">' + (ok ? String(v).replace(/</g,'&lt;').slice(0,40) : '缺 → 卡面寫「資料待查」')
      + '</span></div>';
  }).join('');

  refreshPrompt();
}

function refreshPrompt(){
  const b = BIRDS[cur];
  if(!b) return;
  $('prompt').value = buildPrompt(cur, b, $('pose').value);
}

$('pose').addEventListener('change', refreshPrompt);
$('no').addEventListener('keydown', (e) => { if(e.key==='Enter') show(padn($('no').value)); });
$('no').addEventListener('change', () => show(padn($('no').value)));
$('prev').onclick = () => { const i = IDS.indexOf(cur); if(i>0) show(IDS[i-1]); };
$('next').onclick = () => { const i = IDS.indexOf(cur); if(i>=0 && i<IDS.length-1) show(IDS[i+1]); };
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText($('prompt').value); toast('已複製 prompt'); }
  catch { $('prompt').select(); document.execCommand('copy'); toast('已複製 prompt'); }
};
$('openGemini').onclick = () => { window.open('https://gemini.google.com/app','_blank','noopener'); toast('已開 Gemini：貼上 prompt 即可'); };

const MODELS = ['gemini-2.5-flash-image', 'gemini-3-pro-image-preview'];

async function callImage(prompt, key, model){
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model
    + ':generateContent' + (key ? '?key=' + encodeURIComponent(key) : '');
  const body = { contents: [{ role:'user', parts: [{ text: prompt }] }],
    generationConfig: { imageConfig: { aspectRatio: '3:4' } } };
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if(!res.ok){
    const msg = (json.error && json.error.message) || ('HTTP ' + res.status);
    const err = new Error(msg); err.status = res.status; throw err;
  }
  const cand = (json.candidates || [])[0];
  const parts = (cand && cand.content && cand.content.parts) || [];
  const part = parts.find((p) => p.inlineData || p.inline_data);
  if(!part) throw new Error('AI 冇返回圖片（' + ((cand && cand.finishReason) || 'unknown') + '）');
  const d = part.inlineData || part.inline_data;
  return 'data:' + (d.mimeType || d.mime_type || 'image/png') + ';base64,' + d.data;
}

$('gen').onclick = async () => {
  const key = $('key').value.trim();
  const prompt = $('prompt').value;
  const pv = $('preview');
  pv.innerHTML = '<span style="color:var(--soft);font-size:12.5px">出圖中…（可能要 30–90 秒）</span>';
  let lastErr = null;
  for(const model of MODELS){
    try{
      const dataUrl = await callImage(prompt, key, model);
      pv.innerHTML = '';
      const img = new Image(); img.src = dataUrl; pv.appendChild(img);
      const a = $('dl'); a.href = dataUrl; a.download = 'aviandex-' + cur + '.png';
      a.style.display = 'inline-block';
      toast('完成（' + model + '）');
      return;
    }catch(e){
      lastErr = e;
      if(e.status === 400 || e.status === 403) break;
    }
  }
  pv.innerHTML = '<span style="color:var(--miss);font-size:12.5px;padding:20px;text-align:center">'
    + '出圖失敗：' + (lastErr ? lastErr.message : '未知錯誤')
    + '<br><br>沒有 API Key 就用「複製 prompt」去 Gemini 網頁出圖。</span>';
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
console.log('已寫入 public/aviandex-gen.html（' + Object.keys(BIRDS).length + ' 隻）');
