# 更新紀錄（CHANGELOG）

格式依 `readme` 的 V1 雙版號規範：版號同內文一齊改。

## v1.6.0 — 2026-11-04（圖卡修復 + 對標 readme 規範）

### 修復
- **首頁／圖鑑的封面圖全部 load 唔出**：
  - `BirdCard` 用 `loading="lazy"` 加上 `display:none` 造成死鎖（圖片永遠不載入），已移除。
  - 首頁一次過 render 569 張卡會打爆 `r2.dev` 速率限制，改為每批 48 張＋「載入更多」。
  - 圖卡載入改為全域排隊：併發上限 6、逐個副檔名試（avif → webp → jpg → jpeg → png）、超時重試。
  - 直連 R2 失敗自動 fallback 至 `/api/card` 代理（Vercel 邊緣快取一年）。
  - 佔位圖路徑 `/images/NNNN.png`（必定 404）已移除。
  - `TOTAL_SLOTS` 兩處不一致（569 / 1500）已統一由 `birds.json` 長度決定。
- **科研中心六個連結查無此鳥**：改用英文俗名（新增 `en` 欄位，來源 `BIRD_ID_MAPPING.csv`）。
- 版本號三處不一致（1.4 / 1.5 / 1.5）已統一為 `APP_VERSION = v1.6.0`。

### 新增
- `src/config.ts`：單一設定入口（版本、R2 網域、副檔名、批次大小、併發數）。
- `src/lib/cardImage.ts` + `src/hooks/useCardImage.ts` + `useCardStats.ts`：圖卡載入器與進度統計。
- `src/components/CardLoadDiagnostics.tsx`：全部圖卡失敗時自動顯示原因與一鍵重新探測。
- `api/card.js`：圖卡代理（fail closed 白名單 + 長快取）。
- `scripts/probe-cards.mjs`（`npm run cards:probe`）：R2 圖卡體檢、缺圖清單、可選 manifest。
- `scripts/merge-english-names.mjs`（`npm run names:merge`）：CSV 英文名併入 `birds.json`。
- `tests/cardImage.test.mjs`（`npm run test:cards`）：4 個測試鎖住併發、副檔名 fallback、錯誤分類、代理。
- `public/icons/` 9 個圖標（16／32／48／180／192／512／maskable 192／maskable 512／og-image 1200×630）
  ＋ `public/manifest.webmanifest`（可加到主畫面）。
- `index.html`：favicon 5 條 link、og/twitter meta、`theme-color`、`lang="zh-Hant-HK"`。
- `docs/APP_REVIEW.md`：對照 `readme` 五大鐵律＋G11 的健檢報告與改進清單。
- `.env.example`：可選環境變數說明。

### 改善
- 頁首新增「已解鎖圖卡 n 張」「⚠ n 失敗」「重新掃描」「只看有圖」。
- 未有自家圖卡時，圖鑑機提供「睇真身 · GOOGLE 圖」「物種頁 · eBIRD」。
- 搜尋支援中文名／英文名／學名。
- 移除假的 300ms 載入延遲。
- `vite.config.ts` 開放 `allowedHosts`，雲端 IDE／預覽域名不再 403。

### 已知未做（見 `docs/APP_REVIEW.md` 第四節）
- R2 上 0022 起大量圖片仍未上傳（`npm run cards:probe` 可列出清單）。
- `/api/analyze`、`/api/ebird` 未加 origin 白名單／body 上限。
- `readme` 起手包（guard／final_check／LICENSE／AGENTS.md）未引入。

## v1.5.0 — 2026-09
- 瘦身：移除 5.1MB 死重、依賴極簡化、Vercel 防增肥配置（PR #3）。

## v1.4.0 — 2026-08
- 版權標示改為 Scout System；加入 Vercel Web Analytics（PR #1／#2／#4）。
