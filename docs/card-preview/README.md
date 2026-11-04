# AvianDex 卡面示意（HTML 版）

> ⚠️ 這不是截圖，是 **HTML 版卡面**。
> 沙盒沒有 Chromium，無法在這裡幫你截圖；但這個檔案在任何瀏覽器打開都跟
> `tools/card-studio/aviandex-studio.html` 的卡面**同一個 DOM、同一份 CSS**。
>
> 想直接看：在瀏覽器打開 `tools/card-studio/aviandex-studio.html`（雙擊即可）。

## 這是什麼

`scripts/cards/export-card-html.mjs` 把工作室渲染出來的 **單張卡** 連同 CSS 一起抽出，
變成一个獨立檔案，方便：

- 在 GitHub 上直接看版面（GitHub 不會顯示 HTML，但可以下載後雙擊）
- 貼到 CodePen／任何預覽服務
- 用瀏覽器「列印 → 儲存為 PDF」得到可派發的樣張

## 為什麼要獨立一份

卡面工作室（`aviandex-studio.html`）有 548 張卡、~2 MB，
每次只想看一張卡時太重。這個目錄的檔案每張約 0.2–0.4 MB。

## 重新產生

```bash
node scripts/cards/export-card-html.mjs 0008   # 產生 docs/card-preview/0008.html
node scripts/cards/export-card-html.mjs        # 產生預設幾張（0008 0288 0290）
```

> 產生的檔案**會**提交到 Git（每張約 230–380 KB，圖已縮到長邊 520）。
> 圖片以 dataURL 內嵌，所以檔案可以離線打開，也可以在 GitHub 直接下載。
