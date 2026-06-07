# AvianDex 手機版科研中心修復 v1.1 📱

> v1.1 更新：鳴謝區改成小字放在科研中心副標旁，不再單獨佔一行

## 🐛 修復的問題
在手機開圖鑑時：
- ✅ **基礎數據頁** 可以滾動，所有欄目都看得到
- ❌ **詳細資料 / 科研中心頁** 不能滾動，6 個按鈕格子被擠扁、點不到

## 🔍 根本原因
兩頁的高度策略不一致：

| 頁面 | className | 結果 |
|---|---|---|
| 基礎數據 | `min-h-max w-full pb-10` | ✅ 自然撐開，父層 overflow-y-auto 正常滾動 |
| 科研中心（修復前）| `w-full h-full` | ❌ 鎖死高度，內容被切掉 |

再加上六宮格用 `flex-1 + overflow-hidden`，手機螢幕一壓 6 格被擠到看不見。

## ✅ 修復內容（同一檔案 5 處改動）

只改 `src/components/PokedexDevice.tsx`：

### 改動 1：外層 motion.div 改為自然高度可滾
```diff
- className="flex flex-col w-full h-full gap-4 relative z-10"
+ className="flex flex-col justify-start min-h-max w-full gap-4 relative z-10 pb-10"
```

### 改動 2：六宮格外容器拿掉鎖死高度
```diff
- <div className="flex-1 ... flex flex-col gap-4 overflow-hidden shadow-inner">
+ <div className="... flex flex-col gap-4 shadow-inner">
```

### 改動 3：grid 給每格固定為正方形
```diff
- <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
+ <div className="grid grid-cols-2 gap-3 [&>button]:aspect-square">
```

### 改動 4：把鳴謝改成小字放在「科學研究中心」副標下方 ✨
```diff
  <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Research Hub / {currentBird.name}</p>
+ <p className="text-[8px] text-amber-300/70 leading-snug mt-1.5 italic">
+   <Award className="w-2.5 h-2.5 inline-block mr-0.5 -mt-0.5" />
+   數據鳴謝：<span className="text-amber-300 font-bold not-italic">Cornell Lab</span>、eBird、Macaulay Library
+ </p>
```

### 改動 5：刪除原本獨立的鳴謝區塊
```diff
- {/* 鳴謝區 */}
- <div className="mt-auto p-3 bg-amber-900/30 ...">
-   <p>... Cornell Lab 提供 ...</p>
- </div>
```

## 🎯 效果
- ✅ 手機開科研中心 → 可上下滾動
- ✅ 6 個按鈕保持正方形、完整可點
- ✅ 鳴謝資訊**保留**，改用優雅小字放在標題旁
- ✅ 整體版面更乾淨，6 格按鈕視覺更突出
- ✅ 桌機版維持不變

## 📦 內容
```
src/components/PokedexDevice.tsx
```

## 🌐 GitHub 部署
1. 進 https://github.com/playerkousas-rgb/AvianDex
2. 找到 `src/components/PokedexDevice.tsx` → 鉛筆 🖉 → **全選清空** → 貼上 → Commit
3. Vercel 自動部署（約 1 分鐘）
