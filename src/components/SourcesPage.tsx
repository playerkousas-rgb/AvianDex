import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck, Info, ChevronDown } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { CARD_CREDITS, MEDIA_CREDIT } from '../lib/credits';

/**
 * 來源與鳴謝（第 3 頁最底）
 *
 * 為什麼要一整塊、而且寫到這麼細？
 *   這一版用了兩個鳥會的名錄，其中香港觀鳥會的版權聲明是「保留一切權利」。
 *   用戶拿着這張卡在外面用，如果以為我們有授權、或者以為資料是我們自己做的，
 *   風險落在用戶身上。所以：
 *
 *     1. 逐項寫清楚「用了它的哪一部分」——不是含糊一句「資料來源」
 *     2. 寫清楚「哪一部分沒有用」——香港名錄的內文我們一律不用
 *     3. 寫清楚授權條件——維基是 CC BY-SA，轉載要署名＋相同方式分享
 *
 *   寧願寫得囉唆，都不要讓用戶誤會。
 */

interface SourcesPageProps {
  lang: Lang;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({ lang }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const all = [...CARD_CREDITS, MEDIA_CREDIT];

  /**
   * 預設收起。
   *
   * 為甚麼？這頁是「有需要查才看」的資訊，不是每隻雀都要讀的東西。
   * 一拉開就六個來源、十幾行授權條文，會把整個詳細資料頁壓到很長 ——
   * 而且用戶（尤其小朋友）根本不會讀完，只是覺得「好多字」。
   * 所以只留一行摘要 + 一個展開掣；要查的人自己開。
   *
   * 但收起不等於隱藏：摘要那行照樣寫明名稱／內文／分類三個出處，
   * 鳴謝的法律意義（署名）仍然在畫面上。
   */
  const [open, setOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-2"
    >
      <div className="bg-[#1b1a17]/85 border border-emerald-500/25 rounded-lg p-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300/80" />
          <h4 className="text-emerald-100 font-black text-[12.5px]">
            {t('資料來源與鳴謝', 'Sources & credits')}
          </h4>
        </div>
        <p className="text-white/50 text-[10.5px] mt-1 leading-relaxed">
          {t(
            '這套卡不是我們自己創作的百科。名稱、內文、分類、量度各有出處，逐項列明如下；看不順眼可以逐條去核。',
            'This deck is not an original encyclopedia. Names, body text, taxonomy and measurements each have their own source, listed below so you can check every item.',
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-white/45 hover:text-white/80 text-[10px] font-bold w-full text-left"
      >
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`} />
        {open
          ? t('收起來源詳情', 'Hide sources')
          : t(`展開來源詳情（${all.length} 個來源）`, `Show sources (${all.length})`)}
      </button>

      {open && (
      <>
      <div className="bg-amber-900/15 border border-amber-500/25 rounded-lg p-2.5">
        <div className="flex items-start gap-1.5">
          <Info className="w-3 h-3 text-amber-300/70 mt-0.5 shrink-0" />
          <p className="text-amber-100/75 text-[10px] leading-relaxed">
            {t(
              '名稱與內文刻意分開：卡面名稱用香港慣用寫法，內文的中文名與分類用臺灣鳥類名錄。香港觀鳥會名錄只作人手核對名稱，其文字與數據一概沒有轉載。',
              'Names and body text deliberately come from different places: card names follow Hong Kong usage, while Chinese names and taxonomy in the body follow the Taiwan checklist. The HKBWS list was used only to check names by hand — none of its text or data is reproduced.',
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {all.map((c) => (
          <div key={c.url + c.zh} className="bg-black/25 border border-white/10 rounded-lg p-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-white/90 font-bold text-[11.5px] leading-tight">
                {lang === 'en' ? c.en : c.zh}
              </span>
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-0.5 text-white/35 hover:text-amber-300 text-[9px] shrink-0"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                {t('原文', 'site')}
              </a>
            </div>
            <p className="text-white/55 text-[10px] mt-0.5 leading-relaxed">
              {lang === 'en' ? c.usedEn : c.usedZh}
            </p>
            <p className="text-white/35 text-[9.5px] mt-0.5 leading-relaxed">
              {lang === 'en' ? c.termsEn : c.termsZh}
            </p>
          </div>
        ))}
      </div>

      <p className="text-white/25 text-[9px] leading-relaxed px-1">
        {t(
          '本 App 為個人非商業野外筆記工具。各來源的授權條件如上；如需轉載本 App 內容，請同時遵守各來源的授權（維基：署名＋相同方式分享）。',
          'This app is a personal, non-commercial field notebook. Reuse of its content must also comply with each source’s licence (Wikipedia: attribution + share-alike).',
        )}
      </p>
      </>
      )}
    </motion.div>
  );
};

export default SourcesPage;
