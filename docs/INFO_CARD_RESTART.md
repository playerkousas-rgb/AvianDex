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

## 0051–0100（另一 Agent）實際製作紀錄

### 0051 斑背潛鴨：已檢視並直接上載 Google Drive

- 規格：`scripts/cards/info-restart-0051.json`；使用 main 的共用 renderer/compositor，1024×1536 slim。沒有改動版式、UI、Service Worker、runtime taxonomy/scores 或 slim 註冊。
- 依 runtime 確認名稱斑背潛鴨、Aythya marila、雁形目／鴨科；六項 app 分數 i=2.0、a=3.8、r=4.8、c=3.0、v=4.1、o=3.5，沒有重算。vEst 未設，故無體長估算註記；renderer 的缺分相容能力沿用 main。
- HKBWS Avifauna https://avifauna.hkbws.org.hk/species/0020/003100 全頁已讀：40–51 cm；香港為 Category I、罕見冬候鳥，集中後海灣；雄鳥繁殖羽圓頭無冠、綠光黑頭、藍黑胸、細密灰白蟲紋背及純白脅；雌鳥褐色、喙基白斑較大。IUCN 全球 LC、趨勢下降；香港罕見程度與全球 IUCN 評級分開呈現。
- 鳳頭潛鴨比較查閱 HKBWS https://avifauna.hkbws.org.hk/species/0020/003000；小潛鴨比較查閱 Cornell All About Birds https://www.allaboutbirds.org/guide/Lesser_Scaup/id。主像為雄鳥；第四特寫清楚標示同種雌鳥。兩個相似種比較分別標示雄鳥，北美小潛鴨只作易混淆比較，不暗示香港出現。
- 全世界底圖 bounds `[-180,-90,180,90]`；綠色為部分原生分佈國家，卡面明示「綠色非全境；非完整分佈」，不是精確分佈多邊形。小潛鴨雄鳥比較圖已重製，最新圓裁切清楚呈現其後頂小尖峰；與鳳頭潛鴨明顯較長的後垂冠羽可區分。完整預覽、四個特寫圈、比較圈、文字及評分均重新檢查；AI 插圖只作基本目視檢查，未經獨立鳥類專家驗證。
- 最新成品 `deliver/cards/info-restart-0051/aviandex/0051.avif`：144,270 bytes，SHA256 `b6ac948a4770b4951ca1b9ce6ef43ee0b87cf591ff2ade2f80a2d76061665167`，MD5 `553af7c06b12e512f7b4428964499d49`；AVIF 已解碼確認 1024×1536。
- 初版 Drive file `1oO6t3D2f-1nIe3LbCVxceIorHzg24nXJ` 因視覺修正已移至垃圾桶。上載前查到此一舊同名檔；先上載修正版再以 `get_file` 核對新 file ID `1LGj1suEbU9Fbm0z3-G6_cy04T-L1WJxM`、parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、144,270 bytes 及 MD5 均相符，之後移除舊檔，目前資料夾只留一個 0051。沒有 ZIP 或 R2，交付 manifest 已更新。
- 0051 比較圖已修正並重新上載；新 Drive file ID `1LGj1suEbU9Fbm0z3-G6_cy04T-L1WJxM`，舊版已移至垃圾桶，資料夾沒有同名副本。0052、0053 及 0054 的獨立 AVIF 亦已完成上載及 metadata 核對。

### 0052 絲絨海番鴨：已檢視並直接上載 Google Drive

- 規格及來源：`scripts/cards/info-restart-0052.json`。HKBWS 嘗試頁面 `https://avifauna.hkbws.org.hk/species/0020/003200` 只有通用頁殼，沒有物種正文；以 Cornell eBird `https://ebird.org/species/whwsco3` 核對雄鳥單一眼下白斑、黃色喙及白翼鏡、雌鳥褐色及兩個淺色頭斑；IUCN/BirdLife 2020 評估為全球 VU 易危，非香港出現頻度。黑海番鴨比較採 HKBWS `https://avifauna.hkbws.org.hk/species/0020/003300`：雄鳥全黑、無白翼、具橙黃色喙瘤，香港僅有單一記錄。
- runtime 名稱／分類均相符；runtime `a=2.8, r=1, v=4.4, o=2.7, vEst=1`，`i/c` 缺值保持「待查」，不補零或重算。卡面可見體長估算註記。
- 主圖是單白眼下斑的雄鳥像素圖；四特徵圈含黃喙、眼下白斑、白翼鏡及明確標示的雌鳥雙頭斑。兩個比較是雄性黑海番鴨及明確標示的同種雌鳥。曾由 `features.png` 裁取雌鳥頭像另存 `female.png`；不是換色冒充另一種。已逐項看完整預覽、特寫及比較圓裁切；AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 世界底圖 bounds `[-180,-90,180,90]`；國家高亮僅北歐／西西伯利亞及歐洲、黑海—裏海區域的部分概覽，明示綠色非全境／非完整分佈，不是精確季節多邊形，亦不暗示香港分佈。
- 成品 `deliver/cards/info-restart-0052/aviandex/0052.avif`：1024×1536、149,054 bytes，SHA256 `a9099e1ffeb168c5193541756db954ab0fbbdea4fd4cd0b02ce0f9051efbbdc9`，MD5 `844119a2756e656c5ce6f534d4fd630f`；AVIF 已解碼。
- 上載前指定資料夾按 `0052.avif` 查得 0 個同名檔；直傳單張 AVIF，Drive file ID `1r57Uh2fYJ0mD7-rh6kfDeleTFltvP1Ar`。`get_file` 核對 parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes 149,054、MD5 均一致。本機 manifest／README 已更新。無 ZIP、R2、UI、Service Worker、app slim 註冊或 renderer 改動。

### 0053 紅胸田雞：已檢視並直接上載 Google Drive

- runtime 名稱／分類為紅胸田雞 *Zapornia fusca*、鶴形目／秧雞科。`dexScores` 無 0053 記錄，六項及綜合分全數待查；不補零、不推算。
- HKBWS Avifauna `https://avifauna.hkbws.org.hk/species/0060/008000` 全頁已讀：香港 Category I，稀少過境及冬候鳥，常見於濃密淡水／微鹹濕地；成鳥橙褐額、深紅頰喉胸及上腹、冷褐上體、下腹與尾下稀疏白橫斑、深紅腿腳；IUCN 全球 LC、趨勢下降。香港季節性稀少程度與全球 IUCN 評級分開呈現。
- 比較紅腳苦惡鳥 *Zapornia akool*（橄欖褐／灰、淡喉、紫紅腿）及小田雞 *Zapornia pusilla*（較小、灰色臉／下體、具白斑褐色上體、脅尾下密集黑白橫斑、黃綠腿），兩者均有 HKBWS 來源記錄於 `scripts/cards/info-restart-0053.json`。
- 四張獨立素材及完整 preview 已逐項看；主鳥胸色／喙／深紅腿、特寫的尾下白斑及腿腳、兩種比較圈均可辨。AI 插圖只有基本視覺審核，未經獨立鳥類專家驗證。
- 地圖 bounds `[-180,-90,180,90]`，以部分國家作範圍概覽，清楚標示綠色非全境／非完整分佈。
- 成品 `deliver/cards/info-restart-0053/aviandex/0053.avif`：1024×1536、174,014 bytes，SHA256 `7b31f4e8151e7bd99be2f494b9f842ea7a4c9796936b129040e5f5184ea742b4`，MD5 `4dc65b76b4de4f907f1541b5d0eca4c2`；Drive file ID `1qTgtskoSQmH2s7qB7Vr4zy-eRfvkkWed`。上載前查 0 同名檔；Drive `get_file` 核對 parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes、MD5 均相符。本機 manifest 已更新；無 ZIP、R2、UI／Service Worker／slim 註冊或共用 renderer 改動。

### 0054 黑海番鴨：已檢視並直接上載 Google Drive

- 規格 `scripts/cards/info-restart-0054.json`，使用 runtime 黑海番鴨 *Melanitta americana*／雁形目／鴨科。`dexScores` 沒有此 ID，六項及綜合分保持待查；不補零、不推算。HKBWS `https://avifauna.hkbws.org.hk/species/0020/003300` 全文已讀：香港 Category I 偶見，僅 2007 年 12 月 Mai Po 一筆記錄；雄鳥全暗、無白翼及大型橙黃喙瘤，雌鳥暗褐、深色頭帽及較淡下半臉，全球 IUCN NT。卡面明確分開全球近危與香港偶見狀態。
- 比較來源：Cornell eBird Common Scoter `https://ebird.org/species/blksco1`（雄鳥黃楔喙，無大型腫瘤狀橙黃喙瘤）及 Velvet Scoter `https://ebird.org/species/whwsco3`（雄鳥白翼斑及眼下白斑）。兩者均明確標示雄鳥，不暗示香港出現或常見。
- 最終素材 `pixel.png`、修正後 `features.png`、`flight.png` 及兩種比較圖均已目視。第一版 `features.png` 曾把黑海番鴨雄鳥畫成有白翼斑，與來源矛盾，已排除並重新生成；最終卡沒有引用錯誤版本。四個圈分別是喙瘤、全暗無白翼、飛行時下翼覆羽與較淡飛羽底面、短頸厚實體型。完整預覽已看，標籤與裁切可辨；AI 插圖僅基本目視審核，未經鳥類專家驗證。
- 地圖全世界 bounds `[-180,-90,180,90]`，只高亮 USA/CAN/RUS/JPN/CHN 的部分範圍，卡面明示綠色非全境／非完整分佈；香港單一偶見記錄沒有當成常態分佈標示。
- 成品 `deliver/cards/info-restart-0054/aviandex/0054.avif`：1024×1536、151,990 bytes，SHA256 `7aa3ef75290be8271c3781771ce377cb3a6c912ce829ff1852e960561b5938aa`，MD5 `efc313f03da140397b76faa321729dc0`；AVIF 解碼通過。
- 上載前指定資料夾查得 0 個同名 `0054.avif`；已直傳單張 AVIF，Drive ID `1J251YexXUZpGi_P4a_3bDovT2y88TpVr`。`get_file` 核對 parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes 151,990、MD5 均與本機一致。無 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0055 鵲鴨：已檢視並直接上載 Google Drive

- 規格 `scripts/cards/info-restart-0055.json`；runtime 名稱為鵲鴨 *Bucephala clangula*，雁形目／鴨科。六項 runtime 分數為 i=2、a=3.3、v=4.2、r=4.8、c=3、o=3.5；沒有重算綜合分。無 `vEst`，故不加體長估算註記。
- HKBWS Avifauna `https://avifauna.hkbws.org.hk/species/0020/003400` 已讀：香港 Category I 偶見；記錄包括 1981–82 年米埔一隻雌鳥及 1997 年船灣淡水湖五隻，1932 年記錄缺乏佐證。全球 IUCN LC、趨勢穩定，與香港偶見狀態分開表述。雄鳥繁殖羽有綠光暗頭、短喙基部橢圓白斑、淡黃眼、白頸胸脅、深色背尾及大塊白翼；雌鳥褐頭、灰胸脅、褐上體及尾。
- 比較依據：Cornell Lab 鵲鴨／冰島鵲鴨比較 `https://www.allaboutbirds.org/guide/Barrows_Goldeneye/species-compare/`；冰島鵲鴨雄鳥白斑為新月形，鵲鴨為圓／橢圓形，並可見冰島鵲鴨白脅黑色側突。HKBWS 白秋沙鴨 `https://avifauna.hkbws.org.hk/species/0020/003500`；繁殖羽雄鳥白色頭身具明顯黑眼罩，與鵲鴨不同。比較圖均標明雄鳥；冰島鵲鴨只作北美易混淆比較，不暗示香港出現。第四特徵圈使用獨立雌鳥素材並明示同種雌鳥。
- 全卡預覽、四個特徵圈、兩個比較圓裁切、標籤、評分及地圖均已目視；重點包含雄鳥圓白頰斑、金黃眼、白翼窗及雌鳥褐頭灰脅。AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 世界底圖 bounds `[-180,-90,180,90]`；部分國家概覽，卡面明示「綠色非全境；非完整分佈」，不是精確季節分佈多邊形。香港偶見紀錄未當作已建立的常態分佈。
- 成品 `deliver/cards/info-restart-0055/aviandex/0055.avif`：1024×1536、165,227 bytes，SHA256 `104eca04bff5c15d18e0be3404b77a749e741198d400601209c4df2da9183f4d`，MD5 `483e2d7e8f8d6b26ec45a66e6c6a5c72`；本機 AVIF 解碼成功。
- 上載前指定 Drive 資料夾查得 0 個同名檔；已直傳獨立 `0055.avif`，Drive file ID `18i-yTk1pC0XQMSSgvel2R46l72TxA4XK`。`get_file` 及資料夾查詢均核對到唯一一份檔案；parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、165,227 bytes、MD5 均與本機一致。無 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0056 白秋沙鴨：已檢視並直接上載 Google Drive

- Runtime：白秋沙鴨 *Mergellus albellus*，雁形目／鴨科；i=2、a=4.3、v=4、r=1、c=1.2、o=2.5，沒有重算。HKBWS `https://avifauna.hkbws.org.hk/species/0020/003500` 全文已讀：香港稀少冬候鳥，成年雄鳥繁殖羽白身黑眼罩；雌鳥／幼鳥灰身、栗冠後頸及白喉；全球 IUCN LC、趨勢下降。香港狀態與全球評級分開。
- 易混淆種來源已核：HKBWS 鵲鴨 `https://avifauna.hkbws.org.hk/species/0020/003400`、紅胸秋沙鴨 `https://avifauna.hkbws.org.hk/species/0020/003600`。兩個比較均標示雄鳥。鵲鴨使用 0055 已審閱、未改色的物種專屬成年雄鳥插圖；紅胸秋沙鴨另生成雄鳥圖。四圈為雄鳥眼罩、肩頸紋、黑翼與脅紋，以及明確標示的雌／幼鳥栗冠白喉。
- 完整預覽、四個特寫、兩個比較圓裁切、文字評分與全世界地圖均已目視；bounds `[-180,-90,180,90]`，地圖只作部分國家概覽，明示綠色非全境／非完整分佈。AI 插圖只做基本視覺檢查，未經獨立鳥類專家驗證。
- 初次上載後目視發現 IUCN／本地記錄說明與雷達圖左下標籤過近，已把說明縮短並重渲染、重新上載；舊版 Drive file `1yhjxz776vXSogNa80USmO2uiWf4IEU1k` 已移至垃圾桶。最新 `0056.avif`：1024×1536、157,149 bytes，SHA256 `748f9636bcac1e6a1e86ee44c278e22645a903ea46ef3422051bf2f854a29c87`，MD5 `ff3a64c061227163a9769de0cf714ac0`；Drive file ID `10K-pKwGtIfsUssd5yG26cegH0rlSO8DM`。`get_file` 核對 parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes、MD5；資料夾查詢目前唯一一份。沒有 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0057 紅胸秋沙鴨：已檢視並直接上載 Google Drive

- Runtime：紅胸秋沙鴨 *Mergus serrator*，雁形目／鴨科；i=2、a=3.8、v=4.4、r=4.8、c=3、o=3.6。HKBWS `https://avifauna.hkbws.org.hk/species/0020/003600` 全文已讀：52–58 cm；雄鳥繁殖羽深綠黑頭、白領、栗色胸與上脅大型白斑，長狹紅喙、紅眼及短蓬冠。香港稀少冬候鳥／過境候鳥且本地數量曾下降；全球 IUCN LC、趨勢穩定，兩者分開呈現。
- 兩種雄鳥比較為白秋沙鴨及鵲鴨；分別使用 0056／0055 已審閱、物種正確的原圖，沒有換色或冒充紅胸秋沙鴨。四個辨識圈分別為長紅喙、赤眼蓬冠、栗胸白斑、灰脅與折翼。完整預覽、各特寫圈、兩個比較圓裁切、標籤、評分及地圖均已目視；AI 插圖未經獨立鳥類專家驗證。
- 世界底圖 bounds `[-180,-90,180,90]`；選定繁殖及越冬國家的部分概覽，明示「綠色非全境；非完整分佈」，不是精確季節分佈多邊形。
- 初次上載後目視發現 IUCN／本地出現說明與雷達圖左下標籤過近，已把說明縮短並重渲染、重新上載；舊版 Drive file `1zX80WDoEIDyGE1YsC-5ft9_wn4FoGmse` 已移至垃圾桶。最新 `0057.avif`：1024×1536、167,911 bytes，SHA256 `3b1128ea70218e20c22c4e0b68c17b0620f270d53b18ea6796663798fe144d54`，MD5 `5ec5fecee38c8ceb68339f4ea964d0cd`；Drive file ID `1pyb_M8rW65beO7hs45mVXUbx6VNbv08s`。`get_file` 核對 parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes、MD5；資料夾查詢目前唯一一份。沒有 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0058 中華秋沙鴨：已檢視並直接上載 Google Drive

- Runtime：中華秋沙鴨 *Mergus squamatus*，雁形目／鴨科；i=4.4、a=3.3、v=4.4、r=3.3、c=2.5、o=3.6、`vEst=1`，未更改分數並保留體長估算註記。HKBWS 香港鳥類名錄 `https://avifauna.hkbws.org.hk/hk-list` 列 Category I、IUCN EN；Category I 不當成香港常見程度。Cornell eBird `https://ebird.org/species/scsmer1` 核對羽色：雄鳥墨綠頭、紅喙、黑白背翼與黑邊白鱗脅；雌鳥栗褐頭灰背；兩性均有鱗狀脅紋。繁殖範圍補充參考 peer-reviewed Cambridge 調查 `https://www.cambridge.org/core/journals/bird-conservation-international/article/population-size-and-breeding-range-of-the-scalysided-merganser-mergus-squamatus/D4B015ECE8733B20A93C8F8BE9F4B9A2`。
- 兩個雄鳥比較為紅胸秋沙鴨及普通秋沙鴨。紅胸秋沙鴨使用 0057 已審閱的正確雄鳥原圖；普通秋沙鴨另生成物種專屬圖。四個特徵圈為長紅喙蓬冠、墨綠頭白頸、黑邊白色鱗紋、白翼窗黑背。完整預覽、圓裁切、文字、評分及體長估算標註均已目視。
- 全世界底圖 bounds `[-180,-90,180,90]`；只作俄羅斯／中國／北韓部分國家概覽，卡面明示綠色非全境、非完整分佈，不冒充河流精確分佈圖。AI 插圖僅基本視覺檢查，未經獨立鳥類專家驗證。
- 成品 `deliver/cards/info-restart-0058/aviandex/0058.avif`：1024×1536、180,414 bytes，SHA256 `8494fb9e6e4080caaa2376eb829ef7749d2a082f704db0a6f8ee05db1cc1f361`，MD5 `a533499404c8aa15c60b971b0b199337`；AVIF 解碼成功。上載前指定 Drive 資料夾查無同名檔；Drive file ID `1oVUk8A_ISCtFE9wacDLl_naU9CLp2icy`。`get_file` 及資料夾查詢核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes、MD5 均與本機一致。沒有 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0059 紫水雞：已檢視並直接上載 Google Drive

- Runtime：紫水雞 *Porphyrio poliocephalus*，鶴形目／秧雞科；`dexScores` 沒有 0059，六項分數與綜合分均維持待查，不補零、不重算。HKBWS `https://avifauna.hkbws.org.hk/species/0060/007900` 全頁已讀：香港稀少訪客；成鳥 38–50 cm、紫藍身、較淺灰頭面、紅喙與紅額盾、長紅腿趾、白色尾下覆羽；全球 IUCN LC。香港出現頻率與全球評級分開。
- 兩個成鳥比較為美洲紫青水雞（紫盾、紅喙黃端、黃腿，外來地區易混淆種，非香港出現聲稱）及黑水雞（較小、深色、黃腿、紅盾與黃喙端）。資料來源分別為 Cornell Lab Purple Gallinule `https://www.allaboutbirds.org/guide/Purple_Gallinule/id` 及 HKBWS Common Moorhen `https://avifauna.hkbws.org.hk/species/0060/007700`。四個特徵圈為紅喙／紅盾、灰頭紫身、長紅腿趾、白尾下覆羽。
- 完整預覽、四圈、兩個比較圓裁切、缺分顯示、標籤及地圖均已目視；全世界底圖 bounds `[-180,-90,180,90]`，選定分佈國家只作部分概覽，明示綠色非全境／非完整分佈。AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 成品 `deliver/cards/info-restart-0059/aviandex/0059.avif`：1024×1536、182,378 bytes，SHA256 `c6f7b913850c41297d8c6f9da4a7856222aa282623c2d2e986e81ac4488e8a78`，MD5 `3a6631d5f8ebac3e34c98cd352373ad2`；AVIF 解碼成功。上載前指定 Drive 資料夾查無同名檔；Drive file ID `17vjl45_zQY8cxiClrK5V0RXWWJY9uCQh`。`get_file` 及資料夾查詢核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes、MD5 均與本機一致。沒有 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0060 中華鷓鴣：已檢視並直接上載 Google Drive

- Runtime：中華鷓鴣 *Francolinus pintadeanus*，雞形目／雉科；`i=2, a=5, v=3.7, r=1.8, c=1.2, o=2.7`，與 `dexScores` 完全一致，沒有重算。HKBWS `https://avifauna.hkbws.org.hk/species/0030/003700` 全頁已讀：香港草地及疏林山坡局部留鳥，本地分佈與數量因植被演替而大幅下降；全球 IUCN LC。雄鳥黑色面紋框白頰、栗色冠側，黑底白斑胸脇、黃橙腿；雌鳥較淡，腹部有深色橫斑。全球評級與香港局部狀態分開呈現。
- 比較使用雄性鵪鶉 *Coturnix japonica*（HKBWS `https://avifauna.hkbws.org.hk/species/0030/003800`：17–19 cm、紅褐臉喉、奶油眉紋、淡褐胸脇；香港稀少過境／冬候鳥，全球 NT）及雄性灰胸竹雞 *Bambusicola thoracicus*（Cornell eBird `https://ebird.org/species/chbpar3`：灰藍眉胸、橙栗臉胸帶及黑斑脇）。比較名與主種分清，沒有把比較圖冒稱中華鷓鴣。
- 完整預覽、四個特徵圈及兩個比較圓裁切經目視；修正特徵裁切後，特寫分別清楚呈現黑白頭紋／栗冠側、白頰白喉／黑面紋、胸脇白斑及黃橙腿。全世界底圖 bounds `[-180,-90,180,90]`，僅為部分國家概覽，明示綠色非全境／非完整分佈，不是精確分佈多邊形。AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 成品 `deliver/cards/info-restart-0060/aviandex/0060.avif`：1024×1536、192,153 bytes，SHA256 `5c2faf448e8d0b8fa9856cbbd120a76303c185c2864551301d2a6599db24e2ec`，MD5 `8c434d97d75527c6e6a9a713cf9b3fe3`；AVIF 解碼成功，`missingScores=[]`。上載前指定 Drive 資料夾查無同名檔；Drive file ID `1lEUoP6tofUqTR-ZOBrh_P2gps38udQCO`。`get_file` 及資料夾查詢核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes、MD5 均與本機一致。沒有 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0061 鵪鶉：已檢視並直接上載 Google Drive

- Runtime：鵪鶉 *Coturnix japonica*，雞形目／雉科；`i=3, a=2.3, v=3.2, r=4.8, c=3.6, o=3.4, vEst=1`，完全照 runtime `dexScores`。HKBWS `https://avifauna.hkbws.org.hk/species/0030/003800` 全頁已讀：雄鳥紅褐臉喉、寬奶油眉紋、暗冠及淡褐胸脇；雌鳥較淡、胸部帶黑色斑紋。香港稀少秋季過境、罕見冬季與春季過境；全球 IUCN NT，趨勢可能因狩獵及農業改變而中度快速下降。香港出現狀態與全球評級分開，保留 renderer 的體長估算註記。
- 比較為黃腳三趾鶉 *Turnix tanki*（雌鳥／幼鳥）及中華鷓鴣 *Francolinus pintadeanus*（雄鳥）。HKBWS 黃腳三趾鶉 `https://avifauna.hkbws.org.hk/species/0070/009400` 說明其15–18 cm、約鵪鶉75%大小，黃喙黃腿、白虹膜，飛起時淺色覆羽與深色飛羽反差明顯；中華鷓鴣更大且雄鳥黑白臉紋、胸脇白斑明顯。主圖明確呈成年雄鵪鶉；比較圖物種及雌／幼鳥性別狀態有標示。
- 完整預覽、四個特徵圈及兩個比較裁切已目視；四圈為紅褐臉喉、奶油眉紋暗冠、淡褐胸脇、褐色斑駁上翼。地圖全世界 bounds `[-180,-90,180,90]`，標為部分繁殖／越冬國家概覽，不是精確季節多邊形；AI 插圖僅基本視覺檢查，未經獨立鳥類專家驗證。
- 成品 `deliver/cards/info-restart-0061/aviandex/0061.avif`：1024×1536、166,558 bytes，SHA256 `9f02ee21c31202c30ce6629f181ae9c5344b5d8996877ce7d2dc3fdf6f4e0185`，MD5 `57218e9f361330351b73c1864102b3e1`；AVIF 解碼成功，`missingScores=[]`。上載前指定 Drive 資料夾查無同名檔；Drive file ID `12CfCtMZoSuEPGZRLeSxsbU4Deplf_HIF`。`get_file` 及資料夾查詢核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes、MD5 均與本機一致。沒有 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0062 小鸊鷉：已檢視並直接上載 Google Drive

- Runtime：小鸊鷉 *Tachybaptus ruficollis*，鷉形目／鷉科；`i=2, a=4.3, v=3.4, r=4.8, c=3, o=3.5`，與 runtime `dexScores` 一致，`missingScores=[]`。HKBWS `https://avifauna.hkbws.org.hk/species/0070/009000` 全頁已讀：25–29 cm，成鳥全年深冠淡眼；繁殖羽橙褐頰頸及淡黃嘴角斑。香港常見淡水濕地留鳥，邊緣濕地有退縮；全球 IUCN LC、趨勢下降，兩者分開呈現。
- 比較為黑頸鸊鷉（冬羽）及鳳頭鸊鷉（冬羽）。HKBWS 黑頸鸊鷉 `https://avifauna.hkbws.org.hk/species/0070/009300`：冬羽頭較大、冠較陡、喙較尖、虹膜紅色且身形較修長；HKBWS 鳳頭鸊鷉 `https://avifauna.hkbws.org.hk/species/0070/009100`：46–61 cm、長頸、長淡喙，冬羽白臉白前頸與深冠線。四圈為深冠淡眼、栗色頰頸／黃嘴角、短鈍喙／矮圓身、白色蓬鬆尾下羽。
- 完整預覽、特徵裁切、兩個比較圓裁切、文字評分及地圖均已目視。全世界底圖 bounds `[-180,-90,180,90]`，部分國家概覽並明示非全境／非完整分佈；不是精確範圍圖。AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 成品 `deliver/cards/info-restart-0062/aviandex/0062.avif`：1024×1536、166,689 bytes，SHA256 `79fd7fb47c90af815cb13489ed396e884b07dc0ac4db8b73060971527d6f941f`，MD5 `c69327a3c10caba557a9863b1865a06f`；AVIF 解碼成功。上載前指定 Drive 資料夾查無同名檔；Drive file ID `1Dc3qvhOGIVmTSkgrv7IMZ8_oZvb-nujX`。`get_file` 及資料夾查詢核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、bytes、MD5 均與本機一致。沒有 ZIP、R2、UI、Service Worker、app slim 註冊或共用 renderer 改動。

### 0063 角鸊鷉：已檢視並直接上載 Google Drive

- Runtime：角鸊鷉 *Podiceps auritus*，鷉形目／鷉科；`i=3.8, a=3.3, v=3.6, r=4.8, c=2.2, o=3.5, vEst=1`，完全依照 `dexScores`，`missingScores=[]`。HKBWS `https://avifauna.hkbws.org.hk/species/0070/009200` 全文已讀：香港 Category I 偶見，唯一記錄為 1996-04-09 米埔木板路外繁殖羽個體；全球 IUCN VU、趨勢快速下降，與香港單一紀錄分開呈現。成鳥繁殖羽辨識為金黃色角狀耳羽、紅眼、栗色頸胸及深色上體、直尖淡色喙端；冬羽與黑頸鸊鷉可用深色冠與白頰清楚分界辨別。
- Cornell eBird `https://ebird.org/species/horgre` 交叉核對繁殖羽耳羽、紅眼、胸栗色與冬羽冠頰等特徵。比較種為小鸊鷉（繁殖羽；HKBWS `https://avifauna.hkbws.org.hk/species/0070/009000`，25–29 cm、圓矮體、短鈍喙、繁殖羽橙褐頰頸及淡黃嘴角斑）及鳳頭鸊鷉（冬羽；HKBWS `https://avifauna.hkbws.org.hk/species/0070/009100`，46–61 cm、長頸長淡喙、白臉白前頸及深冠）。後者冬羽比較圖重用 0062 已檢視的正確物種素材；因本回合 image generation 次數已達工具限制，未另外生成此比較圖。
- 已目視完整 `deliver/cards/info-restart-0063/preview-0063.webp`、主圖、四個繁殖羽特徵圈及兩個比較裁切；標籤、圖像裁切、分數及估算／評級註記可讀。全世界底圖 bounds `[-180,-90,180,90]`，選定部分繁殖／越冬國家作概覽，明示綠色非全境／非完整分佈；不是精確範圍多邊形，也不把香港單一偶見標成常態分佈。AI 插圖只做基本視覺審核，未經獨立鳥類專家驗證。
- 成品 `deliver/cards/info-restart-0063/aviandex/0063.avif`：1024×1536、170,969 bytes，MD5 `6343003a79251d40bcc081a296bc6184`，SHA256 `b97d36da663fbbec27568af11565762a5297a4b60ba092f750c270dc792d0c8f`；AVIF 解碼成功。runtime／taxonomy／六項分數、manifest、地圖 ISO3、素材尺寸及 `git diff --check` 均通過。
- Google Drive 指定目標資料夾上載前同名查詢為 0；已直接上載單張 AVIF，Drive file ID `1ca3DZE9G-Iv_D6LYj5Mehy9fSpb9RBIj`。`get_file` 及資料夾查詢核實目前唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、170,969 bytes、MD5 均與本機一致。無 ZIP／R2，不覆蓋 app 現有卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0064 鳳頭鸊鷉：已檢視並直接上載 Google Drive

- Runtime：鳳頭鸊鷉 *Podiceps cristatus*，鷉形目／鷉科；六項 `i=2, a=4.3, v=4.2, r=1.8, c=1.2, o=2.7`，完全照 `dexScores`。HKBWS `https://avifauna.hkbws.org.hk/species/0070/009100` 全文及 Cornell eBird `https://ebird.org/species/grcgre1` 已讀：香港常見冬候鳥，主要在後海灣及赤門，數量可能下降；46–61 cm，身長而低浮、長頸及長而纖細淡色喙。冬羽白臉／白前頸，眼至喙及冠線深色；繁殖羽栗色扇羽及深色雙冠。全球 IUCN LC、趨勢未知；本地數量變化與全球分類分開呈現。
- 比較種為小鸊鷉（繁殖羽；HKBWS `https://avifauna.hkbws.org.hk/species/0070/009000`）及黑頸鸊鷉（冬羽；HKBWS `https://avifauna.hkbws.org.hk/species/0070/009300`）。兩張比較圖分別重用 0063、0062 已檢視的物種專屬素材。主圖及四圈皆為鳳頭鸊鷉冬羽；白臉暗眼線、長淡喙、長頸修長身形、飛行時內翼白色區域均清楚可辨。完整預覽、比較圓裁切、標籤、評分及地圖已目視核對。AI 插圖僅基本檢查，未經獨立鳥類專家驗證。
- 全世界底圖 bounds `[-180,-90,180,90]`；部分繁殖／越冬國家概覽並明示綠色非全境／非完整分佈，不是精確季節範圍。成品 `deliver/cards/info-restart-0064/aviandex/0064.avif`：1024×1536、145,495 bytes，MD5 `db8b3988230bdb4fd660d0170d691994`，SHA256 `c24cc2eae7a0694208179a30e199ae78723c3b31905dd2f0411575052a3515d8`；AVIF 解碼、runtime 名稱／分類／六項分數、素材尺寸、地圖國碼、manifest 對應及 `git diff --check` 均通過。
- Drive 上載前指定資料夾查無同名檔；已直傳單張 AVIF，Drive file ID `1tg7e8BcYV6hTiPEzMSBr6nCKM4ZH-Tso`。`get_file` 及資料夾查詢核實目前唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、145,495 bytes、MD5 均一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0065 黑頸鸊鷉：已檢視並直接上載 Google Drive

- Runtime：黑頸鸊鷉 *Podiceps nigricollis*，鷉形目／鷉科；`i=2, a=2.8, v=3.6, r=4.8, c=1.2, o=2.9`，照 `dexScores`。HKBWS `https://avifauna.hkbws.org.hk/species/0070/009300` 全文及 Cornell eBird `https://ebird.org/species/eargre` 全頁已讀：香港稀少冬候鳥，記錄期 11 月 19 日至 3 月 4 日，主要在後海灣；全球 IUCN LC、趨勢未知。冬羽灰暗頭頰、深冠延伸入頰（邊界較模糊）、灰暗頸、紅虹膜、窄尖黑喙無淡色喙端；雖與小鸊鷉大小近似，但頭較大、冠較陡、體形較修長，頸側及脇通常偏白。全球 LC 與香港稀少冬候狀態分開呈現。
- 比較為鳳頭鸊鷉（冬羽）與角鸊鷉（繁殖羽）。鳳頭鸊鷉冬羽圖重用 0064 已審素材，角鸊鷉繁殖羽圖重用 0063 主圖；卡面有明確季節標籤，角鸊鷉只作易混淆圖鑑參照，不暗示香港常見。完整預覽、主圖、四個冬羽特徵圈、比較圓裁切、文字評分與地圖均已目視核對；AI 插圖僅基本檢查，未經獨立鳥類專家驗證。
- 世界底圖 bounds `[-180,-90,180,90]`，選定歐亞及北美部分繁殖／越冬國家作概覽，標示綠色非全境／非完整分佈，且區分歐亞提名亞種、北美亞種及非香港的非洲常駐亞種，不是精確季節多邊形。
- 成品 `deliver/cards/info-restart-0065/aviandex/0065.avif`：1024×1536、151,056 bytes，MD5 `bbd13f0d4f9830f4cff0c5a3743d82e8`，SHA256 `1ff5255eae6fe6b52a61c88ace3cef902a876de6ae27189363d896b38b237793`；AVIF 解碼、runtime 名稱／分類／六項分數、地圖國碼、manifest 及 `git diff --check` 通過。
- Drive 指定資料夾上載前同名查詢為 0；已直傳單張 AVIF，Drive file ID `1HMlZ2vPM8nJqTozSP5M7anMXm-ucSWPz`。`get_file` 與資料夾查詢核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、151,056 bytes、MD5 均一致。沒有 ZIP／R2，不改 app 卡片、UI、Service Worker、slim 註冊或共用 renderer。

### 0066 山斑鳩：已檢視並直接上載 Google Drive

- Runtime：山斑鳩 *Streptopelia orientalis*，鴿形目／鳩鴿科；`i=2, a=2.8, v=3.9, r=3.3, c=1.2, o=2.6, vEst=1`。HKBWS `https://avifauna.hkbws.org.hk/species/0050/006300` 全頁已讀：33–35 cm；成鳥淡粉褐頭、黑白頸側斑、黑色上體羽具大片栗紅羽緣、灰尾上尾羽有大片白端、橙眼及粉色喙腿；幼鳥頭色較暗且缺頸側斑。香港以前常見且廣布的冬候鳥／過境鳥，目前較少見且局部，主要在新界西北，少量全年可見；沒有確認的本地繁殖紀錄。全球 IUCN LC、趨勢穩定，與香港局部下降分開表述。
- 比較為珠頸斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006600`，31 cm、較纖細長尾、頸側深色斑佈白點）及灰斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006400`，Category IIB 局部繁殖留鳥，素淡粉灰身及黑半環頸帶）。完整預覽、主圖、四個特徵圈、比較圓裁切、評分及地圖均已目視；黑白頸側斑、栗紅羽緣、灰尾白端及橙眼粉喙清楚可辨。AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 世界底圖 bounds `[-180,-90,180,90]`，部分亞洲國家概覽並明示非全境／非完整分佈，不是精確範圍多邊形。成品 `deliver/cards/info-restart-0066/aviandex/0066.avif`：1024×1536、172,570 bytes，MD5 `d2d1404d0a3c29afd34ab90fd268c1f6`，SHA256 `13e66e2401dec8bd0fc16d1472e4a6563fa5b8204bf1a0c7b18c8e706e923089`；AVIF 解碼、runtime 名稱／分類／六項分數、素材尺寸、地圖國碼、manifest 對應及 `git diff --check` 通過。
- Google Drive 上載前指定資料夾查無同名檔；已直傳單張 AVIF，Drive file ID `16bKRYUS81xc55PYrvpEunK5MV8s8Ole2`。`get_file` 及資料夾查詢核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、172,570 bytes、MD5 均一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0067 灰斑鳩：已檢視並直接上載 Google Drive

- Runtime：灰斑鳩 *Streptopelia decaocto*，鴿形目／鳩鴿科；runtime 分數 `i=2, v=3.9, r=1.8, c=1.2, o=2.2, vEst=1`；`a` 缺分，卡面顯示「待查」，未補零或更動綜合分 2.2。全球 IUCN LC 與香港狀態分開呈現。
- HKBWS `https://avifauna.hkbws.org.hk/species/0050/006400` 全文已讀；本地為 Category IIB 局部繁殖留鳥，集中新界西北魚塘區。成鳥淡粉灰、頭身大致無斑，頸後黑色半環，紅虹膜、黑喙、暗紅腿，灰褐翼具淡色中翼面板，外側尾羽白端；幼鳥缺頸環。HKBWS 同時指出歐洲及北非族群為20世紀擴展，不能把它們冒稱原生範圍。Cornell eBird `https://ebird.org/species/eucdov` 用於交叉核對識別與全球分布。
- 比較為山斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006300`）及珠頸斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006600`）。分別以黑白頸側斑、栗紅羽緣，及佈白點的黑頸斑作區別；比較插圖已視覺檢查並沿用已核對物種素材。完整預覽已目視：四個特徵圈對應頸後半環、中翼淡色帶、長尾白端、暗紅腳趾；主圖成鳥辨識特徵吻合。AI 插圖僅基本檢視，未經獨立鳥類專家驗證。
- 地圖使用全世界底圖 bounds `[-180,-90,180,90]`，只高亮中東、南亞及東亞部分原生分布國家；不是全境實際分布或精確多邊形，且排除香港引入族群及歐洲／北非20世紀擴展。
- 成品 `deliver/cards/info-restart-0067/aviandex/0067.avif`：1024×1536、170,062 bytes，SHA256 `72b8c338b0463c6b0937c58bbedefc9b8a36fe4d27ef7a0963d013da3e7008bf`，MD5 `0d4aadcc2f21d5f660efffb1df427235`；AVIF 解碼成功，runtime 名稱／分類／分數與 manifest、素材尺寸及地圖國碼檢查通過；缺分為 `a`。
- 上載前指定 Drive 資料夾查無同名檔；已直傳單張 AVIF，Drive file ID `17y3BuCwJWqgXoT-WQlTvr_Miv2wyfxMj`。`get_file` 及資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、170,062 bytes、MD5 均與本機一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0068 火斑鳩：已檢視並直接上載 Google Drive

- Runtime：火斑鳩 *Streptopelia tranquebarica*，鴿形目／鳩鴿科；`i=2, v=3.6, r=1, c=1.2, o=2, vEst=1`，適應力 `a` 缺分，卡面顯示「待查」，未補零或更動 runtime 綜合分 2.0。
- HKBWS `https://avifauna.hkbws.org.hk/species/0050/006500` 全文已讀：香港 Category I，常見過境（秋季較多）、稀少冬候，主要在后海灣；夏季記錄增加但沒有已確認本地繁殖。成雄 21–23 cm、緊湊短尾，紅粉色上、下體，淡灰頭、頸後黑半環、暗色飛羽、灰臀與白尾下；雌鳥灰褐色且與雌灰斑鳩相似，但明顯較小、尾短。全球 IUCN LC、趨勢下降，與香港過境狀況分開呈現。Cornell eBird `https://ebird.org/species/recdov1` 交叉核對兩性羽色與全球辨識。
- 比較為灰斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006400`）及珠頸斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006600`）。灰斑鳩較大且長尾、素淡粉灰身；珠頸斑鳩頸側有白點黑斑且尾長。主圖、四個特徵圈、兩個比較圓裁切及整卡預覽均已目視；圈出灰藍頭、黑色半環、紅粉身與暗飛羽、短尾白端。因生圖次數限制，特徵圈直接裁自主圖，未另外生成 features 素材；AI 圖只作基本視覺檢查，未經獨立鳥類專家驗證。
- 地圖使用全世界 bounds `[-180,-90,180,90]`，只作巴基斯坦至南亞、東南亞、菲律賓與中國部分原生分佈國家概覽，不是全境實際分布或精確範圍；香港過境紀錄另行描述。
- 成品 `deliver/cards/info-restart-0068/aviandex/0068.avif`：1024×1536、170,438 bytes，SHA256 `fbc0c16ef1a323d58a7816b31b4741831601ea2a1da7d43cfb7213bbdc11a96b`，MD5 `98928f098bcf7ec4d003f32c1edf6218`；AVIF 解碼成功、runtime 名稱／分類／分數與 manifest、地圖國碼檢查通過；缺分為 `a`。
- 上載前指定 Drive 資料夾查無同名檔；已直傳單張 AVIF，Drive file ID `1jeUjfLCLAlL21mJQV861H2Fzao-zk9k9`。`get_file` 及資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、170,438 bytes、MD5 均與本機一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0069 斑尾鵑鳩：已檢視並直接上載 Google Drive

- Runtime：斑尾鵑鳩 *Macropygia unchall*，鴿形目／鳩鴿科；`i=2, a=3.3, v=3.9, r=1.8, c=1.2, o=2.4`，完全依照 runtime `dexScores`。HKBWS `https://avifauna.hkbws.org.hk/species/0050/006700` 全頁及 Cornell eBird `https://ebird.org/species/bacdov1` 已讀；香港稀少至少見冬候與過境鳥，出現於林地且記錄近年增加；全球 IUCN LC、趨勢穩定，與香港狀態分開呈現。成年雄鳥37–41 cm，身形修長、長頸及特別長的栗色橫斑尾，頭粉灰、頸側帶綠光，上體密佈栗色橫斑與羽緣、胸腹酒紅且較素；雌鳥較暗，頭喉細暗橫斑、胸具黑色鱗紋。
- 比較為山斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006300`）及珠頸斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006600`）。兩個比較素材沿用先前已檢視的正確物種圖。完整預覽、主圖、四特徵圈、比較圓裁切均已目視；圈出粉灰頭與綠光頸側、翼上密集栗斑、極長栗斑尾及雄鳥較素淡酒紅胸腹。AI 圖僅基本視覺檢查，未經獨立鳥類專家驗證。
- 地圖用全世界 bounds `[-180,-90,180,90]`，只作西喜馬拉雅至東南亞及中國部分原生分佈國家概覽，不表示全境占有或精確範圍；香港零散冬候／過境記錄另行說明。
- 成品 `deliver/cards/info-restart-0069/aviandex/0069.avif`：1024×1536、175,843 bytes，SHA256 `13b516e236ceec024bf56a6cc9f38daff134588386120b3ad4d414792d853a30`，MD5 `8b1dec5fe8460b4efbad1ee46a60448a`；AVIF 解碼、runtime 名稱／分類／六項分數、地圖 ISO3、manifest 和素材核對通過，`missingScores=[]`。
- 上載前指定 Drive 資料夾查無同名檔；已直傳單張 AVIF，Drive file ID `1NcEGuBvd2OmmIJVktrmZ6XYO-LvSpllN`。`get_file` 及資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、175,843 bytes、MD5 均與本機一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0070 綠翅金鳩：已檢視並直接上載 Google Drive

- Runtime：綠翅金鳩 *Chalcophaps indica*，鴿形目／鳩鴿科；`i=2, a=3.8, v=3.4, r=1, c=1.2, o=2.3`。HKBWS `https://avifauna.hkbws.org.hk/species/0050/006800` 全文及 Cornell eBird `https://ebird.org/species/emedov2` 已讀：香港 Category I，森林與灌叢稀少但廣布留鳥；全球 IUCN LC、全球趨勢下降。成年雄鳥小型短尾，灰冠、銀白額前、暗灰上體、鮮綠虹彩肩羽與翼覆羽、深色飛羽尾羽、灰粉色下體、紅喙與黑眼。雌鳥較暗，銀白頭頂不明顯延伸至額前；幼鳥褐色且翼覆羽有栗色端形成翼帶。香港本地狀態與全球分類分開呈現。
- 比較為珠頸斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006600`）與灰斑鳩（成鳥；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006400`），以珠綠翼與紅喙、銀白額前，對照兩者較大的體型、素淡身色及不同頸斑。另以同種成年雌鳥素材呈現額前羽色差異。完整預覽、主圖、四個圈、比較圓裁切均已目視。AI 圖僅基本視覺檢查，未經鳥類專家獨立驗證。
- 世界底圖 bounds `[-180,-90,180,90]`，只作 Nepal/India 至東南亞、南中國與台灣的部分原生分布國家概覽；不是全境占有或精確範圍多邊形，香港出現另述。
- 原版因特徵標籤出界已被修正版取代；目前交付 `deliver/cards/info-restart-0070/aviandex/0070.avif` 為 1024×1536、164,459 bytes，SHA256 `6e78b3f77e7603f70fd1179e701d0a996eb8078223c1a8302b73f0984d7656ca`，MD5 `5f92808725d58f047aeb39ba75e7776d`；AVIF 解碼及 runtime／地圖核對通過。
- 修正版直接上載 Drive file ID `1jp5ewq6CwhoXTFPw2N9Gg6el64FVGerJ`；get_file 與資料夾搜尋核實唯一有效檔，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、164,459 bytes、MD5 一致。初版 ID `1OmQcDWYJp5N8kY--AOsjQouzHRushgyd` 已移至垃圾桶。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0071 橙胸綠鳩：已檢視並直接上載 Google Drive

- Runtime：橙胸綠鳩 *Treron bicinctus*，鴿形目／鳩鴿科；`i=2, a=3.3, v=3.8, r=3.3, c=1.2, o=2.7, vEst=1`。HKBWS `https://avifauna.hkbws.org.hk/species/0050/006900` 全文及 Cornell eBird `https://ebird.org/species/orbpig1` 已讀：香港 Category I 偶發，僅 Po Toi 有一次雄鳥記錄（2006至2007多次觀察，被認為可能同一個體）；全球 IUCN LC、趨勢穩定。成鳥雄鳥約29 cm，綠鳩典型厚實體形及短尾、黃綠羽色，灰後頸，胸有橙色斑塊，上緣為模糊粉紫色帶；尾下覆羽暗橙、腿紅。沒有把香港單次紀錄當作留鳥。
- 比較為粉紅頸綠鳩（成鳥雄；eBird `https://ebird.org/species/pinpig3`）和綠翅金鳩（成鳥雄；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006800`）。前者只作屬內視覺相似比較，不暗示香港有紀錄；綠翅金鳩以小型短尾、銀白額、深灰身與虹彩綠翼作對比。整卡預覽及四圈已目視，分別凸顯粉紫／橙色胸斑、黃綠厚實體形、灰後頸、短尾與暗橙尾下覆羽。AI 插圖僅基本視覺檢查，未經鳥類專家獨立驗證。
- 地圖 bounds `[-180,-90,180,90]`，只作南亞至東南亞及中國部分原生分布國家概覽，不是全境實際占有或精確多邊形；香港單一偶發紀錄另述。
- 成品 `deliver/cards/info-restart-0071/aviandex/0071.avif`：1024×1536、175,006 bytes，SHA256 `7f91163024c8bd7bfeb67adfdda593a64490b8ced5bba8130ba505ad7134df1f`，MD5 `e3652b53ab110517db40beefb2fbe56f`；AVIF 解碼、runtime 名稱／分類／六項分數、地圖 ISO3、manifest 核對通過，`missingScores=[]`。
- 上載前指定 Drive 資料夾查無同名檔；已直傳單張 AVIF，Drive file ID `1popKhrQlKm_Wd42XJCC350QNQfO9QDXL`。`get_file` 及資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、175,006 bytes、MD5 均與本機一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0072 厚嘴綠鳩：已檢視並直接上載 Google Drive

- Runtime：厚嘴綠鳩 *Treron curvirostra*，鴿形目／鳩鴿科；`i=2, a=2.8, v=3.4, r=1, c=1.2, o=2.1`。HKBWS `https://avifauna.hkbws.org.hk/species/0050/007000` 全頁及 Cornell eBird `https://ebird.org/species/thbpig1` 已讀：香港 Category I 稀少冬候／過境，累計十筆記錄；全球 IUCN LC，全球趨勢下降。辨識重點為紅基部厚淡色喙、寬闊藍綠眼圈、成年雄鳥栗紅肩羽、兩性翼緣鋸齒黃條；兩性皆綠色，雌鳥披肩綠色。香港多在果樹冠層，記錄主要11月至2月，另有一筆4月。
- 比較為橙胸綠鳩（成鳥雄；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006900`）及綠翅金鳩（成鳥雄；HKBWS `https://avifauna.hkbws.org.hk/species/0050/006800`）。前者以橙色胸斑／粉紫上緣和短尾區別；後者較小，深灰身及虹彩綠翼。完整預覽已目視；首次檢視發現首個特徵圈標籤過長向左溢出，已縮短四個標籤並重新渲染，最終預覽文字居中且完整。AI 圖僅基本檢視，未經獨立鳥類專家驗證。
- 地圖 bounds `[-180,-90,180,90]`，作中南亞經東南亞至華南、馬來半島及島嶼的部分原生分布國家概覽，不表示整國全境或精確多邊形；香港稀少冬候／過境狀態另述。
- 成品 `deliver/cards/info-restart-0072/aviandex/0072.avif`：1024×1536、165,898 bytes，SHA256 `4cef29783cba9b785061b565f0e34dac993266aa441834ea231d1d55f67acb11`，MD5 `5cb6fad8ecb428f5faed10caa190b7e7`；AVIF 解碼、runtime 名稱／分類／六項分數、manifest、地圖 ISO3 檢查通過，`missingScores=[]`。
- 上載前指定 Drive 資料夾查無同名檔；已直傳單張 AVIF，Drive file ID `1EdHOW-t7NiRHMNj_96k5VmbBzvzj_M2D`。`get_file` 及資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、165,898 bytes、MD5 均與本機一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0070 特徵標籤越界修正

- 用戶指出 0070 特徵列標籤超出小標籤框。已只縮短該卡的四個 `featureLabels`（銀額灰冠／翠綠翼羽／紅喙黑眼／雌額少銀），以保留共用版式與 renderer 不變；完整預覽目視確認各字均在膠囊標籤框內。
- 修正版 `0070.avif`：1024×1536、164,459 bytes，MD5 `5f92808725d58f047aeb39ba75e7776d`，SHA256 `6e78b3f77e7603f70fd1179e701d0a996eb8078223c1a8302b73f0984d7656ca`。Drive 新 file ID `1jp5ewq6CwhoXTFPw2N9Gg6el64FVGerJ`；get_file 與資料夾搜尋核對 parent、bytes、MD5，最終資料夾僅一份有效檔。舊 ID `1OmQcDWYJp5N8kY--AOsjQouzHRushgyd` 已移至垃圾桶。

### 0073 楔尾綠鳩：已檢視並直接上載 Google Drive

- Runtime：楔尾綠鳩 *Treron sphenurus*（`Wedge-Tailed Green-Pigeon`），鴿形目／鳩鴿科；`i=2, a=2.8, v=3.9, r=1, c=1.2, o=2.2, vEst=1`，與 app runtime 完全一致。HKBWS `https://avifauna.hkbws.org.hk/species/0050/007100` 及 Cornell eBird `https://ebird.org/species/wetpig1` 全頁已讀：全球 IUCN LC、趨勢穩定；香港 Category I 偶見，唯一記錄是 2016 年 3 月 6–9 日西貢北潭凹一隻首冬雄鳥。成年雄鳥黃額、銅金冠與胸，肩羽及翼覆羽有栗色，淡肉桂尾下覆羽及寬基楔形尾；兩性綠身、紅足及藍喙。主圖呈現成鳥雄鳥代表，不冒稱為香港記錄個體。
- HKBWS profile suffix 不等於 AvianDex runtime ID：本卡 0073 物種的正確 HKBWS 頁為 `/007100`；誤讀過的 `/007300` 是 Ryukyu Green Pigeon，沒有作本卡來源。HKBWS `/007200` 紅翅綠鳩及 `/007000` 厚嘴綠鳩和 Cornell 紅翅綠鳩頁用於比較：紅翅綠鳩以白腹／淡色尾下覆羽及紫紅翼斑對照；厚嘴綠鳩以粗厚紅基部淡喙、寬闊藍綠眼圈及栗紅肩斑對照。
- 完整預覽、主圖、四個標籤特徵圈、兩個比較圓裁切、分類、六項分數和世界分佈概覽已目視檢查。首次檢查將首個特徵圈的裁切框加寬，避免喙尖被切；修訂預覽確認喙部與標籤均完整在面板／圓框內；分佈圖只作部分原生範圍國家概覽，非精確範圍或香港出現圖。AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 成品 `deliver/cards/info-restart-0073/aviandex/0073.avif`：1024×1536、151,575 bytes，MD5 `8821a91404440d25ac3f18f1e66a43e8`，SHA256 `b314d4615ecad58118d734498d25dcfd09ee187e6c82ba6576b6e07152ef9784`；AVIF 解碼、runtime 名稱／分類／六項分數、`vEst`、素材尺寸、地圖 ISO3、manifest 核對及 `git diff --check` 通過，`missingScores=[]`。
- 上載前指定 Drive 資料夾同名查詢為 0；已直傳單張 AVIF，Drive file ID `1qqYpPZqhVyB0ehoLdCmwdKXkajulguBr`。`get_file` 與最終資料夾搜尋核實唯一有效檔，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、151,575 bytes、MD5 均一致；初版 ID `1VOmkFpP81dIcTyx9vuuK50a0geOj39UG` 因喙部裁切調整已移至垃圾桶。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0074 紅翅綠鳩：已檢視並直接上載 Google Drive

- Runtime：紅翅綠鳩 *Treron sieboldii*（`White-bellied Green-Pigeon`），鴿形目／鳩鴿科；`i=2, a=2.8, v=3.8, r=2.5, c=1.2, o=2.5`，完全依 runtime。HKBWS `https://avifauna.hkbws.org.hk/species/0050/007200` 與 Cornell eBird `https://ebird.org/species/whbpig1` 全頁已讀：香港 Category I 稀少冬候／過境，主要林地；全球 IUCN LC、趨勢下降。兩性綠色且腹部及尾下覆羽較白；雄鳥有紫紅翼斑、黃綠頭、灰喙藍基及窄藍眼圈。HKBWS 記錄集中10月23日至翌年2月初，另有一筆4月紀錄；本地稀少與全球LC分開呈現。
- 比較為楔尾綠鳩（成鳥雄；HKBWS `https://avifauna.hkbws.org.hk/species/0050/007100`）與厚嘴綠鳩（成鳥雄；HKBWS `https://avifauna.hkbws.org.hk/species/0050/007000`）。前者銅金冠胸、栗色肩羽、淡肉桂尾下及寬基楔尾；後者厚喙紅基部和寬藍綠眼圈。完整預覽、主圖、四個特徵圈、比較圖、分類、分數和地圖均已目視；首輪後已調整白腹圈與喙部圈裁切，最終喙尖完整位於圓圈內，所有標籤完整位於面板內。AI 圖僅基本視覺檢查，未經獨立鳥類專家驗證。
- HKBWS profile `/007200` 對應 runtime 0074；外部頁面編號不等同本 app 卡片編號。地圖只作北泰、北印支、中／東中國、台灣及日本部分原生範圍概覽，不代表全境占有或精確分佈，也不是香港出現圖。
- 成品 `deliver/cards/info-restart-0074/aviandex/0074.avif`：1024×1536、152,222 bytes，MD5 `d8ef57f546c48e771b9119282f372edb`，SHA256 `a9aece4297b53947cff6a70456c0514aafa21c0afc8d16a9021a6f391307a9ae`；AVIF 解碼、runtime 名稱／分類／六項分數、素材尺寸、地圖 ISO3、manifest 核對及 `git diff --check` 通過，`missingScores=[]`。
- 上載前指定 Drive 資料夾同名查詢為 0；已直傳單張 AVIF，Drive file ID `1PU7IMPiDW7FZsOOHiJF-nZiLaCCiLti2`。`get_file` 及資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、152,222 bytes、MD5 均一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0075 紅頂綠鳩：已檢視並直接上載 Google Drive

- Runtime 依要求保留：紅頂綠鳩 *Treron formosae*（`Whistling Green-Pigeon`），鴿形目／鳩鴿科；`i=3, a=2.8, v=4.0, r=1.8, c=3.6, o=3.0, vEst=1`。BirdLife 現行 *Taiwan Green-pigeon* factsheet `https://datazone.birdlife.org/species/factsheet/taiwan-green-pigeon-treron-formosae`：2023 IUCN 評為 NT 近危、趨勢下降、估計成熟個體1,250–2,000；現行範圍為台灣及北菲律賓群島（Batan、Calayan、Camiguin Norte、Sabtang）。Cornell eBird `https://ebird.org/species/whgpig1`仍以較舊 Whistling Green-Pigeon 複合群頁介紹：台灣型較小、有紅褐冠；與紅翅綠鳩相比，腿周沒有白羽、臉較不黃、尾下覆羽白緣較窄。主圖為台灣指名亞種成雄，呈現金橙冠、紫褐肩斑、綠羽腿與紅足。
- 分類差異非常重要：HKBWS `https://avifauna.hkbws.org.hk/species/0050/007300` 現行頁已列 Ryukyu Green Pigeon *Treron permagnus*（Category I 偶見；Po Toi 唯一2012-11-14紀錄，亞種不確定），不再是現行 *T. formosae*。較舊來源曾將琉球族群納入 Whistling Green-Pigeon；因此本卡只記錄此重分類，**不宣稱**該香港紀錄屬於 runtime *T. formosae*。未改 app runtime 名稱、taxon 或分數。比較為紅翅綠鳩（HKBWS `/007200`）與楔尾綠鳩（`/007100`）成鳥雄。
- 完整預覽、主圖、四個特徵圈、兩個比較圓裁切、評分、近危標章及世界地圖已目視核對；標籤均完整在面板內。台灣／菲律賓島嶼分布在世界尺度圖上高亮較細小，未把非分布國家塗色以放大視覺效果。AI 圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 成品 `deliver/cards/info-restart-0075/aviandex/0075.avif`：1024×1536、163,267 bytes，MD5 `7226c7fd858a8ed9ff7f1433b54100bf`，SHA256 `03c9e3dc8215167a684d19a745f5bc9e370ae09bc116b872b038b1dd82f39e8e`；AVIF 解碼、runtime 名稱／分類／六項分數、`vEst`、素材尺寸、地圖 ISO3、manifest 核對及 `git diff --check` 通過，`missingScores=[]`。
- 上載前指定 Drive 資料夾同名查詢為 0；已直傳單張 AVIF，Drive file ID `1bFM9gL-JFRuohm0_Q2kGhNdSinKDZkiM`。`get_file` 與資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、163,267 bytes、MD5 均一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0076 褐翅鴉鵑：已檢視並直接上載 Google Drive

- Runtime：褐翅鴉鵑 *Centropus sinensis*（`Greater Coucal`），鵑形目／杜鵑科；`i=2, a=3.3, v=4.1, r=1, c=1.2, o=2.3, vEst=1`，完全依 runtime。HKBWS `https://avifauna.hkbws.org.hk/species/0040/004800` 及 Cornell eBird `https://ebird.org/species/grecou1` 已讀：香港 Category I，廣布常見留鳥；全球 IUCN LC、趨勢穩定。成年鳥47–56 cm，體型厚重、尾長；頭身尾黑色帶藍紫光，翼及肩羽橙褐，眼紅至褐，喙腿深灰；成鳥無橫斑，幼鳥／換羽個體有淡色橫斑。香港棲地包括灌叢、草地、紅樹林、農地、風水林及花園。
- 比較為小鴉鵑成鳥（HKBWS `https://avifauna.hkbws.org.hk/species/0040/004900`；較小、頭胸淡羽軸紋、眼暗、喙短）及噪鵑成雄（無橙褐翼、身形較纖長），用於區分同為黑色／紅眼的杜鵑。主圖及特徵圈目視後，將紅眼／喙的首個裁切框向左擴大，完整顯示喙尖；重渲染確認雙足踏枝、長尾、四個特徵圈與全部標籤都完整在框內。AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 地圖只作印度次大陸至中國南部、東南亞和大巽他群島部分原生範圍國家概覽，不是精確分佈多邊形或全境占有圖。
- 成品 `deliver/cards/info-restart-0076/aviandex/0076.avif`：1024×1536、150,246 bytes，MD5 `dd871c536687cc274dce4d2936b81638`，SHA256 `88c8d92ac5afabe386dc4269f3daa8b039dd4e879b0cb3a128ce9bc52021f9d9`；AVIF 解碼、runtime 名稱／分類／六項分數、`vEst`、素材尺寸、地圖 ISO3、manifest 核對及 `git diff --check` 通過，`missingScores=[]`。
- 上載前指定 Drive 資料夾同名查詢為 0；已直傳單張 AVIF，Drive file ID `1_tQD14HfbvnPqBlrx90VtYudSHC8E4hz`。`get_file` 及資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、150,246 bytes、MD5 均一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0077 小鴉鵑：已檢視並直接上載 Google Drive

- Runtime：小鴉鵑 *Centropus bengalensis*（`Lesser Coucal`），鵑形目／杜鵑科；`i=2, a=3.3, v=3.7, r=3.3, c=1.2, o=2.7, vEst=1`，完全依 runtime。HKBWS `https://avifauna.hkbws.org.hk/species/0040/004900` 及 Cornell eBird `https://ebird.org/species/lescou1` 全頁已讀：香港 Category I，草地與開闊灌叢常見但愈趨局部化；全球 IUCN LC、趨勢增加。成鳥28–34 cm，較褐翅鴉鵑小，頭、胸與肩羽有淡色羽軸紋，橙褐翼、暗眼、黑喙腿；非繁殖羽較褐，幼鳥及換羽期尾下可見橫斑。
- 比較為褐翅鴉鵑成鳥（HKBWS `/004800`；體型大、長尾、紅眼、無橫斑、藍紫光黑身及亮橙褐翼）與噪鵑成雄（無褐翼、樹棲且體形較大）。完整預覽、主圖、四個特徵圈、比較圖、分類、評分及地圖已目視；「暗眼短喙」裁切框左移以完整保留喙尖，所有標籤完整在面板內。AI 插圖僅基本目視檢查，未經獨立鳥類專家驗證。
- 香港本地族群下降與全球評估增加趨勢分開陳述。地圖只作印度、孟加拉、印支、中國南部及東南亞至群島部分原生分佈國家概覽，不表示全境占有或精確多邊形。
- 成品 `deliver/cards/info-restart-0077/aviandex/0077.avif`：1024×1536、161,964 bytes，MD5 `fa5b330c6ca7320d06d98341753000cc`，SHA256 `39c8839928c7eb79165516385d5566206926e56969c5394d3c37fbc8510ad646`；AVIF 解碼、runtime 名稱／分類／六項分數、`vEst`、素材尺寸、地圖 ISO3、manifest 核對及 `git diff --check` 通過，`missingScores=[]`。
- 上載前指定 Drive 資料夾同名查詢為 0；已直傳單張 AVIF，Drive file ID `10brpWCHr_5IMHLQf4jcapV58xe-Yogg4`。`get_file` 及資料夾搜尋核實唯一一份，parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、161,964 bytes、MD5 均一致。沒有 ZIP／R2，不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0078 紅翅鳳頭鵑：已檢視並直接上載 Google Drive

- Runtime：紅翅鳳頭鵑 *Clamator coromandus*（`Chestnut-winged Cuckoo`），鵑形目／杜鵑科。runtime 只定義觀賞 `v=4.1`、研究 `r=4.0`；`i/a/c/o` 缺省保持待查，未推估填入。
- 已讀 HKBWS `https://avifauna.hkbws.org.hk/species/0040/005000` 與 Cornell eBird `https://ebird.org/species/chwcuc1`。香港 Category I，罕見夏候鳥及稀少過境鳥；成鳥45–47 cm，黑色尖長冠、白色後頸環、橙淡褐喉、栗紅翼、淺色腹部及長黑尾；全球 IUCN LC、趨勢穩定。HKBWS 繁殖調查顯示本地分佈可能下降，與全球趨勢分開標註。
- 比較褐翅鴉鵑成鳥及雄噪鵑；依資料來源檢視四個特徵圈與完整預覽。標籤／卡面元素均留在面板內。主圖是根據已查診斷特徵手繪像素插圖，非照片，只做基本目視檢查，未經獨立鳥類專家驗證。
- 分佈為部分原生分佈國家概覽，並非全境占有、精確多邊形或香港出現紀錄。
- 最終 `deliver/cards/info-restart-0078/aviandex/0078.avif`：1024×1536、138,537 bytes，MD5 `9c212ffc71ae56ff83050914987758f7`，SHA256 `58633357fac757ed970d479817749efb1ea9a43ba6edd6664dfe3a490a026ae2`；runtime、裁切、素材尺寸、GeoJSON ISO3、AVIF decode、manifest checksum、缺分欄位及 `git diff --check` 驗證通過。
- Drive 上載前同名搜尋 0；直接上載單張 AVIF 後，`get_file` 與目的資料夾搜尋核實唯一檔案：ID `1jqMo_AVwAELw8_vqGnMeewEY6-T22oZl`，MIME `image/avif`，138,537 bytes，MD5 一致。沒有 ZIP/R2，不覆蓋 app 現有卡片、不修改 UI、Service Worker、slim 註冊或共用 renderer。

### 0079 八聲杜鵑：已檢視並直接上載 Google Drive

- Runtime：八聲杜鵑 *Cacomantis merulinus*（`Plaintive Cuckoo`），鵑形目／杜鵑科；`i=2, a=3.8, v=3.2, r=3.3, c=1.2, o=2.7`。
- 已讀 HKBWS `https://avifauna.hkbws.org.hk/species/0040/005300` 及 Cornell `https://ebird.org/species/placuc1`。HKBWS：香港低地常見夏候鳥、稀少過境及冬候鳥，部分可能留居；成鳥18–23 cm，灰色頭罩、褐色背翼、無斑橙淡褐下體、長漸層尾白端；全球 IUCN LC、趨勢穩定。地圖只作原生範圍國家概覽。
- 比較褐翅鴉鵑及紅翅鳳頭鵑；完整預覽確認主圖特徵圈及標籤完整落在面板內。插圖為依可靠描述手繪像素風格，非照片，未經專家獨立驗證。
- AVIF `deliver/cards/info-restart-0079/aviandex/0079.avif`：1024×1536、132,115 bytes，MD5 `3022b768158768e8ce72bbc22eb73ca2`，SHA256 `f7f493110ea9d516b477851c735c050a93d4b796cdf29dfc1d1e6abc30537887`；runtime、scores、素材尺寸、裁切、地圖 ISO3、AVIF decode、manifest 及 `git diff --check` 驗證通過。
- Drive 上載前同名搜尋 0；直接上載後由 `get_file` 和資料夾搜尋核實唯一檔案 ID `1rovjkGRtX6shgk2R6i_N8hDh3rm96VKn`、MIME、parent、bytes、MD5 一致。沒有 ZIP/R2；不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0080 烏鵑：已檢視並直接上載 Google Drive

- Runtime：烏鵑 *Surniculus lugubris*（`Square-tailed Drongo-Cuckoo`），鵑形目／杜鵑科；`i=2, v=3.4, r=1, c=1.2, o=1.9, vEst=1`；runtime 缺少 `a`，保留待查。
- 已讀 HKBWS `https://avifauna.hkbws.org.hk/species/0040/005400` 及 Cornell eBird `https://ebird.org/species/asidrc3`。香港 Category I，主要春季在林地出現的稀少過境鳥。成鳥23–25 cm，纖瘦如鵲鴝，身體藍黑帶光澤，纖長弧嘴、微分叉尾，尾下覆羽及最外側尾羽具細白橫斑；幼鳥有不同程度白點。全球 IUCN LC、趨勢下降。
- 比較八聲杜鵑成鳥及褐翅鴉鵑成鳥。修正並目視核實主圖頸部銜接，四個特徵圈與全部文字位於面板內。插圖為據可靠描述手繪像素風格，非照片，未經鳥類專家獨立驗證。地圖是部分原生範圍國家概覽。
- 最終 `deliver/cards/info-restart-0080/aviandex/0080.avif`：1024×1536、130,812 bytes，MD5 `a275d3e0a96a4d2237def217165b4da7`，SHA256 `2511bd7e44e48ba608ba9282abfb167bdd2819bf0d5d76154263d5ae38c2ed8d`；runtime、缺分、vEst、裁切、素材尺寸、地圖 ISO3、AVIF 解碼、manifest 及 `git diff --check` 驗證通過。
- Drive 上載前同名搜尋為0；直接上載後 `get_file` 及資料夾搜尋核實唯一檔案 ID `1hQX2M7A0ZfO8lL-3wzUjuI2pFXCLGT3j`、parent、MIME、bytes、MD5 一致。沒有 ZIP/R2；不覆蓋 app 卡片，不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0081 大鷹鵑：已檢視並直接上載 Google Drive

- Runtime：大鷹鵑 *Hierococcyx sparverioides*（`Large Hawk-Cuckoo`），鵑形目／杜鵑科；`i=2, a=3.8, v=4.3, r=4.8, c=3, o=3.6, vEst=1`。
- 已讀 HKBWS `https://avifauna.hkbws.org.hk/species/0040/005500` 及 Cornell eBird `https://ebird.org/species/larhac2`。香港 Category I、常見夏候鳥。成鳥38–40 cm，灰冠與臉側、亮黃眼圈、褐色上體及灰色黑橫帶尾；白色下體胸及頸側有深栗色粗縱斑，下腹及脅具栗褐橫斑。全球 IUCN LC、趨勢穩定。
- 比較八聲杜鵑成鳥及烏鵑；完整預覽已目視。黃眼圈特徵裁切框上緣擴大後完整呈現，其他特徵圈與全部文字留在面板內。主圖依描述手繪像素風格，非照片，未經獨立專家驗證。
- 成品 `deliver/cards/info-restart-0081/aviandex/0081.avif`：1024×1536、135,660 bytes，MD5 `3d1a38e3712bebc6a0fb7d8eda0f0697`，SHA256 `f7a1647d61129a8aa9f172f784418bde76c33ee3571d5b7c31bd3a74d8403203`；runtime、scores、vEst、裁切、素材尺寸、ISO3、AVIF decode、manifest 及 `git diff --check` 驗證通過。
- Drive 上載前同名搜尋 0；上載後 `get_file` 及目的資料夾搜尋核實唯一檔案 ID `1OYAnEE_9W1SrMKMB2CT8RK6JQtPxjcdh` 及 metadata。沒有 ZIP/R2；不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。
