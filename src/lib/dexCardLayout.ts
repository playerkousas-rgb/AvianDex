/**
 * 卡面砌版：DexCardInput → 1200×1600 的 HTML。
 *
 * ── 這一版的三個改動（用戶：字少啲、圖／icon 多啲、排版參考 readme 設計手冊）──
 *   1. 每一格都有圖示（17 種食性、7 種棲地、9 個章節，全部 inline SVG，見 dexCardIcons.ts）
 *   2. 文字量減半：中英文都只留「一句」，靠 fit() 收到句末
 *   3. 加三個一眼睇得明的圖形：IUCN 五級量尺、分佈示意圖、體型對比尺
 *
 * ── 跟 readme 手冊（docs/23、design-review）的三條規矩 ──
 *   · 冇假數字：冇常見度、冇特徵放大圈、冇手繪假地圖 —— 因為我們沒有那些數據
 *   · 文字對比 ≥ 4.5:1（23 個目的主色全部實測過，白字與白底兩個方向都合格）
 *   · 字數上限由版面幾何算出，不靠肉眼估，所以 569 隻任何一隻都不會爆格
 *
 * 高度預算（總高 1600，一定要對得住，否則印出來會爛尾）：
 *   padding 34×2 = 68｜gap 18×5 = 90
 *   標題帶 216｜上段 438｜中段一 266｜中段二 266｜評分 152｜底欄 104 → 1442
 *   68 + 90 + 1442 = 1600 ✔
 */

import {
  type DexCardInput, type OrderTheme, orderTheme, SCORE_DIMS,
  PENDING_ZH, PENDING_EN, esc, para,
} from './dexCard';
import {
  svgIcon, DIET_ICONS, HABITAT_ICONS, IUCN_LEVELS, iucnIndex,
  orderEmblemSvg, starsSvg, POKEBALL_SVG,
} from './dexCardIcons';

/* ------------------------------------------------------------------
 * 版面幾何：所有高度／寬度只在這裡寫一次。
 * 字數預算由這裡推出來，所以改版面之後文字會自動跟著收。
 * ------------------------------------------------------------------ */
export const LAYOUT = {
  cardW: 1200,
  cardH: 1600,
  pad: 34,
  gap: 18,
  /* frame 外層 = 內容 + 4px padding × 2，所以每個數字都是「外框總高」 */
  hdr: 224,
  bandA: 434,
  bandB: 262,
  bandC: 262,
  score: 156,
  foot: 104,
  colL: 292,
  colR: 322,
  taxPanel: 268,
  panelPadX: 14,
  panelPadY: 11,
  panelHead: 38,   // 圖示 + 中英標題 + 底線
  zhSize: 13.5,
  zhLine: 20.2,
  enSize: 11,
  enLine: 15.6,
  enCharW: 5.5,
} as const;


/** 某格小卡「文字區」實際可用高度／寬度 */
export const bodyHeight = (panelH: number) => panelH - LAYOUT.panelPadY * 2 - LAYOUT.panelHead - 6;
export const bodyWidth = (panelW: number) => panelW - LAYOUT.panelPadX * 2;

/** 依可用空間算出中英各可放幾個字（中文 55%、英文 45% 高度） */
export function textBudget(panelH: number, panelW: number, hasZh = true, hasEn = true) {
  const h = bodyHeight(panelH);
  const w = bodyWidth(panelW);
  const zhLineChars = Math.max(6, Math.floor(w / LAYOUT.zhSize));
  const enLineChars = Math.max(12, Math.floor(w / LAYOUT.enCharW));
  const zhShare = !hasZh ? 0 : !hasEn ? 1 : 0.55;
  const enShare = !hasEn ? 0 : !hasZh ? 1 : 0.45;
  const zhLines = Math.max(1, Math.floor((h * zhShare) / LAYOUT.zhLine));
  const enLines = Math.max(1, Math.floor((h * enShare) / LAYOUT.enLine));
  return {
    zhMax: zhLines * zhLineChars,
    enMax: enLines * enLineChars,
    zhLines,
    enLines,
    zhLineChars,
    enLineChars,
  };
}

/**
 * 收到句號為止。
 *
 * 卡面空間固定，長段落一定要收。**不可以 CSS line-clamp 硬切** ——
 * 切一半會出現「…後來牠們」這種斷句，讀起來像壞掉。
 * 按字數預算退到最近的句末標點；真的一個標點都冇才用省略號。
 */
export function fit(text: string, maxChars: number, ellipsis = '…'): string {
  const t = (text || '').trim();
  if (!t) return '';
  if (t.length <= maxChars) return t;
  const head = t.slice(0, maxChars);
  const strong = /[。！？!?]/g;
  const weak = /[；;：:，,、]/g;
  const lastEnd = [...head.matchAll(strong)].pop();
  if (lastEnd && (lastEnd.index ?? 0) > maxChars * 0.4) {
    return head.slice(0, (lastEnd.index ?? 0) + 1);
  }
  const lastWeak = [...head.matchAll(weak)].pop();
  if (lastWeak && (lastWeak.index ?? 0) > maxChars * 0.55) {
    return `${head.slice(0, lastWeak.index)}${ellipsis}`;
  }
  return `${head.replace(/\s+\S*$/, '')}${ellipsis}`;
}

function splitOnCommas(text: string): string[] {
  /* 用捕獲組切，逗號同後面嘅空格一齊保留喺前一段尾，
     所以接返嘅時候「common, the」唔會變成「common,the」；
     而且「20,000」呢類數字中間嘅逗號可以認得出來。 */
  const parts = text.split(/([，,；;])(\s*)/u);
  const out: string[] = [];
  let buf = parts[0] ?? '';
  for (let i = 1; i < parts.length; i += 3) {
    const comma = parts[i] + (parts[i + 1] ?? '');
    const next = parts[i + 2] ?? '';
    /* 前後都是數字＝千位分隔，唔係斷句位 */
    if (/\d$/.test(buf) && /^\d/.test(next)) {
      buf += comma + next;
      continue;
    }
    out.push(buf + comma);
    buf = next;
  }
  out.push(buf);
  return out.map((x) => x.trim()).filter(Boolean);
}

export function bullets(text: string, maxPoints = 3, maxChars = 240, soft = false): string[] {
  const t = (text || '').trim();
  if (!t) return [];
  if (t.length <= maxChars) {
    /* soft：一段長句也拆成兩點，令版面有列點感；
       只斷在原文已有的逗號，不新增、不刪除任何字元。 */
    if (soft && maxPoints > 1) {
      const seg = splitOnCommas(t);
      if (seg.length > 1 && seg[0].length >= 10 && seg[0].length <= maxChars * 0.72) {
        /* 接返英文片段要留一格空格，否則會變「common,the」 */
        const glue = /[\u4e00-\u9fff]/.test(t) ? '' : ' ';
        return [seg[0], seg.slice(1).join(glue)];
      }
    }
    return [t];
  }
  const parts = t
    .split(/(?<=[。！？!?])/u)
    .map((x) => x.trim())
    .filter(Boolean)
    .reduce<string[]>((acc, seg) => {
      /* 太短的碎片（例如「」、單字）併回前一點，避免出現「。」獨立成一行的怪象 */
      if (acc.length && seg.length < 8) acc[acc.length - 1] += seg;
      else acc.push(seg);
      return acc;
    }, []);
  if (parts.length <= 1) {
    /* 冇句號可斷 → 退到分號／逗號（同一個 splitter，唔會食走英文空格） */
    const sub = splitOnCommas(t);
    if (sub.length > 1) return mergeToLimit(sub, maxPoints, maxChars);
    return [fit(t, maxChars)];
  }
  return mergeToLimit(parts, maxPoints, maxChars);
}

function mergeToLimit(parts: string[], maxPoints: number, maxChars: number): string[] {
  /*
   * 空間夠 → 原文照登，一個字都不改（最重要）。
   * 空間唔夠才需要在最後一點收尾，而收尾一律收在句末，不會出現半句。
   */
  const joined = parts.join('');
  if (joined.length <= maxChars) return parts;
  if (parts.length <= maxPoints) {
    /* 逐點放，放到放唔落為止；最後一點收在句末 */
    const out: string[] = [];
    let used = 0;
    for (const p of parts) {
      const left = maxChars - used;
      if (left <= 0) break;
      if (p.length <= left) { out.push(p); used += p.length; continue; }
      const cut = fit(p, left);
      if (cut) out.push(cut);
      break;
    }
    return out;
  }
  const head = parts.slice(0, maxPoints - 1);
  const tail = parts.slice(maxPoints - 1).join('');
  const budget = Math.max(20, maxChars - head.join('').length);
  return [...head, fit(tail, budget)];
}

/** 列點 HTML：中英各自成組 */
function bulletList(items: string[], cls: string): string {
  if (!items.length) return '';
  if (items.length === 1) return `<p class="${cls}">${items[0]}</p>`;
  return `<ul class="bl ${cls}-bl">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

/** 中英兩段：中欄只放中文、英欄只放英文。缺 → 各自的「待查」，互不頂替。 */
function bi(zh: string, en: string, panelH: number, panelW: number): string {
  const b = textBudget(panelH, panelW, !!zh, !!en);
  /* 列點有 9px 縮排 + 點距，字數預算收 6%，否則會多出一行爆格 */
  const zItems = bullets(zh, 3, Math.floor(b.zhMax * 0.94), true);
  const eItems = bullets(en, 3, Math.floor(b.enMax * 0.96), true);
  const z = zItems.length ? bulletList(zItems, 't-zh')
                          : `<p class="t-zh t-miss">${PENDING_ZH}</p>`;
  const e = eItems.length ? bulletList(eItems, 't-en')
                          : `<p class="t-en t-miss">${PENDING_EN}</p>`;
  return z + e;
}

/* ------------------------------------------------------------------
 * 分佈示意圖用的地區字。
 *
 * ⚠️ 這**不是**精確地圖 —— 我們沒有每隻雀的地理分佈多邊形。
 * 畫的是「香港在中心」的羅盤式示意，地區字由 range 原文抽取，
 * 卡面唔會扮成 GIS 地圖。
 * ------------------------------------------------------------------ */
const REGION_HINTS: Array<[string, string, string]> = [
  ['香港', 'HK', 'hk'],
  ['華南', 'S China', 'sc'],
  ['中國', 'China', 'cn'],
  ['東南亞', 'SE Asia', 'sea'],
  ['印度', 'India', 'in'],
  ['西伯利亞', 'Siberia', 'sib'],
  ['日本', 'Japan', 'jp'],
  ['台灣', 'Taiwan', 'tw'],
  ['澳洲', 'Australia', 'au'],
  ['歐洲', 'Europe', 'eu'],
  ['非洲', 'Africa', 'af'],
  ['美洲', 'Americas', 'am'],
  ['菲律賓', 'Philippines', 'ph'],
];

function rangeSketch(rangeText: string): string {
  const found = REGION_HINTS.filter(([zh]) => rangeText.includes(zh)).slice(0, 4);
  /* 香港永遠標出來：這一本圖鑑講的是香港野外 */
  const marks = new Set(found.map(([, , k]) => k));
  marks.add('hk');

  /* 極簡世界剪影（只用於「有嘢睇」，不聲稱地理準確） */
  const world = `
    <path d="M18 40c14-6 26-4 34 2 6 4 4 12-4 14-10 2-18-2-26-2S12 50 18 40z" />
    <path d="M64 28c10 2 16 10 14 20-2 10 6 16 2 24-6 10-20 8-26-2-4-8 2-14 2-22 0-10-2-20 8-20z" />
    <path d="M96 26c14-4 28 0 34 8 6 8 0 16-8 18-10 4-18 12-28 10-10-4-12-14-6-22 4-6 2-12 8-14z" />
    <path d="M140 30c12-2 24 4 26 12 2 8-6 12-16 12-12 0-22-4-22-12s2-10 12-12z" />
    <path d="M126 60c8 0 14 6 12 12-2 6-10 8-16 4-6-6-4-16 4-16z" />`;
  const pin = (x: number, y: number, label: string, on: boolean) => `
    <g class="pin${on ? ' on' : ''}" transform="translate(${x} ${y})">
      <circle r="7"/><circle r="3" class="core"/>
      <text y="-12">${esc(label)}</text>
    </g>`;

  const P: Record<string, [number, number, string]> = {
    hk: [150, 54, 'HK'],
    sc: [140, 44, '華南'],
    cn: [128, 36, '中國'],
    sea: [138, 68, '東南亞'],
    in: [104, 58, '印度'],
    sib: [130, 17, '西伯利亞'],
    jp: [168, 34, '日本'],
    tw: [160, 50, '台灣'],
    au: [176, 84, '澳洲'],
    eu: [88, 24, '歐洲'],
    af: [96, 62, '非洲'],
    am: [26, 44, '美洲'],
    ph: [156, 62, '菲律賓'],
  };

  return `<svg class="rangesvg" viewBox="0 0 200 108" aria-hidden="true">
    <g class="land">${world}</g>
    ${[...marks].map((k) => {
      const p = P[k];
      return p ? pin(p[0], p[1], p[2], true) : '';
    }).join('')}
  </svg>`;
}

/** 條碼：由編號推出，純裝飾，但同一個編號永遠同一條碼 */
function measureBars(m: Record<string, string>): string {
  const defs: Array<[string, string, string]> = [
    ['wing', '翼長', 'Wing'],
    ['tail', '尾長', 'Tail'],
    ['bill', '嘴峰', 'Bill'],
    ['tarsus', '跗蹠', 'Tarsus'],
  ];
  const vals = defs.map(([k]) => Number(m[k]) || 0);
  const max = Math.max(...vals, 1);
  if (!vals.some((v) => v > 0)) {
    return `<p class="t-zh t-miss">${PENDING_ZH}</p><p class="t-en t-miss">${PENDING_EN}</p>`;
  }
  return `<ul class="mbs">${defs.map(([, zh, en], i) => {
    const v = vals[i];
    const pct = v ? Math.max(6, Math.round((v / max) * 100)) : 0;
    return `<li class="mb">
        <span class="mb-n"><span class="zh">${zh}</span><span class="en en-h">${en}</span></span>
        <span class="mb-t"><i style="width:${pct}%"></i></span>
        <span class="mb-v">${v ? `${v}<em>mm</em>` : '—'}</span>
      </li>`;
  }).join('')}</ul>`;
}

/** 棲地／食性：圖示 + 中英名，排成一行 chips（圖優先，字次要） */
function taggedRow(ids: string[], labels: Array<{ id: string; zh: string; en: string }>, fallback: string): string {
  if (!ids.length) return `<span class="chip chip-miss">${fallback}</span>`;
  return ids.map((rawId) => {
    const label = labels.find((l) => l.id === rawId);
    /* dietTags 有 id 對不上圖示的（例如 omnivore 以外的變體）→ 仍顯示名字，不畫假圖 */
    const def = DIET_ICONS[rawId] || HABITAT_ICONS[rawId];
    return `<span class="chip" title="${esc(def?.zh || '')}">
      ${def ? svgIcon(rawId, 17, 'chip-ic') : ''}
      <span class="zh">${esc(label?.zh || rawId)}</span>
      <span class="en en-h">${esc(label?.en || '')}</span>
    </span>`;
  }).join('');
}

export interface RenderOpts {
  /** 'both' 中英並列（預設）；'zh'／'en' 單語 */
  lang?: 'both' | 'zh' | 'en';
  extraClass?: string;
}

/* ==================================================================
 * 以下：海報式排版（第三版）
 * ================================================================== */

/** 主圖區高度：插畫 + 引言疊在圖上 */
const POSTER_H = 490;   // 海報主圖：插畫 + 名稱 + 引言
/** 下方四格 */
/** 評分帶 */
const SCORE_H = 170;    // 評分帶
const ROW2_H = 380;     // 棲地食性 / 量度 / 分佈
const ROW4_H = 300;     // 外形 / 繁殖 / 行為 / 鳴聲

export function renderDexCard(d: DexCardInput, opts: RenderOpts = {}): string {
  const lang = opts.lang ?? 'both';
  const th: OrderTheme = orderTheme(d.orderLatin);
  const zh = d.zh || {};
  const en = d.en || {};
  const iucnRaw = (zh.iucn as string) || (en.iucn as string);

  const lenText = d.lengthCm > 0 ? `${d.lengthEstimated ? '≈' : ''}${d.lengthCm}` : '';
  const massText = d.mass ? `${d.mass}` : '';

  const sciParts = (d.sciName || '').trim().split(/\s+/);
  const genus = sciParts[0] || '';
  const species = sciParts.slice(0, 2).join(' ');
  const id4 = d.id.padStart(4, '0');
  const enLook = para(en.look);

  /* 主圖上的引言：借用「外形特徵」第一句（原文），它是整段最像圖說的句子。
     唔會另寫文案 —— 用戶規矩：不准改寫。 */
  const pullQuote = (() => {
    const src = para(zh.look) || para(zh.range) || para(zh.habitat);
    if (!src) return '';
    const first = (src.split(/(?<=[。！？])/u)[0] || src).trim();
    return fit(first, 34);
  })();

  const taxRows: Array<[string, string, string]> = [
    ['界', '動物界', 'Animalia'],
    ['門', '脊索動物門', 'Chordata'],
    ['綱', '鳥綱', 'Aves'],
    ['目', d.orderZh, d.orderLatin],
    ['科', d.familyZh, d.familyLatin],
    ['屬', genus, ''],
    ['種', species, ''],
  ];

  return `
<div class="dx lang-${lang} ${opts.extraClass || ''}" style="--c:${th.c};--t:${th.t};--a:${th.a}">
  <div class="sheet">

    <!-- ① 主圖：插畫出血到卡邊，引言直接壓在圖上 -->
    <section class="poster">
      ${d.artUrl
        ? `<img class="poster-art" src="${esc(d.artUrl)}" alt="${esc(d.zhName)}" referrerpolicy="no-referrer" />`
        : `<div class="poster-miss">NO.${id4}</div>`}
      <div class="poster-veil"></div>

      <div class="poster-top">
        <span class="brand">${POKEBALL_SVG}<b>AVIANDEX</b></span>
        <span class="emblem" title="${esc(d.orderZh)}">${orderEmblemSvg(d.orderLatin, 30)}</span>
        <span class="no">NO.${id4}</span>
      </div>

      <div class="poster-cap">
        <h1 class="name">${esc(d.zhName)}</h1>
        <p class="sci">${esc(d.sciName)}</p>
        <div class="cap-row">
          <span class="en-pill"><span class="en en-h">${esc(d.enName)}</span></span>
          <span class="htag"><span class="zh">${esc(d.orderZh)}</span> · <span class="zh">${esc(d.familyZh)}</span></span>
        </div>
        ${pullQuote ? `<blockquote class="pull">${pullQuote}</blockquote>` : ''}
      </div>
    </section>

    <!-- ② 資料帶：四個數字，一眼掃完 -->
    <section class="stats">
      <div class="stat">
        <span class="stat-k">${svgIcon('length', 15)}<span class="zh">身長</span><span class="en en-h">Length</span></span>
        <span class="stat-v">${lenText || '—'}<em>cm</em></span>
      </div>
      <div class="stat">
        <span class="stat-k">${svgIcon('weight', 15)}<span class="zh">體重</span><span class="en en-h">Mass</span></span>
        <span class="stat-v">${massText || '—'}<em>g</em></span>
      </div>
      <div class="stat stat-iucn">
        <span class="stat-k">${svgIcon('iucn', 15)}<span class="zh">保育級別</span><span class="en en-h">IUCN</span></span>
        ${iucnChip(iucnRaw)}
      </div>
      <div class="stat stat-score">
        <span class="stat-k">${svgIcon('funfact', 15)}<span class="zh">圖鑑評分</span><span class="en en-h">Dex rating</span></span>
        <span class="stat-v stat-o">${d.score?.o == null ? '—' : d.score.o.toFixed(1)}<em>/5</em>${starsSvg(d.score?.o ?? undefined, 12)}</span>
      </div>
    </section>

    <!-- ③ 左：棲地／食性（大晶片）｜右：CT 式量度表 -->
    <section class="row row-2">
      <div class="pane pane-tags">
        <h3 class="pane-h">${svgIcon('forest', 17)}<span class="zh">棲地與食性</span><span class="en en-h">Habitat &amp; diet</span></h3>
        <div class="tagblock">
          <span class="tag-k"><span class="zh">住</span><span class="en en-h">Habitat</span></span>
          <div class="chiprow">${taggedRow(d.habitatIds || [], d.habitatLabels || [], PENDING_ZH)}</div>
        </div>
        <div class="tagblock">
          <span class="tag-k"><span class="zh">食</span><span class="en en-h">Diet</span></span>
          <div class="chiprow">${taggedRow(d.dietIds || [], d.dietLabels || [], PENDING_ZH)}</div>
        </div>
        <ul class="taxlist compact">${taxRows.slice(3).map(([k, z, l]) => `
          <li><span class="k">${k}</span><span class="v">${esc(z)}<em>${esc(l)}</em></span></li>`).join('')}</ul>
      </div>

      <div class="pane pane-meas">
        <h3 class="pane-h">${svgIcon('ruler', 17)}<span class="zh">量度</span><span class="en en-h">Measurements</span></h3>
        ${measureBars(d.meas || {})}
        <p class="meas-src">AVONET · BIRD-DEX 2</p>
      </div>

      <div class="pane pane-range">
        <h3 class="pane-h">${svgIcon('map', 17)}<span class="zh">分佈</span><span class="en en-h">Range</span></h3>
        <div class="range-wrap">${rangeSketch(para(zh.range) || para(en.range))}</div>
        ${bi(para(zh.range), para(en.range), 186, 318)}
      </div>
    </section>

    <!-- ④ 四格：每格一圖一事 -->
    <section class="row row-4">
      ${miniPane('feather', '外形', 'Look', zh.look, enLook)}
      ${miniPane('nest', '繁殖', 'Breeding', zh.breeding, en.breeding)}
      ${miniPane('behaviour', '行為', 'Behaviour', zh.behavior, en.behavior)}
      ${miniPane('voice', '鳴聲', 'Voice', zh.voice, en.voice)}
    </section>

    <!-- ⑤ 分數：五條 bar + 五星，右邊精靈球總分 -->
    <section class="score">
      <div class="score-l">
        <h3 class="score-h">${svgIcon('iucn', 15)}<span class="zh">圖鑑評分</span><span class="en en-h">Dex rating</span>
          <em class="zh">自訂指標，非學術評分</em><em class="en en-h">custom index</em></h3>
        <ul class="dims">
          ${SCORE_DIMS.map((dim) => {
            const v = d.score ? (d.score as unknown as Record<string, number | undefined>)[dim.k] : undefined;
            const pct = v == null ? 0 : Math.max(4, Math.round((v / 5) * 100));
            return `<li class="dim${v == null ? ' dim-miss' : ''}">
              <span class="dim-n">${svgIcon(dim.icon, 14)}<span class="zh">${dim.zh}</span><span class="en en-h">${dim.en}</span></span>
              <span class="dim-bar"><i style="width:${pct}%"></i></span>
              <span class="dim-v">${v == null ? '—' : v.toFixed(1)}</span>
            </li>`;
          }).join('')}
        </ul>
      </div>
      <div class="score-r">
        <span class="poke">${POKEBALL_SVG}</span>
        <b class="o-v">${d.score?.o == null ? '—' : d.score.o.toFixed(1)}</b>
        <span class="o-max">/ 5</span>
      </div>
    </section>

    <!-- ⑥ 底欄：編號帶 + 可追溯出處 -->
    <footer class="foot">
      <span class="foot-no">NO.${id4}</span>
      <span class="foot-name">${esc(d.zhName)} <em>${esc(d.sciName)}</em></span>
      <span class="foot-src mono">${esc(d.sources || d.source || PENDING_ZH)}</span>
      <span class="foot-ver mono">${esc(d.version || 'v1.9.0')}</span>
    </footer>
  </div>
</div>`;
}

/** 四格小卡：圖示 + 標題 + 3 點（原文，不刪字） */
function miniPane(iconId: string, zhT: string, enT: string, zhV?: string | string[], enV?: string | string[]): string {
  const zhText = para(zhV);
  const enText = para(enV);
  return `<div class="pane mini">
    <h3 class="pane-h">${svgIcon(iconId, 16)}<span class="zh">${esc(zhT)}</span><span class="en en-h">${esc(enT)}</span></h3>
    <span class="mini-wm" aria-hidden="true">${svgIcon(iconId, 76)}</span>
    ${bi(zhText, enText, ROW4_H, (LAYOUT.cardW - 2 * 26 - 3 * 14) / 4)}
  </div>`;
}

/** IUCN 級別：五級中其中一級，用色點 + 中英名 */
function iucnChip(raw?: string): string {
  const idx = iucnIndex(raw);
  if (idx < 0) return `<span class="stat-v small t-miss">${PENDING_ZH}</span>`;
  const l = IUCN_LEVELS[idx];
  return `<span class="stat-v iucn-v" style="--lc:${l.color}"><i></i><span class="zh">${l.zh}</span><span class="en en-h">${l.code}</span></span>`;
}

/** 卡面樣式：海報式，不是一排方格 */
export const DEX_CARD_CSS = `
.dx{
  --c:#17553c;--t:#f3f7f1;--a:#d8a21c;
  position:relative;width:1200px;height:1600px;box-sizing:border-box;overflow:hidden;
  background:var(--t);color:#16211c;
  font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei","Hiragino Sans",system-ui,sans-serif;
  font-size:15px;line-height:1.42;
}
.dx *{box-sizing:border-box;margin:0;padding:0}
.dx .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.dx .en{font-family:"Helvetica Neue",Arial,system-ui,sans-serif}
.dx .t-miss{color:#8d8d86;font-style:italic}
.dx .ic{display:inline-block;flex:0 0 auto;vertical-align:middle}

/* 整張卡是一張「海報」：主圖出血、其餘留白呼吸 */
.dx .sheet{display:flex;flex-direction:column;height:100%;padding:0 0 0 0}

/* ---------- ① 主圖 ---------- */
.dx .poster{position:relative;height:${POSTER_H + 90}px;flex:0 0 ${POSTER_H + 90}px;overflow:hidden;
  background:var(--c);color:#fff}
.dx .poster-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  object-position:50% 38%;image-rendering:auto}
.dx .poster-miss{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font:700 40px ui-monospace,monospace;opacity:.35}
/* 由下往上的暗幕：文字一定讀得到，同時保留插畫 */
.dx .poster-veil{position:absolute;inset:0;
  background:linear-gradient(to top,
    color-mix(in srgb, var(--c) 94%, black) 0%,
    color-mix(in srgb, var(--c) 88%, black) 26%,
    color-mix(in srgb, var(--c) 55%, transparent) 52%, transparent 78%)}
.dx .poster-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;
  padding:18px 26px}
.dx .brand{display:inline-flex;align-items:center;gap:6px;font:900 12px/1 "Helvetica Neue",Arial,sans-serif;
  letter-spacing:.2em;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}
.dx .brand .pokeball{width:20px;height:20px;color:#fff}
.dx .emblem{margin-left:auto;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.94);
  color:var(--c);display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 6px rgba(0,0,0,.25)}
.dx .emblem .ic{width:26px;height:26px}
.dx .no{font:900 15px/1 ui-monospace,monospace;letter-spacing:.06em;background:rgba(255,255,255,.16);
  border:1.5px solid rgba(255,255,255,.5);border-radius:999px;padding:6px 14px}

.dx .poster-cap{position:absolute;left:0;right:0;bottom:0;padding:0 30px 24px}
.dx .name{font-size:74px;font-weight:900;line-height:1;letter-spacing:.01em;color:#fff;
  text-shadow:0 2px 14px rgba(0,0,0,.35)}
.dx .sci{font-style:italic;font-size:18px;color:rgba(255,255,255,.82);margin-top:6px;font-family:Georgia,serif}
.dx .cap-row{display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap}
.dx .en-pill{background:#fff;color:var(--c);border-radius:999px;padding:4px 16px;
  font-size:16px;font-weight:800}
.dx .htag{font-size:13px;font-weight:700;color:rgba(255,255,255,.9);
  border:1.5px solid rgba(255,255,255,.45);border-radius:999px;padding:3px 12px}
.dx .pull{margin-top:12px;font-size:15px;line-height:1.5;color:rgba(255,255,255,.94);
  border-left:4px solid var(--a);padding-left:12px;max-width:660px}

/* ---------- ② 資料帶 ---------- */
.dx .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0;
  background:#fff;border-bottom:2px solid rgba(0,0,0,.08)}
.dx .stat{padding:12px 20px;display:flex;flex-direction:column;gap:3px;
  border-right:1px solid rgba(0,0,0,.08)}
.dx .stat:last-child{border-right:none}
.dx .stat-k{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:800;
  letter-spacing:.1em;color:#7d8d85;text-transform:none}
.dx .stat-k .ic{width:14px;height:14px;color:var(--c)}
.dx .stat-v{font:900 30px/1 ui-monospace,SFMono-Regular,monospace;color:var(--c);
  display:flex;align-items:baseline;gap:3px}
.dx .stat-v em{font:600 12px/1 "Helvetica Neue",Arial,sans-serif;color:#93a099;font-style:normal}
.dx .stat-v.small{font-size:15px}
.dx .stat-o{gap:6px}
.dx .stat-o .stars{color:var(--a)}
.dx .iucn-v i{width:12px;height:12px;border-radius:50%;background:var(--lc);display:inline-block}
.dx .iucn-v .zh{font:900 22px/1 inherit;color:var(--lc)}
.dx .iucn-v .en{font:800 12px/1 "Helvetica Neue",Arial,sans-serif;color:var(--lc)}

/* ---------- 共用 pane ---------- */
.dx .row{padding:0 26px;display:flex;gap:14px}
.dx .row-2{height:${ROW2_H}px;flex:0 0 ${ROW2_H}px;padding-top:18px}
.dx .row-4{height:${ROW4_H}px;flex:0 0 ${ROW4_H}px;padding-top:16px}
.dx .pane{position:relative;background:#fff;border-radius:14px;padding:12px 14px;
  display:flex;flex-direction:column;gap:7px;overflow:hidden;
  box-shadow:0 1px 0 rgba(0,0,0,.06),inset 0 0 0 1.5px rgba(0,0,0,.06)}
.dx .pane-h{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:900;color:var(--c);
  padding-bottom:5px;border-bottom:1.5px solid rgba(0,0,0,.07);flex:0 0 auto}
.dx .pane-h .ic{width:16px;height:16px}
.dx .pane-tags{flex:1.05}
.dx .pane-meas{flex:.85}
.dx .pane-range{flex:1.1}
.dx .row-4 .pane{flex:1}
.dx .mini-wm{position:absolute;right:-10px;bottom:-12px;line-height:0;color:var(--c);opacity:.05}

/* 棲地／食性大字 */
.dx .tagblock{display:flex;align-items:flex-start;gap:8px}
.dx .tag-k{flex:0 0 26px;font-size:11px;font-weight:900;color:#96a49c;line-height:1.9}
.dx .chiprow{display:flex;flex-wrap:wrap;gap:6px;flex:1}
.dx .chip{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:800;
  padding:5px 11px 5px 7px;border-radius:999px;background:var(--c);color:#fff}
.dx .chip .chip-ic{width:17px;height:17px}
.dx .chip-miss{background:#ecece7;color:#8a8a82;font-weight:400;font-style:italic;padding:5px 11px}

/* 分類（只留目科屬種） */
.dx .taxlist.compact{list-style:none;display:flex;gap:12px;flex-wrap:wrap;margin-top:auto;
  border-top:1.5px dashed rgba(0,0,0,.1);padding-top:7px}
.dx .taxlist.compact li{display:flex;align-items:baseline;gap:4px;font-size:12px}
.dx .taxlist .k{color:#a3b0a8;font-size:11px}
.dx .taxlist .v{font-weight:800;color:#243a2f}
.dx .taxlist .v em{font-style:italic;font-weight:400;color:#8d9c94;font-size:10px;margin-left:4px}

/* 量度 */
.dx .mbs{list-style:none;display:flex;flex-direction:column;gap:8px}
.dx .mb{display:flex;align-items:center;gap:8px;font-size:12px}
.dx .mb-n{flex:0 0 56px;color:#4a6057;font-weight:800}
.dx .mb-t{flex:1;height:8px;border-radius:999px;background:rgba(0,0,0,.07);overflow:hidden}
.dx .mb-t i{display:block;height:100%;background:var(--c);border-radius:999px}
.dx .mb-v{flex:0 0 52px;text-align:right;font:800 11.5px/1 ui-monospace,monospace;color:#3d5449}
.dx .mb-v em{font-style:normal;font-size:9px;opacity:.55;margin-left:2px}
.dx .meas-src{margin-top:auto;font-size:8.5px;color:#a8b2ac;letter-spacing:.06em}

/* 分佈 */
.dx .range-wrap{border-radius:10px;overflow:hidden;background:#e9efea;border:1px solid rgba(0,0,0,.07)}
.dx .rangesvg{display:block;width:100%;height:auto}
.dx .rangesvg .land{fill:#c6d4ca}
.dx .rangesvg .pin circle{fill:#fff;stroke:var(--c);stroke-width:2}
.dx .rangesvg .pin .core{fill:var(--a);stroke:none}
.dx .rangesvg .pin text{font-size:10px;fill:#3d4b44;font-weight:700;text-anchor:middle;
  paint-order:stroke;stroke:#fff;stroke-width:3px}

/* 正文：列點 */
.dx .bl{list-style:none;display:flex;flex-direction:column;gap:2px}
.dx .bl li{position:relative;padding-left:9px}
.dx .bl li::before{content:"";position:absolute;left:0;top:.62em;width:3.5px;height:3.5px;
  border-radius:50%;background:var(--c);opacity:.55}
.dx .t-zh{font-size:13.5px;line-height:1.5;color:#1d2b25}
.dx .t-en{font-size:11px;line-height:1.44;color:#6b7d75}
.dx .stars{display:inline-flex;gap:1px;align-items:center}

/* ---------- ⑤ 評分 ---------- */
.dx .score{margin:18px 26px 0;height:${SCORE_H}px;flex:0 0 ${SCORE_H}px;display:flex;
  background:var(--c);color:#fff;border-radius:16px;padding:12px 18px;gap:16px}
.dx .score-l{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}
.dx .score-h{display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:900;color:#fff}
.dx .score-h .ic{width:15px;height:15px}
.dx .score-h em{font-style:normal;font-size:9.5px;font-weight:500;color:rgba(255,255,255,.55)}
.dx .dims{list-style:none;display:flex;flex-direction:column;gap:4px}
.dx .dim{display:flex;align-items:center;gap:8px}
.dx .dim-n{flex:0 0 118px;display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:800;
  color:rgba(255,255,255,.9)}
.dx .dim-n .ic{width:13px;height:13px;opacity:.8}
.dx .dim-bar{flex:1;height:9px;border-radius:999px;background:rgba(255,255,255,.18);overflow:hidden}
.dx .dim-bar i{display:block;height:100%;border-radius:999px;background:var(--a)}
.dx .dim-v{flex:0 0 30px;text-align:right;font:900 12px/1 ui-monospace,monospace;color:#fff}
.dx .dim-miss .dim-n,.dx .dim-miss .dim-v{opacity:.4}
.dx .score-r{flex:0 0 130px;display:flex;align-items:center;justify-content:center;gap:2px;
  border-left:1.5px dashed rgba(255,255,255,.28)}
.dx .poke{width:40px;height:40px;color:#fff;flex:0 0 auto;margin-right:4px}
.dx .poke .pokeball{width:100%;height:100%}
.dx .o-v{font:900 46px/1 ui-monospace,SFMono-Regular,monospace;color:#fff}
.dx .o-max{font-size:13px;color:rgba(255,255,255,.6);align-self:flex-end;padding-bottom:8px}

/* ---------- ⑥ 底欄 ---------- */
.dx .foot{margin-top:auto;height:78px;flex:0 0 78px;display:flex;align-items:center;gap:14px;
  padding:0 26px;background:#12271f;color:rgba(255,255,255,.72)}
.dx .foot-no{font:900 13px/1 ui-monospace,monospace;color:var(--a);letter-spacing:.06em}
.dx .foot-name{font-size:12px;font-weight:700;color:#fff}
.dx .foot-name em{font-style:italic;font-weight:400;opacity:.6;margin-left:4px}
.dx .foot-src{flex:1;font-size:7.5px;line-height:1.3;opacity:.55;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dx .foot-ver{font-size:9px;opacity:.5;letter-spacing:.1em}

/* ---------- 語言切換：中欄只放中文、英欄只放英文 ---------- */
.dx.lang-zh .en{display:none!important}
.dx.lang-en .zh{display:none!important}
.dx.lang-en .name{font-size:44px;line-height:1.08}
.dx.lang-en .pull{font-size:13px;max-width:600px}
.dx.lang-en .t-zh{display:none}
.dx.lang-en .t-en{font-size:13px;line-height:1.5;color:#26382f}
.dx.lang-en .taxlist .k{display:none}
`;

export const DEX_CARD_PRINT_CSS = `
@media print{
  @page{size:1200px 1600px;margin:0}
  html,body{margin:0;padding:0;background:#fff}
}
`;
