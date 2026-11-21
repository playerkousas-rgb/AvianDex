import React, { useState } from 'react';
import { MessageSquareWarning } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import {
  REPORT_SOURCE_APP,
  SCOUT_ADMIN_WIDGET_URL,
  scoutReportPageUrl,
} from '../config';
import { openScoutReport } from '../lib/scoutReportWidget';
import { BALL_BASE, BALL_ICON, BALL_LABEL, BALL_SIZE } from './ballStyles';

/**
 * 「回報」掣 —— 接 Scout Admin 統一回報格式 v1（同 HKMAP／圖書館同一條 Apps Script）。
 *
 * 為咩唔自己寫一個表單？
 *   全家標準：所有系統共用同一個 widget、同一個 payload、同一組 Sheet 欄位，
 *   只有「來源系統」（data-app）唔同；後台「來源膠囊」就會見到
 *   `AvianDex 鳥類圖鑑` 有幾多條未閱。自己砌一個表單＝多一個要維修嘅收件箱。
 *
 * 行為（測試：tests/scoutReport.test.mjs）
 *   ① 撳一下 → loadScoutAdminWidget（第一次才載）→ 用同一頁面內嘅 modal 提交
 *   ② widget 載唔到（離線／學校網絡封 script.google.com）→ 開獨立回報頁（新分頁）
 *   ③ widget 嘅右下角 FAB 由 index.css 收埋；入口只有呢粒掣（唔會兩個掣爭位）
 *   ④ 唔會自動彈、唔遮內容；本 App 冇 cookie、冇新增 localStorage
 *
 * 兩個版面：variant="ball"（側欄球）／variant="row"（詳細資料頁一行掣）
 */

interface Props {
  lang: Lang;
  hidden?: boolean;
  index?: number;
  side?: 'left' | 'right';
  /** 喺詳細資料頁用：帶埋雀鳥編號，回報標題自動填好（管理員一眼知邊隻雀） */
  birdId?: string;
  birdName?: string;
  variant?: 'ball' | 'row';
}

export const ReportBugButton: React.FC<Props> = ({
  lang, hidden, index = 0, side = 'right', birdId, birdName, variant = 'ball',
}) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const [busy, setBusy] = useState(false);
  const label = t('回報問題', 'Report');

  if (hidden) return null;

  const aria = t(
    '回報問題或提供意見（Scout Admin 統一處理，可匿名）',
    'Report a problem or share feedback (handled by Scout Admin, anonymous OK)',
  );

  const openReport = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    /* 開一個即刻嘅反饋（網路慢都唔會「撳完冇反應」）。
       用 aria-busy ＋ 標題已經夠，唔加 toast／彈窗（SG18 ⑤：零打斷）。 */
    try {
      const result = await openScoutReport({
        widgetUrl: SCOUT_ADMIN_WIDGET_URL,
        sourceApp: REPORT_SOURCE_APP,
      });
      if (result === 'fallback') {
        window.open(scoutReportPageUrl(), '_blank', 'noopener');
      } else if (birdId) {
        /* 喺詳細資料頁開的回報：標題自動填「NO.0008 白頭鵯 — 」，
           用家只需補一句邊度錯，管理員亦唔使問「邊隻雀」。 */
        const titleInput = document.getElementById('scoutw_i_title') as HTMLInputElement | null;
        if (titleInput && !titleInput.value) {
          titleInput.value = `NO.${birdId}${birdName ? ` ${birdName}` : ''} — `;
          titleInput.focus({ preventScroll: true });
        }
      }
    } catch {
      window.open(scoutReportPageUrl(), '_blank', 'noopener');
    } finally {
      setBusy(false);
    }
  };

  if (variant === 'row') {
    return (
      <a
        href={scoutReportPageUrl()}
        target="_blank"
        rel="noopener"
        onClick={openReport}
        title={aria}
        aria-label={aria}
        aria-busy={busy}
        data-report-open
        className="min-h-10 flex items-center justify-center gap-1.5 bg-orange-900/45 hover:bg-orange-800/65 border border-orange-400/30 text-white/85 font-bold py-2.5 rounded-lg text-[11.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
      >
        <MessageSquareWarning className="w-3.5 h-3.5" aria-hidden="true" />
        {label}
      </a>
    );
  }

  return (
    <a
      href={scoutReportPageUrl()}
      target="_blank"
      rel="noopener"
      onClick={openReport}
      title={aria}
      aria-label={aria}
      aria-busy={busy}
      data-report-open
      className={`${BALL_BASE} ${BALL_SIZE} bg-gradient-to-br from-orange-300 to-orange-700 text-white`}
      style={{ animationDelay: `${0.04 * index}s` }}
    >
      <MessageSquareWarning
        className={`${BALL_ICON} drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]`}
        strokeWidth={2.6}
      />
      <span className={BALL_LABEL(side)}>{label}</span>
    </a>
  );
};

export default ReportBugButton;
