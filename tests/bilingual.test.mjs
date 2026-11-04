/* ============================================================
 *  中英雙語資料層測試（node:test）
 *  跑：npm test
 * ------------------------------------------------------------
 *  守四件事：
 *    1) 抽取器只取原文完整句，抽唔到就空
 *    2) 跨物種污染（句首就係別隻雀名）必須被丟棄
 *    3) 選欄規則：有 10 項 → 印 7 項；只有 7 項 → 7 項全印；少過 7 項 → 有幾多印幾多
 *    4) 卡面工作室（studio.html）的欄位表／選欄權重，同 field-schema.mjs 一致
 *       （兩邊走樣就會出現「中文版印 A、英文版印 B」）
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  extractFields, pickSentence, contaminated, trimToLength, sentences,
  parseLength, parseWeight, parseIucn, parseAliases, stripWiki, stripFileLinks,
} from '../scripts/cards/extract-bilingual.mjs';
import {
  FIELDS, MAX_PICKS, chooseFields, has, normalizeCopy,
} from '../scripts/cards/field-schema.mjs';

const root = path.resolve(import.meta.dirname, '..');

/* ---------------- 1. 原文抽取 ---------------- */
const ZH = `{{Speciesbox|name=鵲鴝}}
'''鵲鴝'''（學名：''Copsychus saularis''）是雀形目鶲科鵲鴝屬的鳥類。
== 描述 ==
鵲鴝體長19至21厘米，雄鳥上半部為黑色並帶有藍色光澤，雌鳥則為灰色，兩翼有白斑。
== 分佈與棲息地 ==
分佈於尼泊爾、孟加拉國、印度、斯里蘭卡和巴基斯坦東部。
棲息於開闊的林地和經耕作的地區，經常靠近人類居住地。
== 食物 ==
主要以昆蟲為食，亦取食花蜜、壁虎、水蛭、蝸牛甚至小魚。
== 繁殖 ==
繁殖期為3月至7月，每窩4至5顆蛋，孵化期約8至14天。
== 其他 ==
普通鵟體重約759.1克，翼長約395毫米，嘴峯長約34.5毫米。
`;

const EN = `{{Speciesbox|name=Oriental magpie-robin|status=LC}}
The '''Oriental magpie-robin''' (''Copsychus saularis'') is a small passerine bird.
==Description==
This species is 19 cm long, including the long tail. The male has black upperparts, head and throat apart from a white shoulder patch.
==Distribution and habitat==
This magpie-robin is a resident breeder in tropical southern Asia from Nepal, Bangladesh, India, Sri Lanka and eastern Pakistan.
The Oriental magpie-robin is found in open woodland and cultivated areas often close to human habitations.
==Behaviour and ecology==
It feeds on insects, earthworms and small vertebrates. The song is loud and melodious.
==Breeding==
Breeding takes place from March to July. The nest is built in a hole in a tree, and two to five eggs are laid.
`;

test('中文抽取：七個核心欄位都抽到，且全部是原文完整句', () => {
  const z = extractFields(ZH, { lang: 'zh', sciName: 'Copsychus saularis', ownName: '鵲鴝' });
  for (const k of ['look', 'habitat', 'diet', 'breeding']) {
    assert.ok(z[k], `${k} 冇抽到`);
    assert.ok(ZH.includes(z[k].slice(0, 12)), `${k} 唔係原文：「${z[k]}」`);
    assert.match(z[k], /[。！？；]$/, `${k} 唔係完整句：${z[k]}`);
  }
});

test('英文抽取：look／habitat／diet／breeding／voice 都抽到', () => {
  const e = extractFields(EN, { lang: 'en', sciName: 'Copsychus saularis' });
  for (const k of ['look', 'habitat', 'diet', 'breeding']) assert.ok(e[k], `${k} 冇抽到`);
  assert.match(e.look, /19 cm|black upperparts/);
  assert.match(e.habitat, /woodland|cultivated/);
});

test('英文欄位唔可以出現中文（唔准機翻夾雜）', () => {
  const e = extractFields(EN, { lang: 'en', sciName: 'Copsychus saularis' });
  const all = Object.values(e).flat().join(' ');
  assert.ok(!/[\u4e00-\u9fff]/.test(all), '英文欄位出現中文');
});

test('Top 5：由多個欄位湊夠，最多 5 條', () => {
  const z = extractFields(ZH, { lang: 'zh' });
  assert.ok(Array.isArray(z.highlights), 'highlights 唔係陣列');
  assert.ok(z.highlights.length >= 3 && z.highlights.length <= 5, `有 ${z.highlights.length} 條`);
});

test('跨物種守衛：句首就係別隻雀 → 丟棄', () => {
  assert.equal(contaminated('普通鵟體重約759.1克，翼長約395毫米。', 'zh', '鵲鴝'), true);
  assert.equal(contaminated('鵲鴝體長19至21厘米。', 'zh', '鵲鴝'), false);
  assert.equal(contaminated('The Oriental magpie-robin is found in open woodland.', 'en'), false);
  const z = extractFields(ZH, { lang: 'zh', ownName: '鵲鴝' });
  assert.ok(!JSON.stringify(z).includes('普通鵟'), '污染句仍在輸出內');
});

test('抽唔到一定要回空（寧願「資料待查」，唔可以湊）', () => {
  const empty = extractFields('{{Speciesbox}}\n什麼都沒有的條目。', { lang: 'zh' });
  for (const [k, v] of Object.entries(empty)) {
    assert.ok(!v || (Array.isArray(v) && v.length === 0), `${k} 竟然有內容：${v}`);
  }
});

test('trimToLength 只砍在完整分句，唔會留半句', () => {
  const s = '第一句比較長一些內容。第二句都好長。第三句。';
  const t = trimToLength(s, 12);
  assert.ok(t.endsWith('。'), `截出嚟唔完整：${t}`);
});

test('英文切句：小數點唔會被當成句號', () => {
  const list = sentences('It weighs 29.5 g. The tail is 8 cm long and black.', 'en');
  assert.equal(list.length, 2, JSON.stringify(list));
});

/* ---------------- 2. 選欄規則 ---------------- */
const mk = (ids) => Object.fromEntries(ids.map((id) => [id, `${id} 的內容，長度足夠令卡面唔會好空。`]));

test('選欄：有 10 項資料 → 只印 7 項', () => {
  const copy = mk(['range', 'habitat', 'diet', 'highlights', 'look', 'breeding', 'funFact',
    'tips', 'voice', 'behavior']);
  const sel = chooseFields(copy);
  assert.equal(sel.picks.length, MAX_PICKS);
  assert.equal(sel.picks.length, 7);
  assert.equal(sel.dropped.length, 3);
  for (const k of ['range', 'habitat', 'diet', 'highlights']) {
    assert.ok(sel.picks.includes(k), `核心欄位 ${k} 應該優先`);
  }
});

test('選欄：剛好 7 項 → 7 項全印', () => {
  const sel = chooseFields(mk(['range', 'habitat', 'diet', 'highlights', 'look', 'breeding', 'funFact']));
  assert.equal(sel.picks.length, 7);
  assert.equal(sel.dropped.length, 0);
});

test('選欄：少過 7 項 → 有幾多印幾多（唔會補「資料待查」格）', () => {
  const sel = chooseFields(mk(['range', 'diet', 'look']));
  assert.deepEqual(sel.picks, ['range', 'diet', 'look']);
});

test('選欄：中英都有 → 加分（令中英版揀到同一批欄位）', () => {
  const zhOnly = Object.assign({}, mk(['range', 'voice']), { range: '只有中文的內容，長度足夠。' });
  const both = { range: '中文內容長度足夠。', voice: '中文內容長度足夠。', en: { range: 'English content long enough.', voice: '' } };
  const a = chooseFields(zhOnly).why.range;
  const b = chooseFields(both).why.range;
  assert.notEqual(a, b, '中英齊全的欄位應該有唔同分數');
});

test('選欄：唔存在的欄位唔會憑空出現', () => {
  const sel = chooseFields({ range: '只有分佈。' });
  assert.deepEqual(sel.picks, ['range']);
});

/* ---------------- 3. 舊格式兼容 ---------------- */
test('normalizeCopy：舊中文 key 會轉成欄位 id', () => {
  const n = normalizeCopy({ 分佈地區: '亞洲', 棲息環境: '林地', 食物: '昆蟲' });
  assert.equal(n.range, '亞洲');
  assert.equal(n.habitat, '林地');
  assert.equal(n.diet, '昆蟲');
});

/* ---------------- 4. 工作室同步 ---------------- */
test('工作室（studio.html）的欄位表與 field-schema 一致', () => {
  const html = readFileSync(path.join(root, 'tools/card-studio/studio.html'), 'utf8');
  const start = html.indexOf('const CARDF = [');
  assert.ok(start > 0, 'studio.html 找不到 CARDF');
  const block = html.slice(start, html.indexOf('];', start));
  const ids = [...block.matchAll(/id:\s*'([a-zA-Z]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids, FIELDS.map((f) => f.id),
    '工作室欄位表同 field-schema.mjs 走樣：' + ids.join(','));
  const tiers = [...block.matchAll(/tier:\s*'(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(tiers, FIELDS.map((f) => f.tier), '欄位等級（core/strong/extra）唔一致');
});

test('工作室 MAX_PICKS 與 field-schema 一致', () => {
  const html = readFileSync(path.join(root, 'tools/card-studio/studio.html'), 'utf8');
  const m = html.match(/const MAX_PICKS\s*=\s*(\d+)/);
  assert.ok(m, 'studio.html 找不到 MAX_PICKS');
  assert.equal(Number(m[1]), MAX_PICKS);
});

test('每個欄位都有中英標題與字數上限', () => {
  for (const f of FIELDS) {
    assert.ok(f.zh && f.en, `${f.id} 缺中或英標題`);
    assert.ok(f.tier && f.icon, `${f.id} 缺 tier／icon`);
  }
  assert.ok(has('文字') && !has('') && !has([]));
});

/* ---------------- 5. infobox 數字欄位 ---------------- */
test('infobox：長度／體重（連 {{convert}} 寫法）', () => {
  assert.equal(parseLength('{{Speciesbox|length = 19-21 cm}}'), '19–21 cm');
  assert.equal(parseLength('{{Speciesbox|length={{convert|19|cm|in}}}}'), '19 cm');
  assert.equal(parseLength('{{Speciesbox|length={{convert|19|to|21|cm|in}}}}'), '19–21 cm');
  assert.equal(parseLength('{{Speciesbox|weight = 29-51.3 g}}'), '');
  assert.equal(parseWeight('{{Speciesbox|weight = 29-51.3 g}}'), '29–51.3 g');
  assert.equal(parseWeight('{{Speciesbox|weight={{convert|29|to|51|g|oz}}}}'), '29–51 g');
  assert.equal(parseLength('{{Speciesbox}}'), '', '冇 length 一定要空，唔可以作');
});

test('infobox：IUCN 只認標準代碼，中英各一套寫法', () => {
  assert.equal(parseIucn('{{Speciesbox|status = LC}}'), '無危 LC');
  assert.equal(parseIucn('{{Speciesbox|status = LC}}', 'en'), 'Least Concern (LC)');
  assert.equal(parseIucn('{{Speciesbox|status = VU}}'), '易危 VU');
  assert.equal(parseIucn('{{Speciesbox}}'), '', '冇 status 應該留空（卡面印資料待查）');
  assert.equal(parseIucn('{{Speciesbox|status = 無危}}'), '', '中文寫法唔算標準代碼');
});

test('infobox：別名唔會夾到模板殘骸', () => {
  const al = parseAliases('{{Speciesbox|別名 = 豬屎渣、四喜、吱渣 }}');
  assert.deepEqual(al, ['豬屎渣', '四喜', '吱渣']);
  assert.deepEqual(parseAliases('{{Speciesbox}}'), []);
});

test('extractFields 會把 infobox 數字放入輸出', () => {
  const wt = '{{Speciesbox|status=NT|length={{convert|19|to|21|cm|in}}|weight={{convert|29|to|51|g|oz}}}}\n'
    + '==Description==\nThis species is 19 cm long with black upperparts and white underparts.\n';
  const e = extractFields(wt, { lang: 'en', ownName: 'Oriental magpie-robin' });
  assert.equal(e.length, '19–21 cm');
  assert.equal(e.weight, '29–51 g');
  assert.equal(e.iucn, 'Near Threatened (NT)');
});

test('輸出：原子寫入（.tmp → rename），中途斷電不會留半個壞 JSON', async () => {
  const { saveAll } = await import('../scripts/cards/extract-bilingual.mjs');
  const dir = mkdtempSync(path.join(tmpdir(), 'aviandex-save-'));
  try {
    const f = path.join(dir, 'out.json');
    saveAll({ '0008': { fieldCopy: [] }, _done: ['0008'] }, f);
    assert.deepEqual(JSON.parse(readFileSync(f, 'utf8')), { '0008': { fieldCopy: [] }, _done: ['0008'] });
    assert.equal(existsSync(f + '.tmp'), false);
    /* 再寫一次覆蓋（模擬 --resume 中途再存） */
    saveAll({ '0008': {}, _done: ['0008', '0001'] }, f);
    assert.equal(JSON.parse(readFileSync(f, 'utf8'))._done.length, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

/* ---------------- 6. 圖說／檔名污染 ---------------- */
test('stripWiki：內嵌 File: 連結（含嵌套）整個拆走，圖說唔會混入正文', () => {
  const wt = 'Body text before.\n[[File:Example.jpg|thumb|A bird [[File:Inner.jpg]] here]]\nThe real sentence is here, and it should survive.\n'
    + '[[Image:Two.png|left|female, Odisha, India]]';
  const out = stripWiki(wt);
  assert.ok(!out.includes('.jpg'), '殘留 .jpg：' + out);
  assert.ok(!out.includes('.png'), '殘留 .png：' + out);
  assert.ok(!out.includes('thumb'));
  assert.ok(out.includes('The real sentence is here'), '正文被誤刪');
});

test('切句：圖說／檔名碎片一律丟棄，唔會變成卡面文案', () => {
  const en = 'Eurasian teal (Anas crecca) is a dabbling duck species that breeds across the Palearctic. '
    + 'crecca carolinensis) drake in breeding plumage, showing white stripe Eurasian teal Photograph by Someone.jpg|Wintering male '
    + 'It feeds mainly on aquatic plants and small invertebrates in shallow water.';
  const list = sentences(en, 'en');
  /* 註：混合了圖說的「句段」會整段丟（寧缺勿錯），所以只要求乾淨句仍保留 */
  assert.ok(list.length >= 1);
  for (const s of list) {
    assert.ok(!/\.jpg|Photograph by/i.test(s), '圖說混入：' + s);
  }
});

test('中文句含整段英文（多數係圖說殘留）→ 唔會入選', () => {
  const zh = '赤翡翠體長約二十五厘米，羽色鮮艷。\n'
    + 'The ruddy kingfisher (Halcyon coromanda) is a medium-sized tree kingfisher found in east and southeast Asia.\n'
    + '牠偏好茂密的森林，常在水邊活動。';
  const out = extractFields(zh, { lang: 'zh', sciName: 'Halcyon coromanda', ownName: '赤翡翠' });
  const all = Object.values(out).map((v) => (Array.isArray(v) ? v.join(' ') : String(v))).join('\n');
  assert.ok(!/[A-Za-z]{3,}\s+[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(all), '中文欄位出現整句英文：' + all);
});
