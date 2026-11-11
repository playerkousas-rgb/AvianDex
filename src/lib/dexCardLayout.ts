/**
 * 卡面砌版：DexCardInput → 1200×1600 的 HTML。
 *
 * 版式固定（絕對尺寸，不隨螢幕縮放），因為它同時是下載 PNG 的尺寸：
 * 螢幕上看到的，就是印出來／存下來的那一張。
 *
 * 高度預算（總高 1600，一定要對得住，否則印出來會爛尾）：
 *   上下 padding      34 × 2 = 68
 *   6 個區塊，5 條 gap 18 × 5 = 90
 *   標題帶 216 + 上段 432 + 中段一 262 + 中段二 264 + 評分 164 + 底欄 104 = 1442
 *   68 + 90 + 1442 = 1600 ✔
 *
 * 12 個可能出現的資料欄位分配如下（冇位放的欄位唔會硬塞，寧願少一格）：
 *   左欄  分類資訊、名稱由來
 *   主圖  插畫（BIRD-DEX 2）
 *   右欄  量度、棲息環境、食物／遷徙
 *   中段一 分佈地區、外形特徵、食物詳述、棲息詳述
 *   中段二 成長與繁殖、行為特徵、有趣小知識、鳴聲與保育
 *
 * 冇數據一律印「資料待查／Data pending」，不寫字充數、不機翻、不用中文頂英文。
 */

import {
  type DexCardInput, type OrderTheme, orderTheme, SCORE_DIMS,
  PENDING_ZH, PENDING_EN, esc, para,
} from './dexCard';

/** IUCN 級別 → 中英對照 + 顏色。只認已核實的級別字串，不推測。 */
const IUCN_ROWS: Array<{ zh: string; en: string; code: string; fg: string; bg: string }> = [
  { zh: '滅絕', en: 'Extinct', code: 'EX', fg: '#5c1216', bg: '#f2dcdd' },
  { zh: '野外滅絕', en: 'Extinct in the Wild', code: 'EW', fg: '#5c1216', bg: '#f2dcdd' },
  { zh: '極危', en: 'Critically Endangered', code: 'CR', fg: '#7a1418', bg: '#f7dede' },
  { zh: '瀕危', en: 'Endangered', code: 'EN', fg: '#8f2a12', bg: '#fbe5dc' },
  { zh: '易危', en: 'Vulnerable', code: 'VU', fg: '#8a5a08', bg: '#fbf0d6' },
  { zh: '近危', en: 'Near Threatened', code: 'NT', fg: '#6b6413', bg: '#f5f5d8' },
  { zh: '無危', en: 'Least Concern', code: 'LC', fg: '#1c5c3c', bg: '#e2f1e7' },
  { zh: '數據缺乏', en: 'Data Deficient', code: 'DD', fg: '#4a4a4a', bg: '#ededed' },
];

function iucnMatch(raw: string | undefined) {
  if (!raw) return null;
  const s = String(raw);
  for (const r of IUCN_ROWS) {
    if (s.includes(r.zh) || new RegExp(`\\b${r.code}\\b`).test(s)) return r;
  }
  return null;
}

/**
 * 收到句號為止。
 *
 * 卡面空間固定，長段落一定要收。**不可以 CSS line-clamp 硬切** ——
 * 切一半會出現「…後來牠們」這種斷句，讀起來像壞掉。
 * 所以按字數預算，退到最近的句末標點才收；真的一個標點都冇才加省略號。
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

/* ------------------------------------------------------------------
 * 版面幾何：所有高度／寬度只在這裡寫一次。
 *
 * 之前是「先砌卡，再憑肉眼估字數」，結果 569 隻之中長文的那批一定爆格。
 * 現在反過來：先定死每格可用高度，再由幾何算出可以放幾個字，
 * 所以任何一隻雀都收得入格，而且不會把句子斬一半（fit() 會退到句末）。
 * ------------------------------------------------------------------ */
export const LAYOUT = {
  cardW: 1200,
  cardH: 1600,
  pad: 34,
  gap: 18,
  hdr: 216,
  bandA: 432,
  bandB: 262,
  bandC: 264,
  score: 164,
  foot: 104,
  /* 上段三欄 */
  colL: 296,
  colR: 322,
  taxPanel: 206,      // 分類資訊（七行固定）
  /* 小卡內距與標題 */
  panelPadX: 15,
  panelPadY: 12,
  panelHead: 30,      // 標題 + 底線
  /* 文字行高 */
  zhSize: 14,
  zhLine: 21.3,
  enSize: 11.5,
  enLine: 16.8,
  /** 英文平均字寬（11.5px Helvetica 大約 5.8px；用平均數算行數夠準） */
  enCharW: 5.8,
} as const;

/** 某格小卡「文字區」實際可用高度 */
export function bodyHeight(panelH: number): number {
  return panelH - LAYOUT.panelPadY * 2 - LAYOUT.panelHead - 7;
}

/** 某格小卡「文字區」實際可用寬度 */
export function bodyWidth(panelW: number): number {
  return panelW - LAYOUT.panelPadX * 2;
}

/**
 * 依可用空間算出中英各可放幾個字。
 * 中文分 55%、英文 45% 高度（中文是主體，但英文段落平均較長）。
 * 缺其中一種語言時，另一種吃掉全部高度。
 */
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

/** 小卡：中英雙標題 */
function panel(
  titleZh: string,
  titleEn: string,
  body: string,
  opts: { icon?: string; flex?: string; h?: number } = {},
): string {
  const style = opts.h ? ` style="flex:0 0 ${opts.h}px;height:${opts.h}px"` : opts.flex ? ` style="flex:${opts.flex}"` : '';
  return `
  <section class="pnl"${style}>
    <h3 class="pnl-h"><span class="pnl-i">${opts.icon || ''}</span><span class="zh">${esc(titleZh)}</span><span class="en en-h">${esc(titleEn)}</span></h3>
    <div class="pnl-b">${body}</div>
  </section>`;
}

/**
 * 中英兩段：中欄只放中文、英欄只放英文。缺 → 各自的「待查」，互不頂替。
 * 字數上限由幾何算出（panelH × panelW），所以同一格在任何一隻雀身上都不會爆。
 */
function bi(zh: string, en: string, panelH: number, panelW: number): string {
  const b = textBudget(panelH, panelW, !!zh, !!en);
  const z = zh ? `<p class="t-zh">${fit(zh, b.zhMax)}</p>`
               : `<p class="t-zh t-miss">${PENDING_ZH}</p>`;
  const e = en ? `<p class="t-en">${fit(en, b.enMax)}</p>`
               : `<p class="t-en t-miss">${PENDING_EN}</p>`;
  return z + e;
}

function chips(list: string[], empty: string, cls = ''): string {
  if (!list.length) return `<span class="chip chip-miss">${esc(empty)}</span>`;
  return list.map((t) => `<span class="chip ${cls}">${esc(t)}</span>`).join('');
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
  const any = vals.some((v) => v > 0);
  if (!any) {
    return `<p class="t-zh t-miss">${PENDING_ZH}</p><p class="t-en t-miss">${PENDING_EN}</p>`;
  }
  return `<ul class="mbs">${defs.map(([, zh, en], i) => {
    const v = vals[i];
    const pct = v ? Math.max(5, Math.round((v / max) * 100)) : 0;
    return `<li class="mb">
        <span class="mb-n"><span class="zh">${zh}</span><span class="en en-h">${en}</span></span>
        <span class="mb-t"><i style="width:${pct}%"></i></span>
        <span class="mb-v">${v ? `${v} mm` : '—'}</span>
      </li>`;
  }).join('')}</ul>`;
}

export interface RenderOpts {
  /** 'both' 同時顯示中英（預設）；'zh'／'en' 只顯示一種 */
  lang?: 'both' | 'zh' | 'en';
  extraClass?: string;
}

/** 中段四格每格寬（1200 − 左右內距 − 三條 gap，再除以四） */
const BAND_PANEL_W = (LAYOUT.cardW - LAYOUT.pad * 2 - LAYOUT.gap * 3) / 4;

export function renderDexCard(d: DexCardInput, opts: RenderOpts = {}): string {
  const lang = opts.lang ?? 'both';
  const th: OrderTheme = orderTheme(d.orderLatin);
  const zh = d.zh || {};
  const en = d.en || {};
  const iucnRaw = (zh.iucn as string) || (en.iucn as string);
  const iucn = iucnMatch(iucnRaw);

  const lenText = d.lengthCm > 0
    ? `${d.lengthEstimated ? '約 ' : ''}${d.lengthCm} cm`
    : '';
  const massText = d.mass ? `${d.mass} g` : '';

  /* 分類階梯：界門綱固定不變；目／科由 eBird/Clements 提供（香港慣用中文名由 taxonomyZh 提供）；
     屬／種由已核實的學名拆出。每一層都寫得出處，所以不是憑感覺填的。 */
  const sciParts = (d.sciName || '').trim().split(/\s+/);
  const genus = sciParts[0] || '';
  const species = sciParts.slice(0, 2).join(' ');
  const taxRows: Array<[string, string]> = [
    ['界', '動物界 Animalia'],
    ['門', '脊索動物門 Chordata'],
    ['綱', '鳥綱 Aves'],
    ['目', `${d.orderZh} ${d.orderLatin}`],
    ['科', `${d.familyZh} ${d.familyLatin}`],
    ['屬', genus],
    ['種', `${d.zhName} ${species}`],
  ];

  const id4 = d.id.padStart(4, '0');
  /* 英文維基多數物種冇獨立「外形」一節 → 冇就留 Data pending，不用中文頂、不機翻 */
  const enLook = para(en.look);

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
    </div>

    <div class="hdr-r">
      <div class="taxline">
        <span class="tag-ord"><span class="zh">${esc(d.orderZh)}</span><em>${esc(d.orderLatin)}</em></span>
        <span class="tag-fam"><span class="zh">${esc(d.familyZh)}</span><em>${esc(d.familyLatin)}</em></span>
      </div>
      ${iucn
        ? `<div class="iucn" style="color:${iucn.fg};background:${iucn.bg}">
             <span class="iucn-k">IUCN</span>
             <span class="zh">${esc(iucn.zh)} ${iucn.code}</span>
             <span class="en en-h">${esc(iucn.en)} ${iucn.code}</span>
           </div>`
        : `<div class="iucn iucn-miss"><span class="iucn-k">IUCN</span><span class="zh">${PENDING_ZH}</span><span class="en en-h">${PENDING_EN}</span></div>`}
      <div class="quick">
        <div class="q">
          <span class="q-k zh">身長</span><span class="q-k en en-h">Length</span>
          <span class="q-v">${lenText || '—'}</span>
        </div>
        <div class="q">
          <span class="q-k zh">體重</span><span class="q-k en en-h">Mass</span>
          <span class="q-v">${massText || '—'}</span>
        </div>
      </div>
    </div>
  </header>

  <!-- ───────── 上段：左欄 + 主插畫 + 右欄 ───────── -->
  <section class="band band-a">
    <div class="col-l">
      ${panel('分類資訊', 'Taxonomy',
        `<ul class="taxlist">${taxRows.map(([k, v]) => `<li><span class="k">${k}</span><span class="v">${esc(v)}</span></li>`).join('')}</ul>`,
        { icon: '◈', h: LAYOUT.taxPanel })}
      ${panel('名稱由來', 'Name origin',
        bi(para(zh.etymology), para(en.etymology), LAYOUT.bandA - LAYOUT.gap - LAYOUT.taxPanel, LAYOUT.colL),
        { icon: '✦' })}
    </div>

    <figure class="hero">
      ${d.artUrl
        ? `<img src="${esc(d.artUrl)}" alt="${esc(d.zhName)}" referrerpolicy="no-referrer" />`
        : `<div class="hero-miss"><b>NO.${id4}</b><small>${PENDING_ZH}<br>${PENDING_EN}</small></div>`}
      <figcaption>插畫：BIRD-DEX 2 · Artwork: BIRD-DEX 2</figcaption>
    </figure>

    <div class="col-r">
      ${panel('量度', 'Measurements', measureBars(d.meas || {}), { icon: '▤', flex: '1.25' })}
      ${panel('棲息環境', 'Habitat',
        `<div class="chiprow">${chips(d.habitatZh, PENDING_ZH, 'chip-h')}</div>
         <p class="t-en en en-h chiprow-en">${esc(d.habitatEn.join(' · ')) || PENDING_EN}</p>`,
        { icon: '▣' })}
      ${panel('食物', 'Diet',
        `<div class="chiprow">${chips(d.dietZh, PENDING_ZH, 'chip-d')}</div>
         <p class="t-en en en-h chiprow-en">${esc(d.dietEn.join(' · ')) || PENDING_EN}</p>`,
        { icon: '●' })}
    </div>
  </section>

  <!-- ───────── 中段一 ───────── -->
  <section class="band band-b">
    ${panel('分佈地區', 'Range', bi(para(zh.range), para(en.range), LAYOUT.bandB, BAND_PANEL_W), { icon: '◉' })}
    ${panel('外形特徵', 'Appearance', bi(para(zh.look), enLook, LAYOUT.bandB, BAND_PANEL_W), { icon: '◆' })}
    ${panel('食物', 'Feeding', bi(para(zh.diet), para(en.diet), LAYOUT.bandB, BAND_PANEL_W), { icon: '●' })}
    ${panel('棲息', 'Habitat in detail', bi(para(zh.habitat), para(en.habitat), LAYOUT.bandB, BAND_PANEL_W), { icon: '▣' })}
  </section>

  <!-- ───────── 中段二 ───────── -->
  <section class="band band-c">
    ${panel('成長與繁殖', 'Breeding', bi(para(zh.breeding), para(en.breeding), LAYOUT.bandC, BAND_PANEL_W), { icon: '◈' })}
    ${panel('行為特徵', 'Behaviour', bi(para(zh.behavior), para(en.behavior), LAYOUT.bandC, BAND_PANEL_W), { icon: '◇' })}
    ${panel('有趣小知識', 'Fun fact', bi(para(zh.funFact), para(en.funFact), LAYOUT.bandC, BAND_PANEL_W), { icon: '✦' })}
    ${panel('鳴聲', 'Voice', bi(para(zh.voice), para(en.voice), LAYOUT.bandC, BAND_PANEL_W), { icon: '◐' })}
  </section>

  <!-- ───────── 評分帶 ───────── -->
  <section class="score">
    <div class="score-l">
      <h3 class="score-h">
        <span class="zh">圖鑑評分</span><span class="en en-h">Dex rating</span>
        <em class="note-zh">自訂指標，非學術評分</em><em class="note-en en-h">Custom index, not an academic rating</em>
      </h3>
      <ul class="dims">
        ${SCORE_DIMS.map((dim) => {
          const v = d.score ? (d.score as unknown as Record<string, number | undefined>)[dim.k] : undefined;
          const pct = v == null ? 0 : Math.max(3, Math.round((v / 5) * 100));
          return `<li class="dim${v == null ? ' dim-miss' : ''}">
            <span class="dim-n"><span class="zh">${dim.zh}</span><span class="en en-h">${dim.en}</span>
              <em class="dim-from">${esc(dim.from)}</em></span>
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
      <span class="f-v small mono">${esc(d.source || PENDING_ZH)}</span>
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
.dx .t-miss{color:#9a9a92;font-style:italic}

/* ---------- 標題帶 ---------- */
.dx .hdr{
  display:grid;grid-template-columns:196px 1fr 352px;gap:20px;align-items:start;
  height:216px;flex:0 0 216px;
  background:#fff;border:2px solid var(--c);border-radius:22px;padding:18px 22px;
}
.dx .hdr-l{display:flex;flex-direction:column;align-items:center;gap:10px}
.dx .chip-art{width:136px;height:136px;object-fit:cover;border-radius:14px;border:2px solid var(--c);
  background:#0e0d0b;image-rendering:pixelated}
.dx .chip-art.chip-miss{display:flex;align-items:center;justify-content:center;color:#fff;
  font:700 13px ui-monospace,monospace;background:#2a2a26}
.dx .no-pill{background:var(--c);color:#fff;font-weight:900;font-size:18px;letter-spacing:.04em;
  padding:5px 18px;border-radius:999px;font-family:ui-monospace,SFMono-Regular,monospace}
.dx .hdr-c{padding-top:4px;min-width:0}
.dx .name{font-size:58px;font-weight:900;line-height:1.04;letter-spacing:.02em;color:#111}
.dx .sci{font-style:italic;font-size:19px;color:#4a5c54;margin-top:7px;font-family:Georgia,serif}
.dx .en-pill{display:inline-block;margin-top:10px;background:var(--c);color:#fff;border-radius:999px;
  padding:4px 16px;font-size:17px;font-weight:700}
.dx .hdr-r{display:flex;flex-direction:column;gap:7px}
.dx .taxline{display:flex;flex-direction:column;gap:5px}
.dx .tag-ord,.dx .tag-fam{border-radius:8px;padding:5px 10px;font-size:14px;font-weight:700;
  display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.dx .tag-ord{background:var(--c);color:#fff}
.dx .tag-fam{color:var(--c);border:1.5px solid var(--c);background:#fff}
.dx .tag-ord em,.dx .tag-fam em{font-style:normal;font-weight:400;opacity:.75;
  font-family:"Helvetica Neue",Arial,sans-serif;font-size:11.5px}
.dx .iucn{display:flex;align-items:center;gap:8px;border-radius:8px;padding:6px 10px;
  font-weight:800;font-size:14px}
.dx .iucn-k{font-size:9.5px;letter-spacing:.16em;opacity:.7;font-family:"Helvetica Neue",Arial,sans-serif}
.dx .iucn-miss{background:#ededed;color:#555}
.dx .quick{display:flex;gap:8px}
.dx .q{flex:1;background:rgba(0,0,0,.045);border-radius:8px;padding:5px 10px;
  display:flex;flex-direction:column;gap:1px}
.dx .q-k{font-size:10.5px;color:#5b6b63;letter-spacing:.08em}
.dx .q-v{font-weight:800;font-size:16px;color:#16231e;
  font-family:ui-monospace,SFMono-Regular,monospace}

/* ---------- 區塊 ---------- */
.dx .band{display:flex;gap:18px;flex:0 0 auto}
.dx .band-a{height:432px}
.dx .col-l{width:296px;display:flex;flex-direction:column;gap:18px}
.dx .col-r{width:322px;display:flex;flex-direction:column;gap:14px}
.dx .hero{flex:1;position:relative;border-radius:20px;overflow:hidden;border:2px solid var(--c);
  background:#0b0b09;display:flex;align-items:center;justify-content:center}
.dx .hero img{width:100%;height:100%;object-fit:contain;display:block}
.dx .hero-miss{color:#fff;display:flex;flex-direction:column;align-items:center;gap:8px;
  font-family:ui-monospace,monospace;text-align:center;opacity:.5}
.dx .hero-miss b{font-size:26px}
.dx .hero-miss small{font-size:12px;font-style:italic;line-height:1.6}
.dx .hero figcaption{position:absolute;left:0;right:0;bottom:0;padding:7px 12px;
  background:linear-gradient(transparent,rgba(0,0,0,.74));color:#fff;font-size:10.5px;
  text-align:right;letter-spacing:.03em}

/* ---------- 小卡 ---------- */
.dx .pnl{background:#fff;border:1.5px solid rgba(0,0,0,.10);border-radius:16px;padding:12px 15px;
  display:flex;flex-direction:column;gap:7px;flex:1;min-height:0;overflow:hidden}
.dx .pnl-h{display:flex;align-items:center;gap:7px;font-size:15.5px;font-weight:900;color:var(--c);
  padding-bottom:6px;border-bottom:2px solid rgba(0,0,0,.07);flex:0 0 auto}
.dx .pnl-i{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;
  border-radius:6px;background:var(--c);color:#fff;font-size:10px;flex:0 0 auto}
.dx .pnl-b{flex:1;min-height:0;display:flex;flex-direction:column;gap:5px}
.dx .t-zh{font-size:14px;line-height:1.52;color:#1d2b25}
.dx .t-en{font-size:11.5px;line-height:1.46;color:#61736b}

/* ---------- 分類階梯 ---------- */
.dx .taxlist{list-style:none;display:flex;flex-direction:column;gap:2px}
.dx .taxlist li{display:flex;gap:8px;font-size:13px;align-items:baseline}
.dx .taxlist .k{flex:0 0 20px;color:#8a9a92;text-align:center;font-size:12px}
.dx .taxlist .v{flex:1;color:#22322b;font-weight:600;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}

/* ---------- 量度 ---------- */
.dx .mbs{list-style:none;display:flex;flex-direction:column;gap:7px}
.dx .mb{display:flex;align-items:center;gap:8px;font-size:12.5px}
.dx .mb-n{flex:0 0 62px;color:#455c52;font-weight:700}
.dx .mb-t{flex:1;height:9px;border-radius:999px;background:rgba(0,0,0,.07);overflow:hidden}
.dx .mb-t i{display:block;height:100%;background:var(--c);border-radius:999px;opacity:.88}
.dx .mb-v{flex:0 0 60px;text-align:right;font-family:ui-monospace,monospace;
  font-size:11px;color:#5b6b63}

/* ---------- 標籤 ---------- */
.dx .chiprow{display:flex;flex-wrap:wrap;gap:6px}
.dx .chip{font-size:12.5px;font-weight:700;padding:3px 11px;border-radius:999px;
  background:var(--c);color:#fff}
.dx .chip-h{background:#2a6b52}
.dx .chip-d{background:#8a5a1e}
.dx .chip-miss{background:#e6e6e1;color:#8a8a82;font-weight:400;font-style:italic}
.dx .chiprow-en{font-size:11px}

/* ---------- 中段 ---------- */
.dx .band-b{height:262px}
.dx .band-c{height:264px}
.dx .band-b .pnl,.dx .band-c .pnl{width:0;flex:1 1 0}

/* ---------- 評分 ---------- */
.dx .score{height:164px;flex:0 0 164px;display:flex;gap:18px;
  background:#fff;border:2px solid var(--c);border-radius:18px;padding:12px 18px}
.dx .score-l{flex:1;display:flex;flex-direction:column;gap:8px;min-width:0}
.dx .score-h{display:flex;align-items:baseline;gap:8px;font-size:15px;font-weight:900;color:var(--c)}
.dx .score-h em{font-style:normal;font-size:10.5px;font-weight:500;color:#8a9a92}
.dx .dims{list-style:none;display:flex;flex-direction:column;gap:5px}
.dx .dim{display:flex;align-items:center;gap:8px}
.dx .dim-n{flex:0 0 296px;display:flex;align-items:baseline;gap:6px;
  font-size:12.5px;font-weight:700;color:#26382f}
.dx .dim-from{font-style:normal;font-size:9.5px;color:#9aa8a1;font-weight:400}
.dx .dim-bar{flex:1;height:10px;border-radius:999px;background:rgba(0,0,0,.07);overflow:hidden}
.dx .dim-bar i{display:block;height:100%;border-radius:999px;
  background:linear-gradient(90deg,var(--c),var(--a))}
.dx .dim-v{flex:0 0 38px;text-align:right;font-family:ui-monospace,monospace;
  font-weight:800;font-size:13px;color:var(--c)}
.dx .dim-miss .dim-n,.dx .dim-miss .dim-v{color:#a8b2ac}
.dx .score-r{flex:0 0 206px;display:flex;flex-direction:column;align-items:center;
  justify-content:space-between;border-left:1.5px dashed rgba(0,0,0,.12);padding-left:16px}
.dx .overall{display:flex;align-items:baseline;gap:5px;color:var(--c)}
.dx .o-k{font-size:11.5px;font-weight:800;letter-spacing:.1em}
.dx .o-v{font-size:46px;font-weight:900;line-height:1;
  font-family:ui-monospace,SFMono-Regular,monospace}
.dx .o-max{font-size:13px;color:#7a8a82}
.dx .bc{display:flex;align-items:flex-end;height:32px;width:100%;justify-content:center}
.dx .bc i{display:block;height:32px;background:#1b2521}

/* ---------- 底欄 ---------- */
.dx .foot{height:104px;flex:0 0 104px;display:flex;align-items:center;gap:18px;
  background:var(--c);color:#fff;border-radius:16px;padding:12px 22px}
.dx .f-col{display:flex;flex-direction:column;gap:2px;min-width:0}
.dx .f-wide{flex:1}
.dx .f-src{flex:0 0 424px;overflow:hidden}
.dx .f-k{font-size:9.5px;letter-spacing:.14em;opacity:.66}
.dx .f-v{font-size:15px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dx .f-v em{font-style:italic;font-weight:400;opacity:.85}
.dx .f-v.small{font-size:8.5px;font-weight:400;line-height:1.38;white-space:normal;opacity:.92;
  max-height:30px;overflow:hidden}

/* ---------- 語言切換：中欄只放中文、英欄只放英文 ---------- */
.dx.lang-zh .en{display:none!important}
.dx.lang-en .zh{display:none!important}
.dx.lang-en .name{font-size:42px;line-height:1.08}
.dx.lang-en .taxlist .k{display:none}
.dx.lang-en .t-zh{display:none}
.dx.lang-en .t-en{font-size:14px;line-height:1.5;color:#26382f}
`;

export const DEX_CARD_PRINT_CSS = `
@media print{
  @page{size:1200px 1600px;margin:0}
  html,body{margin:0;padding:0;background:#fff}
}
`;
