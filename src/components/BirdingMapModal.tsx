// ============================================================
// AvianDex - 香港觀鳥地點地圖
// 點選地區後，透過你已有的 eBird API（EBIRD_API_KEY in Vercel）查詢
// 該地區最近的觀察紀錄
// ============================================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bird as BirdIcon, ExternalLink, Loader2, Calendar } from 'lucide-react';

interface BirdingSpot {
  id: string;
  /** 中文名 */
  name: string;
  /** 英文/eBird hotspot 名 */
  englishName: string;
  /** eBird Hotspot ID (L 開頭) 或 region code */
  hotspotId?: string;
  /** 在 viewBox 上的座標 (0-1000, 0-700) */
  x: number;
  y: number;
  /** 簡介 */
  description: string;
}

// 香港主要觀鳥點（座標在 viewBox 0-1000 × 0-700）
const SPOTS: BirdingSpot[] = [
  {
    id: 'mai-po',
    name: '米埔自然保護區',
    englishName: 'Mai Po Nature Reserve',
    hotspotId: 'L922779',
    x: 230,
    y: 220,
    description: '世界級濕地，冬季黑臉琵鷺、雁鴨類聚集地',
  },
  {
    id: 'long-valley',
    name: '塱原',
    englishName: 'Long Valley',
    hotspotId: 'L1029192',
    x: 360,
    y: 240,
    description: '低地農田濕地，鷺鳥、鶺鴒、鵐類豐富',
  },
  {
    id: 'tai-po-kau',
    name: '大埔滘自然護理區',
    englishName: 'Tai Po Kau Nature Reserve',
    hotspotId: 'L1295416',
    x: 490,
    y: 290,
    description: '次生林，畫眉、太陽鳥、林鳥的天堂',
  },
  {
    id: 'plover-cove',
    name: '船灣',
    englishName: 'Plover Cove',
    hotspotId: 'L2208537',
    x: 620,
    y: 230,
    description: '水庫與郊野公園，猛禽與水鳥',
  },
  {
    id: 'shing-mun',
    name: '城門水塘',
    englishName: 'Shing Mun Reservoir',
    hotspotId: 'L1037411',
    x: 480,
    y: 370,
    description: '森林與水塘，林鳥、翠鳥常見',
  },
  {
    id: 'kowloon-park',
    name: '九龍公園',
    englishName: 'Kowloon Park',
    hotspotId: 'L1188419',
    x: 530,
    y: 470,
    description: '市區綠洲，鸚鵡、椋鳥、白頭鵯',
  },
  {
    id: 'victoria-park',
    name: '維多利亞公園',
    englishName: 'Victoria Park',
    hotspotId: 'L1284942',
    x: 600,
    y: 510,
    description: '港島市區公園，常見都市鳥',
  },
  {
    id: 'hong-kong-park',
    name: '香港公園',
    englishName: 'Hong Kong Park',
    hotspotId: 'L1188421',
    x: 570,
    y: 520,
    description: '香港島心臟，雀鳥園展示多種雀鳥',
  },
  {
    id: 'hong-kong-zoo',
    name: '香港動植物公園',
    englishName: 'Hong Kong Zoological and Botanical Gardens',
    hotspotId: 'L1188422',
    x: 555,
    y: 515,
    description: '百年公園，留鳥與遷徙鳥',
  },
  {
    id: 'po-toi',
    name: '蒲台島',
    englishName: 'Po Toi Island',
    hotspotId: 'L1189143',
    x: 690,
    y: 620,
    description: '香港最南端，遷徙鳥的天堂',
  },
  {
    id: 'tai-mo-shan',
    name: '大帽山',
    englishName: 'Tai Mo Shan',
    hotspotId: 'L1037431',
    x: 410,
    y: 340,
    description: '香港最高峰，山區鳥種',
  },
  {
    id: 'lantau-south',
    name: '南大嶼郊野公園',
    englishName: 'Lantau South Country Park',
    hotspotId: 'L1037448',
    x: 280,
    y: 540,
    description: '海岸與山林，海鳥、林鳥',
  },
  {
    id: 'cheung-chau',
    name: '長洲',
    englishName: 'Cheung Chau',
    hotspotId: 'L1189140',
    x: 380,
    y: 580,
    description: '離島，海鳥及候鳥',
  },
  {
    id: 'lamma',
    name: '南丫島',
    englishName: 'Lamma Island',
    hotspotId: 'L1037413',
    x: 490,
    y: 600,
    description: '離島郊野，鷹隼及林鳥',
  },
  {
    id: 'sai-kung',
    name: '西貢郊野',
    englishName: 'Sai Kung Country Park',
    hotspotId: 'L1037452',
    x: 720,
    y: 360,
    description: '海岸線與山林，多樣生境',
  },
];

interface Observation {
  speciesCode: string;
  comName: string; // common name
  sciName: string;
  locName?: string;
  obsDt: string; // observation date
  howMany?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BirdingMapModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState<BirdingSpot | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadObservations = async (spot: BirdingSpot) => {
    setSelected(spot);
    setLoading(true);
    setError(null);
    setObservations([]);
    try {
      const res = await fetch(`/api/ebird?hotspot=${spot.hotspotId}`);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 200)); }
      if (!res.ok) throw new Error(data?.error || data?.details || `HTTP ${res.status}`);
      setObservations(data.observations || []);
    } catch (e: any) {
      setError(e?.message || '無法載入觀察紀錄');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[190] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            className="w-full max-w-4xl rounded-t-3xl sm:rounded-3xl border-[5px] sm:border-[6px] border-gray-900 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden my-0 sm:my-4 max-h-[95dvh] sm:max-h-[90vh] flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #c92b0a 0%, #9a2208 50%, #6e1804 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-b from-black/50 to-black/30 border-b-[3px] border-yellow-400/30 px-4 sm:px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-900 border border-red-900" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-900 border border-red-900" />
              <MapPin className="w-7 h-7 text-yellow-300 drop-shadow animate-pulse" />
              <div className="flex-1">
                <p className="text-[10px] text-yellow-300 font-mono uppercase tracking-widest">
                  Birding Hotspots
                </p>
                <h2 className="text-white font-black text-base sm:text-lg tracking-tight drop-shadow">
                  香港觀鳥地圖
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500 border-2 border-white/30 text-white flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-5 overflow-y-auto flex-1">
              {/* 地圖 */}
              <div
                className="sm:col-span-3 p-3 sm:p-4 bg-gradient-to-b from-[#a8d8a8] to-[#7bb87b] relative border-b-2 sm:border-b-0 sm:border-r-2 border-yellow-400/30"
              >
                <p className="text-[10px] text-emerald-900 font-mono uppercase tracking-widest mb-2 font-black flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> 點選地點查看觀察紀錄
                </p>
                <div className="relative aspect-[10/7] w-full rounded-xl border-[3px] border-gray-900 overflow-hidden shadow-[inset_0_2px_12px_rgba(0,0,0,0.3)]">
                  <svg viewBox="0 0 1000 700" className="w-full h-full">
                    <defs>
                      {/* 海洋漸層 */}
                      <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#bfe9f2" />
                        <stop offset="55%" stopColor="#8fd0e6" />
                        <stop offset="100%" stopColor="#5fb4d6" />
                      </linearGradient>
                      {/* 陸地漸層 */}
                      <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c8e6a0" />
                        <stop offset="100%" stopColor="#86bf6a" />
                      </linearGradient>
                      {/* 陸地陰影 */}
                      <filter id="landShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1d4a2e" floodOpacity="0.35" />
                      </filter>
                      {/* pin 陰影 */}
                      <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
                      </filter>
                    </defs>

                    {/* 海洋底 */}
                    <rect width="1000" height="700" fill="url(#ocean)" />

                    {/* 海洋經緯格線 */}
                    <g stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.5">
                      {[100, 200, 300, 400, 500, 600].map((y) => (
                        <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} />
                      ))}
                      {[150, 300, 450, 600, 750, 900].map((x) => (
                        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="700" />
                      ))}
                    </g>

                    {/* 海浪點紋 */}
                    <g fill="#ffffff" fillOpacity="0.25">
                      {[[120,120],[300,90],[640,110],[860,150],[180,470],[700,520],[880,470],[420,640],[600,660]].map(([cx,cy],i)=>(
                        <g key={i} transform={`translate(${cx},${cy})`}>
                          <path d="M -10 0 q 5 -6 10 0 q 5 6 10 0" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
                        </g>
                      ))}
                    </g>

                    {/* 陸地群（加陰影濾鏡）*/}
                    <g filter="url(#landShadow)">
                      {/* 新界 + 九龍 */}
                      <path
                        d="M 80,180 Q 150,150 220,170 L 320,158 Q 400,168 462,198 L 540,198 Q 624,176 702,220 L 784,262 Q 826,302 802,362 L 752,422 L 700,402 Q 640,422 580,402 L 520,422 L 462,442 Q 400,452 340,432 L 280,402 Q 220,422 160,402 L 120,362 Q 78,300 80,180 Z"
                        fill="url(#land)"
                        stroke="#3f6e29"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      {/* 大嶼山 */}
                      <path
                        d="M 150,500 Q 222,480 282,510 L 352,520 Q 402,540 380,582 L 320,602 Q 250,612 180,592 Q 128,560 150,500 Z"
                        fill="url(#land)"
                        stroke="#3f6e29"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      {/* 港島 */}
                      <path
                        d="M 470,482 Q 532,470 592,486 L 652,492 Q 682,502 670,542 L 600,562 Q 540,566 480,556 Q 448,540 470,482 Z"
                        fill="url(#land)"
                        stroke="#3f6e29"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                      {/* 離島 */}
                      <ellipse cx="690" cy="620" rx="26" ry="16" fill="url(#land)" stroke="#3f6e29" strokeWidth="3" />
                      <ellipse cx="380" cy="580" rx="21" ry="14" fill="url(#land)" stroke="#3f6e29" strokeWidth="3" />
                      <ellipse cx="490" cy="610" rx="23" ry="21" fill="url(#land)" stroke="#3f6e29" strokeWidth="3" />
                    </g>

                    {/* 山脈紋理（淡色）*/}
                    <g stroke="#5a8c3e" strokeOpacity="0.35" strokeWidth="2" fill="none">
                      <path d="M 380,330 q 20,-18 40,0 q 20,18 40,0" />
                      <path d="M 460,300 q 16,-14 32,0 q 16,14 32,0" />
                      <path d="M 250,260 q 18,-15 36,0" />
                    </g>

                    {/* 指南針 */}
                    <g transform="translate(915, 95)">
                      <circle r="42" fill="#0d2818" fillOpacity="0.55" stroke="#facc15" strokeWidth="2.5" />
                      <path d="M 0,-32 L 9,0 L 0,32 L -9,0 Z" fill="#ef4444" />
                      <path d="M 0,32 L 9,0 L 0,0 Z" fill="#fef3c7" />
                      <path d="M 0,-32 L 9,0 L 0,0 Z" fill="#fca5a5" />
                      <text y="-22" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff">N</text>
                    </g>

                    {/* 比例尺 */}
                    <g transform="translate(60, 650)">
                      <rect x="0" y="0" width="120" height="7" fill="#0d2818" fillOpacity="0.6" rx="2" />
                      <rect x="0" y="0" width="60" height="7" fill="#facc15" rx="2" />
                      <text x="60" y="24" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0d3b22">~10 km</text>
                    </g>

                    {/* 地點 pin */}
                    {SPOTS.map((spot) => {
                      const active = selected?.id === spot.id;
                      return (
                        <g
                          key={spot.id}
                          transform={`translate(${spot.x}, ${spot.y})`}
                          onClick={() => loadObservations(spot)}
                          className="cursor-pointer"
                          style={{ transition: 'transform 0.2s' }}
                        >
                          {active && (
                            <circle r="24" fill="rgba(250,204,21,0.4)" className="animate-ping" />
                          )}
                          {/* 水滴形 pin */}
                          <g filter="url(#pinShadow)" transform={active ? 'scale(1.15)' : 'scale(1)'} style={{ transition: 'transform 0.2s' }}>
                            <path
                              d="M 0,8 C -11,-4 -11,-20 0,-22 C 11,-20 11,-4 0,8 Z"
                              fill={active ? '#facc15' : '#ef4444'}
                              stroke="#111"
                              strokeWidth="2.5"
                              strokeLinejoin="round"
                            />
                            <circle cx="0" cy="-12" r="4.5" fill="#fff" />
                          </g>
                          <text
                            y={active ? -32 : -28}
                            textAnchor="middle"
                            className="font-black"
                            style={{
                              fontSize: active ? '15px' : '12px',
                              fill: active ? '#7c2d12' : '#14361f',
                              paintOrder: 'stroke',
                              stroke: '#fff',
                              strokeWidth: '3.5px',
                              strokeLinejoin: 'round',
                            }}
                          >
                            {spot.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* 圖例 */}
                    <g transform="translate(20, 680)">
                      <rect x="-8" y="-16" width="120" height="26" rx="6" fill="#0d2818" fillOpacity="0.55" />
                      <path d="M 6,2 C -2,-6 -2,-15 6,-16 C 14,-15 14,-6 6,2 Z" fill="#ef4444" stroke="#111" strokeWidth="1.5" />
                      <text x="22" y="2" fontSize="12" fill="#fff" fontWeight="900">觀鳥熱點</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* 詳情 */}
              <div className="sm:col-span-2 p-4 sm:p-5" style={{ background: 'linear-gradient(180deg, #fff8d6 0%, #f5e8a3 100%)' }}>
                {!selected ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-amber-700/40 mx-auto mb-3" />
                    <p className="text-amber-800 font-black text-sm">
                      點選左側地圖上的紅點
                    </p>
                    <p className="text-amber-700/70 text-xs mt-1 font-mono">
                      Tap a hotspot to see recent sightings
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <h3 className="text-amber-900 font-black text-lg leading-tight">
                        {selected.name}
                      </h3>
                      <p className="text-amber-700 font-mono text-[10px] italic">
                        {selected.englishName}
                      </p>
                      <p className="text-amber-800 text-xs mt-1.5 leading-snug">
                        {selected.description}
                      </p>
                    </div>

                    <a
                      href={`https://ebird.org/hotspot/${selected.hotspotId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-mono text-[10px] tracking-widest uppercase mb-3 underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      在 eBird 開啟
                    </a>

                    <h4 className="text-amber-900 font-black text-xs tracking-widest mb-2 flex items-center gap-1">
                      <BirdIcon className="w-3 h-3" /> 近期觀察
                    </h4>

                    {loading && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 text-amber-800 animate-spin" />
                      </div>
                    )}

                    {error && (
                      <div className="text-red-700 text-xs p-2 bg-red-100 rounded border border-red-300">
                        ⚠ {error}
                      </div>
                    )}

                    {!loading && !error && observations.length === 0 && (
                      <p className="text-amber-700/70 text-xs italic">
                        最近 30 天沒有觀察紀錄
                      </p>
                    )}

                    {!loading && observations.length > 0 && (
                      <div className="space-y-1.5 max-h-[40vh] sm:max-h-[45vh] overflow-y-auto pr-1">
                        {observations.slice(0, 30).map((obs, i) => (
                          <div
                            key={`${obs.speciesCode}-${i}`}
                            className="bg-white/80 border-[2px] border-gray-900 rounded-md p-2 shadow-[0_2px_0_rgba(0,0,0,0.4)]"
                          >
                            <p className="font-black text-amber-900 text-xs leading-tight">
                              {obs.comName}
                              {obs.howMany && obs.howMany > 1 && (
                                <span className="text-amber-700 font-mono text-[10px] ml-1">×{obs.howMany}</span>
                              )}
                            </p>
                            <p className="font-mono text-[9px] text-amber-700 italic truncate">
                              {obs.sciName}
                            </p>
                            <p className="font-mono text-[9px] text-amber-600 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              {obs.obsDt}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 border-t-2 border-gray-900 shrink-0" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
