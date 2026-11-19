import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
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

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const bootstrap = html.match(/<script data-aviandex-entry-gate>([\s\S]*?)<\/script>/)?.[1];

function gateOptions(url, dev = false) {
  assert.ok(bootstrap, 'entry-gate bootstrap must be present');
  let options;
  runInNewContext(bootstrap.replaceAll('%DEV%', String(dev)), {
    window: { location: new URL(url), initStoreGate: (value) => { options = value; } },
  });
  return options;
}

test('dev preview skips the store gate without relying on the proxy hostname or referrer', () => {
  assert.equal(gateOptions('https://live-preview.example.test/', true), undefined);
});

test('built app opens directly on loopback and on the Arena preview host', () => {
  for (const url of [
    'http://localhost:4173/', 'http://127.0.0.1:4173/', 'http://[::1]:4173/',
    'https://4173-test-sandbox.e2b.app/',
  ]) {
    assert.equal(gateOptions(url), undefined, url);
  }
});

test('production HTML still activates the approved entry routes', () => {
  assert.match(html, /src="\/store_gate_v1\.0\.js"/);
  for (const url of ['https://avian-dex.vercel.app/', 'https://preview.e2b.app.example.test/']) {
    const options = gateOptions(url);
    assert.equal(options.mode, 'entry-gate');
    assert.deepEqual([...options.portalIds], ['appstore', 'library']);
    assert.equal(options.portals[0].id, 'birddex3');
    assert.equal(options.portals[0].url, 'https://birddex3.vercel.app/');
    assert.equal(options.allowStandalone, true);
  }
});
