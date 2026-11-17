import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import '../public/store_gate_v1.0.js';

const gate = globalThis.ScoutStoreGate;
const config = {
  appKey: 'aviandex',
  mode: 'entry-gate',
  portalIds: ['appstore', 'library'],
  portals: [{ id: 'birddex3', url: 'https://birddex3.vercel.app/', labelZh: 'BIRD-DEX 3', labelEn: 'BIRD-DEX 3' }],
  allowStandalone: true,
};

test('AvianDex entry gate allows approved portals and installed standalone PWA only', () => {
  assert.equal(typeof gate?.evaluateStoreGate, 'function');
  const decide = (referrer, standalone = false) => gate.evaluateStoreGate(config, {
    inIframe: false,
    standalone,
    hasSessionPass: false,
    referrer,
    selfOrigin: 'https://avian-dex.vercel.app',
  });

  assert.equal(decide('https://scoutappstore.vercel.app/').allowed, true);
  assert.equal(decide('https://scout-circulars.vercel.app/').allowed, true);
  assert.equal(decide('https://birddex3.vercel.app/').allowed, true);
  assert.equal(decide('', true).reason, 'standalone-pwa');
  assert.equal(decide('').allowed, false);
  assert.equal(decide('https://scoutappstore.vercel.app.evil.test/').allowed, false);
});

test('production HTML activates the gate while local and Arena preview bypass only the gate', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /src="\/store_gate_v1\.0\.js"/);
  assert.match(html, /mode: localOrArenaPreview \? 'open' : 'entry-gate'/);
  assert.match(html, /portalIds: \['appstore', 'library'\]/);
  assert.match(html, /id: 'birddex3'/);
  assert.match(html, /https:\/\/birddex3\.vercel\.app\//);
  assert.match(html, /allowStandalone: true/);
});
