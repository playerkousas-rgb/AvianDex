#!/usr/bin/env node
/* ============================================================
 *  build-aviandex-page.mjs —— AvianDex 資訊卡出圖頁（自用單頁）
 * ------------------------------------------------------------
 *  照用戶三個 HTML 的殼抄足：
 *    卡牌生成器V17.html / 漫畫.html / ai_scout_app (1).html
 *
 *  抄足的五件事：
 *    1. `const API_KEY = ""` 佔位 → Gemini Canvas 開啟時自動注入，
 *       再加 resolveKey() 六路後備（window.*、localStorage、AIza 掃描、meta）
 *    2. callImageAPI：3 次退避（2s→4s）、180s AbortController、
 *       400/403/429/5xx 分類報錯、IMAGE_SAFETY 診斷
 *    3. 相片：上載 / 拖入 / Ctrl+V 貼上 / 前後鏡 → base64 → inlineData
 *    4. 成品：對比（原相 vs 卡）、放大 lightbox、下載、重做一次
 *    5. 資料：按編號定向鎖定（DIRECTIONAL LOCK），不准亂找
 *
 *  用法：node scripts/cards/build-aviandex-page.mjs
 *  輸出：public/aviandex-gen.html（另存 -v2 / -v3 新檔名，避免拿到舊版）
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

const KEEP = ['iucn', 'diet', 'range', 'look', 'habitat', 'funFact', 'breeding',
  'voice', 'behavior', 'migration', 'conservation', 'humanRelation', 'etymology', 'length', 'weight'];

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
    len: e.len || '', mass: m.mass || '', wing: m.wing || '',
    o: sc.o ?? null,
    h: (e.h || []).map((t) => (idx.habitatTags || []).find((x) => x.id === t)?.zh).filter(Boolean),
    d: (e.d || []).map((t) => (idx.dietTags || []).find((x) => x.id === t)?.zh).filter(Boolean),
    zhLook: (zh[id] || {}).look || '',
    copy: slim,
    src: sources[id] || '',
  };
}

const html = `<!doctype html>
<html lang="zh-Hant-HK">
<head>
<meta charset="utf-8">
<title>AvianDex 資訊卡 · 出圖 v3</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<style>
  :root{--bg:#0B0F0C;--card:#141A15;--card2:#1A2119;--line:#26302A;--line2:#33402F;
        --ink:#EFF3EC;--soft:#94A398;--faint:#5A6459;--lime:#E8FF47;--deep:#11402A;
        --gold:#CE9820;--miss:#C26A5A;--ok:#4F9D6A;--cream:#F7F3E9;
        --mono:ui-monospace,SFMono-Regular,Menlo,monospace}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
    font:13.5px/1.65 "Noto Sans TC","PingFang HK","Microsoft JhengHei",system-ui,sans-serif}
  a{color:inherit}
  header{position:sticky;top:0;z-index:30;display:flex;gap:12px;align-items:center;flex-wrap:wrap;
    padding:11px 16px;background:rgba(11,15,12,.94);backdrop-filter:blur(14px);
    border-bottom:1px solid var(--line)}
  header h1{margin:0;font-size:14px;letter-spacing:.02em}
  header .sub{font-size:11.5px;color:var(--soft)}
  .badge{font-size:10.5px;padding:2px 9px;border-radius:999px;background:#1E2A20;
    border:1px solid var(--line);color:var(--soft)}
  .badge.on{background:#1B3A26;border-color:#2F6B4C;color:#BFE4CB}
  .badge.warn{background:#2A1D16;border-color:#5A3A2A;color:#E8C7B4}
  .gear{margin-left:auto;display:flex;gap:7px;align-items:center}
  .gear input{width:150px;padding:6px 9px;border-radius:8px;border:1px solid var(--line);
    background:#090C0A;color:var(--ink);font-size:11.5px}
  .wrap{max-width:1300px;margin:0 auto;padding:15px 16px 90px;
    display:grid;grid-template-columns:392px 1fr;gap:14px;align-items:start}
  @media (max-width:960px){.wrap{grid-template-columns:1fr}}
  .panel{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px}
  .panel + .panel{margin-top:11px}
  .step{display:flex;gap:8px;align-items:baseline;margin:0 0 10px}
  .step .n{display:inline-flex;width:19px;height:19px;border-radius:50%;background:var(--lime);
    color:#0B0F0C;font:900 11px/19px system-ui;justify-content:center;flex:0 0 auto}
  .step b{font-size:13px}
  .step .dim{font-size:11px;color:var(--faint);margin-left:auto}
  input[type=text],input[type=password],select,textarea{width:100%;padding:9px 11px;border-radius:9px;
    border:1px solid var(--line);background:#090C0A;color:var(--ink);font:13px/1.6 inherit}
  input.mono{font-family:var(--mono);letter-spacing:.14em;font-size:16px;text-align:center}
  textarea{font-family:var(--mono);font-size:11px;line-height:1.72;min-height:280px;resize:vertical}
  .row{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
  button{padding:9px 13px;border-radius:9px;border:1px solid var(--line);background:#1C241C;
    color:var(--ink);font:700 12.5px/1 inherit;cursor:pointer;font-family:inherit}
  button:hover{background:#243020}
  button:disabled{opacity:.45;cursor:default}
  button.main{background:var(--lime);color:#0B0F0C;border-color:var(--lime);padding:13px 20px;font-size:14px}
  button.main:hover{background:#F2FF7A}
  button.mini{padding:6px 10px;font-size:11.5px}
  button.ghost{background:transparent}
  label{display:block;font-size:11.5px;color:var(--soft);margin:9px 0 4px}
  .chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
  .chip{font-size:11.5px;padding:5px 10px;border-radius:999px;border:1px solid var(--line2);
    background:transparent;color:var(--soft);cursor:pointer;font-family:inherit}
  .chip:hover{border-color:var(--lime);color:var(--lime)}
  .chip.on{background:var(--deep);border-color:#2F6B4C;color:#D7EAD9}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .drop{border:1.5px dashed var(--line2);border-radius:11px;padding:20px 12px;text-align:center;
    cursor:pointer;color:var(--soft);font-size:12px;transition:.15s}
  .drop:hover,.drop.over{border-color:var(--lime);color:var(--lime);background:#101710}
  .drop .big{font-size:26px;line-height:1.2;margin-bottom:4px}
  .previewBox{position:relative;display:none;margin-top:9px}
  .previewBox img{width:100%;border-radius:10px;border:1px solid var(--line);display:block}
  .camrow{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}
  .cam{background:#18201A}
  .src{border-left:2px solid var(--line2);padding-left:9px;margin:5px 0 9px;font-size:12px}
  .src b{color:var(--gold);font-weight:800}
  .src .f{color:var(--faint);font-size:10.5px;font-family:var(--mono)}
  .src .v{display:block;color:var(--soft);font-size:11.5px;margin-top:2px;
    max-height:34px;overflow:hidden}
  .check{font-size:12px}
  .check .r{display:flex;gap:7px;padding:3px 0;border-bottom:1px dashed #1F2822;align-items:center}
  .check .r:last-child{border-bottom:0}
  .dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto}
  .yes{background:var(--ok)}.no{background:var(--miss)}
  .check .k{font-weight:700;min-width:66px}
  .check .v2{margin-left:auto;color:var(--soft);text-align:right;max-width:58%;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .work{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px}
  .stage{background:#080B09;border:1px solid var(--line);border-radius:11px;min-height:430px;
    display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .stage img{max-width:100%;max-height:74vh;display:block;cursor:zoom-in}
  .stage .ph{color:var(--faint);font-size:12.5px;text-align:center;padding:20px;line-height:1.9}
  .cmp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:9px}
  .cmp figure{margin:0;position:relative}
  .cmp img{width:100%;border-radius:10px;border:1px solid var(--line);display:block}
  .cmp figcaption{position:absolute;left:7px;bottom:7px;font-size:10.5px;background:rgba(0,0,0,.72);
    padding:2px 8px;border-radius:999px;color:#DDE7DE}
  .spinner{width:20px;height:20px;border:2.5px solid #2C3A2E;border-top-color:var(--lime);
    border-radius:50%;animation:sp .8s linear infinite;margin:0 auto 11px}
  @keyframes sp{to{transform:rotate(360deg)}}
  .lightbox{position:fixed;inset:0;background:rgba(4,6,5,.95);display:none;align-items:center;
    justify-content:center;z-index:80;padding:20px;cursor:zoom-out}
  .lightbox.on{display:flex}
  .lightbox img{max-width:96vw;max-height:94vh;border-radius:8px}
  .toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#1D3A29;
    border:1px solid #2F6B4C;color:#D7EAD9;padding:9px 17px;border-radius:999px;font-size:12px;
    opacity:0;pointer-events:none;transition:.25s;z-index:90;max-width:84vw;text-align:center}
  .toast.on{opacity:1}
  .warn{background:#2A1D16;border:1px solid #5A3A2A;color:#E8C7B4;padding:8px 10px;
    border-radius:9px;font-size:11.5px;margin-top:8px;line-height:1.6}
  .good{background:#16281C;border-color:#2C5238;color:#BFE4CB}
  .hint{font-size:11.5px;color:var(--faint);line-height:1.65;margin:7px 0 0}
  .tag{display:inline-block;font-size:10.5px;padding:2px 8px;border-radius:999px;
    background:#1E2A20;border:1px solid var(--line);margin:0 5px 4px 0}
  .gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:7px;margin-top:10px}
  .gal img{width:100%;border-radius:7px;border:1px solid var(--line);cursor:zoom-in;display:block}
  .kv{display:flex;justify-content:space-between;font-size:11.5px;padding:3px 0;
    border-bottom:1px dashed #1F2822;color:var(--soft)}
  .kv:last-child{border-bottom:0}
  .kv b{color:var(--lime);font-size:13px}
  code{font-family:var(--mono);font-size:11px;color:#A9C3A9}
</style>
</head>
<body>

<header>
  <span style="font-size:19px">🪶</span>
  <div>
    <h1 style="margin:0">AvianDex 資訊卡 · 出圖 <span style="color:var(--lime)">v3</span></h1>
    <div class="sub">打編號 → 資料定向鎖定 → 出圖｜<span id="verStamp">—</span></div>
  </div>
  <span id="keyBadge" class="badge">🔑 檢查金鑰中…</span>
  <div class="gear">
    <span class="badge" title="喺 Gemini Canvas 開啟會自動注入；留空就得">⚙️ Key（選用）</span>
    <input id="apiKey" type="password" placeholder="留空 = Canvas 自動注入" autocomplete="off">
    <button class="mini ghost" id="keyTest" type="button">測試</button>
  </div>
</header>

<div class="wrap">
  <!-- ══════════ 左欄 ══════════ -->
  <div>
    <section class="panel">
      <div class="step"><span class="n">1</span><b>編號</b><span class="dim">0001–0569</span></div>
      <div class="row">
        <input id="no" class="mono" type="text" value="0013" inputmode="numeric" style="flex:1;min-width:96px">
        <button class="mini" id="prev" type="button">←</button>
        <button class="mini" id="next" type="button">→</button>
      </div>
      <div id="who" style="margin-top:10px"></div>
      <div id="risk"></div>
    </section>

    <section class="panel">
      <div class="step"><span class="n">2</span><b>參考圖</b><span class="dim">base64 一併送出</span></div>
      <div class="drop" id="drop">
        <div class="big">🖼️</div>
        <b>按此上載參考圖</b>
        <div style="font-size:11px;margin-top:3px">插畫／相片 · 亦可拖入或 Ctrl+V 貼上</div>
        <input type="file" id="photoInput" accept="image/*" hidden>
      </div>
      <div class="camrow">
        <button class="cam" id="camPhoto" type="button">🤳 前鏡</button>
        <button class="cam" id="camPhoto2" type="button">📷 後鏡</button>
      </div>
      <input type="file" id="camIn" accept="image/*" capture="user" hidden>
      <input type="file" id="camIn2" accept="image/*" capture="environment" hidden>
      <div class="previewBox" id="previewBox">
        <img id="previewImg" alt="參考圖">
        <div class="row" style="margin-top:7px">
          <button class="mini ghost" id="resetPhoto" type="button">🔄 換另一張</button>
          <span class="hint" id="photoMeta" style="margin:0"></span>
        </div>
      </div>
      <p class="hint">冇參考圖都可以出（AI 會照資料畫），但一定要有相／插畫先會似返原本嗰隻。</p>
    </section>

    <section class="panel">
      <div class="step"><span class="n">3</span><b>資料來源</b><span class="dim">定向鎖定</span></div>
      <div id="srcList"></div>
      <p class="hint">上面每一項都寫明出自邊個檔／pageid，並會原文寫入 prompt 的
        <code>DATA SOURCE</code> 段：只准用呢堆，不准上網找、不准自己作。</p>
    </section>

    <section class="panel">
      <div class="step"><span class="n">4</span><b>卡面設定</b></div>
      <label>卡款</label>
      <div class="chips" id="sysChips">
        <button class="chip on" data-sys="aviandex" type="button">🪶 鳥類圖鑑卡</button>
      </div>
      <label>姿態方向</label>
      <textarea id="pose" rows="2" style="min-height:60px;font-family:inherit;font-size:12.5px">側身站立，頭微微轉向鏡頭，全身完整入鏡</textarea>
      <div class="chips" id="poseChips"></div>
      <div class="grid2" style="margin-top:9px">
        <div><label>景別</label>
          <select id="frame"><option>全身</option><option>半身（頭至胸）</option><option>頭部特寫</option></select>
        </div>
        <div><label>背景</label>
          <select id="bg"><option>純淨米白</option><option>原生棲地虛化</option><option>深綠單色</option></select>
        </div>
      </div>
      <label>完成度 / 表面</label>
      <div class="chips" id="finishChips"></div>
    </section>

    <section class="panel">
      <div class="step"><span class="n">5</span><b>出圖</b><span class="dim">通常 10–40 秒</span></div>
      <div class="grid2">
        <div><label>比例</label>
          <select id="aspect">
            <option value="2:3" selected>2:3 直向（標準卡）</option>
            <option value="3:4">3:4 直向</option>
            <option value="4:5">4:5</option>
            <option value="1:1">1:1 正方</option>
          </select>
        </div>
        <div><label>模型</label>
          <select id="model">
            <option value="gemini-2.5-flash-image">2.5 flash image</option>
            <option value="gemini-3-pro-image-preview">3 pro image</option>
          </select>
        </div>
      </div>
      <div class="row" style="margin-top:12px">
        <button class="main" id="generateBtn" type="button">🎴 生成卡牌</button>
        <button class="ghost" id="copyBtn" type="button">複製 prompt</button>
      </div>
      <p class="hint">冇 key 就按「複製 prompt」去 gemini.google.com 貼上（參考圖要另外上載）。</p>
    </section>
  </div>

  <!-- ══════════ 右欄 ══════════ -->
  <div>
    <div class="work">
      <div class="step"><span class="n">6</span><b>成品</b><span class="dim" id="workTitle"></span></div>
      <div class="cmp" id="cmp" style="display:none">
        <figure><img id="imgBefore" alt="參考圖"><figcaption>參考圖</figcaption></figure>
        <figure><img id="imgAfter" alt="成品"><figcaption>成品卡</figcaption></figure>
      </div>
      <div class="stage" id="stage">
        <div class="ph">未有圖<br><span style="font-size:11.5px">左邊打編號、上載參考圖，按「🎴 生成卡牌」</span></div>
      </div>
      <div class="row" style="margin-top:10px">
        <button id="zoomBtn" type="button" disabled>🔍 放大</button>
        <button id="downloadBtn" type="button" disabled>⬇️ 下載 PNG</button>
        <button class="ghost" id="retryBtn" type="button" disabled>🔄 重做一次</button>
        <button class="ghost" id="againBtn" type="button" disabled>🎯 下一隻</button>
      </div>
      <div id="errBox"></div>
      <div class="gal" id="gallery"></div>
    </div>

    <div class="work" style="margin-top:12px">
      <div class="step"><span class="n">7</span><b>Prompt</b><span class="dim">可即時改，改完即刻生效</span></div>
      <textarea id="prompt"></textarea>
      <div class="row" style="margin-top:8px">
        <button class="mini" id="copyBtn2" type="button">複製 prompt</button>
        <button class="mini ghost" id="rebuild" type="button">↺ 由資料重新砌</button>
        <a class="mini ghost" id="openGemini" href="https://gemini.google.com/app" target="_blank" rel="noopener" style="display:inline-block;padding:6px 10px;border-radius:9px;border:1px solid var(--line);background:transparent;color:var(--ink);font:700 11.5px/1 inherit;text-decoration:none">開 Gemini</a>
        <span class="hint" id="promptLen" style="margin:0"></span>
      </div>
    </div>

    <div class="work" style="margin-top:12px">
      <div class="step"><span class="n">8</span><b>本頁設定</b></div>
      <div class="kv"><span>版本</span><b id="vStat">—</b></div>
      <div class="kv"><span>金鑰狀態</span><b id="kStat">—</b></div>
      <div id="keyBox" class="warn" style="display:block;margin-top:9px;background:#141C16;border-color:#33402F;color:var(--soft)">
        <b>API Key（選用）</b><br>
        喺 Gemini Canvas 開：唔使填，Canvas 會代你認證。<br>
        用 Vercel／瀏覽器直接開：先貼一次（只存喺你部機）。
        <div class="row" style="margin-top:7px">
          <input id="keyInline" type="password" placeholder="貼上 AIza… key"
                 style="flex:1;min-width:150px;padding:6px 9px;border-radius:8px;
                        border:1px solid var(--line);background:#090C0A;color:var(--ink);font-size:12px">
          <button class="mini" id="keySave" type="button">儲存</button>
        </div>
        <p class="hint" style="margin-top:6px">
          Key 喺 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"
          style="color:var(--lime)">aistudio.google.com/apikey</a> 免費攞。
        </p>
      </div>
      <div class="kv"><span>卡款</span><b id="sStat">aviandex</b></div>
      <div class="kv"><span>參考圖</span><b id="rStat">無</b></div>
      <div class="kv"><span>編號</span><b id="nStat">0013</b></div>
    </div>
  </div>
</div>

<div class="lightbox" id="lightbox"><img id="lightboxImg" alt="放大"></div>
<div class="toast" id="toast"></div>

<script>
/* ═══════════════════════════════════════════════════════════
   金鑰：Canvas 會自動注入 API_KEY
   —— 以下同 卡牌生成器V17 / 漫畫 / ai_scout_app 一模一樣的六路後備
   ═══════════════════════════════════════════════════════════ */
const API_KEY = ""; // Gemini Canvas 執行時會自動注入，請保持空字串

var API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
var LS_KEY = "aviandex_api_key";

function lsGet(k){ try{ return localStorage.getItem(k) || ""; }catch(e){ return ""; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

function cleanKey(v){
  return (typeof v === "string" && v.trim().length >= 20 && !/YOUR_?API|PASTE|PLACEHOLDER|EXAMPLE|^\\s*$/i.test(v))
    ? v.trim() : "";
}
function resolveKey(){
  var cands = [API_KEY, window.GEMINI_API_KEY, window.__GEMINI_API_KEY__, window.__API_KEY__,
               window.apiKey, lsGet(LS_KEY), lsGet("tcg_api_key"), lsGet("sk_key")];
  for (var i = 0; i < cands.length; i++){ var k = cleanKey(cands[i]); if (k) return k; }
  /* 有些平台注入成普通 window 變數，唔一定叫 API_KEY */
  try {
    var ks = Object.keys(window);
    for (var j = 0; j < ks.length; j++){
      var v; try { v = window[ks[j]]; } catch(e){ continue; }
      if (typeof v === "string" && /^AIza[0-9A-Za-z_\\-]{30,}$/.test(v.trim())) return v.trim();
    }
  } catch(e){}
  /* 亦有平台注入成 meta[content] */
  try {
    var ms = document.querySelectorAll("meta[content]");
    for (var n = 0; n < ms.length; n++){
      var c = (ms[n].content || "").trim();
      if (/^AIza[0-9A-Za-z_\\-]{30,}$/.test(c)) return c;
    }
  } catch(e){}
  return "";
}
function keySource(){
  if (cleanKey(API_KEY)) return "Canvas 自動注入";
  if (cleanKey(window.GEMINI_API_KEY) || cleanKey(window.__GEMINI_API_KEY__)
      || cleanKey(window.__API_KEY__) || cleanKey(window.apiKey)) return "平台注入 window";
  if (lsGet(LS_KEY) || lsGet("tcg_api_key") || lsGet("sk_key")) return "本機已儲存";
  try {
    var ks = Object.keys(window);
    for (var j = 0; j < ks.length; j++){
      var v; try { v = window[ks[j]]; } catch(e){ continue; }
      if (typeof v === "string" && /^AIza[0-9A-Za-z_\\-]{30,}$/.test(v.trim())) return "window 掃描";
    }
  } catch(e){}
  return "";
}

/* ═══════════════════════════════════════════════════════════
   資料
   ═══════════════════════════════════════════════════════════ */
var BIRDS = ${JSON.stringify(BIRDS)};
var IDS = Object.keys(BIRDS).sort();

var $ = function(id){ return document.getElementById(id); };
var val = function(id){ return ($(id) && $(id).value || "").trim(); };
var delay = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
var esc = function(s){ return String(s == null ? "" : s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); };

var cur = "0013", busy = false;
var photo = null;            // { b64, mime, url }
var result = null;           // { url, prompt, id }
var gallery = [];
var pose = "側身站立，頭微微轉向鏡頭，全身完整入鏡";
var finish = "Matte letterpress paper, no foil, no gradient glow";
var sysPick = "aviandex";

function toast(m, ms){
  var el = $("toast"); el.textContent = m; el.classList.add("on");
  clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove("on"); }, ms || 2100);
}

function padn(s){ var d = String(s || "").replace(/\\D/g, ""); return d ? d.padStart(4, "0") : ""; }

/* ═══════════════════════════════════════════════════════════
   卡面准印文字（只由資料產生，缺就寫「資料待查」）
   ═══════════════════════════════════════════════════════════ */
function sent(s, n){
  s = String(s || "").replace(/\\s+/g, " ").trim();
  if (!s) return "";
  var i = s.search(/[。；]/);
  var out = (i > 0 && i <= n) ? s.slice(0, i + 1) : s.slice(0, n);
  return out + (out.length < s.length && !/[。；]$/.test(out) ? "…" : "");
}
function stars(v){
  var n = Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
  var s = ""; for (var i = 0; i < 5; i++) s += (i < n ? "★" : "☆"); return s;
}
function printedLines(id, b){
  var c = b.copy || {};
  return [
    ["編號", "NO." + id],
    ["中文名", b.z],
    ["學名", b.s],
    ["英文名", b.e],
    ["目 · 科", (b.oz || "") + " · " + (b.fz || "")],
    ["體長", b.len ? b.len + " cm" : "資料待查"],
    ["體重", b.mass ? b.mass + " g" : "資料待查"],
    ["翼長", b.wing ? b.wing + " mm" : "資料待查"],
    ["保育級別", c.iucn || "資料待查"],
    ["圖鑑評分", b.o != null ? (Number(b.o).toFixed(1) + "/5 " + stars(b.o)) : "資料待查"],
    ["棲地", b.h.join("、") || "資料待查"],
    ["食性", b.d.join("、") || "資料待查"],
    ["外形", sent(b.zhLook || c.look, 46) || "資料待查"],
    ["食性說明", sent(c.diet, 46) || "資料待查"],
    ["鳴聲", sent(c.voice, 46) || "資料待查"],
    ["冷知識", sent(c.funFact, 48) || "資料待查"],
    ["分佈", sent(c.range, 46) || "資料待查"],
    ["出處", b.src || "資料待查"]
  ];
}
function sourceRows(id, b){
  var c = b.copy || {}, out = [];
  function push(k, file, field, v){
    if (!v) return;
    out.push({ k: k, file: file, field: field, v: String(v).replace(/\\s+/g," ").slice(0, 150) });
  }
  push("中文名／英文名／學名／目科", "explorerIndex.json", "birds[\\"" + id + "\\"]",
       [b.z, b.e, b.s, b.oz, b.fz].filter(Boolean).join(" · "));
  push("體長", "explorerIndex.json", ".len", b.len ? b.len + " cm" : "");
  push("量度（AVONET）", "measurements.json", "[" + id + "]",
       [b.wing && ("翼長 " + b.wing + " mm"), b.mass && ("體重 " + b.mass + " g")].filter(Boolean).join(" · "));
  push("圖鑑評分（自訂指標）", "dexScores.json", "scores[" + id + "]",
       b.o != null ? ("綜合 " + Number(b.o).toFixed(2) + " / 5") : "");
  push("棲地標籤", "explorerIndex.json", "habitatTags", b.h.join("、"));
  push("食性標籤", "explorerIndex.json", "dietTags", b.d.join("、"));
  var F = [["外形","look"],["食性說明","diet"],["鳴聲","voice"],["冷知識","funFact"],
           ["分佈","range"],["繁殖","breeding"],["行為","behavior"],["遷徙","migration"],
           ["保育","conservation"],["人與鳥","humanRelation"],["名稱由來","etymology"]];
  for (var i = 0; i < F.length; i++){
    var f = F[i][1];
    push(F[i][0], "cardCopy.json", "[" + id + "]." + f,
         f === "look" ? (b.zhLook || c.look) : c[f]);
  }
  push("出處（pageid）", "cardSources.json", "sources[" + id + "]", b.src);
  return out;
}

/* ═══════════════════════════════════════════════════════════
   Prompt —— PRINTED TEXT 與 COMPOSITION 分開
   資料定向：DATA SOURCE 段明文鎖死
   ═══════════════════════════════════════════════════════════ */
function buildPrompt(id, b){
  var lines = printedLines(id, b);
  var printed = lines.map(function(p){ return "  - " + p[0] + "：" + p[1]; }).join("\\n");

  var srcBlock = sourceRows(id, b).map(function(s){
    return "  · " + s.k + "  ←  " + s.file + " · " + s.field + "\\n        " + s.v;
  }).join("\\n");

  var aspect = val("aspect") || "2:3";
  var frame = val("frame") || "全身";
  var bgSel = val("bg") || "純淨米白";

  var L = [];
  L.push("Create ONE finished AvianDex bird encyclopedia card (front side only), perfectly flat and facing the camera, like a clean product photo of a real printed card. No table, no hands, no tilt, no mockup, no watermark.");
  L.push(photo
    ? "The attached reference image shows the EXACT bird artwork to use. Recompose/repaint it into the card layout below; keep the species, plumage colours, head shape, beak and eye identical. NEVER substitute a different species."
    : "The card shows ONE single bird of the exact species described in the PRINTED TEXT block below.");
  L.push("DATA SOURCE — DIRECTIONAL LOCK (hard rule)\\n"
    + "  Every fact on this card must come from this SOURCE BLOCK, which was read from this project's own data files by bird number " + id + "：\\n"
    + srcBlock + "\\n"
    + "  You are FORBIDDEN to browse, search, recall or invent any other source. If a value is not in the SOURCE BLOCK, the card must print 資料待查 for that field. Do not guess, do not round, do not convert units, do not add any number that is not written here.");
  L.push("PRINTED TEXT — the ONLY words, letters and numbers allowed on the card:\\n" + printed);
  L.push("COMPOSITION DIRECTION — paint these into the artwork; NEVER print them as words on the card:\\n"
    + "  - Canvas: portrait " + aspect + ", a premium printed naturalist field-guide card.\\n"
    + "  - (1) Dark green header band across the top: large Traditional Chinese name on the left, italic scientific name beneath it, a white pill with the English name on the right, a round IUCN badge at the far right.\\n"
    + "  - (2) One large rounded portrait window occupying more than half the card height, holding ONE photorealistic bird, " + frame + ", " + pose + ", complete body, clear head.\\n"
    + "  - (3) A small vertical stack of 2–3 dark green habitat chips with white pictograms at the left edge of the portrait window.\\n"
    + "  - (4) Below the portrait: three game-style stat bars — gold fill on a cream track, dark green rounded label on the left, value on the right.\\n"
    + "  - (5) Below that: one row of four small white plaques, each with a slim dark green label and one sentence taken verbatim from PRINTED TEXT.\\n"
    + "  - (6) A slim dark green footer strip: NO. number, Chinese name (scientific name), version tag.\\n"
    + "  - Background inside the portrait window: " + bgSel + ".\\n"
    + "  - Palette: deep green #11402A, cream #F7F3E9, gold #CE9820. Thick dark forest-green rounded frame with a subtle inner bevel, warm cream paper with fine fibre texture.");
  L.push("RENDERING RULES\\n"
    + "1. Full-bleed illustration inside a proper frame and borders. " + finish + ".\\n"
    + "2. TEXT: render ONLY the PRINTED TEXT lines, exactly as written, in clean legible Traditional Chinese typography. Every line must appear COMPLETE and UNABRIDGED, keeping each label together with its value (e.g. \\"體重：116.3 g\\" must keep the \\"體重：\\" part). Omitting or shortening any line, label or character is a rendering failure.\\n"
    + "3. If a field says 資料待查, print 資料待查 — never replace it with a number.\\n"
    + "4. NEVER include: invented statistics, extra slogans, QR codes, barcodes, price tags, advertisement text, simplified Chinese characters, a second bird, a different species.\\n"
    + "5. No holographic foil, no gradient glow, no neon, no drop shadow.\\n"
    + "6. FINAL CHECK: before finishing, verify that every PRINTED TEXT line is present with the correct characters and that every number matches the SOURCE BLOCK; silently fix any defect.");
  return L.join("\\n\\n");
}

/* ═══════════════════════════════════════════════════════════
   畫面
   ═══════════════════════════════════════════════════════════ */
function show(id){
  var b = BIRDS[id];
  if (!b){ toast("找不到 NO." + id); return; }
  cur = id; $("no").value = id; $("nStat").textContent = id;

  $("who").innerHTML =
    '<div style="font-size:21px;font-weight:900;line-height:1.2">' + esc(b.z) + '</div>' +
    '<div style="font-style:italic;color:var(--soft);font-size:12px">' + esc(b.s) + ' · ' + esc(b.e) + '</div>' +
    '<div style="margin-top:7px">' +
      [b.oz, b.fz, (b.copy || {}).iucn].filter(Boolean)
        .map(function(t){ return '<span class="tag">' + esc(t) + '</span>'; }).join("") +
    '</div>';

  var miss = printedLines(id, b).filter(function(p){ return p[1] === "資料待查"; })
    .map(function(p){ return p[0]; });
  $("risk").innerHTML = miss.length
    ? '<div class="warn">' + miss.length + ' 項會印「資料待查」：' + esc(miss.join("、")) +
      '<br>（刻意不由 AI 補）</div>'
    : '<div class="warn good">18 項資料齊全</div>';

  var rows = sourceRows(id, b);
  $("srcList").innerHTML = rows.length
    ? rows.map(function(s){
        return '<div class="src"><b>' + esc(s.k) + '</b> <span class="f">← ' + esc(s.file) +
          ' · ' + esc(s.field) + '</span><span class="v">' + esc(s.v) + '</span></div>';
      }).join("")
    : '<div class="hint">呢個編號在 repo 內冇資料。</div>';

  rebuildPrompt();
}

function rebuildPrompt(){
  var b = BIRDS[cur]; if (!b) return;
  $("prompt").value = buildPrompt(cur, b);
  $("promptLen").textContent = $("prompt").value.length + " 字";
  $("workTitle").textContent = "NO." + cur + " · " + b.z;
}

/* 編號 */
$("no").addEventListener("keydown", function(e){ if (e.key === "Enter") show(padn($("no").value)); });
$("no").addEventListener("change", function(){ var v = padn($("no").value); if (v) show(v); });
$("prev").onclick = function(){ var i = IDS.indexOf(cur); if (i > 0) show(IDS[i-1]); };
$("next").onclick = function(){ var i = IDS.indexOf(cur); if (i >= 0 && i < IDS.length-1) show(IDS[i+1]); };

/* 設定 */
["aspect","frame","bg"].forEach(function(id){ $(id).addEventListener("change", rebuildPrompt); });

$("poseChips").innerHTML = [
  "側身站立，頭微微轉向鏡頭，全身完整入鏡",
  "正面站立，雙腳著地，全身完整",
  "側面站立，長尾自然垂下",
  "停棲樹枝上，身體四分之三側向",
  "展翅一刻，雙翼全開",
  "低頭覓食，身體側向"
].map(function(t,i){
  return '<button class="chip' + (i===0?' on':'') + '" type="button" data-pose="' + esc(t) + '">' + esc(t.split("，")[0]) + '</button>';
}).join("");
$("poseChips").addEventListener("click", function(e){
  var b = e.target.closest("[data-pose]"); if (!b) return;
  pose = b.getAttribute("data-pose");
  $("pose").value = pose;
  [].forEach.call($("poseChips").children, function(c){ c.classList.toggle("on", c === b); });
  rebuildPrompt();
});
$("pose").addEventListener("input", function(){ pose = val("pose") || pose; rebuildPrompt(); });

$("finishChips").innerHTML = [
  ["Matte letterpress paper, no foil, no gradient glow", "啞面凹凸紙"],
  ["Slightly embossed premium card stock with crisp ink edges", "壓紋厚卡"],
  ["Clean flat print, perfectly sharp edges, no texture noise", "平版印刷"]
].map(function(p,i){
  return '<button class="chip' + (i===0?' on':'') + '" type="button" data-finish="' + esc(p[0]) + '">' + p[1] + '</button>';
}).join("");
$("finishChips").addEventListener("click", function(e){
  var b = e.target.closest("[data-finish]"); if (!b) return;
  finish = b.getAttribute("data-finish");
  [].forEach.call($("finishChips").children, function(c){ c.classList.toggle("on", c === b); });
  rebuildPrompt();
});

/* ═══════════════════════════════════════════════════════════
   相片：上載 / 拖入 / Ctrl+V / 前後鏡
   ═══════════════════════════════════════════════════════════ */
function loadPhoto(file){
  if (!file || !/^image\\//.test(file.type || "")){ toast("請揀圖片檔"); return; }
  var r = new FileReader();
  r.onload = function(){
    var s = String(r.result);
    var m = s.match(/^data:([^;]+);base64,(.*)$/);
    if (!m){ toast("讀取失敗"); return; }
    photo = { mime: m[1], b64: m[2], url: s };
    $("previewImg").src = s;
    $("previewBox").style.display = "block";
    $("photoMeta").textContent = (m[1].replace("image/","").toUpperCase()) +
      " · " + Math.round(m[2].length * 0.75 / 1024) + " KB";
    $("rStat").textContent = "有（" + Math.round(m[2].length * 0.75 / 1024) + " KB）";
    rebuildPrompt();
    toast("已附加參考圖");
  };
  r.readAsDataURL(file);
}
$("drop").onclick = function(){ $("photoInput").click(); };
$("photoInput").addEventListener("change", function(e){
  var f = e.target.files && e.target.files[0]; e.target.value = "";
  if (f) loadPhoto(f);
});
[["camPhoto","camIn"],["camPhoto2","camIn2"]].forEach(function(p){
  $(p[0]).onclick = function(){ if (!busy) $(p[1]).click(); };
  $(p[1]).addEventListener("change", function(e){
    var f = e.target.files && e.target.files[0]; e.target.value = "";
    if (f) loadPhoto(f);
  });
});
$("resetPhoto").onclick = function(e){
  e.stopPropagation();
  photo = null;
  $("previewBox").style.display = "none";
  $("photoMeta").textContent = "";
  $("rStat").textContent = "無";
  rebuildPrompt(); toast("已清除參考圖");
};
/* 拖入 */
["dragover","dragenter"].forEach(function(ev){
  $("drop").addEventListener(ev, function(e){ e.preventDefault(); $("drop").classList.add("over"); });
});
["dragleave","drop"].forEach(function(ev){
  $("drop").addEventListener(ev, function(e){ e.preventDefault(); $("drop").classList.remove("over"); });
});
$("drop").addEventListener("drop", function(e){
  var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) loadPhoto(f);
});
/* Ctrl+V */
document.addEventListener("paste", function(e){
  var items = (e.clipboardData && e.clipboardData.items) || [];
  for (var i = 0; i < items.length; i++){
    if (items[i].type && items[i].type.indexOf("image") === 0){
      var f = items[i].getAsFile();
      if (f){ loadPhoto(f); e.preventDefault(); return; }
    }
  }
});

/* ═══════════════════════════════════════════════════════════
   金鑰 UI
   ═══════════════════════════════════════════════════════════ */
function refreshKeyBadge(){
  var k = resolveKey();
  var src = keySource();
  var el = $("keyBadge");
  if (k){
    el.className = "badge on";
    el.textContent = "🔑 已就緒 · " + (src || "已注入");
    $("kStat").textContent = "有（" + src + "）";
    if ($("keyBox")) $("keyBox").style.display = "none";
  } else {
    el.className = "badge";           /* 中性，唔報紅：Canvas 會補認證 */
    el.textContent = "☁️ 交俾 Canvas 認證";
    $("kStat").textContent = "未見 key · 直接交俾 Canvas";
    if ($("keyBox")) $("keyBox").style.display = "none";
  }
}
$("apiKey").value = lsGet(LS_KEY) || "";
$("apiKey").addEventListener("change", function(){
  var v = val("apiKey");
  if (v) { lsSet(LS_KEY, v); toast("🔑 已儲存（只存在你部機）"); }
  else { try{ localStorage.removeItem(LS_KEY); }catch(e){} toast("🔑 已清除，用自動注入"); }
  refreshKeyBadge();
});
if ($("keySave")) $("keySave").onclick = function(){
  var v = val("keyInline");
  if (v.length < 20){ toast("呢個唔似 key（太短）"); return; }
  lsSet(LS_KEY, v);
  $("apiKey").value = v;
  refreshKeyBadge();
  toast("🔑 已儲存（只存在你部機）");
};
$("keyInline") && $("keyInline").addEventListener("keydown", function(e){
  if (e.key === "Enter") $("keySave").click();
});

$("keyTest").onclick = async function(){
  var k = resolveKey();
  if (!k){ toast("未找到 key：可貼上，或直接複製 prompt 去 Gemini 網頁"); return; }
  $("keyBadge").textContent = "🔑 測試緊…";
  try {
    var r = await fetch(API_BASE + "gemini-2.5-flash-image:generateContent?key=" + encodeURIComponent(k), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 1 } })
    });
    var j = await r.json().catch(function(){ return {}; });
    var msg = (j.error && j.error.message) || "";
    if (r.status === 400 && /api.?key/i.test(msg)) { toast("API Key 無效"); return; }
    if (r.status === 403) { toast("Key 冇權限用呢個模型"); return; }
    if (r.status === 429) { toast("額度用完／太快，等陣再試"); return; }
    toast(r.ok ? "✅ Key 可用" : "⚠️ HTTP " + r.status + " " + msg.slice(0, 60));
  } catch(err){ toast("測試失敗：" + err.message); }
};

/* ═══════════════════════════════════════════════════════════
   Gemini 出圖：3 次退避、180s timeout、錯誤分類
   ═══════════════════════════════════════════════════════════ */
async function callImageAPI(prompt, aspect, model, key){
  var url = API_BASE + model + ":generateContent" + (key ? "?key=" + encodeURIComponent(key) : "");
  var parts = [];
  if (photo) parts.push({ inlineData: { mimeType: photo.mime, data: photo.b64 } });
  parts.push({ text: prompt });
  var body = { contents: [{ role: "user", parts: parts }],
               generationConfig: { imageConfig: { aspectRatio: aspect } } };

  var wait = 2000, lastErr = null;
  for (var attempt = 0; attempt < 3; attempt++){
    var ctrl = new AbortController();
    var timer = setTimeout(function(){ ctrl.abort(); }, 180000);
    try {
      var res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
        signal: ctrl.signal, body: JSON.stringify(body) });
      var json = await res.json().catch(function(){ return {}; });
      if (!res.ok){
        var msg = (json.error && json.error.message) || "";
        if (res.status === 400 && /api.?key/i.test(msg))
          throw new Error("API Key 無效（Canvas 開啟時留空；本機請貼 key）");
        if (res.status === 400 && /model/i.test(msg))
          throw new Error("模型名稱有誤，改用 gemini-2.5-flash-image 試吓");
        if (res.status === 403) throw new Error("API Key 冇權限用呢個模型");
        if (res.status === 429) throw new Error("生成額度用完或者太快，請等陣再試");
        if (res.status >= 500){ lastErr = new Error("AI 服務暫時忙緊，請稍後再試"); await delay(wait); wait *= 2; continue; }
        throw new Error("生成失敗：" + (msg || ("HTTP " + res.status)));
      }
      var cand = (json.candidates || [])[0];
      var outParts = (cand && cand.content && cand.content.parts) || [];
      var part = null;
      for (var i = 0; i < outParts.length; i++){
        if (outParts[i].inlineData || outParts[i].inline_data){ part = outParts[i]; break; }
      }
      if (!part){
        var reason = cand && cand.finishReason;
        if (reason === "IMAGE_SAFETY" || reason === "SAFETY")
          throw new Error("內容被安全過濾器擋住，請改參考圖或描述再試");
        throw new Error("AI 冇返回圖片（" + (reason || "unknown") + "），請再試一次");
      }
      var d = part.inlineData || part.inline_data;
      return { url: "data:" + (d.mimeType || d.mime_type || "image/png") + ";base64," + d.data };
    } catch (e){
      if (e.name === "AbortError") lastErr = new Error("生成超時（3 分鐘），請再試一次");
      else if (/API Key|模型名稱|權限|額度|安全過濾器|冇返回|生成失敗/.test(e.message || "")) throw e;
      else lastErr = e;
      if (attempt < 2){ await delay(wait); wait *= 2; }
    } finally { clearTimeout(timer); }
  }
  throw lastErr || new Error("生成失敗，請再試一次");
}

function setBusy(v){
  busy = v;
  $("generateBtn").disabled = v;
  $("generateBtn").textContent = v ? "⏳ 生成緊…" : "🎴 生成卡牌";
  $("retryBtn").disabled = v || !result;
  $("againBtn").disabled = v || !result;
}

function renderResult(r){
  result = r;
  var cmp = $("cmp"), stage = $("stage");
  if (photo){
    $("imgBefore").src = photo.url; $("imgAfter").src = r.url;
    cmp.style.display = "grid"; stage.style.display = "none";
  } else {
    cmp.style.display = "none"; stage.style.display = "flex";
    stage.innerHTML = "";
    var img = new Image(); img.src = r.url; img.alt = "NO." + r.id;
    img.onclick = function(){ openLightbox(r.url); };
    stage.appendChild(img);
  }
  $("zoomBtn").disabled = false; $("downloadBtn").disabled = false;
  $("retryBtn").disabled = false; $("againBtn").disabled = false;
  $("errBox").innerHTML = "";

  gallery.unshift({ url: r.url, id: r.id });
  if (gallery.length > 24) gallery.pop();
  $("gallery").innerHTML = gallery.map(function(g, i){
    return '<img src="' + g.url + '" alt="NO.' + g.id + '" data-g="' + i + '" title="NO.' + g.id + '">';
  }).join("");
  [].forEach.call($("gallery").children, function(el){
    el.onclick = function(){ openLightbox(el.getAttribute("src")); };
  });
}

function openLightbox(url){
  $("lightboxImg").src = url;
  $("lightbox").classList.add("on");
}
$("lightbox").onclick = function(){ $("lightbox").classList.remove("on"); };
$("zoomBtn").onclick = function(){
  var src = result && (photo ? result.url : result.url);
  if (src) openLightbox(src);
};

async function generate(){
  if (busy) return;
  var prompt = val("prompt");
  if (!prompt){ toast("prompt 係空"); return; }
  var key = resolveKey();
  var aspect = val("aspect") || "2:3";
  var model = val("model") || "gemini-2.5-flash-image";

  /* 照 V17：唔檢查 key。冇 key 就唔加 ?key= —— Canvas 內部會補認證 */
  if (!key) key = val("apiKey");

  setBusy(true);
  var secs = 0;
  var stage = $("stage"), cmp = $("cmp");
  cmp.style.display = "none"; stage.style.display = "flex";
  stage.innerHTML = '<div><div class="spinner"></div><b>AI 畫緊卡牌…</b>' +
    '<div style="font-size:11.5px;color:var(--soft);margin-top:6px" id="tick">通常 10–40 秒</div></div>';
  var tick = setInterval(function(){
    secs++;
    var el = $("tick");
    if (el) el.textContent = "⏳ 已用 " + secs + " 秒（通常 10–40 秒）";
  }, 1000);

  try {
    var r = await callImageAPI(prompt, aspect, model, key);
    r.id = cur; r.prompt = prompt;
    renderResult(r);
    toast("✅ 完成 · " + model);
  } catch (e){
    stage.innerHTML = '<div class="ph">出圖失敗</div>';
    $("errBox").innerHTML = '<div class="warn">' + esc(e.message) + '</div>';
    toast("❌ " + e.message, 4200);
  } finally {
    clearInterval(tick); setBusy(false);
  }
}
$("generateBtn").onclick = generate;
$("retryBtn").onclick = function(){ generate(); };
$("againBtn").onclick = function(){
  var i = IDS.indexOf(cur);
  if (i >= 0 && i < IDS.length - 1) show(IDS[i+1]);
};

/* 下載 */
$("downloadBtn").onclick = function(){
  if (!result) return;
  var a = document.createElement("a");
  a.href = result.url;
  a.download = "aviandex-" + result.id + ".png";
  document.body.appendChild(a); a.click(); a.remove();
  toast("已下載 aviandex-" + result.id + ".png");
};

/* 複製 prompt */
async function copyPrompt(){
  var t = val("prompt");
  try { await navigator.clipboard.writeText(t); toast("已複製 prompt（" + t.length + " 字）"); }
  catch(e){ $("prompt").select(); document.execCommand("copy"); toast("已複製 prompt"); }
}
$("copyBtn").onclick = copyPrompt;
$("copyBtn2").onclick = copyPrompt;
$("rebuild").onclick = function(){ rebuildPrompt(); toast("已由資料重新砌"); };
$("openGemini").addEventListener("click", function(){
  toast("貼上 prompt；參考圖要另外上載");
});
$("prompt").addEventListener("input", function(){
  $("promptLen").textContent = $("prompt").value.length + " 字";
});

/* 啟動 */
var VER = "${new Date().toISOString().slice(0,10)}-v3";
$("verStamp").textContent = VER;
$("vStat").textContent = VER;
refreshKeyBadge();
show("0013");
setTimeout(function(){
  if (!resolveKey()) toast("未見 key：Canvas 會自動認證；本機／Vercel 就要貼一次", 4600);
}, 1400);
setTimeout(refreshKeyBadge, 900);   // Canvas 有時遲少少注入
</script>
</body>
</html>
`;

for (const f of ['aviandex-gen.html', 'aviandex-gen-v2.html', 'aviandex-gen-v3.html']) {
  writeFileSync(path.join(root, 'public', f), html, 'utf8');
}
console.log('已寫入 aviandex-gen{, -v2, -v3}.html（' + Object.keys(BIRDS).length + ' 隻 · '
  + Math.round(Buffer.byteLength(html) / 1024) + ' KB）');
