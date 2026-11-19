import { Binoculars, Camera } from 'lucide-react';
import { BIRD_CAPTURE_APP_URL } from '../config';
import type { Lang } from '../lib/explorer';
import { BALL_BASE, BALL_ICON, BALL_LABEL, BALL_SIZE, DEVICE_BALL } from './ballStyles';

type Props = { lang: Lang; compact?: boolean; icon?: 'camera' | 'binoculars' };

export function BirdCaptureLink({ lang, compact = false, icon = 'camera' }: Props) {
  const Icon = icon === 'binoculars' ? Binoculars : Camera;
  const label = lang === 'en' ? 'Open BIRD-DEX 3 to photograph birds' : '前往 BIRD-DEX 3 拍鳥';
  const base = compact ? DEVICE_BALL : `${BALL_BASE} ${BALL_SIZE}`;
  return (
    <a
      href={BIRD_CAPTURE_APP_URL}
      target="_blank"
      rel="noopener"
      title={label}
      aria-label={label}
      className={`${base} bg-gradient-to-br from-[#f6e5bf] to-[#c9b278] text-[#263528] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6e5bf]`}
    >
      <Icon className={compact ? 'h-4 w-4' : BALL_ICON} strokeWidth={2.4} aria-hidden="true" />
      {!compact && <span aria-hidden="true" className={`${BALL_LABEL('right')} group-focus-visible:opacity-100`}>{label}</span>}
    </a>
  );
}
