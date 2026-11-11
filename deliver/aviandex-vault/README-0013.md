# NO.0013 八哥 — AvianDex 卡種（貼入倉）

## 1. 卡面准印文字（PRINTED TEXT，逐字照抄）

- NO.0013
- 八哥
- Acridotheres cristatellus
- Crested Myna
- 雀形目 · 椋鳥科
- 體長 資料待查
- 體重 116.3 g
- 無危 LC
- 圖鑑評分 3.1/5 ★★★☆☆
- 棲地 城市公園、開闊地
- 食性 植物藻類、雜食
- 外形 本種鳥類通體黑色，粗看起來頗似烏鴉，但是與烏鴉有着顯著的區別。
- 食性 八哥為雜食性，通過對八哥食物得研究發現植物性食物和動物性食物基本各佔50%的比例。
- 鳴聲 八哥生活在草原和山區的樹林中，善於鳴叫，也會模仿其他鳥的叫聲，經過訓練，還能模仿人類說話。
- 冷知識 八哥現屬於法國鳥類學家路易·皮埃爾·維埃約於1816年引入的八哥屬（Acridother…
- 出處 zh.wikipedia 八哥 · pageid 65246 ｜ en.wikipedia Crested myna · pageid 1350552 · 分類：eBird/Clements

## 2. 版面契約（dims）

AvianDex bird encyclopedia card, portrait 3:4: (1) dark green header band across the top — large Traditional Chinese name on the left, italic scientific name beneath it, a white pill with the English name on the right, and a round IUCN badge at the far right; (2) one large rounded-corner portrait window occupying more than half of the card height, holding a single photorealistic bird, complete body, head clear, natural pose; (3) on the left edge of the portrait, a small vertical stack of 2–3 dark green habitat chips with white pictograms; (4) below the portrait, three game-style stat bars — gold fill on a cream track, a dark green rounded label on the left, the number on the right; (5) below that, a single row of four small white plaques, each with a slim dark green label and one sentence; (6) a slim dark green footer strip: NO. number on the left, Chinese name (scientific name) centred, version on the right

## 3. 需要改的地方

- `卡牌生成器V17.html` 的卡種清單加一項 `aviandex`（標籤：鳥類圖鑑卡）
- 殼的欄位只需要一個：`printed_text`（多行文字）＋ `pose` 選項
- 倉的 `buildCardData` 貼上 `buildCardData.aviandex.js`
- 倉的 `VAULT.sys.meta` / `VAULT.sys.texts` / `VAULT.def` 各加一個 `aviandex` 鍵
