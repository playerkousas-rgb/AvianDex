import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { parseBodyLength, parseConservation, buildFilterTraits } from '../scripts/cards/build-filter-traits.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, 'src/data', p), 'utf8'));
const outdir = fs.mkdtempSync(path.join(tmpdir(), 'bird-filters-'));
await build({ entryPoints: [path.join(root, 'src/lib/explorer.ts')], outfile: path.join(outdir, 'explorer.mjs'), bundle: true, platform: 'node', format: 'esm' });
const { filterByFacets, emptyFacets, hasActiveFacets, sizeCategory, FILTER_TRAITS, SIZE_TAGS, IUCN_TAGS, ENTRIES } = await import(pathToFileURL(path.join(outdir, 'explorer.mjs')));
await build({ stdin: { contents: `export { BirdNavigator } from './src/components/BirdNavigator'; export { ExplorerPanel } from './src/components/ExplorerPanel'; export { createElement } from 'react'; export { renderToStaticMarkup } from 'react-dom/server';`, resolveDir: root, loader: 'tsx' }, outfile: path.join(outdir, 'ui.cjs'), bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic' });
const { BirdNavigator, ExplorerPanel, createElement, renderToStaticMarkup } = createRequire(import.meta.url)(path.join(outdir, 'ui.cjs'));
const render = (c, props) => renderToStaticMarkup(createElement(c, props));

test('explicit cm lengths, ranges and imperial conversions; no guessed missing lengths', () => {
  for (const [raw, expected] of [['19 cm', 19], ['14–16 cm', 15], ['19 cm (7.5 in)', 19], ['19 cm–21 cm', 20], ['約 20 公分', 20], ['', null], ['2 cm', null], ['310 cm', null], ['30-20 cm', null], ['wing: 138 mm', null], ['19', null]]) assert.equal(parseBodyLength(raw), expected, raw);
  assert.equal(parseConservation('瀕危 EN'), 'EN');
  assert.equal(parseConservation('資料缺乏 DD'), 'DD');
  assert.equal(parseConservation(''), 'UNKNOWN');
});

test('filter traits are reproducibly generated for all 583 birds from existing sources', () => {
  const birds = read('birds.json');
  const generated = buildFilterTraits(birds, read('cardCopy.json'), read('cardDetails.zh.json').birds);
  assert.equal(Object.keys(generated).length, 583);
  assert.deepEqual(generated, read('filterTraits.json').birds);
  assert.equal(generated['0058'].iucn, 'EN');
  assert.equal(generated['0058'].lengthCm, null, 'must not estimate length from wing measurement');
  assert.equal(generated['0562'].iucn, 'CR');
});

test('size bins have no gaps/overlaps at boundaries and expose unknown data', () => {
  for (const [value, expected] of [[14.9, 'tiny'], [15, 'small'], [24.9, 'small'], [25, 'medium'], [49.9, 'medium'], [50, 'large'], [99.9, 'large'], [100, 'huge'], [null, 'unknown'], [0, 'unknown'], [NaN, 'unknown']]) assert.equal(sizeCategory(value), expected);
  assert.ok(SIZE_TAGS.some(t => t.id === 'unknown'));
  assert.ok(IUCN_TAGS.some(t => t.id === 'DD'));
  assert.ok(IUCN_TAGS.some(t => t.id === 'NE'));
});

test('size and IUCN work independently; within-group OR, between-group AND; preserve order', () => {
  const ids = Object.keys(FILTER_TRAITS).reverse();
  const f = { ...emptyFacets(), size: ['small'], iucn: ['CR', 'EN'], mode: 'all' };
  const expected = ids.filter(id => ENTRIES[id] && sizeCategory(FILTER_TRAITS[id].lengthCm) === 'small' && ['CR', 'EN'].includes(FILTER_TRAITS[id].iucn));
  assert.ok(expected.includes('0562'));
  assert.deepEqual(filterByFacets(ids, f), expected);
  assert.deepEqual(filterByFacets(ids, { ...emptyFacets(), iucn: ['EN'] }), ids.filter(id => ENTRIES[id] && FILTER_TRAITS[id].iucn === 'EN'));
  assert.ok(filterByFacets(ids, { ...emptyFacets(), size: ['unknown'] }).includes('0058'));
  assert.ok(hasActiveFacets({ ...emptyFacets(), size: ['large'] }));
  assert.ok(!hasActiveFacets(emptyFacets()));
  assert.deepEqual(filterByFacets(ids, emptyFacets()), ids);
});

test('diet/habitat combine with new facets without changing ANY/ALL rules', () => {
  const ids = Object.keys(FILTER_TRAITS);
  const facets = { ...emptyFacets(), diet: ['insect', 'seed'], habitat: ['forest'], size: ['small', 'medium'], iucn: ['LC'], mode: 'all' };
  const expected = ids.filter(id => {
    const e = ENTRIES[id]; const t = FILTER_TRAITS[id];
    return e && e.d.includes('insect') && e.d.includes('seed') && e.h.includes('forest') && ['small', 'medium'].includes(sizeCategory(t.lengthCm)) && t.iucn === 'LC';
  });
  assert.deepEqual(filterByFacets(ids, facets), expected);
});

test('filter UI is controlled and lists both new groups in Chinese and English', () => {
  for (const lang of ['zh', 'en']) {
    const html = render(ExplorerPanel, { lang, query: '', orderedIds: ['0008', '0058', '0562'], facets: { ...emptyFacets(), iucn: ['EN'] }, onFacetsChange() {}, onQueryChange() {}, onPick() {} });
    assert.ok(html.includes('aria-pressed="true"'));
    assert.ok(html.includes(lang === 'zh' ? '鳥類大小（體長）' : 'Bird size (body length)'));
    assert.ok(html.includes(lang === 'zh' ? '稀有度／瀕危等級' : 'Rarity / threat category'));
    assert.ok(html.includes('NO.0058'));
    assert.equal(html.includes('NO.0008'), false);
    assert.ok(html.includes(lang === 'zh' ? '並非香港出現頻率' : 'not Hong Kong sighting frequency'));
  }
});

test('shared species navigator handles list boundaries and is mounted above all three tabs', () => {
  const props = { lang: 'en', id: '0058', name: 'Scaly-sided Merganser', total: 3, onPrevious() {}, onNext() {} };
  const start = render(BirdNavigator, { ...props, index: 0 });
  const end = render(BirdNavigator, { ...props, index: 2 });
  assert.match(start, /aria-label="Previous bird" disabled/);
  assert.doesNotMatch(start, /aria-label="Next bird" disabled/);
  assert.match(end, /aria-label="Next bird" disabled/);
  const src = fs.readFileSync(path.join(root, 'src/components/PokedexDevice.tsx'), 'utf8');
  assert.equal((src.match(/<BirdNavigator /g) || []).length, 2, 'mobile overlay and unchanged desktop navigator');
  assert.ok(src.includes('navigation={<BirdNavigator overlay'));
  assert.ok(src.includes('data-mobile-bird-title'));
  assert.ok(src.indexOf('<BirdNavigator ') < src.indexOf('{page === 1 &&'));
  assert.ok(src.includes('sticky top-0'));
  const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
  assert.ok(app.includes('facets={facets}'));
  assert.ok(app.includes('onFacetsChange={(next) => { setFacets(next);'));
  assert.ok(app.includes('orderedIds={candidateBirds.map'));
  assert.ok(app.includes('const dexBirds = filteredBirds;'));
});
