# 卡面資料：來源、核對責任、抽取規則

> 這份文件回應一句話：「**我沒有核對資料的能力**」。
> 所以做法不是「AI 寫稿交你核」，而是**每一句都必須是別人（中文維基）寫好的原文，
> 卡上附 pageid，你（或任何人）可以按編號回去看同一句話**。
> 抽唔到就留空，卡面印「資料待查」——**寧願醜，唔可以錯**。

---

## 1. 責任分工（明確寫死）

| 工作 | 由誰做 | 產出 |
|---|---|---|
| 決定物種清單、排序、編號 | eBird / Clements（唯一權威） | `src/data/birdTaxonomy.json` |
| 中文目／科名稱 | `src/data/taxonomyZh.json`（人工對照表） | 559/559 已補齊 |
| 卡面文字 | **中文維基原文整句抽取** | `src/data/cardCopy.json` |
| 每格文字的可追溯性 | 每張卡 `source` 欄（pageid + variant） | 卡面底部直接印出 |
| 原文有問題（矛盾／[來源請求]／翻譯差） | 寫入該卡 `notes` 欄 | 卡面不印，但 repo 內留底 |
| 最後一句的內容正確性 | **維基百科的編者 + 其引用文獻**（不是 AI、也不是用戶） | — |

**AI 在這條生產線的角色**：只負責「插畫」與「排版」。文字欄位一律不經生成模型。
`scripts/cards/extract-copy.mjs` 內沒有任何 prompt、沒有任何 LLM 呼叫，只有字串處理。

---

## 2. 抽取規則（程式怎麼決定哪句入卡）

1. 用學名在 `zh.wikipedia` 搜條目，並**核對該頁 wikitext 真的含此學名**，否則是抽錯物種，直接跳過。
2. 讀 `action=parse&prop=wikitext`（整頁），不用首段 HTML：
   實測 0291 赤翡翠、0294 白領翡翠的食性／外形／棲地在正文同名章節，只讀首段會白白留白。
3. 先找「同名章節」（`食物與覓食`／`分佈`／`描述`／`棲息地`），找不到才退回全文。
4. 句子必須**以句號／分號結尾**才算完整句；殘句一律丟棄。
5. 超過卡面上限（46 字）只做兩件事：**截到上一個完整分句**，或**留空**。
   **永不改寫、永不補字、永不換句話說**。
6. 簡體 → 香港繁體只做**字形轉換**（`opencc-js`，`cn → hk`），不動詞、不動句。
7. 每張卡自動寫 `source`：`zh.wikipedia <條目> · pageid <id>（variant=zh-hk）· 分類：eBird/Clements`。

---

## 3. 自動偵測並標記的「原文問題」

程式會主動把以下情況寫入 `notes`（卡面不顯示，但 repo 內可審）：

| 情況 | 偵測方式 | 處理 |
|---|---|---|
| infobox 與引用矛盾 | `status=` 與 `status_ref` 內的 IUCN 中文級別不一致 | **IUCN 留空**，`notes` 寫明「兩個都不採用，需人工查 IUCN 紅色名錄」 |
| 條目翻譯品質不佳 | wikitext 有 `{{Rough translation}}` | `notes` 標記，內容照錄（因為仍是原文） |
| 未經引註內容 | `{{Citation needed}}` 或 `[來源請求]` | `notes` 標記受影響欄位，內容照錄並註明 |
| 條目太短 | 抽到少於 3 欄 | 卡面顯示「資料待查」，交由日後補（HKBWS 名錄等） |

**已知個案**：

- **0293 藍翡翠**：infobox 寫「易危 VU」，但同頁引用的 IUCN 文獻寫「無危」→ IUCN 留空。
- **0292 白胸翡翠**：條目掛 `{{Rough translation}}`；分佈方向原句為「由西奈半島**向東**延伸」。
- **0295 斑魚狗**：食性句在原文標記 `[來源請求]`；條目無「描述」章節，故外形留空。
- **0298 藍胸佛法僧**：中文維基 infobox 為 2012 年版「近危」，英文維基 2019 年版為「無危」→ IUCN 留空。

---

## 4. 怎麼跑

```bash
# 單張／批次（會自動寫入 cardCopy.json，只補空欄，不覆蓋手寫內容）
node scripts/cards/extract-copy.mjs --ids 0288,0289
node scripts/cards/extract-copy.mjs --from 288 --to 300
node scripts/cards/extract-copy.mjs --all --missing-only --delay 600

# 檢查卡面文案有沒有超長／簡體／冇 source
npm run test:copy

# 重出圖卡（AVIF）
npm run cards:render -- 0288 0289 0290
```

輸出：

- `src/data/cardCopy.json`（進 Git）
- `reports/copy-extract.md`（不進 Git，本機看進度）
- `.cache/wiki/`（原始 wikitext 快取，不進 Git）

---

## 5. 目前覆蓋率（2026-11-04）

| 項目 | 數量 |
|---|---|
| 有 eBird 分類的卡 | 559 / 569 |
| 有中文目／科 | **559 / 559（100%）** |
| 有逐句原文文案 | 12 張（0288–0299 連續一段） |
| 六欄全齊 | 8 張（0293／0295／0296／0298 有欄位留空） |

抽唔到嘅原因幾乎都一樣：**中文維基該物種條目只有一句「某某為翠鳥科的一種鳥類」**，
沒有食性／外形／棲地段落。這不是程式問題，是來源本身冇料——
所以下一步只能是「換來源」（HKBWS 名錄、香港鳥類圖鑑），而**不是叫 AI 自己寫**。

---

## 6. 一鍵補齊 559 張（GitHub Actions）

開發沙盒禁止連 `zh.wikipedia.org`（`SSL_ERROR_SYSCALL`），所以「抓原文」放在 GitHub runner 做。
Workflow 檔案：`.github/workflows/extract-copy.yml`。

**怎樣跑（不需要寫程式）**

1. 開 repo → **Actions** → 左邊選「**補齊卡面文案（維基原文抽取）**」
2. 右邊 **Run workflow**，參數可以全部留空：
   - `only_missing` 勾住（預設已勾）＝ 只補未齊的卡
   - `dry_run` 勾住 ＝ 只統計、不開 PR（第一次建議先試這個）
3. 等約 30–45 分鐘（559 頁 × 0.6 秒禮貌間隔 + 分析）
4. 完成後會自動開一個 PR，標題 `chore(cards): 補齊卡面文案（維基原文抽取 · run #N）`
5. PR 內只會改 `src/data/cardCopy.json`，描述會附覆蓋率表

**安全性**

- 只用 repo 內建 `GITHUB_TOKEN`（`contents: write`、`pull-requests: write`），不接觸任何 secret
- 不用第三方 PR action，一律 `git` + `gh` CLI
- 任何一句都可以用 `source` 內的 pageid 回維基核對
- 抽唔到就留空 → 卡面印「資料待查」，**沒有 AI 代寫**

**跑完之後看什麼**

- PR 描述內的「仍缺張數」表：如果 `look`／`habitat` 缺得特別多，代表很多中文維基條目本身只有一句
  「某某為某科的一種鳥類」，那段要換來源（HKBWS 名錄／香港鳥類圖鑑），不是程式問題
- Artifact `copy-extract-report-N`：完整的 `reports/copy-extract.md`（逐張卡：抽到什麼、取自哪個章節、仍缺什麼）

**本機也可以跑**（有網即可）：

```bash
npm install
npm run copy:extract -- --all --missing-only --delay 600
npm run copy:stats
```
