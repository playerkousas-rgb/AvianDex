// ============================================================
// AvianDex — 香港觀鳥地圖
// ------------------------------------------------------------
// 為甚麼要重寫？
//   舊版用一個手繪 SVG 輪廓，座標是「在 viewBox 上大約的位置」，
//   海陸邊界、比例、位置全部只是示意 —— 用戶的原話是「太粗糙」。
//
//   現在改用真實地圖：
//     底圖  Lands Department（地政總署）iB20000 的 XYZ 圖磚
//           https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/WGS84/{z}/{x}/{y}.png
//           同一套 API 已在 HKMAP / HM20C 兩個 repo 用過，免費、免 key。
//     地名  .../xyz/label/hk/tc/WGS84/{z}/{x}/{y}.png（中文地名）
//     引擎  Leaflet 1.9（同 HKMAP 一致）
//
// 雀鳥出沒點怎麼來（這一層是「真數據」，不是我們自己標）：
//   1 熱點    /api/ebird?hotspots=1 → eBird 官方 hotspot 的 locId + lat/lng
//   2 座標    /api/ebird?near=lat,lng&dist=25 → 該圓心 25 km 內的近期觀察
//             （eBird 的 geo/recent 上限 50 km，所以用多個圓心拼成覆蓋網）
//   3 密度    每筆觀察都有 lat/lng，直接在 Leaflet 上畫成熱度圓
//
// ⚠️ 所有雀鳥位置都來自 eBird 公開紀錄，不是我們憑感覺放點。
//    沒有 EBIRD_API_KEY 時，地圖照開、熱點照顯示（靜態後備），
//    但會明寫「未接上 eBird」，不會假裝有紀錄。
// ============================================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X, MapPin, ExternalLink, Loader2, Layers, Search, Bird as BirdIcon, RotateCw,
} from 'lucide-react';
import { ENTRIES } from '../lib/explorer';
import { codeForId, idForCode } from '../lib/ebirdCode';

const LANDSD = 'https://mapapi.geodata.gov.hk/gs/api/v1.0.0';

const BASE_TILES = {
  basemap: `${LANDSD}/xyz/basemap/WGS84/{z}/{x}/{y}.png`,
  imagery: `${LANDSD}/xyz/imagery/WGS84/{z}/{x}/{y}.png`,
} as const;
const LABEL_TILE = `${LANDSD}/xyz/label/hk/tc/WGS84/{z}/{x}/{y}.png`;

const HK_CENTER: [number, number] = [22.38, 114.12];

/**
 * Leaflet 的預設 marker 圖示是用 CSS 背景圖指向 node_modules 內的路徑，
 * 打包之後那條路徑會 404（經典 Leaflet + bundler 問題）。
 * 我們全部用 circleMarker（純 SVG，不載圖），所以直接把圖示路徑清空，
 * 避免瀏覽器發出無謂的 404 請求。
 */
L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '' });

/**
 * 覆蓋網的圓心。
 * eBird 的 geo/recent 每個請求只覆蓋 50 km，而香港東西相距約 60 km，
 * 所以要用幾個圓心拼起來，才不會「大嶼山有紀錄、西貢永遠空白」。
 * 這些是幾何中心，不是觀鳥點 —— 觀鳥點是 eBird 的 hotspot，由 API 回傳。
 */
const COVER_CENTERS: { id: string; lat: number; lng: number; r: number }[] = [
  { id: 'west', lat: 22.30, lng: 113.95, r: 25 },  // 大嶼山／屯門
  { id: 'mid', lat: 22.42, lng: 114.10, r: 25 },   // 新界中／北
  { id: 'east', lat: 22.38, lng: 114.32, r: 25 },  // 西貢／東北
  { id: 'south', lat: 22.25, lng: 114.17, r: 25 }, // 港島南／離島
];

/** 沒有 key 時的後備熱點（只在 API 失敗時用，會標明「未接上 eBird」） */
const FALLBACK_SPOTS: Hotspot[] = [
  { locId: 'L922779', name: '米埔自然保護區 Mai Po', lat: 22.4894, lng: 114.0386, numSpecies: null, lastObsDt: null },
  { locId: 'L1029192', name: '塱原 Long Valley', lat: 22.5013, lng: 114.1133, numSpecies: null, lastObsDt: null },
  { locId: 'L1295416', name: '大埔滘 Tai Po Kau', lat: 22.4348, lng: 114.1795, numSpecies: null, lastObsDt: null },
  { locId: 'L1037411', name: '城門水塘 Shing Mun', lat: 22.3856, lng: 114.1450, numSpecies: null, lastObsDt: null },
  { locId: 'L1037452', name: '西貢郊野公園 Sai Kung', lat: 22.3950, lng: 114.3200, numSpecies: null, lastObsDt: null },
  { locId: 'L1188419', name: '九龍公園 Kowloon Park', lat: 22.3000, lng: 114.1700, numSpecies: null, lastObsDt: null },
  { locId: 'L2208537', name: '船灣 Plover Cove', lat: 22.4700, lng: 114.2400, numSpecies: null, lastObsDt: null },
];

interface Hotspot {
  locId: string;
  name: string;
  lat: number;
  lng: number;
  numSpecies: number | null;
  lastObsDt: string | null;
}

/** 某隻雀在香港的近期紀錄（/api/ebird?species=） */
interface SpeciesObs {
  locId: string;
  locName: string;
  lat: number;
  lng: number;
  obsDt: string;
  howMany?: number;
  comName?: string;
}

interface Observation {
  speciesCode: string;
  comName: string;
  sciName: string;
  locName?: string;
  obsDt: string;
  howMany?: number;
  lat?: number;
  lng?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** eBird 回傳 ISO 時間字串 → 顯示用日期 */
function fmtObsDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.length >= 10 ? raw.slice(0, 10) : raw;
  return d.toISOString().slice(0, 10);
}

type Layer = 'basemap' | 'imagery';

export const BirdingMapModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayer = useRef<L.TileLayer | null>(null);
  const labelLayer = useRef<L.TileLayer | null>(null);
  const hotspotLayer = useRef<L.LayerGroup | null>(null);
  const obsLayer = useRef<L.LayerGroup | null>(null);

  const [layer, setLayer] = useState<Layer>('basemap');
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [obs, setObs] = useState<Observation[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [loadingObs, setLoadingObs] = useState(false);
  const [apiNote, setApiNote] = useState<string | null>(null);
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [showDensity, setShowDensity] = useState(true);
  const [query, setQuery] = useState('');

  /* ────────────────────────────────────────────────────────────
   * 雙向查詢（用戶要求：搵隻雀→邊度有；點熱點→有咩雀）
   *
   *   mode='spot'  搜觀鳥點名稱（原本的行為）
   *   mode='bird'  搜雀名 → 取該雀在香港的近期紀錄，地圖只顯示那些點
   *
   * 兩個方向都靠 eBird：
   *   雀→點  /api/ebird?species=<code>
   *   點→雀  /api/ebird?spplist=<locId>
   * ──────────────────────────────────────────────────────────── */
  const [mode, setMode] = useState<'spot' | 'bird'>('spot');
  const [birdPick, setBirdPick] = useState<{ id: string; name: string; code: string } | null>(null);
  const [birdObs, setBirdObs] = useState<SpeciesObs[]>([]);
  const [loadingBird, setLoadingBird] = useState(false);
  const [spotSpecies, setSpotSpecies] = useState<{ code: string; name: string; id: string | null }[] | null>(null);
  const [loadingSpecies, setLoadingSpecies] = useState(false);
  const birdLayer = useRef<L.LayerGroup | null>(null);

  /* 全部 569 隻的可搜尋索引（雀名／英文名／學名） */
  const birdIndex = React.useMemo(
    () => Object.entries(ENTRIES).map(([id, e]) => ({ id, zh: e.z, en: e.e, sci: e.s, code: e.code || '' })),
    [],
  );
  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return birdIndex
      .filter((b) => b.zh.includes(query.trim()) || b.en.toLowerCase().includes(q) || b.sci.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, birdIndex]);

  /* ---------------- 地圖初始化 ---------------- */
  useEffect(() => {
    if (!isOpen || !mapEl.current || mapRef.current) return;

    const map = L.map(mapEl.current, {
      center: HK_CENTER,
      zoom: 12,
      minZoom: 10,
      maxZoom: 19,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;

    baseLayer.current = L.tileLayer(BASE_TILES.basemap, {
      maxZoom: 19,
      attribution: '地圖 © 地政總署 Lands Department · 觀察紀錄 © eBird / Cornell Lab',
    }).addTo(map);

    labelLayer.current = L.tileLayer(LABEL_TILE, { maxZoom: 19, opacity: 0.9 }).addTo(map);

    hotspotLayer.current = L.layerGroup().addTo(map);
    obsLayer.current = L.layerGroup().addTo(map);
    birdLayer.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      baseLayer.current = null;
      labelLayer.current = null;
      hotspotLayer.current = null;
      obsLayer.current = null;
      birdLayer.current = null;
    };
  }, [isOpen]);

  /* 底圖切換：地形 / 航空照片。切換時要重建 label 圖層，否則地名會被蓋住 */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !baseLayer.current) return;
    map.removeLayer(baseLayer.current);
    baseLayer.current = L.tileLayer(BASE_TILES[layer], {
      maxZoom: 19,
      attribution: '地圖 © 地政總署 Lands Department · 觀察紀錄 © eBird / Cornell Lab',
    }).addTo(map);
    baseLayer.current.bringToBack();
    if (labelLayer.current) labelLayer.current.bringToFront();
  }, [layer]);

  /* ---------------- 熱點 ---------------- */
  const loadHotspots = useCallback(async () => {
    /* 先讓出一個 microtask：effect 內同步 setState 會觸發連鎖 render
       （lint react-hooks/set-state-in-effect）。真實 fetch 本身也是非同步，
       所以這一行對行為沒有影響，只是把「同步」變成「下一格」。 */
    await Promise.resolve();
    setLoadingSpots(true);
    setApiNote(null);
    try {
      const res = await fetch('/api/ebird?hotspots=1&region=HK');
      const text = await res.text();
      let data: { hotspots?: Hotspot[]; error?: string; details?: string } | null = null;
      try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 160)); }
      if (!res.ok) throw new Error(data?.error || data?.details || `HTTP ${res.status}`);
      const rows = (data?.hotspots || []).filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lng));
      if (!rows.length) throw new Error('eBird 未回傳熱點');
      setHotspots(rows);
    } catch (e) {
      /* 失敗時用後備點，但要在介面上講清楚，不可以假裝是真數據 */
      setHotspots(FALLBACK_SPOTS);
      setApiNote(`未能接上 eBird（${e instanceof Error ? e.message : '未知錯誤'}），以下為常用觀鳥點，非即時數據。`);
    } finally {
      setLoadingSpots(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    /* setTimeout(0) 才觸發：effect 內直接 setState 會觸發連鎖 render
       （react-hooks/set-state-in-effect）。推去下一個 task 就無這個問題，
       對用戶而言仍然是「一開地圖就開始載入」。 */
    const t = setTimeout(() => { void loadHotspots(); }, 0);
    const m = mapRef.current;
    // 地圖尺寸在 modal 動畫完成後才有最終大小，補一次 invalidateSize
    const t2 = setTimeout(() => m?.invalidateSize(), 260);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [isOpen, loadHotspots]);

  /* ---------------- 繪熱點 ---------------- */
  useEffect(() => {
    const g = hotspotLayer.current;
    if (!g) return;
    g.clearLayers();
    const q = query.trim().toLowerCase();
    hotspots
      .filter((h) => !q || h.name.toLowerCase().includes(q))
      .forEach((h) => {
        const marker = L.circleMarker([h.lat, h.lng], {
          radius: 7,
          color: '#0f172a',
          weight: 2,
          fillColor: '#facc15',
          fillOpacity: 0.95,
        });
        marker.bindTooltip(h.name, { direction: 'top', offset: [0, -6] });
        marker.on('click', () => setSelected(h));
        marker.addTo(g);
      });
  }, [hotspots, query]);

  /* ---------------- 近期觀察（多圓心拼覆蓋） ---------------- */
  const loadObservations = useCallback(async () => {
    await Promise.resolve();
    setLoadingObs(true);
    setApiNote(null);
    try {
      const results = await Promise.all(
        COVER_CENTERS.map(async (c) => {
          const res = await fetch(`/api/ebird?near=${c.lat},${c.lng}&dist=${c.r}&back=14&max=300`);
          if (!res.ok) return [] as Observation[];
          const data = (await res.json()) as { observations?: Observation[] };
          return data.observations || [];
        }),
      );
      /* 同一隻雀可能在多個圓心重複出現 → 用 speciesCode + 位置 + 日期去重 */
      const seen = new Set<string>();
      const merged: Observation[] = [];
      results.flat().forEach((o) => {
        const key = `${o.speciesCode}|${o.locName || ''}|${o.obsDt.slice(0, 10)}`;
        if (seen.has(key)) return;
        seen.add(key);
        merged.push(o);
      });
      setObs(merged);
      if (!merged.length) setApiNote('最近 14 日 eBird 未有回傳香港的公開紀錄。');
    } catch (e) {
      setObs([]);
      setApiNote(`未能接上 eBird（${e instanceof Error ? e.message : '未知錯誤'}）。`);
    } finally {
      setLoadingObs(false);
    }
  }, []);

  /* ---------------- 雀 → 點：搵隻雀近期在香港邊度出現 ---------------- */
  const loadSpecies = useCallback(async (id: string) => {
    const e = ENTRIES[id];
    if (!e) return;
    const code = codeForId(id);
    setBirdPick({ id, name: e.z, code: code || '' });
    setMode('bird');
    setBirdObs([]);
    setSpotSpecies(null);
    if (!code) {
      setApiNote(`《${e.z}》在 eBird 沒有對應代碼，所以查不到紀錄。`);
      return;
    }
    await Promise.resolve();
    setLoadingBird(true);
    setApiNote(null);
    try {
      const res = await fetch(`/api/ebird?species=${encodeURIComponent(code)}&back=30`);
      const text = await res.text();
      let data: { observations?: SpeciesObs[]; error?: string; details?: string } | null = null;
      try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 160)); }
      if (!res.ok) throw new Error(data?.error || data?.details || `HTTP ${res.status}`);
      const rows = (data?.observations || []).filter((o) => Number.isFinite(o.lat) && Number.isFinite(o.lng));
      setBirdObs(rows);
      if (!rows.length) setApiNote(`《${e.z}》最近 30 日 eBird 沒有香港的公開紀錄（可能是罕見、季節性，或只是未有人提交）。`);
    } catch (err) {
      setApiNote(`查詢《${e.z}》失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setLoadingBird(false);
    }
  }, []);

  /* 點 → 雀：這個熱點有咩雀 */
  const loadSpotSpecies = useCallback(async (h: Hotspot) => {
    setSpotSpecies(null);
    await Promise.resolve();
    setLoadingSpecies(true);
    try {
      const res = await fetch(`/api/ebird?spplist=${encodeURIComponent(h.locId)}`);
      const text = await res.text();
      let data: { speciesCodes?: string[]; error?: string; details?: string } | null = null;
      try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 160)); }
      if (!res.ok) throw new Error(data?.error || data?.details || `HTTP ${res.status}`);
      const list = (data?.speciesCodes || [])
        .map((code) => {
          const id = idForCode(code);
          return { code, name: id ? ENTRIES[id].z : code, id };
        })
        /* 只顯示本圖鑑有的（可以點入去），其餘不列，避免一堆英文 code */
        .filter((x) => x.id)
        .slice(0, 60);
      setSpotSpecies(list);
    } catch (err) {
      setApiNote(`讀取熱點物種失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setLoadingSpecies(false);
    }
  }, []);

  /* ---------------- 繪「這隻雀」的紀錄點 ---------------- */
  useEffect(() => {
    const g = birdLayer.current;
    if (!g) return;
    g.clearLayers();
    if (!birdObs.length) return;
    birdObs.forEach((o) => {
      L.circleMarker([o.lat, o.lng], {
        radius: 8,
        color: '#7c2d12',
        weight: 2,
        fillColor: '#fbbf24',
        fillOpacity: 0.95,
      })
        .bindTooltip(`${o.locName} · ${fmtObsDate(o.obsDt)}${o.howMany ? ` ×${o.howMany}` : ''}`, { direction: 'top' })
        .addTo(g);
    });
    const map = mapRef.current;
    if (map && birdObs.length) {
      const bounds = L.latLngBounds(birdObs.map((o) => [o.lat, o.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.25), { maxZoom: 14 });
    }
  }, [birdObs]);

  /* 熱點相關的圖層：搵雀模式時淡出，避免搶眼 */
  useEffect(() => {
    const g = hotspotLayer.current;
    if (!g) return;
    // 用 opacity 控制（circleMarker 要逐個設）
    g.eachLayer((l) => {
      const cm = l as L.CircleMarker;
      cm.setStyle({ opacity: mode === 'bird' ? 0.25 : 1, fillOpacity: mode === 'bird' ? 0.2 : 0.95 });
    });
  }, [mode, hotspots, query]);

  /* ---------------- 繪觀察密度 ---------------- */
  useEffect(() => {
    const g = obsLayer.current;
    if (!g) return;
    g.clearLayers();
    if (!showDensity) return;
    obs.forEach((o) => {
      if (!Number.isFinite(o.lat) || !Number.isFinite(o.lng)) return;
      L.circleMarker([o.lat as number, o.lng as number], {
        radius: Math.min(11, 3 + Math.log2((o.howMany || 1) + 1) * 2),
        color: '#c4543c',
        weight: 1,
        fillColor: '#ef4444',
        fillOpacity: 0.35,
      })
        .bindTooltip(`${o.comName}${o.howMany ? ` ×${o.howMany}` : ''} · ${fmtObsDate(o.obsDt)}`, {
          direction: 'top',
        })
        .addTo(g);
    });
  }, [obs, showDensity]);

  /* 點熱點 → 飛過去，並載入該點觀察（用座標，不必依賴 hotspot 座標是否準） */
  useEffect(() => {
    if (!selected || !mapRef.current) return;
    mapRef.current.flyTo([selected.lat, selected.lng], 15, { duration: 0.7 });
    /* 用戶要求：「點那個熱點就知道會有什麼鳥出沒」
       → 一選熱點就自動查該點的物種清單（eBird product/spplist） */
    void loadSpotSpecies(selected);
  }, [selected, loadSpotSpecies]);

  const speciesRank = React.useMemo(() => {
    const counts = new Map<string, { name: string; sci: string; n: number }>();
    obs.forEach((o) => {
      const cur = counts.get(o.speciesCode);
      if (cur) cur.n += 1;
      else counts.set(o.speciesCode, { name: o.comName, sci: o.sciName, n: 1 });
    });
    return [...counts.values()].sort((a, b) => b.n - a.n).slice(0, 12);
  }, [obs]);

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
            initial={{ scale: 0.94, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            className="w-full max-w-5xl rounded-t-3xl sm:rounded-3xl border-[5px] sm:border-[6px] border-gray-900 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden my-0 sm:my-4 max-h-[95dvh] sm:max-h-[92vh] flex flex-col bg-[#1b1a17]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-b from-[#1f3d2b] to-[#122318] border-b-[3px] border-yellow-400/25 px-3 sm:px-4 py-3 flex items-center gap-3 shrink-0">
              <MapPin className="w-6 h-6 text-yellow-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-yellow-300/70 font-mono uppercase tracking-widest">
                  Lands Department · iB20000 tiles · eBird records
                </p>
                <h2 className="text-white font-black text-base sm:text-lg tracking-tight truncate">
                  香港觀鳥地圖
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="關閉"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500 border border-white/25 text-white flex items-center justify-center active:scale-90 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 工具列 */}
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-black/40 border-b border-white/10 shrink-0">
              <button
                onClick={() => setLayer((v) => (v === 'basemap' ? 'imagery' : 'basemap'))}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg"
              >
                <Layers className="w-3.5 h-3.5" />
                {layer === 'basemap' ? '地形圖' : '航空照片'}
              </button>
              <button
                onClick={() => void loadObservations()}
                disabled={loadingObs}
                className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-100 text-[11px] font-bold px-2.5 py-1.5 rounded-lg disabled:opacity-50"
              >
                {loadingObs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BirdIcon className="w-3.5 h-3.5" />}
                {loadingObs ? '搵緊紀錄…' : '顯示近期出沒'}
              </button>
              {mode === 'bird' && (
                <button
                  onClick={() => { setMode('spot'); setBirdPick(null); setBirdObs([]); setApiNote(null); }}
                  className="flex items-center gap-1 bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/50 text-amber-100 text-[11px] font-bold px-2.5 py-1.5 rounded-lg"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  清除雀鳥篩選
                </button>
              )}
              <button
                onClick={() => setShowDensity((v) => !v)}
                className={`flex items-center gap-1 border text-[11px] font-bold px-2.5 py-1.5 rounded-lg ${
                  showDensity
                    ? 'bg-red-500/25 border-red-400/45 text-red-100'
                    : 'bg-white/8 border-white/15 text-white/55'
                }`}
              >
                密度點
              </button>
              {/* 搜尋：一個框同時搜「雀名」與「觀鳥點」。
                  用戶要求：「我搜尋那隻鳥就看到會在那出沒」。
                  所以輸入雀名時，下面直接彈出配對的雀，揀一隻就跳去顯示牠的紀錄。 */}
              <div className="relative ml-auto">
                <Search className="w-3.5 h-3.5 text-white/35 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搵雀名／觀鳥點"
                  className="bg-black/50 border border-white/15 rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-white placeholder:text-white/25 w-[150px] focus:outline-none focus:border-amber-400/50"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-[600] mt-1 right-0 w-[240px] bg-[#141311] border border-amber-400/30 rounded-lg overflow-hidden shadow-2xl">
                    {suggestions.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setQuery(''); void loadSpecies(b.id); }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-amber-400/15 border-b border-white/5 last:border-0"
                      >
                        <p className="text-white text-[11.5px] font-bold truncate">{b.zh}</p>
                        <p className="text-white/35 text-[9px] truncate">{b.en}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {apiNote && (
              <p className="px-3 py-1.5 bg-amber-950/60 border-b border-amber-500/25 text-amber-200/85 text-[10px] leading-snug shrink-0">
                ⚠ {apiNote}
              </p>
            )}

            {/* 地圖 + 側欄 */}
            <div className="flex-1 grid md:grid-cols-3 overflow-hidden min-h-0">
              <div className="md:col-span-2 relative min-h-[46dvh] md:min-h-0">
                <div ref={mapEl} className="absolute inset-0 z-0" />
                {loadingSpots && (
                  <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/35 pointer-events-none">
                    <Loader2 className="w-7 h-7 text-yellow-300 animate-spin" />
                  </div>
                )}
              </div>

              <div className="overflow-y-auto bg-[#201d18] border-t md:border-t-0 md:border-l border-white/10 p-3">
                {selected ? (
                  <>
                    <div className="flex items-start gap-1.5">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-amber-100 font-black text-sm leading-tight">{selected.name}</h3>
                        <p className="text-white/35 font-mono text-[9.5px]">{selected.locId}</p>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="text-white/35 hover:text-white text-[10px] shrink-0"
                      >
                        返回
                      </button>
                    </div>

                    {selected.numSpecies != null && (
                      <p className="text-emerald-300/80 text-[10.5px] mt-1">
                        歷來累積 {selected.numSpecies} 種
                      </p>
                    )}

                    <a
                      href={`https://ebird.org/hotspot/${selected.locId}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 inline-flex items-center gap-1 text-amber-300/85 hover:text-amber-200 text-[10.5px] underline"
                    >
                      <ExternalLink className="w-3 h-3" /> 在 eBird 開啟熱點
                    </a>

                    {/* 這個熱點有咩雀（eBird 歷來紀錄） */}
                    <h4 className="mt-3 mb-1.5 text-white/70 font-black text-[11px] flex items-center gap-1">
                      <BirdIcon className="w-3 h-3" /> 這個熱點有咩雀
                    </h4>
                    {loadingSpecies && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
                    {!loadingSpecies && spotSpecies && spotSpecies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {spotSpecies.map((sp) => (
                          <button
                            key={sp.code}
                            onClick={() => sp.id && void loadSpecies(sp.id)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/12 hover:bg-amber-400/30 border border-amber-400/25 text-amber-100"
                            title="在地圖上顯示這隻雀的出沒點"
                          >
                            {sp.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {!loadingSpecies && spotSpecies && spotSpecies.length === 0 && (
                      <p className="text-white/30 text-[10px] mb-2">未能讀取（可能需要 EBIRD_API_KEY）</p>
                    )}

                    <h4 className="mt-3 mb-1.5 text-white/70 font-black text-[11px] flex items-center gap-1">
                      <BirdIcon className="w-3 h-3" /> 近期觀察
                    </h4>
                    {loadingObs && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
                    {!loadingObs && obs.length === 0 && (
                      <p className="text-white/30 text-[10.5px] leading-snug">
                        按上面「顯示近期出沒」載入全港最近 14 日紀錄。
                      </p>
                    )}
                    {obs.length > 0 && (
                      <div className="space-y-1">
                        {speciesRank.map((s) => (
                          <div key={s.sci} className="bg-black/35 rounded px-2 py-1 leading-tight">
                            <p className="text-white text-[11px] font-bold truncate">{s.name}</p>
                            <p className="text-white/35 font-mono text-[8.5px] italic truncate">{s.sci}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {mode === 'bird' && birdPick && (
                      <div className="mb-2.5 bg-amber-400/10 border border-amber-400/30 rounded-lg p-2">
                        <p className="text-amber-100 font-black text-[12px] leading-tight">
                          《{birdPick.name}》最近 30 日出沒點
                        </p>
                        {loadingBird && (
                          <div className="flex items-center gap-1 mt-1">
                            <Loader2 className="w-3 h-3 text-amber-300 animate-spin" />
                            <span className="text-white/40 text-[9.5px]">查緊 eBird…</span>
                          </div>
                        )}
                        {!loadingBird && birdObs.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            {Object.entries(
                              birdObs.reduce<Record<string, { name: string; n: number; last: string }>>((acc, o) => {
                                const k = o.locId;
                                if (!acc[k]) acc[k] = { name: o.locName, n: 0, last: o.obsDt };
                                acc[k].n += 1;
                                if (o.obsDt > acc[k].last) acc[k].last = o.obsDt;
                                return acc;
                              }, {}),
                            )
                              .sort((a, b) => b[1].n - a[1].n)
                              .map(([locId, v]) => (
                                <div key={locId} className="bg-black/35 rounded px-2 py-1 leading-tight">
                                  <p className="text-white text-[10.5px] font-bold truncate">{v.name}</p>
                                  <p className="text-white/35 font-mono text-[8.5px]">
                                    {v.n} 次 · 最後 {fmtObsDate(v.last)}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                        {!loadingBird && birdObs.length === 0 && (
                          <p className="text-white/35 text-[9.5px] leading-snug mt-1">
                            沒有紀錄。可能是季節未到、數目稀少，或只是未有人提交。
                          </p>
                        )}
                      </div>
                    )}
                    <h3 className="text-amber-100 font-black text-[12px] mb-1.5">觀鳥熱點</h3>
                    <p className="text-white/30 text-[9.5px] leading-snug mb-2">
                      按地圖上的黃點看該點資料。
                    </p>
                    <div className="space-y-1">
                      {hotspots
                        .filter((h) => !query.trim() || h.name.toLowerCase().includes(query.trim().toLowerCase()))
                        .slice(0, 40)
                        .map((h) => (
                          <button
                            key={h.locId}
                            onClick={() => setSelected(h)}
                            className="w-full text-left bg-black/30 hover:bg-black/55 border border-white/8 hover:border-amber-400/35 rounded px-2 py-1.5"
                          >
                            <p className="text-white text-[11px] font-bold truncate">{h.name}</p>
                            <p className="text-white/30 font-mono text-[8px]">
                              {h.lat.toFixed(3)}, {h.lng.toFixed(3)}
                            </p>
                          </button>
                        ))}
                    </div>

                    {speciesRank.length > 0 && (
                      <>
                        <h3 className="text-amber-100 font-black text-[12px] mt-3 mb-1.5">全港常見（近 14 日）</h3>
                        <div className="space-y-1">
                          {speciesRank.slice(0, 8).map((s) => (
                            <div key={s.sci} className="bg-black/30 rounded px-2 py-1">
                              <p className="text-white text-[10.5px] font-bold truncate">{s.name}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                <p className="mt-3 pt-2 border-t border-white/8 text-white/25 text-[8.5px] leading-relaxed">
                  底圖：地政總署 iB20000（XYZ 圖磚）· 地名：地政總署 Map Label API ·
                  紀錄：eBird / Cornell Lab（公開觀察紀錄，非即時，可能有延誤）
                </p>
              </div>
            </div>

            <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 shrink-0" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BirdingMapModal;
