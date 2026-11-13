# 交付對話：給接手 0201 之後的下一位 Agent

> 2026-11-12 交接。寫給「下一個打開這個 repo 的 agent」。
> 製作流程權威仍是 `docs/INFO_CARD_AGENT_HANDOFF.md`；逐張交付證據在 `docs/INFO_CARD_RESTART.md`（append-only，最新一節在檔尾）。
> 這份文件只補三件事：**現在到哪裡**、**哪些數字是真的**、**接手後第一步該做什麼**。

---

## 一、這一輪做到哪裡

資訊長卡 **0001–0200 共 200 張**已完成並上載 Google Drive，`src/data/infoCards.json` 的 `ids`／`layouts`／`revisions`／`panelColors` 各 200 筆，`0001`–`0200` 連續無跳號。

本輪（把 196 推到 200）交付四張，全部有完整核對紀錄：

| 卡 | 名稱 | AVIF bytes | MD5 | Drive id |
| --- | --- | --- | --- | --- |
| 0197 | 蒙古銀鷗 _Larus mongolicus_ | 132432 | `ec23885ee17a67a5cece15d301198b4e` | `1pwIiEtOM5_6dhLNcvyv1iY6zM1kuBumB` |
| 0198 | 玄燕鷗 _Anous minutus_ | 131438 | `220ddba42075107fae09fda006e0b425` | `1AEIepZ0x3NvjVsVe6glg23Hlu8RASt4q` |
| 0199 | 小黑背鷗 _Larus fuscus_ | 130581 | `740bbedb092f6e8b308a2e149899b7a3` | `1QzoptWrJUAwRlscU2wvEVCeya3_F443n` |
| 0200 | 灰背鷗 _Larus schistisagus_ | 137608 | `8727375a5f910ff9520ef80676eec1eb` | `1qmILYFNFzGl2pxP0D6uxsB18IGF-dT20` |

每張都做過：`spec == manifest.spec`、AVIF 解碼 1024×1536、bytes／SHA256 與 manifest 及 SHA256SUMS 一致、`test-slim-feature-label.py` 4/4、地圖面板 `#7da688` 綠色像素非空、`npx tsc -b` 乾淨、`node --test` 162 項（161 過、1 略）、`git diff --check`、上載前 Drive 精確查重 0 命中、上載後 `get_file` 核對 parent／bytes／MD5／mime。

---

## 二、數字要分清楚（用戶問過兩次，別再混）

| 數字 | 意思 | 出處 |
| --- | --- | --- |
| **583** | 鳥種數 | `docs/HK-MASTER.md`：香港鳥類名錄（網頁列 584 種）對 Clements/eBird v2024，綠翅鴨／美洲綠翅鴨兩列併為一種 → 583 |
| **583** | 插圖張數（正方形 `birdcards/NNNN.avif`） | **已全部完成**，與資訊卡是兩套不同交付物 |
| **200** | 資訊長卡張數（`aviandex/NNNN.avif`，1024×1536） | `src/data/infoCards.json` |
| 540 | 有 `explorerIndex.birds`／`cardDetails`／`dexScores` 的鳥種數 | 其餘 43 種是新換入、欄位「資料待查」 |
| 542 | `cardCopy.json` 條目數 | 含 `_readme`、部分鳥種無對應卡 |
| 512 | `measurements` 有量度資料的鳥種數 | — |
| 559 / 569 | `docs/CARD_COVERAGE.md` 的「卡片總數 559」等 | **舊插圖／舊編號制度遺留，不是資訊卡數，也不是鳥種數** |
| 383 | **不是任何總數** | 全 repo 只出現在鳥編號 `0383` 與各種 MD5／SHA／pageid |

**0385 是鳥的編號（崖沙燕），不是第 385 張卡，也從來沒有卡面。** 不要把它描述成「重印」。

---

## 三、Drive 現況（已實測，2026-11-12）

- 根資料夾：`1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`
- 成品資料夾「已上載R2」：`1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`；檔名格式 `NNNN.avif`（純檔名，不加 `aviandex-` 前綴、不建 `aviandex/` 子層），MIME `image/avif`。
- 該資料夾現時 **192 個未刪 `.avif`**，另有 **6 個在垃圾桶**（`0040.avif（已作廢 — 分布圖空白）`、`0105`、`0113`、`0151`、`0154`、`0181` 的舊版，全部已由新版取代，不要還原）。
- **`0001`–`0008` 從來不在這個資料夾**（已用 `name=` 逐個查，未刪與垃圾桶皆 0 命中）。`infoCards.json` 有登記它們，但 Drive 查無檔案。接手時不要假設 192+6 = 200 是「掉了 2 張」的意外；這是歷史遺留，若用戶要補，需重新產圖。
- 查重 query（照抄）：
  `name='NNNN.avif' and '1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD' in parents and trashed=false`

---

## 四、本機環境與素材現實

- Python：`/tmp/cv/bin/python`（Pillow + numpy 已裝）。字體：`~/.fonts/NotoSansTC_400Regular.ttf`、`NotoSansTC_700Bold.ttf`。
- **`cards/art/` 與 `deliver/cards/` 都被 `.gitignore` 排除。** 只有現時這個 sandbox 還留著 0196–0200 的素材；新 checkout 不會有舊卡的原圖、`features.png`、比較鳥或 `countries.geojson`。
  → 因此**任何一張舊卡都不能「重出新版」**，除非先重新生圖並重新選裁切。不要憑記憶或舊 manifest 猜裁切框。
- 世界底圖：`https://api.github.com/repos/nvkelso/natural-earth-vector/contents/geojson/ne_110m_admin_0_countries.geojson`（`curl` 直連 raw.githubusercontent 會 SSL 失敗，用 contents API）。
- 地圖一律世界視圖 `bounds [-180,-90,180,90]`，綠色只作「部分原生國家」概述，標明「綠色非全境；非完整分佈」。

---

## 五、接手後第一步（建議順序）

1. `git fetch && git log --oneline -5`，讀 `docs/INFO_CARD_RESTART.md` 檔尾與 `src/data/infoCards.json` 的長度，確認起點是 **0201**。
2. **先問／確認 Drive 上 0201 是否已有檔**（查重 query 見上）。Drive 有檔不代表本地有 spec；`deliver/` 不入 Git，manifest 只在 sandbox。
3. 讀 `src/data/birds.json` 找 `0201` 是哪一種鳥，再讀 `birdTaxonomy.json` 取學名／目／科。
4. 讀 HKBWS 頁（`https://avifauna.hkbws.org.hk/species/0110/NNNNNN`；**不要猜頁號**，先開 `species/0110` 索引找），抄下辨識、量度、分佈、IUCN、香港紀錄。
5. 生圖 → **實際讀圖** → 先用 4×4 編號格線看位置，再在 235 px 拼圖上確認四圈 → 才寫 `scripts/cards/info-restart-NNNN.json`。
6. 渲染：`/tmp/cv/bin/python scripts/cards/render-info-restart.py NNNN` → 讀 `preview-NNNN.webp` 全卡核對 → 修正 → 重渲染。
7. 跑檢查 → 上載 → `get_file` 核對 → 補 `INFO_CARD_RESTART.md` 一節 → commit。

---

## 六、踩過的坑（別重踩）

- **猜 HKBWS 頁號一定錯**：`017700` 是烏灰銀鷗、`017500` 是空頁。先開索引。
- **`features.png` 側面近景裁切必須包住頭的輪廓**：0198 第一次 `[0.02,0.30,0.60,0.88]` 只收到嘴和天空，改成 `[0.02,0.20,0.72,0.90]` 才有頭、眼、嘴。
- **`pixel.png` 的翼／尾圈很容易變全抽象**：0200 第 3 圈試了 8 個候選才找到翼面與三級飛羽白新月同時飽滿的框。抽象可接受，但**標籤必須指名結構**、註解要說明。
- **`ImageOps.fit` + 圓形遮罩會靜靜切掉邊緣**：每個裁切框內至少留 5% 邊距，並在 235 px 下判斷。
- **`parseLength()` 仍然忽略單位**（`scripts/build-explorer-data.mjs`）：新 copy 若出現 `in`／`oz` 要先換算，否則會把英制當公分。
- 執行長期指令（`node --test` 約 5 分鐘、`npx tsc -b` 約 8 秒）用足夠 timeout，不要中途放棄。

---

## 七、仍待處理的真實缺口（不要假裝已解決）

1. **43 種鳥沒有 `dexScores` 記錄**（0014、0053、0054、0059、0084、0117、0124、0173、0197、0198、0275、0278、0287、0312、0325、0372、0382、0386、0404、0420 …）。卡面一律「待查」，**不得補零、不得由 IUCN 推算**。0197、0198 六軸全待查是預期結果。
2. **`cardCopy.json` 0196 與已交付卡面不一致**（該檔記 NE／長度重量空白，卡面是 LC 並有量度）；**0200 條目本身帶「來源請求」標記**，且沿用 zh.wikipedia 別名「大黑脊鷗」。本輪**沒有改寫該檔**，只在 0200 卡的 notes 與文件記錄。要動它就要一併覆核來源。
3. **`docs/CARD_COVERAGE.md` 的「卡片總數 559」已過時**（實際 583 種鳥 / 200 張資訊卡）。未改，因為它描述的是舊插圖制度；若要更新，需整份重算。
4. **`0001`–`0008` Drive 無檔**（見第三節）。
5. 舊 spec `scripts/cards/info-restart-0038/0039/0040.json` 等與 Drive 成品沒有已驗證的來源對應，不可冒稱已核對。

---

## 八、不可違反的規矩（用戶明確要求過）

- 每張卡都**由明確審核過的 spec JSON 重新渲染**；不重用、不手改已交付的 AVIF。
- 資料正確先於渲染；卡面文字以 `cardCopy.json` 為母本，但與權威來源衝突時要在 notes 說明，不改 runtime。
- 缺分保留待查，**永不補零**。
- 特徵圓圈必須真的看到那個部位；看渲染後的圓，不是只看數字。
- 交付以 Drive 單檔 `NNNN.avif` 為準，刪重、比對 MD5／bytes，不打包 ZIP、不動 R2／UI／Service Worker。
- **插圖 583（`birdcards/`）已完成**，不要重做；本線只做資訊卡（`aviandex/`）。
- 老實報告缺什麼；沒做的不要說做了，沒有的不要說有。
