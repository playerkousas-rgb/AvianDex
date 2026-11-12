# 香港優先編號表（2026-11-11）

**原則（用戶 2026-11-11 拍板）**：英文學名最權威 → 以 eBird/Clements（v2024）的學名為準；中文名與「香港會出現的鳥」以香港觀鳥會（HKBWS）香港鳥類名錄為準（只取名稱／類別，名錄文字不入庫）。

| 項目 | 數字 |
|---|---|
| 舊編號 | 569（566 種；3 對重複） |
| 保留（學名在香港名錄） | 540 |
| 移出（不在香港名錄＋重複） | 29（清單見 `scripts/cards/hk-master.json` 的 `removed`） |
| 換成香港名錄缺的種 | 29（沿用原編號） |
| 新增編號 0570–0583 | 14 |
| **合計** | **583 = 香港名錄對到 Clements 的種數**（名錄 584 列，其中「綠翅鴨／美洲綠翅鴨」併為同一個 Clements 種） |

## 規則與例外
- 一個編號＝一種 Clements 物種；重複只留最小號。
- `Hirundo tahitica`（名錄舊學名）→ Clements 2024 已拆分，香港洋燕＝Pacific Swallow（*Hirundo javanica*）。
- 名錄的 *Anas carolinensis*、*Treron permagnus*、*Charadrius dubius*、*Parus minor* 在 Clements 分別併入 *A. crecca*、*T. formosae*、*Thinornis dubius*、*Parus cinereus*。
- 被換掉的編號已清除舊物種的 cardCopy／measurements／cardDetails／cardSources／dexScores（舊資料在 git 歷史），新物種欄位一律「資料待查」，待有出處才補。
- R2 上被換編號的正面插畫（birdcards/NNNN.avif）仍是舊物種，需重畫；清單＝`hk-master.json` 的 `assigned` 內所有編號。
- 英文也有編號：eBird `speciesCode`（如 `litter1`）與 `TAXON_ORDER`（演化排序），已存在 `birdTaxonomy.json`；NO.0001 起的號碼是 AvianDex 自己的。

## 重跑
```bash
node scripts/cards/apply-hk-master.mjs --write
node scripts/cards/enrich-birds.mjs --apply
node scripts/cards/build-explorer-data.mjs
node scripts/build-dex-scores.mjs
```
