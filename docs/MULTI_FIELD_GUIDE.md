# AvianDex v1.9 — 多線索圖鑑、全中文／全英文、觀鳥禮儀與裝備

> 這一版的四件事，都是「書本做不到、但圖鑑應該做得到」：
> 用多條線索搵雀、一撳就見相似鳥、中英完全分開、行山前先讀該知的規矩。

---

## 1. 多線索搜尋（你說「一本真圖鑑應該係咁」）

新增 `src/data/explorerIndex.json`（約 120 KB，由 `npm run cards:explorer` 產生），
每一隻雀都有一組索引：

| 線索 | 例子 | 來源 |
|---|---|---|
| 中文名 | `鵲鴝` | `birds.json` |
| 英文名 | `magpie-robin` | eBird `comName` |
| 學名 | `Copsychus saularis` | eBird `sciName` |
| 目／科（中英） | `雀形目`、`Passeriformes`、`鶲科`、`Muscicapidae` | eBird ＋ `taxonomyZh.json` |
| eBird 代碼 | `magrob` | eBird `speciesCode` |
| 編號 | `0008` | `birds.json` |
| **屬性：食乜** | 昆蟲・魚・蛙類・爬蟲・蟹蝦・螺貝・蠕蟲・蜘蛛・果實・種子穀物・花蜜・嫩芽花葉・腐肉・鼠類・其他鳥類・植物藻類・雜食 | 由 `cardCopy.json` 的 `diet` 文案比對詞彙表 |
| **屬性：住邊** | 森林・濕地・水邊・草地農田・城市公園・山地・開闊地 | 由 `habitat` 文案比對 |

**標籤規則**：只用已校對的短文案（`copy.diet` / `copy.habitat`）比對，
比對唔到就留空 —— 寧願少一個標籤，都唔好亂標。
目前覆蓋率：食乜 **380 / 559**、住邊 **391 / 559**（其餘的卡本身冇該欄文案）。

### 相似鳥類

`similarBirds(id)` 的計分：

| 條件 | 分數 |
|---|---|
| 同科 | 40 |
| 同目（非同科） | 15 |
| 同屬 | 10 |
| 每個共同「食乜」標籤 | 8 |
| 每個共同「住邊」標籤 | 6 |
| 體長相差 ≤ 20% | 6（≤ 40% 得 3） |

例：`0008 鵲鴝` → 白腹藍姬鶲、紅尾歌鴝、白喉磯鶇、北灰鶲（同科・食昆蟲・住森林）。
每隻相似鳥都會寫出**原因**，唔會突然彈一隻冇關係的雀出來。

---

## 2. 詳細資料頁（重寫）

- 位置：圖鑑機 →「詳細資料 / RESEARCH」
- 內容：外形・食物・棲息・分佈・繁殖・冷知識・鳴聲・行為・遷徙・保育・人與鳥・名稱由來
- 文案：`npm run cards:details` 產生 **`cardDetails.zh.json`（597 KB）** 與 **`cardDetails.en.json`（638 KB）**，
  App 用 `import()` 只在撳入詳細資料時才載入，首頁唔會多付 1.2 MB
- 中英完全分開：英文只取維基英文原文（`fieldCopy[].en`），**缺就印 `Data pending`**，
  不會用中文頂替、不會機翻（有測試守）
- 舊的六宮格「科學研究中心」已收起，四個外部連結（eBird／Macaulay／Xeno-canto／All About Birds）
  移到頁底，全部用 eBird 代碼或學名組成，唔會再「撳完冇嘢睇」

---

## 3. 觀鳥禮儀 / 觀鳥裝備（新增）

`src/data/fieldGuide.ts` + `src/components/FieldGuideModal.tsx`，中英各一套：

**觀鳥禮儀**：保持距離・聲音引誘（playback）・不餵食不誘拍・巢蛋幼鳥・記錄與分享・法例與安全
**觀鳥裝備**：最基本・實戰加分・香港環境對應（濕地／林徑／夜觀）・**衣著與鞋（顏色、長袖長褲、帽子、防水鞋、雨衣、背包、防曬驅蚊）**・保養與安全

入口：頂欄按鈕（桌面＋手機選單）、詳細資料頁底部。每頁底部有官方連結
（香港觀鳥會、漁護署、eBird 敏感物種政策）。

---

## 4. 全中文 vs 全英文：為什麼唔拆兩個網站

**建議：同一個 App，加一個語言掣（已實作）。**

| 做法 | 好處 | 代價 |
|---|---|---|
| 拆成兩個站／兩個 repo | 「一眼睇落去係兩本書」 | 兩份程式、兩份 CSS、兩份 bug；改一個掣要改兩次；SEO／網址要養兩套 |
| **同一個 App ＋ 語言掣（現況）** | 一份程式，兩份文案；資料缺一邊就印 `Data pending`，唔會中英夾雜 | 極少數要為英文另寫 UI 字（已用 `L('中','en')` 處理） |

判斷準則：**如果「中文版」與「英文版」只是同一批卡的文字不同 → 一個 App；
如果要分開賣、分開審批、分開品牌 → 才拆。** 你現在是前者，所以唔值得拆。

語言掣位置：頂欄右上（`中文` / `EN`）＋手機選單。選擇會記住（`localStorage: aviandex.lang`），
並同步寫入 `<html lang>`（`zh-Hant-HK` / `en`）。

切換後會一齊變的：卡面標題（英文模式主標題用英文俗名）、詳細資料頁、搜尋與屬性標籤、
觀鳥禮儀／裝備、圖鑑機按鈕與提示。卡面圖畫本身不變（圖上已經印死中英雙語，屬設計）。

---

## 指令

```bash
npm install
npm run cards:data        # 重新產生 explorerIndex.json + cardDetails.{zh,en}.json
npm run cards:studio      # 卡面工作室成品（3.9 MB）
npm run cards:image-studio# 出圖工作室成品（5.2 MB）
npm test                  # 85 項（84 pass / 1 skip）
npm run lint
npm run build
```

## 已知限制

- 食乜／住邊標籤只靠文案比對，沒有文案的 179 張卡（食乜）／168 張（住邊）暫時冇標籤；
  要補就補 `cardCopy.json` 的 `diet` / `habitat`，再跑 `npm run cards:explorer`。
- 8 張卡（0236・0239・0269・0270・0379・0382・0423・0430）完全冇中文文案，
  詳細資料頁會明講「只有基本資料」，並提供外部連結。
- 英文詳細資料約有 559 張全部有（維基英文原文），但個別欄位可能短缺 → `Data pending`。


---

## 5. 批量生成文案（唔需要 API KEY）

```bash
npm run cards:report                        # 睇中英覆蓋率，邊欄最缺
npm run cards:batch -- --from 1 --count 10  # 產生 data/batches/batch-0001-0010-zh.md 與 -en.md
npm run cards:batch -- --ids 0008,0290      # 指定編號
npm run cards:batch -- --missing-only --lang en
npm run cards:batch -- --apply out.json     # 把 Gemini 回覆寫入 cardCopy.json
npm run cards:batch -- --apply out.json --dry   # 只看會改幾多，不寫入
```

流程：`產生 .md` → 貼（或上載）給 Gemini → 回覆存 `out.json` → `--apply` → `npm run cards:data`。
`--apply` 有兩個保護：
1. **空字串＝保留原值**，AI 回空不會清走已校對的中文；
2. 含中文字的欄位寫入 `copy[id].zh` 欄位，純英文寫入 `fieldCopy[].en`，所以一次可以同時補中英。

## 6. 先做英文、再翻中文？（決策建議）

**建議：不要「先英文再翻中文」。** 現況正好相反而且更省：

| | 現況（中文為底） | 先英文再翻中文 |
|---|---|---|
| 中文可用性 | 中文已 559 張有卡、44 張 12 欄全齊 | 要等英文做完才有中文，期間中文卡更差 |
| 道德風險 | 無（中文全部係原文抽取） | **中文變成翻譯**，要額外一輪校對，而且偏離維基原文 |
| 工作量 | 缺欄直接抽原文一次到位 | 英文抽一次 → 翻譯一次 → 校對一次 ＝ 三次 |
| 一致性 | 中英可各自唔齊（缺就 `Data pending`） | 英文錯／缺 → 中文一齊錯 |

真正要做的，是**同一輪把中英一起抽**（`--lang both` 已支援），缺就誠實留空。
如果某張卡中文維基真的沒有那段，才用英文維基那句「意譯成繁體」，並在 `notes` 標明
「該欄中文原文從缺，由英文維基意譯」—— 這樣才不會靜靜地把翻譯當成原文。
