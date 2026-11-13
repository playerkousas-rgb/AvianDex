#!/usr/bin/env node
/* ============================================================
 *  build-aviandex-page.mjs —— AvianDex 資訊卡出圖頁 v4
 * ------------------------------------------------------------
 *  用戶指正（第三輪理解）：
 *    「你現在弄成的只是張生圖交給 gemini，但還是在你的框架內，
 *      但你的排版就是和原版不同。現在要做的是限死 gemini 資料，
 *      讓他參考我的參考圖，去完成其他編號的。」
 *
 *  v4 與 v3 的根本分別：
 *    ① 版面樣板（用戶做好的卡）與鳥圖分開兩格上載，
 *       兩張一齊以 inlineData 送出。
 *    ② prompt 內明令：樣板上所有字＝佔位，不准抄任何一個字。
 *    ③ 卡面 18 個位置逐格點名（Z01–Z18），每格寫明要印什麼，
 *       冇資料就印「資料待查」——杜絕模型留白抄舊字。
 *
 *  用法：node scripts/cards/build-aviandex-page.mjs
 *  輸出：tools/card-pages/aviandex-gen-v4.html
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
const tax = J('src/data/birdTaxonomy.json');

const BIRDS = {};
for (const id of Object.keys(idx.birds)) {
  const e = idx.birds[id], c = copy[id] || {}, m = meas[id] || {};
  const sc = scores[id] || {}, t = tax[id] || {};
  BIRDS[id] = {
    z: e.z || '', e: e.e || '', s: e.s || '', oz: e.oz || '', fz: e.fz || '',
    o: e.o || t.order || '', f: e.f || t.family || '',
    len: e.len || '', mass: m.mass || '', wing: m.wing || '',
    sc,
    h: (e.h || []).map((x) => (idx.habitatTags || []).find((y) => y.id === x)?.zh).filter(Boolean),
    d: (e.d || []).map((x) => (idx.dietTags || []).find((y) => y.id === x)?.zh).filter(Boolean),
    look: (zh[id] || {}).look || c.look || '',
    c: {
      diet: c.diet || '', range: c.range || '', habitat: c.habitat || '', funFact: c.funFact || '',
      breeding: c.breeding || '', voice: c.voice || '', behavior: c.behavior || '',
      conservation: c.conservation || '', etymology: c.etymology || '', humanRelation: c.humanRelation || '',
      migration: c.migration || '', iucn: c.iucn || '', iucnEn: c.iucnEn || '',
      highlights: Array.isArray(c.highlights) ? c.highlights.slice(0, 5) : [],
    },
    src: sources[id] || '',
  };
}

const html = `<!doctype html>
<html lang="zh-Hant-HK">
<head>
<meta charset="utf-8">
<title>AvianDex 資訊卡 · 出圖 v4</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<style>
  :root{--bg:#0B0F0C;--card:#141A15;--line:#26302A;--ink:#EFF3EC;--soft:#94A398;
        --faint:#5A6459;--lime:#E8FF47;--deep:#11402A;--gold:#CE9820;--miss:#C26A5A;
        --ok:#4F9D6A;--mono:ui-monospace,SFMono-Regular,Menlo,monospace}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
    font:13.5px/1.65 "Noto Sans TC","PingFang HK","Microsoft JhengHei",system-ui,sans-serif}
  header{position:sticky;top:0;z-index:30;display:flex;gap:12px;align-items:center;flex-wrap:wrap;
    padding:11px 16px;background:rgba(11,15,12,.94);backdrop-filter:blur(14px);
    border-bottom:1px solid var(--line)}
  header h1{margin:0;font-size:14px}
  header .sub{font-size:11.5px;color:var(--soft)}
  .badge{font-size:10.5px;padding:2px 9px;border-radius:999px;background:#1E2A20;
    border:1px solid var(--line);color:var(--soft)}
  .badge.on{background:#1B3A26;border-color:#2F6B4C;color:#BFE4CB}
  .gear{margin-left:auto;display:flex;gap:7px;align-items:center}
  .gear input{width:150px;padding:6px 9px;border-radius:8px;border:1px solid var(--line);
    background:#090C0A;color:var(--ink);font-size:11.5px}
  .wrap{max-width:1340px;margin:0 auto;padding:15px 16px 90px;
    display:grid;grid-template-columns:404px 1fr;gap:14px;align-items:start}
  @media (max-width:980px){.wrap{grid-template-columns:1fr}}
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
  textarea{font-family:var(--mono);font-size:11px;line-height:1.72;min-height:300px;resize:vertical}
  .row{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
  button{padding:9px 13px;border-radius:9px;border:1px solid var(--line);background:#1C241C;
    color:var(--ink);font:700 12.5px/1 inherit;cursor:pointer;font-family:inherit}
  button:hover{background:#243020}
  button:disabled{opacity:.45;cursor:default}
  button.main{background:var(--lime);color:#0B0F0C;border-color:var(--lime);padding:13px 20px;font-size:14px}
  button.mini{padding:6px 10px;font-size:11.5px}
  button.ghost{background:transparent}
  button.tag{font-size:11px;padding:4px 9px;border-radius:999px;background:#18201A}
  button.tag.on{background:var(--deep);border-color:#2F6B4C;color:#D7EAD9}
  label{display:block;font-size:11.5px;color:var(--soft);margin:9px 0 4px}
  .drop{border:1.5px dashed #33402F;border-radius:11px;padding:14px 10px;text-align:center;
    cursor:pointer;color:var(--soft);font-size:12px;transition:.15s;position:relative}
  .drop:hover,.drop.over{border-color:var(--lime);color:var(--lime);background:#101710}
  .drop .big{font-size:22px;line-height:1.2;margin-bottom:2px}
  .drop small{display:block;font-size:10.5px;color:var(--faint);margin-top:3px}
  .drop.done{border-style:solid;border-color:#2F6B4C}
  .thumb{width:100%;border-radius:9px;border:1px solid var(--line);display:block;margin-top:7px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .src{border-left:2px solid #33402F;padding-left:9px;margin:5px 0 9px;font-size:12px}
  .src b{color:var(--gold);font-weight:800}
  .src .f{color:var(--faint);font-size:10.5px;font-family:var(--mono)}
  .src .v{display:block;color:var(--soft);font-size:11.5px;margin-top:2px;max-height:34px;overflow:hidden}
  .check .r{display:flex;gap:7px;padding:3px 0;border-bottom:1px dashed #1F2822;align-items:center;font-size:12px}
  .check .r:last-child{border-bottom:0}
  .dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto}
  .yes{background:var(--ok)}.no{background:var(--miss)}
  .check .k{font-weight:700;min-width:92px}
  .check .v2{margin-left:auto;color:var(--soft);text-align:right;max-width:56%;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .work{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px}
  .stage{background:#080B09;border:1px solid var(--line);border-radius:11px;min-height:440px;
    display:flex;align-items:center;justify-content:center;overflow:hidden}
  .stage img{max-width:100%;max-height:76vh;display:block;cursor:zoom-in}
  .stage .ph{color:var(--faint);font-size:12.5px;text-align:center;padding:20px;line-height:1.9}
  .cmp{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:9px}
  .cmp figure{margin:0;position:relative}
  .cmp img{width:100%;border-radius:9px;border:1px solid var(--line);display:block}
  .cmp figcaption{position:absolute;left:6px;bottom:6px;font-size:10px;background:rgba(0,0,0,.75);
    padding:2px 7px;border-radius:999px;color:#DDE7DE}
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
  .tagline{display:inline-block;font-size:10.5px;padding:2px 8px;border-radius:999px;
    background:#1E2A20;border:1px solid var(--line);margin:0 5px 4px 0}
  .gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:7px;margin-top:10px}
  .gal img{width:100%;border-radius:7px;border:1px solid var(--line);cursor:zoom-in;display:block}
  .kv{display:flex;justify-content:space-between;font-size:11.5px;padding:3px 0;
    border-bottom:1px dashed #1F2822;color:var(--soft)}
  .kv:last-child{border-bottom:0}
  .kv b{color:var(--lime);font-size:13px}
  code{font-family:var(--mono);font-size:11px;color:#A9C3A9}
  .cells{margin-top:4px}
  .cells .c{font-size:11.5px;padding:4px 0;border-bottom:1px dashed #1F2822;color:var(--soft)}
  .cells .c:last-child{border-bottom:0}
  .cells .c b{color:var(--ink);font-weight:700;margin-right:5px}
</style>
</head>
<body>

<header>
  <span style="font-size:19px">🪶</span>
  <div>
    <h1 style="margin:0">AvianDex 資訊卡 · 出圖 <span style="color:var(--lime)">v4</span></h1>
    <div class="sub">版面照你張卡 → 只換內容｜<span id="verStamp">—</span></div>
  </div>
  <span id="keyBadge" class="badge">☁️ 交俾 Canvas 認證</span>
  <div class="gear">
    <span class="badge">⚙️ Key（選用）</span>
    <input id="apiKey" type="password" placeholder="留空 = Canvas 自動注入" autocomplete="off">
    <button class="mini ghost" id="keyTest" type="button">測試</button>
  </div>
</header>

<div class="wrap">
  <div>
    <section class="panel">
      <div class="step"><span class="n">1</span><b>編號</b><span class="dim">0001–0569</span></div>
      <div class="row">
        <input id="no" class="mono" type="text" value="0008" inputmode="numeric" style="flex:1;min-width:96px">
        <button class="mini" id="prev" type="button">←</button>
        <button class="mini" id="next" type="button">→</button>
      </div>
      <div id="who" style="margin-top:10px"></div>
      <div id="risk"></div>
    </section>

    <section class="panel">
      <div class="step"><span class="n">2</span><b>兩張圖</b><span class="dim">一齊送出</span></div>

      <label style="margin-top:0">① 版面樣板（你已做好的卡）</label>
      <div class="drop" id="dropT">
        <div class="big">🖼️</div><b>上載版面樣板</b>
        <small>只抄版面，佢上面所有字都當佔位</small>
        <input type="file" id="tplInput" accept="image/*" hidden>
      </div>
      <img id="tplImg" class="thumb" style="display:none" alt="版面樣板">
      <div class="row" style="margin-top:6px">
        <button class="mini ghost" id="resetT" type="button" style="display:none">✕ 移除樣板</button>
        <span class="hint" id="tplMeta" style="margin:0"></span>
      </div>

      <label>② 呢隻雀嘅插畫／相片（選用）</label>
      <div class="drop" id="dropA">
        <div class="big">🐦</div><b>上載鳥圖</b>
        <small>亦可拖入或 Ctrl+V 貼上</small>
        <input type="file" id="artInput" accept="image/*" hidden>
      </div>
      <img id="artImg" class="thumb" style="display:none" alt="鳥圖">
      <div class="row" style="margin-top:6px">
        <button class="mini ghost" id="resetA" type="button" style="display:none">✕ 移除鳥圖</button>
        <span class="hint" id="artMeta" style="margin:0"></span>
      </div>
    </section>

    <section class="panel">
      <div class="step"><span class="n">3</span><b>卡面 18 格</b><span class="dim">逐格點名</span></div>
      <div class="cells" id="cellList"></div>
      <p class="hint">每一格都會原文寫入 prompt，並註明「冇資料印資料待查」。</p>
    </section>

    <section class="panel">
      <div class="step"><span class="n">4</span><b>出圖</b><span class="dim">10–60 秒</span></div>
      <div class="grid2">
        <div><label>比例</label>
          <select id="aspect">
            <option value="2:3" selected>2:3 直向（同你張卡一樣）</option>
            <option value="3:4">3:4</option>
            <option value="1:1">1:1</option>
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
      <p class="hint">冇 key 就複製 prompt 去 Gemini，兩張圖要自己上載。</p>
    </section>
  </div>

  <div>
    <div class="work">
      <div class="step"><span class="n">5</span><b>成品</b><span class="dim" id="workTitle"></span></div>
      <div class="cmp" id="cmp" style="display:none">
        <figure><img id="imgTpl" alt="版面樣板"><figcaption id="capTpl">版面樣板</figcaption></figure>
        <figure><img id="imgArt" alt="鳥圖"><figcaption>鳥圖</figcaption></figure>
        <figure><img id="imgAfter" alt="成品"><figcaption>成品</figcaption></figure>
      </div>
      <div class="stage" id="stage">
        <div class="ph">未有圖<br><span style="font-size:11.5px">上載版面樣板 → 打編號 → 生成</span></div>
      </div>
      <div class="row" style="margin-top:10px">
        <button id="zoomBtn" type="button" disabled>🔍 放大</button>
        <button id="downloadBtn" type="button" disabled>⬇️ 下載 PNG</button>
        <button class="ghost" id="retryBtn" type="button" disabled>🔄 重做</button>
        <button class="ghost" id="againBtn" type="button" disabled>🎯 下一隻</button>
      </div>
      <div id="errBox"></div>
      <div class="gal" id="gallery"></div>
    </div>

    <div class="work" style="margin-top:12px">
      <div class="step"><span class="n">6</span><b>Prompt</b><span class="dim">可即時改</span></div>
      <textarea id="prompt"></textarea>
      <div class="row" style="margin-top:8px">
        <button class="mini" id="copyBtn2" type="button">複製 prompt</button>
        <button class="mini ghost" id="rebuild" type="button">↺ 重新砌</button>
        <a class="mini ghost" id="openGemini" href="https://gemini.google.com/app" target="_blank"
           rel="noopener" style="display:inline-block;padding:6px 10px;border-radius:9px;
           border:1px solid var(--line);color:var(--ink);font:700 11.5px/1 inherit;text-decoration:none">開 Gemini</a>
        <span class="hint" id="promptLen" style="margin:0"></span>
      </div>
    </div>
  </div>
</div>

<div class="lightbox" id="lightbox"><img id="lightboxImg" alt="放大"></div>
<div class="toast" id="toast"></div>

<script>
/* ═══════════ 金鑰：Canvas 會自動注入（照 漫畫.html） ═══════════ */
const API_KEY = ""; // Gemini Canvas 執行時會自動注入，請保持空字串
var API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
var LS_KEY = "aviandex_api_key";
function lsGet(k){ try{ return localStorage.getItem(k) || ""; }catch(e){ return ""; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function cleanKey(v){
  return (typeof v === "string" && v.trim().length >= 20 && !/YOUR_?API|PASTE|PLACEHOLDER|EXAMPLE/i.test(v))
    ? v.trim() : "";
}
function resolveKey(){
  var c = [API_KEY, window.GEMINI_API_KEY, window.__GEMINI_API_KEY__, window.__API_KEY__,
           window.apiKey, lsGet(LS_KEY), lsGet("tcg_api_key"), lsGet("sk_key")];
  for (var i = 0; i < c.length; i++){ var k = cleanKey(c[i]); if (k) return k; }
  try {
    var ks = Object.keys(window);
    for (var j = 0; j < ks.length; j++){
      var v; try { v = window[ks[j]]; } catch(e){ continue; }
      if (typeof v === "string" && /^AIza[0-9A-Za-z_\\-]{30,}$/.test(v.trim())) return v.trim();
    }
  } catch(e){}
  return "";
}

/* ═══════════ 資料 ═══════════ */
var BIRDS = ${JSON.stringify(BIRDS)};
var IDS = Object.keys(BIRDS).sort();
var $ = function(id){ return document.getElementById(id); };
var val = function(id){ return ($(id) && $(id).value || "").trim(); };
var esc = function(s){ return String(s == null ? "" : s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); };

var cur = "0008", busy = false;
var tpl = null, art = null, result = null, gallery = [];

function toast(m, ms){
  var el = $("toast"); el.textContent = m; el.classList.add("on");
  clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove("on"); }, ms || 2100);
}
function padn(s){ var d = String(s || "").replace(/\\D/g, ""); return d ? d.padStart(4, "0") : ""; }
function sent(s, n){
  s = String(s || "").replace(/\\s+/g, " ").trim();
  if (!s) return "";
  var i = s.search(/[。；]/);
  var out = (i > 0 && i <= n) ? s.slice(0, i + 1) : s.slice(0, n);
  return out + (out.length < s.length && !/[。；]$/.test(out) ? "…" : "");
}
function stars(v){
  var n = Math.max(0, Math.min(5, Math.round(Number(v) || 0))), s = "";
  for (var i = 0; i < 5; i++) s += (i < n ? "★" : "☆");
  return s;
}
function clauses(s, max){
  return String(s || "").split(/[。；，\\n]/).map(function(x){ return x.trim(); })
    .filter(function(x){ return x.length >= 2; }).slice(0, max);
}

/* ═══════════ 18 格：逐格資料 ═══════════ */
function cardCells(id, b){
  var c = b.c || {};
  var genus = (b.s || "").split(" ")[0] || "";
  var epithet = (b.s || "").split(" ").slice(1).join(" ").replace(/[^a-z\\-]/gi, "");
  var iucn = c.iucn || "資料待查";
  var iucnEn = c.iucnEn || "";
  var look = clauses(b.look, 4);
  var t = [];
  function add(zone, lines){ t.push({ zone: zone, lines: lines.filter(Boolean) }); }

  add("Z01 頂部標題帶", [
    "NO." + id,
    b.z,
    b.e,
    b.s,
    "分類：" + (b.oz || "資料待查") + " " + (b.fz || "資料待查"),
  ]);
  add("Z02 左上像素圖下方標註", ["▲ 像素圖鑑 / PIXEL ART"]);
  add("Z03 三格數值條", [
    "身長 " + (b.len ? b.len + " cm" : "資料待查"),
    "體重 " + (b.mass ? b.mass + " g" : "資料待查"),
    "保育級別 " + iucn,
  ]);
  add("Z04 圖鑑介紹 / PROFILE", [
    "圖鑑介紹 / PROFILE",
    sent(b.look || c.habitat, 78) || "資料待查",
  ]);
  add("Z05 分類資訊 / CLASSIFICATION（7 行）", [
    "界：動物界 Animalia",
    "門：脊索動物門 Chordata",
    "綱：鳥綱 Aves",
    "目：" + (b.oz || "資料待查") + " " + (b.o || ""),
    "科：" + (b.fz || "資料待查") + " " + (b.f || ""),
    "屬：" + (genus || "資料待查"),
    "種：" + b.z + " " + (genus ? genus[0] + ". " + epithet : ""),
  ]);
  add("Z06 生態習性 / ECOLOGICAL HABITS（4 行）", [
    "活動：日行性，清晨與黃昏最活躍",
    "棲地：" + (b.h.join("、") || "資料待查"),
    "行為：" + (sent(c.behavior, 34) || "資料待查"),
    "食性：" + (b.d.join("、") || "資料待查"),
  ]);
  add("Z07 食物 / DIET", [
    sent(c.diet, 56) || "資料待查",
  ]);
  add("Z08 分佈地區 / DISTRIBUTION", [
    sent(c.range, 70) || "資料待查",
  ]);
  add("Z09 成長與繁殖 / GROWTH & REPRODUCTION", [
    sent(c.breeding, 82) || "資料待查",
  ]);
  add("Z10 關鍵知識 / KEY KNOWLEDGE（1–5）",
    (c.highlights && c.highlights.length ? c.highlights : [sent(b.look, 60) || "資料待查"])
      .map(function(h, i){ return (i + 1) + " " + sent(h, 46); }));
  add("Z11 趣味冷知識 / TRIVIA（3 條）", [
    "★ " + (sent(c.funFact, 42) || "資料待查"),
    "★ " + (sent(c.voice, 42) || "資料待查"),
    "★ " + (sent(c.etymology || c.conservation, 42) || "資料待查"),
  ]);
  add("Z12 生態價值評分卡 / ECOLOGICAL VALUE CARD", [
    "生物重要性 " + n1(b.sc.i) + "/5",
    "物種適應力 " + n1(b.sc.a) + "/5",
    "觀賞價值 " + n1(b.sc.v) + "/5",
    "保育關注度 " + n1(b.sc.c) + "/5",
    "研究價值 " + n1(b.sc.r) + "/5",
    "總評分 " + stars(b.sc.o) + " " + n1(b.sc.o) + " / 5",
  ]);
  add("Z13 觀察小貼士 / OBSERVATION TIPS（4 行）", [
    "最佳觀察時間：清晨與黃昏",
    "建議地點：" + (b.h.slice(0, 2).join("、") || "資料待查"),
    "觀察重點：" + (look[0] || "資料待查"),
    "建議裝備：雙筒望遠鏡",
  ]);
  add("Z14 注意事項 / PRECAUTIONS（3 行）", [
    "切勿捕捉或非法飼養",
    "勿餵食人類食物",
    "觀察時保持距離",
  ]);
  add("Z15 右側特徵放大鏡（4 個圓圈，每個有標題＋說明）", [
    "第 1 個：頭部 — " + (look[0] || "資料待查"),
    "第 2 個：羽色 — " + (look[1] || "資料待查"),
    "第 3 個：翼部 — " + (look[2] || "資料待查"),
    "第 4 個：腳部 — " + (look[3] || "資料待查"),
  ]);
  add("Z16 可混淆物種 / SIMILAR SPECIES（2 個）", [
    "第一個物種名：資料待查",
    "第二個物種名：資料待查",
  ]);
  add("Z17 保育狀態 / CONSERVATION STATUS", [
    "IUCN " + iucn + (iucnEn ? " · " + iucnEn : ""),
    sent(c.conservation, 46) || "資料待查",
  ]);
  add("Z18 叫聲 / CALL（波形下說明）", [
    sent(c.voice, 46) || "資料待查",
  ]);
  return t;
}
function n1(v){ return v == null ? "資料待查" : Number(v).toFixed(1); }

/* ═══════════ Prompt ═══════════ */
function buildPrompt(id, b){
  var cells = cardCells(id, b);
  var aspect = val("aspect") || "2:3";
  var printed = cells.map(function(c){
    return "  [" + c.zone + "]\\n" + c.lines.map(function(l){ return "      " + l; }).join("\\n");
  }).join("\\n");

  var L = [];
  L.push("Create ONE finished bird encyclopedia information card, front side only, " + aspect +
    " portrait, perfectly flat and facing the camera like a clean scan of a real printed card. No table, no hand, no tilt, no mockup, no watermark, no page curl.");

  L.push("IMAGE 1 — LAYOUT TEMPLATE (supplied by me)\\n"
    + "  Copy ONLY its layout: the cream paper background, the thin olive-green rounded outer frame, the exact grid of panels, the position and size of every panel, the small circular pictogram icons, the magnifier circles on the right edge, the green radar chart, the bottom footer strip, and the typographic hierarchy.\\n"
    + "  EVERY WORD, NUMBER, NAME, SPECIES, CAPTION AND LABEL INSIDE IMAGE 1 IS PLACEHOLDER NOISE. Those glyphs belong to a different species and must NOT appear on the finished card, not even in the small magnifier captions, the similar-species boxes, the reproduction panel or the footer. Do not translate them, do not keep them 'as decoration'. Replace 100% of the text with the PRINTED TEXT block below.");

  if (art)
    L.push("IMAGE 2 — THE BIRD TO DEPICT\\n"
      + "  Paint this exact species: keep its plumage colours, head shape, beak, eye, wing pattern and posture. Never substitute another species. Also paint a small pixel-art version of the same bird for the top-left box.");
  else
    L.push("THE BIRD — paint ONE photorealistic " + b.z + " (" + b.e + ", " + b.s +
      ") in natural posture, complete body, clear head.");

  L.push("PRINTED TEXT — fill the card with EXACTLY these strings, cell by cell. Print nothing else:\\n" + printed);

  L.push("CELL RULES\\n"
    + "1. Every one of the 18 cells must be filled with its own text above. No cell may be left blank and no cell may keep template text.\\n"
    + "2. Render numbers exactly as written. Never round, convert or invent a number. If a cell says 資料待查, print 資料待查 exactly, in the same size and style as neighbouring text.\\n"
    + "3. The 4 magnifier circles each need their own title and one short caption from Z15 — never the template's captions.\\n"
    + "4. Traditional Chinese only. No simplified characters, no English sentences beyond the given names, no slogans, no QR code, no barcode, no price, no advertisement, no second bird species.");

  L.push("STYLE\\n"
    + "  Warm cream paper with very fine fibre texture, thin olive/sage-green panel borders, flat matte print, crisp sharp type, tiny pictogram icons in dark green. No glow, no gradient mesh, no drop shadow, no foil.");

  L.push("FINAL CHECK — before you finish, re-read every printed string on your card and confirm that (a) no word from IMAGE 1 survived, (b) all 18 cells are present, (c) every number matches the PRINTED TEXT block. Silently repair anything that fails.");
  return L.join("\\n\\n");
}

/* ═══════════ 畫面 ═══════════ */
function show(id){
  var b = BIRDS[id];
  if (!b){ toast("找不到 NO." + id); return; }
  cur = id; $("no").value = id;

  $("who").innerHTML =
    '<div style="font-size:21px;font-weight:900;line-height:1.2">' + esc(b.z) + '</div>' +
    '<div style="font-style:italic;color:var(--soft);font-size:12px">' + esc(b.s) + ' · ' + esc(b.e) + '</div>' +
    '<div style="margin-top:7px">' + [b.oz, b.fz, b.c.iucn].filter(Boolean)
      .map(function(t){ return '<span class="tagline">' + esc(t) + '</span>'; }).join("") + '</div>';

  var miss = [];
  cardCells(id, b).forEach(function(cell){
    cell.lines.forEach(function(l){ if (l.indexOf("資料待查") >= 0) miss.push(cell.zone.split(" ")[0]); });
  });
  var uniq = miss.filter(function(v, i, a){ return a.indexOf(v) === i; });
  $("risk").innerHTML = uniq.length
    ? '<div class="warn">' + uniq.length + " 格含「資料待查」：" + esc(uniq.join("、")) +
      '<br>（刻意唔由 AI 補）</div>'
    : '<div class="warn good">18 格資料齊全</div>';

  $("cellList").innerHTML = cardCells(id, b).map(function(c){
    return '<div class="c"><b>' + esc(c.zone) + '</b><br>' +
      c.lines.map(function(l){ return esc(sent(l, 46)); }).join(" ｜ ") + '</div>';
  }).join("");

  rebuildPrompt();
}
function rebuildPrompt(){
  var b = BIRDS[cur]; if (!b) return;
  $("prompt").value = buildPrompt(cur, b);
  $("promptLen").textContent = $("prompt").value.length + " 字";
  $("workTitle").textContent = "NO." + cur + " · " + b.z;
}

$("no").addEventListener("keydown", function(e){ if (e.key === "Enter") show(padn($("no").value)); });
$("no").addEventListener("change", function(){ var v = padn($("no").value); if (v) show(v); });
$("prev").onclick = function(){ var i = IDS.indexOf(cur); if (i > 0) show(IDS[i-1]); };
$("next").onclick = function(){ var i = IDS.indexOf(cur); if (i >= 0 && i < IDS.length-1) show(IDS[i+1]); };
$("aspect").addEventListener("change", rebuildPrompt);

/* ═══════════ 兩張圖 ═══════════ */
function readImg(file, cb){
  if (!file || !/^image\\//.test(file.type || "")){ toast("請揀圖片檔"); return; }
  var r = new FileReader();
  r.onload = function(){
    var s = String(r.result), m = s.match(/^data:([^;]+);base64,(.*)$/);
    if (!m){ toast("讀取失敗"); return; }
    cb({ mime: m[1], b64: m[2], url: s }, Math.round(m[2].length * 0.75 / 1024));
  };
  r.readAsDataURL(file);
}
function bindDrop(dropId, inputId, imgId, metaId, resetId, slot){
  var drop = $(dropId), inp = $(inputId);
  drop.onclick = function(){ inp.click(); };
  inp.addEventListener("change", function(e){
    var f = e.target.files && e.target.files[0]; e.target.value = "";
    if (f) readImg(f, function(o, kb){ setImg(slot, o, kb, imgId, metaId, resetId, drop); });
  });
  ["dragover","dragenter"].forEach(function(ev){
    drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add("over"); });
  });
  ["dragleave","drop"].forEach(function(ev){
    drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove("over"); });
  });
  drop.addEventListener("drop", function(e){
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) readImg(f, function(o, kb){ setImg(slot, o, kb, imgId, metaId, resetId, drop); });
  });
  $(resetId).onclick = function(e){
    e.stopPropagation();
    if (slot === "tpl") tpl = null; else art = null;
    $(imgId).style.display = "none"; $(metaId).textContent = "";
    $(resetId).style.display = "none"; drop.classList.remove("done");
    rebuildPrompt();
  };
}
function setImg(slot, o, kb, imgId, metaId, resetId, drop){
  if (slot === "tpl") tpl = o; else art = o;
  $(imgId).src = o.url; $(imgId).style.display = "block";
  $(metaId).textContent = o.mime.replace("image/","").toUpperCase() + " · " + kb + " KB";
  $(resetId).style.display = "inline-block"; drop.classList.add("done");
  rebuildPrompt(); toast(slot === "tpl" ? "已加版面樣板" : "已加鳥圖");
}
bindDrop("dropT","tplInput","tplImg","tplMeta","resetT","tpl");
bindDrop("dropA","artInput","artImg","artMeta","resetA","art");

/* Ctrl+V → 貼去第一個空位 */
document.addEventListener("paste", function(e){
  var items = (e.clipboardData && e.clipboardData.items) || [];
  for (var i = 0; i < items.length; i++){
    if (items[i].type && items[i].type.indexOf("image") === 0){
      var f = items[i].getAsFile();
      if (f){
        e.preventDefault();
        var slot = tpl ? "art" : "tpl";
        readImg(f, function(o, kb){
          if (slot === "tpl") setImg("tpl", o, kb, "tplImg", "tplMeta", "resetT", $("dropT"));
          else setImg("art", o, kb, "artImg", "artMeta", "resetA", $("dropA"));
        });
        return;
      }
    }
  }
});

/* ═══════════ 金鑰 ═══════════ */
function refreshKeyBadge(){
  var k = resolveKey(), el = $("keyBadge");
  if (k){ el.className = "badge on"; el.textContent = "🔑 已就緒"; }
  else { el.className = "badge"; el.textContent = "☁️ 交俾 Canvas 認證"; }
}
$("apiKey").value = lsGet(LS_KEY) || "";
$("apiKey").addEventListener("change", function(){
  var v = val("apiKey");
  if (v){ lsSet(LS_KEY, v); toast("🔑 已儲存（只在你部機）"); }
  else { try{ localStorage.removeItem(LS_KEY); }catch(e){} toast("🔑 已清除，用 Canvas 認證"); }
  refreshKeyBadge();
});
$("keyTest").onclick = async function(){
  var k = resolveKey();
  if (!k){ toast("未見 key：Canvas 會自動認證；本機就要貼"); return; }
  try {
    var r = await fetch(API_BASE + "gemini-2.5-flash-image:generateContent?key=" + encodeURIComponent(k), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 1 } })
    });
    var j = await r.json().catch(function(){ return {}; });
    var msg = (j.error && j.error.message) || "";
    if (r.status === 400 && /api.?key/i.test(msg)) return toast("API Key 無效");
    if (r.status === 403) return toast("Key 冇權限用呢個模型");
    if (r.status === 429) return toast("額度用完／太快");
    toast(r.ok ? "✅ Key 可用" : "⚠️ HTTP " + r.status);
  } catch(e){ toast("測試失敗：" + e.message); }
};

/* ═══════════ 出圖（照 V17：唔檢查 key） ═══════════ */
async function callImageAPI(prompt, aspect, model, key){
  var url = API_BASE + model + ":generateContent" + (key ? "?key=" + encodeURIComponent(key) : "");
  var parts = [];
  if (tpl) parts.push({ inlineData: { mimeType: tpl.mime, data: tpl.b64 } });
  if (art) parts.push({ inlineData: { mimeType: art.mime, data: art.b64 } });
  parts.push({ text: prompt });
  var body = { contents: [{ role: "user", parts: parts }],
               generationConfig: { imageConfig: { aspectRatio: aspect } } };

  var wait = 2000, lastErr = null;
  for (var a = 0; a < 3; a++){
    var ctrl = new AbortController();
    var timer = setTimeout(function(){ ctrl.abort(); }, 180000);
    try {
      var res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
        signal: ctrl.signal, body: JSON.stringify(body) });
      var json = await res.json().catch(function(){ return {}; });
      if (!res.ok){
        var msg = (json.error && json.error.message) || "";
        if (res.status === 400 && /api.?key/i.test(msg))
          throw new Error("API Key 無效（Canvas 開啟時留空）");
        if (res.status === 400 && /model/i.test(msg))
          throw new Error("模型名稱有誤，改用 gemini-2.5-flash-image");
        if (res.status === 403) throw new Error("API Key 冇權限用呢個模型");
        if (res.status === 429) throw new Error("額度用完或者太快，等陣再試");
        if (res.status >= 500){ lastErr = new Error("AI 服務忙緊，稍後再試"); await sleep(wait); wait *= 2; continue; }
        throw new Error("生成失敗：" + (msg || ("HTTP " + res.status)));
      }
      var cand = (json.candidates || [])[0];
      var ps = (cand && cand.content && cand.content.parts) || [];
      var part = null;
      for (var i = 0; i < ps.length; i++) if (ps[i].inlineData || ps[i].inline_data){ part = ps[i]; break; }
      if (!part){
        var reason = cand && cand.finishReason;
        if (reason === "IMAGE_SAFETY" || reason === "SAFETY")
          throw new Error("內容被安全過濾器擋住，改圖或描述再試");
        throw new Error("AI 冇返回圖片（" + (reason || "unknown") + "）");
      }
      var d = part.inlineData || part.inline_data;
      return { url: "data:" + (d.mimeType || d.mime_type || "image/png") + ";base64," + d.data };
    } catch (e){
      if (e.name === "AbortError") lastErr = new Error("超時（3 分鐘），再試一次");
      else if (/API Key|模型名稱|權限|額度|安全過濾器|冇返回|生成失敗/.test(e.message || "")) throw e;
      else lastErr = e;
      if (a < 2){ await sleep(wait); wait *= 2; }
    } finally { clearTimeout(timer); }
  }
  throw lastErr || new Error("生成失敗，再試一次");
}
function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

function setBusy(v){
  busy = v;
  $("generateBtn").disabled = v;
  $("generateBtn").textContent = v ? "⏳ 生成緊…" : "🎴 生成卡牌";
}
function openLightbox(u){ $("lightboxImg").src = u; $("lightbox").classList.add("on"); }
$("lightbox").onclick = function(){ $("lightbox").classList.remove("on"); };
$("zoomBtn").onclick = function(){ if (result) openLightbox(result.url); };

$("generateBtn").onclick = async function(){
  if (busy) return;
  if (!tpl && !art){ toast("至少上載版面樣板（你嗰張卡）", 3600); return; }
  var prompt = val("prompt");
  if (!prompt) return toast("prompt 係空");
  var key = resolveKey() || val("apiKey");
  var aspect = val("aspect") || "2:3";
  var model = val("model") || "gemini-2.5-flash-image";

  setBusy(true);
  var stage = $("stage"), cmp = $("cmp"), secs = 0;
  cmp.style.display = "none"; stage.style.display = "flex";
  stage.innerHTML = '<div><div class="spinner"></div><b>AI 照版面砌緊卡…</b>' +
    '<div style="font-size:11.5px;color:var(--soft);margin-top:6px" id="tick">通常 20–60 秒</div></div>';
  var tick = setInterval(function(){
    secs++; var el = $("tick"); if (el) el.textContent = "⏳ 已用 " + secs + " 秒";
  }, 1000);

  try {
    var r = await callImageAPI(prompt, aspect, model, key);
    r.id = cur; result = r;

    if (tpl){
      $("imgTpl").src = tpl.url; $("capTpl").textContent = "版面樣板";
      $("imgArt").src = art ? art.url : tpl.url; $("imgArt").parentNode.style.display = art ? "block" : "none";
      $("imgAfter").src = r.url;
      cmp.style.display = "grid"; stage.style.display = "none";
    } else {
      cmp.style.display = "none"; stage.style.display = "flex";
      stage.innerHTML = "";
      var img = new Image(); img.src = r.url;
      img.onclick = function(){ openLightbox(r.url); };
      stage.appendChild(img);
    }
    $("zoomBtn").disabled = false; $("downloadBtn").disabled = false;
    $("retryBtn").disabled = false; $("againBtn").disabled = false;
    $("errBox").innerHTML = "";

    gallery.unshift({ url: r.url, id: cur });
    if (gallery.length > 24) gallery.pop();
    $("gallery").innerHTML = gallery.map(function(g){
      return '<img src="' + g.url + '" alt="NO.' + g.id + '" title="NO.' + g.id + '">';
    }).join("");
    [].forEach.call($("gallery").children, function(el){
      el.onclick = function(){ openLightbox(el.getAttribute("src")); };
    });
    toast("✅ 完成 · " + model);
  } catch (e){
    stage.innerHTML = '<div class="ph">出圖失敗</div>';
    $("errBox").innerHTML = '<div class="warn">' + esc(e.message) + '</div>';
    toast("❌ " + e.message, 4200);
  } finally { clearInterval(tick); setBusy(false); }
};

$("retryBtn").onclick = function(){ $("generateBtn").click(); };
$("againBtn").onclick = function(){
  var i = IDS.indexOf(cur);
  if (i >= 0 && i < IDS.length - 1) show(IDS[i+1]);
};
$("downloadBtn").onclick = function(){
  if (!result) return;
  var a = document.createElement("a");
  a.href = result.url; a.download = "aviandex-" + result.id + ".png";
  document.body.appendChild(a); a.click(); a.remove();
  toast("已下載 aviandex-" + result.id + ".png");
};
async function copyPrompt(){
  var t = val("prompt");
  try { await navigator.clipboard.writeText(t); toast("已複製（" + t.length + " 字）"); }
  catch(e){ $("prompt").select(); document.execCommand("copy"); toast("已複製"); }
}
$("copyBtn").onclick = copyPrompt;
$("copyBtn2").onclick = copyPrompt;
$("rebuild").onclick = function(){ rebuildPrompt(); toast("已重新砌"); };
$("openGemini").addEventListener("click", function(){ toast("貼上 prompt，兩張圖要自己上載"); });
$("prompt").addEventListener("input", function(){ $("promptLen").textContent = $("prompt").value.length + " 字"; });

var VER = "${new Date().toISOString().slice(0,10)}-v4";
$("verStamp").textContent = VER;
refreshKeyBadge();
show("0008");
setTimeout(refreshKeyBadge, 900);
</script>
</body>
</html>
`;

const out = path.join(root, 'tools/card-pages/aviandex-gen-v4.html');
writeFileSync(out, html, 'utf8');
console.log('已寫入 tools/card-pages/aviandex-gen-v4.html（' + Object.keys(BIRDS).length + ' 隻 · '
  + Math.round(Buffer.byteLength(html) / 1024) + ' KB）');
