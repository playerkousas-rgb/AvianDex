> **交接閱讀入口：`docs/INFO_CARD_AGENT_HANDOFF.md`。以下為累積歷史，後文更正取代前文狀態。PR25 的0051–0077紀錄已保留；0078–0081以本分支重製版為準。已完成量及下一批目標請向用戶確認。**

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


## PR25歷史整合（0051–0077保留；其0078–0081舊版已被取代）

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

### 0078 紅翅鳳頭鵑：舊版本紀錄（已被用戶否決及下文重製版取代）

- Runtime：紅翅鳳頭鵑 *Clamator coromandus*（`Chestnut-winged Cuckoo`），鵑形目／杜鵑科。runtime 只定義觀賞 `v=4.1`、研究 `r=4.0`；`i/a/c/o` 缺省保持待查，未推估填入。
- 已讀 HKBWS `https://avifauna.hkbws.org.hk/species/0040/005000` 與 Cornell eBird `https://ebird.org/species/chwcuc1`。香港 Category I，罕見夏候鳥及稀少過境鳥；成鳥45–47 cm，黑色尖長冠、白色後頸環、橙淡褐喉、栗紅翼、淺色腹部及長黑尾；全球 IUCN LC、趨勢穩定。HKBWS 繁殖調查顯示本地分佈可能下降，與全球趨勢分開標註。
- 比較褐翅鴉鵑成鳥及雄噪鵑；依資料來源檢視四個特徵圈與完整預覽。標籤／卡面元素均留在面板內。主圖是根據已查診斷特徵手繪像素插圖，非照片，只做基本目視檢查，未經獨立鳥類專家驗證。
- 分佈為部分原生分佈國家概覽，並非全境占有、精確多邊形或香港出現紀錄。
- 最終 `deliver/cards/info-restart-0078/aviandex/0078.avif`：1024×1536、138,537 bytes，MD5 `9c212ffc71ae56ff83050914987758f7`，SHA256 `58633357fac757ed970d479817749efb1ea9a43ba6edd6664dfe3a490a026ae2`；runtime、裁切、素材尺寸、GeoJSON ISO3、AVIF decode、manifest checksum、缺分欄位及 `git diff --check` 驗證通過。
- Drive 上載前同名搜尋 0；直接上載單張 AVIF 後，`get_file` 與目的資料夾搜尋核實唯一檔案：ID `1jqMo_AVwAELw8_vqGnMeewEY6-T22oZl`，MIME `image/avif`，138,537 bytes，MD5 一致。沒有 ZIP/R2，不覆蓋 app 現有卡片、不修改 UI、Service Worker、slim 註冊或共用 renderer。

### 0079 八聲杜鵑：舊版本紀錄（已被取代）

- Runtime：八聲杜鵑 *Cacomantis merulinus*（`Plaintive Cuckoo`），鵑形目／杜鵑科；`i=2, a=3.8, v=3.2, r=3.3, c=1.2, o=2.7`。
- 已讀 HKBWS `https://avifauna.hkbws.org.hk/species/0040/005300` 及 Cornell `https://ebird.org/species/placuc1`。HKBWS：香港低地常見夏候鳥、稀少過境及冬候鳥，部分可能留居；成鳥18–23 cm，灰色頭罩、褐色背翼、無斑橙淡褐下體、長漸層尾白端；全球 IUCN LC、趨勢穩定。地圖只作原生範圍國家概覽。
- 比較褐翅鴉鵑及紅翅鳳頭鵑；完整預覽確認主圖特徵圈及標籤完整落在面板內。插圖為依可靠描述手繪像素風格，非照片，未經專家獨立驗證。
- AVIF `deliver/cards/info-restart-0079/aviandex/0079.avif`：1024×1536、132,115 bytes，MD5 `3022b768158768e8ce72bbc22eb73ca2`，SHA256 `f7f493110ea9d516b477851c735c050a93d4b796cdf29dfc1d1e6abc30537887`；runtime、scores、素材尺寸、裁切、地圖 ISO3、AVIF decode、manifest 及 `git diff --check` 驗證通過。
- Drive 上載前同名搜尋 0；直接上載後由 `get_file` 和資料夾搜尋核實唯一檔案 ID `1rovjkGRtX6shgk2R6i_N8hDh3rm96VKn`、MIME、parent、bytes、MD5 一致。沒有 ZIP/R2；不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0080 烏鵑：舊版本紀錄（已被取代）

- Runtime：烏鵑 *Surniculus lugubris*（`Square-tailed Drongo-Cuckoo`），鵑形目／杜鵑科；`i=2, v=3.4, r=1, c=1.2, o=1.9, vEst=1`；runtime 缺少 `a`，保留待查。
- 已讀 HKBWS `https://avifauna.hkbws.org.hk/species/0040/005400` 及 Cornell eBird `https://ebird.org/species/asidrc3`。香港 Category I，主要春季在林地出現的稀少過境鳥。成鳥23–25 cm，纖瘦如鵲鴝，身體藍黑帶光澤，纖長弧嘴、微分叉尾，尾下覆羽及最外側尾羽具細白橫斑；幼鳥有不同程度白點。全球 IUCN LC、趨勢下降。
- 比較八聲杜鵑成鳥及褐翅鴉鵑成鳥。修正並目視核實主圖頸部銜接，四個特徵圈與全部文字位於面板內。插圖為據可靠描述手繪像素風格，非照片，未經鳥類專家獨立驗證。地圖是部分原生範圍國家概覽。
- 最終 `deliver/cards/info-restart-0080/aviandex/0080.avif`：1024×1536、130,812 bytes，MD5 `a275d3e0a96a4d2237def217165b4da7`，SHA256 `2511bd7e44e48ba608ba9282abfb167bdd2819bf0d5d76154263d5ae38c2ed8d`；runtime、缺分、vEst、裁切、素材尺寸、地圖 ISO3、AVIF 解碼、manifest 及 `git diff --check` 驗證通過。
- Drive 上載前同名搜尋為0；直接上載後 `get_file` 及資料夾搜尋核實唯一檔案 ID `1hQX2M7A0ZfO8lL-3wzUjuI2pFXCLGT3j`、parent、MIME、bytes、MD5 一致。沒有 ZIP/R2；不覆蓋 app 卡片，不改 UI、Service Worker、slim 註冊或共用 renderer。

### 0081 大鷹鵑：舊版本紀錄（已被取代）

- Runtime：大鷹鵑 *Hierococcyx sparverioides*（`Large Hawk-Cuckoo`），鵑形目／杜鵑科；`i=2, a=3.8, v=4.3, r=4.8, c=3, o=3.6, vEst=1`。
- 已讀 HKBWS `https://avifauna.hkbws.org.hk/species/0040/005500` 及 Cornell eBird `https://ebird.org/species/larhac2`。香港 Category I、常見夏候鳥。成鳥38–40 cm，灰冠與臉側、亮黃眼圈、褐色上體及灰色黑橫帶尾；白色下體胸及頸側有深栗色粗縱斑，下腹及脅具栗褐橫斑。全球 IUCN LC、趨勢穩定。
- 比較八聲杜鵑成鳥及烏鵑；完整預覽已目視。黃眼圈特徵裁切框上緣擴大後完整呈現，其他特徵圈與全部文字留在面板內。主圖依描述手繪像素風格，非照片，未經獨立專家驗證。
- 成品 `deliver/cards/info-restart-0081/aviandex/0081.avif`：1024×1536、135,660 bytes，MD5 `3d1a38e3712bebc6a0fb7d8eda0f0697`，SHA256 `f7a1647d61129a8aa9f172f784418bde76c33ee3571d5b7c31bd3a74d8403203`；runtime、scores、vEst、裁切、素材尺寸、ISO3、AVIF decode、manifest 及 `git diff --check` 驗證通過。
- Drive 上載前同名搜尋 0；上載後 `get_file` 及目的資料夾搜尋核實唯一檔案 ID `1OYAnEE_9W1SrMKMB2CT8RK6JQtPxjcdh` 及 metadata。沒有 ZIP/R2；不覆蓋 app 卡片、不改 UI、Service Worker、slim 註冊或共用 renderer。

## 新分支重試 0038–0040：發現 Drive 已有另一版本，停止重複上載

目前分支 arena/ec608ba0-aviandex（base b73ec92）。新分支環境無舊 ignored 素材、venv、fonts；本回合重新建立 venv（Pillow/fonttools/numpy/scipy）、TC 靜態字體，從 GitHub 下載 NaturalEarth geojson，十次生圖全成功，三張本機版已渲染／基本目視／audit。

**但上載前查重發現三個同名 Drive 檔已存在，並且本機 MD5 不同。沒有呼叫 upload/update/delete/move；三個遠端檔完全未改。本機版本不算本回合交付。** 最新 remote main 仍 b73ec92，沒有這三張新交付紀錄可同步。工具 get_file 回傳如下，只有 metadata 檢查，未下載或看遠端二進位，不能聲稱遠端畫面已由本回合審閱：

| Drive 既有檔 | ID | bytes | MD5 | createdTime |
| --- | --- | ---: | --- | --- |
| 0038.avif | 1A3jDnwXS1lktH5hvUKx5GBXuhIqIk-75 | 145434 | 28504087333152e6f77d45f3e54d9dd8 | 2026-11-12T10:04:40.674Z |
| 0039.avif | 1EQNeaI2I9FBkhvNvV66Mt0eSJeAo87vL | 148002 | f6244aebbbcea187f18d683e93131558 | 2026-11-12T10:04:49.881Z |
| 0040.avif | 1j5yRRDvKZ1H83jKFiaqWrfIEu2VOBq6W | 146953 | 7744c801301fa46d6066153545d3a5be | 2026-11-12T10:04:59.959Z |

三者 parent 都是正確 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。description 分別為赤頸鴨栗頭黃額冠、綠眉鴨雄鳥及獨立雌鳥、棕頸鴨菲律賓原生概覽／比較中華斑嘴鴨及綠頭鴨雌鳥。可能是另一工作階段完成，來源未核實。**先向用戶確認保留現有三檔並從0041接續，不擅自覆蓋或建立重複檔。**

### 本回合本機版本（未上載）

- 十幅：0038 pixel/features/female/gadwall 四張；0039 pixel/features/female 三張；0040 pixel/features/eastern-spot-billed 三張。0038/39互用雄鳥作對照，共用新 Gadwall。Gadwall 原圖細白邊裁去 10px，整鳥保留。0040 因舊素材缺失，用新圖；第二對照改為本批赤膀鴨，而不是舊缺失 female Mallard。沒有重做已交付0001–0037。
- scripts/cards/info-restart-0038.json、0039.json 新建，0040.json 對應新素材更新；`/home/user/make_specs_38_40.py` 為初始生成器。Renderer 無改，UI／runtime／slim註冊無改。三份 spec 只是本機候選，不代表已有 Drive 版本的來源或裁切。
- 素材 contact sheet `deliver/cards/batch-0038-0039-art-review.jpg`、0038/39雄鳥原圖、0040三幅原圖、三張完整預覽已看。0038黃額冠明顯，0039灰頭白額綠眼後紋、雌鳥各自標示；0040橙皮黃頭黑冠眼紋灰喙黑甲。AI基本目視非專家驗證。
- 三張1024×1536 AVIF decode、bytes/SHA256、spec=manifest、runtime taxonomy/六評分、fullworld bounds/ADM0_A3、無ZIP、compile/gitdiff檢查通過。
- 本機0038 149033 bytes MD5 05215219dc6729f6c98f6b7c75eca87b SHA256 b9fdc0e0683361a0c58d77f9032f0942fa7e2090708b54cb07e2eaf852f58c92。
- 本機0039 147282 bytes MD5 8c5011c12767895a70a391c51caa5091 SHA256 54c432066f73050d9db52295312561145123a47f26b0088496774742631c2420。
- 本機0040 150087 bytes MD5 343eb8746262dbd64703c741a79645c3 SHA256 8262f14e0ec5835dd30ad84d58606a36305a1dc2ee5adda2c928836da4132dd7。
- Manifest 狀態 `local_variant_not_uploaded_existing_drive_conflict`，existingDriveFile.matchesLocal=false，binaryVisuallyReviewed=false。不把遠端檔ID填成自己的成功上載紀錄。
- 本 Agent仍只做到0050包括後停，另一Agent0051–0100不碰。下回合先核對用戶回覆；如確認保留現有0038–40，就從0041研究／生圖並在生圖前先查Drive防止再碰撞。

## 繼續重試：保留既有0038–0043；新交付0044–0045

用戶指示「繼續try again.try again.」後，採不覆蓋策略續作。新一輪 Drive 查重發現0041–0043亦已有檔案，保留不動、未重新生成；本回合沒有審閱該三個遠端二進位，不把它們冒認作自己的新交付：

| 既有檔 | Drive ID | bytes | MD5 |
| --- | --- | ---: | --- |
| 0041.avif | 1eL4ps8zuYz3xswUgMmt2RKtvVquoxZ3L | 146518 | 85d67ac535df2bfe84531395e9240183 |
| 0042.avif | 1xmoyeaLKIcgLSxTbDHw-eqTK2aJcnklO | 142514 | b31ae9c99943a2c28cb10d8592f94206 |
| 0043.avif | 1NHgCYu8t_zHTbVubyyFioX3_cP6ozmpx | 145542 | 2b95064b4bcac5d3bfd8766a398b0192 |


0044–0050 查重時0044–0050均未有檔。本機ignored素材、venv/fonts再度不在環境，僅新做0044–45，不重做已交付圖。重建venv/字體/NaturalEarth。7次生圖成功：0044 pixel/features/female/wigeon，0045 pixel/features/american-teal。female Pintail 本批未用，保留為素材。兩張完整預覽已讀圖基本審閱；非獨立鳥類專家驗證。

- **0044 針尾鴨 Anas acuta**：HKBWS002300 substantive identification/range/conservation讀取，繁殖雄鳥褐頭白頸紋、細長灰喙暗脊、長中央尾羽、淡邊黑肩羽。對照綠翅鴨及赤頸鴨（先前0038研究來源），全世界底圖部分國家原生概覽。LC，來源族群趨勢下降。四crop為頭喙／白頸紋／針狀尾羽／肩羽；不是飛羽張翼圖。
- **0045 綠翅鴨 Anas crecca**：HKBWS002400 substantive讀取，LC趨勢未知；34–38cm，栗頭綠眼後斑橙黃窄邊、水平白脅線、尾側暖皮黃。runtime英文仍Green-winged Teal未改，圖像依學名作Eurasian型，非美洲carolinensis。對照美洲綠翅鴨（HKBWS002500 substantive文字已讀，嵌入媒體bot文字非整頁無內容）：垂直胸側白帶、綠眼斑淡邊較少；另對照針尾鴨。vEst原值保留，卡面提示觀賞值含體長估算。
- 使用既有renderer/compositor，未改UI/runtime/登記，未上R2，無ZIP。生成specs0044/45及ignored art/deliver；1024×1536 AVIF解碼、所有六評分runtime一致、spec=manifest、taxonomy、hash/bytes、世界bounds、ISO3合法、git diff --check通過。
- 上載前再次查重0044/45無同名檔，才分別upload。回傳parent/bytes/MD5全與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0044.avif | 15LVMwAlJSJROAdMv1jLfM7hUHB7ac4XM | 137539 | 1990c23cc2f47679c82492181b6346a9 | 7a21bac179cc3d957e5e9668cea020a19b1610d3b2004bf6111fae4cbadda036 |
| 0045.avif | 1JBjZPwCSO5Tdw_cK3f-wleAh4DKTe5UL | 147353 | f81403a35a8d99c7b4c8d06e0b798e9c | 2b7af508a30a4e7c855a52b47370b7d0b5ac3dcbff9bc2007041ec8744d2bd14 |

parent均 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。下一張0046赤嘴潛鴨，繼續前先查Drive防撞；做到0050包括後停止。0051–0100由另一Agent，不碰。0038–40本機候選不是遠端來源，不覆蓋。


## 0046–0050 完成：到0050停止

用戶指示「繼續」後，先查Drive0046–0050無檔，再研究／生圖／完整預覽審閱／audit；上載前再次查重無檔，才分別上載。10次生圖全部成功，五種各pixel/features；兩個比較圖均取自本批另外物種features，沒有重做先前交付43插圖。AI基本目視檢查，並非獨立鳥類專家驗證。UI/runtime/renderer/compositor未改，沒有R2上載或登記、沒有ZIP。

來源頁substantive identification/range/conservation均已讀，注意HKBWS頁序與runtime ID不同：0046→002600、0047→002700、0048→002900、0049→002800、0050→003000。赤嘴潛鴨頁有嵌入媒體bot段，但辨識及分佈文字完整可讀。

- 0046 Netta rufina：LC（來源趨勢未知）；雄橙圓頭紅眼、紅喙淡端、黑胸、淡脅褐背。比較紅頭潛鴨及白眼潛鴨。runtime vEst=1提示保留。
- 0047 Aythya ferina：VU（來源快速下降）；雄紅眼橙褐頭、暗喙寬灰帶黑端、黑胸灰脅。比較赤嘴潛鴨及白眼潛鴨。評分保育軸2.2沿用runtime，不能從IUCN私自重算。
- 0048 Aythya nyroca：NT（來源下降）；雄白眼深栗褐體、翼背較暗及白尾下。比較青頭潛鴨及紅頭潛鴨。runtime vEst=1提示保留。
- 0049 Aythya baeri：CR；雄綠光暗頭白至淡黃眼、栗胸、栗白脅及白尾下。比較白眼潛鴨及鳳頭潛鴨。runtime適應力缺值保留「待查」，有「待查非零分」提示，沒有補零或重算綜合。世界底圖只標中國作保守部分現況概覽，來源強調歷史範圍收縮、現今境外越冬少，不把歷史俄羅斯／印支／印度次大陸直接標作現況；亦不把來源舊150–700成熟個體估計聲稱為目前數字。
- 0050 Aythya fuligula：LC（來源穩定）；雄黃眼、下垂長鳳頭、灰喙寬黑端、黑翼背白脅。比較青頭潛鴨及白眼潛鴨。runtime vEst=1提示保留。

五張features/pixel contact review `deliver/cards/review-0046-0050.jpg` 及五張完整1024×1536預覽均已看。四crop與標籤相符，腳在水下，不用折翼圖假稱展示飛行翼帶。世界bounds與部分國家/非全境警語保留，所有ISO3存在於NaturalEarth。五張AVIF解碼、spec=manifest、hash/bytes、taxonomy、六評分（含0049缺值）、無ZIP及Pythoncompile/gitdiff檢查通過。上載回傳bytes/MD5/parent全部與本機一致。

| 已上載 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0046.avif | 1r3QpTx3Tnjl6e3e4lZxQroApHmSIngNZ | 134327 | 3ccf294c6b6ce3d50a8056d5f980959c | bb2a3e12bf057da4aa59a46e6eff302fb087baaa261b0200a56fd0e34e4a2347 |
| 0047.avif | 16GiFKqi9IK9Yk6OUnLZAoNDO0eORdkhD | 143918 | 428bc526ee15f5716b364b2e5ac6dff6 | 01990f485046a0d3b4b0f90551789500e08b3d0407ba0cb89e55af4415657428 |
| 0048.avif | 1D0MOy8IDiDiiSmrReHRhEF6zPn2O6woQ | 145781 | 36d580afcc201521b6ffc1ca0e213f7d | 2228b46b774a0c440c08c3135a81c3d79509b9cd3456bd2cd0f6fb79fe091c1a |
| 0049.avif | 1o1FT8tn-5_WlaWWq3r2KLx3HHWm-XKn2 | 141112 | e4e598d5102c57afa429e9e25d8285bd | e8d28704b81bdc81b9861a892a693104b2428d743e2f7c852904816312f6e747 |
| 0050.avif | 1X5UsFTg-uHGWo13H-dun67t2g1f4fnZT | 139803 | 20e5c177b9a77447f0da9d311ff4c979 | 7944e074de94a0ffea99f437b7f7c03c42885127413758a4bc5f26723c2939e6 |

全部parent為 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`，manifest標`uploaded_drive_verified`。**本Agent到0050包括已完成並停止，不製作0051。0051–0100仍由另一Agent負責。**0038–0043既有Drive版本未被覆蓋；0038–0040本機候選仍不是其來源，也沒有把候選當成功交付。


## 新授權：接手另一Agent餘下0082–0100；特點標籤自適應

用戶提供特徵列截圖，要求接手另一Agent未完成部分，並詢問能否按字數加寬小標籤框，否則退回部位名。**此新授權取代此前本Agent到0050止／不碰0051–0100的限制，僅接手未完成部分。** fetch origin/main後發現 PR25 已合併至 `9aac65a`，該主分支docs/specs記錄交付0051–0081（最後0081大鷹鵑）。本工作分支未切換／未覆蓋local docs，透過git show讀取交接；後續共享合併時要保留PR25交付紀錄，不能用本地較舊docs取代它。

Drive查詢0080/81及0082–84回傳無有效檔，原因未明；不以缺檔為由重做已有主分支成功紀錄的0080/81。0082–84製作前及上載前各查重均為0；本回合不修改已交付0070或其他舊卡。

### 特徵標籤框改進（只改卡片生成器，非app UI）

`compose-card.py` slim新增 `slim_feature_label`：原100px膠囊框按實際Noto字寬加24px內距，自動增至最多210px；每欄中心距238px，所以留在自己的欄內，不碰鄰框或面板邊。短標籤仍22px字及原100px框；極長文字先縮至最低18px，再必要時省略號，絕不無限制擴張。內容仍優先簡短特點／部位名，避免長句。只變slim四個feature膠囊，其他版式不變；現有已上載AVIF不會自動改。

`test-slim-feature-label.py` 4項測試通過：短標籤不變、特點框擴大、中英長字/換行/空字均量度內距及面板邊界/鄰框、過長省略且字≥18px。新三張完整預覽已目視確認6–7字特點在框內。

### 新完成0082–0084

HKBWS substantive辨識/分佈/保育文字已讀：0082 `/0040/005600` 北鷹鵑；0083 `/005700` 霍氏鷹鵑；0084正確 `/005100` 斑翅鳳頭鵑（誤讀過的005200是噪鵑，未用作其來源）。比較用大鷹鵑005500及紅翅鳳頭鵑005000辨識文字已讀。8次生圖成功：三種pixel/features各2張，加兩張比較圖（81/78只作本批比較，不重做/覆蓋其已交付資訊卡）。主圖成鳥代表，非聲稱與香港幼鳥紀錄同個體。

- 0082北鷹鵑 Hierococcyx hyperythrus：LC穩定，成鳥灰粉無明顯斑下體、灰頭黃眼圈及尾窄橫帶。香港資料為秋季幼鳥，本卡明確成鳥不套用幼鳥辨識。部分國家原生概覽合併繁殖及已知婆羅洲/蘇拉威西部分越冬；不捏造完整越冬地。對照霍氏／大鷹鵑。
- 0083霍氏鷹鵑 H. nisicolor：LC全球下降（香港增加另論）；成鳥白下體淡灰粉縱紋、黃眼圈、白三級飛羽斑、栗色尾端。對照北／大鷹鵑。runtime只有v/r，i/a/c/o均待查，vEst保留。
- 0084斑翅鳳頭鵑 Clamator jacobinus：LC穩定，成鳥黑白型尖鳳頭、白翼斑、白喉腹及白尾端。部分原生範圍非洲/印度/斯里蘭卡/尼泊爾/緬甸，香港偶見及eBird額外紀錄不直接當正常原生。對照紅翅鳳頭鵑及無冠黃眼圈的北鷹鵑。runtime所有評分缺省保持待查，未從LC補數。

三張1024×1536 AVIF解碼、spec=manifest、SHA256/bytes、runtime taxonomy及六評分含缺值、世界bounds/ISO3、無ZIP、git diff --check皆通過。AI僅基本目視，未經獨立鳥類專家驗證。未改UI/runtime/R2/slim登記/SW。上載回傳MD5/bytes/parent與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0082.avif | 1ocykeXSFj_U3Y1alFwikiP06JVHSvaRk | 134052 | 574f485e32e19940723ca6d2bb31f435 | 8b1a8def1032d49d8f0a695d157882199857070affce13bc27bb7b7efe1a5bbb |
| 0083.avif | 1UH_cug6igQ4pJSjELk4NBGd7ybYrtm_l | 145995 | b270281918fcc37137dc22cdbf268291 | 92f34eb53530eed7bc18f7474cd1f494be770bd8cd23f55da13b5d51c20af769 |
| 0084.avif | 1PXP6ImFeKBJRxNdr9saiAz3pxT559dH3 | 135511 | cabe94fdd95778c8b2392da17c1583d6 | 21f6c948c9a08e9a97875ea2203b1c3aabd5b4226f0c294c4985f6e023d1475b |

parent均 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`，manifest `uploaded_drive_verified`。新範圍0082–0100尚未全部完成：下一張0085小杜鵑，接著0086–0100，製作前逐批Drive查重。**不能聲稱全部完成；已有0070等卡不因新標籤算法自動更新或覆蓋。**

## 用戶更正：0078–0081亦需重做；完成圖像後優先補齊JSON

用戶明確指出另一Agent的0078–0081做壞，故不得再視為最終可用。新增待重做：0078紅翅鳳頭鵑、0079八聲杜鵑、0080烏鵑、0081大鷹鵑；0082–84本Agent新交付仍保留，0085–0100待完成。用戶要求完成這批生圖後優先把JSON全產出。此紀錄只更新範圍，**尚未重做或替換0078–81**。

每張資訊卡通常對應 `scripts/cards/info-restart-NNNN.json` 一份物種製作spec（名稱、學名、保育級別、特徵文字、裁切、比較物種、分佈及來源）；另有ignored交付manifest記錄實際AVIF hash/bytes等。兩者不是app card-manifest，JSON也不內含AI素材本身。最終需與新圖/裁切逐張對齊，不能先把未知裁切或未查來源當完成。

本輪盤點local與已fetch的origin/main specs聯集：0001–0100缺0041/0042/0043及0085–0100；0078–81舊spec在origin/main（不在本地工作樹），需隨重做更新，不能直接冒認是新圖spec。0041–43只有Drive既有檔的已知交付，本Agent未審閱其遠端二進位；日後若補這三份JSON，應取得來源spec或以實際畫面核對，不能虛構裁切/製作來源。JSON整合時必須保留PR25主分支0051–0081紀錄及spec，不以較舊本地docs覆蓋。


## 0078–0081 重做已交付；每張圖完成即同步JSON

用戶最新指示「只能邊完成圖邊弄JSON」：不用等待全批生圖後才批量補JSON；每張生成→審閱→同步spec裁切/特點/比較/來源→渲染及audit→Drive交付。此順序取代先完成全批圖片再處理JSON的舊計劃。

本回合環境ignored舊圖/venv/fonts再次缺失；重建venv(Pillow/fonttools/numpy/scipy)、NotoSansTC400/700與NaturalEarth。8次生圖成功，0078–81每種全新pixel主圖和features；**沒有使用另一Agent被拒絕的手繪/簡陋舊圖**。4份JSON由origin/main舊spec作metadata起點，依新圖重寫裁切、特點、來源、對照資產及notes；不只改status。比較全取本批新features（0078對照0081/0080、0079對照0080/0081、0080對照0079/0081、0081對照0079/0080）。新圖為成鳥；0079為成雄，不混用雌鳥赭色型或幼鳥。

HKBWS identification/range/conservation substantive文字重讀：0078 `/0040/005000`、0079 `/005300`（包括chunk1範圍/保育）、0080 `/005400`、0081 `/005500`。全為LC；0078/79/81來源全球穩定、0080下降。runtime評分原封保留：0078 i/a/c/o待查；0080 a待查；0078/80/81 vEst原值與卡面提示保留。不從LC補缺分或重算綜合。

- 0078：黑尖鳳頭、白後頸環、小橙皮黃喉斑、栗紅翼及大致白腹、黑尾。沒有把整片胸腹塗橙色。
- 0079：灰頭罩及上胸、灰褐背翼、無斑橙皮黃腹、白端漸層長尾；成人雄鳥。
- 0080：自然頭頸銜接、藍黑光澤、細弧喙、微叉尾及尾下/最外尾羽腹面細白橫斑，不是幼鳥全身白點型。
- 0081：灰頭黃眼圈、胸頸深栗粗縱斑及腹脅栗橫斑、褐翼背與灰尾深橫帶，非猛禽鉤喙。

contact `deliver/cards/review-remake-0078-0081.jpg` 及四張完整preview均已讀圖。初檢後0078/79/81的尾部crop移向尾尖重新渲染；`deliver/cards/review-tail-fix-0078-0081.jpg`已讀，白尾端／灰尾帶更完整。動態字寬膠囊標籤均留在欄位內，4項label測試通過。1024×1536 AVIF decode、spec=manifest、runtime分類/名稱/六分含缺值、ISO3、世界bounds、hash/bytes、無ZIP、Pythoncompile、git diff --check全部通過。基本目視檢查非獨立鳥類專家驗證。

製作前與上載前Drive精確0078–81查重均為0（舊版本不在目的資料夾的原因未知），因此新建標準NNNN.avif，**沒有刪除/移動/更新遠端舊檔**。上載回傳parent/bytes/MD5均吻合本機。

| 重做交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0078.avif | 1B9mgzQMJY4U93duC_F1D9BFFYGoxLWiF | 136880 | 36910affb44e1d942e6046abc01b5c8c | 4ff43c03d4dabc0ce40169ea49936f4ae9ed093b6ff5e6c26fa1b2bfce706b33 |
| 0079.avif | 1iOf4_cR5YNhtivpFhErAy5M-yOxAqLXY | 141384 | 725cce0edfa2f76791daa5a8074b75a8 | 2afe67e64edf257976190ec9e6113f726a1bda97d0d95c89eaf1c0e46983bf87 |
| 0080.avif | 1v4V1tMwK6F0mCPLuWD9MKbyI6__H92vW | 134603 | 9174e9240bc17e8f23fcd3c77f481df3 | 50febcc92002a6660dc242f36e347bdf47972976cb281ddf42632e42ac598535 |
| 0081.avif | 19Vat2Bk3ZTa4RtHY0inWgC1Mq_nhckBu | 142698 | 78bed2b95afca4beecb91115993a2829 | 28a18269aa78d1dc06a5bf4a8f561205192d3e5511a0a28ce500c15b7f502501 |

parent全為 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。本回合0078–0081重做完成；0082–84已交付版未改。下一張0085小杜鵑，繼續到0100；每張完成同步JSON，先查重再上載。沒有R2、UI、SW、runtime或slim註冊改動，沒有ZIP。合併時仍須保留PR25主分支0051–77的spec/交付紀錄（本地分支尚未整合）；用本回合新0078–81覆蓋舊spec，而不是復活被拒絕圖像。


## 0085–0088 已完成：圖像及JSON同步交付

用戶「繼續完成」後，逐批查重0085–88無檔；8次生圖全成功（每種pixel/features），對照亦用本批已審閱新features。不重做0078–84。四份JSON隨新圖建立且依實際畫面調整。來源HKBWS substantive識別/分佈/保育讀取，外部profile與runtime編號不同：0085 `/0040/005800`、0086 `/005900`、0087大杜鵑 `/006100`、0088東方中杜鵑 `/006000`。全為LC；來源0085/87全球穩定、0086/88下降。

- 0085小杜鵑 Cuculus poliocephalus：代表成雄灰色型，褐眼黃眼圈，疏落/較不完整腹斑、素皮黃尾下及白斑漸層尾。適應力缺分保持待查，vEst原值保留。HKBWS長度38–40cm與該頁稱較小的屬內辨識敘述有疑義，未當新卡體長主張或用來覆寫runtime；spec註明。不混入雌鳥赭色型或幼鳥。
- 0086四聲杜鵑 C. micropterus：成雄紅褐眼黃眼圈、灰頭/褐翼背、寬疏腹斑，寬黑近尾端帶突出。vEst保留。對照大杜鵑及東方中杜鵑。
- 0087大杜鵑 C. canorus：成雄指名型代表，黃虹膜黃眼圈、細密腹橫斑、灰翼背及白斑長尾；bakeri背色較暗會重疊，不冒稱香港紀錄亞種已確定。對照東方中及小杜鵑。
- 0088東方中杜鵑 C. optatus：成雄灰色型、褐虹膜黃眼圈、寬粗腹斑、暗灰翼背，示範有寬斑的尾下個體（不是所有個體皆同）。不宣稱外觀可與喜馬拉雅中杜鵑C.saturatus分開，通常需鳴聲/量度；台灣繁殖族群分類仍有疑義，本部分國家圖不標台灣。vEst保留。對照大及小杜鵑。

四卡完整預覽及 `review-0085-0088.jpg` 均已目視。第一次預覽後將0086–88第三圈標籤改為實際可見的「褐色翼背／灰色翼背／暗灰色翼背」，不聲稱該局部圈含頭胸；重渲染 `review-wing-labels-0086-0088.jpg`已讀。各膠囊字寬自適應且在欄位內，4項label測試通過。屬內辨識需綜合鳴聲/量度/多項特徵，人工插圖不是確定鑑別key；折翼圖不假稱展示飛行時翼下白帶。

AVIF解碼1024×1536、spec=manifest、runtime名稱/學名/六評分含缺分、世界bounds、ISO3、bytes/hash、無ZIP、git diff --check全部通過。AI圖只基本目視，非專家驗證。UI/SW/runtime/R2/slim註冊無改。上載前再查同名0後，逐張upload；回傳parent/bytes/MD5全部吻合本機。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0085.avif | 1odKe1deIroMwnpQf92RB5vJKd7X2Cu0K | 139552 | d12a3942caf9acae9d5620c3c8911471 | 4492af888f54b975135ff38c77acbbf91b17751fd8b82d40f51f8a5312a8a628 |
| 0086.avif | 11iJKuNy9mznsaec4VEv4yDdNRlJmM1Em | 143060 | de2e3716df526361c5c87e248f2ef514 | 9677e62275c0cb2313a07b6868cfe0bae886fa6f673313b476b6e6ebdb0d7ea8 |
| 0087.avif | 1KjXax-9VdSxFakgJzdzLyo1DY1PMjJ2o | 141877 | 4c5598113d5aa8702112e4d213e90a9d | aec3591ab771255815cc300a3e4ebcf1f75a16045b263655660131b5a17ca494 |
| 0088.avif | 1250i9mY3s6LJBcD47RoERI9p0Jlh_i6I | 142505 | b3266d7f066a80eb7c1e632384f10c06 | 3aff446ae3a89a24eb75b9ff585b7124294accd5409a63a1f752f43c3002d49f |

parent全 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。新交付到0088；**尚餘0089–0100，共12張，未聲稱全部完成**。下一張0089普通夜鷹，與0090林夜鷹一起研究/辨識，再續雨燕及秧雞。每張新圖完成同步其JSON，逐批先Drive查重。


## 0089–0092 已完成及上載核對；尚餘0093–0100

新圖完成後同步四份production JSON，再依完整預覽修正裁切/標籤。10次AI生圖：四種pixel/features，另歐夜鷹、褐背針尾雨燕對照圖。HKBWS substantive識別/分佈/保育讀取 `/0030/003900`（兩chunk）、`004000`、`004200`、`004300`，對照`004400`及eBird `eurnig1`。四種全球LC穩定；針尾雨燕香港春季紀錄下降不等於全球IUCN下降。

- 0089普通夜鷹：成雄，暗灰羽色、背翼黑色羽心及暗肩翼；長翼/尾端白斑的飛行特徵未假稱折翼圖可示範。對照林夜鷹、歐夜鷹；鳴聲及多項實地特徵仍重要。
- 0090林夜鷹：成雄，較均勻灰褐細斑、短嘴大眼。尾crop無充分呈現外尾白色，最終標「羽紋長尾」，不是強行宣稱診斷性白尾。對照普通及歐夜鷹。
- 0091白喉針尾雨燕：白額/白喉、銀灰背鞍、白尾下側腹及短方尾針羽。背鞍圈取上側pixel，喉/尾圈取下側features，JSON featureSources逐圈對齊。
- 0092灰喉針尾雨燕：暗額灰褐喉、銀灰背鞍、白尾下側腹；針羽在該crop不夠顯著，最終標「短方形尾羽」。兩種針尾雨燕相互對照，另褐背針尾雨燕淡褐背鞍對照；遠距甚難分，需近距頭喉視角，不將人工圖當鑑別key。

四張完整preview、contact及修正後特徵條均讀圖。膠囊無溢出；4項label測試、spec=manifest、runtime學名/名稱/六分、世界bounds、ISO3、AVIF1024×1536解碼、hash/bytes、無ZIP及git diff --check通過。只基本目視非專家驗證。未改UI/runtime/SW/R2/slim註冊。

製作前及上載前Drive精確查重0；四張上載成功，回傳parent/bytes/MD5均吻合本機。manifest top-level uploaded_drive_verified；embedded production spec仍保留製作階段review_before_upload，非交付狀態。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0089.avif | 1XPC0mz89WrN-mFFurCYPVztlIOa-9NOa | 157881 | 17c578f98f551aa62d350f3e116b7696 | d780c088e43d5e7ec1265715d833b2c2ee965014e1832c541eae247ed26824ae |
| 0090.avif | 1Ip1v8z1kYEYFVMwa4PElNWC0To4CfSk- | 156338 | 40c1ec13e6acee00f55a55551b9028f8 | af0b5427898b790ead81b3b01b41597dc3864cdc20b36d827de97a46091fbb91 |
| 0091.avif | 1niZtZlciooqbdzuTp23psUMuIC1YbUDd | 130053 | de11fb7505828b869d19f7be589ea969 | 41a23631e9cfec321f52aa7518a8fcba8b76a90f9f82490c3f9305afbe7227d6 |
| 0092.avif | 1te2ROVx8bnvndWmGqVpa8KE2ppoQUu8D | 132918 | 1ad422a2ac8fc75d34abbeddd4bc6c64 | 37fe14a371ff9b18dd69cfd35161f6b95edf14ed7a54456827ce21e32c8f516f |

parent全 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。目前完成到0092，0093–0100八張未完成；0041–43來源JSON缺口仍待真實來源/畫面核對。不要重複上載0089–92。尚未整合origin/main PR25，合併時保留其0051–77紀錄/spec及本分支重做0078–81。


## 0093–0096 圖像/JSON逐種同步完成及Drive核對

用戶「繼續」後先查重0093–96無檔，按每種pixel/features生成→讀圖→製作JSON/裁切→渲染，並非先預填全批未生成的裁切。9次生圖：四種兩圖，另House Swift比較圖。來源HKBWS substantive識別/分佈/保育：0093 `/0030/004400`、0094 `/004100`、0095 `/004500`、0096 `/004600`；比較House `/004700`及eBird `houswi1`。0093全球LC下降，0094–96全球LC穩定；香港局部趨勢不混同全球保育。

- 0093褐背針尾雨燕：adult indicus代表，褐色背鞍（非銀灰）、暗褐頭/淡頦、白後側腹、方尾突出針羽。白眼先斑是已查文字特徵，但AI圖位置不可靠，沒有診斷眼先crop標籤。比較0091/92用已審閱上側pixel，背鞍差異可見。
- 0094短嘴金絲燕：innominatus代表，暗冠眼區、較淡灰褐頸背、灰褐腰非白腰、尾微凹。腰色會隨光線/族群變異，不能拿單一圖當全屬鑑別key。對照小白腰及灰喉針尾，非等比例。
- 0095普通雨燕：淡額喉、暗褐腰背、狹長尖翼及深叉尾。初稿第三圈「鐮刀形長翼」改為該局部實際可見的「狹長尖翼」；0096圖/spec完成後換入白腰雨燕比較（另小白腰），重新渲染核對。
- 0096白腰雨燕：淡喉、鮮明白腰帶位在尾基上方下背（不是針尾銀背鞍）、狹長尖翼及長深叉尾；對照普通及小白腰。kurodae/kanoi來源亞種處理有差別，runtime物種不變。

**來源分類變動注意**：目前HKBWS `/004700` 標頭及eBird `houswi1` 把House/nipalensis群併入Little Swift Apus affinis；runtime仍為Apus nipalensis且本任務凍結taxonomy。比較圖/JSON保留runtime名稱，明確記錄差異，不能以現行合併種廣義分佈直接套用舊nipalensis。下一張0097必須同樣處理，並另核對nipalensis群範圍/保育，不默默改runtime或拿非洲Little Swift冒充。

四張完整preview已讀，特徵圈/膠囊無溢出，四項label測試通過。spec=manifest、runtime名稱/學名/六評分、世界bounds、ISO3、AVIF1024×1536解碼、hash/bytes、無ZIP、git diff --check全部通過。AI圖只有基本目視非獨立專家驗證。0093/94vEst提示保留。上載前再查精確名0後四張新建，回傳parent/bytes/MD5均吻合本機；未覆寫/刪除舊檔。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0093.avif | 1qiVh-8WGJe9se0oSs_iM3M-_aZ7XPC6b | 140819 | fc6c66b9c7b1e7f9bdc953d1304b5115 | b9cf502e59f7b149c735e227f223b57ae3eaa00b73b9a01e2e9ae3bedef5e269 |
| 0094.avif | 1YJXGrf_ZkMhjLxcWDytFTVePUxMN2DVM | 136147 | 251075fc364a0c7cc64e2155dba99bf8 | 809d889a3208eae9bd089e8fcafcaa8caca80bcf1521a8eb88015d8672d6f21d |
| 0095.avif | 1Uo0z2KmqCRnKRoIdydDFHirdG6X40kHi | 126875 | 4213fec9bf4110d20757dee74f87066e | f8a4d768a63bc85f5cecd4938d748b0d1ba1a2496a6f07b8ce225a2357147d01 |
| 0096.avif | 1MzW6lnwFOmNfH_0e4cJd_NXmPSRl9y6i | 126789 | b6d7ea5ee6bcd68428fab8d0684893b1 | 7cc6f35608022ea0ee7358eb4db346b3d469a338f10ea423f4de111e4a451b7a |

parent全 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。交付manifest top-level uploaded_drive_verified；production spec維持製作階段review_before_upload。UI/runtime/SW/R2/slim註冊無變更，無ZIP。完成至0096，**尚餘0097–0100四張**；0041–43來源JSON缺口仍未解決，需實物/來源核對。不要重複上載0093–96；尚未整合PR25，整合時保留其0051–77紀錄及本分支重做0078–81。


## 0097–0099 已交付；0100圖/JSON草稿已存但對照素材待生成

本輪按每種新pixel/features→讀圖→同步JSON裁切→渲染工作，未預填其餘物種未知裁切。0097兩張、0098四張（含東方/灰胸秧雞對照）、0099兩張、0100兩張，共10次成功；0100兩個額外對照生圖被工具10張/回合上限拒絕，沒有重試繞過上限。

- 0097小白腰雨燕：白頦喉、白腰帶、暗褐翼羽、短淺叉尾。初稿第三圈「較短寬翼」只見翼羽局部，改「暗褐色翼羽」重渲染。適應力缺分保留待查、vEst提示保留。
- 外部分類HKBWS `/0030/004700` chunk1明確現在把Oriental birds作A.affinis nipalensis，保留app A.nipalensis。只取該頁明示nipalensis亞洲範圍作部分國家圖，不混用非洲/西南亞Little Swift。LC另以BirdGuides IOC10.2歷史分拆種紀錄核對，卡面註「依分拆分類保育紀錄」，不冒稱最新獨立分拆評估；來源現行合併種全球增加不當作舊nipalensis獨立趨勢。
- 0098西方秧雞：灰面無明顯眼紋、細長紅嘴、褐背黑羽心及黑白側腹斑；對照普通及灰胸秧雞。HKBWS `/0060/007400` substantive文字可讀（embedded Macaulay bot-block沒有妨礙文字），LC下降。生成尾下斑不夠可靠，不用作診斷crop標籤，也不聲稱專家驗證。
- 0099普通秧雞：深貫眼紋、白喉、褐背黑羽心、黑白側腹斑。HKBWS名Eastern Water Rail與runtime Brown-cheeked Rail皆R.indicus，runtime不改。`/0060/007500` substantive識別/範圍/保育已讀，LC下降；對照0098新features及灰胸adult素材，vEst保留。
- 灰胸秧雞對照`/0060/007600`已讀：栗冠後頸、上背細白/黑橫斑、較短厚嘴，成鳥不是幼鳥；全球LC增加與香港下降分開。

0097/98/99完整preview均讀，改標後`review-labels-0097-0099.jpg`已讀，動態膠囊在槽內。4項label測試、spec=manifest、runtime名稱/學名/六評分含缺值、世界bounds、ISO3、AVIF1024×1536解碼、hash/bytes、無ZIP、git diff --check通過。只基本目視非獨立專家驗證。製作前與上載前精確Drive查重均0；三張上載回傳parent/bytes/MD5全部吻合。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0097.avif | 19mM6nfmlx2gg5rvppOToF29AwaLkURqA | 139602 | bc22eb3e8d72b279268e9e3535d87112 | 36841636e7b9a89503ce1b3841335f6b8af6b8e741aa49a678d4d3dbf99d1bdd |
| 0098.avif | 1pqMZunmrqkaTxD1GIpOv6hiXsE8mUPue | 148281 | 55f9224f8636184e88c56e60a695573b | 8a8b4537118894809dc5967512ec94b0314c89b182bf09022230c890baef74d9 |
| 0099.avif | 1y0Xl8K3gFENzeMO6QzToCkEOiRAM-68s | 150410 | 9f4c04a2ff7ad35c338e767e6a5fa08c | 906420bbe37a39bb6a50f3966007249c1bff1e9e83974552fe558d8edc386f31 |

parent全 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。manifest top-level uploaded_drive_verified，production spec維持review_before_upload。未改UI/runtime/SW/R2/slim註冊，無ZIP。

**0100尚未完成／未渲染／未上載**：`cards/art/info-restart-0100/pixel.png`、`features.png`已生成，features已讀；`scripts/cards/info-restart-0100.json`隨圖保存真實裁切與研究，status `incomplete_comparison_assets_pending`，兩比較assetStatus `pending_generation`。來源 `/0060/007700`黑水雞、`007800`骨頂雞、`008700`白胸苦惡鳥 substantive識別/範圍/保育皆已讀。下一回合只生成缺的 `eurasian-coot.png`（白額盾白嘴、具瓣大腳）及`white-breasted-waterhen.png`（白面胸腹、栗尾下），審閱後移除pending標記/更新status，再渲染全卡、核對crop/labels、audit/查重/上載。不重生成功主圖、不冒稱0100已交付。基本主圖/特徵為成鳥紅盾黃嘴尖、白側腹線/尾下、黃綠長趾，地圖不包括美洲Common Gallinule。

目前交付至0099，只餘0100一張未完成；0041–43來源JSON仍需來源/實物核對，不能聲稱0001–0100JSON已全齊。origin/main PR25尚未整合，整合時保留0051–77史料及本分支重做0078–81。


## 最新交付：0100完成並續至0104（取代上節0100待生成狀態）

用戶授權0101及以後按額度繼續。本輪10次成功生成：0100缺的兩個對照、0101–0104各pixel/features；成功主圖不重生。逐種生成/讀圖後同步JSON裁切，未先填未完成物種spec。生成額度已用完，下一張0105灰腳秧雞，未建立其JSON/新圖。

- 0100黑水雞：兩對照已生成及目視，移除pending；首圈調寬保留黃嘴尖，白側腹線/白尾下/黃綠長趾。現已渲染上載，不再pending。
- 0101白骨頂：白額盾白嘴、紅虹膜、暗灰體羽、具瓣寬腳趾。保留runtime中文白骨頂，來源別稱骨頂雞；LC全球增加與HK局部下降分開。vEst保留。
- 0102白眉田雞：白眉及眼下第二白紋、淡灰胸、草褐背黑縱紋及細長趾；LC全球趨勢未知，不作穩定。地圖非完整太平洋島嶼分佈；比較非等比例、非完整田雞鑑別key。vEst保留。
- 0103董雞：明確繁殖成雄，紅延長額盾黃嘴、炭灰翼背及長趾。雌/幼羽不同；折翼圖不假稱可示範飛行翼緣白色。來源遷徙季峰值摘要/主文矛盾，不任意宣稱春秋排名。LC下降。
- 0104白胸苦惡鳥：白喉胸、黃嘴紅基部、栗尾下及橙黃長趾；首圈只有喉胸，標籤由白面胸腹改白色喉胸羽後重渲染/讀圖。成鳥外觀非初飛全暗幼鳥；HK下降不套作全球趨勢。vEst保留。

HKBWS substantive來源007700/007800/008500/008600/008700已讀。新圖只有基本目視，非獨立專家驗證。五張完整preview及特徵標籤條已讀；4項label測試、production spec=manifest、runtime名稱學名六分、世界bounds/ISO3、AVIF1024×1536解碼、bytes/SHA256、無ZIP及git diff --check通過。上載前精確Drive查重0（18345c82-c31d-40bc-b3a2-c3034ccd32e6），五張新上載回傳parent/bytes/MD5全部吻合本機，未覆寫/刪舊檔。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0100.avif | 1Cv1EKx0pN57T_UrMBFTCQkANTky23dcb | 142576 | 98e54761b8f1023e7d46e5590d3981b0 | 8a029ea3b1b4f803b134e0b030a2c30cc379c1316c2f1bb6400d16344594f30d |
| 0101.avif | 1-isSgmcdB0qZMghWLi7u2UUPKg9weT95 | 139830 | 44b8bcf0bc7ca90910733b14c45f5c8c | 44a3058413c07b6d3f5c8a8f640efd9dca17c3de0aa5d0d69d969d66edd9f038 |
| 0102.avif | 1XPbk2tknN9HvFSZ7FpsShTgSiFppgz-M | 152729 | 08ea698c84258f36b42911b320fdc683 | bafa1cf9fa03216d0ecc52e9ba819dc36004ccd1760c3b344d990fce41ff2446 |
| 0103.avif | 1SacgcCF-jKdQa5XwjR5IMnzPCS4QYvxF | 140092 | be6424f9ac05eccb39349c2f872612bf | 003e04f6934c42145ba4c06ad872c0872cd6e9cbfc5afe24891342230339d990 |
| 0104.avif | 1PWbzPZbZYhDFSTdcBFinp62nUdb3VomW | 143052 | 06001911dc0847066d6f884938ed8b1b | a515a42c6bcb8c9004ea217abe1dc5226d2f6194d227585fb6d51b463fedb175 |

parent全 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`。top-level uploaded_drive_verified與embedded製作階段review_before_upload區分。交付至0104，下次從0105開始，勿重覆0100–0104。未改UI/runtime/SW/R2/slim註冊，無ZIP。0041–43來源JSON缺口仍未解決，不能聲稱全批JSON齊備。PR25尚未整合；保留其0051–77歷史與本分支重做0078–81。


## Main整合交接更正

本次已整合PR25的0051–0077規格及歷史；上述「PR25尚未整合」只描述當時狀態。0078–0081衝突採用用戶要求重做的本分支spec，舊版交付紀錄僅供追溯，不再有效。0038–0040規格加上 `local_candidate_not_verified_against_drive`，不可拿本地候選作Drive舊卡來源證據。0041–0043來源缺口未解決。新Agent先讀交接文件，起點及完成量由用戶指定。生成大圖及AVIF依既有ignore不入Git。


## 0041–0043 JSON缺口已補（只記錄 Drive 實物，不虛構裁切）；0038–0040 已對 Drive 核實

用戶指示先補未解決缺口。本回合先把 Drive 目標資料夾 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up` 內 0038–0043 六張成品逐一用 connector 下載，核對 bytes／MD5（全部與既有紀錄一致）、AVIF 解碼 1024×1536，再逐張讀整卡、四個特徵圈、比較圓框及地圖。

- **0041 印緬斑嘴鴨、0042 中華斑嘴鴨、0043 綠頭鴨**：新增 `scripts/cards/info-restart-004{1,2,3}.json`，status `observed_from_delivered_drive_card_no_local_artwork`。內容只含實際可核實的東西：Drive file id／parent／bytes／MD5／本機 SHA256、卡上實際標籤（0041 頭喙·面部·白色翼羽·胸羽；0042 黃端黑喙·冠及眼紋·翼鏡及羽緣·胸羽；0043 雄鳥頭喙·白色頸環·雄鳥翼鏡·雌鳥頭喙）、比較鳥標籤、以及用 Natural Earth 110m 逐國遮罩量到的地圖綠色覆蓋。**`featureCrops` 一律不寫**（原裁切與素材不在 Git，寫出來就是編造），另設 `featureCropsUnavailable` 及 `neverUpload`。runtime 名稱／學名／六分照抄 `birds.json`、`birdTaxonomy.json`、`dexScores.json`；0043 仍只有 v／r 及 vEst，其餘待查保留。
- **0038–0040**：本地 JSON 改為 status `local_candidate_verified_labels_only_against_drive_card`，新增 `observedFromDrive`：卡上實際標籤、比較鳥標籤、地圖實測果、與本地候選的差異、`featureCropsUnverified`、`neverRenderOrUpload`。與 Drive 實物的差異已如實記錄：0038 卡上第 2 圈是「黃色額冠」（候選寫粉色胸）、第 3 圈「粉色胸」（候選寫灰色脅），地圖另填 NPL；0039 卡上兩比較圖是赤頸鴨及**赤膀鴨**（候選寫綠眉鴨／赤膀鴨）、地圖無 VEN／CUB；0040 卡上第二比較圖是**綠頭鴨雌鳥**（候選寫赤膀鴨）。
- **發現 0040 成品地圖全空**：地圖面板內 `#7da688` 綠色像素只有 159 個且全部屬標題文字抗鋸齒，任何國家多邊形都無填色（PHL 亦無）。即卡面寫「世界底圖・部分分佈國家／綠色非全境」但實際沒有填任何國家，屬已交付檔的實質瑕疵。**本回合沒有改寫或重新上載 0040**，因為原始 pixel／features 素材不在本環境，重畫等於以新圖冒充舊交付。此事留待用戶決定（可另行生成新 0040 並以新 hash 上載）。
- 六張都只做下載／解碼／讀圖，**沒有重新渲染、沒有上載、沒有覆蓋、沒有刪除**，UI／SW／R2／slim 註冊無改動。


## 0105–0108 已完成並上載（下一張 0109）

四張秧雞科長卡按 0105 灰腳秧雞、0106 斑脇田雞、0107 紅腳田雞、0108 小田雞次序完成：每種先看生成大圖再寫 spec，其後才渲染，逐張讀整卡及四個特徵圈才上載。

- **0105 灰腳秧雞**：栗紅頭胸、黑白腹橫斑、橄欖褐翼（折翼狀態，不代表飛行翼）、暗灰長腳。首輪第 3 圈為純紋理無翼形，改為取翼後緣及大覆羽輪廓後重渲染；第 4 圈由 `pixel.png` 腿趾位置取代過暗的 `features.png`。
- **0106 斑脇田雞**：冷褐頭頂、栗紅腹、翼覆羽橫斑、橙紅長腳。地圖為世界底圖部分國家（CHN RUS PRK THA LAO VNM KHM MMR MYS IDN BRN）。IUCN NT 近危；適應力 runtime 無分，維持待查，未以 IUCN 或 vEst 補值。第 4 圈改用全身圖腿位，避免 `features.png` 圓邊只剩腳尖。
- **0107 紅腳田雞**：灰黑嘴黃綠基、淡白喉、素色橄欖褐翼、紫紅大腳。`pixel.png` 為 1024×1536 直向，渲染時以 ImageOps.pad 保留全鳥；特徵圈全部以分數座標取樣，未混用像素座標。
- **0108 小田雞**：褐頰灰眉、褐色翼斑、黑白脅橫斑、黃綠長趾。第 4 圈前兩版腳趾被金框切斷，改框後四趾及爪完整入圈。

驗證：四張 AVIF 均解碼為 1024×1536 AVIF，bytes／SHA256 與 manifest、SHA256SUMS 一致，manifest `spec` 與 `scripts/cards/info-restart-01NN.json` 完全相同；四張地圖面板實測 `#7da688` 綠色像素 2240／6661／2147／8053（非空，無 0040 的空地圖問題）；特徵標籤測試 4 項通過。上載前 Drive 搜尋 `0105` 及 `0106/0107/0108` 均 0 命中，上載後回傳 parent 全為 `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`（`已上載R2`），bytes／MD5 與本機一致，未覆寫或刪除任何既有卡。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0105.avif | 1HdULqKOncyEmy4x_XwTPzYRPUCp7Q18X | 146439 | 388a3665b4441f2f8a0fc228a40a699f | 715885cb574626155c7d9a80f31a976a73e66bc2818e05f7ddc6e308a2f4a443 |
| 0106.avif | 18VuTPaMmra9m5vUDvJkjIx7iuOe-HMMu | 151790 | f00e7e51fa2fbbb59d65b69353318ba4 | 0b334b65d2126e605568d2d620674e3408892437cdcf4b1b9e42d276f604064c |
| 0107.avif | 1ST2c-VvuxFwISlmYAUeYgRIzQCEm7TVS | 147359 | 23318c0475508ebc34f2fade6eb88b93 | d6ce0d12de6a98a4fa0b8867ec8520e2c035f5ccedcc6135700caef7f148636b |
| 0108.avif | 1F8xXE1UIfXs1pdiTUrd-xlNFGZlEuNSs | 143332 | 14c0f9f434640977132d87cf7a80f14b | 63e819bc19e0a703089f2a36e2ed37a266aaface7669c61dbbde39ce5213311f |

0105 首次上載為較早一版特徵圈（file id `1OOJFhwPuc1JQ6AD-vHqw2eRIVntoszJK`，146439 bytes 前的 147663 版本），發現第 3 圈仍只看見羽毛紋理後已移至垃圾桶，改上載現版本；資料夾內現時每個編號只有一張。

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP，`a` 軸缺失仍顯示待查。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0109。


## 0109–0111 已完成並上載（下一張 0112）

三張鴴形目長卡按 0109 白鶴、0110 灰鶴、0111 大石鴴次序完成：每種先讀 HKBWS 內文，再生成大圖並**實際讀圖**核對羽色／嘴形，之後才寫 spec、渲染、逐張讀整卡及四個特徵圈，最後才上載。三個 spec 的 `featureCrops` 都是用圓形遮罩候選表（178px）反覆比對後才定的真值，不是憑猜。

- **0109 白鶴**：極危（CR）。紅臉、白身、腳紅；特徵圈為 紅臉長喙／白頸白身／翼後黑羽／紅色長腳。比較鳥 灰鶴 與 丹頂鶴。地圖俄羅斯東部至長江中下游越冬區，已標明不含香港偶發紀錄。
- **0110 灰鶴**：無危（LC）。黑臉白頸紋、頭頂紅斑、灰褐背翼、灰黑長腳；第 2 圈必須避免切到眼，第 4 圈取自 `pixel.png` 才包得住趾。
- **0111 大石鴴**：近危（NT）。巨大厚喙、黑白臉紋、沙褐背翼、淡綠長腿。首版 `pixel.png`／`features.png` 物種不符（畫成另一種石鴴），已重生成並重新核對：新圖為厚實上翹巨喙、眼後黑帶加白眉白頰、上身素色沙褐、淡綠腿帶瘤狀關節。第 3 圈曾用 0.58 寬框只看到羽毛紋理，收窄至 `[0.55,0.33,0.89,0.67]` 後可辨出背及折翼輪廓（折翼狀態，spec 已聲明不代表飛行翼色）。比較鳥用 石鴴（Burhinus oedicnemus）與 海濱石鴴（Esacus magnirostris），中文名以維基百科石鴴科條目核對。
- **環境說明**：本回合沙盒是全新 checkout，`/home/user/card-venv`、`~/.fonts`、`cards/art` 舊素材、`deliver/cards` 全部不存在。已重建 venv（Pillow + pillow-avif-plugin + numpy + fonttools）、由 Google Fonts 的 Noto Sans TC 可變字型用 fonttools 產生 `~/.fonts/NotoSansTC_{400Regular,700Bold}.ttf`、重新下載 `ne_110m_admin_0_countries.geojson`，並把比較鳥素材重新生成。0105–0110 的本地 render 不在這台機器，只有已上載的 Drive 成品仍在；本次沒有重渲染或改動它們。

驗證：三張 AVIF 均解碼為 1024×1536 AVIF；0111 bytes 138437、SHA256 `bf7391508c0ea40dca449d26383ef748c804c1be3e0d8b0b0d518f1e45f3531a`，與 manifest、SHA256SUMS 一致，`manifest.spec` 與 `scripts/cards/info-restart-0111.json` 完全相同，`missingScores` 為空；地圖面板綠色像素 2125（tol 10）非空；`test-slim-feature-label.py` 4 項通過；`git diff --check` 無問題。上載前 Drive 搜尋 `0111` 0 命中，上載後 parent 為 `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`（已上載R2），bytes／MD5 與本機一致，未覆寫或刪除任何既有卡。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0109.avif | 11DpOrMMzARxFwR5JbunR-1IFIrSlxPo1 | 129970 | bbff8445d4c61aa6a62f7b60cdcf03f0 | a4a27a364c4e7d9022d4fb49ce0054e3cc8eb70d03c38e51c54b321beef037e0 |
| 0110.avif | 1AS9jzIExhgY6RUvPEyqC0RpRwyapgx1 | 131267 | b59c88f4e3160dd290c5a634898702ce | 6df924a38e1887a6be109c2682a1922fe14b428a885ad0e05705482b0ba5afc8 |
| 0111.avif | 1ndDkhDwcP2aF0Oo8b98yMx-iH2a15G72 | 138437 | 77333da44f7616c406350d1ffe77cc8b | bf7391508c0ea40dca449d26383ef748c804c1be3e0d8b0b0d518f1e45f3531a |

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0112 黑翅長腳鷸（HKBWS 0080/009800 內文已讀：體長 33–36cm 不含腳、極長橙粉腳、黑白高對比、雌鳥背沾褐、幼鳥上體褐有淡羽緣及暗腳，HK 屬 passage/越冬/繁殖，2005/06 冬季後大增，最高 612 隻 2008-11-11）。

## 0112 黑翅長腳鷸 已完成並上載（下一張 0113 反嘴鷸）

- **0112 黑翅長腳鷸**（_Himantopus himantopus_，反嘴鷸科，IUCN **LC 無危**，趨勢上升）：HKBWS 0080/009800 內文（33–36cm 不含腳、極長橙粉腳、細直中長嘴、黑白高對比、雌鳥背沾褐、幼鳥上體褐有淡羽緣及暗腳、單型但分類有爭議、中國西北東北繁殖／華南越冬）。插圖示成年雄鳥。
- 特徵圈四輪才定稿：①長直細喙（`features.png` 頭部特寫，含紅眼）②黑冠白臉 ③黑白翼背（`pixel.png`，折翼狀態已在 spec 註明不代表飛行翼斑）④粉紅長腿。第 4 圈前幾版只框到脛部，最後改為 `[0.26,0.45,0.70,0.93]`，可見兩腿全長、膝關節及雙腳，才符合「粉紅長腿」。
- 比較鳥：反嘴鷸（上翹嘴、淡藍灰有蹼腳）與蠣鷸（粗厚橙紅嘴、短腳、粗壯），兩者皆為香港有紀錄的鴴形目，作辨識對照。
- 地圖：世界底圖 + 部分分佈國家 76 個（歐洲南部、非洲、中東、南亞、中亞、俄蒙、中日韓、東南亞、菲律賓），`bounds` 為全世界、免誤作區域裁切。
- 驗證：AVIF 解碼 1024×1536；bytes 130633、MD5 `04cd74451860583fca17b80500efbcdc`、SHA256 `33011cd4ac39e885f020858e0af595a1f9e507783ab350efcecf3f99e804a244`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0112.json`，`missingScores` 空；地圖綠色像素 10279。上載前 Drive 搜尋 `0112` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0112.avif | 1VXx26TSlPDdAd_mQvpsG7OkZrsHHei5R | 130633 | 04cd74451860583fca17b80500efbcdc | 33011cd4ac39e885f020858e0af595a1f9e507783ab350efcecf3f99e804a244 |

0113 反嘴鷸的 HKBWS 0080/009900 內文已讀：42–45cm、黑白羽色配長而上翹的細嘴、淡藍灰腳，雄鳥嘴較長較直、雌鳥頭部花紋有時較淡、幼鳥褐色；單型；西歐經黑海裏海至哈薩克、南西伯利亞、蒙古及中國繁殖，南歐、北非中非、中東及西南亞、華南越冬，東南非留鳥或遊蕩；中國東北西北繁殖、華南越冬（含海南台灣）；IUCN LC、趨勢未知；香港為 Deep Bay 大量越冬鳥（2008-01-13 最高 16,123 隻，2012/13 後回落至少於一半）。未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。

## 0113 反嘴鷸 未完成（生圖額度用盡，如實記錄）

- 已生成並實際讀圖核對：`cards/art/info-restart-0113/pixel.png`。內容為黑冠、黑色後頸、白臉白身、翼上兩道寬黑帶、細長而**向上翹**的黑嘴、淡藍灰腳（含蹼趾），與 HKBWS 0080/009900 描述相符（42–45cm、黑白羽色、上翹細嘴、淡藍灰腳、雄鳥嘴較長較直）。
- 尚未生成：`features.png`（頭／上翹嘴特寫）及比較鳥 **翹嘴鷸**（Terek Sandpiper，另一種上翹嘴但體型細小的鷸）。本回合 image generation 已達 10 張上限，兩個檔案不存在，因此**沒有寫 spec、沒有渲染、沒有上載 0113**，也沒有用 `pixel.png` 冒充特寫圈或憑空重建比較鳥。
- 已預備：`cards/art/info-restart-0113/black-winged-stilt.png`（由 0112 全身圖複製，作比較鳥用）及 `countries.geojson`。
- 下一回合先補 `features.png` 與 `terek-sandpiper.png`，再依第 4 步用圓形遮罩定四圈（草擬方向：上翹長嘴／黑冠白頸／黑白翼帶／藍灰長腳連蹼趾），然後渲染、讀整卡與四圈、上載。runtime 六分：i2 a3.3 v2.9 r3.3 c3 o2.9；IUCN **LC 無危**，趨勢未知；香港為 Deep Bay 大量越冬鳥（2008-01-13 最高 16,123 隻，2012/13 後少於一半，仍屬 Category I）。

## 0113 反嘴鷸 已完成並上載（下一張 0114 蠣鷸）

上一回合因生圖額度停在半途的 0113，本回合補齊素材後完成。HKBWS 0080/009900 內文（42–45cm、黑白羽色配長而上翹細嘴、淡藍灰腳、雄鳥嘴較長較直、雌鳥頭部花紋較淡、幼鳥褐色；單型；西歐經黑海裏海至哈薩克、南西伯利亞、蒙古及中國繁殖，南歐／北非中非／中東／西南亞／華南越冬，東南非留鳥或遊蕩；IUCN **LC 無危**、趨勢未知；香港 Deep Bay 大量越冬鳥，2008-01-13 最高 16,123 隻，2012/13 後少於一半）。

- **素材**：`pixel.png`（全身圖，上翹嘴、黑冠黑後頸、翼上兩道黑帶、藍灰蹼足）與 `features.png`（頭／上翹嘴特寫）均已生成並**逐張讀圖**核對；比較鳥 黑翅長腳鷸（沿用 0112 全身圖）與新畫的 翹嘴鷸（另一種上翹嘴的小型鷸）。
- **四圈反覆修正**：「上翹長喙」最難框——圓形裁切要求近正方形，初版用橫向長條框結果只剩一條黑線，多次以 200px 圓形遮罩測試後定為 `[0.1337,0.0818,0.6312,0.8998]`（取 `features.png` 上翹嘴的中段至嘴尖），現在圈內可清楚看到向上彎的黑嘴。「黑冠白頸」取頭頸直向特寫；「黑白翼帶」取全身圖折翼兩道黑帶；「藍灰長腳」取全身圖兩腿連脛跗關節。
- **地圖**：世界底圖 + 78 個部分分佈國家（歐洲、中亞、俄蒙、中國、中東、非洲、南亞、東南亞），並在 note 說明繁殖地與越冬地不分工。
- **驗證**：AVIF 解碼 1024×1536；bytes 127621、MD5 `6a05265444ca346862bbcbc016b8267b`、SHA256 `f8b67aed343e75b03c25c1df7e6a4494f5390d048d1aa19b99e03c29ac5e1f6a`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0113.json`，`missingScores` 空；地圖綠色像素 10370；`test-slim-feature-label.py` 4 項通過；`git diff --check` 無問題。上載前 Drive 搜尋 `0113` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致，未覆寫或刪除既有卡。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0113.avif | 1zRy6bjYA4-HQ_tb-WuvoCDzL1TQ1P3e5 | 127621 | 6a05265444ca346862bbcbc016b8267b | f8b67aed343e75b03c25c1df7e6a4494f5390d048d1aa19b99e03c29ac5e1f6a |

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0114 蠣鷸（HKBWS 0080/009700）。

## 0114 蠣鷸 已完成並上載（下一張 0115 灰斑鴴）

HKBWS 0080/009700 內文（40–48cm、粗壯黑白相間、成鳥上體頭胸全黑、下體白、橙至橙紅厚嘴、紅色眼圈、粉紅腳；第一年冬羽腳暗、嘴尖偏深、覆羽三級飛羽磨損帶褐；飛行時除白色腰、尾及初級次級羽基外全暗；香港鳥為 _H. o. osculans_，另有 _H. o. longipes_ 在新疆西北繁殖；分佈由冰島經歐洲至非洲西北沿岸、中東、印度沿岸、西俄羅斯及哈薩克至東北亞；IUCN **NT 近危、趨勢下降**；香港屬偶發 Category I，2000–2021 年僅數次紀錄，全部在 Deep Bay 泥灘）。

- **素材**：`pixel.png`（全身圖：橙紅厚鑿狀嘴、紅眼、全黑頭頸前胸、白腹、粉紅短壯腳）與 `features.png`（嘴及紅眼圈特寫）均已生成並**逐張讀圖**核對；比較鳥 黑翅長腳鷸（0112 全身圖）與 反嘴鷸（0112 比較鳥圖）。
- **四圈**：①橙紅厚喙（`features.png` 嘴部，整個舌面及鑿狀尖端入圈，但裁切時曾因 y 上界 1.0156 觸發斷言，改為 `[0.2148,0.3418,0.6576,0.9961]`）②紅眼圈黑頭 ③黑白分明（全身圖胸前黑／腹部白交界；前兩版只框到黑羽或切走白腹，最後用 `[0.362,0.4557,0.6354,0.7292]`）④粉紅壯腳（全身圖兩腿連脛跗，腳掌入圈）。
- **地圖**：世界底圖 + 73 個部分分佈國家（冰島、歐洲、北非沿岸、中東、南亞沿岸、俄哈、東北亞、東南亞），note 說明 _osculans_ 與 _longipes_ 的分工，且不分繁殖／越冬。
- **驗證**：AVIF 解碼 1024×1536；bytes 132729、MD5 `84c4f741994e438778e61fbc776da5d9`、SHA256 `abb3e5bd681f22fab67490bed238f75364fd53c2fd9ffd0421539191e95ce93e`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0114.json`，`missingScores` 空；地圖綠色像素 9883。上載前 Drive 搜尋 `0114` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0114.avif | 1uJWaCOcqLZqoLLnN4q5KxAZuirkynWtP | 132729 | 84c4f741994e438778e61fbc776da5d9 | abb3e5bd681f22fab67490bed238f75364fd53c2fd9ffd0421539191e95ce93e |

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0115 灰斑鴴（HKBWS Grey Plover，0080/010400，IUCN VU）。

## 0115 灰斑鴴 已完成並上載（下一張 0116 歐金鴴）

HKBWS 0080/010400 內文（26–29cm、香港最大鴴；非繁殖羽上體灰而羽端淡色、胸前灰、腹白；幼鳥帶皮黃色調但本地少見；飛行時黑色腋羽加明顯白翼帶；繁殖羽面及下體黑至泄殖孔，白色由額經眼上至胸側；哀怨哨音；全北界繁殖、全球熱帶及溫帶海岸越冬；中國為廣泛過境鳥，越冬於東南沿岸、海南、台灣及長江下游；三個亞種 nominate／_tomkovichi_／_cynosurae_；IUCN **VU 易危、下降超過 30%**；香港為**豐富越冬鳥**，絕大多數在後海灣泥灘，2016-03-13 錄得 881 隻）。

- **素材**：`pixel.png`（1024×1536 全身圖：銀灰斑駁上體、灰色胸前、白腹、粗黑直嘴、深灰腳，站在濕泥上）與 `features.png`（頭、眼、嘴特寫）均已生成並**逐張讀圖**核對；比較鳥 `pacific-golden-plover.png`（金黃褐色斑點、體小頭小）與 `common-ringed-plover.png`（橙黃短嘴黑尖、粗黑胸帶、橙黃腳）同樣逐張核對。
- **四圈**：①粗厚黑嘴（`features.png`，含嘴全長及鼻孔）②大眼圓頭（`features.png` 眼周幅面）③銀灰斑背（`pixel.png` 上體羽端斑駁＋白腹交界）④深灰長腿（`pixel.png` 兩脛跗連腳趾與泥面）。前三版 ③ 只框到上體或只框到白腹，最後用 `[0.3815,0.28,0.681,0.5794]`；④ 曾試三組窄框都只有兩條直線，改為 `[0.362,0.5404,0.6224,0.8008]` 連腳趾與泥面才可辨。
- **地圖**：世界底圖 + 115 個部分分佈國家（全北界繁殖帶、歐洲、非洲西部與南部海岸、中東、南亞、東亞、南北美洲海岸、澳洲與紐西蘭），註明三個亞種分工且不分繁殖／越冬。
- **驗證**：AVIF 解碼 1024×1536；bytes 138044、MD5 `cfca3818081578c525e6a3bc04340e73`、SHA256 `1326148e5d70c319b9246f78576145904bbda77bd40af6768cbb2405753ff3d7`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0115.json`，`missingScores` 空；地圖綠色像素 8562；`test-slim-feature-label.py` 4 項通過。上載前 Drive 搜尋 `0115` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0115.avif | 1KSP78FS_fVHJU5jhyTs7QLQYx9yVdiZb | 138044 | cfca3818081578c525e6a3bc04340e73 | 1326148e5d70c319b9246f78576145904bbda77bd40af6768cbb2405753ff3d7 |

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0116 歐金鴴（European Golden-Plover，_Pluvialis apricaria_，注意香港紀錄極少）。

## 0116 歐金鴴 已完成並上載（下一張 0117 灰頭麥雞）

HKBWS 0080/010200 內文（26–29cm、體型介乎灰斑鴴與太平洋金斑鴴之間；上體羽片深灰中央配金黃至淡白缺口羽緣；繁殖羽下體大面積黑、非繁殖期偏白；比太平洋金斑鴴略大而粗壯、頭較大、頸較長、腳較短；飛羽突出三級飛羽四枚但突出長度較短；飛行時腋羽及內翼下覆羽白色、腳趾不超出尾端；面部較素淨無明顯帽狀；幼鳥有稀疏淡灰胸側橫斑；單音哀怨哨音；**單型種**，繁殖於東格陵蘭、冰島至北歐亞直達 Khatanga 河，越冬西歐及地中海沿岸；中國河北、上海有紀錄，日本亦有；IUCN **LC 無危、趨勢上升**；香港 **Category I 偶發**，僅 2015-10-25 及 2018-10-14–11-11 兩次，均在米埔后海灣泥灘）。

- **素材**：`pixel.png`（1024×1536 全身圖：金黃斑駁上體、素淨面部、白腹、短黑嘴、短灰綠腳）與 `features.png`（頭、眼、短嘴特寫）均已生成並**逐張讀圖**核對；比較鳥 `pacific-golden-plover.png`（0115 已核對）與 `grey-plover.png`（由 0115 全身灰斑鴴複製，已核對）。
- **四圈**：①短黑嘴（`features.png`，含嘴全長及頭側）②大頭素臉（`features.png` 眼周，可見淡眉斑與無帽狀對比）③金斑上體（`pixel.png` 背羽金黃缺口斑）④短灰綠腿（`pixel.png` 兩脛跗連腳趾與泥面；先後試 `[0.3815,0.5729,…]`→`[0.308,0.58,…]`→`[0.37,0.58,0.618,0.8274]` 三版，最後一版兩腿在圈內比例最好）。
- **地圖**：世界底圖 + 64 個部分分佈國家（格陵蘭、冰島、全歐、北非、中東、中亞、西伯利亞至中國河北／上海、日本；另含哈薩克至蒙古的繁殖帶），註明單型種且不分繁殖／越冬。
- **驗證**：AVIF 解碼 1024×1536；bytes 145572、MD5 `f7a13c1e67aa409684e5f3f335bdd965`、SHA256 `459260a8080a51cfc9fcb07231b46c2de29959d9bea86be782f8c2675b8cfc14`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0116.json`，`missingScores` 空；地圖綠色像素 4715。上載前 Drive 搜尋 `0116` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0116.avif | 1o9YTGhRr2qPf5lq0V0slShiNg2B2EwSQ | 145572 | f7a13c1e67aa409684e5f3f335bdd965 | 459260a8080a51cfc9fcb07231b46c2de29959d9bea86be782f8c2675b8cfc14 |

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0117 灰頭麥雞（Grey-headed Lapwing，HKBWS 0080/010100）。

## 0117 灰頭麥雞 已完成並上載（下一張 0118 太平洋金斑鴴）

HKBWS 0080/010100 內文（34–37cm 大型長腳鴴，遠看樸素，只有黃嘴黑尖及黃腳最搶眼；上體冷灰褐、腹至尾下白、尾白而具寬黑次端帶；成鳥灰頭灰胸下有粗黑褐色胸帶、黃眼圈、紅眼；第一年冬羽頭及上體較暗褐帶淡羽緣、嘴腳暗淡、眼色深、冬季初期無明顯胸帶；飛行時上體呈褐白黑三色、翼下初級飛羽黑而次級及覆羽白、尾黑帶中央寬外側消失；受驚時叫聲響亮；越冬群高度集中錦田，昔日為水牛草田及尖鼻咀潮池、羅湖淡水沼澤，近年亦常見於塱原；主要出現期 10 月首週至 2 月第三週；最高單點 1982-01-27 新田 34 隻、2011-11-12 錦田 31 隻、1960-10-05 廈村 80 隻；**單型種**，中國繁殖區由東北中部向南至河北、黃河以南及長江泛濫平原南緣，西達青藏高原下游，亦繁殖於台灣，越冬於西南及南部沿海省份包括海南；遠東俄羅斯及日本亦有繁殖，越冬區含日本南部、中南半島大部分及印度北部；IUCN **LC 無危、趨勢下降**）。

- **素材**：`pixel.png`（1024×1536 全身圖：灰頭灰胸、黑胸帶、冷灰褐背、白腹、黃嘴黑尖、紅眼黃眼圈、鮮黃長腳站在草邊水畔）與 `features.png`（頭、眼、嘴及灰胸接黑帶特寫）均已生成並**逐張讀圖**核對；比較鳥 `northern-lapwing.png`（長而向上彎的黑色冠羽、綠紫金屬光澤、黑嘴、粉肉色腳）同樣逐張核對，第二比較鳥沿用 0115 已核對的 `pacific-golden-plover.png`。
- **四圈**：①黃嘴黑尖（`features.png`，整支嘴連黑尖入圈）②紅眼黃環（`features.png`，紅虹膜加黃眼圈清楚可見）③灰胸黑帶（`features.png` 灰胸接黑褐帶的邊界）④黃色長腳（`pixel.png`；先後試 3 版窄框只餘兩條黃線，最後用 `[0.3555,0.5508,0.6628,0.8581]` 讓脛跗、腳趾與草地同時入圈）。
- **評分**：runtime `dexScores` 完全沒有 0117 記錄，六軸及綜合全部保持**待查**，卡面顯示「綜合評分待查」及「待查非零分」，不補零、不估分。`missingScores` 因此列出全部六軸，屬預期。
- **地圖**：世界底圖 + 17 個部分分佈國家（中國、台灣、俄羅斯、日本、南北韓、印度、尼泊爾、不丹、孟加拉、緬甸、泰國、寮國、柬埔寨、越南、馬來西亞、巴基斯坦），註明單型種且不分繁殖／越冬。
- **驗證**：AVIF 解碼 1024×1536；bytes 143527、MD5 `e00be1a0c93773845d4a45a1866d9a6d`、SHA256 `5a9c9d5d84ac18db52dae6a44706911bffab51ab2eca2102461327aa98a1d9a4`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0117.json`；地圖綠色像素 3798。上載前 Drive 搜尋 `0117` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0117.avif | 1zjK3XiOB1KLJtXIxYhjh2yOzjwoVnRmS | 143527 | e00be1a0c93773845d4a45a1866d9a6d | 5a9c9d5d84ac18db52dae6a44706911bffab51ab2eca2102461327aa98a1d9a4 |

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0118 太平洋金斑鴴（HKBWS 0080/010300）。

## 0118 太平洋金斑鴴 已完成並上載（下一張 0119 鳳頭麥雞）

HKBWS 0080/010300 內文（Category I 常見過境鳥及大量越冬鳥；21–25cm，香港三種 _Pluvialis_ 中最小；所有羽色上體羽片深色而羽緣帶金黃至淡白缺口斑、腋羽及內翼下覆羽灰色；繁殖羽下體大面積黑，額帶皮黃或白色並向後繞過面頰及沿脅部延伸；秋季及初冬的成鳥與第一日曆年鳥上體斑紋較簡、下體無清晰縱紋或橫斑；非繁殖羽明顯比灰斑鴴亮麗而非偏灰，下體淡皮黃、腹至尾下白、面部金黃、眼後下方有一團擴散深色斑、頭頂有中等程度帽狀對比；幼鳥上體羽片整齊有缺口、胸前有褐色縱紋；飛行叫為急降的「tluuee」；絕大多數紀錄在后海灣泥灘，米埔及魚塘為度冬地，啟德及赤鱲角草地亦有，北新界以外最高 2002-09-10 船灣 200 隻；春秋均常見而春季較多，春季高峰為 4 月最後三週，秋季高峰為 10 月；后海灣越冬群自 2007/08 起多為 400 隻以上，最高冬季計數 2011-01-24 的 853 隻，全港最高 1992-04-13 的 900 隻；**單型種**，繁殖於北西伯利亞凍原由亞馬爾半島至白令海及阿拉斯加西部，南達堪察加及馬加丹，越冬於東非經印度、華南、東南亞至印尼及澳大拉西亞；中國為東半部及北疆過境鳥，越冬於南部沿海包括海南及台灣；IUCN **LC 無危、趨勢下降**）。

- **素材**：`pixel.png`（1024×1536 全身圖：金黃斑駁上體、金黃面部及深色帽、淡皮黃下體、短黑嘴、暗灰長腳站在濕泥上）與 `features.png`（頭、眼、短嘴及深帽特寫）均已生成並**逐張讀圖**核對；比較鳥 `european-golden-plover.png`（大頭長頸短腳、素淨面部、較粗壯）同樣逐張核對，第二比較鳥沿用 0117 已核對的 `grey-headed-lapwing.png`。
- **四圈**：①短黑嘴（`features.png`）②深帽金面（`features.png` 眼周，深色頭頂加金黃面部及眼後深斑）③金斑上體（`pixel.png` 背羽缺口斑；先誤用補邊後的座標令圈內只有一小片羽毛，改回原圖座標 `[0.3906,0.4232,0.6836,0.6185]`）④暗灰長腿（`pixel.png` 兩脛跗連腳趾，同樣先誤用補邊座標導致全空，已改正為 `[0.4199,0.6315,0.7129,0.8268]`）。
- **地圖**：世界底圖 + 49 個部分分佈國家（俄羅斯、阿拉斯加與加拿大、東非至南非、馬達加斯加、中東、南亞、東南亞、華南及台灣、日本、南北韓、蒙古、澳洲、紐西蘭及太平洋島國），註明單型種且不分繁殖／越冬。
- **驗證**：AVIF 解碼 1024×1536；bytes 142606、MD5 `e61437977b653dbf75d57e44c3d77412`、SHA256 `8919b91ae2f29648ff2231cd6d46fdcad9e51eb6e41b7e81fc9afef985b697d6`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0118.json`，`missingScores` 空；地圖綠色像素 6524；`test-slim-feature-label.py` 4 項通過。上載前 Drive 搜尋 `0118` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0118.avif | 1dGTvohuNHkrZJlnKXmC2xb5g_pD_qLS0 | 142606 | e61437977b653dbf75d57e44c3d77412 | 8919b91ae2f29648ff2231cd6d46fdcad9e51eb6e41b7e81fc9afef985b697d6 |

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0119 鳳頭麥雞（Northern Lapwing，HKBWS 0080/010000，IUCN NT）。

## 0119 鳳頭麥雞 已完成並上載（下一張 0120 蒙古沙鴴）

HKBWS 0080/010000 內文（Category I 空曠環境稀少越冬鳥、數量可能下降；28–31cm，深色頭頂加長而纖細的向上彎冠羽、黑白面紋、帶綠調的深色上體、橙皮黃尾下覆羽、粉紅腳；第一年冬羽上體羽端淡皮黃、冠羽較短；飛行時翼寬圓而翼端深色配白端、尾白而末端深色、下體白，外半翼極寬者為雄鳥；叫聲哀怨而略帶鼻音；紀錄多來自西北新界低地，尤其米埔，亦見魚塘、塱原及錦田，啟德／赤鱲角等地最多五隻；出現極不穩定，部分冬季完全無紀錄，數量高峰多隨冷鋒南下；最早秋季紀錄 1987-09-06，1999 年後主要出現期為 11 月首週至 2 月中，12 月上半月見高峰；最高計數 1992-11-21 的 126 隻及 1991-12-29 的 109 隻，均在東北季風寒潮後，其次 1976-02-06 的 40 隻；覓食靠聽覺或視覺，短跑幾步即停下聆聽或探啄；**單型種**，繁殖由西歐經斯堪地那維亞、東歐、俄羅斯及哈薩克至蒙古及中國東北，西歐族群就地越冬，其餘南下南歐、北非沿岸、伊朗、印度西北、華南、南韓及日本南部；中國繁殖於新疆及東北，越冬沿長江泛濫平原南至沿海包括台灣及海南；IUCN **NT 近危、趨勢下降且疑為中等速度**）。

- **素材**：`pixel.png`（1024×1536 全身圖：長而上彎冠羽、黑白面紋、金屬綠紫上體、白腹、橙皮黃尾下、粉紅腳站在濕草上）與 `features.png`（冠羽、面紋、眼色特寫）均已生成並**逐張讀圖**核對；比較鳥沿用已核對的 `grey-headed-lapwing.png`（0117）及 `pacific-golden-plover.png`（0115）。
- **四圈**：①上彎長冠（改用 `features.png` 的 `[0.6771,0.0879,0.9375,0.4785]`；先用全身圖框時圈內只有兩根幼線，冠羽太細太短，改由特寫圖裁切才看清上彎形狀）②黑白面紋（`features.png` 眼、白頰與深色過眼紋）③金屬綠背（`pixel.png` 肩羽的綠紫反光）④粉紅短腳（`pixel.png` 兩脛跗連腳趾與草地）。
- **地圖**：世界底圖 + 74 個部分分佈國家（全歐、俄哈、蒙古、中國、台灣、日韓、南亞、中東、北非），註明單型種且不分繁殖／越冬。
- **驗證**：AVIF 解碼 1024×1536；bytes 143579、MD5 `45041b55d532ca7b74b7e571bb3ad924`、SHA256 `a2d5118762c87146209e163abfb55d560584130eb7ea6230363ca9f7499ac7e9`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0119.json`，`missingScores` 空；地圖綠色像素 4576。上載前 Drive 搜尋 `0119` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0119.avif | 1dOlynd73axaXcMeK4nqUdcgD_vh9xlcD | 143579 | 45041b55d532ca7b74b7e571bb3ad924 | a2d5118762c87146209e163abfb55d560584130eb7ea6230363ca9f7499ac7e9 |

未改 UI／runtime／SW／R2／slim 註冊，無 ZIP。0038–0043 缺口狀態不變，0040 空地圖問題仍待用戶決定。下一張 0120 蒙古沙鴴（Siberian Sand-Plover，HKBWS 0080/011000b，IUCN EN）。

### 翻轉鍵為何在 0040、0105+ 看不到（2026-11 用戶回報）

用戶指出「1–100 明明已更新，但插圖翻不到詳細分佈／生態價值」。查明 app 的翻轉鍵不是靠 Drive 有沒有檔案，而是靠 `src/data/infoCards.json` 的 `ids` 白名單：

- 現時 `ids` 只有 **21 筆（0001–0021）**，`layouts` 只有 0001–0003，`panelColors` 3 筆。所以 0040 及 0105–0119 即使 Drive 有檔，`hasInfoCard()` 回 false → 右下角完全不出現 ⟳ 鍵，卡面只寫「按卡面 → 詳細資料」。
- 圖卡本體走 `aviandex/<NO>.avif`（`R2_BASE_URL` 或 `/api/card?folder=aviandex`）。代理白名單有 `aviandex`，所以只要 R2 上真有檔案，登記後即可讀。
- 本次會話依既定範圍**沒有**改 `infoCards.json`、沒有動 R2、沒有改 UI；Drive 只是交付位置（資料夾 `已上載R2` 名稱亦是歷史遺留）。因此「Drive 有 0001–0119」≠「app 可以翻」。
- 要真正讓 0040／0105–0119 可翻，需要兩步（待用戶指示）：①把這些 NO. 逐批加入 `infoCards.json` 的 `ids`、設 `layouts` 為 `slim`、補 `revisions`（如 `restart-0040-v1`）；②把同名 AVIF 放進 R2 的 `aviandex/`。缺任何一步都只會轉出「資訊圖卡暫時讀不到」。

## 0120 蒙古沙鴴 已完成並上載（下一張 0121 鐵嘴沙鴴）

HKBWS 0080/011000b 內文（Category I 春秋常見過境鳥、春季遠多於秋季、冬季稀少，主要在後海灣泥灘；18–21cm；與鐵嘴沙鴴的分別：體型較小較緊湊、嘴基部較淺而先端腫脹較少、嘴尖較鈍、眼較小、腳較短、多數腳偏灰、上體較深、覓食步態較規律；與青藏沙鴴非繁殖羽的分別：上體及耳羽較冷較深（令白額白喉更突出）、脇部有灰色斑駁、胸斑較大片常在中央相接、嘴較粗鈍、體態較笨重、腳較短較橄欖色；雄鳥繁殖羽胸前大面積栗紅、喉下常有窄黑邊、中下脇有不規則暗栗或灰色斑、額頭大面積白；雌鳥胸帶較窄而斷續、耳羽較褐；飛行叫為顫音；春季由 3 月初開始，4 月下半月高峰，6 月首週結束；秋季由 7 月最後一週開始；最高春季計數 1991-04-14 的 500 隻、1983-04-30 的 300 隻，本世紀 2020-04-12 的 281 隻及 2003-04-24 的 200 隻；本世紀最高秋季計數 2018-10-14 的 65 隻，對比歷史 1992-11-15 的 255 隻；1990 年代冬季后海灣曾達 150 隻，此後最高 2020-12-13 的 30 隻；自 1990 年代初春季、尤其秋季數量下降；不嗜蟹，主食蠕蟲及其他無脊椎動物；繁殖於西伯利亞東南部及東部由楚科奇南部與堪察加南至黑龍江泛濫平原，兩個亞種 nominate 與 _stegmanni_；IUCN **EN 瀕危**，因填海及互花米草入侵令泥灘消失而急速下降）。

- **素材**：`pixel.png`（1024×1536 全身圖：雄鳥繁殖羽，白額、栗紅寬胸帶配喉下黑邊、深灰褐上體、白腹帶淡栗斑駁、粗短黑嘴、灰綠短腳）與 `features.png`（頭、眼、嘴及胸帶特寫）均已生成並**逐張讀圖**核對；比較鳥 `greater-sand-plover.png`（較大較長腳、嘴長而先端粗鈍、淡沙褐上體）與 `tibetan-sand-plover.png`（暖沙褐上體、胸側分離黑斑）同樣逐張核對。
- **四圈**：①粗短黑嘴（`features.png` `[0.2811,0.3188,0.64,0.9564]`）②白額深耳羽（`features.png`）③栗紅胸帶（先誤用全身圖座標裁到空泥面，改用 `features.png` 的 `[0.5144,0.5526,0.7536,0.9777]` 才見到白喉—黑邊—栗紅三段）④灰綠短腳（`pixel.png`）。
- **評分**：runtime 只有 i2 a2.3 r4.8 c1.2 o2.6，`v`（觀賞）缺值保持「待查」，卡面已寫「待查非零分」；`missingScores` 為 `["v"]` 屬預期，沒有補零或重算綜合 2.6。
- **地圖**：世界底圖 + 47 個部分分佈國家（西伯利亞至東亞、南亞、東南亞、中東、東非、澳紐），註明兩個亞種且不分繁殖／越冬。
- **驗證**：AVIF 解碼 1024×1536；bytes 143970、MD5 `33221702e3d3d98e3c23ff193e98a599`、SHA256 `5c28d00c6ffa398e37b1d8756f41f97dab7353524176cfea4c9506e516af65ac`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0120.json`；地圖綠色像素 5024。上載前 Drive 搜尋 `0120` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0120.avif | 1428iD5d8ottHTt_6ynzmoqFvWlTSA-Sm | 143970 | 33221702e3d3d98e3c23ff193e98a599 | 5c28d00c6ffa398e37b1d8756f41f97dab7353524176cfea4c9506e516af65ac |

未改 UI 版面（只改翻轉鍵判定，見下節），無 ZIP、未動 R2。下一張 0121 鐵嘴沙鴴（Greater Sand-Plover，HKBWS 0080/011100）。

### 翻轉鍵改為「有圖就給翻」（2026-11 用戶指示）

用戶指出 0022–0100 早已上載 R2，但 0040 等卡連翻轉入口都沒有，要求「沒有圖才不給翻，有圖就可以翻，方便檢查」。已改：

- `src/lib/infoCards.ts` 新增 `canFlipInfoCard()`：除 `KNOWN_ABSENT` 名單外一律可翻；`hasInfoCard()` 只保留「是否已登記／套哪個模板」的意義。
- `src/lib/mobileInfoPages.ts`：`mobileCardPages(id, infoAvailable)` —— 已登記 slim 走五頁；已登記舊版或**未登記但已成功讀到圖**走「插畫 + 完整資訊卡」；兩者皆否才只有插畫，避免每次點圖翻出空頁。
- `src/components/FlipCard.tsx`、`PokedexDevice.tsx`：翻轉掣改用 `canFlipInfoCard`；背面讀不到時明文寫「這張卡還未上載資訊圖卡」＋編號，不再含糊說「暫時讀不到」。
- `src/components/InfoCardReader.tsx`：手機只有插畫一頁時，點一下會先探測 R2，讀到就自動多出「完整資訊卡」一頁（結果會快取，不會重複打 404）。
- `src/data/infoCards.json`：`ids` 仍以 0001–0003 為起點（slim 分區只給已確認座標的卡與 0105+ 新批次），但已不再是翻轉閘門。0022–0100、0040 這類「Drive/R2 有檔、名單未更新」的卡，現在都翻得到。
- 測試：`tests/infoCardReader.test.mjs` 新增 canFlip 與 `mobileCardPages('0040', true)` 的斷言；全套 `node --test tests/*.test.mjs` 157 pass、`tsc -b` 通過。

仍未做的事（需要你決定）：把 0022–0104 逐張加入 `layouts` 的 slim（手機分區座標要逐張確認，硬套會裁錯位），以及確認 R2 上實際有哪些檔 —— 這個 sandbox 連不到 `r2.dev`，無法代為驗證。

### 手機分頁：0001–0120 全部切四頁（2026-11 用戶回報「現在能翻了，但沒有把他們 CUT 成 4 頁」）

用戶回報：翻得到圖卡之後，只有 0001–0004 真的切成「插畫／四部位／能力值／分佈圖／易混鳥」，
其餘 0040、0105+ 一翻就直接整張 A4 卡。原因是 `src/data/infoCards.json` 的 `layouts` 只有
0001–0003 + 0105–0119 登記為 `slim`，其餘全部當成舊版卡，只給「插畫 + 完整資訊卡」兩頁。

- **已確認前提**：`scripts/cards/info-restart-0001.json` … `info-restart-0120.json` 共 117 張
  全部是 `layout: slim`、`size: 1024×1536`、`featureCrops` 四格齊（0041–0043 除外，見下）。
  即是同一套 compose-card.py 版面，分區座標固定：四部位 `[36,36,952,624]`、
  分佈圖 `[36,1186,504,314]`、易混鳥 `[556,1186,432,314]`。所以登記為 slim 不會裁錯位。
- `src/data/infoCards.json`：`ids`／`layouts`／`revisions` 擴展到 **0001–0120 全部 120 張**，
  `revisions` 一律 `restart-NNNN-v1`（配合 R2 快取版本，`infoCardUrl()` 會帶 `?v=`）。
- `panelColors`：120 張全部 `#173446`，即卡面深藍底色，翻頁時 letterbox 不會露出舊的米色。
- **例外 0041–0043**：這三張的 spec 是從已交付的原圖反推，`featureCropsUnavailable: true`，
  沒有可信的四部位座標。新增 `hasFeatureCrops()`：這三張仍然登記 slim（能力值／分佈圖照切），
  但「四部位」與「易混鳥」兩頁改用完整資訊卡，寧可少切一頁，也不要裁到錯位。
- 測試：`tests/infoCardReader.test.mjs` 新增「0001–0120 全部登記 slim」與 0041 的五頁排列斷言；
  `tests/cardImage.test.mjs`、`tests/mobileCardInteractions.test.mjs` 改為預期 `?v=restart-0004-v1`。
  全套 `node --test tests/*.test.mjs` **158 pass / 0 fail**，`tsc -b` 與 `npm run build` 通過。
- 未改：翻轉鍵判定、R2、SW、後端代理；沒有重新上載任何已交付的 AVIF。

### 0121–0123 的 spec 與日誌（重建記錄）

0121 鐵嘴沙鴴、0122 環頸鴴、0123 白臉鴴 三張**已逐張核對並上載 Drive**（見下表），
但當時那條分支的 PR 已合併、推送被封鎖，spec 與該段日誌沒有落到 `main`，
新分支由 `b454373` 開出後只剩 0120 為止。三張卡的 Drive 檔案不受影響；本節保留必要事實，
避免日後重做時對不上：

| 卡 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0121.avif | 1WXAhTy2RI5N2N65nPxi_3bFEZb4-h5GO | 138678 | b8f4a14ce025c0711a8ce0e7254640fb | bdc403ab892ada5eec79af05b975dec6b831fd5b991edfe425c4d165c67702d4 |
| 0122.avif | 1bHMmiLCT6E29uOYPVo6_ctlpnBg8wNZA | 150347 | 88b354566d396b80224b917279baa6a4 | 655656caebd00e85de5af94c4d74f0b02f5c3c64a23817730c3c1247cf40d9c3 |
| 0123.avif | 1N4G73APc50BK7xDB3Y2a-saDqZhDAVsn | 148788 | a92b6ca1f54690ba72bdc533614ccfa0 | d1c5018a98d50091271098f8090209c2e2fa018e15aa4b1ee97ad1804c9c0e7d |

- 0121 四圈：①長嘴腫端（features）②黑面罩（features）③橙紅胸 ④黃色長腳（pixel，
  `(x+256)/1536` 換算）；目錄 `already verified`，分數 `missingScores: ["v"]`。
- 0122 四圈：短黑嘴／黑眼紋／白頸環／胸側黑斑；比較鳥白臉鴴、金眶鴴；`missingScores: ["v"]`。
- 0123 四圈：鈍厚嘴／廣泛白臉／橙黃頭頂／短胸斑；比較鳥環頸鴴、金眶鴴；`missingScores: ["i","c"]`。
- 三張都是 1024×1536 AVIF、世界底圖加「綠色非全境；非完整分佈」、單檔上載、無 ZIP。
- **若要重出**：插圖需重新生成（`cards/art/` 不入 Git），三張的裁切框已在本節與各卡 manifest 記錄；
  重新渲染前必須先讀圖確認圈內真的見到該部位，不可照抄分數重算綜合值。

## 0124 青藏沙鴴 已完成並上載（下一張 0125 劍鴴）

HKBWS 0080/011000a 內文（Category I 稀少冬候鳥及春秋過境鳥，主要在后海灣潮間帶泥灘；與鐵嘴沙鴴先看結構：較小、比例較整齊、嘴基較淺而先端不腫脹、嘴尖較鈍、眼較小、腳較短；多數腳偏灰、上體較深，覓食為較規律的走走停停；與蒙古沙鴴之別：上體及耳羽較暖較淡、脇部乾淨無灰斑、胸斑較小不在中央相接、體態較輕盈、腳較長而不那麼橄欖色；繁殖羽成鳥較淡、胸前較橙，雌鳥胸前橙皮黃而耳羽不比頭頂深；幼鳥額淡與褐色頭頂漸變、覆羽及肩羽羽緣較暖、脇部較乾淨、胸斑不於中央相接、腳與嘴比例較長；飛行叫為顫音，與鐵嘴沙鴴極相似；南遷高峰在 7 月及 8 月初，近年少量留在香港越冬；繁殖於喜馬拉雅山北及東的高原地區，東至蒙古最南、西至帕米爾，三個亞種 `pamirensis`、`atrifrons`、`schaeferi`；IUCN **LC 無危、趨勢不明**）。

- **素材**：`pixel.png`（1024×1536 全身圖：深色前額帶穿過眼部、眼後白斑、橙褐胸漸淡成白腹、上體暖沙褐、腳偏灰）與 `features.png`（1536×1024 頭胸特寫：深色前額、眼周、喉部淡皮黃、上胸橙褐）均已生成並**逐張讀圖**核對；比較鳥 `greater-sand-plover.png`（較大、嘴長而先端腫、腳長偏黃）與 `siberian-sand-plover.png`（上體較冷較深、脇部有灰斑、胸斑較闊、腳短偏橄欖）同樣逐張核對。
- **四圈**：①淺基短嘴（`features.png` 嘴部）②黑色前額（`features.png` 前額與眼周）③橙褐胸帶（`pixel.png` 橙胸—白腹交界）④灰色短腳（`pixel.png` 兩條脛跗連腳趾與泥面）。第 3、4 圈第一次誤用 `x/1536`（pixel.png 實際 1024 寬）令圓圈整體偏左、圈內只有背景，改回 `x/1024` 後逐圈重新讀圖確認；第 4 圈先後試了五個框，最後用 `(400,920)-(700,1220)` 才同時見到兩腳與腳趾。
- **評分**：`src/data/dexScores.json` 完全沒有 0124 紀錄，六個值全部「待查」，卡面顯示「綜合評分待查」與「？」；`missingScores` 為全部六項，**沒有補零、沒有自行估算**。這是本批第一張完全無分數的卡，之後如要補分數需另建記錄，不可在渲染器裡硬寫。
- **地圖**：世界底圖 + 38 個部分分佈國家（中亞、青藏高原、南亞、東南亞、東亞、中東、東非），註明三個亞種且繁殖／越冬不分工；Natural Earth 110m 無 `MDV` 多邊形故未列。
- **驗證**：AVIF 解碼 1024×1536；bytes 144455、MD5 `7d1b95040cf2e540b3aba77654c6565b`、SHA256 `09a8f5014723f2485a33207edfa79180da52c79ddb9d9d58e5fb8ebcc014195f`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0124.json`；地圖綠色像素 4329。上載前 Drive 搜尋 `0124` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0124.avif | 1oOc-5f-pGK4y2u4jT4_PvAnlRG27pKku | 144455 | 7d1b95040cf2e540b3aba77654c6565b | 09a8f5014723f2485a33207edfa79180da52c79ddb9d9d58e5fb8ebcc014195f |

未改 UI 版面、無 ZIP、未動 R2。下一張 0125 劍鴴（Common Ringed Plover，HKBWS 0080/010500，IUCN LC、趨勢下降；17–19cm，腳橙、嘴基橙、飛行有白翼帶、無黃眼圈）。

## 0125 劍鴴 已完成並上載（下一張 0126 長嘴鴴）

HKBWS 0080/010500 內文（Category I 稀少冬候鳥；17–19cm；與金眶鴴之別：腳稍長而暗橙、嘴較粗而基部有橙色（可被泥遮）、眼後及眼下深色範圍較大、飛行時有明顯白翼帶、無黃色眼圈，繁殖羽胸帶較闊較深；幾乎只在潮間帶泥灘；典型叫聲為二音節帶轉調的「poo-eep」；1979-04-14 首次紀錄，1991 年再現，疑為同一隻直至 1999 年；2000–2012 年四個冬季有紀錄，之後無；極端日期 9 月 24 日至 4 月 14 日，但多數在 10 月 21 日至 3 月 14 日；繁殖於北極圈以北，由加拿大東北、格陵蘭、冰島橫跨歐亞北部至白令海，越冬主要在撒哈拉以南非洲、中東及印度部分地區；三個亞種，香港相信為 `C. h. tundrae`；IUCN **LC 無危、趨勢下降**）。

- **素材**：`pixel.png`（1024×1536 全身圖：完整黑色胸帶、白喉、黑眼罩、橙基嘴、橙腳）與 `features.png`（1536×1024 頭胸特寫）均已生成並**逐張讀圖**核對；比較鳥 `little-ringed-plover.png`（黃眼圈、全黑細嘴、窄胸帶、淡黃腳）與 `kentish-plover.png`（無完整胸帶、兩側小黑斑、黑腳、橙棕後頭）同樣逐張核對。
- **四圈**：①橙基粗嘴（`features.png` 嘴部，橙基與深色嘴尖都在圈內）②黑眼罩（`features.png`，第二版把眼部移正，原本鼻樑佔了半個圈）③完整胸帶（`pixel.png` 胸前黑帶橫過整個前胸、上白喉下白腹）④橙色長腳（`pixel.png` 兩條橙腳連腳趾）。
- **評分**：runtime 六項齊（i2.0 a2.8 v3.0 r4.8 c1.2 o2.8），`missingScores` 空，卡面不再有「待查非零分」註腳，綜合 2.8、四星中的三星。
- **地圖**：世界底圖 + 80 個部分分佈國家（北美東北、格陵蘭、冰島、全歐、俄哈蒙、中東、全非洲、南亞），註明三個亞種且繁殖／越冬不分工；Natural Earth 110m 無 `MUS`／`SYC` 多邊形故未列。
- **驗證**：AVIF 解碼 1024×1536；bytes 144389、MD5 `847176b37931a184227490f8c9accfdb`、SHA256 `fb6c7750ee5310a63cea96ebb82fd9e7c9834d5735cf1d5e197f8541d9c52392`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0125.json`；地圖綠色像素 6367。上載前 Drive 搜尋 `0125` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。
- `src/data/infoCards.json` 同步加入 `0125`（slim、`restart-0125-v1`、`#173446`），令新卡一上載就可以在 app 切成五頁。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0125.avif | 13KK0Wcsr4AgWCphzUack3bUBtOR0BN_U | 144389 | 847176b37931a184227490f8c9accfdb | fb6c7750ee5310a63cea96ebb82fd9e7c9834d5735cf1d5e197f8541d9c52392 |

下一張 0126 長嘴鴴（Long-billed Plover，*Thinornis placidus*，HKBWS 0080/010600，IUCN LC、趨勢下降；18–21cm，比金眶鴴大、嘴長腳長翼長、耳羽及眼先永遠褐色、成鳥額上有寬黑帶、飛行內翼白帶明顯、尾白而末端有黑色亞端帶；runtime 分數只有 a3.3 v1.0 r1.0 o1.8，i 與 c 待查）。

## 0126 長嘴鴴 已完成並上載（下一張 0127 金眶鴴）

HKBWS 0080/010600 內文（Category I 稀少冬候鳥；18–21cm；比金眶鴴明顯較大、嘴長腳長翼長；耳羽及眼先永遠褐色；成鳥多在白色額上有一道寬黑帶，第一年冬羽換羽後才出現；飛行時內翼白帶明顯；尾白色而末端有黑色亞端帶；第一年冬羽上體及翼覆羽有明顯淡色羽緣、頭部無黑色、腳暗淡；鹹淡水生境都有紀錄，包括淡水沼澤、潮汐河道及乾塘魚塘；紀錄集中 12 月 5 日至 3 月 20 日（1994 錦田 2 月 20 日至 3 月 20 日、1998 白泥 1 月 30 日、1999 米埔村附近 12 月 5 日、2014 錦上路 1 月 9 日至 2 月 23 日、2015 落馬洲 2 月 4–27 日）；**單型種**，繁殖於烏蘇里、中國東北及中北部與日本，越冬於南韓、華南西至尼泊爾、東南至中南半島北部；IUCN **LC 無危、趨勢下降**）。

- **素材**：`pixel.png`（1024×1536 全身圖：長黑嘴、褐色眼先與耳羽、褐灰胸帶、長淡黃腳、站河灘卵石）與 `features.png`（1536×1024 頭胸特寫）均已生成並**逐張讀圖**核對；比較鳥 `common-ringed-plover.png`（由 0125 已核對的劍鴴圖改用，嘴短橙基、黑眼罩、闊黑胸帶）與 `little-ringed-plover.png`（0125 已核對：黃眼圈、全黑細嘴、窄胸帶、短腳）。
- **四圈**：①長黑嘴（`features.png`，把框移到 `(90,330)-(610,850)` 才整條嘴連嘴尖入圈，首版只見到嘴的中段）②褐色眼先（`features.png`，第二版把眼部移正，首版切到嘴基）③褐色胸帶（`pixel.png` 的 `(200,440)-(520,760)`，圈內見到白喉—褐帶—白腹三段；試了四個框才對位）④長淡腳（`pixel.png` 兩條淡黃長腳連腳趾與卵石）。
- **評分**：runtime 只有 a3.3 v1.0 r1.0 o1.8，`i`（重要性）與 `c`（保育）缺值列「待查」，`missingScores` 為 `["i","c"]`，綜合 1.8、三星；沒有補零或改寫綜合分。
- **地圖**：世界底圖 + 21 個部分分佈國家（俄遠東、中國、蒙古、日韓、台灣、南亞、中南半島、東南亞），依 HKBWS「繁殖烏蘇里／中國東北／日本，越冬南韓至中南半島」而定，註明單型種、繁殖／越冬不分工。
- **驗證**：AVIF 解碼 1024×1536；bytes 142861、MD5 `2466597724eaab1d1f2a3cb5eb28a869`、SHA256 `7c61d70878e232d8cfb334f8bceabf3308c32d62cd8629e602492189dae8e7d7`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0126.json`；地圖綠色像素 4000。上載前 Drive 搜尋 `0126` 0 命中；上載後 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，bytes／MD5 與本機一致。已同步加入 `src/data/infoCards.json`（slim、`restart-0126-v1`、`#173446`）。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0126.avif | 1pOFKxKMJfTrmMDAfCzwP_-TrNCwnVKpV | 142861 | 2466597724eaab1d1f2a3cb5eb28a869 | 7c61d70878e232d8cfb334f8bceabf3308c32d62cd8629e602492189dae8e7d7 |

下一張 0127 金眶鴴（Little Ringed Plover，HKBWS 0080/010700，IUCN LC、趨勢穩定；14–17cm，全年可見、主要秋過境及冬候鳥，亦有小量繁殖；眼圈黃、頭部黑紋明顯、嘴全黑、腳淡；曾錄 340 隻（1985-01-13）、2010/11–2020/21 冬季不超過 125 隻）。

## 修正 0041–0043 手機分頁：由「整張卡」改回五頁裁切；新交付 0128 東方鴴

用戶回報「其他都切割好了，但 40–43 的確出現問題了，會出現全圖卡在那 5 頁當中」。排查後確認 **問題在分頁邏輯，不在卡本身**。

### 0041–0043 診斷

- 先把 Drive 上 0040–0043 四張成品重新下載（bytes／MD5 全部與既有紀錄一致）並解碼：四張都是 1024×1536 AVIF，正常。
- 逐張量邊框位置：地圖／易混鳥模組外框落在 **x 41–987、y 1191–1499**，四部位圓圈落在 **y 432–660**，與 `compose-card.py` 的 slim 分區（map `36,1186–540,1500`、similar `556,1186–988,1500`、feature row `432–660`）完全吻合。
- 結論：三張卡一直都是標準 slim 版式，`SLIM_PAGE_BOXES` 的 viewBox 本來就對得準。真正的 bug 是 `infoCards.ts` 把「這三張沒有本機 spec 的 `featureCrops`」誤當成「卡上沒有那個分區」，於是 `mobileCardPages()` 把「四部位」「易混鳥」兩頁換成 `original`（整張長卡），用戶就在那兩頁看到整張卡被塞進一個面板。
- 缺的是「重新生成這張卡」所需的裁切座標，不是「顯示這張卡」所需的座標。

### 修正

- `src/lib/infoCards.ts`：`hasFeatureCrops()` 不再排除 0041–0043，改為只要有序號就 true；同時把上面量到的實際數據寫進註解，解釋兩件事不要混為一談。刪除 `NO_FEATURE_CROPS`。
- `src/lib/mobileInfoPages.ts`：`mobileCardPages()` 簡化為「已登記 + slim + 有分區座標 → 五頁」，移除臨時把兩頁換成 `original` 的分支。
- 測試：`tests/infoCardReader.test.mjs` 逐張鎖住 0040–0043 必須是 `['artwork','features','scores','distribution','similar']`（連 `infoAvailable=true` 也不可多加 `original` 頁）；`tests/mobileCardInteractions.test.mjs` 新增 0041 的 DOM 測試，逐頁點過去，確認 `features`／`distribution`／`similar` 出的是 `svg[data-mobile-info-panel]` 裁切面板，且一定不會出現 `[data-original-info-card]`。
- 全套 `node --test tests/*.test.mjs`：160 項，159 pass、0 fail、1 skip；`tsc -p tsconfig.app.json --noEmit` 無錯。

### 0127 金眶鴴補記

0127 上一輪已上載到 Drive（`1bNJhfMuWUuZyqI4y9kfQExzJJMfXZFR6`，144327 bytes，MD5 `82fdb27aa23bd49b2bff66e7b0bf8e43`），但它的素材與製作 spec 只存在於已合併分支的 ignored 資料夾，隨分支結束而失去。本回合重新由 Drive 下載成品核對（bytes／MD5／SHA256 全部與上輪紀錄一致，AVIF 解碼 1024×1536），逐張重讀整卡、四圈、地圖與兩個比較圓，補寫 `scripts/cards/info-restart-0127.json`，狀態 `observed_from_delivered_drive_card_no_local_artwork`：**不寫 `featureCrops`（沒有原始素材就是編造）**，另設 `featureCropsUnavailable` 與 `neverUpload`，只記錄卡上實際可見的標籤、比較鳥名稱與 85 個 ISO3 綠色範圍。同時把 0127 登記進 `src/data/infoCards.json`（slim、`restart-0127-v1`、`#173446`），令它與其他已交付卡一樣切五頁。

### 0128 東方鴴 已完成並上載

HKBWS 0080/011200 內文（Category I 過境遷徙鳥，短草及其他開闊旱地、后海灣一帶；春季稀少、秋季罕見；22–25cm；繁殖羽雄鳥頭頸近白、後冠褐色、上胸鏽橙而下緣轉黑；高挑、長腳、長翼、優雅，腳黃橙、嘴相對細長；雌鳥及幼鳥頭胸褐黃、眉紋淡、後冠深、腳暗淡，兩者上體都有淡色羽緣而幼鳥更寬；飛行時發出中高音「chip」；1998 年前約 85% 紀錄來自啟德及赤鱲角機場，現多見於新界北部低地，由林村經錦田、尖鼻咀到米埔及附近魚塘，以及落馬洲河套生態改善區；偏好短草，亦見於淡水沼澤；春季主要 3 月下半月至 4 月上半月，最早 2006-03-05、最遲 1978-06-02，最高 18 隻（2000-03-22 赤鱲角）及 11 隻（1979-03-28 啟德）；秋季主要 9 月下半月至 10 月第一週，極端日期 2017-08-27 及 1978-10-27，最高 28 隻（1979-09-24 啟德）；一般不見於潮間帶泥灘；**單型種**，繁殖由南西伯利亞經蒙古至中國東北，越冬於澳洲西北部；IUCN **LC 無危、趨勢未知**）。

- **素材**：`pixel.png`（1254×1254 正方形 16-bit pixel art：淡白頭頸、褐色後冠、鏽橙上胸帶黑邊、淡褐上體、黃橙長腳、旱地短草）與 `features.png`（1536×1024 頭胸特寫）均逐張讀圖核對；比較鳥 `golden-plover.png`（太平洋金斑鴴，金斑黑背、白側帶）與 `sand-plover.png`（鐵嘴沙鴴，粗長嘴、淡綠灰長腳、栗褐胸帶）同樣逐張核對。首版 pixel 是 1024×1536 直幅，補成正方形後出現平色天空邊条，改成正方形重生成後正常。
- **四圈**：①淡白頭頸（`features.png`，額及眉紋淡白對比褐色後冠）②細長嘴（`features.png`，整條嘴連嘴尖入圈）③鏽橙上胸（`features.png`，鏽橙帶連下緣黑邊）④黃橙長腳（`pixel.png`，兩條黃橙腳連腳趾與爪）。
- **評分**：runtime 六項中只有 v（觀賞）缺值，`missingScores` 為 `["v"]`，卡面保留「待查非零分」註腳；綜合 2.9、三星。
- **地圖**：世界底圖 + 29 個部分分佈國家（俄羅斯、蒙古、中國、日韓台、澳洲、東南亞、南亞、中亞），依 HKBWS「繁殖南西伯利亞／蒙古／中國東北，越冬澳洲西北部」而定，註明單型種、繁殖／越冬不分工。
- **驗證**：AVIF 解碼 1024×1536；bytes 154902、MD5 `e6e7c0cfcf0ea17072312258fb965a7c`、SHA256 `94cf696e376f2df5b6e200abacb9c659cc956337b6bc918b0b130abe6ba082f3`，manifest／SHA256SUMS 一致，`manifest.spec` == `scripts/cards/info-restart-0128.json`；上載前 Drive 搜尋 `0128` 0 命中；上載後 `get_file` 核實 parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`、bytes／MD5 與本機一致。已同步加入 `src/data/infoCards.json`（slim、`restart-0128-v1`、`#173446`）。

| 新交付 | Drive ID | bytes | MD5 | SHA256 |
| --- | --- | ---: | --- | --- |
| 0128.avif | 1GN3dHBcLncrhN2bbLt_Y0JUzGWIToEFI | 154902 | e6e7c0cfcf0ea17072312258fb965a7c | 94cf696e376f2df5b6e200abacb9c659cc956337b6bc918b0b130abe6ba082f3 |

未改 UI 版面、無 ZIP、未動 R2。下一張 0129 彩鷸（Greater Painted-Snipe，*Rostratula benghalensis*）。

## 0040 分佈圖修復 + 0129／0130 交付（同一輪）

### 0040 分佈圖空白 — 已修好並重新上載
- 量測：舊 `0040.png` 地圖格 (44,1194)–(532,1492) 內綠色像素只有 **10**（正常卡如 0128 有 4570），色盤只剩底圖，即整塊面板內容在原圖已缺失，不是座標或投影錯位。以 `PHL` 單獨重繪同格作對照，綠色落在 x 402–415 / y 74–88（78 px），與 Natural Earth 幾何吻合。
- 修正：重繪該格（世界底圖 + 菲律賓綠色 + 黃框放大插圖，保留「世界底圖・部分分佈國家／綠色非全境；非完整分佈」字樣），只貼回同一座標，其餘版面完全未動。
- 交付：新檔 `0040.avif` = Drive `1A7FRUEvcEprDHt_msPXngKVSkfwAQ7Fp`，146944 B，MD5 `a854ff4a20d3f2abd63ccd4b14a8f726`（本機與下載檔 MD5 一致，卡內綠色像素 16185）。舊檔 `1j5yRRDvKZ1H83jKFiaqWrfIEu2VOBq6W` 已標記作廢並移入垃圾桶，檔名加註「已作廢 — 分佈圖空白」，避免兩個同名檔案混淆。
- 教訓：只放大單一國家仍不夠看（世界尺度下菲律賓僅約 14×15 px）；大量分佈圖需要放大插圖框，0041–0043 日後比照處理。

### 0129 彩鷸 Rostratula benghalensis
- 主圖繪**雄鳥**（羽色較暗淡、孵卵育雛的一方）；雌鳥黑冠白臉栗胸金斑更鮮，已在 notes 註明。
- 四部位：白眼圈及眼後白帶／白色肩帶／金斑翼羽／淡黃腳；比較鳥 水雉 + 沙錐。
- 15 個 ISO3（亞洲族群）；HKBWS 記載撒哈拉以南非洲留鳥族群刻意不上色，notes 已寫明。
- Drive `1BK--nxBbgKyia2CqSke8_nXn4scBHXU6`，174277 B，MD5 `b17105fc437ece9dc767c2ec5b25a469`。

### 0130 水雉 Hydrophasianus chirurgus
- 繁殖羽主圖：白頭白前頸、金黃後頸、黑色胸腹、特長腳趾、雉狀長尾。
- 四部位：金黃後頸／白頭白前頸／特長腳趾／雉狀長尾；比較鳥 彩鷸 + 白胸苦惡鳥。
- 17 個 ISO3（東阿富汗至東南亞、華南、台灣；HKG 不在底圖圖層，故不列）。
- Drive `1ndzbMzmz0jTurQcLUM_Onxltaysj4vlX`，174263 B，MD5 `c8feea36d76dc763d5b960db2e3ec1df`。

兩張卡均已登記 `src/data/infoCards.json`（slim、revision `restart-01NN-v1`、面板色 `#173446`）；只交付單一 AVIF，無 ZIP。

### 0131 中杓鷸 — 進行中（未交付）
- 已完成並核對：`pixel.png`（全身，頭部縱紋、下彎且下喙有折角的嘴、藍灰腳）、`features.png`（左全身／右特寫）、`curlew.png`（白腰杓鶌比較鳥）。四部位裁切框已驗：頭部縱紋／嘴形／翼覆羽／藍灰腳。
- 本輪 `generate_image` 額度已滿（10/10），**尚缺第二隻比較鳥 小杓鷸 `little-curlew.png`**，因此未寫 spec、未 render、未上載。
- 下一輪第一步：生成 `cards/art/info-restart-0131/little-curlew.png`，然後寫 `scripts/cards/info-restart-0131.json`（比較鳥：白腰杓鷸 + 小杓鷸；ISO3 待定；IUCN LC 趨勢下降）並 `render-info-restart.py 0131`。
- HKBWS 0090/011500 要點已抄入上文待用：全天可見、秋季最多（8 月第二週至 9 月第三週，8 月下半月高峰，2018-08-26 336 隻）；37–46 cm，比白腰杓鷸小、嘴較短而基部粗鈍、頭部縱紋對比強（淡中央冠紋 + 深側冠紋 + 貫穿眼先的深色眼紋）；翼覆羽花紋比白腰杓鶌更粗；飛行時下背多為乾淨白色或淡褐模糊橫斑；幼鳥胸部縱紋更明顯；叫聲為一串急速鈴音；主要在后海灣泥灘及米埔，其他海岸點如船灣（最高 33 隻）、蒲台海面遷徙 320 隻（2012-04-25）；2017-18 冬季高峰 151 隻（2018-02-18）；春季高峰 131 隻（2003-04-24）；過夏鳥通常 20–30 隻，最高 76 隻（2020-07-03）；香港推測亞種 _N. p. variegatus_（東北西伯利亞繁殖）；IUCN LC 趨勢下降。

## 0131–0133 三張交付（下一輪）

| 卡 | 物種 | IUCN | Drive ID | bytes | MD5 |
| --- | --- | --- | --- | ---: | --- |
| 0131 | 中杓鷸 _Numenius phaeopus_ | LC | `1oeo_9qANXTX4MQGoff14LXJFw_JgdIRF` | 168166 | 4519a48bb2e967b9f9a085eab4e95090 |
| 0132 | 小杓鷸 _Numenius minutus_ | LC（趨勢穩定） | `1016VP2iSy4kWL7JmlgxTl5lPH2E1p9CU` | 171386 | 644985e2a1a2d1900ace95f276e330db |
| 0133 | 紅腰杓鷸 _Numenius madagascariensis_ | **EN 瀕危** | `1a7H_CkziUPDqKu5FXJb3vBtZY_246TSr` | 167942 | d24b97922397bc0d88b11f1df53ff38f |

- 0131 四部位：頭部縱紋／下彎長嘴／粗花紋翼覆羽／藍灰腳；比較鳥 白腰杓鷸 + 小杓鷸；33 ISO3。
- 0132 四部位：小頭淡冠紋／短嘴粉紅基部／淡羽緣上體／粉紅腳；比較鳥 中杓鷸 + 白腰杓鷸；16 ISO3；notes 註明綠色國家含過境範圍。
- 0133 四部位：極長下彎嘴／平淡頭頸縱紋／脅部箭頭斑／灰綠長腳；比較鳥 白腰杓鷸 + 中杓鷸；21 ISO3；IUCN EN 已反映在稀有度徽章。
- 比較鳥的共用做法：0132 用 0131 的 `pixel.png` 當「中杓鷸」，0133 用 0131 的 `curlew.png`（白腰杓鷸）與 `pixel.png`（中杓鷸），避免重複生圖。

## 0134 白腰杓鷸 _Numenius arquata_（NT 近危）

- Drive：`1NTjTf548e0tssNmn4R9S5dL_K-QV05oc`，162705 B，MD5 `b20c533255d637126b1541edfbf74bd7`。
- 四部位：長而下彎的嘴／平淡頭部縱紋／密佈橫斑上體／藍灰長腳；比較鳥 紅腰杓鷸 + 中杓鷸。
- 45 ISO3；notes 記下后海灣冬季最高 1602 隻（2011-01-16）。後海灣最常見的杓鷸，全年可見但主要是冬候鳥。

## 0135 斑尾塍鷸 _Limosa lapponica_（NT 近危）

- Drive：`1dAECIlMfgh-ldxd1UHgYE0BPgn1resgJ`，170576 B，MD5 `77b1c4b24b1c30e924e2e84b89ce2201`。
- 四部位：直而微上翹的嘴／白眉與深色眼線／密橫斑尾羽／長而深色腳；比較鳥 黑尾塍鷸（新繪）+ 白腰杓鷸（沿用 0134）。
- 49 ISO3；notes 記下春季 235 隻（2015-04-11）與秋季 400 隻（1981-09-14）歷史高點。

## 0136 黑尾塍鷸 _Limosa limosa_（NT 近危）

- Drive：`1ebKIIHnS1y_Sh-C28-tONJt2D3d0nfuB`，164178 B，MD5 `c1fdc54b921ce938eb599ea56d52b03b`。
- 四部位：直嘴橙紅基部／白眉深色眼線／鏽橙胸及橫斑／深綠灰長腳；比較鳥 斑尾塍鷸 + 白腰杓鷸；77 ISO3。
- notes：春季最高 2400 隻（2013-04-04，全港紀錄）、冬季最高 895 隻（2016-02-14）。

## 0137 翻石鷸 _Arenaria interpres_（NT 近危）

- Drive：`1LrgT3dWbHH4ysGXNhzEZlCm5A1aDN3L6`，166923 B，MD5 `da7b44d0f2c24ea809a9585fbe8370aa`。
- 四部位：短楔形尖嘴／黑白頭頸花紋／鏽橙拼黑肩羽／橙紅短腳；比較鳥 灰尾漂鷸 + 環頸鴴；78 ISO3。
- notes：IUCN NT（三代下降 20–29%）；2007 年後春季過境量只剩約一成，歷史最高 268 隻（1994-04-20）。

## 0138 大濱鷸 _Calidris tenuirostris_（**EN 瀕危**）

- Drive：`1zSoLlcYxGZOVD5twFs4ynW47WJryfRtv`，164996 B，MD5 `16ae78215ace63561ad586365916fef1`。
- 四部位：厚而較長的嘴／灰色縱紋頭部／橙褐肩羽斑／深色短腳；比較鳥 黑尾塍鷸 + 翻石鷸；35 ISO3。
- 首版頭部圈裁到眼睛邊緣，已把 `[0.660,0.140,0.880,0.360]` 改為 `[0.630,0.115,0.850,0.335]` 重渲染後上載。
- notes：IUCN EN（過境停歇地填海為主因）；春季最高 560 隻（2001-04-08）、秋季 98 隻（2009-09-17）、冬季 112 隻（2016-02-11）。

## 0139 紅腹濱鷸 _Calidris canutus_（NT 近危）

- Drive：`1_1mxwoIyMnkuC-1U4fCbWCqA80gEt0Lk`，167951 B，MD5 `6778faf0a3117d4369b3d72e4f344dd0`。
- 四部位：短嘴約等頭長／橙紅臉頰頸胸／黑鏽相間肩羽／深灰短腳；比較鳥 大濱鷸 + 翻石鷸；88 ISO3。
- notes：春季最高 148 隻（2020-05-01），1990 年代曾達 200 隻（1990-05-06），長期下降。

## 0140 流蘇鷸 _Calidris pugnax_（LC 無危）

- Drive：`1ifvsC6SdwY3cn6O5yZ11oSp3aXxo2Lr1`，163128 B，MD5 `82c583acba242b139a3ff9ceff06b568`。
- 四部位：厚基微下彎嘴／小頭長頸／淡羽緣灰褐上體／橙黃色長腳；比較鳥 澤鷸 + 紅腳鷸；80 ISO3。
- 首版「小頭長頸」圈只裁到眼睛，已改用全身圖 `pixel.png` 的 `[0.16,0.04,0.50,0.42]`（頭頸連身體比例可見）重渲染。
- 插圖為非繁殖羽雄鳥，notes 已註明未畫繁殖期頸部飾羽；86% 紀錄只有一至兩隻，最高十隻（1999-10-25）。

## 0141 闊嘴鷸 _Calidris falcinellus_（**VU 易危**）

- Drive：`1z_sUSPc0Mny9k3E2SXcGF8uCPOdKeHjH`，168638 B，MD5 `0c4af529aae46567d83bd1680ff3716a`。
- 四部位：闊而下彎的嘴／分叉淡眉紋／栗色羽緣上背／短而黑的腳；比較鳥 紅腹濱鷸 + 翻石鷸；59 ISO3。
- notes：IUCN VU（三代下降約 30%）；1988 年春季曾達 320 隻（4月16日），近二十年峰值多在 150 以下。

## 0142 尖尾濱鷸 _Calidris acuminata_（**VU 易危**）

- Drive：`1T6WqLB1rw-VSL8wc-UYWCqWYjoh-AqXn`，168151 B，MD5 `543e9640a21ff1bef9ffc0c15b612e5f`。
- 四部位：黑嘴淡基部／深色頭頂淡眉／密斑胸部／黃褐色腳；比較鳥 闊嘴鷸 + 流蘇鷸；31 ISO3。
- notes：IUCN VU（三代間約下降 45%）；春季最高 300 隻（2004-05-10，全港最高），秋季僅 48 隻。

## 0143 彎嘴濱鷸 _Calidris ferruginea_（**VU 易危**）

- Drive：`1OmKGVz1xBVDUPQwAsvb3F8BbscycPugQ`，169538 B，MD5 `444e9080f30ba703bf50002f62307f09`。
- 四部位：細長下彎嘴／淡眉與白前臉／橙紅肩羽／長而深色腳；比較鳥 尖尾濱鷸 + 闊嘴鷸；76 ISO3。
- **生圖出錯已重繪**：第一次畫成嘴極長深彎的杓鷸外形，與濱鷸不符；重畫成嘴約頭長 1.5 倍、彎度輕微後才使用，notes 已記錄。
- notes：IUCN VU（三代下降 30–49%）；春季最高 10,982 隻（2007-04-17），春季最常見過境濱鷸。

## 0144 青腳濱鷸 _Calidris temminckii_（LC 無危）

- Drive：`1UaLeEraimFrMyZjwOWm-e45epyexI7Ek`，161121 B，MD5 `66d579b6778a9eb5742278a8298195c7`。
- 四部位：細短微彎嘴／整齊白眼圈／長尾伸出翼端／黃綠短腳；比較鳥 闊嘴鷸 + 尖尾濱鷸；101 ISO3。
- 首版「長尾伸出翼端」只裁到泥地與翼尖，已改為 `[0.55,0.30,0.95,0.55]` 重渲染。
- notes：IUCN LC（趨勢未明）；數量自 1990 年代下降，冬季峰值近二十年未超過 35 隻，最高 152 隻（1997-10-18）。

## 0145 長趾濱鷸 _Calidris subminuta_（LC 無危）

- Drive：`14-QSEoTrGprnNLhs4gxCdCEw0umAtNat`，170008 B，MD5 `fb21028088187a0e69b3adbb5fc41199`。
- 四部位：短而微彎嘴／深頂延伸嘴基／胸部細縱紋／特長腳趾；比較鳥 青腳濱鷸 + 闊嘴鷸；53 ISO3。
- 兩輪裁切修正：第一次「短而微彎嘴」「深頂延伸嘴基」都落在胸部與翼羽上；改用 `pixel.png` 的 `[0.10,0.36,0.36,0.62]` 與 `[0.16,0.30,0.42,0.56]`（頭部連嘴）後正確。教訓：renderer 的圓形視窗比測試縮圖更緊，頭部特寫要用全身圖並留大範圍。
- notes：IUCN LC（趨勢未明）；最高 175 隻（1993-04-13），本世紀最高 84 隻（2011-05-04），冬候數量明顯下降。

## 0146 勺嘴鷸 _Calidris pygmaea_（**CR 極危**）

- Drive：`1x3C_-BLBLYYdzsnAzZxmVhQR2H1DBLtR`，166522 B，MD5 `376f347253833688a8aaeba8632b3a6c`。
- 四部位：匙狀嘴／匙端近觀／白前臉淡眉／黃綠短腳；比較鳥 長趾濱鷸 + 青腳濱鷸；23 ISO3；score 4.1，重要性 5.0、保育 4.7。
- 全身圖第一版嘴向下垂、匙端角度不自然，已重繪為向前平伸的側面輪廓。
- **新增工具** `scripts/cards/preview-crops.py KKKK`：完全複製 renderer 的 `ImageOps.fit` 圓形裁切，事先看到四圈的真實效果。之前的正方形測試縮圖會誤導——寬框經 `ImageOps.fit` 後左右會被切走。
- notes：IUCN CR（估計每年下降約 8%）；最高 13 隻（2005-04-03），一般一日不超過三隻，本世紀記錄減少。

## 0147 紅頸濱鷸 _Calidris ruficollis_（NT 近危）

- Drive：`1qM0uPiFAnOF9okOGJ6z0yvqxsVdsLlED`，164513 B，MD5 `68a96fb7c8c92fecfd6f6b0f0409d283`。
- 四部位：短厚黑嘴／橙紅臉頸／橙紅肩羽／淡色短腳；比較鳥 勺嘴鷸 + 青腳濱鷸；74 ISO3。
- 比較鳥特意配勺嘴鷸：HKBWS 明言嘴尖沾泥的紅頸濱鷸最易被誤認成勺嘴鷸，卡上已寫明。
- notes：IUCN NT（黃海停歇地喪失）；春季最高 3,756 隻（2010-04-11）。

## 0148 三趾濱鷸 _Calidris alba_（LC 無危）

- Drive：`11lVn4bNjEApwnc9lDkivy1su7vgDnZI-`，159240 B，MD5 `18c723bf822ffee0fbde97d38906625d`。
- 四部位：短而直的嘴／淡灰頭臉／翼角黑色斑／黑色無後趾；比較鳥 紅頸濱鷸 + 彎嘴濱鷸；92 ISO3。
- 插圖為非繁殖羽（香港春季所見多為此），notes 已註明未畫繁殖羽橙褐色。
- notes：IUCN LC；春季不常見至稀少，九成以上紀錄少於五隻，最高 67 隻（1993-05-04）。

## 0149 黑腹濱鷸 _Calidris alpina_（NT 近危）

- Drive：`1TLtWpSHC4Iwxu0r4IczAT2whydEekmn-`，160770 B，MD5 `7ddf9326d9c041a205a49a6a07364392`。
- 四部位：嘴長而略下彎／頭頂灰褐縱紋／胸部淡縱紋／黑色較短腳；比較鳥 彎嘴濱鷸 + 尖尾濱鷸；134 ISO3；score 3.1。
- 全身圖第一版嘴長而明顯下彎，讀起來像彎嘴濱鷸，已重繪成「僅末端微下彎」的側面輪廓。
- 「胸部淡縱紋」第一版落在純縱紋區，看不出是胸部，改用 `pixel.png [0.44,0.28,0.68,0.52]`（連同胸部邊緣）重渲染。
- 比較鳥特意配彎嘴濱鷸（HKBWS 明確以腳長、嘴彎度、腰羽是否全白作區分）與尖尾濱鷸（同屬、體型相近，靠眉紋與腳色分辨）。
- notes：IUCN NT（三代下降 20–29%）；香港最豐富的越冬濱鷸，單日最高 6,070 隻（2020-12-13），冬季棲息地不在米埔自然保護區。

## 0150 小濱鷸 _Calidris minuta_（LC 無危）

- Drive：`1jNKDLCDlWiFIwJofEfYwi0QOprI4KUto`，140295 B，MD5 `203713014959f3fec752e94d50642494`。
- 四部位：細長針狀黑嘴／小頭淡眉／細長黑腳／挺立而圓的身軀；比較鳥 紅頸濱鷸 + 青腳濱鷸；139 ISO3；score 3.4。
- `dexScores` 只有 `a=2.3, v=3.1, r=4.8, o=3.4, vEst=1`，重要性 `i` 與保育 `c` 缺值：依既有政策保持「待查」，不補零、不重算綜合，卡面沿用「待查非零分」。
- 全身圖一次成形（針狀細嘴、細長黑腳、站姿較挺），沒有重繪；四圈第一輪就全都落在特徵上，只把腳部框加大到 `[0.31,0.38,0.75,0.82]` 連趾入鏡。
- 比較鳥特意配紅頸濱鷸（HKBWS 明確以腳長腳粗、頭大小、嘴粗細、站姿分辨）與青腳濱鷸（同樣小型細嘴，但欖黃腳一望即分）。
- notes：IUCN LC（趨勢上升）；香港 Category I，春季稀少過境鳥，最高 6 隻（1990-04-13 至 17、2003-04-24、2004-04-25），首筆紀錄 1986-04-26。

## 修補：0121–0124 補登記 slim（同 0040–0043 的舊缺陷）

用戶要求「有圖的卡都要能翻成五頁」。逐張核對 registry 後發現 **0121 鐵嘴沙鴴、0122 環頸鴴、0123 白臉鴴、0124 青藏沙鴴** 四張早已上載 Drive（見本文件上表），但 `src/data/infoCards.json` 當時只擴到 0120，四張從未登記。

- 後果：`mobileCardPages()` 對未登記的卡只給「插畫 + 完整資訊卡」兩頁，整張 1024×1536 長卡被塞進單一面板——正是 2026-11 用戶回報 0040–0043 時的同一個缺陷，只是換了一批編號。
- 修正：四張補上 `layouts: slim`、`revisions: restart-NNNN-v1`、`panelColors: #173446`，並依編號排序插入 `ids`。registry 現為 **150 張**（0001–0120、0121–0124、0125–0150）。
- 迴歸測試：`tests/infoCardReader.test.mjs` 新增「0121–0124 are registered slim too, not only up to 0120」。原本只有「0001–0120 全部 slim」的斷言，正是這個上界讓四張漏網；新測試逐張斷言已登記、slim、且切成五頁。
- 十二張卡的 AVIF 沒有重做、沒有重新上載，只改顯示層登記。

## 0151 飾胸鷸 _Calidris subruficollis_（VU 易危）

- Drive：`1wFl3WjWHdMd8Tufx0wVG8kVrh6iy66Nd`，144626 B，MD5 `0053d750f38bd2394e9a718eac973343`。
- 四部位：短而細的黑嘴／大眼淡色眼圈／胸側黑色斑點／較長的黃腳；比較鳥 流蘇鷸 + 斑胸濱鷸；48 ISO3；score 2.9。
- 比較鳥特意配流蘇鷸（HKBWS 明言本種「像一隻小型雌流蘇鷸，但更鮮明、嘴更短更細」，兩者體型差距見卡）與斑胸濱鷸（同屬、同為皮黃下體，靠胸帶是否突然中斷分辨）。
- 第 1、4 圈調整：首版「短而細的黑嘴」用了近景圖，嘴被切掉一半；改用全身圖 `[0.62,0.08,0.92,0.38]`。「較長的黃腳」首版只見到兩條腿，框加大到 `[0.36,0.50,0.74,0.88]` 連黃色腳趾入鏡。
- notes：IUCN VU（至少中度快速下降）；香港 Category I 偶見鳥，只有兩筆——2015-04-19 米埔（香港首筆）、2016-12-20 至 2017-01-02 新田乾涸魚塘。

## 0152 斑胸濱鷸 _Calidris melanotos_（LC 無危）

- Drive：`1Boc0u42V3PTr5VVTIiJVHbuBlNsr4fQq`，148678 B，MD5 `311b899f881e93662a823d521c6966ea`。
- 四部位：略長而微彎的嘴／胸腹銳利分界／胸前深色縱紋／暗黃色腳；比較鳥 尖尾濱鷸 + 飾胸鷸；48 ISO3；score 3.2。
- 素材省一次生成：0151 已核對過的 `pectoral-sandpiper.png`（1254×1254）直接當作本卡的 `pixel.png`，只新生成 `features.png` 與尖尾濱鷸比較圖。
- 第 1 圈首版用了全身圖但嘴被切掉，改 `[0.58,0.12,0.92,0.46]`；第 2 圈首版落在純縱紋上、看不到分界，改用近景圖 `[0.66,0.43,0.96,0.77]` 才同時拍到深色前胸與白色腹部。
- 比較鳥特意配尖尾濱鷸（HKBWS 以此為主要對照種：本種胸帶突然中斷、眉紋暗淡、嘴較長較重）與飾胸鷸（同樣皮黃／白下體但無深色胸帶）。
- notes：IUCN LC（趨勢穩定）；香港 Category I，春季罕見、秋季極罕見，平均兩年一筆，高峰在 4 月上半月；成鳥雌鳥胸前縱紋整齊，雄鳥為粗斑塊且體型明顯較大，卡上已註明。

## 0153 半蹼鷸 _Limnodromus semipalmatus_（NT 近危）

- Drive：`1wQPOFR4kobUw9jQdujaJV60sIngx0ZNm`，141892 B，MD5 `f051175a51aa75c6763ae82de12fd705`。
- 四部位：長而全黑的嘴／深色眼先／橙鏽色下體／黑色腳；比較鳥 長嘴鷸 + 黑尾鷸；32 ISO3；score 2.9。
- HKBWS 頁面路徑是 **`0100/013700`**（不是其他濱鷸慣用的 `0090/`），`0090/013700` 回 404；已改用正確路徑取得全頁。
- 第 1 圈試了四版：全身圖的嘴段拉太寬時只剩一條黑線，近景圖的嘴雖近卻完全沒有眼與眼先（試了三個框都一樣），最後用全身圖 `[0.62,0.21,0.92,0.49]`。第 4 圈「黑色腳」同樣要縮窄到 `[0.28,0.56,0.52,0.84]`，否則兩腿被圓框切走。
- 比較鳥特意配長嘴鷸（同屬、體型最接近，腳色一望即分：本種全黑、長嘴鷸黃綠）與黑尾鷸（HKBWS 以「比黑尾鷸略小」定本種體型，雙色嘴 vs 全黑嘴是最直接分別）。
- notes：IUCN NT（趨勢下降，相信與越冬地棲地喪失有關）；香港 Category I，春季常見、秋季稀少的過境鳥，最高 540 隻（2003-05-02），多數年份春季高峰約 150 隻。

## 0154 長嘴鷸 _Limnodromus scolopaceus_（NT 近危）

- Drive：`1EKxP7K0AAMZr5qCY1ZZDtpJ5WAlP20E3`，139504 B，MD5 `9f58034ae8e9ff396b7128c857cc134d`。
- 四部位：淡色嘴基／明顯白眉／黃綠色腳／羽軸深色；比較鳥 半蹼鷸 + 黑尾鷸；48 ISO3；score 2.7。
- 插圖畫**非繁殖羽**（香港紀錄以此為主），notes 已註明未畫繁殖羽的鏽紅下體與黑色橫斑。
- 第 1 圈首版框太大，圓內只剩一條斜線；縮到 `[0.60,0.22,0.88,0.50]` 才見到嘴基的淡色段。第 3 圈首版 `[0.32,0.58,0.56,0.84]` 把腿切在頂端，改 `[0.30,0.56,0.58,0.90]` 後兩腳連腳趾完整。
- 比較鳥配半蹼鷸（同屬、HKBWS 明言本種明顯較小、腳色與嘴色不同）與黑尾鷸（體型上限，雙色嘴對全深色嘴）。
- notes：IUCN NT（三代下降 20%，原因未明）；香港 Category I，稀少過境鳥兼冬候鳥，最高 4 隻（2011-04-06 至 07），首筆 1982-04-19。

## 0155 丘鷸 _Scolopax rusticola_（LC 無危）

- Drive：`1lisJpmy5M34zaUqDcL4VQ72FbV3Lhhbu`，159125 B，MD5 `b12e937fc0d39a5d3692d72e81d9703d`。
- 四部位：長直而淡色的嘴／後枕寬黑帶／短而淡的腳／隱蔽的橫斑羽色；比較鳥 扇尾沙錐 + 針尾沙錐；73 ISO3；score 3.7。
- 頭部特寫這次特別好用：近景圖右側那隻把「後枕寬黑帶」與「眼位高而偏後」同時清楚拍出，第2圈 `[0.74,0.02,0.96,0.24]` 正好只裝後枕黑帶。
- 第1圈收緊到 `[0.64,0.29,0.88,0.53]`：太寬時圓內只剩一條淡色斜線，看不到嘴的粗細；第3圈「短而淡的腳」用 `[0.34,0.62,0.56,0.76]`，框窄而扁才能同時見到兩腳與腳趾。
- 比較鳥特意配扇尾沙錐（HKBWS 以「比香港的沙錐更大更矮胖」定本種體型，背部縱紋 vs 斑駁橫紋最易分辨）與針尾沙錐（同樣修長沙錐，靠尾羽與體態對比）。
- notes：IUCN LC（趨勢穩定）；香港 Category I，廣泛分佈但密度低的冬候鳥兼過境鳥，單一地點最高 7 隻（1998-11-25、1999-12-17 大老山），最遲紀錄 1996-04-19。

## 0156 橙腹葉鵯 _Chloropsis hardwickii_（LC 無危）

- Drive：`1LjalXQ7aQRyOki002WkafbZ05UEhAAbO`，141701 B，MD5 `98d764bc7d98921eef519ed754788002`。
- 四部位：藍色頰紋／橙黃色腹部／藍色翼羽／灰頂與綠背；比較鳥 藍翅葉鵯（另一物種）+ 橙腹葉鵯雌鳥（同種異性）；16 ISO3；score 1.9。
- 插圖為雄鳥（`C. h. melliana`，即香港所見大陸亞種）；雌鳥另在比較圈呈現——全綠、淡藍頰紋、無橙腹，HKBWS 明言雌鳥較不起眼且少鳴。
- 比較鳥用了**同種異性**（雌鳥）而非另一物種，是因為兩者同群出現時極易被誤認成兩種鳥，這比再拉一個近緣種更有辨識價值。
- notes：IUCN LC（趨勢下降）；香港 Category I，林區低密度局部存在，有小量度夏族群、可能小數量定期繁殖；單一地點最高 5 隻，11 月至 3 月最常見。

### 修正：`panelColors` 全部寫死深藍（155 張）

0156 渲染出來是**深綠底**，與先前所有卡的深藍不同。查明不是 bug：`compose-card.py` 的 `apply_theme()` 按「目」分組上色——

| 組 | 目 | 主題色 | 卡面底色 `dark(theme, 0.82)` |
| --- | --- | --- | --- |
| water 水鳥 | 雁形／鷗形／鴴形／鶴形等 | `#266492` | `#06121a` |
| raptor 猛禽 | 鷹形／隼形／鴞形 | `#7a4a21` | `#150d05` |
| passerine 雀形 | 雀形目 | `#2c5a3c` | `#07100a` |
| other 其他 | 鳩／杜鵑／翠鳥／啄木鳥… | `#4a587a` | `#0d0f15` |

但 `src/data/infoCards.json` 的 `panelColors` 從頭到尾都是同一個 `#173446`，於是**155 張裡有 54 張的底色登記是錯的**（101 張水鳥剛好接近深藍所以看不出來）。錯的是手機分頁的留白色：翻到分頁時四邊會露出登記的顏色，綠卡會露深藍邊。

- 修正：按 `birdTaxonomy.json` 的 `order` 逐張重算，寫入 `compose-card.py` 同一條公式的結果。四組色值已用已交付的 0155（水鳥，實測 `#05121a`）與 0156（雀形，實測 `#061109`）核對，公式值與實測差 1，屬 AVIF 有損壓縮。
- 迴歸測試：`tests/infoCardReader.test.mjs` 新增「panelColors matches each card's real theme background」，在測試裡重跑同一條分組＋壓暗公式，任何新卡寫死單一深藍都會被擋下。
- 只改顯示層登記，**沒有重新渲染或重新上載任何已交付的 AVIF**。

## 0157 扇尾沙錐 _Gallinago gallinago_（LC 無危）

- Drive：`1sxYP2YzG2v3E2zgVfo_GBD7AXMn8KbAd`，148758 B，MD5 `d6ef93fcda7c431f98ef4c6accac525c`。
- 四部位：長而筆直的嘴／頭部縱紋與白頰／對比鮮明的白腹／背部淺色縱紋；比較鳥 針尾沙錐 + 丘鷸；106 ISO3；score 2.8。
- 全身圖直接複用 0155 已核對的扇尾沙錐（1254×1254），只新生成 `features.png`，省一次生成額度。
- 比較鳥兩隻都沿用 0155 素材：針尾沙錐（0155 已核對，尾端針狀細羽可見）與丘鷸（0155 已核對，矮胖無頸、後枕黑帶）。
- 第1圈試了三版：`[0.50,0.24,0.76,0.62]` 只拍到嘴的中段、近景圖版本又完全沒有嘴基，最後用全身圖 `[0.58,0.20,0.92,0.54]` 才同時含嘴基與頭。第3圈「白腹」要 `[0.44,0.46,0.68,0.68]` 才把白色腹部與胸側橫斑一起入鏡。
- 底圖 106 ISO3：全歐亞繁殖區 + 非洲／南亞／東南亞越冬區；HKBWS 明言本種分佈跨越全古北界。
- notes：IUCN LC（趨勢下降）；香港 Category I，常見過境鳥兼冬候鳥，秋季最多；最高 212 隻（1987-01-11、1990-01-14 后海灣冬季水鳥普查），秋季最高 130 隻（2007-10-11 塱原）。

## 0158 針尾沙錐 _Gallinago stenura_（LC 無危）

- Drive：`1EuFy28ZgBWmHIwYv8DoDvMjKDtthuc-M`，149190 B，MD5 `f4d6dbdb382c5779843ec29adcb27483`。
- 四部位：長而筆直的嘴／大眼與頭部縱紋／暗淡的背部縱紋／腹側密集橫斑；比較鳥 扇尾沙錐 + 丘鷸；29 ISO3；score 2.8。
- 全身圖直接複用 0155 已核對的針尾沙錐（1254×1254），只新生成 `features.png`。
- **四圈的選法有取捨**：本種最權威的特徵是外側針狀尾羽，但這是實驗室級別的特徵、野外看不到，硬做一圈只會拍到兩條細線。所以改成「暗淡背部縱紋」（對比扇尾沙錐的鮮明縱紋）與「腹側密集橫斑」（對比扇尾沙錐的乾淨白腹），並在 notes 明說野外仍須靠飛行叫聲。
- 第 2、3 圈各試了兩三版：第 2 圈首版 `[0.72,0.14,0.99,0.44]` 眼佔得太滿，改用近景圖後才同時見到縱紋；第 3 圈首版 `[0.16,0.34,0.44,0.62]` 有一半是空白背景，收緊到 `[0.20,0.40,0.46,0.66]`。
- notes：IUCN LC（趨勢未明）；香港屬 Category I，主要秋季常見過境鳥、冬季稀少；確認紀錄集中 2/3–5/4 及 8/29–10/12，高峰月 9 月；Aymas（1930）曾視為香港最常見的沙錐。

## 0159 大沙錐 _Gallinago megala_（LC 無危）

- Drive：`1lsO_MkDJ50cNUI24aBVp6XbxOwIBqbSW`，149117 B，MD5 `52da6d7a2625401f8a3cdc4983979bf3`。
- 四部位：長而筆直的嘴／眉紋比眼線寬／背部淺色縱紋／腹側橫斑；比較鳥 針尾沙錐 + 扇尾沙錐；30 ISO3；score 2.9。
- **HKBWS 頁面路徑是 `0100/014100a`**（帶尾綴 `a`）；`0100/014100` 只回一頁空白骨架。這一組沙錐的編號都不按順序：扇尾 `014200`、大沙錐 `014100a`、針尾 `014000`。
- 四圈的選法照 HKBWS 的辨識優先次序：把「**眉紋明顯寬於眼線與頭頂條紋**」當成第 2 圈主特徵（這是它與扇尾沙錐分別的首要野外依據），第 1 圈用較長的嘴對比針尾沙錐。
- 第 1 圈首版 `[0.70,0.30,0.99,0.52]` 只拍到嘴的中段；第 2 圈首版太緊只見到眼，改用近景圖 `[0.62,0.14,0.99,0.48]` 才把眉紋與眼線的寬度比例一起框進去。
- notes 明言：野外與針尾沙錐極難分辨，HKBWS 自己說多數紀錄只能記為「針尾／大沙錐」二選一；尾羽數目（本種 20–22 根）與針狀尾羽屬實驗室特徵。
- notes：IUCN LC（趨勢未明）；香港 Category I，不常見過境鳥兼稀少冬候鳥；確認紀錄集中 1/20、2/3、3/31–4/8 及 8/28–10/22，高峰月 9 月。

## 0160 翹嘴鷸 _Xenus cinereus_（LC 無危）

- Drive：`1gXy5N4zDn8fBITLR3O2eShpwhqmCgQ54`，162373 B，MD5 `c8a691dd6b0d6dd4225b865ff25b207d`。
- 四部位：嘴上翹、基部較淡／深色眼先與白眉／肩羽黑褐縱紋／橙黃色短腿；比較鳥 磯鷸 + 青腳鷸；46 ISO3；score 2.8。
- HKBWS 頁面路徑 `0100/014300`（扇尾沙錐 `014200` 之後一跳就到本種，編號與 0157–0159 那組沒有規律可循）。
- **四圈主軸是「距離下也看得出」的幾個特徵**：上翹的嘴（HKBWS 開宗明義說這是 22–25 cm 小型鷸類最易辨認的特徵）、橙黃色短腿、均勻灰色調，再配眼先與白眉的頭部花紋。飛行時的白色翼帶與黑色腕斑雖然更權威，但在全身站立圖上拍不到，所以只寫進 notes 而不硬做一圈。
- 第 1 圈（上翹嘴）試了七版才落定：由近景圖 `[0.66,0.17,1.0,0.52]` 起，到只拍嘴 `[0.74,0.31,1.0,0.47]`（變成「一條斜線配空白」而棄用），最後 `[0.66,0.19,1.00,0.50]` 才同時框到頭形、嘴基與上翹的嘴尖。
- 第 2 圈用近景圖 `[0.53,0.12,0.93,0.52]`，讓白眉的粗細與眼先的深色一起入鏡。
- 比較鳥是本卡新繪（`common-sandpiper.png`、`greenshank.png`），因 0163 磯鷸／0167 青腳鷸 尚未交付、無已核對素材可複用。
- notes：IUCN LC（趨勢下降）；香港 Category I，春季大量過境（單次最高 590 隻，2007-04-24）、秋季不常見且起伏大（秋季最高 253 隻，2005-08-23）；自 2011/12 冬季起幾乎每年 12–2 月都有零星紀錄。覓食時常快步追逐灘面獵物，也會以嘴側掃水面，捉到蟹會先在水中冲洗。

## 0161 紅頸瓣蹼鷸 _Phalaropus lobatus_（LC 無危）

- Drive：`1hgH4zv47pQEYJi0sNda16v4jXoEAnLmX`，153180 B，MD5 `a8a443cc7d68e61d26de7cb4bc70af23`。
- 四部位：細針狀全黑嘴／鏽紅頸側與白喉／背部淡色 V 紋／瓣狀趾；比較鳥 灰瓣蹼鷸 + 紅頸濱鷸；56 ISO3；score 3.0。
- HKBWS 頁面 `0100/014400`（緊接 0160 翹嘴鷸 `014300`）。
- **本種幾乎總在水面上**，所以全身圖畫成游泳姿態；四圈也順著「水上先看到甚麼」排序：針狀嘴、鏽紅頸斑、背部淡色 V 紋，最後才是上陸才見得到的瓣狀趾。
- 第 1 圈（針狀嘴）試了三版：從近景圖全身裁 `[0.68,0.18,1.00,0.50]` 起，收緊到 `[0.72,0.24,0.99,0.44]` 只剩一條線，最後 `[0.70,0.20,1.00,0.46]` 才兼有頭形與完整的針狀嘴。
- 第 2 圈（鏽紅頸）首版 `[0.62,0.13,0.88,0.39]` 主體全是鏽紅、白喉被裁掉，改 `[0.54,0.19,0.78,0.51]` 讓紅白交界完整入鏡。
- 第 4 圈（瓣狀趾）試過 5 個框：水的反光會把趾切斷，最後 `[0.26,0.61,0.42,0.81]` 才讓整個瓣膜腳掌落在圈內。
- 比較鳥是本卡新繪（`grey-phalarope.png`、`curlew-sandpiper.png`）。
- notes：IUCN LC（趨勢下降）；香港 Category I，春季常見甚至大量（2012-04-05 蒲台島兩小時 2,490 隻）、秋季不常見；12 月與 1 月從無紀錄。紀錄多在海上，颱風與東北季風湧至時會帶入大批個體。

## 0162 灰瓣蹼鷸 _Phalaropus fulicarius_（LC 無危）

- Drive：`1Nr2uYvHGM6cpbvvPGEGDBXo8yX1aym5G`，152206 B，MD5 `2e3c8abb9637dadbc8d939fb1cec913b`。
- 四部位：短厚扁嘴、基部淡黃／黑色後頭、白色前額／翼上寬白斑／瓣狀趾；比較鳥 紅頸瓣蹼鷸 + 三趾濱鷸；72 ISO3；score 3.0。
- HKBWS 頁面 `0100/014500`（紅頸瓣蹼鷸 `014400` 之後一個編號）。全篇只有五筆紀錄，屬 Category I 迷鳥。
- **全身圖直接複用 0161 新繪的灰瓣蹼鷸**（該圖在 0161 只用作比較鳥，現升為主角），只新生成 `features.png`；比較鳥的紅頸瓣蹼鷸亦沿用 0161 的全身圖，三趾濱鷸為新繪。
- 四圈完全照 HKBWS 的比較次序排：嘴形（短厚且扁、基部淡黃）→ 頭部花紋（黑後頭、白前額）→ 翼上寬白斑 → 瓣狀趾。
- 第 1 圈試了 4 版：`[0.76,0.24,1.00,0.42]` 切成「一塊黃加一條線」，`[0.65,0.19,1.00,0.50]` 與 `[0.60,0.14,1.00,0.50]` 都把眼裁掉，最後 `[0.62,0.15,1.00,0.47]` 兼有眼、嘴基與嘴尖。
- 第 4 圈（瓣狀趾）試了 4 版：水域反光會把趾分成兩截，最後 `[0.20,0.62,0.46,0.80]` 才讓兩隻腳掌都完整。
- 全部插圖都用非繁殖羽：香港五筆紀錄（1993、1994、1996、2005、2008）都在 12–7 月，繁殖羽在繁殖地以外極罕見。
- notes：IUCN LC（趨勢未明）；香港 Category I，迷鳥；一半紀錄在海上，其餘在內陸靜水包括米埔。
