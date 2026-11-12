import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(mkdtempSync(path.join(tmpdir(), 'info-reader-')), 'reader.cjs');
await build({
  stdin: { contents: `export { renderToStaticMarkup } from 'react-dom/server';
    export { createElement } from 'react';
    export { MobileCardPages, OriginalInfoCard, InfoCardScores, CardPanel } from './src/components/InfoCardReader';
    export { ResearchHubPage } from './src/components/ResearchHubPage';
    export { infoCardLayout, localInfoCardUrl } from './src/lib/infoCards';
    export { mobileCardPages, nextMobileCardPage, SLIM_PAGE_BOXES } from './src/lib/mobileInfoPages';`,
    resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'cjs', outfile, jsx: 'automatic',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/') },
});
const { renderToStaticMarkup, createElement, MobileCardPages, OriginalInfoCard, InfoCardScores, CardPanel, ResearchHubPage, infoCardLayout, localInfoCardUrl, mobileCardPages, nextMobileCardPage, SLIM_PAGE_BOXES } = createRequire(import.meta.url)(outfile);
const render = (component, props) => renderToStaticMarkup(createElement(component, props));
const rawScores = JSON.parse(readFileSync(path.join(root, 'src/data/dexScores.json'))).scores;

test('mobile 0058 has exactly five ordered pages; layout coordinates are explicit', () => {
  assert.deepEqual(mobileCardPages('0058').map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
  assert.equal(infoCardLayout('58'), 'slim');
  assert.ok(localInfoCardUrl('58').endsWith('demo/info-0058.webp'));
  assert.deepEqual(SLIM_PAGE_BOXES.features, [36, 36, 952, 624]);
  assert.deepEqual(SLIM_PAGE_BOXES.distribution, [36, 1186, 504, 314]);
  assert.deepEqual(SLIM_PAGE_BOXES.similar, [556, 1186, 432, 314]);
  assert.equal(nextMobileCardPage(0, -1, 5), 0);
  assert.equal(nextMobileCardPage(4, 1, 5), 4);
  assert.equal(nextMobileCardPage(1, 1, 5), 2);
});

test('mobile pager has accessible navigation and starts with artwork, not a long reader', () => {
  const html = render(MobileCardPages, { id: '0058', name: 'Bird', lang: 'en', artwork: 'ARTWORK', infoStatus: 'idle', onInfo() {}, onExpand() {} });
  assert.ok(html.includes('md:hidden'));
  assert.ok(html.includes('data-card-page="artwork"'));
  assert.ok(html.includes('ARTWORK'));
  assert.equal((html.match(/role="tab"/g) || []).length, 0);
  assert.equal(html.includes('Previous card page'), false);
  assert.equal(html.includes('Next card page'), false);
  assert.equal(html.includes('1/5'), false);
  assert.ok(html.includes('aria-label="Expand full card"'));
  assert.ok(html.includes('Card: swipe left or right to change section'));
});

test('radar uses the same score source as the card, with readable live labels and values', () => {
  const html = render(InfoCardScores, { id: '0058', lang: 'zh' });
  for (const [key, name] of [['i', '重要性'], ['a', '適應力'], ['r', '研究'], ['c', '保育'], ['v', '觀賞']]) {
    assert.ok(html.includes(`<dt>${name}</dt>`));
    assert.ok(html.includes(rawScores['0058'][key].toFixed(1)));
  }
  assert.ok(html.includes('font-size="18"'));
  assert.ok(html.includes('font-size="24"'));
  assert.ok(html.includes('非學術評分'));
  assert.equal(render(InfoCardScores, { id: 'missing', lang: 'zh' }), '');
});

test('unknown legacy layouts are never guessed; unmade cards have artwork only', () => {
  assert.deepEqual(mobileCardPages('0001').map(p => p.key), ['artwork', 'original']);
  assert.deepEqual(mobileCardPages('0022').map(p => p.key), ['artwork']);
});

test('desktop and fullscreen show only original images, not cropped sections or added scores', () => {
  for (const fitted of [true, false]) {
    const html = render(OriginalInfoCard, { url: '/demo/info-0058.webp', name: 'Bird', lang: 'en', fitted });
    assert.ok(html.includes('src="/demo/info-0058.webp"'));
    assert.equal(html.includes('<svg'), false);
    assert.equal(html.includes('object-contain'), fitted);
    assert.equal(html.includes('h-auto'), !fitted);
  }
  const src = readFileSync(path.join(root, 'src/components/PokedexDevice.tsx'), 'utf8');
  assert.equal((src.match(/<OriginalInfoCard /g) || []).length, 2);
  assert.ok(src.includes('hidden md:block relative w-full h-full'));
  assert.ok(src.includes('<MobileCardPages key={currentBird.id}'));
  assert.ok(src.includes('setScreenFlipped(information); setIsFullscreen(true)'));
  assert.ok(src.includes('key="fullscreen-card"'));
  assert.ok(src.includes('key="pokedex-device"'));
});

test('download keeps the original image URL and correct format, independent of reader layout', () => {
  for (const extension of ['webp', 'avif', 'png']) {
    const url = `/demo/info-0058.${extension}`;
    const html = render(ResearchHubPage, { zhName: 'Bird', enName: 'Bird', sciName: 'Bird', lang: 'en', infoUrl: url });
    assert.ok(html.includes(`href="${url}"`));
    assert.ok(html.includes(`download="aviandex-Bird-info.${extension}"`));
  }
});


test('panel crops cannot leak other sections into viewport letterboxing', () => {
  for (const box of Object.values(SLIM_PAGE_BOXES)) {
    const html = render(CardPanel, { url: '/demo/info-0058.webp', box, label: 'Panel' });
    assert.ok(html.includes('<clipPath'));
    assert.ok(html.includes('clip-path="url(#'));
    assert.ok(html.includes(`x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"`));
  }
});
