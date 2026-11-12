import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/** build 完把 dist/sw.js 裡的 __BUILD_ID__ 換成這次部署的 commit／時間，令每次部署的 sw.js 內容都不同。 */
function stampServiceWorker() {
  return {
    name: 'stamp-service-worker',
    apply: 'build' as const,
    closeBundle() {
      const f = resolve('dist/sw.js')
      if (!existsSync(f)) return
      const id = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '').slice(0, 8) || 'b' + Date.now().toString(36)
      writeFileSync(f, readFileSync(f, 'utf8').replace(/__BUILD_ID__/g, id))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss(), stampServiceWorker()];
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
    // 預覽／雲端 IDE 會用自己嘅域名（例如 xxxx.e2b.app）轉發 dev server，
    // 唔加 allowedHosts 會被 Vite 的 host 檢查擋成 403。
    // 只影響 `npm run dev`，生產部署（dist 靜態檔）不受影響。
    server: {
      host: true as const,
      // 預覽域名會變（每次 sandbox 都唔同），所以用 true 全部放行
      allowedHosts: true as const,
    },
    preview: {
      host: true as const,
      allowedHosts: true as const,
    },
    build: {
      // @tensorflow/tfjs 是刻意做的 lazy chunk（動態 import，首次聽聲辨雀才載入，
      // ~1.1MB min / ~284KB gzip），超過 Vite 預設 500kB 警戒線屬預期行為
      chunkSizeWarningLimit: 1200,
    },
  };
})
