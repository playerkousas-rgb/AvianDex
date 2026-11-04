import { useState } from 'react';
import { AlertTriangle, X, ExternalLink, RefreshCw } from 'lucide-react';
import { useCardStats } from '../hooks/useCardStats';
import { resetAll, retryCard } from '../lib/cardImage';
import { CARD_EXTENSIONS, cardBaseUrl } from '../config';

/** 只取網域做顯示；設定成相對路徑時也不會炸 */
function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/**
 * 「全部圖卡都 load 唔出」的即時診斷條。
 * 只有真係一張都載入唔到（而且唔係因為 R2 內冇圖）才會出現，
 * 目的：把「唔知點解冇圖」變成一句可以照住做嘅指示。
 */
export const CardLoadDiagnostics: React.FC<{ visibleIds: string[] }> = ({ visibleIds }) => {
  const stats = useCardStats();
  const [showDetail, setShowDetail] = useState(false);
  // 只在「這一輪」被關掉；下次重新掃描（loaded 歸零再變）會自然再問
  const [dismissedAtError, setDismissedAtError] = useState<number | null>(null);

  const nothingLoaded = stats.loaded === 0 && stats.missing === 0 && stats.error > 0;
  if (!nothingLoaded || dismissedAtError === stats.error) return null;

  const probe = () => {
    resetAll();
    visibleIds.forEach((id) => retryCard(id));
  };

  return (
    <div className="mb-4 rounded-2xl border-2 border-red-400/60 bg-red-950/70 backdrop-blur-sm text-red-50 overflow-hidden">
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-yellow-300 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-black text-sm sm:text-base text-yellow-200">
            圖卡全部載入失敗（{stats.error} 個請求出錯，0 張成功）
          </p>
          <p className="text-[11px] sm:text-xs text-red-100/80 mt-1 leading-relaxed">
            即係「R2 有圖，但瀏覽器攞唔到」。最常見三個原因：① R2 公開網域（r2.dev）被限流／暫時失效
            ② 瀏覽器快取了舊的錯誤結果 ③ 網絡擋咗 <code className="font-mono">{hostOf(cardBaseUrl())}</code>。
          </p>

          {showDetail && (
            <div className="mt-2 text-[10px] font-mono bg-black/40 rounded-lg p-2 space-y-1 break-all">
              <p>來源：{cardBaseUrl()}/0001.{CARD_EXTENSIONS[0]}</p>
              <p>已試副檔名：{CARD_EXTENSIONS.join(' / ')}</p>
              <p>請直接開上面網址測試；見到圖 = 前端問題，見到 404/錯誤 = R2 問題。</p>
              <a
                href={`${cardBaseUrl()}/0001.avif`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-cyan-300 underline underline-offset-2"
              >
                開測試圖 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={probe}
              className="flex items-center gap-1.5 bg-yellow-400 text-black font-black text-[11px] px-3 py-1.5 rounded-lg border-2 border-black active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 重新探測（清快取）
            </button>
            <button
              onClick={() => setShowDetail((v) => !v)}
              className="text-[11px] font-mono underline underline-offset-2 text-red-100/80"
            >
              {showDetail ? '收起詳情' : '睇詳情'}
            </button>
          </div>
        </div>
        <button onClick={() => setDismissedAtError(stats.error)} aria-label="關閉提示" className="shrink-0 text-red-200/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
