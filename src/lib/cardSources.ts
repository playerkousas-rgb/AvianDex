/**
 * 科學研究中心六格的「分工」與網址規則。
 *
 * 這裡是唯一一處定義六格的地方 —— 之前六格散落在 JSX 裡，改一格就漏一格。
 * 六格＝六種找資料的方法，唔可以為版面而刪：
 *
 *   1 wiki   深度百科    文字資料        All About Birds（Cornell）
 *   2 radar  觀察雷達    出現紀錄        eBird 物種頁（香港）
 *   3 photo  視覺圖庫    相片            Macaulay Library（Cornell）
 *   4 video  影片中心    動態行為        YouTube
 *   5 audio  鳴聲資料    鳥聲            Xeno-canto
 *   6 gear   辨識裝備    工具            Merlin Bird ID
 *
 * 每個 url() 都只接受「英文俗名」或「eBird speciesCode」——
 * 用中文名搜 Cornell／Xeno-canto 一定查無此鳥，這正是舊版「撳完冇嘢睇」的原因。
 */

export type CardSourceKey = 'wiki' | 'radar' | 'photo' | 'video' | 'audio' | 'gear';

/**
 * 六格的插圖（public/images/hub_*.jpg）。
 *
 * 這六張圖一直都在 repo 裡，但之前只做過一次九宮格之後就再沒有被引用，
 * 於是「科學研究中心」變成一列純文字連結 —— 用戶的原話是「一堆字，冇人睇」。
 * 圖本身已經畫好（全部同一套 HUD 介面風格），所以直接接回去，不要另製新圖。
 *
 * gear（Merlin）沒有專屬圖，用 hub_download 的剪影辨識 HUD，
 * 因為那一格講的正是「影相即時辨識」，畫面內容比類別名更準。
 */
export const SOURCE_IMAGES: Record<CardSourceKey, string> = {
  wiki: '/images/hub_wiki.jpg',
  radar: '/images/hub_radar.jpg',
  photo: '/images/hub_photo.jpg',
  video: '/images/hub_video.jpg',
  audio: '/images/hub_audio.jpg',
  gear: '/images/hub_download.jpg',
};

export interface CardSource {
  key: CardSourceKey;
  /** 中文標題（繁中 zh-HK） */
  zh: string;
  /** 英文標題 */
  en: string;
  /** 中文一句話：這一格負責找什麼 */
  zhNote: string;
  enNote: string;
  /** 顯示用網域 */
  host: string;
  /** 由英文俗名 + eBird 代碼組成網址 */
  url: (query: string, speciesCode?: string) => string;
}

const enc = (s: string) => encodeURIComponent(s.trim());
const slug = (s: string) => s.trim().replace(/\s+/g, '_');

export const CARD_SOURCES: CardSource[] = [
  {
    key: 'wiki',
    zh: '深度百科',
    en: 'Deep reference',
    zhNote: '文字資料：外形、習性、保育',
    enNote: 'Text: appearance, habits, conservation',
    host: 'allaboutbirds.org',
    url: (q) => `https://www.allaboutbirds.org/guide/${enc(slug(q))}`,
  },
  {
    key: 'radar',
    zh: '觀察雷達',
    en: 'Sightings radar',
    zhNote: '出現紀錄：香港幾時、邊度見到',
    enNote: 'Records: where & when it is seen',
    host: 'ebird.org',
    url: (q, code) =>
      code
        ? `https://ebird.org/species/${enc(code)}?siteLanguage=zh`
        : `https://ebird.org/region/HK?siteLanguage=zh&q=${enc(q)}`,
  },
  {
    key: 'photo',
    zh: '視覺圖庫',
    en: 'Photo library',
    zhNote: '相片：各角度、各羽色',
    enNote: 'Photos: angles and plumages',
    host: 'macaulaylibrary.org',
    url: (q, code) =>
      code
        ? `https://search.macaulaylibrary.org/catalog?taxonCode=${enc(code)}`
        : `https://search.macaulaylibrary.org/catalog?q=${enc(q)}`,
  },
  {
    key: 'video',
    zh: '影片中心',
    en: 'Video centre',
    zhNote: '動態行為：飛、食、求偶',
    enNote: 'Motion: flight, feeding, display',
    host: 'youtube.com',
    url: (q) => `https://www.youtube.com/results?search_query=${enc(`${q} bird`)}`,
  },
  {
    key: 'audio',
    zh: '鳴聲資料',
    en: 'Sound library',
    zhNote: '鳥聲：鳴唱、叫聲',
    enNote: 'Sound: song and calls',
    host: 'xeno-canto.org',
    url: (q) => `https://xeno-canto.org/explore?query=${enc(q)}`,
  },
  {
    key: 'gear',
    zh: '辨識裝備',
    en: 'ID toolkit',
    zhNote: '工具：影相即時辨識',
    enNote: 'Tool: identify from a photo',
    host: 'merlin.allaboutbirds.org',
    url: () => 'https://merlin.allaboutbirds.org/',
  },
];
