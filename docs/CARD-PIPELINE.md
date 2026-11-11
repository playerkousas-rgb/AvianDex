# AvianDex 資訊卡出圖流程（交接文件）

> 最後更新：2026-11-11
> 這份文件寫給「換了 Google 帳號、重新開始」的情況：所有東西都在 Git 裡，
> 成品圖在雲端（Drive / R2），兩邊靠 `manifest.json` 對上。

---

## 0. 一句話總結

**卡面 = 你的樣板（管版面）× repo 資料（管內容）× AI 出圖**
文字一律由 repo 產生並鎖死，AI 只負責排版與畫鳥，不准自己作數字。

---

## 1. 為什麼不是「整張卡交給 AI」

已實測失敗一次（`docs/card-samples/` 有記錄）：

| 做法 | 結果 |
|---|---|
| 只用文字描述版面，叫 AI 出整張卡 | 版面與原版不同，數字被 AI 自編（體長、體重、星級全錯） |
| 只給一張原卡當參考 | 版面 90% 對，但**模板上的小字被一併抄落**（放大鏡說明、可混淆物種、繁殖期） |
| **給「去字位圖」＋原卡＋18 格逐格文字** | 18 格全部換對，模板殘留清零 ✅ |

---

## 2. 三個檔案，各有分工

| 檔案 | 作用 | 入 Git？ |
|---|---|---|
| `scripts/cards/gen-card-prompts.mjs` | 由 repo 資料砌出 **18 格（Z01–Z18）鎖死文字** | ✅ |
| `scripts/cards/make-zone-map.py` | 畫**去字版面位圖**（只有框線、標題條、圓圈、雷達，冇任何物種字） | ✅（產出 `docs/card-samples/zonemap-naturalist.png`） |
| `scripts/cards/qa-card.mjs` | 出圖前後**機器檢查**：名稱、數字溯源、簡體字、模板殘留 | ✅ |
| `scripts/cards/pack-cards.mjs` | 壓成 **AVIF** ＋ 每 50 張分卷 zip ＋ `manifest.json` | ✅ |
| `scripts/cards/gen-missing-report.mjs` | 產生進度與缺資料清單 `deliver/cards-progress.md` | ✅ |

---

## 3. 出圖指令

```bash
# ① 砌一張卡的 18 格文字（印出來核對）
node scripts/cards/gen-card-prompts.mjs 0023

# ② 出圖（人工／agent 用 generate_image，附兩張圖）
#    IMAGE 1 = docs/card-samples/zonemap-naturalist.png（版面）
#    IMAGE 2 = 你的原卡（觀感參考）
#    prompt  = 步驟①的輸出，改成「逐格列出」格式

# ③ 檢查
node scripts/cards/qa-card.mjs 0023

# ④ 打包（AVIF + 分卷 + manifest）
node scripts/cards/pack-cards.mjs --in data/card-demo/out --out deliver/cards
```

---

## 4. 壓縮：為什麼用 AVIF

實測同一張卡（848×1264）：

| 格式 | 大小 | 備註 |
|---|---|---|
| PNG | 1.9 MB | 原圖，**不可**大量入 Git |
| WebP q86 | 178 KB | |
| **AVIF q50 effort5** | **83 KB** | 細字仍清晰（已局部放大核對） |

569 張估算：**約 48 MB**（AVIF）→ 分 12 卷 zip，每卷約 4 MB。

打包參數在 `pack-cards.mjs` 內：
`--long 1400`（長邊）、`--q 50`、`--effort 5`、`--per 50`（每卷張數）。

---

## 5. 存哪裡（不進 Git）

`.gitignore` 已排除：

```
public/demo/card-*.png
deliver/cards/
```

雲端路徑（跟現有插畫一致，app 已按此規則取圖）：

```
r2://…/aviandex/cards/aviandex-0001.avif   ← 卡面
r2://…/aviandex/cards/manifest.json        ← 編號 → 檔名、bytes、sha256
```

`src/lib/cardImage.ts` 已經支援 `aviandex/<NO>.avif` 這條通道（翻轉面），
上傳後把 `manifest.json` 一併放上去，app 就會自動取卡。

**Google Drive 只作暫存／備份**，不作正式來源（R2 才是 CDN）。

---

## 6. 已定規則（不可倒退）

1. **不准機翻、不准改寫**；中欄只放中文、英欄只放英文。
2. 抽不到的資料 → 印「**資料待查**」，**不准 AI 補**。
3. 卡面數字必須能在 repo 找到（`qa-card.mjs` 會逐個核對）。
4. 簡體字一律不可出現（`qa-card.mjs` 有偵測表）。
5. 卡面只准一隻鳥，不准出現第二個物種。
6. 用 569 張現成插畫，**不要另製鳥圖**。
7. 評分叫「**圖鑑評分**」，標明「自訂指標」。
8. 版面唯一權威＝用戶的卡；AI 只准照抄版面。

---

## 7. 進度

看 `deliver/cards-progress.md`：

- 569 隻中，**76 隻資料齊全**（缺 0 項）
- 92 隻缺 1 項、102 隻缺 2 項……
- 建議**先出齊全的 76 隻**（卡面最完整），再逐批往下

---

## 8. 換帳號後要做的三件事

1. `git pull` 這一條分支（或 main）
2. 開 Google Drive 資料夾，把 `deliver/cards/zips/*.zip` 上傳（Drive 只暫存）
3. 要正式上線時：把 AVIF 上傳到 R2 `aviandex/cards/`，連 `manifest.json` 一齊

到時你只需要告訴我「Drive 好了」或「R2 好了」，我就繼續批次出圖。

---

## 9. 實跑紀錄（2026-11-11，由 0022 起）

- 新增 `node scripts/cards/gen-card-prompts.mjs <NO> --agent`：輸出給 `generate_image` 的精簡 prompt
  （附 2 張圖：`docs/card-samples/zonemap-naturalist.png` ＋ `0022-v3.webp`）。
- v2 修正：Z10 補滿 5 項（缺的印「資料待查」）、Z12 雷達固定順時針順序
  （生物重要性→物種適應力→研究價值→保育關注度→觀賞價值）、規定只准 4 個放大鏡。
- 已出：0022、0023（AVIF ~96 KB），Drive 資料夾 `AvianDex-cards-draft`（待審，未上 R2）。
- **實測問題（AI 整張出字的天花板）**：
  1. 小字繁體會出現錯字／亂碼，簡體字會混入（如 0022 保育欄「万平方公里」）。
  2. 英文小標題偶爾拼錯（ECOLOGICAL → ECOLOGICAL／ECOLDOGICAL）。
  3. 版面位圖的 `Z06…` 區碼會洩漏成卡面標題（0023）。
  4. 第 5 個放大鏡空圈／Z10 編號跳號，屢禁不止。
- 資料源問題：0024 文案帶 `* ` 前綴；0025 相似種「印缅斑嘴鴨」含簡體字「缅」。

## 10. 一鍵出圖工具（給 Gemini Canvas）

```bash
npm run cards:maker      # → tools/card-studio/aviandex-card-maker.html（約 4 MB，569 隻）
```

- 打開（或貼進 Gemini Canvas）→ 選編號 → 按「生成這一張資訊卡」。**不用貼 prompt**。
- 內嵌：去字位圖（IMAGE 1）＋樣本卡 0022-v3（IMAGE 2）＋每隻鳥已砌好的 18 格鎖死文字 prompt。
- 「連續生成」可由當前編號起一次出 2–20 張；撞額度（429）會自動停。
- 每張卡下面有「必對清單」（編號、名稱、體長、體重、保育級別、雷達五數、總評分），人工逐張核對。
- 母版：`tools/card-studio/cardmaker.html`；`aviandex-card-maker.html` 為產物，勿手改。
- Prompt 新增「SECTION TITLES」：明講各區標題，並禁止印出位圖上的 `Zxx` 區碼。
- 資料清理：開頭的 `* ` 自動去掉；相似種名稱「缅」自動轉「緬」。
