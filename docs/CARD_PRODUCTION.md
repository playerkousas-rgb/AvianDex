# 22–569 圖卡製作方案（討論稿 v1）

> 現況：0001–0021 有圖。**0022–0569 共 548 張未做。**
> 本文件唔係「叫你快啲畫」，而係先解決三件事：**做法（用邊個工具）、成本（錢同時間）、質量（統一唔統一）**，
> 再決定用邊條生產線。你揀完，我即刻做得到嘅部分我來做。

---

## 0. 先講結論（我的建議）

| 建議 | 理由 |
|---|---|
| **統一走「Birddex2 插畫風」做全集**，用 GPT-image／BANANA 批量出 | 548 張要人手逐張傾 prompt 不現實；插畫風 prompt 短、穩定、無中文字，唔會出亂碼字 |
| **AvianDex 百科卡只做「精選 60–80 張」** | 百科卡好睇但每張要 3–6 次重試（字易錯、版面易亂），成本 ×5 |
| **全部卡面唔再生產中文字**（除了少量精選） | AI 生成中文容易出錯字／簡體／亂碼；卡片資料（名、編號）已由網站疊加 |
| **每批 20 張，做完即 `cards:probe` 驗收** | 一次過 548 張出錯會好難追 |
| **長期：綁自訂網域**（例如 `cdn.skwscout.org`） | 548 張 × 每張 ~140 KB ≈ **75 MB**，r2.dev 正式流量一定會限流 |

---

## 1. 三條生產線（可以混用，但要有主線）

### 線 A：插畫卡（Birddex2 風）— 建議做全集 548 張

- 工具：BANANA／GPT-image（用維護需知已有的 Ken Sugimori 提示詞）
- 每張成本：1 次生成 ≈ 可接受，失敗率低（無字、無版面要求）
- 優點：風格一致、可愛、同「Pokédex 收集」氣質最夾；縮到 140 KB 都清楚
- 缺點：資訊量低（只有畫，無數據）→ 由網站右邊面板補資訊（已經有科研中心六宮格）

**統一風格小抄（貼入每次生成）**

```
Pokemon concept art by Ken Sugimori, official character illustration, {英文名},
(anatomically correct realistic bird species:1.5), beautiful natural habitat background,
edge-to-edge full illustration, highly detailed, vibrant colors, masterpiece, 8k,
sunny day, soft natural lighting --ar 3:4
```

反向提示詞（一定要帶）：

```
card frame, card border, text, hp, numbers, letters, logos, pokemon logo,
trading card UI, white border, black border, watermarks, signature, human, hands
```

> 香港常見種（例如 0022 栗樹鴨、0045 綠翅鴨）用「自然 habitat」會出到棕櫚／水塘背景，很貼題；
> 但**雀鳥比例**要靠 `anatomically correct` 這句頂住，否則會變 Pokémon 怪獸。

### 線 B：百科卡（AvianDex 風，GPT）— 建議只做精選

- 每張要 3–6 次重試（版面、錯字、簡繁），**成本約線 A 的 4–6 倍**
- 適合：最常被查的 60–80 種（麻雀、珠頸斑鳩、黑鳶、小白鷺、噪鵑、紅耳鵯、白頭鵯、鵲鴝…）
- 建議：先用線 A 出全集，之後逐批把「熱門種」升級成百科卡（同一編號換圖即可）

**升級路線**：先上插畫卡（收集感）→ 熱門種換百科卡（學習感）。網站唔需要改 code，`NNNN.avif` 覆蓋即可。

### 線 C：本地生成（零 API 成本，但要電腦）

- 用 Stable Diffusion / FLUX 在本機或免費 GPU（Colab）出圖，`--ar 3:4` + LoRA「Ken Sugimori style」
- 成本 = 電費；質量唔穩定，要有人執圖
- 適合：你完全唔想付 API 費，又肯花一晚調參數

---

## 2. 成本與時間（估算，非報價）

以線 A、548 張計：

| 項目 | 估算 |
|---|---|
| 生成嘗試次數 | 548 × 1.4 ≈ **767 次**（含重試） |
| 人手時間 | 每次 5–10 秒操作 → **約 2–4 小時**（分 4–5 個 session） |
| 圖片總容量 | 548 × ~140 KB ≈ **75 MB**（AVIF q≈55，1400×1867） |
| R2 儲存費 | 75 MB 在免費額度（10 GB）內 → **0 元** |
| R2 流量 | 免費額度 100 萬 Class B／月；569 張 × 每日 200 次瀏覽 ≈ 11 萬 → 仍免費，但**要綁自訂網域避免 r2.dev 限流** |
| Vercel | 唔受影響（圖不在 Vercel，只有 `/api/card` 代理在極端情況用） |

> ⚠️ 我無法替你查你帳戶的實際 API 價格與免費額度（本環境只連得到 GitHub／npm／PyPI）。
> 呢啲數字係一般公開行情：生成一張圖的 API 成本通常遠低於一杯咖啡的百分之一；真正的成本是**你的時間**。

---

## 3. 已經幫你做好的東西（即用）

### ① 工作單（含兩套現成提示詞）

```bash
npm run cards:worklist                     # 產出 22–569 全部 548 張
npm run cards:worklist -- --only 1         # 只出第 1 批（0022–0041）
npm run cards:worklist -- --style birddex2 # 只出插畫提示詞（線 A）
npm run cards:worklist -- --batch 25       # 每批 25 張
npm run cards:worklist -- --exclude-existing  # 先跑 cards:probe，自動剔走已有圖
```

輸出（`reports/`，已 gitignore）：

- `cards-todo.csv` — Excel／Google Sheet 開，一列一張卡，**提示詞可以直接複製去生成**
- `cards-todo.md` — 28 批進度表，做完打勾
- `cards-todo.json` — 給腳本／自動化用

### ② 每批驗收流程（3 步，2 分鐘）

```bash
npm run cards:probe:quick     # 或 cards:probe 全部
# 睇 reports/card-audit.md 的 ❌ 清單 → 補上傳
npm run dev                   # 開網站按頁首「重新掃描」
```

### ③ 命名／格式守則（前端已支援）

- 檔名：`NNNN.avif`（4 位補零），放 `aviandex/` 資料夾
- 副檔名：`.avif` 最好；`.webp` / `.jpg` 也讀得到（會自動逐個試）
- 尺寸：**直式 3:4**（例如 1400×1867）；卡片比例是 3:4，其他比例會被裁
- 壓縮：<https://squoosh.app/> → AVIF、Quality 50–60、Effort 4 → 約 100–150 KB

---

## 4. 需要你決定的事（4 條，答完我就可以落手）

1. **風格**：全集用插畫（線 A）？定係你要百科卡（線 B）先算完成？
2. **製作方式**：你自己用 GPT／BANANA 生？定要我幫你寫一份「可以餵給 API 的自動批次腳本」（你只提供 API key 在自己機跑）？
3. **範圍**：548 張全做，定係先做「香港最常見 100 種」（我可以照 eBird 頻度排一份優先次序）？
4. **網域**：會唔會為 R2 綁自訂網域？（會的話我寫一份 5 步設定＋驗收清單）

> 回答方式：直接講「1A、2自己生、3先100、4會」就得，我照住做。

---

## 5. 我順手發現、值得一齊處理的三件事

1. **0001–0021 是舊卡**：質素／比例未必同新卡一致。建議做完新一批後，抽 3 張舊卡對比，必要時重出（覆蓋同名檔即可）。
2. **缺少「閃卡」第二卡面**：`BIRD_ID_MAPPING.csv` 已預留 `NNNN_UR.avif`，程式有 `CARD_ALT_SUFFIX` 常數但未開 UI。
   如果你想做「異色／稀有版」，我可以加一個換面按鈕（少量 code，唔影響現有卡）。
3. **沒有 Google Sheet 版本**：如果你想把工作單放在 Drive 分派給同學／家長做，
   我可以加 `--sheet` 輸出一個可直接 import 的 TSV，或寫 Apps Script 自動讀寫進度。

---

*本文件為討論稿：數字為估算並已標明；凡未能查證的（例如你的實際 API 帳單）已寫明查不到。*
