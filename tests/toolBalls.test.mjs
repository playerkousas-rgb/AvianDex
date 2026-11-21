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
/* 2026-11-21：左右兩排都由 SideToolBalls 出（次序讀 config.ts 的 TOOL_BALLS），
   App 唔再自己砌右排 —— 之前兩邊各寫一次，就係「大小不一」嘅來源。 */
const rails = read('src/components/SideToolBalls.tsx');
const app = read('src/App.tsx');
const config = read('src/config.ts');
const topbar = read('src/components/TopBar.tsx');

test('浮動球：左右兩排讀同一組尺寸（用戶：「兩邊球大小不一」）', () => {
  /* ballStyles 是唯一來源：兩排都由同一個元件、同一組 class 出 */
  assert.ok(styles.includes('BALL_SIZE'), 'ballStyles 應匯出 BALL_SIZE');
  assert.ok(rails.includes('BALL_SIZE'), 'SideToolBalls 應引用 BALL_SIZE');
  assert.ok(app.includes('<SideToolBalls'), 'App 應由 SideToolBalls 出齊兩排');

  /* 右排已經冇喺 App 寫死球尺寸（logo／loading 圈唔屬球，唔計） */
  /* 球嘅特徵＝BALL_BASE 嗰組 class（border-[3px]／border-gray-900 ＋ shadow-[0_5px_0]） */
  const appBallSizes = app.match(/className="[^"]*(?:shadow-\[0_5px_0|border-gray-900)[^"]*"/g) || [];
  assert.deepEqual(appBallSizes, [], `App 仍有寫死的球：${appBallSizes.join(' | ')}`);
  /* SideToolBalls 全部經 BALL_BASE／BALL_SIZE，唔准自己寫 */
  assert.equal(/\bw-1[0-9]\b|\bw-\[5[0-9]px\]/.test(rails), false, 'SideToolBalls 仍有寫死的球尺寸');
});

test('浮動球：尺寸符合觸控與滑鼠可達性（手機 48px、桌面 56px）', () => {
  const m = styles.match(/BALL_SIZE = '([^']+)'/);
  assert.ok(m, '找不到 BALL_SIZE 定義');
  assert.ok(m[1].includes('w-12') && m[1].includes('h-12'), '手機應 48px（w-12）');
  assert.ok(m[1].includes('sm:w-14') && m[1].includes('sm:h-14'), '桌面應 56px（sm:w-14）');
  /* 48px / 56px 都大過 WCAG 2.5.5 要求的 44px */
});

test('浮動球：左右兩排位置對稱，各 3 粒（2026-11-21 用戶定案）', () => {
  const railLeft = styles.match(/BALL_RAIL_LEFT = `\$\{BALL_RAIL\} ([^`]+)`/);
  const railRight = styles.match(/BALL_RAIL_RIGHT = `\$\{BALL_RAIL\} ([^`]+)`/);
  assert.ok(railLeft && railRight, '應有左右兩條 rail 定義');
  /* 對稱：left-2 ↔ right-2 */
  assert.ok(railLeft[1].includes('left-2'), '左排應貼左邊');
  assert.ok(railRight[1].includes('right-2'), '右排應貼右邊');

  /* 每排幾粒由 config.ts 的 TOOL_BALLS 決定（單一來源），兩排都要 3 粒 */
  const leftIds = [...config.matchAll(/^\s{2}([a-z0-9]+): 'left'/gm)].map((m) => m[1]);
  const rightIds = [...config.matchAll(/^\s{2}([a-z0-9]+): 'right'/gm)].map((m) => m[1]);
  assert.deepEqual(leftIds, ['like', 'etiquette', 'gear'], `左排：${leftIds}`);
  assert.deepEqual(rightIds, ['map', 'report', 'birddex3'], `右排：${rightIds}`);
  /* 兩排都由同一個元件按 side 出，唔會再左右各寫一份 */
  assert.match(rails, /toolBallsFor\('left'\)/);
  assert.match(rails, /toolBallsFor\('right'\)/);
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
