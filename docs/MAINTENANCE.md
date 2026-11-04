# 維護手冊（技術細節）

> README 講「為何存在、給誰用」；**這份文件只講「怎樣維護」**。
> 第一次接手請先讀 [README](../README.md) 與 [CARD_SOURCING](./CARD_SOURCING.md)。

---

## 1. 專案結構（會動到的部分）

| 路徑 | 是什麼 |
|---|---|
| `src/data/birds.json` | 569 個圖鑑槽位：`{ id, name(中文), en(英文) }`。**這是槽位的唯一來源** |
| `src/data/birdTaxonomy.json` | eBird/Clements 權威分類（559 張對上）：目／科／學名／speciesCode／排序號／中文目科 |
| `src/data/taxonomyZh.json` | 拉丁目／科 → 中文名對照（23 目、86 科，100% 覆蓋） |
| `src/data/cardCopy.json` | 卡面文案（每欄都要有 `source`；冇就印「資料待查」） |
| `src/config.ts` | 版號、R2 網域、副檔名、每批張數、併發數（**唯一設定入口**） |
| `src/lib/pokedexOrder.ts` | 排序與搜尋規則（有 8 個測試鎖住） |
| `cards/` | 插畫（`cards/art/`，不進 Git）與成品（`cards/out/`，不進 Git） |
| `scripts/cards/` | 圖卡生產線（見第 4 節） |
| `public/images/hub_*.jpg` | 六宮格圖示 |

---

## 2. 加一張新卡（完全不需要寫程式）

1. **插畫**：放 `cards/art/NNNN.png`（AI 只畫鳥，不要畫字）。
2. **文案**：`src/data/cardCopy.json` 加該編號，每欄附 `source`（pageid）。
3. **出圖**：`npm run cards:render -- NNNN`（資訊圖卡）或 `-- NNNN --kind bird`（簡單鳥卡）。
4. **上傳 R2**：`cards/out/info/NNNN.avif` → `aviandex/info/NNNN.avif`；
   鳥卡 → `aviandex/NNNN.avif`。（**大圖不入 repo、不入 Vercel**）
5. **名稱**：`birds.json` 加 `{ "id": "NNNN", "name": "中文名", "en": "English Name" }`，
   或改 `BIRD_ID_MAPPING.csv` 後跑 `npm run aliases`。
6. 刷新頁面即自動解鎖（一次傳很多張可按頁首「重新掃描」）。

副檔名支援 `.avif/.webp/.jpg/.png`，但**統一用 `.avif`**（體積最細）。
轉檔：<https://squoosh.app/>。

⚠️ **編號 `NO. NNNN` 永遠不變**——它就是 R2 檔名。排序只影響畫面次序。

---

## 3. 圖卡生產線

```bash
npm run cards:render -- 0289              # 資訊圖卡（1200×1600）→ cards/out/info/
npm run cards:render -- 0289 --kind bird  # 簡單鳥卡（900×1200）→ cards/out/
npm run cards:render -- --all             # cards/art/ 內全部
npm run cards:render -- 0289 --layout grid  # 舊格仔版（只作對照，不是預設）

npm run test:copy        # 卡面文案檢查：長度／簡體字／有無 source／IUCN 寫法
npm test                 # 全部測試
npm run lint
```

| | 鳥卡（簡單） | 資訊圖卡 |
|---|---|---|
| 用途 | 收藏、收集進度 | 吸引入門（一圖看清） |
| 內容 | 插畫 + NO. + 中文名 + 英文名 + 學名 | 見 [CARD_CONTENT_GOALS](./CARD_CONTENT_GOALS.md) |
| 造型 | 米色收藏卡 | 寶可夢圖鑑機（紅機身、大鏡頭、機鉸、銀灰熒幕） |
| 尺寸 | 900×1200 | 1200×1600 |
| 實測 AVIF | 35–37 KB | 57–70 KB |

出圖引擎：`scripts/cards/render-card.py`（Pillow；文字 100% 由程式排，AI 不碰字）。

想改用 AI 一次生成整張卡（例如 Gemini）：
```bash
npm run cards:prompt -- 0289 --style onepass          # 產生提示詞
python3 scripts/cards/render-card.py --from-image 圖.png --kind info   # 轉 AVIF
```
風險與比較見 [CARD_METHODS](./CARD_METHODS.md)、[CARD_STYLE_V2](./CARD_STYLE_V2.md)。

---

## 4. 資料管線（分類與文案）

| 想做的事 | 指令 | 產出 |
|---|---|---|
| 更新 Clements 分類表 | `npm run ebird:taxonomy`（可 `--api`／`--file`） | `ebird-taxonomy.csv` |
| 睇邊張卡英文名／學名有問題 | `npm run ebird:audit` | `reports/ebird-audit.md` |
| 把權威分類接上 569 張卡 | `npm run birds:enrich` → `-- --apply` | `birdTaxonomy.json` |
| 中文名對照 | `npm run aliases:build` | `reports/name-alias.md` |
| 補中文目／科／IUCN | `npm run facts:fetch -- --from 22 --to 41` → `npm run facts:build` | `birdFacts.json` |
| 由維基原文抽卡面文案 | `node scripts/cards/extract-copy.mjs --all --missing-only` | `cardCopy.json` |
| 體檢 R2 邊張有圖 | `npm run cards:probe` | `reports/card-audit.md` |

**權威順序**：eBird / Clements（Cornell Lab）決定英文名、學名、目、科；中文名只作顯示，
永不用中文名反推英文名。完整規則見 [TAXONOMY_PIPELINE](./TAXONOMY_PIPELINE.md)。

現況：**559 / 569 對上 eBird**；餘下 9 張中英名矛盾、10 張未對上，清單在 `reports/enrich-birds.md`。

---

## 5. 排序與搜尋（v1.8.0）

- 預設跟 eBird 演化排序（目→科→種）；另有 `NO.` 與「中文」兩個掣。
- 搜尋以英文名為主：`dove` → Spotted Dove 第一；學名可搜；中文名可搜但排後。
- 卡上 `#12` 是「排第幾」，與 `NO.0456` 分開顯示（編號永不變）。

---

## 6. 部署與瘦身

- Vercel 每次部署會重新 build；`dist/ build/ out/` 不入 Git。
- 大檔（插畫 850 MB、AVIF 40 MB、BirdNET 模型）一律外置（本機／R2），不入 Git。
- 防增肥守則見 [SLIMMING_GUIDE](../SLIMMING_GUIDE.md)。

```bash
npm install
npm run dev
npm run build
```

技術棧：React 19 + Vite + Tailwind v4 + Framer Motion + Lucide。
圖卡代理：`api/card.js`（fail-closed 白名單、長快取），學校網絡封鎖 `*.r2.dev` 時自動改用。

---

## 7. 文件索引

| 文件 | 內容 |
|---|---|
| [README](../README.md) | 願景、對象、成功標準 |
| [CARD_CONTENT_GOALS](./CARD_CONTENT_GOALS.md) | 卡面要放什麼、為何這樣排 |
| [CARD_SOURCING](./CARD_SOURCING.md) | 文字來源、核對責任、抽取規則 |
| [CARD_STYLE_V2](./CARD_STYLE_V2.md) | 圖鑑機造型與插畫提示詞 |
| [CARD_METHODS](./CARD_METHODS.md) | 排版 vs AI 一次生成的比較 |
| [CARD_CONTENT_PLAN](./CARD_CONTENT_PLAN.md) | 補資料的工程量與體積評估 |
| [TAXONOMY_PIPELINE](./TAXONOMY_PIPELINE.md) | 分類權威與管線 |
| [APP_REVIEW](./APP_REVIEW.md) | 健檢與改進紀錄 |
| [CHANGELOG](../CHANGELOG.md) | 版本紀錄 |
