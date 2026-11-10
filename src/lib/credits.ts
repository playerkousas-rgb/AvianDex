/**
 * AvianDex — 資料來源與鳴謝（唯一來源）
 * ------------------------------------------------------------
 * 為什麼要集中一份？
 *   這一版開始，卡面上的**名稱**與**內文**刻意來自不同地方：
 *
 *     名稱  → 香港觀鳥會《香港鳥類名錄》的慣用寫法（你跟本地鳥友、對本地書要用）
 *     內文  → 台灣野鳥學會《臺灣鳥類名錄》的中文名與分類，加上維基百科原文
 *
 *   兩邊都是有編者、有版本、要人落手落腳做的出版物，用了就要講，
 *   而且要講得清楚「用了哪一部分」，不可以含糊寫一句「資料來源：網絡」。
 *
 *   另外，香港觀鳥會的版權聲明是「保留一切權利，未經書面授權不得複製」，
 *   所以他們的**名錄內文我們一律不用**，只人手核對名稱。這一點要老實寫出來，
 *   否則用戶會以為我們有授權，出事的是用戶。
 *
 * 一處改，全部介面（詳細資料頁／科學研究中心／離線包）都跟著改。
 */

export interface Credit {
  /** 提供者（機構全名） */
  zh: string;
  en: string;
  /** 我們用了它的哪一部分 */
  usedZh: string;
  usedEn: string;
  /** 授權／使用條件（老實寫，包括「不用」的部分） */
  termsZh: string;
  termsEn: string;
  url: string;
}

/** 文字內容的來源（逐句可回查 pageid） */
export const TEXT_CREDIT: Credit = {
  zh: '維基百科（中文／英文條目原文）',
  en: 'Wikipedia (Chinese / English articles, verbatim)',
  usedZh: '內文句子：只取原文整句，不改寫、不機翻；每張卡記錄 pageid 可回查',
  usedEn: 'Body sentences: whole original sentences only, no rewriting, no machine translation; pageid logged per card',
  termsZh: 'CC BY-SA 4.0。轉載時須保留署名與相同方式分享',
  termsEn: 'CC BY-SA 4.0. Attribution and share-alike required on reuse',
  url: 'https://zh.wikipedia.org',
};

/** 名稱來源：香港（只在「名稱」這一層用） */
export const NAME_HK_CREDIT: Credit = {
  zh: '香港觀鳥會《香港鳥類名錄》',
  en: 'Hong Kong Bird Watching Society — HK List',
  usedZh: '只用來核對並採用**卡面名稱**的香港慣用寫法；內文一概不用',
  usedEn: 'Used ONLY to check and adopt Hong Kong common names on cards; no body text used',
  termsZh: '版權保留（未經書面授權不得複製）。所以只作人手核對名稱，不轉載其文字、表格或數據',
  termsEn: 'All rights reserved. Names checked by hand only; no text, tables or data reproduced',
  url: 'https://hkbws.org.hk/avifauna/hk-list',
};

/** 名稱＋分類來源：台灣（內文的中文名與分類用這邊） */
export const NAME_TW_CREDIT: Credit = {
  zh: '社團法人中華民國野鳥學會《臺灣鳥類名錄》',
  en: 'Chinese Wild Bird Federation — Checklist of the Birds of Taiwan',
  usedZh: '中文名、科名、遷徙屬性、保育等級（事實欄位）；台灣叫法同時作為搜尋別名',
  usedEn: 'Chinese names, family, migratory status, conservation category (factual fields); Taiwanese names also as search aliases',
  termsZh: '只取事實欄位，不轉載名錄的解說文字、圖表',
  termsEn: 'Factual fields only; no narrative text or figures reproduced',
  url: 'https://www.bird.org.tw/download/5698',
};

/** 分類架構 */
export const TAXONOMY_CREDIT: Credit = {
  zh: 'eBird／Clements 世界鳥類名錄',
  en: 'eBird / Clements Checklist of Birds of the World',
  usedZh: '目、科、學名、英文俗名、eBird 物種代碼',
  usedEn: 'Order, family, scientific name, English name, eBird species code',
  termsZh: 'Cornell Lab of Ornithology 維護',
  termsEn: 'Maintained by the Cornell Lab of Ornithology',
  url: 'https://www.birds.cornell.edu/clementschecklist/',
};

/** 量度數據 */
export const MEASURE_CREDIT: Credit = {
  zh: 'AVONET（Tobias et al. 2022）',
  en: 'AVONET (Tobias et al. 2022)',
  usedZh: '翼長、喙長、跗蹠、體重（原始單位 mm／g，不換算）',
  usedEn: 'Wing, bill, tarsus, mass (raw mm / g, not converted)',
  termsZh: '開放資料，引用時註明出處',
  termsEn: 'Open data; cite the source',
  url: 'https://onlinelibrary.wiley.com/doi/10.1111/ele.13898',
};

/** 相片／聲音／影片（研究中心的六格是外連，不在本站寄存） */
export const MEDIA_CREDIT: Credit = {
  zh: 'Cornell Lab（eBird／Macaulay Library）、Xeno-canto',
  en: 'Cornell Lab (eBird / Macaulay Library), Xeno-canto',
  usedZh: '不寄存，只提供外連；各筆紀錄的授權以原網站為準',
  usedEn: 'Not hosted here — links only; each record’s licence is per the source site',
  termsZh: 'CC 授權各異，轉載請回原網站核對錄音者／攝影者',
  termsEn: 'Licences vary; check the recordist / photographer on the source site before reuse',
  url: 'https://search.macaulaylibrary.org',
};

/** 卡面要顯示哪些（順序＝顯示順序） */
export const CARD_CREDITS: Credit[] = [
  TEXT_CREDIT,
  NAME_HK_CREDIT,
  NAME_TW_CREDIT,
  TAXONOMY_CREDIT,
  MEASURE_CREDIT,
];

/** 一行式摘要（卡面頁腳用，空間有限；詳細版在「來源與鳴謝」頁） */
export const CREDIT_LINE_ZH =
  '名稱：香港觀鳥會名錄（只核對名稱）＋臺灣鳥類名錄（別名）· 內文：維基百科原文 · 分類：eBird/Clements';
export const CREDIT_LINE_EN =
  'Names: HKBWS list (names only) + Taiwan checklist (aliases) · Text: Wikipedia verbatim · Taxonomy: eBird/Clements';
