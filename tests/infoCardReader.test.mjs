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
    export { BirdCaptureLink } from './src/components/BirdCaptureLink';
    export { infoCardLayout, localInfoCardUrl, hasInfoCard, canFlipInfoCard } from './src/lib/infoCards';
    export { mobileCardPages, nextMobileCardPage, mobileCardAspect, SLIM_PAGE_BOXES } from './src/lib/mobileInfoPages';`,
    resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'cjs', outfile, jsx: 'automatic',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/'), 'import.meta.env.VITE_R2_BASE_URL': 'undefined' },
});
const { renderToStaticMarkup, createElement, MobileCardPages, OriginalInfoCard, InfoCardScores, CardPanel, ResearchHubPage, WelcomeScreen, BirdCaptureLink, infoCardLayout, localInfoCardUrl, hasInfoCard, canFlipInfoCard, mobileCardPages, nextMobileCardPage, mobileCardAspect, SLIM_PAGE_BOXES } = createRequire(import.meta.url)(outfile);
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

test('unknown legacy layouts are never guessed; 0201+ slim cards split after successful load', () => {
  assert.equal(infoCardLayout('1'), 'slim');
  assert.equal(localInfoCardUrl('0001'), undefined, 'uploaded 0001 must load from R2, not a local demo');
  assert.deepEqual(mobileCardPages('0001').map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
  for (const id of ['0002', '0003']) {
    assert.equal(localInfoCardUrl(id), undefined);
    assert.equal(infoCardLayout(id), 'slim');
    assert.deepEqual(mobileCardPages(id).map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
  }
  /* 0040 已上載 R2 並已登記 slim：手機照樣切五頁，不再只給一張完整卡。 */
  assert.deepEqual(mobileCardPages('0040').map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
  assert.deepEqual(mobileCardPages('0040', true).map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
  /* 201+ slim 卡未登記 metadata 時，讀到圖也要切成四個資訊區，而非整張長卡。 */
  assert.deepEqual(mobileCardPages('0201').map(p => p.key), ['artwork']);
  assert.deepEqual(mobileCardPages('0201', true).map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
  assert.deepEqual(mobileCardPages('0200').map(p => p.key), ['artwork', 'features', 'scores', 'distribution', 'similar']);
});

test('the whole delivered range 0001–0120 is registered slim, so every page is cut', () => {
  for (let n = 1; n <= 120; n += 1) {
    const id = String(n).padStart(4, '0');
    assert.equal(hasInfoCard(id), true, `${id} must be in infoCards.json`);
    assert.equal(infoCardLayout(id), 'slim', `${id} is a slim card`);
  }
  /* 0040–0043 已交付的都是 slim 卡，模組位置與模板一致：一律切五頁。
     2026-11 用戶回報過這三張翻出整張長卡，所以逐張鎖住。 */
  for (const id of ['0040', '0041', '0042', '0043']) {
    assert.deepEqual(mobileCardPages(id).map(p => p.key),
      ['artwork', 'features', 'scores', 'distribution', 'similar'], `${id} must cut into five pages`);
    assert.deepEqual(mobileCardPages(id, true).map(p => p.key),
      ['artwork', 'features', 'scores', 'distribution', 'similar'], `${id} must not add an original page`);
  }
  assert.deepEqual(mobileCardPages('0117').map(p => p.key),
    ['artwork', 'features', 'scores', 'distribution', 'similar']);
});

test('panelColors matches each card\'s real theme background, not a hard-coded navy', () => {
  /* 2026-11：全部 155 張的 panelColors 都寫成 #173446 深藍，但 compose-card.py 的
     apply_theme() 是按「目」分組上色（水鳥藍／猛禽棕／雀形綠／其他灰藍），底色再由
     dark(theme, 0.82) 算出來。於是 0156 橙腹葉鵯（雀形目）的卡是深綠，分頁留白卻
     露深藍邊。這裡照 renderer 的公式重算一次，任何新卡寫死深藍都會被擋下。
     期望值由 THEMES 四色 × dark(0.82) 得來，與已交付的 0155／0156 實測相差 ≤1
     （AVIF 有損）。 */
  const BG = { water: '#06121a', raptor: '#150d05', passerine: '#07100a', other: '#0d0f15' };
  const WATER = new Set(['Anseriformes', 'Podicipediformes', 'Suliformes', 'Pelecaniformes',
    'Charadriiformes', 'Gruiformes', 'Phaethontiformes', 'Procellariiformes', 'Gaviiformes',
    'Ciconiiformes', 'Phoenicopteriformes']);
  const RAPTOR = new Set(['Accipitriformes', 'Falconiformes', 'Strigiformes']);
  const taxonomy = JSON.parse(readFileSync(path.join(root, 'src/data/birdTaxonomy.json'), 'utf8'));
  const cards = JSON.parse(readFileSync(path.join(root, 'src/data/infoCards.json'), 'utf8'));
  for (const id of cards.ids) {
    const order = taxonomy[id]?.order ?? '';
    const group = WATER.has(order) ? 'water' : RAPTOR.has(order) ? 'raptor'
      : order === 'Passeriformes' ? 'passerine' : 'other';
    assert.equal(cards.panelColors[id], BG[group], `${id} (${order}) must use the ${group} background`);
  }
  assert.equal(cards.panelColors['0156'], BG.passerine, '0156 橙腹葉鵯 is a passerine, so a green card');
  assert.equal(cards.panelColors['0155'], BG.water, '0155 丘鷸 is a charadriiform, so a blue card');
});

test('0121–0124 are registered slim too, not only up to 0120', () => {
  /* 這四張早已交付並上載 Drive，但 registry 當時只擴到 0120，於是它們在 app 裡
     退回「插畫 + 完整資訊卡」：整張長卡被塞進單一面板，正是 0040–0043 的舊缺陷。 */
  for (const id of ['0121', '0122', '0123', '0124']) {
    assert.equal(hasInfoCard(id), true, `${id} must be in infoCards.json`);
    assert.equal(infoCardLayout(id), 'slim', `${id} is a slim card`);
    assert.deepEqual(mobileCardPages(id, true).map(p => p.key),
      ['artwork', 'features', 'scores', 'distribution', 'similar'],
      `${id} must cut into five pages`);
  }
});

test('flip is offered whenever a card may exist, not only when it is registered', () => {
  assert.equal(canFlipInfoCard('0001'), true, 'registered card can flip');
  assert.equal(hasInfoCard('0040'), true, '0040 is registered as slim');
  assert.equal(hasInfoCard('0100'), true, 'the registry now covers 0001–0120');
  assert.equal(hasInfoCard('0500'), false, '0500 is not in the registry');
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

test('welcome keeps a camouflage cover and white half with one egg action', () => {
  const html = render(WelcomeScreen, { onOpen() {} });
  assert.equal((html.match(/<button/g) || []).length, 1);
  assert.match(html, /aria-label="撳鳥蛋，開啟 AvianDex 圖鑑"/);
  assert.match(html, /class="egg-crack"/);
  assert.match(html, /class="welcome-cover field-camo [^"]*h-1\/2/);
  assert.match(html, /class="welcome-notes [^"]*h-1\/2[^"]*bg-white/);
  const feathers = html.match(/class="[^"]*welcome-feathers[^"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1];
  assert.ok(feathers);
  assert.equal((feathers.match(/<svg /g) || []).length, 3);
  assert.equal(new Set(feathers.match(/color:#[0-9a-f]{6}/gi)).size, 3);
  assert.doesNotMatch(html, /BIRD-DEX|<a\s/);
});

test('the BIRD-DEX 3 link stays round with binoculars in the archive and a camera in the device', () => {
  for (const [lang, compact, icon, glyph, label] of [
    ['zh', false, 'binoculars', 'binoculars', '前往 BIRD-DEX 3 拍鳥'],
    ['en', true, undefined, 'camera', 'Open BIRD-DEX 3 to photograph birds'],
  ]) {
    const html = render(BirdCaptureLink, { lang, compact, icon });
    assert.match(html, /<a href="https:\/\/birddex3\.vercel\.app" target="_blank" rel="noopener"/);
    assert.ok(html.includes(`lucide-${glyph}`));
    assert.match(html, /class="[^"]*\brounded-full\b/);
    assert.doesNotMatch(html, /class="[^"]*\brounded-xl\b/);
    assert.ok(html.includes(`aria-label="${label}"`));
  }
  const rails = readFileSync(path.join(root, 'src/components/SideToolBalls.tsx'), 'utf8');
  const device = readFileSync(path.join(root, 'src/components/PokedexDevice.tsx'), 'utf8');
  /* 2026-11-21：右排（地圖／回報／BIRD-DEX 3）搬入 SideToolBalls，App 唔再自己砌；
     BIRD-DEX 3 球改為直接喺 rails 出 <a>，仍然要望遠鏡＋圓形。 */
  assert.match(rails, /href={BIRD_CAPTURE_APP_URL}/);
  assert.match(rails, /<Binoculars className={BALL_ICON}/);
  assert.match(rails, /rel="noopener"/);
  assert.match(device, /<BirdCaptureLink lang={lang} compact \/>/);
});
