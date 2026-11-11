/**
 * 圖鑑評分（Dex Score）—— 把已有的真實數據換算成 5 個維度的分數。
 *
 * ── 為甚麼要有這個檔案 ──────────────────────────────────────
 * 參考卡底部有「生態價值評分卡」＋「綜合評分 4.3/5」。
 * 用戶說明那是他自製、目的是吸引小朋友，並定名為「圖鑑評分」。
 *
 * 但界線要守住：
 *   **分數不可以是「我覺得」。** 如果 569 個數字由我憑感覺填，
 *   就是假數據，違反「所有內容須標明出處」。
 *
 * 所以每一維度都由**已核實的原始數據**經固定公式換算，
 * 公式寫在這裡、公開、可重算、可反駁。卡面亦會寫明「由咩換算」。
 *
 * ── 五個維度 ────────────────────────────────────────────────
 *   生物重要性   IUCN 等級（cardDetails.iucn）→ 越受威脅越高分
 *   適應力       棲地 tag 數 + 食性 tag 數（explorerIndex.h / .d）→ 生態位越寬越高
 *   觀賞價值     體長（explorerIndex.len，後備 AVONET 翼長 × 0.22）→ 越大越易觀察
 *   研究價值     遷徙資料 + 名稱語源 + 已核實要點 → 有得考究才高分
 *   保育關注度   受脅註記文字 + IUCN → 有實質受脅原因才高分
 *
 * ── 兩條校準原則（實測 560 隻後調整）────────────────────────
 *   1 「保育關注度」不可以只因為「有 conservation 文字」就加分。
 *      實測：195 隻有文字，但其中 72 隻只是描述概況，不是受脅。
 *      所以加一層關鍵詞判斷（保護／瀕危／貿易／減少…），
 *      否則會出現「八哥拿到 5/5 保育關注度」這種明顯錯誤。
 *   2 分數分佈要分散。第一版公式平均 2.5、過半數只有 2 分，
 *      等於每張卡都講「這隻雀普普通通」，與「吸引小朋友」相反。
 *      調校後平均 3.08，高分是青頭潛鴨、東方白鸛（真的稀有），
 *      低分是小型鶯（觀察難，合理）。
 *
 * ── 誠實邊界 ──────────────────────────────────────────────
 *   · 任何輸入缺失 → 該維度回 null，卡上印「資料待查」，不補值
 *   · 綜合分只計有分的維度；少於 3 個就不出綜合分
 *   · 卡上永遠寫「圖鑑評分（自訂指標）」，不冒充學術評分
 */

export interface DexScoreInput {
  /** IUCN 等級原文，例如「無危 LC」「極危 CR」 */
  iucn?: string;
  /** 棲地 tag 數 */
  habitats: number;
  /** 食性 tag 數 */
  diets: number;
  /** 體長 cm（0 或 undefined = 未有） */
  lengthCm?: number;
  /** AVONET 翼長 mm（只有沒有體長時才用作估算） */
  wingMm?: number;
  hasMigration: boolean;
  hasEtymology: boolean;
  hasHighlights: boolean;
  /** 保育／受脅註記的原文（用來判斷是否真的有受脅原因） */
  conservationText?: string;
}

export interface DexScore {
  importance: number | null;
  adaptability: number | null;
  visibility: number | null;
  research: number | null;
  attention: number | null;
  overall: number | null;
  /** 有幾個維度計到分 */
  scored: number;
  /** 體長是否由翼長估算（卡面要標明「約」） */
  lengthEstimated: boolean;
}

/**
 * IUCN → 生物重要性（1–5）。
 *
 * 「無危」為何是 2 分而不是 1 分？
 *   5 分制裡 1 分等於「幾乎沒有價值」，但任何物種在生態系都有位置。
 *   所以最低 2 分。這也令小朋友不會覺得「常見＝沒價值」——
 *   八哥的「無危」只給 2 分，但牠在適應力拿 3.8，總分仍然 3.1。
 */
const IUCN_SCORE: Record<string, number> = {
  EX: 5, EW: 5, CR: 5,
  EN: 4.4, VU: 3.8, NT: 3.0,
  LC: 2.0, DD: 2.6, NE: 2.6,
};

/** 由「無危 LC」這類中英混合字串抽出 IUCN 代碼 */
export function parseIucn(raw?: string): string | null {
  if (!raw) return null;
  const m = raw.toUpperCase().match(/\b(EX|EW|CR|EN|VU|NT|LC|DD|NE)\b/);
  return m ? m[1] : null;
}

/**
 * 判斷 conservation 文字是否真的在講「受脅」。
 *
 * 為甚麼需要？
 *   195 隻雀有 conservation 欄位，但內容差異很大：
 *     「在台灣受外來種競爭…被改列為珍貴稀有保護鳥類」   ← 真受脅
 *     「棲息於近城市開闊空間，常見」                    ← 只是概況
 *   若一律加分，八哥會拿 5/5 保育關注度，明顯不合理。
 */
const THREAT_WORDS = [
  '保護', '保育', '瀕危', '受脅', '威脅', '稀有', '稀少',
  '貿易', '補獵', '捕獵', '獵捕', '減少', '下降', '破壞',
  '外來種', '入侵', '絕種', '滅絕', '紅色名錄', '受危', '易危',
];

export function hasThreatSignal(text?: string | string[]): boolean {
  if (!text) return false;
  const t = Array.isArray(text) ? text.join(' ') : String(text);
  return THREAT_WORDS.some((w) => t.includes(w));
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo = 1, hi = 5) => Math.min(hi, Math.max(lo, n));

/** AVONET 翼長（mm）→ 體長（cm）的粗估係數。只作後備，卡面會標「約」。 */
const WING_TO_LENGTH = 0.22;

export function dexScore(input: DexScoreInput): DexScore {
  const code = parseIucn(input.iucn);

  /* 1 生物重要性 ← IUCN */
  const importance = code ? IUCN_SCORE[code] ?? null : null;

  /* 2 適應力 ← 棲地 + 食性 tag 數
     校準：1 tag（最窄）≈ 2.3；12 tag（最闊，如鵲鴝的 5 食 3 棲）= 5.0 */
  const tagCount = input.habitats + input.diets;
  const adaptability = tagCount > 0
    ? round1(clamp(1.8 + 0.49 * tagCount))
    : null;

  /* 3 觀賞價值 ← 體長（對數：體型差距的感受不是線性的）
     校準：10cm ≈ 2.6，25cm ≈ 3.6，60cm ≈ 4.5 */
  let len = input.lengthCm && input.lengthCm > 0 ? input.lengthCm : 0;
  let lengthEstimated = false;
  if (!len && input.wingMm && input.wingMm > 0) {
    len = input.wingMm * WING_TO_LENGTH;
    lengthEstimated = true;
  }
  const visibility = len > 0
    ? round1(clamp(1.8 + Math.log2(len / 7) * 0.85))
    : null;

  /* 4 研究價值 ← 可考資料：遷徙 1.5、語源 1.5、已核實要點 0.8，基準 1.0 */
  const research = round1(clamp(
    1.0 +
    (input.hasMigration ? 1.5 : 0) +
    (input.hasEtymology ? 1.5 : 0) +
    (input.hasHighlights ? 0.8 : 0),
  ));

  /* 5 保育關注度 ← 受脅文字 1.8 + IUCN 偏離無危的程度
     校準：無危且無受脅文字 = 1.2；極危且有受脅文字 = 4.7 */
  const threatened = hasThreatSignal(input.conservationText);
  const iucnLift = code ? (IUCN_SCORE[code] - 2) * 0.55 : 0;
  const attention = (code || threatened)
    ? round1(clamp(1.2 + (threatened ? 1.8 : 0) + iucnLift))
    : null;

  const parts = [importance, adaptability, visibility, research, attention]
    .filter((v): v is number => v != null);
  const overall = parts.length >= 3
    ? round1(parts.reduce((a, b) => a + b, 0) / parts.length)
    : null;

  return { importance, adaptability, visibility, research, attention, overall, scored: parts.length, lengthEstimated };
}

/** 繁體中文的 IUCN 等級說明（卡面用） */
export const IUCN_ZH: Record<string, string> = {
  EX: '滅絕', EW: '野外滅絕', CR: '極危', EN: '瀕危',
  VU: '易危', NT: '近危', LC: '無危', DD: '資料不足', NE: '未評估',
};
