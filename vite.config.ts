import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  try {
    // .vite-source-tags.js 是預覽環境才會注入的可選 plugin（可能不存在），
    // 所以必須用 @ts-ignore（@ts-expect-error 在檔案存在時反而報錯）
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- optional injected plugin, may not exist
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch { /* 可選 plugin 不存在 → 正常情況，靜默略過 */ }
  return {
    plugins,
    build: {
      // @tensorflow/tfjs 是刻意做的 lazy chunk（動態 import，首次聽聲辨雀才載入，
      // ~1.1MB min / ~284KB gzip），超過 Vite 預設 500kB 警戒線屬預期行為
      chunkSizeWarningLimit: 1200,
    },
  };
})
