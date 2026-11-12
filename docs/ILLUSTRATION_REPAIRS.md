# 插圖補充／替換工作單

## 範圍及核實界線

- 本次只做正面無字插圖（R2 `birdcards/NNNN.avif`），不做資訊卡（`aviandex/`）。
- 優先清單依 `scripts/cards/hk-master.json` 的 `assigned`：29 個改配物種的舊編號、14 個新增編號，共 43 個。
- **這不是即時 R2 缺檔審計**：尚未連線核實 bucket 裡每個物件；如果用戶已另行更新個別檔案，先比較再決定是否覆蓋。
- 其他既有 540 個編號的缺圖／羽色錯誤，需另用現有 R2 清單及預覽核對，不能據網絡失敗推斷缺圖。

## 最新進度：43／43 已交付，用戶回報已全部上載 R2

- 完整包：[AvianDex-HK-43-illustrations-AVIF.zip](https://drive.google.com/file/d/1mGezm_EHU34C_vp6mAmOz3xo9G36Fqwt/view?usp=drivesdk)。位於用戶 Google Drive，未修改公開分享權限。
- 大小：6,342,627 bytes；Drive 回傳的大小及 MD5 與本機一致。
- ZIP SHA-256：`5e1d3681480a51e43850eea86a0e62994548f1174df89670c7844f4703b9f810`。
- 成品：`deliver/cards/hk-repair-complete-43/`，43 個獨立四位編號、1024×1024 AVIF。包含 29 個舊編號替換及 14 個新增編號，與 HK-master assigned 集合完全一致。
- 已完成所有 43 張的基本目視檢查，以及格式／解碼／尺寸／SHA-256／物種名稱映射／ZIP 完整性檢查。不是獨立鳥類專家驗證。
- ZIP 內含 43 張 `birdcards/NNNN.avif`、`upload-list.csv`、`manifest.json`、`SHA256SUMS`、`README-上載說明.txt`，共 47 個檔案。交收 manifest 不可覆蓋 app `/data/card-manifest.json`。
- 已按用戶要求完成一次過交付；用戶最新回報「插圖我已全部上載完成」，因此記錄為 **用戶已完成 R2 上載**。代理未執行上載，亦未獨立即時核實 R2／正式網站；不等同已驗證所有裝置快取更新。沒有更改 app UI、資訊卡名單或資訊卡暫停狀態。
- 這是 43 張優先插圖工作的完成，不代表已即時全面核實其他 540 個編號的 R2 圖片。
- 五批工作圖在 `cards/art/hk-repair-0*/`，各批成品在 `deliver/cards/hk-repair-0*/`。依既有規則忽略，不入 Git；完整記錄在 `scripts/cards/illustration-repair-plan.json`。
- 重建完整包（保留原 AVIF 位元，不重新編碼）：`python3 scripts/cards/merge-illustration-repairs.py`。檢查完整 43-ID 集合、名稱、尺寸及各批雜湊，不接受重複／缺少／錯配檔。

## 第一批：hk-repair-01

- 0014、0053、0054、0059、0084、0117，共 **6 張**；首批曾已交付，目前按用戶要求等齊 43 張才統一上載。
- 原始生成圖：`cards/art/hk-repair-01/`（忽略，不入 Git）。
- 成品／ZIP／清單：`deliver/cards/hk-repair-01/`（忽略，不入 Git）。
- ZIP：`birdcards-hk-repair-01.zip`；內含 `birdcards/NNNN.avif`、`upload-list.csv`、`manifest.json`、`SHA256SUMS`、上載說明。
- 格式：1024 × 1024，RGB AVIF，quality 60，4:4:4；已解碼核對尺寸與格式，並驗證 ZIP 內容雜湊。
- 插圖統一方向：全身鳥、滿版自然生境、無字無框；細線自然圖鑑插畫，柔和水彩／不透明水彩材質。不是實拍照片，也不是像素圖。
- 目視重點：白腰文鳥的白腰、紅胸田雞的紅褐胸及黑白腹側橫斑、黑海番鴨雄鳥的橙黃喙基、紫水雞的灰頭及長紅趾、斑翅鳳頭鵑的黑冠／白翼斑、灰頭麥雞的黑胸帶／黃腳。
- **只做基本目視檢查，未經獨立鳥類專家驗證**；上載前可先預覽。尚未代用戶上載 R2，未更改 app 的資訊卡名單。
- 交收 manifest 不是 app `/data/card-manifest.json` 的格式，不要直接替換該清單。

### 重建交付包

```bash
python3 -m pip install pillow
python3 scripts/cards/pack-illustrations.py \
  --input cards/art/hk-repair-01 \
  --output deliver/cards/hk-repair-01 \
  --batch hk-repair-01
```

## 優先清單

| NO. | 香港中文名 | 英文名 | 學名 | 建議動作 | 進度 |
|---|---|---|---|---|---|
| 0014 | 白腰文鳥 | White-rumped Munia | Lonchura striata | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0053 | 紅胸田雞 | Ruddy-breasted Crake | Zapornia fusca | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0054 | 黑海番鴨 | Black Scoter | Melanitta americana | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0059 | 紫水雞 | Gray-headed Swamphen | Porphyrio poliocephalus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0084 | 斑翅鳳頭鵑 | Pied Cuckoo | Clamator jacobinus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0117 | 灰頭麥雞 | Gray-headed Lapwing | Vanellus cinereus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0124 | 青藏沙鴴 | Tibetan Sand-Plover | Anarhynchus atrifrons | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0173 | 拉氏沙錐 | Latham's Snipe | Gallinago hardwickii | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0197 | 蒙古銀鷗 | Mongolian Gull | Larus mongolicus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0198 | 玄燕鷗 | Black Noddy | Anous minutus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0275 | 灰臉鵟鷹 | Gray-faced Buzzard | Butastur indicus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0278 | 白頭鷂 | Western Marsh Harrier | Circus aeruginosus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0287 | 北鷹鴞 | Northern Boobook | Ninox japonica | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0312 | 冠魚狗 | Crested Kingfisher | Megaceryle lugubris | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0325 | 灰燕鵙 | Ashy Woodswallow | Artamus fuscus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0372 | 亞洲短趾百靈 | Asian Short-toed Lark | Alaudala cheleensis | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0382 | 褐柳鶯 | Dusky Warbler | Phylloscopus fuscatus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0386 | 洋燕 | Pacific Swallow | Hirundo javanica | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0404 | 棕腹柳鶯 | Buff-throated Warbler | Phylloscopus subaffinis | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0420 | 雙斑綠柳鶯 | Two-barred Warbler | Phylloscopus plumbeitarsus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0431 | 白眶鶲鶯 | White-spectacled Warbler | Phylloscopus intermedius | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0445 | 黑喉噪鶥 | Black-throated Laughingthrush | Pterorhinus chinensis | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0456 | 懷氏地鶇 | White's Thrush | Zoothera aurea | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0457 | 灰背椋鳥 | White-shouldered Starling | Sturnia sinensis | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0461 | 粉紅椋鳥 | Rosy Starling | Pastor roseus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0468 | 戴菊 | Goldcrest | Regulus regulus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0493 | 黃腹花蜜鳥 | Ornate Sunbird | Cinnyris ornatus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0515 | 東亞石䳭 | Amur Stonechat | Saxicola stejnegeri | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0542 | 黃腹鷚 | Siberian Pipit | Anthus japonicus | 替換（編號改配物種） | 用戶回報已上載 R2（未獨立核實） |
| 0570 | 白額燕鷗 | Little Tern | Sternula albifrons | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0571 | 黑叉尾海燕 | Swinhoe's Storm-Petrel | Hydrobates monorhis | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0572 | 信使圓尾鸌 | Herald Petrel | Pterodroma heraldica | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0573 | 彩䴉 | Glossy Ibis | Plegadis falcinellus | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0574 | 綠鷺 | Striated Heron | Butorides striata | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0575 | 短趾雕 | Short-toed Snake-Eagle | Circaetus gallicus | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0576 | 鷹鵰 | Mountain Hawk-Eagle | Nisaetus nipalensis | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0577 | 靴隼雕 | Booted Eagle | Hieraaetus pennatus | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0578 | 草原鵰 | Steppe Eagle | Aquila nipalensis | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0579 | 褐耳鷹 | Shikra | Tachyspiza badia | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0580 | 大鵑鵙 | Oriental Cuckooshrike | Coracina javensis | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0581 | 灰樹鵲 | Gray Treepie | Dendrocitta formosae | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0582 | 黃頰山雀 | Yellow-cheeked Tit | Machlolophus spilonotus | 新增編號 | 用戶回報已上載 R2（未獨立核實） |
| 0583 | 山麻雀 | Russet Sparrow | Passer cinnamomeus | 新增編號 | 用戶回報已上載 R2（未獨立核實） |

## R2 上載與快取

在 bucket 根目錄上載包內 `birdcards/` 資料夾；若已進入 R2 的 `birdcards/`，則只選取其中 `.avif` 檔。不要新增 `aviandex-` 前綴或多一層 `birdcards/birdcards/`。Content-Type 為 `image/avif`。

上載前備份要保留的同名舊檔。替換相同 URL 可能仍受瀏覽器、網站或 CDN／代理長效快取影響；單純重新上載不保證所有已快取裝置即時見到新圖。必要時清除相應快取；若日後要保證版本切換，再獨立處理素材版本網址。
