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

- 有文案的卡：**540** 張
- 🔴 嚴重：**1** 張（建議先隔離，唔好出卡）
- 🟡 待查：**154** 張
- 🟢 通過：**385** 張

## 🔴 嚴重（內文講緊另一隻雀）

| 編號 | 卡面名 | 來源條目 | 有問題欄位 | 內文提到的雀 | 內文開頭 |
|---|---|---|---|---|---|
| 0086 | 四聲杜鵑 | 四聲杜鵑 | funFact | 黑卷尾、灰卷尾 | 雌鳥與雄鳥不同，喉部顏色稍淺灰，胸部和尾巴帶有更多的棕色。… |

## 🟡 待查（來源條目名唔同）

| 編號 | 卡面名 | 來源條目 | 已補欄位 |
|---|---|---|---|
| 0295 | 斑魚狗 | 斑鱼狗 | diet、range、funFact |
| 0288 | 戴勝 | 戴胜 | look、habitat、diet、range、funFact |
| 0297 | 栗喉蜂虎 | 慄喉蜂虎 | look、habitat、diet、range、funFact |
| 0005 | 噪鵑 | 噪鵑 | look、habitat、diet、range、funFact |
| 0011 | 樹麻雀 | 麻雀 | look、habitat、diet、range、funFact |
| 0012 | 黑領椋鳥 | 黑領椋鳥 | look、diet、range、funFact |
| 0017 | 普通鵟 | 東方鵟 | range、funFact |
| 0022 | 栗樹鴨 | 慄樹鴨 | look、habitat、diet、range、funFact |
| 0027 | 凍原豆雁 | 凍原豆雁 | look、diet、range、funFact |
| 0029 | 赤麻鴨 | 赤麻鴨 | look、habitat、diet、range、funFact |
| 0031 | 棉鳧 | 棉鳧 | look、habitat、diet、range、funFact |
| 0035 | 琵嘴鴨 | 琵嘴鴨 | look、diet、range、funFact |
| 0036 | 赤膀鴨 | 赤膀鴨 | look、range、funFact |
| 0039 | 綠眉鴨 | 葡萄胸鴨 | look、habitat、diet、range、funFact |
| 0041 | 印緬斑嘴鴨 | 印度斑嘴鴨 | look、diet |
| 0042 | 中華斑嘴鴨 | 中華斑嘴鴨 | look、diet、range、funFact |
| 0043 | 綠頭鴨 | 家鴨 | look、diet、range、funFact |
| 0064 | 鳳頭鸊鷉 | 鳳頭鷿鷈 | look、habitat、diet、range、funFact |
| 0074 | 紅翅綠鳩 | 紅翅綠鳩 | look、range、funFact |
| 0083 | 霍氏鷹鵑 | 棕腹鷹鵑 | look、range |
| 0088 | 東方中杜鵑 | 北方中杜鵑 | range |
| 0095 | 普通雨燕 | 普通樓燕 | range |
| 0097 | 小白腰雨燕 | 家雨燕 | look、diet、range、funFact |
| 0101 | 白骨頂 | 骨頂雞 | look、habitat、diet、range、funFact |
| 0104 | 白胸苦惡鳥 | 白腹秧雞 | look、habitat、diet、range、funFact |
| 0105 | 灰腳秧雞 | 白喉斑秧雞 | look、diet、range、funFact |
| 0106 | 斑脇田雞 | 斑脅田雞 | look、diet、range |
| 0107 | 紅腳田雞 | 紅腳苦惡鳥 | look、diet、range |
| 0118 | 太平洋金斑鴴 | 金鴴 | look、habitat、diet、range、funFact |
| 0123 | 白臉鴴 | 彎嘴鴴屬 | look、funFact |
| 0127 | 金眶鴴 | 金眶鴴 | look、habitat、diet、range、funFact |
| 0129 | 彩鷸 | 彩鷸 | look、habitat、diet、range、funFact |
| 0133 | 紅腰杓鷸 | 大杓鷸 | look、habitat、diet、range、funFact |
| 0134 | 白腰杓鷸 | 白腰杓鷸 | look、diet、range、funFact |
| 0138 | 大濱鷸 | 大濱鷸 | look、diet、range、funFact |
| 0139 | 紅腹濱鷸 | 紅腹濱鷸 | look、habitat、diet、range、funFact |
| 0141 | 闊嘴鷸 | 闊嘴鷸 | look、diet、range、funFact |
| 0144 | 青腳濱鷸 | 青腳濱鷸 | look、diet、range、funFact |
| 0148 | 三趾濱鷸 | 三趾鷸 | look、habitat、diet、range、funFact |
| 0151 | 飾胸鷸 | 黃胸濱鷸 | look、diet、funFact |
| 0152 | 斑胸濱鷸 | 美洲尖尾濱鷸 | look、habitat、diet、range、funFact |
| 0154 | 長嘴鷸 | 長嘴半蹼鷸 | look、habitat、diet、range、funFact |
| 0171 | 林鷸 | 林鷸 | look、habitat、diet、range、funFact |
| 0178 | 中賊鷗 | 中賊鷗 | look、diet、range、funFact |
| 0203 | 白頂玄燕鷗 | 白頂玄鷗 | look、diet、range、funFact |
| 0206 | 白腰燕鷗 | 棕背燕鷗屬 | look |
| 0208 | 紅嘴巨燕鷗 | 紅嘴巨鷗 | look、diet、range、funFact |
| 0210 | 鬚浮鷗 | 須浮鷗 | look、diet、range、funFact |
| 0211 | 粉紅燕鷗 | 紅燕鷗 | look、diet、range、funFact |
| 0215 | 白尾鸏 | 白尾熱帶鳥 | look、diet、range、funFact |
| 0218 | 黃嘴潛鳥 | 白嘴潛鳥 | look、diet、range、funFact |
| 0219 | 褐燕鸌 | 純褐鸌 | look、habitat、diet、range、funFact |
| 0232 | 普通鸕鷀 | 普通鸕鶿 | look、diet、range |
| 0246 | 岩鷺 | 巖鷺 | look、habitat、diet、range、funFact |
| 0250 | 栗鳽 | 慄頭鳽 | look、habitat、diet、range、funFact |
| 0251 | 黑冠鳽 | 黑冠麻鷺 | look、habitat、diet、range、funFact |
| 0260 | 蛇鵰 | 大冠鷲 | look、habitat、diet、range、funFact |
| 0262 | 白肩鵰 | 白肩雕 | look、diet、range |
| 0263 | 白腹隼鵰 | 白腹隼雕 | look |
| 0265 | 白尾鷂 | 白尾鷂 | look、habitat、diet、range、funFact |
| 0267 | 鳳頭鷹 | Lophospiza | look、range、funFact |
| 0268 | 赤腹鷹 | 赤腹鷹 | look、diet、range |
| 0271 | 雀鷹 | 雀鷹 | look、habitat、diet、range、funFact |
| 0273 | 栗鳶 | 慄鳶 | look、habitat、diet、range、funFact |
| 0279 | 紅角鴞 | 東方角鴞 | look、range |
| 0282 | 褐漁鴞 | 褐魚鴞 | look、habitat、diet、range |
| 0305 | 黃嘴栗啄木鳥 | 黃嘴噪啄木鳥 | look、range |
| 0306 | 栗啄木鳥 | 慄啄木鳥 | range |
| 0314 | 藍翅八色鶇 | 馬來八色鶇 | look、habitat、diet、range、funFact |
| 0323 | 白腹鳳鶥 | 白腹鳳鶥 | look、diet、range、funFact |
| 0326 | 鵲色鸝 | 鵲鸝 | range |
| 0327 | 黑卷尾 | 黑卷尾 | look、habitat、diet、range、funFact |
| 0330 | 髮冠卷尾 | 發冠卷尾 | look、habitat、diet、range、funFact |
| 0333 | 綬帶 | 壽帶鳥 | look |
| 0343 | 印支綠鵲 | 黃胸綠鵲 | range、funFact |
| 0344 | 喜鵲 | 普通喜鵲 | look、diet、range、funFact |
| 0345 | 達烏里寒鴉 | 達烏裏寒鴉 | look、diet、range、funFact |
| 0347 | 禿鼻烏鴉 | 禿鼻烏鴉 | look、diet、range、funFact |
| 0348 | 小嘴烏鴉 | 小嘴烏鴉 | look、diet、range、funFact |
| 0359 | 黃腹山鷦鶯 | 黃腹鷦鶯 | look、range、funFact |
| 0360 | 純色山鷦鶯 | 褐頭鷦鶯 | look、habitat、diet、range、funFact |
| 0376 | 史氏蝗鶯 | 東亞蝗鶯 | look、diet、range |
| 0378 | 棕褐短翅蝗鶯 | 棕褐短翅鶯 | range |
| 0381 | 高山短翅蝗鶯 | 高山短翅鶯 | look、diet、range |
| 0384 | 灰喉沙燕 | 棕沙燕 | look、diet、range |
| 0392 | 黑短腳鵯 | 紅嘴黑鵯 | look、habitat、diet、range、funFact |
| 0393 | 栗耳短腳鵯 | 慄耳短腳鵯 | look、habitat、diet、range |
| 0394 | 栗背短腳鵯 | 慄背短腳鵯 | look、range |
| 0395 | 綠翅短腳鵯 | 麥克氏山短腳鵯 | range、funFact |
| 0397 | 黃眉柳鶯 | 黃眉柳鶯 | look、habitat、diet、range、funFact |
| 0400 | 黃腰柳鶯 | 黃腰柳鶯 | look、habitat、diet、range、funFact |
| 0410 | 峨嵋鶲鶯 | 峨眉鶲鶯 | look、diet |
| 0414 | 淡腳柳鶯 | 灰腳柳鶯 | look、range、funFact |
| 0417 | 極北柳鶯 | 極北柳鶯 | look、diet、range、funFact |
| 0418 | 栗頭鶲鶯 | 慄頭鶲鶯 | look、habitat、diet、range、funFact |
| 0424 | 鱗頭樹鶯 | 短尾鶯 | look、habitat、range、funFact |
| 0425 | 棕臉鶲鶯 | 棕面鶲鶯 | range、funFact |
| 0426 | 金頭擬縫葉鶯 | 金頭縫葉鶯 | range |
| 0432 | 棕頭鴉雀 | 金色鴉雀屬 | look |
| 0433 | 栗頸鳳鶥 | 慄頸鳳鶥 | look、diet、range |
| 0434 | 黑頦鳳鶥 | 黑額鳳鶥 | range |
| 0435 | 紅脇繡眼鳥 | 紅脅繡眼鳥 | look、habitat、range、funFact |
| 0437 | 紅頭穗鶥 | 紅頭穗鶥 | look、habitat、range、funFact |
| 0438 | 棕頸鉤嘴鶥 | 棕頸鉤嘴鶥 | look、range |
| 0440 | 黑眉雀鶥 | 淡眉雀鶥 | look、diet、range |
| 0444 | 白頰噪鶥 | 白頰噪鶥 | range |
| 0446 | 黑領噪鶥 | 黑領噪鶥 | range |
| 0447 | 矛紋草鶥 | 矛紋草鶥 | range |
| 0451 | 栗頰椋鳥 | 紫背椋鳥 | range |
| 0454 | 灰椋鳥 | 灰椋鳥 | look、diet、range、funFact |
| 0455 | 家八哥 | 家八哥 | look、habitat、diet、range、funFact |
| 0462 | 烏鶇 | 中國黑鶇 | look、habitat、diet、range |
| 0463 | 烏灰鶇 | 烏灰鶇 | look、diet、range、funFact |
| 0464 | 灰背鶇 | 灰背赤腹鶇 | look、diet、range |
| 0470 | 斑鶇 | 斑鶇 | look、diet、range、funFact |
| 0471 | 紅尾鶇 | 紅尾鶇 | look |
| 0472 | 灰紋鶲 | 灰斑鶲 | look、habitat、diet、range、funFact |
| 0475 | 北灰鶲 | 寬嘴鶲 | look、diet、range、funFact |
| 0489 | 日本歌鴝 | 日本歌鴝 | look、habitat、diet、range、funFact |
| 0491 | 藍喉歌鴝 | 藍點頦 | look、diet、range、funFact |
| 0497 | 紅脇藍尾鴝 | 紅脅藍尾鴝 | look、diet、range、funFact |
| 0503 | 銹胸藍姬鶲 | 鏽胸藍姬鶲 | diet、range |
| 0508 | 紅尾水鴝 | 鉛色水鴝 | look、habitat、range、funFact |
| 0511 | 北紅尾鴝 | 黃尾鴝 | look、habitat、range、funFact |
| 0512 | 栗腹磯鶇 | 慄腹磯鶇 | look、range |
| 0516 | 灰林䳭 | 灰林鶺 | range、funFact |
| 0523 | 黃胸織雀 | 黃胸織布鳥 | range |
| 0525 | 栗腹文鳥 | 黑頭文鳥 | look、diet、range、funFact |
| 0529 | 西黃鶺鴒 | 西方黃鶺鴒 | look、habitat、diet、range、funFact |
| 0530 | 東黃鶺鴒 | 東方黃鶺鴒 | look、habitat、diet、range、funFact |
| 0533 | 理氏鷚 | 大花鷚 | look、habitat、diet、range、funFact |
| 0534 | 布氏鷚 | 布萊氏鷚 | look、diet |
| 0545 | 黑尾蠟嘴雀 | 黑尾蠟嘴雀 | look、diet、range、funFact |
| 0548 | 金翅雀 | 金翅雀 | look、habitat、diet、range、funFact |
| 0552 | 黑頭鵐 | 黑頭鵐 | look、habitat、diet、range、funFact |
| 0554 | 栗耳鵐 | 赤胸鵐 | look、habitat、range、funFact |
| 0560 | 葦鵐 | 葦鵐 | look、habitat、diet、range、funFact |
| 0562 | 黃胸鵐 | 黃胸鵐 | look、habitat、diet、range、funFact |
| 0565 | 硫磺鵐 | 硫黃鵐 | habitat、range、funFact |
| 0567 | 栗鵐 | 慄鵐 | look、habitat、range、funFact |
| 0126 | 長嘴鴴 | Long-billed | — |
| 0187 | 棕頭鷗 | 香港鳥類列表 | — |
| 0236 | 黃葦鳽 | Yellow | — |
| 0238 | 栗葦鳽 | Cinnamon | — |
| 0239 | 黑鳽 | Black | — |
| 0269 | 日本松雀鷹 | Japanese | — |
| 0270 | 松雀鷹 | Besra | — |
| 0379 | 中華短翅蝗鶯 | 国家保护的有益的或者有重要经济、科学研究价值的陆生野生动物名录 | — |
| 0423 | 淡腳樹鶯 | 国家保护的有益的或者有重要经济、科学研究价值的陆生野生动物名录 | — |
| 0016 | 遠東山雀 | 蒼背山雀 | look、range |
| 0196 | 織女銀鷗 | 西伯利亞銀鷗 | look、habitat、range、funFact |
| 0237 | 紫背葦鳽 | Von | — |
| 0247 | 牛背鷺 | Eastern | — |
| 0332 | 紫綬帶 | 紫壽帶鳥 | look、habitat、range、funFact |

## 怎樣修

1. 先修抽取器（`scripts/cards/extract-copy.mjs`）「條目 → 編號」的對應邏輯，令佢用 `pageid` 而唔係靠標題搜尋；
2. 重跑抽取，只覆蓋有問題的編號（其餘唔動）；
3. 重跑 `npm test` 與 `node scripts/cards/audit-copy.mjs`，🔴 應該清零。
