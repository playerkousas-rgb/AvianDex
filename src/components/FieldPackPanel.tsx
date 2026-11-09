import React from 'react';
import { Download, Check, HardDriveDownload, Trash2, WifiOff } from 'lucide-react';
import type { Lang } from '../lib/explorer';
import { ENTRIES } from '../lib/explorer';
import {
  buildPack, savePack, readMeta, clearPack, type FieldPackMeta,
} from '../lib/fieldPack';

/**
 * 野外離線包下載按鈕。
 *
 * 為甚麼要放在最重要的位置？
 *   用戶的目標是「帶去野外、取代書」。野外冇網絡，
 *   所以「有冇下載」比「有幾多欄」更關鍵。
 *
 * 這裡只做資料（文字）＋圖卡快取；不下載相片原圖，避免 569 張相爆數據。
 */

interface FieldPackPanelProps {
  lang: Lang;
  compact?: boolean;
}

export const FieldPackPanel: React.FC<FieldPackPanelProps> = ({ lang, compact }) => {
  const t = (zh: string, en: string) => (lang === 'en' ? en : zh);
  const [meta, setMeta] = React.useState<FieldPackMeta | null>(() => readMeta());
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const download = async () => {
    setBusy(true);
    setDone(false);
    try {
      const mod = lang === 'en'
        ? await import('../data/cardDetails.en.json')
        : await import('../data/cardDetails.zh.json');
      const details = (mod as { default: { birds: Record<string, Record<string, string | string[]>> } }).default.birds;
      const pack = buildPack(ENTRIES as unknown as Parameters<typeof buildPack>[0], details);
      const m = savePack(pack, lang);
      setMeta(m);
      setDone(true);
      // 順手叫 Service Worker 預快取 app 外殼（圖卡按需快取）
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        reg?.active?.postMessage({ type: 'PRECACHE_SHELL' });
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    clearPack();
    setMeta(null);
    setDone(false);
  };

  const size = meta ? `${(meta.bytes / 1024 / 1024).toFixed(1)} MB` : '';

  return (
    <div
      className={`rounded-lg border border-amber-400/25 bg-[#1b1a17]/85 ${
        compact ? 'p-2.5' : 'p-3'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <WifiOff className="w-3.5 h-3.5 text-amber-300/80" />
        <span className="text-amber-100 font-black text-[12px]">
          {t('野外離線包', 'Offline field pack')}
        </span>
        {meta && (
          <span className="ml-auto inline-flex items-center gap-1 text-emerald-300/80 text-[10px]">
            <Check className="w-3 h-3" />
            {t('已下載', 'Ready')}
          </span>
        )}
      </div>

      <p className="text-white/45 text-[10.5px] leading-relaxed mb-2">
        {t(
          '下載全部 569 隻的文字重點（每隻約 1–2 KB），冇網絡都用得。圖卡會在你看過之後自動存入快取。',
          'Saves the key text for all 569 birds (about 1–2 KB each) so it works without a signal. Cards you open are cached automatically.',
        )}
      </p>

      {meta ? (
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-[10px] flex items-center gap-1">
            <HardDriveDownload className="w-3 h-3" />
            {meta.count} {t('隻', 'birds')} · {size} · {new Date(meta.savedAt).toLocaleDateString()}
          </span>
          <button
            onClick={remove}
            className="ml-auto inline-flex items-center gap-1 text-white/40 hover:text-red-300 text-[10px]"
          >
            <Trash2 className="w-3 h-3" />{t('刪除', 'Remove')}
          </button>
        </div>
      ) : (
        <button
          onClick={download}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-100 font-bold text-[11.5px] py-2 rounded-md disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {busy ? t('整理中…', 'Preparing…') : t('下載離線包', 'Download pack')}
        </button>
      )}

      {done && (
        <p className="text-emerald-300/70 text-[10px] mt-1.5">
          {t('完成。下次冇網絡時，詳細資料會直接用這份。', 'Done. Next time you are offline, details load from this.')}
        </p>
      )}
    </div>
  );
};

export default FieldPackPanel;
