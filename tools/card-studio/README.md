# AvianDex 卡面工作室（單檔 HTML）

> 一句話：**打編號 → 卡面即刻出嚟 → 文字永遠準確**。

你給的兩份 HTML 是**兩件不同的工具**，我照兩邊各取一半：

| 你的檔案 | 它本來做什麼 | 我借了什麼 |
|---|---|---|
| `漫畫.html` | **出圖機**：Canvas 排版＋Gemini 出圖、32 種畫風、模型降級、中文錯誤診斷 | 出圖流程：`responseModalities:['IMAGE']`、模型逐個降級、`describeError()`、`safeStore`（Canvas 禁 localStorage 的處理） |
| `ai_scout_app (1).html` | **LLM 對答機**：從 GitHub `playerkousas-rgb/MD` 的 `knowledge/` 逐個 markdown 取 raw 檔案（`git/trees` 清單 → `raw.githubusercontent.com`），只准用檔案內容答，附出處 | **資料的來源方式**：卡面文字不靠 AI 寫，改為由 repo 內的結構化資料直接注入（等同它「只准用檔案答」的規矩） |

換句話講：**文字一律由 git 內的資料決定（不可由 AI 作）；AI 只負責畫圖。**

---

## 1. 為什麼是這個做法（而不是每次貼 prompt）

| | 每次貼 prompt 給 AI 出整張卡 | 卡面工作室（本工具） |
|---|---|---|
| 文字準確 | ❌ 會出假字、重複詞、假事實（已實測，見 `docs/CARD_AI_VS_TEMPLATE.md`） | ✅ 100%，因為文字是 DOM 直接寫入 |
| 批量 559 張 | ❌ 每張要人手核 260 字 | ✅ 資料齊就自動出 |
| 改一個字 | ❌ 重新生成整張 | ✅ 改一格，其餘不動 |
| 改版面 | ❌ 要重寫 prompt，每張結果都變 | ✅ 改一次 CSS，全部卡一齊變 |
| 缺資料 | ⚠️ AI 會自己補（最危險） | ✅ 印「資料待查」 |
| 費用 | 每張一次出圖 | 只有想要 AI 畫圖時才出圖 |

**AI 留在「畫」的崗位**：像素圖、真雀相風格、小插圖 —— 全部無字。

## 2. 用法（三種場合）

### A. 在 Gemini Canvas／任何瀏覽器雙擊開啟（最方便）
```
tools/card-studio/aviandex-studio.html
```
- 已內嵌全部現有文案（13 張）＋ eBird 分類快照（559 個編號）
- 已內嵌 0008 的像素圖、真雀相、5 張小插圖
- **唔需要上網、唔需要 build、唔需要 API key** 就可以出卡

### B. 想改資料 → 用工作室內的「編輯這一張」
1. 打編號（例如 `0290`）
2. 按「編輯這一張」
3. 改任何一格 → 右邊卡面即時更新
4. 按「儲存 JSON」→ 下載 `cardCopy.json`（與 repo 內格式相同，可直接覆蓋）

### C. 想加新卡／改全部 → 改 repo 的資料，重新產生 HTML
```bash
node scripts/cards/build-studio-data.mjs
```
這支會：
- 讀 `src/data/{birds,birdTaxonomy,cardCopy}.json`
- 內嵌 `cards/art/0008-*.png` 與 5 張小插圖（縮到長邊 900、JPEG 82）
- 順手做**版面預算檢查**（邊格字數超標、邊張有 callout 但冇相）
- 輸出 `tools/card-studio/aviandex-studio.html`

## 3. 卡面版式

與 `docs/CARD_LAYOUT.md` 完全一致（七段：標題列／主圖列／基本介紹＋分類／兩排四欄／評分卡／底欄），
只是這次用 **CSS + HTML** 實作，所以：

- 換字型 → 改一行 `font-family`
- 換綠色 → 改 `--G` 一個變數
- 加欄位 → 加一個 `<div class="box">`，高度自動分配（flex）
- 字太多 → `bumpDown()` 會自動縮字，唔會爆格

## 4. 降級規則（同 Pillow 引擎一致）

| 缺什麼 | 卡面會怎樣 |
|---|---|
| 真雀相 | 中央印「（未提供真雀相）」、右邊改印「外形特徵」 |
| 像素圖 | 「未提供像素圖」虛位 |
| callouts 少於 5 | 按實際條數平均分佈 |
| 少於 5 條 Top5 | 印實際條數 |
| 冇 scores | 綜合評分印「資料待查」，不印 0 分 |
| 冇 rarity | 常見度印「資料待查」，不點燈 |
| 其他欄缺 | 該格印「資料待查」，其餘照印 |

## 5. 輸出

| 按鈕 | 作用 |
|---|---|
| **輸出 PNG** | 用 SVG `foreignObject` 把整張卡（連 CSS／字型／內嵌圖）交給瀏覽器排版再截圖，2400×3200 超取樣後輸出 1200×1600 |
| **PDF／列印** | 走瀏覽器列印，A4 直向、無邊距，適合一次過印很多張 |

> ⚠️ 若「輸出 PNG」在你部機失敗（某些瀏覽器對 `foreignObject` 內的字型有保安限制），
> 用「PDF／列印」一定得；或者用 repo 的 Pillow 引擎：
> `python3 scripts/cards/render-card.py 0008`（結果 100% 相同版式，AVIF 159 KB）。

## 6. AI 出圖（選用）

- 模式：`Gemini Canvas`（平台自動帶 key）／`自己貼 API key`／`唔用 AI`
- 三顆按鈕：**生像素圖／生真雀相／生小插圖**
- 全部用 `responseModalities:['IMAGE']`、`aspectRatio:'3:4'`
- 模型自動降級：`gemini-3.1-flash-image-preview` → `2.5-flash-image` → `3-pro-image-preview`
- **生成結果不會自動寫入 repo**；要入正式版必須：
  1. 換成有授權的照片（Wikimedia Commons／iNaturalist／Macaulay Library）
  2. 記錄作者、授權、原始網址
  3. 放 `cards/art/NNNN-photo.png` 然後重跑 `build-studio-data.mjs`

## 7. 已知限制

- 工作室**只讀不寫** repo；儲存 JSON 是你手動下載再覆蓋（避免意外蓋掉未 review 的資料）。
- 內嵌圖只做 0008 一張示範；其餘 558 張未有真雀相，會顯示「（未提供真雀相）」。
- `commonness`（常見度）、Top5、小貼士、注意事項、生態價值 5 項評分屬**編者主觀**，
  卡底一定有聲明；這不是科學數據。
- 「資料待查」是刻意設計，不是 bug。

---

## 8. 三個檔案，三個崗位

```
tools/card-studio/
├── studio.html                 ← 卡面「母版」（DOM 版 dexcard；改版式改這裏）
├── imagestudio.html            ← 出圖母版（參考圖 + 板模 prompt + API 自動注入）
├── aviandex-studio.html        ← ✅ 成品：卡面工作室（已注入 548 張文案 + 分類，雙擊即用）
└── aviandex-image-studio.html  ← ✅ 成品：出圖工作室（已注入 548 張文案 + 內建參考卡）
```

`*.html` 母版由 `build-*.mjs` 注入資料後產生 `aviandex-*.html`。**日常只需要用成品那兩個。**

### 工作流（建議）

```
① 出圖工作室 aviandex-image-studio.html
     打編號 → 按「出圖」→ 得到無字真雀相／像素圖
        ↓（按「套用」）
② 卡面工作室 aviandex-studio.html
     自動收到圖 → 同一頁看到整張卡 → 改字／排版
        ↓（按「輸出 PNG」或「PDF／列印」）
③ 交給學校／團體
```

「套用」是經 `localStorage` 傳圖（同一部機、同一個瀏覽器），並且**不會自動寫入 repo**——
正式版仍然要人手把有授權的照片放去 `cards/art/NNNN-photo.png`，
再跑 `python3 scripts/cards/render-card.py NNNN` 出 AVIF。

## 9. 出圖工作室的四個任務

| 任務 | 尺寸 | 產出檔名 | 用在哪一格 |
|---|---|---|---|
| 真雀相風格圖 | 3:4 | `NNNN-photo.png` | 卡面中間大圖 |
| 像素圖 | 1:1 | `NNNN-sprite.png` | 卡面左邊小圖 |
| 圓形特寫 | 1:1 | `NNNN-closeup.png` | 右邊放大鏡（程式裁圓） |
| 欄底小插圖 | 1:1 | `NNNN-icon.png` | 四欄底部裝飾 |

全部都有**硬性要求：不可出現任何文字**。理由見 `docs/CARD_AI_VS_TEMPLATE.md`：
實測 AI 寫中文長段落會出錯字、自創地名與事實（英文更差）。文字交給 DOM 排版，永遠準確。

## 10. 資料品質：先核對，後出卡

文案是由中文維基抽取的**原文句子**。抽取器一旦認錯條目，整格就會變成另一隻雀的描述，
而且看起來完全正常——比「資料待查」危險得多。

```bash
node scripts/cards/audit-copy.mjs      # 產生 docs/CARD_DATA_AUDIT.md
```

它用三種訊號找問題：

1. 🔴 **句首就是別隻雀的名字**（「普通鵟體重約759克…」放在暗綠繡眼鳥卡上）
2. 🟡 **來源條目名與 eBird 中文名不符**（可能只是別名，要人手看一眼）
3. 🟢 **正常比較句**（「與大嘴烏鴉相比，本物種喙形較細」）→ 不算錯

第一輪結果：548 張之中 7 張抓錯條目（已清空＋記錄在 `notes`）、1 張句子主語不清（已暫緩），
其餘 150 張屬「命名差異待查」。報告在 `docs/CARD_DATA_AUDIT.md`。
