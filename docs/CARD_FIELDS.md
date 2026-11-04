# 資料流：十五欄，七格，中英各一份

> 一句話：**每張卡最多由 15 個欄位中揀 7 個印**。資料多就揀最好看的；
> 資料少就印幾多，唔會為湊數而寫「資料待查」霸位。

---

## 1. 為什麼要「15 揀 7」

你原本問得對：如果固定 7 格，就要每隻雀都有齊 7 項，否則卡面會有空格。
改成「有 10 項就揀 7 項、只有 7 項就 7 項全印、只有 3 項就 3 項」，
就永遠唔會出現「為填而填」。而選剩下的欄位不會消失，只是這一版沒位印。

欄位分三層（`scripts/cards/field-schema.mjs`，唯一來源）：

| 層級 | 欄位 | 角色 |
|---|---|---|
| core（30 分） | 分佈地區·Distribution、棲息環境·Habitat、食物·Diet、Top 5 特色·Top 5 Highlights | 一有就印 |
| strong（20 分） | 外形特徵·Appearance、成長與繁殖·Breeding、有趣冷知識·Fun Fact、觀察小貼士·Field Tips | 夠位就印 |
| extra（10 分） | 鳴聲·Voice、行為習性·Behaviour、遷徙·Migration、保育現況·Conservation、人與鳥·Birds & People、名稱由來·Name Origin、注意事項·Watch Out | 補位用 |

加分規則：
- 中英都有 → +4（令中文版與英文版揀到同一批欄位，兩張卡看起來一致）
- 列表項數多 → 最多 +5
- 少於 12 字 → −3（卡面會好空）
- 冇真雀相 → 外形 +2（右欄要靠它補位）

## 2. 資料如何進來（不靠 AI 寫）

```
維基（zh + en 原文）
      │  scripts/cards/extract-bilingual.mjs
      │    · 學名核對（wikitext 必須含該學名）+ pageid
      │    · 只抽原文完整句，抽唔到就空
      │    · 句首就係別隻雀的名字 → 丟棄（跨物種污染守衛）
      ▼
src/data/cardCopy.json
   { "0008": { fieldCopy:[{id:"look", zh:"…", en:"…"}, …], picks:[…] } }
      │
      ├─ HTML 版：scripts/cards/build-studio-data.mjs → tools/card-studio/aviandex-studio.html
      └─ Pillow 版：scripts/cards/render-card.py --lang zh|en → cards/out/info/0008[-en].png／.avif
```

**鐵律**：中文版只放中文原文、英文版只放英文原文。英文卡遇到冇英文原文的欄位會印
`Data pending`——**不會**把中文塞進去，也**不會**即時機翻（機翻就等於 AI 寫字，破壞可追溯性）。

## 3. 指令

```bash
# 抽中英雙語（需要能連維基的網絡；沙盒封鎖，請在 GitHub Actions 跑）
node scripts/cards/extract-bilingual.mjs --ids 0008
node scripts/cards/extract-bilingual.mjs --from 1 --to 60 --limit 20
node scripts/cards/extract-bilingual.mjs --self-test        # 離線檢查解析器

# 選欄（唯一來源）
node scripts/cards/field-schema.mjs --json                  # 產生 field-schema.json 給 Python

# 出卡
python3 scripts/cards/render-card.py 0008                   # 中文版 → AVIF
python3 scripts/cards/render-card.py 0008 --lang en         # English → 0008-en.avif
```

## 4. 一致性如何保證

| 風險 | 防線 |
|---|---|
| HTML 版與 Pillow 版揀到不同欄位 | `tests/bilingual.test.mjs` 讀 `studio.html` 的 `CARDF`，逐項比對 `field-schema.mjs` |
| Python 自己再寫一套選欄邏輯 | Python 只讀 `field-schema.json`（由 .mjs 產生；過期會自動重新產生） |
| 英文卡出現中文 | `render-card.py` 的 `V()` 只接受 `fieldCopy[].en`，否則印 `Data pending` |
| 卡上出現別隻雀的資料 | 抽取器的跨物種守衛 + `scripts/cards/audit-copy.mjs` 報告 |
| AI 在卡上寫字 | 文字全部由資料寫入；出圖工作室的 prompt 明令「不可出現任何文字」 |

## 5. 目前的限制（老實講）

1. **英文資料仍在 0**：`fieldCopy` 要跑 `extract-bilingual.mjs` 才有。沙盒連不到維基，
   所以需要在 GitHub Actions 手動觸發 `.github/workflows/extract-bilingual.yml`。
   未跑之前，英文卡會大量顯示 `Data pending`——這是刻意的，不是 bug。
2. **長度／體重仍未自動抽取**：header 的 `Length`／`Weight` 需要另外的解析器（infobox 的
   `length`／`weight` 欄位），暫時沿用舊資料（多數为空）。
3. **中英欄位不一定一一對應**：中文維基常有「文化」章節，英文維基未必有，反之亦然。
   選欄用「中英都有 +4」盡量對齊，但不保證 100% 相同。
4. **評分卡仍是中文五項**（生態重要性／適應力／觀賞價值／研究價值／保育關注度）：
   英文版會顯示 `Data pending`，等 `score_notes` 有英文再印。
