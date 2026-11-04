AvianDex: 個人專屬科研鳥類圖鑑
AvianDex 是一款專為兒童與觀鳥愛好者設計的互動式網頁應用。它模仿經典「寶可夢圖鑑（Pokédex）」的雙螢幕手持設備介面，讓探索鳥類知識變得像玩遊戲一樣有趣。

"不需資料庫，只需放照片。" —— 這是 AvianDex 的核心設計哲學。

✨ 核心特色
🕹️ 沉浸式遊戲機介面
雙螢幕設計：紅色的復古手持設備外觀，搭配精緻的動畫與 3D 陰影效果。

六宮格科研終端 (Scientific Hub)：全新的 3x2 選單，整合了全球權威鳥類數據：

深度百科 (Cornell Lab - All About Birds)

觀察雷達 (eBird 實時香港分佈圖)

視覺圖庫 (Flickr 高清生態照)

影片中心 (YouTube 行為影像)

鳴聲資料 (Xeno-canto 全球鳥鳴資料庫)

AI 辨識裝備 (Merlin AI 下載)

📁 極簡維護系統
鳥卡圖走 **Cloudflare R2**（`aviandex/NNNN.avif`）：上傳到 R2 該編號的 avif 檔案，圖鑑即自動解鎖對應編號。
（詳細上傳步驟見「AvianDex 及Birddex2 維護需知.txt」；新增鳥種名稱/對映見下方「圖鑑維護腳本」。）

未放入圖片的槽位會顯示 "UNDISCOVERED" 剪影，激發使用者的收集慾。

> 🩺 **「點解啲圖 load 唔出？」** → 先跑 `npm run cards:probe`。
> 它會逐個編號探測 R2，寫出 `reports/card-audit.md`（邊幾張有圖、邊幾張要上傳）。
> 若報告說「有圖」但畫面仍然空白，就是瀏覽器/網絡問題：頁面會自動彈出診斷條，
> 按「重新探測（清快取）」即可；學校網絡封鎖 `*.r2.dev` 時會自動改用 `/api/card` 代理。
> 完整診斷與改進紀錄見 **[docs/APP_REVIEW.md](./docs/APP_REVIEW.md)**。

📱 友善的操作體驗
多種導航：支援大按鈕點擊、鍵盤左右方向鍵控制、下拉式選單快速跳轉。

搜尋功能：支援按編號快速定位特定鳥類。

全螢幕閱讀：點擊卡片即可放大，清晰閱讀卡片上的所有細節與數據。

🛠️ 如何新增鳥類卡片
更新 AvianDex 極其簡單，完全不需要寫程式：

> 圖卡副檔名支援 `.avif` / `.webp` / `.jpg` / `.png`，前端會自動逐個試，
> 但**建議統一用 `.avif`**（體積最細）。

準備卡片：生成鳥類卡片（插圖與數據）後，用 https://squoosh.app/ 轉成 **AVIF**（體積小很多）。

格式命名：根據插槽編號使用 4 位數命名（例如：1 號鳥類命名為 0001.avif）。

放置路徑：上傳到 **Cloudflare R2** → `aviandex/` 資料夾（不是 repo！大圖不進 git / Vercel）。

名稱對映：在 `src/data/birds.json` 加 `{ "id": "0001", "name": "中文名" }`（或放進 `BIRD_ID_MAPPING.csv` 後跑 `npm run aliases` 重新生成 `nameAliases.ts`）。

即刻生效：刷新頁面，該編號就會從「未發現」自動解鎖為你的彩色卡片！
（一次上傳很多張時，可按頁首的「重新掃描」讓前端重新探測。）

🎨 介面自定義規範
Hub 圖片：存放於 public/images/，命名為 hub_wiki.jpg, hub_radar.jpg 等。

自定義鼠標：支援 32x32 像素的遊戲化鼠標指標，強化沉浸感。

📱 圖標與可安裝（v1.6.0 新增）
`public/icons/` 有 9 個 PNG／ICO（16／32／48／180／192／512／maskable 192／maskable 512／og-image 1200×630），
配 `public/manifest.webmanifest`，Android／iOS 可「加到主畫面」全螢幕使用；貼連結到 WhatsApp／Signal 會有預覽圖。
規範依 `readme` 的 G11（見該 repo `docs/33-icon-standard.md`），**換圖標時記得改檔名，不要原地覆蓋**（有長快取）。

🎨 兩種卡（AVIF · 文字 100% 準確）

**AI 只畫鳥，文字由排版引擎寫** —— 所以卡上唔會有錯字、亂碼或假數據。

| | 鳥卡（簡單） | 資訊圖卡（詳細） |
|---|---|---|
| 內容 | 插畫 + NO. + 中文名 + 英文名 + 學名 | 分類、特徵標註、食性、分佈、外形、棲地、IUCN、來源 |
| 指令 | `npm run cards:render -- 0289 --kind bird` | `npm run cards:render -- 0289` |
| 輸出 | `cards/out/0289.avif`（35 KB） | `cards/out/info/0289.avif`（70–74 KB） |
| R2 | `aviandex/0289.avif` | `aviandex/info/0289.avif` |

```bash
npm run cards:render -- --all       # cards/art/ 內全部（出資訊圖卡）
npm run test:copy                   # 檢查文案：長度／簡體字／有無 source

# 想 AI 一次生成整張卡（連文字）？prompt 已備好：
npm run cards:prompt -- 0289 --style onepass              # 資訊圖卡
npm run cards:prompt -- 0289 --style onepass --layout bird # 簡單鳥卡
# 出完圖再轉 AVIF：
python3 scripts/cards/render-card.py --from-image <圖.png> --kind info
```

兩種方法的實測比較（尺寸、字型、風險、建議用法）見 **[docs/CARD_METHODS.md](./docs/CARD_METHODS.md)**。

- 鳥卡 900×1200、資訊圖卡 1400×1867（都係 3:4），實測 AVIF **35 KB / 70–74 KB**，比同尺寸 PNG 細 **87–90%**
- 分類（目／科／學名／英文名／排序號）全部由 `birdTaxonomy.json`（eBird）讀入，唔會手打
- 卡面文案在 `src/data/cardCopy.json`，每欄要有 `source`，冇就印「資料待查」
- 版面：紅色機頭 + 中文名／學名／英文名 + 分類標籤 + 插畫窗（右側特徵標註＋冷知識）+ 食性／分佈／外形／棲地 + 保育狀況／資料完整度／來源
- 完整說明（含插畫提示詞範本）見 **[docs/CARD_STYLE_V2.md](./docs/CARD_STYLE_V2.md)**

已完成樣卡：0289 普通翠鳥、0290 三趾翠鳥，兩種卡都已出（`cards/out/` 與 `cards/out/info/`）。

🔠 排序與搜尋（v1.8.0）

- **預設次序跟 eBird / Clements 演化排序**（目 → 科 → 種），唔再係舊嘅 NO.0001→0569。
  右上角「排序」有三個掣：`eBird`（預設）／`NO.`（原本編號次序）／`中文`（中文名次序）。
- **搜尋以英文名為主**：`dove` → Spotted Dove 排第一；`Spilopelia chinensis` 搜學名亦得；
  打中文（`珠頸`）都搵得到，但排英文命中之後。規則寫死在 `src/lib/pokedexOrder.ts`（有 8 個測試）。
- 中文名只作**顯示**；卡片右下角依次顯示 中文名 → 英文名（eBird 正式名）→ 學名（斜體）。
- ⚠️ **排序只影響畫面次序，`NO. NNNN` 編號永遠不變**——因為編號 = R2 檔名 `aviandex/NNNN.avif`，
  一改就全部對唔上。所以跟 eBird 排序之後，卡上會多一個 `#12` 表示「排第幾」，同 `NO.0456` 分開顯示。

📚 分類資料的權威（v1.7.0 起）

**英文名、學名、目、科全部以 eBird / Clements Checklist（Cornell Lab of Ornithology）為準**；
中文名只作顯示，由中文維基以「學名」反查（香港繁體），**永不反向改英文**。

| 想做的事 | 一句指令 |
|---|---|
| 更新 Clements 分類表 | `npm run ebird:taxonomy`（有 key 可加 `--api`；有本地 CSV 可加 `--file`） |
| 睇邊張卡嘅英文名／學名有問題 | `npm run ebird:audit` → `reports/ebird-audit.md` |
| 把權威分類接上 569 張卡 | `npm run birds:enrich`（先睇報告）→ `npm run birds:enrich -- --apply` |
| 中文名對照（eBird 代碼做橋） | `npm run aliases:build` → `reports/name-alias.md` |
| 補中文目／科／IUCN | `npm run facts:fetch -- --from 22 --to 41` → `npm run facts:build` |

現況：**559 / 569 張卡已對上 eBird**（其中 38 張原本把學名當英文名、8 張原本係 `Unknown Species`）。
剩下 9 張中英名互相矛盾、10 張仍然對唔上，清單在 `reports/enrich-birds.md`，等拍板後才改中文名。
完整規則、限制與出處見 **[docs/TAXONOMY_PIPELINE.md](./docs/TAXONOMY_PIPELINE.md)**。

⚖️ **部署瘦身**：儲存空間與 Vercel 部署規範（防增肥守則）請見 [SLIMMING_GUIDE.md](./SLIMMING_GUIDE.md)。

⚙️ 設定集中一處
版本號、R2 網域、副檔名、每批顯示張數、圖片併發數全部在 `src/config.ts`。
想換 CDN（例如為 R2 綁自訂網域）：設定環境變數 `VITE_R2_BASE_URL` 即生效，唔需要改 code。

💻 技術棧
React 19：最新版本的 React 核心。

Vite：極速的前端構建工具。

Tailwind CSS v4：用於構建精緻的紅白機質感 UI。

Framer Motion：處理流暢的螢幕切換與按鈕動畫。

Lucide React：提供簡潔、一致的科研風格圖示。

🚀 快速開始
Bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 構建生產版本
npm run build

# 圖卡體檢（邊幾張有圖／邊幾張要上傳）
npm run cards:probe

# 圖卡載入器測試（4 個 case）
npm run test:cards

# 把 BIRD_ID_MAPPING.csv 的英文名併入 birds.json
npm run names:merge
📚 文件
- **[docs/APP_REVIEW.md](./docs/APP_REVIEW.md)** — 對照 `readme` 五大鐵律＋G11 的健檢、改進與檢討（含「封面圖 load 唔出」的完整診斷）。
- **[CHANGELOG.md](./CHANGELOG.md)** — 版本紀錄。

📜 鳴謝與數據來源
本計畫之科學數據連結由以下機構提供：

Cornell Lab of Ornithology (eBird, All About Birds, Merlin)

Xeno-canto Foundation

Flickr API
