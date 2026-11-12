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
    export { InfoCardReader, InfoCardScores } from './src/components/InfoCardReader';
    export { ResearchHubPage } from './src/components/ResearchHubPage';
    export { infoCardLayout, localInfoCardUrl } from './src/lib/infoCards';`,
    resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'cjs', outfile, jsx: 'automatic',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/') },
});
const { renderToStaticMarkup, createElement, InfoCardReader, InfoCardScores, ResearchHubPage, infoCardLayout, localInfoCardUrl } = createRequire(import.meta.url)(outfile);
const render = (component, props) => renderToStaticMarkup(createElement(component, props));
const rawScores = JSON.parse(readFileSync(path.join(root, 'src/data/dexScores.json'))).scores;

test('0058 reader reflows known slim panels, without changing the downloadable image', () => {
  const html = render(InfoCardReader, { id: '0058', url: '/demo/info-0058.webp', name: '中華秋沙鴨', lang: 'zh' });
  assert.equal(infoCardLayout('58'), 'slim');
  assert.equal(infoCardLayout('0001'), 'legacy');
  assert.ok(localInfoCardUrl('58').endsWith('demo/info-0058.webp'));
  assert.ok(html.includes('viewBox="36 1186 504 314"'));
  assert.ok(html.includes('viewBox="556 1186 432 314"'));
  assert.equal((html.match(/<image /g) || []).length, 6);
  assert.ok(html.includes('向下滑動'));
  assert.ok(html.includes('w-full h-auto'));
});

test('radar uses the same score source as the card, with readable live labels and values', () => {
  const html = render(InfoCardScores, { id: '0058', lang: 'zh' });
  for (const [key, name] of [['i', '重要性'], ['a', '適應力'], ['r', '研究'], ['c', '保育'], ['v', '觀賞']]) {
    assert.ok(html.includes(`<dt>${name}</dt>`));
    assert.ok(html.includes(rawScores['0058'][key].toFixed(1)));
  }
  assert.ok(html.includes('font-size="15"'));
  assert.ok(html.includes('font-size="20"'));
  assert.ok(html.includes('非學術評分'));
  assert.equal(render(InfoCardScores, { id: 'missing', lang: 'zh' }), '');
});

test('legacy cards remain intact, never cropped using slim coordinates', () => {
  const html = render(InfoCardReader, { id: '0001', url: '/legacy.avif', name: 'Bird', lang: 'en' });
  assert.ok(html.includes('src="/legacy.avif"'));
  assert.ok(html.includes('Bird info card'));
  assert.equal(html.includes('<image '), false);
  assert.equal(html.includes('object-contain'), false);
});

test('both device modes use the reader; fullscreen back is not locked to a square', () => {
  const src = readFileSync(path.join(root, 'src/components/PokedexDevice.tsx'), 'utf8');
  assert.equal((src.match(/<InfoCardReader /g) || []).length, 2);
  assert.ok(src.includes('overflow-y-auto overscroll-contain touch-pan-y'));
  assert.ok(src.includes("screenFlipped ? 'relative' : 'absolute inset-0 pointer-events-none'"));
  assert.ok(src.includes("screenFlipped ? 'hidden' : ''"));
});

test('download keeps the original image URL and correct format, independent of reader layout', () => {
  for (const extension of ['webp', 'avif', 'png']) {
    const url = `/demo/info-0058.${extension}`;
    const html = render(ResearchHubPage, { zhName: 'Bird', enName: 'Bird', sciName: 'Bird', lang: 'en', infoUrl: url });
    assert.ok(html.includes(`href="${url}"`));
    assert.ok(html.includes(`download="aviandex-Bird-info.${extension}"`));
  }
});
