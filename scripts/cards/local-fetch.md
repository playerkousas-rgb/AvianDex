# 在你部機跑：COPY-PASTE 指令

> 目標：**中英文都要有，而且盡量準**。
> 分工：
> - **英文名／學名／目／科**：已經有（eBird/Clements＝康奈爾），不用再抓。
> - **真實相片＋授權**：康奈爾 Macaulay Library（下面第 2 步）。
> - **卡上的英文／中文段落**：維基原文（eBird 只有一句簡短描述，寫不成 7 格）。
> - 我這邊只負責合併、排版、出圖。

---

## 0. 先拿最新分支

```bash
git clone https://github.com/playerkousas-rgb/AvianDex.git
cd AvianDex
git checkout arena/3be6342b-aviandex
npm install
node -v      # 需要 18 以上（20 / 22 最好）
```

> 已經有工作副本的話：`git fetch origin && git checkout arena/3be6342b-aviandex && git pull`

---

## ⚠️ 先看這個：`ENOENT ... data\cardCopy.local.json`

你遇到的是**舊版程式的 bug**（寫檔前沒有建 `data/` 目錄；新 clone 沒有這個資料夾）。
已修好，請先 `git pull` 再跑。順帶修好：`--out` 指向新檔案時，會自動用
`src/data/cardCopy.json` 做底稿（不會把已有 548 張資料由零開始覆蓋）。

```bash
git pull
```

## 1. 文字資料：中英維基原文（15 欄）

### 1a. 先試 5 張（1 分鐘）

```bash
node scripts/cards/extract-bilingual.mjs --ids 0008,0001,0002,0003,0007 --out data/cardCopy.local.json
```

### 1b. 全量 548 張（約 20–40 分鐘，可以斷線再跑）

```bash
node scripts/cards/extract-bilingual.mjs --resume --out data/cardCopy.local.json --delay 500
```

- `--resume`：跳過中英各已有 ≥5 欄的卡，斷線／關機都可以下次接住跑
- 每完成一張即寫檔，Ctrl-C 不會白做
- 出現大量 `429` 就加大：`--delay 900`
- 想先做前面 120 張：`--from 1 --to 120`

---

## 2. 相片：Macaulay Library（康奈爾，免 key）

### 2a. 先驗證工具能不能用（重要，30 秒）

```bash
node scripts/cards/download-macaulay.mjs --ids 0008 --check
```

會印出一隻雀的照片清單（JSON）。**貼回給我**，我就可以按真實欄位名修正解析器。

> 如果兩個端點都失敗（`fetch-failed`），代表康奈爾改了 API —— 把錯誤訊息貼給我。

### 2b. 試下載一張

```bash
node scripts/cards/download-macaulay.mjs --ids 0008 --dry-run
node scripts/cards/download-macaulay.mjs --ids 0008
```

成功的話會出現：
```
✅ 0008 鵲鴝 → 0008-photo.jpg（420 KB，CC BY 4.0）
```

### 2c. 批量下載（先做 30 張看質素）

```bash
node scripts/cards/download-macaulay.mjs --from 1 --to 60 --limit 30
```

確認 `cards/art/Credits.md` 有作者／授權／原連結之後，才做全量：

```bash
node scripts/cards/download-macaulay.mjs --all
```

**授權規則（寫死在工具裡）**：
- 只自動下載 `CC0` / `CC BY` / `CC BY-SA` / Public Domain
- `CC BY-NC`、`All rights reserved`、授權不明 → **只記錄連結，不下載**
- 要特例放寬（例如學校內部使用）才加 `--allow-nc`

---

## 3. 文字寫到哪？（你問的這一步）

檔案一定在你的 repo 內，兩個都在：

| 檔案 | Windows 完整路徑 | 內容 |
|---|---|---|
| **成品（要交回）** | `D:\AvianDex-work\AvianDex\data\cardCopy.local.json` | 548 張，其中你抽的 5 張有中英文案 |
| 報告 | `D:\AvianDex-work\AvianDex\reports\copy-bilingual.md` | 每張幾多欄、pageid |

**唔想上傳都可以先睇**（新增！）：

```bat
node scripts/cards/show-picks.mjs --file data/cardCopy.local.json --ids 0008 0001 0002 0003 0007
```

會直接印出：
```
0008 鵲鴝　中 13 欄／英 12 欄　印 7 格
  來源：zh.wikipedia 鵲鴝 · pageid 219197 ｜ en.wikipedia Oriental magpie-robin · pageid 43235520
■ 分佈地區　　　 分布於…
■ 棲息環境　　　 …
□ 成長與繁殖　　（有資料但今次唔印）
  ■ = 會印在卡面　□ = 有資料但今次不印
```

- 加 `--lang en` 看英文版
- 加 `--md` 寫一份 `reports/copy-review.md`
- 確認無誤後 **一鍵合併**：`--write`（會先備份 `cardCopy.json.bak`）
```bat
node scripts/cards/show-picks.mjs --file data/cardCopy.local.json --write
```
- 只想合併，不想覆蓋整個檔：把 `--ids` 也加上

> 由 `data\cardCopy.local.json` 到 `src/data/cardCopy.json` 的關係：
> 前者是「本機工作檔」，後者才是「出圖讀的檔」。`--write` 只會覆蓋
> **本次有文案的那幾張**，其餘 543 張原封不動。

## 4. 交回對話（三個方法，任選）

| 方法 | 做法 |
|---|---|
| **A（推薦）** | 上傳 `data/cardCopy.local.json` ＋ `cards/art/Credits.md` |
| **B** | 上傳 `reports/copy-bilingual.md` ＋ `reports/photos.md`（先看覆蓋率） |
| **C** | 打包 `zip -r aviandex-data.zip data/cardCopy.local.json cards/art reports` 之後上傳 |

> `data/*.local.json` 已加入 `.gitignore`，不會誤入 repo。
> 相片在 `cards/art/`（同樣不入 Git，我們只保留 Credits 清單）。

---

## 5. 常見錯誤

| 訊息 | 原因 | 解法 |
|---|---|---|
| `Client network socket disconnected` | VPN／公司網絡攔截 | 關 VPN，或用手機熱點 |
| 連續 `429` | 抓太快 | `--delay 900` |
| `找不到 ImageMagick（convert / magick）` | 未裝 | Windows：`winget install ImageMagick.ImageMagick`；macOS：`brew install imagemagick` |
| `ENOENT ... data\cardCopy.local.json` | 舊版未建 `data/` 目錄 | `git pull` 後再跑（已修） |
| 卡面照片好模糊 | 只抓到細圖 | 工具已擋短邊 < 900px；如全部被擋，加 `--min-w 700` 放寬 |
| `❓ 找不到學名` | 維基用舊學名／重定向 | 記下編號貼回，我人手指定 pageid |
| `no-licensed-photo` | 該物種在 Macaulay 只有 NC／版權所有 | 正常。之後可以用 Wikimedia Commons 補（授權通常 CC BY-SA） |
| 英文欄位比中文少 | 中文維基有「文化」章節，英文維基冇 | 正常，英文卡缺的格印 `Data pending`，不會用中文填 |

---

## 6. 我收到之後會做

1. 合併 `cardCopy.local.json` → `src/data/cardCopy.json`，跑 69 項測試 + 跨物種核對
2. 把 `cards/art/NNNN-photo.jpg` 接上卡面（有相就印圓形特寫，冇相就印外形特徵）
3. 重出兩個單檔工作室，並排出一張 `0008` 中文版／English 版對照
4. 出一份覆蓋率表：每張卡「中幾欄／英幾欄／有無授權相片／印哪 7 格」
