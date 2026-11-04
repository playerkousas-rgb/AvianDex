# 卡面文案核對報告（自動產生）

> 由 `node scripts/cards/audit-copy.mjs` 產生。呢份報告**唔會改資料**，只係指出邊張卡要人手覆核。

## 為什麼要核對

文案係「由中文維基抽一句原文」得來。抽取器認錯條目，整格就會變成**另一隻雀**的描述——
比「資料待查」危險，因為佢睇落完全正常。以下三種情況要分清楚：

| 級別 | 判斷 | 意思 |
|---|---|---|
| 🔴 嚴重 | 內文提到別隻雀、但冇提自己 | 幾乎肯定抓錯條目，該卡資料不可用 |
| 🟡 待查 | 來源條目名同 eBird 名唔同 | 可能只係命名差異（別名／舊名／簡繁），需要人手看一眼 |
| 🟢 通過 | 條目名對得上 | — |

## 摘要

- 有文案的卡：**548** 張
- 🔴 嚴重：**0** 張（建議先隔離，唔好出卡）
- 🟡 待查：**150** 張
- 🟢 通過：**398** 張

## 🟡 待查（來源條目名唔同）

| 編號 | 卡面名 | 來源條目 | 已補欄位 |
|---|---|---|---|
| 0290 | 三趾翠鳥 | 三趾翠鳥 | look、habitat、diet、range、funFact |
| 0005 | 噪鵑 | 噪鵑 | look、habitat、diet、range、funFact |
| 0010 | 白腰文鳥 | 灰胸秧雞 | look、diet、range |
| 0012 | 黑領椋鳥 | 黑領椋鳥 | look、diet、range、funFact |
| 0014 | 喜鵲 | 普通喜鵲 | look、diet、range、funFact |
| 0017 | 暗綠繡眼鳥 | 東方鵟 | — |
| 0022 | 栗樹鴨 | 慄樹鴨 | look、habitat、diet、range、funFact |
| 0027 | 凍原豆雁 | 凍原豆雁 | look、diet、range、funFact |
| 0029 | 赤麻鴨 | 赤麻鴨 | look、habitat、diet、range、funFact |
| 0031 | 棉鳧 | 棉鳧 | look、habitat、diet、range、funFact |
| 0035 | 琵嘴鴨 | 琵嘴鴨 | look、diet、range、funFact |
| 0036 | 赤膀鴨 | 赤膀鴨 | look、range、funFact |
| 0039 | 美洲黑海番鴨 | 葡萄胸鴨 | look、habitat、diet、range、funFact |
| 0041 | 印缅斑嘴鴨 | 印度斑嘴鴨 | look、diet |
| 0042 | 中華斑嘴鴨 | 中華斑嘴鴨 | look、diet、range、funFact |
| 0043 | 綠頭鴨 | 家鴨 | look、diet、range、funFact |
| 0052 | 紅胸田雞 | 絨海番鴨 | look |
| 0053 | 白翅海番鴨 | 白翅黑海番鴨 | look、diet、range |
| 0056 | 斑頭秋沙鴨 | 白秋沙鴨 | look、diet、funFact |
| 0064 | 鳳頭鸊鷉 | 鳳頭鷿鷈 | look、habitat、diet、range、funFact |
| 0074 | 紅翅綠鳩 | 紅翅綠鳩 | look、range、funFact |
| 0075 | 灰樹鵲 | 紅頂綠鳩 | look、range、funFact |
| 0083 | 棕腹杜鵑 | 棕腹鷹鵑 | look、range |
| 0084 | Malaysian hawk-cuckoo | 馬來棕腹鷹鵑 | look、diet、range |
| 0092 | 白背針尾雨燕 | 灰喉針尾雨燕 | look、range、funFact |
| 0094 | 短嘴金絲燕 | 短嘴金絲燕 | look、habitat、diet、range、funFact |
| 0097 | 草原鵰 | 家雨燕 | — |
| 0098 | 普通秧雞 | 西方秧雞 | look、habitat、diet、range、funFact |
| 0099 | 灰面鷲 | 普通秧雞 | — |
| 0101 | 白骨頂 | 骨頂雞 | look、habitat、diet、range、funFact |
| 0102 | 灰頭麥雞 | 白眉田雞 | look、diet、range、funFact |
| 0104 | 白胸苦惡鳥 | 白腹秧雞 | look、habitat、diet、range、funFact |
| 0106 | 斑脇田雞 | 斑脅田雞 | look、diet、range |
| 0115 | 灰鴴 | 灰斑鴴 | look、diet、range、funFact |
| 0123 | 白臉鴴 | 彎嘴鴴屬 | look |
| 0124 | 雪鴴 | 彎嘴鴴屬 | look |
| 0127 | 金眶鴴 | 金眶鴴 | look、habitat、diet、range、funFact |
| 0132 | 小杓鷸 | 小杓鷸 | look、diet、range、funFact |
| 0138 | 大濱鷸 | 大濱鷸 | look、diet、range、funFact |
| 0139 | 紅腹濱鷸 | 紅腹濱鷸 | look、habitat、diet、range、funFact |
| 0141 | 闊嘴鷸 | 闊嘴鷸 | look、diet、range、funFact |
| 0144 | 青腳濱鷸 | 青腳濱鷸 | look、diet、range、funFact |
| 0148 | 三趾濱鷸 | 三趾鷸 | look、habitat、diet、range、funFact |
| 0152 | 斑胸濱鷸 | 美洲尖尾濱鷸 | look、habitat、diet、range、funFact |
| 0165 | 灰尾鷸 | 灰尾漂鷸 | look、habitat、diet、range、funFact |
| 0171 | 林鷸 | 林鷸 | look、habitat、diet、range、funFact |
| 0178 | 中賊鷗 | 中賊鷗 | look、diet、range、funFact |
| 0192 | 黑尾鷗 | 黑尾鷗 | look、habitat、diet、range、funFact |
| 0197 | 黃腿銀鷗 | 黃腳銀鷗 | look、range |
| 0198 | 冰島鷗 | 北極鷗 | look、diet、range、funFact |
| 0199 | 灰燕鵙 | 小黑背鷗 | look、diet、range |
| 0203 | 白頂玄燕鷗 | 白頂玄鷗 | look、diet、range、funFact |
| 0204 | 褐柳鶯 | 烏燕鷗 | look、diet、range、funFact |
| 0206 | 白腰燕鷗 | 棕背燕鷗屬 | look |
| 0211 | 粉紅燕鷗 | 紅燕鷗 | look、diet、range、funFact |
| 0215 | 白尾鸏 | 白尾熱帶鳥 | look、diet、range、funFact |
| 0218 | 黃嘴潛鳥 | 白嘴潛鳥 | look、diet、range、funFact |
| 0219 | 褐燕鸌 | 純褐鸌 | look、habitat、diet、range、funFact |
| 0232 | 普通鸕鷀 | 普通鸕鶿 | look、diet、range |
| 0246 | 岩鷺 | 巖鷺 | look、habitat、diet、range、funFact |
| 0250 | 栗頭鳽 | 慄頭鳽 | look、habitat、diet、range、funFact |
| 0251 | 黑冠鳽 | 黑冠麻鷺 | look、habitat、diet、range、funFact |
| 0260 | 蛇鵰 | 大冠鷲 | look、habitat、diet、range、funFact |
| 0262 | 白肩鵰 | 白肩雕 | look、diet、range |
| 0267 | 鳳頭鷹 | Lophospiza | look、range、funFact |
| 0268 | 赤腹鷹 | 赤腹鷹 | look、diet、range |
| 0271 | 雀鷹 | 雀鷹 | look、habitat、diet、range、funFact |
| 0273 | 栗鳶 | 慄鳶 | look、habitat、diet、range、funFact |
| 0275 | 普通鵟 | 歐亞鵟 | look、diet、range |
| 0278 | Sunda scops-owl | 巽他領角鴞 | range |
| 0279 | 紅角鴞 | 東方角鴞 | look、range |
| 0300 | 大擬鴷 | 大擬啄木鳥 | range、funFact |
| 0305 | 黃嘴栗啄木鳥 | 黃嘴噪啄木鳥 | look、range |
| 0306 | 栗啄木鳥 | 慄啄木鳥 | range |
| 0308 | 紅隼 | 紅隼 | look、habitat、diet、range、funFact |
| 0309 | 紅腳隼 | 阿穆爾隼 | look、habitat、diet、range、funFact |
| 0314 | 藍翅八色鶇 | 馬來八色鶇 | look、habitat、diet、range、funFact |
| 0321 | 粉紅椋鳥 | 粉紅山椒鳥 | range |
| 0323 | 白腹鳳鶥 | 白腹鳳鶥 | look、diet、range、funFact |
| 0326 | 鵲色鸝 | 鵲鸝 | range |
| 0327 | 黑卷尾 | 黑卷尾 | look、habitat、diet、range、funFact |
| 0330 | 髮冠卷尾 | 發冠卷尾 | look、habitat、diet、range、funFact |
| 0343 | 印支綠鵲 | 黃胸綠鵲 | range、funFact |
| 0344 | 喜鵲 | 普通喜鵲 | look、diet、range、funFact |
| 0345 | 達烏里寒鴉 | 達烏裏寒鴉 | look、diet、range、funFact |
| 0347 | 禿鼻烏鴉 | 禿鼻烏鴉 | look、diet、range、funFact |
| 0348 | 小嘴烏鴉 | 小嘴烏鴉 | look、diet、range、funFact |
| 0359 | 黃腹山鷦鶯 | 黃腹鷦鶯 | look、range、funFact |
| 0360 | 純色山鷦鶯 | 褐頭鷦鶯 | look、habitat、diet、range、funFact |
| 0365 | 賽氏篱鶯 | 賽氏籬鶯 | look、diet、range |
| 0376 | 史氏蝗鶯 | 東亞蝗鶯 | look、diet、range |
| 0377 | 矛紋蝗鶯 | 矛斑蝗鶯 | look、habitat、diet、range |
| 0380 | 北短翅鶯 | 北短翅蝗鶯 | look、diet、range |
| 0383 | 小鷦鶥 | 小鱗胸鷦鶥 | range |
| 0384 | 灰喉沙燕 | 棕沙燕 | look、diet、range |
| 0392 | 黑短腳鵯 | 紅嘴黑鵯 | look、habitat、diet、range、funFact |
| 0394 | 栗背短腳鵯 | 慄背短腳鵯 | look、range |
| 0395 | 綠翅短腳鵯 | 麥克氏山短腳鵯 | range、funFact |
| 0397 | 黃眉柳鶯 | 黃眉柳鶯 | look、habitat、diet、range、funFact |
| 0400 | 黃腰柳鶯 | 黃腰柳鶯 | look、habitat、diet、range、funFact |
| 0404 | 中亞嘰喳柳鶯 | 東方嘰喳柳鶯 | range |
| 0411 | 純色尾鶲鶯 | 淡尾鶲鶯 | look、diet、range |
| 0414 | 淡腳柳鶯 | 灰腳柳鶯 | look、range、funFact |
| 0415 | 日本淡腳柳鶯 | 庫頁島柳鶯 | look、range |
| 0417 | 極北柳鶯 | 極北柳鶯 | look、diet、range、funFact |
| 0418 | 栗耳鳳鶥 | 慄頭鶲鶯 | look、habitat、diet、range、funFact |
| 0424 | 鱗頭樹鶯 | 短尾鶯 | look、habitat、range、funFact |
| 0425 | 棕臉鶲鶯 | 棕面鶲鶯 | range、funFact |
| 0426 | 栗頭縫葉鶯 | 金頭縫葉鶯 | range |
| 0432 | 棕頭鴉雀 | 金色鴉雀屬 | look |
| 0435 | 紅脇繡眼鳥 | 紅脅繡眼鳥 | look、habitat、range、funFact |
| 0437 | 紅頭穗鶥 | 紅頭穗鶥 | look、habitat、range、funFact |
| 0438 | 棕頸鈎嘴鶥 | 棕頸鉤嘴鶥 | look、range |
| 0439 | 綠鷺 | 中華草鶥 | look、habitat、diet、range、funFact |
| 0440 | 黑眉雀鶥 | 淡眉雀鶥 | look、diet、range |
| 0444 | 白頰噪鶥 | 白頰噪鶥 | range |
| 0446 | 黑領噪鶥 | 黑領噪鶥 | range |
| 0447 | 矛紋草鶥 | 矛紋草鶥 | range |
| 0454 | 灰椋鳥 | 灰椋鳥 | look、diet、range、funFact |
| 0455 | 家八哥 | 家八哥 | look、habitat、diet、range、funFact |
| 0462 | 烏鶇 | 中國黑鶇 | look、habitat、diet、range |
| 0463 | 烏灰鶇 | 烏灰鶇 | look、diet、range、funFact |
| 0464 | 灰背鶇 | 灰背赤腹鶇 | look、diet、range |
| 0468 | 黑喉鶇 | 黑頸鶇 | look、diet、range |
| 0471 | 斑鶇 | 紅尾鶇 | look |
| 0472 | 灰紋鶲 | 灰斑鶲 | look、habitat、diet、range、funFact |
| 0475 | 北灰鶲 | 寬嘴鶲 | look、diet、range、funFact |
| 0477 | 灰頭椋鳥 | 白腰鵲鴝 | look、habitat、range、funFact |
| 0484 | 白腹藍姬鶲 | 白腹藍鶲 | look、diet、funFact |
| 0489 | 日本歌鴝 | 日本歌鴝 | look、habitat、diet、range、funFact |
| 0491 | 藍喉歌鴝 | 藍點頦 | look、diet、range、funFact |
| 0493 | 白冠燕尾 | 白額燕尾 | look、range |
| 0497 | 紅脇藍尾鴝 | 紅脅藍尾鴝 | look、diet、range、funFact |
| 0508 | 紅尾水鴝 | 鉛色水鴝 | look、habitat、range、funFact |
| 0511 | 北紅尾鴝 | 黃尾鴝 | look、habitat、range、funFact |
| 0512 | 栗腹磯鶇 | 慄腹磯鶇 | look、range |
| 0515 | 黑喉石䳭 | 西伯利亞石鶺 | look、habitat、diet、range、funFact |
| 0516 | 灰林䳭 | 灰林鶺 | range、funFact |
| 0523 | 黃胸織雀 | 黃胸織布鳥 | range |
| 0525 | 栗腹文鳥 | 黑頭文鳥 | look、diet、range |
| 0528 | 灰鶺鴒 | 灰鶺鴒 | look、habitat、diet、range、funFact |
| 0533 | 田鷚 | 大花鷚 | look、habitat、diet、range、funFact |
| 0534 | 布氏鷚 | 布萊氏鷚 | look、diet |
| 0545 | 黑尾蠟嘴雀 | 黑尾蠟嘴雀 | look、diet、range、funFact |
| 0548 | 金翅雀 | 金翅雀 | look、habitat、diet、range、funFact |
| 0552 | 黑頭鵐 | 黑頭鵐 | look、habitat、diet、range、funFact |
| 0554 | 栗耳鵐 | 赤胸鵐 | look、habitat、range、funFact |
| 0560 | 葦鵐 | 葦鵐 | look、habitat、diet、range、funFact |
| 0562 | 黃胸鵐 | 黃胸鵐 | look、habitat、diet、range、funFact |
| 0567 | 栗鵐 | 慄鵐 | look、habitat、range、funFact |

## 怎樣修

1. 先修抽取器（`scripts/cards/extract-copy.mjs`）「條目 → 編號」的對應邏輯，令佢用 `pageid` 而唔係靠標題搜尋；
2. 重跑抽取，只覆蓋有問題的編號（其餘唔動）；
3. 重跑 `npm test` 與 `node scripts/cards/audit-copy.mjs`，🔴 應該清零。
