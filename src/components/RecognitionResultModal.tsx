// ============================================================
// AvianDex - 辨識結果浮窗 (Pokédex 風格)
// 顯示 Top-N 候選鳥種，並讓使用者點擊跳轉到對應的圖鑑卡
// ============================================================
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mic, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { Bird } from '../types';

export interface Candidate {
  /** 原始 API 回傳的英文/拉丁名 */
  label: string;
  /** 信心值 0~1 */
  score: number;
  /** 比對到的圖鑑 index（若為 null 代表圖鑑沒收錄） */
  matchedIndex: number | null;
  /** 比對到的圖鑑鳥（可選） */
  matchedBird?: Bird;
}

interface Props {
  isOpen: boolean;
  loading: boolean;
  /** 本地模型首次下載/暖機中 */
  warming?: boolean;
  /** 模型下載進度 0~100（僅 warming 時有意義） */
  downloadProgress?: number;
  mode: 'audio' | 'image' | null;
  error: string | null;
  candidates: Candidate[];
  onClose: () => void;
  onPick: (index: number) => void;
}

export const RecognitionResultModal: React.FC<Props> = ({
  isOpen,
  loading,
  warming = false,
  downloadProgress = 0,
  mode,
  error,
  candidates,
  onClose,
  onPick,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            className="w-full max-w-md bg-gradient-to-b from-[#E3350D] to-[#9b1f00] rounded-3xl border-[6px] border-gray-900 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-black/40 border-b-4 border-red-950 px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-[3px] border-gray-900 shadow-inner">
                <div className="w-7 h-7 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_10px_rgba(0,255,255,0.8)] relative overflow-hidden animate-pulse">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full blur-[1px]" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-yellow-300 font-mono uppercase tracking-widest">
                  {mode === 'audio' ? 'Acoustic Analysis' : mode === 'image' ? 'Visual Analysis' : 'Analysis'}
                </p>
                <h2 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
                  {mode === 'audio' && <Mic className="w-4 h-4" />}
                  {mode === 'image' && <Camera className="w-4 h-4" />}
                  AI 辨識結果
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500 border-2 border-white/30 text-white flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 bg-gradient-to-b from-[#DEDEDE] to-[#bdbdbd] min-h-[280px]">
              {/* 聲音：首次下載 / 暖機 → 顯示進度條 */}
              {loading && warming && mode === 'audio' && (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="relative w-16 h-16">
                    <Loader2 className="w-16 h-16 text-red-700 animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-red-900">
                      {downloadProgress}%
                    </span>
                  </div>
                  <p className="text-gray-800 font-black tracking-widest text-center">
                    {downloadProgress < 100 ? '下載辨識模型中…' : '初始化神經網絡…'}
                  </p>
                  <div className="w-full max-w-xs h-3 bg-gray-300 rounded-full overflow-hidden border border-gray-400">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-200"
                      style={{ width: `${Math.min(100, downloadProgress)}%` }}
                    />
                  </div>
                  <p className="text-gray-600 text-[11px] font-mono text-center max-w-xs leading-relaxed">
                    首次使用需下載 BirdNET 模型（約 56MB），
                    完成後會永久快取，<span className="font-black">下次秒辨、且不需網路</span>。
                  </p>
                </div>
              )}

              {/* 其他 loading（圖片 / 聲音推論中） */}
              {loading && !(warming && mode === 'audio') && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-12 h-12 text-red-700 animate-spin" />
                  <p className="text-gray-800 font-black tracking-widest">
                    {mode === 'audio' ? 'ANALYZING SOUND...' : 'ANALYZING IMAGE...'}
                  </p>
                  <p className="text-gray-600 text-xs font-mono">
                    {mode === 'audio'
                      ? 'BirdNET 在你的裝置上運算中（不上傳音訊）'
                      : 'Nyckel 視覺模型分析中'}
                  </p>
                </div>
              )}

              {!loading && error && (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                  <AlertCircle className="w-12 h-12 text-red-700" />
                  <p className="text-gray-900 font-black">辨識失敗</p>
                  <p className="text-gray-700 text-xs max-w-xs">{error}</p>
                </div>
              )}

              {!loading && !error && candidates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                  <Sparkles className="w-12 h-12 text-gray-600" />
                  <p className="text-gray-900 font-black">沒有辨識結果</p>
                  <p className="text-gray-700 text-xs max-w-xs">
                    請嘗試更清晰的{mode === 'audio' ? '錄音' : '照片'}，
                    或對準單一隻鳥再試一次。
                  </p>
                </div>
              )}

              {!loading && !error && candidates.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-gray-700 text-[10px] font-mono uppercase tracking-widest mb-1">
                    Top {candidates.length} Candidates
                  </p>
                  {candidates.map((c, i) => {
                    const inDex = c.matchedIndex !== null;
                    return (
                      <button
                        key={i}
                        onClick={() => inDex && onPick(c.matchedIndex!)}
                        disabled={!inDex}
                        className={`group text-left p-3 rounded-xl border-[3px] transition-all flex items-center gap-3 ${
                          inDex
                            ? 'bg-white hover:bg-yellow-100 border-gray-900 active:translate-y-0.5 cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.6)] active:shadow-none'
                            : 'bg-gray-300 border-gray-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {/* 排名標籤 */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-white shrink-0 ${
                            i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-500' : 'bg-amber-700'
                          }`}
                        >
                          #{i + 1}
                        </div>

                        {/* 名稱與信心 */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-sm truncate">
                            {c.matchedBird?.name || c.label}
                          </p>
                          <p className="text-[10px] text-gray-600 font-mono truncate">
                            {c.label}
                          </p>
                          {/* 信心條 */}
                          <div className="mt-1 h-1.5 w-full bg-gray-300 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                c.score > 0.6 ? 'bg-green-500' : c.score > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, c.score * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* 狀態標籤 */}
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] font-black text-gray-700">
                            {(c.score * 100).toFixed(0)}%
                          </p>
                          {inDex ? (
                            <p className="text-[9px] font-black text-green-700 uppercase">
                              在圖鑑 ▸
                            </p>
                          ) : (
                            <p className="text-[9px] font-black text-gray-500 uppercase">
                              未收錄
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  <p className="text-gray-600 text-[9px] mt-2 italic">
                    * 點擊「在圖鑑」的候選即可跳轉至該鳥種卡片
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecognitionResultModal;
