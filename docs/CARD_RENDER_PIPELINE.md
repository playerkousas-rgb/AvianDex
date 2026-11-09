# 卡面出圖流程（試作 → 量產）

> 目的：由「資料」直接出 1024×1536 的印刷級 PNG，文字全部由程式寫入（唔靠 AI 畫字），
> 所以中英、學名、編號一定準確；AI 只負責圖（真雀相、像素圖、小圖示、地圖）。

## 一、目前可以跑的（試作）

```bash
python3 -m pip install --break-system-packages pillow     # 一次性
python3 scripts/cards/render-card-demo.py 0013            # 出 data/card-demo/out/aviandex-card-0013.png
```

素材放在 `data/card-demo/`（已 gitignore，因為係圖，不入 Git）：

| 檔案 | 用途 | 怎樣來 |
|---|---|---|
| `0013-photo.jpg` | 主圖（真雀相） | Gemini 依 prompt 到 Macaulay 取相，或自己影 |
| `0013-sprite.png` | 左上像素圖 | Gemini「16-bit pixel art sprite」 |
| `0013-inset-{crest,eye,wing,feet}.jpg` | 四個圓形特徵特寫 | Gemini 微距特寫 |
| `0013-map.png` | 分佈地圖 | Gemini 東亞地圖底圖（之後可換 GIS 真圖層） |
| `0013-habitat.png` / `0013-diet.png` | 環境／食物圖示 | Gemini 圖示集 |
| `0013-callouts.json` | 特徵文字＋引線落點 | 本機手寫（正式版由卡面工作室輸出） |

## 二、量產要補的三件事

1. **每張卡 7 張圖**（photo / sprite / 4 insets / map / 2 icons）→ 559 × 約 8 個生成請求。
   建議用 Gemini 的 batch 或你自己的排程逐批生成，檔名照 `卡片編號-類別.副檔名` 放同一個資料夾，
   腳本會自動執；冇圖就畫佔位框，不會假裝有。
2. **callouts（特徵點位）**：目前靠手寫。正式做法是卡面工作室加一個「點圖標特徵」小工具，
   存 `{label, text, anchor:[x,y]}`，同 `cardCopy.json` 一齊版本控制。
3. **數據欄位**：`length` / `weight` / `scores`（5 項編者評分）目前在 NO.0013 是空的，
   所以試作卡顯示「待補」。這三樣要用 `npm run cards:batch` 批次補，其中評分屬主觀，
   必須在卡面註明「編者評分，非科學數據」。

## 三、批量輸出

```bash
for id in $(node -e "console.log(Object.keys(require('./src/data/cardCopy.json')).filter(k=>/^\\d{4}$/.test(k)).join(' '))"); do
  python3 scripts/cards/render-card-demo.py $id
done
```

（正式版會包成 `npm run cards:render-all`，並支援只出「素材齊全」的卡。）

## 四、已知與參考圖的差距

| 項目 | 參考圖 | 我們試作 | 原因 |
|---|---|---|---|
| 主圖＋4 個圓形特寫 | 有 | 有 | — |
| 分佈地圖 | 有 | 有（AI 底圖） | 真圖層要 GIS 資料 |
| 環境／食物圖示 | 有 | 有 | — |
| 身長／體重 | 22–25cm / 75–100g | 待補 | `cardCopy.json` 冇呢兩欄 |
| 生態價值評分 5 項 | 有 | 待定 | 主觀評分未建立 |
| 常見度 5 點 | 有 | 有（暫設 3） | 需逐張評 |
| 特徵文字 | 4 句 | 4 句 | 已對齊參考圖寫法（label + 一句） |


---

## 六、版面風格：v1（Pokédex 卡）→ v2（編輯型），2026-11-09

用戶回饋「太 AI 味」，對照 `playerkousas-rgb/readme` 的 `design-review` 規則後改版：

| Slop 特徵（v1 有） | v2 做法 |
|---|---|
| 深藍大橫幅、彩色光暈、球標 | 頁眉只留編號＋一行分類，靠髮線分隔 |
| 一整排圓角彩色卡片（icon-topped cards） | 左文右圖，四欄用髮線分欄，無卡片邊框 |
| 黑體粗字到處都係 | 中文標題用 Noto Serif TC（書感），內文用 Noto Sans TC；全卡只用兩族字 |
| 純白 + 亮藍 | 暖紙 `#F7F4EC` + 墨 `#211E1A` + 金 `#A67C2D`（金只用細面積） |
| emoji／圓圈圖示當標題 | 金色細直線 + 襯線欄目名 |
| 特徵文字壓在相片上 | 相片只放 1–4 號金色小圓點，文字做左欄圖例 |
| 評分卡（主觀分數格） | 移除；改為頁腳「資料來源」，主觀評分留待有真實評分才加 |

規則出處：`readme/skills/promoted/design-review/SKILL.md`（house rules：標題 ≤2 行、無漸層、
無靜態陰影、無 icon-topped 卡片陣、無 01/02/03 編號、左右邊距相等）。

### 未做／限制（照實講）

- 本環境**無瀏覽器截圖**，只用人眼看 PNG；390／768／1440 三寬度檢視**未做**。
- 未做 `ROUND n` 正式評分；無資格自己給 9 分。


---

## 七、定案方向：資訊圖卡（2026-11-09 第三次修正）

用戶原版 `docs/assets/dexcard-0008-example.png` 的結構就是正解：**一張卡＝一個完整資訊單元**，
分格清楚（書眉／左欄／主圖＋特寫／兩排四格／評分卡／底欄）。之前兩次偏離：

1. v2 編輯型：把資料寫成四欄長文 → 變成雜誌文章，小朋友不看。
2. 圖鑑版：把 6 幅圖塞在一起 → 那是「詳細資料頁」的顯示模式，不是資訊卡。

現行腳本 `scripts/cards/render-card-info.py`（`npm run cards:info`）保留原版骨架，
只改材質：實色書眉、1px 細邊界、襯線欄目、金色細重點；未評分就寫「未評分」，不編假分。

三支腳本的分工（保留作參考，唔好再互換）：

| 腳本 | 定位 | 何時用 |
|---|---|---|
| `render-card-info.py` | **資訊圖卡（定案）** | 卡面主線 |
| `render-card-encyclopedia.py` | 圖鑑跨頁（多圖） | 詳細資料頁／海報 |
| `render-card-kid.py` | 任務卡（親子活動） | 活動單張 |
