# 資訊卡由 0001 重新開始

## 最新指示及範圍

- 用戶已確認 UI 現在有 583 張插圖。
- 移除格仔卡右上額外的灰色 `#排名`，只保留永久 `NO.XXXX`，不改桌面／手機排版、排序、放大或翻轉功能。
- 用戶明確恢復資訊卡製作，**由 0001 開始**，不是接續舊的 0022 批次。
- 圖片分類仍分開：插圖是 `birdcards/NNNN.avif`；資訊長卡是 `aviandex/NNNN.avif`。

## 0001 珠頸斑鳩：首張重新製作，用戶已上載 R2

- 沿用現有 `compose-card.py` 的深色金框長卡模板，1024×1536：像素圖／IUCN 稀有度、分類、四個特徵圈、五維雷達、分佈概覽、兩隻相似鳥。
- 相似鳥：山斑鳩、火斑鳩（雄鳥），圖片不是誤用舊版 exporter 推薦的同科任意兩種。
- 所有文字、數字、雷達及星級均由程式繪製。主鳥及相似鳥為 AI 插圖，只做基本目視檢查，沒有獨立鳥類專家驗證。
- IUCN LC = 1／7 星，不代表香港出現頻率；評分沿用 `dexScores.json`，卡面另註明「應用程式趣味指標・非學術評分」。
- 地圖使用 Natural Earth 公共領域國界底圖，按 HKBWS／BoW 文字分佈標示原生分佈涉及國家／地區。**不是精確物種分佈多邊形**；卡面明示「綠色不代表全境；不含引入地」。不使用 AI 憑空畫的國界／分佈。
- 規格、來源及裁切座標：`scripts/cards/info-restart-0001.json`。
- 工作素材（忽略，不入 Git）：`cards/art/info-restart-0001/`。
- 成品（忽略，不入 Git）：`deliver/cards/info-restart-0001/`。
- `AvianDex-info-restart-0001.zip` 內含 `aviandex/0001.avif`、預覽、manifest、校驗碼及上載說明。
- 已交付 Google Drive：[AvianDex-info-restart-0001.zip](https://drive.google.com/file/d/1CjJr9QwAZV5mBu0kazzKvTTwUL3ADhja/view?usp=drivesdk)，377,625 bytes；Drive 回傳大小及 MD5 與本機一致。
- **用戶已回報上載 R2 並測試**；代理沒有代為上載或獨立驗證遠端內容。`infoCards.json` 現將 0001 註冊為 slim，只有已確認模板才套用五頁分區；0002–0021 仍保留舊版完整資訊卡，不猜裁切位置。
- 0001 資訊卡 URL 加 `v=restart-0001-v1`，直連及 proxy 均沿用版本，繞過同路徑舊卡的瀏覽器／SW／proxy 快取；插畫及其他資訊卡網址不變。下載仍取原始完整 AVIF，不下載裁切／重排版本。

## 手機閱讀器調整（PR22）

- 點一下卡面按「插畫 → 像素與特徵 → 評分 → 分佈 → 相似鳥 → 插畫」循環，保留左右掃；防止掃動後的合成 click 額外跳頁，垂直捲動不換頁。
- 移除卡面標題黑條與可見的「插畫」標籤，放大鍵疊在右下角；放大、重試及切鳥按鈕不觸發卡面換頁。
- 編號／鳥名移至紅色機框置中；左右切鳥改為疊在卡面兩側的半透明圓形箭嘴，在三個資料分頁均可使用，不新增卡片頁碼或卡片頁面箭嘴。
- 基礎／詳細／研究分頁在手機改成較扁的單行圖示＋文字，縮減資料面板頂部佔位。桌面維持原本上下圖示標籤、導航及完整長卡；放大翻轉及下載仍使用完整原卡。
- 驗證：31 項 focused 測試（包括 jsdom 實際 React 點按／掃動／按鍵互動、版本 URL 及 proxy 驗證）、`npm run build`、`git diff --check` 通過。嘗試 Chromium 手機視窗視覺測試，但環境缺少 `libnspr4.so`／`libnss3.so`，未能啟動；不宣稱已驗證真機或正式站。

## 重建

依既有 `docs/CARD-PIPELINE.md` 準備 Pillow、numpy、scipy、Noto Sans TC 字體（`AVX_FONT_DIR` 或 `~/.fonts`），以及 repo 既有的 `docs/card-samples/card-icons/`。

準備四幅素材 `pixel.png`、`features.png`、`oriental-turtle-dove.png`、`red-collared-dove.png`，和 Natural Earth `countries.geojson`（來源在規格 JSON），然後執行：

```bash
python3 scripts/cards/render-info-restart-0001.py
```

輸出 AVIF quality 78、4:4:4，保留完整 1024×1536，不經手機分頁縮圖再輸出。

## 下一步

1. 先核對這輪手機 UI；0001 已由用戶上載，若卡面需要調整先改模板／規格，不直接大量複製未確認的版本。
2. 0002、0003 已續作交付（見下）；下一張由 0004 按編號順序製作，不宣稱其餘資訊卡已重製。
3. 分批交付 Google Drive，R2 由用戶處理；交付 manifest 不能覆蓋 app 的 card-manifest.json。

## 本輪續作：0002–0003（已交付，用戶已確認上載 R2）

用戶在手機測試期間明確要求繼續生圖。這輪完成：

| 編號 | 主鳥 | 特徵圈 | 相似鳥 |
| --- | --- | --- | --- |
| 0002 | 黑鳶 Milvus migrans | 頭、翼、腹、尾 | 鶚、普通鵟 |
| 0003 | 原鴿 Columba livia | 頭、頸、翼、腳 | 岩鴿、歐鴿（形態比較，不代表香港常見） |

- 沿用深色金框 1024×1536；獨立生成像素主圖、特徵來源圖及兩幅比較鳥圖，文字／數值／地圖由程式繪製。只做基本目視檢查，未經獨立鳥類專家驗證。
- 依物種裁切更新圈下標籤，避免尾圖仍標「腳部」；完整比較鳥縮入圓內，避免頭或尾被圓形遮罩切走。
- 0002 地圖明示亞洲部分分佈，非全球完整分佈；0003 明示歐亞非部分原生分佈，香港屬逸生族群。兩者均是國家層級概覽，不是精確分佈多邊形，綠色不代表全境。
- 原鴿圖片僅示範野生型藍灰雙翼斑；香港逸生鴿羽色多變。相似鳥只作形態比較，並非香港鳥種名錄新增。
- 通用 renderer：`python3 scripts/cards/render-info-restart.py 0002`（或 `0003`）；同名 spec 為 `scripts/cards/info-restart-NNNN.json`。舊的 0001 renderer 保留不變。
- 輸入：忽略的 `cards/art/info-restart-NNNN/`；輸出：忽略的 `deliver/cards/info-restart-NNNN/`。依現有字體／Pillow／numpy／scipy 環境執行；不把生成大圖放入 Git。
- 合包：`deliver/cards/info-restart-0002-0003/AvianDex-info-restart-0002-0003.zip`，711,743 bytes，MD5 `d4ee92cb559f155bbbc94269f4b0aa5a`。
- **Google Drive 已交付**：[AvianDex-info-restart-0002-0003.zip](https://drive.google.com/file/d/1q1zP_fNI7nAy6EXBrM1D532pdyi1LxbC/view?usp=drivesdk)。回傳大小／MD5 與本機一致。含兩張 AVIF、兩張預覽、逐張來源 manifest、合併 manifest、SHA256、上載說明。
- 0002 AVIF：121,111 bytes，SHA256 `67fd3e9b81b6ffc36eed23d6135df6b1d932ef49a6c8c66dbdbd79e4e3dc5cba`。
- 0003 AVIF：135,842 bytes，SHA256 `d5c63d4fb2cb5dc0c48532ffd075325deddd5e531536e4656dc1f2c8a117ce5d`。
- 驗證：兩張 AVIF 解碼／1024×1536、ZIP CRC、manifest SHA256、Python 編譯、`git diff --check` 通過。
- **交付時代理沒有上載 R2。用戶其後已確認上載，現已登記 0002、0003 為 slim 並加入各自 `restart-NNNN-v1` 快取版本。** 沒有獨立驗證遠端 R2 檔案。下一張待做為 0004；不宣稱其餘資訊卡已完成。
- 上一輪 ZIP 的 manifest／README 是交付當時的「尚未上載」狀態，不回寫修改已交付 ZIP。手機新一輪版面／下載／開場修正見 `docs/MOBILE_SCREEN_REVIEW.md`。
