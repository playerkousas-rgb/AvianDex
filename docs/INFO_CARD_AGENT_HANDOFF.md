# 資訊卡下一位 Agent 工作指引

> 2026-11-11；目前製作流程權威。舊 `CARD-PIPELINE.md` 的整卡 AI、每批 ZIP、舊尺寸與不生成鳥圖指示不適用這次 restart 工作。
> **由用戶另告知已完成數量／起點／本次目標；先核對，不自行假設全批完成或重做。** 詳細逐批交付證據見 `docs/INFO_CARD_RESTART.md`，後面的更正取代前面的歷史狀態。

## 範圍及不可改動

- 只續製資訊長卡；app UI、runtime 名稱／taxonomy／scores、Service Worker 更新提示、R2、slim 註冊保持不變。不要重新製作已完成插圖，資訊卡素材與 app 插圖不是同一交付物。
- 深色金框 slim **1024×1536**；文字、雷達、數字、星級及地圖由程式繪製，不能把整卡交給 AI 編造。
- 0014 起保留**完整世界底圖**，不要區域裁切。Natural Earth 國界 + 經研究的部分原生國家 ISO3；標明「綠色非全境；非完整分佈」。不是 occurrence polygons，亦不能把香港偶發紀錄作原生範圍。
- 評分權威 `src/data/dexScores.json` 的 `scores[id]`，六項 `i,a,v,r,c,o`；缺分保留待查，非零、不從 IUCN 推算。`vEst` 提示不能刪。
- 名稱 `src/data/birds.json`；學名／分類 `src/data/birdTaxonomy.json`。外部分類有拆合時記錄差異，不默改 runtime，也不套用錯誤分類的分佈／保育。

## 每隻依次完成，圖與 JSON 同步

1. 讀用戶指定進度，查 `INFO_CARD_RESTART.md` 最新紀錄及 Drive，確認下一隻；不要重覆已驗證上載。外部頁面編號不是 app ID。
2. 讀可信鳥類來源（優先 HKBWS substantive 內文、BirdLife／IUCN、Cornell），研究辨識、性別／年齡／季節、分佈、保育。全球趨勢和香港本地常見／下降分開，未知就未知。
3. 在 `cards/art/info-restart-NNNN/` 生成 `pixel.png`、`features.png`，以及需要的兩隻完整對照鳥素材。AI 只畫鳥，不畫卡上文字或地圖。背景配合現有深青色模板；全鳥及腳趾留邊。可重用已核對正確物種／羽齡的對照素材，但不能因新環境缺檔而憑空重建舊裁切。
4. **先實際讀圖**，再存 `scripts/cards/info-restart-NNNN.json`：來源、圖示性別／羽齡、真實 `featureCrops`、`featureSources`、四個 `featureLabels`、兩個對照及差異、ISO3、限制。不能先預填整批未生成的圖／裁切或假稱完成。
5. 特徵標籤必須與圓內可見內容一致。看不到診斷特徵就縮窄成身體部位描述，不硬標；折翼圖不能宣稱示範飛行翼斑。`slim_feature_label()` 已可自適應膠囊寬度100–210px，字22→18，再省略；仍優先短句，避免靠省略掩蓋重要內容。
6. 渲染：`python scripts/cards/render-info-restart.py NNNN`。產出 `deliver/cards/info-restart-NNNN/aviandex/NNNN.avif`、preview、manifest、SHA256SUMS及說明。每張全卡、四圈／標籤、比較圓框都要讀圖，修正後重渲染及再核對。
7. 檢查 spec=manifest.spec、名稱／學名及六分=runtime、缺值／vEst、世界 bounds `[-180,-90,180,90]`、ISO3存在、AVIF解碼1024×1536、bytes/SHA256、無ZIP。跑 `python scripts/cards/test-slim-feature-label.py`（4測試）及 `git diff --check`。
8. **上載前再次精確查重**；指定 Drive 資料夾 `1Et0ea08AmkatqTA7aPxxEQtxMpKxJ3up`，檔名 `NNNN.avif`、MIME `image/avif`，單張直接上載，不ZIP、不R2。先用 connector list 取得 schema，再 search/upload。遇同名先核實，不任意覆寫、刪除或重傳。
9. 驗證 Drive 回傳 parent、bytes、MD5 與本機吻合，才把本地 manifest top-level 設 `uploaded_drive_verified`，記 `driveFileId/driveParentId/driveMd5/driveBytesVerified`；embedded spec 的製作階段 `review_before_upload` 不等於未交付。
10. 把交付 ID／hash／來源／修正及下一步寫入 `INFO_CARD_RESTART.md`，向用戶如實報告。AI 圖只基本目視，非獨立專家驗證。

## 環境及資產限制

- 本機曾用 `/home/user/card-venv/bin/python`；字體 `/home/user/.fonts/NotoSansTC_{400Regular,700Bold}.ttf`（或 composer 支援的 AVX_FONT_DIR），依需要建立 venv 安裝 Pillow/numpy/scipy，不要破壞系統 Python。
- 世界 GeoJSON 來源見每個 spec 的 `rangeMap.geometrySource`，可從 GitHub 取得並存各素材目錄 `countries.geojson`。
- **Git 不含大圖／AVIF／venv**：`cards/art/`、`deliver/cards/` 都被忽略。新 checkout 不保證有舊素材；Drive 有成品不代表有原始 features。不要偽稱所有素材已入 Git 或可完全重現。缺素材先報告／核實來源。
- 舊 `/home/user/make*.py` 是本機臨時腳本，部分早於手動修正；不要盲目重跑覆蓋 spec。以已提交 JSON 為準。
- 每輪生圖額度以工具實際回應為準；額度不足就保存真實未完成狀態和缺檔，不繞過限額、不重生成功素材、不宣稱已交付。

## 歷史注意

- 用戶否決的舊0078–0081由本分支新版本取代；0082–0084保留有效。PR25 的0051–0077資料／歷史要保留，0078–0081舊交付只作被取代歷史。
- 0038–0040本地JSON是候選，**未建立與既有Drive成品的來源對應**，不可冒稱已驗證的交付spec。0041–0043來源JSON缺口仍待真實來源／畫面核對，不能編造裁切來湊全。
- 不在未獲用戶確認R2上載的情況下註冊slim。用戶掌握最終完成量與下一批工作量。
