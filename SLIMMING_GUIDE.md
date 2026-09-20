#  AvianDex 防增肥守則（Storage Slimming Policy）

> **目標：永遠不讓 Vercel 儲存配額爆滿。**
> 本專案 Vercel 部署只允許包含「執行期真正需要的產物」：`dist/`（Vite 建置輸出）＋ `api/`（兩個 serverless 函式）。
> 任何改版在合併前，請先看完本文件並通過底部清單。

---

## 一、三道防線（已經設好，不要拆）

| 防線 | 檔案 | 作用 |
|---|---|---|
| 1️⃣ 進 Git 前 | `.gitignore` | 建置產物、備份檔、`node_modules`、大型模型一律不進 repo |
| 2️⃣ 上傳 Vercel 前 | `.vercelignore` | 檔案上傳/zip 部署時，排除所有開發垃圾（文件、腳本、備份、模型） |
| 3️⃣ 建置輸出 | `vercel.json` | `buildCommand: npm run build`、`outputDirectory: dist` —— 只部署最終產物 |

**鐵則：`dist/` 是建置產物，永遠不可 commit。**（v1.5 前曾把整包 `dist/` 約 4.7MB 提交進 repo，已清除；再犯 = 每次部署多一雙倍體積。）

## 二、依賴（dependencies）政策

`package.json` 的 `dependencies` 只放 **瀏覽器執行期 / serverless 執行期真正 import 到** 的套件：

| 保留（執行期） | 理由 |
|---|---|
| `react` / `react-dom` | UI 核心 |
| `@tensorflow/tfjs` | 本地聽聲辨雀（已用**動態 import** 懶載入，首頁 bundle 不含它） |
| `framer-motion` / `lucide-react` | UI 動畫 / 圖示 |

**以下嚴禁加回 `dependencies`：**

- ❌ **建置工具一律放 `devDependencies`**：`vite`、`@vitejs/plugin-react`、`tailwindcss`、`@tailwindcss/vite`、`typescript`、`eslint*`。
  （放錯位置會讓 Vercel 在生產環境多裝一堆永遠用不到的套件。）
- ❌ **Node 18+ 內建就能做的，不要裝套件**：`node-fetch`（用 global `fetch`）、`form-data`（用 global `FormData` + `Blob`）。`api/*.js` 已有範例。
- ❌ **沒有 import 的套件一律移除**（例如 `react-router-dom` 已無人使用，已移除）。
  新增套件前先在 `src/` 與 `api/` grep 確認確實用到。
- ❌ 能用 CDN / 本機輕量引入的，不要進 bundle。

## 三、靜態資源（images / models / public）政策

1. **圖片**：`public/images/` 只放「程式碼有引用」的圖片。新增圖片前，先確認 HTML/CSS/JS 真的有地方用到；沒人引用的截圖、設計原稿、展示圖 = 直接刪除。
2. **鳥卡圖**：走 **Cloudflare R2**（`pub-a933...r2.dev/aviandex/NNNN.avif`），**絕不**放進 `public/` 或 git。
3. **BirdNET 模型（~56MB）**：
   - 絕不 commit、絕不進 Vercel 部署（`.gitignore` / `.vercelignore` 已排除 `public/models/`）。
   - 放置位置二擇一（程式會自動探測，本機優先）：
     - 本機 `public/models/birdnet/`（只在你自己的部署根目錄放一份）
     - R2：`aviandex/models/birdnet/`（`model.json` + 13 個 `group*-shard*.bin` + `labels/zh.txt`，**R2 bucket 要開 CORS**）
   - 來源：`github.com/georg95/birdnet-web → models/birdnet/`
4. **新資源檢查**：往 `public/` 丟檔案前先 `ls -lh`，>500KB 的檔案先問「能不能放 R2/CDN？」。

## 四、備份檔政策

- 開發過程**禁止**把 `*.bak` `*.tmp` `*.old` `*.orig` `*.rej` 留在 repo（`.gitignore` 已擋，但手動 `git add -f` 仍會犯案）。
- 要保留舊版 → **用 git 分支/標籤**，不要用備份檔。
- v1.5 已清除：`dist/`（4.7MB）、`nameAliases.ts.bak`、`birds.json.bak`、`App.tsx.orig`、`App.tsx.rej`、空殼 `BirdCard.ts`/`BirdModal.ts`、未使用的 `App.css`、`constants.js`、`useBirdNet.ts`、5 個無引用元件（BirdModal/BookModal/ProgressPanel/AchievementToast/Sidebar）、2 張未引用 hub 圖。

## 五、部署前檢查清單（每次改版必做）

```bash
# 1. 有沒有一堆垃圾進 repo？
git status
find . -path ./.git -prune -o -type f \( -name "*.bak" -o -name "*.orig" -o -name "*.rej" -o -name "*.tmp" -o -name "*.old" \) -print   # 必須零結果

# 2. 建置產物有沒有被 commit？
git ls-files dist/ node_modules/    # 必須零結果

# 3. 體積健檢（repo 本體應 < 1MB；dist 建置後 < 5MB）
du -sh --exclude=.git --exclude=node_modules .
du -sh dist

# 4. 依賴健檢：每個 dependency 都要有人 import
node -e "const p=require('./package.json');console.log(Object.keys(p.dependencies).join('\n'))"

# 5. 全綠才能 push / 部署
npm run lint
npm run build
```

## 六、Vercel 端注意

- 部署大小看 **Deployment → 檔案清單**，若看到 `dist` 以外的資料夾（尤其 `node_modules` 或模型檔）= 有漏。
- 若 AI 辨識（`/api/analyze`）偶發逾時：Pro 方案可加 `functions.maxDuration`（Hobby 上限 10 秒，寫超過會被壓回，**不要**寫超過方案上限，否則建置會報錯）。
- 環境變數（`HF_TOKEN`、`EBIRD_API_KEY`、`NYCKEL_*`、`BIRDNET_SPACE_URL`）放 Vercel Settings，**不要**寫進 code。

---

*最後更新：v1.5 瘦身工程（2026-09）。相關文件：`SETUP_AI_RECOGNITION.md`（AI 引擎設定）、`README.md`（功能說明）。*
