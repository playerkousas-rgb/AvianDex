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
自動偵測 (Zero-Config)：完全不需編輯 JSON 或資料庫。只要將圖片丟進資料夾，應用程式會自動識別並解鎖圖鑑位。

預設 151 個槽位：未放入圖片的槽位會顯示 "UNDISCOVERED" 剪影，激發使用者的收集慾。

📱 友善的操作體驗
多種導航：支援大按鈕點擊、鍵盤左右方向鍵控制、下拉式選單快速跳轉。

搜尋功能：支援按編號快速定位特定鳥類。

全螢幕閱讀：點擊卡片即可放大，清晰閱讀卡片上的所有細節與數據。

🛠️ 如何新增鳥類卡片
更新 AvianDex 極其簡單，完全不需要寫程式：

準備卡片：將你的鳥類卡片（包含插圖與數據）存為 PNG 或 JPG。

格式命名：根據插槽編號使用 4 位數命名（例如：1 號鳥類命名為 0001.png）。

放置路徑：將圖檔放入 public/images/ 目錄。

即刻生效：刷新頁面，該編號就會從「未發現」自動解鎖為你的彩色卡片！

🎨 介面自定義規範
Hub 圖片：存放於 public/images/，命名為 hub_wiki.jpg, hub_radar.jpg 等。

自定義鼠標：支援 32x32 像素的遊戲化鼠標指標，強化沉浸感。

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
📜 鳴謝與數據來源
本計畫之科學數據連結由以下機構提供：

Cornell Lab of Ornithology (eBird, All About Birds, Merlin)

Xeno-canto Foundation

Flickr API
