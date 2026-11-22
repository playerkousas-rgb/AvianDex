import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');

function loadAliasesModule() {
  const out = path.join(mkdtempSync(path.join(tmpdir(), 'aviandex-alias-')), 'nameAliases.mjs');
  execFileSync(
    path.join(root, 'node_modules/.bin/esbuild'),
    [
      path.join(root, 'src/data/nameAliases.ts'),
      '--bundle',
      '--format=esm',
      '--platform=neutral',
      `--outfile=${out}`,
    ],
    { stdio: 'pipe' },
  );
  return import(pathToFileURL(out).href);
}

test('all 583 authoritative birds resolve by HK Chinese, English, and Clements scientific name', async () => {
  const { resolveBirdId, NAME_TO_ID } = await loadAliasesModule();
  const birds = JSON.parse(readFileSync(path.join(root, 'src/data/birds.json'), 'utf8'));
  const taxonomy = JSON.parse(readFileSync(path.join(root, 'src/data/birdTaxonomy.json'), 'utf8'));

  assert.equal(birds.length, 583);
  for (const b of birds) {
    assert.equal(resolveBirdId(b.name), b.id, `Chinese name ${b.name} should map to ${b.id}`);
    assert.equal(resolveBirdId(b.en), b.id, `English name ${b.en} should map to ${b.id}`);
    const sci = taxonomy[b.id]?.sciName;
    assert.ok(sci, `Missing taxonomy for ${b.id}`);
    assert.equal(resolveBirdId(sci), b.id, `Scientific name ${sci} should map to ${b.id}`);
  }

  // Ensure every alias target exists in the 583-bird roster
  const validIds = new Set(birds.map((b) => b.id));
  for (const [alias, id] of Object.entries(NAME_TO_ID)) {
    assert.ok(validIds.has(id), `Alias "${alias}" points to invalid ID "${id}"`);
  }
});

test('previously collided species pairs resolve to distinct, correct IDs', async () => {
  const { resolveBirdId } = await loadAliasesModule();

  // 0017 普通鵟 vs 0436 暗綠繡眼鳥
  assert.equal(resolveBirdId('普通鵟'), '0017');
  assert.equal(resolveBirdId('Eastern Buzzard'), '0017');
  assert.equal(resolveBirdId('Buteo japonicus'), '0017');
  assert.equal(resolveBirdId('暗綠繡眼鳥'), '0436');
  assert.equal(resolveBirdId("Swinhoe's White-eye"), '0436');
  assert.equal(resolveBirdId('Zosterops simplex'), '0436');

  // 0010 灰胸秧雞 vs 0014 白腰文鳥 vs 0344 喜鵲
  assert.equal(resolveBirdId('灰胸秧雞'), '0010');
  assert.equal(resolveBirdId('Slaty-breasted Rail'), '0010');
  assert.equal(resolveBirdId('白腰文鳥'), '0014');
  assert.equal(resolveBirdId('White-rumped Munia'), '0014');
  assert.equal(resolveBirdId('喜鵲'), '0344');

  // 0156 橙腹葉鵯 vs 0173 拉氏沙錐
  assert.equal(resolveBirdId('橙腹葉鵯'), '0156');
  assert.equal(resolveBirdId('Orange-bellied Leafbird'), '0156');
  assert.equal(resolveBirdId('拉氏沙錐'), '0173');
  assert.equal(resolveBirdId('Gallinago hardwickii'), '0173');
});
