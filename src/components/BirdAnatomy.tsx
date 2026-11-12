import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ENTRIES, type Lang } from '../lib/explorer';

/**
 * 認識鳥的身體：身體部位／頭部／翼與羽毛／腳／喙／羽毛類型。
 *
 * · 圖在 public/images/anatomy/（AI 生成的無字插畫，文字全部由這裡用 HTML 疊上去，所以中英都不會有錯字）。
 * · 預設收起；展開後才載入圖片（手機省流量、不推走下面的文字資料）。
 * · 身體／頭部／翼／腳頁：點圖上的標籤看說明；喙長、翼長、尾長、跗跖長會顯示「這隻鳥」的實測值（AVONET，mm）。
 * · 例子鳥用學名對到圖鑑編號，按一下就跳過去（對不到就不顯示，不亂放）。
 */

type Tab = 'body' | 'head' | 'wing' | 'foot' | 'bill' | 'feather';
type L2 = [string, string];

interface Part {
  id: string;
  name: L2;
  /** 針尖位置（圖寬／圖高的 %） */
  pin: [number, number];
  /** 標籤中心位置（%） */
  chip: [number, number];
  /** 對應的量度欄位（measurements.json 的 key） */
  meas?: 'bill' | 'wing' | 'tail' | 'tarsus';
  text: L2;
}

/* —— 身體部位 —— */

const BODY: Part[] = [
  { id: 'crown', name: ['頭頂', 'Crown'], pin: [64.5, 15.5], chip: [50, 6],
    text: ['頭頂的顏色和紋路是辨認種類的重點，例如有沒有冠羽、頭頂紋。', 'Crown colour and pattern are key field marks — for example a crest or crown stripes.'] },
  { id: 'bill', name: ['喙', 'Bill'], pin: [77, 21.8], chip: [90, 11], meas: 'bill',
    text: ['鳥沒有牙齒，喙就是牠的手和工具：取食、整理羽毛、築巢、餵雛。喙分上嘴和下嘴，形狀跟吃甚麼有關，見「喙」分頁。', 'Birds have no teeth: the bill is hand and tool in one — feeding, preening, nest building, feeding chicks. It has an upper and lower half; shape matches the food. See the Bills tab.'] },
  { id: 'eye', name: ['眼', 'Eye'], pin: [68.5, 22], chip: [90, 26],
    text: ['多數鳥的眼睛長在頭的兩側，視野很闊，方便提防天敵。眼圈、眼先、眉紋都是辨認線索。', 'Most birds have eyes on the sides of the head for a very wide view, handy for spotting predators. Eye-ring, lores and eyebrow stripe are useful clues.'] },
  { id: 'throat', name: ['喉', 'Throat'], pin: [71, 29], chip: [90, 40],
    text: ['喉部的顏色和斑紋是辨認種類的線索，例如黑喉、白喉。', 'Throat colour and markings help tell species apart, e.g. a black or white throat.'] },
  { id: 'breast', name: ['胸', 'Breast'], pin: [71, 40], chip: [90, 54],
    text: ['胸部的條紋、斑點或顏色是常用的辨認特徵。飛行用的胸肌也在這一帶，是鳥身上最強壯的肌肉。', 'Streaks, spots or colour on the breast are common field marks. The big flight muscles also sit here — the strongest muscles a bird has.'] },
  { id: 'belly', name: ['腹', 'Belly'], pin: [66, 60], chip: [88, 69],
    text: ['不少鳥的腹部顏色較淺。抱蛋的鳥會在腹部長出一塊沒有羽毛的「孵卵斑」，讓體溫更容易傳給蛋。', 'Many birds have a paler belly. Incubating birds grow a bare "brood patch" there so body heat reaches the eggs better.'] },
  { id: 'back', name: ['背', 'Back'], pin: [47, 34], chip: [22, 20],
    text: ['背部多是泥土、樹皮、草叢的保護色，幫助隱藏。背和腰的顏色也是辨認重點。', 'The back is often camouflaged like soil, bark or grass. Back and rump colour are also useful field marks.'] },
  { id: 'wing', name: ['翼', 'Wing'], pin: [43, 47], chip: [11, 36], meas: 'wing',
    text: ['翼由三種飛羽（初級、次級、三級）和覆羽組成，各有位置和工作，見「翼與羽毛」分頁。翼長是量度鳥類的標準尺寸之一。', 'The wing is made of three kinds of flight feather (primaries, secondaries, tertials) plus coverts, each with its own place and job — see the Wing tab. Wing length is a standard bird measurement.'] },
  { id: 'tail', name: ['尾', 'Tail'], pin: [20.5, 66], chip: [8, 54], meas: 'tail',
    text: ['尾羽像舵和剎車：控制方向、保持平衡、減速降落。有些種類的尾形也是辨認線索，例如燕子的叉尾。', 'The tail works like a rudder and brake: steering, balance and slowing for landing. Tail shape can be a clue too — think of a swallow’s forked tail.'] },
  { id: 'tarsus', name: ['跗跖', 'Tarsus'], pin: [44.2, 69], chip: [28, 89], meas: 'tarsus',
    text: ['鳥腿露在羽毛外面的一段叫跗跖（其實是腳掌的骨頭）。那個向後彎的「膝蓋」其實是腳踝，真正的膝蓋藏在羽毛裡；四隻趾各有名字，見「腳」分頁。', 'The bare part of the leg is the tarsus (really the foot bones). The backward-bending "knee" is actually the ankle; the true knee is hidden under the feathers. Each toe has a name — see the Foot tab.'] },
  { id: 'toes', name: ['趾', 'Toes'], pin: [47.5, 78], chip: [64, 92],
    text: ['多數鳥是三趾向前（外趾、中趾、內趾）、一趾向後（後趾），方便抓緊樹枝。鴨有蹼、猛禽有利爪、啄木鳥則是兩前兩後。', 'Most birds have three toes forward (outer, middle, inner) and one back (the hind toe) for gripping. Ducks have webbed feet, raptors have talons, woodpeckers have two forward and two back.'] },
];

/* —— 頭部（喙分上下嘴，額、眼眶、眉紋、眼先、耳羽等）—— */

const HEAD: Part[] = [
  { id: 'crown', name: ['頭頂', 'Crown'], pin: [57, 12], chip: [50, 6],
    text: ['頭頂的顏色和紋路是辨認種類的重點，例如有沒有冠羽、頭頂紋（crown stripes）。', 'Crown colour and pattern are key field marks — a crest or crown stripes, for example.'] },
  { id: 'forehead', name: ['額', 'Forehead'], pin: [70, 29], chip: [84, 16],
    text: ['喙基上方的額部。有些鳥的額色與頭頂明顯不同（例如白額），是辨認線索。', 'The front of the head above the bill. In some species it is clearly a different colour from the crown (e.g. a white forehead) — a useful clue.'] },
  { id: 'supercilium', name: ['眉紋', 'Eyebrow stripe'], pin: [48, 26], chip: [30, 10],
    text: ['眼上方的淺色「眉」紋。有沒有眉紋、眉紋的顏色和寬度，常是分辨相似種類的關鍵。', 'The pale stripe over the eye, like an eyebrow. Its presence, colour and width often separate similar species.'] },
  { id: 'eye-ring', name: ['眼眶（眼圈）', 'Eye-ring'], pin: [50, 37], chip: [22, 28],
    text: ['圍繞眼睛的一圈，可以是裸皮或羽毛。有些鳥的眼圈很鮮明，有些只在繁殖期才出現。', 'The ring around the eye, of bare skin or feathers. Often bright; in some species it only appears in breeding season.'] },
  { id: 'eye', name: ['眼', 'Eye'], pin: [53.5, 33], chip: [38, 20],
    text: ['多數鳥的眼睛長在頭的兩側，視野很闊，方便提防天敵。', 'Most birds have eyes on the sides of the head for a very wide view, handy for spotting predators.'] },
  { id: 'eye-stripe', name: ['過眼紋', 'Eye-stripe'], pin: [65.5, 34], chip: [60, 12],
    text: ['穿過眼睛的深色紋路。寬窄和顏色可幫我們區分相似種類。', 'A dark stripe running through the eye; its width and colour help separate similar species.'] },
  { id: 'lores', name: ['眼先', 'Lore'], pin: [71, 37], chip: [68, 48],
    text: ['眼和喙之間的一小塊（眼先）。顏色不同常是分辨親緣相近種類的線索。', 'The small area between eye and bill. A different lore colour often separates close relatives.'] },
  { id: 'nostril', name: ['鼻孔', 'Nostril'], pin: [74, 34.5], chip: [84, 30],
    text: ['上嘴上的小孔，用來呼吸。有些鳥鼻孔的位置和形狀是重要的辨認線索。', 'The small breathing opening on the upper bill. Its position and shape can be diagnostic.'] },
  { id: 'upper-bill', name: ['上嘴', 'Upper bill'], pin: [81.5, 35], chip: [90, 42],
    text: ['喙的上半部。辨認時看上嘴的形狀、顏色、長度，以及鼻孔的位置。', 'The upper half of the bill. Note its shape, colour, length and where the nostril sits.'] },
  { id: 'lower-bill', name: ['下嘴', 'Lower bill'], pin: [81, 41.5], chip: [88, 56],
    text: ['喙的下半部。下嘴顏色常與上嘴不同（例如淺色的下嘴），尖端可能更鮮豔。', 'The lower half of the bill, often a different colour from the upper bill; the tip can be brighter.'] },
  { id: 'gape', name: ['嘴角', 'Gape'], pin: [71.5, 43], chip: [76, 58],
    text: ['上下嘴交界的嘴角。雛鳥的嘴角常呈鮮豔的橘紅色，是認出嗷嗷待哺幼鳥的線索。', 'The corner where upper and lower bill meet. A bright orange gape line is a clue to hungry nestlings.'] },
  { id: 'ear-coverts', name: ['耳羽', 'Ear-coverts'], pin: [36, 42], chip: [8, 38],
    text: ['眼後下方的羽毛片，常形成顏色不同的「耳斑」（例如栗色耳羽）。', 'The feather patch behind and below the eye, often a differently coloured "ear patch" (e.g. chestnut ear-coverts).'] },
  { id: 'cheek', name: ['面颊', 'Cheek'], pin: [45, 48], chip: [20, 54],
    text: ['眼下方的面颊。面颊的顏色和紋路幫助辨認。', 'The area below the eye; cheek colour and pattern help with identification.'] },
  { id: 'moustachial', name: ['髭紋', 'Moustachial stripe'], pin: [47, 54], chip: [32, 68],
    text: ['由喙基沿面颊下緣延伸的條紋，像「八字鬚」。', 'A stripe running from the bill along the lower cheek edge, like a moustache.'] },
  { id: 'throat', name: ['喉', 'Throat'], pin: [64, 61], chip: [56, 76],
    text: ['喙下方的喉部。顏色和斑紋是辨認線索，例如黑喉、白喉。', 'The area below the bill. Throat colour and markings are field marks — a black or white throat, for example.'] },
  { id: 'nape', name: ['後頸', 'Nape'], pin: [30, 28], chip: [6, 18],
    text: ['頭後方、頭與背交接處。有些鳥後頸顏色與背不同（例如戴菊的金黃色後頸）。', 'Where the back of the head meets the back; the nape colour can differ from the back.'] },
  { id: 'neck', name: ['頸', 'Neck'], pin: [24, 51], chip: [10, 70],
    text: ['頸部。有些鳥頸上有特別紋路，例如領環，是重要特徵。', 'The neck; a neck ring or pattern can be a key feature.'] },
];

/* —— 翼與羽毛（每種羽毛長在哪）—— */

const WING: Part[] = [
  { id: 'alula', name: ['副翼（小翼）', 'Alula'], pin: [21, 29], chip: [10, 12],
    text: ['翼前緣一小撮羽毛（alula）。降落慢飛時展開，增加翼面的剎車與操控性。', 'A small feather group on the front edge of the wing (the alula). It helps brake and manoeuvre at slow speed, e.g. on landing.'] },
  { id: 'lesser-coverts', name: ['小覆羽', 'Lesser coverts'], pin: [26, 39], chip: [6, 36],
    text: ['翼前緣最小的一列覆羽，蓋住中覆羽和飛羽的基部。', 'The smallest row of coverts at the front of the wing, covering the bases of the other feathers.'] },
  { id: 'median-coverts', name: ['中覆羽', 'Median coverts'], pin: [34.5, 52], chip: [14, 58],
    text: ['中間的一列覆羽。許多鳥的中覆羽和大覆羽一起構成翼上的橫紋（翼斑）。', 'A middle row of coverts; with the greater coverts it often forms wing bars.'] },
  { id: 'greater-coverts', name: ['大覆羽', 'Greater coverts'], pin: [44, 39], chip: [30, 20],
    text: ['最大的一列覆羽。許多鳥的大覆羽尖端色淺，形成醒目的「翼斑」，是飛翔時辨認的要點。', 'The largest row of coverts; pale tips often form a prominent wing bar — a key clue in flight.'] },
  { id: 'primaries', name: ['初級飛羽', 'Primaries'], pin: [76, 35], chip: [78, 10], meas: 'wing',
    text: ['翼尖最長的一列飛羽，負責向前的推力。收翼時超出尾尖的片數反映初級飛羽的長短。翼長量度就是量它。', 'The longest feathers at the wing tip — they provide thrust. When folded, how many project past the tail tip reflects primary length; wing length is measured here.'] },
  { id: 'secondaries', name: ['次級飛羽', 'Secondaries'], pin: [55, 60], chip: [62, 86],
    text: ['翼中部的一列中等飛羽，貼著身體，主要負責升力。', 'Medium flight feathers along the inner wing, resting on the body — they provide lift.'] },
  { id: 'tertials', name: ['三級飛羽', 'Tertials'], pin: [30, 74], chip: [24, 80],
    text: ['翼內後緣最短的三（至四）片飛羽，和次級飛羽一起維持升力。飛羽共這三種，見「羽毛類型」。', 'The 3–4 shortest flight feathers at the inner rear wing edge; with the secondaries they help hold lift. Flight feathers come in these three kinds — see Feather types.'] },
];

/* —— 腳（四趾各有名字）—— */

const FOOT: Part[] = [
  { id: 'thigh', name: ['大腿（羽腿）', 'Thigh'], pin: [50.5, 7], chip: [12, 8],
    text: ['有羽毛覆蓋的上腿（「琵琶腿」）。鳥棲枝時大腿其實向前微上指，看得見的下面部分全是「腳」。', 'The feathered upper leg (the "drumstick"). Perched, it points forward and slightly up — everything below it is actually foot.'] },
  { id: 'ankle', name: ['腳踝', 'Ankle'], pin: [53, 19], chip: [30, 14],
    text: ['跗跖頂端的關節。你看到向後彎的「膝蓋」其實是腳踝；真正的膝蓋藏在上面羽毛裡。', 'The joint at the top of the tarsus. The visible backward-bending "knee" is the ankle; the true knee is hidden in the feathers above.'] },
  { id: 'tarsus', name: ['跗跖', 'Tarsus'], pin: [52.5, 32], chip: [24, 32], meas: 'tarsus',
    text: ['露在羽毛外的鱗片「小腿」（其實是跗跖骨）。跗跖長是量度鳥類的標準尺寸之一，顏色和鱗紋也幫助辨認。', 'The bare scaly "shin" (the tarsometatarsus). Its length is a standard measurement; colour and scalation also help ID.'] },
  { id: 'hind-toe', name: ['後趾', 'Hind toe'], pin: [35, 48], chip: [12, 50],
    text: ['向後伸出的那隻趾（hallux）。後趾是抓緊樹枝的關鍵，有些鳥的後趾特別長。', 'The single backwards-pointing toe (the hallux). Essential for gripping branches; in some species it is unusually long.'] },
  { id: 'claw', name: ['爪', 'Claw'], pin: [30, 44], chip: [8, 64],
    text: ['趾尖的爪子，用來抓握和攀爬。猛禽的爪是殺傷獵物的銳利利爪。', 'The claw at the toe tip, for gripping and climbing. In raptors they are sharp talons for killing prey.'] },
  { id: 'outer-toe', name: ['外趾', 'Outer toe'], pin: [39, 67], chip: [18, 80],
    text: ['向前三趾中最外的一隻。', 'The outer of the three forward-pointing toes.'] },
  { id: 'middle-toe', name: ['中趾', 'Middle toe'], pin: [55, 74], chip: [48, 88],
    text: ['向前三趾的中間一隻，多數鳥是最長的一隻。', 'The middle forward toe; usually the longest of the three.'] },
  { id: 'inner-toe', name: ['內趾', 'Inner toe'], pin: [66, 65], chip: [82, 74],
    text: ['向前三趾中最內的一隻，靠近後趾。', 'The inner forward toe, closest to the hind toe.'] },
];

/* —— 喙形 —— */

interface Card { name: L2; job: L2; img: string; ratio?: '1' | '43'; sci?: string[] }

const BILLS: Card[] = [
  { name: ['錐形厚喙', 'Cone-shaped'], img: 'bill-1', job: ['又短又厚，用來咬開種子。', 'Short and thick for cracking seeds.'], sci: ['Passer montanus'] },
  { name: ['細小尖喙', 'Fine and pointed'], img: 'bill-2', job: ['像鑷子，夾捕細小昆蟲。', 'Tweezer-like, for picking small insects.'], sci: ['Phylloscopus inornatus'] },
  { name: ['長直喙', 'Long dagger'], img: 'bill-3', job: ['像匕首，刺入水中捉魚。', 'Dagger-like, for spearing fish.'], sci: ['Alcedo atthis'] },
  { name: ['鉤喙', 'Hooked'], img: 'bill-4', job: ['尖端彎鉤，撕開獵物的肉。', 'A sharp hook for tearing flesh.'], sci: ['Milvus migrans'] },
  { name: ['扁闊喙', 'Broad and flat'], img: 'bill-5', job: ['在水面或淺水濾食、挖泥。', 'For dabbling and filtering at the surface or in shallows.'], sci: ['Anas platyrhynchos'] },
  { name: ['長而下彎的喙', 'Long and curved'], img: 'bill-6', job: ['探入泥灘，找蟹、蟲和貝。', 'Probes mudflats for crabs, worms and shellfish.'], sci: ['Numenius phaeopus'] },
];

/* —— 羽毛類型（飛羽分三種；長在哪見「翼與羽毛」）—— */

const FEATHERS: Card[] = [
  { name: ['初級飛羽', 'Primary'], img: 'wing-pr', ratio: '43',
    job: ['翼尖最長的一列飛羽，拍翼時負責向前的推力。', 'The longest flight feathers at the wing tip — they provide forward thrust.'] },
  { name: ['次級飛羽', 'Secondary'], img: 'wing-se', ratio: '43',
    job: ['翼中部貼著身體的一列飛羽，主要負責升力。', 'Flight feathers along the inner wing, resting on the body — they provide lift.'] },
  { name: ['三級飛羽', 'Tertial'], img: 'wing-te', ratio: '43',
    job: ['翼內後緣最短的三（至四）片飛羽，和次級一起維持升力。飛羽就分這三種，長的位置見「翼與羽毛」。', 'The 3–4 shortest flight feathers at the inner rear wing edge, aiding lift. Flight feathers come in these three kinds — see the Wing tab for where each grows.'] },
  { name: ['尾羽', 'Tail feather'], img: 'feather-2',
    job: ['像舵一樣控制方向，也幫忙煞停。', 'Steers like a rudder and helps braking.'] },
  { name: ['正羽（體羽）', 'Contour feather'], img: 'feather-3',
    job: ['蓋住身體，構成流線外形，防風防水，也決定了鳥的顏色。', 'Covers the body, streamlines it, sheds wind and water — and gives the bird its colours.'] },
  { name: ['絨羽', 'Down feather'], img: 'feather-4',
    job: ['柔軟蓬鬆、沒有硬軸，藏在正羽底下，困住空氣來保暖。', 'Soft and fluffy with no stiff shaft; hides under the contour feathers and traps warm air.'] },
  { name: ['纖羽', 'Filoplume'], img: 'feather-5',
    job: ['細如髮絲，只有尖端幾條羽枝。據研究像感應器，感知正羽的位置和震動。', 'Hair-thin with a few barbs at the tip. Thought to act as a sensor for the position and movement of the contour feathers.'] },
  { name: ['羽毛的結構', 'Feather structure'], img: 'feather-6',
    job: ['羽軸分出羽枝，羽枝再長出細小的鉤，互相扣合像魔術貼。鳥用喙梳理，就能把散開的羽毛重新扣好。', 'The shaft branches into barbs, and barbs carry tiny hooks that interlock like Velcro. Preening with the bill zips loose feathers back together.'] },
];

const BASE = `${import.meta.env.BASE_URL}images/anatomy/`;

const DIAGRAMS: Record<'body' | 'head' | 'wing' | 'foot', { img: string; parts: Part[] }> = {
  body: { img: 'body.webp', parts: BODY },
  head: { img: 'head.webp', parts: HEAD },
  wing: { img: 'wing.webp', parts: WING },
  foot: { img: 'foot.webp', parts: FOOT },
};

const SCI_TO_ID: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [id, e] of Object.entries(ENTRIES)) if (e.s) m[e.s] = id;
  return m;
})();

interface Props {
  lang: Lang;
  /** 這隻鳥的量度（measurements.json：wing／tail／tarsus／bill，單位 mm） */
  meas: Record<string, string> | null;
  onJump: (id: string) => void;
}

export const BirdAnatomy: React.FC<Props> = ({ lang, meas, onJump }) => {
  const t = (p: L2) => (lang === 'en' ? p[1] : p[0]);
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>('body');
  const [sel, setSel] = React.useState<string>('bill');
  const [selHead, setSelHead] = React.useState<string>('upper-bill');
  const [selWing, setSelWing] = React.useState<string>('primaries');
  const [selFoot, setSelFoot] = React.useState<string>('tarsus');

  const selByTab: Record<'body' | 'head' | 'wing' | 'foot', [string, (v: string) => void]> = {
    body: [sel, setSel],
    head: [selHead, setSelHead],
    wing: [selWing, setSelWing],
    foot: [selFoot, setSelFoot],
  };

  const dkey = tab === 'head' ? 'head' : tab === 'wing' ? 'wing' : tab === 'foot' ? 'foot' : 'body';
  const diagram = DIAGRAMS[dkey];
  const cur = selByTab[dkey];
  const part = diagram.parts.find((p) => p.id === cur[0]) ?? diagram.parts[0];
  const mv = part.meas ? meas?.[part.meas] : undefined;

  const tabs: [Tab, L2][] = [
    ['body', ['身體部位', 'Body']],
    ['head', ['頭部', 'Head']],
    ['wing', ['翼與羽毛', 'Wing']],
    ['foot', ['腳', 'Foot']],
    ['bill', ['喙', 'Bills']],
    ['feather', ['羽毛類型', 'Feathers']],
  ];

  const examples = (c: Card) => (c.sci || [])
    .map((s) => SCI_TO_ID[s]).filter(Boolean)
    .map((id) => (
      <button key={id} type="button" onClick={() => onJump(id)}
        className="text-[10.5px] text-amber-200/90 underline underline-offset-2 decoration-amber-300/40 hover:text-amber-100">
        NO.{id} {lang === 'en' ? ENTRIES[id].e : ENTRIES[id].z}
      </button>
    ));

  return (
    <div className="bg-black/25 border border-amber-400/25 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left">
        <span>
          <span className="block text-amber-100 font-black text-[12.5px]">{lang === 'en' ? 'Know the bird’s body' : '認識鳥的身體'}</span>
          <span className="block text-white/40 text-[10px]">{lang === 'en' ? 'Body · head · wing · foot · bills · feathers' : '身體 · 頭部 · 翼 · 腳 · 喙 · 羽毛'}</span>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-amber-200/70" /> : <ChevronDown className="w-4 h-4 text-amber-200/70" />}
      </button>

      {open && (
        <div className="px-2.5 pb-3 flex flex-col gap-2">
          <div role="tablist" className="grid grid-cols-3 gap-1">
            {tabs.map(([id, name]) => (
              <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => setTab(id)}
                className={`py-1.5 rounded-md text-[11.5px] font-black border ${tab === id
                  ? 'bg-amber-400 text-gray-900 border-amber-600'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}>
                {t(name)}
              </button>
            ))}
          </div>

          {(tab === 'body' || tab === 'head' || tab === 'wing' || tab === 'foot') && (
            <>
              <div className="relative w-full rounded-lg bg-[#FEF8E8] overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                <img src={`${BASE}${diagram.img}`}
                  alt={tab === 'head' ? (lang === 'en' ? 'A bird head with its face parts' : '鳥的頭部部位示意圖')
                    : tab === 'wing' ? (lang === 'en' ? 'A spread wing with its feather groups' : '鳥的翼和羽毛分佈示意圖')
                    : tab === 'foot' ? (lang === 'en' ? 'A bird leg and foot with its toes' : '鳥的腳和趾示意圖')
                    : (lang === 'en' ? 'A songbird with its body parts' : '鳥的身體部位示意圖')}
                  loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-contain" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 75" preserveAspectRatio="none">
                  {diagram.parts.map((p) => (
                    <g key={p.id}>
                      <line x1={p.pin[0]} y1={p.pin[1] * 0.75} x2={p.chip[0]} y2={p.chip[1] * 0.75}
                        stroke={cur[0] === p.id ? '#d97706' : '#8a7f6a'} strokeWidth={cur[0] === p.id ? 0.45 : 0.25} vectorEffect="non-scaling-stroke" />
                      <circle cx={p.pin[0]} cy={p.pin[1] * 0.75} r={cur[0] === p.id ? 1.1 : 0.8}
                        fill={cur[0] === p.id ? '#d97706' : '#5b5444'} />
                    </g>
                  ))}
                </svg>
                {diagram.parts.map((p) => (
                  <button key={p.id} type="button" onClick={() => cur[1](p.id)} aria-pressed={cur[0] === p.id}
                    style={{ left: `${p.chip[0]}%`, top: `${p.chip[1]}%`, transform: 'translate(-50%,-50%)' }}
                    className={`absolute px-1.5 py-0.5 rounded-full text-[10.5px] sm:text-[11.5px] font-black border leading-tight whitespace-nowrap ${cur[0] === p.id
                      ? 'bg-amber-500 text-gray-900 border-amber-700'
                      : 'bg-white/90 text-gray-800 border-gray-400'}`}>
                    {t(p.name)}
                  </button>
                ))}
              </div>
              <div className="bg-black/30 border border-white/10 rounded-md px-2.5 py-2">
                <p className="text-amber-200 font-black text-[12px]">
                  {t(part.name)}
                  {part.meas && (
                    <span className="ml-2 text-[10.5px] font-bold text-white/60">
                      {lang === 'en' ? 'this bird: ' : '這隻鳥：'}
                      <span className={mv ? 'text-emerald-300' : 'text-white/30'}>{mv ? `${mv} mm` : (lang === 'en' ? 'Data pending' : '資料待查')}</span>
                    </span>
                  )}
                </p>
                <p className="text-white/75 text-[11.5px] leading-relaxed mt-0.5">{t(part.text)}</p>
              </div>
            </>
          )}

          {tab === 'bill' && (
            <ul className="grid grid-cols-2 gap-1.5">
              {BILLS.map((c, i) => (
                <li key={i} className="bg-black/30 border border-white/10 rounded-md overflow-hidden flex flex-col">
                  <img src={`${BASE}${c.img}.webp`} alt={t(c.name)} loading="lazy" decoding="async"
                    className="w-full bg-[#FEF8E8]" style={{ aspectRatio: '4 / 3', objectFit: 'contain' }} />
                  <div className="px-2 py-1.5 flex flex-col gap-0.5">
                    <p className="text-amber-200 font-black text-[12px] leading-tight">{t(c.name)}</p>
                    <p className="text-white/70 text-[11px] leading-snug">{t(c.job)}</p>
                    {c.sci && <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">{examples(c)}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {tab === 'feather' && (
            <ul className="grid grid-cols-2 gap-1.5">
              {FEATHERS.map((c, i) => (
                <li key={i} className="bg-black/30 border border-white/10 rounded-md overflow-hidden flex flex-col">
                  <img src={`${BASE}${c.img}.webp`} alt={t(c.name)} loading="lazy" decoding="async"
                    className="w-full bg-[#FEF8E8]" style={{ aspectRatio: c.ratio === '43' ? '4 / 3' : '1 / 1', objectFit: 'contain' }} />
                  <div className="px-2 py-1.5 flex flex-col gap-0.5">
                    <p className="text-amber-200 font-black text-[12px] leading-tight">{t(c.name)}</p>
                    <p className="text-white/70 text-[11px] leading-snug">{t(c.job)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BirdAnatomy;
