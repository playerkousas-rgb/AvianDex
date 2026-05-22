// ============================================================
// AvianDex - 媒體擷取面板
// 提供：📁 上傳音訊 / 🎙️ 即時錄音 / 📁 上傳圖片 / 📷 即時拍照
// 一個小型的 popover，點擊麥克風或相機按鈕後彈出
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera, Upload, Square, Circle, X, Loader2 } from 'lucide-react';

export type MediaKind = 'audio' | 'image';

interface Props {
  open: boolean;
  kind: MediaKind;
  onClose: () => void;
  onCapture: (file: File | Blob, kind: MediaKind) => void;
  /** 錨點按鈕對應的位置（電腦版用），行動端會用全螢幕底部彈出 */
  anchor?: 'topRight' | 'bottomCenter';
}

export const MediaCapturePanel: React.FC<Props> = ({
  open,
  kind,
  onClose,
  onCapture,
  anchor = 'topRight',
}) => {
  // 錄音狀態
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recStreamRef = useRef<MediaStream | null>(null);
  const recTimerRef = useRef<number | null>(null);

  // 拍照狀態
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const camStreamRef = useRef<MediaStream | null>(null);

  // 清理
  const stopAllStreams = () => {
    if (recStreamRef.current) {
      recStreamRef.current.getTracks().forEach((t) => t.stop());
      recStreamRef.current = null;
    }
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
    }
    if (recTimerRef.current) {
      window.clearInterval(recTimerRef.current);
      recTimerRef.current = null;
    }
    setIsRecording(false);
    setCameraOn(false);
    setRecordSecs(0);
  };

  useEffect(() => {
    if (!open) stopAllStreams();
    return () => stopAllStreams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ─── 錄音 ───
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recStreamRef.current = stream;

      // 選擇瀏覽器支援的 mime（webm/opus 最普及）
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const mime = candidates.find((m) => (window as any).MediaRecorder?.isTypeSupported?.(m)) || '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        stopAllStreams();
        onCapture(blob, 'audio');
        onClose();
      };
      recorder.start();
      setIsRecording(true);
      setRecordSecs(0);
      recTimerRef.current = window.setInterval(() => {
        setRecordSecs((s) => {
          if (s + 1 >= 15) {
            // 自動 15 秒停止
            stopRecording();
            return 15;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err: any) {
      alert(`無法存取麥克風：${err.message || err}`);
      onClose();
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  // ─── 拍照 ───
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // 行動端用後鏡頭
        audio: false,
      });
      camStreamRef.current = stream;
      setCameraOn(true);
      // 等下一輪 render 把 video element 拿到
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err: any) {
      alert(`無法存取鏡頭：${err.message || err}`);
      onClose();
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopAllStreams();
          onCapture(blob, 'image');
          onClose();
        }
      },
      'image/jpeg',
      0.92,
    );
  };

  // ─── 檔案上傳 ───
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      onCapture(f, kind);
      onClose();
    }
  };

  if (!open) return null;

  const accent = kind === 'audio' ? 'cyan' : 'fuchsia';
  const title = kind === 'audio' ? '聲音辨識 / Acoustic' : '影像辨識 / Visual';
  const Icon = kind === 'audio' ? Mic : Camera;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[180] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-black rounded-3xl border-[5px] border-gray-700 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b-2 border-${accent}-500/40 bg-${accent}-500/10`}
            style={{
              borderColor: kind === 'audio' ? 'rgba(34,211,238,0.4)' : 'rgba(232,121,249,0.4)',
              background: kind === 'audio' ? 'rgba(34,211,238,0.10)' : 'rgba(232,121,249,0.10)',
            }}
          >
            <div className="flex items-center gap-2">
              <Icon
                className="w-5 h-5"
                style={{ color: kind === 'audio' ? '#22d3ee' : '#e879f9' }}
              />
              <h3 className="text-white font-black text-sm tracking-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-3 min-h-[260px]">
            {/* 攝影機預覽 */}
            {kind === 'image' && cameraOn && (
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-700 bg-black">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 pointer-events-none border-4 border-fuchsia-400/40 rounded-xl" />
              </div>
            )}

            {/* 錄音中 */}
            {kind === 'audio' && isRecording && (
              <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-red-900/30 border-2 border-red-500/40">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40" />
                  <div className="relative w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-white font-mono font-black text-2xl">
                  {String(Math.floor(recordSecs / 60)).padStart(2, '0')}:
                  {String(recordSecs % 60).padStart(2, '0')}
                </p>
                <p className="text-red-300 text-xs">最長 15 秒，停止後自動分析</p>
              </div>
            )}

            {/* 動作按鈕 */}
            {!isRecording && !cameraOn && (
              <>
                {kind === 'audio' && (
                  <button
                    onClick={startRecording}
                    className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black border-b-4 border-cyan-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-3"
                  >
                    <Mic className="w-5 h-5" />
                    開始錄音 (最長 15 秒)
                  </button>
                )}
                {kind === 'image' && (
                  <button
                    onClick={startCamera}
                    className="w-full py-4 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-black border-b-4 border-fuchsia-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-3"
                  >
                    <Camera className="w-5 h-5" />
                    開啟相機拍照
                  </button>
                )}

                {/* 上傳檔案 */}
                <label
                  className="w-full py-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-black border-b-4 border-gray-900 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  從檔案上傳
                  <input
                    type="file"
                    className="hidden"
                    accept={kind === 'audio' ? 'audio/*' : 'image/*'}
                    onChange={handleFileSelect}
                  />
                </label>
              </>
            )}

            {/* 停止錄音 */}
            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black border-b-4 border-red-900 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-3"
              >
                <Square className="w-5 h-5 fill-current" />
                停止並分析
              </button>
            )}

            {/* 拍照按鈕 */}
            {kind === 'image' && cameraOn && (
              <div className="flex gap-2">
                <button
                  onClick={takePhoto}
                  className="flex-1 py-4 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-black border-b-4 border-fuchsia-700 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2"
                >
                  <Circle className="w-5 h-5 fill-current" />
                  拍照
                </button>
                <button
                  onClick={() => {
                    stopAllStreams();
                  }}
                  className="px-4 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-black border-b-4 border-gray-900 active:translate-y-0.5 active:border-b-0 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* 提示文字 */}
            <p className="text-[10px] text-gray-500 italic text-center mt-1 leading-relaxed">
              {kind === 'audio'
                ? '提示：請靠近鳥鳴聲源，避免背景噪音。\nPowered by BirdNET (Cornell Lab) 神經網絡。'
                : '提示：對準單一隻鳥，盡量充滿畫面，避免逆光。\nPowered by Nyckel Bird Identifier。'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaCapturePanel;
