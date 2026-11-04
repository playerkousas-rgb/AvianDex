# 資料錯漏清單（現況）

> **v1.7.0 更新**：本清單已由 eBird/Clements 全面複核。
> 最新、最完整的清單請睇 **`reports/enrich-birds.md`**（自動產生，逐張卡有比對途徑）。
> 流程與規則見 **`docs/TAXONOMY_PIPELINE.md`**。以下保留原始紀錄，方便日後追溯。

# 資料錯誤清單（DATA_ISSUES.md）

> 生圖之前必須先修好這些。每一項都附「現況 → 應為 → 依據」。
> 呢份清單係由 `npm run facts:audit` 自動捉出嚟嘅一部分，加上人工對照 eBird／Avibase 確認。

## 🔴 A. 中文名同英文名根本唔係同一種雀（最嚴重）

| 編號 | 現在的中文名 | 現在的英文名 | 應為 | 依據 |
|---|---|---|---|---|
| 0017 | 暗綠繡眼鳥 | Eastern Buzzard | 中文應為「東亞鵟」**或**英文改為 `Swinhoe's White-eye`（Zosterops simplex） | 兩者是完全不同的鳥：鵟是鷹科猛禽，繡眼鳥是繡眼鳥科 |
| 0452 | 灰頭椋鳥 | Chestnut-Tailed Starling | 英文應為 `Chestnut-tailed Starling` ✔ 但中文應為「**灰頭椋鳥**」僅指 Sturnia malabarica；請確認是否要改用「**白眉椋鳥**」 | eBird 名稱比對 |
| 0477 | 灰頭椋鳥 | White-Rumped Shama | 中文應為「**白腰鵲鴝**」（英文 White-rumped Shama = Copsychus malabaricus） | 兩者不同科（椋鳥科 vs 鶲科） |
| 0456/0457 | 虎斑地鶇（重複） | Zoothera Aurea / Scaly Thrush | 應合併為一種：`Zoothera aurea`（虎斑地鶇）；另一筆應改為**白氏地鶇 Zoothera dauma** 或刪除 | 同一學名出現兩次 |
| 0461/0462 | 烏鶇（重複） | Eurasian Blackbird / Chinese Blackbird | 中國大陸的「烏鶇」= `Turdus mandarinus`；歐洲的 = `Turdus merula`。香港以 **Turdus mandarinus（烏鶇）** 為主，另一筆應標明「歐烏鶇」或刪除 | IOC 已拆分 |
| 0470/0471 | 斑鶇（重複） | Dusky Thrush / Turdus Naumanni | Naumann's Thrush = `Turdus naumanni`（**紅尾鶇**）；Dusky Thrush = `Turdus eunomus`（**斑鶇**）。兩筆中文名應分開 | IOC 分類 |
| 0529/0530 | 黃鶺鴒（重複） | Western / Eastern Yellow Wagtail | 應分為「**西黃鶺鴒** Motacilla flava」與「**東黃鶺鴒** Motacilla tschutschensis」 | IOC 已拆分 |
| 0014/0344 | 喜鵲（重複） | Eurasian Magpie / Oriental Magpie | 兩者現已被視為同一種（Pica serica 在東亞）；建議保留 0014，0344 標為「東亞喜鵲」或合併 | IOC 11.x |

## 🔴 B. 英文名缺失（`Unknown Species`）

| 編號 | 中文名 | 應補英文名（建議） |
|---|---|---|
| 0009 | 黑臉噪眉 | Masked Laughingthrush（*Pterorhinus perspicillatus*） |
| 0012 | 黑領椋鳥 | Black-collared Starling（*Gracupica nigricollis*） |
| 0016 | 大山雀 | Japanese Tit / Cinereous Tit（香港為 *Parus minor*） |
| 0021 | 亞歷山大鸚鵡 | Alexandrine Parakeet（*Psittacula eupatria*） |
| 0312 | 亞歷山大鸚鵡 | 同上 — 與 0021 重複，需二選一 |

## 🟠 C. 明顯錯配（英文名對應另一種鳥）

| 編號 | 中文名 | 現英文名 | 問題 |
|---|---|---|---|
| 0010 | 白腰文鳥 | Slaty-Breasted Rail | 白腰文鳥 = **White-rumped Munia**（*Lonchura striata*）；Slaty-breasted Rail 是「灰胸秧雞」 |
| 0017 | 暗綠繡眼鳥 | Eastern Buzzard | 見上 |

> ⚠️ 這幾項是我在對照 `birds.json` 與 `BIRD_ID_MAPPING.csv` 時發現的**現存資料錯誤**，
> 與「圖未生成」無關 —— 即使全部圖都做完，卡上的分類也會是錯的。

## 處理方式（建議）

1. **先修 `birds.json`**（唯一來源），再跑 `npm run facts:fetch` 重新查證；
2. `npm run facts:audit` 會把仍有衝突的編號列成 🔴 必須修；
3. 修完的編號才可以出百科卡（`cards:generate` 會自動擋住未查證的卡）。

> 我未能 100% 確認每一項的最終中文名（因為香港觀鳥會／Avibase／IOC 的中文名有時不同），
> 所以上表「應為」一欄是**建議**，請你或觀鳥導師拍板；程式不會自己改名。
