import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(mkdtempSync(path.join(tmpdir(), 'card-number-')), 'cards.cjs');
await build({
  stdin: { contents: `export { FlipCard } from './src/components/FlipCard';
    export { BirdCard } from './src/components/BirdCard';
    export { createElement } from 'react';
    export { renderToStaticMarkup } from 'react-dom/server';`, resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'cjs', outfile, jsx: 'automatic',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/') },
  plugins: [{ name: 'loaded-card-images', setup(b) {
    b.onLoad({ filter: /hooks\/useCardImage\.ts$/ }, () => ({ contents: `
      export const useCardImage = () => ({ status: 'loaded', url: '/bird.avif', retry() {} });
      export const useInfoCard = () => ({ status: 'idle', probe() {} });`, loader: 'js' }));
  } }],
});
const { FlipCard, BirdCard, createElement, renderToStaticMarkup } = createRequire(import.meta.url)(outfile);
const birds = JSON.parse(readFileSync(path.join(root, 'src/data/birds.json')));

test('grid cards keep permanent NO. IDs and never render a secondary #rank badge', () => {
  for (const Component of [FlipCard, BirdCard]) {
    for (const lang of ['zh', 'en']) {
      for (const id of ['0106', '0107', '0583']) {
        const bird = { ...birds.find(b => b.id === id), englishName: 'Bird' };
        const html = renderToStaticMarkup(createElement(Component, {
          bird, lang, onOpen() {}, onClick() {}, listPosition: 93,
        }));
        assert.ok(html.includes(`NO.${id}`));
        assert.equal(html.includes('#93'), false, `${Component.name} must ignore obsolete rank props`);
        assert.equal(html.includes('right-10 bg-black/55'), false, 'no empty rank badge background');
      }
    }
  }
});

test('App passes the bird ID only, not a display-rank prop that changes under sorting', () => {
  const app = readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
  assert.doesNotMatch(app, /listPosition=/);
  assert.match(app, /pagedBirds\.map\(\(bird\) =>/);
});
