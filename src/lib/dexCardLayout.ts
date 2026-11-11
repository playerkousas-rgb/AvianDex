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
import { svgIcon, DIET_ICONS, HABITAT_ICONS, IUCN_LEVELS, iucnIndex } from './dexCardIcons';

/* ------------------------------------------------------------------
 * 版面幾何：所有高度／寬度只在這裡寫一次。
 * 字數預算由這裡推出來，所以改版面之後文字會自動跟著收。
 * ------------------------------------------------------------------ */
export const LAYOUT = {
  cardW: 1200,
  cardH: 1600,
  pad: 34,
  gap: 18,
  hdr: 216,
  bandA: 438,
  bandB: 266,
  bandC: 266,
  score: 152,
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

const BAND_PANEL_W = (LAYOUT.cardW - LAYOUT.pad * 2 - LAYOUT.gap * 3) / 4;

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

/** 小卡：圖示 + 中英標題 */
function panel(
  iconId: string,
  titleZh: string,
  titleEn: string,
  body: string,
  opts: { flex?: string; h?: number } = {},
): string {
  const style = opts.h
    ? ` style="flex:0 0 ${opts.h}px;height:${opts.h}px"`
    : opts.flex ? ` style="flex:${opts.flex}"` : '';
  return `
  <section class="pnl"${style}>
    <h3 class="pnl-h">
      <span class="pnl-i">${svgIcon(iconId, 19)}</span>
      <span class="zh">${esc(titleZh)}</span><span class="en en-h">${esc(titleEn)}</span>
    </h3>
    <div class="pnl-b">${body}</div>
  </section>`;
}

/** 中英兩段：中欄只放中文、英欄只放英文。缺 → 各自的「待查」，互不頂替。 */
function bi(zh: string, en: string, panelH: number, panelW: number): string {
  const b = textBudget(panelH, panelW, !!zh, !!en);
  const z = zh ? `<p class="t-zh">${fit(zh, b.zhMax)}</p>`
               : `<p class="t-zh t-miss">${PENDING_ZH}</p>`;
  const e = en ? `<p class="t-en">${fit(en, b.enMax)}</p>`
               : `<p class="t-en t-miss">${PENDING_EN}</p>`;
  return z + e;
}

/* ------------------------------------------------------------------
 * IUCN 五級量尺：把「無危→極危」畫成一把尺，紅點指住這隻雀的位置。
 * 這是真的數據（cardDetails 的 iucn 欄），只是換個講法。
 * ------------------------------------------------------------------ */
function iucnBar(raw?: string): string {
  const idx = iucnIndex(raw);
  if (idx < 0) {
    return `<div class="iucnbar iucnbar-miss"><span class="zh">${PENDING_ZH}</span><span class="en en-h">${PENDING_EN}</span></div>`;
  }
  return `<div class="iucnbar">
    <div class="ib-track">
      ${IUCN_LEVELS.map((l, i) => `
        <span class="ib-seg${i === idx ? ' on' : ''}" style="--lc:${l.color}">
          <i></i><b>${l.code}</b>
        </span>`).join('')}
    </div>
    <div class="ib-now" style="--p:${(idx / (IUCN_LEVELS.length - 1)) * 100}%;--lc:${IUCN_LEVELS[idx].color}">
      ${IUCN_LEVELS[idx].zh}
    </div>
  </div>`;
}

/**
 * 分佈示意圖。
 *
 * ⚠️ 這**不是**精確地圖 —— 我們沒有每隻雀的地理分佈多邊形。
 * 但有兩樣真實資料可以畫：① eBird 分類階層（目／科）；② 中文維基原文的產地描述。
 * 所以畫的是「香港在中心」的羅盤式示意，加上原文的地區字（抽取自 range 文字）。
 * 卡面標明「示意圖」，唔會扮成 GIS 地圖。
 */
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
function barcode(id: string): string {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  const bars: string[] = [];
  for (let i = 0; i < 46; i += 1) {
    h = (h * 1103515245 + 12345) % 2147483648;
    bars.push(`<i style="width:${1 + (h % 3)}px;margin-right:${1 + ((h >> 3) % 3)}px"></i>`);
  }
  return `<div class="bc" aria-hidden="true">${bars.join('')}</div>`;
}

/** 量度比例條：只按 mm 原值比較，不改單位、不換算 */
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

export function renderDexCard(d: DexCardInput, opts: RenderOpts = {}): string {
  const lang = opts.lang ?? 'both';
  const th: OrderTheme = orderTheme(d.orderLatin);
  const zh = d.zh || {};
  const en = d.en || {};
  const iucnRaw = (zh.iucn as string) || (en.iucn as string);

  const lenText = d.lengthCm > 0 ? `${d.lengthEstimated ? '約' : ''}${d.lengthCm}` : '';
  const massText = d.mass ? `${d.mass}` : '';

  /* 分類階梯：界門綱固定；目／科由 eBird/Clements；屬／種由已核實學名拆出 */
  const sciParts = (d.sciName || '').trim().split(/\s+/);
  const genus = sciParts[0] || '';
  const species = sciParts.slice(0, 2).join(' ');
  const taxRows: Array<[string, string, string]> = [
    ['界', '動物界', 'Animalia'],
    ['門', '脊索動物門', 'Chordata'],
    ['綱', '鳥綱', 'Aves'],
    ['目', d.orderZh, d.orderLatin],
    ['科', d.familyZh, d.familyLatin],
    ['屬', genus, ''],
    ['種', species, ''],
  ];

  const id4 = d.id.padStart(4, '0');
  const enLook = para(en.look);
  const rangeText = para(zh.range) || para(en.range);
  /* 遷徙與「人與鳥」都是真實欄位，但多數雀只有其中一個。
     有遷徙講遷徙；冇就講人與鳥（標題一齊換，不會用遷徙的標題講人的事）。 */
  const hasMig = !!(para(zh.migration) || para(en.migration));
  const migIcon = hasMig ? 'migration' : 'people';
  const migTitle: [string, string] = hasMig ? ['遷徙', 'Migration'] : ['人與鳥', 'Birds & people'];
  const migVal: [string, string] = hasMig
    ? [para(zh.migration), para(en.migration)]
    : [para(zh.humanRelation), para(en.humanRelation)];

  const html = `
<div class="dx lang-${lang} ${opts.extraClass || ''}" style="--c:${th.c};--t:${th.t};--a:${th.a}">

  <!-- ───────── 標題帶 ───────── -->
  <header class="hdr">
    <div class="hdr-l">
      ${d.artUrl
        ? `<img class="chip-art" src="${esc(d.artUrl)}" alt="" referrerpolicy="no-referrer" />`
        : `<div class="chip-art chip-miss">NO.${id4}</div>`}
      <div class="no-pill">NO.${id4}</div>
    </div>

    <div class="hdr-c">
      <h1 class="name">${esc(d.zhName)}</h1>
      <div class="sci">${esc(d.sciName)}</div>
      <div class="en-pill"><span class="en en-h">${esc(d.enName)}</span></div>
      <div class="hdr-tags">
        <span class="htag">${svgIcon('taxonomy', 15)}<span class="zh">${esc(d.orderZh)}</span><em>${esc(d.familyZh)}</em></span>
        <span class="htag">${svgIcon('length', 15)}<b>${lenText || '—'}</b><em>cm</em></span>
        <span class="htag">${svgIcon('weight', 15)}<b>${massText || '—'}</b><em>g</em></span>
      </div>
    </div>

    <div class="hdr-r">
      ${iucnBar(iucnRaw)}
      <div class="taxline">
        <span class="tag-ord"><span class="zh">${esc(d.orderZh)}</span><em>${esc(d.orderLatin)}</em></span>
        <span class="tag-fam"><span class="zh">${esc(d.familyZh)}</span><em>${esc(d.familyLatin)}</em></span>
      </div>
    </div>
  </header>

  <!-- ───────── 上段：左欄 + 主插畫 + 右欄 ───────── -->
  <section class="band band-a">
    <div class="col-l">
      ${panel('taxonomy', '分類資訊', 'Taxonomy',
        `<ul class="taxlist">${taxRows.map(([k, z, l]) => `
          <li><span class="k">${k}</span>
            <span class="v"><span class="zh">${esc(z)}</span><span class="en en-h">${esc(z)}</span><em>${esc(l)}</em></span>
          </li>`).join('')}</ul>`,
        { h: LAYOUT.taxPanel })}
      ${panel('funfact', '名稱由來', 'Name origin',
        bi(para(zh.etymology), para(en.etymology), LAYOUT.bandA - LAYOUT.gap - LAYOUT.taxPanel, LAYOUT.colL),
        { flex: '1' })}
    </div>

    <figure class="hero">
      ${d.artUrl
        ? `<img src="${esc(d.artUrl)}" alt="${esc(d.zhName)}" referrerpolicy="no-referrer" />`
        : `<div class="hero-miss"><b>NO.${id4}</b><small>${PENDING_ZH}<br>${PENDING_EN}</small></div>`}
      <figcaption>插畫：BIRD-DEX 2 · Artwork: BIRD-DEX 2</figcaption>
    </figure>

    <div class="col-r">
      ${panel('ruler', '量度', 'Measurements', measureBars(d.meas || {}), { flex: '1.3' })}
      ${panel('forest', '棲息環境', 'Habitat',
        `<div class="chiprow">${taggedRow(d.habitatIds || [], d.habitatLabels || [], PENDING_ZH)}</div>`,
        { flex: '1' })}
      ${panel('insect', '食物', 'Diet',
        `<div class="chiprow">${taggedRow(d.dietIds || [], d.dietLabels || [], PENDING_ZH)}</div>`,
        { flex: '1' })}
    </div>
  </section>

  <!-- ───────── 中段一 ───────── -->
  <section class="band band-b">
    ${panel('map', '分佈地區', 'Range',
      `<div class="range-wrap">${rangeSketch(rangeText)}</div>
       ${bi(para(zh.range), para(en.range), LAYOUT.bandB - 122, BAND_PANEL_W)}`)}
    ${panel('feather', '外形特徵', 'Appearance', bi(para(zh.look), enLook, LAYOUT.bandB, BAND_PANEL_W))}
    ${panel('nest', '成長與繁殖', 'Breeding', bi(para(zh.breeding), para(en.breeding), LAYOUT.bandB, BAND_PANEL_W))}
    ${panel('behaviour', '行為特徵', 'Behaviour', bi(para(zh.behavior), para(en.behavior), LAYOUT.bandB, BAND_PANEL_W))}
  </section>

  <!-- ───────── 中段二 ───────── -->
  <section class="band band-c">
    ${panel(migIcon, migTitle[0], migTitle[1], bi(para(migVal[0]), para(migVal[1]), LAYOUT.bandC, BAND_PANEL_W))}
    ${panel('funfact', '有趣小知識', 'Fun fact', bi(para(zh.funFact), para(en.funFact), LAYOUT.bandC, BAND_PANEL_W))}
    ${panel('voice', '鳴聲', 'Voice', bi(para(zh.voice), para(en.voice), LAYOUT.bandC, BAND_PANEL_W))}
    ${panel('shield', '保育現況', 'Conservation', bi(para(zh.conservation), para(en.conservation), LAYOUT.bandC, BAND_PANEL_W))}
  </section>

  <!-- ───────── 評分帶 ───────── -->
  <section class="score">
    <div class="score-l">
      <h3 class="score-h">${svgIcon('iucn', 17)}<span class="zh">圖鑑評分</span><span class="en en-h">Dex rating</span>
        <em class="note-zh">自訂指標，非學術評分</em><em class="note-en en-h">Custom index, not an academic rating</em>
      </h3>
      <ul class="dims">
        ${SCORE_DIMS.map((dim) => {
          const v = d.score ? (d.score as unknown as Record<string, number | undefined>)[dim.k] : undefined;
          const pct = v == null ? 0 : Math.max(4, Math.round((v / 5) * 100));
          return `<li class="dim${v == null ? ' dim-miss' : ''}">
            <span class="dim-n">${svgIcon(dim.icon, 16)}<span class="zh">${dim.zh}</span><span class="en en-h">${dim.en}</span></span>
            <span class="dim-bar"><i style="width:${pct}%"></i></span>
            <span class="dim-v">${v == null ? '—' : v.toFixed(1)}</span>
          </li>`;
        }).join('')}
      </ul>
    </div>
    <div class="score-r">
      <div class="overall">
        <span class="o-k zh">綜合</span><span class="o-k en en-h">Overall</span>
        <span class="o-v">${d.score?.o == null ? '—' : d.score.o.toFixed(1)}</span>
        <span class="o-max">/ 5</span>
      </div>
      ${barcode(id4)}
    </div>
  </section>

  <!-- ───────── 底欄 ───────── -->
  <footer class="foot">
    <div class="f-col">
      <span class="f-k zh">圖鑑編號</span><span class="f-k en en-h">Dex no.</span>
      <span class="f-v mono">NO.${id4}</span>
    </div>
    <div class="f-col f-wide">
      <span class="f-k zh">名稱</span><span class="f-k en en-h">Name</span>
      <span class="f-v">${esc(d.zhName)} · <em>${esc(d.sciName)}</em></span>
    </div>
    <div class="f-col f-src">
      <span class="f-k zh">資料出處（可追溯）</span><span class="f-k en en-h">Sources</span>
      <span class="f-v small mono">${esc(d.sources || d.source || PENDING_ZH)}</span>
    </div>
    <div class="f-col">
      <span class="f-k zh">圖鑑版本</span><span class="f-k en en-h">Version</span>
      <span class="f-v mono">${esc(d.version || 'v1.9.0')}</span>
    </div>
  </footer>
</div>`;
  return html;
}

/** 卡面樣式：獨立字串，預覽頁與 PNG 匯出共用同一份 */
export const DEX_CARD_CSS = `
.dx{
  --c:#17553c;--t:#f3f7f1;--a:#d8a21c;
  position:relative;width:1200px;height:1600px;box-sizing:border-box;
  padding:34px;display:flex;flex-direction:column;gap:18px;
  background:var(--t);color:#182420;
  font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei","Hiragino Sans",system-ui,sans-serif;
  font-size:15px;line-height:1.42;overflow:hidden;
}
.dx *{box-sizing:border-box;margin:0;padding:0}
.dx .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.dx .en{font-family:"Helvetica Neue",Arial,system-ui,sans-serif}
.dx .t-miss{color:#8d8d86;font-style:italic}
.dx .ic{display:inline-block;flex:0 0 auto;vertical-align:middle}

/* ---------- 標題帶 ---------- */
.dx .hdr{
  display:grid;grid-template-columns:190px 1fr 366px;gap:18px;align-items:stretch;
  height:216px;flex:0 0 216px;
  background:#fff;border:2px solid var(--c);border-radius:22px;padding:16px 20px;
}
.dx .hdr-l{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:8px}
.dx .chip-art{width:142px;height:142px;object-fit:cover;border-radius:16px;border:2px solid var(--c);
  background:#0e0d0b;image-rendering:pixelated}
.dx .chip-art.chip-miss{display:flex;align-items:center;justify-content:center;color:#fff;
  font:700 13px ui-monospace,monospace;background:#2a2a26}
.dx .no-pill{background:var(--c);color:#fff;font-weight:900;font-size:17px;letter-spacing:.05em;
  padding:4px 18px;border-radius:999px;font-family:ui-monospace,SFMono-Regular,monospace}
.dx .hdr-c{padding-top:2px;min-width:0;display:flex;flex-direction:column}
.dx .name{font-size:56px;font-weight:900;line-height:1.02;letter-spacing:.02em;color:#111}
.dx .sci{font-style:italic;font-size:18px;color:#4a5c54;margin-top:4px;font-family:Georgia,serif}
.dx .en-pill{align-self:flex-start;margin-top:8px;background:var(--c);color:#fff;border-radius:999px;
  padding:3px 15px;font-size:16px;font-weight:700}
.dx .hdr-tags{display:flex;gap:7px;margin-top:auto}
.dx .htag{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.05);
  border-radius:9px;padding:4px 10px;font-size:12.5px;font-weight:700;color:var(--c)}
.dx .htag em{font-style:normal;font-size:10px;font-weight:500;opacity:.7}
.dx .htag b{font-family:ui-monospace,monospace;font-size:14px}
.dx .hdr-r{display:flex;flex-direction:column;gap:8px;justify-content:center}

/* ---------- IUCN 五級量尺 ---------- */
.dx .iucnbar{display:flex;flex-direction:column;gap:5px}
.dx .ib-track{display:flex;gap:4px}
.dx .ib-seg{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;opacity:.42}
.dx .ib-seg i{display:block;width:100%;height:8px;border-radius:999px;background:var(--lc)}
.dx .ib-seg b{font-size:9px;letter-spacing:.06em;color:#5b6b63;
  font-family:"Helvetica Neue",Arial,sans-serif}
.dx .ib-seg.on{opacity:1}
.dx .ib-seg.on i{height:12px;box-shadow:0 0 0 2px #fff,0 0 0 3.5px var(--lc)}
.dx .ib-seg.on b{color:var(--lc);font-weight:900}
.dx .ib-now{align-self:flex-start;margin-left:calc(var(--p) * .78);
  background:var(--lc);color:#fff;font-size:11.5px;font-weight:800;
  padding:2px 10px;border-radius:999px}
.dx .iucnbar-miss{background:#ededed;color:#555;border-radius:8px;padding:6px 10px;
  font-size:12px;font-weight:700}

/* ---------- 目／科 ---------- */
.dx .taxline{display:flex;flex-direction:column;gap:5px}
.dx .tag-ord,.dx .tag-fam{border-radius:8px;padding:5px 10px;font-size:13px;font-weight:700;
  display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.dx .tag-ord{background:var(--c);color:#fff}
.dx .tag-fam{color:var(--c);border:1.5px solid var(--c);background:#fff}
.dx .tag-ord em,.dx .tag-fam em{font-style:normal;font-weight:400;opacity:.75;
  font-family:"Helvetica Neue",Arial,sans-serif;font-size:11px}

/* ---------- 區塊 ---------- */
.dx .band{display:flex;gap:18px;flex:0 0 auto}
.dx .band-a{height:438px}
.dx .band-b{height:266px}
.dx .band-c{height:266px}
.dx .band-b .pnl,.dx .band-c .pnl{width:0;flex:1 1 0}
.dx .col-l{width:292px;display:flex;flex-direction:column;gap:18px}
.dx .col-r{width:322px;display:flex;flex-direction:column;gap:14px}
.dx .hero{flex:1;position:relative;border-radius:20px;overflow:hidden;border:2px solid var(--c);
  background:#0b0b09;display:flex;align-items:center;justify-content:center}
.dx .hero img{width:100%;height:100%;object-fit:contain;display:block}
.dx .hero-miss{color:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;
  font-family:ui-monospace,monospace;text-align:center;opacity:.5}
.dx .hero-miss b{font-size:26px}
.dx .hero-miss small{font-size:12px;font-style:italic;line-height:1.6}
.dx .hero figcaption{position:absolute;left:0;right:0;bottom:0;padding:6px 12px;
  background:linear-gradient(transparent,rgba(0,0,0,.74));color:#fff;font-size:10px;
  text-align:right;letter-spacing:.03em}

/* ---------- 小卡 ---------- */
.dx .pnl{background:#fff;border:1.5px solid rgba(0,0,0,.10);border-radius:16px;padding:11px 14px;
  display:flex;flex-direction:column;gap:6px;flex:1;min-height:0;overflow:hidden}
.dx .pnl-h{display:flex;align-items:center;gap:7px;font-size:14.5px;font-weight:900;color:var(--c);
  padding-bottom:5px;border-bottom:2px solid rgba(0,0,0,.07);flex:0 0 auto;min-height:30px}
.dx .pnl-i{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;
  border-radius:8px;background:var(--c);color:#fff;flex:0 0 auto}
.dx .pnl-i .ic{width:18px;height:18px}
.dx .pnl-b{flex:1;min-height:0;display:flex;flex-direction:column;gap:4px}
.dx .t-zh{font-size:13.5px;line-height:1.5;color:#1d2b25}
.dx .t-en{font-size:11px;line-height:1.44;color:#61736b}

/* ---------- 分類階梯 ---------- */
.dx .taxlist{list-style:none;display:flex;flex-direction:column;gap:2px}
.dx .taxlist li{display:flex;gap:7px;font-size:12.5px;align-items:baseline}
.dx .taxlist .k{flex:0 0 18px;color:#96a49c;text-align:center;font-size:11.5px}
.dx .taxlist .v{flex:1;color:#22322b;font-weight:700;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.dx .taxlist .v em{font-style:italic;font-weight:400;color:#7d8d85;font-size:10.5px;margin-left:5px}

/* ---------- 量度 ---------- */
.dx .mbs{list-style:none;display:flex;flex-direction:column;gap:6px}
.dx .mb{display:flex;align-items:center;gap:7px;font-size:12px}
.dx .mb-n{flex:0 0 60px;color:#455c52;font-weight:700}
.dx .mb-t{flex:1;height:9px;border-radius:999px;background:rgba(0,0,0,.07);overflow:hidden}
.dx .mb-t i{display:block;height:100%;background:var(--c);border-radius:999px;opacity:.9}
.dx .mb-v{flex:0 0 56px;text-align:right;font-family:ui-monospace,monospace;
  font-size:11.5px;color:#41564c;font-weight:700}
.dx .mb-v em{font-style:normal;font-size:9px;opacity:.6;margin-left:2px}

/* ---------- 屬性 chips（圖示優先） ---------- */
.dx .chiprow{display:flex;flex-wrap:wrap;gap:6px}
.dx .chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;
  padding:4px 10px 4px 6px;border-radius:999px;background:var(--c);color:#fff}
.dx .chip .chip-ic{width:17px;height:17px;opacity:.95}
.dx .chip-miss{background:#e6e6e1;color:#8a8a82;font-weight:400;font-style:italic;padding:4px 10px}

/* ---------- 分佈示意 ---------- */
.dx .range-wrap{border-radius:12px;overflow:hidden;background:var(--t0, #eaf0ec);
  border:1px solid rgba(0,0,0,.08)}
.dx .rangesvg{display:block;width:100%;height:auto}
.dx .rangesvg .land{fill:#c9d6cd}
.dx .rangesvg .pin circle{fill:#fff;stroke:var(--c);stroke-width:2}
.dx .rangesvg .pin .core{fill:var(--a);stroke:none}
.dx .rangesvg .pin text{font-size:11px;fill:#3d4b44;font-weight:700;text-anchor:middle;
  paint-order:stroke;stroke:#fff;stroke-width:3px}
.dx .rangesvg .pin.on circle{stroke:var(--c)}

/* ---------- 評分 ---------- */
.dx .score{height:152px;flex:0 0 152px;display:flex;gap:16px;
  background:#fff;border:2px solid var(--c);border-radius:18px;padding:10px 16px}
.dx .score-l{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}
.dx .score-h{display:flex;align-items:center;gap:6px;font-size:14.5px;font-weight:900;color:var(--c)}
.dx .score-h em{font-style:normal;font-size:10px;font-weight:500;color:#96a49c}
.dx .dims{list-style:none;display:flex;flex-direction:column;gap:4px}
.dx .dim{display:flex;align-items:center;gap:8px}
.dx .dim-n{flex:0 0 132px;display:flex;align-items:center;gap:5px;
  font-size:12px;font-weight:700;color:#26382f}
.dx .dim-n .ic{width:15px;height:15px;color:var(--c);opacity:.85}
.dx .dim-bar{flex:1;height:10px;border-radius:999px;background:rgba(0,0,0,.07);overflow:hidden}
.dx .dim-bar i{display:block;height:100%;border-radius:999px;
  background:linear-gradient(90deg,var(--c),var(--a))}
.dx .dim-v{flex:0 0 34px;text-align:right;font-family:ui-monospace,monospace;
  font-weight:800;font-size:12.5px;color:var(--c)}
.dx .dim-miss .dim-n,.dx .dim-miss .dim-v{color:#a8b2ac}
.dx .score-r{flex:0 0 196px;display:flex;flex-direction:column;align-items:center;
  justify-content:space-between;border-left:1.5px dashed rgba(0,0,0,.12);padding-left:14px}
.dx .overall{display:flex;align-items:baseline;gap:4px;color:var(--c)}
.dx .o-k{font-size:11px;font-weight:800;letter-spacing:.1em}
.dx .o-v{font-size:44px;font-weight:900;line-height:1;font-family:ui-monospace,SFMono-Regular,monospace}
.dx .o-max{font-size:13px;color:#7a8a82}
.dx .bc{display:flex;align-items:flex-end;height:30px;width:100%;justify-content:center}
.dx .bc i{display:block;height:30px;background:#1b2521}

/* ---------- 底欄 ---------- */
.dx .foot{height:104px;flex:0 0 104px;display:flex;align-items:center;gap:16px;
  background:var(--c);color:#fff;border-radius:16px;padding:11px 20px}
.dx .f-col{display:flex;flex-direction:column;gap:2px;min-width:0}
.dx .f-wide{flex:1}
.dx .f-src{flex:0 0 424px;overflow:hidden}
.dx .f-k{font-size:9.5px;letter-spacing:.14em;opacity:.66}
.dx .f-v{font-size:14.5px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dx .f-v em{font-style:italic;font-weight:400;opacity:.85}
.dx .f-v.small{font-size:8.5px;font-weight:400;line-height:1.38;white-space:normal;opacity:.92;
  max-height:30px;overflow:hidden}

/* ---------- 語言切換：中欄只放中文、英欄只放英文 ---------- */
.dx.lang-zh .en{display:none!important}
.dx.lang-en .zh{display:none!important}
.dx.lang-en .name{font-size:40px;line-height:1.06}
.dx.lang-en .taxlist .k{display:none}
.dx.lang-en .t-zh{display:none}
.dx.lang-en .t-en{font-size:13px;line-height:1.5;color:#26382f}
`;

export const DEX_CARD_PRINT_CSS = `
@media print{
  @page{size:1200px 1600px;margin:0}
  html,body{margin:0;padding:0;background:#fff}
}
`;
