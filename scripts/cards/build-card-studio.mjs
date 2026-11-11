#!/usr/bin/env node
/* ============================================================
 *  build-card-studio.mjs —— 「打編號 → 看資料齊唔齊 → 拿 prompt」
 * ------------------------------------------------------------
 *  用戶在 Gemini 那邊慢慢出圖，所以需要一個本地工作台：
 *    1. 打編號（例如 0013）→ 即刻見到這隻雀有咩資料、缺咩
 *    2. 一撳複製 prompt（由 build-card-prompt.mjs 的同一套規則砌）
 *    3. 一撳開出圖頁（把 prompt 帶去 Gemini）
 *
 *  為甚麼要有「資料齊唔齊」呢一欄：
 *    實測 AI 出整張卡時會自己編數字（體長 25-28 cm 之類）。
 *    所以出圖前必須先看清：我們手上有咩，冇的就一定寫「資料待查」，
 *    並且 prompt 內明文列出，唔准 AI 補。
 *
 *  用法：node scripts/cards/build-card-studio.mjs
 *  輸出：public/card-studio.html
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

/* 精簡卡片資料（只帶 prompt 需要的東西，唔好塞 2.8 MB 落 HTML） */
const BIRDS = {};
for (const id of Object.keys(idx.birds)) {
  const e = idx.birds[id];
  const c = copy[id] || {};
  const m = meas[id] || {};
  BIRDS[id] = {
    z: e.z, e: e.e, s: e.s, oz: e.oz, fz: e.fz,
    len: e.len || '',
    mass: m.mass || '',
    wing: m.wing || '',
    iucn: c.iucn || '',
    o: scores[id]?.o ?? null,
    h: (e.h || []).map((t) => idx.habitatTags.find((x) => x.id === t)?.zh).filter(Boolean),
    d: (e.d || []).map((t) => idx.dietTags.find((x) => x.id === t)?.zh).filter(Boolean),
    look: (zh[id] || {}).look || c.look || '',
    diet: c.diet || '',
    voice: c.voice || '',
    fact: c.funFact || '',
    src: sources[id] || '',
    hasEn: !!(en[id] && Object.keys(en[id]).length),
  };
}

const html = `<!doctype html>
<html lang="zh-Hant-HK">
<head>
<meta charset="utf-8">
<title>AvianDex 卡面工作台</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<style>
  :root{--bg:#10140e;--panel:#171c14;--ink:#eef2ea;--dim:#9aa892;--line:#2b3326;
        --deep:#11402A;--gold:#CE9820;--ok:#4f9d6a;--miss:#c26a5a}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
    font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif}
  header{padding:14px 16px;border-bottom:1px solid var(--line);display:flex;gap:10px;
    align-items:center;flex-wrap:wrap;position:sticky;top:0;background:var(--bg);z-index:5}
  header h1{font-size:15px;margin:0;letter-spacing:.02em}
  header p{margin:0;font-size:11.5px;color:var(--dim)}
  .wrap{padding:14px 16px 60px;max-width:1180px;margin:0 auto}
  .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
  input[type=text]{width:130px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);
    background:#0c1109;color:var(--ink);font:600 15px/1 ui-monospace,monospace;letter-spacing:.08em}
  button{padding:10px 14px;border-radius:10px;border:1px solid var(--line);background:#1d241a;
    color:var(--ink);font:700 12.5px/1 inherit;cursor:pointer}
  button:hover{background:#243020}
  button.primary{background:var(--deep);border-color:#2f6b4c}
  button.gold{background:#3a2f12;border-color:#6b5a22;color:#f0d79a}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media (max-width:820px){.grid{grid-template-columns:1fr}}
  .panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px}
  .panel h2{font-size:12px;letter-spacing:.14em;color:var(--dim);margin:0 0 10px;font-weight:800}
  .name{font-size:26px;font-weight:900;line-height:1.1}
  .sci{font-style:italic;color:var(--dim);font-size:13px;margin-top:4px}
  .pills{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
  .pill{font-size:11.5px;padding:4px 10px;border-radius:999px;background:#22301f;
    border:1px solid var(--line)}
  .check{display:flex;flex-direction:column;gap:6px;margin-top:12px}
  .chk{display:flex;align-items:center;gap:8px;font-size:12.5px}
  .dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto}
  .yes{background:var(--ok)} .no{background:var(--miss)}
  .val{margin-left:auto;color:var(--dim);font-size:11.5px;text-align:right;max-width:62%;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  textarea{width:100%;height:460px;background:#0a0e08;color:#dfe7d8;border:1px solid var(--line);
    border-radius:12px;padding:14px;font:12.5px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;
    resize:vertical}
  .hint{font-size:11.5px;color:var(--dim);margin:6px 0 10px;line-height:1.6}
  .toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:#1d3a29;
    border:1px solid #2f6b4c;color:#d7ead9;padding:10px 18px;border-radius:999px;font-size:12.5px;
    opacity:0;pointer-events:none;transition:.25s}
  .toast.on{opacity:1}
  .count{font-size:11.5px;color:var(--dim)}
</style>
</head>
<body>
<header>
  <h1>AvianDex 卡面工作台</h1>
  <p>打編號 → 看資料齊唔齊 → 複製 prompt → 貼去 Gemini 出圖</p>
</header>

<div class="wrap">
  <div class="row">
    <input id="no" type="text" value="0013" inputmode="numeric" autocomplete="off">
    <button class="primary" id="go">載入</button>
    <button id="prev">← 上一隻</button>
    <button id="next">下一隻 →</button>
    <button class="gold" id="copy">複製 prompt</button>
    <button id="openGemini">開 Gemini 出圖</button>
    <span class="count" id="count"></span>
  </div>

  <div class="grid">
    <section class="panel">
      <h2>這隻雀</h2>
      <div class="name" id="name">—</div>
      <div class="sci" id="sci"></div>
      <div class="pills" id="pills"></div>
      <h2 style="margin-top:16px">卡面會印的東西（有就打勾，缺的 prompt 會寫「資料待查」）</h2>
      <div class="check" id="check"></div>
    </section>

    <section class="panel">
      <h2>卡面 prompt（可直接複製）</h2>
      <p class="hint">prompt 內已明文列出所有要印的字，並禁止 AI 自行補數字。若果要改風格，改最底的「風格」一段就好。</p>
      <textarea id="prompt" spellcheck="false" readonly></textarea>
    </section>
  </div>
</div>
<div class="toast" id="toast">已複製</div>

<script>
const BIRDS = ${JSON.stringify(BIRDS)};
const IDS = Object.keys(BIRDS).sort();
const $ = (id) => document.getElementById(id);

function padn(s){ return String(s||'').replace(/\\D/g,'').padStart(4,'0'); }

function sent(s, n){
  s = String(s||'').replace(/\\s+/g,' ').trim();
  if(!s) return '';
  const i = s.search(/[。；]/);
  const out = (i>0 && i<=n) ? s.slice(0,i+1) : s.slice(0,n);
  return out + (out.length < s.length && !/[。；]$/.test(out) ? '…' : '');
}
function stars(v){
  const n = Math.max(0, Math.min(5, Math.round(Number(v)||0)));
  return '★'.repeat(n) + '☆'.repeat(5-n);
}

function buildPrompt(id, b){
  const L = [
    '卡面編號：NO.' + id,
    '中文名：' + b.z,
    '學名（斜體）：' + b.s,
    '英文名：' + b.e,
    '目／科：' + b.oz + ' · ' + b.fz,
    b.len ? '體長數值：' + b.len + ' cm' : '體長數值：（這格留空，寫「資料待查」）',
    b.mass ? '體重數值：' + b.mass + ' g' : '體重數值：（這格留空，寫「資料待查」）',
    b.wing ? '翼長數值：' + b.wing + ' mm' : '',
    b.iucn ? '保育級別：' + b.iucn : '',
    b.o != null ? '圖鑑評分：' + Number(b.o).toFixed(1) + ' / 5（' + stars(b.o) + '）' : '圖鑑評分：（留空）',
    '棲地標籤：' + (b.h.join('、') || '（留空）'),
    '食性標籤：' + (b.d.join('、') || '（留空）'),
    '外形一句（原文照登）：' + (sent(b.look,42) || '（留空）'),
    '食性一句：' + (sent(b.diet,42) || '（留空）'),
    '鳴聲一句：' + (sent(b.voice,42) || '（留空）'),
    '冷知識一句：' + (sent(b.fact,46) || '（留空）'),
    '出處細字：' + (b.src || ''),
  ].filter(Boolean);

  return \`畫一張 AvianDex 鳥類圖鑑卡，3:4 直向，印刷品質的收藏卡。

【版面規格（固定，所有卡一致）】
1. 厚深綠外框（圓角、內側有金屬倒邊），卡紙米白，有極細紙紋。
2. 頂部深綠橫帶：左邊大字中文名，下面斜體學名；右邊一個白色膠囊放英文名；右端一個圓徽章放 IUCN 級別。
3. 中央一個大圓角相框（佔卡面一半以上），放單一隻鳥的寫實相片，鳥要完整、頭部清楚、自然姿態。
4. 相框左邊：一排 2–3 個深綠小方塊圖示（棲地、食性）。
5. 相框下面：三條遊戲式數值條（金黃色填在米白軌道上），每條左邊一個深綠圓角標籤寫欄目名，右邊寫數字。
6. 再下面：四塊小白牌，每塊一個細深綠標籤 + 一句原文。
7. 底部深綠細條：左 NO. 編號、中間中文名（學名）、右邊版本號。

【卡上的字：只准用以下內容，逐字照抄，不准改寫、不准翻譯、不准自行補充任何數字或事實】
\${L.map((x) => '· ' + x).join('\\n')}

【絕對禁止】
· 不准自己發明體長／體重／評分／星數（上面沒有的就不准寫）
· 不准加任何未列出的欄目、標語、廣告字、二維碼
· 不准出現簡體字
· 不准把中文名或學名寫錯

【風格】
印刷收藏卡、乾淨、留白足夠、圓角、實色（不要漸層光暈、不要立體陰影、不要霓虹）。
深綠主色 #11402A，米白 #F7F3E9，金黃 #CE9820。

【構圖提示】
鳥：\${b.e}（\${b.s}），\${sent(b.look,30)}\`;
}

let cur = '0013';

function show(id){
  const b = BIRDS[id];
  if(!b){ $('name').textContent = '找不到 NO.' + id; return; }
  cur = id;
  $('no').value = id;
  $('name').textContent = b.z;
  $('sci').textContent = b.s + ' · ' + b.e;
  $('pills').innerHTML = [b.oz, b.fz, b.iucn].filter(Boolean)
    .map((t) => '<span class="pill">' + t + '</span>').join('');

  const rows = [
    ['中文名', b.z],
    ['學名', b.s],
    ['英文名', b.e],
    ['體長', b.len ? b.len + ' cm' : ''],
    ['體重', b.mass ? b.mass + ' g' : ''],
    ['翼長', b.wing ? b.wing + ' mm' : ''],
    ['IUCN', b.iucn],
    ['圖鑑評分', b.o != null ? Number(b.o).toFixed(1) : ''],
    ['棲地標籤', b.h.join('、')],
    ['食性標籤', b.d.join('、')],
    ['外形一句', b.look],
    ['食性一句', b.diet],
    ['鳴聲一句', b.voice],
    ['冷知識一句', b.fact],
    ['出處', b.src],
    ['英文內容', b.hasEn ? '有' : ''],
  ];
  $('check').innerHTML = rows.map(([k,v]) => {
    const ok = !!(v && String(v).trim());
    return '<div class="chk"><span class="dot ' + (ok?'yes':'no') + '"></span>'
      + '<span>' + k + '</span><span class="val">' + (ok ? String(v).slice(0,42) : '缺（卡面寫「資料待查」）') + '</span></div>';
  }).join('');

  $('prompt').value = buildPrompt(id, b);
  const i = IDS.indexOf(id);
  $('count').textContent = (i>=0 ? (i+1) + ' / ' + IDS.length : '');
}

$('go').onclick = () => show(padn($('no').value));
$('no').addEventListener('keydown', (e) => { if(e.key==='Enter') show(padn($('no').value)); });
$('prev').onclick = () => { const i = IDS.indexOf(cur); if(i>0) show(IDS[i-1]); };
$('next').onclick = () => { const i = IDS.indexOf(cur); if(i>=0 && i<IDS.length-1) show(IDS[i+1]); };
$('copy').onclick = async () => {
  const t = $('prompt').value;
  try { await navigator.clipboard.writeText(t); toast('已複製 prompt'); }
  catch { $('prompt').select(); document.execCommand('copy'); toast('已複製 prompt'); }
};
$('openGemini').onclick = () => {
  window.open('https://gemini.google.com/app', '_blank', 'noopener');
  toast('已開 Gemini，貼上 prompt 即可');
};
let tt;
function toast(m){ const el=$('toast'); el.textContent=m; el.classList.add('on');
  clearTimeout(tt); tt=setTimeout(()=>el.classList.remove('on'), 1800); }

show('0013');
</script>
</body>
</html>
`;

writeFileSync(path.join(root, 'public/card-studio.html'), html, 'utf8');
console.log('已寫入 public/card-studio.html（' + Object.keys(BIRDS).length + ' 隻）');
