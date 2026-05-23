# 🤖 AvianDex v1.4.0 — 完整設定與功能指南

## 🎉 v1.4 新功能總覽

| 功能 | 入口 | 引擎 |
|------|------|------|
| 🎙️ 聽聲認雀 | 浮動按鈕 / 圖鑑機 Mic | **Hugging Face** (主) → Nyckel/BirdNET (備援) |
| 📷 看圖認雀 | 浮動按鈕 / 圖鑑機 Camera | **Hugging Face** (主) → Nyckel (備援) |
| 🏆 我的進度 | 頂欄 Trophy 按鈕 / 手機漢堡選單 | localStorage 統計 + 8 階成就 |
| 🗺️ 觀鳥地圖 | 頂欄 Map 按鈕 / 手機漢堡選單 | eBird API（你已有 `EBIRD_API_KEY`） |
| 🔍 搜尋 | 頂欄黃色搜尋框 | 即時過濾編號 / 中文 / 英文 |
| CARD / ZOOM | 副欄右側按鈕 | CARD = 完整圖卡；ZOOM = 放大裁切只看鳥主體 |
| 📱 完整響應式 | 手機 / iPad / 桌機 | 漢堡選單、抽屜、自適應網格 |

---

## 🔑 環境變數設定（重要！）

### 必填 ✅

| Key | 取得方式 | 用途 |
|-----|---------|------|
| **`HF_TOKEN`** | https://huggingface.co/settings/tokens → 點「+ New token」→ Read 權限 | **AI 主引擎**：聲音 + 圖片，免費額度大 |

### 你已有的 ✅

| Key | 用途 |
|-----|------|
| `EBIRD_API_KEY` | 觀鳥地圖即時觀察紀錄 |
| `NYCKEL_CLIENT_ID` | 圖片辨識備援（可留可拿掉） |
| `NYCKEL_CLIENT_SECRET` | 同上 |

### 選填

| Key | 用途 |
|-----|------|
| `BIRDNET_SPACE_URL` | 自架的 BirdNET Gradio Space 網址（聲音備援） |

### 在 Vercel 加 `HF_TOKEN` 的步驟

1. 進入 Vercel Dashboard → 你的專案 → **Settings → Environment Variables**
2. 新增 `HF_TOKEN`，**Production / Preview / Development 三個環境都要勾選**
3. 名稱必須完全相同（大小寫、無 `VITE_` 前綴）
4. **務必到 Deployments 重新部署一次**（環境變數變更不會自動觸發部署）

### 🩺 健康檢查端點

部署後造訪 `https://你的網址.vercel.app/api/analyze`（GET 請求）會回傳：

```json
{
  "ok": true,
  "version": "v1.4.0",
  "service": "AvianDex AI Recognition",
  "engines": {
    "huggingface": true,    ← 必須是 true
    "nyckel": true,
    "birdnetSpace": false,
    "ebird": true            ← 你已有
  }
}
```

如果 `huggingface: false`，代表 `HF_TOKEN` 沒設定或沒生效。

---

## 🐛 為何之前出現「Nyckel 金鑰未設定」？

舊版有兩個問題：
1. **環境變數設定**：Vercel 中可能只勾了 Production，沒勾 Preview，導致預覽部署拿不到
2. **沒備援**：舊程式只用 Nyckel，一掛全掛

v1.4 改為 **Hugging Face 為主、Nyckel 為備**，即使 Nyckel 失敗也能正常運作。

---

## 📚 圖鑑維護腳本

```bash
# 從 Wikipedia + 中文 Wikipedia 自動產生鳥種對照
npm run aliases

# 預覽（不寫入檔案）
npm run aliases:dry
```

**目前狀態**：
- `src/data/birds.json` — **569 筆**香港鳥種
- `src/data/nameAliases.ts` — **2003+ 個** alias
- 中文名覆蓋率：**475/569 (83.5%)**，剩 94 隻迷鳥用英文俗名

**修改鳥名**：直接編輯 `src/data/birds.json`，把英文名改成你想要的中文。重跑 `npm run aliases` 不會覆蓋你已改的中文名。

---

## 🗺️ 觀鳥地圖 — 15 個香港熱點

米埔、塱原、大埔滘、船灣、城門水塘、九龍公園、維多利亞公園、香港公園、香港動植物公園、蒲台島、大帽山、南大嶼、長洲、南丫島、西貢

點選後**即時透過你的 `EBIRD_API_KEY` 查詢該熱點近 14 天觀察紀錄**。

---

## 🏆 成就階梯

| 解鎖數 | 徽章 | 標題 |
|--------|------|------|
| 1 | 🐣 | 初次相遇 |
| 10 | 🔍 | 見習觀鳥員 |
| 50 | 🏘️ | 社區巡守員 |
| 100 | 🎖️ | 鳥類達人 |
| 250 | 🏆 | 香港百鳥圖 |
| 500 | 📚 | 生態學者 |
| 1000 | 👑 | 飛羽傳奇 |
| 1500 | ✨ | 完美圖鑑 |

達成時跳出金色浮窗。重置：「我的進度」面板 → 底部「重置成就記錄」按鈕。

---

## 📱 響應式對應

| 機種 | 適配重點 |
|------|---------|
| **手機 (< 640px)** | 漢堡選單收起工具列、卡片 2 欄、底部留空避免被浮動按鈕擋、地圖縱向排列 |
| **iPad (640~1023px)** | 卡片 3-4 欄、抽屜選單、地圖左右分割 |
| **桌機 (≥ 1024px)** | 完整工具列、LED + Wi-Fi/Battery 燈、卡片 5-6 欄、tooltip |

---

## 🚀 部署

```bash
git add .
git commit -m "feat(v1.4.0): HF Inference + 觀鳥地圖 + 進度面板 + 響應式 + 569 隻 HK 鳥種"
git push
```

部署完後**第一件事**：開 `https://你的網址/api/analyze` 確認 `huggingface: true` ✅

Enjoy! 🐦
