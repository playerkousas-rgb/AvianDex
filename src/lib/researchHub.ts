/**
 * 「科學研究中心」六格的分工與網址。
 *
 * 每一格負責一種找資料的方式，不是六個隨便的連結：
 *   1 深度百科 → 文字（All About Birds / Cornell）
 *   2 觀察雷達 → 出現紀錄（eBird 物種頁／香港熱點）
 *   3 視覺圖庫 → 相片（Macaulay Library / Cornell）
 *   4 影片中心 → 動態行為（YouTube）
 *   5 鳴聲資料 → 聲音（Xeno-canto）
 *   6 辨識裝備 → 工具（Merlin Bird ID）
 *
 * 六格全部保留：刪一格＝少一種找資料的門。
 * URL 一律用 eBird speciesCode（最準）或英文俗名組成，避免「撳完查無此鳥」。
 */
import {
  BookOpen, MapPin, Camera, PlayCircle, Volume2, Download,
} from 'lucide-react';
import type { Lang } from './explorer';

export interface HubLink {
  key: 'wiki' | 'radar' | 'photo' | 'video' | 'audio' | 'gear';
  title: string;
  subtitle: string;
  url: string;
  image: string;
  accent: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const enc = (s: string) => encodeURIComponent(s);

export function buildHubLinks(sciQuery: string, speciesCode: string | undefined, lang: Lang): HubLink[] {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const q = sciQuery.trim();
  const slug = q.replace(/\s+/g, '_');
  const code = (speciesCode || '').trim();

  return [
    {
      key: 'wiki',
      title: t('深度百科', 'Deep Reference'),
      subtitle: t('文字資料 · Cornell', 'Text · Cornell'),
      url: `https://www.allaboutbirds.org/guide/${enc(slug)}`,
      image: '/images/hub_wiki.jpg',
      accent: 'from-sky-900/70',
      Icon: BookOpen,
    },
    {
      key: 'radar',
      title: t('觀察雷達', 'Sightings Radar'),
      subtitle: t('出現紀錄 · eBird', 'Records · eBird'),
      url: code
        ? `https://ebird.org/species/${enc(code)}?siteLanguage=zh`
        : 'https://ebird.org/region/HK?siteLanguage=zh',
      image: '/images/hub_radar.jpg',
      accent: 'from-emerald-900/70',
      Icon: MapPin,
    },
    {
      key: 'photo',
      title: t('視覺圖庫', 'Photo Library'),
      subtitle: t('相片 · Macaulay Library', 'Photos · Macaulay'),
      url: code
        ? `https://search.macaulaylibrary.org/catalog?taxonCode=${enc(code)}`
        : `https://search.macaulaylibrary.org/catalog?q=${enc(q)}`,
      image: '/images/hub_photo.jpg',
      accent: 'from-violet-900/70',
      Icon: Camera,
    },
    {
      key: 'video',
      title: t('影片中心', 'Video Centre'),
      subtitle: t('動態行為 · YouTube', 'Motion · YouTube'),
      url: `https://www.youtube.com/results?search_query=${enc(q)}+bird`,
      image: '/images/hub_video.jpg',
      accent: 'from-rose-900/70',
      Icon: PlayCircle,
    },
    {
      key: 'audio',
      title: t('鳴聲資料', 'Sound Library'),
      subtitle: t('鳥聲 · Xeno-canto', 'Audio · Xeno-canto'),
      url: `https://xeno-canto.org/explore?query=${enc(q)}`,
      image: '/images/hub_audio.jpg',
      accent: 'from-amber-900/70',
      Icon: Volume2,
    },
    {
      key: 'gear',
      title: t('辨識裝備', 'ID Toolkit'),
      subtitle: t('工具 · Merlin Bird ID', 'Tool · Merlin'),
      url: 'https://merlin.allaboutbirds.org/',
      image: '/images/hub_download.jpg',
      accent: 'from-slate-800/70',
      Icon: Download,
    },
  ];
}
