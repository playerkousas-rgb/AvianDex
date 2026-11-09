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
