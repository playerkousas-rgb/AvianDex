import { useId } from 'react';

// Both pieces use the same gradient and speckles; only the clipping paths move apart.
const CROWN = 'M47 128C54 87 90 25 120 25c31 0 66 62 73 114';
const BASE = 'C201 193 173 224 120 224c-49 0-83-32-73-96';
const CRACK = 'M47 128l22 7 14-8 18 20 17-15 18 15 18-18 17 14 22-4';
const CRACK_BACK = 'l-22 4-17-14-18 18-18-15-17 15-18-20-14 8-22-7';
const SPECKLES = [
  [104, 46, 1.3], [124, 41, 1.7], [137, 54, 2.7], [131, 61, 1.1],
  [89, 70, 2.6], [101, 81, 1.1], [146, 76, 1.8], [157, 79, 1.1],
  [137, 91, 1.4], [152, 94, 2.1], [163, 106, 3.6], [171, 113, 1.7],
  [77, 104, 1.9], [67, 116, 2.8], [77, 126, 1.1], [89, 116, 1.2],
  [57, 147, 1.6], [62, 155, 3], [74, 162, 1.1], [81, 171, 1.9],
  [104, 155, 1.3], [124, 174, 2.2], [135, 167, 1.1], [148, 157, 2.5],
  [161, 151, 1.6], [171, 162, 3.2], [181, 175, 2.2], [163, 183, 1.9],
  [83, 192, 3.9], [93, 199, 2], [101, 189, 1.8], [107, 206, 1.5],
  [120, 215, 1.5], [129, 201, 1.1], [140, 209, 2.7], [153, 194, 2.3],
];

export function HatchingEgg() {
  const id = useId();
  const shell = `#${id}-shell`;
  return (
    <svg viewBox="0 0 240 246" className="welcome-egg-art" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-cream`} cx="34%" cy="30%" r="74%">
          <stop offset="0" stopColor="#fff9e8" />
          <stop offset=".55" stopColor="#f2dfb7" />
          <stop offset="1" stopColor="#b48e5d" />
        </radialGradient>
        <radialGradient id={`${id}-light`}>
          <stop offset="0" stopColor="#ffe2a0" stopOpacity=".92" />
          <stop offset="1" stopColor="#f3bc62" stopOpacity="0" />
        </radialGradient>
        <g id={`${id}-shell`}>
          <path d={`${CROWN}${BASE}Z`} fill={`url(#${id}-cream)`} stroke="#72573e" strokeWidth="1.6" />
          <path d="M58 147C61 100 95 43 118 37" fill="none" stroke="#fffaea" strokeOpacity=".65" strokeWidth="2" strokeLinecap="round" />
          {SPECKLES.map(([x, y, r]) => (
            <ellipse key={x + ',' + y} cx={x} cy={y} rx={r} ry={r * .72} fill="#826044" opacity={.28 + r * .065} transform={`rotate(-25 ${x} ${y})`} />
          ))}
        </g>
        <clipPath id={`${id}-top`}><path d={`${CROWN}${CRACK_BACK}Z`} /></clipPath>
        <clipPath id={`${id}-base`}><path d={`${CRACK}${BASE}Z`} /></clipPath>
      </defs>

      <ellipse cx="120" cy="226" rx="76" ry="10" fill="#182015" opacity=".22" />
      <circle className="egg-glow" cx="120" cy="127" r="75" fill={`url(#${id}-light)`} />
      <g className="egg-intact">
        <use href={shell} />
        <path className="egg-crack" d={CRACK} pathLength="1" fill="none" stroke="#67513b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="egg-top">
        <use href={shell} clipPath={`url(#${id}-top)`} />
        <path d={CRACK} stroke="#b18c62" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </g>
      <g className="egg-base">
        <use href={shell} clipPath={`url(#${id}-base)`} />
        <path d={CRACK} stroke="#fff0cf" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </g>
      <g className="egg-chips" fill="#f2dbaf">
        <path d="m53 100 8 5-10 3Z" />
        <path d="m187 101 5-9 4 7Z" />
        <path d="m198 145 9-5-1 8Z" />
      </g>
    </svg>
  );
}
