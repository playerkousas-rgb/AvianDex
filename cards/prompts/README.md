# cards/prompts — 你手動寫的提示詞放這裡

命名：`NNNN.txt`（4 位編號）。例如 `0289.txt` 就係普通翠鳥的提示詞。

一行指令就會用你的提示詞出圖（我或者你自己都可以跑）：

```bash
# 1) 睇吓你寫的提示詞會變成點（不會出圖）
node scripts/cards/generate.mjs --ids 0289 --print-prompt

# 2) 用你的提示詞檔覆蓋內建模板，出圖到 cards/out/0289.avif
node scripts/cards/generate.mjs --ids 0289 --prompt-file cards/prompts/0289.txt
```

> 未放檔案時，腳本會用內建模板（`src/...／docs/CARD_PRODUCTION.md` 有全文）。
> 若只有一張卡要改提示詞，直接放一個檔案即可，其他卡照用模板。
