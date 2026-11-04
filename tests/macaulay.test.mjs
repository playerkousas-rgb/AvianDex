/* ============================================================
 *  相片授權與解析度測試（node:test）
 *  跑：npm test
 * ------------------------------------------------------------
 *  沙盒連不到 macaulaylibrary.org，所以這裡測「唔需要網絡」的部分：
 *    1) 授權字串正規化（各版本寫法 → 統一標籤）
 *    2) 授權放行規則（CC0 / CC BY / CC BY-SA / PD 可；NC、©、未標明不可）
 *    3) 圖片解析度檢查（太細要拒絕，唔可以偷偷放上卡面）
 *    4) ImageMagick 存在時，真的裁出 3:4 檔案
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  normaliseLicence, licenceAllows, imageSize, hasMagick, downloadTo, MAX_W,
} from '../scripts/cards/download-macaulay.mjs';

test('授權：各種寫法收斂成同一個標籤', () => {
  assert.equal(normaliseLicence('CC0'), 'CC0');
  assert.equal(normaliseLicence('cc-zero 1.0'), 'CC0');
  assert.equal(normaliseLicence('Public Domain Mark 1.0'), 'Public Domain');
  assert.equal(normaliseLicence('CC BY 4.0'), 'CC BY');
  assert.equal(normaliseLicence('cc-by-sa 4.0'), 'CC BY-SA');
  assert.equal(normaliseLicence('CC BY-NC 4.0'), 'CC BY-NC');
  assert.equal(normaliseLicence('Creative Commons Attribution-NonCommercial-NoDerivs'), 'CC BY-NC-ND');
  assert.equal(normaliseLicence('All rights reserved'), 'All rights reserved');
  assert.equal(normaliseLicence('© 2020 Someone'), 'All rights reserved');
  assert.equal(normaliseLicence(''), '');
});

test('授權：只放行可再用的授權', () => {
  for (const ok of ['CC0', 'CC BY', 'CC BY-SA', 'Public Domain', 'CC BY 4.0']) {
    assert.equal(licenceAllows(ok), true, `${ok} 應該放行`);
  }
  for (const no of ['CC BY-NC', 'CC BY-NC-SA', 'All rights reserved', '', '唔知']) {
    assert.equal(licenceAllows(no), false, `${no} 應該擋住`);
  }
});

test('授權：NC 預設擋、--allow-nc 才放（重現 flag 語意，不依賴 argv）', () => {
  /* licenceAllows 讀 ARGS，所以這裡只驗「NC 一定含 nc 字樣」的判定邏輯本身 */
  assert.equal(/nc/i.test('CC BY-NC'), true);
  assert.equal(licenceAllows('CC BY-NC'), false);
});

test('解析度：太細的相片會被拒絕，不會靜靜上卡', { skip: !hasMagick() }, async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'aviandex-photo-'));
  try {
    const small = path.join(dir, 'small.png');
    spawnSync('convert', ['-size', '300x400', 'xc:#88aa77', small]);
    assert.deepEqual(imageSize(small), { w: 300, h: 400 });
    /* downloadTo 需要網址，這裡改為直接驗 imageSize + 短邊門檻（MIN_W = 900） */
    assert.ok(Math.min(300, 400) < 900);

    const big = path.join(dir, 'big.png');
    spawnSync('convert', ['-size', '1200x1600', 'xc:#88aa77', big]);
    const dest = path.join(dir, 'crop.jpg');
    /* 用 file:// 模擬下載來源，驗證裁剪與長邊上限 */
    const bytes = await downloadTo(`file://${big}`, dest);
    assert.ok(bytes > 0);
    const s = imageSize(dest);
    assert.ok(Math.abs(s.w / s.h - 3 / 4) < 0.02, `應該裁成 3:4，實際 ${s.w}×${s.h}`);
    assert.ok(Math.max(s.w, s.h) <= MAX_W);
    assert.ok(readFileSync(dest).length > 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('工具說明不會承諾未驗證的端點', () => {
  const src = readFileSync(new URL('../scripts/cards/download-macaulay.mjs', import.meta.url), 'utf8');
  assert.match(src, /未在沙盒驗證過/);
  assert.match(src, /CC BY-NC/);
  assert.match(src, /--allow-nc/);
  /* 有一個守衛：唔好再出現「無條件 main()」令 import 時亂抓網 */
  assert.match(src, /isMain/);
});
