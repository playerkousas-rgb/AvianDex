# 本機抽資料：一鍵跑完，交回對話

> 你的電腦連維基比沙盒快得多，所以抓資料在**本機**做，沙盒只負責排版與出圖。
> 全部指令都是「只讀維基、只寫本機檔案」，不會碰你的 git 分支，也不需要任何 secret。

## 0. 一次性準備（Windows / macOS 都要）

```bash
node -v          # 需要 18 以上
```
專案已有的依賴（若未安裝過）：`npm install`
抽取器本身只用 Node 內建模組，**不需要額外套件**。

## 1. 先試 5 張（1 分鐘）

```bash
node scripts/cards/extract-bilingual.mjs --ids 0008,0001,0002,0003,0007 --out data/cardCopy.local.json
```

成功的話會見到類似：

```
✅ 0008 鵲鴝 — 中 6 欄／英 5 欄，印 7 格（range/habitat/diet/highlights/look/breeding/funFact）
💾 已寫入 data/cardCopy.local.json
```

> `--out` 讓輸出寫去**另一個檔案**，不會動到 repo 的 `src/data/cardCopy.json`。
> 試完之後，把 `data/cardCopy.local.json` 貼回對話，我幫你合併。

## 2. 全量跑（548 張，約 20–40 分鐘）

```bash
node scripts/cards/extract-bilingual.mjs --resume --out data/cardCopy.local.json
```

- `--resume`：跳過「中英都已 ≥5 欄」的卡，可以斷線後再跑，不會重複抓
- **每完成一張就寫一次檔**，中途按 Ctrl-C 都不會白做
- 想更快就加 `--delay 300`（每頁之間等 300ms；太快的話維基會回 429）
- 想先做某個範圍：`--from 1 --to 120`

## 3. 交回對話的三個方法（任選一個）

| 方法 | 做法 | 適合 |
|---|---|---|
| **A. 直接上傳檔案** | 把 `data/cardCopy.local.json` 拖進對話 | 最簡單（檔案約 2–4 MB） |
| **B. 貼報告** | 上傳 `reports/copy-bilingual.md`（只列每張卡抽到幾欄） | 想先看覆蓋率再決定 |
| **C. 自己覆蓋再 commit** | `cp data/cardCopy.local.json src/data/cardCopy.json`，然後 `git add -A && git commit` | 你自己有 git 流程 |

## 4. 常見問題

| 症狀 | 原因 | 解法 |
|---|---|---|
| `Client network socket disconnected` | 公司／學校網絡或 VPN 攔截 | 關 VPN、或用手機熱點 |
| 連續很多 `429` | 抓太快 | 加 `--delay 800` |
| 某幾張一直 `❓ 找不到學名` | 該學名在維基是重定向或別名 | 記錄編號交回，我人手指定 pageid |
| 中文有、英文冇 | 英文維基用另一個學名（舊分類） | 正常，英文卡該格會印 `Data pending` |
| 想重抓某些卡 | 快取在 `.cache/wiki/` | 加 `--no-cache` |

## 5. 這次加油了什麼（v3.1）

- **infobox 直讀**：`length`／`weight`／`status`(IUCN)／`別名` 由 `{{Speciesbox}}` 參數抽，
  卡面右上角「身長／體重」不再長期空白（之前只掃正文，所以幾乎全空）
- **每張即時寫檔**：斷線不會白做
- **`--resume`**：續跑
- **`--out`**：寫去獨立檔案，不會污染 repo
- **IUCN 分中英兩份**（`iucn` / `iucnEn`）：中文卡印「無危 LC」、英文卡印「Least Concern (LC)」，不臨時翻譯

## 6. 我這邊收到檔案之後會做

1. 合併進 `src/data/cardCopy.json`，跑 `npm test`（65 項）與跨物種核對
2. 重出 `tools/card-studio/aviandex-studio.html`（中文／English 一鍵切換）
3. 出一張 `0008` 中文版 + 英文版對照圖，讓你確認英文版面
4. 更新覆蓋率報表（每張卡：中幾欄／英幾欄／印幾格）
