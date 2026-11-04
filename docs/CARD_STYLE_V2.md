# 圖卡設計 v2（Pokédex 百科卡 · AVIF）

> 一句話：**AI 只畫鳥，文字由排版引擎寫。** 所以卡上每個字都準確、可核對，不會有錯字／亂碼／假數據。

---

## 1. 為什麼要換做法

| 舊做法（AI 直接出整張卡） | 新做法（v2） |
|---|---|
| 中文字經常寫錯、出現方塊亂碼 | 全部用 Noto Sans TC 字型渲染，100% 可控 |
| 分類、體長、食性靠 AI 記憶 → 會編 | 由 `src/data/*.json` 讀入，只印已查證資料 |
| 每張卡的排版都不一樣，不成套 | 同一個模板，569 張一致 |
| 出一次圖要幾十秒、要收費 | 排版 1 秒內完成，免費 |

分工：

```
AI 生成插畫（cards/art/NNNN.png）
        ↓
排版引擎（scripts/cards/render-card.py）＋ 資料（src/data/*.json）
        ↓
cards/out/NNNN.png（預覽）  →  cards/out/NNNN.avif（成品，上傳 R2）
```

---

## 2. 卡面結構

```
┌──────────────────────────────────────────────┐
│ 🔴 AvianDex  HONG KONG FIELD GUIDE   NO.0289 │ ← 紅色機頭 + 編號牌
├──────────────────────────────────────────────┤
│ 普通翠鳥                                      │ ← 中文名（最大）
│ Alcedo atthis                                │ ← 學名（斜體，eBird）
│ Common Kingfisher                            │ ← 英文名（eBird 正式名）
│ [佛法僧目 Coraciiformes][翠鳥科 Alcedinidae][comkin1]
├───────────────────────────┬──────────────────┤
│                           │ 特徵標註          │
│        鳥的插畫            │ ① 喙 BILL         │
│      （米色圖鑑底）        │ ② 背 BACK         │
│                           │ ③ 下身 BELLY      │
│                    排序#9809│ 冷知識 TRIVIA    │
├───────────────────────────┴──────────────────┤
│ 食性 DIET        │ 分佈 RANGE                │
│ 外形特徵 FIELD   │ 棲地 HABITAT              │
├──────────────────────────────────────────────┤
│ 保育狀況 無危 LC │ 資料完整度 ▓▓▓▓▓ 100%     │
│ 資料來源 zh.wikipedia pageid 34390 · eBird    │
└──────────────────────────────────────────────┘
```

設計規則：

- **編號 `NO.NNNN` 與排序 `#NNNN` 分開顯示**：編號 = R2 檔名，永遠不變；排序 = eBird 演化位置，會隨分類更新而變。
- **資料完整度**係真數：6 個欄位（食性／分佈／外形／棲地／冷知識／IUCN）有幾個填了，就顯示幾分之幾。未填的欄位卡上印「資料待查」，不會用 AI 補。
- 色票沿用 App：深綠 `#0E3B2E`、奶油 `#FFF8D6`、圖鑑紅 `#E3350D`、強調黃 `#FACC15`。
- 尺寸 **1400 × 1867（3:4）**，同 App 卡片比例一致，亦係 R2 現有圖卡尺寸。

---

## 3. 出卡步驟（每張卡 3 步）

### ① 準備插畫 `cards/art/NNNN.png`

只有插畫，**不要有字**。提示詞範本（實測有效）：

```
Semi-realistic scientific field-guide plate illustration of a <英文名> (<學名>): <3–5 個辨識特徵>.
Side profile, whole bird visible, wings folded, head turned toward viewer.
Clean flat pale cream background (#F7F1E0), no scenery, no text, no watermark, no frame.
Soft even museum lighting, crisp feather detail, encyclopedia specimen-plate realism,
3:4 vertical composition, bird centered with generous empty margin.
```

> 米色底會由排版引擎自動換成卡框的奶油色，所以插畫不要自己畫背景。

### ② 填文案 `src/data/cardCopy.json`

```json
"0289": {
  "orderZh": "佛法僧目",
  "familyZh": "翠鳥科",
  "iucn": "無危 LC",
  "diet": "小魚為主，亦捕食水生昆蟲、蝦及蛙類",
  "range": "歐亞大陸至東南亞；香港常見留鳥，多在水邊",
  "look": "上身金屬藍綠帶光澤，下身橙紅；喙長黑呈匕首形，尾短",
  "habitat": "溪流、池塘、濕地及海邊石堤",
  "funFact": "俯衝入水捕魚……",
  "callouts": [{ "label": "喙 BILL", "text": "長而黑·匕首形" }],
  "source": "zh.wikipedia 普通翠鳥 · pageid 34390 · 分類：eBird/Clements"
}
```

**每個欄位都要有出處**；冇出處就留空（卡上印「資料待查」）。`npm run test:copy` 會檢查長度、簡體字、source 齊全。

### ③ 出圖

```bash
npm run cards:render -- 0289            # PNG + AVIF
npm run cards:render -- 0289 --preview  # 只出 PNG 睇樣
npm run cards:render -- --all           # cards/art/ 內全部
```

輸出：`cards/out/0289.avif`（實測 **70–74 KB**，同尺寸 PNG 係 540–600 KB，**省 87–88%**）。

### ④ 上傳

Cloudflare Dashboard → R2 → `aviandex/` → 上傳 **`0289.avif`**（檔名必須 4 位數字）。
App 會自動解鎖，`npm run cards:probe` 可以驗證。

---

## 4. 環境需求（本機第一次）

```bash
pip3 install pillow numpy     # 排版引擎
brew install imagemagick      # 寫 AVIF（Linux: apt install imagemagick）
# 中文字型（三款）：NotoSansTC-{Black,Bold,Regular}.otf
#   下載 https://github.com/notofonts/noto-cjk → Sans/SubsetOTF/TC
#   放入 ~/.fonts 或設 AVIANDEX_FONT_DIR
```

`npm run cards:render` 會先檢查以上全部，缺任何一項都會清楚講要裝甚麼，不會出半成品。

---

## 5. 現況

| 卡 | 狀態 | 檔案 | 大小 |
|---|---|---|---|
| 0289 普通翠鳥 | ✅ 完成（AI 插畫 + 已查證文案） | `cards/out/0289.avif` | 70 KB |
| 0290 三趾翠鳥 | ✅ 完成 | `cards/out/0290.avif` | 74 KB |
| 其餘 567 張 | 插畫未生成 | — | — |

> 插畫是唯一「要逐張做」的工序（每張 1 次 AI 生成）。可以分批：每批 20 張，我出圖＋排版＋自檢，你上傳。
