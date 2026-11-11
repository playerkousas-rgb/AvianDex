/**
 * 圖鑑資訊卡的 PNG 匯出。
 *
 * ⚠️ 用 SVG foreignObject 自己畫（與 tools/card-studio 同一條路）：
 *    · 不需要任何外部截圖庫
 *    · 卡面的插畫是 <img src> 跨網域（r2.dev），所以先 fetch 成 data URI 再內嵌，
 *      否則 canvas 會被 taint，toBlob 直接拋錯。
 *    · 插畫拿不到就照樣出卡，只是那格會印「資料待查」，不會偷偷畫一隻假鳥。
 */
import { renderDexCard, DEX_CARD_CSS } from './dexCardLayout';
import type { DexCardInput } from './dexCard';

export async function exportDexCardPng(
  data: DexCardInput,
  opts: { lang?: 'both' | 'zh' | 'en'; scale?: number } = {},
): Promise<Blob> {
  const scale = opts.scale ?? 2;
  const W = 1200;
  const H = 1600;

  /* 1. 插畫轉 data URI（失敗就留 null，卡面自然顯示佔位） */
  let art = data.artUrl;
  if (art) {
    try {
      const res = await fetch(art, { mode: 'cors', referrerPolicy: 'no-referrer' });
      if (res.ok) {
        const blob = await res.blob();
        art = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.onerror = () => reject(new Error('read fail'));
          fr.readAsDataURL(blob);
        });
      } else {
        art = null;
      }
    } catch {
      art = null;
    }
  }

  /* 2. 用同一份 renderer 砌卡（插畫換成 data URI） */
  const html = renderDexCard({ ...data, artUrl: art ?? null }, { lang: opts.lang ?? 'both' })
    .replace(/ referrerpolicy="no-referrer"/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <style>${DEX_CARD_CSS}</style>
        ${html}
      </div>
    </foreignObject>
  </svg>`;

  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  /* 3. 畫上 canvas → PNG */
  const img = new Image();
  img.decoding = 'sync';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('SVG 轉圖失敗'));
    img.src = svgUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 不可用');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, W, H);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG 產生失敗'))), 'image/png');
  });
}

/** 觸發瀏覽器下載（iOS Safari 會開新分頁／存到檔案，這是平台限制） */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
