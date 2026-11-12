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

## 續作交付：0004–0005（待用戶上載 R2）

| 編號 | 主鳥 | 特徵圈 | 相似鳥 |
| --- | --- | --- | --- |
| 0004 | 小葵花鳳頭鸚鵡 Cacatua sulphurea | 羽冠、頭部、翼部、腳部 | 葵花鳳頭鸚鵡、白鳳頭鸚鵡 |
| 0005 | 噪鵑 Eudynamys scolopaceus | 雄鳥頭、雄鳥翼、長尾、雌鳥 | 大嘴烏鴉、烏鵑 |

- 沿用深色金框 slim 1024×1536，沒有改動 UI、現有卡面註冊或 R2。逐張規格位於 `scripts/cards/info-restart-0004.json`、`info-restart-0005.json`；分類及分數由 runtime data 讀取。
- 0004 使用黃色冠羽，不使用已分拆的橙冠種；IUCN CR 與香港引入族群的常見程度分開。比較圓圖非同比例；不把黃色頰斑當成排除葵花鳳頭鸚鵡的絕對特徵。
- 0005 主圖為雄鳥，第四圈為獨立雌鳥來源並清楚標示；renderer 新增可選 `featureSources`，舊規格預設仍讀同一 features 圖。來源核對後把烏鵑比較圖的紅虹膜修正為深褐／深灰色。
- 模型回傳的噪鵑像素素材為直幅；renderer 先置中補成正方形，再按原 slot 排版，修正第一次預覽的頭尾截斷。正方形舊素材不變。
- 兩張地圖均明示「原生分佈涉及國家概覽」、綠色非全境；0004 不是印尼所有島嶼均有分佈，香港不是原生範圍；0005 不區分季節，也不把印尼東部或中國全境當成實際分佈。詳細限制見規格。
- 已作基本目視檢查，未經獨立鳥類專家驗證。生成素材及交付包依舊忽略，不加入 Git。
- **Google Drive 已交付**：[AvianDex-info-restart-0004-0005.zip](https://drive.google.com/file/d/1ovRMm4p68rj3LAPQZQXJtnrwFuFdxZBs/view?usp=drivesdk)。本機及 Drive 回傳大小均為 700,958 bytes，MD5 均為 `64a34e9fc05533cca4a4b145de3acabb`。
- ZIP 含 `aviandex/0004.avif`、`aviandex/0005.avif`、兩張預覽、逐張及合併 manifest、SHA256、上載說明。只上載 `aviandex/` 中兩張圖，Content-Type `image/avif`；manifest 不是 app 的 card-manifest.json。
- 0004 AVIF：125,133 bytes，SHA256 `527bdb3c3e88d45bd88392a0b4b4fa10a64b90c4293902d9660ca0f334d26100`。
- 0005 AVIF：125,178 bytes，SHA256 `9f9ee26e6e4aa4fb15a35fc77bc4e113d89ace25e4d73e9e90a54567106aa3f5`。
- 驗證：AVIF 解碼及 1024×1536、兩個單包及合包 ZIP CRC／SHA256、Python 編譯、`git diff --check` 通過；沒有為此素材批次重跑 app UI 測試。
- **尚未獲用戶確認上載 R2，因此不把 0004／0005 登記為 slim。下一張由 0006 順序製作。**

## 批量生成階段：0006–0008（用戶確認 UI 已完善）

用戶明確表示 UI 完美、現在只需批量生圖。維持 UI，不再改版；按編號分批完成並交付 Drive，R2 仍由用戶處理。0004／0005 尚未收到 R2 上載確認，不提前登記。

| 編號 | 主鳥 | 特徵圈 | 相似鳥 |
| --- | --- | --- | --- |
| 0006 | 紅耳鵯 Pycnonotus jocosus | 頭部、翼部、紅臀、腳部 | 白頭鵯、白喉紅臀鵯 |
| 0007 | 白頭鵯 Pycnonotus sinensis | 頭部、翼部、胸部、腳部 | 紅耳鵯、白喉紅臀鵯 |
| 0008 | 鵲鴝 Copsychus saularis（雄鳥） | 雄鳥頭、白翼帶、白腹、尾部 | 白腰鵲鴝、喜鵲 |

- 全部 1024×1536，沿用 compositor 原有金框／深色物種配色（這三張依原模板是墨綠），不是改 UI。分類、名字、分數直接讀取 app runtime data，IUCN 均為 LC。
- 三張已逐張目視檢查；0006 頭部圈第二次裁切保留紅耳斑、白頰和完整尖冠，0008 白腹圈修正至腹面。基本視覺核對不等於獨立鳥類專家驗證。
- 兩種鵯的比較圖重用本批次已檢視素材並另外裁切頭胸；白喉紅臀鵯的比較圖只示頭胸，不拿它推斷臀色。鵲鴝主圖及特寫限定雄鳥，不聲稱雌鳥也是黑頭。
- 地圖明示亞洲「部分」分佈國家概覽／綠色非全境／非完整分佈，詳細地域、季節與原生地限制見逐張 spec。0006 尤其記錄香港／華南族群來源未有定論，並未宣稱香港是已證實原生地。
- 新增通用批次合包器：`python3 scripts/cards/pack-info-restart.py 0006 0007 0008`；驗證 manifest 身分、AVIF 解碼／尺寸、bytes／SHA256、ZIP CRC／SHA256，使用臨時 ZIP 通過檢查後才替換正式包。只包含明確提供的 ID，不將中間缺號冒稱已完成。
- **Google Drive 已交付**：[AvianDex-info-restart-0006-0007-0008.zip](https://drive.google.com/file/d/1nJ-m5Ow-VHP3-MgOu9GhHXOsS1K99Meq/view?usp=drivesdk)。本機及 Drive 均為 1,030,776 bytes，MD5 `2dc915dc787ac503e2bf413249f6161b`。
- 0006 AVIF：121,135 bytes，SHA256 `459f463d959d8eee77bf989f65903588f51752420fde26e55b63a6d7dfa23a5a`。
- 0007 AVIF：119,423 bytes，SHA256 `dbb832321d6c48abaa71e905c30c18781e2d3fd0656763eff76a96309b4b4a5b`。
- 0008 AVIF：122,556 bytes，SHA256 `c8679a7aecc5b33622e8cfe3976d39c9a9d744b538b41a7fe79e3454c7d570b1`。
- 驗證：三張渲染／AVIF 解碼、單包及合包 CRC／SHA256、Python 編譯、合包器拒絕重複／路徑／非 ASCII ID、`git diff --check` 通過。沒有改動 app，所以沒有重跑 UI 測試；未上載 R2 或登記 slim。

### 下輪接續（不要將半成品當已交付）

本輪工具實際限制為 **10 幅生圖**。0006–0008 共獨立生成九幅素材，第十幅為 `cards/art/info-restart-0009/pixel.png`，已成功但尚未目視檢查。其後七個生圖呼叫均回傳達上限，**並沒有產生其餘 0009 素材或任何 0010 圖片**。已向用戶說明本輪上限，下輪由 0009 接續。不用重生已有像素圖，先讀檔核對。

- 0009 黑臉噪鶥 Pterorhinus perspicillatus，雀形目／噪鶥科。已讀 HKBWS 第一 chunk：https://avifauna.hkbws.org.hk/species/0370/044500 。28–31.5 cm，黑色眼罩，灰褐體，長尾長腳，尾較暖褐外側近端深黑，腹部淡皮黃、臀部赭色；深褐眼、灰褐喙、灰粉腳。下一 chunk 尚未讀（分佈、IUCN 待核對）。建議比較畫眉 Garrulax canorus（白眼圈接長白眉）和黑喉噪鶥 Pterorhinus chinensis（白頰黑喉），相關比較圖及 features 圖尚未生成。
- 0010 灰胸秧雞 Lewinia striata，鶴形目／秧雞科。已搜尋 HKBWS：https://avifauna.hkbws.org.hk/species/0060/007600 。25–30 cm，成年鏽褐冠及後頸、灰胸淡喉、褐背翼具不規則白黑橫斑延伸至脅臀及尾上；虹膜紅、喙灰脊深粉基部。HK jouyi；範圍印度零散、斯里蘭卡、孟加拉、緬甸、中南半島部分至印尼菲律賓，長江以南大部及海南台灣。LC（香港局部衰退不等於全球 IUCN）。未有圖片或 spec。
- 0010 建議比較普通秧雞 Rallus indicus（很長紅基喙、背翼褐底黑縱紋而非白橫斑、眼紋）及白胸苦惡鳥 Amaurornis phoenicurus（白面白胸、暗背及栗色尾下）；普通秧雞來源 https://avifauna.hkbws.org.hk/species/0060/007500 已搜尋核對，另一種來源待查。

## 直接 AVIF 交付：0009–0010（不再製作 ZIP）

用戶要求不再弄 ZIP，只將 AVIF 放入 Drive，全部完成後才一次下載。此指示取代上文批次合包流程：`render-info-restart.py` 已移除 ZIP 生成，舊合包器留作歷史工具但不再使用；本機仍保留預覽及來源 manifest，Drive 只上載完成 AVIF。

**統一資料夾**：[AvianDex 資訊卡 AVIF](https://drive.google.com/drive/folders/17qbb-KcjgnSd__5XcWqumNJ0KVLzA7y7)。後續每張完成品均上載此資料夾，名稱為四位數 ID `.avif`。0004–0008 是先前 ZIP 中已交付的同一原檔，沒有重生，今次另外以 AVIF 形式集中放入；舊 ZIP 未刪除。0001–0003 本機原檔已不在工作區，本次沒有重新生成／重複上載。

| AVIF | Drive file ID | bytes | MD5（Drive 回傳與本機一致） |
| --- | --- | ---: | --- |
| 0004.avif | 1XbnFO5XCAHF5QDKywEcUe7eVc0_zQoTw | 125133 | 3fcbc9375374e403abd8b57ef5ebfa08 |
| 0005.avif | 1p23LZXsT0ZXBd_DSX5K5M31oE9clfUmW | 125178 | b04d872d977d7156f8b0fae20826366f |
| 0006.avif | 1s21v0NArlmrBXIaTA6gLbtURThtXEVEj | 121135 | fa38ee642b38a84a7c4e1981c5149a5d |
| 0007.avif | 1NvKxKafLw2IuIb2MEQHMYTguhnI7RQeL | 119423 | 8cf0732ff3e546f3565fb5edd2dc1f13 |
| 0008.avif | 1Iziihxc7nnOS_0dcx0lota8XeuX11Rth | 122556 | 69c20c6a1251d4668ebbfac877d9416c |
| 0009.avif | 1XDjW_65SO64MUc4a26ydeLu-bowI-uU9 | 121703 | 7c25e5c5175f964d00bb9c818928f8d5 |
| 0010.avif | 1ILkGYmc-KoLUgfyjH7FyFz-C8NNSpkOU | 141173 | e5586e075a6446b8585962e9c2060c84 |

- 新完成 0009 黑臉噪鶥（比較畫眉／白頰型黑喉噪鶥）、0010 灰胸秧雞（比較普通秧雞／白胸苦惡鳥）。1024×1536、現有金框深色模板，物種配色由原 compositor 決定；沒有改 UI 或 runtime data。
- 畫眉生成初稿虹膜為褐色，查 HKBWS 後修正為綠黃色。兩張整卡經基本目視檢查，0010 灰胸特徵圈重新裁切至胸部；AI 畫作未經獨立專家驗證。
- **缺分不補值**：0009 runtime `v` 缺失；0010 runtime `i`／`c` 缺失。renderer 改為傳空字串，沿用 compositor 的「待查」，並在卡面加「待查非零分」。雷達缺軸落中心只是既有繪圖佔位，不能當成零分；綜合仍沿用原 runtime 2.2／2.4。不因另查到 IUCN LC 就偷偷更改 app 原分數。
- 0009 IUCN LC；原生範圍中國中南部與越南中北部，國家概覽不是全境。0010 IUCN LC；香港局部衰退不等於全球 IUCN 受脅，概覽範圍為印度至東南亞／華南部分，非精確出現圖。
- 0009 SHA256 `d17c8a00b0dfdc62e7adad308660c4bf590619b96b0ae5bcf546f3f1dcf94f07`。
- 0010 SHA256 `c624c70153080863044181e6beb84635a97c067d93316b2647d9d57f7f41e7d7`。
- 驗證七個 AVIF 解碼／1024×1536／manifest SHA256、七個 Drive 回傳 bytes／MD5、缺分保持空值及新交付目錄無 ZIP、Python 編譯、`git diff --check`。不涉及 app UI，沒有重跑 UI tests。
- **R2 尚未上載，也尚未收到 0004–0010 的用戶上載確認，不登記 slim。**
- 本輪已生成 10 幅素材（包括畫眉修正）。下一張 **0011 樹麻雀 Passer montanus** 已有 `cards/art/info-restart-0011/pixel.png` 和 `features.png`；尚未視覺檢查，未有相似鳥圖／spec／完整卡／Drive 交付。下輪先讀圖核對，不重生已有素材；建議比較家麻雀 Passer domesticus 和山麻雀 Passer cinnamomeus，先查來源後生成。下一張順序為 0011，不把半成品算完成。

## 最新範圍／新 Drive 目的地：0011–0050，0050 後停止

用戶最新要求：**之後的 AVIF 直接放入 `(測試中) > working > AvianDex-info`，順序做到 0050（包括）先停。** 此處取代上文舊統一資料夾的「後續」安排；不要再放進舊資料夾、不要建立同名新資料夾、不要製作 ZIP。0001–0010 不重做；0004–0010 留在舊資料夾，沒有擅自搬動。

- `(測試中)`：`1_gdEjoG5fhCR284RHbAZWSdUApBDdDjr`
- `working`：`1MXnolz8wKE2Yqde2EKPnRgcgVTaBEA_J`
- **交付目的地**：[AvianDex-info](https://drive.google.com/drive/folders/1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up)，ID `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。已查父子關係，並在上傳前查資料夾內容為空，避免重複。

### 已完成並交付 0011–0013

| AVIF | 物種 | Drive file ID | bytes | MD5（本機與 Drive 一致） |
| --- | --- | --- | ---: | --- |
| 0011.avif | 樹麻雀 | 1I1hvugYTa6dAcG5wrUmaXdfMDyhgHYRe | 134504 | 22d309fa71d0db357d246847c9d9b8ab |
| 0012.avif | 黑領椋鳥 | 19L759aQmOjPH_vLsym0SYSnUMhe3KvVY | 123311 | 32f28a7af56479d6c093902075ec9b52 |
| 0013.avif | 八哥 | 1Z4GYp3zMyrLdAuw0ZhJAnnWAwT-LwVHp | 118530 | dad7d88c695b58614e662bb3e512e4ee |

- 三張沿用原 dark/gold slim 1024×1536 模板；taxonomy、scores 直接讀 runtime，IUCN 均 LC。沒有改 UI、app 資料或資訊卡註冊；未上載 R2。
- 0011 比較雄家麻雀（灰冠、無頰斑）／雄山麻雀（栗紅冠、無頰斑），標籤明示雄鳥，不將兩種有性別差異的羽色誤作全體。樹麻雀頭部白頰黑斑、栗冠、兩條翼帶、淡腹均已基本目視核對。腹及腳部重新裁切，腳圈集中在一隻抓枝腳。
- 0012 比較雄絲光椋鳥／八哥；八哥比較圖重用本批已檢視 features 來源並加安全邊距，保留完整額冠和喙。黑領椋鳥為黑喙、暗鉛灰腳，不採用搜尋中不可靠的黃腳說法。
- 0013 比較家八哥／林八哥；林八哥為黃眼型，虹膜有地區差異（部分藍眼），見 spec。八哥頭冠在額前，乳白喙、橙眼、白翼斑及白尾端；尾端圈重新裁切集中白尖。
- 全部來源在 `scripts/cards/info-restart-0011.json` 至 `0013.json`。地圖只為亞洲部分原生分佈涉及國家的概覽，明示綠色非全境／非完整範圍，不是實際出現多邊形，也不把引入族群冒作原生。0011 未畫歐洲；0012 排除引入的台灣／馬來西亞／新加坡。
- 0011 SHA256 `4759a713d7477585dbbc2e0f1a6a010061d3382643f151a658600d291bde044e`。
- 0012 SHA256 `ee57bfc691716371e094bb937d56d26b857c4e2d6966c402320c98312b0278df`。
- 0013 SHA256 `71ca5420319a7363a2dc605c08eb674d5182839cdd114cdf9d3a1572a21a3aa8`。
- 已檢視完整卡及修改後特徵／比較圈；AVIF 解碼、尺寸、manifest bytes／SHA、Drive 回傳 parent／bytes／MD5 逐張核對通過。基本視覺檢查不等於獨立鳥類專家驗證。生成圖及交付檔仍忽略、不加入 Git。

### 下一輪由 0014 接續，不要把 0050 說成完成

本輪用了 10 次生圖（0011 兩張比較、0012 三張、0013 四張、0014 一張像素圖）。**目前實際交付只到 0013；0014–0050 未完成。** 不能在背景繼續，也不要重新製作已交付編號。

- `cards/art/info-restart-0014/pixel.png` 已生成，**未目視核對**；features／比較圖／spec／完整卡／上傳均未做。先讀圖再接續，不重生像素圖。
- 0014 白腰文鳥 Lonchura striata，雀形目／梅花雀科。來源已搜尋但完整頁待讀：https://avifauna.hkbws.org.hk/species/0430/053100 。香港局部分佈的留鳥、LC／全球趨勢穩定；印度次大陸經東南亞至華南台灣及蘇門答臘，不是全境。比較對象尚未定，可查斑文鳥及其他文鳥成幼鳥差異。
- **0014 dexScores 完全沒有記錄**：renderer 改用 `.get(id, {})`，所有軸及綜合均保留待查，不新估分、不因查到 LC 就硬加重要性／保育分。0016 只有 a=3.3/r=1，其他軸及綜合待查，也不可擅算。
- 0015 紅嘴藍鵲 Urocissa erythroryncha；0016 遠東山雀 Parus cinereus。順序接續至 0050 後停；沒有 0015+ 圖片。
- 0004–0013 的 R2 仍待用戶確認，未註冊新 slim；UI 保持凍結。

## 世界底圖恢復：0014–0015 已交付

用戶指出「為什麼分佈圖由世界地圖變成部分地圖」。原因是製作 spec 的 `rangeMap.bounds` 曾被自行設成亞洲／東南亞局部，並非 app 顯示錯誤。已向用戶說明並道歉：**從 0014 起統一使用完整世界底圖，不再自行裁成局部視角。** 這是卡面素材修正，不改 app UI。

- 新 spec 明確 `viewport: world`、bounds `[-180,-90,180,90]`。renderer 加上世界視角驗證：標為 world 卻傳入局部 bounds 時拒絕輸出；沒有裁掉非亞洲大陸或兩極。
- **完整底圖 ≠ 完整／精確物種分佈**。卡上標示「世界底圖・部分分佈國家」「綠色非全境；非完整分佈」，綠色仍只為已核對的原生分佈涉及國家概覽，不是精確出現範圍，不將整個中國／印度／印尼都當作實際棲地。
- 檢查發現本機 0001–0013 的 spec 都有局部 bounds。**這一輪沒有重生、覆蓋、改名或刪除已交付舊檔**，已向用戶明說舊版先不覆蓋。不要把「0014 起恢復」說成舊卡也全部修好了；舊卡若需統一修正，另行明確安排，不重畫鳥圖。
- 上傳前查新目的地實際包含 0009–0013（0009／0010 已在該處，並非本輪移動）；0014／0015 沒有同名檔，避免重複。

| AVIF | 物種 | Drive file ID | bytes | MD5（本機與 Drive 一致） |
| --- | --- | --- | ---: | --- |
| 0014.avif | 白腰文鳥 | 11otMJ8HBI2xlUABfavYYrzxs0K2uwpk0 | 131137 | dbfe312ee6d8aded88470cdbac7272c4 |
| 0015.avif | 紅嘴藍鵲 | 1tUe4I_BNiEIt9XngWP6kLyidLlemdIE2 | 132424 | 81ad9252d3d4c14e377f5279996e4237 |

交付位置仍是 [(測試中) > working > AvianDex-info](https://drive.google.com/drive/folders/1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up)。只上載個別四位數 AVIF；不製作 ZIP，不上載 R2、不登記新 slim。

- **0014**：白腰文鳥成鳥，深褐頭胸／灰藍粗喙／白腹白腰；特徵為頭、翼、白腰、腳。比較斑文鳥成鳥（白腹暗鱗斑）及栗腹文鳥黑頭型成鳥（台灣 formosana 頭較褐，不以此圖代表全部亞種）。HKBWS 主來源 https://avifauna.hkbws.org.hk/species/0430/053100 兩 chunks 已讀。
- 0014 runtime 完全沒有評分記錄：五軸及綜合均保持待查，沒有估算、沒有補零；沿用原 compositor 的 `?`，renderer 另外加「綜合評分待查」。雷達中心點只是無資料繪圖佔位，卡面清楚寫「待查非零分」。另查到 IUCN LC 不作為私自補分的理由。
- **0015**：紅嘴藍鵲，紅喙紅腳、暗眼、白羽端後冠頸、灰白腹、長階梯尾及白尾端。比較黃嘴藍鵲／台灣藍鵲（黃虹膜、全黑後頸、藍腹）。特徵為頭、藍翼、白尾端、紅腳；重新裁切翼與腳，讓腳圈集中抓枝腳。HKBWS 主來源 https://avifauna.hkbws.org.hk/species/0260/033400 兩 chunks 已讀。
- 兩張完整卡及修正後 0015 特徵經基本目視檢查，世界底圖含美洲、歐非亞澳、南極。AI 圖未經獨立專家驗證，地圖不是精確出現圖。
- 0014 SHA256 `87d1a7dc9044d60ab8cc521db2184ea077a84ee915a589b48c71bd243907a1d5`。
- 0015 SHA256 `aa6894b8857a773fe3f006987503750c7e93f268efa44b0d71842d53ddc9b10b`。
- 驗證：兩張 AVIF 解碼／1024×1536、manifest bytes／SHA、world bounds／viewport、分數逐欄與 runtime 一致、無 ZIP；Drive parent／bytes／MD5 與本機一致。world map regression check 確認正常世界圖渲染、偽裝 world 的局部 bounds 被拒絕、恢復後可渲染。Python 編譯／`git diff --check` 通過；未改 UI，不重跑 app UI tests。

### 下輪由 0016 接續（目前交付至 0015，尚未到 0050）

本輪已生成 10 幅圖片：0014 三幅、0015 四幅、0016 三幅。0016 半成品不算交付：

- `cards/art/info-restart-0016/{pixel,features,great-tit}.png` 已生成並在 `deliver/cards/0016-partial-review.jpg` 基本目視檢查：香港 commixtus 白灰腹、黑腹線、灰藍背翼，對比歐洲大山雀黃腹綠背。**還缺第二種比較圖／完整 spec／地圖／完整卡／上傳**。
- 0016 runtime：遠東山雀 **Parus cinereus**／Asian Tit，不可用 HKBWS 舊名 Parus minor 覆蓋 runtime taxonomy。
- 已搜尋 eBird 2024 taxonomy update：https://science.ebird.org/eu/use-ebird-data/the-ebird-taxonomy/2024-ebird-taxonomy-update ，其 Japanese Tit Parus minor 與 Cinereous Tit 合併為 Asian Tit Parus cinereus，含 commixtus；不要把舊 Japanese Tit 當作另一比較「物種」。主鳥畫的是香港 commixtus，不代表所有 Asian Tit 亞種羽色。
- HKBWS 舊稱 Japanese Tit 的香港 commixtus 羽色來源已搜尋：https://avifauna.hkbws.org.hk/species/0270/034800 ，完整頁尚待讀。描述黑頭白頰、黑腹中線、灰藍背翼、寬白翼帶，灰白腹；此來源 IUCN LC 與舊大山雀概念相關，後續需按 runtime 合併物種另核對 LC，勿混淆分類。
- 建議第二比較為綠背山雀 Parus monticolus，需先查辨識（黃腹綠背、兩條翼帶等）再生成。第一比較大山雀 Parus major 的圖已備，不必重生。
- 0016 dexScores 只有 a=3.3、r=1，i/c/v/o 都待查，不自行估算綜合。
- 之後 0017+ 尚未製作，依序做到 **0050（包括）後停止**。0004–0015 R2 仍待用戶確認，UI 凍結。

## 順序交付 0016–0018（完整世界底圖）

完成逐張來源核對、基本目視檢查、AVIF 解碼／尺寸及上傳校驗後，已直接上傳三個獨立 AVIF 到 `(測試中)/working/AvianDex-info`（`1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`）。上傳前查目錄只有 0009–0015，沒有同名重複檔。沒有 ZIP／R2 上傳／slim 註冊／UI 改動。

| AVIF | 物種 | Drive file ID | bytes | MD5（本機與 Drive 一致） |
| --- | --- | --- | ---: | --- |
| 0016.avif | 遠東山雀 | 1xlzWrVV-Wr785uavrtsrzovchrsBpO0U | 131442 | b715e6c007d2b66ab43ad321991ad176 |
| 0017.avif | 普通鵟 | 17v8UDAm21RQLzgDIfD2c5HsPYA-VpEfU | 138178 | 74919b5430aba32c0988b6eb7dfd232f |
| 0018.avif | 畫眉 | 17IlKj5uYJw0P-U0Z-_Thc36RnWNfwKpx | 138358 | f8e5b274a94616213db737b1b2bbc94d |

- **0016 遠東山雀 Parus cinereus**：保留 runtime 名字／分類，主圖為香港 commixtus 灰白腹灰藍背型，不把舊 Parus minor 當作另一物種比較。比較大山雀／綠背山雀（兩窄白翼帶）。HKBWS https://avifauna.hkbws.org.hk/species/0270/034800 兩 chunks 已讀；其 LC 明確採納舊大山雀廣義評估，因此卡面加「LC 依來源舊分類評估」，spec 記錄評估概念，不冒稱獨立新 Asian Tit 評估。
- 0016 runtime 只有 a=3.3／r=1；i/c/v/o 保持空值及待查，不自行計算綜合。沿用雷達缺軸中心佔位，卡面「待查非零分」。地圖國家概覽按合併後 Asian Tit 範圍（含南亞 cinereus 及東亞 minor），並非僅香港 commixtus 亞種範圍。
- **0017 普通鵟 Buteo japonicus**：典型淡色成鳥，寬翼、黑腕斑、深色成鳥翼後緣、短扇尾及細橫紋；不是所有色型／幼鳥均相同。特徵圈用飛行圖頭／翼底／腹帶／尾，比較淺叉尾黑鳶及較小頭長頸長尾的鳳頭蜂鷹（典型成年雄鳥圖）。主來源 https://avifauna.hkbws.org.hk/species/0180/026500 已完整讀。適應力 a 缺失保留待查，o=2.7 不改。
- **0018 畫眉 Garrulax canorus**：綠黃虹膜、白眼圈連長白眉、黃喙及粉褐腳，採 HKBWS https://avifauna.hkbws.org.hk/species/0370/044200 而非泛稱黃腳的次級來源。比較台灣畫眉（無白眼眉）及黑臉噪鶥（重用 0009 已檢視 features 頭胸，裁切加邊距，不重畫）。胸紋圈修正到上胸，修正後再檢視。
- 0017／0018 runtime `vEst=1`：renderer 新增卡面「觀賞值含體長估算」，不改原觀賞數值。支援可選 IUCN `assessmentNote`，只在有來源分類限制時顯示；原 compositor／UI 不變。
- 三張均維持 world viewport／bounds `[-180,-90,180,90]`。綠色仍是部分原生分佈涉及國家，非全境、非完整／精確出現圖，不分繁殖／越冬色塊。0018 排除引入的夏威夷、日本及台灣族群，不把台灣畫眉當畫眉原生族群。
- 0016 SHA256 `91a0fff23415a690bc3569fef830c979f70b72638877aefe59e39378b790b9e4`。
- 0017 SHA256 `75324622f8f5d4541f36df651aba63b64ff8a271828b0753bb75bed088935866`。
- 0018 SHA256 `1dea0bb7d6916208a4f6a58d84f4ec8459e657ead8a84b7a0655491a416c5a85`。
- 已驗證三張 AVIF 1024×1536 解碼、manifest bytes／SHA、分數逐欄與 runtime 一致、world bounds、無 ZIP；Drive 回傳 parent／bytes／MD5 一致。Python 編譯、`git diff --check` 通過。不涉及 app UI，未重跑 UI tests。AI 插圖只基本視覺檢查，非獨立專家認證。

### 下一張 0019 叉尾太陽鳥，尚未交付；0050 仍是停止點

本輪 10 次生圖：0016 綠背山雀比較 1 張、0017 四張、0018 三張、0019 兩張。**實際交付至 0018；0019–0050 未完成。**

- `cards/art/info-restart-0019/pixel.png`／`features.png` 已生成，男鳥色彩經 `deliver/cards/0019-partial-review.jpg` 基本檢視：藍綠金屬頭頸腰、黑面、紅喉胸、綠翼淡黃綠腹、灰叉尾及粉褐腳。細尾延伸比例仍需按來源進一步核對；沒有 spec／雌鳥或比較圖／完整卡／上傳，不算完成。
- 0019 叉尾太陽鳥 Aethopyga christinae（runtime latouchii 所在香港型），雀形目／太陽鳥科。HKBWS 已搜尋：https://avifauna.hkbws.org.hk/species/0420/052500 ，完整頁待讀。雄鳥 9–11 cm，短下彎喙、黑面、冠後頸腰尾上亮藍綠、綠背翼、胭脂紅喉上胸、淡黃綠腹；最外側一對尾羽灰色尖延長約尾本體一半。雌鳥灰頂橄欖綠、淡黃橄欖腹，無雄鳥紅喉金屬冠，腳暗粉。
- 採 HKBWS 的 HK latouchii 描述；搜尋 LCSD 頁面稱雌幼鳥腰淡黃，泛稱本種或不同時期／部位，切勿不加核對便把雄鳥藍綠腰改黃。LCSD https://www.lcsd.gov.hk/en/green/birds/overview/bird_19.html 可作輔助辨識來源。
- 0019 runtime i=2/a=2.3/v=2.3/r=2.5/c=1.2/o=2.1，vEst=1。下輪應保留並在卡面標觀賞體長估算；分佈及比較物種尚待研究。建議雌鳥佔一特徵圈要額外生成，別以雄鳥圖假充雌鳥。
- 順序 0020+ 未製作。繼續至 **0050（包括）後停止**；0004–0018 R2 仍待用戶確認，不動 UI／註冊，舊 0001–0013 的局部底圖未改。


## 順序交付 0019–0021（最新進度：已交付至 0021）

三張獨立 AVIF 已上載 `(測試中)/working/AvianDex-info`（`1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`）；上載前列目錄僅有 0009–0018，沒有同名檔。Drive 回傳 bytes／MD5／parent 均與本機核對一致。未製作 ZIP、未上載 R2、未改 UI 或 slim 註冊。

| AVIF | 物種 | Drive file ID | bytes | MD5（本機與 Drive 一致） |
| --- | --- | --- | ---: | --- |
| 0019.avif | 叉尾太陽鳥 | 1de7qqwCRTUgNo7PA2M2Q7I8lRMxd9eko | 135219 | aa0f1a41ac5d1b927ea70ff1c6ebd9f9 |
| 0020.avif | 長尾縫葉鶯 | 1M-t4YVsDThskXzy1C-XecrPXoQk-DIBg | 128284 | 28e13040b5aabd074256c8c69d6d424c |
| 0021.avif | 亞歷山大鸚鵡 | 167uZz_bCGhvZ84YGjZWKMECYaSpEgHxp | 136938 | b222aeb426b88d3857c8cfc6c91ba486 |

- **0019 叉尾太陽鳥**：香港 latouchii 成年雄鳥，藍綠頭頸、紅喉上胸、綠背翼及淡黃綠腹；HKBWS 主頁及比較藍喉太陽鳥／黃腹花蜜鳥頁已讀。後者畫華南 rhizophorae 雄鳥紫藍喉胸、暗胸帶、乳白腹，不採泛稱黃腹的錯誤模板。叉尾太陽鳥延長的是最外側尾羽，藍喉太陽鳥是中央尾羽。
- 寫實 features 原始素材的外尾羽延長過長，嘗試修圖時已達本回合 10 張生成上限，該尾部**沒有用於交付卡**。三個寫實特寫只採頭／喉胸／翼，第四個叉尾特寫使用已檢視像素圖（`featureSources` 指定 pixel.png），spec 明確標「像素特寫」，不假稱雌鳥或寫實尾羽。完整卡及最終特徵列已重新目視檢查。
- **0020 長尾縫葉鶯**：橙褐前額漸灰褐後頂、鮮綠背翼、灰白下體、淡肉腳；頭喙圈調整保留喙尖，尾圈呈上翹長尾。比較黃腹鷦鶯繁殖羽（灰頭黃腹）及純色鷦鶯非繁殖羽（褐背淡眉及皮黃下體）。HKBWS 三頁辨識已讀，主鳥 range／LC stable 段已讀。runtime i/c 缺失保持待查、不補零，其餘與 runtime 一致。
- **0021 亞歷山大鸚鵡**：成年雄鳥，粗大紅色上下喙、黑粉紅頸環、深紅肩斑及灰腳。比較紅領綠鸚鵡（無肩斑、下喙黑）及緋胸鸚鵡（灰頭黑鬚粉紅胸）。腳圈重新置中抓枝腳。HKBWS 主頁 range／保育兩 chunks 已讀；全球 IUCN **NT 近危**與香港引入小族群／app 趣味評分分開，runtime r=1 保持不變。副圖只作不同比例外觀比較。
- 三張維持完整世界視角 `[-180,-90,180,90]`、綠色非全境／非完整分佈聲明；0021 為部分原生國家示意，不將香港／歐洲／中東引入族群冒充原生。0019 vEst=1 已標體長估算。
- 已驗證 AVIF 解碼 1024×1536、manifest bytes／SHA256、runtime 分數逐欄一致、world bounds、無 ZIP；Python 編譯及 `git diff --check` 通過。所有 AI 圖只基本目視檢查，非獨立鳥類專家驗證。
- 最終檢查圖：`deliver/cards/batch-0019-0021-art-review.jpg`、三張完整 preview 及 `deliver/cards/batch-0019-0021-final-features.jpg`。

### 下一張 0022 栗樹鴨，做到 0050（包括）後停止

本回合生成 10 張：0019 兩個比較圖、0020 四圖、0021 四圖；額外修圖因上限沒有執行，沒有當作成功。**0019–0021 已完成交付，不要重生或重複上載；0022–0050 尚未完成。** 0022 runtime Dendrocygna javanica／Anseriformes／Anatidae，i2/a3.3/v4/r4.8/c1.2/o3.1/vEst1；尚未研究／生圖／spec。保持 UI 凍結、43 幅插圖不重做、R2 由用戶處理。


## 順序交付 0022–0024（最新進度：已交付至 0024）

用戶「繼續」後順序完成三張資訊卡，直接上載 `(測試中)/working/AvianDex-info`（`1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`）。上傳前查目錄有 0009–0021 共 13 檔，沒有 0022–0024 同名檔。Drive 回傳 bytes／MD5／parent 與本機一致。無 ZIP、R2 上傳、UI 或 slim 註冊改動；43 幅正方形插圖未重做。

| AVIF | 物種 | Drive file ID | bytes | MD5（本機與 Drive 一致） |
| --- | --- | --- | ---: | --- |
| 0022.avif | 栗樹鴨 | 1DB4A1-GeFwqdIqrVTTRznBKDY9da0S_e | 138125 | e5976bd8ba14bcd8ea9d692f339f9e90 |
| 0023.avif | 灰雁 | 1yNpx0MPALj23ZeYXsYkutOCVrC7M7L9F | 141116 | 800394ef407b660105aa330c4818bd27 |
| 0024.avif | 白額雁 | 1ssfQLkev8HwvjiGdGaS1f8aiRMsg59rK | 141088 | 4dbcc712051178746e252d1b3a7cec64 |

- **0022 栗樹鴨 Dendrocygna javanica**：淡褐頭頸、黃眼圈、深灰喙腳、橙褐闊羽緣及栗紅尾上覆羽；HKBWS https://avifauna.hkbws.org.hk/species/0010/000100 全頁已讀，全球 LC decreasing，不以香港罕見程度更改保育徽章。比較黃樹鴨（乳白腰、白脅長羽）與斑胸樹鴨（無鮮黃眼圈、黑白長脅羽）；比較屬廣域外觀相似種，**不是聲稱兩者在香港常見或有野生記錄**。完整來源在 spec。runtime `vEst=1` 已標「觀賞值含體長估算」。
- **0023 灰雁 Anser anser**：畫東方 rubrirostris 粉紅喙腳型成鳥；粗頸、頭頸羽色較一致、折翼灰褐淺羽緣；沒有把站姿翼圈冒稱展翼時的淺灰前翼。HKBWS https://avifauna.hkbws.org.hk/species/0010/000200 全頁已讀，LC increasing。比較凍原豆雁（暗頭頸、黑喙橙斑及橙腳）與白額雁成鳥（白額、黑腹斑、橙腳）；幼鳥例外在 spec 註明。
- **0024 白額雁 Anser albifrons**：成鳥白額、粉紅喙、無鮮黃眼圈、黑腹粗斑及橙腳，幼鳥不一定有白額黑腹斑。HKBWS https://avifauna.hkbws.org.hk/species/0010/000500 全頁已讀，LC unknown trend。比較小白額雁頭像（黃眼圈及更高白額；https://avifauna.hkbws.org.hk/species/0010/000600 已讀）及灰雁頭像。`features.png` 是本輪 0023 的已檢視白額雁比較全身圖原檔複用；灰雁頭像取本輪 0023 features，無重畫或變色。小白額雁頭像加安全邊距，避免圓框裁喙；比較圖不按體型比例。
- 三張全世界底圖 bounds `[-180,-90,180,90]`／world viewport。仍清楚寫部分分佈國家、綠色非全境／非完整分佈；0024 含北美／格陵蘭繁殖地的國家概覽，美國綠色不代表全美洲／全美國棲息，亦不細分繁殖及越冬。
- 已檢視 `deliver/cards/batch-0022-0024-art-review.jpg`、三張完整 preview；特寫摘錄另存 `deliver/cards/batch-0022-0024-final-features.jpg`。AVIF 解碼尺寸 1024×1536、manifest bytes／SHA、taxonomy／runtime 每軸及綜合分數、world bounds、無 ZIP 均通過；Python 編譯及 `git diff --check` 通過。AI 插圖只有基本目視檢查，未經獨立鳥類專家驗證。未改 UI，不重跑 UI tests。
- 0022 SHA256 `915ade4acb6fd5d2acc0f971ee795f7d4694d5bd1246c96eaefe2fa577111b60`。
- 0023 SHA256 `bef72b0077cb4401dc4af1c3eed0f3364664ba4d9ba4a892292ace0635cc3a5e`。
- 0024 SHA256 `31220ed39a0a61027a305709227c9a46d27b2f8640c57f27a5454fa10b45a173`。

### 下一張 0025 小白額雁，仍以 0050（包括）為停止點

本回合 10 張生成額度已用：0022 四圖，0023 四圖，0024 像素及小白額雁比較兩圖。**實際交付至 0024；0025–0050 尚未製作完成，不重複上傳 0022–0024。**

- 0025 runtime：小白額雁 Anser erythropus／Anseriformes／Anatidae，i3.8/a2.8/v4.4/r3.3/c2.2/o3.3。主來源 https://avifauna.hkbws.org.hk/species/0010/000600 本回合全頁已讀：黃眼圈、短粉紅喙、成鳥白額上至眼上方頭頂、長翼過尾；幼鳥無成熟黑腹斑和白額。全球 IUCN **VU 易危**；繁殖北歐亞極圈內挪威至鄂霍次克海三片區，冬季東南歐、裏海南方及中日韓，長江中下游尤洞庭湖。不要以 runtime 分數推算徽章。
- 0025 尚無主圖／完整 features／spec／完整卡／上傳；只有本輪為 0024 製作的小白額雁比較頭像可參考。之後可複用本輪白額雁及灰雁／豆雁已檢視素材作比較，不必全部重生。
- 工作環境重置後 `/home/user/card-venv`／`~/.fonts` 及舊 ignored assets 不在；本輪已重新建 venv（Pillow13/numpy/scipy/fonttools）、從 Google Fonts GitHub 下載 NotoSansTC variable 並生成 400/700 靜態字體、從 Natural Earth GitHub 下載底圖。新 0022–0024 素材及成品位於 ignored 路徑；不要假設舊 0004–0021 ignored 二進位仍在本機，Drive 交付已保留，**不用重做舊卡**。spec／文件仍是源碼記錄。


## 順序交付 0025–0028（最新進度：已交付至 0028）

用戶「繼續」後完成四張資訊卡，直接上載 `(測試中)/working/AvianDex-info`（`1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`）。上載前查目錄有 0009–0024 共 16 檔，無 0025–0028 同名檔。Drive 回傳 parent、bytes、MD5 與本機一致。無 ZIP、無 R2 上傳、無 UI／slim 註冊改動，43 幅正方形插圖未重做。

| AVIF | 物種 | Drive file ID | bytes | MD5（本機與 Drive 一致） |
| --- | --- | --- | ---: | --- |
| 0025.avif | 小白額雁 | 1E0N8BqW_oG9jlQ-NVpNbDKyF-o6bajmO | 144364 | 76ce9989b145cb8419344094db875aba |
| 0026.avif | 寒林豆雁 | 16HGbRRYhUGqODvqWYcEc1WqE8mMtnyyP | 137762 | 05bd416e6476088599b27807a1ed47a2 |
| 0027.avif | 凍原豆雁 | 1yB4keNLLik-tMGJgTVRyk0at8z-Ci_dn | 142908 | ed6d46bd2019f47b10df4e633fbfafc2 |
| 0028.avif | 大天鵝 | 1AFPsgVVRyqT7m44PBMC062OXpBym74Zd | 128877 | 85dcaad34c1be9978bd3d1544904cec0 |

- **0025 小白額雁 Anser erythropus**：成鳥高白額、鮮黃眼圈、短粉紅喙、黑腹斑及橙腳。採 HKBWS https://avifauna.hkbws.org.hk/species/0010/000600 全頁，全球 **VU 易危**；幼鳥白額及黑腹紋未成熟，不以成人圖代表幼鳥。比較白額雁及東方粉紅喙腳灰雁，均重用 0023 已檢視全身圖。
- **0026 寒林豆雁 Anser fabalis**：東方 middendorffii 成鳥，較長漸尖黑喙、小橙喙尖前斑、順額線、長而較纖細頸及長身；比較凍原豆雁及灰雁。HKBWS https://avifauna.hkbws.org.hk/species/0010/000300 全頁已讀，**其 LC 是豆雁合併概念評估**，卡面明示「LC 依來源豆雁合併評估」，不冒稱獨立分拆物種評估。喙斑變異大，不把大小當唯一辨識。
- **0027 凍原豆雁 Anser serrirostris**：較短厚喙、短頸及緊湊體型，features 複用 0023 已檢視凍原豆雁原檔，沒有以寒林圖變色頂替。比較本輪寒林豆雁及短嘴雁（黑喙粉紅斑、粉紅腳，RSPB https://www.rspb.org.uk/birds-and-wildlife/pink-footed-goose 來源；不是聲稱香港常見）。HKBWS https://avifauna.hkbws.org.hk/species/0010/000400 全頁已讀，LC 同樣合併評估註記。第一特寫加大裁切保留喙尖，第二標「短頸」。runtime i/a 缺失保持待查，其他數字含 o=4.2 原樣，不補零或重算。
- **0028 大天鵝 Cygnus cygnus**：白色成鳥、長頸、黃黑長喙黃色楔斑超鼻孔及黑腳。主來源 HKBWS https://avifauna.hkbws.org.hk/species/0010/000700 全文可讀（只有內嵌媒體帶防爬佔位），LC。比較小天鵝畫歐亞 **C. columbianus bewickii** 黃斑較圓小型，不代表北美 nominate；疣鼻天鵝橙喙黑瘤。比較來源 RSPB https://www.rspb.org.uk/birds-and-wildlife/identifying-birds/uk-swan-identification ，比較頭像加安全邊距，沒有改物種羽色。
- 四張保留 world viewport／bounds `[-180,-90,180,90]`，綠色仍只是部分原生分佈國家示意、非全境／非完整分佈，不分繁殖／越冬多邊形。0025 不把俄羅斯全境當棲地；0026/27 地圖按分拆後各自概覽，但保育評估註記來源合併概念。
- 已檢視 `deliver/cards/batch-0025-0028-art-review.jpg`、四張完整 preview 及 `deliver/cards/batch-0025-0028-final-features.jpg`。四檔 AVIF 解碼／1024×1536、manifest bytes／SHA／spec、taxonomy、runtime 分數逐欄一致、world bounds、無 ZIP 均通過；Python 編譯及 `git diff --check` 通過。AI 圖只有基本目視檢查，非獨立鳥類專家驗證。不改 UI、不重跑 UI tests。
- 0025 SHA256 `43b89115eec2c666824c5cec0b68d7a31ed8ca6cf3781e88c33561897b0311d9`。
- 0026 SHA256 `c9b00ba879fc371808217f8a9ee6f849844d370c7235c87a982820c482b13c00`。
- 0027 SHA256 `8366dc2883cfaca52f62aaf45ef50e58cdb89fb5ed000a0d0b793dff6fe2d3fe`。
- 0028 SHA256 `29bfb7a703f3c2285663b16ad9978fbf653b879a14553544ca80f528731fe369`。

### 下一張 0029 赤麻鴨，仍做到 0050（包括）後停止

本回合 10 張生成已用：0025 主圖／features 兩張、0026 兩張、0027 像素／短嘴雁兩張、0028 四張。**交付至 0028；0029–0050 尚未完成。** 0025–0028 不要重複生成／上載。

- 0029 赤麻鴨 Tadorna ferruginea，Anseriformes／Anatidae，runtime i2/a5/v4.5/r3.3/c3/o3.6；尚無研究／生圖／spec。
- 0030 翹鼻麻鴨 Tadorna tadorna，runtime i2/a3.3/v4.6/r3.3/c1.2/o2.9/vEst1；尚未製作。
- 本輪 venv／字體／0022–0028 ignored assets 仍在工作區；腳本 `/home/user/make_specs_25_28.py` 是初始 spec 生成器，**不要盲目重跑**（0026 featureNotes、0027 頭喙 crop／短頸標籤在之後已修正，JSON 為最終權威）。如環境重置導致 ignored 舊素材消失，Drive 交付已保留，不重做舊卡。R2 由用戶處理，未確認前不登記新 slim，UI 繼續凍結。


## 0029–0031 直接 AVIF 交付完成

本批依序完成 0029 赤麻鴨、0030 翹鼻麻鴨、0031 棉鳧，已直接上載 `(測試中)/working/AvianDex-info`（`1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`）。上傳前查目錄只有 0009–0028 共 20 檔，沒有本批同名檔；Drive 回傳 parent／bytes／MD5 與本機一致。沒有 ZIP、R2 或 UI／註冊改動；43 幅既有插圖沒有重做。

| AVIF | 物種 | Drive file ID | bytes | MD5 |
| --- | --- | --- | ---: | --- |
| 0029.avif | 赤麻鴨 | 1OYnGKPKlBNtt8iipCXWvUqj1HpOxwVyb | 139292 | 0d721607a7cff31660225ccb6d5873df |
| 0030.avif | 翹鼻麻鴨 | 1taF7JuUXTrWeHkGsg0hZlo5HWhJARhZ8 | 138323 | 72f6c41908521057f00a642d51f2b7dc |
| 0031.avif | 棉鳧 | 1bCIMaspnf-WRD-zjETW1wKrpUvjHRYWi | 132662 | cd1072dafe99c67f6dddce9ff909fde4 |

- 0029：HKBWS https://avifauna.hkbws.org.hk/species/0010/000900 全文研究；橙褐身、淡皮黃頭、黑喙腳，畫繁殖羽雄鳥黑色頸環，並非所有性別季節都有頸環。LC／趨勢未知。比較翹鼻麻鴨及埃及雁；後者不是聲稱香港常見野生鳥。
- 0030：HKBWS https://avifauna.hkbws.org.hk/species/0010/000800 主要內容已讀；白身、深綠頭頸、雄鳥紅喙基瘤、栗橙胸帶及粉紅腳。幼鳥不具此完整成鳥圖案。LC／增加，不因香港近年減少而改徽章。runtime vEst=1 已標示體長估算。0029 的翹鼻麻鴨比較圖作本卡 features，赤麻鴨及埃及雁比較圖沿用本批已審原圖，無改色。
- 0031：HKBWS https://avifauna.hkbws.org.hk/species/0020/001100 正文已讀（嵌入媒體 bot 提示不影響正文）；畫繁殖羽雄鳥黑冠白面白頸、深色頸胸界線、暗綠背翼；第四圈以獨立 female.png 及 featureSources 清楚標「雌鳥」，顯深眼紋及偏黃喙基。浮水姿勢沒有憑空加腳特寫。LC／穩定。比較同屬綠棉鳧與非洲棉鳧，屬世界其他地區近似種，不聲稱香港常見或有野生記錄。綠棉鳧橫圖先補成方圖以保留整鳥，未重生。
- 全世界底圖維持 [-180,-90,180,90]；標示部分原生分佈國家，不是完整分佈／全國皆有／繁殖越冬精確圖層。0031 圖示種級分佈包含澳洲 albipennis，主圖則為指名亞種雄鳥。
- 基本目視檢查：先看十幅素材 contact sheet，再看 0029 features、Common Shelduck 原圖、0031 雌雄原圖，最後逐張閱讀三張完整預覽；頭喙、腳及近似種圈未見裁去關鍵部位。僅 AI 圖基本審閱，不代表獨立鳥類專家驗證。
- AVIF 逐張 decode 1024×1536、bytes／SHA256、本機與 Drive MD5、runtime 六項 scores／taxonomy、spec=manifest、全世界 bounds、無 ZIP、Python compile 及 git diff --check 通過。
- 0029 SHA256 `106c2915333634aa8a345c611cf7d2daa18bbe4d9693007f7b6cb266afc5349a`；0030 `960ef1db561d124e14c69c73220ce087e10a2965ca1d5b77ec9a373289ad63b4`；0031 `52f4d7f928afc2386b45232ec36cd05804b75aa1ca9346f7e6ecebc6880cc9fd`。

### 目前交付至 0031；下一張 0032 鴛鴦；0050（包括）後停止

本批 10 幅素材已完成，0029–0031 不重複生成／上載。下一張 0032 鴛鴦 Aix galericulata（雁形目／鴨科；runtime i2/a4.7/v4.1/r4.8/c1.2/o3.4），尚未研究或生圖。後續 0032–0050 仍待完成。UI 凍結；R2 由用戶處理，未確認前不新增 slim 註冊。
腳本 `/home/user/make_specs_29_31.py` 是本批初始生成器，最終 JSON 為權威（0030 後來移除未讀的額外 eBird source）。


## 0032–0034 直接 AVIF 交付完成

本批依序完成 0032 鴛鴦、0033 花臉鴨、0034 白眉鴨，已直接上載 `(測試中)/working/AvianDex-info`（`1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`）。上傳前以目錄＋三個檔名查詢，0 個重複檔；Drive 回傳 parent／bytes／MD5 均與本機一致。沒有 ZIP、R2 或 UI／註冊改動，43 幅既有正方形插圖沒有重做。

| AVIF | 物種 | Drive file ID | bytes | MD5 |
| --- | --- | --- | ---: | --- |
| 0032.avif | 鴛鴦 | 1elc6wrVXsAk4h1LBjHiyDYChZKo4SBuk | 150698 | cc314c9a19e427e9f83d398c8bf82e51 |
| 0033.avif | 花臉鴨 | 1fNv7ffOovJBHBATqckMMz63vpdKsbhOr | 152242 | da377e403f523ed088767c5197982508 |
| 0034.avif | 白眉鴨 | 1aHx3fzfQJ4--25j2XL5ng5tWI_nSsV1V | 153792 | 1250a725d983a56d4a5dd0fff31d97f7 |

- **0032 鴛鴦 Aix galericulata**：HKBWS https://avifauna.hkbws.org.hk/species/0020/001000 所有主要正文已讀；繁殖羽雄鳥紅喙、寬乳白眉、橙褐頰鬚及直立帆狀三級飛羽、紫胸與皮黃脅間兩條黑白直紋。雌鳥灰頭、白眼圈連尖幼眼後線及胸脅淡斑；對照區明確標「鴛鴦雌鳥」，JSON `sameSpecies=true`，不是當作第二種。另一對照為北美林鴛鴦 Aix sponsa（紅眼、綠冠及白喉線，無橙帆羽）；不聲稱香港常見野生鳥。LC decreasing；地圖僅選原生東亞部分國家，沒有將歐洲引入分佈畫作原生。Realistic male 原圖左尾碰邊，僅用頭／頰／帆／胸脅特寫，不當整鳥對照；pixel 主鳥完整。
- **0033 花臉鴨 Sibirionetta formosa**：HKBWS https://avifauna.hkbws.org.hk/species/0020/001200 全頁已讀；繁殖羽雄鳥黃綠黑白臉、黑淚狀眼下紋、粉調胸部黑斑、栗黑白皮黃長肩羽、灰脅細波紋；LC increasing。雌鳥喙基白點／白喉只作研究記錄，沒有錯套到雄鳥。比較歐亞型綠翅鴨 Anas crecca（體側白橫線，不是美洲型白直條）及雄白眉鴨。
- **0034 白眉鴨 Spatula querquedula**：HKBWS https://avifauna.hkbws.org.hk/species/0020/001300 主要正文已讀；繁殖羽雄鳥褐頭寬白眉彎至頸背、褐胸灰脅、黑白長肩羽；第四圈獨立 female.png 清楚標雌鳥頭喙、淡眉頰紋間暗眼紋及淡喉。男鳥特寫沿用本批 0033 白眉鴨比較原圖，無改色；浮水姿勢不加假腳特寫。LC decreasing；runtime vEst=1 已標「觀賞值含體長估算」。比較綠翅鴨及花臉鴨。
- 三張沿用 full-world bounds [-180,-90,180,90]，國家綠色只是部分原生分佈概覽，並非全境／完整範圍／精確繁殖越冬多邊形。所有所選 ADM0_A3 在 NaturalEarth 底圖中存在。
- 基本目視：十幅 contact sheet、四張關鍵原圖、三張完整預覽均已看；其後修正 0032 胸脅 crop 與 0033／34 長肩羽 crop，再看 `batch-0032-0034-final-features.jpg`。只是 AI 圖基本目視審閱，未經獨立鳥類專家驗證。
- AVIF 每張 decode 1024×1536、bytes／SHA256、Drive MD5／parent、spec=manifest、runtime taxonomy／六項 scores、世界 bounds／國碼、無 ZIP、Python compile、git diff --check 通過。
- 0032 SHA256 `c3177e3f9436572c824d40dd52202be8c32a0f19a58201391be13458d705d131`；0033 `9e9a0821453ceca25d6d1ef36570d3e85104915e6035994b7a1370fbeef9dcf4`；0034 `10b5409376425f68afa5b09256bcc3c10156184898463cb58ce97f88d566e614`。

### 已交付至 0034；下一張 0035 琵嘴鴨；0050（包括）後停止

本回合十幅素材均已使用，0032–0034 不重複生成／上載。0035 琵嘴鴨 Spatula clypeata runtime i2/a4.3/v4.2/r4.8/c1.2/o3.3/vEst1；0036 赤膀鴨 Mareca strepera runtime i2/a3.8/v4.3/r3.3/c3/o3.3，均尚未研究／生圖。後續 0035–0050 待完成；UI 凍結，R2 由用戶處理，確認前不新增 slim 註冊。
`/home/user/make_specs_32_34.py` 只記錄本批初始 spec，**不要盲目重跑**：0032 第四 crop、0033／34 第三 crop 之後已修正，最終 JSON 為權威。


## 0035–0037 直接 AVIF 交付完成

本批依序完成 0035 琵嘴鴨、0036 赤膀鴨、0037 羅紋鴨，直接上載 `(測試中)/working/AvianDex-info`（`1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`）。上傳前以 parent＋三個檔名查詢，0 個重複檔；Drive 回傳 parent／bytes／MD5 與本機一致。沒有 ZIP、R2 或 UI／註冊改動，43 幅既有插圖沒有重做。用戶另開 Agent 處理 0051–0100，本 Agent 不碰其範圍，只做到 0050（包括）後停止。

| AVIF | 物種 | Drive file ID | bytes | MD5 |
| --- | --- | --- | ---: | --- |
| 0035.avif | 琵嘴鴨 | 1SKt5IsK9w6-TA1RCiadgBp0R7jpQDfmh | 142474 | 624daf6ddb27a404417b5e5927b2aa29 |
| 0036.avif | 赤膀鴨 | 173t7rtg1gLuGy6KtGgMgFiy038hdVRdw | 146674 | 6dc836807ed2493cbc6ed7344141aefd |
| 0037.avif | 羅紋鴨 | 179_8xFdu3YPHTO_w0zlHalQKunVFQyMR | 154225 | 01e32691c1017011de6be5b462883272 |

- **0035 琵嘴鴨 Spatula clypeata**：HKBWS https://avifauna.hkbws.org.hk/species/0020/001400 兩 chunks 已讀。長匙狀喙；繁殖羽雄鳥深綠頭黃眼、白胸栗脅，第四圈獨立 female.png 標示雌鳥頭喙及淡橙喙側。LC decreasing；vEst=1 已標體長估算。比較新製綠頭鴨（黃喙栗胸灰脅）及沿用 0033 已審白眉鴨（褐頭白眉），不冒稱折翼圖為展翼色塊圖。
- **0036 赤膀鴨 Mareca strepera**：HKBWS https://avifauna.hkbws.org.hk/species/0020/001500 全頁已讀。雄鳥素褐灰頭暗喙、胸脅羅紋、白色內側次級飛羽翼鏡及黑尾端；第四圈獨立 female.png 明示雌鳥橙喙側、暗中央脊。LC increasing，香港冬鳥減少不能改成較高 IUCN。比較綠頭鴨及本批羅紋鴨。
- **0037 羅紋鴨 Mareca falcata**：HKBWS https://avifauna.hkbws.org.hk/species/0020/001600 全頁已讀。雄鳥栗綠後垂冠、黑喙上小白點、白喉黑環、胸粗脅細羅紋、淡灰緣黑色長而下垂的次級飛羽。鐮刀狀羽是翼羽，不寫成中央尾羽。全球 NT decreasing，徽章近危；runtime vEst=1 已標估算，其他 scores 不變。比較赤膀鴨及綠頭鴨。
- **剔除素材**：原擬 0037 赤頸鴨比較圖 `eurasian-wigeon.png` 的黃色額冠不夠清楚，基本目視時排除，不在 spec 的任何圖槽中。改用已審赤膀鴨／綠頭鴨，不用不合格圖湊數。赤頸鴨 HKBWS https://avifauna.hkbws.org.hk/species/0020/001700 主要正文已讀，供下一張研究參考，但下一張圖片必須另製，不可重用此圖。
- 基本目視：十幅素材 contact sheet、三張雄鳥特寫原圖及三張完整預覽已讀；頭喙／特寫及對照圈可辨識。僅 AI 圖基本審閱，非獨立鳥類專家驗證。
- 全世界底圖 bounds [-180,-90,180,90]，綠色為部分原生分佈國家，不是全境／完整範圍／精確季節圖；所有所選國碼在 NaturalEarth ADM0_A3 中存在。AVIF 三張逐一 decode 1024×1536、bytes／SHA256、Drive MD5／parent、spec=manifest、runtime taxonomy／六項 scores、無 ZIP、Python compile、git diff --check 通過。
- 0035 SHA256 `d3eac91de678a8b5471f9da275305060601139935fe49f93f8485d88cab8b6bd`；0036 `b84beb7e727dab24f6f3f383520954af075c50487184ca588a945bc2e3f03bfc`；0037 `9b23eedb980d92da408dd3ee0ee7f65b1ce5e017257e2ee0a12f07e302c116bd`。

### 已交付至 0037；下一張 0038 赤頸鴨；0050（包括）後停止

本回合十幅素材已用，0035–0037 不重複生成／上載。下一張 0038 赤頸鴨 Mareca penelope runtime i2/a3.8/v4.1/r3.3/c1.2/o2.9；HKBWS 主要正文已讀（LC decreasing、雄鳥栗頭黃額冠、短淡灰黑尖喙），尚無合格主圖／特寫／spec。上一張比較候選 `cards/art/info-restart-0037/eurasian-wigeon.png` 已判不合格，不可挪作下一張。0038–0050 待完成；0051–0100 由用戶另一 Agent 處理。UI 凍結，R2 由用戶處理，確認前不新增 slim 註冊。
`/home/user/make_specs_35_37.py` 記錄本批 spec 生成；最終 JSON 為權威。已交付卡的 ignored 素材如日後不在工作區，勿重做 Drive 已交付檔。

## 0038–0040 本回合部分完成；交付仍至 0037，沒有新上載

用戶「繼續」後研究 0038–0040，首次並行 10 個 generate_image 呼叫中前五個失敗（工具只回 Image generation failed），後五個成功；再試 0038 pixel，明確回 `Image generation limit of 10 reached for this turn`。已停止生圖，告知用戶。**不可將失敗原因擅自說成物種或 prompt 問題**；也不可說本批已完成上載。

### 已有素材及審閱

- 0038：本回合 pixel、features、female 均生成失敗，沒有可用新圖。上一批 `cards/art/info-restart-0037/eurasian-wigeon.png` 黃額冠不明顯已判不合格，仍不能重用。
- 0039：pixel、features 失敗；`cards/art/info-restart-0039/female.png` 成功，基本目視呈灰頭細斑、短淡灰黑尖喙及暖褐胸，保留作獨立明示雌鳥特寫。
- 0040：`cards/art/info-restart-0040/{pixel,features,eastern-spot-billed,mallard-female}.png` 四張成功，各 1254×1254。全部放入 `deliver/cards/batch-0038-0040-partial-art-review.jpg` 已看；0040 features 原圖亦看。
- **0040 棕頸鴨已本機排版及基本目視檢查，未上載**：spec `scripts/cards/info-restart-0040.json`；輸出 `deliver/cards/info-restart-0040/{preview-0040.webp,aviandex/0040.avif,manifest.json,SHA256SUMS}`。完整預覽已看，四圈頭喙／冠眼紋／折翼／棕頸，對照中華斑嘴鴨與明示綠頭鴨雌鳥，字樣、數值及裁切基本正常。地圖只 PHL（原生菲律賓），不把香港／台灣迷鳥紀錄當正常原生分佈。
- 0040 AVIF 154449 bytes，MD5 `61861dd1a3548df62cdab849aba3869c`，SHA256 `b4b8205ab20b4c702b2135ea828d8422dca93f9c033691eae4b3055642f8aa1a`。decode 1024×1536、bytes/hash、spec=manifest、runtime taxonomy／六項 scores、world bounds／PHL、無 ZIP、compile、git diff --check 通過。Manifest 狀態 `visually_reviewed_local_pending_sequential_upload`，有 uploadHold。**沒有 googleDrive file ID，沒有呼叫 Drive 工具，沒有上載成功待追查的不確定結果。**

### 已讀研究，下回合無須重複廣泛搜尋

- **0038 赤頸鴨 Mareca penelope**：本回合重新 fetch HKBWS https://avifauna.hkbws.org.hk/species/0020/001700 chunk0 含所有主要內容。45–51cm、短頸圓冠、短淡灰黑尖喙；繁殖羽雄鳥栗頭頸配明顯黃色額冠、粉調胸、灰脅／上體、黑白後下體；雌鳥／幼雄可暖褐至灰褐斑駁，不可套雄鳥黃冠。IUCN LC decreasing；冰島／北歐橫跨歐亞至白令海繁殖，冬南歐北非／中東／印度北半／東亞至日本，中國東北繁殖、黃河以南包括海南台灣越冬。Runtime i2/a3.8/v4.1/r3.3/c1.2/o2.9。建議全新 pixel+features+female 三張，黃色額冠須明確，輕微三分之四頭向可增加可見度。比較可用 0039 新 male features（待生）及 0037 已審羅紋鴨。
- **0039 綠眉鴨 Mareca americana**：HKBWS https://avifauna.hkbws.org.hk/species/0020/001800 full text 已讀（媒體嵌入 bot placeholder 不影響正文）。45–58cm，雄鳥白額冠、寬綠眼後至頸背紋，胸及脅帶粉褐調，頭較大／前額較陡。下翼腋羽及中覆羽白，並非本卡浮水圖可冒稱展示。灰細斑頭與栗色污染需小心雜交，HK 有赤頸×綠眉雜交記錄；本卡畫純型雄鳥，不自行造雜交比較圖。IUCN LC stable；原生繁殖阿留申／阿拉斯加、西加拿大及零散東部／美北，冬美洲太平洋沿岸、西／南美國至佛州／加勒比／極北南美。HK／中國紀錄迷鳥，不應把整個中國作正常分佈高亮。Runtime i2/a2.3/v4.2/r4.8/c1.2/o2.9。female.png 已有，不重生；尚需 pixel/features。比較 0038 新雄鳥及 0037 羅紋鴨皆可。
- **0040 棕頸鴨 Anas luzonica**：HKBWS https://avifauna.hkbws.org.hk/species/0020/001900 全頁讀。48–58cm，橙皮黃眉面上頸、黑冠眼紋，褐上體淺羽緣、下體較淡；喙灰，中央脊／喙甲黑，**沒有斑嘴鴨鮮黃端**；翼鏡藍綠隨角度、次級飛羽淺尖；雌雄近似。菲律賓特有，主要島及部分小島；香港台灣迷鳥。IUCN VU decreasing（獵捕／濕地流失）。Runtime i3.8/a4.3/v4.3/r3.3/c4/o3.9/vEst1，已標體長估算。來源與限定寫在已完成 spec。
- 對照 **中華斑嘴鴨 Anas zonorhyncha**：fetch https://avifauna.hkbws.org.hk/species/0020/002100 chunk0 主要內容已讀。鮮黃喙端、淡頭黑冠／眼紋，身向後變深，白三級羽緣，翼鏡藍綠＋窄白邊；勿用另一網站錯誤聲稱某種固定色／紅基。**綠頭鴨雌鳥**：search https://www.allaboutbirds.org/guide/Mallard/id 已讀摘要，褐色斑駁、橙黑喙、白邊藍翼鏡。

### 下一步：先補 0038、0039，再依序上載 0038→0039→0040

新回合可先生成缺少的五幅（0038 三、0039 二），保留已審 0039 female 與0040全部素材；然後做0038/39spec、render、目視／audit。0040 已審本機檔可沿用；順序上傳前查 Drive 同名防重複，再核對 bytes／MD5／parent，更新 manifest／docs。0040 spec 末條 LOCAL PREVIEW ONLY hold note 可在交付準備就緒時更新（如改 spec，render 會清掉 manifest 狀態，注意先後順序）。UI仍凍結、無ZIP/R2，0001–0037不重做；**本 Agent 僅0038–0050，0051–0100由另一 Agent處理，0050包括後停止。**

## 跨 Agent 共用檔案與合併說明

用戶要求先將目前製作規格合併 main，讓另一個 Agent 可開始 0051–0100。此次提交包含 0004–0037 及 0040 的 JSON（連同原有 0002／0003 共 38 個 spec）、本紀錄及 renderer 更新；**0038／0039 尚未完成，沒有該兩個 JSON，0040 僅本機待順序交付**。本 Agent 續做 0038–0050；另一 Agent 只做 0051–0100，避免交疊。

- 新 Agent 請先同步已合併的 main 到其工作分支，確認能讀到 `scripts/cards/info-restart-0032.json`、`0033.json`、`0034.json` 及 `render-info-restart.py`。不用切換到本 Agent 分支。
- JSON 是可分享的版式／來源／裁切範例，**不包含圖片本身**；`cards/art/`、`deliver/cards/` 按既有規則不進 Git。新卡仍需自己的素材，不能因新 checkout 找不到舊素材而重做已交付卡。
- 執行：`python scripts/cards/render-info-restart.py 0051`（先建 0051 spec 與 `cards/art/info-restart-0051/`）；依 spec 準備 pixel.png、features.png、比較圖、可選 featureSources 及 countries.geojson。
- Python 用 venv 安裝 Pillow（需支援 AVIF）。中文字體由 compose-card.py 的 `FONT_DIR` 使用，預設 `~/.fonts`，可設 `AVX_FONT_DIR`；需要 `NotoSansTC_400Regular.ttf`、`NotoSansTC_700Bold.ttf`。不要假定其他 Agent 共用本機 venv 或 fonts。
- 底圖從 spec 的 `rangeMap.geometrySource` 取得 NaturalEarth `ne_110m_admin_0_countries.geojson`，儲存新卡素材目錄為 countries.geojson；是公有領域國界，不是鳥類分佈圖層。
- renderer 支援缺失評分待查、featureSources 雌／幼鳥獨立來源、world bounds 檢查、vEst 及 assessmentNote 註明，不再產生 ZIP；不改 UI 或 runtime scores／taxonomy／卡面註冊。
- 提交前 38 份 JSON 基本結構／名稱／學名／0014+世界 bounds 驗證及 Python compile 通過；新環境首次 build 缺 tsc，安裝 `npm ci --no-audit --no-fund` 後 `npm run build` 通過。
