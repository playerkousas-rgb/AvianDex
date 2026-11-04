# 備份策略（AvianDex）

> 目標：**GitHub 帳戶有事（封帳／被鎖／誤刪）時，本機可以在 10 分鐘內回到一模一樣的狀態。**

---

## 1. 先分清三種「備份」

| 名詞 | 是什麼 | 有冇工作檔案（`src/`、`package.json`） | 可唔可以 `npm install` |
|---|---|---|---|
| **普通 clone** | 一個分支的工作副本 | ✅ 有 | ✅ 可以 |
| **bare mirror**（你現在的 `D:\GITBACKUP\AvianDex.git`） | 全部分支／全部歷史，冇工作區 | ❌ 冇 | ❌ 唔可以 |
| **bundle**（單一 `.bundle` 檔） | 整個 repo 打包成一個檔案 | ❌ 冇（要 clone 出來才有） | ❌ 唔可以（clone 後才得） |

**結論**：mirror 係最完整的備份（比普通 clone 更齊），但**唔可以喺入面工作**。
要工作，就 `git clone <mirror路徑>` 出一個工作副本。

---

## 2. 一個關鍵盲點：git 備份拿不到插畫

`.gitignore` 排除了這些：

```
cards/art/     # 插畫原檔，850 MB
cards/out/     # 成品 AVIF，40 MB
reports/       # 進度報告
.cache/
```

所以：**clone 幾多次都唔會有插畫**。插畫的真正來源是：
1. 本機 `cards/art/`（唯一原始檔）
2. Cloudflare R2（成品 AVIF，對外服務用）

因此備份要分兩份：**git 一份 + 素材一份**（腳本已包含）。

---

## 3. 每日 vs 每週：唔需要每日重新 clone

| 做什麼 | 頻率 | 為什麼 |
|---|---|---|
| `git fetch`（更新 mirror） | **每日** | 只傳差異，通常幾百 KB；等於「整份 repo 補到最新」 |
| `git bundle`（單檔快照） | 每週 | 就算 mirror 整個資料夾壞了，仍有一個檔案可還原 |
| `robocopy` 素材 | 每週 | 插畫不會變，備份成本低 |

**會唔會因為每日 fetch 而被 GitHub 封帳？**
正常 `git fetch`／`clone` 不算濫用。會被限制的通常是：短時間大量 **API** 呼叫（未認證 60 次/小時）、
大量自動化爬取、或 token 洩漏被濫用。每日一次 fetch 完全在正常範圍。

---

## 4. 用法

```bat
REM 第一次：建立 mirror（只需一次）
git clone --mirror https://github.com/playerkousas-rgb/AvianDex.git D:\GITBACKUP\AvianDex.git

REM 之後每日跑（或放進工作排程器）
D:\AvianDex-work\tools\backup\backup-aviandex.bat

REM 睇還原步驟（不改任何檔案）
D:\AvianDex-work\tools\backup\backup-aviandex.bat restore
```

腳本頂部有三個路徑要改成你自己的：

```bat
set "MIRROR=D:\GITBACKUP\AvianDex.git"
set "SNAPSHOT=D:\GITBACKUP\snapshots"
set "WORKTREE=D:\AvianDex-work"     ← 你的工作副本（做法 1 clone 出來那個）
```

### 放進 Windows 工作排程器（每日自動）

1. Win+R → `taskschd.msc` → 「建立基本工作」
2. 每日，時間選你部機關機前的時間（例如 22:30）
3. 動作 → 啟動程式 → `D:\AvianDex-work\tools\backup\backup-aviandex.bat`
4. 「起始於」填 `D:\AvianDex-work\tools\backup`
5. 勾「無論使用者是否登入都執行」需要管理員密碼；不想就勾「只在使用者登入時執行」

---

## 5. 還原（三個情境）

**A. GitHub 帳戶被封，想繼續工作**
```bat
git clone D:\GITBACKUP\AvianDex.git D:\AvianDex-work
cd /d D:\AvianDex-work
git checkout arena/3be6342b-aviandex
npm install
```

**B. 連 mirror 都壞了，只剩 `.bundle`**
```bat
git clone D:\GITBACKUP\snapshots\AvianDex-2026-11-09.bundle D:\AvianDex-restored
cd /d D:\AvianDex-restored
git remote set-url origin https://github.com/playerkousas-rgb/AvianDex.git
```

**C. 每季驗證一次備份真係得**（很重要，備份沒驗證過等於沒有）
```bat
git clone D:\GITBACKUP\AvianDex.git %TEMP%\verify
cd /d %TEMP%\verify
npm install
npm test
```

---

## 6. 三二一原則（給自己一個底線）

- **3** 份副本：GitHub、本機 mirror、bundle 快照
- **2** 種媒介：硬碟 + 雲（GitHub／R2）
- **1** 份異地：把 `.bundle` 每季複製到外置硬碟或另一部機

插畫（850 MB）額外建議：**每季把 `cards/art/` 壓縮一份放外置硬碟**，
因為它只存在你的本機，沒有雲端副本。

---

## 7. 如果你想「每日整個 repo 複製一份」

技術上可以（`git clone` 一次後每日 `git fetch` + `git reset --hard`），但**不建議**：

- 每個 clone 都是幾百 MB，每日一份很快爆硬碟
- 大量 clone 才真的容易觸發 GitHub 的流量限制
- mirror + bundle 已經覆蓋同樣的保障，而且更省

若你堅持要「每日獨立資料夾」（例如怕 mirror 損壞），做法是**每週**一個，而不是每日：

```bat
git clone --mirror https://github.com/playerkousas-rgb/AvianDex.git D:\GITBACKUP\weekly\AvianDex-%TODAY%.git
```

這樣每週幾十 MB，一年約 2–3 GB，可接受。
