/* ============================================================
 *  更新通知的狀態機測試
 * ------------------------------------------------------------
 *  為甚麼要測？
 *    這個 store 決定「會不會自動把用戶踢走」。如果 markUpdateAvailable
 *    沒有正確觸發訂閱者，用戶就永遠見不到「有新版本」橫幅；
 *    如果 dismissUpdate 之後沒有保留 waitingWorker，
 *    用戶按「稍後」之後就再也更新不到。
 *    兩者都是無聲的錯誤 —— 畫面上甚麼都不會發生。
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');

async function load() {
  const dir = path.join(root, 'node_modules', '.cache', 'update-store');
  mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `store-${Date.now()}.mjs`);
  execFileSync(path.join(root, 'node_modules/.bin/esbuild'), [
    path.join(root, 'src/lib/updateStore.ts'),
    '--bundle', '--format=esm', '--platform=neutral',
    `--outfile=${out}`,
  ], { stdio: 'pipe' });
  return import(pathToFileURL(out).href);
}

test('markUpdateAvailable 會通知所有訂閱者，且狀態可讀', async () => {
  globalThis.window = { location: { reload() {} } };
  const store = await load();

  assert.equal(store.isUpdateAvailable(), false, '初始狀態不應有更新');

  let notified = 0;
  const off = store.subscribe(() => { notified += 1; });

  store.markUpdateAvailable(null);
  assert.equal(notified, 1, '應該通知一次');
  assert.equal(store.isUpdateAvailable(), true);

  /* 重複通知不應該重複 emit（避免橫幅不停重播動畫） */
  store.markUpdateAvailable(null);
  assert.equal(notified, 1, '重複通知不應再 emit');

  off();
  store.markUpdateAvailable(null);
  assert.equal(notified, 1, '退訂後不應再收到');
});

test('dismissUpdate 收起橫幅，但保留 worker 以便之後再提', async () => {
  globalThis.window = { location: { reload() {} } };
  const store = await load();

  const posted = [];
  const fakeWorker = { postMessage: (m) => posted.push(m) };

  store.markUpdateAvailable(fakeWorker);
  store.dismissUpdate();
  assert.equal(store.isUpdateAvailable(), false, '按稍後後橫幅應收起');

  /* 直接按「立即更新」（模擬用戶之後改變主意）：
     waitingWorker 仍然在，所以會發 SKIP_WAITING 而不是硬重整 */
  store.markUpdateAvailable(fakeWorker);
  store.applyUpdate();
  assert.deepEqual(posted, [{ type: 'SKIP_WAITING' }], '應叫新 sw 接手');
  assert.equal(store.isApplying(), true, '應進入更新中狀態');
});

test('沒有 waiting worker 時，applyUpdate 直接重整（不會卡住）', async () => {
  let reloaded = 0;
  globalThis.window = { location: { reload() { reloaded += 1; } } };
  const store = await load();

  store.markUpdateAvailable(null);
  store.applyUpdate();
  assert.equal(reloaded, 1, '應直接重整一次');
});
