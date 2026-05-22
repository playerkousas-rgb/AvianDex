# 🤖 AvianDex AI 辨識功能 — 設定指南

本次更新為 AvianDex 加入兩大 AI 功能：

| 功能 | 引擎 | 免費額度 | 入口 |
|------|------|---------|------|
| 🎙️ **聽聲認雀** | [BirdNET](https://github.com/birdnet-team/BirdNET-Analyzer)（Hugging Face Space） | 無限（公開 Space） | 左屏麥克風按鈕 |
| 📷 **看圖認雀** | [Nyckel Bird Identifier](https://www.nyckel.com/pretrained-classifiers/bird-identifier/) | 1,000 次 / 月 | 左屏相機按鈕 |

---

## 🚀 部署步驟

### 1️⃣ 申請 Nyckel API Key

1. 到 <https://www.nyckel.com/> 註冊免費帳號
2. 進入 **Console → Settings → API Keys → Create new API Key**
3. 複製產生的 **Client ID** 與 **Client Secret**

### 2️⃣ 在 Vercel 設定環境變數

到你的 AvianDex 專案 → **Settings → Environment Variables**，新增：

| Key | Value | 必要 |
|-----|-------|------|
| `NYCKEL_CLIENT_ID` | 你剛剛複製的 Client ID | ✅ 必填（看圖認雀） |
| `NYCKEL_CLIENT_SECRET` | 你剛剛複製的 Client Secret | ✅ 必填（看圖認雀） |
| `BIRDNET_SPACE_URL` | （可選）`https://你的-username-birdnet.hf.space` | 可選 |

> 💡 **BIRDNET_SPACE_URL 是什麼？**
> 預設使用 BirdNET 團隊公開的 Hugging Face Space。如果遇到流量限制或冷啟動太慢，可以：
> 1. 到 <https://huggingface.co/spaces> 點 **Duplicate** 複製一份 BirdNET Space
> 2. 把網址（例如 `https://你的帳號-birdnet-demo.hf.space`）填到此環境變數
> 3. Hugging Face Space 也是**永久免費**

### 3️⃣ 重新部署

```bash
git add .
git commit -m "feat: AI 聲音與圖像辨識 (BirdNET + Nyckel)"
git push
```

Vercel 會自動觸發新部署。完成後測試：
- 打開圖鑑機 → 點左屏右上角 **🎙️ Mic** 或 **📷 Camera** 按鈕
- 或在行動裝置上點左屏頂部的兩顆 HUD 按鈕

---

## 🧪 使用流程

```
使用者點「麥克風/相機」
   ↓
彈出 MediaCapturePanel
   ├─ 🎙️ 即時錄音（最長 15 秒）
   ├─ 📷 即時拍照（瀏覽器 getUserMedia）
   └─ 📁 上傳本機檔案
   ↓
檔案送到 /api/analyze（Vercel Serverless）
   ├─ 自動偵測：音訊 → BirdNET
   └─ 自動偵測：圖片 → Nyckel
   ↓
回傳 Top-5 候選
   ↓
RecognitionResultModal 顯示
   ├─ 信心 ≥ 70% 且在圖鑑內 → 1.2 秒後自動跳轉
   └─ 否則：列出 Top-5，使用者點擊「在圖鑑」候選跳轉
```

---

## 📚 圖鑑名稱對照表

你目前的 `birds.json` 都是中文鳥名，但 BirdNET / Nyckel 回傳的是英文。

對照表在 **`src/data/nameAliases.ts`**。

### 新增鳥種時請同時補上對照

範例（你新增第 22 號鳥「白鶺鴒」）：

```ts
// src/data/nameAliases.ts
export const NAME_TO_ID: Record<string, string> = {
  // ... 既有條目 ...

  // 0022 白鶺鴒
  'white wagtail': '0022',
  'motacilla alba': '0022',
  '白鹡鸰': '0022',
  '白鶺鴒': '0022',
};
```

> 💡 一筆 ID 可以對應多個 key（英文俗名、學名、繁簡中文都建議放）。

---

## 🛠️ 進階：自架 BirdNET（如果預設 Space 不穩定）

最簡單的方式是直接 fork 並 duplicate：

1. 開 <https://huggingface.co/spaces>
2. 搜尋 `birdnet`，挑一個 Gradio Space
3. 右上角 ⋮ → **Duplicate this Space**（免費帳號可以建私人 Space）
4. 部署完成後，URL 是 `https://<你的帳號>-<space-name>.hf.space`
5. 把這個 URL 填到 Vercel 的 `BIRDNET_SPACE_URL` 環境變數

### 或：完全自架（最高彈性）

如果你願意付一點伺服器費用（或用 Render 免費 plan），可以直接跑 BirdNET-Analyzer：

```bash
git clone https://github.com/birdnet-team/BirdNET-Analyzer
cd BirdNET-Analyzer
pip install -r requirements.txt
# 用 FastAPI 包成 REST API（範例請見該 repo 的 server.py）
```

---

## ❓ 疑難排解

| 問題 | 原因 | 解決 |
|------|------|------|
| 「Nyckel API 金鑰未設定」 | 環境變數沒填 | 到 Vercel Settings 設定後**重新部署** |
| 「BirdNET 服務暫時無法連線」 | HF Space 冷啟動中 | 等 30 秒重試；長期請自架 Space |
| 辨識到了鳥但跳不到圖鑑卡 | 名稱對照表沒收錄 | 在 `nameAliases.ts` 補對應 |
| 行動端錄音/相機沒反應 | 瀏覽器權限 | 必須是 **HTTPS**（Vercel 預設就是），首次會問權限 |
| Google Sites 嵌入後拿不到麥克風 | iframe 權限 | 在 Google Sites 嵌入時，加上 `allow="microphone; camera"` |

### Google Sites 嵌入修補

Google Sites 預設 iframe 不允許麥克風/相機。你需要：
1. Embed → **Insert by URL** 改成 **Embed code**
2. 把產生的 `<iframe>` 改成：

```html
<iframe
  src="https://你的-aviandex.vercel.app"
  width="100%"
  height="900"
  frameborder="0"
  allow="microphone; camera; clipboard-write"
></iframe>
```

> ⚠️ Google Sites 的「Embed」功能對 `allow` 屬性有限制，如果不生效，建議使用者直接點「全螢幕」按鈕跳到 Vercel 原網址操作。

---

## 📦 本次變更檔案清單

| 檔案 | 變更 |
|------|------|
| `api/analyze.js` | 重構為**統一辨識代理**（音訊 → BirdNET，圖片 → Nyckel） |
| `src/App.tsx` | 加入 `analyzeMedia` 統一函式 + Recognition 浮窗狀態 |
| `src/components/PokedexDevice.tsx` | 左屏加 📷 視覺辨識按鈕；行動端 HUD 接上實際邏輯 |
| `src/components/MediaCapturePanel.tsx` | **新增**：錄音/拍照/上傳三合一 popover |
| `src/components/RecognitionResultModal.tsx` | **新增**：Pokédex 風格的 Top-5 結果浮窗 |
| `src/data/nameAliases.ts` | **新增**：英文/學名/中文 → 圖鑑 ID 對照表 |

Enjoy! 🐦
