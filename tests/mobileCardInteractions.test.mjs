import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { createElement, act } from 'react';
import { createRoot } from 'react-dom/client';
import handler from '../api/card.js';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'node_modules/.cache/mobile-interactions');
mkdirSync(dir, { recursive: true });
const outfile = path.join(dir, 'reader.mjs');
await build({
  stdin: { contents: `export { MobileCardPages } from './src/components/InfoCardReader';
    export { BirdNavigator } from './src/components/BirdNavigator';
    export { infoCardUrl, cardProxyUrl, artUrl } from './src/config';`, resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'esm', outfile, jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/'), 'import.meta.env.VITE_R2_BASE_URL': JSON.stringify('https://cdn.example.test') },
});
const { MobileCardPages, BirdNavigator, infoCardUrl, cardProxyUrl, artUrl } = await import(pathToFileURL(outfile));

test('0001 cycles through all five pages by tap; controls, swipe and vertical scroll never double-advance', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://app.example.test/' });
  const globals = ['window', 'document', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'IS_REACT_ACT_ENVIRONMENT'];
  const previous = new Map(globals.map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  for (const k of globals) Object.defineProperty(globalThis, k, { configurable: true, writable: true, value: k === 'IS_REACT_ACT_ENVIRONMENT' ? true : k === 'window' ? dom.window : dom.window[k] });
  const el = dom.window.document.getElementById('root');
  const r = createRoot(el);
  let probes = 0, nextBird = 0, outerClick = 0;
  const expanded = [];
  const sections = [];
  const page = () => el.querySelector('[data-card-page]').dataset.cardPage;
  const click = async node => act(() => { node.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); });
  let clock = 1000;
  const originalNow = Date.now;
  Date.now = () => clock;
  try {
    await act(() => r.render(createElement('div', { onClick() { outerClick++; } }, createElement(MobileCardPages, {
      id: '0001', name: '珠頸斑鳩', lang: 'en', artwork: createElement('img', { src: '/art.avif', alt: 'Bird artwork' }),
      infoUrl: infoCardUrl('0001'), infoStatus: 'loaded', onInfo() { probes++; }, onExpand(info) { expanded.push(info); }, onPageChange(key) { sections.push(key); },
      navigation: createElement(BirdNavigator, { overlay: true, lang: 'en', id: '0001', name: 'Bird', index: 0, total: 2, onPrevious() {}, onNext() { nextBird++; } }),
    }))));
    const region = el.querySelector('[data-mobile-card-pages]');
    const expand = () => el.querySelector('[aria-label="Expand full card"]');
    assert.equal(page(), 'artwork');
    await click(expand());
    assert.deepEqual(expanded, [false]);
    assert.equal(page(), 'artwork');
    for (const key of ['features', 'scores', 'distribution', 'similar', 'artwork']) {
      await click(el.querySelector('[data-card-page]'));
      assert.equal(page(), key);
    }
    assert.equal(probes, 4);
    assert.deepEqual(sections, ['features', 'scores', 'distribution', 'similar', 'artwork'], 'parent screen resizes to each section including wraparound');
    assert.equal(outerClick, 0, 'never trigger desktop flip handler');
    await click(el.querySelector('[aria-label="Next bird"]'));
    assert.equal(nextBird, 1);
    assert.equal(page(), 'artwork', 'species arrow is not a card-page button');
    await click(el.querySelector('[aria-label="Previous bird"]'));
    assert.equal(page(), 'artwork', 'disabled species arrow cannot advance card');
    const touch = async (type, x, y) => act(() => {
      const e = new dom.window.Event(type, { bubbles: true });
      Object.defineProperty(e, type === 'touchstart' ? 'touches' : 'changedTouches', { value: [{ clientX: x, clientY: y }] });
      region.dispatchEvent(e);
    });
    await touch('touchstart', 220, 100);
    await touch('touchend', 80, 102);
    assert.equal(page(), 'features');
    await click(region);
    assert.equal(page(), 'features', 'synthetic click after swipe must not skip scores');
    clock += 600;
    await click(expand());
    assert.deepEqual(expanded, [false, true]);
    assert.equal(page(), 'features');
    await touch('touchstart', 100, 100);
    await touch('touchend', 104, 240);
    await click(region);
    assert.equal(page(), 'features', 'scroll gesture must not turn a page');
    clock += 600;
    await act(() => region.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    assert.equal(page(), 'scores');
    await act(() => region.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })));
    assert.equal(page(), 'features');
    assert.ok(el.querySelector('clipPath'), 'feature page crops the uploaded original card');
  } finally {
    Date.now = originalNow;
    await act(() => r.unmount());
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});

test('replacement info card has a cache revision; legacy info and all illustrations keep their URLs', () => {
  assert.equal(infoCardUrl('1'), 'https://cdn.example.test/aviandex/0001.avif?v=restart-0001-v1');
  assert.ok(cardProxyUrl('1', 'avif', 'aviandex').endsWith('&v=restart-0001-v1'));
  for (const id of ['0002', '0003', '0004', '0100', '0120']) {
    assert.equal(infoCardUrl(id), `https://cdn.example.test/aviandex/${id}.avif?v=restart-${id}-v1`);
    assert.ok(cardProxyUrl(id, 'avif', 'aviandex').endsWith(`&v=restart-${id}-v1`));
  }
  assert.equal(infoCardUrl('4'), 'https://cdn.example.test/aviandex/0004.avif?v=restart-0004-v1');
  assert.equal(artUrl('1'), 'https://cdn.example.test/birdcards/0001.avif');
});

test('proxy forwards valid revision to R2 and rejects invalid versions without fetching', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async url => { requests.push(url); return new Response(new Uint8Array([1]), { headers: { 'Content-Type': 'image/avif' } }); };
  const response = () => ({ code: 200, status(code) { this.code = code; return this; }, setHeader() { return this; }, end() {}, send() {} });
  try {
    const ok = response();
    await handler({ method: 'GET', query: { id: '1', folder: 'aviandex', v: 'restart-0001-v1' } }, ok);
    assert.equal(ok.code, 200);
    assert.ok(requests[0].endsWith('/aviandex/0001.avif?v=restart-0001-v1'));
    const bad = response();
    await handler({ method: 'GET', query: { id: '1', folder: 'aviandex', v: '../other' } }, bad);
    assert.equal(bad.code, 400);
    assert.equal(requests.length, 1);
  } finally { globalThis.fetch = originalFetch; }
});
