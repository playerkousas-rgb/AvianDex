import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ENTRIES, type Lang } from '../lib/explorer';

/**
 * 認識鳥的身體：身體部位／喙／羽毛。
 *
 * · 圖在 public/images/anatomy/（AI 生成的無字插畫，文字全部由這裡用 HTML 疊上去，所以中英都不會有錯字）。
 * · 預設收起；展開後才載入圖片（手機省流量、不推走下面的文字資料）。
 * · 身體部位頁：點圖上的標籤看說明；喙／翼／尾／跗跖會顯示「這隻鳥」的實測值（AVONET，mm）。
 * · 例子鳥用學名對到圖鑑編號，按一下就跳過去（對不到就不顯示，不亂放）。
 */

type Tab = 'body' | 'bill' | 'feather';
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

const PARTS: Part[] = [
  { id: 'crown', name: ['頭頂', 'Crown'], pin: [64.5, 15.5], chip: [50, 6],
    text: ['頭頂的顏色和紋路是辨認種類的重點，例如有沒有冠羽、頭頂紋。', 'Crown colour and pattern are key field marks — for example a crest or crown stripes.'] },
  { id: 'bill', name: ['喙', 'Bill'], pin: [77, 21.8], chip: [90, 11], meas: 'bill',
    text: ['鳥沒有牙齒，喙就是牠的手和工具：取食、整理羽毛、築巢、餵雛。喙的形狀跟吃甚麼有關，見「喙」分頁。', 'Birds have no teeth: the bill is hand and tool in one — feeding, preening, nest building and feeding chicks. Its shape matches the food; see the Bill tab.'] },
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
    text: ['翼由初級飛羽（主要負責推進）、次級飛羽（主要負責升力）和覆羽組成。翼長是量度鳥類的標準尺寸之一。', 'The wing is made of primaries (mainly thrust), secondaries (mainly lift) and coverts. Wing length is one of the standard bird measurements.'] },
  { id: 'tail', name: ['尾', 'Tail'], pin: [20.5, 66], chip: [8, 54], meas: 'tail',
    text: ['尾羽像舵和剎車：控制方向、保持平衡、減速降落。有些種類的尾形也是辨認線索，例如燕子的叉尾。', 'The tail works like a rudder and brake: steering, balance and slowing for landing. Tail shape can be a clue too — think of a swallow’s forked tail.'] },
  { id: 'tarsus', name: ['跗跖', 'Tarsus'], pin: [44.2, 69], chip: [28, 89], meas: 'tarsus',
    text: ['鳥腿露在羽毛外面的一段叫跗跖（其實是腳掌的骨頭）。那個向後彎的「膝蓋」其實是腳踝，真正的膝蓋藏在羽毛裡。', 'The bare part of the leg is the tarsus (really the foot bones). The backward-bending "knee" is actually the ankle; the true knee is hidden under the feathers.'] },
  { id: 'toes', name: ['趾', 'Toes'], pin: [47.5, 78], chip: [64, 92],
    text: ['多數鳥是三趾向前、一趾向後，方便抓緊樹枝。鴨有蹼、猛禽有利爪、啄木鳥則是兩前兩後。', 'Most birds have three toes forward and one back for gripping. Ducks have webbed feet, raptors have talons, woodpeckers have two toes forward and two back.'] },
];

interface Card { name: L2; job: L2; sci?: string[] }

const BILLS: Card[] = [
  { name: ['錐形厚喙', 'Cone-shaped'], job: ['又短又厚，用來咬開種子。', 'Short and thick for cracking seeds.'], sci: ['Passer montanus'] },
  { name: ['細小尖喙', 'Fine and pointed'], job: ['像鑷子，夾捕細小昆蟲。', 'Tweezer-like, for picking small insects.'], sci: ['Phylloscopus inornatus'] },
  { name: ['長直喙', 'Long dagger'], job: ['像匕首，刺入水中捉魚。', 'Dagger-like, for spearing fish.'], sci: ['Alcedo atthis'] },
  { name: ['鉤喙', 'Hooked'], job: ['尖端彎鉤，撕開獵物的肉。', 'A sharp hook for tearing flesh.'], sci: ['Milvus migrans'] },
  { name: ['扁闊喙', 'Broad and flat'], job: ['在水面或淺水濾食、挖泥。', 'For dabbling and filtering at the surface or in shallows.'], sci: ['Anas platyrhynchos'] },
  { name: ['長而下彎的喙', 'Long and curved'], job: ['探入泥灘，找蟹、蟲和貝。', 'Probes mudflats for crabs, worms and shellfish.'], sci: ['Numenius phaeopus'] },
];

const FEATHERS: Card[] = [
  { name: ['飛羽', 'Flight feather'], job: ['又長又硬，羽軸偏向一側（前窄後闊），負責拍翼的推進和升力。', 'Long and stiff with an off-centre shaft (narrow front, broad back); gives thrust and lift.'] },
  { name: ['尾羽', 'Tail feather'], job: ['像舵一樣控制方向，也幫忙煞停。', 'Steers like a rudder and helps braking.'] },
  { name: ['正羽（體羽）', 'Contour feather'], job: ['蓋住身體，構成流線外形，防風防水，也決定了鳥的顏色。', 'Covers the body, streamlines it, sheds wind and water — and gives the bird its colours.'] },
  { name: ['絨羽', 'Down feather'], job: ['柔軟蓬鬆、沒有硬軸，藏在正羽底下，困住空氣來保暖。', 'Soft and fluffy with no stiff shaft; hides under the contour feathers and traps warm air.'] },
  { name: ['纖羽', 'Filoplume'], job: ['細如髮絲，只有尖端幾條羽枝。據研究像感應器，感知正羽的位置和震動。', 'Hair-thin with a few barbs at the tip. Thought to act as a sensor for the position and movement of the contour feathers.'] },
  { name: ['羽毛的結構', 'Feather structure'], job: ['羽軸分出羽枝，羽枝再長出細小的鉤，互相扣合像魔術貼。鳥用喙梳理，就能把散開的羽毛重新扣好。', 'The shaft branches into barbs, and barbs carry tiny hooks that interlock like Velcro. Preening with the bill zips loose feathers back together.'] },
];

const BASE = `${import.meta.env.BASE_URL}images/anatomy/`;

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

  const part = PARTS.find((p) => p.id === sel) ?? PARTS[1];
  const mv = part.meas ? meas?.[part.meas] : undefined;

  const tabs: [Tab, L2][] = [['body', ['身體部位', 'Body parts']], ['bill', ['喙', 'Bills']], ['feather', ['羽毛', 'Feathers']]];

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
          <span className="block text-white/40 text-[10px]">{lang === 'en' ? 'Body parts · bills · feathers' : '身體部位 · 喙 · 羽毛'}</span>
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

          {tab === 'body' && (
            <>
              <div className="relative w-full rounded-lg bg-[#FEF8E8] overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                <img src={`${BASE}body.webp`} alt={lang === 'en' ? 'A songbird with its body parts' : '鳥的身體部位示意圖'}
                  loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-contain" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 75" preserveAspectRatio="none">
                  {PARTS.map((p) => (
                    <g key={p.id}>
                      <line x1={p.pin[0]} y1={p.pin[1] * 0.75} x2={p.chip[0]} y2={p.chip[1] * 0.75}
                        stroke={sel === p.id ? '#d97706' : '#8a7f6a'} strokeWidth={sel === p.id ? 0.45 : 0.25} vectorEffect="non-scaling-stroke" />
                      <circle cx={p.pin[0]} cy={p.pin[1] * 0.75} r={sel === p.id ? 1.1 : 0.8}
                        fill={sel === p.id ? '#d97706' : '#5b5444'} />
                    </g>
                  ))}
                </svg>
                {PARTS.map((p) => (
                  <button key={p.id} type="button" onClick={() => setSel(p.id)} aria-pressed={sel === p.id}
                    style={{ left: `${p.chip[0]}%`, top: `${p.chip[1]}%`, transform: 'translate(-50%,-50%)' }}
                    className={`absolute px-1.5 py-0.5 rounded-full text-[10.5px] sm:text-[11.5px] font-black border leading-tight whitespace-nowrap ${sel === p.id
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

          {tab !== 'body' && (
            <ul className={`grid gap-1.5 ${tab === 'bill' ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {(tab === 'bill' ? BILLS : FEATHERS).map((c, i) => (
                <li key={i} className="bg-black/30 border border-white/10 rounded-md overflow-hidden flex flex-col">
                  <img src={`${BASE}${tab === 'bill' ? 'bill' : 'feather'}-${i + 1}.webp`} alt={t(c.name)} loading="lazy" decoding="async"
                    className="w-full bg-[#FEF8E8]" style={{ aspectRatio: tab === 'bill' ? '4 / 3' : '1 / 1', objectFit: 'contain' }} />
                  <div className="px-2 py-1.5 flex flex-col gap-0.5">
                    <p className="text-amber-200 font-black text-[12px] leading-tight">{t(c.name)}</p>
                    <p className="text-white/70 text-[11px] leading-snug">{t(c.job)}</p>
                    {c.sci && <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">{examples(c)}</div>}
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
