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

### 已確認的方向（2026-11-04）

| 項目 | 決定 | 備註 |
|---|---|---|
| 卡面風格 | **百科卡（AvianDex／GPT 風）** | 你揀 B |
| 製作方式 | **免費本地生成**（Stable Diffusion／ComfyUI／WebUI／Colab） | 你揀 C；零 API 費，但要調參數 |
| 第一批 | **先試 1 張**（NO.0289 普通翠鳥） | 提示詞由你提供 |
| 自訂網域 | 暫時唔急，先用 r2.dev | 程式已支援 `VITE_R2_BASE_URL`，日後一行 env 切換 |

---

## 3.5 免費本地生成：完整流水線（已寫好並實測）

你要做的只有兩件事：**跑起一個本地生成服務**、**把提示詞放進 `cards/prompts/`**。
其餘（3:4 裁切、壓成 AVIF ~150 KB、命名 `NNNN.avif`、斷點續傳、上傳 R2）全部自動。

### ① 起一個本地 API（三選一，都是免費）

| 方案 | 起服務的指令 | 對應設定 |
|---|---|---|
| **A1111 WebUI** | `./webui.sh --api --listen` | `GPT_CARD_ENDPOINT=http://127.0.0.1:7860/sdapi/v1/txt2img`、`GPT_CARD_RESPONSE=json` |
| **ComfyUI** | 需要 `ComfyUI-to-API`／`comfyui-api` 節點 | `GPT_CARD_RESPONSE=json`（回傳 base64） |
| **Colab 免費 GPU** | 開 notebook 起 WebUI，複製公開連結 | 把 `127.0.0.1:7860` 換成 Colab 的 `xxxx.gradio.live` |

> 香港常見種用 SDXL + `ken sugimori` LoRA 或內建漫畫風 checkpoint 已經夠靚。
> **關鍵**：維持 `--width 1400 --height 1867`（3:4），或者在 WebUI 直接出 1024×1365 再由腳本放大。

### ② 把你的提示詞放進去

```bash
mkdir -p cards/prompts
# 你寫好之後：把內容貼入 cards/prompts/0289.txt（一張卡一個檔）
```

冇放檔案的卡，會自動用內建模板（維護需知原有的 AvianDex 句式，已含 NO.編號、香港分佈、評分卡）。

### ③ 出圖（可斷點續傳）

```bash
# 只出 1 張（先試效果）
node scripts/cards/generate.mjs --ids 0289

# 確認提示詞變咩樣（唔會出圖）
npm run cards:prompt -- 0289

# 出第一批 20 張
node scripts/cards/generate.mjs --from 22 --to 41

# 香港常見優先（59 張，已排好次序）
npm run cards:worklist -- --priority            # 先睇名單（reports/cards-todo.md）
node scripts/cards/generate.mjs --priority-list 0436,0245,0248,0240,0249,0242,0247,0104,0100,0289

# 中途 Ctrl+C 冇問題：已完成的會記在 cards/out/.done，再跑會自動跳過
node scripts/cards/generate.mjs --from 22 --to 41
```

輸出：`cards/out/0289.avif`（1400×1867、~150 KB）＋ `cards/out/log.csv` 記錄每張的成敗。

### ④ 上傳 R2（三選一）

```bash
# A. rclone（最簡單；rclone config 加一個 R2 remote）
node scripts/cards/generate.mjs --upload rclone --from 22 --to 41
# 需要：R2_RCLONE_REMOTE=r2  R2_BUCKET=aviandex

# B. wrangler（有 Cloudflare 帳號 token）
node scripts/cards/generate.mjs --upload wrangler

# C. 手動：直接把 cards/out/*.avif 拖入 Cloudflare Dashboard → R2 → aviandex/
```

### ⑤ 驗收（每批 2 分鐘）

```bash
npm run cards:probe        # 睇 reports/card-audit.md 的 ❌ 清單
npm run dev                # 開網站 → 頁首「重新掃描」→ 睇「已解鎖圖卡」數字有冇升
```

### 百科卡質素檢查表（每批抽 3 張睇）

- [ ] **NO.編號正確**（最常出錯：變成 NO.28、NO.0289 以外）
- [ ] **中文名字正確、繁體**（AI 常出簡體：鳶→鸢、鷺→鹭）
- [ ] **雀鳥物種正確**（唔好變成另一種翠鳥）
- [ ] 3:4 直式，主體唔被裁
- [ ] 文字密度夠但唔擠，縮到卡片大小仍讀得到主要標題
- [ ] 沒有假 logo／假 QR code／亂碼字塊

> 不合格就重跑該張（`--ids 0289 --force`），提示詞加一句
> 「all Chinese text must be Traditional Chinese, no simplified characters」。

### 我已實測的事（可信）

- 用一個 mock 生成服務實跑：**API 500 → 自動重試 → 成功**，輸出 3:4 AVIF、可斷點續傳（再跑會跳過已完成）
- `cards/prompts/NNNN.txt` 自訂提示詞優先，冇檔就用模板
- `npm run cards:prompt -- 0289` 印出完整提示詞（你只需核對用字）
- **未實測**：真實 SDXL／ComfyUI／Colab 出圖質素（本環境無 GPU、無瀏覽器）

### 關於「先試一張」的建議

你想先睇一張再決定，這是最正確的做法。不過本環境**無 GPU / 無瀏覽器**，
唯一能出圖的是雲端生圖模型（Gemini／GPT 生圖），效果會同你在本機 SDXL 出的**唔一樣**，
所以用它在這裡試，參考價值有限。

更有效率的做法（我建議）：

1. **你把提示詞貼過來**（或寫入 `cards/prompts/0289.txt`）；
2. 我先幫你**潤飾提示詞**（對照 HK 分佈、字體正確性、3:4、避免簡體字），並用 `npm run cards:prompt -- 0289` 印出最終版；
3. 你在本機／BANANA 出 1 張，貼回來；
4. 我按住張圖幫你**寫死一套「版式規格」**（例如標題位置、資料塊數量、配色），之後 548 張都用同一套，風格才會一致。

> 如果你仍然想我在這裡出一張「概念圖」睇構圖（非本機效果），講一聲即可，我照出。

### 做唔到／限制（照實講）

- 我**不能**在這環境跑 Stable Diffusion（無 GPU、無 external 網絡下載模型）
- 我**不能**替你上傳 R2（無你的 Cloudflare 憑證，而且我不應持有）
- 所以：**生成、上傳在你的電腦發生**；我只保證腳本、驗收、網站端全部就緒

---

## 3.6 若之後想改用付費 API（成本比較）

同一支腳本，把 `GPT_CARD_ENDPOINT` 換成付費端點即可（`GPT_CARD_RESPONSE=base64|url`），
不需要改任何 code。到時你只需決定「每張值幾多錢」。

---

## 5. 我順手發現、值得一齊處理的三件事

1. **0001–0021 是舊卡**：質素／比例未必同新卡一致。建議做完新一批後，抽 3 張舊卡對比，必要時重出（覆蓋同名檔即可）。
2. **缺少「閃卡」第二卡面**：`BIRD_ID_MAPPING.csv` 已預留 `NNNN_UR.avif`，程式有 `CARD_ALT_SUFFIX` 常數但未開 UI。
   如果你想做「異色／稀有版」，我可以加一個換面按鈕（少量 code，唔影響現有卡）。
3. **沒有 Google Sheet 版本**：如果你想把工作單放在 Drive 分派給同學／家長做，
   我可以加 `--sheet` 輸出一個可直接 import 的 TSV，或寫 Apps Script 自動讀寫進度。

---

*本文件為討論稿：數字為估算並已標明；凡未能查證的（例如你的實際 API 帳單）已寫明查不到。*
