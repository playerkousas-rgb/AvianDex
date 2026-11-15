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

## 0163 磯鷸 _Actitis hypoleucos_（LC 無危）

- Drive：`1d1ojQJuP7Hw1bDj1jHCJtD-40Qgw_K3f`，164623 B，MD5 `140a0197dbdd792195843529b19c39b1`。
- 四部位：短而直的嘴、嘴基較淡／白色眼圈與眼先眉紋／翼上細碎橫斑與白楔／黃綠色短腿；比較鳥 白腰草鷸 + 林鷸；109 ISO3；score 3.0。
- HKBWS 頁面 `0100/014600`（緊接灰瓣蹼鷸 `014500`）。
- **全身圖直接複用 0160 新繪的磯鷸**（該圖在 0160 只用作比較鳥，現升為主角），只新生成 `features.png`；兩隻比較鳥白腰草鷸、林鷸為本卡新繪。
- **HKBWS 開宗明義說本種「行為比羽色更好認」**：覓食時後半身不停上下擺動、常保持蹲伏，飛行時淺而急促的振翅夾短滑翔。這些動態特徵拍不進圓圈，所以四圈只放可靜態呈現的線索，並把行為寫進第 4 圈的 note 與 notes。
- 第 1 圈（嘴）試了 4 版：`[0.70,0.24,1.00,0.48]` 把眼完全切掉、`[0.66,0.22,1.00,0.46]` 只剩半隻眼，最後 `[0.62,0.19,1.00,0.48]` 讓眼、嘴基與完整的短嘴一起入鏡。
- 第 2 圈（眼圈）用 `[0.62,0.17,0.90,0.45]`，把白色眼圈與眼先那段短眉紋框成正中央。
- 第 4 圈（短腿）首版 `[0.38,0.55,0.62,0.75]` 只拍到兩條腿的中段，改 `[0.34,0.56,0.58,0.80]` 才見到完整的黃綠色腳掌與泥面。
- notes：IUCN LC（趨勢下降）；香港 Category I，最常見的鷸類之一，常見過境鳥兼冬候鳥、夏季罕見；后海灣最高 152 隻（2002-04-14），魚塘裸泥岸數量最多；Sung et al.（2021）指 1998–2017 年香港越冬族群下降。

## 0164 白腰草鷸 _Tringa ochropus_（LC 無危）

- Drive：`13mh1dkRq3evuk12yIRik7WBqpTM-YIIb`，168169 B，MD5 `7e785acda323ebc3bf3402c808f02228`。
- 四部位：中長嘴、嘴基較淡／眉紋止於眼後／暗褐背部與細白點／胸口與白腹分界；比較鳥 林鷸 + 磯鷸；126 ISO3；score 3.4。
- HKBWS 頁面 `0100/014700`。
- **全身圖直接複用 0163 新繪的白腰草鷸**（該圖在 0163 只用作比較鳥），只新生成 `features.png`；比較鳥林鷸沿用 0163 素材、磯鷸沿用 0160／0163 素材，兩隻都不必新繪。
- 四圈照 HKBWS 與林鷸的分別點排：嘴基較淡 → **眉紋止於眼後**（林鷸是長長延伸）→ 背深褐只帶細白點（林鷸密佈白點）→ 胸口與白腹的乾淨分界。
- 飛行時的白色腰部與深色翼／翼下對比是本種最權威的野外特徵，但站立圖拍不到，只寫進 notes 與比較鳥說明。
- 第 1 圈（嘴）試了三版：`[0.75,0.27,1.00,0.50]` 與 `[0.72,0.25,1.00,0.53]` 都只剩嘴中段、讀不出嘴基與嘴尖的深淺差，最後 `[0.66,0.22,1.00,0.52]` 把頭形、淡色嘴基與深色嘴尖一起框入。
- 第 4 圈（胸口分界）首版 `[0.50,0.33,0.72,0.56]` 有一半是空白水色，改 `[0.46,0.30,0.68,0.56]` 讓頸側縱紋與白腹的分界落在正中。
- **本卡是這批少見的趨勢上升種**（IUCN LC、population trend increasing），與前面幾張「下降／未明」不同，卡上與 docs 都已標明。
- 分數注意：`dexScores` 中 0164 缺 `a`（適應力），rexadar 該軸顯示「待查」，卡面也加了「待查非零分」註記——這是資料本身如此，不是渲染錯誤。
- notes：IUCN LC（趨勢上升）；香港 Category I，不常見過境鳥兼冬候鳥、夏季罕見；最高 130 隻（2017-03-19），后海灣以外單點最高 28 隻（錦田）。

## 0165 灰尾漂鷸 _Tringa brevipes_（NT 近危）

- Drive：`1Ke-xhBODAnHjy-RiuHCR2Nuu3zJyr6gY`，163031 B，MD5 `b2978347461969ca2022a43eb0670879`。
- 四部位：嘴基大片淡色／深色眼線與灰眉／素淨無紋的灰背／黃色短腿；比較鳥 磯鷸 + 青腳鷸；27 ISO3；score 3.1。
- HKBWS 頁面 `0100/014800`。
- **順手修了一個既有資料錯**：`src/data/cardDetails.zh.json` 內 0165 的 `iucn` 原本寫「無危 LC」，但 HKBWS 與 IUCN 都是 **Near Threatened / 近危**。改為「近危 NT」後跑 `node scripts/build-dex-scores.mjs`，只有 0165 這筆變動：`{i:2, c:1.2, o:2.8}` → `{i:3, c:1.8, o:3.1}`，其餘 539 筆逐一比對無變化。這也影響 app 內的詳細資料頁與稀有度星級（近危 = 2 星）。
- 四圈用「距離下也看得出」的順序：淡色嘴基 → 深色眼線與灰眉（頭頂素淨）→ 無花紋的灰背 → 短黃腿。飛行時的白色大覆羽羽端與尾上覆羽細橫斑屬飛行觀察，只寫在 notes。
- 第 1 圈（嘴基）試了四版：`[0.72,0.30,1.00,0.56]`、`[0.76,0.34,0.98,0.52]` 都只剩嘴的斜面，最後 `[0.62,0.26,1.00,0.50]` 才同時見到眼後深色線、淡色嘴基與深色嘴尖。
- 第 3 圈（灰背）試了五版：從 `[0.15,0.28,0.55,0.45]` 起，多次一半是藍水，最後收到 `[0.24,0.27,0.52,0.47]` 才讓整片素灰背羽落在圈內。
- 野外最易混淆的是**同屬的小青腳鷸 _T. guttifer_**（IUCN 瀕危 EN），兩者都有素淨灰背與淡色嘴基；該種尚未交付，已在 notes 註明並以青腳鷸作比較鳥（體型／腿長對比更清楚）。
- notes：IUCN 近危 NT（趨勢下降），1990 年代中期後香港數量下降；Category I，春季常見、秋季稀少的過境鳥；1999–2020 平均首見日 4 月 12 日，主群 5 月首三週，最高 554 隻（1987-05-16）。

## 0166 鶴鷸 _Tringa erythropus_（LC 無危）

- Drive：`1A-hJcr9JOvH0pFoiV2meR5YCp_oHmpf6`，154880 B，MD5 `e505189db8ad6d64b221e6387277ab56`。
- 四部位：細長嘴、嘴基偏紅／眉紋延伸到眼後／素淨的灰色背部／長而紅的腿；比較鳥 紅腳鷸 + 澤鷸；99 ISO3；score 2.9。
- **HKBWS 頁面是 `0100/015300`**，不是順序推算出來的 `014900`——`014900` 是小黃腳鷸，`015000` 紅腳鷸，`015100` 澤鷸，`015200` 林鷸，`015300` 才是鶴鷸。這一段連續編號全部可以遞推，只有這次差了三格，靠 `web_search` 才定位正確。
- 全身圖與近景圖都以**非繁殖羽**繪製：冬天是「素淨灰背、白腹、紅腿」，繁殖羽則是全身深灰黑配白點、腳轉暗色，香港的紀錄也以非繁殖羽為主。
- 四圈取自 HKBWS 與紅腳鷸的分別點：嘴更長更細（紅色只在下嘴）→ 非繁殖羽時眼先之上就有明顯眉紋 → 模糊無紋的淺灰背 → 長紅腿（中文名「鶴鷸」來自踩深水的鶴狀姿態）。
- 第 3 圈（灰背）是本卡最難的一圈：全身圖在這一帶幾乎全是水與倒影，試到第四個候選（近景圖左側那隻的小全身，`[0.03,0.30,0.43,0.56]`）才拍到完整的背羽與翼線。
- 第 4 圈（紅腿）用全身圖 `[0.24,0.50,0.60,0.84]`，紅腿與水線一起入鏡，才看得出「踩深水」的比例。
- 分數注意：`dexScores` 中 0166 缺 `a`（適應力），卡面顯示「待查」並加「待查非零分」註記——資料本身如此。
- notes：IUCN LC（趨勢穩定）；香港 Category I，稀少過境鳥（春季略多）、罕見度夏鳥，數量已大幅下降；越冬群 2002 年最高 2,500 隻，2009/10 年後最高僅 186 隻。

## 0167 青腳鷸 _Tringa nebularia_（LC 無危）

- Drive：`1Hrq7DBO1d__CSiHtqncnBq0YJ_Fxosnt`，171626 B，MD5 `a823bef9560060c7d25fae7f3d71cb32`。
- 四部位：微微上翹的嘴／白眉與頭頸縱紋／背上那道白色楔形／綠灰色的長腿；比較鳥 澤鷸 + 小青腳鷸；107 ISO3；score 3.3。
- HKBWS 頁面 `0100/015400`，確認 IUCN LC、趨勢穩定；Category I，屬后海灣一帶常見的過境鳥與越冬鳥。
- 全身圖直接沿用 0160 的 `greenshank.png`（同一物種，已核對），近景圖新繪；比較鳥 澤鷸沿用 0166 新繪的 `marsh-sandpiper.png`，小青腳鷸為本卡新繪 `nordmanns-greenshank.png`。
- 第 3 圈（背白楔）花最多回合：黑色翼羽與白楔在全身圖上是一條斜帶，太貼邊的框只剩白線。最後用近景圖 `[0.16,0.30,0.40,0.54]`（左側那隻小全身的背與翼）才同時看到白楔與兩側深色翼羽。
- 分數注意：`dexScores` 0167 有 `vEst: 1`（觀賞值含體長估算），卡面左下因此顯示「觀賞值含體長估算」而非一般註記。
- 第 4 圈腿放在水面的部分，紅腿類的卡很少見「腿＋水中倒影」這種框，若日後要統一系列風格可以回頭參考。

## 0168 小青腳鷸 _Tringa guttifer_（EN 瀕危）

- Drive：`1c0TJAJTLgrcvLz7SpxUdvtmKUUozxuyp`，161595 B，MD5 `7261ac73dc47e6517551b95551e3687e`。
- 四部位：厚鈍而嘴基深／前重後輕的身形／冬羽素淨的灰背／黃綠色的短腿；比較鳥 青腳鷸（沿用 0167 全身圖）+ 澤鷸（沿用 0166）；21 ISO3；score 3.6。
- HKBWS 頁面 `0100/015500`，確認 **IUCN ENDANGERED**（全球僅估 600–1,300 隻、因沿海開發下降），與 `cardDetails.zh.json` 的「瀕危 EN」一致，本卡**不需要**像 0165 那樣回頭改 IUCN。
- 本卡是全批分佈最窄的一張：只繁殖於鄂霍次克海一帶與庫頁島，過境東亞沿海，越冬集中緬甸／泰國／馬來半島／西印尼／孟加拉，所以 ISO3 只列 21 個有紀錄的國家。
- 第 3 圈（灰背）是本卡最難的一圈，試了 9 個候選：全身圖的背是一片均勻淺灰，任何框只要留太多水面就會變成「一塊灰＋一塊藍」。最後 `[0.16,0.22,0.54,0.50]`（近背部、翼覆羽與三級飛羽邊緣）才看得出「無深色近端橫斑」這個冬羽特徵。
- 全身圖與近景圖都用**冬羽**：繁殖羽的白色 V 形斑與胸腹黑斑在香港幾乎看不到（HKBWS 原文如此）。
- notes 特別寫明「前重後輕」與「追捕蟹類」的行為，因為這兩點在靜態圖上表達不出來。

## 0169 小黃腳鷸 _Tringa flavipes_（VU 易危）

- Drive：`1spZkebpho6Q_AMc_JOtM-MMjZR2bSyHD`，168876 B，MD5 `335d47af0de34ceb1ca741a590bd8254`。
- 四部位：稍短而較厚的嘴／不深暗的頭頂／拖長的後半身／明亮的黃色腿；比較鳥 澤鷸 + 林鷸（兩者都沿用既有已核對全身圖）；33 ISO3；score 3.2。
- **又一個 IUCN 資料錯**：`cardDetails.zh.json` 寫「無危 LC」，HKBWS 頁面明列 **VULNERABLE（三個世代下降 23%–49%）**。已用與 0165 相同的 brace-scan 手法在原位改為「易危 VU」，重跑 `build-dex-scores.mjs`（0169 分數 `{i:2,c:1.2,o:2.7}` → `{i:3.8,c:2.2,o:3.2}`）與 `build-filter-traits.mjs`（0169 LC→VU）。兩支腳本都只動 0169，commit `d7e6036` 先獨立提交，才做卡。
- 本種繁殖於北美洲、越冬中南美，香港只有 1986 與 1990 兩筆紀錄，是真正的迷鳥；地圖幾乎全在西半球，亞洲只剩中國／台灣／日本幾個點。
- 第 3 圈（拖長的後半身）試了 7 個候選：全身圖的翼尖與尾部在這一帶是幾條平行的深褐橫帶，貼邊的框會變成一堆橫線。最後用近景圖左側那隻小全身的尾端 `[0.01,0.36,0.28,0.60]`，才看到「翼尖伸出尾後」的楔形輪廓。
- 與林鷸的分別靠頭部：林鷸有一頂深色帽＋眼後突然變亮的眉；本種頭頂只是帶縱紋的褐、眉紋由眼先到眼後粗細相若。第 2 圈就是為此而設。

## 0170 澤鷸 _Tringa stagnatilis_（LC 無危）

- Drive：`1AYRlJ0oVzgrw_JwqOElPkOfiLp_gfB5V`，164290 B，MD5 `ceb91aef51abdff4320b9a2f1433eede`。
- 四部位：細直如針的深色嘴／偏白的臉與眉紋／極長的暗綠灰腿／背上的淡色羽緣；比較鳥 青腳鷸 + 小黃腳鷸；90 ISO3；score 2.7。
- HKBWS 頁面 `0100/015100`，確認 IUCN LC、趨勢**下降**（`cardDetails` 也是 LC，不必改）。Category I，秋季、冬季、春季都豐富，但 2012 年後各季都有下降跡象；后海灣越冬最高 2,884（2011-01-16），春季最高 3,192（2009-04-10）。
- 全身圖與近景圖都是本卡新繪（舊的 `0166/marsh-sandpiper.png` 只是作為 0166/0167/0169 的比較鳥，色調偏暖、體型偏敦厚，不適合當本卡主圖）。新圖強調「小頭、長頸、極長暗綠灰腿、細直全深色嘴」。
- 第 1 圈（嘴）試到第 4 個候選才對：近景圖的嘴在水藍背景上是一條深色斜線，框太貼邊就只剩線。最後改用全身圖 `[0.62,0.10,0.95,0.28]`，嘴與偏白的臉、眼先一起入鏡。
- 第 2 圈的標籤由「白眼圈與後延的眉」改成「偏白的臉與眉紋」——這隻鳥的眼圈其實不是明顯的白圈，硬寫「白眼圈」會與圖不符。
- 比較鳥首度用 0169 新繪的小黃腳鷸（`0169/pixel.png` → `0170/lesser-yellowlegs.png`），兩者體型與嘴形的差別可以在底部兩個圓圈直接比較。

## 0171 林鷸 _Tringa glareola_（LC 無危）

- Drive：`1LrGbajDiCyKEPxDTcNpI7b10FMVTjGGl`，175849 B，MD5 `52b771be1333f4a4ade8099f36ffe88a`。
- 四部位：不長的深色嘴／延伸到眼後的眉／密佈白點的褐背／黃綠色的長腿；比較鳥 白腰草鷸 + 小黃腳鷸；**120 ISO3（本批最多）**；score 2.8。
- HKBWS 頁面 `0100/015200`，確認 IUCN LC、趨勢**穩定**（`cardDetails` 也是 LC，不必改）。Category I，淡水濕地常見過境鳥與越冬鳥，但與稻田消失有關、數量有下降跡象。
- 全身圖直接沿用 0164 已核對的林鷸圖（同物種同風格），本卡只新繪近景圖；兩張的白點密度、色調一致。
- 四圈全部一次過，是本批最順利的一張——因為全身圖本來就以「白點褐背」為重點，近景圖的頭部與嘴也夠大。
- 比較鳥的白腰草鷸用 0163 的 `green-sandpiper.png`：深黑褐背、胸腹濃暗、眉在眼後就斷，正好與本卡的淡褐白點背形成對照。

## 0172 紅腳鷸 _Tringa totanus_（LC 無危）

- Drive：`1PhVuu2qaaWZixWdvd3dUcHnK3l9nxRh9`，165755 B，MD5 `4476176784a9678d88d56073942c80c5`。
- 四部位：橙紅色的嘴基／只在眼前的眉紋／背上那道寬白／橙紅色的腿；比較鳥 鶴鷸 + 澤鷸；115 ISO3；score 2.8。
- HKBWS 頁面 `0100/015000`，確認 IUCN LC（趨勢未明）；Category I，過境時豐富但下降，春季最高 3,474（1994-04-29）、越冬最高 995（2019-02-10）。`cardDetails` 也是 LC，不必改。
- **全身圖由比較鳥升格為主圖**：0166 的 `common-redshank.png` 本來只是鶴鷸卡的比較鳥，本卡直接沿用並重新核對嘴色（上下嘴都帶橙紅）、腿色、眉紋，只新繪近景圖；0166 的鶴鷸全身圖則反過來當本卡的比較鳥，形成一組互相對照的圖。
- 第 2 圈（只在眼前的眉）是本卡最難的一圈，試了 13 個候選才定：近景圖的眼後有一小段紅嘴顏色，框太鬆就會把紅嘴拖進來，破壞「眼後沒有眉」的重點。最後 `[0.63,0.16,0.89,0.40]` 剛好只框住眼、眼前白眉與褐色頭頂。
- 第 3 圈（背白）也換過三次：全身圖這一帶白楔與深色肩羽緊貼，框太窄只剩白色一條，最後 `[0.10,0.30,0.44,0.52]` 同時容納白楔與兩側深色羽。
- 本種有六個亞種（ussuriensis／terrignotae／craggi 與香港相關），卡面不細分，只寫在說明。

## 0173 拉氏沙錐 _Gallinago hardwickii_（NT 近危）

- Drive：`1Cz7qdGNiSdkgVJRWRNJJsLJWZlFEgMRn`，149192 B，MD5 `b62491dd2a832291ad750c95c229de7d`。
- 四部位：長而筆直的嘴／眉紋在眼前最粗／背上淡色縱紋／淡色腹部與短腿；比較鳥 大沙錐 + 針尾沙錐；15 ISO3；**六軸與綜合分全數「待查」**。
- **HKBWS 沒有本種的物種頁面**：由 `012800` 到 `014350` 之間逐一探測（`012800`、`012800a`、`012830`、`012900`、`013600`、`013700`、`013800`、`013950`、`014050`、`014100b/c/d`、`014110`、`014120`、`014150`、`014180`、`014250`、`014350`、`014450`、`009500`、`009600`）全部 404；沙錐頁的編號本來就沒有算術規律（針尾 `014000`、大沙錐 `014100a`、扇尾 `014200`）。因此本卡改以《香港鳥類名錄 2024》第 128 項（Category I、**NT**）、紀錄委員會 2024 年決定（2023-04-23 塱原唯一一筆紀錄獲通過列入 Category I）、澳洲政府 EPBC 保育建議（29–33 cm、單型種、繁殖於北海道與本州／俄遠東、整個族群越冬於澳洲東部）、以及同屬的大沙錐頁面 `014100a` 作對照來源，並在 `notes` 明示此事。
- **app 三份資料都缺 0173**：`explorerIndex.json`、`cardDetails.zh.json`、`dexScores.json` 均無此 id（目前 43 個 id 缺 explorerIndex，但其中只有 0014、0053、0054、0059、0084、0117、0124、0173 八個是已登記卡）。比照既有前例**不補造資料**：六軸與綜合顯示「待查」，卡面加「待查非零分」與「綜合評分待查」，`missingScores` 六項全列。沒有改 `len`、沒有重建 `explorerIndex`／`dexScores`，因為那等於替缺資料的物種編造食性、棲地與體長；要補就應補真實資料，另案處理。
- IUCN **近危 NT**：2022 年由 LC 上調（澳洲越冬地乾旱、族群大減），香港名錄 2024 亦標 NT。香港至今只有一筆紀錄，卡面把「全球近危」與「香港極罕見」分開寫，不寫成香港常見受脅鳥。
- 全身圖與近景圖都是本卡新繪。**第一次生成風格走樣**（像素太細、蘆葦與水面細節太多，偏照片化），已重繪成與 0155–0172 一致的扁平色塊風格；主圖改用「乾淨藍灰水面 + 少量平塗泥斑」，避免雜訊。近景圖保留左側小全身 + 右側大頭兩段構圖。
- 四圈共試 13 個候選，全部取自**全身圖**（`featureSources` 全為 `pixel.png`），因為近景圖裁到頭部時羽紋比例與全身圖不一致：
  - 第 1 圈（嘴）放棄只框嘴的窄框（背景太空、只剩一條斜線），改用 `[0.46,0.06,0.98,0.58]`，把嘴與頭、頸、胸部羽紋一起入鏡。
  - 第 2 圈（眉紋）用 `[0.48,0.14,0.68,0.36]`，完整保留眼前那段最粗的白眉與深色頰紋；再寬一點就會切到嘴基。
  - 第 3 圈（背紋）用 `[0.15,0.30,0.42,0.57]`，讓一列列淡色縱紋斜向通過圓圈，避免平行橫帶那種「一堆線」的觀感。
  - 第 4 圈（腹部與腿）試到第 5 個候選才對：太貼邊只剩兩根腿，`[0.20,0.44,0.52,0.87]` 同時有淡色腹部細橫斑與青綠灰色短腿、腳趾。
- 比較鳥沿用已核對素材：大沙錐用 0159 的全身圖（`swinhoes-snipe.png`，即 `0159/pixel.png` 原檔複製）、針尾沙錐用 0157 的比較鳥（`pintail-snipe.png`）。兩者都以 `framing: "whole-bird"` 縮到 78% 放入圓圈，避免切掉嘴尖或尾端。
- 地圖 15 個 ISO3：繁殖地（JPN、RUS、KOR、PRK）與越冬地（AUS、NZL、PNG、SLB、NCL、IDN、TLS）分佈在兩端，中途遷移記錄的 CHN、TWN、PHL、VNM 一併標示；已用 geojson 核對 15 個代碼全部存在（HKG、GUM、MNP、PLW、FSM、VAN 不在 110m 底圖，未使用）。

## 0174 黃腳三趾鶉 _Turnix tanki_（LC 無危）

- Drive：`1NzV5e-Xd3lj0ANduhjYCyZeGM6MTpadb`，149145 B，MD5 `a704f893d7456bec7ef64d2d3c5c826e`。
- 四部位：黃色的嘴／白色的虹膜／黑斑配淡色羽緣／黃色的腳與三趾；比較鳥 棕三趾鶉 + 鵪鶉（**兩隻都是本卡新繪**）；19 ISO3；score 2.9。
- HKBWS 頁面在 `0070/009400`（**不是** 0100 段，三趾鶉科歸在鶴形目／秧雞那一組目錄）：Category I、稀有過境鳥，偏好濃密草地但幾乎任何非濕地環境都可能出現；15–18 cm，只有日本鵪鶉約 75% 大小；嘴大部分黃色、腳黃色、白色虹膜配大黑瞳孔造成「驚訝」表情；肩羽與覆翅黑心配淡黃至灰色羽緣；雄鳥頭與下體橙褐、雌鳥與幼鳥較灰；秋季 9 月 20 日至 11 月 23 日、高峰 10 月第一週至 11 月第一週，多為一兩隻，冬季三筆、春季只有 1962 年一筆（可能逃逸）。IUCN LC、趨勢穩定，`cardDetails` 也是 LC，不必改。
- **分數齊全**：`i 2／a 3.3／v 2.9／r 3.3／c 3／o 2.9`，`missingScores: []`，與 runtime 一致，沒有補值。
- 卡面用成鳥雄鳥（頭與下體橙褐、胸側圓形黑點）；雌鳥較大較灰、後頸有寬紅褐項圈，只寫在 notes——香港多數是過境途中撿到的疲弱個體，性別不一定可靠。
- **兩隻比較鳥都是新繪**：棕三趾鶉（灰嘴灰腳、脅部黑橫斑、成鳥雌鳥胸部黑）與鵪鶉（暗角質嘴、淡粉灰腳、尾長而尖），日後做 0175 棕三趾鶉時可直接沿用 `0174/barred-buttonquail.png`。
- 四圈試了 14 個候選，最麻煩的是第 1 圈（嘴）與第 4 圈（腳）：
  - 第 1 圈在全身圖上無論怎樣框，都會把白眼或半個頭拖進來（`[0.63,0.19,0.88,0.40]` 只框到嘴但切掉頭、`[0.70,0.19,0.90,0.34]` 背景太空）；最後改用**近景圖**最右端的 `[0.80,0.22,1.00,0.50]`，嘴與嘴尖深色、臉部羽紋同時入鏡。
  - 第 4 圈（黃腳與三趾）在全身圖上框太鬆會只剩兩根腿、太緊只剩腳趾；`[0.36,0.62,0.62,0.86]` 同時保留腹部橙褐與黑點、兩條黃腿與張開的三趾（已用 2 倍放大核對腳趾數目）。
  - 第 2 圈改用全身圖 `[0.56,0.12,0.78,0.34]`，白色虹膜、黑色瞳孔與黃色嘴基一起入鏡，比近景圖的極特寫更能看出「驚訝」表情。
- 地圖 19 個 ISO3：南亞（PAK、IND、NPL、BTN、BGD、LKA）、東南亞（MMR、THA、LAO、KHM、VNM、MYS、IDN、PHL）、東亞（CHN、TWN、KOR、PRK、RUS）；HKG 與 SGP 不在 110m 底圖，未使用。
- notes 特別寫明：三趾鶉科雌鳥較大較鮮豔、由雄鳥孵蛋育雛，與真正的鵪鶉（雞形目）親緣很遠，比較欄只是外形對照。

## 0175 棕三趾鶉 _Turnix suscitator_（LC 無危）

- Drive：`1QU6xxSdsuNy24Ev5a6RzhLfmUyvhRhUV`，149389 B，MD5 `60dacac431e616769ab601511f07153c`。
- 四部位：灰藍色的嘴／淡黃色的眼睛／脅部黑白橫斑／灰藍色的腿；比較鳥 黃腳三趾鶉 + 鵪鶉；18 ISO3；score 2.9（`vEst: 1`）。
- HKBWS 頁面 `0070/009500`：Category I、稀少秋季過境鳥，另有一筆隆冬紀錄；13–17 cm，與較常見的黃腳三趾鶉體型結構相近，分別在**灰嘴灰腳**、胸部沒有明顯紅褐色調、脅部有黑橫斑、翅覆羽偏沙色、成鳥雌鳥胸部近黑；香港自 1958-12-06 首筆至今約 25 筆，多在 9 月最後一週至 11 月底、以 10 月 1–26 日最多，另有 8 月兩筆與 1973-02-04 一筆隆冬紀錄；2022 年 6 月大欖郊野公園首次確認繁殖（紅外相機拍到雄鳥帶三隻雛鳥）。IUCN **LC、趨勢上升**（`cardDetails` 也是 LC，不必改）。
- **全身圖由上一張的比較鳥升格**：`0174/barred-buttonquail.png` 直接複製為本卡 `pixel.png`，重新核對灰嘴灰腳、脅部橫斑與胸部近黑；近景圖（左小全身 + 右大頭）本卡新繪。兩張卡的沙色調、黑斑密度一致。
- 比較鳥兩隻都沿用 0174 已核對素材（`yellow-legged-buttonquail.png` = `0174/pixel.png`、`japanese-quail.png` 原檔），非等比例；0174 與 0175 互相把對方當比較鳥，形成一組對照。
- 四圈共試 11 個候選：
  - 第 1 圈（灰嘴）是全卡最難的一圈：近景圖的嘴貼在畫面右緣，`[0.86,0.28,1.00,0.42]` 只剩半張嘴、`[0.70,0.22,0.94,0.50]` 又把眼睛拖進來；最後用 `[0.84,0.25,0.99,0.46]`，嘴的上下緣、嘴角與臉部沙色羽紋同時入鏡。
  - 第 2 圈（淡黃眼）用近景圖 `[0.74,0.24,0.88,0.38]`，眼球剛好居中，能看出淡黃虹膜與深色瞳孔。
  - 第 3 圈（脅部橫斑）試了 7 個候選：全身圖這一帶是幾乎平行的黑橫帶，框太寬就變成「一堆斜線」，最後 `[0.46,0.44,0.66,0.62]` 讓橫斑斜向通過圓圈並保留上方的沙色肩羽。
  - 第 4 圈（灰腿）用 `[0.44,0.68,0.68,0.88]`，兩條灰腿與三根前趾、腳下的乾草一起入鏡（已放大核對趾數）。
- 卡面採用成鳥雌鳥（胸部近黑、脅部橫斑最清楚）；雄鳥胸部較褐、斑紋較柔，只寫在 notes。
- 地圖 18 個 ISO3：南亞（PAK、IND、NPL、BTN、BGD、LKA）、東南亞（MMR、THA、LAO、KHM、VNM、MYS、PHL、IDN、BRN）、東亞（CHN、TWN、JPN）；HKG 與 SGP 不在 110m 底圖，未使用。
- 特別寫明：三趾鶉科雌鳥較大較鮮豔、由雄鳥孵蛋育雛，與真正的鵪鶉（雞形目）親緣很遠，比較欄只是外形對照；2022 年首次確認繁殖也不改寫成「香港常見留鳥」。

## 0176 普通燕鴴 _Glareola maldivarum_（LC 無危）

- Drive：`1H3V2Mp2AwsWn0WeFb8cX0xbIXNVzHnhW`，143008 B，MD5 `830f30f3fbf69c7e1a908daac69bafd4`。
- 四部位：紅色的嘴基／圈住喉部的黑線／長翼伸出短尾／白色的腹部；比較鳥 灰燕鴴 + 黑翅燕鴴（**兩隻都是本卡新繪**）；23 ISO3；score 2.7（`vEst: 1`）。
- HKBWS 頁面 `0100/015600`（兩 chunks 全讀）：Category I，**春季常見、秋季不常見、夏季稀少**；23–25 cm，是「像燕鷗一樣在空中捕蟲」的涉禽，也會在地面短腿奔跑；欖褐色背、深色翼、淡黃褐頭胸（脅部較亮）、純白腹與尾下覆羽、短灰腿、短嘴配**紅色嘴基與很寬的嘴裂**；最關鍵是那條由眼向下繞住喉部的黑線。IUCN LC、趨勢**下降**（`cardDetails` 也是 LC，不必改）。
- 數量資料寫進 notes：1999 年起春季 2 月初至 5 月、高峰 3 月下半至 4 月前三週；1999 後春季最高 191 隻（2020-03-22），歷史最高 200 隻（1979-04-14 米埔）；秋季 2011-09-19 單日 250 隻南遷、1994-10-05 米埔與尖鼻嘴 530 隻。
- 2018 年**首次確認繁殖嘗試**（5 月 26 日求偶餵食、6 月 3 日見巢，其後大雨淹沒；6 月 9–15 日最多 23 隻含 9 隻幼鳥）。卡面寫「嘗試」，不寫成已在香港穩定繁殖。
- **第一次生成的全身圖把 "wide gape" 畫成張口鳴叫**（嘴張開、紅色口腔明顯），與卡面其餘靜態站姿不一致；已重繪為閉嘴版本。近景圖一直是閉嘴大頭，可直接比對。
- 四圈試了 8 個候選：
  - 第 1 圈（紅嘴基）`[0.70,0.20,1.00,0.52]`：嘴基的紅色、深色眼先與淡黃褐喉部一起入鏡；再緊一點只剩一條紅線。
  - 第 2 圈（喉部黑線）`[0.66,0.24,0.92,0.60]`：完整保留那圈「項圈」，包含下方繞回的一段。
  - 第 3 圈（長翼伸出短尾）試了 7 個候選：全身圖這一帶是幾片平行的深褐飛羽，貼邊框會變成一片深色；最後 `[0.05,0.46,0.34,0.70]` 讓翼尖形成斜向楔形、下方還帶一點白色腹部作對比。
  - 第 4 圈（白腹）`[0.34,0.50,0.62,0.66]`：深色翼緣在上、乾淨白腹在下，貼邊就會切掉翼緣對比。
- 比較鳥兩隻都是新繪：灰燕鴴（淡灰沙色、白眼圈、深灰初級飛羽）與黑翅燕鴴（全黑翼上覆羽、次級飛羽無白後緣）；兩者非等比例，只作外形對照，卡上不作完整檢索表。
- 地圖 23 個 ISO3：東北亞繁殖地（CHN、MNG、RUS、PRK、KOR）、南亞（IND、PAK、NPL、BTN、BGD、LKA）、東南亞（MMR、THA、LAO、KHM、VNM、MYS、IDN、BRN、PHL、TLS）、越冬地（PNG、AUS）；HKG 與 SGP 不在 110m 底圖，未使用。

## 0177 灰燕鴴 _Glareola lactea_（LC 無危）

- Drive：`1ViRC_CJL8LRp0y-BkS6CUthMrUgI3Roy`，140589 B，MD5 `b5a1913892f1af6293a05b6bf326ce3d`。
- 四部位：深紅色的嘴基／眼後最寬的白眼圈／深灰的初級飛羽／純白的下腹；比較鳥 普通燕鴴 + 黑翅燕鴴；17 ISO3；score 2.9，**`a` 待查**（`missingScores: ["a"]`）。
- HKBWS 頁面 `0100/015700`：Category I、**偶見鳥（Accidental）**；15–19 cm，燕鴴裡最小最淡，淡灰沙色、額與眼先深色、**白眼圈在眼後最寬**、初級飛羽與腿都是深灰、胸以下純白、嘴基深紅；飛行時翼下覆羽黑色、次級飛羽白帶寬灰端、尾黑色。IUCN LC、趨勢未知（`cardDetails` 也是 LC，不必改）。
- **香港只有一筆紀錄**：2017-04-04 新田魚塘（Lee 2019,《香港鳥類報告 2017》）。卡面把「全球無危」與「香港僅一筆」分開寫，不寫成過境鳥。
- **全身圖由上一張的比較鳥升格**：`0176/small-pratincole.png` 複製為本卡 `pixel.png`，重新核對白眼圈、深灰初級飛羽與純白下腹；近景圖（左小全身 + 右大頭）本卡新繪。0176／0177 互相把對方當比較鳥。
- 四圈共試約 8 個候選，**第 1 圈試了兩輪**：原本用近景圖 `[0.80,0.20,0.99,0.34]`，但近景圖顯示紅色嘴基集中在這隻鳥的嘴裂位置、比例偏厚，圓圈裡像一團紅；改用全身圖 `[0.72,0.14,0.99,0.36]` 後，深紅嘴基、黑嘴尖與淡灰臉頰的比例才正確（渲染後重新看圓圈確認）。
  - 第 2 圈（白眼圈）用近景圖 `[0.62,0.15,0.84,0.33]`：整圈白環與其後方最寬的部分都在圈內，眼後的寬度是標籤的重點。
  - 第 3 圈（深灰初級飛羽）用全身圖 `[0.10,0.46,0.44,0.64]`，深灰飛羽斜掠而過，上方保留淡灰沙色的翼覆羽作對比。
  - 第 4 圈（純白下腹）用全身圖 `[0.50,0.44,0.80,0.66]`，深色翼緣壓在上方、下方是乾淨的白。
- 分數 `i 2／v 3.7／r 4.8／c 1.2／o 2.9`，`vEst: 1`；**適應力 a 無資料**，卡面顯示「待查」並加「待查非零分」，沒有補零、沒有重算綜合 2.9。
- 地圖 17 個 ISO3：南亞（AFG、PAK、IND、NPL、BTN、BGD、LKA）、東南亞（MMR、THA、LAO、KHM、VNM、MYS、IDN、PHL）、華南與台灣（CHN、TWN）；HKG 與 SGP 不在 110m 底圖，未使用。

## 0178 中賊鷗 _Stercorarius pomarinus_（LC 無危）

- Drive：`1srZ9tj8HGacl-4R8olBhi2WlwHlrepRp`，142616 B，MD5 `45cbbb4494566e26afd7c5ddcfe3a62e`。
- 四部位：匙狀的中央尾羽／深色頭頂＋黃色的頸側／深褐斑點的胸帶／初級飛羽的白色閃光；比較鳥 短尾賊鷗 + 長尾賊鷗（**三隻都是本卡新繪**）；8 ISO3；score 3.1（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0130/019000`：Category I，**罕見的春季過境鳥**，秋季多為颱風吹來的偶發紀錄，另有 2 月 10 日一筆冬季紀錄；42–50 cm（不含尾羽延長），是香港最大的賊鷗，身體厚重、頭圓、嘴大，飛行沉穩有力；淡色型成鳥背褐、腹白、深色頭頂延伸到眼下、**頸側有明顯黃褐色調**、**深褐濃密斑點的胸帶**（雄鳥較完整）、初級飛羽基部一大塊白色；**中央尾羽寬圓呈匙狀**；幼鳥尾羽延長短而圓、翼下有雙道淡色帶；全部紀錄都在海上，主要來自蒲台島與出海調查。IUCN LC、趨勢**穩定**。
- 數量資料寫進 notes：春季 3 月第三週至 5 月中（最晚 2008-05-16）；秋季首筆 1993-09-26（香港第一筆紀錄，Leader & Leven 1995），1998-10-26 單日 **47 隻**為最高紀錄，1993-11-05 另有 2 隻。
- 比較鳥也是本卡新繪：短尾賊鷗（37–44 cm，頭小嘴細，頭頂較淡且不伸到嘴裂以下，胸帶弱、脅部無濃斑，尾羽細長而尖）與長尾賊鷗（35–41 cm，界線分明的黑色小帽、下腹均勻灰、翼下無淡色區、尾羽近兩倍長）；三者非等比例。
- 身長採 HKBWS 的 42–50 cm（不含尾羽延長）；`cardDetails.zh.json` 的 46–67 cm 是含尾羽延長的量法，兩者不衝突，卡面與 notes 說明定義，不改 `cardDetails`。體重 540–920 g 保留。
- 四圈試了 15 個候選（`0178-r1`…`0178-r14`）：
  - 第 1 圈（匙狀尾羽）`[0.00,0.50,0.30,0.80]`：兩支槳狀尾端完整入鏡，下方帶一點海面與岩面，比 `[0.02,0.54,0.36,0.84]` 更居中（後者尾端被圓邊切掉）。
  - 第 2 圈（頭頂＋黃頸側）改用近景圖 `[0.56,0.14,0.86,0.42]`：**全身圖這一帶的頭部試了兩個框（`[0.63,0.15,0.86,0.34]`、`[0.62,0.14,0.94,0.36]`），嘴都只剩一條細線、眼也被切掉**，近景圖才有完整的深色頭頂、眼與黃色頸側三者同框。
  - 第 3 圈（斑點胸帶）`[0.60,0.50,1.00,0.80]`：取近景圖胸前斑點最密的一段；更早的 `[0.66,0.36,0.94,0.64]` 與 `[0.68,0.50,0.96,0.74]` 都只剩零散幾顆點，看不出「帶」。
  - 第 4 圈（白色閃光）`[0.26,0.47,0.47,0.63]`：白色翼斑斜過深褐飛羽，上方留住翼覆羽的層次；更寬的 `[0.16,0.44,0.46,0.62]` 讓白斑偏到圓邊。
- 分數 `i 2／a 3.3／v 4.4／r 4.8／c 1.2／o 3.1`，無缺值，卡面沒加「待查」。
- 地圖 8 個 ISO3：北極圈附近的繁殖國家（RUS、CAN、USA、GRL、ISL、NOR、SWE、FIN）；冬季在海上、沒有國家可標，故不列越冬地。NOR 在 110m 底圖的 `ISO_A3` 是 `-99`，渲染依 `ADM0_A3` 上色，實際綠得起作用。

## 0179 短尾賊鷗 _Stercorarius parasiticus_（LC 無危）

- Drive：`1hU5ZuCotqKGcBK2_M3GJjRbZ99OuH1-t`，136075 B，MD5 `07ef38cd918ce6ef301527a15914138a`。
- 四部位：細長而尖的中央尾羽／頭頂範圍窄＋嘴基淡斑／頸側的黃褐色調／翼上的白色閃光；比較鳥 中賊鷗 + 長尾賊鷗；9 ISO3；score 3.0（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0130/019100`：Category I，**春季海上稀少過境鳥**；37–44 cm（不含尾羽延長）；飛行快如隼，頭較小、嘴較細；深色頭頂較淡較窄、**不伸到嘴裂以下**，嘴基上方有一小塊淡斑，胸帶不明顯、脅部無濃密斑點；**中央尾羽細長而尖**，比尾端再伸出數公分；香港無鳴叫紀錄，典型短叫是「kyeeow」。IUCN LC、趨勢**穩定**。
- 數量資料寫進 notes：1999-05-01／02 颱風逼近時首次紀錄（Turnbull 2004），2005 年起幾乎每年，最早 2020-03-21、最晚 2009-06-19，多集中 4 月至 5 月上半；最高 16 隻（5 月 2 日颱風中的鶴咀），其次 2012-04-01 蒲台島外海 10 隻，多數單日不超過 6 隻且多為成鳥；另有一隻追逐三趾鷗的觀察。
- **全身圖由上一張的比較鳥升格**：`0178/parasitic-jaeger.png` 複製為本卡 `pixel.png`，重新核對尾羽、頭頂範圍、嘴形與白斑；近景圖（左小全身 + 右大頭）本卡新繪。比較鳥中賊鷗（`pomarine-jaeger.png` = `0178/pixel.png`）與長尾賊鷗沿用 0178 已核對的圖；0178／0179 互相把對方當比較鳥。
- 身長採 HKBWS 的 37–44 cm（不含尾羽延長）；`cardDetails.zh.json` 的 41–48 cm 是含尾羽延長的量法，兩者不衝突，卡面與 notes 說明定義，不改 `cardDetails`。體重 300–650 g 保留。
- 四圈試了 34 個候選（`0179-r1`…`0179-r33`），是本批最難的一張——尾羽與白斑都細，框大一點就只剩天空：
  - 第 1 圈（細長尾羽）`[0.02,0.47,0.34,0.61]`：兩條長針斜過天空，末端完整在圈內；更寬或更高的框會把針切斷。
  - 第 2 圈（窄頭頂＋嘴基淡斑）改用全身圖 `[0.62,0.13,0.90,0.41]`：整顆頭連嘴基淡斑一起入鏡；**近景圖的頭部試了 10 個以上框，眼與嘴的比例都偏大、嘴幾乎貼邊**，全身圖比例正確。
  - 第 3 圈（黃褐色頸側）用近景圖 `[0.68,0.24,0.86,0.44]`：眼、深色頭頂下緣與整片黃褐頸側同時可見；更靠邊的框只剩一片米黃。
  - 第 4 圈（白色閃光）用全身圖 `[0.28,0.43,0.50,0.57]`：白斑橫過深褐翼面、下方留住白色胸腹；`[0.30,0.45,0.48,0.55]` 太扁，白斑被圓邊吃掉。
- 地圖 9 個 ISO3：北極圈苔原的繁殖國家（RUS、CAN、USA、GRL、ISL、NOR、SWE、FIN、GBR，含蘇格蘭族群）；冬季在南半球近岸海域、沒有國家可標，故不列越冬地。

## 0180 長尾賊鷗 _Stercorarius longicaudus_（LC 無危）

- Drive：`1fcOTGDzJaxTXXIPE0d_xFo3sDdOhlPM9`，137171 B，MD5 `478651737194d47542ec3c237d52b3c3`。
- 四部位：超長的中央尾羽／界線分明的黑色小帽／均勻灰色的下腹／覆羽與飛羽的深淺差；比較鳥 中賊鷗 + 短尾賊鷗；**6 ISO3**；score 2.1（六軸齊全，無 `vEst`，研究值只有 1.0 照實顯示）。
- HKBWS 頁面 `0130/019200`：Category I，**春季海上與近岸的稀少過境鳥**，秋季紀錄全是颱風吹來的；35–41 cm（不含尾羽延長），三種賊鷗裡最小最纖細、翼更長更窄、飛行輕盈如燕鷗；成鳥**中央尾羽幾乎兩倍尾長**、翼下**沒有淡色區塊**、翼上飛羽只比覆羽略深、下腹是**均勻的灰**；黑色小帽界線分明。IUCN LC、趨勢**穩定**。
- **本種是三種賊鷗裡唯一會在近岸大量出現的**：米埔與大鵬灣都有紀錄，近年的出海調查顯示它其實定期經過外海；且比另外兩種更常成群，常先被看到停在海面。
- 數量資料寫進 notes：首筆 1976-05-09 米埔（Viney 1978），1991-05-19 萬宜水庫；春季最早 2006-03-12，主群 4 月至 5 月第一週，最晚 1991-05-19 與 2012-06-03；秋季全為颱風相關——1993 年鶴咀 8/21 三隻、9/26 一隻、11/5 一隻，1998-10-26 鶴咀 **37 隻**，2013-09-23 米埔自然保護區 3 隻。
- **全身圖由 0178 的比較鳥升格**：`0178/long-tailed-jaeger.png` 複製為本卡 `pixel.png`，重新核對黑帽邊界、灰色下腹與長尾針；近景圖本卡新繪。比較鳥中賊鷗（`0178/pixel.png`）與短尾賊鷗（0179 主圖）沿用已核對的圖，非等比例——0178／0179／0180 三張賊鷗卡彼此互為比較鳥。
- 身長採 HKBWS 的 35–41 cm（不含尾羽延長）；`cardDetails.zh.json` 的 38–58 cm 是含尾羽延長的量法，兩者不衝突，卡面與 notes 說明定義，不改 `cardDetails`。體重 230–444 g 保留。
- 四圈試了 19 個候選（`0180-r1`…`0180-r19`）：
  - 第 1 圈（超長尾羽）`[0.12,0.50,0.40,0.76]`：兩根長針完整斜過天空、末端都在圈內；更高的框會讓針變得太細太淡。
  - 第 2 圈（黑色小帽）用近景圖 `[0.63,0.13,0.93,0.42]`：黑帽、眼、淡灰臉頰與嘴基三者同框；全身圖的頭部試過 `[0.62,0.13,0.90,0.41]`，帽子的邊界不夠清楚。
  - 第 3 圈（灰色下腹）`[0.52,0.44,0.78,0.60]`：上方深色翼、下方整片均勻灰腹，翼下沒有白；這個「灰」是與另兩種分開的關鍵。
  - 第 4 圈（覆羽與飛羽深淺差）`[0.44,0.40,0.68,0.54]`：翼面兩層羽毛的界線入鏡；試過 6 個更緊或更寬的框，太緊只剩一片褐、太寬就混進天空。
- **第 1 圈標籤改寫一次**：原「近乎兩倍尾長的中央尾羽」在 238px 欄寬裡被截成「近乎兩倍尾長的中央⋯」，改成「超長的中央尾羽」後完整顯示；細節留在 notes。
- 地圖 6 個 ISO3：北極圈苔原的繁殖國家（RUS、NOR、SWE、FIN、CAN、USA）；HKBWS 明寫繁殖分佈「幾乎環北極、但排除格陵蘭大部分地區」，故**不標 GRL**；冬季在南半球外海、沒有國家可標，不列越冬地。

## 0181 扁嘴海雀 _Synthliboramphus antiquus_（LC 無危）

- Drive：`122_i2GPN8JPWKC-FM1GxBYk3wIGlIE46`，137025 B，MD5 `0a86a17fa70379ccb87d9d29f2a010c2`。
- 四部位：不伸到眼前的白色眉線／短而尖的灰白嘴／頸側的黑色半環／背上的白色縱紋；比較鳥 冠海雀 + 三趾鷗（**兩隻都是本卡新繪**）；7 ISO3；score 2.8（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0130/019300`：Category I，**春季海上稀少過境鳥**，秋冬季罕見且較可能在近岸出現；體型極小、嘴短基部厚而尖；繁殖羽黑頭黑喉、**白眉不伸到眼前**、嘴淡色，飛行時可見白色翼下與**頸側黑色半環**；非繁殖羽黑由下巴延伸到後頸、白色沿眼後上揚。IUCN LC、趨勢**下降**。
- 數量資料寫進 notes：首筆 1975-05-18 吉澳洲北岸（Viney 1976）；1975–1998 共 17 筆 30 隻（11/26–5/18），含 1996-04-06 大鵬灣 7 隻、1997-02-27 港島南 5 隻；1999 年後約 70 筆，最高 2006-02-19 南區 9 隻；蒲台島海面 2/23–4/21 每天最多 6 隻往東北飛；極端日期 11/26 與 5/29。
- **身長只有英制**：`cardDetails.zh.json` 是「7.9–9.4 in」，沒有公制；卡面照 app 資料顯示，notes 補上約 20–24 公分換算，沒有自己編一段公分區間。體重 5.4–8.8 oz（約 153–250 g）同樣保留。
- 比較鳥兩隻都是新繪：冠海雀（有冠羽、頭頂兩側白、下喉無黑、嘴略粗）與三趾鷗（38–41 cm 的中型鷗、中灰背、翼尖全黑、黃嘴黑腳）；兩者非等比例，只作外形對照。三趾鷗的頁面另查 `0110/016000`（VU，最後紀錄 2014 年）。
- 四圈試了 10 個候選（`0181-r1`…`0181-r10`）：
  - 第 1 圈（白眉線）`[0.63,0.24,0.89,0.42]`：白眉與其前方那一小截黑額同時在圈內，正是「不伸到眼前」的重點；再往左就會把白眉切斷。
  - 第 2 圈（灰白嘴）`[0.50,0.31,0.68,0.46]`：短嘴的厚度、尖端與淡角質色都看得出來；更緊只剩嘴尖一條灰線。
  - 第 3 圈（黑色半環）`[0.66,0.50,0.86,0.66]`：上方白頰、下方白胸，中間那條黑半環完整橫過。
  - 第 4 圈（白色縱紋）`[0.80,0.50,1.00,0.74]`：灰背上的細白縱紋排成一列；這一圈貼到右邊界，但羽毛本身完整。
- 地圖 7 個 ISO3：北太平洋繁殖與越冬國家（RUS、USA、CAN、JPN、KOR、PRK、CHN）。

## 0182 冠海雀 _Synthliboramphus wumizusume_（**VU 易危**）

- Drive：`1SwvplhZsmYY6KMOWMCwsvC99sajImjyx`，138805 B，MD5 `111ca9c08aba9739db69d5d898f211fe`。
- 四部位：額前翹起的冠羽／頭頂兩側的白斑／下喉是白的／嘴脊的深色線；比較鳥 扁嘴海雀 + 三趾鷗；**3 ISO3**；score 3.7（六軸齊全，無 `vEst`，**保育 4.0 是本批最高**）。
- HKBWS 頁面 `0130/019400`：Category I、**偶見鳥**；24–26 cm，與扁嘴海雀相似，但繁殖羽有**冠羽**、頭頂兩側白斑更多、**下喉沒有黑色**、嘴略粗；非繁殖羽頭部較淡、深色頭頂範圍較小；叫聲是高音的「cheeoo」或「chirroo」，很像雀形目。**IUCN 易危 VU、族群快速下降**（繁殖地干擾、掠食與流刺網）。`cardDetails` 也是「易危 VU」，不必改。
- **香港只有兩筆**：2007-05-05 與 2012-04-21，兩隻都在南區海域，而且**兩隻都是飛羽受損的個體**。卡面把「全球易危」與「香港偶見、僅兩筆」分開寫。
- `cardDetails` 的背景資料（2017 年估計全球僅 2,500–10,000 隻、最稀有海雀之一；日本 1975 年列為國家自然紀念物）寫進 notes，不作卡面主標。
- **全身圖由上一張的比較鳥升格**：`0181/japanese-murrelet.png` 複製為本卡 `pixel.png`，重新核對冠羽、頭頂白斑、下喉白與嘴形；近景圖本卡新繪（冠羽畫得更翹更明顯）。比較鳥扁嘴海雀（`0181/pixel.png`）與三趾鷗沿用已核對的圖；0181／0182 互相把對方當比較鳥。
- 身長 24–26 cm、體重 164–183 g，與 `cardDetails` 一致。
- 四圈試了 15 個候選（`0182-r1`…`0182-r14`）：
  - 第 1 圈（冠羽）`[0.505,0.125,0.665,0.325]`：整撮尖冠羽對著天空，是最清楚的一種拍法；全身圖的冠羽較小，切太緊只剩幾個像素。
  - 第 2 圈（頭頂白斑）`[0.72,0.19,0.98,0.39]`：多道白色條斑沿頭頂與後頸排列；再往左就只看到一片黑。
  - 第 3 圈（下喉白）`[0.64,0.40,0.84,0.60]`：黑上喉與白下喉的分界斜過整個圈；貼邊會把分界切掉。
  - 第 4 圈（嘴脊深色線）`[0.45,0.30,0.66,0.46]`：藍灰的嘴連嘴脊那條深線一起入鏡；全身圖的嘴太小，只有 4–5 個像素。
- 地圖 3 個 ISO3：JPN（繁殖地）、TWN 與 CHN（僅迷鳥紀錄）；綠色非全境。

## 0183 三趾鷗 _Rissa tridactyla_（**VU 易危**）

- Drive：`1IJyKkhvD2IaaFaCWeqnzrrVOczR_wCzp`，126866 B，MD5 `93c4f727597a4de08449c0c9dc4b32dc`。
- 四部位：一片全黑的翼尖／短小的黃色嘴／黑色的三趾腳／中灰色的背；比較鳥 紅嘴鷗 + 棕頭鷗（**兩隻都是本卡新繪**）；8 ISO3；score 3.8（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0110/016000`：Category I、**冬末與春季的罕見訪客**；38–41 cm，中等體型、翼較窄、腳短的優雅鷗；第一齡冬羽在灰色上翼有明顯的黑色 M 形；成鳥上體中灰，**翼尖界線分明地全黑、沒有白斑**（只有最外側初級飛羽的外瓣在近距離看是黑的），冬季出現深色耳斑與暗色後頸；嘴黃（冬季較鈍）、腳黑。**IUCN 易危 VU、族群過去三個世代快速下降**，原因可能是氣候變遷導致的食物減少。
- **香港紀錄**：1975-02-20 首筆（Viney 1976），平均約每兩年一筆，多集中在 2006–2014；全部落在 1 月 13 日至 4 月 19 日與 5 月 22 日的冬末春季；2006 年後南區（尤其蒲台島）觀察強度提高，是紀錄變多的主因；**2014 年之後沒有紀錄**。全球易危與香港罕見分開寫。
- 比較鳥兩隻都是本卡新繪：紅嘴鷗（`black-headed-gull.png`，37–43 cm，深巧克力褐頭罩、深紅嘴腳、翼前緣白邊）與棕頭鷗（`brown-headed-gull.png`，41–45 cm，嘴更深、頭更大、淡色虹膜、白色新月斑、翼尖兩個大白斑）；非等比例，只作外形對照。兩頁分別查 `0110/016300`（LC，趨勢 unknown）與 `0110/016200`（LC，穩定）。
- **全身圖與近景圖全部新繪**：0181／0182 那隻三趾鷗只是 0181 的比較鳥，升格成本卡主角時重新生成 `pixel.png`；`features.png` 是「左全身＋右大頭」的兩段構圖，第 2、3、4 圈取自右側大頭與左側全身。
- 四圈試了 30 個候選（`0183-r1`…`0183-r30`）：
  - 第 1 圈（全黑翼尖）`[0.67,0.545,0.895,0.735]`（`pixel.png`）：黑翼尖整片斜過圓心，左上有灰背與白後緣當襯底，右側留一點天空；這一圈是唯一同時容得下「黑得乾淨」與「沒有白斑」兩件事的取景。
  - 第 2 圈（黃嘴）`[0.52,0.36,0.72,0.56]`（`features.png`）：大頭圖的嘴，黃色嘴身、深色嘴尖與嘴裂線全部在圈內。
  - 第 3 圈（黑腳）`[0.14,0.58,0.36,0.78]`（`features.png`）：兩隻腳連蹼帶石頭一起入鏡，看得出「短」；切更緊只剩單腳。
  - 第 4 圈（中灰背）`[0.74,0.66,0.98,0.90]`（`features.png`）：大頭圖右下的灰背大特寫，均勻無花紋；全身圖的背太小、對比不足。
- 地圖 8 個 ISO3：環北極繁殖海岸（RUS、USA、CAN、GRL、NOR、ISL、GBR、JPN）；HKBWS 寫明香港屬 _R. t. pollicaris_（東西伯利亞至西阿拉斯加繁殖、太平洋越冬）；冬季在大洋上、無國家可標，故不列越冬海域。

## 0184 黑嘴鷗 _Saundersilarus saundersi_（**VU 易危**）

- Drive：`1Q_QfHcoQ_doQrDSAJJKc1LtriVX9qda3`，131907 B，MD5 `18d49b65bd8dc49e201c7ab482d89da1`。
- 四部位：短而厚的黑嘴／眼周的白色新月／白尖的黑色翼尖／深紅色的腳；比較鳥 紅嘴鷗 + 小鷗（紅嘴鷗沿用 0183 已核對的圖，小鷗為本卡新繪）；5 ISO3；score 4.2（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0110/016400`：Category I、**后海灣的不常見冬候鳥**，1990 年代中期之後明顯減少；29–32 cm，比紅嘴鷗略小、嘴**短而厚**；繁殖羽黑頭黑後頸，眼周有大片白新月，黑色初級飛羽具寬白尖；非繁殖羽只有眼後一塊黑斑並淡淡延伸到頭頂；腳深紅。**IUCN 易危 VU、族群估計 14,400 隻且正在下降**（潮間帶填海、繁殖地干擾）。
- 香港數字照 HKBWS：1989/90–1997/98 冬季高峰通常 >100 隻（1994-02-10 最高 172 隻）；1999/2000 年後除了一年 114 隻，其餘都 <75；1990 年代平均高峰 115 → 2010/11 之後 66。HKBWS 明言 2005 年前中國沿岸缺乏調查、無法確證下降，暖冬讓鳥留在北方也是可能，兩說都寫。
- 首筆 1969-03-14 米埔兩隻成鳥；幾乎只見於后海灣潮間帶泥灘（其他地點僅三筆）；像鷗嘴燕鷗那樣盤旋後俯衝，主食多毛類與小蟹，停棲時散在紅嘴鷗群裡。
- **身長兩個數字**：`cardDetails` 寫 33 cm、HKBWS 量 29–32 cm；卡面照 app 資料顯示，notes 並列兩個數字；體重 `cardDetails` 無資料故不填（0014/0053 前例）。
- **畫的是成鳥繁殖羽**（最好認的一套），但本種在香港是冬候鳥、冬季成鳥只有眼後黑斑；notes 與四圈說明明確交代，避免誤讀。
- 全身圖與近景圖皆為本卡新繪；`pixel.png` 第一次畫成冬羽、第二版才改成繁殖羽（黑頭罩＋白新月），因為四圈裡「短厚黑嘴」「眼周白新月」在冬羽幾乎看不出來。
- 四圈試了 15 個候選（`0184-r1`…`0184-r15`；`pixel.png`/`features.png` 是 1536×1024，方形取景要讓 dx≈0.67×dy 才不會切掉特徵）：
  - 第 1 圈（短厚黑嘴）`[0.455,0.355,0.655,0.655]`（`features.png` 大頭圖）：整支短厚黑嘴連嘴尖下鉤都在圈內。
  - 第 2 圈（眼周白新月）`[0.695,0.195,0.895,0.495]`（`features.png` 大頭圖）：上下兩道白新月與深色眼一起入鏡。
  - 第 3 圈（白尖黑翼尖）`[0.69,0.40,0.89,0.70]`（`pixel.png`）：黑底上一排白尖完整，左側留一點灰背當對比。
  - 第 4 圈（深紅腳）`[0.28,0.60,0.56,0.92]`（`pixel.png`）：兩腳連蹼帶泥灘一起入鏡；切太緊只剩單腳。
- 地圖 5 個 ISO3：CHN（渤海灣與黃海繁殖地、主要度冬海岸）、KOR、PRK、JPN、VNM（度冬從南韓與渤海向南到越南、另及日本南部）；本種是以中國為中心的繁殖特有種，不標俄羅斯。

## 0185 細嘴鷗 _Chroicocephalus genei_（LC 無危）

- Drive：`1wEOvIT74nQ7FdXRShSAshlZYnRBu5v3D`，130908 B，MD5 `9b84d088411a8dda3ae02ca035f004e3`。
- 四部位：細長的紅色嘴／又長又斜的前額／淡黃色的虹膜／深紅色的長腳；比較鳥 紅嘴鷗 + 黑嘴鷗（**兩隻都是本卡新繪**，都畫冬季羽）；12 ISO3；score 2.4（六軸齊全，無 `vEst`，**全批最低**）。
- HKBWS 頁面 `0110/016100`：Category I、**冬季偶見於沿海**（主要后海灣）；42–44 cm，與紅嘴鷗相似但結構不同——**頭小、前額長、嘴與腳長**、頸伸長時也長，虹膜通常淡色；繁殖羽**沒有深色頭罩**，下身帶粉紅，嘴與腳更紅；冬季只有淡淡的耳斑。**IUCN 無危 LC、趨勢不明**。
- **香港只有六筆**：1990-02-10 后海灣成鳥（2/25–26 同一隻在落馬洲）、1992-04-03~10 米埔與后海灣 first-summer、1993-02-27~28 后海灣成鳥、2008-03-01~21 與 04-13 第一齡冬羽、2010-02-07~03-09 成鳥、2016-10-24~30 第一齡冬羽。全球與香港分開寫。
- **修了一筆 IUCN 資料錯**：`cardDetails.zh.json` 0185 原本是「未評估 NE」，HKBWS 明列 **Least Concern**。用 brace-scan + `str.replace` 原位改成「無危 LC」，重跑 `build-dex-scores.mjs`（`{i:2.6,c:1.5,o:2.6}` → `{i:2,c:1.2,o:2.4}`）與 `build-filter-traits.mjs`（NE → LC）。兩支腳本重算時亦會如實反映本批早前已修正的 0165（NT）與 0169（VU）——那兩個修正是對的，重算後分數一併更新，不是新錯。
- **身長兩個數字**：`cardDetails` 寫 37–40 cm，HKBWS 量 **42–44 cm**；卡面不顯示體長，notes 並列兩者。體重兩邊都無資料，不填（0014/0053 前例）。
- 四圈試了 17 個候選（`0185-r1`…`0185-r17`；素材 1536×1024，方形取景要 dx≈0.74×dy）：
  - 第 1 圈（細長紅嘴）`[0.44,0.255,0.68,0.60]`（`features.png` 大頭圖）：整支嘴的長度與直度都入鏡，右端接到白頭。
  - 第 2 圈（長而斜的前額）`[0.55,0.15,0.85,0.58]`（`features.png` 大頭圖）：從嘴基到眼後的一整條低平前額線，是「頭小額長」最直接的證據。
  - 第 3 圈（淡黃虹膜）`[0.715,0.225,0.865,0.45]`（`features.png` 大頭圖）：淡黃虹膜與黑色瞳孔填滿圓心。
  - 第 4 圈（深紅長腳）`[0.155,0.625,0.34,0.90]`（`features.png` 全身圖）：兩腳連蹼帶沙地，看得出腿的長度。
- 地圖 12 個 ISO3：繁殖地從西班牙西南部經地中海、黑海、裏海到哈薩克（ESP、TUR、KAZ、IRN），度冬沿海與西非、阿拉伯半島、西印度（SAU、ARE、PAK、IND、SEN、MRT），另有中國與台灣的稀有過境／度冬（CHN、TWN）；不標 RUS（HKBWS 只寫到哈薩克）。

## 0186 紅嘴鷗 _Chroicocephalus ridibundus_（LC 無危）

- Drive：`1KJbK2A1BB5yJj9sUCpIoRN_XF-IVr2t8`，131626 B，MD5 `1c184230eeb3807105f8cdc5ffeb5be8`。
- 四部位：深巧克力褐頭罩／完整一圈白眼環／深紅色的嘴／翼前緣的白邊；比較鳥 細嘴鷗 + 棕頭鷗（細嘴鷗沿用 0185 已核對的全身圖，棕頭鷗為本卡新繪）；23 ISO3；score 3.3（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0110/016300`：Category I、**大量冬候鳥**（主要后海灣；其他時間少見至罕見）；37–43 cm，香港最常見的小鷗，飛行時靠**翼前緣白邊**與黑色翼尖，與除了細嘴鷗以外的小鷗分開；繁殖羽深褐頭罩＋紅嘴紅腳＋完整白眼圈，非繁殖羽白頭、眼後黑斑與由眼向上的黑紋。**IUCN 無危 LC、趨勢不明**。
- 香港數字照 HKBWS：1970 年代多處數百隻（1972-02-06 維港 2,000 隻）；1977/78 冬約 25,000 隻、1990 年代中期約 20,000 隻；西博寮海峽夜棲地 1977-01-26 10,470 隻、1977-12-13 10,788 隻；1996/97–2007/08 后海灣冬季計數 10,000–14,000 隻，之後最高 7,000（港方）／9,000（全灣）。HKBWS 把下降歸因於污水處理改善與暖冬，兩說都寫。
- 叫聲：飛行時下墜而拖長的「kreeeyah」，覓食時「krek」。
- **身長兩說**：`cardDetails` 37–44 cm、HKBWS 37–43 cm；卡面照 app 資料，notes 並列。體重無資料不填。
- 比較鳥選 0185 細嘴鷗（同屬、HKBWS 明文用翼前緣白邊區分）與 0187 棕頭鷗（更大、淡虹膜、翼尖兩個 mirrors），兩張相鄰卡互相對照。
- 四圈試了 14 個候選（`0186-r1`…`0186-r14`；`features.png` 是 1693×929，方形取景要 dx≈0.77×dy）：
  - 第 1 圈（深褐頭罩）`[0.630,0.300,0.900,0.800]`（`features.png` 大頭圖）：頭罩一直包到後頸，下緣與白頸的分界斜過整個圈。
  - 第 2 圈（白眼環）`[0.690,0.135,0.955,0.495]`（`features.png` 大頭圖）：完整一圈白、深褐眼底與頭罩同時入鏡。
  - 第 3 圈（深紅嘴）`[0.470,0.255,0.655,0.590]`（`features.png` 大頭圖）：整支嘴連嘴尖下彎都在圈內。
  - 第 4 圈（翼前緣白邊）`[0.640,0.430,0.800,0.650]`（`pixel.png`）：白邊與黑翼尖同時在圈內；`features.png` 的全身版太小、貼邊會切掉。
- 地圖 23 個 ISO3：繁殖地從冰島、不列顛、北歐向東經黑海／裏海、哈薩克、西伯利亞、中國東北到庫頁島與堪察加，度冬含西歐、地中海、中東、印度、東南亞與東亞（最北到北海道）；綠色非全境。

## 0187 棕頭鷗 _Chroicocephalus brunnicephalus_（LC 無危）

- Drive：`1UBa09U_3j7Mec775aSA0LfWcRLatnqzK`，133355 B，MD5 `8d116f3f26f88ca38d767e473d338f98`。
- 四部位：深褐繁殖頭罩／眼上下的白新月／深紅厚重的嘴／翼尖兩個大白斑；比較鳥 紅嘴鷗（沿用 0186 全身圖）＋ 細嘴鷗（沿用 0185 全身圖）；19 ISO3；score **2.9**（`i`、`a` 待查，`vEst: 1`）。
- HKBWS 頁面 `0110/016200`：Category I、**后海灣的罕見冬候鳥兼少量春季過境鳥**；41–45 cm，比紅嘴鷗略大而壯、嘴更深、頭相對大、**虹膜淡色**、眼周白新月更明顯；繁殖羽深褐頭罩（後方帶黑、前方近嘴基較淡）＋眼上後方小而窄的白新月；飛行時黑色翼尖於外側兩枚初級飛羽有**兩個大 mirrors**；冬季成鳥前眼一小塊黑斑、耳斑比紅嘴鷗稍大稍深、腳的紅色略深。**IUCN 無危 LC、趨勢穩定**。
- 香港紀錄照 HKBWS：1981 年前多來自維港與西至青山灣的海岸，1981 年後維港零紀錄（歸因於工業發展、填海與污水排放點移往深水）；1980 年代中期起后海灣為主要越冬地，1982 年後只有三次在別處（沙頭角海 1985、1990、1991）；首筆 1974-11-21 青洲對出成鳥，最早 1995-10-21、最晚 2017-05-07（米埔，成鳥繁殖羽）；近年 3、4 月最多，HKBWS 認為本種主要是**春季過境鳥**，可能與暖冬有關；通常一至兩隻（1990–91 冬六隻、1992-03-07 三隻成鳥）。
- 叫聲：HKBWS 只寫「與紅嘴鷗非常相似」；行為／覓食／食性 HKBWS 寫 **No information**，卡面不補。
- **身長只有 HKBWS 的 41–45 cm**：`explorerIndex.len` 為 0、`cardDetails` 無長度欄位，slim 版面不顯示身長，卡面不填、notes 記下 HKBWS 區間（0014／0053 前例）；體重兩邊都無資料，不填。
- 分數注意：`dexScores` 0187 只有 `v 4.7／r 1.0／c 3.0／o 2.9`（`vEst: 1`），**`i` 與 `a` 缺值**（`cardDetails` 無 iucn、`explorerIndex` 食性與棲地 tag 皆空），卡面兩軸「待查」加「待查非零分」，沒有補零、沒有重算綜合 2.9；HKBWS 的 LC 只寫在卡面 IUCN 章，沒有回頭改 app 資料（與 0185 把來源錯誤 NE 改成 LC 的情況不同）。
- 四圈（`features.png` 為 1719×915 兩段式：左全身、右大頭；方形取景要 dx≈0.94×dy）：
  - 第 1 圈（深褐頭罩）`[0.600,0.080,0.990,0.815]`（大頭圖）：整頂頭罩連後方轉黑與前方近嘴基較淡都在圈內，下緣止於白頸。
  - 第 2 圈（白新月＋淡虹膜）`[0.720,0.148,0.870,0.429]`（大頭圖）：眼上方的白新月、眼後的短新月、淡黃白虹膜同時入鏡。
  - 第 3 圈（深紅厚嘴）`[0.470,0.259,0.680,0.653]`（大頭圖）：整支嘴由嘴基到略鉤的嘴尖，上下嘴緣都在圈內。
  - 第 4 圈（翼尖兩個 mirrors）`[0.080,0.470,0.290,0.740]`（`pixel.png`）：黑色翼尖的兩個白斑與下方白尾同時在圈內；`features.png` 的全身版翼尖太小，貼邊會切掉。
- 地圖 19 個 ISO3：繁殖於 Turkestan 與中國西部高原（3,000–4,500 公尺），南至帕米爾、拉達克與西藏（CHN、KAZ、UZB、TKM、TJK、KGZ、AFG、PAK、IND、NPL、BTN）；度冬於印度、斯里蘭卡與東南亞海岸到中國西南（LKA、BGD、MMR、THA、LAO、KHM、VNM、MYS）；綠色非全境。

## 0188 小鷗 _Hydrocoloeus minutus_（LC 無危）

- Drive：`1qn118AzNE_YCRQmmsXngQ8wtURq2qr-S`，127326 B，MD5 `6efb02e62126ad5643dbc4b03c27ded4`。
- 四部位：純黑頭罩無眼圈／短而細的黑嘴／翼的寬白後緣／深紅短腳；比較鳥 紅嘴鷗（沿用 0187 全身圖）＋ 黑嘴鷗（沿用 0185 全身圖）；35 ISO3；score **2.1**（六軸齊全，`vEst: 1`）。
- HKBWS 頁面 `0110/016500`：Category I、**偶發紀錄（Accidental）**；25–30 cm，**最小的鷗**、約紅嘴鷗的三分之二大，嘴細而黑；成鳥繁殖羽**純黑頭罩、完全沒有 eye-crescents**、下腹帶粉紅、翼上淡灰（內羽深色）、**翼下深灰**（覆羽較淡）、兩面都有寬白後緣、腳深紅；冬季成鳥眼後一塊黑斑、後冠淡灰；第一年冬羽有深色三級飛羽／中覆羽／外側初級飛羽與尾帶。**IUCN 無危 LC、趨勢增加**。
- 香港紀錄只有兩筆：**1997-02-23**（首筆，Leader 1999）與 **2005-03-24**，兩隻都是**第一年冬羽**，都在后海灣潮間帶泥灘。
- 叫聲：尖而偏高、下墜的「kyow」／「ki-kyow」；行為、覓食、食性 HKBWS 寫 **No information**，卡面不補。
- **IUCN 來源衝突已改正**：`cardDetails.zh.json` 原寫「未評估 NE」（來源是中文維基），HKBWS 明寫 LC、趨勢增加 → 依 0185 前例只改這一個 `iucn` 字串（brace scan + `str.replace`，沒有重新序列化），再跑 `node scripts/build-dex-scores.mjs` 與 `node scripts/cards/build-filter-traits.mjs`。結果 0188 由 `i 2.6／c 1.5／o 2.3` 變成 **`i 2.0／a 2.3／v 4.2／r 1.0／c 1.2／o 2.1`**，`filterTraits` 由 `NE` 變 `LC`；兩支腳本的其他 539 隻輸出完全不變（`git diff --stat` 各 1 行）。
- **身長只有 HKBWS 的 25–30 cm**：`explorerIndex.len` 為 0、`cardDetails` 無長度欄位，slim 版面不顯示身長，卡面不填、notes 記下 HKBWS 區間（0014／0053 前例）；體重無資料不填。`vEst: 1` 已在卡面標「觀賞值含體長估算」。
- 四圈（`features.png` 為 1693×929 兩段式：左全身、右大頭；方形取景 dx≈0.77×dy）：
  - 第 1 圈（純黑頭罩）`[0.470,0.020,0.930,0.860]`（大頭圖）：整個頭連嘴基到後頸都在圈內，眼圈位置是純黑——第 2 候選 `[0.470,0.300,0.720,0.810]` 切掉了後腦，第 3 個 `[0.480,0.330,0.700,0.760]` 嘴被切，兩者都退回。
  - 第 2 圈（短細黑嘴）`[0.480,0.330,0.700,0.760]`（大頭圖）：整支嘴由嘴基到尖端入鏡，頭的黑比對得出嘴的短。
  - 第 3 圈（寬白後緣）`[0.660,0.470,0.960,0.780]`（`pixel.png`）：收翼側面的寬白後緣整條 + 深色翼尖 + 下方白尾同時入鏡；大頭圖只有肩部、看不到後緣。
  - 第 4 圈（深紅短腳）`[0.330,0.630,0.520,0.870]`（`pixel.png`）：兩腳連蹼帶泥灘，看得出腿短而細；第 1 候選 `[0.300,0.640,0.540,0.900]` 太寬，腳只佔圈中心一條，已收窄。
- 地圖 35 個 ISO3：繁殖地從波羅的海東岸（SWE、FIN、EST、LVA、LTU、POL、BLR）向東經俄羅斯、烏克蘭、北哈薩克到西伯利亞東南部與鄂霍次克海（RUS、KAZ、MNG），北美洲東部另有零散繁殖（CAN、USA）；度冬於歐洲與地中海（DNK、DEU、NLD、GBR、IRL、FRA、ESP、ITA、HRV、SRB、ROU、BGR）、黑海與裏海（TUR、GEO、AZE、IRN、TKM、UZB）、南亞與東亞（IND、CHN、JPN、KOR）；中國只在新疆與內蒙古有零散繁殖。綠色非全境。

## 0189 弗氏鷗 _Leucophaeus pipixcan_（LC 無危）

- Drive：`1T2E0tqm28bF7WWiW75zhFp1FEWOBACsV`，126996 B，MD5 `95328705d6074d3429965bcaa9f744e7`。
- 四部位：深灰耳斑連後冠／眼上下白新月／短黑嘴／黑底白端初級飛羽；比較鳥 紅嘴鷗（沿用 0188 的全身圖）＋ 小鷗（沿用 0188 的全身圖）；14 ISO3；score **2.2**（六軸齊全，`vEst: 1`）。
- HKBWS 頁面 `0110/016600`：Category I、**偶發紀錄（Accidental）**；32–36 cm，小型鷗、上體深灰、腳深色；繁殖羽黑頭、胸前可能帶粉紅；非繁殖羽眼周深灰向後接到後冠；成鳥外側初級飛羽黑底、內側白、末端白；第一年冬鳥翼上偏褐灰、次級與內側初級飛羽寬白端、深色尾帶、後腦大塊深灰、眼周寬白新月。**IUCN 無危 LC、趨勢增加**。
- 香港紀錄照 HKBWS 只有一筆：**2015-11-26 至 2016-05-02** 的一隻第二個冬季鳥（Lewthwaite 2017），**2016-04-19 至 05-02** 有第二隻加入；兩隻都在**后海灣潮間帶泥灘**。叫聲偏高、帶轉折的「kyer／kyeeear」；行為、覓食與食性 HKBWS 寫「No observations」。
- **IUCN 來源錯誤已改正**：`cardDetails.zh.json` 原寫「未評估 NE」→ 依 HKBWS 與 HK List 2024（弗氏鷗一列無 IUCN 代碼）改為「無危 LC」；只改這一個 `iucn` 字串（沒有重新序列化），再跑 `node scripts/build-dex-scores.mjs` 與 `node scripts/cards/build-filter-traits.mjs`，`git diff --stat` 各 1 行。0189 分數由 `i 2.6／a 2.3／v 4.5／r 1.0／c 1.5／o 2.4` 變成 **`i 2.0／a 2.3／v 4.5／r 1.0／c 1.2／o 2.2`**，`filterTraits` 的 `NE` → `LC`。
- **畫的是非繁殖羽**（眼周深灰連後冠＋上下白新月＋黑嘴黑腳）：HKBWS 明寫繁殖羽是整頂黑頭，卡面 notes 與第 1、2 圈說明都寫明這個季節差別。
- 身長只有 HKBWS 的 32–36 cm：`explorerIndex.len` 為 0、`cardDetails` 無長度欄位，slim 版面不顯示身長，卡面不填、notes 記下區間（0014／0053／0188 前例）。`vEst: 1` 已在卡面標「觀賞值含體長估算」。食性 tag 只有 `insect`、棲地 tag 空，適應力 2.3 照原值顯示。
- 四圈（`features.png` 為 1254×1254 正方形大頭圖，方形取景 dx≈dy）：
  - 第 1 圈（深灰耳斑連後冠）`[0.190,0.190,0.790,0.790]`：整塊深灰耳斑、後冠、白色額頰與嘴基全部在圈內。
  - 第 2 圈（眼上下白新月）`[0.375,0.295,0.595,0.515]`：眼圈的白上新月與白下新月完整，兩彎都與深灰分離可見。
  - 第 3 圈（短黑嘴）`[0.185,0.365,0.425,0.605]`：整支黑嘴由尖端到嘴基都在圈內，右側留白額對比出嘴的短。
  - 第 4 圈（黑底白端初級飛羽）`[0.600,0.420,0.920,0.800]`（`pixel.png`）：收翼的黑底初級飛羽連三個白端斑、下方白尾與尾端深帶同時入鏡。
  - 淘汰候選：`features.png [0.22,0.20,0.76,0.74]` 頭罩上緣貼邊；`[0.42,0.24,0.72,0.54]` 眼睛被切左半；`[0.21,0.34,0.51,0.64]` 嘴尖切掉；`pixel.png [0.62,0.42,0.88,0.74]` 只收到翼尖、看不到白端斑。
- 地圖 14 個 ISO3：北美洲內陸繁殖國（CAN、USA）、南美洲西岸度冬國（COL、ECU、PER、CHL），加中美洲與墨西哥的遷徙／度冬國（MEX、BLZ、GTM、SLV、HND、NIC、CRI、PAN）；中國（天津、河北、浙江）與台灣的紀錄是迷鳥、香港一筆是偶發，CHN／TWN／HKG 不上綠色。綠色非全境。
- 本回合環境重建：`/home/user/card-venv`（Pillow 13 + pillow-avif-plugin + numpy + scipy + fonttools）與 `~/.fonts/NotoSansTC_{400Regular,700Bold}.ttf` 重新建立；新增 `verify/exact.py`（把候選裁切同時畫出「來源紅框＋圓形遮罩預覽」，可入 Git）作裁切核對工具。

## 0190 遺鷗 _Ichthyaetus relictus_（VU 易危）

- Drive：`1FS5O8gdhh3Lj_bwemz1Xx-75iIQZmNQl`，130538 B，MD5 `8219805afb2ef68c01758376e451fb23`。
- 四部位：小頭平頂厚頸／嘴基淡綠灰／頸後褐色縱紋／淡褐肩部覆羽；比較鳥 紅嘴鷗（沿用 0188 全身圖）＋ 棕頭鷗（沿用 0187 全身圖）；5 ISO3；score **3.3**（`a` 待查，`vEst: 1`）。
- HKBWS 頁面 `0110/016700`：Category I、**后海灣潮間帶泥灘的罕見冬候鳥**；39–45 cm，**結構**辨識最重要——頭相對小、頭頂扁平且最高點在眼後、眼小、頸粗、身體大而圓（pot-bellied），走路有時笨拙。第一年冬鳥上體淡灰、三級飛羽有白羽緣、小覆羽與中覆羽淡褐、頸後與頸側有窄褐縱紋（冬季很快褪淡）、嘴的基部一半至三分之二淡綠灰；飛行時外側四枚初級飛羽深褐、內側初級與次級飛羽有近端斑、尾帶深色、外側 1–2 枚初級飛羽有白斑。成鳥繁殖羽**黑褐色頭罩（嘴基較淡）＋鮮紅嘴腳**。**IUCN 易危 VU**，族群 10,000–19,999，預期三個世代內快速下降（繁殖地人為干擾、氣候變化、度冬泥灘被填）。
- 香港紀錄照 HKBWS：**全部是第一年鳥**，日期 3 November–12 April、主要在 1 月初至 3 月初；1987-12-31 與 1988-01-02、1992 年兩隻（11-21 至 1993-03-08、11-28 至 12-05）、2006-03-22 與 03-30、2008-01-13 至 03-02 最多兩隻、2010-01-08 至 03-10、2011-04-08 至 04-12、2015-01-11 至 03-14、2016-12-24 與 12-26、2017-11-03；除流浮山一筆外全部在米埔浮橋觀察。叫聲偏低沉的「kyeeow」與驢叫式嘶鳴；覓食只有「像笨拙的鴴在泥灘走動覓食」一句。
- **IUCN 本來就正確**：`cardDetails.zh.json` 0190 已是「易危 VU」，與 HKBWS 及 HK List 2024（183 號，VU）一致 → **沒有改 app 資料、沒有重跑評分腳本**（與 0188／0189 改正錯誤的情況不同）。
- 分數照原值 **i 3.8／v 4.7／r 2.5／c 2.2／o 3.3**，但 **`a` 缺值**：`explorerIndex` 的食性與棲地 tag 都是空的 → 卡面適應力顯示「待查」，並保留「待查非零分」註腳，沒有從 IUCN 推算或補零（0187 前例）。`vEst: 1` 已在卡面標「觀賞值含體長估算」。
- 身長只有 HKBWS 的 39–45 cm：`explorerIndex.len` 為 0、`cardDetails` 無長度欄位，slim 版面不顯示身長，卡面不填、notes 記下區間（0014／0053／0188 前例）。體重無資料。
- 四圈（`features.png` 為 1254×1254 正方形大頭圖，方形取景 dx≈dy；`pixel.png` 為 1536×1024）：
  - 第 1 圈（小頭平頂厚頸）`features.png [0.130,0.240,0.730,0.840]`：整個頭連嘴、眼、後冠與粗頸一起入鏡，看得出頭佔身體比例偏小。
  - 第 2 圈（嘴基淡綠灰）`features.png [0.130,0.300,0.460,0.630]`：整支嘴由深色尖端到淡綠灰嘴基都在圈內，右側白額相接。
  - 第 3 圈（頸後褐色縱紋）`features.png [0.600,0.380,0.920,0.700]`：五條褐色縱紋完整、兩側留白頸與淡灰後頸。
  - 第 4 圈（淡褐肩部覆羽）`pixel.png [0.320,0.380,0.520,0.680]`：淡褐肩帶、白色羽緣與上方淡灰背部同時入鏡。
  - 淘汰候選：大頭圖 `[0.38,0.26,0.72,0.60]` 只收到眼與額、看不到小頭比例；`[0.14,0.36,0.44,0.66]` 嘴基被切右端；`[0.155,0.385,0.435,0.665]` 只見到嘴的兩段色、看不到嘴基與白額交界；全身圖 `[0.60,0.38,0.92,0.70]` 只收到翼尖深色部，看不到褐色肩帶。
- 地圖只有 5 個 ISO3：繁殖國 KAZ（東哈薩克）、RUS（單一繁殖地）、MNG（蒙古，最大族群）、CHN（內蒙古＋陝西北部至內蒙古中東部、新疆北部，同時是黃海／渤海的度冬地）、KOR（韓國度冬）。香港是 Category I 罕見冬候鳥，HKG 不上綠色；綠色非全境、非完整分佈。
- 交付前檢查：`spec == manifest.spec`、AVIF 解碼 1024×1536、bytes/SHA256 與 manifest 一致、`test-slim-feature-label.py` 4/4、`npx tsc -b` 乾淨、`node --test` 39/39、`git diff --check` 通過、Drive parent／MD5／bytes 與本機完全吻合。

## 0191 漁鷗 _Ichthyaetus ichthyaetus_（LC 無危）

- Drive：`1wEYkoIATZ98wQf1ALCvWqLT6l7LEzSmC`，127185 B，MD5 `aeca4dfb8c3b582cf883dcab21234df6`。
- 四部位：繁殖羽黑頭罩／黃嘴近尖端黑帶／黑翼尖小白斑／粗壯黃腳；比較鳥 紅嘴鷗（沿用 0188 全身圖）＋ 棕頭鷗（沿用 0187 全身圖）；28 ISO3；score **2.4**（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0110/016800`：Category I、**后海灣的罕見冬候鳥兼春季過境鳥**；60–72 cm，大型鷗、額與嘴都長；成鳥繁殖羽**黑頭罩＋黃嘴（尖端黑）＋黃腳**，冬季成鳥只有**灰色的部分頭罩**；第三個冬季翼尖黑色較多、尾部可能帶黑。飛行時翼較窄、胸深，成鳥翼上偏淡、初級飛羽僅有細小近端黑斑、**沒有尾帶、覆羽沒有深色**。幼鳥眼周有深色眼罩與白新月；第一年冬鳥上體大塊灰色與褐色翼、覆羽對比，腰與尾白、尾有深帶。**IUCN 無危 LC、趨勢增加**。
- 香港紀錄照 HKBWS：1999 年後全部在后海灣潮間帶泥灘；極端日期 **2016-11-12** 與 **1995-04-07**，1 月數量最多、3 月至 4 月初過境；首筆 1974-12-26（Viney 1975），1983 年前只多兩筆，1984 年後幾乎每年至 1992 年底，1993/94 冬 **10 隻**、1994/95 冬 **9 隻**，一般五隻以下、偶爾整年沒有。叫聲：繁殖地為低沉帶鼻音的飛行叫、香港極少鳴叫。行為、覓食與食性 HKBWS 寫「No observations」。
- **IUCN 正確**：`cardDetails.zh.json` 0191 已是「無危 LC」，與 HKBWS（LC、increasing）及 HK List 2024（182 號，無代碼）一致 → 沒有改資料、沒有重跑評分腳本。
- 分數照原值 **i 2.0／a 3.3／v 4.5／r 1.0／c 1.2／o 2.4**，六軸齊全、**沒有 `vEst`**（`explorerIndex.len` 為 63.5 cm，是實際體長）。食性 tag `insect／fish／crustacean`、棲地 tag 空，適應力 3.3 照原值。
- 身長／體重：`cardDetails` 有 `length` 55–72 cm、`weight` 0.96–2.1 kg；HKBWS 量 **60–72 cm**。slim 版面不顯示身長，卡面不填，notes 以 HKBWS 為準記 60–72 cm 並註明與 app 的 55–72 cm 略有出入、**沒有改 app 資料**。
- 四圈（`features.png` 為 1254×1254 大頭圖；`pixel.png` 為 1536×1024 全身圖，方形取景 dx≈0.74·dy）：
  - 第 1 圈（繁殖羽黑頭罩）`pixel.png [0.140,0.050,0.440,0.500]`：整個黑頭罩連眼、黃嘴與白色下頸交界入鏡——大頭圖的頭罩太大，正方形取景一定切掉後冠或下頸，改用全身圖的頭部。
  - 第 2 圈（黃嘴近尖端黑帶）`features.png [0.105,0.300,0.505,0.700]`：整支黃嘴由尖端到嘴基、連黑帶與嘴基黑頭罩交界都在圈內；`[0.10,0.29,0.50,0.695]` 與 `[0.09,0.33,0.49,0.73]` 都切掉嘴尖的黃端。
  - 第 3 圈（黑翼尖小白斑）`pixel.png [0.640,0.500,0.860,0.830]`：黑翼尖的兩個小白斑與下方白色後緣同時入鏡；`[0.60,0.47,0.80,0.77]` 只收到黑翼尖一角。
  - 第 4 圈（粗壯黃腳）`pixel.png [0.350,0.620,0.520,0.875]`：兩條粗黃腿連蹼與泥灘都在圈內。
- 地圖 28 個 ISO3：繁殖地 UKR／RUS（黑海北岸）→ KAZ（北裏海、哈薩克）→ MNG／CHN（蒙古西部、中國西北與北部）；度冬地 TUR／GEO／AZE／IRN（黑海與裏海南部）、TKM／UZB（中亞）、EGY／SDN／ERI／SAU／YEM（紅海）、IRQ／KWT／ARE／OMN（波斯灣）、PAK／IND／BGD／LKA（南亞）、MMR／THA／VNM／KHM＋CHN（中南半島與華南沿海）。香港是 Category I 罕見冬候鳥，HKG 不上綠。綠色非全境。
- 標籤修正：初稿第 2 圈寫「黃嘴近端黑帶」，實際黑帶位於**靠近尖端**、最前端仍黃，已改為「黃嘴近尖端黑帶」並同步 featureNotes，避免與 HKBWS 的「black-tipped yellow bill」說法混淆。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes/SHA256 與 manifest 一致、`test-slim-feature-label.py` 4/4、`npx tsc -b` 乾淨、`node --test` 39/39、`git diff --check` 通過、Drive parent／MD5／bytes 與本機吻合。

## 0192 黑尾鷗 _Larus crassirostris_（LC 無危）

- Drive：`1LjkKVQt8_48WgE1rv7_foFCDe5KzCKez`，128047 B，MD5 `ac17a2bab25366d0ff9cafb6b703e7f1`。
- 四部位：深褐翼覆羽／淡粉灰嘴黑嘴尖／灰褐頸胸／全黑短尾；比較鳥 紅嘴鷗（沿用 0188 全身圖）＋ 漁鷗（沿用 0191 全身圖）；9 ISO3；score **3.3**（六軸齊全，`vEst: 1`）。
- HKBWS 頁面 `0110/016900`：Category I、**沿岸水域的不常見過境鳥兼稀少冬候鳥**；43–51 cm，中型、翼長而**尾短**的鷗，**尾在任何年齡都是全黑或大部分黑**；香港見到的絕大多數是**第一年冬鳥**：淡灰褐的背與肩羽對比深褐翼覆羽、後頸胸脇大片灰褐、深色飛羽、黑尾、淡灰粉的腳與嘴而**嘴尖一大段黑色**。第二年冬鳥有寬黑尾帶、後頭條紋、淡嘴黑端；成鳥石板灰上體、寬黑尾帶、初級飛羽白色細端、**黃嘴配黑色次端帶與紅色尖端**、淡色眼與紅色眼圈。**IUCN 無危 LC、趨勢穩定**。
- 香港紀錄照 HKBWS：1970 年首錄，**2 月第二週至 3 月第三週**為主要春季過境期，冬季稀少、夏季罕見；族群大增見於 1970 年代中、1984/85、2002/03、2011/12–2013/14；最高計數 2003-02-22 深涌 **293 隻**、1985-02-17 沙頭角海 200 隻、2014-03-08 南大嶼外海 200 隻；本種**最大數量在吐露港與外海**，后海灣度冬只有 2 至通常不超過 12 隻。**第一年鳥佔 85–90%**、第二個冬季不超過 10%、成鳥「less than annually」——所以卡面畫第一年冬羽。叫聲為帶鼻音的 `kyow／kyee／kyooo`；食小魚與有機廢棄物，通常單獨或少於十隻。
- **IUCN 正確**：`cardDetails.zh.json` 0192 已是「無危 LC」，與 HKBWS 及 HK List 2024（184 號，無代碼）一致 → 沒有改資料、沒有重跑評分腳本。
- 分數照原值 **i 2.0／a 3.3／v 4.8／r 3.3／c 3.0／o 3.3**；`vEst: 1` 是因為 `explorerIndex.len` 為 0（體長由 AVONET 翼長估算），卡面已標「觀賞值含體長估算」。身長照 HKBWS 記 43–51 cm 寫在 notes；slim 版面不顯示身長，卡面沒有數字，**沒有改 app 資料**。
- 四圈（`features.png` 1254×1254 大頭圖；`pixel.png` 1536×1024 全身圖，方形取景 dx≈0.74·dy）：
  - 第 1 圈（深褐翼覆羽）`pixel.png [0.340,0.420,0.460,0.600]`：深褐覆羽整片暗色與上方淡灰褐背部同時入鏡；`[0.320,0.300,0.540,0.630]` 收得太多、深褐只佔中心一小塊。
  - 第 2 圈（淡粉灰嘴黑嘴尖）`features.png [0.085,0.310,0.435,0.660]`：整支嘴由黑嘴尖到淡粉嘴基都在圈內；比 0191 模板再向左下移，否則左下角只剩天空。
  - 第 3 圈（灰褐頸胸）`features.png [0.620,0.420,0.920,0.720]`：頸環深淺交界與白色頭部同時入鏡；`[0.55,0.30,0.85,0.60]` 只有一片白色羽毛、看不出頸環。
  - 第 4 圈（全黑短尾）`pixel.png [0.655,0.400,0.895,0.760]`：整段黑尾、上方深色翼尖與白色腹部都在圈內；窄框（約 0.20 寬）只剩一條黑線，失去「短尾」的形狀。
- 地圖 9 個 ISO3：繁殖海岸 RUS（南烏蘇里）、CHN（黃海島嶼至福建）、PRK／KOR／JPN（日本、韓國沿海），度冬南延至 TWN、HKG、VNM、PHL。香港是本種冬季分佈**南限附近**，Category I，綠色非全境。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes/SHA256 與 manifest 一致、`test-slim-feature-label.py` 4/4、`npx tsc -b` 乾淨、`node --test` 161 過 1 略、`git diff --check` 通過、Drive parent／MD5／bytes 與本機吻合。

## 0193 普通海鷗 _Larus canus_（LC 無危）

- Drive：`10x-Ft0fWXfyJ85k2cWVjyn6S847oh8Cy`，134971 B，MD5 `a46f00ff31cfbb2083f02b440abf758c`。
- 四部位：鱗狀褐翼覆羽／淡嘴黑嘴尖／頸胸密集斑紋／深色尾帶；比較鳥 紅嘴鷗（沿用 0188）＋ 黑尾鷗（沿用 0192）；25 ISO3；score **2.9**（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0110/017000`：Category I、**后海灣的罕見冬候鳥兼春季過境鳥**；幾乎所有紀錄都來自后海灣鷗群棲地（只有 2013-01-29 大欖涌外海一筆）；香港的主要是 `L. c. kamtschatschensis`：第一年鳥褐色→大部分灰色上體、褐色覆羽、三級飛羽深色羽心、深色初級飛羽、頭胸斑駁，**尾帶深色、有時整片深色**；第二年冬鳥灰背、黑翼尖、1–2 個白斑、嘴尖深色。1999 年後全部紀錄落在 **1 月 7 日至 3 月 28 日**（另有 2013-11-15/16 一筆），多為單隻第一年鳥，第二年冬鳥只有四筆；`heinei` 兩筆（2009-03、2021-01）。行為／覓食／食性 HKBWS 寫「No information」。**IUCN 無危 LC、趨勢 unknown**。
- **已修正來源錯誤（身長當成翼展）**：app 原本 `length` = `110–125 cm`、`explorerIndex.len` = 117.5，但 110–125 cm 是**翼展**，本種成鳥體長是 **40–46 cm**（HKBWS 該頁不給體長；中文維基同頁明寫「成年 40–46 cm，翼展 110–125 cm」）。做法：`cardCopy.json`、`cardDetails.zh.json`、`cardDetails.en.json` 的 `length` 改為 `40–46 cm`，`explorerIndex.len` 改為 43，再跑 `build-dex-scores.mjs` 與 `build-filter-traits.mjs`。結果 **`v 5.0→4.0`、`o 3.1→2.9`**（其餘四軸不變），`filterTraits.lengthCm` 117.5→43。
  - **陷阱（已避開）**：直接重跑 `build-details.mjs`／`build-explorer-data.mjs` 會由 `cardCopy.json` 重建，把 0165／0169／0185／0188／0189 之前**只改在 `cardDetails.zh.json` 的 IUCN 修正**一併推回舊值（實測會令 5 張卡的分數回退）。所以這次改為**定點字串替換**，沒有重跑那兩支腳本；驗證 `git diff` 四份資料檔都只有 0193 一行變動，`dexScores` 也只有 0193 一筆不同。
- 分數照重算後 **i 2.0／a 2.3／v 4.0／r 4.8／c 1.2／o 2.9**，六軸齊全、**沒有 `vEst`**（體長現在是實測值，卡面不再出現「觀賞值含體長估算」）。食性 tag `omnivore`、棲地 tag 空 → 適應力 2.3。
- **名稱差異**：app 用「普通海鷗」（2022 年《中國鳥類名錄》新名），HKBWS 與 HK List 2024 用「海鷗」；卡面照 app 用「普通海鷗」、學名 `Larus canus`，差異記在 notes，**沒有改 app 名稱**。
- 四圈：
  - 第 1 圈（鱗狀褐翼覆羽）`pixel.png [0.330,0.300,0.620,0.680]`：整片褐翼連白色羽緣與下方白色腹部同時入鏡；`[0.300,0.340,0.620,0.740]` 收得下腹與地面太多。
  - 第 2 圈（淡嘴黑嘴尖）`features.png [0.120,0.340,0.440,0.660]`：黑嘴尖、淡色嘴身與嘴基白額都在圈內；`[0.250,0.400,0.500,0.650]` 只收到嘴的中段、沒有黑端。
  - 第 3 圈（頸胸密集斑紋）`features.png [0.470,0.420,0.870,0.820]`：頸側縱紋、胸側斑點與下方褐色肩羽接縫都在圈內；`[0.56,0.48,0.92,0.84]` 只剩右半邊斑紋與大片天空。
  - 第 4 圈（深色尾帶）`pixel.png [0.660,0.520,0.860,0.770]`：白色尾羽與末端深色尾帶、上方深色初級飛羽同時入鏡；`[0.640,0.480,0.800,0.680]` 只有黑翼尖、看不到白色尾與尾帶的對比。
- 地圖 25 個 ISO3：繁殖 ISL、GBR、IRL、NOR、SWE、FIN、EST、LVA、LTU、POL、DEU、DNK、NLD、BEL、FRA、RUS、MNG、CHN、PRK、KOR、JPN，北美 USA、CAN（短嘴亞種，現多視為獨立種，這裡只作廣義 `Larus canus` 分佈），冬季南延至 TWN、HKG。香港是冬季分佈南緣，Category I，綠色非全境。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes/SHA256 與 manifest 一致、`test-slim-feature-label.py` 4/4、`npx tsc -b` 乾淨、`node --test` 161 過 1 略、`git diff --check` 通過、Drive parent／MD5／bytes 與本機吻合。

## 0194 美洲海鷗 _Larus brachyrhynchus_（LC 無危）

- Drive：`1JlSXb1e4OyLaSFA3CAmobF0ynXRsxLz_`，136933 B，MD5 `80380f180def401b09c0d12bbe3b461d`。
- 四部位：沙褐邊翼覆羽／小嘴黑嘴尖／全黑尾羽／圓頭短嘴；比較鳥 普通海鷗（沿用 0193）＋ 環嘴鷗（沿用 0195）；地圖只有 2 ISO3；score **2.7**（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0110/017100`：Category I、**迷鳥**；比普通海鷗小，**嘴短而小、頭圓似鴿、身體瘦而背線平、停棲時翼尖上翹**；第一年冬鳥**尾全黑**（連最外側尾羽外瓣）、尾上覆羽濃密橫斑、中／小覆羽深色羽心配**沙褐邊**、三級飛羽淡邊很細、身體較深、頭部淡黃褐底色；叫聲與普通海鷗相近。香港唯一一筆是 **1994-02-25 至 28 米埔浮橋外鷗群中的第一年冬鳥**。全球：單型，繁殖阿拉斯加與加拿大西北部，冬季沿海岸南至加州，日本為迷鳥。**IUCN 無危 LC、趨勢 unknown**。
- **已補 IUCN（來源缺漏）**：`cardCopy.json`／`cardDetails` 0194 原本完全沒有 `iucn`，`dexScores` 只有 `a 2.8／v 4.0／r 3.3` 三軸、綜合分只是三軸平均 3.4。HKBWS 與 HK List 2024 都是 **Least Concern**，已補 `iucn: 無危 LC`／`iucnEn` 再重跑 → **`i 2.0／a 2.8／v 4.0／r 3.3／c 1.2／o 2.7`**（13.3÷5=2.66→2.7），`filterTraits.iucn` `UNKNOWN`→`LC`。
- **移除一個會令舊修正回退的陷阱**：`cardCopy.json` 的 `iucn` 一直是舊值（0165 LC、0169 LC、0185 NE、0188 NE、0189 NE），而正確值只改在 `cardDetails.zh.json`，任何一次重跑 `build-details.mjs`／`build-explorer-data.mjs` 都會把這 5 張推回（本回合實測確實回退）。已在 `cardCopy.json` 同步這 5 筆為 NT／VU／LC／LC／LC，重跑後 `git diff` 只有 0194／0195 變動。
- 四圈：
  - 第 1 圈（沙褐邊翼覆羽）`pixel.png [0.380,0.300,0.640,0.640]`：覆羽深色羽心與沙褐淡邊整片入鏡；`[0.34,0.26,0.58,0.56]` 只收到邊緣一小撮。
  - 第 2 圈（小嘴黑嘴尖）`features.png [0.050,0.280,0.550,0.780]`：短嘴、黑嘴尖、前額與喉部同時入鏡；窄框會切掉嘴基與前額交界。
  - 第 3 圈（全黑尾羽）`pixel.png [0.660,0.330,0.900,0.670]`：整段深色尾羽與上方淡邊三級飛羽入鏡；`[0.68,0.36,0.92,0.70]` 尾尖被切。
  - 第 4 圈（圓頭短嘴）`pixel.png [0.155,0.125,0.415,0.425]`：圓頭、短嘴與眼同時入鏡（大頭圖的正方形取景會切掉後枕，改用全身圖頭部，與 0191 同一個處理）。`[0.185,0.135,0.395,0.395]` 嘴尖貼邊。
- 地圖只有 **2 個 ISO3**：USA、CAN（阿拉斯加與加拿大西北部繁殖、南至加州度冬）。香港是 Category I 迷鳥，**HKG 不上綠**（迷鳥不是原生分佈）。綠色非全境。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes／SHA256 與 manifest 一致、`test-slim-feature-label.py` 4/4、`npx tsc -b` 乾淨、`node --test` 161 過 1 略、`git diff --check` 通過、Drive parent／MD5／bytes 與本機吻合。

## 0195 環嘴鷗 _Larus delawarensis_（LC 無危）

- Drive：`1aexEZXE58AsbkuQHQprKeqD87xkzVWeO`，134403 B，MD5 `470731c0104bd1d856ceec801ba1ade3`。
- 四部位：黃嘴黑嘴帶／淡黃色虹膜／銀灰翼上／黑翼尖白斑；比較鳥 普通海鷗（沿用 0193）＋ 美洲海鷗（沿用 0194）；3 ISO3；score **3.7**（六軸齊全，無 `vEst`）。
- HKBWS 頁面 `0110/017200`：Category I、**迷鳥**；43–54 cm，比普通海鷗略大；成鳥**翼上明顯較淡**（淡銀灰），非繁殖羽頭頸有細灰褐條紋，嘴與腳黃、**嘴有清楚的黑次端帶**（名前由來）、**虹膜明顯淡色**；最外一至兩枚初級飛羽的白色次端斑**細小而貼近尖端**、白色後緣對比弱。第一年冬鳥整體比 `kamtschatschensis` 普通海鷗**偏淡**，初冬換羽後常已長出淡灰背（帶幾個深色新月斑），飛行時翼上對比更強（外側初級飛羽更黑、內側與大覆羽銀灰）。香港唯一一筆是 **2021-03-20 米埔浮橋觀鳥屋外鷗群的成鳥**，亦是香港與中國大陸首筆（Lok 2025）。全球：繁殖與度冬大致在北美 10°N–60°N，歐洲有迷鳥紀錄、偶有繁殖。**IUCN 無危 LC、趨勢 increasing**。
- **已修正單位錯誤（身長／體重）**：`cardCopy.json` 原為 `length: 16.9–21.3 in`、`weight: 10.6–24.7 oz`，但 `build-explorer-data.mjs` 的 `parseLength()` 只抽數字不理單位，把 16.9–21.3 當**厘米**取中位 19.1 cm（低估一半以上）。已換算成 `43–54 cm`（42.9／54.1）與 `300–700 g`（300／700），與 HKBWS 的 43–54 cm 完全吻合。重跑後 `explorerIndex.len` 19.1→**48.5**、`filterTraits.lengthCm` `null`→48.5，評分 **`v 3.0→4.2`、`o 3.5→3.7`**，其餘四軸不變。
- **同類單位問題的 5 張已於 2026-11-12 修正並重出（見文末「英制單位修正與重出」一節）**：0113、0151、0154、0181、0385 原本寫成吋／安士，被 `parseLength()` 當厘米讀。已全部換算成公制並重跑四支 builder；0113／0151／0154／0181 四張卡重渲染並重新上載，0385 沒有卡面所以只需改資料。
- 四圈：
  - 第 1 圈（黃嘴黑嘴帶）`features.png [0.050,0.280,0.550,0.780]`：淡色嘴尖、完整黑帶與黃色嘴基全在圈內；`[0.03,0.24,0.49,0.70]` 黑帶貼邊。
  - 第 2 圈（淡黃色虹膜）`features.png [0.300,0.200,0.800,0.700]`：眼、眼周細紋與額部白色入鏡；`[0.42,0.28,0.72,0.58]` 只收到眼與一片白羽，沒有頭形。
  - 第 3 圈（銀灰翼上）`pixel.png [0.400,0.300,0.720,0.620]`：銀灰覆羽的疊瓦邊整片入鏡。
  - 第 4 圈（黑翼尖白斑）`pixel.png [0.610,0.500,0.870,0.700]`：黑翼尖、白次端斑與白色尾端同時入鏡；`[0.66,0.38,0.90,0.62]` 白斑被切走。
- 地圖 3 個 ISO3：CAN、USA、MEX（北美內陸湖泊繁殖，度冬南至墨西哥灣與墨西哥）。香港是 Category I 迷鳥，**HKG 不上綠**。綠色非全境。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes／SHA256 與 manifest 一致、`test-slim-feature-label.py` 4/4、`npx tsc -b` 乾淨、`node --test` 161 過 1 略、`git diff --check` 通過、Drive parent／MD5／bytes 與本機吻合。

## 英制單位修正與重出（2026-11-12）

用戶指示「修正並重出」：0113、0151、0154、0181、0385 五筆的 `length`／`weight` 原本寫成吋／安士，`build-explorer-data.mjs` 的 `parseLength()` 不理單位、把數字直接當厘米，令 `explorerIndex.len` 嚴重偏低（`filterTraits.lengthCm` 同樣錯），連帶 `v`／`o` 兩軸被低估、卡面有兩張連體重都印錯。

- **資料修正（commit `1080ed5`）**：`src/data/cardCopy.json` 五筆改成公制 —— 0113 `42–45 cm`、0151 `19–23 cm`、0154 `29 cm`＋`88–130 g`、0181 `20–24 cm`＋`153–249 g`、0385 `12–14 cm`＋`11–20 g`。重跑 `build-explorer-data.mjs`、`build-details.mjs`、`build-filter-traits.mjs`、`build-dex-scores.mjs` 後，五份 generated 檔的 diff 確認**只有這五個 id 變動**（13 插入／13 刪除），沒有波及其他 535 隻。
- **分數變動**（`dexScores.json`）：0113 `v 2.9→4.0`、`o 2.9→3.1`；0151 `v 2.0→3.1`、`o 2.9→3.1`；0154 `v 2.4→3.5`、`o 2.7→3.0`；0181 `v 2.1→3.2`、`o 2.8→3.1`；0385 `v 1.4→2.6`、`o 2.3→2.6`。新 `len`：43.5／21／29／22／13（原 17.1／8.2／11.4／8.7／5.1）。
- **0385 崖沙燕只有資料、沒有卡面**：它不在 `src/data/infoCards.json`，Drive 目標資料夾也查不到 `0385.avif`，所以只需資料修正，**沒有重出這張卡**，也不應假裝重印過。

### 0113 反嘴鷸 已重出並上載

- 環境重置令 `cards/art/`、`deliver/cards/` 全部消失（兩者都在 `.gitignore`），舊素材無法重用，**重新生成**插圖：`pixel.png`（全身）、`features.png`（頭部特寫）、`black-winged-stilt.png`、`terek-sandpiper.png`。
- **重畫原因記錄**：第一次生成的嘴畫成**下彎**（像塍鷸），與本種「上翹」相反；第二次仍偏下彎、且全身圖鳥身過小、身體比例像鷗。重畫後全身圖與頭部特寫的嘴都由基部到尖端清楚向上翹，第 1 圈才成立。
- 四圈（`featureLabels` 不變）：
  - 第 1 圈（上翹長喙）`features.png [0.000,0.020,0.820,0.840]`：整條嘴連尖端、額與眼都在圈內，向上翹的弧度一眼可讀；較窄的框（如 `[0.02,0.24,0.63,0.86]`）在圓形遮罩下會切走尖端。
  - 第 2 圈（黑冠白頸）`features.png [0.340,0.100,0.960,0.720]`：黑冠、黑後頸與白色臉頰、頸的分界完整入圈。
  - 第 3 圈（黑白翼帶）`pixel.png [0.220,0.260,0.700,0.540]`：折翼上兩道寬黑帶與白色翼羽相間整片入鏡。
  - 第 4 圈（藍灰長腳）`pixel.png [0.360,0.480,0.620,0.900]`：脛跗關節與蹼趾都在圈內，未切到腳趾。
- 比較鳥：黑翅長腳鷸（長而筆直的嘴、極長粉紅腳）、翹嘴鷸（體型細小的上翹嘴鷸類、橙黃短腳），兩隻都是新生成，`framing: whole-bird`。
- 交付：AVIF 1024×1536、**129632 B**、MD5 `266ba6e216ffc443bb2d6764b4d59746`、SHA256 `2000d01c187302af61320eabc983ad8bf77f9e5178d7874b769f059649bfce5a`；Drive file `1FTzMi2XlgfdjJ4TbNFE0K2V0XAVWs8Ye`，parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`，`get_file` 核對 bytes／MD5／mime `image/avif` 與本機一致。
- **舊版已移入垃圾桶**（不覆寫）：舊 `0113.avif` file id `1zRy6bjYA4-HQ_tb-WuvoCDzL1TQ1P3e5`、127621 B、MD5 `6a05265444ca346862bbcbc016b8267b`；資料夾現時只有一份 0113。
- 驗證：`spec == manifest.spec`、AVIF 解碼 1024×1536、bytes／SHA256 與 manifest／SHA256SUMS 一致、`missingScores` 空、`test-slim-feature-label.py` 4/4、地圖面板 `#7da688` 綠色像素 10114（非空）。
### 0151 飾胸鷸 已重出並上載

- 環境重置後素材全失，本張由零重畫：`pixel.png`、`features.png`、`ruff.png`（流蘇鷸）、`pectoral-sandpiper.png`（斑胸濱鷸）。
- **重畫原因**：上一回合的全身圖胸側完全沒有黑斑，第 3 圈「胸側黑色斑點」沒有主體，而且身形過長似鷗。重畫後胸側有清楚一列黑點，身體收短成飽滿的鴿形站姿。
- 四圈：
  - 第 1 圈（短而細的黑嘴）`pixel.png [0.228,0.166,0.436,0.478]`：短黑嘴、眼與完整淡色眼圈同時入圈，嘴尖不貼邊；`features.png [0.20,0.36,0.52,0.56]` 只收到嘴的中段、看不到嘴基。
  - 第 2 圈（大眼淡色眼圈）`features.png [0.300,0.140,0.780,0.620]`：大眼、完整淡色眼圈、頭頂細斑與嘴基都入圈。原用 `[0.46,0.18,0.70,0.42]` 眼佔滿整個圓、看不出頭形；`[0.38,0.10,0.74,0.46]` 仍太貼眼。
  - 第 3 圈（胸側黑色斑點）`pixel.png [0.320,0.400,0.540,0.620]`：一列黑點由胸側橫過腹側，上下都有皮黃色羽毛包住。
  - 第 4 圈（較長的黃腳）`pixel.png [0.360,0.620,0.580,0.920]`：兩腳脛跗與蹼趾入圈；`[0.34,0.42,0.54,0.62]` 只收到腹部與上腿。
- 比較鳥：流蘇鷸（雌鳥型，嘴明顯長而粗、腳橙黃）＋ 斑胸濱鷸（胸帶與白腹之間是硬邊）。
- 交付：AVIF 1024×1536、**140133 B**、MD5 `94b7241260bd2d97b4c36497c8975041`、SHA256 `ff5c1b7b5cfcb7603008bb14119e3a0ee229d1810beb276a49fe4a394e905f46`；Drive `1BriuxzscHixur_xkMD521gwAMv1FQP9_`，`get_file` 核對 parent／bytes／MD5／mime 一致。舊版 `1wFl3WjWHdMd8Tufx0wVG8kVrh6iy66Nd`（144626 B、MD5 `0053d750f38bd2394e9a718eac973343`）已移入垃圾桶，資料夾只剩一份。
- 分數：i 3.0／a 2.8／r 4.8／c 1.8／**v 3.1**／**o 3.1**（原 v2.0／o2.9）；地圖綠色像素 13506；`test-slim-feature-label.py` 4/4。

### 0154 長嘴鷸 已重出並上載

- 同樣由零重畫：`pixel.png`、`features.png`、`asian-dowitcher.png`（半蹼鷸）、`black-tailed-godwit.png`（黑尾鷸）。
- 四圈（`featureLabels` 不變）：
  - 第 1 圈（淡色嘴基）`features.png [0.060,0.260,0.660,0.860]`：整條嘴由淡色嘴基到深色尖端都在圈內，基部與前額的淺灰分界清楚；`pixel.png [0.13,0.22,0.42,0.48]` 只能看到嘴的中段，淡嘴基出圈。
  - 第 2 圈（明顯白眉）`features.png [0.340,0.100,0.900,0.660]`：白眼圈白眉、深色眼線與頭頂都入圈；`[0.30,0.06,0.86,0.62]` 後枕貼邊。
  - 第 3 圈（黃綠色腳）`pixel.png [0.370,0.540,0.590,0.860]`：兩腳的欖黃色與蹼趾連淺色腹部下緣入圈。
  - 第 4 圈（羽軸深色）`pixel.png [0.440,0.300,0.700,0.580]`：肩羽與覆羽的深色羽軸整片入鏡，形成細密深淺對比。
- 比較鳥：半蹼鷸（**全黑無淡嘴基**的長嘴、橙紅頭胸）＋ 黑尾鷸（長腳長頸、嘴基淡粉橙）。
- 交付：AVIF **135479 B**、MD5 `15c13ff11a6621122feb852a02037009`、SHA256 `9cb67f78cd3c4524efdbad95ef497e231ca8cf825dcc689a379b5b84a84cc753`；Drive `1y6J50WGaYNxpuJCmkfMqTKwjZv3LQCTl`，`get_file` 核對一致。舊版 `1EKxP7K0AAMZr5qCY1ZZDtpJ5WAlP20E3`（139504 B、MD5 `9f58034ae8e9ff396b7128c857cc134d`）已移入垃圾桶。
- 分數：i 2.0／a 3.3／r 4.8／c 1.2／**v 3.5**／**o 3.0**（原 v2.4／o2.7）；地圖綠色像素 12628；`test-slim-feature-label.py` 4/4。
### 0181 扁嘴海雀 已重出並上載

- 由零重畫：`pixel.png`、`features.png`、`japanese-murrelet.png`（冠海雀）、`kittiwake.png`（三趾鷗）。
- 四圈（全部用 `features.png`，`featureLabels` 不變）：
  - 第 1 圈（不伸到眼前的白色眉線）`[0.360,0.120,0.880,0.440]`：白眉線、眼、眼前仍為黑色的額面同時入圈，正是這條白眉與冠海雀的分野。
  - 第 2 圈（短而尖的灰白嘴）`[0.100,0.220,0.420,0.440]`：整條淡灰白短嘴連嘴基與黑色頭罩的交界入圈；`[0.63,0.24,0.89,0.42]` 只收到嘴尖與一片黑。
  - 第 3 圈（頸側的黑色半環）`[0.540,0.380,0.940,0.700]`：白色頸側、下方黑色半環與再下方的白色胸同時入圈。
  - 第 4 圈（背上的白色縱紋）`[0.580,0.700,0.940,1.000]`：灰黑背上的白色縱紋佈滿整個圓、方向一致；`[0.80,0.50,1.00,0.74]` 貼在畫面右緣、只看到零碎線條。
- 比較鳥：冠海雀（白色由眼向上延伸至頭頂兩側、有冠羽、淡嘴帶黃尖）＋ 三趾鷗（黃嘴、黑腳、黑翼尖無白斑）。
- 交付：AVIF **136911 B**、MD5 `ecf9ae171ed1696e337431b2167c9606`、SHA256 `215500e195b2605179e73f0f4dff8f2a2a53d1e1ea1c1991f60fb2cb296d7605`；Drive `1SvCmbULVkPuqS-01_A3w0ON6p10AK1rv`，`get_file` 核對 parent／bytes／MD5／mime 一致。舊版 `122_i2GPN8JPWKC-FM1GxBYk3wIGlIE46`（137025 B、MD5 `0a86a17fa70379ccb87d9d29f2a010c2`）已移入垃圾桶。
- 分數：i 2.0／a 2.3／r 4.8／c 3.0／**v 3.2**／**o 3.1**（原 v2.1／o2.8）；地圖綠色像素 9481；`test-slim-feature-label.py` 4/4。

### 五張英制卡收尾狀態

| 卡 | 資料（commit `1080ed5`） | 卡面 | Drive id | bytes／MD5 |
| --- | --- | --- | --- | --- |
| 0113 反嘴鷸 | 42–45 cm | 已重出 | `1FTzMi2XlgfdjJ4TbNFE0K2V0XAVWs8Ye` | 129632／`266ba6e2…746` |
| 0151 飾胸鷸 | 19–23 cm | 已重出 | `1BriuxzscHixur_xkMD521gwAMv1FQP9_` | 140133／`94b72412…041` |
| 0154 長嘴鷸 | 29 cm、88–130 g | 已重出 | `1y6J50WGaYNxpuJCmkfMqTKwjZv3LQCTl` | 135479／`15c13ff1…009` |
| 0181 扁嘴海雀 | 20–24 cm、153–249 g | 已重出 | `1SvCmbULVkPuqS-01_A3w0ON6p10AK1rv` | 136911／`ecf9ae17…606` |
| 0385 崖沙燕 | 12–14 cm、11–20 g | **無卡面** | — | — |

Drive 資料夾 `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD` 現時這四個檔名**各只有一份**（查詢 `trashed=false` 共 4 筆，MD5 與本機一致），舊版全部在垃圾桶。0385 **是鳥的編號**（`src/data/birds.json` 全 583 種、編號 0001–0583 無跳號，0385 = 崖沙燕 Bank Swallow），不是「第 385 張卡」；卡面只做到 `infoCards.json` 的 195 張（0001–0195）。0385 在 `explorerIndex.birds`／`cardDetails`／`dexScores` 都有記錄，但不在 `infoCards.json`，Drive 亦查無 `0385.avif`，所以只改資料、沒有重出，也不應宣稱有卡面。

## 編號澄清：0385 不是第 385 張卡（2026-11-12 用戶提問）

用戶問「為什麼會有 385？我們不是總數只有 383？」——**兩個數字都不是卡數，0385 是鳥的編號。**

- `src/data/birds.json` 共 **583** 種，編號 `0001`–`0583` 連續無跳號；`0385` 就是當中的**崖沙燕 Bank Swallow _Riparia riparia_**（前後是 0384 灰喉沙燕、0386 洋燕）。
- 資訊長卡只做到 **`src/data/infoCards.json` 的 196 張**（`0001`–`0196`，現時無跳號）。`explorerIndex.birds`／`cardDetails`／`dexScores` 各 540 筆，`filterTraits` 583 筆 —— 這些數字都不等於卡數。
- 舊文件的「卡片總數 559」「0022–0569 共 548 張未做」是插圖／舊編號制度的遺留說法，與現時資訊卡的編號無關；`docs/CARD_COVERAGE.md` 的 559 亦非資訊卡數。
- 所以「5 張英制卡」= 鳥編號 0113、0151、0154、0181、0385 的**資料修正**；其中只有前四張有卡面，0385 從來沒有卡面，也沒有被算進 196 張之內。

## 0196 織女銀鷗 _Larus vegae_（LC 無危）

- Drive：`17sU4Cc-20OdJYtZiKWXXB4tfkRZJ9OwS`，131857 B，MD5 `ad71b7ef175b5c786d6ded956f28a22f`，SHA256 `1c32762bfff4cfc59059afa602a29b5ea7314f5fb0611a6a87c58e05556d1b6f`。上載前 Drive 搜尋 `0196` **0 命中**，上載後 `get_file` 核對 parent／bytes／MD5／mime 一致。已在 `infoCards.json` 登記 `restart-0196-v1`、`slim`、`#06121a`。
- 四部位：厚重的黃嘴紅斑／頭頸後方的淡縱紋／中灰翼上覆羽／黑翼尖與白斑；比較鳥 **蒙古銀鷗**（`mongolian-gull.png`）＋ **烏灰銀鷗**（`lesser-black-backed-gull.png`），兩隻都新生成，刻意做出三級灰階：蒙古最淡的銀灰、本種中灰、烏灰石板深灰配黃腳。
- **來源**：HKBWS `0110/017510`（蒙古銀鷗頁）是本卡主要依據 —— 56–68cm 為蒙古銀鷗，**織女銀鷗與蒙古銀鷗在野外無法客觀分開**（Collinson et al. 2008），頁面明列香港冬季慣用的分野：蒙古銀鷗體型更大、胸更深、嘴更長、翼更長、翼上更淡、初級飛羽黑色更多、腳粉紅或桃色、**成鳥十一月前完成換羽**，而織女銀鷗換羽遲至十二月或一月、烏灰銀鷗遲至二月底或三月初。另讀 `0110/017700`（烏灰銀鷗，51–61cm、翼上中深灰、腳黃、P8–P10 大片黑加一個白鏡斑、與織女銀鷗有雜交個體）與 `0110/017600`（灰背鷗 55–67cm，確認**不是**本卡物種）。IUCN：LC、趨勢穩定。
- 四圈：
  - 第 1 圈（厚重的黃嘴紅斑）`features.png [0.100,0.300,0.720,0.920]`：整條黃嘴、下嘴紅斑、嘴基與前額入圈。
  - 第 2 圈（頭頸後方的淡縱紋）`features.png [0.460,0.080,0.920,0.540]`：眼、後頸與頸側的淡灰褐縱紋同時入圈，正是與蒙古銀鷗的素淨白頭對比的位置。
  - 第 3 圈（中灰翼上覆羽）`pixel.png [0.480,0.380,0.640,0.540]`：純灰背覆羽疊瓦邊填滿圓形；較闊的 `[0.44,0.26,0.80,0.62]` 有大半個圓是天空，`[0.50,0.40,0.66,0.56]` 邊緣吃進白色翼線。
  - 第 4 圈（黑翼尖與白斑）`pixel.png [0.700,0.520,0.860,0.680]`：黑翼尖與兩顆白斑齊全；`[0.64,0.44,0.90,0.70]` 白斑貼邊。
- **分數未齊**：runtime `dexScores` 只有 `i 2.6／r 4.8／c 3.3／o 3.6`，**`a` 與 `v` 缺值**，卡面依既有規則顯示「待查」而非零分，並印「應用程式趣味指標・非學術評分；待查非零分」。沒有為這張卡自行補分。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes／SHA256 與 manifest、SHA256SUMS 一致、`test-slim-feature-label.py` 4/4、地圖面板 `#7da688` 綠色像素 6523（非空）、`npx tsc -b` 乾淨、`node --test` 162 項 161 過 1 略、`git diff --check` 通過。
- 只交付 `aviandex/0196.avif` 單一檔案；沒有 ZIP、沒有改 R2／UI／Service Worker。

## 583 種從何而來、383 又是什麼（2026-11-12 用戶追問）

- **583 的出處是 `docs/HK-MASTER.md`（2026-11-11 用戶拍板的香港優先編號表）**：在香港觀鳥會《香港鳥類名錄》（Category I+II，網頁列 584 種）中，把每個名字對到 **eBird／Clements v2024 的學名**，其中「綠翅鴨／美洲綠翅鴨」在名錄是兩列、在 Clements 是同一種，所以 **583 = 名錄對到 Clements 的種數**。舊編號 569（566 種、3 對重複）之中，540 個學名仍在香港名錄而保留、29 個移出並換成香港名錄缺的種（沿用原編號）、另新增 0570–0583 共 14 個，合計 583。
- `src/data/birds.json`（583 筆）與 `src/data/birdTaxonomy.json`（583 筆）就是這張表落地後的結果；`0349` 以西的連續編號可直接在 `birds.json` 查到，例如 0385 崖沙燕、0383 小鱗胸鷦鶥。
- **383 不是任何一個總數**：我在全 repo 搜過，`383` 只出現在①鳥編號 `0383`（小鱗胸鷦鶥，見 `CARD_COVERAGE.md`、`CARD_DATA_AUDIT.md`、`hk-name-audit-2026-11-11.md`）②各種 MD5／SHA／pageid。**沒有任何文件寫過「總數 383」**，也查不到 383 種、383 張卡的說法。如果你是在 UI 或別處看到 383，那應該是另一個來源（例如某個篩選後的清單長度），不是本專案的全量數字 —— 全量是 **583 種鳥**、**197 張資訊卡**（`infoCards.json`）。
- 三個數字要分清楚：**583 = 鳥種數**（香港名錄對 Clements）；**197 = 已登記的資訊長卡數**（0001–0197）；**540 = 有 `cardDetails`／`dexScores` 詳細資料的鳥種數**（其餘 43 種是新換入、欄位一律「資料待查」）。

## 0197 蒙古銀鷗 _Larus mongolicus_（LC 無危）

- Drive：`1pwIiEtOM5_6dhLNcvyv1iY6zM1kuBumB`，132432 B，MD5 `ec23885ee17a67a5cece15d301198b4e`，SHA256 `dd1916b51e09448847ed731a2c7884e657f590cc622070538ea374991deaffbc`。上載前 Drive 搜尋 `0197` **0 命中**，上載後 `get_file` 核對 parent／bytes／MD5／mime 一致。已登記 `restart-0197-v1`、`slim`、`#06121a`。
- 四部位：長而厚重的黃嘴／幾乎素白的頭／淡銀灰的翼上／黑色初級飛羽；比較鳥 **織女銀鷗**（沿用 0196 的 `pixel.png` 改名 `vega-gull.png`）＋ **烏灰銀鷗**（沿用 0196 的比較鳥），三隻並排時淡銀灰→中灰→石板深灰的順序清楚。
- **來源**：HKBWS `0110/017510`（蒙古銀鷗頁）為主 —— 56–68cm、體型更大胸更深嘴更長翼更長、翼上更淡、初級飛羽黑色更多、腳粉紅或桃色、**成鳥十一月前完成換羽**（織女十二月或一月、烏灰二月底至三月初）；十一月起成鳥頭部幾無縱紋；主要紀錄集中於一月第二週至三月末，最高 25 隻（2000-03-13）；繁殖於貝加爾湖一帶至蒙古西北與中國東北，越冬自日本至香港，迷鳥抵泰國與菲律賓；AviList 2025 視為單型。IUCN LC、趨勢穩定。
- 四圈：`features.png [0.060,0.280,0.620,0.840]`（嘴＋紅斑）／`features.png [0.300,0.060,0.860,0.620]`（頭形＋眼＋嘴基的素白頭）／`pixel.png [0.380,0.340,0.740,0.700]`（淡銀灰翼面）／`pixel.png [0.620,0.440,0.840,0.680]`（黑初級飛羽與白尖）。第 2 圈原本 `[0.44,0.10,0.90,0.56]` 只剩眼與白羽、沒有頭形；第 3 圈原本 `[0.36,0.32,0.60,0.56]` 疊瓦邊太細，改成闊框看到整片銀灰。
- **評分**：runtime `dexScores` **完全沒有 0197 記錄**，六軸與綜合全部「待查」，`missingScores` 列出全部六軸屬預期；卡面另印「綜合評分待查」與「待查非零分」，沒有補零、沒有估分（與 0014、0117 同一處理）。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes／SHA256 與 manifest、SHA256SUMS 一致、`test-slim-feature-label.py` 4/4、地圖面板 `#7da688` 綠色像素 6529（非空）。
- 只交付 `aviandex/0197.avif`；沒有 ZIP、沒有改 R2／UI／Service Worker。

## 0198 玄燕鷗 _Anous minutus_（LC 無危）

- Drive：`1AEIepZ0x3NvjVsVe6glg23Hlu8RASt4q`，131438 B，MD5 `220ddba42075107fae09fda006e0b425`，SHA256 `417e503db6e438ebee15d09bf6a995e695d6f000c46b21ad8c159c5cc1d075e2`。上載前 Drive 搜尋 `0198` **0 命中**，上載後 `get_file` 核對 parent／bytes／MD5／mime 一致。已登記 `restart-0198-v1`、`slim`、`#06121a`。
- 四部位：長過頭的細黑嘴／灰白前額對比深色後頸／白色眼圈／楔形尾與長翼；比較鳥 **白頂玄鷗** _A. stolidus_（`brown-noddy.png`）＋ **灰玄鷗** _A. albivitta_（`grey-noddy.png`），兩隻都新生成。
- **來源**：HKBWS `0110/015900`（玄燕鷗頁）—— 35–40cm；全身黑褐、**灰白前額與深色後頸成對比**、眼先黑且上緣平直、白色眼圈、嘴長過頭且尖端僅微彎；幼鳥較淡、羽緣淡窄、頭頂白斑大；與白頂玄鷗之別為體型更小更纖細、顏色更深、嘴更細長；叫聲為鼻音沙啞；**香港唯一紀錄為 2017-06-18/19 在狗洲（Kung Chau）岩石小島燕鷗繁殖群中的 1 隻**（Lewthwaite et al. 2019）；7 個亞種，本區可能出現 4 個（worcesteri、minutus、marcusi、melanogenys）；繁殖於南緯 30° 至北緯 30° 的熱帶／亞熱帶島嶼，台灣為迷鳥；IUCN LC、趨勢下降、香港屬第一類（Cat. I）迷鳥。
- 四圈：`features.png [0.020,0.200,0.720,0.900]`（整條嘴連頭與眼；第一次 `[0.02,0.30,0.60,0.88]` 只收到嘴與天空）／`features.png [0.380,0.120,0.880,0.620]`（灰白前額＋深色後頸同時入圈）／`pixel.png [0.240,0.100,0.500,0.360]`（白色眼圈）／`pixel.png [0.560,0.400,0.920,0.760]`（楔形尾與長翼，畫面較抽象但標籤已指明結構）。
- **評分未齊**：runtime `dexScores` 沒有 0198 記錄，六軸與綜合全部「待查」，`missingScores` 列出 `i,a,r,c,v,o` 屬預期；卡面依既有規則顯示「待查」而非零分，沒有補分。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes／SHA256 與 manifest、SHA256SUMS 一致、`test-slim-feature-label.py` 4/4、地圖面板 `#7da688` 綠色像素 2650（非空）。
- 只交付 `aviandex/0198.avif`；沒有 ZIP、沒有改 R2／UI／Service Worker。

## 0199 小黑背鷗 _Larus fuscus_（LC 無危）

- Drive：`1QzoptWrJUAwRlscU2wvEVCeya3_F443n`，130581 B，MD5 `740bbedb092f6e8b308a2e149899b7a3`，SHA256 `c722331d7affeced353354cbe019dd6c87ae67455f48326cb9bf4c7aaea9c8c4`。上載前 Drive 搜尋 `0199` **0 命中**，上載後 `get_file` 核對一致。已登記 `restart-0199-v1`、`slim`、`#06121a`。
- 四部位：較小較細的黃嘴／黃色的腳／深石板灰翼上／大片黑初級飛羽；比較鳥 **織女銀鷗**（沿用 0197 的 `pixel.png` 改名 `vega-gull.png`）＋ **蒙古銀鷗**（沿用 0197 的比較鳥），三隻並排時中灰→淡銀灰的順序與本種深灰成對照。
- **來源**：HKBWS `0110/017700`（小黑背鷗頁）—— 51–61cm；香港成鳥以翼上中深灰、換羽前的灰褐頭部縱紋、黃色或大部分黃色的腳辨識；初級飛羽換羽最遲、二月底至三月初完成；**少數個體是與織女銀鷗的雜交**（腳色黃→粉紅連續變化）；成鳥 P8–P10 有大量黑色、最外一枚一個白鏡斑、P9 若有鏡斑通常很小；第一年鳥體型更小更纖細、翼更長、嘴更小、內側初級飛羽無淡色對比、尾帶寬黑、大覆羽深色；紀錄多來自內后海灣夜棲群，蒲台島北遷過境 1 月 6 日至 4 月 12 日、2007-03-15 高峰 291 隻；最高 865 隻（2000-01-28），2015/16 之後冬季數量偏低；繁殖自冰島與西北歐至泰梅爾半島；IUCN LC、趨勢上升。
- 四圈：`features.png [0.200,0.140,0.520,0.360]`（整條嘴連紅斑）／`features.png [0.600,0.620,0.920,0.940]`（兩腳黃色脛跗與蹼趾）／`pixel.png [0.340,0.340,0.620,0.620]`（深石板灰翼上）／`pixel.png [0.600,0.460,0.860,0.720]`（大片黑初級飛羽與白鏡斑；停棲折翼狀態，已在註解說明不代表飛行圖案）。四圈首次候選全部可用，是這批最快的一張。
- **評分未齊**：runtime `dexScores` 只有 `i 2.0／v 4.4／r 2.5／c 1.2／o 2.5`，**`a` 缺值**，卡面顯示「待查」而非零分，並印「待查非零分」。沒有自行補分。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes／SHA256 一致、`test-slim-feature-label.py` 4/4、地圖綠色像素 9177。
- 只交付 `aviandex/0199.avif`。

## 0200 灰背鷗 _Larus schistisagus_（LC 無危）

- Drive：`1qmILYFNFzGl2pxP0D6uxsB18IGF-dT20`，137608 B，MD5 `8727375a5f910ff9520ef80676eec1eb`，SHA256 `1c96fb2e9f22b29adae1937e206695c074d5ef91d49edc6eabece6081e0996d6`。上載前 Drive 搜尋 `0200` **0 命中**，上載後 `get_file` 核對 parent／bytes／MD5／mime 一致。已登記 `restart-0200-v1`、`slim`、`#06121a`。**這是資訊卡的第 200 張**。
- 四部位：淡色虹膜／粗厚的黃嘴紅斑／深石板灰翼上／寬白三級飛羽新月；比較鳥 **小黑背鷗**（沿用 0199 的 `pixel.png` 改名 `lesser-black-backed-gull.png`）＋ **灰翅鷗** _Larus glaucescens_（`glaucous-winged-gull.png`，新生成，翼尖與翼上同為淡灰，作灰階對照）。
- **來源**：HKBWS `0110/017600`（灰背鷗頁）—— 55–67cm、大型而常粗壯、翼相對短、嘴粗、腳深粉紅；**成鳥在香港罕見**，翼上石板灰、三級飛羽寬白新月、虹膜淡色、非繁殖羽頭頸有灰褐縱紋、嘴有時很淡而暗淡；飛行時次級與內側初級有寬白後緣、翼下飛羽深色、最外一枚（有時倒數第二枚）白鏡斑小；第一年鳥全身褐、大覆羽素淨、嘴深色且易褪色；主要紀錄來自內后海灣下降潮夜棲群，一月第二週至四月初、三月高峰，極端日期 2016-11-07 與 2014-04-19；首筆紀錄為 1984-03-17 白泥灘兩隻第一年冬鳥；單型，繁殖於鄂霍次克海與東白令海沿岸南至北海道，越冬南至日本、黃海沿岸及華南；IUCN LC、趨勢不詳；香港屬第一類（Cat. I）稀少冬候鳥及初春過境鳥。
- 四圈：`features.png [0.300,0.100,0.660,0.420]`（淡色虹膜＋灰褐頭頸縱紋）／`features.png [0.040,0.200,0.440,0.540]`（整條黃嘴連紅色亞末端斑點）／`pixel.png [0.440,0.240,0.800,0.780]`（深石板灰翼上＋三級飛羽白新月）／`features.png [0.380,0.520,0.880,0.960]`（寬白三級飛羽新月近景）。第 3 圈前後試過 8 個候選，最終選翼面與新月同時飽滿的一框；第 4 圈是唯一在 235px 下仍清楚看到「寬白新月」形狀的候選（`pixel.png [0.58,0.42,0.94,0.78]` 曾把新月推到圓邊）。
- **評分齊全**：runtime `dexScores` `i 2.0／a 2.3／v 4.5／r 4.8／c 1.2／o 3.0`，`missingScores` 為空。
- **資料注意**：`src/data/cardCopy.json` 的 0200 條目有「⚠️ 條目含『來源請求』標記」的既有註記，並沿用 zh.wikipedia 的別名「大黑脊鷗」與只提「翅膀邊緣有寬白邊」的簡化描述。卡面一律用 app 名稱 **灰背鷗**、學名依 IOC／HKBWS 為 _Larus schistisagus_，說明文字取 HKBWS；**沒有改寫 `cardCopy.json`**，該檔待日後以正式名錄覆核。
- 交付前檢查：`spec == manifest.spec`、AVIF 1024×1536、bytes／SHA256 與 manifest、SHA256SUMS 一致、`test-slim-feature-label.py` 4/4、地圖面板 `#7da688` 綠色像素 5772（非空）。
- 只交付 `aviandex/0200.avif`；沒有 ZIP、沒有改 R2／UI／Service Worker。

## 資訊卡 200 張的現況（2026-11-12）

- `src/data/infoCards.json` 的 `ids`／`layouts`／`revisions`／`panelColors` 現時各 **200** 筆，`0001`–`0200` 連續無跳號（`0198`、`0199`、`0200` 在本輪登記，皆 `slim`、`restart-NNNN-v1`、`#06121a`）。
- 兩個圖集要分清楚：**插圖 `birdcards/NNNN.avif` 583 張已齊**（正方形，另一套，非本輪產物）；**資訊長卡 `aviandex/NNNN.avif` 現時 200 張**（1024×1536，`0001`–`0200`）。
- 仍有 43 種鳥在 `src/data/dexScores.json` 沒有評分記錄（如 0014、0117、0197、0198），卡面一律「待查」而非零分；本輪沒有為任何一張自行補分。

## 交接文件：`docs/INFO_CARD_AGENT_BRIEF_0200.md`（2026-11-12）

- 200 張之後另寫了一份給下一位 agent 的交付對話，內容包含：本輪四張的 bytes／MD5／Drive id、583／200／540／559／383 各數字的出處、Drive 資料夾實測狀態（192 個未刪 `.avif`、6 個垃圾桶舊版、`0001`–`0008` 查無檔案）、本機環境與 `cards/art`／`deliver/cards` 不入 Git 的後果、接手第一步、已踩的坑、五項仍未解決的缺口，以及不可違反的規矩。
- 那份文件的數字全部是查證過的；`0001`–`0008` 一項是用 `name='000N.avif'` 逐個查（未刪與垃圾桶皆 0 命中）得出的，不是推測。

## 0201 灰翅鷗 _Larus glaucescens_（LC 無危）

- 已交付 Drive 單檔 [`0201.avif`](https://drive.google.com/file/d/125V4i_N7U3tC-V7vwA1z0BzWT_jSTxsc/view)：`125V4i_N7U3tC-V7vwA1z0BzWT_jSTxsc`，131800 B，MD5 `33b6144b536d1b953830dcd8ed914e66`，SHA256 `d2ab592dd07e3e40c62841a3c839a401605056fee80d0393c9122fb2cbd29060`。上載前精確查重 0 命中；上載後 `get_file` 核對名稱、parent `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD`、bytes、MD5、`image/avif`、未刪除一致。本機 manifest 的頂層狀態已設 `uploaded_drive_verified`，嵌入 spec 保留 `review_before_upload`。
- 圖示為 AI 成鳥繁殖羽，性別未指定，經基本目視但非獨立鳥類專家驗證；HKBWS 所列香港紀錄為第一年鳥，本圖不能代表該羽齡。比較鳥為新生成灰背鷗和北極鷗，兩圖先補邊為正方形以保留全鳥，非等比例。沒有重做 `birdcards/` 插圖。
- 四圈先看 4×4 格線及 235px 圓，再看全卡：`features.png [0.145,0.02,0.39,0.29]` 深色虹膜；`features.png [0.045,0.01,0.275,0.355]` 粗黃嘴與紅斑；`features.png [0.38,0.32,0.66,0.66]` 淡灰翼上覆羽（羽緣填滿畫面較抽象，只描述覆羽，不宣稱翼尖）；`pixel.png [0.30,0.64,0.56,0.94]` 粉紅色腳（部分腳趾被圓形遮罩切掉，標籤不宣稱完整腳趾）。原先嘴圈裁去嘴尖，已換框。
- 來源：HKBWS 索引定位 [017300](https://avifauna.hkbws.org.hk/species/0110/017300)（非 app ID）——58–62 cm，粗壯厚嘴、深粉紅腳；成鳥上體淡灰、初級飛羽稍深，非繁殖羽頭頸淡褐斑；第一年鳥淡褐且全黑嘴，與褪色的灰背鷗易混淆。香港第一類、冬季偶發，所列 1993、1994、2000、2009 紀錄均在后海灣潮間帶；北太平洋繁殖、越冬常南至北海道及加州；IUCN LC，全球趨勢上升。另讀 HKBWS [017600](https://avifauna.hkbws.org.hk/species/0110/017600) 和 [017400](https://avifauna.hkbws.org.hk/species/0110/017400) 比較，Cornell Birds of the World 的 distribution 搜尋摘要支持卑詩省分佈。世界底圖只標 RUS、USA、CAN、JPN 的部分原生國家概覽，不把香港偶發紀錄標作原生範圍，不表示全國或全部分佈。
- `cardCopy.json` 原有體長 50–68 cm、體重 730–1690 g、LC、分佈文字提福建；HKBWS 體長 58–62 cm，兩範圍來源不同，分開記錄，不改 runtime，渲染器不印這些量度或分佈文字。評分直接取 `dexScores`：i 2.0／a 2.8／v 4.4／r 1.0／c 1.2／o 2.3，無缺分。
- **更正舊紀錄**：0200 spec 的「香港並無灰翅鷗紀錄」與 HKBWS 017300 矛盾；本次沒有改寫 0200 既有 spec 或重出已交付 AVIF。0200 歷史文件未提此句，但該 spec 的 notes 和比較說明仍含錯誤，後續使用須留意。
- 檢查：`spec == manifest.spec`、AVIF 解碼 1024×1536、bytes／SHA256／SHA256SUMS 一致、ISO3 底圖存在、世界 bounds 正確、地圖原圖綠色像素 35955、六分與 runtime 一致、`test-slim-feature-label.py` 4/4、`npx tsc -b` 通過、`node --test tests/*.test.mjs` 162 項（161 過、1 略）、`git diff --check` 通過；無 ZIP。
- **尚未登記至 `src/data/infoCards.json`**：依目前交接流程，不在用戶確認 R2 上載前註冊 slim；現有登記仍為 0001–0200 共 200 張。0201 已交付 Drive，但未上載 R2、未改 UI／Service Worker／runtime。素材與本機交付檔在 `.gitignore` 路徑，不保證新 checkout 有原素材。下一張為 0202，須先查 Drive。

## Drive 目的地更正及 0202–0204 交付（用戶最新指示）

- 用戶已把 0201 移出「已上載R2」，要求後續 AVIF 不要放進該子資料夾，直接放在 0201 所在的同一資料夾。實測 `get_file`：0201 原 Drive ID `125V4i_N7U3tC-V7vwA1z0BzWT_jSTxsc` 現在 parent 為 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`，bytes 131800、MD5 不變；前節記錄的 `1ifxTCJOC--wYGG1SRLK_9gv0Oem9ZseD` 是**上載當時**的位置，不是現在或後續目的地。每次先在外層查重。
- 上載前外層精確搜尋 0202／0203／0204 0 命中；三張均以 `image/avif` 單檔上載到外層，逐個 `get_file` 確認名稱、未刪、parent、size、MD5 和 MIME。沒有 ZIP 或 R2 操作。manifest 頂層已標記 `uploaded_drive_verified`；spec 繼續為 `review_before_upload`。

| 編號／物種 | Drive id | bytes | MD5 | SHA256 |
|---|---|---:|---|---|
| 0202 北極鷗 _Larus hyperboreus_ | `1-3E8zbnydGTp6aad53IobUSPzKgW94gf` | 133537 | `1f81d0c3f434f536b25f1c252726ab29` | `605ae62f2775a3019b788ff7a439a20b0efdfd95d627aab89d8e1102c9f0d410` |
| 0203 白頂玄燕鷗 _Anous stolidus_ | `1TBiIBKmM7Sn959ZabcHzrAqcaKO0NCAf` | 131845 | `646a5458ef17404f69ffcf3141750a51` | `bcf94133a2833ebcf0e717ad4ec1e5e56313da4390c745e3bfc1bb523dd4209a` |
| 0204 烏燕鷗 _Onychoprion fuscatus_ | `1NA3lnz4lL5959RBBl8J3dwHVy0HVRCvp` | 130578 | `13220514c484603b529dea619569a55c` | `0c454ca7475369ab6c8f774b6bfe59e81e09cb137c561512a57ffd440fd47716` |

- 三張均以實讀來源及已目視素材編寫各自 spec，再由程式繪製；看 4×4 格線、235 px 四圈與最終全卡。三張 illustration 都是 AI 圖、基本目視而非獨立鳥類專家核驗；比較鳥非等比例。六分直接取 runtime，無缺分。每張 spec 與 manifest 一致、AVIF 1024×1536、bytes/SHA256/SHA256SUMS 一致、ISO3 存在、世界 bounds 正確，底圖綠色像素分別 40443／11812／12117；標籤測試 4/4，`npx tsc -b` 通過，`node --test tests/*.test.mjs` 162 項 161 過、1 略。
- **0202**：HKBWS [017400](https://avifauna.hkbws.org.hk/species/0110/017400) 64–77 cm，香港冬季罕見、多第一年鳥；成鳥灰背及灰白初級飛羽，LC 全球趨勢穩定；本圖是成鳥繁殖羽。母本 `cardCopy` 55–77 cm 與 HKBWS 範圍不同，未修改且不印該數值。四圈：`features.png` [0.045,0.025,0.29,0.37] 粗黃嘴紅斑／[0.37,0.33,0.64,0.68] 淡灰翼上覆羽（抽象）／[0.68,0.48,0.98,0.79] 灰白初級飛羽（折翼、尖端靠圓邊）／[0.25,0.66,0.53,0.97] 粉紅色腳。比較灰翅鷗和灰背鷗。
- **0203**：HKBWS [015800](https://avifauna.hkbws.org.hk/species/0110/015800) 40–45 cm，香港偶發、深褐色及灰白頭頂、楔形尾，LC 全球趨勢穩定；母本錯誤長度 `52–35 mm` 與該來源相衝突、部分文字稱「玄燕鷗」，皆記錄而不改 runtime，卡面不印體長。初稿全鳥尾羽分叉，重新生成單尖楔形尾後替換；近景圖並不作尾形依據。四圈：`features.png` [0.115,0.06,0.39,0.39] 頭頂／`pixel.png` [0.04,0.11,0.37,0.48] 黑嘴／`features.png` [0.14,0.06,0.38,0.33] 眼圈／[0.34,0.33,0.64,0.68] 褐色翼覆羽（抽象）。比較玄燕鷗和烏燕鷗；前者圖有岩石底座。
- **0204**：HKBWS [018400](https://avifauna.hkbws.org.hk/species/0120/018400) 36–45 cm，香港多見第一年鳥，颱風期偶發；本圖成鳥、LC 全球趨勢不詳。母本體長 33–36 cm 不同，保留未改且不印；主圖沿用本批 0203 烏燕鷗比較圖、兩比較鳥沿用本批已核對素材，近景另生。比較白頂玄燕鷗及玄燕鷗；原擬生成褐翅燕鷗比較圖時本輪生圖達 10 張上限，未生成、不繞過。四圈：`features.png` [0.12,0.16,0.35,0.44] 白額黑頂／[0.02,0.14,0.34,0.50] 黑嘴／[0.35,0.38,0.64,0.66] 深色翼覆羽（抽象）／[0.22,0.27,0.52,0.63] 白色胸部；試渲染後調整嘴圈及胸部標籤，再目視重渲染。
- `infoCards.json` 保持 200 筆（0001–0200）；0201–0204 為 Drive 已交付但未確認 R2／未註冊，不要誤報為 204 筆註冊。下一隻 0205 褐翅燕鷗；先查目的地有無同名檔及來源，留意 `dexScores` 的 `vEst`。`cards/art/` 和 `deliver/cards/` 不入 Git，新環境不能假設保有素材。

## 0205–0208 交付及缺分雷達更正

- 於外層 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up` 查同名四檔均 0 命中，分別上載 `image/avif`，get_file 確認未刪、parent、MIME、bytes、MD5 與本機一致。無 ZIP；未改 R2、UI、Service Worker、runtime 或 `infoCards.json`，登記仍 200。

| 編號／物種 | Drive ID | bytes | MD5 | SHA256 |
|---|---|---:|---|---|
| 0205 褐翅燕鷗 | `1LJsf3ZiH6YTcDbDyBdo4TaFaeQmjZ68m` | 133474 | `c1113571f13c398750be8f41a778c13e` | `19e5cb2caa5d0b45c102b3ecdd3dcdb090d351102325c91ece1b2d955f63a8c3` |
| 0206 白腰燕鷗 | `1yfpsrlv6SH8uCMFTP-KmViYFwFqaEeCT` | 130324 | `d6686ddd8a2b6dd438591835a13dc646` | `6f26c8f3222280c081c6f6f2d9f480aab9fffd324acc826c0125da8f872b6e41` |
| 0207 鷗嘴噪鷗 | `1PLNismVpNngjcABbM2tUkKduD8Js82RY` | 133173 | `5822e95bcf8f02ffc38bfa2b63a689f3` | `9753521bbf7f768d9ab733873b33f89ae0cf9d1729b1434c4f5b9e16069e95d6` |
| 0208 紅嘴巨燕鷗 | `1fn8nB9g49eZ2JvQtNOdf5nRO6GS2yZ43` | 136589 | `8989134b0178f5ca1de516eefd94da2e` | `16b2994506654faf3a6885a8223cc87e9cb9ec1279674346b9bc460ca2edbb47` |

- 0205 [HKBWS](https://avifauna.hkbws.org.hk/species/0120/018300)：成鳥白額延至眼後、棕灰背；母本中文看相是亞成鳥、短粗嘴 callout 不適用此成鳥，記在 spec，未修改 runtime。`vEst=1`，卡面保留估算提醒。
- 0206 [HKBWS](https://avifauna.hkbws.org.hk/species/0120/018200)：繁殖成鳥灰背胸、白額、白腰尾；VU，cardCopy 中文 IUCN 缺而英文 `iucnEn` 為 VU，與 HKBWS 一致；`dexScores` i、c 缺，待查非零，vEst=1。翼下暗色次級飛羽的鑑別特徵不在折翼圖中，沒有標示。
- **重要歷史限制**：舊 composer 把缺少的雷達軸畫到中心，雖然標待查但可能誤導為零；已修復 slim 繪圖：缺值不畫點、不填封閉多邊形，只連接有分數的相鄰軸。0206 以修正後版本渲染並目視核對。先前如 0198／0199 的已交付舊卡可能有此圖形問題，沒有重出或覆蓋；後續若要修正需先確認可用經核實的原始素材，並由用戶決定。
- 0207 [HKBWS](https://avifauna.hkbws.org.hk/species/0120/017800)：粗黑嘴黑頂；初稿有錯誤白額而棄用，改用黑額修正版。母本 33–42 cm、HKBWS 33–38 cm，卡面不印數字。
- 0208 [HKBWS](https://avifauna.hkbws.org.hk/species/0120/017900)：紅色大嘴帶暗斑、黑頂，母本 48–60 cm、HKBWS 47–54 cm，卡面不印數字。0207／0208 比較圖普通燕鷗為紅嘴紅腳型，香港最常見 `longipennis` 為黑嘴黑腳；比較圖非等比例。
- 四張均由已檢視的鳥素材建立個別 spec；已查看四個遮罩圓及全卡。AVIF 1024×1536、spec 與 manifest、分類和分數、SHA256、世界 bounds／ISO3 均核對；圖片由 AI 生成，只做基本目視，未經鳥類專家認證。素材及本地交付檔被忽略，跨環境可能缺失。下一張 0209 須先查 Drive 及來源。
- 本輪標籤及缺分雷達測試 5/5、`npx tsc -b` 與 `git diff --check` 通過。完整 Node 測試本輪卡在 `updateStore.test.mjs`，180 秒逾時後停止；不把本輪記成全套通過。

## 0209–0213 交付

- 上載前在外層 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up` 精確查詢五檔均 0 命中；以 `image/avif` 單檔上載後逐一 `get_file` 驗證 parent、檔名、未刪、MIME、bytes 和 MD5 一致，沒有 ZIP。

| 編號／物種 | Drive ID | bytes | MD5 | SHA256 |
|---|---|---:|---|---|
| 0209 白翅浮鷗 | `1Ik5gGA7Bhnwlq6D5BnafWqNzYiF8zn4z` | 133462 | `adf25257a33298de91cfb6d9b763b6c0` | `7007a4481c8a3acbeaf10d8d6c6cf1fff280d53e9d5bd8b398994804ddfe0697` |
| 0210 鬚浮鷗 | `1IIRTdNwxOLp2Ceow1BY0Aye6nqJLW5_6` | 135288 | `4cf443e6d459ec2935d557403b405c87` | `6344f78b6412dfa56079df4d30f1f42e866813311d398867ae28ba85a899e0bd` |
| 0211 粉紅燕鷗 | `1aJ8JCsPuzL3oCwPFnXKv-qqoqkz2uUfk` | 129107 | `ee30d08ca156418b68382afe22cfd469` | `38b7c19da0a31ec65b43c762197f359e1f9427204c46dfdc971f89fd3ab8af1b` |
| 0212 黑枕燕鷗 | `1ORdFlH2IVoCSERQWm0UNeXH-R13HTvu0` | 131219 | `08eaaf49183f64ffada6c361660ddbbf` | `4cf5e8569ea916984b416af5cdcfa5dd7171a3340edfd689ebed51f244fcd5df` |
| 0213 普通燕鷗 | `1Vp7qG4FZtrPOxsOpgoiAY68q5PKU7hA8` | 130361 | `7fe18c566dbc7348704b5507e736f625` | `77e2b449f2a9ecf14409faccf7b234e6928cec104dd2331c1061eb3adfbfc99f` |

- 每張依實讀來源、目視素材建立獨立 spec，已看四個遮罩圓及完整預覽；六項 scores 直接取 runtime、無缺分，0209／0210／0212 `vEst=1` 卡面保留估算提示。AVIF 解碼 1024×1536、spec = manifest.spec、分類及分數、SHA256、世界 bounds 和 ISO3 核對。圖片只經基本目視，非獨立鳥類專家認證。地圖僅為部分國家概覽，非精確分佈或全國皆有。
- 0209 白翅浮鷗：HKBWS [018900](https://avifauna.hkbws.org.hk/species/0120/018900) 繁殖羽黑頭體、淡灰翼、白腰尾；折翼圖白腰被遮擋，沒有用特徵圈聲稱展示白腰或翼下。近景有岩石底座但特徵圈不展示；黑浮鷗比較圖並不清楚展示白色尾下覆羽。
- 0210 鬚浮鷗：HKBWS [018800](https://avifauna.hkbws.org.hk/species/0120/018800) 成鳥繁殖羽白頰、灰胸、深紅嘴，母本中文外形是幼鳥，圖例未混用羽齡。
- 0211 粉紅燕鷗：HKBWS [018500](https://avifauna.hkbws.org.hk/species/0120/018500) 繁殖初期黑嘴和淡粉胸、橙腳；繁殖後期嘴可能轉紅。母本長 33–36 cm、HKBWS 33–41 cm，未改 runtime、未印長度。
- 0212 黑枕燕鷗：HKBWS [018600](https://avifauna.hkbws.org.hk/species/0120/018600) 白頂、黑眼罩延至黑後頸、黑嘴黑腳；香港離岸繁殖。
- 0213 普通燕鷗：HKBWS [018700](https://avifauna.hkbws.org.hk/species/0120/018700)，本圖為香港常見深嘴深腳 longipennis 型，與母本紅嘴紅腳型不同；體長母本 31–35 cm、HKBWS 34–37 cm，未印長度、未改 runtime。
- `test-slim-feature-label.py` 5/5、`npx tsc -b`、`git diff --check` 通過；本輪未重跑 Node 全套。素材和本地交付被 gitignore，跨環境未必保留。未操作 R2、UI、Service Worker 或 `infoCards.json`，登記仍為 200；下一隻 0214 先查來源及 Drive。

## 0214 大鳳頭燕鷗：交付及評分輸入待核

- 已交付 Drive 外層 [`0214.avif`](https://drive.google.com/file/d/1UfzkSUKtextGoWbEWQYpxfM19dCT-xTb/view)：ID `1UfzkSUKtextGoWbEWQYpxfM19dCT-xTb`，134437 bytes，MD5 `cba1444b1bc1e3c079de1cb37cde069e`，SHA256 `b84149aaf165c028cee8c936f4cfd0c9bb0cbf8b9af1011347ddc157dae09073`。上載前外層精確查重 0 命中，沒有下一頁且搜尋完整；上載後 `get_file` 核對 parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、檔名、MIME、bytes、MD5、未刪狀態。
- HKBWS [大鳳頭燕鷗](https://avifauna.hkbws.org.hk/species/0120/018000)：45–53 cm、全年白額、繁殖羽黑冠冠羽、黃或綠黃嘴、黑腳、灰上體、LC。母本 `cardCopy.json` 體長 `5.4–6.5 cm`、體重 `30 g` 明顯可疑；冬羽描述與繁殖羽圖不同，卡面不印體長／體重，未改 runtime。比較白額燕鷗及紅嘴巨燕鷗，素材與四個實際遮罩圓、最終預覽已目視；翼覆羽圈較抽象、腳尖及嘴尖靠圓邊。AI 圖非專家認證，比較鳥不按比例。世界圖僅部分國家概覽。
- **影響評分：**`explorerIndex.json` 此鳥 `len=6` cm，與上述權威 45–53 cm 不符；`src/lib/dexScore.ts` 以體長算觀賞值及綜合分。runtime 的 `v=1.6`、`o=2.7` 因此受錯誤輸入影響，並非真的缺值。為避免印出誤導分數，本卡在 spec 的 `withheldScores` 列理由，兩項顯示「待查」，其他四項仍照 runtime；沒有改 runtime，也沒有自算新分。renderer 支援具理由地隱藏受污染分數，manifest 區分 `missingScores` 與 `withheldScores`。卡面「待查非零分／部分評分來源待核」。修復 app 體長及重新計分須另行處理。
- 本次 AVIF 解碼 1024×1536、spec=manifest.spec、SHA256、四項顯示分與 runtime、兩項遮蔽及原因核對；四圈和預覽目視；`test-slim-feature-label.py` 5/5、`git diff --check` 通過；沒有跑 TypeScript 或 Node 全套。未動 R2、UI、Service Worker 或 `infoCards.json`，登記仍 200。
- **下一張 0215 尚未交付。** 已產白尾鸏與比較鳥候選，但候選紅尾鸏有黑翼尖，與 Cornell [描述](https://www.allaboutbirds.org/guide/Red-tailed_Tropicbird/id) 成年鳥翼無黑色不符，不能直接使用，須重生或另選比較鳥；已生成的 0216–0218 候選亦未寫 spec、未完成檢視及交付。素材被 gitignore，換 sandbox 未必保留；不得憑記憶猜裁切。

## 0215–0218 交付

- 上載前精確搜尋外層 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up` 四個同名檔 0 命中、無下一頁且搜尋完整；上載後逐一 `get_file` 確認名稱、parent、MIME、bytes、MD5、未刪狀態。只上載 AVIF 單檔，未動 R2、UI、Service Worker 或 runtime／`infoCards.json`（登記仍 200）。

| 編號／物種 | Drive ID | bytes | MD5 | SHA256 |
|---|---|---:|---|---|
| 0215 白尾鸏 | `1woDyYWOrjHhsS7S1RFvernRHrNbb4lUu` | 133524 | `4371526018421e37f43e55fc6f707215` | `052d2ecc8ebb0749e7116c73af23b248d62fb0104779fa5d9f012de4e7771e0e` |
| 0216 紅喉潛鳥 | `1qzm7hqsJz7G8RRwLmEcAe-zbZRU6UFH1` | 132221 | `ee50e3bf78e39894de98148350505dca` | `ada916bfaf2f918efc7f6aaf1b959b2599b632708955de014cf73178b922fa98` |
| 0217 太平洋潛鳥 | `1n6JPBTOsG5fLTggD_sx99Llna4UWrsjT` | 129087 | `f897431c63a329847488ec72364606fd` | `a6a54391f6695c97aa66b177f89cef29965aa1dd18bfddd19b02bed8126e57a7` |
| 0218 黃嘴潛鳥 | `1bhhxwgt1-N7U29viGlCdClIbR2yUC_Z_` | 137731 | `2a325a20f67d6da619718b6dd9d85f6e` | `ebdf8d2c7518200a4a0822934776e67f3817a57b27a2eec800733b5316b340df` |

- 四卡由獨立 spec 渲染，逐張看素材、四個實際圓及預覽；AVIF 解碼 1024×1536、spec 等於 manifest、分類、六項 scores、SHA256、世界 bounds 及國家 ISO3 核對。特徵局部抽象或邊界截切詳見 spec；AI 圖僅作基本目視，非鳥類專家認證；比較鳥不等比例，地圖只為部分國家概覽。`test-slim-feature-label.py` 5/5、`git diff --check` 通過；未跑 TypeScript 或 Node 全套。
- 0215 [HKBWS](https://avifauna.hkbws.org.hk/species/0130/019500)：香港唯一紀錄為幼鳥、無成鳥長尾；主圖為成鳥，不能代表該紀錄。紅尾鸏比較圖初版黑翼尖錯誤，已生成白翼修正版並查看；主圖黑翼帶與翼尖相接是簡化，不當成精確羽列。母本喙 callout 文字無意義，未改 runtime；`vEst=1`，卡面標體長估算。
- 0216 [HKBWS](https://avifauna.hkbws.org.hk/species/0130/019600)：53–69 cm，冬羽上體白點、白頸、細嘴常上揚；母本為繁殖期紅喉，卡圖為冬羽；原候選脅羽有條紋，重生成白脅圖，眼前白色延伸僅近似示意。母本 55–67 cm，未印體長。
- 0217 [HKBWS](https://avifauna.hkbws.org.hk/species/0130/019700)：成鳥冬羽素灰上體、嘴較直；原圖後側顯白易誤導，換用深色後脅圖；本圖不代表香港紀錄特定羽齡。
- 0218 [HKBWS](https://avifauna.hkbws.org.hk/species/0130/019800)：冬羽灰褐上體、淡頭頸和淡嘴；全球 NT。使用本批已檢視之 0216／0217 主圖作比較鳥。
- 下一個編號 0219 褐燕鸌，先查同名與可靠來源。素材與本機 deliver 被 gitignore，新 sandbox 不保證存在。

## 0219 褐燕鸌及 0220 待查

- 已交付外層 [`0219.avif`](https://drive.google.com/file/d/19blXHZIN7sCO9gGgWPGOpOCm-gkVDkqO/view)：ID `19blXHZIN7sCO9gGgWPGOpOCm-gkVDkqO`，132107 bytes、MD5 `dc1bb07fc9ee72f1118021d109db0c4f`、SHA256 `f4d83d49cd7d16d265556812aefcc0a3623f98143369c826010e64d5d2a5fa19`。上載前外層精確查重 0 命中、搜尋完整，之後 `get_file` 確認 parent、檔名、大小、MD5、MIME 和未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0140/020500) 褐燕鸌深褐色、較淡翼帶、長尖楔尾；香港唯一紀錄為風暴後獲救個體。比較深色型楔尾鸌及黑叉尾海燕（尾有叉），不等比例、全鳥圖偏暗；各素材與四圈及預覽已目視，AI 圖非鳥類專家認證。AVIF 1024×1536、spec=manifest.spec、scores 與 runtime、SHA256、ISO3、bounds 核對；標籤測試 5/5、`git diff --check` 通過；未跑 TypeScript／Node 全測。未動 R2、UI、Service Worker 或 runtime。
- **0220 白額鸌尚未完成或上載**：母本 `cardCopy.json` 為 LC、`dexScores` i=2、c=1.2、o=3；但 HKBWS [2024 頁](https://avifauna.hkbws.org.hk/species/0140/020100) 為 NT，2026 [台灣研究](https://pmc.ncbi.nlm.nih.gov/articles/PMC13717478/) 亦記錄 2015 起 NT。`src/lib/dexScore.ts` 的 i／c／o 依 IUCN 計算，因來源衝突不應直接印舊分。先核實狀態及決定如何呈現，未改 runtime。候選主圖已生但未寫 spec、未完成圓圈或預覽審核；素材被 gitignore，跨 sandbox 不保證保留。外層 0219／0220 上載前合併查重均 0 命中；下輪須重查 0220。


## 0220 白額鸌：依康奈爾 NT 交付

- 依用戶決定採 [Cornell eBird](https://ebird.org/species/strshe) 全球 IUCN 2025 NT，與 [Birds of the World](https://birdsoftheworld.org/bow/species/strshe/cur/introduction) 一致；runtime cardCopy 仍為 LC，未修改 runtime。依 `dexScore.ts`，舊 LC 污染 i=2、c=1.2 及綜合 o=3，spec `withheldScores` 列理由並在卡面標待查；a=2.8、v=4.2、r=4.8 照 runtime，未自算新分。
- 已上載外層 [`0220.avif`](https://drive.google.com/file/d/1Kn1OcG_yniPc7lcwtK25grC-UKnOrlX2/view)，ID `1Kn1OcG_yniPc7lcwtK25grC-UKnOrlX2`，135488 bytes，MD5 `a3f43ecf84d18cfc6d84bdd6cf6fad08`，SHA256 `ee513cd43312967fb7a383454b3d4bfa8a387eabc7f1dc67bbdc9f6ebef053e2`。上載前外層精確查重 0 命中、搜尋完整；`get_file` 已核對 parent `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`、名稱、MIME、bytes、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0140/020100) 白下體、斑駁頭、翼下覆羽有深斑及飛羽端部深色；原候選白色上翼帶不採用，翼下候選加入深斑後目視。斑點位置及數量僅 AI 示意，非精確羽列；圖未展示棕色上體。比較肉足鸌及深色型楔尾鸌，不等比例；AI 圖僅基本目視，非專家認證。已目視四圈及完整卡；AVIF 1024×1536、分類、spec/manifest、scores、bounds/ISO、bytes、hash 核對；標籤測試 5/5、`git diff --check` 通過，未跑 TypeScript／Node 全測。未動 R2、UI、Service Worker、runtime 或 `infoCards.json`。
- 下一張 0221 尚未交付：已生成肉足鸌主圖候選（粉紅嘴黑尖）及頭部近景候選，但近景胸部過淡不符合 eBird「全身深巧克力色」，不可直接使用；0222 楔尾鸌深色型、0223 短尾鸌亦只有主圖候選，均無 spec、四圈審核或成品。三者康奈爾 BoW 分別 NT、LC、LC；素材 gitignored，換環境未必存在。須逐卡查來源、審核及上載前再查重。


## 0221–0225 交付

- 上載前 Drive 外層精確查五個名稱均零命中、完整無下一頁；逐檔上載並 get_file 核對檔名、parent、MIME、bytes、MD5、未刪。無 ZIP；未動 R2、UI、Service Worker、runtime／infoCards.json。

| 編號／物種 | Drive ID | bytes | MD5 | SHA256 |
|---|---|---:|---|---|
| 0221 淡足鸌 | `1meNLPLjcalo2xqHp2t261YaophxuJYj2` | 133982 | `fe8b6ecd9029d9d104b1b67c73a78f55` | `e6ec8bb096b0e33d4c29cafd14b549e0ed5806f03f32c57b8a958693d64e40cd` |
| 0222 楔尾鸌 | `1C_ShazLnJqynT6AS_RMiQZrL9NDN9zsJ` | 131822 | `3c2ca07a1b70113fa0aebd1b73829842` | `9e75662f1bcb24019d5ae1f60b2111976d04d8a7659d11fd8f5870d045d030d6` |
| 0223 短尾鸌 | `1ILM1uVrE8X8bNJLuPLXJZfXCI_3plB9e` | 134062 | `a2f94cf239db5b5b576996102860a214` | `bfe2e11c4188140838df3a51da7e7651200c59acf90263cb31f911670cf0cf2e` |
| 0224 黑鸛 | `1j2J0R_fRDkYlK164LokvcyS2nI9j7Bn2` | 137253 | `7309645ee94f3b41f5778a2a5b527431` | `50a863fbafe9625b4f7776bb0a14cf38a59acd9ab9c844c5977db7c0faeecde7` |
| 0225 東方白鸛 | `1eO2orYdeh672TZ37smfUHKS2fcjRDUI9` | 134702 | `65bdbc9aec02f5a8e5b2c922f979951b` | `61439148d9dc711a759b1dd8c3db54ff2d9cfc55c95acb7e8e2438d240e6cc1c` |

- 0221–0223 康奈爾分別 NT、LC、LC；各自 runtime `a` 缺、標待查非零分，三張 `vEst=1`、卡面提示估算。0221 [eBird](https://ebird.org/species/flfshe) 淡足鸌全深褐、粉紅嘴黑尖，近景原稿胸部過淡已換深褐版；腳趾部分遮擋。0222 [eBird](https://ebird.org/species/wetshe) 深色型、長楔尾，羽色型與性別／羽齡無關。0223 [Cornell](https://birdsoftheworld.org/bow/species/shtshe/cur/introduction) 和 [HKBWS](https://avifauna.hkbws.org.hk/species/0140/020300) 均稱尾不特別短，圖中較圓尾是簡化，灰鸌比較圖銀色區亦非精確羽列，不以單一特徵鑑別。
- 0224 [eBird](https://ebird.org/species/blasto1) 成鳥黑頸白腹紅嘴、BoW LC；母本描述幼鳥但圖為成鳥。0225 [eBird](https://ebird.org/species/oristo1) 成鳥黑嘴、白身黑翼，EN；幼鳥嘴橙色，非本圖。兩張第四圈只見紅腿、未標腳。
- 五張均目視素材、圈圖、全卡，AVIF 1024×1536、spec/manifest、名稱分類、分數／缺分、bounds/ISO3、bytes/MD5/SHA256、SHA256SUMS 核對，標籤測試 5/5、diff check 通過；未跑 TypeScript／Node 全套。AI 圖僅基本目視、非專家認證；比較鳥不等比例，分佈圖只是部分國家概覽。下一張 0226。


## 0226–0228 軍艦鳥交付

- 上載前 Drive 外層精確查詢三個檔名 0 命中、無下一頁、搜尋完整；逐個上載後 get_file 已核驗名稱、MIME、parent、大小、MD5、未刪。

| 編號／物種 | Drive ID | bytes | MD5 | SHA256 |
|---|---|---:|---|---|
| 0226 白斑軍艦鳥 | `1fdr1xzusk9QzmQLxwoasDhu9VxELDdU-` | 129975 | `2defe81fc7cc8ca6b993ef30256cc5c8` | `9c98196c3b8ca6e49ed01ac2bc01bacb8b0364d756b26242d8ca95824209cfb6` |
| 0227 白腹軍艦鳥 | `1VbtC12dV6HoZd-fFASOzI-5fzPQXcx4w` | 130714 | `0b4b4e9d16c28a380e03376d24ff5725` | `7d03bc78c14fbb4b6a141b9bba32a76b84cf991106dcc6835cb89b848e3b1655` |
| 0228 黑腹軍艦鳥 | `1qi9WDNA10CyqhNzy19l5CgpeIDFLvcd7` | 128663 | `96cdfa18410ee979ec29ed9cf3b88942` | `0a5739205a5311d7d21b9897e644c2d868a34607f0223e20af072fc957480778` |

- 依 Cornell eBird / BoW，0226 LC、0227 VU、0228 LC，分數均照 runtime，沒有缺分。三張主圖均成鳥雄性翼下視角；白斑雄鳥黑腹白腋斑；白腹雄鳥白腹斑，有些有白腋斑；黑腹雄鳥黑腹無白腋。與雌鳥／幼鳥不同，且各種軍艦鳥辨識複雜，不能僅憑單一特徵；比較圖不等比例。見 [0226 eBird](https://ebird.org/species/lesfri)、[0227 eBird](https://ebird.org/species/chifri1)、[0228 eBird](https://ebird.org/species/grefri)、[HKBWS 白腹](https://avifauna.hkbws.org.hk/species/0150/020800)。AI 圖只基本目視、非專家認證。
- 0227 僅在聖誕島繁殖；Natural Earth 110m 不顯示島嶼，因此 renderer 新增可選有來源 `pointMarkers`，世界圖紅點約略標聖誕島 (105.63, -10.49)，不代表精確巢址、不表示海上分佈，未把澳洲本土染綠。位置資料來源及限制記在 spec；目視確認世界圖點位和標註。0226／0228 地圖仍為部分國家概覽，非整國皆有。
- 三張已目視原素材、四圈及重渲染全卡；AVIF 1024×1536、spec=manifest、分類、六項分數、bounds/ISO、紅點座標、bytes、MD5、SHA256／SHA256SUMS 已核對；`test-slim-feature-label.py` 5/5、`git diff --check` 通過，未跑 TypeScript 或 Node 全套。未動 R2、UI、Service Worker、runtime／infoCards.json。
- 下一張 0229 藍臉鰹鳥：本輪已生成及基本目視 0229、0230 主圖候選，均未做 spec、圈圖、比較鳥、最終卡或上載。先確認來源、羽齡與足部，找第二比較鳥素材；本輪已生成十張素材。素材和成品被 gitignore，跨 sandbox 可能缺失。


## 0229–0231 鰹鳥交付

- 上載前 Drive 外層精確查詢三個檔名 0 命中、無下一頁、搜尋完整；逐個上載後 get_file 核驗名稱、MIME、parent、大小、MD5、未刪。

| 編號／物種 | Drive ID | bytes | MD5 | SHA256 |
|---|---|---:|---|---|
| 0229 藍臉鰹鳥 | `1qqmBmigMisGo5qvqgq-ODEYSL9VGlpPw` | 136556 | `ef483473a2beddfecc904b9aaeebe1a6` | `8efa85723ccacce002dea02d324fc77c9e49fb64698aefe103c659f929413023` |
| 0230 褐鰹鳥 | `1JGJy7LfywWinjR9TTaDHAugXdxVCiuxm` | 137485 | `7be4929952c59072a4a5100912657400` | `451875c4d9af3f8c2d0e160697f7947c482681dbb15e565bc159eabde85139af` |
| 0231 紅腳鰹鳥 | `1yjwZXbpMOvnXnJ2oPIUBiO0KJjeKqNON` | 134983 | `9e8bb6cbc333053d5385755fa0b6c1fa` | `836755ce3c6f1a2cc067200eba02463c8c579ae6eaaa8334e5ed71844ef6aba8` |

- 0229 [eBird](https://ebird.org/species/masboo) 成鳥黃嘴白身深尾，LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0150/021100) 香港唯一紀錄為未成鳥，主圖不代表該紀錄；對照成年納斯卡鰹鳥與紅腳鰹鳥。
- 0230 [eBird](https://ebird.org/species/brnboo) 與 [Cornell BoW](https://birdsoftheworld.org/bow/species/brnboo/cur/introduction) 2024 將東太平洋 Cocos Booby 拆出，[BoW conservation](https://birdsoftheworld.org/bow/species/brnboo/cur/conservation) 說明 BirdLife 分類仍合併、LC 為合併評估，eBird 未顯示拆分後獨立狀態。卡面保留 LC 但額外註明「LC為拆分前合併評估」，不能解讀為拆分後獨立評級；雷達保留 runtime 值並標明趣味指標。成鳥褐胸白腹、足色與裸皮可變；[HKBWS](https://avifauna.hkbws.org.hk/species/0150/021300) 香港稀少海上訪客。
- 0231 [eBird](https://ebird.org/species/refboo) LC，主圖成鳥白色型，並有深色型、黑尾型，幼鳥不同；[HKBWS](https://avifauna.hkbws.org.hk/species/0150/021200) 香港偶見海上、常與風暴相關。主圖紅足蹼與趾簡化，非解剖圖。
- 三張 AI 圖僅基本目視、非專家認證；圈圖、全卡及比較鳥已目視。全世界地圖為部分國家概覽，非全國遍布，未顯示完整海洋分佈，海島太小或缺於底圖。AVIF 1024×1536、spec=manifest、名稱分類、六項分數、bounds／ISO3、bytes／SHA256／SHA256SUMS 已核對，標籤 5/5 和 diff check 通過；未跑 TypeScript／Node 全套。未動 R2、UI、Service Worker 或 runtime。
- 下一張 0232：已有普通鸕鷀與 0233 暗綠背鸕鷀初始候選，尚未審閱及製 spec；待確認成鳥頭部、喉囊及互相鑑別，查可靠分佈、比較種。素材與成品 gitignored，換 sandbox 可能缺失。0234 卷羽鵜鶘 Cornell 2025 NT、runtime VU 衝突，相關依保育衍生分數須遮蔽並記原因。


## 0232–0233 鸕鷀交付

- 上載前 Drive 外層精確查詢兩個檔名 0 命中、無下一頁、搜尋完整；逐個上載後 get_file 核驗名稱、MIME、parent、大小、MD5、未刪。

| 編號／物種 | Drive ID | bytes | MD5 | SHA256 |
|---|---|---:|---|---|
| 0232 普通鸕鷀 | `1M8Dzs78mTy7p8xWWTVnKHBuYnAzXuu_v` | 141019 | `4ccecd50e0bd8a1fea3a888e1a079b8b` | `2c3a0c00069e286136ad6aecff92419eb4b81a47430063981ef8f992d0357fe1` |
| 0233 暗綠背鸕鷀 | `14RmCXHISUrev-tbIETbSa4fVKSsbKxwc` | 138790 | `efd6a8b7516d93cacc7aa4803934f757` | `84cb97d7c9dc807b519597b11fe71dfed75a91b33daac2abd7c025f959ea67a5` |

- 依 Cornell [普通鸕鷀](https://ebird.org/species/grecor)、[暗綠背鸕鷀](https://ebird.org/species/japcor1) 兩者均 LC；0233 適應力 `a` 缺分、標待查不作零分，其餘分數照 runtime。0232 示意非繁殖成鳥，0233 示意繁殖成鳥。香港 [HKBWS 0232](https://avifauna.hkbws.org.hk/species/0160/021500) 為常見冬候；[0233](https://avifauna.hkbws.org.hk/species/0160/021400) 為稀少冬候，不代表全球稀少。
- 0233 首張候選喉袋黃色區過深，已改用生成的 pixel-corrected.png；AI 所畫裸皮及鉤嘴並非鑑別圖譜，不可據 AI 的喉袋輪廓區分兩物種。比較普通／暗綠背鸕鷀和小鸕鷀，圖不等比例；[小鸕鷀](https://ebird.org/species/litcor1) 成鳥為近似全暗色，嘴較短。
- 已逐張目視素材、四圈、比較圖和全卡；AVIF 1024×1536、spec=manifest、分類、分數／缺分、bounds／ISO、bytes、SHA256／SHA256SUMS 核對；標籤測試 5/5、diff check 通過，未跑 TypeScript／Node 全套。AI 圖只基本目視非專家認證，地圖僅部分國家概覽。未改 R2、UI、Service Worker、runtime。
- 下一張 0234 卷羽鵜鶘：主圖候選已基本目視，尚未製 spec、圈圖、比較鳥、卡或上載。Cornell 2025 NT 與 runtime VU 衝突，依保育狀態推算的 i/c/o 需隱藏待查，不修改 runtime。素材和成品 gitignored，換環境可能缺失。


## 0234 卷羽鵜鶘交付

- 上載前 Drive 外層精確查詢檔名 0 命中、無下一頁、搜尋完整；上載後 get_file 核驗檔名、MIME、parent、大小、MD5、未刪。ID `1CHBtLY_v8sV1nGIIR7magtZMNBSaQqpn`、145681 bytes、MD5 `289b988fe50259a1a18772bd32716acc`、SHA256 `b4d25dfa9cc7d94d16c9004645596f8fe160c616080308b34c79b73831fb1a5c`。
- 遵用戶指示採 [Cornell eBird](https://ebird.org/species/dalpel1) IUCN 2025 NT，與 [HKBWS](https://avifauna.hkbws.org.hk/species/0170/023800) 一致；runtime cardCopy VU、dexScores i/c/o 受舊狀態影響，卡面待查、不自行重算；a/v/r 照 runtime。香港昔日冬候、常規越冬已消失，並非全球滅絕。
- 成鳥繁殖羽橙喉囊，非繁殖期偏黃；比較白鵜鶘及斑嘴鵜鶘不等比例。足部和冠羽為 AI 示意，非專家認證；嘴圈僅示局部，標籤已相應修正。已目視原圖、四圈、比較鳥、全卡；AVIF 1024×1536、spec/manifest、分類、分數及隱藏項、bounds/ISO3、bytes、SHA256/SHA256SUMS 核對；標籤 5/5、diff check 通過，未跑 TS/Node 全套。地圖僅部分國家概覽。未改 R2、UI、Service Worker、runtime。
- 下一張 0235 大麻鳽；需研究辨識／色型、康奈爾狀態與分佈，生成主鳥和兩隻比較鳥，查分數後製卡。素材和成品 gitignored，換環境可能缺失。

- 0235 後續研究與主圖候選：已讀 [Cornell eBird 大麻鳽](https://ebird.org/species/grebit1) LC、比較 [美洲麻鳽](https://ebird.org/species/amebit)；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/022000) 大麻鳽香港稀少冬候與過境鳥，繁殖歐亞、越冬包括華南。主圖 `cards/art/info-restart-0235/pixel.png` 已生成並基本目視，黑冠及褐色縱紋可見，但腳及花紋只是 AI 示意；尚缺兩隻核對過的比較鳥、spec、圈圖、渲染和上載，下次勿誤報完成。上載前必須查重；素材 gitignored 可能消失。

## 0235 大麻鳽交付

- 已交付外層 [`0235.avif`](https://drive.google.com/file/d/1tJaYZZ_vYIDj-ZU8_lUbpBs5XVypiJw7/view)，152575 bytes、MD5 `de8c9c2b4fc28ec84b789b67da487631`、SHA256 `c98db467de94a862654e5e58981696118a074915b6b40aafecc75411f14e0bf5`。上載前精確查重 0、搜尋完整；上載後 get_file 核驗 parent、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/grebit1) LC 與 runtime 一致；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/022000) 香港稀少冬候及過境鳥，全球繁殖／越冬範圍與香港狀態分開。比較鳥美洲麻鳽（北美物種）及夜鷺幼鳥；不按比例，AI 插圖非專家認證。地圖僅部分國家，不為完整分佈。已查看素材、四圈及全卡；核對 AVIF 1024×1536、分類、六分、spec、世界 bounds、ISO3、hash；標籤測試 5/5、diff check 通過。未改 R2／runtime／UI。

## 0236 黃葦鳽交付

- 已交付外層 [`0236.avif`](https://drive.google.com/file/d/1StU6pbFQ0AnJlR4f-LeEYkNK_bJVGZsi/view)，144211 bytes、MD5 `6e15adc009ad5d5de9d6351cb6adac1a`、SHA256 `2b75e228ac7c1df79cdbc3e407e86967cdec9fa26379cb1b70dbeb9369dc6029`。上載前查重 0、搜尋完整；上載後 get_file 核驗 parent、MIME、bytes、MD5、未刪。
- [Cornell](https://ebird.org/species/yelbit) LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/022100) 描述雄鳥黑冠及香港夏候／過境數量下降，與全球狀態分開。圖上雄鳥喉中央暗紋不明顯；翼圈僅折翼，不能宣稱展示飛行翼對比。比較紫背及栗葦鳽雄鳥，不等比例，AI 圖未經專家認證。
- runtime 缺 i、v、c、o；均標待查、不算零、不由 IUCN 估算，a=4.3、r=1.0。目視四圈及全卡，核對 AVIF 1024×1536、分類、scores、spec、ISO3、bounds、hash；標籤測試 5/5 及 diff check 通過。未動 R2 或 runtime。

## 0237 紫背葦鳽交付

- 已交付外層 [`0237.avif`](https://drive.google.com/file/d/1_qCOmBLmAP26P95TPUtq9Y7n0yQuXbos/view)，139505 bytes、MD5 `e36dfaaa1fc7fec1b909243d75016325`、SHA256 `894e96871545afbe195ae405f26d2e5e706eb86a24b755448a8caab04302b880`。上載前精確查重 0、搜尋完整；上載後 get_file 核對 parent、名稱、MIME、bytes、MD5、未刪。
- [Cornell](https://ebird.org/species/schbit1) NT 與 [HKBWS](https://avifauna.hkbws.org.hk/species/0170/022200) 2024 頁 LC 不同，依用戶決定採 Cornell；runtime 僅 r=1.0，其他項目缺分標待查，不自算。HKBWS 香港春季稀少、秋季罕見過境；插圖為雄鳥示意，雌鳥上體淡斑；比較黃葦及栗葦鳽雄鳥不等比例。AI 插圖非專家認證，地圖為部分國家概覽。
- 已目視素材、四圈及全卡；核對 AVIF 1024×1536、分類、分數缺值、spec、世界 bounds、ISO3、hash；標籤測試 5/5、diff check 通過。未動 R2 或 runtime。

## 0238 栗葦鳽交付

- 已交付外層 [`0238.avif`](https://drive.google.com/file/d/1WI1H3CAUjCNClojAIdXlER6_a9UDcSVG/view)，141189 bytes、MD5 `49bb682a898b1c57402fc116ec184e61`、SHA256 `ce6f1c0b07d19e10ed19f5abb287236e3c70e4a3bc91101a98350e67cc873a37`。上載前精確查重 0、搜尋完整；上載後 get_file 核驗 parent、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/cinbit1) LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/022300) 香港稀少過境及夏候，雄鳥頭至背鮮栗。圖上喉中央暗紋不明顯；雌幼深斑，與雄鳥示意不同。比較黃葦及紫背雄鳥、不等比例；AI 圖非專家認證，地圖為部分國家概覽。runtime 缺 i、c 標待查，其餘照 runtime，不重算。四圈及全卡已目視，AVIF／分類／分數／bounds／ISO3／hash 核對，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。

## 0239 黑鳽交付

- 已交付外層 [`0239.avif`](https://drive.google.com/file/d/1GEfjXhwV2eTw3_OH-yE2qIfnhUpZCL8l/view)，144155 bytes、MD5 `ef954641184baf1759365aa0013aa806`、SHA256 `f9375349a8d65b0361eaadba1b88d9afb87d7327609dd1b629d8c3a8a067a1ea`。上載前精確查重 0、搜尋完整；上載後 get_file 核對名稱、parent、MIME、bytes、MD5、未刪。
- [Cornell](https://ebird.org/species/blabit1) LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/022400) 香港稀少過境鳥，雄黑上體、黃頸側、深色胸紋；雌鳥較褐。比較大麻鳽及夜鷺幼鳥不等比例。四圈及全卡已目視，足部圈以腿部命名避免聲稱展示完整足；AI 圖非專家認證，世界底圖僅部分國家概覽。
- runtime 缺 i、v、c、o，標待查並非零分，a=3.3、r=1.0。AVIF 1024×1536、分類、scores、spec、bounds／ISO3／hash 核對，標籤測試 5/5、diff check 通過；未動 R2、UI 或 runtime。
- 下一張 0240 未製作，先查來源及 Drive；所有素材及 deliver 被 gitignore，跨 sandbox 未必保留。

## 0240 蒼鷺交付

- 外層 [`0240.avif`](https://drive.google.com/file/d/1dFC3ucr9yOIyqh3A7dyGPOZ3lClT3AwC/view)，139577 bytes、MD5 `a5a55bde3f3048f1fea5243420d30203`、SHA256 `d34062ddfd4c450aa6912df8fe82633657d22421ef1d72bdd71c25dcec495e16`。上載前查重 0、搜尋完整；上載後 get_file 驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/graher1) LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/023100) 香港豐富冬候、夏季稀少。成鳥示意，幼鳥較黯；比較草鷺與美洲大藍鷺非等比例。首渲比較鳥被圓框截頭，已先方形留邊修正並重看；AI 素材非專家認證，地圖只示部分國家。四圈、全卡、AVIF／分類／分數／bounds／ISO3／hash 核驗；標籤測試 5/5、diff check 通過。未動 R2、UI 或 runtime。

## 0241 草鷺交付

- 外層 [`0241.avif`](https://drive.google.com/file/d/1T3ylh-JXkRsemJx5V0WGGYYpPrUlijmT/view)，139491 bytes、MD5 `72fb756da697eb6f6202c569747dff34`、SHA256 `bb182baeef0435623e4208ad90761e3eb6597e9e7f77dd49a146033f1a3c5cd8`。上載前查重 0、搜尋完整；上載後 get_file 驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/purher1) LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/023200) 香港全年可見，秋季最多；成鳥栗頸深線、灰翼栗肩，幼鳥較素褐。比較蒼鷺及黑鳽、不等比例。已看素材、四圈及全卡；AI 圖非專家認證、世界圖只為部分國家。AVIF／分類／分數／bounds／ISO3／hash 核驗、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。

## 0242 大白鷺交付

- 外層 [`0242.avif`](https://drive.google.com/file/d/1_6Ip8zaKjgqQp6wRoz8w4xc_eSmV4T5Q/view)，129245 bytes、MD5 `e7f186b92a11cbb9cfbae2dece62d8fe`、SHA256 `07fb945a72aece118016056805d849b1ec56b42a36805b4cb0a80498aba69eda`。上載前精確查重 0、搜尋完整；上載後 get_file 驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/greegr) LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/023300) 香港全年可見；本圖非繁殖羽，黃嘴與 AI 綠色眼先僅示意，嘴角位置不清楚不可用作鑑別。比較中白與小白鷺、不等比例。四圈及全卡目視；AI 非專家認證，地圖僅部分國家。AVIF／分類／runtime 六分與 `vEst=1`／bounds／ISO3／hash 驗證、標籤測試 5/5、diff check 通過。未動 R2 或 runtime。

## 0243 中白鷺交付：拆分後狀態待核

- 外層 [`0243.avif`](https://drive.google.com/file/d/1QaCwJPBFuzwYw-qyIwCHHGQjBwmNzW3X/view)，132024 bytes、MD5 `8a93c7448f3dde23b438d8cf5c4cdf28`、SHA256 `7725f956262d229d1233fb61b0f8dd08e8bf880ac93e0b106950d40a1236440a`。上載前精確查重 0、搜尋完整；上載後 get_file 驗 parent、檔名、MIME、大小、MD5、未刪。
- [Cornell 2023](https://ebird.org/news/2023-taxonomy-update) 把舊複合種拆為亞洲中白鷺、澳洲白鷺與非洲黃嘴白鷺；[亞洲種頁](https://ebird.org/species/integr1) 未顯示 IUCN 等級，[HKBWS 2024](https://avifauna.hkbws.org.hk/species/0170/023400) 舊頁 LC 和廣泛範圍採舊複合分類。卡面暫列拆分後狀態待核，地圖僅選亞洲；runtime i/c/o 用舊 LC 輸入而暫遮蔽待核，不自行改分，a/v/r 原值。這不斷言已知實際評級，不改 runtime。
- 非繁殖鳥示意；嘴角細節不清楚，勿用來作大小白鷺鑑別；比較大白與小白鷺不等比例。四圈與全卡已目視；AI 非專家認證。AVIF／分類／剩餘分數／遮蔽原因／世界 bounds／ISO3／hash 驗證、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。

## 0244 黃嘴白鷺交付

- 外層 [`0244.avif`](https://drive.google.com/file/d/1KhmxBpGU8GsDeyF1pJ9Od8lIS1J0YYWF/view)，143622 bytes、MD5 `53cfc5548159f50b5215cfce923e2753`、SHA256 `528e4a67415e0df19b5eb32f3db9bed2c2085b22d3389937020dc23f28a7ce6e`。上載前精確查重 0、搜尋完整；上載後 get_file 核對 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/chiegr) VU 與 runtime 一致；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/023700) 香港春季不常見及秋季罕見過境。繁殖羽示意，非繁殖羽顏色較淡暗；主圖地面底座、AI 羽毛及足趾簡化；比較小白與中白鷺不等比例。AI 圖非專家認證、地圖僅部分國家。已目視四圈與全卡，AVIF／分類／runtime 六分及 `vEst=1`／bounds／ISO3／hash 核對；標籤測試 5/5、diff check 通過。未動 R2 或 runtime。

## 0245 小白鷺交付

- 外層 [`0245.avif`](https://drive.google.com/file/d/1hXQcoFxYozvQ3hWN7xlnhc4F9pXiaTrC/view)，129345 bytes、MD5 `f190216a545cf94aabb7fc6ad44216a5`、SHA256 `abc01467d8e9dc193f2400681a595c70d8fc1bf6ba7c273379851d40110e5b08`。上載前精確查重 0、搜尋完整；上載後 get_file 驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/litegr) 作辨識，但頁面沒顯示 IUCN；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/023500) LC，澳洲政府 [物種頁](http://www.environment.gov.au/cgi-bin/sprat/public/publicspecies.pl?taxon_id=982) 引 IUCN 2025.2 LC，與 runtime 一致。香港全年可見；圖為非繁殖成鳥，繁殖羽有兩根細長冠羽。比較繁殖羽黃嘴白鷺與非繁殖中白鷺，不等比例；AI 圖非專家認證，地圖僅部分國家。
- 逐張目視四圈及全卡，將第二圈標籤收窄為「白色頸肩」後重渲；AVIF／分類／runtime 六分／bounds／ISO3／hash 核對，標籤測試 5/5、diff check 通過。未動 R2 或 runtime。
- 下一張 0246 岩鷺尚未製作；先查 Cornell 和 HKBWS、核實圖像及 Drive 同名；素材與本機成品 gitignore，新 sandbox 可能缺失。

## 0246 岩鷺交付

- 外層 [`0246.avif`](https://drive.google.com/file/d/1mFCaEiNleclOO6aDT6XOnPyAS5G0sLEx/view)，133327 bytes、MD5 `48c9a31fd88959d8bc224aa54396b1f8`、SHA256 `5e8ff8228ddb1a488d73a7526b59cedc023b8280faa530fd4521e7f2e0a8879f`。上載前精確查重 0、搜尋完整；上載後 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/pacreh1) 與 [HKBWS](https://avifauna.hkbws.org.hk/species/0170/023600) LC；香港低密度留鳥，多見岩岸。圖示深色型，全球亦有白型，但香港純白型紀錄未獲充分證實；嘴尖在圈外，腳趾為 AI 示意。比較黑鳽雄鳥及小白鷺不等比例，AI 插圖非專家認證。世界底圖僅部分分佈國家、非全境或完整分佈。
- 目視素材、四圈、比較鳥及全卡；AVIF 1024×1536、spec／manifest、名稱學名、六分與 vEst=1、bounds／ISO3、bytes／SHA256 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套。未動 R2、UI、Service Worker 或 runtime。
- 下一張 0247 牛背鷺：`cards/art/info-restart-0247/pixel.png` 非繁殖羽主圖已生成並初步目視；0248–0250 主圖亦已生成並初步目視，但均尚未建立 spec、四圈、成卡或上載。0247 的 i/c 缺分不能當零；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/023000) 採 Bubulcus coromandus、顯示 LC 但引用舊合併種文獻，[Cornell](https://ebird.org/species/categr2) 採 Ardea coromanda，拆分後保育狀態需進一步核實。0250 runtime EN 與 Cornell 2025 和 HKBWS VU 衝突，需按已確立方法處理。素材和交付檔 gitignored，跨 sandbox 未必保留。

## 0247 牛背鷺交付：體長及保育資料待核

- 外層 [`0247.avif`](https://drive.google.com/file/d/1w2x6iOyonkWqwOmA1Gfs4yktFOVVeRW9/view)，131349 bytes、MD5 `c27440ce42547a3acbe0a94f7f329fb2`、SHA256 `d7e7f3520af5a288887637cca40ea845bf696612c80a76b5df63cb5cd8d14d97`。上載前查重 0、搜尋完整；上載後 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/categr2) 名為 Ardea coromanda，2023 [拆分東西牛背鷺](https://ebird.org/news/2023-taxonomy-update)，頁面未顯示 IUCN；[HKBWS](https://avifauna.hkbws.org.hk/species/0170/023000) 採 Bubulcus coromandus、列 LC，但全球範圍及引用採合併種文獻，因此拆分後評估卡面標待核，不斷言實際等級。香港全年可見，主圖非繁殖羽，比較小白鷺及中白鷺不等比例。
- runtime i/c 原缺值，待查而非零；另發現 cardCopy `88–96 cm` 及 explorerIndex `len=92` 與 HKBWS `46–56 cm` 明顯衝突，而 v 由該數值生成，v=5 和受影響 o=3.1 暫遮蔽待核，不重算或改 runtime；a=3.3、r=1。四圈、全卡及比較圖已目視，AI 圖非專家認證；地圖為部分國家概覽。AVIF／分類／分數及隱藏項／世界 bounds／ISO3／hash 核對，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2／UI／runtime。

## 0248 池鷺交付

- 外層 [`0248.avif`](https://drive.google.com/file/d/1u7LBrXxzWyMAZj-Eo3Gq_RhaGDP7A_By/view)，137629 bytes、MD5 `5a66f000329535e4df1666b84b0344ec`、SHA256 `8b1eb787a3aeedbaa96bc88c77fb6b3fbf150b7bd13b97bc05cefed867383c2d`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/chpher1) IUCN 2025 LC，[HKBWS](https://avifauna.hkbws.org.hk/species/0170/022900) 指香港全年常見，遷徙與留鳥均有；插圖繁殖成鳥示意，非繁殖羽難與其他池鷺分辨。比較牛背鷺非繁殖羽及夜鷺成鳥不等比例。AI 圖非專家認證，世界圖只示部分國家。四圈及全卡已目視，嘴尖圈外，標籤改為黃色嘴部後重渲。AVIF／分類／runtime 六分／bounds／ISO3／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2／UI／runtime。

## 0249 夜鷺交付

- 外層 [`0249.avif`](https://drive.google.com/file/d/1x4unYypHEuC-DVJ_4OLUdhH1gP0plWxP/view)，136479 bytes、MD5 `01795cc5c15241783b7a4eec867f60e7`、SHA256 `7af8662469e7f403e3fd5ebd23ae895001483597dd5b9d9df3dba77678b7aa6a`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/bcnher) IUCN 2025 LC，[HKBWS](https://avifauna.hkbws.org.hk/species/0170/022700) 指香港豐富過境及冬候、不常見繁殖；成鳥黑頂灰翼紅眼，幼鳥褐色帶白斑。比較栗鳽及雄黑鳽不等比例。AI 圖非專家認證、腳部為示意，地圖只示部分國家。已目視素材、四圈及全卡；AVIF／分類／runtime 六分及 vEst=1／bounds／ISO3／hash 核驗、標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2／UI／runtime。

## 0250 栗鳽交付：保育狀態衝突

- 外層 [`0250.avif`](https://drive.google.com/file/d/1YgjPO02dWvWl6m6GWtxldiSZ1rCrBQB8/view)，153655 bytes、MD5 `7eb2aeb948a13c1712a488f2608b294f`、SHA256 `c9813c48b29eeef76a896c04d284e7eced178ee859f3fc0d2052db1d7666834a`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/janher1) IUCN 2025 與 [HKBWS](https://avifauna.hkbws.org.hk/species/0170/022500) 均 VU，與 runtime cardCopy EN 不同；採 VU，受舊 EN 影響的 i/c/o 暫標待核、不自行重算，a=3.8、v=4.4、r=4.8 照 runtime。香港迷鳥；日南部及韓國濟州繁殖，菲律賓等越冬。
- 成鳥圖 AI 嘴偏尖，非精確結構鑑別；比較黑冠鳽成鳥與夜鷺幼鳥，不等比例。AI 圖非專家認證，世界底圖僅部分國家。四圈、比較圖及全卡目視；修正渲染器在遮蔽分數時漏顯 vEst 的問題，重渲並核對「觀賞值含體長估算」。曾檢查 0201–0249 specs，未見同時遮蔽其他項且 vEst=1 的情況。AVIF／分類／分數及遮蔽項／bounds／ISO3／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2／UI／runtime。
- 下一張 0251 黑冠鳽；比較鳥素材 `cards/art/comparisons/malayan-night-heron.png` 已生成並初步目視，可作候選但未製作該卡 spec、四圈、成卡或上載。所有素材與成品 gitignored，跨 sandbox 可能缺失；繼續前需查資料、核圖與 Drive 查重。

## 0251 黑冠鳽交付

- 外層 [`0251.avif`](https://drive.google.com/file/d/1xv1miVPv8XTn1Dxnjq3IRodqU3n2XIDS/view)，142655 bytes、MD5 `dc7bfb609c6cc819281df6637193b698`、SHA256 `f69391f81b17eb9ace2c3f646f229a9557cc6347bd06c4aed9b94dd3594b6e0c`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/manher1) IUCN 2025 LC、[HKBWS](https://avifauna.hkbws.org.hk/species/0170/022600) LC 並指香港為稀少但增加的夏候鳥，也有過境；成鳥藍眼先與黑冠，幼鳥多斑紋；比較栗鳽成鳥與夜鷺幼鳥，非等比例。AI 插圖僅基本目視、非鳥類專家認證，地圖僅部分國家。
- 已目視主圖、對照圖、四圈及全卡；AVIF／分類／runtime 六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。

## 0252 黑頭白䴉交付

- 外層 [`0252.avif`](https://drive.google.com/file/d/1Zcq_ciPow-cLH-gzUtfVRO4oyUhPzca_/view)，135756 bytes、MD5 `75702163c2b6e3d6f0b381709739b3a6`、SHA256 `82dd2d4121ffe4fc6975a1430010902c330cfcf1114adadd7dd333e198c6af4d`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/blhibi1) IUCN 2025 LC，與 [HKBWS 2024](https://avifauna.hkbws.org.hk/species/0160/021600) 及 runtime NT 不同；舊 NT 污染的 i/c/o 遮蔽、不重算；vEst 有提示。HKBWS 指香港以前稀少冬候鳥、1999 後無記錄。比較非洲聖䴉及彩䴉（[Cornell](https://ebird.org/species/sacibi2)、[Singapore Birds](https://singaporebirds.com/2022/12/10/singapores-first-wild-black-headed-ibis/)、[Cornell](https://ebird.org/species/gloibi)），不等比例。AI 插圖僅基本目視、非鳥類專家認證，彩䴉眼色僅示意；地圖僅部分國家。
- 已目視主圖、對照圖、四圈及全卡；AVIF／分類／可用分數／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。

## 0253 白琵鷺交付

- 外層 [`0253.avif`](https://drive.google.com/file/d/1ztBhfwP_CzXC5mkyPch3H48mGJHxGSz_/view)，134381 bytes、MD5 `7c1ef5256d2239af87fce6dc5c10a707`、SHA256 `6341b7b383b7584d15266afcee2ce7f880ff87ed077c4ad34c395ef53d7e0523`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/eurspo1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0160/021800) 70–95 cm，深灣小量常規冬候鳥、1990年代中期以來可能下降（非全球趨勢）。cardCopy 長度 10–15 cm、explorerIndex.len 12.5 錯誤，受污染的 v/o 暫遮蔽、不重算、runtime 未更改。比較黑臉琵鷺非繁殖成鳥及白琵鷺幼鳥，不等比例（[Cornell](https://ebird.org/species/blfspo1)、[Plumarium](https://plumarium.es/en/eurasian-spoonbill/)）。
- 已目視主圖、對照圖、四圈及全卡；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／可用分數／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0254。

## 0254 黑臉琵鷺交付

- 外層 [`0254.avif`](https://drive.google.com/file/d/18pxvfV1divvf8ePGl_o4a9ZRKR6TMzp6/view)，133539 bytes、MD5 `132635ce8bad433386464d03943b55f7`、SHA256 `d546186454e4cfcb9e90a7ace29438f86c43049d6740e2157b2f0f5751292768`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/blfspo1) IUCN 2025 VU 與 runtime VU 一致；[HKBWS 2024](https://avifauna.hkbws.org.hk/species/0160/021900) 舊頁 EN，年份不同，卡面提示。香港常見冬候鳥、夏季罕見；保留 vEst 提示。主圖重用 0253 經目視黑臉琵鷺對照圖，對照白琵鷺繁殖成鳥及黑臉幼鳥，不等比例；幼鳥翼尖黑色以飛行較清楚。
- 已目視主圖、對照圖、四圈及全卡；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。

## 0255 鶚交付

- 外層 [`0255.avif`](https://drive.google.com/file/d/1nW1lwIXLTDhmjfyTLcd_8Elaw488s0cd/view)，139882 bytes、MD5 `8bd16856ac8174aeaa3fd5e95360c7ec`、SHA256 `e7986980fbc3b3e769f2b682dab35bb313c2afc6a714fd1211e227f14f243623`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/osprey) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/023900) 香港深灣及東岸局部常見冬候及過境鳥，其他時期稀少；分類對澳洲種群的處理有不同，採 runtime 學名，地圖依 HKBWS 部分原生國家。適應力 a 缺值顯示待查非零，vEst=1 提示保留；其餘照 runtime 未重算。比較鶚幼鳥及白腹海鵰成鳥不等比例；後者腿色僅示意（[HKBWS](https://avifauna.hkbws.org.hk/species/0180/026300)）。
- 已目視主圖、對照圖、四圈及全卡；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／可用分數／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0256。

## 0256 黑翅鳶交付

- 外層 [`0256.avif`](https://drive.google.com/file/d/1b2_ERPxT6cG1OZ19dfedobzyuhmdkmwS/view)，129038 bytes、MD5 `b35b0454ae494f0b68f9afb4a7e8fe52`、SHA256 `bc3eeaa026c8f15f46f5072198744315a200a697fcda8d261cc83ef6e21fe686`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/bkskit1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/024000) 香港常見秋季過境、其他時期稀少，無證實本地繁殖。六分沿 runtime，vEst=1 提示保留；比較同種幼鳥及雄紅隼（[Cornell](https://ebird.org/species/eurkes)），不等比例。
- 已目視主圖、對照圖、四圈及全卡；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0257。

## 0257 鳳頭蜂鷹交付

- 外層 [`0257.avif`](https://drive.google.com/file/d/1zq8UaG7pvcfW7NXxb0fnNV3d_ywRDwBM/view)，132287 bytes、MD5 `4c539856df60f3be60139ec234b9bff8`、SHA256 `a40a957640cefbf1f0ce6a5897f237d86eb73476a657e4259af7ac2f67dc1506`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/orihob2) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/024100) 香港稀少秋季過境、冬春罕見。羽色多變；主圖成雄樣貌，對照同種雌鳥和[普通鵟](https://avifauna.hkbws.org.hk/species/0180/026500)，不等比例。六分沿 runtime，vEst=1 提示保留。
- 已目視主圖、對照圖、四圈及全卡；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。

## 0258 黑冠鵑隼交付

- 外層 [`0258.avif`](https://drive.google.com/file/d/1DInbdD4Tyw9x-Lvr8Uj-7alnTEZL29Rs/view)，131244 bytes、MD5 `105240f31e6098e06196dc0c3702eafd`、SHA256 `4c16128dde5e66ec868773020f646e62e403d67a6e48ec06811056217520ef04`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/blabaz1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/024200) 香港秋季不常見過境、春季稀少、夏季罕見。對照[褐冠鵑隼](https://ebird.org/species/jerbaz1)和鳳頭蜂鷹，不等比例。六分沿 runtime，vEst=1 提示保留。
- 已目視主圖、對照圖、四圈及全卡；AI 插圖僅基本目視、非鳥類專家認證，冠羽細節僅示意；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。

## 0259 禿鷲交付

- 外層 [`0259.avif`](https://drive.google.com/file/d/1lzw190xVyj6CzIS7ucEsBNr6xoDchQ9C/view)，133528 bytes、MD5 `2b14b78ed3323e71d63ab56cd9499408`、SHA256 `ac18d60f4144d0047415261eee2601ceeb266774b15127a0a8bc1b307661e7c3`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/cinvul1) IUCN 2025 NT；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/024300) 香港極罕見冬候鳥、1990年代後下降。成鳥對照同種幼鳥與[兀鷲](https://ebird.org/species/eurgri1)，不等比例。六分沿 runtime，vEst=1 提示保留。
- 已目視主圖、對照圖、四圈及全卡，調整頭與嘴裁切；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0260。

## 0260 蛇鵰交付

- 外層 [`0260.avif`](https://drive.google.com/file/d/16U9q9Keb8M439HNwdi18t_sX-MdaVYhR/view)，130107 bytes、MD5 `f323ef374c99dd9ea595962fed89be31`、SHA256 `e3ae9ec005dd6e1db4dc5fcaf90a9ed806759866ad346ac92a38c1dfa3f91b4d`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/crseag1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/024400) 香港全年見於林地與附近，也有過境跡象。成鳥對照同種幼鳥與[短趾鵰](https://ebird.org/species/shteag1)，不等比例。六分沿 runtime，vEst=1 提示保留。
- 已目視主圖、對照圖、四圈及全卡；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0261。

## 0261 烏鵰交付

- 外層 [`0261.avif`](https://drive.google.com/file/d/1_HHFGwndxrRVqBkSmOpMojUoxDd4AedD/view)，129081 bytes、MD5 `ce976eb2778f89592d8160c7b89235b7`、SHA256 `1f3a1427b5e1af5642116d32ae2693f73422cab609f1736b22ea75220fa34d44`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/grseag1) IUCN 2025 VU；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/024700) 新界北部稀少冬候、主要深灣，過境罕見。幼鳥對照同種深色成鳥與[草原鵰](https://avifauna.hkbws.org.hk/species/0180/024900)，不等比例，辨識複雜不可單憑示意圖；六分沿 runtime，無 vEst。
- 已目視主圖、對照圖、四圈及全卡；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0262。

## 0262 白肩鵰交付

- 外層 [`0262.avif`](https://drive.google.com/file/d/10ylKa6d70-x8TUr9mF-0KUkNq9Q3Ujzn/view)，125419 bytes、MD5 `64348d520cd4026785775dca83996d26`、SHA256 `7f44ebabc9f74f3ad8835b3c661ec7b074fdf9ffc13d6f2dc70be845a878778b`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/impeag1) IUCN 2025 VU；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025000) 香港深灣稀少冬候鳥。成鳥對照同種幼鳥與[烏鵰](https://avifauna.hkbws.org.hk/species/0180/024700)，不等比例；六分沿 runtime，無 vEst。`c=2.2` 是非學術趣味分，包括既有保育文字輸入，非 IUCN 等級；原卡資料保育段缺失，不代表物種缺少威脅。
- 已目視主圖、對照圖、四圈及全卡，調整頭部裁切；AI 插圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0263。

## 0263 白腹隼鵰交付

- 外層 [`0263.avif`](https://drive.google.com/file/d/1N9eTamccX6VEPGoaB59B4VclhmECcs6_/view)，141698 bytes、MD5 `6f03ba07fc427ae3a6f8928b327b4b85`、SHA256 `d39f0432f4b68727f8d463ef58d0a1ef143c4ea7cb359c5dbc7be4e4665a216d`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/boneag2) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025100) 香港山地林地罕見留鳥，自 1990 年代中期明顯下降。成鳥對照同種幼鳥與[白肩鵰幼鳥](https://avifauna.hkbws.org.hk/species/0180/025000)，不等比例，鑑別不能只靠示意圖。原 explorerIndex 食性 tag 僅 insect，未反映 HKBWS 記錄的水鳥獵物，但未證明昆蟲完全錯誤；a 沿 runtime，不是完整食性評估。c 是趣味分，原保育段缺失並不代表本地沒有保育問題。
- runtime `vEst=1` 用 AVONET 翼長 486.8 mm × 0.22 推算體長 107.096 cm，與 HKBWS 55–67 cm 顯著不符；v=5.0 和依賴 v 的 o=2.7 遮蔽待核，不重算或修改 runtime。渲染器改為即使 v 遮蔽仍顯示原觀賞值含體長估算；其餘四分沿 runtime。
- 已目視素材、四圈及全卡；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 與遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0264。

## 0264 白腹鷂交付

- 外層 [`0264.avif`](https://drive.google.com/file/d/1KFDfyKjdUrA1YmZh3yDVPa-HZX94nxSa/view)，138711 bytes、MD5 `a2f7485150acfc086c1cddf1a9b69ec0`、SHA256 `267ff19f39139738dfb969a359c859249b98508affbfc85388e5cecd13135f56`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/easmah1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025800) 香港常見冬候與過境，深灣為主、秋季較多，觀察以雌鳥及未成熟鳥為主。成雌對照同種成雄及[鵲鷂成雄](https://ebird.org/species/piehar1)，不等比例；雌幼鳥鑑別複雜，不能以此示意圖替代鑑別。
- 原 explorerIndex 食性 tag 僅 amphibian，未反映 HKBWS 記錄的鳥類食物；a 沿 runtime，不是完整食性評估。runtime `vEst=1` 以 AVONET 翼長 407.2 mm × 0.22 估算體長 89.584 cm，與 HKBWS 47–55 cm 明顯不符；v=4.9 和依賴 v 的 o=3.0 遮蔽待核，不重算或修改 runtime，其餘四分沿 runtime；保留估算提示。
- 已目視素材、四圈及全卡，修正頭部及腳部圓框裁切；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 與遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0265。

## 0265 白尾鷂交付

- 外層 [`0265.avif`](https://drive.google.com/file/d/1oocZSejELL0JCfZNUcVrAJFIn9paytqL/view)，138391 bytes、MD5 `8580c1442955dfea98e539e8cee9a5f6`、SHA256 `00387405699a0ac4eb49500c6acba6fab91ea8db72cc7cf98d2fab98a9f7ed22`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/norhar1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025900) 列香港迷鳥，其正文稱 2018–19 年米埔幼雌一例，但同頁後加入 2025 年照片，紀錄總數待核，不斷言只有一例。主圖幼雌外觀，對照同種成雄與[白腹鷂雌鳥](https://avifauna.hkbws.org.hk/species/0180/025800)，不等比例。AI 主圖尾下白色區並非可信的白腰展示；複雜辨識不能單靠圖。
- 分數 i=2、a=2.3、v=4.1、r=4.8、c=3、o=3.2 均沿 runtime，無 vEst。食性 tags 為空、棲地僅 open，a 不是完整生態評估；cardCopy 的 diet 錯置鳴聲、habitat 錯置食性，原資料未改。c 為依已有文字的非學術趣味分，非 IUCN 保育狀態。
- 已目視素材、四圈及全卡；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／六分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0266。

## 0266 鵲鷂交付

- 外層 [`0266.avif`](https://drive.google.com/file/d/1oFulJeZTAvfIJqeSKzZdiXCmFB4uflW4/view)，138277 bytes、MD5 `58048c984253ff504cf803f8b74b1635`、SHA256 `bac27e0f00646befe8a43996c25e41c922dbfbd18b3b75c36ebb2316c37afc42`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/piehar1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/026000) 香港秋季常見過境、冬春稀少，主要深灣，大多幼鳥而成雄罕見。幼鳥樣貌對照同種成雄及[白腹鷂雌鳥](https://avifauna.hkbws.org.hk/species/0180/025800)，不等比例；鷂類雌幼鳥複雜，不能單靠示意圖鑑別。
- `vEst=1` 以 AVONET 翼長 352.6 mm × 0.22 估算體長 77.572 cm，與 HKBWS 43–50 cm 明顯不符；觀賞 v=4.7 暫遮蔽。食性 `plant` 標籤由英文 diet 中 grasshoppers 的 `grass` 子串誤觸 `build-explorer-data.mjs` 植物規則，適應力 a=5.0 暫遮蔽；受兩者影響的綜合 o=3.4 一併遮蔽待核、不重算，保留 vEst 來源提示。其餘三分沿 runtime。未更改標籤產生器或 runtime。
- 已目視素材、四圈及全卡；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0267。

## 0267 鳳頭鷹交付

- 外層 [`0267.avif`](https://drive.google.com/file/d/1sA7zVXhmUG9atBQc5M5uXOJ0f7WEXfUa/view)，139670 bytes、MD5 `352aa05fa6b7e645647e56371178a98a`、SHA256 `ad2a8207014abca05a6c95359bdbd48418d5d3c93eb2e9749b76276c5c9deb82`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/cregos1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025200) 香港林地常見留鳥，亦在開闊地獵食。成鳥對照同種幼鳥與[松雀鷹雌鳥](https://avifauna.hkbws.org.hk/species/0180/025500)，不等比例；幼鳥圖缺清晰中央喉紋與腿部橫紋，不能單靠圖鑑別。
- runtime 僅 a=2.3、r=2.5，i/v/c/o 原缺值顯示待查、非零；不根據外部資料補分。食性 tag 為空，a 非完整食性評估。
- 已目視素材、四圈及全卡並調整喉部裁切；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0268。

## 0268 赤腹鷹交付

- 外層 [`0268.avif`](https://drive.google.com/file/d/1_l-JMiJQBYewLXhQE03wo8x0ZAI4h9OT/view)，135582 bytes、MD5 `545167e9fa701c77591a31ed26290415`、SHA256 `643de80cb3d3e5c03b664f675913b7dc4d1036df0fc974ed23194da155b4a190`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/grfhaw1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025300) 香港春季常見過境、秋季稀少。成雄對照同種幼鳥及[日本松雀鷹幼鳥](https://avifauna.hkbws.org.hk/species/0180/025400)，不等比例；AI 尾紋偏粗，折翼圖不展示飛行翼底鑑別特徵，不能單靠圖鑑別。
- runtime i=2、a=3.8、r=3.3、c=1.2、o=2.6；觀賞 v 原缺值待查非零，綜合分沿已有資料，不補分。c 為趣味指標，非 IUCN 分級。
- 已目視素材、四圈及全卡並調整頭部裁切；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0269。

## 0269 日本松雀鷹交付

- 外層 [`0269.avif`](https://drive.google.com/file/d/11eL-0JZPPZqRqJ8aC1qpvzmMmeHPbU9f/view)，139574 bytes、MD5 `df99e2738cae2215573c78837dbc999e`、SHA256 `2b44edd40714279384a450cc462063017dfa0563017eec8cc9618c46dd4e3556`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/japspa1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025400) 香港稀少過境及冬候。成雌對照同種幼鳥及[松雀鷹成雌](https://avifauna.hkbws.org.hk/species/0180/025500)，後兩圖重用已目視素材，圖不等比例；喉紋及尾紋僅示意，不能單靠圖鑑別。
- runtime 僅 a=5.0、r=1.0，i/v/c/o 原缺值顯示待查、非零；不根據外部 IUCN 或體長補分。a 基於既有食性及棲地 tags，不是完整生態評估；r 為程式趣味分。
- 已目視素材、四圈及全卡；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0270。

## 0270 松雀鷹交付

- 外層 [`0270.avif`](https://drive.google.com/file/d/14chlGpnECMzitDcYhrh7n_SV3bjrkUNm/view)，136903 bytes、MD5 `1b28e0a5a6b989b86196cbe60f8accdb`、SHA256 `e73ba46366f55c511de8575bcbb29a2b1ca01818a870a475d221ddab9f7be9e2`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/besra1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025500) 香港全年出現、秋季亦有過境。成雌主圖重用 0267 素材，對照新繪同種幼鳥及重用 [日本松雀鷹成雌](https://avifauna.hkbws.org.hk/species/0180/025400)，圖不等比例；喉部中央深紋不夠清晰，不能單靠 AI 圖鑑別。
- runtime 僅 a=3.3、r=1.0，i/v/c/o 原缺值顯示待查、非零；不根據外部 IUCN 或體長補分。食性 tags 僅昆蟲與爬蟲、棲地僅森林，a 非完整生態評估；r 為程式趣味分。
- 已目視素材、四圈及全卡；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0271。

## 0271 雀鷹交付

- 外層 [`0271.avif`](https://drive.google.com/file/d/1iD2WHftZc1rKvwVVHWZsFSSzjyYGciZq/view)，138205 bytes、MD5 `b19bf5a74c10cd5ea90a726f968889a8`、SHA256 `037342e3fac9dd5c762ec4bbc7b6a9093b0e1c106219e685bbcbb878ec28c475`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/eurspa1) IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/025600) 香港秋季稀少過境、冬春罕見。成雌對照同種成雄及重用 [日本松雀鷹成雌](https://avifauna.hkbws.org.hk/species/0180/025400)，圖不等比例，不能單靠 AI 圖鑑別。
- runtime 以 cardCopy 體長 60 cm 計分，與 HKBWS 28–40 cm 及 [Naturalis](https://birds-europe.linnaeus.naturalis.nl/linnaeus_ng/app/views/species/taxon.php?id=130488) 28–38 cm 身長明顯不符，輸入來源待核；v=4.4 和依賴它的 o=3.5 遮蔽待核，不重算或修改 runtime。其他四分沿 runtime。
- 原食性 tag 含 insect，但文案指出昆蟲極少取食，亦未反映鳥類獵物；a 非完整食性評估。c=3 為含特定島嶼亞種威脅文字的趣味分，非全球 IUCN 類別。
- 已目視素材、四圈及全卡並調整頭部裁切；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0272。

## 0272 蒼鷹交付

- 外層 [`0272.avif`](https://drive.google.com/file/d/13XC5C1-vkrtZj54VOZObgvzaUZlAQtve/view)，135646 bytes、MD5 `d856c7db3687228ff860aa7657cb8671`、SHA256 `33b43883ef4a67ec050f70ce36e6d79af59bff1a6b28d0834b60414e75f479b8`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/norgos1) 及 [HKBWS](https://avifauna.hkbws.org.hk/species/0180/025700) 識別、香港迷鳥及體長 50–65 cm；HKBWS 2024 為舊廣義分類，北美已於 2023 [拆分為美洲蒼鷹](https://www.allaboutbirds.org/guide/American_Goshawk/overview)。未核實拆分後全球 IUCN，卡上註明待核，未用舊廣義 LC 冒稱新分類；保留 runtime i=2，但該舊資料趣味分非已確認現行 IUCN。成鳥對照同種幼鳥及雀鷹雌鳥，圖不等比例。
- runtime `300–342 mm` 被解析成 `321 cm` 體長，而該數值似為翼弦，故 v=5 遮蔽；r=4.8 使用指北美已拆分物種的遷徙欄位及含錯誤的要點，c=3 因成鳥「保護」領域誤觸受脅字詞，r/c 遮蔽。依賴上述分數的 o=3.7 一併遮蔽，不重算；a 原缺值待查。未改 runtime。
- 已目視素材、四圈、比較圓框及全卡，修正比較圖裁切；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分歐亞國家。AVIF／分類／scores 遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0273。

## 0273 栗鳶交付

- 外層 [`0273.avif`](https://drive.google.com/file/d/1yvPzC4ViN6zhWwQbbQXp_-rsAWSeuRrp/view)，137416 bytes、MD5 `9731721983406958b1599c31bdd0569b`、SHA256 `e133aaf4854ee58cb9178143ecf92ed3b21003fd11c49da486856c29f876c816`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/brakit1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/026200) 45–51 cm、香港迷鳥，紀錄於后海灣。成鳥對照同種幼鳥及[黑鳶](https://avifauna.hkbws.org.hk/species/0180/026100)，AI 圖不等比例；幼鳥折翼圖不展示飛行翼底淡斑，黑鳶尾叉偏深，不能單靠插圖鑑別。
- runtime 以 AVONET 翼長 399.8 mm × 0.22 估身長 87.956 cm，與 HKBWS 45–51 cm 明顯不符，v=4.9 遮蔽，保留原觀賞值含體長估算提示。c=3 因無危文句中「瀕危物種紅色名錄」誤觸瀕危字詞，r=4.8 的遷徙欄為分佈而非遷徙、語源欄將法語名稱使用者 [Brisson 誤歸 Buffon](https://en.wikipedia.org/wiki/Brahminy_kite)，均遮蔽；依賴上述分數的 o=3.7 一併遮蔽，不重算。i=2、a=3.8 保留 runtime，a 為標籤趣味指標、非完整生態評估。
- 已目視素材、四圈、比較圓框及全卡，調整頭部裁切；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 遮蔽項／vEst 提示／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0274。

## 0274 白腹海鵰交付

- 外層 [`0274.avif`](https://drive.google.com/file/d/11qiF95hKfR_JBDOoTEAjiODGNV9Uy-jq/view)，134529 bytes、MD5 `b139860a9f4efddce7806dadb8c0805e`、SHA256 `849f523c71d28cbee174a39bdcf65c2593fdb3c530142ca7e978547eb04d8e56`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/wbseag1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/026300) 75–85 cm、香港沿岸不常見留鳥。成鳥對照同種未成鳥及[灰頭魚鵰](https://ebird.org/species/gyhfie1)，圖不等比例；未成鳥羽齡變化大，AI 足部、尾形及灰頭魚鵰尾帶僅示意，不能單靠插圖鑑別。
- runtime `90–0 cm` 格式錯誤被解析為 45 cm，與 HKBWS 75–85 cm 明顯不符，v=4.1 遮蔽；r=3.3 的語源欄只寫學名及分類而非語源，被錯計為語源資料，r 暫遮蔽；依賴上述分數的 o=2.7 一併遮蔽，不重算。i=2、a=2.8、c=1.2 沿 runtime，a 棲地標籤缺失、c 無保育文字輸入，均非完整生態或威脅評估。
- 已目視素材、四圈、比較圓框及全卡，調整腹部裁切及標籤；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0275。

## 0275 灰臉鵟鷹交付

- 外層 [`0275.avif`](https://drive.google.com/file/d/1g6kwCMCulwhWMWZoAFwVtKMq8KSM_drd/view)，142640 bytes、MD5 `d37445d50c7c0f32943b417553631860`、SHA256 `7aa6b76c748e3ed6cb1460fd113ddc8de7b3d5f5d152e5aa1c3bba357638e4ed`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/gyfbuz1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0180/026400) 41–48 cm、香港春季總述不常見過境、秋季稀少；正文另稱春季 common，保留此差異。成鳥對照同種未成鳥及[鳳頭蜂鷹](https://ebird.org/species/orihob2)，圖片不等比例；主圖白喉中央深色縱紋未清楚畫出，喉邊及尾紋僅示意，不可單靠插圖鑑別。
- runtime 在 dexScores 無該 ID，六分均缺值待查、非零，沒有依據 IUCN 或外部資料補算；未修改 runtime。部分原生國家／地區底圖含繁殖、過境及越冬，不表示全境或季節邊界。
- 已目視素材、四圈、比較圓框及全卡；AI 圖僅基本目視、非鳥類專家認證。AVIF／分類／缺分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0276。

## 0276 草鴞交付

- 外層 [`0276.avif`](https://drive.google.com/file/d/1x14I8pJjll0WvtJB5dl_Pkcm7lna2pWI/view)，141937 bytes、MD5 `e4e6f63958c18165061359bd30bed0a2`、SHA256 `d978c21840105b56ff26c2ba27fbb12ad3a1b07149f378ac2e1c25194d843185`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/ausgro1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/026600) 香港稀有冬候及春季過境、32–38 cm；[The Owl Pages](https://www.owlpages.com/owls/species.php?s=220) 提供較廣全種體長 32–42 cm。主圖對照[東方倉鴞](https://ebird.org/species/eabowl1)及[栗鴞](https://ebird.org/species/orbowl1/TH-90)，圖片不等比例；草鴞腿及栗鴞耳簇、尾羽比例可能誇張，不能單靠圖鑑別。東方倉鴞依 eBird 2024 拆分分類。
- runtime 食性 plant 由 diet 鳥名「草鴞」的「草」誤觸規則，a=3.3 遮蔽；中文鳴聲句截斷且矛盾，卻包含在評分所用要點中，r=1.8 暫遮蔽；o=2.8 依賴 a/r 一併遮蔽，不重算或修改 runtime。i=2、v=3.8、c=3 沿 runtime；v 使用 32–38 cm 中點，c 的新南威爾士州易危文字與全球 LC 不同，僅趣味分。英語食性錯欄、數段截斷，未照抄。
- 已目視素材、四圈、比較圓框及全卡；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0277。
- 本次環境重建 `/home/user/card-venv`、Noto TC 字體及 Natural Earth 世界底圖；舊 ignored 素材不在本機，Drive 已交付成品不重製。新素材與 AVIF 為 ignored 檔案，不保證跨環境保存。

## 0277 領角鴞交付

- 外層 [`0277.avif`](https://drive.google.com/file/d/196q9Y2BEf1IP2xicvacniseDfkbWT4Gy/view)，141363 bytes、MD5 `a5725f93a31d141e1fa96ade3cfd7732`、SHA256 `e92034156334e513a1f885aec9e31456126064f62c545a36b97094922ba81417`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0190/027100) 香港常見廣泛留鳥、23–25 cm、全球 IUCN LC；[Cornell](https://ebird.org/species/cosowl1) 識別、羽色與相似種。灰褐型成鳥樣貌對照[紅角鴞](https://ebird.org/species/orsowl)及[黃嘴角鴞](https://ebird.org/species/mosowl2)，圖片不等比例；AI 主圖及紅角鴞耳簇偏長、紅角鴞面盤黑邊偏明顯，黃嘴角鴞喙色不準，不能單憑示意圖鑑別。首圈原裁切欠缺完整耳簇，調整重渲目視。
- 原 habitat「海拔」的「海」被 water 規則誤配為水邊，a=3.3 遮蔽；翼長 155.8 mm × 0.22 估體長 34.276 cm，明顯偏離 HKBWS 23–25 cm，v=3.7 遮蔽，保留原估算提示。原遷徙欄斯里蘭卡越冬說法在現行分類下未找到獨立核實，且部分要點截斷，r=3.3 暫遮蔽；依賴上述輸入的 o=2.7 一併遮蔽，不重算。i=2、c=1.2 沿 runtime；c 缺保育文字並非完整威脅評估。未修改 runtime。
- 已目視素材、四圈、比較圓框及全卡；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 遮蔽項／vEst／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0278。

## 0278 白頭鷂交付

- 外層 [`0278.avif`](https://drive.google.com/file/d/1R-Dn6vjhErVjrfvp6VcwmJcT8vgiqL2R/view)，144086 bytes、MD5 `70bde00fca8e49a86b9c3c4aab6af5df`、SHA256 `220fbf613ca2b52efcdfed9fbe406fe94d565ec1daccd30f13d9ea1bcfb55ddd`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/wemhar1) 全球 IUCN 2025 LC，成雄淡頭胸、棕褐腹；對照同種雌鳥和[白腹鷂雄鳥](https://ebird.org/species/easmah1)。AI 插圖不等比例、羽紋足爪及尾翼僅示意；折翼圖不展示飛行翼色，羽齡變化大且可能雜交，不可單憑圖片鑑別。
- [HKBWS 較新香港名錄](https://avifauna.hkbws.org.hk/hk-list)將白頭鷂列 I 類但未在表格給出詳細頻率；[舊白腹鷂物種頁](https://avifauna.hkbws.org.hk/species/0180/025800)把歷史香港紀錄視為白腹鷂並提及疑似雜交，兩來源時點不同；不斷言白頭鷂沒有香港紀錄，亦不套用白腹鷂香港狀態。
- runtime dexScores 沒有 0278，六分均待查、非零，沒有依 IUCN 或外部資料補算；未改 runtime。地圖僅部分原生／繁殖／越冬國家，不表示全境或季節邊界。
- 已目視素材、四圈、比較圓框及全卡；AI 圖僅基本目視、非鳥類專家認證。AVIF／分類／缺分／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0279。

## 0279 紅角鴞交付

- 外層 [`0279.avif`](https://drive.google.com/file/d/1SEtutnUWe5ej5AAuIXpWEIiNnsDTnaIz/view)，144106 bytes、MD5 `f8db073008df0af93d7c7b9765744cd1`、SHA256 `a715d633f98f14842e8ca0aec5cb8dd59e7e619798c7b7bac5820d0e0e5c5521`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/orsowl) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/027000) 香港秋季稀少但可能漏記的過境鳥，春季過境及夏候罕見、體長 18–21 cm；[The Owl Pages](https://www.owlpages.com/owls/species.php?s=560) 全種 17–21 cm，但舊稱香港迷鳥與 HKBWS 本地資料不同，採後者。紅褐型主圖對照領角鴞及黃嘴角鴞，後兩張重用 0277 已目視素材；不等比例，領角鴞耳簇偏長、黃嘴角鴞喙色不準，羽式僅示意，不可單憑插圖鑑別。
- runtime 以 AVONET 翼長 142.5 mm × 0.22 估身長 31.35 cm，與 HKBWS 18–21 cm 顯著不符，v=3.6 和依賴 v 的 o=2.0 暫遮蔽，不重算，保留原觀賞值體長估算提示。i=2、a=2.3、r=1、c=1.2 沿 runtime，但食性 tag 空、棲地僅森林，遷徙／要點／保育文字缺失，非完整生態研究與威脅評估；英文 diet 錯置叫聲，未照抄。未修改 runtime。
- 已目視素材、四圈、比較圓框及全卡；AI 圖僅基本目視、非鳥類專家認證；地圖僅部分國家。AVIF／分類／scores 遮蔽項／vEst／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0280。

## 0280 黃嘴角鴞交付

- 外層 [`0280.avif`](https://drive.google.com/file/d/1SBLzfGfllsDxlsKqesM_CQ9HxkUEKEkm/view)，147406 bytes、MD5 `73fc907dd6c654beb8281d2538fddf83`、SHA256 `3cc0b37ceb50f26169b3273b7f2f763eb471eb1572595ce74e1eee2a240020a4`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/mosowl2) 黃眼及鮮明白色肩羽列，當前頁沒有 IUCN 標籤；[The Owl Pages](https://www.owlpages.com/owls/species.php?s=380) 體長 18–20 cm，喙淡角質色、白色或蠟黃色。[Wikipedia](https://en.wikipedia.org/wiki/Mountain_scops_owl) 引用 BirdLife IUCN 2024 年無危，尚未直接核驗[原評估](https://www.iucnredlist.org/species/22688579/263677414)及其分類與目前分類是否完全一致，卡面標明參考 2024；[HKBWS 2024 香港名錄](https://avifauna.hkbws.org.hk/hk-list)列 I 類，不以名錄推斷本地頻率。
- 原翼長 140.4 mm × 0.22 估體長 30.888 cm，明顯偏離 18–20 cm，v=3.6 及依賴 v 的 o=2.0 暫遮蔽、不重算；保留 vEst 原觀賞值體長估算提示。a 原缺分非零；i=2、r=1、c=1.2 沿 runtime，遷徙、語源、要點、保育文案缺失，c 非完整受脅評估。未修改 runtime。
- 主圖 AI 耳簇偏長；比較圖重用 0277 領角鴞及 0279 紅角鴞，不等比例、耳簇偏長及紅角鴞面盤黑邊偏明顯；羽式、喙及腳爪僅示意，不可單靠插圖鑑別。素材、特徵圈及全卡已目視，AI 圖非鳥類專家認證；完整世界底圖僅部分國家。AVIF／分類／score 遮蔽／vEst／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0281。

## 0281 鵰鴞交付

- 外層 [`0281.avif`](https://drive.google.com/file/d/1NnGgbX0f3YCnUNZZfGMkq614fWPJRB4U/view)，150908 bytes、MD5 `a2bda3eede1bc73f644f4855a06d3268`、SHA256 `d30257cc4070badee1eff823812e00c270f22f620365db6432604deec43b8af5`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/eueowl1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/027300) 56–75 cm，香港稀少但廣佈留鳥，可能因草地演替為灌叢而下降，但記錄少不足以精確量化；香港狀態與全球評估分開。
- runtime 的 75 cm 是 HKBWS 範圍上限，並非平均體長；v=4.7 沿 runtime。原 r=1.8 由截斷的 highlights 導出，其中範圍一項聲稱整個歐亞大陸均有分佈，過度概括，r 和依賴 r 的 o=2.5 暫遮蔽、不重算。i=2、a=2.8、c=1.2 沿 runtime；棲地與食性 tag 不完整，c 非完整本地受脅評估。未修改 runtime。
- 主圖對照[褐漁鴞](https://ebird.org/species/brfowl1)和[長耳鴞](https://ebird.org/species/loeowl)，三圖不等比例；主圖腹紋規整、耳簇與腳爪可能誇張，褐漁鴞耳簇偏長，長耳鴞面盤耳簇可能過度整齊，AI 羽式僅示意、不應單靠圖片鑑別。已目視素材、四圈、比較圓框和全卡，但非鳥類專家認證；完整世界底圖僅部分國家。AVIF／分類／scores 遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0282。

## 0282 褐漁鴞交付

- 外層 [`0282.avif`](https://drive.google.com/file/d/1Z85GavvRb9ocGZRr0InOm-Sl4Mp-T7q9/view)，144426 bytes、MD5 `d4b207455af75efbf2145221112e8fcb`、SHA256 `5aa85547ea0429453a6e31a6d37da2b44174eae13b5f53794dcff5428816a4aa`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/brfowl1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/027400) 香港不常見及局部分布，近年增加，48–55 cm；全球與香港狀態分開。
- a=2.8 的 fish tag 來自優先使用的錯置化石 diet 句中鳥名「褐魚鴞」的「魚」誤觸；雖外部來源證實魚是食物，依用戶要求不補算，暫遮蔽。r=4.8 使用沒有語源解釋的 etymology 和錯置／損壞 highlights；c=3.0 的規則把「國際自然保護聯盟並不認為……受到威脅」的「保護」「威脅」當受脅訊號、忽略否定語境；r/c 及依賴上述分數的 o=3.4 一併遮蔽、不重算。i=2、v=4.3 沿 runtime；54.5 cm 為原 48–61 cm 的中點，非個體實測，未修改 runtime。
- 主圖重用 0281 已目視褐漁鴞素材，對照鵰鴞及[馬來漁鴞 *Ketupa ketupu*](https://ebird.org/species/bufowl2)，中文名依 [Avibase](https://avibase.bsc-eoc.org/species.jsp?avibaseid=C1AAB74D595547CA)，避免與黃腿漁鴞混淆。三圖不等比例；主圖耳簇偏長、下體細橫紋不清，馬來漁鴞耳簇及腹紋可能誇張，腳爪羽式僅示意，不能單靠圖片鑑別。已目視素材、四圈、比較圓框及全卡；非鳥類專家認證，地圖僅部分原生國家。AVIF／分類／scores 遮蔽項／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0283。

## 0283 斑頭鵂鶹交付

- 外層 [`0283.avif`](https://drive.google.com/file/d/1CJ2dfNpf_RLP8njSJmLCH-JaFyyW5BrD/view)，150231 bytes、MD5 `0252717067b5f2bdb5f5ce43abe0a83c`、SHA256 `d12a2a219feb62e6340b4f5ad568b94065d96561ffb360fad2e3701447dd0aee`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/asbowl1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/026900) 香港本地頗常見留鳥、主要在新界，22–25 cm，香港主要夜間活動，與其他地區較常日間活動分開。HKBWS 現認八亞種，不以舊文「過去五亞種」作現時分類。
- 原 a=3.3 的 plant tag 是英文 diet「grasshoppers」被 plant 正則 `grass` 誤配；v=3.7 由 AVONET 翼長147.8 mm×0.22 估體長32.516 cm，明顯偏離 22–25 cm；r=1.8 使用截斷及未核歷史分類的要點；三者及依賴它們的 o=2.4 暫遮蔽，保留 vEst 原觀賞值體長估算提示、不重算。i=2、c=1.2 沿 runtime；c 非完整受脅評估，未改 runtime。
- 主圖對照[領鵂鶹](https://ebird.org/species/colowl1)及[林鵂鶹](https://ebird.org/species/junowl1)，不等比例；主圖頭頂橫紋偏規則、白眉不明顯，領鵂鶹正面圖不顯示後頸偽眼，林鵂鶹羽紋相似，羽紋喙腳爪僅示意，不可單靠圖片鑑別。已目視素材、四圈、比較圓框及全卡，非鳥類專家認證；完整世界底圖僅部分國家。AVIF／分類／scores 遮蔽項／vEst／bounds／ISO3／bytes／hash 核驗，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套，未動 R2、UI、Service Worker 或 runtime。下一張 0284。

## 0284 領鵂鶹交付

- 外層 [`0284.avif`](https://drive.google.com/file/d/1Pmfxn06oN_15V9N9LgMOGWRHPAPV07cU/view)，142882 bytes、MD5 `6d97dc731f556855a544f3768ddc2a58`、SHA256 `8b6bb71bd2c684ea0b35236cae70d31f7362d5715d9c774d09415d1f4cd3433e`。上載前精確查重 0 且搜尋完整；上載後 get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/colowl1) 全球 IUCN 2025 LC，部分鳥冬季下降至低地；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/026800) 15–17 cm、後頸偽眼、香港稀少留鳥 2019 首記；該頁稱全球趨勢下降，不推論香港趨勢。[Owl Pages](https://www.owlpages.com/owls/species.php?s=1880) 列食性包括昆蟲和蜥蜴，較舊的分佈分類需留意。[Wikipedia](https://en.wikipedia.org/wiki/Collared_owlet) 記巽他鵂鶹現已分種，舊分佈表不可盲目全套。
- 六分沿 runtime：i=2、a=3.3、v=2.7、r=3.3、c=3、o=2.9，沒有重算；r 依遷徙及要點有無，原文部分截斷且留鳥描述概括，c 因棲地喪失威脅文字觸發，均非完整學術評估。未改 runtime。
- 主圖沿用 0283 領鵂鶹比較素材；比較用既有斑頭鵂鶹及林鵂鶹素材，不等比例。主圖正面不顯示後頸偽眼；新背面素材偽眼過於圓黑而不採用；AI 羽紋、喙和腳爪僅示意，非專家認證，不能單靠圖鑑別。首次特徵圈未對準喉部，修正重渲並目視全卡、四圈及比較框；地圖部分國家、非全境。核驗 AVIF／分類／scores／bounds／ISO3／bytes／hash，標籤測試 5/5、diff check 通過；未跑 TS／Node 全套、未動 R2、UI 或 runtime。下一張 0285。

## 0285 褐林鴞交付

- 外層 [`0285.avif`](https://drive.google.com/file/d/1xRi4evPCL9nPmZWlRMiT1tUoSn09Chj3/view)，146488 bytes、MD5 `652ea8bfab59a1d5f04055e6dac344f4`、SHA256 `fb0dbebc49d400916980c7152ce1ee126d319bbbd28bfdc6457a7e83773a72ce`。上載前精確查重 0 且搜尋完整；get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/brwowl1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/027500) 46–55 cm、香港稀少但增加留鳥 2006 首記，其頁稱全球趨勢下降，與香港狀況分開。北部類群曾提議拆分，卡沿 runtime 及 Cornell。
- v=4.6 的 AVONET 翼長313 mm×0.22 估68.86 cm，明顯高於 HKBWS 46–55 cm；r=3.3 把名稱與分布誤作語源且 highlights 截斷；v/r 與依賴它們的 o=3 暫遮蔽，不重算，保留 vEst；i=2、a=3.8、c=1.2 沿 runtime，c 缺保育文案並非完整評估。
- 主圖、[白領林鴞](https://ebird.org/species/mowowl1)及[灰林鴞](https://ebird.org/species/tawowl1) AI 圖已目視、比例不一，羽紋、面盤與腳爪僅示意、非專家認證。比較名 [Avibase](https://avibase.bsc-eoc.org/species.jsp?avibaseid=52A8CE5C3058123E) 與 [灰林鴞消歧](https://zh.wikipedia.org/zh-hant/灰林鸮)。修正面盤圈裁切後目視全卡；世界圖僅部分國家。AVIF／分類／scores／vEst／bounds／ISO3／bytes／hash 核驗、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0286。

## 0286 短耳鴞交付

- 外層 [`0286.avif`](https://drive.google.com/file/d/13L-I_Nzkn0YqCtOfj7eonn_cAsCGEeOE/view)，144347 bytes、MD5 `0f5be311dfb1cba911557b0d7b77f75f`、SHA256 `ed6e84e2dc38533f3ce4b135a194c95aa8dd3d2b5250c96d6c594a56909b984e`。查重 0 且完整、get_file 核驗 parent／名稱／MIME／大小／MD5／未刪。
- [Cornell](https://ebird.org/species/sheowl) 全球 IUCN 2025 LC、全球其他地區可晨昏獵食；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/027200) 37–38 cm，香港稀少冬候鳥、極稀少春季過境，可能漏記，該頁無香港日間獵食紀錄；其稱全球數量下降，不推論香港趨勢。[Wikipedia](https://en.wikipedia.org/wiki/Short-eared_owl) 部分遷徙、全球原生國家及語源。
- 六分沿 runtime 不重算，v=3.9 用原有 38.5 cm 而非翼長估算，r=4.8、c=1.2 是 app 欄位趣味指標而非完整學術或保育評估。
- AI 主圖、[長耳鴞](https://ebird.org/species/loeowl)及[沼澤耳鴞](https://ebird.org/species/marowl2)圖目視、不等比例：主圖耳簇略顯眼、長耳鴞耳簇可能誇張；首次沼澤耳鴞圖眼色錯和耳簇長未用，替代圖腿長且色偏深，AI 羽紋喙腳僅示意，非專家認證。[眼色參考](https://carolinabirds.org/HTML/Owl_Old_World.htm)。世界地圖僅部分原生國家，不分季節。驗 AVIF／分類／scores／bounds／ISO3／bytes／hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0287。

## 0287 北鷹鴞交付

- 外層 [`0287.avif`](https://drive.google.com/file/d/1Vguc9srkL93BB2Ct47mhz5emJUPRiuQw/view)，142167 bytes、MD5 `daf07ccbbffb54ae4524f748b45d84aa`、SHA256 `ee92dc5d75e3d1f396d40790a0b5cd91ab7ff2fafcec2d42a199aff885e34e54`。查重 0 且完整；get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/norboo1) 全球 IUCN 2025 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0190/026700) 29–33 cm，香港稀少過境鳥主要春季、全球趨勢穩定。HKBWS 名「鷹鴞」、runtime 名「北鷹鴞」，均按 Ninox japonica 對照；HKBWS 列 3 亞種與 [Wikipedia](https://en.wikipedia.org/wiki/Northern_boobook) 列 2 不同，曾與褐鷹鴞合併，勿將舊合併物種分佈混用。
- `dexScores` 無 0287，六項全待查，未按 LC 補算；世界圖僅部分記錄國家、不代表全境或完整季節。
- 已目視主圖、[褐鷹鴞](https://ebird.org/species/brnhao1)及斑頭鵂鶹比較圖與整卡；主圖額上白斑小，初稿第三圈裁錯，改為「褐色翼羽」並重渲目視。褐鷹鴞與主圖相似，勿單靠插圖鑑別；腿爪、尾羽及比例僅 AI 示意，非專家認證。AVIF／分類／缺分／bounds／ISO3／bytes／hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0288。

## 0288 戴勝：未完成，續製備忘

- 本輪生圖達上限，尚未有第二比較種綠林戴勝素材；**未建立 spec、未渲染、未查重或上載 0288**。下次先保留已生成素材，勿重生：`cards/art/info-restart-0288/pixel.png`（主圖）、`madagascar.png`（馬達加斯加戴勝比較圖）已目視；AI 圖非專家認證、兩圖相似不能單靠插圖鑑別。素材被 Git 忽略，跨 sandbox 不保證存在。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/027600) 體長 26–32 cm、香港稀少冬候鳥及過境鳥，夏季罕見、兩繁殖紀錄；其稱全球趨勢下降。[Cornell](https://ebird.org/species/hoopoe) Upupa epops 全球 IUCN 2025 LC；[Madagascar Hoopoe](https://ebird.org/species/madhoo1) 列 U. marginata 為獨立種，[Wikipedia](https://en.wikipedia.org/wiki/Eurasian_hoopoe) 說明戴勝分類拆合及亞種差異，勿混用分佈。綠林戴勝中文名可對 [GBIF](https://www.gbif.org/species/2498452)。
- runtime i=2、a=3.3、v=3.6、r=4.8、c=3、o=3.3、vEst=1；AVONET 翼長 142.3 mm × 0.22 得 31.306 cm，落於 HKBWS 範圍，但仍是估算、非平均實測。`cardCopy` 的英文 fieldCopy 引用馬達加斯加戴勝，中文語源與部分 highlights 截斷，完成前須依實際算法核實 r/o 的影響；中文 weight「4.5 g」疑似錯誤勿使用。評估後才決定遮蔽、不能補算或修改 runtime。

## 0288 戴勝交付（取代上述未完成狀態）

- 外層 [`0288.avif`](https://drive.google.com/file/d/14kpQNQUQw6t2kze9FqCtqjumi5lyta35/view)，145538 bytes、MD5 `8ba5632cc7c895b9d8e405afe6d2fb42`、SHA256 `73648098f360a022496cc9efb4f31d402dcd3cf29f4d725f12c17530040aa3f5`。精確查重 0 且完整，get_file 核驗 parent、MIME、大小、hash、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/027600) 26–32 cm、香港稀少冬候鳥及過境鳥、全球趨勢下降；[Cornell](https://ebird.org/species/hoopoe) IUCN 2025 全球 LC。世界圖僅部分原生國家；[Madagascar Hoopoe](https://ebird.org/species/madhoo1) 獨立物種，曾有拆合。
- i=2、a=3.3、v=3.6、c=3 沿 runtime；v 基於翼長估算、c 為歐洲局部威脅文字觸發而非完整評估。r 語源欄缺少語源、highlights 截斷，r/o 暫遮蔽不補算；原 vEst 提示保留。
- 主圖、馬達加斯加戴勝及綠林戴勝比較 AI 圖已目視，兩戴勝圖相似不可單靠圖鑑別，羽式比例非專家認證。兩次調整長喙特徵圈並目視全卡；AVIF、分類、scores、bounds、ISO3、hash 及 5/5 標籤測試、diff check 通過；未動 R2 或 runtime。下一張 0289。

## 0289 普通翠鳥交付

- 外層 [`0289.avif`](https://drive.google.com/file/d/1bjZBcFquMuNt8FAnWnAzQGPireOdKKKV/view)，147159 bytes、MD5 `d49ff9faec4ee63cac2edf402c965800`、SHA256 `9907f7b236c315ae70600f77cc87d2851d18bc7c2a1beb8d836388eab91d6951`；查重 0 且完整，get_file 核驗 parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/028300) 16–18 cm，香港秋冬常見春夏稀少、過境族群可能下降，后海灣冬季水鳥計數未見顯著下跌，全球趨勢未知；[Cornell](https://ebird.org/species/comkin1) 全球 IUCN 2025 LC。
- i=2、a=4.7、v=2.8、c=3 沿 runtime；r=4.8 源 highlights 有截斷且遷徙描述將可能小群概括為通常集體移動，暫遮蔽 r/o，不重算。16 cm 是原 runtime 數值而非實測平均；c 由威脅文字觸發並非完整保育評估。
- 雄型主圖及[藍耳翠鳥](https://ebird.org/species/blekin1)、[白胸翡翠](https://ebird.org/species/whtkin2)比較圖已目視；藍耳幼鳥可有橙耳、圖片不等比例，AI 羽式喙腳非專家認證，不單靠圖鑑別。修正喙圈後目視全卡；世界圖僅部分國家。AVIF、分類、scores、bounds、ISO3、hash、標籤測試 5/5 和 diff check 通過；未動 R2 或 runtime。下一張 0290。

## 0290 三趾翠鳥交付

- 外層 [`0290.avif`](https://drive.google.com/file/d/1chnDQ_Y0qT81P6K_3mAhO4jppKz8QnYe/view)，138900 bytes、MD5 `318ed9191950db594707aa63151b260d`、SHA256 `079c6887a6464b73618da34c4e8c7bf36e68c1ebf5dc513f86b07c6d0992852f`。完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [Cornell](https://ebird.org/species/bkbkin1) 同學名的全球 IUCN 2025 **NT**，有別於 runtime 舊 LC；[HKBWS](https://avifauna.hkbws.org.hk/species/0200/028400) 12.5–14 cm、香港偶見，其網頁保育欄未提供有效值。曾與[赤背三趾翠鳥](https://ebird.org/species/rubkin1)合併，舊分佈不宜混用；地圖僅部分國家。
- i/c 原用舊 LC、r 語源欄僅列分類拆合且要點截斷，連同依賴它們的 o 一併遮蔽，不補算；a=5、v=2.5 沿 runtime，vEst 基於翼長 58.2 mm × 0.22 約 12.804 cm，保留估算提示，並非實測平均。
- 主圖、赤背三趾翠鳥及重用 0289 普通翠鳥圖已目視，AI 腳趾數及羽式非專家認證，不單憑圖鑑別；修正紅喙特徵圈後目視全卡。驗 AVIF／分類／scores／vEst／bounds／ISO3／hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0291。

## 0291 赤翡翠交付

- 外層 [`0291.avif`](https://drive.google.com/file/d/1CfKt76dA31MjmWM6rBT5wdrc6ToFv9uL/view)，137120 bytes、MD5 `204c50e87afc382b754a0208be85974e`、SHA256 `14413844a6d9442a0d7ac2f92ce114b1bdec483774308f0d6d841e666982f9d7`；完整查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/027900) 25–27 cm、香港偶見、全球趨勢下降；[Cornell](https://ebird.org/species/rudkin1) 全球 IUCN 2025 LC。首次抓到 HKBWS 028500 是冠魚狗，**未用在本卡**。
- 六分沿 runtime：i=2、a=3.3、v=3.4、r=4.8、c=1.2、o=2.9；vEst 翼長113.7 mm × 0.22 約 25.014 cm、不是實測平均。a 缺甲殼類 tag、c 無保育文案，均非完整評估。
- AI 主圖尾可能過長、藍腰不明顯；重用白胸翡翠及三趾翠鳥圖比較，不等比例且非專家認證。褐翅翡翠比較草圖腳在空中沒支撐，未採用。已目視全卡及四圈，驗 AVIF／分類／scores／vEst／bounds／ISO3／hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0292。

## 0292 白胸翡翠交付

- 外層 [`0292.avif`](https://drive.google.com/file/d/1yzmozo9oONzfQyh1nxdCfgUlVSSHDUXc/view)，136734 bytes、MD5 `31624bfa683fb962e1e1415acdf6e916`、SHA256 `9309d490dbadcbc273ad22541b63b573f37fc986934d04b23d8903ecebb63ecf`。完整精確查重 0，get_file 核驗 parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/028000) 26–29 cm、香港全年出現但顯著下降特別在繁殖季；[Cornell](https://ebird.org/species/whtkin2) 全球 IUCN 2025 LC，全球和本地趨勢不可混同。[Wikipedia](https://en.wikipedia.org/wiki/White-throated_kingfisher) 記褐胸翡翠拆分，舊分佈不混用。
- i=2、a=4.7、v=3.4、c=1.2 沿 runtime；a 原漏甲殼和齧齒 tag，c 欠保育文案並非完整評估；vEst 113.2 mm ×0.22 約24.904 cm 略低 HKBWS 26–29 cm，為估算不是平均實測。r 原語源缺主詞且要點截斷或重複，r/o 遮蔽不補算。
- 重用 0289 白胸翡翠、0291 赤翡翠與 0289 普通翠鳥 AI 素材，圖不等比例、羽式及比例非專家認證；目視全卡和四圈、世界圖僅部分國家。核驗 AVIF／分類／scores／vEst／bounds／ISO3／hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0293。

## 0293 藍翡翠交付

- 外層 [`0293.avif`](https://drive.google.com/file/d/1SoxWo523y1IHqZ21ZRX5SD-rdQYVjQXT/view)，141273 bytes、MD5 `182ecbf8dfedb7cf67848604b7e7249c`、SHA256 `3db97b397f2abed672f45e3126a35fcedba9a0e2ca25c87235e96e1ad0f19856`。完整精確查重 0，get_file 核驗 parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/028100) 28–31 cm，香港稀少過境及冬候鳥、繁殖季罕見，四季顯著下降；[Cornell](https://ebird.org/species/blckin1) IUCN 2025 全球 VU。
- i=3.8、a=4.3、v=3.5、c=2.2 沿 runtime；28 cm 為原值及 HKBWS 範圍下限，非實測平均；c 欠保育文案，非完整評估。語源缺主詞、遷徙及要點截斷，r/o 遮蔽不補算。
- AI 主圖尾可能偏長、白胸與橙腹界線不保證準確；重用白胸翡翠、赤翡翠圖，不等比例、非專家認證。修正白領圈後目視全卡、四圈；世界圖僅部分國家。AVIF／分類／scores／bounds／ISO3／hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0294。

## 0294 白領翡翠交付

- 外層 [`0294.avif`](https://drive.google.com/file/d/1rtsQJwg6CZaCEcOgilgpoM8vjRZ3pn4_/view)，144512 bytes、MD5 `6e668d70589237b60b2aceace6032382`、SHA256 `ee730354954105a4de319d5eb2e1b5c909b550f8c3765b1a71ff0fc19e95e5ff`。完整精確查重 0，get_file 核驗 parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/028200) 23–25 cm、香港偶見，該頁稱全球 LC、趨勢穩定；[Cornell](https://ebird.org/species/colkin1) 同物種頁未顯示 IUCN 標籤，[Wikipedia](https://en.wikipedia.org/wiki/Collared_kingfisher) 列多類群拆分，評估範圍差異待核，卡標明 LC 依 HKBWS、不稱 2025 評估；舊 runtime 說東至玻里尼西亞含拆分類群，不用作完整分佈。
- 六分沿 runtime i=2、a=4.7、v=3.3、r=1.8、c=1.2、o=2.6；24 cm 為原範圍中點非實測平均，r/c 為欄位趣味指標而非完整學術或保育評估。
- AI 主圖及重用白胸翡翠、藍翡翠圖已目視，不等比例、羽式腳趾非專家認證；全卡四圈目視，世界圖僅部分國家。驗 AVIF／分類／scores／bounds／ISO3／hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0295。

## 0295 斑魚狗交付

- 外層 [`0295.avif`](https://drive.google.com/file/d/10lWuqzGJ0hmwG7A8QkLrQIE0uHBeWZxr/view)，135232 bytes、MD5 `7dd309f6c40e86e923bb7a0673ab9307`、SHA256 `2c3a4515ccc561fa28f4b56dd16435d1dd0623af174cb5e5f613b33999434ff7`。完整精確查重 0；get_file 核驗 parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/028600) 25–30 cm、香港局部不常見留鳥並下降，該頁稱全球趨勢未知，香港觀察食物僅魚；[Cornell](https://ebird.org/species/piekin1) 全球 IUCN 2025 LC。
- 六分沿 runtime i=2、a=2.8、v=3.6、r=1、c=1.2、o=2.1；AVONET 翼長 136.2 mm×0.22 約29.964 cm 是估算、非平均實測；a 缺棲地 tag，r/c 缺輸入，非完整學術評估。
- 已目視雄型兩胸帶主圖、冠魚狗雌型及重用普通翠鳥圖；圖不等比例、羽式喙腳僅 AI 示意、非專家認證。目視全卡四圈；世界圖僅部分國家。驗 AVIF／分類／scores／vEst／bounds／ISO3／hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0296。

## 0296 藍喉蜂虎交付

- 外層 [`0296.avif`](https://drive.google.com/file/d/12raBk9U-LXWS_cG1k3ONwuvrfUwtXjvt/view)，135993 bytes、MD5 `c6c8c7956e790df56e24e8c4dd14aa66`、SHA256 `fa5c92211f57bb56f4e86aae51fc17c8dcff16e87a1aeb7ba755104d683cd985`。精確完整查重 0；get_file 核驗 parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/028800) 體長 21–23.5 cm 另加約 9 cm 延長中央尾羽；香港罕見過境。[Cornell](https://ebird.org/species/btbeat2) 全球 IUCN 2025 LC。比較：[栗喉蜂虎](https://avifauna.hkbws.org.hk/species/0200/028700)、[栗頭蜂虎](https://ebird.org/species/chbeat1)。
- 沿 runtime i=2、a=3.8、v=3.3、r=1、c=1.2、o=2.3；vEst 是 AVONET 翼長 111.6 mm×0.22 約24.552 cm 粗估、非實測平均。r 缺中文遷徙／語源／要點輸入；c 缺中文保育文案，均非完整評估。
- 已目視三張 AI 圖及全卡四圈，修正尾羽裁切後重渲目視。主圖羽幹可能過細，栗喉喉色偏橙，栗頭腳爪細節不可靠；非專家認證且不等比例。世界圖僅部分國家；驗 AVIF／分類／scores／vEst／bounds／ISO3／hash，標籤測試 5/5、diff check 通過。未動 R2 或 runtime；下一張 0297。

## 0297 栗喉蜂虎交付

- 外層 [`0297.avif`](https://drive.google.com/file/d/1ZfBcClPoGogJcWxD-nkbHijaJp9nyekr/view)，132691 bytes、MD5 `e51032cbcd854acd803650cbe5a9ea6c`、SHA256 `79375ccf9aced9704656d81427db7e4fb9dacea4c366da4c3b2a6b8f5ff6d744`。精確完整查重 0，get_file 驗 parent、MIME、bytes、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/028700) 體長 28–30 cm，延長中央尾羽可再多達 7 cm；香港春秋過境、全球趨勢穩定。[Cornell](https://ebird.org/species/btbeat1) 全球 IUCN 2025 LC；比較 [藍喉蜂虎](https://ebird.org/species/btbeat2) 和 [栗頭蜂虎](https://ebird.org/species/chbeat1)。
- i=2、v=3.5 沿 runtime；翼長129.5 mm ×0.22 約28.49 cm 為估算非實測平均。a 花蜜 tag 疑由蜜蜂誤配，r 語源缺詞且遷徙與要點截斷，c 無危名錄中的「保護／瀕危」誤觸受脅詞；a/r/c/o 遮蔽，不補算。
- 三張 AI 圖重用 0296 已目視圖；栗喉主圖喉色偏橙，延長羽幹偏細，腳爪有局限，非專家認證，圖不等比例；喉圈標籤改為中性「喉部羽色」後重渲及目視。世界圖僅部分國家；驗 AVIF、分類、scores、vEst、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0298。

## 0298 藍胸佛法僧交付

- 外層 [`0298.avif`](https://drive.google.com/file/d/1tGAMST-mDb5fU3buCIGuRTRpxRhyctEb/view)，139352 bytes、MD5 `27aefaf51f76d5ee4b8104750532f459`、SHA256 `73dde6bb2372bb96cfb8119dcc854e9fcb72ca0fbdb565345113b4db7ce5037b`。精確完整查重 0，get_file 驗 parent、MIME、bytes、MD5、未刪。
- [Cornell](https://ebird.org/species/eurrol1) 全球 IUCN 2025 LC；[Wikipedia](https://en.wikipedia.org/wiki/European_roller) 體長 29–32 cm，非實測平均；[香港名錄](https://avifauna.hkbws.org.hk/hk-list) 有紀錄，不推斷常見程度。比較 [印度佛法僧](https://ebird.org/species/indrol2)、[紫胸佛法僧](https://ebird.org/species/librol2)，後者部分亞種胸藍。
- a=3.3、v=4、r=2.5 沿 runtime；vEst 翼長190.8 mm×0.22 約41.976 cm，比來源體長範圍長，屬粗估非實測平均；r 遷徙欄混繁殖敘述。runtime 舊 NT 與目前 LC 不符，i/c 及連帶的 o 遮蔽，不補算。
- 已目視三圖、全卡四圈；修喙圈重渲再目視。AI 主圖棕色折翼羽可能過多、尾腳待核；印度比較胸紋可能誇張、紫胸比較尾羽幹偏細。非專家認證、圖不等比例。世界圖僅部分國家；驗 AVIF、分類、scores、vEst、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0299。

## 0299 三寶鳥交付

- 外層 [`0299.avif`](https://drive.google.com/file/d/1O2cXpimQmphQSXVYFZfCkeTJCue3Swls/view)，140165 bytes、MD5 `5bd21ca9d5ae2f82161be780dc739e99`、SHA256 `fee48865a8c94fe835bc19e47fb1bcf3bcb391eebeb10d65b1f83d836e3551c0`。精確完整查重 0；get_file 驗 parent、MIME、bytes、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/027800) 27–32 cm，香港頗常見春秋過境，全球趨勢下降；[Cornell](https://ebird.org/species/dollar1) 全球 IUCN 2025 LC。比較 [紫三寶鳥](https://ebird.org/species/purrol1)、[藍胸佛法僧](https://ebird.org/species/eurrol1)。
- i=2、a=3.3、v=4、c=1.2 沿 runtime；翼長 186.2 mm×0.22 約40.964 cm 是粗估且超出 HKBWS 範圍，非實測平均；c 缺保育文案，非完整評估。r 要點截斷及缺前文，r/o 遮蔽不補算。
- 三圖及全卡已目視；首次紫三寶鳥比較圖錯成亮藍未用，改深紫圖；藍胸重用 0298。主圖尾可能過長偏尖、翼紋與腳待核，均 AI 示意、非專家認證、不等比例；修頭部及喉圈後重渲再目視。世界圖僅部分國家；驗 AVIF、分類、scores、vEst、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0300。

## 0300 大擬啄木鳥交付

- 外層 [`0300.avif`](https://drive.google.com/file/d/1mVTHzrc4K2uv6tZg1yFWP_wmngmPRboW/view)，143160 bytes、MD5 `30179b762f45cedbe02d0f9c1fdecc71`、SHA256 `03bb50f6aed7f74cd0b3c3018bd76116a05d859d19bbfb233c5585234aea3607`。精確完整查重 0；get_file 驗 parent、MIME、bytes、MD5、未刪。
- [Cornell](https://ebird.org/species/grebar1) 全球 IUCN 2025 LC；[Wikipedia](https://en.wikipedia.org/wiki/Great_barbet) 描述體色、生態、分布與體長。比較 [黑眉擬啄木鳥](https://ebird.org/species/chibar1)、[斑頭擬啄木鳥](https://ebird.org/species/linbar1)，中文比較名參考 [Avibase](https://avibase.bsc-eoc.org/species.jsp?avibaseid=4EBAE9368BF0526B)。
- i=2、a=3.3、v=3.7、r=1、c=1.2、o=2.2 沿 runtime；32–35 cm 的 33.5 cm 為範圍中點非實測平均；r 缺中文語源、遷徙與要點，c 缺中文保育文案，非完整評估。
- 已目視三張 AI 圖及全卡；修喙圈後重渲及再目視。主圖腹條紋可能誇張、尾略長、喙足細節待核，兩比較鳥羽色與腳趾細節待核；非專家認證、圖不等比例。世界圖僅部分國家；驗 AVIF、分類、scores、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0301。

## 0301 黑眉擬啄木鳥交付

- 外層 [`0301.avif`](https://drive.google.com/file/d/1QiFz4wskE7WatR1JB7L-6Yf-H_9zhSjN/view)，150472 bytes、MD5 `c0a29755d0e0750b75a830863635a8a2`、SHA256 `2c198ae73de6e12e5178a733a4b998552ca947efb0d45358fefa353674244655`。精確完整查重 0；get_file 核驗 parent、MIME、bytes、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0210/029000) 體長20–22 cm、香港稀少但增加的留鳥，香港無食性觀察、無確認繁殖紀錄；中國東南部特有。[Cornell](https://ebird.org/species/chibar1) 全球 IUCN 2025 LC；比較 [五色鳥](https://ebird.org/species/taibar2)、[大擬啄木鳥](https://ebird.org/species/grebar1)。
- i=2、a=2.3、v=3.2 沿 runtime；a 棲地 tag 缺漏，食性文案主要食物缺詞；vEst 翼長103.2 mm×0.22約22.704 cm 為粗估非實測平均。r 因語源錯欄及遷徙、要點截斷，c 因「保育生物學家」誤觸受脅詞，連同 o 遮蔽不補算。
- 三圖及全卡已目視；新主圖黑前冠紅後冠可見，黃眉與臉紋、尾腳細節待核，五色鳥比較為 AI、大擬啄木鳥重用 0300；均非專家認證、不等比例。修後冠裁圈後重渲再目視。世界圖僅中國部分國家概覽；驗 AVIF、分類、scores、vEst、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0302。

## 0302 蟻鴷交付

- 外層 [`0302.avif`](https://drive.google.com/file/d/1ejsE2O7QwlCsmwMUkxsGU98gg8tsXUdP/view)，146482 bytes、MD5 `be4dd385662829eb9364b166684f88d7`、SHA256 `2a3287ffb5c773bac744a2ffb060226561ccb7d30920ef3b525bae6891df9124`。精確完整查重 0；get_file 核驗 parent、MIME、bytes、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0210/029100) 體長16–18 cm、香港秋季常見過境，冬季及春季不常見，全球趨勢下降；[Cornell](https://ebird.org/species/eurwry) 全球 IUCN 2025 LC。比較 [紅胸蟻鴷](https://ebird.org/species/runwry1)、[斑姬啄木鳥](https://avifauna.hkbws.org.hk/species/0210/029200)。
- i=2、a=2.8、c=3 沿 runtime；原體長「16.5–1 cm」導致 len=8.8 cm，v 因此遮蔽；r 因要點截斷遮蔽，o 連帶遮蔽不補算。c 根據瑞士下降及巢箱措施，不代表全球保育評估。
- 三圖及全卡已目視：主圖尾可能過長、趾序非可靠示範；紅胸比較尾較長，斑姬比較頭頂花紋與真鳥紅褐白條不符；AI 非專家認證、圖不等比例。世界圖僅部分國家；驗 AVIF、分類、scores、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0303。

## 0303 斑姬啄木鳥交付

- 外層 [`0303.avif`](https://drive.google.com/file/d/1ROHkgSzyQHuOHEJ5S5oJtoBEF78F-Buw/view)，151388 bytes、MD5 `33c18d71027234ac8e6c2396e5a47394`、SHA256 `2d2c364faeebf277f331ef26baceca7bbd57a28523f9b1482bc451237192c778`。上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0210/029200) 香港不常見但增加留鳥、全球趨勢下降；香港食性尚未研究。[Cornell](https://ebird.org/species/spepic1) 全球 IUCN 2025 LC。比較 [蟻鴷](https://ebird.org/species/eurwry) 與 [小啄木](https://ebird.org/species/gycwoo1)。
- 六分沿 runtime：i=2、a=3.3、v=2.4、r=1、c=1.2、o=2；vEst 翼長 53.4 mm ×0.22 約 11.748 cm，粗估非實測平均。r/c 缺中文輸入，非完整學術或保育評估。
- 已目視三圖、全卡、四圈及比較框；修正面紋裁切後重渲再目視。主圖尾可能過長、趾序和比較圖羽紋腳爪僅 AI 示意，非專家認證，圖不等比例。完整世界底圖僅部分原生國家；驗 AVIF、分類、scores、vEst、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0304。

## 0304 棕腹啄木鳥交付

- 外層 [`0304.avif`](https://drive.google.com/file/d/1QoUKRjPSJ1zgTLgd2Q6VmCXWcNui_bsu/view)，150741 bytes、MD5 `9eb9ffddb70b79e3e5d3e1843cb4a14c`、SHA256 `2a769bf60a27b7f497169afcc7cddbd805d4d25e903f090ed4d501f8c937be83`。上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0210/029300) 20–25 cm、香港偶見、全球趨勢下降；[Cornell](https://ebird.org/species/rubwoo1) 全球 IUCN 2025 LC、雄紅冠雌黑白冠。比較 [斑姬啄木鳥](https://ebird.org/species/spepic1) 與 [小啄木](https://ebird.org/species/gycwoo1)。
- runtime 缺 i/c，顯示待查不補分；a=3.3、v=3.1、r=1、o=2.5 沿 runtime，19–23 cm 中點 21 cm 為原輸入非實測平均；r 缺中文語源遷徙要點，非完整評估。
- 已目視三圖、全卡、四圈及比較框，主圖尾可能過長、趾序和羽紋僅 AI 示意，非專家認證；比較圖重用 0303 且不等比例。完整世界底圖僅部分原生國家，香港偶見不作原生範圍；驗 AVIF、分類、scores、缺分、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0305。

## 0305 黃嘴栗啄木鳥交付

- 外層 [`0305.avif`](https://drive.google.com/file/d/1CauKHbzTssBykmRtr1nzt_shyBu5BeI2/view)，150635 bytes、MD5 `e2aa6ea0ee3375e89dba90aa990445a6`、SHA256 `7412248342dd016df21798865bbcba5e7e3463251f13e93abc407165129d0c80`。上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0210/029500) 26–30 cm、香港不常見但增加留鳥、全球趨勢下降，本地食性未有觀察；[Cornell](https://ebird.org/species/baywoo1) 全球 IUCN 2025 LC。比較 [棕腹啄木鳥](https://ebird.org/species/rubwoo1) 和 [栗啄木鳥](https://ebird.org/species/rufwoo2)。
- 六分沿 runtime i=2、a=3.3、v=3.5、r=1、c=1.2、o=2.2；原26.5–30 cm中點約28.3 cm 非實測平均；r/c 缺中文輸入，非完整評估。
- 已目視三圖、全卡、四圈及比較框；主圖尾可能過長、喙形和趾序待核，栗啄木鳥比較圖短喙不夠明顯及尾可能過長，棕腹重用 0304 素材；AI 示意非專家認證，不等比例。完整世界圖僅部分原生國家；驗 AVIF、分類、scores、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0306。

## 0306 栗啄木鳥交付

- 外層 [`0306.avif`](https://drive.google.com/file/d/1r7pkxV4qxLc9KVOrfIgbxy90LSeBkObi/view)，143777 bytes、MD5 `cea8fd3b5b93637c0cea8b4048239563`、SHA256 `55dd7c46ebba6cae4d02a07033892726d2904f8372ea12e660a2467ba19d414d`。上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0210/029600) 21–24 cm、香港偶見、全球趨勢下降；[Cornell](https://ebird.org/species/rufwoo2) 全球 IUCN 2025 LC。比較 [黃嘴栗啄木鳥](https://ebird.org/species/baywoo1) 和 [棕腹啄木鳥](https://ebird.org/species/rubwoo1)。
- 六分沿 runtime i=2、a=3.3、v=3.4、r=1、c=1.2、o=2.2；vEst 翼長118.2 mm ×0.22 約26.004 cm，略高於 HKBWS 範圍，粗估非實測；r/c 缺中文輸入非完整評估。
- 已目視三圖、全卡、四圈及比較框；修正喙裁切重渲再目視。主圖喙可能仍偏長、尾及趾序待核，兩比較圖重用 0304/0305；AI 示意非專家認證、不等比例。完整世界圖僅部分原生國家；驗 AVIF、分類、scores、vEst、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0307。

## 0307 灰頭綠啄木鳥交付

- 外層 [`0307.avif`](https://drive.google.com/file/d/1_GKnN4_1h5BKl1OI4KMRX7tDtf3tsTlW/view)，141102 bytes、MD5 `e78be49ce1cb289d0b05d53879699d05`、SHA256 `ac94ccae1cdf667266442f7b2bdfc53b2807d590929ef46c490c45de2fa7ed93`。上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0210/029400) 香港稀少訪鳥、全球 LC 及趨勢增加；[Cornell](https://ebird.org/species/gyfwoo1) 頁無 IUCN 標籤，卡上 LC 註明依 HKBWS、不假稱 Cornell 評估。各地羽色亞種不同；比較 [黃嘴栗啄木鳥](https://ebird.org/species/baywoo1) 和 [歐洲綠啄木鳥](https://ebird.org/species/eugwoo2)。
- i=2、a=3.8、v=3.6、c=1.2 沿 runtime；vEst 翼長143.1 mm ×0.22 約31.482 cm，高於維基歐洲指名型25–26 cm，亞種可能不同，為粗估非實測。r 原中文要點截斷，r/o 遮蔽、不補算。
- 已目視三圖、全卡、四圈及比較框；修正黑頸圈重渲再目視。主圖喙尾可能過長、足趾待核，歐洲綠比較喙羽色待核，黃嘴栗重用 0305；AI 示意非專家認證、不等比例。完整世界圖僅部分原生國家；驗 AVIF、分類、scores、遮蔽、vEst、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0308。

## 0308 紅隼：未完成，續製備忘

- 本輪生圖達上限，**尚未製作阿穆爾隼及燕隼比較圖，未建立 0308 spec、未渲染、未查重或上載**。已產生並目視 `cards/art/info-restart-0308/pixel.png`，為雄型紅隼；圖的尾羽可能過長、腳爪及羽紋需核，AI 非專家認證。此素材被 Git 忽略，跨 sandbox 不保證存在；下次若檔案仍在先保留勿重生。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0220/029700) 體長27–35 cm；香港秋季常見過境、冬季不常見、春季稀少過境，全球 LC、趨勢下降。[Cornell 紅隼](https://ebird.org/species/eurkes) 頁未顯示 IUCN 值。比較資料：[阿穆爾隼](https://ebird.org/species/amufal1) 雄暗灰、栗紅大腿及橙紅眼圈蠟膜足；[燕隼](https://ebird.org/species/eurhob) 成人灰背、下體縱紋及栗紅腿羽。兩張比較圖尚未成功生成。
- runtime i=2、a=4.3、v=3.8、r=4.8、c=3、o=3.6；32–39 cm 中點35.5 cm，非實測平均。要點及遷徙描述截斷，語源欄錯置火箭命名；保育欄「不被國際自然保護聯盟列為瀕危物種」被受脅詞正則誤觸，續製時應核實並考慮遮蔽受影響 r/c/o、不補算。原食性標籤僅蛙與爬蟲，可能漏主要食物，應按已核算法判斷而非自行重算。世界底圖需另準備及核對部分原生國家。

## 0308 紅隼交付（取代上述未完成狀態）

- 外層 [`0308.avif`](https://drive.google.com/file/d/1m4TcdRZnQyoueNgSCzQvkQx5pZo2rzt0/view)，132669 bytes、MD5 `9fe0cd047bb2040a5eaf2d5e270660fe`、SHA256 `03b6520e425f82549700c938bc084485bb878c22693f99726b5c002ff6b6512a`。上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0220/029700) 27–35 cm、香港秋季常見過境，全球 LC 趨勢下降；[Cornell](https://ebird.org/species/eurkes) 當頁未顯示 IUCN，卡上註明 LC 依 HKBWS。比較 [阿穆爾隼](https://ebird.org/species/amufal1) 和 [燕隼](https://ebird.org/species/eurhob)。
- i=2、a=4.3、v=3.8 沿 runtime；35.5 cm 為原32–39 cm中點非實測，a 食性標籤缺漏，非完整評估；r 要點、遷徙截斷且語源錯置，c 無危否定句誤觸受脅詞，r/c/o 遮蔽不補算。
- 舊未交付主圖跨環境缺失，重新生成；已目視三圖、全卡、四圈及比較框，主圖尾可能過長；燕隼比較尾羽有橫斑，與 Cornell 成鳥素色尾不符；羽紋、腳爪僅 AI 示意非專家認證、不等比例。完整世界圖僅部分原生國家；驗 AVIF、分類、scores、遮蔽、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0309。

## 0309 阿穆爾隼交付

- 外層 [`0309.avif`](https://drive.google.com/file/d/1m3M1DTnU8x1vGtQkFc4I4bzyfBoBmYrU/view)，130050 bytes、MD5 `3f1c88a7788348f8662808fafef22d3e`、SHA256 `0d7b87a70b128c58dd4d4da0908a33b55dac011f946a027d081f2a1020ba1d15`；上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0220/029800) 28–30 cm、香港秋季常見過境、全球趨勢穩定；[Cornell](https://ebird.org/species/amufal1) 全球 IUCN 2025 LC；[Wikipedia](https://en.wikipedia.org/wiki/Amur_falcon) 成年雄翼尖可達尾端、遷徙及繁殖地；比較 [紅隼](https://ebird.org/species/eurkes)、[燕隼](https://ebird.org/species/eurhob)。
- i=2、a=3.8、c=1.2 沿 runtime；vEst 翼長234.2 mm ×0.22 約51.524 cm，明顯高於 28–30 cm，v 遮蔽但保留估算提示；r 遷徙及要點截斷，v/r/o 遮蔽不補算。
- 重用 0308 的三張 AI 圖，目視全卡、四圈及比較框；阿穆爾隼翼尖不及尾尖可能不準、燕隼尾有橫斑與 Cornell 成人素色尾描述不符，羽紋、趾爪僅 AI 示意、非專家認證、不等比例。完整世界圖僅部分原生國家且未區分繁殖、越冬或過境；AVIF、分類、scores、vEst、bounds、ISO3、bytes、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0310。

## 0310 燕隼交付

- 外層 [`0310.avif`](https://drive.google.com/file/d/18vMzq_syfBIygAA1-W8BvFQFROZxQ2UW/view)，138367 bytes、MD5 `bbd24bf855362dc1365966de7d1c6fc9`、SHA256 `b4c4295be585b05b6fc876ab8bb1986a8fbfaecbc0d7f3c397b30215eb72210d`；上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0220/029900) 28–36 cm，香港秋季常見過境、北新界稀少繁殖，全球趨勢下降；[Cornell](https://ebird.org/species/eurhob) 全球 IUCN 2025 LC；[Wikipedia](https://en.wikipedia.org/wiki/Eurasian_hobby) 29–36 cm、指名亞種主要越冬於非洲；比較 [紅隼](https://ebird.org/species/eurkes) 與 [阿穆爾隼](https://ebird.org/species/amufal1)。
- i=2、a=2.3、v=3.7、c=1.2 沿 runtime；32.5 cm 為原29–36 cm中點非實測。原資料無 habitat、食性標籤僅昆蟲，a 非完整評估；r 因指名亞種越冬地錯誤、要點截斷而遮蔽，o 連帶遮蔽、不補算。
- 主圖新製，重用 0308 比較圖；目視全卡、四圈與比較框，燕隼尾可能過長，翼尾比例及趾爪待核；比較鳥趾爪待核，AI 示意非專家認證、不等比例。完整世界圖僅部分原生國家且未區分繁殖、越冬或過境；AVIF、分類、scores、遮蔽、bounds、ISO3、bytes、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0311。

## 0311 遊隼交付

- 外層 [`0311.avif`](https://drive.google.com/file/d/1nZBiDEL0Cnjdl_nqV_0O9DQmUIoKsfqb/view)，135665 bytes、MD5 `cc3a6d18705d7ee259bc0252e664dba6`、SHA256 `4d48055787a003456eddb7fedf727d3d23487877203f936626b6a65a066a96c5`；上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0220/030000) 36–58 cm，香港全年出現、全球趨勢上升；[Cornell](https://ebird.org/species/perfal) 全球 IUCN 2025 LC；[Wikipedia](https://en.wikipedia.org/wiki/Peregrine_falcon) 全球分布及遷徙；比較 [燕隼](https://ebird.org/species/eurhob) 與 [紅隼](https://ebird.org/species/eurkes)。
- i=2、a=4.7、c=1.2 沿 runtime；a 食性標籤漏主要獵物鳥類，c 中文保育欄錯置食性資訊，兩者非完整評估；vEst 翼長314.7 mm ×0.22 約69.234 cm，高於 36–58 cm，v 遮蔽保留估算提示。原要點錯稱僅北極族群長距離遷徙，r 遮蔽，o 連帶遮蔽、不補算。
- 主圖新製，重用 0310 燕隼與 0308 紅隼比較圖；目視全卡、四圈與比較框，鳥體比例、翼尾及趾爪待核，AI 示意非專家認證、不等比例。完整世界圖僅部分原生國家且未區分繁殖或越冬；AVIF、分類、scores、vEst、遮蔽、bounds、ISO3、bytes、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0312。

## 0312 冠魚狗交付

- 外層 [`0312.avif`](https://drive.google.com/file/d/1jFZZ4UCFmL4GgHzoSrY4MkT6PsZjys7j/view)，149553 bytes、MD5 `b5e8a02659fb53076d4151574c056ff6`、SHA256 `a7b492adfdaad9e9108c7aa58750b9f7b0aad234613c55de377006650bf09d2a`；上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0200/028500) 38–43 cm、香港偶見稀少訪鳥曾嘗試繁殖，全球趨勢下降；[Cornell](https://ebird.org/species/crekin1) 全球 IUCN 2025 LC；[Wikipedia](https://en.wikipedia.org/wiki/Crested_kingfisher) 亞種分布；比較 [斑魚狗](https://ebird.org/species/piekin1) 與 [普通翠鳥](https://ebird.org/species/comkin1)。
- runtime 沒有此種 dexScores，六分全待查，不從 LC 補算，沒有 vEst 旗標。
- 主圖與比較圖新製，目視全卡、四圈及比較框，調整長喙裁切後重看；主鳥冠羽可能過分誇張、尾可能過長、胸帶和趾序待核，斑魚狗尾、普通翠鳥色彩與比例待核；AI 示意非專家認證、不等比例。完整世界圖僅部分原生國家；AVIF、分類、scores 缺值、bounds、ISO3、bytes、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0313。

## 0313 紅領綠鸚鵡交付

- 外層 [`0313.avif`](https://drive.google.com/file/d/1FOoLKcFBDSq-z1LK3rd9yuOyun40phMW/view)，137014 bytes、MD5 `550df8c21624e823f09f618b7eef8b4d`、SHA256 `96056b3558dcd3400ac95c8f037c37909ced77856c06c93fee5536ff87d6021d`；上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0220/030300) 全球無危、趨勢增加，香港引入族群少見且自1980年代顯著下降；[Cornell](https://ebird.org/species/rorpar) 頁未列 IUCN；[Wikipedia](https://en.wikipedia.org/wiki/Rose-ringed_parakeet) 體長37–43 cm、原生分布、部分機構改屬 Alexandrinus（runtime 仍沿 Psittacula）；比較 [亞歷山大鸚鵡](https://avifauna.hkbws.org.hk/species/0220/030200) 與 [花頭鸚鵡](https://ebird.org/species/plhpar1)，繁中名稱參 [Avibase](https://avibase.bsc-eoc.org/species.jsp?avibaseid=109000B451137457)。
- i=2、a=4.3、v=3.9 沿 runtime；40 cm 為原37–43 cm中點非實測。r 原語源錯置、要點截斷；c 受脅詞「下降」描述的是另一物種，r/c/o 遮蔽不補算。
- 三圖新製並目視全卡、四圈及比較框；比較圖先方形補邊避免長尾鳥首被切，主鳥喙、尾與趾序待核；花頭圖尾缺白端，所有 AI 圖非專家認證、不等比例。世界圖只部分原生國家；中國綠色僅依極西雲南原生紀錄，香港為引入族群，非全境；AVIF、分類、scores、遮蔽、bounds、ISO3、bytes、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0314。

## 0314 藍翅八色鶇交付

- 外層 [`0314.avif`](https://drive.google.com/file/d/1_Tkb7zVJHu1GTAi0XM5CO-8Jpk2AR8LY/view)，143001 bytes、MD5 `4930b6bed7149ad54840289ceae4deb0`、SHA256 `7ca2794091b8f6bf7b41ae33bd29d03df7dc24daf04c716c641cc2d17568ba24`；上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0220/030400) 體長18–20 cm、香港春季偶然迷鳥、全球趨勢下降；[Cornell](https://ebird.org/species/blwpit1) 全球 IUCN 2025 LC；比較 [仙八色鶇](https://ebird.org/species/faipit1) 及 [印度藍翅八色鳥](https://ebird.org/species/indpit1)，繁中名稱參 [Avibase](https://avibase.bsc-eoc.org/species.jsp?avibaseid=DE63114F)。
- i=2、c=1.2 沿 runtime，c 缺保育正文非完整評估；a 原 habitat「海拔」的「海」誤觸水邊標籤，vEst 翼長122.1 mm ×0.22 約26.862 cm 高於18–20 cm，r 原語源欄僅命名歷史且要點截斷，a/v/r/o 遮蔽不補算，仍保留 vEst 提示。
- 三圖新製並目視全卡、四圈與比較框；主鳥頭紋及腳爪待核，印度比較圖頭頂大面積黑色與 Cornell 淡頂中央黑條不符，圖為 AI 示意非專家認證、不等比例。世界圖只部分原生國家，不將香港迷鳥視為原生範圍；AVIF、分類、scores、遮蔽、vEst、bounds、ISO3、bytes、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0315。

## 0315 仙八色鶇交付

- 外層 [`0315.avif`](https://drive.google.com/file/d/10D5rc8AFtjqQ8jljOQjNGHzxieyO9xne/view)，136327 bytes、MD5 `723adeec60644a63d36cedfebc2a6333`、SHA256 `500b109c8d0d583b1b7853d60274c029a9dd733797401b0cf66d09ebdaa2d914`；上載前完整精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0220/030500) 16–20 cm、香港稀少過境且秋季較多、全球疑迅速下降；[Cornell](https://ebird.org/species/faipit1) 全球 IUCN 2025 VU；比較 [藍翅八色鶇](https://ebird.org/species/blwpit1) 和 [印度藍翅八色鳥](https://ebird.org/species/indpit1)，繁中名參 [Avibase](https://avibase.bsc-eoc.org/species.jsp?avibaseid=DE63114F)。
- i=3.8、a=5、c=4 沿 runtime；vEst 翼長121.4 mm ×0.22 約26.708 cm 高於 16–20 cm、原觀賞分遮蔽但保留估算提示；r 因原要點截斷遮蔽，o 連帶遮蔽，不補算。
- 主圖新製，重用 0314 主圖和印度比較圖，目視全卡、四圈與比較框；主鳥頭比例和足趾待核，印度比較圖頭頂大面積黑色與 Cornell 淡頂中央黑條不符，AI 圖非專家認證、不等比例。世界圖只部分原生繁殖／越冬國家；AVIF、分類、scores、遮蔽、vEst、bounds、ISO3、bytes、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0316。

## 0316 灰喉山椒鳥交付

- 外層 [`0316.avif`](https://drive.google.com/file/d/1Im8I-EOgU9ml_H_zG8vkTHsQTKA7Y_lW/view)，135233 bytes、MD5 `8a106bd59749efb6017e066d80c511bb`、SHA256 `a6f344dc7caa43c7aaab9245c1a5fddc38a0f277368e2300df552dd2b95873d0`；上載前精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0230/030700) 18 cm、香港冬季常見夏季稀少至不常見，全球 LC 趨勢穩定；[Wikipedia](https://en.wikipedia.org/wiki/Grey-chinned_minivet) 17–19 cm 及亞種範圍，南部亞種有分類分歧；[Cornell](https://ebird.org/species/gycmin1) 辨識；比較 [赤紅](https://ebird.org/species/scamin1) 與 [長尾山椒鳥](https://ebird.org/species/lotmin1)。
- i=2、v=3、r=1、c=1.2 沿 runtime；v 的 18 cm 為原 17–19 cm 中點，r/c 缺中文輸入而非完整評估。英文食性欄錯置羽色、昆蟲未入標籤（另參[食性來源](https://indianbirds.thedynamicnature.com/2018/05/grey-chinned-minivet-pericrocotus-solaris.html)），a/o 遮蔽不補算。
- 主圖及比較圖新製並目視全卡、四圈與比較框；灰喉翼斑形狀、鳥趾與比例待核；長尾比較圖尾極長且分叉、翼斑未準確示範。AI 示意非專家認證、不等比例。世界圖只部分原生國家；AVIF、分類、scores、遮蔽、bounds、ISO3、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0317。

## 0317 赤紅山椒鳥交付

- 外層 [`0317.avif`](https://drive.google.com/file/d/1UczBOBvapKUzj7iK0-c9XHSwnJ23M77M/view)，140482 bytes、MD5 `a4738c95f3814a23bf3de5ed5123087d`、SHA256 `afc31d1cfafb2df8dd79f67962a81f2930212cadd24d002bb15c3f88aa83d5a5`；上載前精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0230/030800) 17–22 cm、香港常見留鳥、全球 LC 趨勢下降；[Cornell](https://ebird.org/species/scamin1) 各地羽色及分類差異；比較 [灰喉](https://ebird.org/species/gycmin1) 及 [長尾山椒鳥](https://ebird.org/species/lotmin1)。
- i=2、v=3.1、c=1.2 沿 runtime；v 的21 cm 為原 20–22 cm 中點，c 缺中文保育輸入非完整評估。原英文食性提昆蟲但 explorer 食性標籤為空，a 遮蔽；原要點截斷，r 和 o 遮蔽、不補算。
- 主圖新製，重用 0316 主圖及長尾比較圖；目視全卡、四圈與比較框，喉紅可能延至過高，翼斑及趾待核；長尾比較圖尾極長且分叉、翼斑未準確示範。AI 示意非專家認證、不等比例。世界圖只部分原生國家；AVIF、分類、scores、遮蔽、bounds、ISO3、hash、標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0318。

## 0318 琉球山椒鳥交付

- 外層 [`0318.avif`](https://drive.google.com/file/d/17IfgMRSAdIJzri3yWOy4fU9AKVpQIsQ9/view)，131636 bytes、MD5 `99c4ea630372a211996e67eb03062f9d`、SHA256 `21ec5934415ffcd0e797970bd047d4ac2a529e2c8720c97a94c81a8326f42a5e`；上載前精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0230/031000) 18–21 cm、香港偶然迷鳥，全球 LC 趨勢上升；[Cornell](https://ebird.org/species/ryumin1) 全球 IUCN 2025 LC；[Wikipedia](https://en.wikipedia.org/wiki/Ryukyu_minivet) 日本分布和曾被列為灰山椒鳥亞種的分類歷史。比較 [灰山椒鳥](https://ebird.org/species/ashmin1) 及 [小灰山椒鳥](https://www.shanghaibirding.com/birds-of-china/swinhoes-minivet/)。
- 六分沿 runtime：i=2、a=2.3、v=3、r=1、c=1.2、o=1.9；vEst 翼長 86 mm ×0.22 約18.92 cm，在資料範圍內，為粗估非實測。a 缺食性資料，r/c 缺中文輸入而非完整評估。
- 三圖已目視並核對全卡、四圈和比較框；調整胸側圈後重渲再看。主鳥白眉可能過長，胸側、尾與足趾待核；小灰比較圖腰色比例待核。AI 示意非專家認證、不等比例。日本以外零星紀錄不據此當原生地，世界圖只列日本部分國家概覽、綠色非全境；驗 AVIF、分類、scores、vEst、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0319。

## 0319 灰山椒鳥交付

- 外層 [`0319.avif`](https://drive.google.com/file/d/105CNT0KaaKUyUugS8qLrcmKpr-SHLMOy/view)，137736 bytes、MD5 `1a7f613735c941e2ded2838367df0476`、SHA256 `c13334d023a60eeb111747b9a0fb2344e4fa62222c781ce20587a7e54119a9e9`；上載前精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0230/030900) 18–21 cm、香港春不常見秋稀少過境、冬罕見，全球 LC 趨勢下降；[Cornell](https://ebird.org/species/ashmin1) 外貌、棲地；比較 [琉球山椒鳥](https://avifauna.hkbws.org.hk/species/0230/031000) 及 [小灰山椒鳥](https://www.shanghaibirding.com/birds-of-china/swinhoes-minivet/)。
- runtime 無 i/c，待查不從 LC 補算；a=3.3、v=3.2、r=1、o=2.5 沿 runtime，r 缺中文輸入非完整評估；vEst 翼長95.7 mm ×0.22 約21.054 cm，略高於資料上界21 cm，屬粗估非精密體長實測。
- 主圖新製，重用 0318 主圖及小灰比較圖；目視全卡、四圈和比較框，主鳥額白範圍、尾與足趾待核；琉球白眉可能過長、小灰腰色及比例待核。AI 示意非專家認證、不等比例。世界圖只部分繁殖／越冬國家、綠色非全境；驗 AVIF、分類、scores、缺分、vEst、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0320。

## 0320 小灰山椒鳥交付

- 外層 [`0320.avif`](https://drive.google.com/file/d/1k-vyJ8HW617wFxAeT9lnFcizh3sP6Wr0/view)，136212 bytes、MD5 `93de1e170ee347176f9e45ca9f2d952f`、SHA256 `ed2a68f85020ca7b200ca0ae2fb6c2a1b756ba2ce3f8a4b31e18833590a54e5e`；上載前精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0230/031100) 18–19 cm、香港稀少過境，全球 LC 趨勢下降；[Cornell](https://ebird.org/species/brrmin1) 全球 IUCN 2025 LC；比較 [灰山椒鳥](https://ebird.org/species/ashmin1) 及 [粉紅山椒鳥](https://ebird.org/species/rosmin1)。
- 六分沿 runtime：i=2、a=2.8、v=3.1、r=2.5、c=1.2、o=2.3；vEst 翼長88.4 mm×0.22約19.448 cm，略超18–19 cm，是粗估非實測；a 缺食性資料、c 缺中文保育正文，非完整評估。
- 主圖重用 0318 比較圖，灰比較圖重用 0319 主圖、粉紅比較圖新製；目視全卡、四圈及比較框。小灰圖背部較棕、可能比來源雄鳥灰背暖，眼紋、腰色及足趾待核；粉紅圖眼後深色範圍及翼斑待核。AI 示意非專家認證、不等比例。世界圖部分繁殖／越冬國家，綠色非全境；驗 AVIF、分類、scores、vEst、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0321。

## 0321 粉紅山椒鳥交付

- 外層 [`0321.avif`](https://drive.google.com/file/d/177MYtGJiEb_Rg0E2xu0z3wCXTdk3e2K0/view)，136053 bytes、MD5 `06fd31be51e6e656e374e23dc379b56f`、SHA256 `d6e9c3fd55f9aa343c4f1dfe834e81fdc85a086a48b469b6ed71d8e427eeecae`；上載前精確查重 0，get_file 核驗 parent、名稱、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0230/031200) 18–20 cm、香港偶然迷鳥、全球 LC 趨勢下降；[Cornell](https://ebird.org/species/rosmin1) 全球 IUCN 2025 LC；[Wikipedia](https://en.wikipedia.org/wiki/Rosy_minivet) 國家分布（無來源食性敘述不採用）；比較 [灰喉](https://ebird.org/species/gycmin1) 與 [小灰山椒鳥](https://ebird.org/species/brrmin1)。
- 六分沿 runtime：i=2、a=2.8、v=3、r=1、c=1.2、o=2；vEst 翼長87.9 mm×0.22約19.338 cm，在18–20 cm內，是粗估非實測；a 缺食性標籤，r/c 缺中文資料，非完整評估。
- 主圖新製，重用 0316 灰喉及 0318 小灰圖；目視全卡、四圈及比較框。主鳥眼後深色範圍可能過大，翼斑形狀、尾和趾待核；小灰圖背色偏棕。AI 示意非專家認證、不等比例。世界圖只部分原生國家，香港偶然紀錄不當原生範圍；驗 AVIF、分類、scores、vEst、bounds、ISO3、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0322。

## 0322 暗灰鵑鵙交付

- 外層 [`0322.avif`](https://drive.google.com/file/d/1QrsHUDkMGNKYTLMBAAr9gd-oq-Wrdfj1/view)，134857 bytes、MD5 `83a952bd540400598c7409cd8737343a`、SHA256 `39b7f8f9652b7fc553146b21eab42506a32605c8dabc50285a2d087b369f29ae`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0230/031400) 體長 20–24 cm，全球 LC 趨勢下降；頁首描述香港稀少但 occurrence 內文稱常見，頻率相互矛盾，未作單一結論。[Cornell](https://ebird.org/species/bkwcus1) 全球 IUCN 2025 LC；比較 [大鵑鵙](https://avifauna.hkbws.org.hk/species/0250/031300) 及 [灰卷尾](https://avifauna.hkbws.org.hk/species/0250/032700)。
- i=2、a=3.3 沿 runtime；vEst 翼長117.9 mm×0.22 約25.938 cm，高於 20–24 cm，v 遮蔽但保留估算提示；r 原要點含錯置圖片說明及截斷，c 原保育文字錯置地名「保護區」誤觸受脅詞，r/c/o 遮蔽，不補算。
- 三圖新製，目視全卡、四圈及比較框；主鳥白尾端位置、臉罩與足趾待核，灰卷尾比較圖尾叉長度待核。AI 示意非專家認證、不等比例。世界圖僅部分繁殖／越冬國家且綠色非全境；驗 AVIF、分類、分數、vEst、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0323。

## 0323 白腹鳳鶥交付

- 外層 [`0323.avif`](https://drive.google.com/file/d/1lamBGvL5TFlKJveAVgGuCssyRAIrgw43/view)，132979 bytes、MD5 `9e8bc288e556d0f11c10e490247f23c1`、SHA256 `4b18e66f00170dcf74b419064fed318810d0e8592364e5dcdb605c052aaca4a6`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0250/032200) 11–13 cm，香港稀少且分布局限的森林留鳥，全球 LC 趨勢未知；[Cornell](https://ebird.org/species/whbyuh1) IUCN 2025 LC；比較 [暗綠繡眼鳥](https://ebird.org/species/jaweye) 與 [冠羽畫眉](https://ebird.org/species/taiyuh1?siteLanguage=zh)（台灣特有，非香港鳥）。
- i=2、a=3.3、r=1.8 沿 runtime；vEst 翼長66.4 mm×0.22 約14.608 cm，高於 11–13 cm，v 遮蔽但保留估算提示；原保育文字中的「國際自然保護聯盟」誤觸受脅詞，c 遮蔽，o 連帶遮蔽、不補算。a 僅基於現有標籤而非完整生態評估。
- 三圖新製，目視全卡、四圈及比較框；主鳥冠羽可能太高及偏黃，足趾待核；冠羽畫眉比較圖未顯示資料提及的白色冠緣。AI 示意非專家認證、不等比例。世界圖僅部分原生國家且綠色非全境；驗 AVIF、分類、分數、vEst、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0324。

## 0324 黑枕黃鸝交付

- 外層 [`0324.avif`](https://drive.google.com/file/d/1Gr56BcrjZ_3WvbXZvGyqqE1DIKKA8bN2/view)，135615 bytes、MD5 `3e36c116bfc42029cb580a06c7f1da60`、SHA256 `1d3dd0fa6faa1061d2aa853cf0fc86c8fc5553f9674155d577d77e3903659cb8`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0250/032400) 體長 23–28 cm、香港稀少過境及罕見冬訪、最後確證繁殖2003；全球 LC 趨勢下降。台灣地方保育狀況不能混同全球評估。[Cornell](https://ebird.org/species/blnori1) 外貌；比較 [黃鸝](https://ebird.org/species/eugori2) 及 [黑頭黃鸝](https://ebird.org/species/blhori1)。
- i=2、c=3 沿 runtime；c 原輸入為台灣地方歷史狀況，並非全球評估或當前數量。中文食性欄錯置行為且食物標籤空缺，a 待查；vEst 翼長150.9 mm×0.22 約33.198 cm，高於 23–28 cm，v 遮蔽但保留估算提示；r 語源欄錯置遷徙資料且要點截斷，r/o 遮蔽、不補算。
- 三圖新製並目視，調整特徵裁切後再核對全卡、四圈及比較框；主圖黑枕連接處側面未完整示範，翼尾斑及足趾待核，AI 示意非專家認證、不等比例。世界圖只列部分原生繁殖／越冬國家，不分季節及亞種；驗 AVIF、分類、分數、vEst、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0325。

## 0325 灰燕鵙交付

- 外層 [`0325.avif`](https://drive.google.com/file/d/1Kjm-KZH2qGijtLNejvfGGw4CZA2ddYRj/view)，129466 bytes、MD5 `8c61d651f8f251e2987b9e9ad0b41d20`、SHA256 `c7b31bd566c1769288576d551ed40955c11b3b2c53819703e800db20fe1f4501`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0230/030600) 香港偶然迷鳥，文內唯一紀錄為2011年；全球 LC 趨勢穩定。[BirdForum](https://www.birdforum.net/opus/Ashy_Woodswallow) 19 cm、[Birds of India](https://indianbirds.thedynamicnature.com/2017/08/ashy-woodswallow-artamus-fuscus.html) 20 cm 及分布；比較 [白胸燕鵙](https://ebird.org/species/whbwoo4) 及 [家燕](https://ebird.org/species/barswa)。
- runtime 無 dexScores 記錄，六分全部待查，不從 LC 等補算。
- 三圖新製；首張主圖折翼未伸過尾端，改用修正版，調整眼先裁切並重新目視全卡、四圈及比較框。修正版尾端白色缺失、喙可能過長及彎，翼尾與足趾待核；白胸比較圖頭胸交界及家燕尾比例待核。AI 示意非專家認證、不等比例。世界圖只列部分原生國家，香港偶然紀錄不當原生依據；驗 AVIF、分類、缺分、bounds、ISO3、bytes、hash，標籤測試 5/5、diff check 通過；未動 R2 或 runtime。下一張 0326。

## 0326 鵲色鸝交付

- 外層 [`0326.avif`](https://drive.google.com/file/d/1G5OQBoUCr1d2r8HJ1rpn_ajYIEzzPtWX/view)，134776 bytes、MD5 `5a35356c67262d574bcbe290788ba68b`、SHA256 `6fd9f9a86a658419484b04e2c6bc73249604096cf0cc67f5a8ba1f116d3a7c9e`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0250/032300) 28 cm、香港2018年偶然紀錄、全球 EN 趨勢下降；其行為食性「無觀察」不代表沒有鳥類紀錄。[Cornell](https://ebird.org/species/silori1) IUCN 2025 EN；比較 [栗色黃鸝](https://ebird.org/species/marori2) 及 [黑枕黃鸝](https://ebird.org/species/blnori1)。
- i=4.4、r=1、c=2.5 沿 runtime；r/c 缺中文輸入、非完整評估。獨立來源支持 EN，未因原來源內部矛盾自行重算。食性欄錯置棲地而標籤為空，a 待查；vEst 翼長144.8 mm×0.22 約31.856 cm，高於28 cm，v 遮蔽但保留估算提示；o 連帶遮蔽、不補算。
- 主圖及栗色比較圖新製，重用0324黑枕主圖；另試修正主圖仍有白肩且未採用。目視全卡、四圈及比較框；鵲色主圖白色肩羽延伸翼上緣，與來源黑翼覆羽未完全一致，尾與足趾待核；黑枕側面未完整示範黑枕連接。AI 圖非專家認證、不等比例。世界圖只列 HKBWS 部分繁殖／越冬國家，綠色非全境；AVIF、分類、scores、vEst、bounds、ISO3、bytes/hash、標籤測試5/5及 diff check 通過；未動 R2 或 runtime。下一張 0327。

## 0327 黑卷尾交付

- 外層 [`0327.avif`](https://drive.google.com/file/d/1QYrGYVJZatWV0zSeqKNJNBLD3O9qsWgW/view)，131235 bytes、MD5 `207790ec0d1c973ea0e0f232b516a752`、SHA256 `1f270f7068a81f6750729ec8328cc0ddf80a08c3bb80ef0d17ebb7b9f592c35f`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0250/032800) 30–31 cm、香港常見夏候及過境、少量冬候，全球 LC 趨勢未知；[Cornell](https://ebird.org/species/bladro1) IUCN 2025 LC；[Thai National Parks](https://www.thainationalparks.com/species/black-drongo) 另記28 cm，與香港來源有差異。比較 [灰卷尾](https://avifauna.hkbws.org.hk/species/0250/032700) 及 [髮冠卷尾](https://avifauna.hkbws.org.hk/species/0250/032600)。
- i=2、v=3.5 沿 runtime，v 用原有28 cm 而非實測；食性「蜜蜂」的「蜜」誤觸花蜜標籤，a 遮蔽；語源錯置亞種、要點截斷及誤名，r 遮蔽；保育受脅詞「下降」指其他鳥類且缺物種名，c 遮蔽；o 連帶遮蔽、不補算。
- 主圖及髮冠比較圖新製，重用0322灰卷尾比較圖；調整裁切和標籤後再次目視全卡、四圈及比較框。主圖尾叉看似偏長、足趾待核；灰卷尾尾叉長度、髮冠尾形與趾待核。AI 示意非專家認證、不等比例。世界圖只部分原生國家、綠色非全境，關島及北馬里亞納為引入未當原生地；驗 AVIF、分類、scores、bounds、ISO3、bytes/hash，標籤測試5/5及 diff check 通過；未動 R2 或 runtime。下一張 0328。

## 0328 灰卷尾交付

- 外層 [`0328.avif`](https://drive.google.com/file/d/1lDfJWrVWGAtdI-DFQ4PZ6QSIyYnFdK9Q/view)，132653 bytes、MD5 `b5ca7d230ee4dde5fb504a614c912ffc`、SHA256 `c96e8268c24488900e91b5b09c7acaba09b4e9e2b01949ad520d36b92f70cf90`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0250/032700) 23–30 cm、全球 LC 趨勢未知；香港頁首稱不常見冬候而 occurrence 段稱稀少，頻率文字有別。眼斑及羽色隨亞種變化；[Cornell](https://ebird.org/species/ashdro1) IUCN 2025 LC。比較 [黑卷尾](https://avifauna.hkbws.org.hk/species/0250/032800) 和 [鴉嘴卷尾](https://avifauna.hkbws.org.hk/species/0250/032500)。
- i=2、a=2.8、v=3.6、c=1.2 沿 runtime；vEst 翼長134.8 mm×0.22≈29.656 cm，為粗估非實測，c 缺中文保育正文非完整評估。原遷徙欄截斷，語源欄錯置亞種且缺命名人，r/o 遮蔽不補算。
- 主圖重用0322比較圖、黑卷尾重用0327主圖、鴉嘴為0329新圖；調整裁切後目視全卡及比較框。灰鳥尾叉可能偏長、亞種比例待核；鴉嘴圖尾端未清楚示範淺叉、足趾待核。AI 圖非專家認證、不等比例。世界圖僅部分原生國家、綠色非全境；核驗 AVIF、分類、scores、vEst、bounds、ISO3、bytes/hash、標籤測試5/5及 diff check 通過；未動 R2 或 runtime。下一張 0329。

## 0329 鴉嘴卷尾交付

- 外層 [`0329.avif`](https://drive.google.com/file/d/1XbMWh0AL-LcbIiGxfqzcx7m81T6KVMFk/view)，136835 bytes、MD5 `181e7f30106b75ba53aad968852c63d8`、SHA256 `158df336bd4291a369a291a61cf492e639987ae4ff6e11bb24bd2ccc78b0ef64`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0250/032500) 27–32 cm、香港2014年偶然紀錄，全球 LC 趨勢未知，粗喙、淺叉長尾、成鳥深紅眼；[Bird Society of Singapore](https://singaporebirds.com/species/crow-billed-drongo/) 描述淺叉尾及與黑卷尾比較。香港行為食性無觀察不等於沒有紀錄。另比較 [灰卷尾](https://avifauna.hkbws.org.hk/species/0250/032700)。
- runtime 無 i/c，待查且不從 LC 補算；a=3.3、v=3.6、r=1、o=2.6 沿 runtime；vEst 翼長143.2 mm×0.22≈31.504 cm，在參考範圍內但為粗估非實測；r 缺中文輸入，a 僅反映已有標籤。
- 主圖新製，黑與灰比較分別重用0327主圖與0322比較圖；調整裁切後目視全卡、四圈及比較框。主圖尾端看似圓平、未清楚示範淺叉，足趾待核；黑及灰圖尾叉看似偏長。AI 示意非專家認證、不等比例。世界圖僅部分原生繁殖／越冬國家，不以香港迷鳥當原生依據，綠色非全境；驗 AVIF、分類、缺分、scores、vEst、bounds、ISO3、bytes/hash、標籤測試5/5及 diff check 通過；未動 R2 或 runtime。下一張 0330。

## 0330 髮冠卷尾交付

- 外層 [`0330.avif`](https://drive.google.com/file/d/1flFVXPAEBqh9DOmXg2t_ES2Im1OzC9Wt/view)，136675 bytes、MD5 `a7c5c98997b4793c3afcc7172e43c521`、SHA256 `61e71f17d9c64b634bc1b10501a1e5eafb9f631b0ace02adb5ea167e216e80b7`；上載前精確查重 0，get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [HKBWS](https://avifauna.hkbws.org.hk/species/0250/032600) 28–32 cm、香港全年有紀錄、秋季過境較多，全球 LC 趨勢未知；其亞種欄使用 D. t. brevirostris，runtime 保持 D. hottentottus，地圖只列香港亞種部分國家。[Cornell](https://ebird.org/species/hacdro1) IUCN 2025 LC、昆蟲與花蜜；比較 [黑卷尾](https://avifauna.hkbws.org.hk/species/0250/032800) 和 [鴉嘴卷尾](https://avifauna.hkbws.org.hk/species/0250/032500)。
- i=2、c=1.2 沿 runtime，c 缺中文保育正文非完整評估。原棲地錯置、食性缺昆蟲標籤，a 遮蔽；vEst 翼長152.8 mm×0.22≈33.616 cm 超過28–32 cm，v 遮蔽但保留估算提示；遷徙截斷及語源只記命名歷史，r/o 遮蔽不補算。
- 主圖重用0327髮冠比較圖，黑比較重用0327主圖，鴉嘴比較為0329新圖；調整裁切後目視全卡、四圈及比較框。髮冠圖外尾羽上翹但可能誇張、冠羽與足趾待核；黑尾叉偏長，鴉嘴尾端未示範清晰淺叉。AI 示意非專家認證、不等比例。世界圖僅部分原生國家，綠色非全境；驗 AVIF、分類、scores、vEst、bounds、ISO3、bytes/hash、標籤測試5/5及 diff check 通過；未動 R2 或 runtime。下一張 0331。

## 0331 黑枕王鶲交付

- 外層 [`0331.avif`](https://drive.google.com/file/d/1EdTcqcvhMrCG34SGKi3htncwv9KmIEHI/view)，139334 bytes、MD5 `bc158f8aa37ba023a4ac572a1a90909d`、SHA256 `3355110f8ab35db2416951de4b127ef329c66cfcef3df1ca0607ee52871395ad`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0250/032900)；[2](https://ebird.org/species/blnmon1)；[3](https://avifauna.hkbws.org.hk/species/0250/033100)；[4](https://avifauna.hkbws.org.hk/species/0250/033000)；[5](https://indianbirds.thedynamicnature.com/2018/04/black-naped-monarch-hypothymis-azurea.html)。
- HKBWS 15–17 cm、香港不常見冬候及過境，全球 LC 趨勢穩定；雄鳥黑枕及胸帶、雌鳥灰棕翼背。
- i=2、a=2.8、v=2.8 沿 runtime，vEst 翼長69.8 mm×0.22≈15.356 cm，在參考範圍內是粗估非實測；要點截斷，r 待查；保育欄錯置巢抗菌資料且「保護」誤觸受脅詞，c/o 待查不補算。
- 主圖新製；黑枕羽束似乎偏大、尾羽偏長、腳趾待核。比較圖為另兩卡新製雄鳥，長尾比例和冠形待核，AI 示意不等比例、非專家認證。
- 世界圖僅部分原生國家，綠色非全境；不因單一記錄把伊朗列為常規原生分布。
- 全卡、四圈及比較圖目視；0332 第三圈裁切由腹部改對胸羽後再次目視。核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、bounds、ISO3、bytes/hash、標籤測試5/5及 diff check；未動 R2 或 runtime。

## 0332 紫綬帶交付

- 外層 [`0332.avif`](https://drive.google.com/file/d/1LjhTHCQlPCmlPhFOrYV1NDvUchd4L4Aw/view)，128001 bytes、MD5 `ff0337b4da676977015406f251eabbc1`、SHA256 `0a98ed8bb4a699e69907d2cc4e93f0d45f9b77aa6b2faac4bf67f5402d2caadf`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0250/033100)；[2](https://ebird.org/species/japfly1)；[3](https://avifauna.hkbws.org.hk/species/0250/032900)；[4](https://avifauna.hkbws.org.hk/species/0250/033000)。
- HKBWS 雄18.5–20 cm、雌17–18 cm（繁殖雄長尾另延伸）；香港不常見春秋過境；HKBWS 全球 LC 趨勢穩定，Cornell IUCN 2025 LC。
- runtime a/v 缺分，待查不補算；原 i/c 採舊 NT，與 HKBWS 和 Cornell 2025 LC 不同，兩分遮蔽不重算；原研究重點截斷故 r 待查，o 連帶待查。全球評估與局部繁殖族群歷史下降不能混同。
- 三種圖均為本批新製，紫綬帶冠看似過高、尾飾較細；綬帶的長尾與冠比例、王鶲枕羽和尾比例待核。AI 示意不等比例、非專家認證。
- 只標部分繁殖、遷徙及越冬國家，不分季節／亞種；綠色非全境。
- 全卡、四圈及比較圖目視；0332 第三圈裁切由腹部改對胸羽後再次目視。核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、bounds、ISO3、bytes/hash、標籤測試5/5及 diff check；未動 R2 或 runtime。

## 0333 綬帶交付

- 外層 [`0333.avif`](https://drive.google.com/file/d/1KQj3aJDw018c1NYxnMgu8xtzf8KpA1GB/view)，130449 bytes、MD5 `4680030448254b310adc0e523f775435`、SHA256 `90e0766bedec13fb6c839b364e66aa91440ecec854e2b3364ca90acd8357da86`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0250/033000)；[2](https://ebird.org/species/amupaf1)；[3](https://avifauna.hkbws.org.hk/species/0250/032900)；[4](https://avifauna.hkbws.org.hk/species/0250/033100)。
- HKBWS 雄20–22 cm、雌17.5–21 cm；繁殖雄延長尾羽另可伸出30 cm。香港秋季過境較常見、春季稀少至常見，冬季罕見；全球 LC 趨勢穩定。白色型雄鳥亦存在。
- a 在 runtime 缺分不補算；i=2、v=3.1、r=2.5、c=1.2、o=2.2 沿 runtime。vEst 翼長91.3 mm×0.22≈20.086 cm 在 HKBWS 雄體長範圍內，非實測；c 缺中文保育正文。
- 三種圖均本批新製；綬帶示栗色型雄鳥，冠及長尾可能偏誇張、胸部過斑及腳趾待核；紫綬帶冠偏高、尾飾較細，王鶲黑枕及尾比例待核。AI 示意不等比例、非專家認證。
- 僅部分繁殖／越冬國家，不分季節；綠色非全境。
- 全卡、四圈及比較圖目視；0332 第三圈裁切由腹部改對胸羽後再次目視。核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、bounds、ISO3、bytes/hash、標籤測試5/5及 diff check；未動 R2 或 runtime。

下一張 0334。

## 0334 虎紋伯勞交付

- 外層 [`0334.avif`](https://drive.google.com/file/d/1fMpZdjyMz4juuML5FOo-WBSSlpAJ5vDr/view)，134030 bytes、MD5 `c27960ce89876264de0db68cc7944f34`、SHA256 `bb363a3e90c04e0aa4364a8340af967ae2b717c71b89586b0765a2c08be24ad3`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0240/031500)；[2](https://ebird.org/species/tigshr1)；[3](https://avifauna.hkbws.org.hk/species/0240/031600)；[4](https://avifauna.hkbws.org.hk/species/0240/031800)。
- HKBWS 體長17–19 cm、香港罕見早秋過境及單一春季紀錄，全球 LC 趨勢下降；幾乎所有香港紀錄為第一年鳥，本圖示雄成鳥。Cornell 全球 IUCN 2025 LC。
- 顯示 i=2、a=3.3、v=3；a 基於現有林地農田與昆蟲標籤，非完整生態評估。vEst 由翼長82.4 mm×0.22≈18.128 cm，屬粗估非實測；原要點有截斷、保育「不被認為面臨威脅」誤觸關鍵詞，r/c/o 遮蔽不補算。
- 主圖與兩比較圖均本批新製；虎紋圖頭罩、斑紋、尾比例及足趾須專家核實；比較牛頭圖白翼斑位置和紅背圖白尾緣比例待核。AI 示意不等比例。
- 世界底圖僅選 HKBWS 所述部分原生繁殖及非繁殖國家；不分季節，綠色非全境。
- 全卡、四圈及比較圖目視，調整特徵裁切後重渲染及再目視；核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、世界 bounds、ISO3、bytes/hash，標籤測試5/5、diff check 通過；未動 R2 或 runtime。

## 0335 牛頭伯勞交付

- 外層 [`0335.avif`](https://drive.google.com/file/d/1r-RHHZVpkKa3YKPEQCWGRN5JaW8Pe22k/view)，133901 bytes、MD5 `3c1c3df7c681cceb5e5cc7840fef85a6`、SHA256 `9e75f78b643615b3f2c5d38253c06f3b5b3c39b5647d9e333e31a1d5e140e8e7`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0240/031600)；[2](https://ebird.org/species/buhshr1)；[3](https://avifauna.hkbws.org.hk/species/0240/031500)；[4](https://avifauna.hkbws.org.hk/species/0240/031800)。
- HKBWS 19–20 cm；頁首稱香港罕見過境及冬訪，occurrence 稱 scarce，頻率用語有別。全球 LC 趨勢下降，Cornell IUCN 2025 LC。
- 僅 i=2 沿 runtime；中文食性爬蟲類未被標籤規則匹配，a 遮蔽；vEst 翼長84.1 mm×0.22≈18.502 cm，低於19–20 cm，v 遮蔽並保留估算提示；遷徙與要點截斷、保育欄錯置遷徙致「減少」誤觸，r/c/o 遮蔽不補算。
- 主圖及比較圖本批新製，雄鳥白斑位置、黑面罩與足趾待核，虎紋圖尾比例、紅背白尾緣比例亦待核；AI 示意不等比例、非專家認證。
- 僅標 HKBWS 部分繁殖及非繁殖國家，不分季節，綠色非全境。
- 全卡、四圈及比較圖目視，調整特徵裁切後重渲染及再目視；核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、世界 bounds、ISO3、bytes/hash，標籤測試5/5、diff check 通過；未動 R2 或 runtime。

## 0336 紅背伯勞交付

- 外層 [`0336.avif`](https://drive.google.com/file/d/1xtaL7MjCjpv3M0NdoSnu5wZCt05VCfrt/view)，128768 bytes、MD5 `30b422a920b34228ea301c257eaf7521`、SHA256 `deb8f6c174b72e39cbfe8ecf1362c3bf33e606ca57961d045b313275d8761f82`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0240/031800)；[2](https://ebird.org/species/rebshr1)；[3](https://avifauna.hkbws.org.hk/species/0240/031500)；[4](https://avifauna.hkbws.org.hk/species/0240/031600)；[5](https://datazone.birdlife.org/species/factsheet/red-backed-shrike-lanius-collurio)；[6](https://www.oiseaux.net/birds/red-backed.shrike.html)。
- HKBWS 體長17–19 cm，香港屬偶然迷鳥；當地紀錄均為第一年鳥，本圖為雄成鳥。BirdLife 2024 全球 LC、趨勢穩定。
- 顯示 i=2、v=2.9、c=1.2 沿 runtime；v 由原有16–18 cm 中值17 cm，非實測；c 缺中文保育正文。a 因中文食性棲地缺失、英文標籤漏小鳥且棲地標籤空而待查；r 因遷徙文案把中東列越冬區，與來源主要越冬區及過境描述有差異，連同 o 遮蔽不補算。
- HKBWS 提及繁殖範圍達中國西北，BirdLife 國別表將中國列迷鳥，為避免無法解決的分類／分布差異，圖不標中國；地圖為部分原生國家不分季節。
- 主圖及比較圖本批新製；紅背圖白色沿尾羽全長但參考僅載尾側基部有白色，尾與足趾待核；虎紋尾比例、牛頭白翼斑位置待核。AI 圖示非專家認證、不等比例。
- 全卡、四圈及比較圖目視，調整特徵裁切後重渲染及再目視；核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、世界 bounds、ISO3、bytes/hash，標籤測試5/5、diff check 通過；未動 R2 或 runtime。

下一張 0337。

## 0337 紅尾伯勞交付

- 外層 [`0337.avif`](https://drive.google.com/file/d/1W34cDfmZtjV5WnFiKcL06HuitbHz4M-f/view)，133504 bytes、MD5 `c9addff1e3792663a937a65c1a62116b`、SHA256 `4edf47ae102391bcbe480b1151ee6bcb12214e72cbe79fccce1967dd4877cd6d`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0240/031700)；[2](https://ebird.org/species/brnshr)；[3](https://avifauna.hkbws.org.hk/species/0240/031900)；[4](https://avifauna.hkbws.org.hk/species/0240/032000)；[5](https://datazone.birdlife.org/species/factsheet/brown-shrike-lanius-cristatus)。
- HKBWS 17–20 cm，香港春季常見過境、秋季較少、冬季罕見至稀少（頁首 rare、occurrence scarce）；全球 LC，BirdLife 2024 趨勢下降。亞種羽色有變，圖不指定亞種或性別。
- 顯示 i=2、v=3、c=1.2 沿 runtime，c 無中文保育正文、不是完整評估；vEst 翼長85 mm×0.22≈18.7 cm，為粗估非實測；棲地欄錯置外貌而缺棲地標籤，a 待查；要點含截斷，r/o 遮蔽不補算。
- 主圖及本批比較圖新製；紅尾示棕色型，胸部橫紋、尾長及腳趾待核；棕背白翼斑位置、灰背面罩及足趾待核。AI 示意非專家認證、不等比例。
- 地圖僅 BirdLife 部分原生繁殖及非繁殖國家，不分季節／亞種；綠色非全境。
- 全卡、四圈及比較圖目視，調整特徵裁切後重渲染及再目視；核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、世界 bounds、ISO3、bytes/hash，標籤測試5/5、diff check 通過；未動 R2 或 runtime。

## 0338 棕背伯勞交付

- 外層 [`0338.avif`](https://drive.google.com/file/d/10fy2wN94BGUcs6_yowqHl8YkCUW9E4P3/view)，136888 bytes、MD5 `544db24f65e82f1bc0a8f8e366ddb800`、SHA256 `2f1b3fde2c859035a25a8d04a0cc46664b87c92545b048c305806d07b70fba84`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0240/031900)；[2](https://ebird.org/species/lotshr1)；[3](https://avifauna.hkbws.org.hk/species/0240/031700)；[4](https://avifauna.hkbws.org.hk/species/0240/032000)；[5](https://birdsoftheworld.org/bow/species/lotshr1/cur/introduction)。
- HKBWS 20–25 cm，香港常見繁殖留鳥；本地繁殖分布縮減與全球趨勢未知分開。HKBWS 全球 LC，Cornell IUCN 2025 LC；圖示典型型、非黑色型。
- 顯示 i=2、v=3.1、c=1.2 沿 runtime，c 無中文保育正文，不代表完整評估；vEst 翼長92.4 mm×0.22≈20.328 cm 為粗估；食性欄只列偶捕魚漏常見昆蟲、小鳥，a 待查；要點含比較種誤置及截斷，r/o 遮蔽不補算。
- 主圖及本批比較圖新製；棕背圖白翼斑位置、栗背範圍和足趾待核；紅尾胸紋與灰背面罩待核。AI 示意非專家認證、不等比例。
- 世界底圖按 Cornell Birds of the World 部分原生亞種分布，未細分季節或亞種，綠色非全境。
- 全卡、四圈及比較圖目視，調整特徵裁切後重渲染及再目視；核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、世界 bounds、ISO3、bytes/hash，標籤測試5/5、diff check 通過；未動 R2 或 runtime。

## 0339 灰背伯勞交付

- 外層 [`0339.avif`](https://drive.google.com/file/d/1D3rL8HO0ullzRPN64PP-BtyjmJ-fDjKx/view)，133217 bytes、MD5 `034dd49a02bd91f6ddbde781d18c9679`、SHA256 `5513d562c2f2a1c82d32e04fcc7611780017d528f3bc1dede8a96a4a7dee66b7`；上載前精確查重 0，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- 資料來源：[1](https://avifauna.hkbws.org.hk/species/0240/032000)；[2](https://ebird.org/species/gybshr1)；[3](https://avifauna.hkbws.org.hk/species/0240/031700)；[4](https://avifauna.hkbws.org.hk/species/0240/031900)；[5](https://datazone.birdlife.org/species/factsheet/grey-backed-shrike-lanius-tephronotus)。
- HKBWS 21–23 cm，香港偶然迷鳥；BirdLife 2024 全球 LC、趨勢穩定。BirdLife 將其稱 fully migratory，而 HKBWS 指部分為留鳥及高地夏候，遷移模式來源有差異。
- i=2、v=3.2、r=1、c=1.2 沿 runtime；vEst 翼長98.6 mm×0.22≈21.692 cm，為粗估非實測；r 缺中文遷徙、語源及要點，c 缺中文保育正文，均非完整評估。英文食性 grasshoppers 的 grass 誤觸植物食性標籤，a/o 遮蔽不補算。
- 三種圖均本批新製；灰背圖頭和背均灰、無白翼斑，面罩是否過寬、喙和足趾待核；棕背圖翼斑與栗背範圍、紅尾胸紋待核。AI 示意非專家認證、不等比例。
- 地圖僅部分 BirdLife 原生國家，未標來源歸類 uncertain 的巴基斯坦，綠色非全境、不分季節。
- 全卡、四圈及比較圖目視，調整特徵裁切後重渲染及再目視；核驗 AVIF 解碼1024×1536、分類、scores/遮蔽、vEst、世界 bounds、ISO3、bytes/hash，標籤測試5/5、diff check 通過；未動 R2 或 runtime。

下一張 0340。

## 0340–0342 交付

- 指定 Drive 外層查重各 0，逐張上載；獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0340 楔尾伯勞](https://drive.google.com/file/d/1W3VHOz1fUDbsD6zuH2VAfkkRst4Ro8rW/view)：133112 bytes、MD5 `61124f843600a388c8f57ce14e071f64`、SHA256 `8d900535b667610d27e36d74905bb2995974566d4321ee0f88d503687ddb52bf`。i=2、r=1、c=1.2 沿 runtime；r/c 無中文相應內容非完整評估。a 因食性缺失且棲地標籤單一遮蔽；vEst 翼長120 mm 粗估26.4 cm 低於參考29–31 cm，v/o 遮蔽並保留估算提示。HKBWS 2019 首次第 I 類紀錄；BirdLife 2024 全球 LC、穩定；高原巨灰伯勞按外部分類分種，不套其範圍。
- [0341 松鴉](https://drive.google.com/file/d/1vlxEmRWwaQHo64-ECSiBbk29iIDAoLQu/view)：141144 bytes、MD5 `c16a0a37c021f9a446fefa7260bf2d8f`、SHA256 `cc1900df0d8c75f22ee21bb5f76c64503669ff804f4e015fb29e85989fdbc873`。i=2、c=1.2 沿 runtime；c 無中文正文非完整評估；a 食性標籤漏橡實及昆蟲，vEst 翼長181.4 mm 粗估39.908 cm 高於HKBWS 32–35 cm，r 語源欄非語源，a/v/r/o 遮蔽並保留估算提示。HKBWS 香港1980年代後大減，BirdLife 2025 全球 LC、穩定。
- [0342 灰喜鵲](https://drive.google.com/file/d/1mHheQYXxWd-dL76dz6WGaHKA2_hoTMcp/view)：134164 bytes、MD5 `7b99f43fd16d6b3497e1bb8d1ce7be0f`、SHA256 `48584a733e9e2cb5046907dff3a517f378ce4fbfc5baf903fc04785bb178d062`。i=2、c=1.2 沿 runtime；c 無中文正文非完整評估；a 食性來自圈養記錄且水果漏標籤，vEst 翼長141.3 mm 粗估31.086 cm 低於HKBWS 33–38 cm，r 要點截斷，a/v/r/o 遮蔽並保留估算提示。香港 IIB 外來群體，後海灣局部常見繁殖；HKBWS 全球 LC、趨勢未知，伊比利亞灰喜鵲為另種。
- 資料來源、AI 圖形局限、分數遮蔽理由及每隻地圖選國見各 spec。AI 鳥圖僅基本目視，羽形、趾及特徵比例待專家核實；比較鳥不等比例。地圖僅部分原生分布國家，綠色非全境。
- 全卡、四圈、比較框逐張目視；修正0340喙、0341眼、0342喉裁切後重渲染再讀圖。核驗 spec/manifest、名稱分類、分數/遮蔽、vEst、世界 bounds、ISO3、AVIF 解碼 1024×1536、bytes/hash、無 ZIP；標籤測試 5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0343；0343–0350 尚未製作。

## 0343–0345 交付

- 指定 Drive 外層查重各 0，逐張上載；獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0343 印支綠鵲](https://drive.google.com/file/d/1ftALT03cxIvA9ct53XRxyxDAaGQsV5TT/view)：134748 bytes、MD5 `dde407904baf9fda2013d08eadad1441`、SHA256 `ed2a7ce919280ce40f2e5cbd9042bc1acbe99475ca46395c66a96bfa3560ec6d`。i=2、a=4.3、v=3.8、r=1、c=1.2、o=2.5 沿 runtime；英文食性蛇蜥蛋與雛鳥標籤概括為爬蟲及鳥，非食成體的證據；r/c 無中文有關正文非完整評估。Cornell 載南方黃胸型、中國族群下體綠，主圖南方型；HKBWS 香港名錄 IIB；BirdLife 2025 全球 LC、疑下降。柬埔寨被 BirdLife 列原生狀態不明，未上色。
- [0344 喜鵲](https://drive.google.com/file/d/1WDZJ5AiQeQr2CqXBxC48SxrOztzFaRFl/view)：128775 bytes、MD5 `c9c52dc1f1753558f2bf10b55e4e99b6`、SHA256 `8c74fcbfe3071e16eb516ee64fdd9c3e9701222b17258e53de3493cf88941b7e`。runtime 僅 v=4、r=4.8，vEst 翼長193.3 mm 粗估42.526 cm 低於 HKBWS 46–50 cm，v 遮蔽保留估算提示；語源錯置及遷徙/要點截斷，r 遮蔽；其餘缺分，不從 IUCN 補算。HKBWS 香港常見繁殖留鳥但本地分布下降，全球 LC 趨勢穩定。
- [0345 達烏里寒鴉](https://drive.google.com/file/d/1iFSvPQWyGGzEMe1LQ58b9sWIyTCoSibn/view)：127455 bytes、MD5 `66991eb2413842c18e7520cf115296da`、SHA256 `a2aa0a26c7ec281a015d5d0295066912dbb6fa302216877a9011263e88441164`。i=2、c=1.2 沿 runtime；c 無中文保育正文非完整評估，v 缺值非零；中文食性漏昆蟲與果實標籤、語源及要點截斷，a/r/o 遮蔽。HKBWS 香港罕見冬候，多數紀錄為首冬暗色鳥，此圖為黑白成鳥；全球 LC、趨勢穩定。
- 來源與具體限制見各 spec；新 AI 鳥圖僅基本目視，羽色、喙形及腳趾等仍待專家核實。0343 綠鵲對照圖未顯示 Cornell 所述翼後黑白網紋，不應依圖鑑定；比較鳥不等比例。世界地圖只示部分原生分布國家，綠色非全境。
- 全卡、四圈及比較圖目視；修 0344 喙後重渲染再目視；核驗 spec/manifest、名稱分類、分數/遮蔽、vEst、世界 bounds、ISO3、AVIF 解碼 1024×1536、bytes/hash、無 ZIP；標籤測試 5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0346；0346–0350 尚未製作。

## 0346–0348 交付

- 指定 Drive 外層查重各 0，逐張上載；獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0346 家鴉](https://drive.google.com/file/d/1ZWngabzmD8xmS43p0VMu_86eseAEMdZT/view)：133845 bytes、MD5 `29cd76ab584d8dfff507a94701958ff4`、SHA256 `a6ef62239daf28d05c7d4d6c84acb9813746816a9b4d24db96e151bc361e879b`。i=2、v=3.9 沿 runtime；a 食性漏標爬蟲和農作物、r 要點截斷、c 保育欄錯置香港數量，a/r/c/o 遮蔽。HKBWS 香港 IIB 外來入侵留鳥；BirdLife 2018 LC、趨勢疑穩定。BirdLife 香港列 native 與 HKBWS 有衝突，圖只標部分南亞原生國家。
- [0347 禿鼻烏鴉](https://drive.google.com/file/d/11JYU6QQFiK7cyWqKbJKghRiPfsojBZZK/view)：132029 bytes、MD5 `dd9be8abd212aa711f0ca5f35981cfe1`、SHA256 `05b1d1964e789d84d8c39a4d375da03ada964b5b7ef6d82f7c15f2802d7ef83e`。i=2、v=4.1、c=1.2 沿 runtime；c 無中文保育正文非完整評估；a 受英文否定棲地誤標、r 要點截斷，a/r/o 遮蔽。HKBWS 香港偶然迷鳥，BirdLife 2025 LC、下降。圖為成鳥淡色喙基，幼鳥不明顯。
- [0348 小嘴烏鴉](https://drive.google.com/file/d/14PMG1CaV9JV1vvN4fRfiF8zazSGZIW3L/view)：127930 bytes、MD5 `9e6536a23013d5a56b1c01f97a128dec`、SHA256 `d6dd30129d7e2355f92c70c572d7349e22bc6596c3f662f03a34251458af54e6`。i=2、c=1.2 沿 runtime，c 缺中文正文非完整評估；a 棲地欄錯置、標籤空；v 500 mm 誤索引為500 cm；r 遷徙及要點截斷；a/v/r/o 遮蔽不補算。HKBWS 香港冬季偶然迷鳥，BirdLife 2024 LC 穩定，與 HKBWS 較早的全球上升記錄不同。
- 來源和詳細限制見各 spec，AI 圖非專家認證、喙形、裸皮及足趾待核，對照鳥不等比例；完整世界底圖僅示部分原生國家，綠色非全境。
- 全卡、四圈及比較圖目視；修0347喙、0348腳和面部標籤後重渲染再讀圖；核驗 spec/manifest、名稱分類、分數/遮蔽、世界 bounds、ISO3、AVIF 解碼1024×1536、bytes/hash、無 ZIP；標籤測試5/5、diff check 通過。未動 runtime、R2 或 slim 註冊。

下一張 0349；0349 已生成並讀主圖但未建 spec、渲染或上載，0350 尚未製作。

## 0349–0350 交付（0303–0350 完成）

- 指定 Drive 外層查重各 0，逐張直接上載；獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0349 大嘴烏鴉](https://drive.google.com/file/d/130h6AOmzy-1JLO4NECC75jRELJ89od03/view)：132821 bytes、MD5 `b6f9cadef2085335858af2b0c7e87479`、SHA256 `39d37ef212321b4e6a2bfcc63b792f854690c692557f6cdcccf816d4d00cc08e`。i=2、a=5、c=1.2 沿 runtime；c 缺中文保育正文，不是完整評估。vEst 翼長估體長70.092 cm 超過 HKBWS 46–59 cm，v 遮蔽但留提示；英文要點截斷、語源未納入中文研究輸入，r/o 遮蔽。HKBWS 香港廣布留鳥；BirdLife 2024 全球 LC、趨勢疑下降。
- [0350 白頸鴉](https://drive.google.com/file/d/1OhPLzMncmPJIwUS_Qyp0b6vymDxKrc2U/view)：125860 bytes、MD5 `c744b57145fec94d6c9740279b403a8c`、SHA256 `10db2d117a8229b772cdae7ee6ff9a471ffeee31e0a2111e0f8d8071202a3a0f`。i=3.8 沿 runtime；v 缺值；食性錯置威脅及標籤不完整、要點截斷、保育正文過時，a/r/c/o 遮蔽。BirdLife 2018 VU、下降、全球成熟個體估 2500–9999；HKBWS 香港局部分布留鳥。BirdLife 使用 C. pectoralis，HKBWS、eBird 與 runtime 使用 C. torquatus，命名差異保留紀錄；地圖不填原生來源不確定的台灣。
- 詳見 spec 內來源及限制；AI 圖非專家認證，形態和足趾待核；比較圖不等比例；世界底圖只示部分原生國家，綠色非全境。全卡、四圈及比較圖目視修正後重看；驗 spec/manifest、名稱學名、分數/遮蔽、世界 bounds、ISO3、AVIF 解碼1024×1536、bytes/hash、無 ZIP；標籤測試5/5、diff check 通過。未動 runtime、R2 或 slim 註冊。
- 0303–0350 交付完成；如要再續製，先待用戶確認範圍。

### 0303–0350 本輪結束檢查

- 48 個 spec 的 ID、runtime 名稱／學名、世界 bounds 與 ISO3 檢查通過；目前工作區可取得的 43 份 manifest／AVIF（0308–0350）再核對 spec、runtime 分數／遮蔽、Drive 紀錄、MD5/SHA256、尺寸與 AVIF 解碼。0303–0307 的本地 deliver 檔案此環境不存在，故不能重做本輪本地核驗；其原交付及當時 Drive 核驗證據保留於前文，未重新上載。
- `npm ci` 後 `npm run build` 通過；npm audit 顯示 20 項相依套件漏洞（2 low、8 moderate、10 high），未變更依賴。標籤測試 5/5、`git diff --check` 通過。此次未重跑完整 `npm test`，此前一次全套曾逾時。

## 0351–0353 交付（本批目標 0351–0400）

- 指定 Drive 外層查重各 0，逐張上載，獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0351 方尾鶲](https://drive.google.com/file/d/1jY_FOIQOtPhkYcqRE46IM2uYvHFyMUlM/view)：135407 bytes、MD5 `116db456d65eb7629f505f171560882d`、SHA256 `cc5729e6cef2d9b563233ac2e3e5ae2c4a62cc497ee1df5c559caf45c01a5f6d`。i=2、a=3.3、v=2.5、c=1.2 沿 runtime；c 無中文正文非完整評估；vEst 翼長估 12.848 cm 在參考範圍，保留估算提示；要點截斷、研究未納英文遷徙，r/o 遮蔽。HKBWS 香港常見冬候及過境，BirdLife 2024 LC、疑下降。
- [0352 火冠雀](https://drive.google.com/file/d/1Hwn83P_vEDxkzoSIa49RIpC7BRby7sYE/view)：130141 bytes、MD5 `9c86fa15990e1fde4ed4420d8f5e5099`、SHA256 `f461b95419ab9ea146ea984082770485cab2cf40779d1cccac8cd55456194741`。a=3.3 沿 runtime，i/c 缺值；10 cm 超過 HKBWS 8.5–9.5 cm，v 待查；英文遷徙未納入研究輸入、語源欄非語源，r/o 待查。HKBWS 香港偶然迷鳥，紀錄雌鳥；圖示繁殖雄鳥，火色飽和程度需核。BirdLife 2024 LC、疑下降，較早 HKBWS 趨勢未知。
- [0353 黃腹山雀](https://drive.google.com/file/d/13ab0Awe07yAH9_ceJCZX-iD96yYwbTtb/view)：132279 bytes、MD5 `6376022481360e0e4a675df35fb401e0`、SHA256 `0477871a1048ac0a83505c75532a0927f6ebc3879be9e361af60dc1067a17cd1`。i=2、r=1、c=1.2 沿 runtime；r/c 無中文正文非完整評估；食性缺失 a 待查，翼長估13.904 cm 高於 HKBWS 10–11 cm，v 待查且保留 vEst、o 待查。HKBWS 香港不定期冬候，本地1980年代中後下降；BirdLife 2024 LC、疑下降。BirdLife/HKBWS 用 Pardaliparus venustulus，runtime/eBird 用 Periparus venustulus。圖示雄鳥，已修最初誤畫黑腹縱帶。
- 各圖、四圈及對照目視；圖像 AI 製作非專家認證，羽形和足趾需核、比較圖不等比例。全世界底圖只示部分原生國家，綠色非全境。驗分類、分數與遮蔽、vEst、bounds、ISO3、AVIF 解碼1024×1536、大小及 hash、無 ZIP；標籤測試 5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0354。

## 0354–0355 交付

- 指定 Drive 外層查重各 0，逐張上載及獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0354 雜色山雀](https://drive.google.com/file/d/1jwe3IPWIP3ATaJ63HLbht20fATSlATe8/view)：130145 bytes、MD5 `d21831b92b08c96db5393d52aaa1d826`、SHA256 `c8cfc3b663063a6519dd2962619849103c2efb871f7dd6dfd259bb2c027905d9`。i=2、a=4.7、v=2.6、c=1.2 沿 runtime，c 缺中文正文非完整評估；語源錯置命名歷史且要點截斷，r/o 遮蔽。HKBWS 香港罕見迷鳥及侵入性來訪，BirdLife 2024 LC、疑下降，較早 HKBWS 趨勢未知。台灣栗腹山雀等已拆種，不套其範圍。
- [0355 中華攀雀](https://drive.google.com/file/d/1yFtnsVgteNzXZAsK4NNGst-rz-mfG248/view)：130109 bytes、MD5 `ea2c574d04abb02290f312e98419e881`、SHA256 `67c45c2c8d6d86ec233c7697ff2728613102f8c88d33e30bdbd41cf9fe11345a`。i=2、c=1.2 沿 runtime，c 無中文保育正文非完整評估；棲地農牧區漏農田標籤、估長12.188 cm 略高於 HKBWS 9–12 cm、語源錯置及遷徙未納中文研究輸入，a/v/r/o 遮蔽並保留 vEst 提示。HKBWS 后海灣常見冬候；BirdLife 2024 LC、上升。主圖示雄鳥，一腳被身體遮擋。
- 各圖、四圈及比較圖目視；AI 非專家認證、足趾及羽形待核，歐亞攀雀比較圖不足以示診斷差異，勿憑圖鑑定；對照不等比例，世界底圖僅示部分原生國家非全境。核驗 spec/manifest、runtime 名稱學名、分數/遮蔽與 vEst、bounds、ISO3、AVIF 解碼1024×1536、bytes/hash、無 ZIP；標籤測試5/5、diff check 通過。未動 runtime、R2 或 slim 註冊。

下一張 0356：主圖已生成並目視，尚未製 spec、比較圖、渲染或上載；0357–0400 未製作。

## 0356–0358 交付

- 指定 Drive 外層查重各 0、逐張上載及獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0356 蒙古短趾百靈](https://drive.google.com/file/d/10WaINpNxyEqrA9n28k98b-CiCOZ39SM7/view)：134275 bytes、MD5 `b03a81c953a16352aaf84ae95056c20f`、SHA256 `4dcbc7fe53606f98614fd5f59a74f43016fdbc3c8c153b7e46255eee8c20de12`。i=2、c=1.2 沿 runtime；a/r/v/o 遮蔽，保留 vEst。HKBWS 14–15 cm、香港偶然迷鳥，全球 LC 趨勢未知；eBird 標 2025 LC。中文繁殖資料與 HKBWS 不一致，翼估 20.57 cm 超出參考；食性混棲地。
- [0357 雲雀](https://drive.google.com/file/d/1TxAOREfJdKk3DN8QF_Xq5Edxdvu5k0Ou/view)：140683 bytes、MD5 `6a92eea88802f0daccbda110c895b374`、SHA256 `6b9619729d64ed58b9ef25f969e22f4e5f178dbf8c0337d30bfd12fb81050759`。i=2、c=1.2 沿 runtime；a/r/v/o 遮蔽，保留 vEst。HKBWS 17–19 cm，香港局部常見秋季過境；BirdLife 2018 LC、下降，香港註迷鳥與 HKBWS 不同。澳紐屬引入未填色。翼估 23.474 cm 超出參考，英文棲地錯置澳洲引入分布。
- [0358 小雲雀](https://drive.google.com/file/d/1z-Wt2eZFOy671u9mUuzpUa22UGXYqo_l/view)：140137 bytes、MD5 `056a614cc94e5482d6b1b0d198989526`、SHA256 `24cf0da09f9520848db7ac549cda7f4963b38eb6f43f1e684d49e047c49cb1fa`。i=2、v=2.9、c=1.2 沿 runtime；a/r/o 遮蔽。HKBWS 香港罕見冬候、較上世紀下降；BirdLife 2025 LC、全球疑下降，較早 HKBWS 趨勢未知。中文食性錯置棲地，外觀寫約15 cm，觀賞輸入為15.5–18 cm 範圍中點16.8 cm。
- 三張 c 分均無中文保育正文，非完整評估；r 因要點截斷及遷徙未納研究輸入待查。主圖、局部、比較圖目視；0356 修喙裁切後重渲目視；AI 圖僅示意非專家認證，冠羽、羽形和足趾待核，百靈近似勿憑圖鑑定，比較不等比例；世界底圖只示部分原生國家、綠色非全境。spec/manifest、runtime 名稱學名、分數/遮蔽/vEst、bounds/ISO3、AVIF 解碼1024×1536、bytes/hash、無 ZIP 核驗；標籤測試5/5、diff check 通過。未動 runtime、R2 或 slim 註冊。

下一張 0359；0359–0400 尚未製作。

來源更正：0354 spec 原 BirdLife 數字網址 `103758876` 轉到蒙古短趾百靈空模板，已改為經確認指向 Varied Tit 的明確名稱網址；只改記錄，不改已核驗圖片。

## 0359–0362 交付

- 指定 Drive 外層同名查重各 0、單張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0359 黃腹山鷦鶯](https://drive.google.com/file/d/1OuCJbexjNWrDMqZuTf0UYaQ-H9kOAEv5/view)：127758 bytes、MD5 `6fc03f4aaba2121555d137ee9fcd1f7c`、SHA256 `0bf29792542d54b6a3c041d86c80d4194289505225905689849e07bcdf47bc4b`。i=2、c=1.2 沿 runtime；a/r/v/o 遮蔽並保留 vEst。HKBWS LC、全球下降；香港常見留鳥但佔用格下降。食性棲地資料不足及錯標山地；翼估9.988 cm 低於印度生物多樣性平台12–14 cm。圖似繁殖羽，眉紋延至眼後且眼先較淡與 HKBWS 有差距。
- [0360 純色山鷦鶯](https://drive.google.com/file/d/1mn_XKWJjElzngc4Y8kyeiuanXFCoWz-m/view)：130434 bytes、MD5 `b2c2c0ca56dd664e10a00f540f9e8176`、SHA256 `b339942620509cdd21e150a67e00f45a6ddeb9661e13ac52d4ce13e80b9457bb`。i=2、a=3.8、v=2.4、c=1.2 沿 runtime，vEst 提示保留；r/o 遮蔽。HKBWS 香港局部常見留鳥、11 cm；BirdLife 2024 LC、全球疑穩定。叫聲和要點截斷、行為錯置為分類。
- [0361 棕扇尾鶯](https://drive.google.com/file/d/1N7rNJzyQxAsw_C-3g5rJMotJHD18pSjJ/view)：135272 bytes、MD5 `e7b5acec54cd29cbca93bc6d3c2022f4`、SHA256 `437637cb39fa789f6f22d5e2d46f4587b6170e669091922b3ba0eb5275b285df`。i=2、a=2.8、v=2.3、c=1.2 沿 runtime，vEst 提示保留；r/o 遮蔽。HKBWS 香港常見過境和冬候，中冬數量自1990年代下降；BirdLife 2024 LC、全球趨勢未知，與較早 HKBWS 全球增加不同。語源缺字、繁殖錯置鳴唱、要點截斷。圖尾未呈典型寬白尖和暗亞端斑。
- [0362 金頭扇尾鶯](https://drive.google.com/file/d/1HVKx2ZGfITAa2w6je9E0GRGiaSQlqVSt/view)：136476 bytes、MD5 `dded12fe1e6da5c6601075d0e2b1b605`、SHA256 `74109ad855b66743ca21ae8d521e1d08fbec97175f0e5a39de44d95b2f0c1ea6`。i=2、v=2.3、c=1.2 沿 runtime；a/r/o 遮蔽。HKBWS 香港不常見冬候，本地繁殖未確定；BirdLife 2024 LC、全球估計上升，香港記迷鳥。棲地資料缺字且標籤遺漏主要草地、要點與分布截斷；圖示繁殖雄鳥。
- 0359–0361 c 分無中文保育正文，非完整評估。主圖、局部和比較圖目視，0359 喉裁切修正後重看；AI 圖非專家認證，羽色、腳趾比例待核，近似鳥不宜憑圖鑑定，對照不等比例。世界底圖僅示部分原生國家，綠色非全境；0361 移除 BirdLife 未列原生的 MYS。spec/manifest、名稱學名、分數遮蔽與 vEst、世界 bounds/ISO3、AVIF 解碼1024×1536、bytes/hash、無 ZIP 核驗；標籤測試5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。素材和本地交付被 Git 忽略；本次新環境重建字型及渲染工具，舊素材缺失不等於 Drive 成品缺失。

下一張 0363；0363–0400 尚未製作。

## 0363–0366 交付

- Drive 指定外層同名查重各 0；單張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0363 厚嘴葦鶯](https://drive.google.com/file/d/1FM9X3_W4QItdMeCfT7D2iPvLUVIZWoaG/view)：126056 bytes、MD5 `757bd621f6cb91923d7ef31d44b3d553`、SHA256 `c1e45726fcf9ab227626e9132bce839f49a9c5990ec57810a0fc7879d99b9d46`。HKBWS 16–17.5 cm，香港秋季不常見過境，冬春罕見；BirdLife 2024 LC、全球疑下降；香港 BirdLife 記為迷鳥與 HKBWS 時序記錄不同。 六分沿 runtime（i=2 a=2.8 v=2.9 r=4.8 c=1.2 o=2.7）；v 為原資料16–17.5 cm 中點16.8；c 缺中文保育正文非完整評估。 AI 圖嘴尖近似黑色、足趾及羽色待核；兩個對照大小不等比例，不能憑插圖鑑定。
- [0364 靴籬鶯](https://drive.google.com/file/d/1-QPH8mGusYRk9-wDLh202jv60e6nwP9t/view)：130003 bytes、MD5 `f4ee4a44eb98e4740359253fce29c2b6`、SHA256 `f9feb6eee29653b913aebf882b10313fa57fc33bd522222252947c0e5f20035b`。HKBWS 11.5 cm，香港偶然迷鳥；BirdLife 2024 LC 全球疑上升，全球趨勢與本地迷鳥不同。 i=2 a=2.8 r=4.8 c=1.2 沿 runtime；c 缺中文保育正文非完整評估；翼59.4 mm 粗估13.068 cm 超過 HKBWS 11.5，v/o 待查並保留 vEst。行為欄為分類文字，不冒稱實際行為。 AI 圖眉紋延伸較長、羽形和足趾未認證，與賽氏籬鶯的細微診斷差異不能依賴插圖，大小不等比例。
- [0365 賽氏籬鶯](https://drive.google.com/file/d/1L27aVd-oF8LJduhTUyfqqQeL0DJiMnAG/view)：125736 bytes、MD5 `d53bb29d01147020bd3d75095c4fd5d6`、SHA256 `4b94adf3c4e56b001bcfd36bb49e00fdfcdd2752626b6b54434fdf4168c46e43`。HKBWS 11.5–13 cm，香港偶然迷鳥；BirdLife 2025 LC 全球趨勢未知，HKBWS 較早為穩定。 i=2 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；飲食文字有陸生無脊椎但 d 空，a 待查；翼60.6 mm 估13.332 cm 稍高於參考，v 待查保留 vEst；要點截斷 r/o 待查。 插圖嘴長眉短僅示意；與靴籬鶯極相似，姿態和羽形待專家核，不可憑圖鑑定。
- [0366 黑眉葦鶯](https://drive.google.com/file/d/1tvBFqsM1E6cQgqPg4tEtTYpOZIP24wFD/view)：131043 bytes、MD5 `5701b30807137b969b461e4e9bb6ba8d`、SHA256 `a53d11440a0cf740a7cfd294f4bea29f4123675d2c11c8f3be40e62ef517fcea`。HKBWS 13.5–14 cm，香港秋季常見過境、春不常見；BirdLife 2024 LC 全球疑穩定。 i=2 沿 runtime；a 缺值保留；翼52.7 mm估11.594 cm 低於參考，v 待查保留 vEst；遷徙資料置繁殖欄未納研究輸入，r 待查；中文保育狀況稱令人擔憂，BirdLife 2024 未指出重大威脅，c/o 待查。 插圖眼部與眉邊近似概念圖，腳趾與羽形待核，勿用作鑑定；對照鳥不等比例。
- 主圖、四圈和比較圖目視；0363、0365 喙裁切重渲並重看。AI 圖非專家認證，細節待核，不宜憑圖鑑定；比較圖不等比例。世界底圖只示部分原生國家，綠色非全境及非完整分布。核驗 spec/manifest、名稱學名、runtime 分數/遮蔽、vEst、bounds/ISO3、AVIF 解碼1024×1536、大小/hash、無 ZIP；標籤測試 5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0367；0367–0400 尚未製作。

## 0367–0370 交付

- 指定 Drive 外層同名查重各 0；逐張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0367 稻田葦鶯](https://drive.google.com/file/d/1NDSYBsjEjKN5zUnpMZr_6bbq0GvivHuZ/view)：130079 bytes、MD5 `1b45aa3470a79a7a91179b9b2af49498`、SHA256 `5158eb09f84aa999904948e399e25470f28552264fea1147ea865cf703bb0d06`。HKBWS 12–14 cm，香港非常罕見冬候；BirdLife 2025 LC 全球疑穩定，較早 HKBWS 評為下降。 i=2 v=2.6 r=4.8 c=1.2 沿 runtime；c 缺中文保育正文非完整評估；棲地蘆葦及長草未被標記，a/o 待查。 AI 圖下喙尖色不清，眉線較長，翼尾比例及足趾待核；相似鳥不等比例不能憑插圖鑑定。
- [0368 鈍翅葦鶯](https://drive.google.com/file/d/1wODDGmT5Q7VULNn5niOPCqkq1f3WMFb-/view)：132044 bytes、MD5 `cf5bcd930a800b52bfe85461c9498a89`、SHA256 `e01aa31895d04e345406a253466f7f10fd18afd0fdd4cbf84d1d423bf2297b77`。HKBWS 約13 cm，香港罕見冬候；BirdLife 2024 LC 全球疑穩定；runtime 缺 i/a/c/o 不補。 翼長55.6 mm 粗估12.232 cm 略低於 HKBWS 13 cm 參考，v 遮蔽保留 vEst；英文遷徙未納研究輸入，r 遮蔽。 AI 圖尾較長、翼羽比例及一腳隱藏待核；細微識別特徵不能憑插圖鑑定。
- [0369 遠東葦鶯](https://drive.google.com/file/d/1Q2wkGkrj5fsql1EbYYmlTJ1xpV4xWyGG/view)：131030 bytes、MD5 `d7fbaf2225fe80078e97c773380ae015`、SHA256 `f5374b16028404df8a406223e8a884a0cc872c7b89bbeddf3d86a8287ab6777f`。HKBWS 13.5–14 cm，香港不常見過境及罕見冬候；BirdLife 2025 VU、下降，估2000–20000成熟個體（數據品質差），不同於較早 HKBWS 估計。BirdLife 英文名 White-browed Reed-warbler。 i=3.8 c=4 沿 runtime，a 缺值不補；翼53.5 mm 推估11.77 cm 低於 HKBWS，v 待查保留 vEst；要點截斷 r/o 待查。 AI 圖眉紋及喙色僅近似，翼形比例與足趾待核，近似種類需專家鑑別。
- [0370 布氏葦鶯](https://drive.google.com/file/d/1XHuK5fMTherXLuGOVYYnEPAcDRqSP-eE/view)：127631 bytes、MD5 `e28c687ffcb662d010c18817d0b6f628`、SHA256 `ad81a5d18b572f923f1968b5223e5dbb4796335e0622e3fdc358f12c21bfe109`。HKBWS 12–14 cm，香港罕見冬候及過境；BirdLife 2025 LC 全球推測上升；香港 BirdLife 為迷鳥，與 HKBWS 時序記錄不同。 i=2 v=2.6 c=1.2 沿 runtime，vEst 翼長62.1 mm 推估13.662 cm 在參考範圍；c 正文僅區域增長非完整評估。食性無脊椎未納標籤，a 待查；英文遷徙未納且要點截斷，r/o 待查。 HKBWS 稱其相對較長翼，eBird 泛指短初級飛羽突出，對照須依語境；AI 圖翼尾比例足趾待核，勿憑圖鑑別。
- 主圖、四圈及比較圖目視，修喙裁切後重看；AI 圖非專家認證、形態待核，近似鳥勿憑圖鑑定；比較圖不等比例。世界底圖只示部分原生國家，綠色非全境及非完整分布。驗 spec/manifest、runtime 名稱學名、分數/遮蔽、vEst、bounds/ISO3、AVIF 解碼1024×1536、大小及 hash、無 ZIP；標籤測試5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0371；0371–0400 尚未製作。

## 0371–0374 交付

- 指定 Drive 外層同名查重各 0；逐張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0371 東方大葦鶯](https://drive.google.com/file/d/1s5h0SgrnvfayYv4KokKCOpDAapLFzU8M/view)：134719 bytes、MD5 `a4cad103028e237c5cf4cbfc5de718ac`、SHA256 `ef1d0c7f22b0b1c797aee91c40451eeb6c05be838f29af12ed80df3e329edbc8`。HKBWS 17–19 cm，香港秋季常見過境；BirdLife 2024 LC、全球疑下降。 i=2 v=2.9 沿 runtime；翼79 mm 推估17.38 cm 屬 HKBWS 範圍內，保留 vEst；食性欄混入棲地致誤標種子及植物，a 待查；要點截斷及英文遷徙未納，r 待查；保育正文僅描述繁殖密度、未反映 BirdLife 受脅，c/o 待查。 AI 圖胸縱紋較明顯，尾羽及隱藏一腳待核；相似圖不等比例，勿憑插圖鑑定。
- [0372 亞洲短趾百靈](https://drive.google.com/file/d/1kcMVD90BmqZ9TYKziiPN5FoSXtAZDhel/view)：132645 bytes、MD5 `30cf977cc6fcfc3dfe63c5b29b6d72ab`、SHA256 `ac9c23436b81577d89e809711379d3ae9f77b6830f8b66e775cd9b7e044543f5`。HKBWS 14–15 cm，香港偶然迷鳥，已記錄2014年一隻；HKBWS LC 全球下降，eBird 標 IUCN 2025 LC；BirdLife 數字連結返回空資料，故不引用其為已核 factsheet。 runtime 0372 無任何評分資料，六分皆待查，不自行補值；科屬名稱取 runtime。 主圖條紋和腿趾比例待專家核，蒙古短趾百靈比較圖胸側黑斑略誇張、小雲雀冠羽誇張；非精確等比例鑑別圖。
- [0373 斑背大尾鶯](https://drive.google.com/file/d/1PZV9uwp2IrdFCletfoQGktAauuyMQuBO/view)：134429 bytes、MD5 `bc725012181e854e974a840c1310de07`、SHA256 `df6db68ffc9f481fa80f8639c10b41af9c55345d815fbf101fe0164f5e0acd08`。HKBWS 12–14 cm，香港偶然迷鳥；BirdLife 2025 LC 並估全球增加，與較早 HKBWS 及 runtime NT 不同。BirdLife 摘要和正文估數互不一致，故不選取單一個體數。 runtime i=3、c=1.8 依舊 NT 與 2025 LC 不一致，i/c/o 遮蔽不重算；a 缺值；翼52.2 mm 估11.484 cm 小於 HKBWS，v 待查保留 vEst；r=1 未納 BirdLife 遷徙資料，待查。 圖像臉灰及羽紋偏誇張，亞種和細節待專家核，對照圖僅示意。
- [0374 小蝗鶯](https://drive.google.com/file/d/1F_xRCLUktLiqIicKREv21CacRDCguIDa/view)：133577 bytes、MD5 `b3d77b6efaf0538bce16fa295c8bafc8`、SHA256 `218c2e1886c7f24765c2c4f74272468433fb35741eefca320628597253ffea63`。HKBWS 12–14 cm，香港秋季常見過境、冬春較少；BirdLife 2024 LC 全球疑下降。 i=2 v=2.6 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；翼61.4 mm 估13.508 cm 落參考區間，保留 vEst；英文棲地未納索引，a 待查；多項要點截斷，r/o 待查。 AI 圖像尾尖及翅羽細節、隱藏腳趾待核；亞種未核，近似鳥勿憑插圖鑑定。
- 主圖、四圈及比較圖目視；0371 喙裁切修正後重看。AI 圖非專家認證，形態待核；對照不等比例，不宜憑插圖鑑定。世界底圖僅部分原生國家，綠色非全境、非完整分布。驗 spec/manifest、runtime 名稱學名、分數遮蔽、vEst、bounds/ISO3、AVIF 解碼1024×1536、大小及 hash、無 ZIP；標籤測試5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0375；0375–0400 尚未製作。

## 0375–0378 交付

- 指定 Drive 外層同名查重各 0；逐張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0375 北蝗鶯](https://drive.google.com/file/d/1BX-xrMraQ2UNARXwyIEuIIN6E1NWdwbB/view)：131818 bytes、MD5 `f66e5d69833df638e762958918018d46`、SHA256 `8dc7296377843c9887990a79926f59edc0e328fec6c599ab71819d8f4a2ee6f7`。HKBWS 14–15 cm，香港罕見秋季過境；BirdLife 2025 LC、全球趨勢未知，與較早 HKBWS 下降不同；BirdLife 範圍文字誤含非本種歐非資料，不採用。 i=2 c=1.2 沿 runtime；c 缺中文保育正文非完整評估。食性昆蟲未納及草地濕地與 forest 標籤不同，a 待查；翼69.5 mm 估15.29 cm 略高 HKBWS，v 待查並留 vEst；鳴聲及要點截斷 r/o 待查。 AI 圖喙略長、尾羽比例及足趾待專家核，對照圖不等比例。
- [0376 史氏蝗鶯](https://drive.google.com/file/d/1Q4nYCOZOxHHEjvtc-vTdc1ZDvxPfVSjl/view)：134761 bytes、MD5 `6236e1a22aacff111e8f60c04af7d272`、SHA256 `3a7b3a721d3003c4f43e27a3b3cdb9cf666e02ff1894af6a63201df12cb0eca9`。HKBWS 15–16 cm，香港不常見冬候及稀少過境；BirdLife 2025 LC、全球疑穩定、數量未知，與較早 HKBWS 及 runtime VU 不同；不將各地小島繁殖概括成全國分布。 翼70 mm 估15.4 cm 在 HKBWS 範圍，v=2.8 沿 runtime 並留 vEst；i/c 基於舊 VU 不吻合最新 LC，待查。食性資料混入棲地且漏英文灌叢、分類文字落分布欄，a/r/o 待查，不重算。 圖中長喙與長尾僅示意，隱藏一腳及比例待專家核；近似鳥不能憑 AI 圖鑑別。
- [0377 矛斑蝗鶯](https://drive.google.com/file/d/1T_Zb4tXbv-1O_dzh4U0_CHe74x_JEp1s/view)：134256 bytes、MD5 `a93481c55aaef7cf370624aeffd338d4`、SHA256 `a6a7db03bd902aa21d2ade76f30c6620b6b70ee1496b8a0e0deb99dcdda61dbf`。HKBWS 約12 cm，香港秋季常見過境，冬春罕見；BirdLife 2025 LC 全球趨勢未知，粗估40–60萬成熟個體、資料品質差。較早 HKBWS 全球穩定。 i=2 v=2.5 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；翼54.6 mm 估12.012 cm 約等 HKBWS，留 vEst。食性標籤僅昆蟲而 BirdLife 亦載蜘蛛和種子，a 待查；鳴聲誤置語源及要點截斷，r/o 待查。 沿用前次已目視的 0374 矛斑對照圖作主圖；縱紋偏強且淡眉較明顯，羽齡、亞種和隱藏腳趾待核。
- [0378 棕褐短翅蝗鶯](https://drive.google.com/file/d/1S6zMFXmDPtohr3TNBZdK2o1Cwp6ZDMCm/view)：133236 bytes、MD5 `9175aebd141a5b5983cb1ecd09339a74`、SHA256 `c225faad87ede9c3f200cb51ce1475de780433341fbe3d8a333f0c3aba33e795`。HKBWS 約13 cm，香港罕見冬候；BirdLife 2024 LC、全球疑穩定。BirdLife 列香港和孟加拉迷鳥、尼泊爾滅絕，不納入綠色地圖；HKBWS 本地與 BirdLife 季節地位不同。 i=2 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；forest 標籤與 BirdLife 主要灌叢不一致，a 待查；翼51.6 mm 估11.352 cm 小於參考，v 待查留 vEst；中文資料僅分布，r/o 待查。 AI 主圖眉較明顯、尾端比例未核；北短翅對照淡眉偏強且未展示尾下圖紋，與中華比較皆非等比例。
- 主圖、四圈及比較圖目視；0378 尾羽裁切修正後重看，中華短翅對照圖移除不符的胸部條紋。AI 圖非專家認證，形態待核；對照不等比例，不宜憑插圖鑑定。世界底圖僅部分原生國家，綠色非全境、非完整分布。驗 spec/manifest、runtime 名稱學名、分數遮蔽、vEst、bounds/ISO3、AVIF 解碼1024×1536、大小及 hash、無 ZIP；標籤測試5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0379；0379–0400 尚未製作。

## 0379–0382 交付

- 指定 Drive 外層同名查重各 0；逐張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0379 中華短翅蝗鶯](https://drive.google.com/file/d/1UZj2A3RmDyXxWl6zyGS2FSw79QXf8Dxo/view)：127304 bytes、MD5 `3ed1f5e0f655d803a20585a5bb5c9955`、SHA256 `6795c599c85c725906463e390189dbd24587019a0c3e30978f95d2353c0c03ad`。HKBWS 約13 cm、香港偶然迷鳥；eBird 標 IUCN 2025 LC，較早 HKBWS LC 全球穩定；BirdLife 數字及名稱頁為空模板，未作獨立核實。 runtime i/c 缺值；僅 forest 標籤未反映 eBird 濕地灌叢，a 待查；翼56.1 mm 估12.342 cm 小於 HKBWS，v 待查留 vEst；中文研究資料空白，r/o 待查。 沿用 0378 已目視中華短翅對照圖作主圖，臉及足趾比例待核；比較圖非等比例，尾下淡尖不保證精確。
- [0380 北短翅蝗鶯](https://drive.google.com/file/d/17Ixplikx-y3EUnT00PWaxw-M6-HeXRwu/view)：130130 bytes、MD5 `1be93bc3b6d7ff1038bdef38bd6313ce`、SHA256 `bf7bbda9ce818b54c5b8742cca59f686928443adfa2bd748df012e64a0fc0ee0`。HKBWS 約12 cm，香港罕見冬候及秋季過境；eBird 標 IUCN 2025 LC，較早 HKBWS 全球穩定。BirdLife 22732200 返回空模板，未作獨立核實。 i=2 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；食物無脊椎未納且棲地索引不全，a 待查；翼53.2 mm 估11.704 cm 略小於參考，v 待查留 vEst；繁殖文字疑取舊拆分分類且截斷，r/o 待查。 AI 圖喉點較粗、尾下白色過大，不準確呈現羽端帶紋；羽齡和腳趾待核，不能憑圖鑑定。
- [0381 高山短翅蝗鶯](https://drive.google.com/file/d/1tiYWMx_1w2D0A0g2b1sBCxr9sPGHe-2Y/view)：128136 bytes、MD5 `6f508c26f54789aeed28af15865f44dc`、SHA256 `72f52d1a405d1c95b3f60aa009ec07568ec6b8a5af4207f1a7a332fd165a12d2`。HKBWS 13–14 cm，香港常見冬候與秋季過境，山頂有小量繁殖；BirdLife 2024 LC 全球疑穩定。eBird 與 HKBWS 對棕褐短翅相對顏色表述不一致，依 HKBWS 本地描述。 i=2 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；a 缺不補；翼50 mm 估11 cm 低於參考，v 待查留 vEst；要點截斷且英語混入非鳴聲，r/o 待查。 AI 圖尾下未畫淡羽尖，喉部和腳趾、年齡季節待核；近似鳥勿憑圖鑑別。
- [0382 褐柳鶯](https://drive.google.com/file/d/1AUB-mXO_W5AFQClzX5fbvkNG6UcFb1R6/view)：126570 bytes、MD5 `dcece234ebe6b93f088a622a8854f6c9`、SHA256 `b82675b6758b505b06ba5f37fb9e3a6fc50aff5b994b11eb593a8d5bb34c90b6`。HKBWS 11–12 cm，香港常見過境及冬候；BirdLife 2025 LC 全球疑穩定、成熟數未知。 runtime 0382 無任何分數、詳細資料和測量值，六分皆待查，不自行補值。 AI 主圖眉與眼紋偏鮮明；兩對照圖羽色及足趾待專家核，圖片並非等比例鑑別依據。
- 主圖、四圈及比較圖目視，0381 尾羽裁切修正後重看；AI 圖非專家認證、不宜憑圖鑑定，對照不等比例。世界底圖僅部分原生國家，綠色非全境、非完整分布。驗 spec/manifest、runtime 名稱學名、分數遮蔽、vEst、bounds/ISO3、AVIF 解碼1024×1536、大小及 hash、無 ZIP；標籤測試5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0383；0383–0400 尚未製作。

## 0383–0385 交付

- 指定 Drive 外層同名查重各 0；逐張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0383 小鱗胸鷦鶥](https://drive.google.com/file/d/1FuitAQiCbXYek3ihAuOb1E1djXBE3FQx/view)：135485 bytes、MD5 `75fac908c397b9ae9f4bda8a56c61d6d`、SHA256 `581c4bf783728897ba2f062c0bec7245e2fa4f35456c8acfeb25bdd96bb8af5f`。HKBWS 7.5–9 cm；香港局部常見留鳥，本地分布擴張；BirdLife 2024 LC、全球疑下降，成熟數未知。 i/c 缺值不補；食性索引空，HKBWS 僅推測食蟲，a 待查；翼50 mm 推估11 cm 大於參考，v 待查保留 vEst；中文研究資料僅分布，r/o 待查。 AI 主圖胸腹鱗片偏大及嘴腳比例待核；鱗胸比較鳥頭頂淡斑未呈現，兩鳥皆非專家認證，對照不等比例。
- [0384 灰喉沙燕](https://drive.google.com/file/d/1ntAvGlg2YIa0CRDfLYEQhcogrAe3GOxj/view)：126975 bytes、MD5 `2afba7169fb55aa1750465342656d94c`、SHA256 `2cb4c7972ee167c69ae59398743b543d373ede2dff0dbc36f05b7cde8cad2242`。HKBWS 10–11 cm、香港迷鳥；BirdLife 2024 LC 全球疑下降、數量未知；列香港、烏茲別克為迷鳥，後者與 HKBWS 分布文字不同，地圖不納入。 i=2 c=1.2 沿 runtime，中文保育正文缺失非完整評估；食性欄錯置棲地致索引 plant，昆蟲缺漏，a 待查；翼89.9 mm 估19.778 cm 高於參考，v 待查留 vEst；中文研究僅分布且遷徙未納，r/o 待查。 AI 圖喉部偏白、尾部叉形及翼羽比例待核；崖沙燕對照胸帶較寬，家燕對照尾流蘇偏長；非專家認證。
- [0385 崖沙燕](https://drive.google.com/file/d/1_N9K7tFBPS031jVDHsQZqjZSUPWU39nY/view)：123850 bytes、MD5 `d000d8bc29da35a72b3c599adc9d240d`、SHA256 `56c673817aa97846d7c4b882482ce61dc9e85f44c808268e7c6488bab5693707`。HKBWS 約12 cm，香港不常見過境、稀少冬候；BirdLife 2025 LC 全球下降，估3870萬–5040萬成熟個體；BirdLife 香港列繁殖，與 HKBWS 本地季節紀錄不同。 i=2 v=2.6 沿 runtime，原中文長度12–14 cm 中點13；棲地索引空不反映濕地，a 待查；語音截斷且保育欄錯置夜棲數量，r/c/o 待查。 AI 主圖褐色胸帶比通常窄帶略寬，尾羽和足趾比例待專家核；比較鳥不等比例。
- 主圖、四圈及比較圖目視，0383 腳和 0384 頭裁切修正後重看；AI 圖非專家認證、不宜憑圖鑑定，對照不等比例。世界底圖僅部分原生國家，綠色非全境、非完整分布。驗 spec/manifest、runtime 名稱學名、分數遮蔽、vEst、bounds/ISO3、AVIF 解碼1024×1536、大小及 hash、無 ZIP；標籤測試5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0386；0386–0400 尚未製作。

## 0386–0389 交付

- 指定 Drive 外層同名查重 0；逐張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0386 洋燕](https://drive.google.com/file/d/1EiMILd2HrWGMnoo-sFvPj5Ck7b3hJyBT/view)：131154 bytes、MD5 `337504809bbda891dab409b6058c6ed1`、SHA256 `276933cf4855c2b4941c3cc01f91c7a980e32d32aa18392a7cbd014048b17c01`。runtime 及 eBird 將洋燕定為 H. javanica；HKBWS 2024 舊文使用廣義 H. tahitica、香港迷鳥紀錄及 11–14 cm 可能屬今 javanica 的 namiyei；BirdLife 2024 H. javanica LC、數量未知、估上升，涵蓋的島嶼族群與 eBird 拆分範圍可能不同，勿直接等同。地圖只採共同東南亞和台灣日本部分。 runtime 無分數、測量及文案，六分待查不補。 AI 主圖尾形略長、色彩偏鮮及腳趾待核；尾下白斑未呈現，對照不等比例。
- [0387 家燕](https://drive.google.com/file/d/1lVAYK-B1tAP6NLlwqeWaNMwyF3RkQG9X/view)：127072 bytes、MD5 `a29923865042e7692099c04fbee404b4`、SHA256 `cfe8f678b484ba4484266d07a4b3c42e61df23881a8aba3fd35967a099a1aaed`。HKBWS 17–19 cm、香港全年有記錄，春秋常見過境及本地繁殖；BirdLife 2019 LC 全球下降，成熟數粗估2.9–4.87億。 i=2 v=3 沿 runtime，原有體長17–19 cm 中點18；食性昆蟲在英文及人鳥關係有載但索引空，a 待查；要點和食性截斷、地理欄錯置且保育欄為電線棲息行為，r/c/o 待查。 重用 0385 已目視家燕對照圖，尾流蘇較長、足趾和羽齡待核，對照不等比例。 圖中的白色尾羽線條非準確尾斑，勿作尾斑位置參考。
- [0388 金腰燕](https://drive.google.com/file/d/1_U7l2fAOqUH_OCxlDNQWPM0l7BLh5v6G/view)：127703 bytes、MD5 `f78cd171c8c987ba9028016b110711d1`、SHA256 `ae7e9943dc9056b5ee5619d5d65523334a83999db99b321f38993ea9272daf77`。HKBWS 16–17 cm，香港遲秋及初冬常見過境、夏季少量繁殖。BirdLife 2024 廣義 C. daurica LC 全球上升；eBird 及 runtime 以東方金腰燕為獨立分類，範圍不完全同，故圖上明示廣義評估、不使用全球數量代表拆分後物種；地圖僅示亞洲部分。 只標 HKBWS 所列東亞及 eBird 範圍中可支持之少數國家。 a=3.8 沿 runtime；v 缺不補。廣義 LC 分類與 runtime 拆分範圍不同，i 待查；保育欄僅 IUCN 職責非評估，c 待查；繁殖資料推論及英文鳴聲誤置分類、中文分布含歐洲，r/o 待查。 AI 圖腹紋偏粗、腰斑較狹且位置近折翼尾端，尾流蘇及腳趾待核；對照圖不等比例。
- [0389 白腹毛腳燕](https://drive.google.com/file/d/1kiJqYPbHQJF7R6uOda6zchFTSepxVe9s/view)：127650 bytes、MD5 `c7e0f1e576d24db2069f5af862da016a`、SHA256 `3bac7faddb4a3671ebaa338f17bf3902bebcb684570bd8d260964a27b15f4472`。HKBWS 13–14 cm、香港罕見晚秋過境；BirdLife 2024 LC 全球疑下降、未估全球數。BirdLife 監測條目含歐洲，可能混用拆分前資訊，未採為本種證據。 i=2 c=1.2 沿 runtime；c 缺保育正文非完整評估；a 缺值不補；翼108.1 mm 估23.782 cm 遠超 HKBWS，v 待查並留 vEst；look 為分類，breeding 與 migration 重複且 voice 錯置，r/o 待查。 AI 圖白腰與翼位置重疊、腳羽及尾形待核；煙腹比較圖白腰偏狹，個體及亞種差異大，不可憑圖鑑別。
- 主圖、四圈及比較圖目視；0388 腰部及尾羽修圖。AI 圖非專家認證、不宜憑圖鑑定，對照不等比例。世界底圖僅部分原生國家，綠色非全境、非完整分布。驗 spec/manifest、分數遮蔽、bounds、AVIF 解碼1024×1536、大小及 hash；標籤測試5/5（需設定字體路徑）、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0390；0390–0400 尚未製作。

## 0390–0393 交付

- 指定 Drive 外層同名查重 0；逐張上載後獨立 get_file 核驗名稱、parent、MIME、大小、MD5、未刪。
- [0390 煙腹毛腳燕](https://drive.google.com/file/d/1pEgKiXQWm8Guq4SL0q3gJonBH2Jbp-Hs/view)：124998 bytes、MD5 `f423f36b47b06ab85d6ec5a188cfe1c4`、SHA256 `57381d54f1c20101adb6877ace8bc0dd19c3a2db052e4cfd5b8dcd6cd6d3f58d`。HKBWS 12–13 cm，香港秋季不常見過境、冬少見；BirdLife 2024 LC、估全球上升，數量未知；蒙古原生地位不確定，地圖不納入。 i=2 a=3.3 c=1.2 沿 runtime；中文保育正文缺失並非完整評估。原長度「12–1 cm」被解析作6.5 cm，v 待查；研究資料只有分布及分類，英文鳴聲錯置保育資料，r/o 待查。 AI 圖仿煙腹型，白腰偏小且下體偏灰，尾叉和足趾需核；不同亞種腹色差異大，比較圖不能當精確鑑定圖。
- [0391 白喉紅臀鵯](https://drive.google.com/file/d/1hJNjpwIH7Z5o9FXsAxVm2Il2iro7BRpY/view)：136373 bytes、MD5 `1cadd4b32230b39487641a7d3dd3c363`、SHA256 `2aebf7180686c05d8c698a61e5602d5bb596571739025691b079ad3280fb2769`。HKBWS 19–21 cm，香港局部留鳥、分布下降；BirdLife 2024 LC、疑全球下降、數量未知，將新加坡列引入並未列馬來西亞，地圖不納入。 i=2 v=3.1 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；AVONET 翼91.8 mm 估20.196 cm 屬參考範圍，保留 vEst；a 缺值不補；研究中文僅分布，r/o 待查。 AI 主圖頭冠比實鳥豎立，臀斑及尾羽腳趾比例待核；紅耳鵯對照冠較誇張，無法憑圖鑑別。
- [0392 黑短腳鵯](https://drive.google.com/file/d/1yS4AGeURKLPOeM4-48GvtFZ6_P2iAXg5/view)：135444 bytes、MD5 `6397cc779a35e3e57c89b18ae136f977`、SHA256 `8c1ec6862997f8666b9a4f68ad8826528c0dd1a0bb1e3c5aa5a29f233533785e`。HKBWS 香港稀少冬候過境，近年本地有小量繁殖；本地成鳥白頭白胸，幼鳥頭黑，其他亞種可黑頭；較早 HKBWS 稱 LC 全球穩定；eBird 標 IUCN 2025 LC，但 BirdLife factsheet 空模板，不能核該次趨勢。 i=2 a=4.7 v=3.3 c=3 沿 runtime，體長24–25 cm 中點24.5；c 原文全球穩定來自較早資料，未能獨立核實新版趨勢。要點多處截句、詞源缺詞，r/o 待查。 AI 圖白胸範圍偏窄，喙腳與尾羽比例待核；對照圖並非等比例或專家鑑定。
- [0393 栗耳短腳鵯](https://drive.google.com/file/d/1EOEsLo7KDsuqydvixIxKc8roCd9Szwa_/view)：138169 bytes、MD5 `43909fe6dadaf4288a5ef19cdf90bff3`、SHA256 `d0486b8e1926dfb5fe3f30b1f1cb0a85326aa92e67ee2ccf61396fffa455b889`。HKBWS 27–29 cm，香港偶然迷鳥；BirdLife 2018 LC、估全球上升、數量未知；eBird 另標 IUCN 2025 LC，能讀取之 BirdLife 頁最新評估仍顯示2018。 i=2 v=3.5 c=1.2 沿 runtime；28 cm 在 HKBWS 區間。c 缺中文保育正文非完整評估；食性索引漏果實，a 待查；要點及遷徙截句、詞源錯置，r/o 待查。 AI 胸紋較粗，耳斑界線過銳，缺尾下白 V 紋及足趾細節，亞種未核；對照不等比例。
- 主圖、四圈及比較圖目視，0392 喙足裁切修正後重看。AI 圖非專家認證、不宜憑圖鑑定，對照不等比例。世界底圖僅部分原生國家，綠色非全境、非完整分布。驗 spec/manifest、runtime 名稱學名及分數遮蔽、bounds/ISO3、AVIF 解碼1024×1536、大小及 hash；標籤測試5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

下一張 0394；0394–0400 尚未製作。

## 0394–0397 交付

- 指定 Drive 外層精確查重 0；各 AVIF 單獨上載，獨立 get_file 核驗名稱、parent、MIME、大小、MD5 及未刪。
- [0394 栗背短腳鵯](https://drive.google.com/file/d/1emo5eHdEZFAbW3uWsEt4XJS--iPxy3O8/view)：130846 bytes、MD5 `a179837cb99b601822277bc5773c039f`、SHA256 `78bd02c85e275c5ae0b3d447a13ef084d64c15683389960118b104d85ae6c504`。HKBWS 21–22 cm，香港森林常見留鳥、冬季更廣；BirdLife 2024 LC，全球估上升、數量未知；中國和越南原生，runtime 中文中國特有不適用整物種。i/c 缺；食性索引空 a 待查，原文混海南亞種及物種且英文鳴聲錯置分類 r/o 待查。翼97.4 mm 估21.428 cm，v=3.2 沿 runtime 留 vEst。AI 圖尾較細長、灰胸及趾待核。
- [0395 綠翅短腳鵯](https://drive.google.com/file/d/1Cf5o5snneaJaLEXnIFCe-RiXzveO_0It/view)：137161 bytes、MD5 `21397e7cb8944a89a64fb4208219ab20`、SHA256 `7ee8851832f0c8de3e406daea9b4514baa7952f217c4de64d825298f04828fc6`。HKBWS 21–24 cm、香港局部留鳥；BirdLife 2024 LC 全球疑下降、數量未知。i=2 v=3.3 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；翼106 mm 估23.32 cm 留 vEst；食性欄錯置及索引空 a 待查；英文鳴聲錯置且中文有限 r/o 待查。AI 冠及喉紋較誇張、黃尾下覆羽不明顯，羽翼足趾待核。
- [0396 林柳鶯](https://drive.google.com/file/d/1vpkfMkrzU_clS6OtFR3Hq_qICKxW7o93/view)：128170 bytes、MD5 `5a5a2aee07d542dec46ecff7e1d3dbcc`、SHA256 `a8275f1606fa7352c33778e303c446de3db06caf1384b9d3f50ea94db8ddb43e`。HKBWS 11–13 cm，香港迷鳥；BirdLife 2024 LC、全球下降，估1710萬–3000萬成熟個體、資料品質差。i=2 c=3 沿 runtime，c 加納局部生境減少非完整全球評估；山毛櫸文字可能誤觸發 mountain，a 待查；翼75.8 mm 估16.676 cm 大於參考，v 待查留 vEst；多處截句及英文繁殖錯置、遷徙未納，r/o 待查。AI 喉色偏鮮，足趾及尾羽待核。
- [0397 黃眉柳鶯](https://drive.google.com/file/d/15b2dDpv8tJSoisTKXq0vtecnfRGh-fnA/view)：128547 bytes、MD5 `bc2fb5ee404bc5ee37239598a8cfa61a`、SHA256 `562a85addfad1ea743de5f991a6e7a0cd31b25eb37136fed994f01dcd9da6eeb`。HKBWS 10–11 cm、香港常見冬候及過境；可讀 BirdLife 2019 LC 全球疑穩定，eBird 標 IUCN 2025 LC，未核該次趨勢。i=2 沿 runtime；食性索引漏蜘蛛 a 待查；翼58.4 mm 估12.848 cm 大於參考，v 待查留 vEst；要點截句、英文食性錯置遷徙 r 待查；保育欄英國個體數非全球評估 c/o 待查。AI 翼斑眉色偏強；淡眉對照缺棲枝且翼斑過似黃眉，須綜合叫聲鑑別。翼部局部只顯示一處斑，標籤修為「淡色翼斑」。
- 主圖、四個局部及對照圖目視，AI 圖非專家認證，對照不等比例，勿憑圖鑑定。世界底圖只標部分原生國家，不代表全境或完整分布；分數未補值。驗 spec/manifest、runtime 名稱學名、分數遮蔽、bounds/ISO3、AVIF 1024×1536、大小及 hash、無 ZIP；標籤測試 5/5、diff check 通過。未改 runtime、R2 或 slim 註冊。

### 0398–0400 未交付（續作狀態）

- 已生成 0398、0400 主圖供後續使用，0400 修改了黃色腰斑位置；仍須逐張檢視、完整研究、建 spec、渲染驗證及上載。0399 草圖 `cards/art/info-restart-0399/pixel.png` 已目視，但淡冠紋及腰斑不清楚，不宜視為完成：請先修圖／重檢。該次修圖因本輪生圖上限而未執行。這些 ignored 素材不保證在新環境可用。
- 下一張 0398；0398–0400 均未上載。HKBWS 淡眉 [037800](https://avifauna.hkbws.org.hk/species/0320/037800)、雲南 [038000](https://avifauna.hkbws.org.hk/species/0320/038000)、黃腰 [038100](https://avifauna.hkbws.org.hk/species/0320/038100) 可作研究起點，但完整保育與評分稽核尚未完成。

## 0398–0400 交付（取代前述未交付狀態）

- 指定 Drive 外層同名精確查重 0，逐張單獨上載；獨立 get_file 核驗 parent、檔名、MIME、bytes、MD5 及未刪。
- [0398 淡眉柳鶯](https://drive.google.com/file/d/1a3VV0qXpR0IQ3iIqVD1WXZb-Jpqewc8b/view)：124153 bytes、MD5 `7e3bc8392995ccb8d45b5e51de5524d1`、SHA256 `30f900af098be47077e8aeb2ec8c055960eaf0d05f5f988842ce10d249441230`。HKBWS 10–11 cm，香港罕見冬候及過境，多為 mandellii；較早 HKBWS LC 全球穩定，BirdLife 數字及名稱頁返回空模板，不能當作最新趨勢核實。i=2 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；英文食性欄錯置英國迷鳥、食性索引缺明確支持，a 待查；翼54.6 mm 推估12.012 cm 超參考，v 待查、保留 vEst；funFact 截句、英文鳴聲及保育錯置 r/o 待查。AI 修加棲枝與減弱翼斑後目視；喙較長、足趾與棲枝接觸不自然，冠紋細節待核。
- [0399 雲南柳鶯](https://drive.google.com/file/d/1rJ1gTUbMbQfSzM6T3HZPTtxIsQQvV9fc/view)：133505 bytes、MD5 `12cd11afceb9e4b645e4d5bfd9ac6bd5`、SHA256 `1998dd178137db2cabb56cef2ccea7ebbbde8850f03c79f5140d134c558ec688`。HKBWS 9–10 cm，香港偶然迷鳥；BirdLife 2024 LC、全球疑穩定、成熟數未知。HKBWS 中國繁殖特有與 BirdLife breeding endemic No 有出入；地圖採 BirdLife 原生中國、緬甸、泰國。i=2 c=1.2 沿 runtime，c 缺中文保育正文非完整評估；索引未反映主要繁殖灌叢，a 待查；翼52.2 mm 估11.484 cm 超參考，v 待查保留 vEst；中文詳細內容缺乏、英文越冬文案過時及詞源截斷，r/o 待查。AI 修加淡冠及腰斑後目視，圖色偏灰冷、中央冠紋很細、腰斑偏黃，羽緣及趾仍待核。
- [0400 黃腰柳鶯](https://drive.google.com/file/d/1W6h68TngII4vKSzswbWOVaDCQw0MBEu1/view)：129445 bytes、MD5 `e291fc37baec0694795429f3ce6bf3d2`、SHA256 `a4f28f57bad7140c9d5a064caa09bbf46698a3b53c74a63796fd5d9c08935163`。HKBWS 9–9.5 cm，香港不常見至常見冬候及過境；較早 HKBWS LC 全球穩定，BirdLife 數字及名稱頁空模板，最新趨勢未獨立核實。i=2 v=2.2 沿 runtime，體長9–10 cm 取9.5；棲地索引空且中文 habitat 錯置其他物種，a 待查；要點及人鳥關係截句、英文鳴聲錯置遷徙，r 待查；中文保育欄為遷徙及歐洲觀察量，c/o 待查。AI 腰斑近尾基部且色較鮮，冠紋及喙足比例待核；雲南比較圖灰色偏冷、冠紋不明顯。
- 三張全卡、四局部與兩比較鳥目視；AI 圖未經專家認證，勿單憑圖鑑別，對照非等比例。世界底圖只示部分原生國家，綠色非全境亦非完整分布；分數未自行補值。驗 spec/manifest、runtime 名稱學名與評分遮蔽、vEst、世界 bounds/ISO3、AVIF 1024×1536、bytes、hash、無 ZIP；標籤測試5/5，diff check 通過。未改 runtime、R2 或 slim 註冊。

**本次目標 0351–0400 已逐張交付並獨立核驗；不自行開始 0401。** 各卡可追溯研究、遮蔽理由、圖片限制與 Drive ID 見本紀錄及各 spec；素材與成品屬 ignored 本地檔，並未納入 Git。0303–0400 specs 與本文件目前仍在工作樹，未提交或推送。

## 新批次 0401–0450（用戶確認）：首批 0401–0406 已交付

- 2026-11-15 用戶確認下一批為 **0401–0450**（每次最多 50 張），並指定新 AVIF 放入外層 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up` 之下新建的 **「400-500」子資料夾**。該日實查外層只有三個子資料夾：「已上載R2」（0009–0200）、「200-300」（0201–0300）、「300-400」（0301–0400），即 0201.avif 已經移入「200-300」，不再直接位於外層；故按用戶指示新建 `400-500`（ID `1hwZj_kCquQi-4wDuc7e-u5CSJyk0r3vg`）後逐張上載，未使用「已上載R2」。上載前全 Drive 精確查重 `name = 'NNNN.avif'` 皆為 0 筆（含 0401 一次確認全 Drive 無 0401.avif）。
- 環境：本 checkout 的 `cards/art/`、`deliver/cards/` 為空（Git 忽略、新環境未保留舊素材），0303–0400 的本地素材與成品在此環境不存在，故本輪**沒有重做或重新核驗**任何舊卡。已按 handoff 重建：`/home/user/card-venv`（Pillow 13.0.0、numpy 2.4.6、scipy 1.17.1，AVIF 編解碼正常）、`~/.fonts/NotoSansTC_400Regular.ttf` 及 `NotoSansTC_700Bold.ttf`（由 Google Fonts `NotoSansTC[wght].ttf` 以 fontTools instancer 產生 400/700 靜態實例）、每張卡的 `countries.geojson`（Natural Earth 110m，經 GitHub API 取得，838,726 bytes）。`python scripts/cards/test-slim-feature-label.py` 5/5 通過；`git diff --check` 通過。字體與 venv 均在 repo 外，不入 Git。
- 六張卡全部：全卡、四圈及比較圓逐張讀圖；逐張核對 spec=manifest.spec、runtime 名稱／學名、分數遮蔽、世界 bounds `[-180,-90,180,90]`、ISO3、AVIF 解碼 1024×1536、bytes/SHA256、無 ZIP。逐張上載後以獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 及未刪。

- [0401 巨嘴柳鶯](https://drive.google.com/file/d/1G-IvLJvyd7kHQHXz0Dx75q8yp9niOJ4f/view)：127002 bytes、MD5 `5c64e2327683d5dce03c49af04592474`、SHA256 `8c6857d2d300c355fc75018878b478648b30dddfe01be2d6d0af28648d9e995e`。HKBWS 12.5–14 cm，香港不常見秋季過境、稀少冬候；HKBWS 2023 記全球 LC 趨勢穩定，BirdLife 2025 亦 LC 但記疑下降，差異已記錄。i=2 a=3.3 r=4.8 c=1.2 沿 runtime；cardCopy.length 為「17–13 mm」（方向及數值均不合理）→ v 待查、不補值，該筆亦無 vEst 旗標；o 依賴待查分項。callouts 兩條截句已記錄，未影響其餘分項。主圖嘴偏長尖（實鳥較鈍厚）、足趾握枝略生硬；對照圖褐柳鶯、棕眉柳鶯皆新製並目視；棕眉圖未清楚顯示暗褐胸帶。地圖只標 BirdLife 原生 10 國，不標香港、哈薩克等迷鳥地區。
- [0402 棕眉柳鶯](https://drive.google.com/file/d/1wbT6NGCCbcgD7DaH1g-AhRwDmpnWakQS/view)：125513 bytes、MD5 `eafb25bf55551868a8798bbbfe6e66d3`、SHA256 `e35035a20b53105da4d0a57aa6df4b8337c8dcb57fea84fa3635fa0bc36e8231`。HKBWS 12.5–13.5 cm，香港第 I 類、1994 年首記錄，秋季稀有過境及稀少冬候；與巨嘴柳鶯野外幾乎只靠金屬聲「tzik」分辨；全球 LC 趨勢穩定（HKBWS 及 BirdLife 2024 一致）。i=2 v=2.6 c=1.2 沿 runtime，vEst=1 提示保留（翼 61.2 mm×0.22≈13.5 cm 在參考範圍）；cardCopy 只有 range 及 iucn，length／look／habitat／diet／migration／voice／breeding／etymology／highlights／callouts 全空 → a、r 待查，o 不補算。主圖胸帶對比偏弱；對照鳥重用 0401 的巨嘴柳鶯及褐柳鶯圖。
- [0403 歐柳鶯](https://drive.google.com/file/d/11gmg2YWE9__tUKsI_Thkw_U-V-JWLTRV/view)：125733 bytes、MD5 `f0ccedaae41b08d28b267711ec989f24`、SHA256 `1f981430e399ead3c4ae92e2d3c0a4784245064a5155585933230722d49774fc`。HKBWS 11–12.5 cm、第 I 類（2008 長 Valley／2020 米埔各一）、全球 LC 趨勢下降。runtime cardCopy 的 look 及 voice 實為**林柳鶯（Wood Warbler）對比柳鶯**的描述（粉黃腳、「hoo-eet」對「hweet」），屬跨物種錯置，且 HKBWS 明言歐柳鶯本身腳為粉褐 → a、r 待查；length 空、翼長推估 14.5 cm 超出參考 → v 待查並保留「原觀賞值含體長估算」提示；c=1.2 沿 IUCN；o 不補算。主圖示秋季幼鳥型；比較鳥嘰喳柳鶯（新製）、褐柳鶯（重用）。地圖按維基繁殖／越冬國家選 16 國，不分季節；BirdLife 條目當日只回空模板，未用作證據。
- [0404 棕腹柳鶯](https://drive.google.com/file/d/16VT54t0z7RdibYbCgTr48DHYUvSh8XBY/view)：127978 bytes、MD5 `cb0ef500dab2a4711342c22b7940cd87`、SHA256 `1178b1c485c5bd5f2dc7f0447fabef550c0ae94b5d3d305c46559284777162fc`。HKBWS 10.5–11 cm、第 I 類，唯一紀錄 2018-10-09 香港濕地公園；單型，中國山地繁殖、南至中南半島低地越冬；BirdLife 2025 LC 趨勢穩定。runtime **完全沒有本種分數、測量及文案** → 六項全部待查（卡面註「待查非零分」），未從 IUCN 反推、未補值。地圖只標 BirdLife 原生 5 國，不標印度迷鳥。主圖橙黃喉胸及深色腳符合描述，嘴形比例及初級飛羽待核。
- [0405 嘰喳柳鶯](https://drive.google.com/file/d/1HOvGDV12EdGGvyrIZma17a0LqJwzy6dT/view)：129177 bytes、MD5 `7c922a2c8a51877a6891632025199189`、SHA256 `cdfbef3bf659f02a568dc9189ee03cef950092594031c6071940f5fc1c4ce5f2`。HKBWS 11–12 cm、第 I 類稀少至罕見冬候及過境（少於 20 筆）、全球 LC 趨勢上升。habitat 欄被 tristis 亞種分類說明佔用、diet／etymology／highlights 多處截句 → a、r 待查；i=2 v=2.5 c=1.2 沿 runtime（length 12.5 cm 略高於 HKBWS 11–12，已記錄，不作補值），o 不補算。主圖沿用 0403 已目視的嘰喳柳鶯素材；比較鳥歐柳鶯、褐柳鶯重用。
- [0406 冕柳鶯](https://drive.google.com/file/d/10oLruyZdgkS4MVYjCd_-QsgMXHrzX--7/view)：123682 bytes、MD5 `51cf5de0f77e8d7bda5f88e5324b9c1b`、SHA256 `b93acf41b15a375c34dab9a7cae05b85768c2ce9b11e496235ec1fe494776bf0`。HKBWS 11–12 cm，秋季不常見、春季稀少過境、罕見冬候（2010 年後冬季紀錄大增）、全球 LC 趨勢穩定。length 空、翼長推估 13.5 cm 超參考 → v 待查並保留估算提示；diet 欄實為樹棲及混群行為、breeding 與 diet 重複、voice 只說靠鳴聲發現 → a、r 待查；i=2 c=1.2 沿 runtime；o 不補算。主圖冠紋結構較實鳥誇張（圖呈兩條淡冠線），足趾及初級飛羽待核。

- 六張卡的 AI 圖只作基本目視，非獨立鳥類專家認證；比較鳥不等比例，不宜單憑圖鑑定。世界底圖只標部分原生國家，繁殖與越冬未分色，綠色非全境、非完整分佈。全部未改 runtime、UI、R2 或 slim 註冊；素材與 AVIF 屬 ignored 本地檔，未入 Git，新環境不保證可重現。
- **下一張 0407；0407–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`，故未重跑 build；`git diff --check` 與標籤測試 5/5 通過。

## 新批次 0401–0450：續批 0407–0410 已交付（取代上節「下一張 0407」）

- 2026-11-15：同批續作 0407–0410，目標資料夾仍為「400-500」（`1hwZj_kCquQi-4wDuc7e-u5CSJyk0r3vg`）。四張各自先在該資料夾按 `name = 'NNNN.avif'` 精確查重，結果均 0 筆，才逐張單獨上載；上載後以獨立 `get_file` 核驗檔名、parent、MIME、大小及 MD5（Drive 回傳的 `sha256Checksum` 與本地 `SHA256SUMS` 一致）。資料夾現有 0401–0410 共 10 個 AVIF，逐項比對 MD5／bytes 與本地成品一致。
- [0407 飯島柳鶯](https://drive.google.com/file/d/1zJGDRFstZkp54nsUXx_s2-T6XmP0f5w9/view)：125606 bytes、MD5 `3ec58509ccdf759805fdb0cb94422927`、SHA256 `4d283c04e5f7e8066be18c9d339f99a7d4f0e54983733ed265bbbb24b58a9ffa`。HKBWS 11–12 cm，第 I 類偶然記錄，唯一紀錄 2015-03-29 至 04-04 蒲台島一隻；單型，繁殖日本伊豆群島及吐噶喇群島中之島，台灣偶見。BirdLife 2025 VU C2a(ii)、成熟個體 3,270–10,750（2024、品質欠佳）、下降。i=3.8 a=2.8 v=2.4 c=4 o 待查沿 runtime，r 因 cardCopy voice／etymology／habitat／highlights 均為留空截句而待查；length 11.5 cm 在 HKBWS 區間，v 沿用。卡面 IUCN 註記縮短為「全球 VU：BirdLife 2025 記下降」以免壓住雷達保育標籤，完整數字只留在 spec。地圖只標 BirdLife 原生三國（日本、台灣、菲律賓），不標中國大陸。主圖重繪後已無淡色中央冠紋、背較灰、翼欖綠、單一淡翼斑、上下嘴淡橙、腳淡粉；嘴基寬度、眼前縱紋粗細及尾下覆羽綠色調待核。
- [0408 灰冠鶲鶯](https://drive.google.com/file/d/1ZXPB6bUAE5sAhAQGnxQvvyjwHNjN73vL/view)：133475 bytes、MD5 `ad1ce96f6047e071a551d4674aaa35cc`、SHA256 `11bad170f4605220c51a68f8414c02b04724041071cfc2a0377cee05d6bd3a0d`。HKBWS 10–11 cm，第 I 類偶然記錄，至今三筆（1990-11-11、2015-02 南涌、2020-10-22 東龍洲），是本地最少見的鶲鶯；眼圈黃而後緣斷開、黑色側冠條紋近嘴基、亮灰中央冠紋帶灰色下緣、下體鮮黃、翼斑模糊或無、嘴短細。BirdLife 2024 LC 但記下降（HKBWS 記穩定，差異已記錄），原生中國、印度、緬甸、老撾、越南及泰國（非繁殖）。i=2 c=1.2 沿 runtime；length 空、翼 54.6 mm×0.22≈12.0 cm 超出 HKBWS 10–11 cm → v 待查並保留估算提示；habitat 中文留空、diet 為樣板且誤稱「部分遷徙」→ a 待查；voice／breeding／etymology／funFact 全空、highlights 截句 → r 待查；o 不補算。四個標籤定為「灰色中冠紋／黃色眼圈／亮黃喉腹／大覆羽淡邊」：眼圈後緣斷開在插圖不易分辨，故不標「後緣斷開」；大覆羽淡邊只描述羽緣、不宣稱完整翼斑（HKBWS 稱翼斑模糊或不存在）。
- [0409 比氏鶲鶯](https://drive.google.com/file/d/1vyrv4Ot6iU0IB5eaIpDnAJtXOt9eIWsX/view)：127341 bytes、MD5 `232a4f156c1e5023b8e57c9211fa939c`、SHA256 `75c4e4a6173d6a929b9ba4bfcc3b4da5f0bbf09a8f109710c9f83571108b3be2`。HKBWS 11–12 cm，第 I 類罕見過境及冬候；眼圈黃通常完整、黑色側冠條紋在額部漸淡、中央冠紋灰而額部轉綠、大覆羽有明顯翼斑、嘴長而厚；分指名亞種及 latouchei。BirdLife 2024 LC 記下降，原生中國、緬甸、老撾、越南及泰國（非繁殖）。i=2 c=1.2 沿 runtime；length 空、翼 54.8 mm×0.22≈12.1 cm 略超 HKBWS 上限 → v 待查並保留估算提示；a、r、o 同 0408 理由待查。標籤「黑側冠紋／黃色眼圈／明顯翼斑／長厚嘴」全部對應插圖可見像素；runtime range 只寫越冬地（雲南南部、泰國西北、老撾北部），未涵蓋繁殖地，故地圖改採 BirdLife 原生國家。
- [0410 峨嵋鶲鶯](https://drive.google.com/file/d/1v5Ix0ycotVYejsUfpIQO8S_d_3jIUPng/view)：127451 bytes、MD5 `064cfa728565b9aaf9ac76b01a6303ac`、SHA256 `69cb269169a9a3d26abf7fbe54868c2d6830fa8cf8889362d63950b79d939b05`。HKBWS 11–12 cm，第 I 類罕見冬候；黃色眼圈完整、純灰中央冠紋、前額黑色側冠條紋明顯、耳羽及眼先偏綠、上體黃綠、下體淡黃、翼斑通常缺、嘴短細；單型，繁殖雲南西北、四川、陝西、湖北及貴州。BirdLife 2024 以 Martens's Warbler 之名評為 LC 記下降，原生中國、緬甸及老撾／泰國／柬埔寨（非繁殖）；IOC 把 Martens's Warbler 用於 *P. omissus*、本種稱 Omei Warbler，屬英文名分歧，runtime 學名不改。i=2 c=1.2 沿 runtime（r 原值 1 亦如實保留於 spec 記錄）；length 空、翼 56.7 mm×0.22≈12.5 cm 超出 HKBWS → v 待查並保留估算提示；range 中文留空且英文只列中國及緬甸（未含 BirdLife 的三個非繁殖國家）、habitat 中文留空、diet 樣板 → a 待查；voice 及 highlights 缺 → r 待查；o 不補算。標籤「灰色中冠紋／黃色眼圈／黃綠上背／淡黃腹部」全部對應插圖像素。
- 四張卡的完整卡面、四個局部圓及兩個比較圓均逐張讀圖後才定 spec；0408 的第 4 個局部與 0410 的第 3、4 個局部曾因圓框內露出背景藍色而重新選定裁切範圍，再重看確認。比較鳥一律重用同批其他卡的主圖（0407：冕柳鶯、歐柳鶯；0408：比氏鶲鶯、峨嵋鶲鶯；0409：灰冠鶲鶯、峨嵋鶲鶯；0410：灰冠鶲鶯、比氏鶲鶯），非等比例、非專家認證。
- 驗證：spec=manifest.spec、runtime 名稱／學名、分數遮蔽（0407 為 r/o，0408–0410 為 a/v/r/o）、世界 bounds `[-180,-90,180,90]`、ISO3、AVIF 解碼 1024×1536、bytes、SHA256、無 ZIP；四張 manifest 已補 `uploaded_drive_verified`、`driveFileId`、`driveParentId`、`driveParentName`、`driveMd5`、`driveBytesVerified`、`driveMimeType`（0407 一併補回）。`git diff --check` 通過。
- AI 圖只作基本目視，非鳥類專家認證，不宜單憑圖鑑定（尤其 0408／0409／0410 三者互相酷似，野外須靠叫聲及眼圈後緣等細節）。世界底圖只標部分原生國家，繁殖與越冬未分色，綠色非全境、非完整分佈。全部未改 runtime、UI、R2 或 slim 註冊；`cards/art/`、`deliver/cards/` 屬 Git 忽略，新環境不保證可重現或已重新核驗。
- **下一張 0411；0411–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0411 已交付（取代「下一張 0411」）

- `400-500` 內 `name = '0411.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0411 淡尾鶲鶯](https://drive.google.com/file/d/15E2AntHugapB4v8hgjPkb-0nF0XstL2y/view)：135725 bytes、MD5 `c99f38c211f91633a5c00216668518d4`、SHA256 `92a5f270b0f871ce029a62b6dc39444a315d446d273235cd1b5554f5fa64ac9c`。HKBWS 11–12 cm，第 I 類稀少至罕見秋季及初冬過境（首筆 2004-10-09、第二筆 2011-10-16，2018/19 冬季起幾乎每年；極端日期 9 月 30 日至 12 月 27 日）；嘴相對較大、黃色眼圈完整、前額偏綠使冠部黑灰紋只達眼上方、側冠下緣少灰、下體黃而脇帶綠、翼斑通常缺；單型，繁殖四川南部至陝西及北京並見福建河南湖南，越冬中國西南及中南半島；HKBWS 2023 全球 LC 趨勢穩定。HKBWS 中文名為「純色尾鶲鶯」，與 runtime「淡尾鶲鶯」不同，runtime 名稱不改。BirdLife factsheet 當日只回空模板（無 EOO、無國家表、無評估年份），未用作任何數字或分佈證據。i=2 c=1.2 沿 runtime；length 空、翼 55.6 mm×0.22≈12.2 cm 超 HKBWS → v 待查並保留估算提示；habitat 中文留空、diet 樣板 → a 待查；voice／breeding／etymology 中文留空、highlights 截句 → r 待查；o 不補算。地圖只列中國、緬甸、泰國、老撾、柬埔寨、越南六國（中國含繁殖及越冬，其餘越冬），不分季節、不細分省份，香港過境紀錄不當原生分佈。標籤「黑色側冠紋／黃色眼圈／寬基厚嘴／黃色下體」皆對應插圖像素；眼圈上半部色淡，故不寫「完整」。比較鳥重用 0408 灰冠鶲鶯及 0410 峨嵋鶲鶯主圖，非等比例、非專家認證。
- 主圖與四圈逐張目視；首次生成帶米色紙邊且無側冠黑紋，已重繪為滿版深青底並補回側冠條紋；第 4 個局部再因圓內露出背景而重選。驗 spec／manifest／分數遮蔽／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0412；0412–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0412 已交付（取代「下一張 0412」）

- `400-500` 內 `name = '0412.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0412 暗綠柳鶯](https://drive.google.com/file/d/14M63BxCIc_yoLQaADnm73vOYqqlPNzbd/view)：140825 bytes、MD5 `500805cf5d5f3d0f633596d269e4912f`、SHA256 `bad1f47ced8400c3997c6832cabb9064bccfd22958bc3b9a1d0e9c971cbbd61a`。HKBWS 10–11.5 cm，第 I 類偶然記錄，四筆（2015-12-18 至 2016-01-08 大澳、2016-05-02 梧桐寨、2020-11-01 至 04 鹿頸、2021-04-09 東龍洲）；上體及三級飛羽純色、大覆羽短翼斑兩端收窄、上體下體帶黃、白色長眉自嘴基伸延、眼前暗斑與嘴基分開、下嘴大部分淡色；四亞種，香港紀錄按叫聲歸 viridanus（繁殖東歐經西伯利亞至中國西北）。BirdLife 2024 LC 且**上升**，成熟個體 20,200,000–38,300,000（2018 推算），繁殖 EOO 18,700,000 km²、非繁殖 7,170,000 km²，完全遷徙，國家表把香港列為迷鳥。i=2 c=1.2 沿 runtime；length 空、翼 61.3 mm×0.22≈13.5 cm 遠超 HKBWS → v 待查並保留估算提示；habitat 欄實為 trochiloides／viridanus 基因流動說明 → a 待查；look 為「牠略小於該物種」等跨物種比較句、migration 欄講伯格曼法則、breeding 欄講非繁殖鳥上移 → r 待查；o 不補算。地圖按 BirdLife 原生國家表挑 30 國（歐洲至西伯利亞、中亞、南亞繁殖，印度、孟加拉、斯里蘭卡及中南半島非繁殖），繁殖與越冬不分色、不細分國家內部，香港及西歐迷鳥國家不填色。標籤「淡色長眉／單一短翼斑／淡色下嘴／欖綠上體」皆對應插圖像素；第 2 個局部曾重選以把翼斑置中。比較鳥重用 0411 淡尾鶲鶯及 0403 歐柳鶯主圖，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽／bounds／ISO3（30 個代碼逐一存在於 Natural Earth 110m）／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0413；0413–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 環境重建（0413 起）

- 本輪開工時發現沙盒已重置：`cards/art/`、`deliver/cards/` 全空（Git 忽略、未入快照），`/home/user/card-venv` 及 `~/.fonts` 亦不存在；本地 git 亦回到 base commit，但遠端 `arena/b2d882cf-aviandex` 仍保有 `937fb51`、`a7a2ecf`、`5946388`，已 `git fetch` + `reset --hard` 對齊，未遺失任何已交付記錄。
- 已重建：`/home/user/card-venv`（Pillow 13.0.0、numpy 2.4.6、fontTools 4.68.0）、`~/.fonts/NotoSansTC_400Regular.ttf` 及 `_700Bold.ttf`（由 google/fonts 的 `NotoSansTC[wght].ttf` 以 fontTools instancer 產生靜態實例）、每張卡的 `countries.geojson`（Natural Earth 110m，838,726 bytes，MD5 `21abb20e7c74fc0c66b8dd955f8f7f73`）。
- 因舊素材不存在，0413 起的主圖及對照圖改為重新生成；`cards/art/_shared/` 存放可重用的對照鳥主圖（淡腳柳鶯、暗綠柳鶯）。0401–0412 的成品只是本地被清除，Drive 上 12 個 AVIF 及指紋不變。

## 新批次 0401–0450：0413 已交付（取代「下一張 0413」）

- `400-500` 內 `name = '0413.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0413 峨眉柳鶯](https://drive.google.com/file/d/1Dnq68DRxgi0Q022RiXWf0Fw24eo1RATU/view)：140029 bytes、MD5 `d60ab3570b8268440a14d7849af55906`、SHA256 `ca9358269ed210cf50cbcbe16aef83be38e6c30c4bb32de9dbcb5dba0c148356`。BirdLife 2024 LC 記下降（推測 10 年減 1–19%，源於分佈區林木覆蓋 10 年減 1.2%），成熟個體未量化、被評為「相當不常見」；繁殖特有種，繁殖 EOO 482,000 km²，完全遷徙，海拔 1,000–2,000 m，世代長度 2.5 年；原生國家只有中國，緬甸列為迷鳥。**HKBWS 未找到條目**：039700 及 040000 均 404，039500／039600／039800／039900／040100 分別為雙斑柳鶯、暗綠柳鶯、庫頁島柳鶯、淡腳柳鶯、極北柳鶯，039000–039400 為白眶、灰冠、比氏、純色尾及峨嵋鶲鶯，故本卡沒有 HKBWS 的香港狀況、辨識或量度可引，辨識改以 runtime 英文 look（中覆羽淡黃羽端＋大覆羽寬淡黃羽端＝兩道翼斑）為據，並在 spec 明記此缺口。runtime i=2 a=2.8 v=2.4 r=1 c=1.2 o=1.9，無 vEst；length 11–12 cm 與其他柳鶯相若，**v 沿用 runtime 不補值**；中文 habitat／diet／voice／breeding／etymology 全缺 → a、r 待查，o 不補算。地圖只填中國，緬甸迷鳥不填色。標籤「淡色長眉／兩道翼斑／淡色下嘴／欖綠上體」皆對應插圖像素；第 2 個局部曾重選以同時框住兩道翼斑。比較鳥淡腳柳鶯及暗綠柳鶯為本輪新生成並已目視，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（a、r、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0414；0414–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0414 已交付（取代「下一張 0414」）

- `400-500` 內 `name = '0414.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0414 淡腳柳鶯](https://drive.google.com/file/d/11WKF23034NxFEnkRQ3J6Tw1oJJQvbFxx/view)：138334 bytes、MD5 `e8125852fa476af7b7f782f64e887b00`、SHA256 `81a65e415c6b7156c2768c047c6637f3d8f7fa005e8d77ef7a41db9433867814`。HKBWS 10–11 cm，第 I 類秋季常見過境、冬季及春季稀少（最早 8 月 27 日、主要 9 月第三週至 10 月第一週、最遲 5 月 6 日）；嘴短而先端淡色、上體褐灰帶欖、冠及眼紋較深、翼斑模糊、腳淡粉、眉紋寬並在後方向上折、下體較白、慣性擺尾；叫聲單音 5.5–5.9 kHz，較庫頁島柳鶯（4.5–5.3 kHz）高，是野外分辨的主要依據；單型，繁殖烏蘇里、中國東北及北韓，越冬華南沿岸及海南經東南亞至新加坡。HKBWS 2025 記 LC 趨勢穩定，BirdLife 2024 同為 LC 但記下降（林木覆蓋 10 年減 6.7%），差異已記錄，卡面用較新的 HKBWS 表述。runtime i=2 a=2.3 v=2.6 r=1 c=1.2 o=1.8、vEst=1；length 空、翼 59.9 mm×0.22≈13.2 cm 遠超 HKBWS → v 待查並保留估算提示；habitat／diet 全空 → a 待查；breeding／etymology／migration／highlights 全空 → r 待查；o 不補算。另記錄 runtime 三處缺陷：look 只談尾下覆羽與臀部、voice 只寫「反覆的 tiririri…」、funFact「灰腳柳鶯又名灰腳柳鶯」同義反覆。地圖按 BirdLife 原生十一國填色，不分季節、不細分國家內部，香港過境紀錄不當原生分佈。標籤「白色長眉／淡色翼斑／淡色下嘴／淡粉腳」皆對應插圖像素；第 4 個局部曾兩次重選，最終加大裁切使雙腳落在圓心。因 HKBWS 指本種與庫頁島柳鶯羽色幾乎無法分辨，故不另造庫頁島對照圖，比較鳥改用暗綠柳鶯及峨眉柳鶯（本輪新生成／重用 0413 主圖），非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（a、v、r、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0415；0415–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0415 已交付

- `400-500` 內 `name = '0415.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0415 庫頁島柳鶯](https://drive.google.com/file/d/1dc3xKA-afw1T7-AzWYpxAoxMjdWtDhRi/view)：138055 bytes、MD5 `14b57a7345ab45976d082d421203a213`、SHA256 `586497f88421bf24aa01477ec3376d4b58458a52651302fe3cd7974ed1867021`。香港第 I 類秋季稀少過境；繁殖庫頁島、千島群島、北海道及本州，越冬華南沿岸（罕見）、海南經中南半島至新加坡，蘇門答臘北部「可能」；與淡腳柳鶯外形幾乎無法分辨，野外靠叫聲音調（本種 4.5–5.3 kHz，淡腳 5.5–5.9 kHz）及初級飛羽伸出較長分辨；HKBWS 2025 記 LC 但趨勢下降。BirdLife 物種頁本輪只回空白骨架（無評估年份、趨勢、EOO、國家表），故 IUCN、分佈及國家一律以 HKBWS 為據。runtime i=2 a=2.3 v=2.6 r=3.3 c=1.2 o=2.3、vEst=1；length 空、翼 62.2 mm×0.22≈13.7 cm → v 待查；habitat／diet 全空 → a 待查；o 不補算；r=3.3 沿用（voice、breeding、look 有內容，僅 etymology 缺）。另記錄 runtime 缺陷：range／migration 稱越冬奄美及沖繩群島，與 HKBWS 不符；voice 句有「鳴聲聲」疊字且未給音調數字；look 未提眉紋、翼斑與腳色；funFact 為空。地圖按 HKBWS 填色（俄羅斯、日本、中國、緬甸、泰國、老撾、柬埔寨、越南、馬來西亞、新加坡），不分季節、不細分國家內部，蘇門答臘「可能」未填色，香港過境紀錄不當原生分佈。標籤「白色長眉／兩道翼斑／淡色嘴尖／淡粉腳」皆對應插圖像素；比較鳥為 0414 淡腳柳鶯及 0413 峨眉柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（a、v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0416；0416–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0416 已交付

- `400-500` 內 `name = '0416.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0416 日本柳鶯](https://drive.google.com/file/d/1rAT6F4bo8-z5E84VmR_xOiyZrx6BwQYY/view)：141403 bytes、MD5 `5c30d9b1026db78699a2ba95b58adc25`、SHA256 `19b5f7a8a2d39cdb7717b8a6db57462f6d3daf9eaa0deb67ec6322c40d927c43`。BirdLife 2024 LC、趨勢穩定、成熟個體未量化、繁殖特有種（僅日本）、繁殖 EOO 569,000 km²、非繁殖 EOO 9,460,000 km²、完全遷徙、海拔 1,800–2,500 m、世代長度 2.0 年、森林依賴低；繁殖棲地為北方灌木叢（主要）及北方森林，非繁殖用熱帶低地濕林、紅樹林、乾林、人工林及農地；國家：日本繁殖，台灣、菲律賓、馬來西亞、印尼、汶萊非繁殖；唯一威脅為未來氣候變遷造成的棲地轉移。香港名錄列第 I 類（408 號），但 Avifauna 無獨立物種頁（`040000` 回 404），故香港狀況無細節可引，只記名錄類別。runtime i=2 a=2.8 v=2.7 r=1 c=1.2 o=1.9、vEst=1；a 沿用（diet 有內容）、翼 66.2 mm×0.22≈14.6 cm 遠超極北柳鶯複合群 11.5–13 cm → v 待查並保留估算提示、o 不補算、r=1 沿用（voice／etymology／funFact／highlights 全空）。另記錄 runtime 缺陷：range 只有「冬季分佈不確定。」、look 全是量度、diet 把遷徙與棲地寫成食性、breeding 句末多餘分號。地圖按 BirdLife 原生六國填色，因所選國家面積小，世界底圖上綠色較弱但可辨；繁殖與越冬未分色、不細分國家內部。標籤「黃色長眉／兩道翼斑／橙粉下嘴／淡黃下體」皆對應插圖像素，翼斑局部曾三次重選使兩道翼斑落在圓心；比較鳥為 0415 庫頁島柳鶯及 0414 淡腳柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0417；0417–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0417 已交付

- `400-500` 內 `name = '0417.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0417 極北柳鶯](https://drive.google.com/file/d/13bP3rYVLCYEWr1GdT8x3kopHnhI7IwPJ/view)：132852 bytes、MD5 `b556bf456e708c95b0c30e6391e72072`、SHA256 `598f8e5bbfeb7f49cff9e5dbbfbee9625b9dc961c714fa6e426c184253de29ed`。BirdLife 2025 LC、趨勢穩定、成熟個體 170,000,000（2011 估算）、繁殖 EOO 22,600,000 km²、非繁殖 EOO 8,280,000 km²、完全遷徙；繁殖於芬諾斯堪底亞及古北界北部白樺、柳、楊、松林與矮柳灌叢，6–8 月地面營巢、每窩 5–6 枚；HKBWS 記 11.5–13 cm、初級飛羽伸出長、眉紋不到嘴、眼紋穿過眼先、胸前縱紋模糊、下嘴淡色帶深色近端斑、只有一道短翼斑、腳褐色，香港屬第 I 類常見秋季過境、冬季極罕見（頁記趨勢上升，與 BirdLife 的穩定方向一致）。runtime i=2 a=2.3 v=2.7 r=4.8 c=1.2 o=2.6、vEst=1；a 待查（diet 寫的是遷徙距離、habitat 全空）、翼 66.2 mm×0.22≈14.6 cm 高於 HKBWS → v 待查、o 不補算、r=4.8 沿用（etymology／breeding／migration／look／highlights 有內容）。另記錄 runtime 缺陷：range 與 voice 只談舊分類、diet 實為遷徙描述、funFact 在「（來自 skopeo」截斷、callouts 全空。主圖首次生成在喉側帶黃，為免與 0416 日本柳鶯混淆而重新生成，改為全無黃色的灰白下體並加深胸前縱紋。地圖按 BirdLife 原生十八國填色，繁殖與越冬未分色；新加坡在 110m 底圖無獨立多邊形故不顯示，香港亦無獨立幾何。標籤「白眉不到嘴／胸前淡縱紋／匕首狀嘴／單道翼斑」皆對應插圖像素；比較鳥為 0416 日本柳鶯及 0415 庫頁島柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（a、v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0418；0418–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0418 已交付

- `400-500` 內 `name = '0418.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0418 栗頭鶲鶯](https://drive.google.com/file/d/1bquXVfc8z3LAEkKy4y9t1DtYQgP6SI3r/view)：149868 bytes、MD5 `fb6988db4b3956de917435949589e4af`、SHA256 `f7d367fc54affba514e851b35bdd2f1f8ab3c4245bbd43c222d7acb8cf212c17`。HKBWS：9–10.5 cm，香港第 I 類稀少冬候鳥（11 月第二週至 3 月第二週，主要 12 月至 2 月，極端日期 1988-11-05 及 2017-03-15）；栗色頭頂配暗色冠側線、白色眼圈上方斷開、臉及胸灰色、胸至尾下覆羽與飛羽邊緣檸檬黃、上體欖綠、腰淡黃、兩道淡黃翼斑；叫聲短乾嘎響加高音「tit」；七成半紀錄來自大埔滘；繁殖喜馬拉雅至華中、華南、中南半島、馬來半島及蘇門答臘，多為留鳥；中國（含香港）為 sinensis 亞種。BirdLife 2024 同為 LC 但記下降（分佈區林木覆蓋 10 年減 11.5%，推測族群 10 年減 1–19%、最佳 11–14%），與 HKBWS 的「穩定」不一致，卡面用 BirdLife 的下降表述。runtime i=2 a=2.3 v=2.3 r=4.8 c=1.2 o=2.5、vEst=1；a 沿用（diet／habitat 同一句但仍可支撐低分）、翼 48.8 mm×0.22≈10.7 cm 略高於 9–10.5 cm → v 待查、o 不補算、r=4.8 沿用。另記錄 runtime 缺陷：look 只談 Seicercus 分類、diet 與 habitat 同句、voice／breeding／callouts 空、funFact 為 2018 年分子研究結論、highlights 第二條以逗號收尾。地圖按 BirdLife 十二國填色（尼泊爾、不丹、孟加拉、印度、中國、緬甸、泰國、老撾、柬埔寨、越南、馬來西亞、印尼）。標籤「栗色頭頂／白色眼圈／黃綠翼斑／檸檬黃下身」皆對應插圖像素；第 1、2 個局部曾數次重選以免兩個圓圈過於相似，第 2 個由「灰色臉頰」改回「白色眼圈」；比較鳥為 0417 極北柳鶯及 0416 日本柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0419；0419–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0419 已交付

- `400-500` 內 `name = '0419.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0419 黑眉柳鶯](https://drive.google.com/file/d/17IpVed-qBtfvUv8xLQZgjLwrsxPo4v-h/view)：157034 bytes、MD5 `952463b5c8f78a0dd79604dd5f141ece`、SHA256 `8df3eb907e16e758fae606a42b85ef7cefbe7dee5474a429b08aefb890d44f68`。HKBWS 040300（URL 為 `040300`，先前誤試 `041100` 得 404）：10–11 cm，香港第 I 類稀少冬候鳥，見於密冠層森林；黑色冠側線與眼紋在頭後最粗、夾黃色冠中線及眉紋，大覆羽白端形成明顯翼斑、中覆羽翼斑窄，外側兩根尾羽有淡色羽緣，上體欖綠明亮，下體硫黃；首筆確證紀錄 2005-11-25 大埔滘（早期紀錄曾混淆為 Hartert's 冠紋柳鶯），極端日期 2020-09-13 及 2006-04-01，主要 11 月中至 2 月初，最高 4 隻（2008-12-24 大埔滘）；單型，主要為中國繁殖特有種，繁殖黃河以南低山，越冬向西南至中南半島。BirdLife 2024 LC 但記下降（林木覆蓋 10 年減 8.7%、森林依賴中等、推測 10 年減 1–19%），與 HKBWS 頁的「穩定」不一致，卡面用 BirdLife 表述。runtime 僅 habitat 一句，其餘（含 range、look）全空；i=2 a=2.3 v=2.5 r=1 c=1.2 o=1.8、vEst=1；a 沿用、翼 55.7 mm×0.22≈12.3 cm 高於 10–11 cm → v 待查、o 不補算、r=1 沿用。地圖按 BirdLife 四國填色（中國、老撾、泰國、越南）；維基百科另列柬埔寨越冬但 BirdLife 未列，故不填。標籤「黑色冠側線／硫黃下體／白色翼斑／淡色尾緣」皆對應插圖像素，第 2 個局部由純黃區改為含眼與嘴的喉胸區以增加資訊；比較鳥為 0418 栗頭鶲鶯及 0417 極北柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0420；0420–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0420 已交付

- `400-500` 內 `name = '0420.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0420 雙斑綠柳鶯](https://drive.google.com/file/d/1KXyPpS2un57zW0BRZiBIHPR4juMyMF8u/view)：138572 bytes、MD5 `9e66939a3c445fe44b540b466b348555`、SHA256 `7a9c6436d252fc7a8c24f101cfdf904deb08bc8977310b9eaf8db5c6d240543e`。**首張 runtime 完全沒有 cardCopy／dexScores／measurements 紀錄的卡**：三處查無 0420，故六個分數軸全部「待查」（非遮蔽既有值，withheldScores 為空），卡面辨識內容全數改由 HKBWS 039500 提供。HKBWS：11.5–12 cm，香港第 I 類不常見過境及冬候鳥；較極北柳鶯略小、頭較大、嘴較窄，通常兩道翼斑、下嘴黃而幾乎無深色斑、冠與腳較灰、眉紋達額、初級飛羽伸出較短、胸前無明顯灰縱紋；叫聲滾動飽滿的「tirririt／chirilee／chirrit」；首筆接受紀錄 1989-09-27 嘉道理環誌（最早野外 1987-04-06 摩星嶺），1989 年起每年有紀錄且數量上升；秋季最早 2010-09-11、10 月第三週高峰、1 月起下降至 3 月最低、4 月至 5 月上半月弱春季過境、最遲 2020-05-17；樹冠層覓食、吃昆蟲與毛蟲及小蜘蛛；單型，繁殖西伯利亞東南部經北蒙古至鄂霍次克海及中國東北，越冬中南半島及中國南部沿海。BirdLife 2024 LC 但記下降（林木覆蓋 10 年減 8.9%、推測 10 年減 1–19%），與 HKBWS 頁的「穩定」不一致，卡面用 BirdLife 表述。名稱差異：runtime 用「雙斑綠柳鶯」，HKBWS 頁題「雙斑柳鶯」，同種。香港地位亦不一致：HKBWS 記第 I 類常見冬候（每年有紀錄），BirdLife 列迷鳥，故地圖不為香港填色。地圖按 BirdLife 原生十國填色（俄羅斯、蒙古、中國、北韓、南韓、緬甸、泰國、老撾、柬埔寨、越南），澳門／馬來西亞／英國僅迷鳥或過境不填。標籤「灰冠長眉／黃色下嘴／兩道翼斑／石板灰腳」皆對應插圖像素；比較鳥為 0419 黑眉柳鶯及 0417 極北柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數全待查／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0421；0421–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0421 已交付

- `400-500` 內 `name = '0421.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0421 華南冠紋柳鶯](https://drive.google.com/file/d/1fTV0X42k9NhsSQFVNR1cgyb9Nq9tVU17/view)：145468 bytes、MD5 `353bfbcf0dfa897043698c2b8a1c9645`、SHA256 `9110dca43afb599aaebbc5c010496c17b7b893f2bc38a6c70a87070081721b51`。HKBWS 040400（頁題「古氏［冠紋］柳鶯」）：10.5–12 cm，香港第 I 類不常見冬候鳥，見於密冠層森林及灌叢，2001–05 及 2016–19 冬季圖集都只在不足 0.7% 的 1 公里方格錄得；深灰綠冠側線與眼紋達嘴基、後段最深，中央冠紋前段模糊後段寬白，眉紋前黃後白，上體深欖綠、兩道帶黃翼斑、下嘴淡橙、腳較深，有似鳾般在樹幹覓食的習性；叫聲「pit-chee／pit-chee churoo」；11 月至 3 月、主要 12 月第二週至 2 月第一週，極端 9 月 5 日及 4 月 10 日；1978 年首次發現、1985 年起為規律冬候鳥，最高十隻（1990-11-12、2005-03-20 大埔滘）。BirdLife 2024 LC 但記下降（林木覆蓋 10 年減 9.3%、推測減 1–19%），與 HKBWS 的「穩定」不一致，卡面用 BirdLife 表述；國家表為中國（留鳥）及香港（非繁殖），另記可能東延至越南北部。runtime i=2 a=2.3 v=2.5 r=3.3 c=1.2 o=2.3、vEst=1；a 沿用、翼 58.4 mm×0.22≈12.9 cm 高於 10.5–12 cm → v 待查、o 不補算、r=3.3 沿用。另記錄 runtime 缺陷：range 與 breeding 以「*：」開頭、breeding 另有「繁殖範圍未知；」與多餘分號、look 只有量度、voice／etymology 空、funFact 稱「僅發現於中國」而 BirdLife 列香港非繁殖並記可能東延越南。地圖只填中國（香港於 110m 底圖無獨立多邊形）。主圖特意採用樹幹抓附（似鳾）姿勢；標籤「黑白冠紋／橙色下嘴／兩道黃翼斑／抓附樹幹」皆對應插圖像素；比較鳥為 0420 雙斑綠柳鶯及 0419 黑眉柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0422；0422–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0422 已交付

- `400-500` 內 `name = '0422.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0422 白斑尾柳鶯](https://drive.google.com/file/d/1ILNXR5SxOpbfCBM40Y-wfXqxI2oXTDTT/view)：133364 bytes、MD5 `1d0d1c0abc909adb409b6bbc65e7fe73`、SHA256 `0d00f2d7a56a225ed433df2d6f97f6a67bd578291c7ce12212c02196175468e8`。HKBWS 040500：10–11 cm，香港第 I 類「大概稀少」冬候鳥，只見於密冠層森林；2017-03-16 大埔滘、2019-01-05 及 2020-02-01/02 白沙澳首幾筆紀錄後，顯示可能屬規律而稀少的冬候鳥。外型似 Hartert's 指名亞種但更小、翅尾更短、嘴更纖細，覓食動作活躍如黃眉甚至黃腰柳鶯（不懸停），不會爬附樹幹或粗枝；冠側線較淡、中央冠紋前冠模糊，眉紋較不黃且眼前較窄，腳較淡、下嘴全部淡色，喉、上胸及尾下覆羽沾黃而腹部脇部較淡；叫聲高音二至四音節。三個亞種：指名（華南廣西至福建）、disturbans（四川甘肅陝西雲南）、klossi（老撾南部及越南中南部留鳥）。BirdLife 2018 LC、趨勢穩定，垂直遷徙、海拔 900–2,550 m（冬季可降至 50 m）、森林依賴中等；國家表柬埔寨、中國、老撾、泰國、越南，緬甸僅記「可能」，故地圖不填。runtime i=2 a=2.8 v=2.4 r=1 c=1.2 o=1.9、vEst=1；a 不沿用（只有一句英文 habitat、behavior 重覆該句、diet 全空），v 待查（翼 52 mm×0.22≈11.4 cm 高於 10–11 cm，保留估算提示），o 不補算；r=1、c=1.2、i=2 沿用。runtime 缺陷：range 只覆蓋 disturbans 繁殖區、look 僅 Taxonomy 式一句、habitat／funFact／voice／behavior 中文全空且 behavior 重覆 habitat、length 與 weight 為空。標籤「全淡下嘴／喉胸帶黃／尾下覆羽黃／淡粉腳」皆對應插圖像素；主圖特意畫成停在橫枝而非爬附樹幹，以示與 0421 之別。比較鳥為 0421 華南冠紋柳鶯及 0420 雙斑綠柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（a、v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0423；0423–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0423 已交付

- `400-500` 內 `name = '0423.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0423 淡腳樹鶯](https://drive.google.com/file/d/1NwL-1fFH9ycs6b5miE-axWSh-9yLT5A0/view)：130817 bytes、MD5 `7edc69066204294b0036b5c8ae0fd0cf`、SHA256 `34086a1819e8d7c1284ae73edca460e603cd3d0a3e9b8ae89eff93e34aa75c14`。HKBWS 037500（用 Urosphena pallidipes）11–12.5 cm，香港第 I 類稀少冬候鳥，見於濃密灌叢；最顯著為大片純白喉部對比灰褐帶黃脇部、眼後及眼前都有很深而明顯的眼紋、眼環下半白色清晰、上體濃深褐、腳顯著淡灰粉紅、上嘴及下嘴遠端深而下嘴基部粉紅、初級飛羽突出極短；似鱗頭樹鶯但眉紋較弱、尾明顯較長。1990-10-06 首筆網捕，其後六筆亦為網捕，2007-11-30 之後多為野外觀察，2020-21 冬季異常錄得五隻；極端日期 9 月 28 日及 2 月 24 日；紀錄點包括九龍屋苑園景平台、米埔蘆葦沼澤、嘉道理農場山坡灌叢、東龍洲溪旁矮叢、和合石灌叢草地；潛行貼地、對播放反應強烈。BirdLife 2024 LC、趨勢穩定，垂直遷徙、海拔 0–2,260 m、森林依賴低、世代長度 2.2 年；國家不丹、中國、香港（迷鳥）、印度、老撾（繁殖）、緬甸、尼泊爾、斯里蘭卡（迷鳥）、泰國、越南 — 香港與斯里蘭卡皆為迷鳥，故地圖不填。runtime 只有 a=3.3 v=2.3 r=1 o=2.2（vEst=1），i 與 c 完全缺失並列於 missingScores；a、v、r、o 全沿用（翼 49.1 mm×0.22≈10.8 cm 與 11–12.5 cm 不衝突）。runtime 缺陷：fieldCopy 中文全空、英文多處截斷成「up to .」、diet 與 conservation 同為尼泊爾威脅句、breeding 實為印度 Simlipal 紀錄、picks 為空、length/weight 為空、source 引用國家保護名錄頁。標籤「純白喉部／粗黑眼紋／淡灰粉腳／明顯長尾」皆對應插圖像素；比較鳥為 0422 白斑尾柳鶯及 0421 華南冠紋柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（無）／missingScores（i、c）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0424；0424–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0424 已交付

- `400-500` 內 `name = '0424.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0424 鱗頭樹鶯](https://drive.google.com/file/d/12eofS40jwvDkP1Tc6BbykpGXb1NkC47q/view)：147102 bytes、MD5 `e65ed5b965be32b6a2932e32f6aa4696`、SHA256 `cca576153bf10b0e4d04476a05221a887131fd5841a80dce1a0e168d012338bf`。HKBWS 037400：9–10 cm，香港第 I 類常見冬候鳥及過境遷徙鳥，見於密冠層灌叢及林地，大嶼山亦有；頭相對大、尾極短，銹紅羽冠配長奶油色眉紋，深色眼紋在眼前眼後同樣粗實，耳羽與喉淡，上體及尾素淨銹褐、翼較紅褐、脇灰褐、腳極淡；87% 紀錄在 11 月至 1 月，最早 2019-09-30、最晚 2020-04-26 兩隻，最高 27 隻（2012-12-08 甲龍）；1955–57 年冬季由 Walker (1958) 首次報導；單型種，繁殖南薩哈林、南烏蘇里、中國東北、朝鮮半島及日本，越冬華南沿岸含台灣海南及中南半島至越南南部與泰國南部。BirdLife 2024 LC 但記下降（林木覆蓋 10 年減 7.7%、推測減 1–19%、森林依賴中等、世代長度 2.2 年、完全遷徙），與 HKBWS「趨勢穩定」不一致，卡面用 BirdLife 表述；國家表另有尼泊爾、菲律賓（迷鳥）故不填色。runtime 只有 v=2.4、r=3.3（vEst=1），i、a、c、o 全缺並列於 missingScores；v 待查（翼 51 mm×0.22≈11.2 cm 高於 9–10 cm，保留估算提示）、o 不補算，r=3.3 沿用。runtime 缺陷：多句以逗號／分號收尾未完成、habitat 中文實為非繁殖分佈、behavior 中文混入棲地而英文只寫 temperate forest、look 只述頭部、length 與 weight 為空、picks 列出七欄。標籤「奶油長眉／深色眼紋／極短尾／淡粉腳」皆對應插圖像素；比較鳥為 0423 淡腳樹鶯及 0422 白斑尾柳鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（v、o）／missingScores（i、a、c）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0425；0425–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0425 已交付

- `400-500` 內 `name = '0425.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0425 棕臉鶲鶯](https://drive.google.com/file/d/1AgnkSGyfMHzEL2NsGFOvv9K-3UKhDqlk/view)：154350 bytes、MD5 `419c5f96be1c3bfd81075a3d6ef60892`、SHA256 `36666b095d8b37f10d77e35f33a92e2bd102e6715aa3dd839b8d3f7a6fe0475c`。HKBWS 037000：8–9 cm，香港第 I 類稀少冬候鳥，見於新界大部分林地及港島、蒲台、長洲；臉部及眼先橙紅，上方有黑色細線、下方有白色下髭線與濃密黑色喉紋，背部鮮欖綠、飛羽羽緣黃綠、其餘下體白色，嘴橙色角質、腳灰粉紅；鳴唱為中等偏高頻顫音、聯絡聲短促「chip」。1964-02-01 首筆後要到 1993 年才有第二筆（蠔涌），2017–18 新娘潭、2019-11-10 蒲台為最早，2019/20 冬季分佈大幅擴展，最高七隻（2019-12-12 西貢仁義路引水道）；於密冠層森林中下層安靜覓食。BirdLife 2024 LC 但記下降（林木覆蓋 10 年減 9.3%、推測減 1–19%、森林依賴中等、非遷徙），並記本種在國際寵物交易中以低普及度出現；國家表含孟加拉、不丹、中國、印度、老撾（繁殖）、緬甸、尼泊爾、中國台灣、泰國、越南，未列香港故地圖不填。runtime 六項分數齊備 i=2 a=2.3 v=2.2 r=1 c=1.2 o=1.7（vEst=1）；a、r、c、i 沿用，v 待查（翼 43.4 mm×0.22≈9.55 cm 高於 8–9 cm，保留估算提示）、o 不補算。runtime 缺陷：完全沒有 look 欄位、habitat 只有英文、funFact 自我重複三個中文名（「又名棕臉鶲鶯、棕面鶲鶯」）、range 用「寮國」而非「老撾」、length 與 weight 為空、picks 只選三欄。標籤「橙紅臉部／黑色喉紋／欖綠背羽／灰粉腳趾」皆對應插圖像素；比較鳥為 0424 鱗頭樹鶯及 0423 淡腳樹鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0426；0426–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0426 已交付

- `400-500` 內 `name = '0426.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0426 金頭擬縫葉鶯](https://drive.google.com/file/d/1r75lD2cTNOLbOv4OAoO2WaO8oNE8FU5Q/view)：147999 bytes、MD5 `2f571cc80a486712eb933337b6dd3cee`、SHA256 `d3466bacc3ecc387e2dbcdf02f4ee42e1a77618213ce70a8916fdb95f1bed97f`。HKBWS 037100（作「金頭縫葉鶯」）：12–13 cm，香港第 I 類在林地及密冠層灌叢相當常見的留鳥、冬季分佈更廣；1999-10-08/09 大埔滘首筆，是本港後期最快速的殖民擴張之一，2005-05-18 證實繁殖，2016–19 調查繁殖季見於 5.6% 方格、冬季 10.1%。外型：極小、長尾長嘴，體態似長尾縫葉鶯但明亮得多——銹橙前冠、白眉、黑眼紋、臉與上胸灰色帶細縱紋、其餘下體鮮黃、上體欖綠；幼鳥較暗且缺橙紅前冠。鳴唱飄逸，3 至 5 月最盛。在中國近年大幅擴張：Cheng (1987) 只記雲南、廣西，現已達廣東大部分、福建及海南，runtime 的 range 已過時。BirdLife 2024 LC 但記下降（林木覆蓋 10 年減 9.8%、推測減 1–19%、森林依賴中等、垂直遷徙、世代長度 2.6 年）；國家表含南亞、東南亞至印尼與菲律賓，未列香港故地圖不填。runtime 只有 a=2.8 v=2.2 r=1 o=2（vEst=1），i 與 c 全缺並列於 missingScores；a 待查（habitat 與 behavior 為同一英文句重複）、o 不補算，v 沿用（翼 44.9 mm×0.22≈9.9 cm 低於 12–13 cm，估算偏保守）、r=1 沿用但備註 range 過時。runtime 缺陷：look／voice／etymology 三個欄位是同一句分類沿革、habitat 與 behavior 同一句生境、中文只有 range 一句、picks 只選 range、length 與 weight 為空。標籤「橙紅前冠／灰色臉胸／鮮黃腹部／長嘴」皆對應插圖像素；比較鳥為 0425 棕臉鶲鶯及 0424 鱗頭樹鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（a、o）／missingScores（i、c）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0427；0427–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0427 已交付

- `400-500` 內 `name = '0427.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0427 遠東樹鶯](https://drive.google.com/file/d/1qgHumxS4Y6P7YYwqeSVwAApff49__OKx/view)：146816 bytes、MD5 `b185d4981156ca4ee5143476a7d64a9b`、SHA256 `4bb1c5552ed713b22d8b0e90b02106661533d5eb7bf9adaa0deb3fe63d41a9bd`。HKBWS 037200：15–18 cm，香港第 I 類不常見冬候鳥及過境遷徙鳥，見於低地開闊環境及林緣，罕見於 400 m 以上；1937-02-03 曾咀首筆；2001–05 至 2016–19 冬季圖集佔用方格由 14.5% 跌至 5.2%；極端日期 2012-10-24 蒲台及 1996-05-08 鶴咀，最高 40 隻（1992-11-15 米埔）。外型：短翼長尾、圓頭、似公牛頸的粗壯體態，暖褐羽冠與翼緣對比略灰肩背，寬淡色眉紋、深色眼紋、皮黃脇部、暖褐尾下覆羽；雌雄體型差異明顯，雄鳥較大、腿粗、嘴厚；北方亞種 borealis 後冠與肩背更灰。BirdLife 以「Korean Bush-warbler」為英文名（同一學名），2025 評估 LC、趨勢穩定，繁殖 EOO 2,470,000 km²、非繁殖 2,570,000 km²、完全遷徙、世代長度 2.6 年、森林依賴低；國家表含中國、香港（原生）、老撾、菲律賓、中國台灣、泰國、越南，印度僅迷鳥。runtime 六項分數齊備 i=2 a=3.3 v=2.8 r=3.3 c=1.2 o=2.5（vEst=1），全部沿用（翼 71.6 mm×0.22≈15.8 cm 落在 15–18 cm 之內）。runtime 缺陷：look 只有量度且含喙寬／喙厚等未見於 measurements.json 的數字、diet 一句混入遷徙與「肉食性」、breeding 以「*：」開頭並以「；」收尾、funFact／voice／behavior／conservation 只有英文、length 與 weight 為空、picks 列六欄。標籤「寬白眉紋／銹褐尾下覆羽／暖褐翼緣／粗厚嘴」皆對應插圖像素；比較鳥為 0426 金頭擬縫葉鶯及 0424 鱗頭樹鶯主圖重用，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（無）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0428；0428–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。
## 新批次 0401–0450：0428 已交付

- **本回合環境重建**：沙盒 `/home/user/card-venv`、`~/.fonts`、`cards/art`、`deliver/cards` 全部消失（新 checkout），已重建 venv（Pillow 13.0.0、numpy、fontTools）、以 `google/fonts` 的 `ofl/notosanstc/NotoSansTC[wght].ttf` 用 fontTools instancer 產生 `~/.fonts/NotoSansTC_{400Regular,700Bold}.ttf`、並以 sparse clone 由 `nvkelso/natural-earth-vector` 取得 `ne_110m_admin_0_countries.geojson`（838,726 bytes、MD5 `21abb20e7c74fc0c66b8dd955f8f7f73`，與先前記錄一致）。0422–0427 的本地素材與成品不在這台機器，只有 Drive 成品仍在，未重做或重新核驗。
- `400-500` 內 `name = '0428.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0428 強腳樹鶯](https://drive.google.com/file/d/1q8prHDl9YGNlHlNrE8fmaYLU9BGaRj5N/view)：146488 bytes、MD5 `c66a5f17b0b3fe8dd1ab004fa8f261c9`、SHA256 `8ebf0fb162a5a687edf923205e2d63750cf2286fcd72170dd60a8185e6cf28d3`。HKBWS 037300：11–12 cm，香港第 I 類常見冬候鳥，見於開闊冠層灌叢、高草及林緣；小型腹圓、尾長而鬆軟、羽色低調，眉紋淡皮黃而不明顯（眼先較清楚）、眼紋寬而不深、耳羽較羽冠淡，上體銹褐至灰褐、飛羽外瓣暖褐，下體暗淡、胸部沾淡褐、脇部灰褐、尾下覆羽較暖；叫聲硬薄「chak／tak」，鳴唱先一段 1–2 秒平直純音再接漸強。1983-12-01 加多利灣首筆，1993–96 繁殖調查未錄得，2003-07-05 首次證實繁殖，2016–19 已達 6.3% 方格（兩大據點大帽山—林村、屏風山—船灣），最高 51 隻（2018-04-03 屏風山脊），冬季方格 6.0%→8.4%；本地族群屬 C. f. davidianus。BirdLife 英文名「Brownish-flanked Bush-warbler」，2024 LC 但記下降（林木覆蓋 10 年減 2.7%、推測減 1–19%、森林依賴中等、世代長度 2.2 年、垂直遷徙、海拔 0–3,350 m）；國家表孟加拉、不丹、中國、印度、老撾、緬甸、尼泊爾、巴基斯坦、中國台灣、越南，未列香港。另發現 BirdLife 該頁族群段落描述蘇門答臘、爪哇等巽他群島狀況，與本種分佈不符，屬頁面資料錯置，未採用。runtime 六項分數齊備 i=2 a=2.8 v=2.4 r=1.8 c=1.2 o=2（vEst=1），全部沿用（look 自述 11–12.5 cm，與翼 52.7 mm×0.22≈11.6 cm 相符）。runtime 缺陷：fieldCopy range 被改寫成「分佈在南亞、模式產地在印度」與 zh range 不一致、habitat 中文為空、behavior 寫「海拔2400米一下」並以逗號收尾、diet 亦以逗號收尾、funFact 自我重複「又名強腳樹鶯」、length 與 weight 為空、picks 列七欄。標籤「模糊淡眉／灰褐脇部／暖褐翼緣／鬆軟長尾」皆對應插圖像素；比較鳥為 0427 遠東樹鶯及 0424 鱗頭樹鶯的重新生成比較圖，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（無）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0429；0429–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0429 已交付

- `400-500` 內 `name = '0429.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0429 紅頭長尾山雀](https://drive.google.com/file/d/1bkeuy37qhPJ8Cxtmvzgpac38rswtsju7/view)：150067 bytes、MD5 `1b4fdbdf1bd075d38392dcc15aa0061d`、SHA256 `7bbe4b262b873ddaeef0336f4d47e7470ed5c35964b0c715884e2096366f56dd`。HKBWS 037600：8.8–11.5 cm，香港第 I 類稀少而局部的留鳥及／或冬候鳥，主要見於大帽山一帶成熟次生林；橙紅羽冠、黑色眼罩與獨立黑喉斑、白頰、白色虹膜、橙紅胸帶與脇部、濃灰黑上體與長尾、白腹；幼鳥冠淡、上體較褐、胸前有斑點或縱紋。1976-12-19 南丫島首筆，1992 大埔滘築巢首次證實繁殖，1997-06-18 大欖涌 20 隻為最高紀錄，蒲台島 2012-12-25 至 2013-02-26 最多三隻；常成小群（最高 15 隻）加入混合鳥群。七個亞種，最近者為指名亞種，香港屬哪一亞種未確定。BirdLife 2024 LC 但記下降（林木覆蓋 10 年減 7%、推測減 1–19%、森林依賴中等、非遷徙、海拔 100–3,600 m、世代長度 2.1 年），國家表中國、印度、老撾、緬甸、中國台灣、泰國、越南，未列香港；並記本種在國際貿易中以低普及度出現（國內食物及寵物）。runtime 六項分數齊備 i=2 a=4.3 v=2.3 r=1.8 c=1.2 o=2.3（vEst=1），全部沿用（a=4.3 為本批最高；翼 48.6 mm×0.22≈10.7 cm 落在 8.8–11.5 cm 內）。runtime 缺陷：range 只列巴基斯坦、尼泊爾、錫金、不丹、印度、孟加拉及西藏，與 BirdLife 國家表互有出入（地圖以 BirdLife 為準）、behavior 中文寫成「經常與山雀科和畫眉科的鳥類混淆」語意不清、habitat／breeding／funFact／conservation 只有英文、length 與 weight 為空、picks 列五欄。標籤「赤褐頭頂／黑色眼罩／橙紅胸帶／濃灰長尾」皆對應插圖像素；比較鳥為 0428 強腳樹鶯主圖及 0424 鱗頭樹鶯重新生成比較圖，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（無）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0430；0430–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。
## 新批次 0401–0450：0430 已交付

- **工具已入庫**：新增 `scripts/cards/setup-info-card-env.sh`（重建 venv／Noto Sans TC／Natural Earth 底圖，可帶 ID 一併寫入該卡 `countries.geojson`）、`scripts/cards/verify-info-card.py`（spec、manifest、AVIF、分數遮蔽、ISO3、上載欄位一次核對，失敗回傳 exit 1）、`scripts/cards/crop-preview.py`（`grid`／`crops`／`row`／`card` 四種檢視）。本回合沙盒再次重置，已用 setup 腳本重建（Pillow 13、底圖 MD5 `21abb20e7c74fc0c66b8dd955f8f7f73`）。
- `400-500` 內 `name = '0430.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5，Drive 的 `sha256Checksum` 與本地 `SHA256SUMS` 一致。
- [0430 白喉林鶯](https://drive.google.com/file/d/1lksp1xRju8clnp_hScFruczD3QP707Bh/view)：139664 bytes、MD5 `46cdd11a18c63c65831d40bf29c93085`、SHA256 `ef116ba9cf3f03a7faff9713bd5c3279763669331808dbbd14fcf9240351e0c5`。HKBWS 042900：12–13.5 cm，香港第 I 類迷鳥，至今四筆——2002-10-07 燕崗、2006-10-15 米埔網捕（羽毛 DNA 確認為 C. c. blythi）、2017-01-10/11 荔枝角、2017-01-22 至 2018-02-08 尖鼻咀（後兩筆可能為指名亞種或沙漠林鶯 C. minula）。外型：上體褐、頭較灰、深色眼罩、喉純白、下體偏白而脇帶皮黃、尾外側有白、嘴腳深色；叫聲近似褐柳鶯但稍柔。舊屬 Sylvia，現置 Curruca，runtime 科名「鶯科」對應 Sylviidae。BirdLife 2024 LC、趨勢穩定，成熟個體 27.9–47.7 百萬（資料品質 Poor）、完全遷徙、繁殖 EOO 32.7M km²、非繁殖 23.8M km²；國家表橫跨歐洲、西亞、中亞、北非至南亞，未列香港。runtime 只有 v=2.7、r=1（vEst=1），i、a、c、o 全缺並列 missingScores；v 待查（翼 65.1 mm×0.22≈14.3 cm 高於 12–13.5 cm）、o 不補算、r=1 沿用。runtime 缺陷：中文全空；range／habitat／diet 三段英文實為「與 Common Whitethroat 在冰期分化」的分類討論，放錯欄位；picks 為空、length/weight 為空。地圖按 BirdLife 選 28 個繁殖／過境／越冬國家作部分概覽。標籤「深色眼罩／純白喉部／淡褐脇部／白色外尾羽」皆對應插圖像素；比較鳥為 0428 強腳樹鶯及褐柳鶯的重新生成比較圖，非等比例、非專家認證。
- 驗 spec／manifest／分數遮蔽（v、o）／missingScores（i、a、c）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0431；0431–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0431 已交付

- `400-500` 內 `name = '0431.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5。
- [0431 白眶鶲鶯](https://drive.google.com/file/d/1z8A04IO7fDFxKkZEPwdmJmdRKqYE8sSm/view)：139562 bytes、MD5 `e6ef4c3014168e0f9e04d86b74c885bd`、SHA256 `5fac508a88dd06e089e6e0f1203ad055947f3930342b0f458dc5d8b1c68f0ce8`。HKBWS 039000：香港第 I 類稀有冬候鳥，2002-11-17 首錄，極端日期 11 月 8 日至 3 月 5 日，主要 11 月第三週至 2 月第三週，多在大帽山山系（蒲台、長洲、港島亦有），多單隻。辨識：金眶鶲鶯群中最易憑羽色認出——眼圈寬而鮮黃、在眼前上方有明顯缺口，一道鮮黃翼斑，下體濃黃，冠側黑紋分明，嘴略短而薄；綠頭 cognitus 型約 12 宗；叫聲富哨音、多音節。舊屬 Seicercus affinis，現置 Phylloscopus intermedius；runtime 科名「柳鶯科」對應 Phylloscopidae。BirdLife 2018 LC、趨勢穩定（推測），數量未量化（中國約 100–10,000 對），海拔遷徙、森林依賴度高、世代 3.1 年，國家表只有孟加拉、不丹、中國、印度、寮國、緬甸、尼泊爾、越南，未列香港。runtime 無 cardCopy、dexScores、measurements 條目，六軸全部「待查」（withheldScores 為空，非遮蔽既有數值），亦無翼長可核；卡面辨識內容全由 HKBWS 提供。地圖填上表八國作部分概覽。標籤「黃色眼圈／冠側黑紋／黃色翼斑／鮮黃下體」皆對應插圖像素；比較鳥為褐柳鶯（沿用 0430 圖）及新畫的灰冠鶲鶯，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores `[]`／missingScores（i、a、r、c、v、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0432；0432–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0432 已交付

- `400-500` 內 `name = '0432.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0432 棕頭鴉雀](https://drive.google.com/file/d/19iewKZoAWvPukoAtO9lrtZoJAKc3g0Yn/view)：133398 bytes、MD5 `931986e4f13ee68b76b35aaa70ce03ee`、SHA256 `f67c4782dea10131f50faceabcd436e805dc967f5bb8a2749f1b76f07317a018`。HKBWS 043000：香港第 IIA 類，被視為源自籠鳥逸出、已在大帽山建立的小而穩定族群；11–13 cm，身形圓胖、頭大嘴短粗，羽色粉褐而頭橙、下體較淡、飛羽鏽紅、尾長而分級，無眉紋與過眼紋、虹膜淡灰；只在大帽山約 600 米以上灌叢草地與矮竹；1971 年薄扶林首錄（至 1980 年六筆皆判逸出），1980 年大帽山見繁殖對，1999 年起每年均有，2017-11-08 高峰 30 隻。曾置 Paradoxornis、Sinosuthora，現用 Suthora webbiana；runtime 科名「鴉雀科」對應 Paradoxornithidae。BirdLife 2018 LC、趨勢穩定，數量未量化（各地約 1–10 萬對），不遷徙、世代 4.6 年、森林依賴度低，國家表為中國、蒙古、北韓、俄羅斯、南韓、台灣、越南，未列香港，另記意大利有野化族群。runtime a=2.8、v=2.4、r=1、o=2.1，i、c 全缺列 missingScores；a 待查（diet 欄寫尾與嘴形態、中文全空）、o 不補算、v 沿用（length 11–12.5 cm 與 HKBWS 相符，無 AVONET 翼長故不估算）、r=1 沿用。runtime 缺陷：中文除 look 外全空，而 look 中文實為「原短尾鴉雀屬只含一種」的分類說明；voice／breeding／migration／funFact 四欄共用同一句群體大小英文；picks 只有 look。地圖按 BirdLife 填七個國家。標籤「橙紅頭頂／短粗嘴喙／鏽紅飛羽／粉褐下體」皆對應插圖像素；比較鳥為紅頭穗鶥及短尾鴉雀的 AI 圖，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、o）／missingScores（i、c）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0433；0433–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0433 已交付

- `400-500` 內 `name = '0433.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0433 栗頸鳳鶥](https://drive.google.com/file/d/1a4ZkDAr-fYHaokybWNxwK917vJvh6kLf/view)：145955 bytes、MD5 `a3c99a87eba8b885a83fc9565f97cf38`、SHA256 `99b5c53edc7dcf9956b9b747bbaad208c57b37a9b7b1decf27b70003785c3338`。HKBWS 043100：香港第 I 類，鬱閉樹冠林地及灌叢的冬候鳥，少數夏季出現且繁殖已多次證實（1994 九龍山首次確認，2004／2017 梧桐寨見繁殖對，沙田坳、獅子山、梧桐寨有幼鳥）；14–15 cm，小型栗褐鳳鶥，短而深灰的冠羽、耳羽栗色帶白紋、下體白、尾長而外側有寬白端；1980-11-25 聶高信山首錄，最愛大埔滘與大帽山山系成熟森林，2013-01-03 大埔滘 120 隻為最高。曾置 Yuhina，現用 Staphida torqueola（單型種），runtime 科名「繡眼鳥科」對應 Zosteropidae。BirdLife 2024 LC 但趨勢記下降（範圍內樹冠十年減 8.1%，推測 1–19%），EOO 2.64M km²、不遷徙、海拔 350–2,200 m、世代 2.9 年、森林依賴度中等，國家表只有中國、寮國、泰國、越南，未列香港；HKBWS 則寫「趨勢未定」，兩者不同調已在卡面註明。runtime i=2、v=2.7（vEst=1）、r=1、c=1.2、o=1.7，a 全缺列 missingScores；v 沿用（翼 63.8 mm×0.22≈14.0 cm 落在 14–15 cm 內，估算與實測相符）、o 不補算。runtime 缺陷：range 與 diet 共用同一句空泛中文、look 中文其實是量度、英文除 funFact／humanRelation 外全空、length 與 weight 為空、aliases 誤記為 ['1870']。地圖按 BirdLife 填四國。標籤「短黑灰冠羽／栗頰白紋／白色下體／尾羽白端」皆對應插圖像素（前後共調三次才讓四個圈都填滿羽毛）；比較鳥為黑頦鳳鶥及紅脇繡眼鳥的 AI 圖，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（o）／missingScores（a）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0434；0434–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0434 已交付

- `400-500` 內 `name = '0434.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0434 黑頦鳳鶥](https://drive.google.com/file/d/1MLiqQsrRCIlRWSClnvmmUcQgu1Q-LaFM/view)：151727 bytes、MD5 `cbab0d62280035002ba70273908545eb`、SHA256 `b434d44b3587129c98f2e8a465399be162da5896bc8c74ab98122223a16225e7`。HKBWS 043200：香港第 I 類迷鳥，至今僅一筆——2021-01-20 嘉道理農場暨植物園、海拔約 310 米常綠闊葉次生林，與白腹鳳鶥及暗綠繡眼鳥混群；小型活躍林鳥，上體灰褐、後頸頸側臉頰淡灰、黑色眼先延伸至嘴下成黑頦、冠羽中央黑而邊緣灰呈鱗狀、嘴鮮橙色最具辨識價值；叫聲輕碎吱喳加短 chik 聲；單型種，分佈喜馬拉雅東至華南、緬北泰北中南半島北部及越南東南，在中國為黃河以南留鳥。runtime 與 BirdLife 均歸繡眼鳥科 Zosteropidae。BirdLife 2024 LC、趨勢記下降（樹冠十年減 7.3%，推測 1–19%、最佳估計 5–9%），EOO 5.92M km²、不遷徙、海拔 170–2,880 m、世代 2.6 年、森林依賴度高、22 個 IBA，國家表九國（孟加拉、不丹、柬埔寨、中國、印度、寮國、緬甸、尼泊爾、越南）未列香港；HKBWS 則寫「趨勢穩定」，兩者不同調已在卡面註明。runtime 六軸齊全（i=2、a=2.8、v=2.5 含 vEst=1、r=1、c=1.2、o=1.9），missingScores 為空；a 待查（habitat 只有英文、diet 全空、behavior 中文寫的又是分佈）、v 待查（length 為空且 HKBWS 未給體長，翼 55.2 mm×0.22≈12.1 cm 無從核對）、o 不補算。runtime 缺陷：behavior 中文是 range 的變體、habitat 只有英文、diet 與 voice 全空、length 與 weight 為空。地圖按 BirdLife 填九國。標籤「橙色嘴／黑色頦部／冠羽黑心灰邊／灰褐上體」皆對應插圖像素；生成主圖四邊有白邊，已裁走並重排為正方形；比較鳥沿用 0433 的栗頸鳳鶥與紅脇繡眼鳥 AI 圖，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0435；0435–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0435 已交付

- `400-500` 內 `name = '0435.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0435 紅脇繡眼鳥](https://drive.google.com/file/d/1hOKOZuXAcf6ar8Utwm_EYMh1TrlofI3g/view)：140744 bytes、MD5 `883cbc106681fadb5b736fabecad6e80`、SHA256 `609ea3a989267a9d43d3a29fa1098de5a88cd3b4ade323467f3cd03f54054210`。HKBWS 043300：香港第 I 類，林區不常見過境遷徙鳥及冬候鳥，1970-11-14 薄扶林首次、1980 年代初起每年冬季均有小量，主要 11 月第三週至 2 月第一週，單次最多八隻（1995-12-03 鉛礦坳）；與暗綠繡眼鳥之別（Leader 2000）：脇部鏽色痕、體型略大、初級飛羽突出較長、嘴基淡粉、眼圈寬而眼先黑範圍大、黃喉白胸對比強、額不帶黃；雄鳥脇斑深栗而雌鳥幼鳥淡。單型種，繁殖於中國東北及俄羅斯烏蘇里，越冬中國西南經中南半島北部至泰國中部。runtime 與 BirdLife 均歸繡眼鳥科。BirdLife 2024 LC、趨勢下降（樹冠十年減 5.9%，推測 1–19%、最佳估計 5–9%），繁殖 EOO 1.28M km²、非繁殖 1.67M km²、完全遷徙、海拔 0–2,950 m、世代 2.4 年、森林依賴度高；國家表十一列含**香港（中國）**與日本（來源不確定），但 110m 底圖無香港多邊形故地圖只填十國並以中國覆蓋。runtime 六軸齊全（i=2、a=2.3、v=2.6 含 vEst=1、r=3.3、c=1.2、o=2.3），missingScores 為空；v 待查（length 為空、HKBWS 只寫體型略大，runtime look 記 10.5 cm，翼 60.8 mm×0.22≈13.4 cm 明顯超出）、o 不補算。runtime 缺陷：中文與英文的 habitat／behavior／range 三欄互相對調、breeding 與 migration 同一句、length 與 weight 為空。標籤「白色眼圈／黑色眼先／黃色喉部／栗色脇斑」皆對應插圖像素；比較鳥為新畫的暗綠繡眼鳥及沿用 0434 的黑頦鳳鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0436；0436–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0436 已交付

- `400-500` 內 `name = '0436.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0436 暗綠繡眼鳥](https://drive.google.com/file/d/1dPd7Q46greGTUyMR-SBEu4apPMSSN0xF/view)：139815 bytes、MD5 `da2bba37f569f01dd20e445be4cc71f9`、SHA256 `df84234a1afd17345313a70b6d601306cdbebc6f6c6e0061452813aa757f262b`。HKBWS 043400：香港第 I 類，常見而廣泛的留鳥、遷徙鳥及冬候鳥；11–12 cm，眼圈寬白、眼先暗灰而窄、頭帶黃、上體翼黃綠、下體污白而泄殖腔檸檬黃、裸部灰色；繁殖分佈佔 1 公里方格 52.7%（1993–96）／51.6%（2016–19），但冬季分佈由 81.1%（2001–05）跌至 67.3%（2016–19）；最高計數 2019-12-27 南丫 341 隻；隆冬幾乎全吃果實、初夏吃昆蟲，為本港三大種子傳播者之一；本港最受歡迎籠鳥但未見影響族群。曾為日菲繡眼亞種群，2018 年分子研究後提升為種，現分五亞種、香港為指名亞種；港稱「相思」、台稱「綠繡眼」。BirdLife 2019 LC、趨勢下降（主因大量捕捉），繁殖 EOO 10.4M km²，國家表十二列（汶萊、柬埔寨、中國、香港、印尼、寮國、馬來西亞、緬甸、新加坡、台灣、泰國、越南），新加坡為引入。runtime 六軸齊全（i=2、a=2.3、v=2.4 含 vEst=1、r=4.8、c=1.2、o=2.5），missingScores 為空；v 沿用（翼 53.5 mm×0.22≈11.8 cm 落在 11–12 cm 內，只加估算提示）、a 待查（habitat 中文全空而英文重複分佈句、diet 只有樣板句）、o 不補算。驗證時曾報 `ISO3 not on base map: ['SGP']`，已剔除新加坡（110m 無幾何）並在 note 說明。runtime 缺陷：habitat 中文全空、diet 樣板句、look 只有量度、breeding 中文寫的是分類沿革、length 與 weight 為空。標籤「白色眼圈／暗灰眼先／黃綠色上體／檸檬黃泄殖腔」皆對應插圖像素；比較鳥沿用 0435 的紅脇繡眼鳥及 0433 的栗頸鳳鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0437；0437–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0437 已交付

- `400-500` 內 `name = '0437.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0437 紅頭穗鶥](https://drive.google.com/file/d/15_qHRUTIS2l9oft5ReoEj_qgT6eVbK8c/view)：153445 bytes、MD5 `b9f6f316a0452c8cddc42d381f4f24c2`、SHA256 `3256132e6907b4f3deb026f9f7fcfb3ab0dfe5ce00e1a5dcdd5686218bb2c0ae`。HKBWS 043500：香港第 IIA 類，森林及較成熟灌叢常見而增加的留鳥，族群被視為源自籠鳥但物種可能早於人為生境改變已在港；12 cm，小型似鶯的穗鶥，頭頂栗紅但不伸延至後頸、眼或黃色眼先，臉頦喉淡黃、無眉紋與過眼紋、眼大呈圓珠狀、嘴灰而尖、腳灰黃；1985-06-29 大埔滘首錄，1993–96 繁殖圖僅 0.3%（4 格）→2001–05 4.4%→2016–19 20.8%（繁殖）／23.3%（冬季），現已與廣東族群相連；3 月開始繁殖、4 月中築巢、至 8 月中仍有離巢幼鳥；食蟲兼食果，曾見吃常山果實；六亞種，香港應為 davidi；runtime 科名「畫眉科」對應 Timaliidae。BirdLife 2024 LC、趨勢下降（樹冠十年減 6.1%，推測 1–19%、最佳估計 5–9%），EOO 5.13M km²、不遷徙、海拔 0–3,510 m、世代 2.1 年、森林依賴度高、18 個 IBA，國家表九列含香港（中國）。runtime 六軸齊全且**無 vEst**（i=2、a=2.8、v=2.5、r=2.5、c=1.2、o=2.2），missingScores 為空；v 沿用（length 12 cm 與 HKBWS 完全相同）、a 待查（habitat 中文把 IUCN 說明混入同句、英文與 behavior 英文完全重複、diet 全空）、o 不補算。runtime 缺陷：look 中文有「體長，體重」空值、funFact 只是同義反覆、weight 為空。地圖按 BirdLife 填八國。標籤「栗紅頭頂／黃色臉部／暗土褐上體／淡黃下體」皆對應插圖像素（第二、三圈各調一次去掉空背景與模糊區）；比較鳥沿用 0432 的棕頭鴉雀及 0433 的栗頸鳳鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0438；0438–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0438 已交付

- `400-500` 內 `name = '0438.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0438 棕頸鉤嘴鶥](https://drive.google.com/file/d/1ySZ58paNbp7npWnxNyzMqAvX4-B7R4nD/view)：156208 bytes、MD5 `af2b6f2b2c5784906ab54f451f0c460c`、SHA256 `63c515faf6275883828f962760f58bdff6926547f522cdd32ee78cf3b49977b3`。HKBWS 043600：香港第 IIA 類，港島及內陸新界森林與灌叢廣泛而中等常見的留鳥，族群被視為源自籠鳥；16–19 cm，頭部花紋鮮明——粗白眉自嘴基至後頸、深褐頭頂、黑色過眼紋與臉頰、白喉、栗褐胸而密佈白縱紋、其餘下體栗褐、上體暖褐而頸側有栗紅斑、嘴長而彎且整體鮮黃（上嘴基部黑）、腳長而灰；性隱蔽，全年鳴唱，本港有四種主要鳴唱型。共 12 亞種、中國有九個，香港亞種未經確認但照片較符合 hunanensis；台灣的 musicus 已獨立成種故不在本種範圍。BirdLife 2024 LC、趨勢穩定，EOO 5,280,000 km²、不遷徙、海拔 15–3,050 m、世代 3.0 年、森林依賴度低，國家表八國未列香港，貿易欄記寵物國際性且普遍度高；評估史顯示 2004 年前為 Not Recognised。runtime 六軸齊全（i=2、a=2.8、v=2.9 含 vEst=1、r=1、c=1.2、o=2.0），missingScores 為空；v 沿用（翼 78.8 mm×0.22≈17.3 cm 落在 16–19 cm 內，只加估算提示）、a 待查（habitat 中文全空、英文與 behavior 英文完全重複、diet 全空）、o 不補算。runtime 缺陷：look 中文寫的是分類與分佈而非外型、habitat 中文全空、diet 與 voice 全空、length 與 weight 為空，callouts 只交代滇南／峨眉亞種與香港族群不符故不採用。地圖按 BirdLife 填八國。標籤「白色長眉／栗色頸斑／胸縱紋／彎曲黃嘴」皆對應插圖像素（嘴部一圈調兩次以減少空背景）；比較鳥沿用 0437 的紅頭穗鶥及 0433 的栗頸鳳鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0439；0439–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0439 已交付

- `400-500` 內 `name = '0439.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0439 中華草鶥](https://drive.google.com/file/d/1vazzVnkr6GrAhuGOoCVS2Hg_hVbn7Ba9/view)：140060 bytes、MD5 `8c75dd8228dbd866da9e5feeb2e8e083`、SHA256 `a86384558a14498abbd48c74440b7119374b42f82cd08018a6aa1027aa735605`。HKBWS 043700（標題用「大草鶯」）：香港第 I 類，高山草地稀有而局部的留鳥，因植被由草地演替為灌叢而可能正在減少；16–18 cm，小型而尾長的鶥，外觀像一隻壯碩的鷦鶯但嘴粗得多；頭頂與上體暖褐而密佈黑色縱紋、後頸一片黑白相間縱紋為診斷特徵、下體無縱紋而為淡黃褐、尾長而深色常顯得散亂；叫聲粗啞 chwee／churr，鳴唱少；分佈為大帽山山系加紅花嶺、八仙嶺、大刀屻、草山、馬鞍山、飛鵝山及大嶼山的大東山與鳳凰山；圖集記錄由 1.1%（1993–96）、0.8%（2001–05）、0.4%（2016–19 繁殖季）與 0.8%（冬季），但首輪調查無時限須謹慎解讀；只限 200–900 米（主要在 300–800 米）草地，偏好芒草為主、木本覆蓋少於一成；1982-06-20 大帽山首次網捕，1957 年起被誤記為褐山鷦鶯的紀錄實為本種；密度 0.02–0.04 隻／公頃（Leader et al. 2010）或 0.13 隻／公頃（So et al. 2012）；種群 50–100 對或約 490 隻；大部分生境在郊野公園內但不受演替保護。BirdLife（numeric id 103870381）2021 **NT、準則 C2a(i)**、成熟個體 2,500–9,999（Poor、推測）、趨勢下降（十年 5–10%）、繁殖 EOO 1,550,000 km²、不遷徙、最大亞族群少於 1,000；東南中國 175 個調查點只在 14 點記錄 33 隻，香港為全球據點；泰國與越南已列滅絕，緬甸與柬埔寨族群極小且分割。runtime 六軸齊全（i=3、a=2.3、v=2.5 含 vEst=1、r=1.8、c=1.8、o=2.3），missingScores 為空；v 待查（length 為空、翼 56.2 mm×0.22≈12.4 cm 遠低於 16–18 cm）、a 待查（habitat 中文寫的是分類故事而非生境、diet 英文實為受威脅原因）、r 待查（voice 中文是分類故事且被截斷、breeding 與 etymology 全空、behavior 只有半句）、o 不補算；c=1.8 沿用。runtime 缺陷：range 與 diet 同一句樣板中文、voice 與 funFact 同一句被截斷的分類故事、look 只有量度、length 與 weight 為空。地圖只填 BirdLife 現存三國（中國、柬埔寨、緬甸），泰越按 Extinct 刻意不填色，香港併入中國。標籤「後頸黑白縱紋／粗壯嘴喙／黑褐縱紋上體／淡黃褐色下體」皆對應插圖像素（第四圈試過尾羽與偏右位置，最後選回胸腹純淡黃褐區域以與第三圈的縱紋對比）；主圖第一版尾部分叉已重畫，比較鳥為新畫的棕扇尾鶯及沿用 0430 的褐柳鶯，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、v、r、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0440；0440–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0440 已交付

- `400-500` 內 `name = '0440.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0440 黑眉雀鶥](https://drive.google.com/file/d/1Z9otk1CCBFMdeO0ylCTShl3814ceex2T/view)：136022 bytes、MD5 `afb86c0896f0df8edb25a59470e13531`、SHA256 `575e9d83112a892749c986c74c90bbf9acb487a9a2bd81d5bf55e12c6218a990`。HKBWS 043800：香港第 IIA 類，新界中部森林及郁閉灌叢不常見的留鳥、族群可能源自籠鳥；12.5–14 cm，較紅頭穗鶥矮壯而尾短，頭淡灰、白色眼圈、頭側粗黑縱紋（側冠紋）可伸延至後頸，後頸與上背淡灰、翼與尾暖褐、下體淡黃褐；鳴唱罕聞、警報為高頻有力沙沙聲、聯絡聲 chi-tik；2001 年被列第 E 類（灰眶雀鶥）→2010 年隨 IOC 分種、2009–11 一度以 Alcippe sp. 發表→2013 年 Leven et al. 以鳴聲確定為本種後列入第 IIA 類；1999 年起緩慢增加，2001 年 1 個地點至 2020 年 7 個地點、最高計數合計 58 隻，大埔滘為核心（2015-01-08 單次 50 隻），城門、梧桐寨、大欖郊野公園每年有記錄；圖集由 0.4%（1993–96 繁殖）升至 2.0%（2016–19 繁殖）與 1.8%（冬季）；只限有良好灌木層的大片闊葉林下層，繁殖生態與食性在本港均未有研究。BirdLife（灰眶雀鶥複合種，未拆分本種）2024 **LC**、趨勢下降（樹冠十年減 7.9%、推測族群降 1–19%）、成熟個體 Unknown、繁殖 EOO 4,630,000 km²、海拔 0–3,050 m、世代 2.8 年、森林依賴度 Medium、28 個 IBA，國家表為中國、寮國、緬甸、台灣、泰國、越南而**未列香港**。runtime 只有四軸有分（a=3.3、v=2.6 含 vEst=1、r=1、o=2.3），**i（重要性）與 c（保育）完全沒有分數**，卡面該兩軸顯示「待查」、missingScores 為 i、c，不以他處數值補算；v 沿用（翼 60.9 mm×0.22≈13.4 cm 落在 12.5–14 cm 內，只加估算提示）、a 待查（habitat 與 behavior 中文全空、diet 中文是遷徙與生境的樣板句、diet 英文只有一句 Vaccinium carlesii）、r=1 沿用（完全沒有 voice／breeding／etymology 欄，1 已是量尺最低值）、o 不補算。runtime 缺陷：habitat／behavior 中文全空、look 只有量度、length 與 weight 為空，且文中用「淡眉雀鶥」而鳥名欄用「黑眉雀鶥」。地圖按 BirdLife 填六國／地區（含台灣）。標籤「黑色眉紋／白色眼圈／栗褐色翼／淡黃褐色下體」皆對應插圖像素（第二、四圈各調一次）；主圖原為橫幅、已補成方形畫布，比較鳥沿用 0437 的紅頭穗鶥及 0432 的棕頭鴉雀，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、o）／missingScores（i、c）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0441；0441–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0441 已交付

- `400-500` 內 `name = '0441.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0441 藍翅希鶥](https://drive.google.com/file/d/1Fw3DD1kyrfAdu8gDgPvH7ASLhCi_lNVL/view)：142165 bytes、MD5 `ec7e218f6cacf4324592e798e8f3462d`、SHA256 `174d24710e07af250fe73ca0501fdac94b6f3e526d99f4b102d337eecab5a987`。HKBWS 043900（路徑為 `0370/` 而非 `0360/`）：香港第 IIB 類，新界中部森林常見而增加的留鳥、族群源自籠鳥；14–15.5 cm，身形修長的樹棲鶥，由下往上看多只見淡灰與診斷性的白邊黑尾下覆羽，由上看則有黑色側冠紋、灰色頭頂、樸素無眉紋與過眼紋的臉、淺栗色上背、藍色飛羽與尾；叫聲略帶鼻音（pwit／choop／pweet／pwee）；1992-09-05 大埔滘首錄、1994 年證實繁殖，因非遷徙且最近自然分佈遠在桂西而被列為已建立外來種；現由大欖至馬鞍山常見，圖集由 0.4%（1993–96 繁殖）、0.8%（2001–05 冬季）升至 5.5%（2016–19 夏季）與 6.9%（冬季），在籠鳥來源的小型林鳥中廣泛程度僅次於紅頭穗鶥；港島 1995 年 1 月首錄但未建立族群；見於大帽山 650 米；3 月下旬至 7 月上旬收集巢材、5–6 月起見帶食物與依賴期幼鳥至 10 月上旬，推測一年多窩；成對或 5–20 隻小群（最多 44 隻、最高計數 1999-09-18 大埔滘 50 隻），冬季混入鶯鶥群，於樹冠中層拾取食物；食蟲兼食果，已知毛蟲、樹參、簕欓花椒與栽培柿。BirdLife（用 **Siva cyanouroptera**）2024 **LC**、趨勢下降（推測，生境破壞與破碎化）、成熟個體 Unknown、繁殖 EOO 6,160,000 km²、海拔遷徙鳥、250–3,000 m、世代 2.7 年、森林依賴度 Medium、38 個 IBA、國家表十一列並把**香港（中國）列為原生繁殖**（與本地名錄「籠鳥來源」不同）。runtime 六軸齊全（i=2、a=2.8、v=2.7 含 vEst=1、r=1、c=1.2、o=1.9），missingScores 為空；iucn 欄「無危 LC」與 BirdLife 一致；v 沿用（length 欄為空但 look 與 HKBWS 均為 14–15.5 cm，翼 65.3 mm×0.22≈14.4 cm 落在範圍內，只加估算提示）、a 待查（habitat 與 behavior 中文全空、diet 欄缺失、behavior 英文與 habitat 英文同一句生境樣板）、o 不補算。runtime 缺陷：habitat／behavior／funFact／etymology 中文全空、look 中文只有體重與體長、完全沒有 diet 與 voice 欄、length 與 weight 欄為空。地圖按 BirdLife 填十國。標籤「黑色側冠紋／藍色飛羽／栗褐色上背／白色尾下覆羽」皆對應插圖像素（第四圈由全藍尾改成白邊黑尾下覆羽，主圖再裁成方形以放大主角）；比較鳥沿用 0437 的紅頭穗鶥及 0433 的栗頸鳳鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0442；0442–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0442 已交付

- `400-500` 內 `name = '0442.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0442 紅嘴相思鳥](https://drive.google.com/file/d/16gbHwNq2-pgSq2oxUJn2J7McB0q91e2a/view)：134147 bytes、MD5 `b7eb6e21e612539d5800199ae71a419f`、SHA256 `2ce4dd97f894f623f08c588866aa68a72f6c4c8fe14f95e777861349028cac89`。HKBWS 044000：香港第 IIA 類，森林與灌叢不常見而局部的留鳥（多在中新界較高海拔）、族群視為源自籠鳥；14–15 cm，圓胖短尾而色彩鮮明——鮮紅嘴、眼圈白斑伸至臉頰、寬黑頰紋、亮橄欖綠頭、灰橄欖上體、黑色初級飛羽配寬紅翼斑與黃色翼緣、次級基部黃斑、黃橙胸、黑色琴形外側尾羽；1990 年代初中期最盛（城門、大埔滘、林村谷、大帽山），此後收縮至大帽山山系，圖集由 2.4%（1993–96 繁殖）、1.9%（2001–05 冬季）降至 1.4%（2016–19 繁殖）與 1.1%（冬季），可能與減少放生及與銀耳相思鳥競爭有關；1913 年首兩筆紀錄已被裁定為籠鳥，2001 年列入第 IIA 類；1980 年代初起相信已在港繁殖但證實紀錄極少（1991 鉛礦坳帶幼鳥為首次）；食性兩份研究結論不同（Corlett 1998：96% 果實／58% 無脊椎；Leven 2000：72%／100%），無脊椎以鞘翅目 43%、蜘蛛 25.5% 為主；原生範圍自印度西北經喜馬拉雅至中國南及中部，並在台灣、日本、夏威夷與南歐建立野化族群；五亞種，香港最可能為 kwangtungensis（未確認）。BirdLife 2024 **LC**、趨勢下降（推測，樹冠三個世代減 7% 及鳴鳥貿易，1–19%）、EOO 5,780,000 km²、海拔 0–4,100 m、世代 4.7 年、森林依賴度 Medium、14 個 IBA；自 1997 年列入 CITES 附錄二以來 227,517 隻野捕個體進入國際貿易；國家表把香港（中國）列為原生繁殖。runtime 六軸齊全（i=2、a=3.8、v=2.7 含 vEst=1、r=3.3、c=3、o=3），且 habitat／diet／voice／breeding／behavior／etymology 中文齊備，**withheldScores 為空、missingScores 為空——本批次首張無待查軸的卡**；v 沿用（length 欄為空、翼 68.2 mm×0.22≈15.0 cm 落在 14–15 cm 內，只加估算提示）。runtime 缺陷（不足以否定評分）：range 中文把引進國家與原生國家並列、look 中文只寫翼與尾、length 與 weight 為空、funFact 中文其實是詞源句而英文全空、notes 自述條目有「翻譯品質不佳」標記。地圖只填七個原生國家，引進國（法國、意大利、日本、留尼汪、美國）刻意不填色。標籤「鮮紅色嘴／白色眼圈／紅黃翼斑／黃橙色胸」皆對應插圖像素（第二、四圈各調一次）；主圖原為橫幅、補成方形後再裁緊，比較鳥沿用 0433 的栗頸鳳鶥及 0441 的藍翅希鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（空）／missingScores（空）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0443；0443–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0443 已交付

- `400-500` 內 `name = '0443.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0443 銀耳相思鳥](https://drive.google.com/file/d/19x7TmsjZFpeN6-5Wz3AA3Zf6UgJ1rSzv/view)：134248 bytes、MD5 `0aa9a8c1eb483f4484e98675085dc207`、SHA256 `e2c3e1cb99351383b69e92d3e764eba540d3c9758dc0ba950ccca9e86ff404bf`。HKBWS 044100：香港第 IIB 類，森林局部常見而增加的留鳥、族群源自籠鳥；16–17 cm，圓胖短尾；頭黑、大片銀白臉頰、額有小黃斑、喉與上胸及整圈頸環橙紅、上體銀灰、飛羽寬紅翼斑配黃邊、嘴短厚而腳皆鮮黃；1970-12 港島 Hatton Road 首錄後長期無紀錄、1987-12-07 大埔滘再見、1990–91 冬季大埔滘常有（12 月 8 日兩群各至少 20 隻）、1992 年底城門最多 30 隻，因非遷徙而列入第 IIB 類；核心城門至馬鞍山、最大數量在大帽山山系，圖集由 2.5%／1.9% 升至 3.4%（2016–19 繁殖）與 2.4%（冬季）；最高計數 2018-09-28 石崗引水道 60 隻、單群最多 50 隻（2014-12-26 大埔滘公園）；與同屬的紅嘴相思鳥常混群且可能競爭，但趨勢對本種有利（同期紅嘴相思鳥由 2.4%／1.9% 降至 1.4%／1.1%），本種亦較少見於大帽山高處；4 月 18 日見築巢行為、5 月 31 日見攜巢材、4 月 29 日至 9 月 20 日見離巢幼鳥，本港巢與蛋未有描述；Corlett (1998) 糞便 97% 有果實、87% 有無脊椎。BirdLife 2025 **LC**、趨勢下降（樹冠三個世代減 9.7% 及籠鳥貿易，推測 1–19%）、EOO 5,770,000 km²、海拔 25–3,050 m、世代 3.5 年、森林依賴度 Medium；評估史顯示 2012 年及以前為 Not Recognised；**國家表沒有香港**，孟加拉列為滅絕故地圖不填色。runtime 六軸齊全（i=2、a=3.8、v=2.8、r=1、c=3、o=2.5，含 vEst=1），missingScores 為空；v 沿用（翼 73.5 mm×0.22≈16.2 cm 落在 16–17 cm 內，只加估算提示）、a 待查（habitat 與 diet 中文全空、behavior 中文其實是分類與生境句且被截斷）、o 不補算。runtime 缺陷：habitat／diet／voice／breeding／funFact／etymology 中文全空、look 與 behavior 中文皆為分類句、length 與 weight 為空。標籤「銀白色臉頰／橙紅色頸環／紅黃翼斑／鮮黃色嘴」皆對應插圖像素（頸環一圈調兩次以減少空背景）；主圖原為橫幅、補成方形後裁緊，比較鳥沿用 0442 的紅嘴相思鳥及 0441 的藍翅希鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0444；0444–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0444 已交付

- `400-500` 內 `name = '0444.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0444 白頰噪鶥](https://drive.google.com/file/d/1382wbjMQUz7oIj5jx1i05pgsfI6IKrN5/view)：131434 bytes、MD5 `8823d2b57bb63909ecacad53eb526dcc`、SHA256 `83189304fa20743c791f7cab4f6753d7aa201dc571c4a98595ebb70727e0c6f1`。HKBWS 044400（路徑為 `0370/`）：香港第 IIA 類，開放與郁閉灌叢及灌叢邊緣不常見而局部的留鳥，1980 年代以來大減但本世紀大致穩定；22–24 cm，小型緊湊而尾長、全身中等褐色而泄殖腔略帶栗紅，頦深褐、純白眉紋與白臉頰在眼前相連；每年地點不多於七個、個體不多於 30 隻，長洲（1976 年起）、大埔河谷（2001 年起）、鉛礦坳（2003 年起）、林村谷（2005 年起）為長期據點，港島 1999 年後幾乎絕跡、2019 年石澳三群共 15 隻為近期最高；1977–79 年曾達 15–18 個地點；現存生境多為灌叢—草地鑲嵌、源自荒廢農地；香港族群孤立故列 IIA（有人主張 IIB）；繁殖無資料、食性與鳴唱在本港基本未研究。BirdLife 2024 **LC**、趨勢**穩定**、EOO 3,020,000 km²、不遷徙、世代 3.5 年、森林依賴度「通常不出現於森林」、7 個 IBA；分類註記說明由 Garrulax 改為 Pterorhinus（Cibois et al. 2018）；國家表七列**包括香港（中國，原生、繁殖）**。runtime 只有五軸有分（i=2、v=3.2 含 vEst=1、r=1、c=1.2、o=1.9），**a（適應力）完全沒有分數**故 missingScores 為 a；v 待查（look 中文全空、無任何外型描述，翼 96.3 mm×0.22≈21.2 cm 低於 22–24 cm）、o 依賴待查分項不補算；i、r、c 沿用。runtime 缺陷：只有 range 一句中文有內容，habitat／look／funFact／etymology 中文全空，完全沒有 diet、voice、breeding、behavior、conservation 欄。標籤「純白眉紋／深褐色喉／栗紅尾下覆羽／長尾」皆對應插圖像素；主圖原為橫幅、補成方形後裁緊，比較鳥沿用 0440 的黑眉雀鶥及 0433 的栗頸鳳鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores（a）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0445；0445–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0445 已交付

- `400-500` 內 `name = '0445.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0445 黑喉噪鶥](https://drive.google.com/file/d/1e7j-u8c2dM73hofi_VGxmelzALpfPg0c/view)：129860 bytes、MD5 `7f355007d595292974685c08d7a8508c`、SHA256 `dd0259ddef32fa15e8e99103543625d8602d4a4969df94b303f099041067f2f0`。HKBWS 044300：香港第 IIA 類，指名亞種在港島與新界森林及灌叢廣泛而局部常見、本世紀大幅增加並擴散；23–30 cm，大型深色噪鶥，身體大部分無花紋暗灰、翼尾深褐，黑色面罩與黑喉、額上小簇黑羽、對比強烈的白頰；圖集由 5.2%（1993–96 繁殖）與 5.6%（2001–05 冬季）升至 28.1% 與 17.0%（2016–19），與畫眉此消彼長（畫眉 43.3%→27.1%）；1948 年後港島族群可能源自籠鳥，1962 年東涌、1964 年大欖涌首次在新界錄得；2006-03-01 梧桐寨首次錄得海南型（monachus）深色臉頰個體，2014 年起每年有 monachus 與疑似雜交報告，研究認為兩型幾無繁殖障礙、雜交可能威脅本港族群遺傳完整性；4 月 1 日攜巢材、4 月 11 日餵巢、5 月 12 日築巢、6 月 2 日至 9 月 14 日見離巢幼鳥，本港巢與蛋未有描述；2010-07-02 大埔滘一群中見栗斑杜鵑；食性研究少（Leven 2000 四份糞便全有無脊椎、Corlett 1998 三種果實）。BirdLife **2023** LC、趨勢下降 10–19%／三個世代（生境喪失與鳴鳥貿易，越南個體可售 100 美元）、EOO 2,700,000 km²、AOO 持續下降、海拔 0–1,525 m、世代 3.6 年、30 個 IBA；**國家表把香港（中國）與台灣列為 Introduced**，故地圖只填六個原生國家。**runtime 完全沒有本種的評分、量度與文案**：六軸與綜合分全部缺席，missingScores 為 i、a、r、c、v、o，卡面六個軸與綜合分全部顯示「待查」，withheldScores 為空（沒有可待查的分數，只有缺席的分數）。標籤「白色臉頰／黑色面罩／暗灰色身體／深褐色翼」皆對應插圖像素（黑面罩與灰身兩圈共調三次以避開空背景）；主圖原為橫幅、補成方形後裁緊，比較鳥沿用 0444 的白頰噪鶥及 0433 的栗頸鳳鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（空）／missingScores（六軸）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0446；0446–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0446 已交付

- `400-500` 內 `name = '0446.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0446 黑領噪鶥](https://drive.google.com/file/d/1kuZwWS6IKZU03dbabolImNWjPMDmH6yB/view)：136899 bytes、MD5 `0a8cf439d8b3a2a050fb589a43b70129`、SHA256 `3675867259ca20b911d5060fc84f6b6aa31af34e312e73aa021838b0e551d47d`。HKBWS 044600（路徑為 `0370/`）：香港第 IIA 類，森林及鄰近郁閉灌叢廣泛而局部常見、族群相信源自籠鳥；27–35 cm，本港最大的噪鶥，上體與頭頂栗紅、白色眉紋、黑白縱紋黑頰、黑色（雄）或灰色（雌）而不完整的胸帶、淡色尾端、深紅虹膜配黃眼圈；1969-12-26 大埔滘一群十隻首錄，1970 年代末緩慢擴散、1990 年代初加快，因模式不符自然遷入而由第 I 類改列 IIA；圖集由 3.6%（1993–96 繁殖）、8.3%（2001–05 冬季）升至 9.1%（2016–19 繁殖）與 8.1%（冬季），本世紀唯一顯著擴展在北新界近打鼓嶺；港島 1976 年起的族群源自動植物公園逃逸的西方亞種、近年照片屬 picticollis；大嶼山與長洲只有零星紀錄；1990-04-14 首次證實繁殖，至今無築巢觀察；至少六次見栗斑杜鵑幼鳥跟隨本種群（應為本港主要寄主）；成 5–20 隻群於森林各層活動、常有哨兵；Corlett (1998) 十份糞便全有果實、70% 有無脊椎，Leven (2000) 八份中 63%／88%（全為蟻科）。BirdLife 2024 **LC**、趨勢下降（樹冠三個世代減 10.6%，推測 1–19%）、EOO 5,950,000 km²、世代 4.1 年、18 個 IBA；國家表把美國列為 Introduced 且**沒有香港一列**，故地圖只填九個原生國家。runtime 六軸齊全（i=2、a=2.8、v=3.6 含 vEst=1、r=1、c=1.2、o=2.1），missingScores 為空；v 沿用（翼 141.6 mm×0.22≈31.2 cm 落在 27–35 cm 內，只加估算提示）、a 待查（habitat 與 diet 中文全空、behavior 英文與 habitat 英文完全相同）、o 不補算。runtime 缺陷：只有 range 一句中文有內容，其餘中文全空，英文多為重複或錯置（diet 英文是物種簡介、look 與 etymology 同為分類沿革），length 與 weight 為空。標籤「白色眉紋／黑色胸帶／栗紅上體／淡色尾端」皆對應插圖像素；主圖原為橫幅、補成方形後裁緊，比較鳥沿用 0445 的黑喉噪鶥及 0444 的白頰噪鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0447；0447–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0447 已交付

- `400-500` 內 `name = '0447.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0447 矛紋草鶥](https://drive.google.com/file/d/1OZDI1njajblD8aN-EOD1o3agkYzXUpPd/view)：141419 bytes、MD5 `c76ed647f51974859da76ca3501077dc`、SHA256 `8d0524781f8e5bd38a0f26cf1e6c7e578681788ec2a04abbe25e2cc838c0db8a`。HKBWS 044700（路徑為 `0370/`）：香港第 IIA 類，只限大帽山高海拔的稀有留鳥，2009–10 年因相信原有野化族群已消失而列入第 IIC 類，2020 年重新發現後回復第 IIA 類；25–29 cm，大型修長的噪鶥，上下體皆密佈縱紋、粗黑髭紋、白色虹膜；看得清楚時不會誤認，但在濃密植被中看得不好時可能與畫眉混淆；叫聲多樣（吱喳、帶轉調的嗡嗡聲、純短哨音），廣告聲為下降哨音，受擾時連串粗啞；1959-07-19 大帽山 900 米首錄鳴唱個體、翌年證實繁殖，1984-08-25 山頂附近最高 14 隻；1996 年後每年最多四隻，2006–10 五年無紀錄（Welch 2013 稱族群似乎已消失），2011–2022 年多數年份仍有一至四隻；港島等零星紀錄相信是逃逸或放生個體（1999–2020 只有 2009-02-05 大埔滘一隻）；1994 年草山 450 米見成鳥帶食物到巢、最多六隻，此後未再錄得；多在矮竹與長草間活動，生境為灌叢與被火維持的草地鑲嵌，2000 年後森林向上擴展至山頂令西坡過渡生境大減，東北坡仍保有較大片；1994 年草山與 1960 年大帽山有繁殖紀錄。BirdLife **2018** LC、趨勢**穩定**（推測）、EOO 2,630,000 km²、海拔 350–4,265 m、世代 5.5 年、森林依賴度 Medium、生境以高山灌叢為主要；**國家表只有中國、緬甸與香港（中國）三列**，因此地圖只填兩個大國；分類註記說明曾與 Garrulax lanceolatus／G. woodi 併為一種（del Hoyo & Collar 2016）。runtime 六軸齊全（i=2、a=2.8、v=3.1 含 vEst=1、r=1、c=1.2、o=2.0），missingScores 為空；v 待查（length 與 look 中文皆為空，翼 95.4 mm×0.22≈21.0 cm 遠低於 25–29 cm）、a 待查（habitat 與 diet 中文全空、behavior 英文與 habitat 英文完全相同）、o 不補算；i、r、c 沿用。runtime 缺陷：只有 range 一句中文有內容，且把**印度**列為分佈地（BirdLife 國家表沒有印度），其餘中文全空、英文多為重複或錯置，length 與 weight 為空。地圖按 BirdLife 只填中國與緬甸，香港在 110m 底圖併入中國。標籤「白色虹膜／黑色髭紋／上體縱紋／下體縱紋」皆對應插圖像素（髭紋一圈調一次，由空背景改為貼住黑色條紋）；主圖原為橫幅、補成方形後裁緊，畫出白色虹膜、黑色髭紋、上下體密佈縱紋與長尾，比較鳥沿用 0446 的黑領噪鶥及 0444 的白頰噪鶥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0448；0448–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0448 已交付

- `400-500` 內 `name = '0448.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0448 絨額鳾](https://drive.google.com/file/d/1GFpsUtqYO4ctR6epw7NtHZ8_DFWqOI1N/view)：138979 bytes、MD5 `13378e4d85280d00321b1cdfdf032e9b`、SHA256 `08e857a1f23cc1eaffa4733bcabe24a5672ab5446acf16df9a3e73b17ad7e21f`。HKBWS 044900（頁面編號與 app 的 0448 不同，路徑為 `0380/`）：香港第 IIB 類，新界大陸森林南至九龍山局部頗常見的留鳥、港島有數筆紀錄，族群源自籠鳥；12–13 cm，本港唯一的鳾，常倒懸沿樹幹與樹枝走動；上體鮮藍綠色而前額有黑斑、下體淡白帶淡紫、嘴鮮珊瑚紅、虹膜黃、腳褐至暗粉紅；雄鳥較明亮且黑額斑在眼後延伸成短黑眉、眼圈橙色，雌鳥眼圈黃色；叫聲嘈雜、常成對吱喳；分佈以大帽山山系為中心，西至大欖涌水塘、西北至大棠、東面由南涌至西貢，喜大樹亦用林緣、村邊甚至新市鎮公園；港島狀況不明（1992 年山頂與香港仔首錄、2013-04-21 摩星嶺再見、2024 年初龍虎山仍有紀錄）；單一地點最高 2004-01-04 大埔滘 20 隻；1989-04-15 大埔滘首錄、1990 年可能繁殖，圖集由 0.4%（1993–96 繁殖）、0.8%（2001–05 冬季）升至 2.2%（2016–19 繁殖）與 3.7%（冬季）；本港族群確為籠鳥來源，但廣東東部（梧桐山 2007-08-19 首錄，現至園山風景區）反而是由本港擴散過去；多成對或家族群並混入其他鳥群，在樹幹與粗枝（尤喜長滿苔蘚者）覓食，亦用竹與竹棚；樹洞繁殖，3 月 1 日起察看樹洞、7 月在枯樹挖洞、3 月 16 日至 4 月 17 日帶巢材（苔蘚、兩次狗毛）入洞、5 月 10 日至 7 月 16 日餵雛，窩卵數二至三隻，可能一年兩窩；中國僅雲南南部與廣西西南有原生分佈，本港與深圳東部為唯一非原生族群。BirdLife 2024 **LC**、趨勢**下降**（推測，生境破壞與破碎化）、EOO 15,600,000 km²、海拔 0–2,610 m、世代 2.7 年、森林依賴度 **High**、低地濕潤林為主要生境、貿易欄記食用與寵物兩種用途；**國家表 15 列（菲律賓為原生繁殖）而沒有香港**，故地圖只填 15 個原生國家／地區。runtime 六軸齊全（i=2、a=3.3、v=2.8 含 vEst=1、r=1、c=1.2、o=2.1），missingScores 為空；v 待查（length 與 look 中文皆為空，翼 72.7 mm×0.22≈16.0 cm 高於 12–13 cm）、a 待查（habitat 與 diet 中文全空、behavior 中文全空）、o 不補算；i、r、c 沿用。runtime 缺陷：只有 range 一句中文有內容（且貴州、海南一項與 HKBWS／BirdLife 說法有出入），其餘中文全空、英文多為重複或截斷（voice 與 conservation 英文同為被截斷的分類句），length 與 weight 為空。標籤「黑色額斑／珊瑚紅嘴／藍綠色上體／淡紫下體」皆對應插圖像素（紅嘴一圈調一次以減少空背景）；主圖原為橫幅、補成方形後再把樹幹邊緣羽化融入純色深青底並裁緊，比較鳥沿用 0441 的藍翅希鶥及 0442 的紅嘴相思鳥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0449；0449–0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0449 已交付

- `400-500` 內 `name = '0449.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0449 紫翅椋鳥](https://drive.google.com/file/d/1slSFz67YQ5zCwcO3ejfvOLGEbvL-o5UC/view)：133125 bytes、MD5 `111662ba5cb77e7cda246a9d69a9812a`、SHA256 `93c003785fe30a5405f55a2934a5077e14116d268e6a7960f089fa4b033f6141`。HKBWS 046000（頁面編號與 app 的 0449 不同，路徑為 `0380/`）：香港第 I 類，秋季過境鳥與冬候鳥，數量少，11 月至 1 月底主要在新界北與西北開闊鄉郊；21–22 cm，矮壯短方尾、嘴較長，頭背胸有紫綠光澤，秋冬新羽每片羽端淡白形成滿身斑點，春季磨損後成油亮黑，雌鳥斑點較多較暗；叫聲多變包括短促 tit 聲；見於大生圍、甩洲、新田、米埔、塱原，2010 年後錦田絕跡（或與野水牛群消失有關），離島與 2019-11-26 何文田市區有零星紀錄；極端日期 10 月 16 日與 4 月 14 日；最高計數 2014-11-23 大生圍 25 隻；1971-11-07 落馬洲兩隻首錄、至 1978/79 冬季常有最多 11 隻，1980–2000 零散甚至全無、1999 年起每年冬季都有；相信與其在俄羅斯東向擴張有關（北戴河、日本有類似增加）；單獨或小群、常與紅嘴椋鳥及白頰椋鳥混群；引入北美、南非、澳洲與紐西蘭；中國有 poltaratskyi 與 porphyronotus 兩亞種。BirdLife **2019** LC，成熟個體約 1.5 億（2008、Poor），趨勢**下降**（歐洲 1980–2015 中度下降、北美 1966–2015 減 51%），繁殖 EOO 38,400,000 km²、非繁殖 33,200,000 km²、完全遷徙、海拔 0–2,000 m、世代 4.6 年、森林依賴度 Low；威脅為農業集約化與過去的獵捕，用途為食用、寵物與運動狩獵；**國家表把香港（中國）列為原生**，另列大量引入地與迷鳥地。runtime 六軸齊全（i=2、a=3.8、v=2.2、r=4.8、c=3、o=3.2，沒有 vEst），missingScores 為空；v 待查（length 欄損壞為「20–0 cm」，翼 128.3 mm×0.22≈28.2 cm 又遠高於 21–22 cm）、o 不補算；i、a、r、c 沿用（a 的中文雖被截斷但內容與 HKBWS／BirdLife 相符）。runtime 缺陷：中文內容相對齊全但多句被截斷，callouts 的「頭骨狹窄」並非野外辨識要點，length 欄損壞。地圖按 BirdLife 原生國家填色，其中巴林、法羅、直布羅陀、列支敦士登、馬爾他、巴勒斯坦與斯瓦爾巴在 110m 底圖沒有幾何故不填，引入地與迷鳥地一律不填；香港在底圖併入中國。標籤「白色斑點／紫綠光澤／粉紅色腳／尖長嘴」皆對應插圖像素（斑點一圈由翼上改到胸側以減少空背景）；主圖原為橫幅、補成方形後裁緊。第一次上載後因把 assessmentNote 由「BirdLife 2019 評定（Red List 2018-10-31 最後評估）」縮短至 26 字上限而重新渲染，舊檔已移入垃圾桶並重新上載，故最終 Drive 檔案為 `1slSFz67YQ5zCwcO3ejfvOLGEbvL-o5UC`。比較鳥沿用 0445 的黑喉噪鶥及 0442 的紅嘴相思鳥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0450（本批最後一張）；0450 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0401–0450：0450 已交付（本批最後一張）

- `400-500` 內 `name = '0450.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0450 北椋鳥](https://drive.google.com/file/d/1fZuGxoZSiDj0doHzmUmEhHLECvVmJZU6/view)：129614 bytes、MD5 `12eb47c4beddb5131b65246be9b9ffb5`、SHA256 `6e14b29d0c55e7afd36ef100ea3cd1f227592afb51d3efb969bb634737eb7491`。HKBWS 045500（頁面編號與 app 的 0450 不同，路徑為 `0380/`）：香港第 I 類，秋季過境鳥、春季罕見、另有數筆冬季紀錄，見於開闊鄉郊；16–19 cm，小型短尾椋鳥，淡色頭部配大黑眼，上體與尾深色、腰淡白、肩羽寬白端、翼深；雄鳥後冠有小片紫光澤羽、上背紫光澤、下背與背紫、下體淡灰，繁殖季嘴黑、非繁殖季嘴基淡，腳綠灰；雌鳥與幼鳥頭頂後頸淡褐、褐翼褐尾、白斑較少；叫聲似紅嘴椋鳥但更飽滿；多見於后海灣一帶，其次塱原，新界以外少見但蒲台島幾乎每年有紀錄，大嶼山（梅窩）與東龍洲有數筆；秋季極端日期 2015-08-28 與 2013-11-13，高峰在九月最後一週至十月第一週，2005 年起有 1 月 22 日至 2 月 10 日的冬季紀錄，春季約一半年份有紀錄（2007-03-27 至 2007-05-21）；最大群 2003-09-26 塱原至少 50 隻、2002 年 10 月 2–10 日同址最多 40 隻，其他高計數 2013-09-16 大埔海濱公園 13 隻、1999-10-18 米埔 12 隻；1977-09-25 米埔附近一群 35 隻為首錄；成群、高度樹棲，多在魚塘邊或濕農地小樹上覓食，常與其他椋鳥共棲但日間多為單一物種群；雜食，見食細葉榕與烏桕果實；單型種，繁殖於蒙古東部、俄羅斯東南部、中國東北與中部及北韓，越冬於東南亞與大巽他群島。BirdLife 英文名為 **Purple-backed Starling**：IUCN **2024** LC、成熟個體 Unknown、趨勢 **Unknown**（生境改變影響難判斷）、繁殖 EOO 4,430,000 km²、非繁殖 2,710,000 km²、完全遷徙、海拔 0–3,100 m、世代 3.3 年、森林依賴度 Low、溫帶草地為主要生境、1 個 IBA；國家表把**香港（中國）列為原生**，巴基斯坦來源「不確定」，另有聖誕島、挪威、斯里蘭卡三筆迷鳥。runtime 六軸齊全（i=2、a=2.3、v=3.3 含 vEst=1、r=1、c=1.2、o=2.0），missingScores 為空；v 待查（length 與 look 中文皆空，翼 105.6 mm×0.22≈23.2 cm 高於 16–19 cm）、a 待查（habitat 與 diet 中文全空，diet 英文只是「2006 IUCN Red List」引用字串）、o 不補算；i、r、c 沿用。runtime 缺陷：只有 range、look、breeding 三段中文有內容，diet 與 humanRelation 英文是引用字串，length 與 weight 為空。地圖按 BirdLife 原生國家填 15 個（香港與新加坡在 110m 底圖沒有幾何故不填，巴基斯坦來源不確定與迷鳥地一律不填）。標籤「淡色頭部／紫色背部／白色肩斑／綠灰腳」皆對應插圖像素；主圖原為橫幅、補成方形後裁緊，比較鳥沿用 0449 的紫翅椋鳥及 0448 的絨額鳾 AI 圖，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **本批 0401–0450 全部 50 張已完成。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0451 已交付

- `400-500` 內 `name = '0451.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0451 栗頰椋鳥](https://drive.google.com/file/d/1ezFwHQteb7WJYMXa0rkwsLLcCV4smF8n/view)：132340 bytes、MD5 `5a14c7c3fd1548cbbc681732a0dc1395`、SHA256 `7154d4af52eb8c343884d8471d710bbf7e737afb391e0f38c425c81267bf0f43`。HKBWS 045600（頁面編號與 app 的 0451 不同，路徑為 `0380/`；HKBWS 英文標題用 Chestnut-Cheeked Starling、中文用「紫背椋鳥」）：香港第 I 類，開闊鄉郊的稀少過境鳥；16–19 cm，小型短尾、頭淡色而腰淡；雄鳥眼後有不規則深栗色斑、後冠至背帶紫或整片帶光澤紫、飛羽三級飛羽尾與大覆羽帶光澤綠、中覆羽白成翼帶、外側尾羽外瓣白、頦至胸與脇淡灰、腹與尾下覆羽乳白，眼深褐、繁殖季嘴黑；雌鳥與幼鳥冠至背褐、無栗斑、白帶較淡；叫聲較北椋鳥扁平；紀錄多在后海灣與新界北（塱原、錦田、屯門、粉嶺），蒲台島規律；春季 4 月 3 日至 5 月 4 日、秋季 9 月 28 日至 11 月 20 日，主要過境在 4 月最後三週與 10 月首三週；1976-03-28 米埔一隻成鳥雄鳥首錄，1999 年前只有九筆獲接受紀錄；多數一至兩隻，最高 2020-10-10 龍鼓灘五隻；為規律過境椋鳥中最稀有者，紀錄量顯示香港不在其正常遷徙路線上；單型種，繁殖於庫頁島、日本、南千島群島與海參崴外海島嶼，越冬於台灣、菲律賓與北婆羅洲。BirdLife 2018 LC、成熟個體 Unknown、趨勢 **Unknown**、繁殖 EOO 902,000 km²、非繁殖 1,910,000 km²、完全遷徙、海拔 0–1,500 m、世代 4.4 年、森林依賴度 Low、1 個 IBA；國家表把**香港（中國）列為迷鳥**，另有北韓、南韓、帛琉三筆迷鳥。runtime 只有五軸有分（i=2、v=3.3 含 vEst=1、r=2.5、c=1.2、o=2.3），**a（適應力）完全沒有分數**故 missingScores 為 a；v 待查（length 與 look 中文皆空，翼 105.2 mm×0.22≈23.1 cm 高於 16–19 cm）、o 依賴待查分項不補算；i、r、c 沿用。runtime 缺陷：只有 range、breeding、migration 三段中文有內容且後兩段只有半句，其餘中文全空，length 與 weight 為空。地圖只填八個原生國家／地區（香港、北韓、南韓、帛琉皆為迷鳥故不填，新加坡在 110m 底圖沒有幾何）。標籤「栗色臉頰／紫色背部／白色翼帶／綠色翼羽」皆對應插圖像素（紫背與綠翼兩圈各調一次以減少空背景與誤含腹部）；主圖原為橫幅、補成方形後裁緊，比較鳥沿用 0450 的北椋鳥及 0449 的紫翅椋鳥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores（a）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0452；0452–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0452 已交付

- `400-500` 內 `name = '0452.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0452 灰頭椋鳥](https://drive.google.com/file/d/1VpEsoxmEdJPD5Hv4yhBusQZTrmqidXjy/view)：132083 bytes、MD5 `f6f0715b7444a8694a0f5124986f5bfa`、SHA256 `90194569a60a22938bd1948b0e9581a39a5607cd52a383b10a3b3993076b5ef9`。HKBWS 045800（頁面編號與 app 的 0452 不同，路徑為 `0380/`）：香港第 I 類，開闊鄉郊極罕見的冬候鳥，另有居於九龍市區的小型野化族群；18.5–20.5 cm，小型淡色椋鳥，翼端深、尾羽末端與尾下覆羽兩側栗色、嘴藍底配大片黃尖、白色虹膜；本港自然出現者應為 _S. m. nemoricola_，下體淡黃；自然來源紀錄集中於新界西北與離島（1993-01-22 尖鼻咀兩隻、1995-01-12 米埔最多兩隻、2004-03-17 梅窩一隻、2007-01-20 南丫島一隻），九龍公園一對 1994-05-15 至 1996-09-05、最多 12 隻至 2017-08-25，九龍寨城公園 2019-12-22 至 24 最多十隻、九龍仔公園 2020-05-16 至 06-22 兩隻，均相信源自逃逸鳥；1994–96 每年見鳥進出樹洞，唯一幼鳥紀錄 1994-07-02 兩隻，4 月下旬進洞、5 月築巢。BirdLife 2025 LC、成熟個體 Unknown、趨勢 **Unknown**（無趨勢數據）、繁殖 EOO 9,770,000 km²、非繁殖 8,720,000 km²、不遷徙、海拔 0–3,050 m、世代 3.1 年、森林依賴度 Low、36 個 IBA；國家表把**香港（中國）列為迷鳥**、斯里蘭卡同為迷鳥，台灣的引入族群未列。runtime 六軸齊全（i=2、a=5.0、v=3.1、r=1、c=1.2、o=2.5，沒有 vEst），missingScores 為空；v 待查（look 中文只是分類句，翼 100.9 mm×0.22≈22.2 cm 高於 18.5–20.5 cm，length 欄 20 cm 雖相符亦不足以單獨支撐）、a 待查（habitat 與 diet 中文全空，a=5.0 為量尺最高分卻無支撐）、o 不補算；i、r、c 沿用。runtime 缺陷：look／funFact／breeding／behavior 中文都是分類、分佈或台灣外來種的句子而非外型與習性，habitat／diet／voice／migration／conservation／etymology 中文全空，callouts 的「頭／尾」也不是外型描述。地圖只填 11 個原生國家（香港與斯里蘭卡為迷鳥故不填，台灣引入亦不填）。標籤「灰白頭部／黃色嘴尖／栗色尾羽／淡黃下體」皆對應插圖像素；主圖原為橫幅、補成方形後裁緊，畫出木棉枝以呼應 HKBWS 所述河谷木棉與榕樹生境，比較鳥沿用 0451 的栗頰椋鳥及 0450 的北椋鳥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0453；0453–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0453 已交付

- `400-500` 內 `name = '0453.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0453 絲光椋鳥](https://drive.google.com/file/d/10YleJbzJ7hLKo0P1ofbQIITc-MwFqqtZ/view)：132225 bytes、MD5 `34d681ab9996b481d72940209e1467f7`、SHA256 `6bdb2206ed9a4a34f75e175f1a49e9b170d94182d7b66c6b950941792bec75bb`。HKBWS 045200（頁面編號與 app 的 0453 不同，路徑為 `0380/`）：香港第 I 類，開闊鄉郊常見至局部大量的冬候鳥（範圍似乎在縮小），另有少數村屋與市區公園繁殖紀錄；23–26 cm，雄鳥頭奶白、後頸至胸脇淡灰、腹中央與尾下覆羽淡白、翼黑帶藍光而初級飛羽基部白、尾黑帶綠光、嘴大部分紅、腳橙色；雌鳥較暗沾褐；飛行時以「上體均勻、腰不淡白」與灰椋鳥區分；越冬主要 11 月至 3 月、12 月初高峰，最高計數 2006-12-25 單次 11,260 隻飛往夜棲、2006/07 冬季另有 6,509 與 3,637 隻，新界西北魚塘區以外最高 2007-02-03 錦田 1,868 隻；2001–05 至 2016–19 冬季圖集分佈減少 59%，錦田一帶明顯減少；九龍公園、大尾篤、洪水橋有繁殖或疑似繁殖，巢在樹洞、村屋屋頂或牆洞、冷氣機底，4 月下旬至 6 月下旬築巢，2015-06-07 見一家四隻離巢幼鳥；夜棲於大埔海濱公園與大埔工業邨大榕樹、港島寶馬山植林；雜食而機會主義（洋紫荊花瓣、榕果、鴨腳木、烏桕、白千層、樟樹、木棉蜜、昆蟲、魚糧），比同屬更愛地面覓食。BirdLife 2018 LC、趨勢**穩定**（推測）、繁殖 EOO 2,090,000 km²、非繁殖 2,440,000 km²、完全遷徙、世代 4.4 年、森林依賴度「通常不出現於森林」；國家表把**香港（中國）列為原生非繁殖**，菲律賓與南韓為迷鳥。runtime 只有五軸有分（i=2、v=3.4 含 vEst=1、r=2.5、c=1.2、o=2.3），**a 完全沒有分數**故 missingScores 為 a；v 待查（length 與 look 中文皆空，翼 120.6 mm×0.22≈26.5 cm 略高於 23–26 cm）、o 依賴待查分項不補算；i、r、c 沿用。runtime 缺陷：look／habitat／voice／behavior／migration／conservation 中文全空，breeding 是分佈與營巢合句、funFact 與 etymology 都不是野外資訊，length 與 weight 為空、callouts 缺失。地圖只填中國、日本、台灣與越南（菲律賓、南韓為迷鳥故不填；香港併入中國）。標籤「奶白頭部／紅色嘴／白色翼斑／橙色腳」皆對應插圖像素；主圖本身已是 1024×1024 方形、只作輕微裁切，比較鳥沿用 0452 的灰頭椋鳥及 0450 的北椋鳥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores（a）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0454；0454–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0454 已交付

- `400-500` 內 `name = '0454.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0454 灰椋鳥](https://drive.google.com/file/d/1XXK3sDAbEzRhIZKHTQ20HvfKZeQGbns1/view)：133447 bytes、MD5 `19c58ad86c58a410fdcc380a54758f0a`、SHA256 `49ef03c0d7e91cdc05d34681fe37142e89ba3892f3a478d82343fdcaa2c605b7`。HKBWS 045300（頁面編號與 app 的 0454 不同，路徑為 `0380/`）：香港第 I 類，局部常見但正在減少的冬候鳥，近年有繁殖紀錄；22–24 cm，灰褐色椋鳥，臉頰白（白斑面積個體差異大、部分帶黑色細縱紋）、除中央一對外尾羽末端寬白、腰有白帶；雄鳥頭部深灰與灰褐的背成對比、頦至上胸炭灰、下胸與脇較淡、腹與尾下覆羽白，嘴橙黃帶黑尖、腳鮮橙；雌鳥較褐、黑只集中於頭頂、臉部白斑較大；幼鳥似雌鳥但更淡、白頰帶褐縱紋；飛行時整體灰褐、欠絲光椋鳥的初級飛羽白基斑與淡色頭部；叫聲為特色鼻音高音 tveet（絲光椋鳥不會發出），警報聲拖長 skaaar 而音調較絲光椋鳥低；生境為低地開闊地尤以后海灣一帶，偏好濕農地與魚塘，從前常與豬場雞場相關；冬季圖集佔據的 1 公里方格由 2.4%（2001–05）降至 1.7%（2016–19），繁殖鳥調查由 0.0% 升至 0.2%；紀錄多來自米埔、落馬洲、甩洲、大生圍、塱原與新田，錦田與南生圍 2000 年代較多但現已罕見，河上鄉、風樂圍、米埔新村 2010 年代增加；新界以外罕見，蒲台島過境幾乎每年有少量，南丫、大嶼山、港島香港公園極少，何文田與葵涌等近市區亦有少數；越冬期最早 10 月初到達、11 月初大致到齊，數量穩定至 2 月第三週，3 月中下旬再減；1980 年代數量極低，1990 年代至 2000 年代初大量，2012/13 冬季起再下降，此後每年每週合計高峰低於 200 隻；最高計數 1999-02-20 米埔 600 隻，另有 2003-11-13 330 隻與 2002-11-10 323 隻；歷史紀錄：Swinhoe (1861) 見群、Kershaw (1904) 不常見、Vaughan & Jones (1913) 與 Hutson (1930) 未提及、Herklots (1953) 只有 1931 與 1936 兩筆、Dove & Goodhart (1955) 1952-12-07 盟山半島 60 隻、Walker (1958) 10 月 5 日至 4 月 2 日頗常見；繁殖：2000 年代初起少量度夏並繁殖，2004 年起見疑似配偶，2005-05-23 錦田首次見鳥帶食物入巢，此後 5 月下旬至 9 月中旬幼鳥常見，夏季成幼混群顯示區域內有更大繁殖族群；雜食但可能是本港最嗜果的椋鳥，冬季後半特別愛吃苦楝果實，亦吸木棉蜜，常成 20 隻以上群並與絲光椋鳥、黑領椋鳥、八哥混群及群棲。BirdLife 2024 LC、成熟個體 Unknown、趨勢 **Unknown**（生境改變影響難判斷）、繁殖 EOO 7,720,000 km²、非繁殖 3,940,000 km²、完全遷徙、海拔 0–1,970 m、世代 3.6 年、森林依賴度 Low、3 個 IBA；國家表把**香港（中國）列為原生非繁殖**，寮國、緬甸、菲律賓、泰國與北馬里亞納群島為迷鳥。runtime 六軸齊全（i=2、a=5.0、v=3.5 含 vEst=1、r=1.8、c=1.2、o=2.7），missingScores 為空；a 待查（habitat 中文全空，且 runtime 自述 diet／range／look／funFact 含「來源請求」標記，a=5.0 為量尺最高分卻無可靠支撐）、v 待查（length 與 weight 皆空，翼 127.5 mm×0.22≈28.1 cm 高於 22–24 cm）、o 依賴待查分項不補算；i、r、c 沿用。runtime 缺陷：habitat／voice／migration／etymology 中文全空，diet／range／look／funFact 被 runtime 自標為未經引註，length 與 weight 為空。地圖按 BirdLife 原生國家填八個（中國、日本、蒙古、北韓、俄羅斯、南韓、台灣、越南；香港併入中國，五個迷鳥地不填）。標籤「白色臉頰／白色尾端／白色腰帶／橙色腳」皆對應插圖像素；主圖原為 1408×768 橫幅、補成方形後裁 `(0.10,0.20,0.90,1.00)`，畫出苦楝枝與黃果呼應冬季嗜食苦楝果實，比較鳥沿用 0453 的絲光椋鳥及 0449 的紫翅椋鳥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0455；0455–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0455 已交付

- `400-500` 內 `name = '0455.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0455 家八哥](https://drive.google.com/file/d/1aCC3wVpEXmcSnmzouU-15WHuzO_PeW97/view)：135890 bytes、MD5 `4ddeaa1415179baeacbc6e4d9885661c`、SHA256 `47100da46f108f7c6e73da3900a71137a07c728e72eda47b8706507e761cdb57`。HKBWS 045100（頁面編號與 app 的 0455 不同，路徑為 `0380/`）：香港第 IIB 類，局部常見留鳥，族群相信源自逃逸籠鳥；23–26 cm，成鳥朱古力褐身體、光澤黑頭、鮮黃嘴腳與眼後眼下裸皮、白色翼斑與白色尾下覆羽；幼鳥較暗啞帶褐；生境為農地、魚塘及開闊鄉郊或村邊，主要在新界，避開森林與山區；1952-01-26 盟山首錄，1979–1981 石崗軍事建築繁殖，1994 米埔、上屋村與上水繁殖，2000 年代向北平擴至塱原與新界西北魚塘，2015 年起在貝澳落戶大嶼山，九龍仔、美孚、旺角等市區公園亦有少數；繁殖鳥調查 1993–96→2016–19 範圍 +68%（2.4%→4.0%），冬季圖集 2001–05→2016–19 +74%（2.0%→3.5%），即使開闊生境面積近二十年減少仍在擴張；留鳥無遷徙，1999 年以來最高 2018-01-25 新田 63 隻，另有 2019-11-15 石崗 60 隻、2017-02-22 大崗埔 53 隻，塱原最多 30 隻、長洲 16 隻、大尾篤 10 隻；群棲並常與八哥同棲，機會主義、常在地面與八哥一起覓食；多在屋頂、電塔、冷氣機後築巢，最早 1 月 20 日、最遲 4 月 29 日，幼鳥 4–9 月；兩個亞種，香港族群大概屬指名亞種。BirdLife **2025** LC、成熟個體 **200,000,000**（2017 年估計、品質差）、趨勢 **Decreasing**（以 eBird 2015–2022 推斷、整體緩慢）、繁殖／留鳥 EOO 18,000,000 km²、非遷徙、海拔 0–3,740 m、世代 3.2 年、森林依賴度 Low；國家表把**香港（中國）列為 Introduced 留鳥**，原生 16 國（阿富汗、孟加拉、不丹、柬埔寨、中國大陸、印度、伊朗、哈薩克、寮國、馬來西亞、緬甸、尼泊爾、巴基斯坦、新加坡、斯里蘭卡、泰國、越南），吉爾吉斯、塔吉克、土庫曼、烏茲別克在 BirdLife 列為引入而 BoW 視為原生。runtime 六軸齊全（i=2、a=4.7、v=3.3、r=3.3、c=3、o=3.3，沒有 vEst），missingScores 為空；v 待查（翼 139.8 mm×0.22≈30.8 cm 高於 23–26 cm，length 欄 23 cm 雖相符亦不足以單獨支撐）、o 依賴待查分項不補算；i、a、r、c 沿用（a 有 diet／range／look 中文支撐，且 HKBWS 顯示本地範圍持續擴張）。runtime 缺陷：habitat 中文是群棲句子而非生境、breeding 中文是 1978 年普納日間活動分配、conservation 中文講排擠本地鳥類而非保育評級，weight 為空、length 只有 23 cm。地圖按 BirdLife 原生國家填 16 個（新加坡在 110m 底圖無幾何故不填，香港列為 Introduced 不填，各地引入族群亦不填）。標籤「黃色眼周／黃色嘴／白色翼斑／白色尾下」皆對應插圖像素；主圖原為 1408×768 橫幅，補成方形後裁 `(0.08,0.14,0.88,0.94)`，背景為村邊草地與魚塘；比較鳥沿用 0454 的灰椋鳥及 0449 的紫翅椋鳥，非等比例、非專家認證。本種為 IUCN「全球 100 種最嚴重入侵外來種」之一（名單上僅三種鳥類之一），卡面只呈現本地與全球種群資料。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0456（懷氏地鶇）；0456–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0456 已交付

- `400-500` 內 `name = '0456.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0456 懷氏地鶇](https://drive.google.com/file/d/1BRsgBQnv1RABoAdPP4EDhnEX8buXEmxm/view)：150060 bytes、MD5 `84879dbd368eb88b2dc0e07bc03c2843`、SHA256 `0294871d22184e2feaccf7087f0737abb62c77578390b14e352bf03ba9da14b7`。HKBWS 046100（頁面編號與 app 的 0456 不同，路徑為 `0390/`，鶇科）：香港第 I 類，不常見冬候鳥、稀少過境鳥；大型花紋斑駁的鶇，上體淡黃褐混黑、下體白而喉胸脇有寬闊深灰黑新月斑、白色眼圈、淡色眉紋、深色頰斑、腳淡粉粗壯，飛行時可見白色尾角；生境為森林、林緣、風水林、市區公園及鄰近樹木的草坪、野餐區、高爾夫球場，偏好濕潤林地與低地（大帽山紀錄極少）；1953 年才首錄（4 月 11–18 日，可能反映當時缺乏成熟森林），越冬族群 11 月第三週建立、留至 2 月第三週，最早 2012-09-23、最遲 2005-05-08，10 月仍罕見（2003–2020 十一年 26 筆）；冬季圖集 1 公里方格佔有率由 3.5%（2001–05）降至 1.5%（2016–19），大嶼山、港島、西貢跌幅明顯；1995 年初湧入至少 45 隻／17 地點，2003/04 與 2013/14 冬季亦較多；最長停留 1988-01-01 至 04-30 港島舊域多利兵房一至兩隻；獨居害羞、多在被驚飛時發現，在地面覓食、極少上結果樹，很少鳴叫；兩個亞種，香港出現的較可能是 Z. a. toratugumi。BirdLife **2019** LC（2016 年前未被承認）、成熟個體 Unknown、趨勢 **Decreasing**（Suspected，伐木與森林退化；歐洲反而上升）、繁殖 EOO 42,900,000 km²、非繁殖 16,700,000 km²、完全遷徙、海拔 0–3,600 m、世代 3.0 年、森林依賴度 Medium、主要威脅為伐木、用途為食用與寵物；國家表把中國列為原生非繁殖、日本原生繁殖兼留鳥、俄羅斯／南韓／蒙古原生繁殖、台灣與斯里蘭卡原生留鳥，**香港沒有獨立一列**。**runtime 三項資料庫皆完全沒有 0456**：`dexScores.json` 無評分（六軸全部待查，missingScores 為 i/a/r/c/v/o）、`cardCopy.json` 無文案、`measurements.json` 無量度，故本卡內容全部改由 HKBWS 與 BirdLife 撰寫，且無法以翼長換算體長；卡面版式本身不顯示 runtime 文案，故無空欄問題。地圖按 BirdLife 原生國家填 19 個（香港併入中國；馬來西亞、阿曼與歐洲迷鳥不填；印尼與斯里蘭卡為間斷族群亦填）。標籤「白色眼圈／黑新月斑／金褐鱗羽／淡粉腳」皆對應插圖像素；主圖原為 1408×768 橫幅，補成方形後裁 `(0.06,0.10,0.90,0.94)`，站於潮濕落葉層以呼應地面覓食習性；比較鳥沿用 0447 的矛紋草鶥及 0454 的灰椋鳥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（空）／missingScores（六軸）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0457（灰背椋鳥）；0457–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0457 已交付

- `400-500` 內 `name = '0457.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0457 灰背椋鳥](https://drive.google.com/file/d/1nZRy5pJjY9Owb0kuPBzV0GmJRgzriqIO/view)：138876 bytes、MD5 `6be4d9c766541cc8b7f071acc9a13eb9`、SHA256 `acfa05fce3e4117968b5d2570e000c0927370f5898164aa8e43b4c989c93a0ae`。HKBWS 045700（路徑 `0380/`）：香港第 I 類，局部常見過境鳥與繁殖鳥、不常見冬候鳥，主要在新界西北開闊鄉郊；17–20 cm，小型淡色椋鳥，額淡黃褐連銀灰後頸與背、腰與尾上覆羽白、肩羽奶白成大片肩斑、尾黑而末端寬白、虹膜銀白、嘴藍灰；雌鳥較灰、幼鳥較褐而翼上無白且嘴偏粉；偏好有樹木、建築與架空電線的開闊鄉郊，容忍人類、常與村落棚屋相關，避開林地山區；最大族群在后海灣商業魚塘區（米埔、落馬洲、新田、馬草壟、南生圍、蠔殼圍），塱原亦常見，赤柱、貝澳、白泥、石崗、大尾篤近年增加，蒲台島過境最多 55 隻；春季 4 月首三週最多、秋季過境 8 月最後一週至 10 月中（9 月下半月高峰）、冬季每週少於 20 隻；最高 2014-09-02 米埔 950 隻，其次 2016-03-22 荔枝窩 300 隻；顏色環誌顯示繁殖與越冬族群基本分立、香港應無真正留鳥；繁殖鳥調查方格比例 3.7%→3.8% 但分佈大改（沙田以南以東 20→6 格、大嶼山與索罟群島 9→1 格，由后海灣腹地與錦田增加抵銷）；巢址多為人工構築物（舊建築洞、村屋縫隙、街燈柱、2008 年起巢箱），鬆散群殖，2011 年至少 137 窩、最少 544 隻雛鳥離巢，巢箱使用率落馬洲 100%／西鐵 81%，最大一窩 7 隻雛鳥加一蛋、一季最多三窩、第一窩平均 4.43 隻，產卵期 5 月 19 日至 7 月 11 日；雜食（馬纓丹與細葉榕果實、開花桉樹、毛蟲），成群而相當樹棲。BirdLife **2025** LC、成熟個體 Unknown、趨勢 **Stable**（無已發表趨勢數據）、繁殖 EOO 1,070,000 km²、非繁殖 3,330,000 km²、完全遷徙、6 個 IBA、海拔 0–1,480 m、世代 3.4 年、森林依賴度「通常不出現於森林」、貿易低普遍度；國家表 14 個原生國家（含新加坡，香港沒有獨立一列）。**runtime 三項資料庫皆完全沒有 0457**（同 0456）：`dexScores.json` 無評分（六軸全部待查，missingScores 為 i/a/r/c/v/o）、`cardCopy.json` 無文案、`measurements.json` 無量度，卡面內容全部改由 HKBWS 與 BirdLife 撰寫，亦無法以翼長換算體長。地圖按 BirdLife 原生國家填 13 個（新加坡在 110m 底圖無幾何故不填；香港併入中國）。標籤「銀白眼／奶白肩斑／白色尾端／淡粉腳」皆對應插圖像素（第 4 格原擬「藍灰嘴」但落在大片空背景，改為抓握鐵線的腳）；主圖原為 1408×768 橫幅，補成方形後裁 `(0.10,0.18,0.86,0.94)`，站於魚塘邊鐵線上。
- **本輪遇到工作區被重置**：branch ref 回到 base commit，`cards/art/`（gitignore）內 0447–0456 的插圖與 `deliver/cards/`（gitignore）全部消失；已從 `origin/arena/b2d882cf-aviandex` reset 回 `5bf6f67` 取回 spec 與 docs，0457 的插圖與 spec 先備份到 `/tmp/keep4/` 再還原。因舊插圖已無法重用，0457 的兩張比較鳥（絲光椋鳥、北椋鳥）改為重新生成，與 0453／0450 已交付卡上的插圖並非同一張，屬近似示意。
- 驗 spec／manifest／withheldScores（空）／missingScores（六軸）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0458（白眉地鶇）；0458–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0458 已交付

- `400-500` 內 `name = '0458.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0458 白眉地鶇](https://drive.google.com/file/d/1UOH0CJexkFA8OAcepGTvUsU7SL43BVQi/view)：154814 bytes、MD5 `018a6581f2a8d5a717ab4803742e70bc`、SHA256 `50b5dac38904774e179d727068d27673ef32bde9f48b6faf8835f289df1cdf1b`。HKBWS 046200（路徑 `0390/`，鶇科）：香港第 I 類，秋季稀少過境鳥、冬季與春季罕見，一般在有林地區；20–23 cm，雄鳥石板藍灰、頭部更深、由眼前起一條寬而收窄的粗白眉，指名亞種 sibirica 較淺偏藍且尾下至腹部白，davisoni 更暗更冷、尾下覆羽只有窄白端、腹部無白；雌鳥欖褐、頭胸斑駁、下體深色鱗斑；兩個亞種都會出現而雄鳥以 sibirica 較多；1958-10-31 首錄，秋季 10 月最多，隆冬至春季罕見，最高為 1995-01-14 至 02-07 與 2008-12-31 梧桐寨 4 隻、另有 2019-10-08 至 11-03 大欖郊野公園 8 隻，秋季最早 9 月 16 日甲龍兩隻、春季最遲 2019-04-28 至 05-09 何文田一隻；雄鳥紀錄至少為雌鳥兩倍；略少於一半紀錄來自大帽山山塊；隱蔽難見，在落葉層翻找無脊椎動物、亦在結果榕樹覓食，叫聲為高音 tsip。BirdLife **2024** LC、成熟個體 Unknown、趨勢 **Decreasing**（Suspected，十年間分佈範圍樹冠減少 11%、推算下降 1–19%）、繁殖 EOO 11,500,000 km²、非繁殖 4,640,000 km²、完全遷徙、8 個 IBA、海拔 0–2,570 m、世代 3.5 年、森林依賴度 **High**；國家表把**香港（中國）列為 Vagrant**、台灣亦為 Vagrant，與 HKBWS 視香港為第 I 類秋季過境鳥的看法不同（卡片以 HKBWS 敘述本地狀況，地圖依 BirdLife 原生國家填色）。runtime 六軸齊全（i=2、a=3.8、v=3.4 含 vEst=1、r=4.8、c=1.2、o=3.0），missingScores 為空；v 待查（length 與 weight 皆空、vEst=1 即原值由體長估算，翼 119.0 mm×0.22≈26.2 cm 高於 20–23 cm）、o 依賴待查分項不補算；i、a、r、c 沿用（a 有 diet 與 range 中文支撐；r=4.8 為本批目前最高）。runtime 缺陷：habitat、voice、conservation 三欄完全缺失，breeding 只是國名列表，look 只描述飛行時翼下條紋，length 與 weight 為空，callouts 只有兩項且一項是亞種名。地圖按 BirdLife 原生國家填 14 個（新加坡在 110m 底圖無幾何故不填；香港為 Vagrant 不另填而入中國）。**首次使用 `featureSources` 讓第四個圓圈取自另一張插圖**：本種雌雄差異大，另生成雌鳥圖（`female-crop.png`）取其下體鱗斑作為第 4 格；主圖與雌鳥圖皆由 1408×768 橫幅補方形後裁 `(0.08,0.13,0.88,0.93)`。比較鳥為本輪新生成的懷氏地鶇與白眉鶇（舊插圖在沙盒重置後遺失），非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0459；0459–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0459 已交付

- `400-500` 內 `name = '0459.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0459 橙頭地鶇](https://drive.google.com/file/d/1RFYX09NAO8Wp2yALEt5N9OSpFl2sbtvx/view)：153024 bytes、MD5 `8664025a99a5f1dd8c1f665401334f36`、SHA256 `42bba32cdac28d0b2354878c778db96032fdacba5855d1e79900dd9d6ac3477f`。HKBWS 046300（路徑 `0390/`，鶇科）：香港第 I 類，秋季不常見的過境鳥、稀少的繁殖鳥，主要在鬱閉森林；20–23 cm，雄鳥深橙頭胸腹與藍灰上體、尾、翼覆羽及三級飛羽成強烈對比，眼下兩條模糊深色縱紋而臉頰淡色，中覆羽寬白端、大覆羽翼帶模糊；雌鳥較暗啞沾欖褐、成鳥雌鳥翼覆羽／三級飛羽／腰有灰調，第一齡雌鳥完全無灰調；幼鳥肩羽淡色楔斑、淡黃翼帶與臉、嘴大部分淡色；鳴唱分完整的領域歌與較安靜的求偶歌，聯絡聲為極高音 tzee；1956-11-29 首錄，1998 年前多來自大埔滘，1989–1997 每年有越冬鳥、疑似同一隻雄鳥（強烈定點忠誠）；1999 年起高峰在 9 月第三週至 10 月第三週，11–12 月漸減、隆冬稀少，4 月第二週起以鳴唱雄鳥為主；首個確證繁殖為 2013-08-10 大埔滘半島一隻乞食幼鳥，2015-05-25 最早見依賴親鳥的幼鳥，該年繫放 22 隻（15 成鳥、7 幼鳥）中有 5 隻本地出生；害羞隱密、黃昏清晨較活躍，主要在落葉層地面覓食、亦上結果樹；十個亞種，中國有 melli（華南）、courtoisi、aurimacula（海南）、innotata（雲南，無白翼斑），香港相信為 melli 但與 courtoisi 幾乎無法區分，偶見非中國亞種逃逸鳥。BirdLife **2019** LC、成熟個體 Unknown（中國估計 100–10,000 對繁殖鳥）、趨勢 **Decreasing**（Suspected，籠鳥貿易捕捉與森林喪失，爪哇／峇里 rubecola 亞種野外劇減）、繁殖 EOO 16,000,000 km²、非繁殖 2,780,000 km²、完全遷徙、海拔 250–2,300 m、世代 3.0 年、森林依賴度 Medium、用途為食用與國際寵物貿易；國家表 15 個原生國家（含新加坡非繁殖），**香港沒有獨立一列**。runtime 六軸齊全（i=2、a=2.3、v=3.4 含 vEst=1、r=4.8、c=3.0、o=3.1），missingScores 為空；v 待查（length 與 weight 皆空、vEst=1 即原值由體長估算，翼 118.2 mm×0.22≈26.0 cm 高於 20–23 cm）、o 依賴待查分項不補算；i、a、r、c 沿用（a 有 habitat 與 diet 中文支撐）。runtime 缺陷：voice 句子有缺字、funFact 與 etymology 的種名解釋被截空、conservation 講 1956 年首錄而非保育評級、callouts 兩項與標籤不符；length 與 weight 為空。地圖按 BirdLife 原生國家填 14 個（新加坡在 110m 底圖無幾何故不填；香港併入中國）。標籤「橙色頭胸／藍灰上體／白色翼斑／頰上黑紋」皆對應插圖像素（第 4 格原框位只框到嘴與臉，向左移一格後才框到兩條深色縱紋）；主圖原為 1408×768 橫幅，補方形後裁 `(0.08,0.10,0.88,0.90)`。比較鳥沿用 0458 的白眉地鶇與懷氏地鶇 AI 圖，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0460；0460–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0460 已交付

- `400-500` 內 `name = '0460.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0460 寶興歌鶇](https://drive.google.com/file/d/1ZaM4oRVPCgcyoLiungRmFXA1Wk6EKl0E/view)：145308 bytes、MD5 `82dad1848b321919a0ef4bc4ab999448`、SHA256 `ca98a1b61a8e80b40cc5d2890f11bdce5dd7f7e1df91ec655df7189adbe8981a`。HKBWS 046400（路徑 `0390/`，鶇科）：香港第 I 類，冬季偶見鳥；23 cm，下體由胸至肛周佈滿大型深褐斑、耳後寬闊深色月牙、臉部灰白形成頭罩效果、上體中褐而羽心較深、白色喉部由模糊寬頰紋界定、胸脇淡黃褐底、飛羽邊緣暖褐、腳淡粉、嘴灰，第一齡冬羽翼覆羽有寬白端；鳴唱為不重複的短純音句、速度偏慢；全部紀錄在鬱閉灌叢、森林或林緣；僅五筆紀錄，都在 11 月 18 日至 3 月 24 日之間：2004-11-18 嘉道理農場（捕獲）、2006-02-16 至 03-24 蒲台、2012-12-05 蒲台、2014-01-17 至 02-01 山頂、2017-12-12 至 12-18 城門水塘；單型種、中國特有種，繁殖於中國中部（青藏高原東南緣至秦嶺、東北至北京），山區稀少而局部，非繁殖期紀錄東至南韓西岸島嶼、南至台灣；香港是已知分佈的南限；HKBWS 記 IUCN LC、趨勢穩定。BirdLife（用 Otocichla mupinensis）**2024** LC、成熟個體 Unknown（中國少於 100 對繁殖鳥）、趨勢 **Decreasing**（Suspected，樹冠十年減少 1.4%、推算下降 1–19%）、EOO 2,130,000 km²、**非遷徙**、**繁殖 endemic Yes**、海拔 1,300–3,200 m、世代 3.5 年、森林依賴度 Medium、國際寵物貿易；國家表只有中國（原生繁殖）與越南（迷鳥）。runtime 只有五軸有分（i=2、a=2.8、r=1、c=1.2、o=1.8），**v 完全沒有分數**故 missingScores 為 v；a=2.8 待查（cardCopy 只有 range／look／funFact，look 講的是分子研究而非外型，habitat 與 diet 完全缺失）、o=1.8 依賴待查分項不補算；i、r、c 沿用。runtime 缺陷：cardCopy 只有 range、look、funFact 三段中文，habitat／diet／voice／behavior／breeding／conservation／migration／etymology 全無，measurements.json 沒有本種、length 與 weight 為空、callouts 缺失。地圖只填中國（越南為迷鳥不填；香港併入中國）。標籤「褐色大斑／耳後月牙／褐背深心／淡粉腳」皆對應插圖像素；主圖原為 1408×768 橫幅，補方形後裁 `(0.06,0.13,0.86,0.93)`，背景竹林呼應中國中部山地森林；比較鳥為本輪新生成的懷氏地鶇與白眉鶇，非等比例、非專家認證。
- **本輪工作區再次被重置**：HEAD 回到 base commit `0254314`、`cards/art` 與 `deliver/cards`（gitignore）全部消失；已 `git fetch` 後 `git reset --hard origin/arena/b2d882cf-aviandex` 回到 `aef938d`，spec 與 docs 無損，0460 的插圖全部重新生成。
- 驗 spec／manifest／withheldScores（a、o）／missingScores（v）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0461；0461–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0461 已交付

- `400-500` 內 `name = '0461.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0461 粉紅椋鳥](https://drive.google.com/file/d/1Jo7pRnONqe6vOsxZ-M4q94vHq2HqzdAr/view)：139773 bytes、MD5 `dd85b991a5619d1a25406221f7847f6e`、SHA256 `4f2d9aba438abaa55237ced3eacdcf1807a04d6279c383c7b946a79ae303e817`。HKBWS 045900（路徑 `0380/`）：香港第 I 類，開闊鄉郊的罕見冬候鳥；成鳥雄鳥黑頭黑上胸配鬆散冠羽、粉紅身體、黑翼尾、淡粉嘴腳；幼鳥全身褐而腹面較淡、嘴大部分黃；第一齡冬羽最暗啞；1996 年前三筆四隻（首筆 1982-11-07／12 米埔幼鳥；1984-12-30 至 1985-04-13 廈村與尖鼻咀可能兩隻）；至 2020 年共 20 筆，9 月 24 日至 4 月 28 日、多在 10 月至 3 月，絕大多數為幼鳥或換羽中的第一齡冬羽，成鳥型紀錄包括 2014-02-27 一隻鳴唱雄鳥；地點集中新界西北低地開闊鄉郊（塱原至尖鼻咀），另有數碼港、蒲台島、青衣公園各一筆；覓食方式似紫翅椋鳥，地面與樹上都會；叫聲為帶轉音嗡鳴 zeerp 與絮語；單型種，繁殖由歐洲東南部至中國西北、南至伊朗西北與阿富汗，主要於印度次大陸越冬。BirdLife **2025** LC、成熟個體 400,000–1,600,000（2021 年估計、品質差）、趨勢 **Stable**、繁殖 EOO 8,190,000 km²、非繁殖 2,310,000 km²、完全遷徙、2 個 IBA、海拔 0–3,120 m、世代 3.3 年、森林依賴度「通常不出現於森林」、貿易高普遍度（食用、國際寵物、運動狩獵）、伯恩公約附錄 II；國家表把**香港（中國）列為 Vagrant**，原生國家多達 46 個。runtime 三項資料庫皆完全沒有 0461（同 0456、0457）：`dexScores.json` 無評分（六軸全部待查，missingScores 為 i/a/r/c/v/o）、`cardCopy.json` 無文案、`measurements.json` 無量度，卡面內容全部由 HKBWS 與 BirdLife 撰寫。地圖把 46 個原生國家全部填色（溫帶歐亞大片綠色是如實反映繁殖 EOO 8,190,000 km²；香港為 Vagrant 不另標示、併入中國；歐洲與北非各地迷鳥不填）。標籤「黑頭冠羽／粉紅身體／黑色翼尾／淡粉腳」皆對應插圖像素；主圖原為 1408×768 橫幅，補方形後裁 `(0.10,0.14,0.90,0.94)`，站於魚塘邊草地；比較鳥為本輪新生成的紫翅椋鳥與灰椋鳥，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（空）／missingScores（六軸）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0462；0462–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0462 已交付

- `400-500` 內 `name = '0462.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0462 烏鶇](https://drive.google.com/file/d/1or_bdNud1jN7WVtsb8yUWFrUtrLoaQK0/view)：147136 bytes、MD5 `37580331f0b3a224d6349bc0f2be026f`、SHA256 `14bd95df340bee66c4745b12e4574bce9278e89367cb8779f134c31f8515f6ad`。HKBWS 046500（路徑 `0390/`，鶇科）：香港第 I 類，常見的過境鳥與冬候鳥，同時是新界西北稀有但日增的繁殖鳥；28–29 cm，體型最大的全深色鶇之一，成鳥雄鳥上體烏黑、下體褐黑至煙黑，具狹窄橙黃眼圈、橙至鮮黃嘴、黑褐腳；第一齡雄鳥黑度較低、初級覆羽與三級飛羽偏黑而與較褐的飛羽成對比、嘴較不黃；第一齡雌鳥較褐、帶模糊鱗斑、初級覆羽較灰；成鳥雌鳥略褐、頦與喉較淡並具寬闊深色縱紋、眼圈較不明顯；幼鳥深褐而帶淡黃斑駁與縱紋。叫聲為金屬感的飛行聲 hyeev、驚叫 chip／choo，鳴唱為同音高的雙音節 weet-hu。冬季見於疏林鄉郊與市區公園，集中新界中部、東部與北部，港島、離島、九龍亦有；1 公里方格佔有率由 20.7%（2001–05 冬季圖集）跌至 8.2%（2016–19），大嶼山、南丫、港島及新界西北與中部的跌幅比例更大；數量最多在大帽山山塊（梧桐寨、林村、石崗、城門）、米埔、大埔滘、塱原／河上鄉、船灣；蒲台島秋季可逾 20 隻；最高紀錄 1988-11-24 東涌至沙螺灣 500 隻，1999 年後最高為 2005-11-18 梧桐寨 130 隻。繁殖僅見於新界西北（米埔、落馬洲、棕櫚園、凹頭、屯門／元朗／天水圍公園），繁殖調查方格比例 0.4%（1993–96）升至 0.8%（2016–19）；出現期為 10 月第二週至 3 月底、11 月高峰，越冬鳥 10 月第一週已到位、部分 1 月上半月開始離去，少數夏季仍留；首個確證繁殖為 1995-08-06 粉嶺園圃（一隻幼鳥加兩隻成鳥，1996-05-19 再見），2000 年代罕見（2004-06-28 米埔村幼鳥），2010 年起轉為常見、2023 年有 10–20 對，多在市區公園築巢，3 月底起築巢、幼鳥 5 月底至 9 月初；常在草坪公開在地面覓食，成群落於樹冠棲息，吃樟樹與鵝掌柴果實。HKBWS 記為中國特有繁殖鳥（廣西／四川東北部至北京），冬季南至中南半島北部，兩個亞種 T. m. mandarinus 與較少見的 T. m. sowerbyi；IUCN LC 而趨勢 **Decreasing**。BirdLife **2018** LC、成熟個體未量化（2009 年、品質差）、趨勢欄 **Stable**（Suspected）但說明文字寫「appears to be increasing」，兩者互相矛盾；EOO 繁殖 3,440,000 km²、非繁殖 4,020,000 km²、完全遷徙、繁殖 endemic Yes、無 IBA／KBA、世代 5.4 年、森林依賴度 Medium、生境含溫帶森林（主要）、北方森林、市區、鄉村花園、人工林、耕地、溫帶草原與灌叢，用途為食用、寵物與運動狩獵，並誤稱「由至少部分**歐洲**國家的繁殖鳥調查監測」；國家表把**中國列為原生繁殖／留鳥、香港（中國）列為原生非繁殖**，寮國、澳門、越南原生非繁殖，不丹、柬埔寨、印度、日本、緬甸、尼泊爾、南韓、斯里蘭卡、台灣、泰國為迷鳥（與 HKBWS 視香港有 10–20 對繁殖鳥的看法不同，卡片以 HKBWS 敘述本地狀況，地圖依 BirdLife 原生國家填色）。runtime 六軸齊全（i=2、a=4.3、v=3.7 含 vEst=1、r=3.3、c=1.2、o=2.9），missingScores 為空；**v 與 o 待查**（length 與 weight 皆空、vEst=1 即原值由體長估算，翼 146.6 mm×0.22≈32.3 cm 高於 HKBWS 的 28–29 cm，3.7 分缺乏支撐；o 依賴待查分項不補算），i、a、r、c 沿用（a 有 diet、range、look、habitat 四段中文支撐，為本批最高）。runtime 缺陷：cardCopy 缺 conservation 與 etymology，length 與 weight 為空，callouts 只有喙橙黃、腹部棕黑兩項。地圖填 CHN、LAO、VNM 三國（澳門在 110m 底圖無幾何故不填；香港為原生非繁殖、併入中國）。標籤「橙黃眼圈／橙黃嘴／通體烏黑／近黑腳」皆對應插圖像素；主圖原為 1408×768 橫幅，補方形後裁 `(0.08,0.12,0.88,0.92)`，站於公園草坪以呼應在地面覓食；比較鳥為本輪新生成的寶興歌鶇與白眉鶇，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0463；0463–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0463 已交付

- `400-500` 內 `name = '0463.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0463 烏灰鶇](https://drive.google.com/file/d/14jCSnI2fSjRokJlNP5ZD_DgxoAOHO8ky/view)：151611 bytes、MD5 `52e33555e9f624399b134994d9a353f1`、SHA256 `f8242a766d4a0a181ba920169ef52a87a98208dfe64d2547fa60503aacfd7809`。HKBWS 046600（路徑 `0390/`，鶇科）：香港第 I 類，疏林與鬱閉林地常見的冬候鳥及過境鳥，1960–70 年代以後可能減少；21–22 cm，成鳥雄鳥頭與胸石板灰、與中藍灰上體及尾成明顯對比，脇灰而腹部佈滿同色大型斑點，嘴大部分黃，少數個體腹部無斑；成鳥雌鳥上體灰褐、下體白而胸脇密佈灰斑、上脇有橙色渲染，第一齡雌鳥大覆羽與三級飛羽有淡色端；第一齡雄鳥變異大（部分似成鳥但保留較褐的幼羽飛羽，部分頭與上體對比微弱而下體密佈斑點），日本繁殖鳥據說較暗較均勻。叫聲為高頻帶輕微嗡鳴的飛行聲、音高較灰背鶇略低，警報聲與其他鶇幾乎相同。見於森林、風水林與較疏林地（包括有足夠地面覆蓋的市區公園），通常單獨或五隻以下小群、常與其他鶇混群；1999–2020 年由 11 月第二週至 4 月第一週出現，極端日期 1970-10-25 與 1960-05-08，11 月下半月過境高峰，12 月第三週至 2 月中數量穩定代表越冬族群、之後減至 3 月中，3 月下半月至 4 月第一週略升為較弱的春季過境；相對灰背鶇可能自 1960 年代減少（1966–67 年 MAPS 在山頂捕獲 34 隻本種對 30 隻灰背鶇；1999–2020 年遞交紀錄的遇見率只有灰背鶇一半）；近年最高 2019-11-21 南丫島攝影水池 85 隻，正常觀鳥最高 2009-11-25 蒲台島 56 隻（其中 41 隻清晨飛過）；1960–70 年代曾見多達 20 隻的群，最高 1969-02-01 及 02-08 港島 Bethanie 40 隻、1971-01-05 至 01-07 寶珊道 30 隻；Swinhoe (1861) 於 2、3 月紀錄、Kershaw (1904) 記為冬季常見、Vaughan & Jones (1913) 認為不很多但春季較多、Herklots (1953) 同意；常在結果樹木與灌木進食（Ilex rotunda var. microcarpa、Machilus thunbergii、Schefflera heptaphylla、Osmanthus matsumuranus、Celtis sinensis），亦在落葉層找無脊椎動物、清晨黃昏較多。單型種，兩個繁殖族群（日本全境；中國中部至東岸），冬季南至華南與中南半島東北部；香港無繁殖紀錄。BirdLife **2018** LC、成熟個體 Unknown、趨勢 **Unknown**（評語：生境改造影響不確定而難以判斷）、繁殖 EOO **3,250,000 km²**、非繁殖 EOO **1,050,000 km²**、完全遷徙、繁殖 endemic **No**、7 個 IBA／KBA、海拔 400–1,500 m、世代 **6.1 年**、森林依賴度 Medium、生境以溫帶林為繁殖期主要而非繁殖期見亞熱帶低地濕林／鄉村花園／農地／溪流、用途為國際寵物貿易、無系統性監測計畫、已納入國際法規；國家表把中國、日本、寮國、北韓、俄羅斯（含亞洲部分）、南韓、台灣、越南列為原生，泰國為迷鳥，**香港沒有獨立一列**。runtime 六軸齊全（i=2、a=2.3、v=3.4 含 vEst=1、r=3.3、c=1.2、o=2.4），missingScores 為空；**v 與 o 待查**（length 與 weight 皆空、vEst=1 即原值由體長估算，翼 115.0 mm×0.22≈25.3 cm 高於 HKBWS 的 21–22 cm；o 依賴待查分項不補算），i、a、r、c 沿用（a=2.3 的低分與文案厚薄相符）。runtime 缺陷：habitat、voice、conservation、etymology 四欄沒有中文，look 與 funFact 完全重複且只描述第一齡雄鳥，diet 只有「它也會取食水果」一句，length 與 weight 為空，callouts 缺失。地圖填 CHN、JPN、LAO、PRK、RUS、KOR、TWN、VNM 八國（泰國為迷鳥不填；香港併入中國；俄羅斯只按國家填色，不代表烏拉山以西有繁殖族群）。標籤「石板灰頭胸／黃嘴／白腹黑斑／淡粉腳」皆對應插圖像素（第 2 格原框位令嘴落在左上角、大片空景，改框後嘴置中；第 1 格下移以帶到灰色喉胸）；主圖原為 1296×816 橫幅，直接取中央 816×816 方形（不補邊，避免平面色帶）再放大至 1127×1127，站在風水林落葉層以呼應地面覓食；比較鳥為本輪新生成的灰背鶇與白腹鶇，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0464；0464–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0464 已交付

- `400-500` 內 `name = '0464.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0464 灰背鶇](https://drive.google.com/file/d/1majR79rRkKClp4XSNHRzaDag7yNDtONz/view)：139973 bytes、MD5 `2a43901a85cd32f9a137c682669d9348`、SHA256 `64a3e1a14ff04693f6844c1411e28fd7df10ec40f4fea3ce8301837772b211b8`。HKBWS 046700（路徑 `0390/`，鶇科）：香港第 I 類，多樣林地常見的冬候鳥與不常見過境鳥，是香港兩種最常見鶇之一；20–23 cm，成鳥雄鳥上體、頭、喉與胸為中灰，胸下有一窄帶橙、沿脇變闊，腹部、肛周與尾下覆羽純白，嘴大部分淡黃；第一齡雄鳥相似但灰中混褐、胸與上腹有深色斑、部分大覆羽有淡色端、嘴較暗啞；成鳥雌鳥上體褐、腰與尾上覆羽較灰，乳白胸喉有粗褐斑、中至下脇橙、大覆羽純褐；第一齡雌鳥上體暗褐、大覆羽淡色端可見整個冬季、下體斑點更多。飛行叫聲為高頻帶輕微嗡鳴、音高較烏灰鶇略高，警報聲與其他鶇幾乎相同。見於全港森林、風水林與較開闊的疏林（花園、市區公園），以鬱閉次生林最為偏好；冬季鳥類圖集佔有 1 公里方格比例由 20.9%（2001–05）降至 14.1%（2016–19），跌幅見於大嶼山南部、港島、西貢與新界東北，香港位於越冬範圍南緣、冬季變暖可能令部分鳥留在更北；核心越冬期為 11 月第三週至 2 月第三週，最早秋季紀錄 2019-10-31，11 月上半月數量仍低而秋季過境證據不多，2 月大量離開後數量低而平穩至 4 月第一週，部分 3–4 月紀錄相信是過境鳥，最遲春季紀錄 1978-04-25；常成 20 隻以下小群、在森林中常與烏灰鶇一起，害羞隱蔽、只靠高頻嘶聲得知存在；東北季風南下後數量最多，1992-01-18 大埔滘 50 隻、1992-01-21 嘉道理農場 42 隻、1995-02-02 香港仔郊野公園約 100 隻鶇大多為本種，繫放顯示會回到同一越冬地；Swinhoe (1861) 在澳門紀錄的相信是本種且數量豐富，Kershaw (1904)、Vaughan & Jones (1913) 與 Herklots (1953) 皆記為常見冬候鳥、由 11 月中至 5 月初；在十多種結果樹木（苦楝、白楸、鐵冬青、潤楠、石楠、鴨腳木、雀榕、龍船花、桂花、紅鱗蒲桃、九節、朴樹）與落葉層覓食、清晨黃昏較多。單型種，繁殖於西伯利亞東南部、中國東北與北韓，冬季在華南與越南北部。BirdLife **2018** LC、成熟個體 Unknown、趨勢 **Unknown**（生境改造影響不確定）、繁殖 EOO **2,170,000 km²**、非繁殖 EOO **1,560,000 km²**、完全遷徙、繁殖 endemic **No**、6 個 IBA／KBA、海拔 0–1,100 m、世代 **6.1 年**、森林依賴度 Medium、生境以溫帶林（繁殖）與亞熱帶低地濕林（非繁殖）為主要、用途為食用與國際寵物貿易、無系統性監測、已納入國際法規；族群描述為俄羅斯與中國繁殖期常見、北韓罕見、南韓不常見而局部、香港非繁殖期常見至豐富、越南非繁殖期不常見至相當常見；國家表把**香港（中國）與澳門（中國）都列為原生**（本批目前唯一把香港獨立列出者），中國、北韓（繁殖）、俄羅斯（含亞洲部分）、南韓、越南原生，日本與台灣為迷鳥。runtime 六軸齊全且**全部沿用**（i=2、a=3.3、v=3.2 無 vEst、r=3.3、c=1.2、o=2.6），missingScores 與 withheldScores 皆為空：v 有實據——**length 20–23 cm 與 weight 66.7 g 皆有值**且無 vEst，AVONET 翼 115.8 mm×0.22≈25.5 cm 雖略大於上限但原值非由翼長推算，故保留；a 有 diet、look、behavior、breeding 與 callouts 支撐。runtime 缺陷：habitat、voice、conservation、etymology 四欄沒有中文，diet 只有一句「牠們的食物包括水果和昆蟲」，breeding 講的是人工飼養數據，callouts 兩項與 look 重複。地圖填 CHN、PRK、RUS、KOR、VNM 五國（香港與澳門在 110m 底圖無幾何故併入中國；日本與台灣為迷鳥不填；俄羅斯只按國家填色）。標籤「石板灰上體／橙黃脇／白色腹部／淡黃嘴」皆對應插圖像素；主圖原為 1296×816 橫幅，直接取中央 816×816 方形（不補邊，避免平面色帶）再放大至 1127×1127，站在鬱閉次生林落葉層；比較鳥為本輪重生成的烏灰鶇（首版把胸喉畫成有斑，與成鳥雄鳥不符，已重生成無斑石板灰胸）與沿用 0463 的白腹鶇，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（空）／missingScores（空）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0465；0465–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0465 已交付

- `400-500` 內 `name = '0465.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0465 白眉鶇](https://drive.google.com/file/d/1ULhK_bjfIMmVlJw3NgSmiEaJIydR_wnL/view)：142245 bytes、MD5 `85268262954afb71a3d01f1aca4b7eb2`、SHA256 `bd6eda240d1aea8015f0fe10258205e6e7aafa68e508d1bfdcdfd033361cab99`。HKBWS 046800（路徑 `0390/`，鶇科）：香港第 I 類，不常見過境鳥與稀少冬候鳥，見於森林或疏林；成鳥雄鳥頭與喉為素淨灰色、具長而窄的白色眉紋與眼下白色短帶、眼先黑褐、上體褐、胸下與脇橙、大覆羽純褐；第一齡雄鳥大覆羽有淡黃白端、頭帶灰、白眉與眼下白斑明顯、胸脇橙顯著；第一齡雌鳥暗啞、頭無灰調、喉有縱紋、大覆羽淡色端明顯、胸脇橙暗啞。叫聲較烏灰鶇與灰背鶇更細、更多嗡鳴、音高略低而細聽時會略降。與大部分常見鶇不同，本種最常以**過境鳥**身分被記錄：秋季主要過境在 11 月與 12 月第一週（最高 2000-11-26 嘉道理農場上空飛過 132 隻），越冬族群約由 12 月中至最遲 3 月最後一週且一般稀少，春季過境由 3 月底或 4 月初開始、主要在 4 月第二週至 5 月第一週（2016-04-14 260 隻、2019-05-03 大欖郊野公園 170 隻及翌日 165 隻）；最高紀錄為 1983-04-16 大埔滘至少 1,000 隻；極端日期 1993-10-13 與 2017-05-20；1941-04-19 首錄，Herklots (1967) 視為不常見過境鳥；遷徙期成群，多在結果樹上進食、較少下到落葉層，紀錄吃白楸、蔓九節、鐵冬青與潤楠果實。單型種，繁殖於西伯利亞中部與東部、南至蒙古北部、東至庫頁島北部，冬季在華南、中南半島北部、東南亞、蘇門答臘與爪哇。BirdLife **2025** LC（本批目前最新的評估年份）、成熟個體 Unknown、趨勢 **Decreasing**（inferred，A2 過去三代下降 10–19%，理由為高度依賴森林、分佈範圍內樹冠覆蓋三代間減少 13.5%）、繁殖 EOO **6,690,000 km²**、非繁殖 EOO **10,800,000 km²**、完全遷徙、繁殖 endemic **No**、5 個 IBA／KBA、海拔 0–1,500 m（偶然 2,400 m）、世代 **3.6 年**、森林依賴度 **High**、貿易普遍度低；國家表把**香港（中國）列為原生**，另有 21 個原生國家／地區，尼泊爾與歐洲、中東、帛琉、美國等為迷鳥。runtime 六軸齊全（i=2、a=4.3、v=3.4 含 vEst=1、r=4.8、c=1.2、o=3.1），missingScores 為空；**v 與 o 待查**（length 與 weight 皆空、vEst=1 即原值由體長估算，翼 119.8 mm×0.22≈26.4 cm 高於 runtime 與 HKBWS 的約 22 cm；o 依賴待查分項不補算），i、a、r、c 沿用（a 有 diet、look、voice、breeding、callouts 支撐，r=4.8 與本批最高並列）。runtime 缺陷：habitat 與 conservation 沒有中文，length 與 weight 為空，look 把灰頭與褐背寫成「頭頸背灰褐」、funFact 是萊瑟姆引文而非趣聞，callouts 三項與 look 重複。地圖填 20 個原生國家（香港與新加坡在 110m 底圖無幾何故不填／併入中國，尼泊爾為迷鳥不填，歐洲與中東迷鳥亦不填；俄羅斯只按國家填色）。標籤「白色長眉／橙褐胸脇／白色腹部／黃嘴」皆對應插圖像素（第 2 格原框位以褐色翼羽為主，向左下移後才以橙褐胸脇為主）；主圖原為 1296×816 橫幅，直接取中央 816×816 方形（不補邊，避免平面色帶）再放大至 1127×1127，站在結果灌木的苔枝上；比較鳥沿用 0463 的白腹鶇與本輪重生成的烏灰鶇，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0466；0466–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0466 已交付

- `400-500` 內 `name = '0466.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0466 赤胸鶇](https://drive.google.com/file/d/1-FBiwaHeJbFguMphmT7h76Go232YbEru/view)：142984 bytes、MD5 `6a508cf70e56ef25b18e0c1f8586d11e`、SHA256 `8a886a4a8e2928a1b96d6e7f5e4e5d48a0c14f1ca479feb34ea4e9d0ddea37cb`。HKBWS 047000（路徑 `0390/`，鶇科）：香港第 I 類，林地稀少冬候鳥、密度極低，是本港較少被記錄的常見鶇之一；23–24 cm，整體均勻而脇通常大片橙；成鳥雄鳥（在港罕見）臉與喉深灰、上體褐橄欖、嘴基部大範圍黃；成鳥雌鳥頭與上體均勻橄欖褐、喉較淡而有深色縱紋、脇橙較暗啞而範圍較窄、可能有模糊眉紋；第一齡鳥臉有淡色細斑、喉側有深色縱紋、羽色新鮮時大覆羽有淡色端、上體較暗啞。叫聲在飛行或棲息時急速下降、時長較短、結束較突然，與灰背鶇及烏灰鶇有別而最接近白腹鶇。全港林地廣泛分佈但密度極低；冬季由 11 月第三週至 4 月第一週，期間以外紀錄極少，極端日期 2009-11-16 與 2020-04-22，最高為 2015-12-15 何文田及 2018-12-18 蒲台島各 4 隻；多數紀錄在 11 月下半月與 12 月（顯示有過境），1 月初至 3 月中越冬數量穩定，之後回升反映春季過境；Swinhoe (1861) 於 2、3 月紀錄，Vaughan & Jones (1913) 稱其為偶然冬候鳥、最遲至 4 月 6 日，之後直至 1958 年 HKBWS 成立才有紀錄；在林地落葉層與結果樹（鵝掌柴、紅鱗蒲桃）覓食。兩個亞種：指名亞種繁殖日本北至中部、越冬日本南部與華東南（含香港、台灣）及菲律賓北部；T. c. orii 繁殖庫頁島與千島群島、越冬日本。BirdLife **2024** LC、成熟個體 Unknown、趨勢 **Decreasing**（樹冠在分佈範圍內十年間減少 2.5%，推測下降 1–19%）、繁殖 EOO **1,620,000 km²**、非繁殖 EOO **3,190,000 km²**、完全遷徙、繁殖 endemic **No**、6 個 IBA／KBA、海拔 0–2,750 m、世代 **3.1 年**、森林依賴度 Medium、貿易普遍度低（七個貿易資料集中出現於兩個）、無系統性監測、已納入國際法規；國家表為中國、日本、北韓（繁殖）、菲律賓、俄羅斯（含亞洲部分）、南韓、台灣，**香港沒有獨立一列**。runtime 只有 i=2、r=1、c=1.2 沿用（r=1 是本批最低，與「林地稀少、密度極低」相符）；**a、v、o 三軸全部待查**——cardCopy 只有 range、funFact（更把科名寫成「鶲科」）與把 range 重述一次的 behavior，look、diet、habitat 全缺，a=2.3 缺乏支撐；v=3.4 因 length 與 weight 皆空而 vEst=1（原值由體長估算），翼 119.4 mm×0.22≈26.3 cm 高於 HKBWS 的 23–24 cm；o=2.0 依賴待查分項不補算。runtime 缺陷：三段中文以外全部缺失，callouts 缺失。地圖填 CHN、JPN、PRK、PHL、RUS、KOR、TWN 七國（香港併入中國；俄羅斯只按國家填色）。標籤「深灰臉喉／橙紅脇／白色腹部／黃嘴」皆對應插圖像素（第 3 格原框位底部帶到竹枝，已上移；第 4 格原框位大片暗背景，已左移置中）；主圖原為 1296×816 橫幅，直接取中央 816×816 方形（不補邊，避免平面色帶）再放大至 1127×1127，站在林地落葉層；比較鳥沿用 0463 的白腹鶇與本輪新生成的白眉鶇，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（a、v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0467；0467–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0467 已交付

- `400-500` 內 `name = '0467.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0467 白腹鶇](https://drive.google.com/file/d/1r9RGZ--kZ9hsSOtWIMMnjIQLinweqGBG/view)：140070 bytes、MD5 `a7aefa11433fef0f59c1c83bcbfdf58a`、SHA256 `84bf5c59c13e556f96fde2db17353023195013ce6591e7da25c84d9936bcbab0`。HKBWS 046900（路徑 `0390/`，鶇科）：香港第 I 類，林地冬候鳥、多數年份稀少而部分年份不常見，1990 至 2000 年代初以後似有減少；22–23 cm，是本港最暗啞的越冬鶇——成鳥雄鳥頭與喉褐灰、嘴大部分黃而基部一小片白、上體與大覆羽及三級飛羽暗黃褐而與較灰的飛羽及外側初級覆羽成對比、下體暗灰帶細微斑駁、飛行時見白色尾角；第一齡雄鳥頭灰帶淡色細斑、喉側縱紋、下體較淡而大覆羽有淡色端；第一齡雌鳥非常樸素；成鳥雌鳥頭頂灰褐、臉較灰、喉白而有一至兩條深色頰紋、上體中褐、飛羽較灰、脇暗褐、腹近白。叫聲急速下降、較短、結束突然，與灰背鶇及烏灰鶇有別而最接近赤胸鶇，警報聲較其他鶇略柔。見於全港森林與疏林，通常一至兩隻、單點很少超過五隻；冬季鳥類圖集佔有 1 公里方格比例由 2.7%（2001–05）降至 1.9%（2016–19），跌幅見於新界西部與東北、港島與大嶼山；11 月第三週至 4 月第一週，極端日期 1992-11-04、2012-11-04 與 1996-04-26；高峰在 1 月第一週至 2 月中，反映寒冷天氣湧入；1999 年以來十隻以上的計數多在 11 月 21 日至 2 月 6 日且多在蒲台島，最高 2014-12-18 蒲台島 21 隻，全港最高為 1992-01-21 東北季風南下後嘉道理農場 51 隻；2013/14 冬季以來未再出現明顯湧入；Swinhoe (1861) 於 2、3 月紀錄後直至 1937 年 3 月才有紀錄，Herklots (1967) 稱其為 1 月中至 4 月中的偶然而不規則訪客；在結果樹與地面落葉層都會覓食但似更偏地面（鐵冬青、苦楝、白楸），部分個體冬季定點忠誠（1976 年大埔與粉嶺花園、香港大學）。單型種，繁殖濱海邊疆區、中國東北與朝鮮半島，冬季南韓、日本北海道以南與華南（含海南、台灣）。BirdLife **2024** LC、成熟個體 Unknown、趨勢 **Decreasing**（樹冠十年間減少 4.5%，推測下降 1–19%）、繁殖 EOO **1,710,000 km²**、非繁殖 EOO **6,070,000 km²**、完全遷徙、繁殖 endemic **No**、7 個 IBA／KBA、海拔 0–2,750 m、世代 **3.0 年**、森林依賴度 Medium、貿易普遍度低、用途為食用與寵物（皆自給、國內）、無系統性監測、已納入國際法規；國家表把**香港（中國）列為原生**，日本、北韓（繁殖）、菲律賓、俄羅斯（含亞洲部分）、南韓、台灣原生，**中國大陸卻被列為 Vagrant**——與其自身分佈文字及 HKBWS 的華南越冬記述明顯矛盾。runtime 六軸齊全（i=2、a=4.7、v=3.5 含 vEst=1、r=4.8、c=1.2、o=3.2），missingScores 為空；**v 與 o 待查**（length 與 weight 皆空、vEst=1 即原值由體長估算，翼 125.6 mm×0.22≈27.6 cm 高於 HKBWS 的 22–23 cm；o 依賴待查分項不補算），i、a、r、c 沿用（a=4.7 是批次內最高之一，有 diet、look、voice、behavior 與 callouts 支撐）。runtime 缺陷：habitat 與 conservation 沒有中文，length 與 weight 為空，breeding 只是重述 range，funFact 與 etymology 完全重複，callout「喙前部灰色」與 HKBWS「嘴大部分黃、基部小白斑」角度不同。**地圖刻意偏離 BirdLife 國家表**：把 CHN 一併填色（香港併入中國），因為該表的「中國大陸 Vagrant」與其分佈文字及 HKBWS 衝突，留在 note 說明，避免出現「香港有、華南沒有」的荒謬畫面；另填 JPN、PRK、PHL、RUS、KOR、TWN。標籤「褐灰頭喉／嘴基白斑／褐背灰翼／灰白下體」皆對應插圖像素；主圖原為 1296×816 橫幅，直接取中央 816×816 方形（不補邊，避免平面色帶）再放大至 1127×1127，站在落葉層上；比較鳥為本輪新生成的赤胸鶇與沿用 0466 的白眉鶇，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0468；0468–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0468 已交付

- `400-500` 內 `name = '0468.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0468 戴菊](https://drive.google.com/file/d/1iu43fq_glspavJ0u9o30nX39Np8A8aG-/view)：145644 bytes、MD5 `ce4b329f5bd81b32a26a214f76cbba59`、SHA256 `a6ac7d306a2d79b25cedca51c9a5ee375f4fa98c7253526492b2423910c0a686`。HKBWS **044800**（路徑 `0380/`，**戴菊科 Regulidae**——本批第一種非鶇科）：香港第 I 類，**偶然訪鳥（Accidental）**，本港只有兩筆紀錄：2020-03-31 蒲台島（香港首筆，Diskin 2024）與 2020-04-20 大埔滘。8.5–9.5 cm，體型極小短圓，臉部淡色圍繞深色眼睛並由深色口角與短頰紋鑲邊，上體淡橄欖綠，翼有大覆羽與三級飛羽的淡色端及次級飛羽基部的黑色斑塊；雄鳥中央冠紋檸檬黃、後段豎起時可見橙，雌鳥冠紋較淡而無橙；頭與後頸明顯的灰色顯示為 **R. r. japonensis**；叫聲為輕快絮語夾雜極短而安靜的 chik；見於常綠闊葉次生林及遷徙熱點的樹木灌叢，覓食方式如黃腰柳鶯；分佈由西歐經古北界至西伯利亞南部，裏海與黑海之間、東北亞、中國中部與喜馬拉雅有大型間斷族群；中國東北、中部、西南及北疆繁殖，北方族群過境華東與新疆西部；共 14 個亞種。**評級衝突已核**：HKBWS 頁面寫「IUCN: Near-threatened」，但 BirdLife／全球紅色名錄為 **LC（2018）**，Near Threatened 其實是**歐盟**紅色名錄的評級，故卡面用 LC 不用 NT。BirdLife：成熟個體 **98,000,000–164,999,999**（2012 年估計、品質差）、趨勢 **Decreasing**（Suspected，歐洲 1980–2013 中度下降）、繁殖 EOO **51,100,000 km²**、非繁殖 EOO **50,900,000 km²**、完全遷徙、繁殖 endemic **No**、IBA／KBA 為「-」、生境為以挪威雲杉與冷杉為主的北方林；國家表約 67 個原生國家／地區，**香港沒有獨立一列**。runtime 三項資料庫皆**完全沒有 0468**（同 0456、0457、0461）：`dexScores.json` 無評分（六軸全部待查）、`cardCopy.json` 無文案、`measurements.json` 無量度（AVONET 未收錄），故卡面內容全部由 HKBWS 與 BirdLife 撰寫，亦無法以翼長換算體長。地圖按 BirdLife 原生國家填色，實際可填 60 個（安道爾、列支敦士登、馬耳他、法羅群島在 110m 底圖無幾何故不填；香港併入中國）；因繁殖 EOO 高達 51,100,000 km²，溫帶歐亞幾乎整片填綠，note 已說明綠色不代表全境佔用，撒哈拉、阿拉伯與東南亞的空白的確是分佈空隙。標籤「金黃冠紋／深色細嘴／翼上黑斑／淡色腹部」皆對應插圖像素（第 1 格前兩版只框到冠紋的邊緣與大片背景，改為連眼睛一起框後才清楚）；主圖原為 1296×816 橫幅，直接取中央 816×816 方形（不補邊，避免平面色帶）再放大至 1127×1127，停在長滿苔蘚的樹枝上；比較鳥為本輪新生成的黃腰柳鶯與黃眉柳鶯（兩者屬柳鶯科，與本種不同科，spec 已寫明），非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（空）／missingScores（六軸）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0469；0469–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0469 已交付

- `400-500` 內 `name = '0469.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0469 赤頸鶇](https://drive.google.com/file/d/1Tf98DsThC6kDRFCaJ9u8jX6Ad9en4kn-/view)：156599 bytes、MD5 `e33f9a65b36dc1a82f91bab5222597cd`、SHA256 `6bcf4f1d1822c6a127bd097728fada0eabaf1f2ab6b00d6c5dd0c8a33e99439e`。HKBWS 047100（路徑 `0390/`，鶇科）：香港第 I 類，**偶然訪鳥**——**全港只有一筆**：2009-11-19 蒲台島一隻第一齡雌鳥（Lee 2012，香港首筆）。24–27 cm，成鳥雄鳥上體暗灰，喉、胸、臉前部、頸側與眉紋赤紅褐，其餘下體近白、脇略灰，尾基橙褐而末端轉灰；成鳥雌鳥赤紅較暗較淡、喉有深色縱紋、胸有灰色羽毛、脇灰白而疏落暗紋；第一齡雄鳥似成鳥雌鳥但大覆羽有換羽對比；第一齡雌鳥胸部幾乎無紅、有淡皮黃眉紋、頦與喉側有黑色縱紋、胸灰而帶黑至暖褐斑（下體同齡可由大覆羽與三級飛羽淡色端判齡）。叫聲為雙音 hyiv-hyiv，chuk 聲與同屬相似但音高略高。單型種，繁殖西伯利亞南部與蒙古北部、西至中國西北、東至肯特山脈，冬季印度次大陸北部向東經西藏南部至中國長江以北的大片地區（南至黑龍江南部、東至沿海）。BirdLife 用 **Rufous-throated Thrush** 這個英文名（香港與 eBird 用 Red-throated Thrush，同一學名）：IUCN **2018** LC（2012 及以前評為 Not Recognised，2016 年與黑頸鶇分家後才被承認）、成熟個體 Unknown、趨勢 Unknown、繁殖 EOO **2,510,000 km²**、非繁殖 EOO **1,650,000 km²**、完全遷徙、繁殖 endemic **No**、IBA／KBA 為「-」、海拔 0–3,900 m、世代 **6.1 年**、森林依賴度 Medium、用途為食用與國際寵物貿易；國家表：阿富汗、不丹、中國、蒙古（繁殖）、緬甸、尼泊爾、俄羅斯（含亞洲與中亞部分）原生，日本、台灣、泰國與歐洲多國為迷鳥，**香港沒有獨立一列**。runtime 只有兩軸有分數——**r=1 沿用**（與「全港僅一筆」相符），v=3.6 **待查**（length 與 weight 皆空、vEst=1 即原值由體長估算，翼 134.2 mm×0.22≈29.5 cm 高於 HKBWS 的 24–27 cm）；i、a、c、o 本來就沒有分數，故 manifest 的 missingScores 記為 i/a/c/o，v 記在 withheldScores。runtime 缺陷：cardCopy 只有 range 與殘缺的 breeding 國家名單（「四川」後缺括號、句中斷裂），look、diet、habitat、voice 等全缺，length 與 weight 為空，callouts 缺失。地圖填 AFG、BTN、CHN、MNG、MMR、NPL、RUS 七國（香港併入中國；日本、台灣、泰國與歐洲迷鳥不填；俄羅斯只按國家填色）。標籤「赤紅喉胸／黃色嘴基／灰褐上體／橙褐尾基」皆對應插圖像素；主圖原為 1296×816 橫幅，直接取中央 816×816 方形（不補邊，避免平面色帶）再放大至 1127×1127，站在冬季林緣枯草落葉上；比較鳥為本輪新生成的黑頸鶇（舊稱同種、現已分家，最易混淆）與斑鶇，非等比例、非專家認證。
- 驗 spec／manifest／withheldScores（v）／missingScores（i、a、c、o）／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0470；0470–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。

## 新批次 0451–0500：0470 已交付

- `400-500` 內 `name = '0470.avif'` 精確查重 0 筆後單獨上載；獨立 `get_file` 核驗檔名、parent、MIME、大小、MD5 與 SHA256，與本地 `SHA256SUMS` 一致。
- [0470 斑鶇](https://drive.google.com/file/d/1mRidm168OZqtgnq2uquBtC-kvjK22KKP/view)：143635 bytes、MD5 `5cb9a9627fec30a089621ed39c294e7b`、SHA256 `5a40eb85c5a7805d7a4593be28dd8c15b38c0360a20a97d7eb3ac0b97856d493`。HKBWS 047200（路徑 `0390/`，鶇科）：香港第 I 類，**稀少冬候鳥**，遇寒冷天氣湧入時可不常見，見於開闊鄉郊或疏落林地；21–24 cm，成鳥雄鳥上體與下體均為中等深度的灰、翼有大覆羽與三級飛羽及飛羽邊緣形成的赤褐翼斑、眉紋喉部與半頸環近白、胸有黑色橫帶；**成鳥雄鳥在本港似乎罕見**（多見雌鳥與第一齡鳥），成鳥雌鳥大覆羽圖案均勻而翼上赤褐有限，第一齡雄鳥內側大覆羽赤褐而與較暗啞的幼羽外側大覆羽成對比，第一齡雌鳥上體暗啞、下體黑褐較少；與紅尾鶇常有中間型（後者上體深銅褐、翼覆羽金褐、下體或帶赤褐）。叫聲為相當響亮、常為雙或三音的叫聲，除紅尾鶇外與本港其他鶇明顯不同。生境為開闊鄉郊：乾濕農地（塱原最受偏好）、高爾夫球場、農業與低密度住宅混合區（林村）、魚塘、受管理濕地、淡水沼澤與大型整治河道，新界西北紀錄最多；極端日期 2001-10-28 與 1989-05-05，64% 紀錄在年初至 3 月第一週，不規則暴發式出現反映許多鳥因北方寒冷天氣南下；大多紀錄只在 1983/84 與 1994/95 兩個冬季，1984-02-18 廈村一處舊沼澤至少 100 隻（全港最高單一計數）；距離上次暴發已久，而本種在 1970 年代至 1980 年代初（觀鳥活動遠少於現在時）反而更常見，相信與氣候變暖、冬季變暖影響這種北方鳥種有關；1956-02-04 首錄（Walker 1958），1960 年代只在兩個冬季有紀錄，1971/72 冬季以來幾乎每年可見；活躍愛鳴叫，在地面與結果樹木或灌木上覓食（食物細節不詳），常停在空曠枯樹上。單型種，繁殖西伯利亞北部與東北部東至鄂霍次克海（含堪察加半島），冬季日本大部分地區、朝鮮半島、華南與中南半島北部；中國為長江以南冬候鳥。BirdLife **2024** LC、成熟個體 Unknown、趨勢 **Unknown**、繁殖 EOO **8,730,000 km²**、非繁殖 EOO **6,640,000 km²**、完全遷徙、**繁殖 endemic Yes**、IBA／KBA 為「-」、海拔 980–3,000 m、世代 **3.4 年**、森林依賴度 **Low**、貿易普遍度低、用途為食用與國際寵物貿易；國家表把**香港（中國）列為原生、非繁殖**，另有 13 個原生國家／地區（孟加拉、不丹、中國、印度、日本、緬甸、尼泊爾、巴基斯坦、俄羅斯〔含亞洲與中亞部分〕、南韓、台灣、泰國、越南），歐洲、中東、加拿大、美國、菲律賓等為迷鳥。runtime 六軸齊全（i=2、a=5、v=3.5 含 vEst=1、r=4.8、c=1.2、o=3.3），missingScores 為空；**v 與 o 待查**（length 與 weight 皆空、vEst=1 即原值由體長估算，翼 127.1 mm×0.22≈28.0 cm 高於 HKBWS 的 21–24 cm；o 依賴待查分項不補算），i、a、r、c 沿用——**a=5 是批次內最高**（文案確有 diet、look、voice、behavior、breeding、humanRelation、etymology 與 callouts，惟 look 只寫紅尾鶇、range 只是循環句，已在 notes 記錄）。runtime 缺陷：range 為「斑鶇又名斑鶇，是鶇科鶇屬鳥類」的循環句，look 描述的是紅尾鶇而非本種，voice 只說「有研究建議與紅尾鶇歌聲不同」，habitat 與 conservation 完全沒有，length 與 weight 為空。地圖填 13 個原生國家（香港併入中國；歐洲、中東與北美迷鳥不填；俄羅斯只按國家填色）。標籤「赤褐翼斑／白色眉喉／白色腹部／黃色嘴基」皆對應插圖像素（第 3 格原擬「黑色胸帶」，兩次框位都因該處羽色模糊而不清楚，最後改為清楚可辨的白色腹部）；主圖原為 1296×816 橫幅，直接取中央 816×816 方形（不補邊，避免平面色帶）再放大至 1127×1127，站在新界濕農田短草地上；比較鳥為本輪新生成的紅尾鶇（最易混淆、兩者常有中間型）與赤頸鶇，非等比例、非專家認證。
- **本輪工作區再次被重置**（HEAD 回到 base commit `0254314`、`cards/art/` 被清空）：已 `git fetch` 後 `git reset --hard origin/arena/b2d882cf-aviandex` 回到 `8e4c374`，spec 與 docs 無損，0470 的插圖全部重新生成（0469 的比較鳥圖因此不再存在，改為本輪新生成）。
- 驗 spec／manifest／withheldScores（v、o）／missingScores 為空／bounds／ISO3／AVIF 1024×1536／bytes／hash；`git diff --check` 通過。未改 runtime、UI、R2 或 slim 註冊。
- **下一張 0471（橙頭地鶇，注意 0459 已交付同名卡，需先查是否重複編號）；0471–0583 尚未製作。** 本輪未重跑完整 `npm test`（此前曾逾時），亦未改動 `src/`。
