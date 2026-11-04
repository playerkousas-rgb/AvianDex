# 資訊圖卡：內容先補齊（工程量與空間評估）

> 你的問題：**能不能先把資訊圖卡的內容補齊？工程量會不會很大？會不會用很多 GitHub 位？**
> 短答：可以；工程量中等但可分批；**內容其實不太佔位（約 400 KB），真正佔位的是插畫（569 張 AVIF ≈ 40 MB，已放 R2 不入 repo）**。

---

## 1. 要補的到底是什麼

一格卡面需要 9 個欄位，其中 **5 個已由 eBird 免費提供**，只需補 **6 個文字欄**：

| 欄位 | 來源 | 現況 |
|---|---|---|
| 中文名 | `birds.json` | ✅ 已有 569 |
| 英文名 / 學名 / 目 / 科 / species code | eBird/Clements（`birdTaxonomy.json`） | ✅ 已對上 559（98.2%） |
| 中文目／科（顯示用） | 中文維基 taxobox | ⬜ 需補 559（可用 `facts:fetch` 批次抓） |
| 食性 diet | 維基／HKBWS 名錄 | ⬜ 需補 |
| 分佈 range | 維基／HKBWS | ⬜ 需補 |
| 外形特徵 look | 維基首段 | ⬜ 需補 |
| 棲地 habitat | 維基 | ⬜ 需補 |
| 冷知識 funFact | 維基／觀察筆記 | ⬜ 需補 |
| IUCN | 維基 taxobox／eBird | ⬜ 需補 |
| 特徵標註 callouts ×3 | 由 look 拆出來 | ⬜ 需補 |
| source（可追溯） | 維基 pageid／URL | ⬜ 每張必填 |

---

## 2. 工程量（實測數字）

以已完成的兩張為基準，平均每張文案 **771 bytes**。

| 工作 | 數量 | 每張耗時（AI 草擬 + 人工核） | 總計 |
|---|---|---|---|
| 中文目／科／IUCN | 559 | 全自動（`npm run facts:fetch`） | 約 20 分鐘（一次性，有 rate limit） |
| diet / range / look / habitat / funFact | 559 × 5 欄 | 約 40 秒 | **約 6 小時**（可分 28 批 × 20 張） |
| callouts ×3 | 559 | 約 20 秒 | 約 3 小時（可與上項同時做） |
| **合計（AI 草擬）** | | | **約 9–10 小時** |
| 人工抽核（建議每批抽 10%） | 56 張 | 約 2 分鐘 | 約 2 小時 |

> 若只做「重點 100 張」（香港常見鳥），全部時間可壓到 **約 2 小時**。
> 注意：文案必須有 `source`，冇 source 的欄位卡上會印「資料待查」——這是刻意的防線。

---

## 3. 空間（會不會用很多 GitHub 位？）

| 項目 | 原始大小 | gzip 後 | 是否進 Git |
|---|---|---|---|
| `cardCopy.json`（559 張全填） | **約 421 KB** | 約 132 KB | ✅ 進 Git（值得） |
| `birdTaxonomy.json`（現有） | 87 KB | 16 KB | ✅ |
| `ebird-taxonomy.csv`（11,145 種） | 1,092 KB | 219 KB | ✅（可改為只在 build 時下載） |
| `birds.json` | 47 KB | 9 KB | ✅ |
| 插畫 `cards/art/`（569 張 PNG） | **約 850 MB** | — | ❌ 不進 Git（已 ignore） |
| 成品 AVIF（569 張） | **約 40 MB** | — | ❌ 不進 Git，上 R2 |

**結論**：內容補齊只會令 repo 增加 **約 0.4 MB**（GitHub 單 repo 軟上限 1 GB，完全無壓力）。
真正佔位的是插畫與 AVIF，兩者都已在 repo 外（本機素材 + R2）。

如果連 `ebird-taxonomy.csv` 都想省，可以改成 build 時才下載（省 1 MB），但目前沒必要。

---

## 4. 建議做法（分批，每批可獨立驗收）

```bash
# 第 1 步：先自動補「中文目／科／IUCN」（免費、免人手）
npm run facts:fetch -- --from 1 --to 100     # 每批 100 張，有快取
npm run facts:build                          # 出審核報告

# 第 2 步：由已查證資料自動產生文案骨架（不會無中生有）
node scripts/cards/draft-copy.mjs --ids 0289,0290   # 有 source 的欄位才寫入

# 第 3 步：人手（或 AI 草擬 + 你核）補 look / funFact / callouts
# 第 4 步：npm run test:copy 把關（長度、簡體字、source 齊全）
# 第 5 步：npm run cards:render -- --all 出卡
```

每批 20 張的節奏：**抓資料 2 分鐘 → 草擬文案 15 分鐘 → 你核 5 分鐘 → 出卡 1 分鐘**。

---

## 5. 風險與對策

| 風險 | 對策 |
|---|---|
| AI 草擬的文案「好似對但其實錯」 | 每欄必須有 source；`test:copy` 檢查；卡上印 source |
| 中文名各地說法不同（香港 vs 台灣） | 已在 `reports/zh-resolution.md` 列出；由你拍板 |
| 大量抓維基被限流 | `facts:fetch` 有 500ms delay + `.cache/` 快取，可斷點續跑 |
| 559 張一次做完太累 | 分 28 批，每批可獨立出卡、獨立上傳 |

---

## 6. 我的建議

1. **先做 100 張香港常見鳥**（覆蓋 90% 使用場景），用 3–4 批完成，大約 2 小時。
2. 內容 JSON 進 Git（0.4 MB），插畫與 AVIF 一律外置。
3. 之後每次想加卡，只需補一行 JSON + 一張插畫，1 分鐘內出卡。
