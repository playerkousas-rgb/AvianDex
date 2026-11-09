/**
 * AvianDex — 觀鳥禮儀（Birding Etiquette）與觀鳥裝備（Birding Gear）
 * ------------------------------------------------------------
 * 這兩頁是「通用知識」，不是某一隻雀的資料，所以放在這裡一次寫好，
 * 中英各一版；不要在 559 張卡上重複 559 次。
 *
 * 寫作規則（與 cardCopy 一致）：
 *   · 中文一律香港繁體（zh-HK），不准簡體、不准機翻式英文語序
 *   · 英文版獨立撰寫，不是逐字直譯
 *   · 只寫可以查證、可以照做的事；有爭議的說清楚「視乎場地規定」
 */
import type { Lang } from '../lib/explorer';

export interface GuideItem {
  title: string;
  body: string;
}

export interface GuideSection {
  id: string;
  title: string;
  lead: string;
  items: GuideItem[];
}

export interface Guide {
  title: string;
  subtitle: string;
  sections: GuideSection[];
  links: { label: string; url: string; note: string }[];
}

const ETIQUETTE: Record<Lang, Guide> = {
  zh: {
    title: '觀鳥禮儀',
    subtitle: '不騷擾、不餵食、不播放叫聲引誘 —— 雀仔的安全永遠排第一',
    sections: [
      {
        id: 'distance',
        title: '一、保持距離',
        lead: '用望遠鏡，不要用腳步。',
        items: [
          { title: '唔好為咗影相而逼近', body: '雀鳥有「驚飛距離」，一逼近就飛走、放棄覓食，繁殖期更可能棄巢。遠遠睇、慢慢等，永遠比追住跑睇得多。' },
          { title: '繞路而唔係開路', body: '遇到巢、幼鳥、水鳥群，請繞路走，唔好為咗取景踩入草叢或蘆葦。' },
          { title: '唔好圍堵', body: '一大班人扇形包圍一隻雀，等於斷牠退路。人多時請輪流看，看完退後再讓下一位。' },
        ],
      },
      {
        id: 'sound',
        title: '二、聲音引誘（playback）',
        lead: '香港大部分公園、郊野公園都唔適宜；繁殖期一律避免。',
        items: [
          { title: '為什麼有問題', body: '播放領域叫聲會令雀鳥以為有入侵者，浪費體力驅趕，甚至放棄巢。稀有過境鳥被反覆播放，後果更明顯。' },
          { title: '如果場地允許', body: '先用肉眼／望遠鏡觀察，長時間冇反應才極短暫播放（少於 30 秒），見到雀鳥緊張、靠近或鳴叫回應就立即停。' },
          { title: '禁止的地方不要試', body: '私人地方、保護區、繁殖島嶼、有明確告示的場地，一律不播放。' },
        ],
      },
      {
        id: 'feeding',
        title: '三、不餵食、不誘拍',
        lead: '麵包、白飯、花生都會害死雀。',
        items: [
          { title: '唔好餵', body: '餵食會改變雀鳥行為、傳播疾病、引來老鼠，也會令牠們依賴人類；麵包對水鳥而言更是「空熱量」，會造成營養不良。' },
          { title: '誘拍（baiting）', body: '用蟲、鼠、魚引猛禽或翠鳥，會令牠們改變遷徙時間與覓食習慣，亦容易發生意外；本圖鑑不鼓勵。' },
          { title: '寵物與垃圾', body: '帶狗請牽繩並遠離水鳥；自己的垃圾（尤其是食物包裝、魚絲）一定要帶走。' },
        ],
      },
      {
        id: 'nest',
        title: '四、巢、蛋、幼鳥',
        lead: '見到就當作冇見到。',
        items: [
          { title: '唔好公開巢位', body: '在社交媒體公開準確巢位（尤其猛禽、貓頭鷹、鷺鳥繁殖群）會引來大量拍攝者，後果可以令整巢失敗。' },
          { title: '唔好清理現場', body: '不要為咗「影得清」而剪樹枝、除草、搬石。這些都是雀鳥選擇該處的原因。' },
          { title: '跌落地的幼鳥', body: '大部分學飛幼鳥有親鳥在附近照顧。除非有即時危險（車、貓狗），否則唔好撿走；需要救助請聯絡愛護動物協會或漁護署。' },
        ],
      },
      {
        id: 'share',
        title: '五、記錄與分享',
        lead: '準確比稀有更重要。',
        items: [
          { title: '只在安全的地方分享', body: 'eBird／iNaturalist 可以模糊化敏感物種位置；貼相前想一想會不會有人跟住去追。' },
          { title: '唔好誇大', body: '唔確定就寫「疑似」；用聲音辨認而又冇錄音，就寫「聽聲」。錯誤記錄會影響保護政策。' },
          { title: '尊重當地人與農地', body: '經過村落、魚塘、田地，唔好阻路、唔好大聲、唔好亂泊車。' },
        ],
      },
      {
        id: 'law',
        title: '六、法例與安全',
        lead: '香港《野生動物保護條例》保護所有野生鳥類及其巢與蛋。',
        items: [
          { title: '唔好採蛋、捉雀、養野生雀', body: '捕捉、傷害、管有野生鳥類或其巢蛋，均可能違法。' },
          { title: '保護區規定優先', body: '米埔及內后海灣拉姆薩爾濕地等地方有入場與行為限制，以現場告示及漁護署許可為準。' },
          { title: '自身安全', body: '水邊、石灘、斜坡要格外小心；天光前後獨行請通知家人。' },
        ],
      },
    ],
    links: [
      { label: '香港觀鳥會 · 觀鳥守則', url: 'https://www.hkbws.org.hk/', note: '本地守則與活動資訊' },
      { label: '漁農自然護理署 · 野生動物', url: 'https://www.afcd.gov.hk/tc_chi/conservation/con_fau/con_fau_wild/con_fau_wild.html', note: '法例與受傷野生動物處理' },
      { label: 'eBird · 敏感物種政策', url: 'https://support.ebird.org/en/support/solutions/articles/48001078168', note: '位置模糊化設定' },
    ],
  },
  en: {
    title: 'Birding Etiquette',
    subtitle: 'Never disturb, never feed, never bait with playback — the bird comes first',
    sections: [
      {
        id: 'distance',
        title: '1. Keep your distance',
        lead: 'Use binoculars, not your feet.',
        items: [
          { title: 'Do not crowd a bird for a photo', body: 'Every bird has a flight distance. Push past it and the bird stops feeding or abandons a nest. Stand still and let it come to you.' },
          { title: 'Walk around, not through', body: 'Give nests, chicks and roosting waterbirds a wide berth instead of stepping into reeds or undergrowth for a better angle.' },
          { title: 'No encircling', body: 'A ring of people cuts off escape routes. Take turns, then step back so the next person can look.' },
        ],
      },
      {
        id: 'sound',
        title: '2. Playback',
        lead: 'Avoid it in Hong Kong parks and country parks; never during the breeding season.',
        items: [
          { title: 'Why it matters', body: 'A territorial call makes a bird think a rival has moved in. It burns energy defending and may desert a nest. Repeated playback on a rarity is worse.' },
          { title: 'If the site allows it', body: 'Watch with optics first. Only if there is no response for a long time use a very short burst (under 30 seconds), and stop the moment the bird approaches or answers.' },
          { title: 'Never where it is banned', body: 'Private land, reserves, breeding islands and anywhere with a notice prohibiting it.' },
        ],
      },
      {
        id: 'feeding',
        title: '3. No feeding, no baiting',
        lead: 'Bread and rice can kill waterbirds.',
        items: [
          { title: 'Do not feed', body: 'Feeding spreads disease, attracts rodents and makes birds dependent. Bread is empty calories for waterfowl and causes malnutrition.' },
          { title: 'Baiting', body: 'Using mealworms, rodents or fish for raptors and kingfishers alters migration timing and feeding habits, and leads to accidents. This guide does not encourage it.' },
          { title: 'Dogs and litter', body: 'Keep dogs on a lead away from waterbirds. Take all litter home, especially food wrap and fishing line.' },
        ],
      },
      {
        id: 'nest',
        title: '4. Nests, eggs and chicks',
        lead: 'See nothing, say nothing.',
        items: [
          { title: 'Never post an exact nest location', body: 'Publishing coordinates of raptor, owl or heronry nests can bring a crowd and fail the whole nest.' },
          { title: 'Do not “tidy” the site', body: 'No cutting branches, weeding or moving stones to get a clear shot — those are the reasons the bird chose the spot.' },
          { title: 'Fledglings on the ground', body: 'Most are still fed by their parents nearby. Unless there is immediate danger, leave them; for injured birds contact the SPCA or AFCD.' },
        ],
      },
      {
        id: 'share',
        title: '5. Recording and sharing',
        lead: 'Accuracy matters more than rarity.',
        items: [
          { title: 'Share carefully', body: 'eBird and iNaturalist can obscure sensitive locations. Think before posting — will someone go and chase it?' },
          { title: 'Do not overclaim', body: 'Write “probable” when unsure, and “heard only” if there is no recording. Bad records distort conservation decisions.' },
          { title: 'Respect local people and farmland', body: 'Do not block paths, shout, or park badly near villages, fish ponds and fields.' },
        ],
      },
      {
        id: 'law',
        title: '6. Law and safety',
        lead: 'In Hong Kong the Wild Animals Protection Ordinance protects all wild birds, their nests and eggs.',
        items: [
          { title: 'No taking', body: 'Catching, injuring or keeping wild birds, their nests or eggs may be an offence.' },
          { title: 'Site rules come first', body: 'Mai Po and the Inner Deep Bay Ramsar Site have entry and conduct rules; follow signage and AFCD permits.' },
          { title: 'Look after yourself', body: 'Take care on shoreline rocks and slopes, and tell someone if you are out alone before dawn or after dusk.' },
        ],
      },
    ],
    links: [
      { label: 'Hong Kong Bird Watching Society', url: 'https://www.hkbws.org.hk/', note: 'Local code of conduct and outings' },
      { label: 'AFCD · Wild animals', url: 'https://www.afcd.gov.hk/english/conservation/con_fau/con_fau_wild/con_fau_wild.html', note: 'Legislation and injured wildlife' },
      { label: 'eBird · Sensitive species', url: 'https://support.ebird.org/en/support/solutions/articles/48001078168', note: 'Location obscuring' },
    ],
  },
};

const GEAR: Record<Lang, Guide> = {
  zh: {
    title: '觀鳥裝備',
    subtitle: '由「一部手機」到「一支單筒」，按你需要加，不必一次買齊',
    sections: [
      {
        id: 'essential',
        title: '一、最基本（必備）',
        lead: '沒有這些，其實都可以觀鳥，只是看少很多。',
        items: [
          { title: '望遠鏡（雙筒）8×42 或 10×42', body: '8 倍視野闊、易找目標，適合林鳥；10 倍細節多但較易手震。42mm 物鏡在黃昏仍夠光。平價先買 8×42，用得順再升級。' },
          { title: '手機＋圖鑑 App', body: '本圖鑑可以離線看；配合 eBird App 記錄，Merlin 可作輔助辨識（但別完全信 AI，尤其雌鳥與亞成鳥）。' },
          { title: '水與防曬', body: '香港夏天濕熱，1 公升水是基本；帽子、太陽油、驅蚊用品同樣重要。' },
        ],
      },
      {
        id: 'field',
        title: '二、實戰加分',
        lead: '當你開始「想認得準」，就會想要這幾樣。',
        items: [
          { title: '單筒望遠鏡＋三腳架', body: '看水鳥、猛禽、遠處灘塗的必要裝備；20–60 倍變焦最常見。風大時三腳架比手持更重要。' },
          { title: '錄音（手機或指向性麥克風）', body: '「聽聲辨認」沒有錄音等於無法覆核；Xeno-canto 與 eBird 都接受錄音記錄。' },
          { title: '相機（如有）', body: '不用貴：長焦橋機（bridge camera）已足夠記錄；重點是拍到「可辨認的特徵」，不是拍到漂亮。' },
          { title: '筆記本／App 記錄', body: '即場記下：日期、時間、天氣、地點、數量、行為。記憶比你想像中不可靠。' },
        ],
      },
      {
        id: 'wet',
        title: '三、香港常見環境對應',
        lead: '同一個背包，去米埔與去大帽山要裝不同東西。',
        items: [
          { title: '濕地、魚塘、泥灘', body: '防水鞋或水鞋、防蚊、防曬；望遠鏡加單筒；留意潮汐時間（漲潮前後最好） 。' },
          { title: '林鳥、山徑', body: '輕便背包、行山鞋、雨具；8×42 望遠鏡；林下光線暗，慢慢行、多聽聲音。' },
          { title: '夜觀（貓頭鷹、夜鷹）', body: '紅光頭燈（減低對雀鳥影響）、長袖長褲、驅蚊；盡量不播放叫聲。' },
        ],
      },
      {
        id: 'wear',
        title: '四、衣著與鞋（香港實戰）',
        lead: '觀鳥不需要迷彩，但顏色與鞋底會直接影響你看到多少。',
        items: [
          { title: '顏色：大地色、不要螢光', body: '綠、卡其、灰、深藍最實用；螢光黃、純白、大紅在林地反光，遠處雀鳥較易警覺。不需要買迷彩，普通素色長袖已經夠。' },
          { title: '長袖長褲（防蚊＋防刮）', body: '香港郊野有蚊子、蜱蟲與有刺植物；薄身快乾長袖＋長褲比短褲實用，夏天也建議這樣穿。' },
          { title: '帽：寬邊遮陽帽', body: '遮太陽亦可以遮住你抬頭時的面部動作；深色帽檐比白色更不反光。冬天加一頂薄冷帽，清晨山上差幾度。' },
          { title: '鞋：防水行山鞋或水鞋', body: '泥灘、魚塘邊要水鞋或防水行山鞋；林道要抓地力好的鞋底。拖鞋、涼鞋在濕滑石面非常危險。' },
          { title: '雨具：輕便雨衣優於雨傘', body: '雨傘要一隻手，等於廢掉一半裝備；輕便雨衣可以同時拿望遠鏡。背囊加防水套。' },
          { title: '背囊：貼身、雙肩、有腰帶', body: '單肩袋行山會勞損；雙肩背囊加腰帶可以長時間背單筒。相機與望遠鏡用快拆帶，不要長時間掛頸。' },
          { title: '防曬與驅蚊', body: 'SPF50 防曬、含 DEET 或派卡瑞丁（Picaridin）的驅蚊劑；先塗防曬，後塗驅蚊。' },
        ],
      },
      {
        id: 'care',
        title: '五、保養與安全',
        lead: '裝備壞在現場，比沒帶更煩。',
        items: [
          { title: '望遠鏡保養', body: '用吹球除塵，再用鏡頭布由中心向外抹；不要用衣服。潮濕天氣後放防潮箱或加防潮珠。' },
          { title: '防雨', body: '相機與望遠鏡怕水；下小雨可用防水套，大雨就收工。鹽水環境之後要用微濕布抹外殼。' },
          { title: '行李與安全', body: '背囊貼身、雙手可空出來；水邊石頭濕滑，貴重器材不要單手拎住跳石。' },
        ],
      },
    ],
    links: [
      { label: 'eBird 使用說明', url: 'https://ebird.org/about', note: '記錄與熱點' },
      { label: 'Merlin Bird ID', url: 'https://merlin.allaboutbirds.org/', note: '輔助辨識（不是最終判斷）' },
      { label: 'Xeno-canto', url: 'https://xeno-canto.org/', note: '鳥聲資料庫' },
    ],
  },
  en: {
    title: 'Birding Gear',
    subtitle: 'From “just a phone” to “a scope” — add what you need, not everything at once',
    sections: [
      {
        id: 'essential',
        title: '1. The basics',
        lead: 'You can watch birds without these, but you will see far less.',
        items: [
          { title: '8×42 or 10×42 binoculars', body: '8× gives a wider field of view and is easier for finding woodland birds; 10× shows more detail but shakes more. A 42 mm objective still works at dusk. Start with 8×42.' },
          { title: 'Phone and a field guide app', body: 'This guide works offline. Pair it with the eBird app for recording; Merlin helps with ID, but never trust AI blindly — females and immatures are its weak spot.' },
          { title: 'Water and sun protection', body: 'Hong Kong summers are brutal: a litre of water, a hat, sunscreen and mosquito repellent are not optional.' },
        ],
      },
      {
        id: 'field',
        title: '2. The next step',
        lead: 'What you want once you start wanting to identify things properly.',
        items: [
          { title: 'Spotting scope and tripod', body: 'Essential for waterbirds, raptors and distant mudflats; 20–60× zooms are the norm. In wind, the tripod matters more than the glass.' },
          { title: 'A recorder', body: '“Heard only” without a recording cannot be verified. Both eBird and Xeno-canto accept audio records.' },
          { title: 'A camera, if you like', body: 'It does not need to be expensive — a bridge camera is enough. The point is a diagnosable feature, not a beautiful shot.' },
          { title: 'A notebook or app', body: 'Note date, time, weather, site, count and behaviour on the spot. Memory is less reliable than you think.' },
        ],
      },
      {
        id: 'wet',
        title: '3. Matching Hong Kong habitats',
        lead: 'Same backpack, very different contents for Mai Po and Tai Mo Shan.',
        items: [
          { title: 'Wetland, fish ponds, mudflats', body: 'Waterproof shoes or wellingtons, repellent, sun hat, binoculars plus a scope; check the tide — the hours around high tide are best.' },
          { title: 'Woodland and trails', body: 'Light pack, walking shoes, rain shell, 8×42 binoculars. Understorey light is dim: walk slowly and listen more than you look.' },
          { title: 'Night birds (owls, nightjars)', body: 'Red-light headtorch, long sleeves, repellent — and no playback if you can avoid it.' },
        ],
      },
      {
        id: 'wear',
        title: '4. Clothing and footwear (Hong Kong reality)',
        lead: 'You do not need camouflage, but colour and soles decide how much you see.',
        items: [
          { title: 'Colour: earth tones, no neon', body: 'Olive, khaki, grey and navy work best. Neon yellow, pure white and bright red flare in woodland and spook birds at distance. Camouflage is unnecessary — plain long sleeves are enough.' },
          { title: 'Long sleeves and trousers', body: 'Mosquitoes, ticks and thorns are real here. Thin quick-dry long sleeves beat shorts, even in summer.' },
          { title: 'A wide-brim hat', body: 'Shades your eyes and hides the head-tilt that gives you away. A dark brim reflects less than white. Add a thin beanie for cold dawns on the hills.' },
          { title: 'Waterproof walking shoes or wellingtons', body: 'Wellingtons for mudflats and fish-pond bunds; grippy soles for trails. Flip-flops on wet rocks are how people get hurt.' },
          { title: 'A light rain jacket beats an umbrella', body: 'An umbrella costs you a hand, which costs you half your optics. A jacket keeps both hands free; add a pack cover.' },
          { title: 'A two-shoulder pack with a hip belt', body: 'Single-shoulder bags wreck your back on long walks. A hip belt carries a scope properly. Use a quick-release strap rather than hanging binoculars on your neck all day.' },
          { title: 'Sun and mosquitoes', body: 'SPF50 sunscreen and a DEET or Picaridin repellent. Sunscreen first, repellent second.' },
        ],
      },
      {
        id: 'care',
        title: '5. Care and safety',
        lead: 'Gear that fails in the field is worse than gear you left at home.',
        items: [
          { title: 'Binocular care', body: 'Blow off dust first, then wipe from the centre outwards with a lens cloth — never your shirt. Store with desiccant in humid weather.' },
          { title: 'Rain and salt', body: 'Use a rain cover in drizzle; stop in heavy rain. After a coastal day, wipe the body with a damp cloth.' },
          { title: 'Carrying and footing', body: 'Wear the pack close and keep your hands free. Wet rocks are slippery — never hop between them one-handed with a scope.' },
        ],
      },
    ],
    links: [
      { label: 'eBird', url: 'https://ebird.org/about', note: 'Recording and hotspots' },
      { label: 'Merlin Bird ID', url: 'https://merlin.allaboutbirds.org/', note: 'ID assistance, not a verdict' },
      { label: 'Xeno-canto', url: 'https://xeno-canto.org/', note: 'Sound library' },
    ],
  },
};

export const guideFor = (kind: 'etiquette' | 'gear', lang: Lang): Guide =>
  kind === 'etiquette' ? ETIQUETTE[lang] : GEAR[lang];
