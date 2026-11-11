/**
 * 更新提示的狀態（module store）。
 *
 * 為甚麼要一個 store，而不是在 main.tsx 直接 reload？
 *   用戶的要求是：「有更新就即時知道」，然後由他自己決定。
 *   直接 reload 會令正在看詳細資料的人被踢走 —— 圖鑑雖然不是編輯器，
 *   但「看到一半被換版」一樣令人困惑。所以：
 *
 *     有新版本 → 記在 store → App 顯示一條橫幅 → 用戶按「立即更新」才換
 *
 *   main.tsx 只負責偵測與通知，UI 由 UpdateToast 負責；兩者靠這裡通訊。
 *
 * 注意：這裡刻意不依賴 React，所以可以在 main.tsx（React 之外）呼叫。
 */

type Listener = () => void;

let available = false;
let waitingWorker: ServiceWorker | null = null;
let applying = false;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function isUpdateAvailable(): boolean {
  return available;
}

export function isApplying(): boolean {
  return applying;
}

/** 由 main.tsx 呼叫：發現有新版本已下載好、正等待接手 */
export function markUpdateAvailable(worker: ServiceWorker | null) {
  waitingWorker = worker;
  if (available) return;
  available = true;
  emit();
}

/** 用戶按「立即更新」 */
export function applyUpdate() {
  if (!available || applying) return;
  applying = true;
  emit();
  /* 叫新 sw 立即接手；接手後 main.tsx 會收到 controllerchange 並重整 */
  if (waitingWorker) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  } else {
    /* 沒有 waiting worker 的極端情況（例如 sw 已被啟動）→ 直接重整 */
    window.location.reload();
  }
}

/** 用戶按「稍後」：收起橫幅，但保留狀態，5 分鐘後再提（新版仍然在等） */
export function dismissUpdate() {
  if (!available) return;
  available = false;
  emit();
  setTimeout(() => {
    if (waitingWorker) markUpdateAvailable(waitingWorker);
  }, 5 * 60 * 1000);
}
