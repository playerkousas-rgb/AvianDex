/* ============================================================
 *  浮動球測試（node:test）
 *  跑：node --test tests/toolBalls.test.mjs
 * ------------------------------------------------------------
 *  守的是用戶實際撞到的三個介面投訴：
 *    1. 「兩邊功能球大小不一」→ 左右兩排必須讀同一組尺寸，不可以在兩個檔各寫一次
 *    2. 「加入主畫面浮在右邊球上方，兩邊不平衡」→ 安裝鍵必須在頂欄，不在球排
 *    3. 桌面用滑鼠（用戶原話「雞爪」）→ 目標不可以細過 44px
 *
 *  這不是視覺測試（沙盒冇瀏覽器），是「同一個數值只准寫一次」的結構測試。
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(path.join(root, p), 'utf8');

const styles = read('src/components/ballStyles.ts');
const left = read('src/components/SideToolBalls.tsx');
const app = read('src/App.tsx');
const topbar = read('src/components/TopBar.tsx');

test('浮動球：左右兩排讀同一組尺寸（用戶：「兩邊球大小不一」）', () => {
  /* ballStyles 是唯一來源，兩邊都只可以引用，不可以自己寫 w-/h- */
  assert.ok(styles.includes('BALL_SIZE'), 'ballStyles 應匯出 BALL_SIZE');
  assert.ok(left.includes('BALL_SIZE'), '左排球應引用 BALL_SIZE');
  assert.ok(app.includes('BALL_SIZE'), '右排球應引用 BALL_SIZE');

  /* 左右兩排都不准再寫死尺寸 class */
  for (const [name, src] of [['SideToolBalls', left], ['App', app]]) {
    assert.equal(/\bw-1[0-9]\b|\bw-\[5[0-9]px\]/.test(
      src.split('const BTN')[0].includes('BALL_SIZE') ? '' : src,
    ), false, `${name} 仍有寫死的球尺寸`);
  }
});

test('浮動球：尺寸符合觸控與滑鼠可達性（手機 48px、桌面 56px）', () => {
  const m = styles.match(/BALL_SIZE = '([^']+)'/);
  assert.ok(m, '找不到 BALL_SIZE 定義');
  assert.ok(m[1].includes('w-12') && m[1].includes('h-12'), '手機應 48px（w-12）');
  assert.ok(m[1].includes('sm:w-14') && m[1].includes('sm:h-14'), '桌面應 56px（sm:w-14）');
  /* 48px / 56px 都大過 WCAG 2.5.5 要求的 44px */
});

test('浮動球：左右兩排位置對稱，球數都是 3', () => {
  const railLeft = styles.match(/BALL_RAIL_LEFT = `\$\{BALL_RAIL\} ([^`]+)`/);
  const railRight = styles.match(/BALL_RAIL_RIGHT = `\$\{BALL_RAIL\} ([^`]+)`/);
  assert.ok(railLeft && railRight, '應有左右兩條 rail 定義');
  /* 對稱：left-2 ↔ right-2 */
  assert.ok(railLeft[1].includes('left-2'), '左排應貼左邊');
  assert.ok(railRight[1].includes('right-2'), '右排應貼右邊');

  /* 左 3 個（地圖／禮儀／裝備） */
  const leftItems = (left.match(/key: '/g) || []).length;
  assert.equal(leftItems, 3, `左排應 3 球，實際 ${leftItems}`);
});

test('安裝鍵：在頂欄，不再浮在右邊球上方（用戶第 2 點）', () => {
  assert.ok(topbar.includes('beforeinstallprompt'), '頂欄應處理安裝事件');
  /* 舊的魔法數字必須消失 */
  assert.equal(app.includes('translateY(-190px)'), false, '仍有 translateY(-190px) 浮球');
  assert.equal(app.includes('InstallPrompt'), false, 'App 仍引用舊的浮動安裝球');
  /* App 的兩處頂欄都要掛 TopBar */
  assert.ok((app.match(/<TopBar /g) || []).length >= 2, '手機與桌面頂欄都要有安裝鍵');
});

test('安裝鍵：仍然是用戶自己按，不是自動彈窗', () => {
  /* 不可以一載入就 setOpen(true) —— 用戶原則「不要靜靜自動換版」同理 */
  const effect = topbar.slice(topbar.indexOf('useEffect('), topbar.indexOf('const snooze'));
  assert.equal(/setOpen\(true\)/.test(effect), false, '安裝窗不可以自動彈出');
});
