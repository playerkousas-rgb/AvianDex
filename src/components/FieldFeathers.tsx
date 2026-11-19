const FEATHERS = [
  { color: '#e6ba77', angle: -18 },
  { color: '#b3d197', angle: 0 },
  { color: '#8dc6cb', angle: 17 },
];

/** Decorative feather marks for the field guide, not status indicators. */
export function FieldFeathers({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center ${className}`}>
      {FEATHERS.map(({ color, angle }) => (
        <svg key={color} viewBox="0 0 24 30" className="h-[1em] w-[.8em] overflow-visible" style={{ color, transform: `rotate(${angle}deg)` }}>
          <path fill="currentColor" d="M3.9 22.9C1.7 17.9 4 12.4 7.9 8.5l.5 3.4 2.5-6.1C14.4 3.1 18.3 1.5 22 1c.3 4.4-.5 8.2-2.3 11.6l-5.4 3.2 3.6-.4c-4 5.6-8.7 8.4-14 7.5Z" />
          <path d="M1.7 28.5C6.9 21 12.7 13.7 18.5 6.2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M6.2 22.4c4.1-5.6 8.3-11 12.6-16.4" stroke="#253329" strokeOpacity=".45" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      ))}
    </span>
  );
}
