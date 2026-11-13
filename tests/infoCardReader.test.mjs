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
    export { WelcomeScreen } from './src/components/WelcomeScreen';
    export { infoCardLayout, localInfoCardUrl, hasInfoCard, canFlipInfoCard } from './src/lib/infoCards';
    export { mobileCardPages, nextMobileCardPage, mobileCardAspect, SLIM_PAGE_BOXES } from './src/lib/mobileInfoPages';`,
    resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'cjs', outfile, jsx: 'automatic',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/') },
});
const { renderToStaticMarkup, createElement, MobileCardPages, OriginalInfoCard, InfoCardScores, CardPanel, ResearchHubPage, WelcomeScreen, infoCardLayout, localInfoCardUrl, hasInfoCard, canFlipInfoCard, mobileCardPages, nextMobileCardPage, mobileCardAspect, SLIM_PAGE_BOXES } = createRequire(import.meta.url)(outfile);
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
  assert.ok(html.includes('Card: tap to change section or swipe left or right'));
  assert.ok(html.includes('absolute bottom-2 right-2'));
  assert.equal(html.includes('flex items-center justify-between px-2 py-1'), false);
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
  assert.equal(infoCardLayout('1'), 'slim');
  assert.equal(localInfoCardUrl('0001'), undefined, 'uploaded 0001 must load from R2, not a local demo');
  assert.deepEqual(mobileCardPages('0001').map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
  for (const id of ['0002', '0003']) {
    assert.equal(localInfoCardUrl(id), undefined);
    assert.equal(infoCardLayout(id), 'slim');
    assert.deepEqual(mobileCardPages(id).map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
  }
  /* 0040 已上載 R2 但未在 infoCards.json：不再硬套 slim 分區，改為成功讀到圖
     之後才多出「完整資訊卡」一頁。 */
  assert.deepEqual(mobileCardPages('0040').map(p => p.key), ['artwork']);
  /* 未登記的卡（例如已上載 R2 但 infoCards.json 未更新的 0022、0040）仍可翻：
     讀到圖就有「完整資訊卡」一頁，讀不到就只有插畫，不會翻出空頁。 */
  assert.deepEqual(mobileCardPages('0022').map(p => p.key), ['artwork']);
  assert.deepEqual(mobileCardPages('0022', true).map(p => p.key), ['artwork', 'original']);
  assert.deepEqual(mobileCardPages('0040', true).map(p => p.key), ['artwork', 'original']);
});

test('flip is offered whenever a card may exist, not only when it is registered', () => {
  assert.equal(canFlipInfoCard('0001'), true, 'registered card can flip');
  assert.equal(hasInfoCard('0040'), false, '0040 is not in infoCards.json');
  assert.equal(hasInfoCard('0022'), false, '0022 is not in the registry');
  assert.equal(canFlipInfoCard('0040'), true, 'every card may be flippable; the loader reports whether R2 has the file');
  assert.equal(canFlipInfoCard('0105'), true, 'newly delivered cards must be inspectable too');
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


test('mobile screen has no bird-title strip or cream padding; cropped pages extend a dark surface without distorting content', () => {
  const device = readFileSync(path.join(root, 'src/components/PokedexDevice.tsx'), 'utf8');
  assert.equal(device.includes('data-mobile-bird-title'), false);
  assert.ok(device.includes('bg-[#1c212e] md:bg-[#f3ecd8]'));
  assert.ok(device.includes('p-0 md:p-2'));
  assert.ok(device.includes('mobileCardAspect(mobilePage)'));
  assert.equal(device.includes('min-h-[68%]'), false);
  assert.ok(device.includes('onPageChange={setMobilePage}'));
  for (const page of ['features', 'distribution', 'similar']) {
    assert.equal(mobileCardAspect(page), SLIM_PAGE_BOXES[page][2] / SLIM_PAGE_BOXES[page][3]);
  }
  assert.equal(mobileCardAspect('artwork'), 1);
  assert.equal(mobileCardAspect('scores'), 1);
  assert.equal(mobileCardAspect('original'), 2 / 3);
  for (const box of Object.values(SLIM_PAGE_BOXES)) {
    const html = render(CardPanel, { url: '/card.avif', box, label: 'Panel', surface: '#2e1c0c' });
    assert.ok(html.includes('background-color:#2e1c0c'));
    assert.ok(html.includes('preserveAspectRatio="xMidYMid meet"'));
    assert.ok(html.includes('w-full h-full'));
    assert.ok(html.includes('<clipPath'));
  }
});

test('research offers only info-card open/save, never illustration links, in both languages', () => {
  for (const lang of ['zh', 'en']) {
    for (const infoUrl of [undefined, '/aviandex/0002.avif?v=restart-0002-v1']) {
      const html = render(ResearchHubPage, { zhName: 'Bird', enName: 'Bird', sciName: 'Milvus migrans', lang,
        cardUrl: '/birdcards/0002.avif', infoUrl });
      assert.equal(html.includes('/birdcards/'), false);
      assert.equal(html.includes('Just the artwork'), false);
      assert.equal(html.includes('開插畫原圖'), false);
      assert.equal((html.match(/download=/g) || []).length, infoUrl ? 1 : 0);
      if (infoUrl) {
        assert.ok(html.includes('download="aviandex-Bird-info.avif"'));
        assert.ok(html.includes('href="/aviandex/0002.avif?v=restart-0002-v1"'));
      }
    }
  }
});

test('welcome has only the AvianDex boot action; in-device BIRD-DEX ball remains', () => {
  const html = render(WelcomeScreen, { onOpen() {} });
  assert.equal((html.match(/<button/g) || []).length, 1);
  assert.ok(html.includes('開啟 AvianDex 圖鑑'));
  assert.equal(html.includes('BIRD-DEX'), false);
  const source = readFileSync(path.join(root, 'src/components/WelcomeScreen.tsx'), 'utf8');
  assert.equal(source.includes('window.open'), false);
  assert.equal(source.includes('skw-birdex2'), false);
  const device = readFileSync(path.join(root, 'src/components/PokedexDevice.tsx'), 'utf8');
  assert.ok(device.includes('前往 BIRD-DEX 2 捕捉精靈'));
});
