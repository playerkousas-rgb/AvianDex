// src/hooks/useBirdNetLocal.ts
// ============================================================
// AvianDex — 前端本地聽聲辨雀 (BirdNET v1 GraphModel, TensorFlow.js)
// ------------------------------------------------------------
// ✅ tfjs 採「動態 import」：首頁 bundle 完全不含 tfjs，
//    只有使用者第一次點「聽聲辨雀」才下載 tfjs + 模型 → 想用的才下載。
//
// 為什麼用 v1 而不是 v2？
//   v1 模型「直接吃原始波形 [batch, 144000]」(3秒@48kHz)，
//   STFT / mel / 正規化全部內建在模型圖裡 → 呼叫端只要 model.predict(signal)。
//   v2 雖小但需作者自訂 WebGL STFT kernel + MatMul.bin + remap 表，移植易出錯。
//
// 特點：
//   ✅ 完全免費、無 rate limit、不依賴任何外部 API / HF Space
//   ✅ 音訊不上傳，全部瀏覽器運算（隱私佳）
//   ✅ lazy-load + IndexedDB / CDN 快取，第二次起 0 下載
//   ✅ 暴露下載進度 progress(0~100)、stage、warmup，方便做 UI 進度條
//
// 前置：
//   1) npm i @tensorflow/tfjs
//   2) 模型放 public/models/birdnet/（來源 github.com/georg95/birdnet-web → models/birdnet/）
//      需要：model.json + group1-shard1of13.bin ... shard13of13.bin
//   3) 標籤放 public/models/birdnet/labels/zh.txt（或 en_us.txt）
//   詳見 INTEGRATION_GUIDE.md
// ============================================================

import { useCallback, useRef, useState } from 'react';
// 只引入「型別」（type-only import 不會被打進 bundle）
import type { GraphModel, Tensor } from '@tensorflow/tfjs';

// tfjs 整個命名空間的型別（用於動態 import 後的 tf 變數）
type TfModule = typeof import('@tensorflow/tfjs');

const MODEL_URL = '/models/birdnet/model.json';
const LABELS_URL = '/models/birdnet/labels/zh.txt'; // 想要英文改成 en_us.txt
const SAMPLE_RATE = 48000;     // BirdNET 要求 48kHz
const CHUNK_SAMPLES = 144000;  // 3 秒 @ 48kHz（v1 模型輸入長度）

export type BirdNetStage =
  | 'idle'
  | 'loading-tfjs'    // 首次動態下載 tfjs 函式庫
  | 'loading-model'   // 首次下載模型權重
  | 'warming-up'      // 第一次推論前暖機
  | 'decoding'        // 解碼/重採樣音訊
  | 'inferring'       // 推論中
  | 'done'
  | 'error';

export interface BirdResult {
  label: string;       // 顯示用名稱（俗名）
  scientific: string;  // 學名
  common: string;      // 俗名
  score: number;       // 0~1
}

// 全域只載一次，跨元件共用
let tfPromise: Promise<TfModule> | null = null;
let modelPromise: Promise<GraphModel> | null = null;
let labelsPromise: Promise<string[]> | null = null;
let backendReady: Promise<TfModule> | null = null;
let warmedUp = false;

// 動態載入 tfjs（首次才真的下載），並設定 backend
function ensureTf(onStage?: (s: BirdNetStage) => void) {
  if (!backendReady) {
    backendReady = (async () => {
      onStage?.('loading-tfjs');
      if (!tfPromise) tfPromise = import('@tensorflow/tfjs');
      const tf = await tfPromise;
      try { await tf.setBackend('webgl'); } catch { /* fallback cpu */ }
      await tf.ready();
      return tf;
    })();
  }
  return backendReady;
}

function loadModel(tf: TfModule, onProgress?: (frac: number) => void) {
  if (!modelPromise) {
    modelPromise = tf.loadGraphModel(MODEL_URL, {
      onProgress: (frac: number) => onProgress?.(frac), // 0~1
    });
  } else {
    onProgress?.(1);
  }
  return modelPromise;
}

function loadLabels() {
  if (!labelsPromise) {
    labelsPromise = fetch(LABELS_URL)
      .then((r) => r.text())
      .then((t) => t.split('\n').map((s) => s.trim()).filter(Boolean));
  }
  return labelsPromise;
}

// 任意 Blob → 48kHz 單聲道 Float32，取能量最高的 3 秒
async function decodeToChunk(blob: Blob): Promise<Float32Array> {
  const arrayBuf = await blob.arrayBuffer();
  const AC = (window.AudioContext || (window as any).webkitAudioContext);
  const tmpCtx = new AC();
  const decoded = await tmpCtx.decodeAudioData(arrayBuf.slice(0));
  await tmpCtx.close();

  // 重採樣到 48kHz 單聲道
  const offline = new OfflineAudioContext(
    1,
    Math.max(CHUNK_SAMPLES, Math.ceil(decoded.duration * SAMPLE_RATE)),
    SAMPLE_RATE,
  );
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  const data = rendered.getChannelData(0);

  const out = new Float32Array(CHUNK_SAMPLES);
  if (data.length <= CHUNK_SAMPLES) {
    out.set(data);
    return out;
  }
  // 滑動視窗找能量最高的 3 秒（避開靜音段）
  const step = SAMPLE_RATE; // 每秒滑一次
  let bestStart = 0, bestEnergy = -1;
  for (let start = 0; start + CHUNK_SAMPLES <= data.length; start += step) {
    let e = 0;
    for (let i = start; i < start + CHUNK_SAMPLES; i += 64) e += data[i] * data[i];
    if (e > bestEnergy) { bestEnergy = e; bestStart = start; }
  }
  out.set(data.subarray(bestStart, bestStart + CHUNK_SAMPLES));
  return out;
}

export function useBirdNetLocal() {
  const [stage, setStage] = useState<BirdNetStage>('idle');
  const [progress, setProgress] = useState(0); // 模型下載進度 0~100
  const [error, setError] = useState<string | null>(null);
  const labelsRef = useRef<string[]>([]);

  const isLoading = stage !== 'idle' && stage !== 'done' && stage !== 'error';
  const isWarming =
    stage === 'loading-tfjs' || stage === 'loading-model' || stage === 'warming-up';

  // 確保 tfjs + 模型 + 標籤 + 暖機就緒（可單獨呼叫做預熱）
  const ready = useCallback(async (): Promise<{ tf: TfModule; model: GraphModel }> => {
    const tf = await ensureTf(setStage);

    if (!modelPromise) setStage('loading-model');
    const [model, labels] = await Promise.all([
      loadModel(tf, (frac) => setProgress(Math.round(frac * 100))),
      loadLabels(),
    ]);
    labelsRef.current = labels;
    setProgress(100);

    if (!warmedUp) {
      setStage('warming-up');
      // 用一段靜音先跑一次，把 WebGL shader 編譯/權重上傳 GPU 的成本提前付掉
      const z = tf.zeros([1, CHUNK_SAMPLES]);
      const o = model.predict(z) as Tensor;
      await o.data();
      z.dispose(); o.dispose();
      warmedUp = true;
    }
    return { tf, model };
  }, []);

  const analyze = useCallback(async (audioBlob: Blob): Promise<BirdResult[]> => {
    setError(null);
    try {
      const { tf, model } = await ready();

      setStage('decoding');
      const chunk = await decodeToChunk(audioBlob);

      setStage('inferring');
      const result = tf.tidy(() => {
        const signal = tf.tensor(chunk, [1, CHUNK_SAMPLES], 'float32');
        // v1 已是 sigmoid/機率輸出；若你的版本輸出 logits，改成 tf.sigmoid(out)
        return model.predict(signal) as Tensor; // [1, numClasses]
      });
      const arr = Array.from(await result.data());
      result.dispose();

      const labels = labelsRef.current;
      const ranked = arr
        .map((score, i) => ({ score, raw: labels[i] || `class_${i}` }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((r): BirdResult => {
          const [scientific, common] = r.raw.split('_'); // "學名_俗名"
          return {
            label: common || scientific || r.raw,
            scientific: scientific || '',
            common: common || '',
            score: r.score,
          };
        });

      setStage('done');
      return ranked;
    } catch (e: any) {
      console.error('[BirdNET local] 失敗:', e);
      setError(e?.message || '本地辨識失敗');
      setStage('error');
      return [];
    }
  }, [ready]);

  // 預熱：使用者一打開聲音面板就背景下載 tfjs + 模型 + 暖機
  const prefetch = useCallback(() => {
    ready().catch(() => { /* 預熱失敗不影響後續真正 analyze */ });
  }, [ready]);

  const reset = useCallback(() => { setStage('idle'); setError(null); }, []);

  return { analyze, prefetch, ready, reset, stage, progress, isLoading, isWarming, error };
}
