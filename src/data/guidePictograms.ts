import type { GuidePictogramId } from '../components/GuidePictogram';

/**
 * 觀鳥禮儀 / 觀鳥裝備：每一節配哪些圖示。
 *
 * 為甚麼放在 data 而不是 component？
 *   因為它不是畫面邏輯，是「這一節講咩」的對照表；
 *   而且 React Fast Refresh 只容許 .tsx 檔匯出 component，
 *   常數留在 component 檔會令熱更新失效（lint 亦會報）。
 *
 * 圖示 id 對應 components/GuidePictogram.tsx 內的 SVG。
 */
export const SECTION_PICTOGRAMS: Record<string, GuidePictogramId[]> = {
  /* 觀鳥禮儀（src/data/fieldGuide.ts 的 section id） */
  distance: ['distance', 'binoculars'],
  sound: ['sound'],
  feeding: ['feeding'],
  nest: ['nest'],
  share: ['share'],
  law: ['law'],

  /* 觀鳥裝備 */
  essential: ['binoculars', 'water', 'sun'],
  field: ['scope', 'recorder', 'camera', 'notebook'],
  wet: ['shoes', 'rain'],
  wear: ['hat', 'shoes', 'pack', 'sun'],
  care: ['care', 'rain'],
};
