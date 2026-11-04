# 兩種出卡方法：一次生成 vs 兩步生成

> 實測日期：2026-11-04 · 同一張 NO.0289 普通翠鳥 · 同一批已查證資料

## 1. 方法 A：一次生成（one-pass）

**一句 prompt 直接出整張卡（連插畫連文字）。**

```bash
node scripts/cards/prompt-builder.mjs 0289 --style onepass            # 資訊圖卡
node scripts/cards/prompt-builder.mjs 0289 --style onepass --layout bird  # 簡單鳥卡
```

輸出的就是可直接貼去任何 image model 的完整 prompt：內含
`[必須出現的完整文字]`（逐字照抄）＋ `[必須出現的文案]`＋ 版面說明 ＋ 色票 ＋ 禁止事項。

實測結果：

| 卡款 | 文字正確率 | 版面 | 備註 |
|---|---|---|---|
| 簡單鳥卡（5 個字串） | **5/5 全對** | 接近設計 | 一次就中 |
| 資訊圖卡（約 260 字） | **全對**（逐字核對 10 段文案） | 很接近，但底部間距略鬆 | 一次就中 |

轉成 AVIF（如果 AI 已經出好整張卡，唔需要再排版）：

```bash
python3 scripts/cards/render-card.py --from-image cards/out/info/0289-onepass.png --kind info
python3 scripts/cards/render-card.py --from-image cards/out/0289-onepass.png --kind bird
```

它會等比縮放到 1400×1867（info）或 900×1200（bird）、置中裁切，再壓成 AVIF。

## 2. 方法 B：兩步生成（排版引擎）

**AI 只畫插畫，文字由 Pillow 用 Noto Sans TC 渲染。**

```bash
python3 scripts/cards/render-card.py 0289              # 資訊圖卡
python3 scripts/cards/render-card.py 0289 --kind bird   # 鳥卡
```

## 3. 實測比較數字

| | A 一次生成 · 鳥卡 | B 排版引擎 · 鳥卡 | A 一次生成 · 資訊卡 | B 排版引擎 · 資訊卡 |
|---|---|---|---|---|
| AVIF 大小 | 62 KB | **35 KB** | 96 KB | **57–61 KB**（圖鑑機版） |
| 字型 | AI 自選（此例近似襯線／黑體混用） | 固定 Noto Sans TC | AI 自選 | 固定 Noto Sans TC |
| 排版 | 每次略有不同 | 每張完全一致 | 每次略有不同 | 每張完全一致 |
| 文字準確 | 本張全對 | 必然全對 | 本張全對 | 必然全對 |
| 可控性 | 低（要靠 prompt 約束） | 高（改 code 即改） | 低 | 高 |
| 一張成本 | 1 次 AI 出圖（數十秒） | 1 次出圖 + 1 秒排版 | 1 次出圖 | 1 次出圖 + 1 秒排版 |
| 失敗風險 | 中（中文長段落易出錯） | 低 | **高**（字越多越易漏字／錯字） | 低 |

> 兩者的插畫其實都來自 AI，分別只在**文字由誰寫**。

## 4. 建議用法

| 情況 | 用邊個 |
|---|---|
| 少量卡、想快、接受每張少少不同 | A（一次生成） |
| 569 張要成套一致、要細檔 | B（排版引擎） |
| 資訊圖卡這種「字多又必須準」的卡 | B 為主；A 可作草稿參考 |
| 想改一句文案就要重生成 | B（改 JSON 重排版，1 秒） |

## 5. 一次生成的 prompt 要點（實測有效）

1. **把要印的每一個字都寫出來**，包括標籤（`食性 · DIET`）與內文，不要叫 AI「自由發揮」。
2. 明寫 `逐字照抄，不可以改寫、翻譯、簡化`。
3. 明寫 `只用下面列出的資料；沒有列出的欄位就不要出現在卡上`。
4. 明寫 `不可出現額度數據（體長、體重、評分、圖表）` —— 否則 AI 會自己編 stats。
5. 指定語言：`香港繁體，不可簡體、不可方塊亂碼`。
6. 版面用「由上到下」描述（header → title → tags → illustration → 2×2 面板 → 底欄），比抽象形容可靠。
7. 色票給 hex code，比講「深綠色」準確。

完整 prompt 可以直接用 `npm run cards:prompt -- 0289 --style onepass` 生成，裡面已包含以上全部。
