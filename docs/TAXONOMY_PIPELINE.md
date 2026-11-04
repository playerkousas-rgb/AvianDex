# 分類權威資料鏈（Cornell-first）

> 一句話：**英文名、學名、目、科 一律以 eBird / Clements 為準；中文名只作顯示，永不反向改英文。**

這份文件是 AvianDex 資料層的「唯一說法」。任何人（包括未來的 AI agent）改資料前，
先讀完這 5 分鐘，就不會再把「網上抄來的名稱」當成事實。

---

## 1. 為什麼要改

之前 `birds.json` 只有 `{ id, name, en }` 三個欄位，`en` 有時是英文俗名、有時竟然是學名，
而且有 4 張卡是 `Unknown Species`。結果：

- 圖卡提示詞沒有可信的分類資料可注入 → 出圖靠猜；
- App 內 `scientificName` 一律是 `???` → 搜學名搜唔到；
- 中英名互相矛盾（例如 `0010 白腰文鳥 / Slaty-Breasted Rail`，一個係文鳥科、一個係秧雞科）。

分類欄位錯，之後所有東西（提示詞、圖卡、百科文案）都一齊錯。所以先修資料，再談出圖。

---

## 2. 權威與優先次序

| 欄位 | 權威來源 | 可否由中文反推 |
|---|---|---|
| `PRIMARY_COM_NAME`（英文俗名） | eBird / Clements Checklist | ❌ 不可以 |
| `SCI_NAME`（學名） | eBird / Clements Checklist | ❌ 不可以 |
| `ORDER` / `FAMILY`（目／科） | eBird / Clements Checklist | ❌ 不可以 |
| 中文名 | 中文維基百科（`variant=zh-hk`）／香港名錄 | ✅ 只影響顯示 |

遇到中英名衝突：**保留英文（權威），把中文名問題寫入報告交人手決定**。
這是刻意的——程式不會「幫你改名」，因為改名會令 569 張卡的編號與 R2 檔名全部錯位
（見 [`DATA_ISSUES.md`](./DATA_ISSUES.md)）。

---

## 3. 資料檔（各自角色）

| 檔案 | 內容 | 誰產生 |
|---|---|---|
| `src/data/ebird-taxonomy.csv` | Clements 物種表：code／英文名／學名／目／科 | `npm run ebird:taxonomy` |
| `src/data/ebird-taxonomy.meta.json` | 來源、抓取時間、物種數 | 同上 |
| `src/data/birdTaxonomy.json` | 每張卡對到的 eBird 分類（**前端唯一會 import 的檔**，77 KB） | `npm run birds:enrich` |
| `reports/enrich-birds.json` / `.md` | 同一批結果＋比對途徑＋衝突清單（審計用，不入前端） | 同上 |
| `src/data/name-aliases.generated.json` | 中文名 → eBird 代碼 → 英文名／學名 | `npm run aliases:build` |
| `scripts/cards/zh-name-codes.json` | eBird 代碼 → 中文名（1044 筆，來源見 §6） | 已內建 |
| `src/data/birdFacts.json` | 逐張卡的中文目／科／屬／IUCN（逐步補齊） | `npm run facts:fetch` |
| `reports/ebird-audit.md` | 純離線稽核：命中率、放錯學名、查不到 | `npm run ebird:audit` |

---

## 4. 標準流程（4 步，全部可以離線跑）

```bash
# ① 更新 Clements 分類表（三種來源，任一即可）
npm run ebird:taxonomy                                  # GitHub 快照（免 key）
EBIRD_API_KEY=xxx npm run ebird:taxonomy -- --api        # eBird 官方即時版（最權威）
npm run ebird:taxonomy -- --file ~/ebird_taxonomy_v2024.csv   # 用你已下載的 CSV

# ② 中文名別名表（用 eBird 代碼做橋，救回「英文名填錯」的卡）
npm run aliases:build

# ③ 把權威分類接上每張卡
npm run birds:enrich            # 先睇報告（預設 dry-run，唔會改檔）
npm run birds:enrich -- --apply # 確認後寫入 birds.json（會備份 .bak）

# ④ 中文目／科／屬（可選，需網絡；維基要加 redirects=1）
npm run facts:fetch -- --from 22 --to 41
npm run facts:build
```

跑完 `③` 之後，`npm run build` 就會把 `birdTaxonomy.json` 打包入前端，
卡片立刻有真學名可顯示、可搜尋。

---

## 5. 現在的真實狀況（別美化）

| 項目 | 數字 |
|---|---|
| 卡片總數 | 569 |
| 已對上 eBird | **559**（98.2%） |
| 英文名本來就完全正確 | 513 |
| 英文名欄位放了學名 → 已改成 eBird 正式名 | 38 |
| 英文名係 `Unknown Species` → 靠中文名別名救回 | 8（其中 6 張已修好） |
| 中英名指向不同物種（**未自動改，等拍板**） | 9 |
| 仍然完全對不上 | 10 |

### 常見三種錯（實際例子）

1. **英文名放了學名**
   `0049 青頭潛鴨 / Aythya Baeri` → eBird 正式名係 **Baer's Pochard**（`Aythya baeri`）。
2. **英文名與中文名係兩隻雀**
   `0010 白腰文鳥 / Slaty-Breasted Rail`（秧雞科）→ 中文名對應 **White-rumped Munia**（梅花雀科）。
   程式保留英文，報告標紅，由你決定改中文還是改英文。
3. **eBird 改了名，舊名查不到**
   `0272 蒼鷹 / Northern Goshawk` → 現名 **Eurasian Goshawk**（`Astur gentilis`）；
   `0243 中白鷺 / Intermediate Egret` → **Medium Egret**。

### 已知限制（誠實講）

- `zh-name-codes.json` 用的是**台灣**鳥名（來源見 §6），香港叫法會有出入
  （例如台灣「白頰山雀」＝ 香港「遠東山雀」）。所以它只用來**交叉核對**，不是中文名最終權威。
  最終中文名應該由你按香港名錄拍板，再寫入 `birds.json`。
- 沙盒環境連不到 Wikipedia（只有 GitHub 通），所以本輪的中文查證在沙盒內跑不到；
  `npm run zh:resolve` / `facts:fetch` 需要在你自己的電腦跑。
- eBird 的 `FAMILY` 欄帶英文解釋（`Corvidae (Crows, Jays, and Magpies)`），
  寫入 `birdTaxonomy.json` 時已去掉括號部分，只留 `Corvidae`。

---

## 6. 授權與出處（要保留）

- **eBird / Clements Checklist** — Cornell Lab of Ornithology。
  分類資料以 Clements 為準；使用時請在頁尾標明 `eBird / Clements Checklist`（已在 `src/App.tsx` 頁尾）。
- `scripts/cards/zh-name-codes.json` — 由 [ChrisTorng/eBirdScripts](https://github.com/ChrisTorng/eBirdScripts)
  的 `counter/data/species-names.json`（**MIT License, © 2024 ChrisTorng**）轉出，
  只保留 `code` 與中文名兩欄。若日後改用香港名錄，請跑
  `npm run aliases:build -- --roster <你嘅名錄.csv> --name-col 中文名` 覆蓋，並保留原本出處說明。

---

## 7. 之後要做的

- [ ] 9 個中英衝突由用戶拍板（見 `reports/enrich-birds.md`「⚠️ 中英名指向不同物種」）
- [ ] 10 張對不上的卡：補正確英文名（或由香港名錄的 CODE 對回）
- [ ] 在自己電腦跑 `npm run zh:resolve -- --all`，把中文名統一成香港繁體
- [ ] 用 `npm run facts:fetch` 補齊目／科學名以外的中文欄位（IUCN、亞種）
- [ ] 提示詞（`prompt-builder.mjs`）已接 `birdFacts.json`；下一步改接 `birdTaxonomy.json`，
      令「未跑維基」的卡都至少有權威英文名／學名／目／科可用
