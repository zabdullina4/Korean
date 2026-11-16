import type { KeyboardEvent, ReactNode } from 'react';

export type BuildingId = 'g0' | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'lib' | 'club' | 'yard';

export interface BuildingView {
  label: string;
  /** Окна: 1 — горит (пройдено), 0.5 — текущее, 0 — тёмное. */
  windows: number[];
  fog: boolean;
}

interface Geo {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
  d?: number;
  door?: boolean;
  clock?: boolean;
  flag?: boolean;
}

const GEO: Record<Exclude<BuildingId, 'yard'>, Geo> = {
  g6: { x: 214, y: 74, w: 34, h: 40, cols: 2, rows: 3, d: 8 },
  g5: { x: 258, y: 82, w: 34, h: 36, cols: 2, rows: 3, d: 8 },
  g4: { x: 120, y: 86, w: 40, h: 40, cols: 3, rows: 3, d: 8 },
  g3: { x: 168, y: 90, w: 40, h: 40, cols: 3, rows: 3, d: 8 },
  club: { x: 292, y: 150, w: 64, h: 40, cols: 4, rows: 2, d: 12 },
  g1: { x: 26, y: 196, w: 78, h: 52, cols: 4, rows: 2, door: true },
  g2: { x: 124, y: 166, w: 104, h: 70, cols: 5, rows: 2, door: true },
  lib: { x: 258, y: 224, w: 62, h: 44, cols: 3, rows: 2, door: true },
  g0: { x: 28, y: 268, w: 60, h: 46, cols: 3, rows: 2, d: 10 },
};
const ORDER: Exclude<BuildingId, 'yard'>[] = ['g6', 'g5', 'g4', 'g3', 'club', 'g1', 'g2', 'lib', 'g0'];

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g>
      <rect x={x - 2 * s} y={y} width={4 * s} height={16 * s} fill="var(--trunk)" />
      <path
        d={`M${x} ${y - 30 * s} C ${x + 20 * s} ${y - 24 * s}, ${x + 18 * s} ${y + 4 * s}, ${x} ${y + 4 * s} C ${x - 18 * s} ${y + 4 * s}, ${x - 20 * s} ${y - 24 * s}, ${x} ${y - 30 * s}Z`}
        fill="var(--ginkgo)"
      />
    </g>
  );
}

function Label({ cx, y, text }: { cx: number; y: number; text: string }) {
  const w = text.length * 11 + 14;
  return (
    <>
      <rect className="lbl-bg" x={cx - w / 2} y={y} width={w} height={17} rx={8.5} />
      <text className="lbl" x={cx} y={y + 12.5} textAnchor="middle">
        {text}
      </text>
    </>
  );
}

interface Props {
  views: Record<BuildingId, BuildingView>;
  current: BuildingId;
  selected: BuildingId;
  fresh: boolean;
  onSelect(id: BuildingId): void;
}

export function CampusScene({ views, current, selected, fresh, onSelect }: Props) {
  const interact = (id: BuildingId) => ({
    tabIndex: 0,
    role: 'button',
    'aria-label': views[id].label,
    'aria-pressed': selected === id,
    onClick: () => onSelect(id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(id);
      }
    },
  });

  const building = (id: Exclude<BuildingId, 'yard'>): ReactNode => {
    const g = GEO[id];
    const v = views[id];
    const d = g.d ?? Math.round(g.w * 0.18);
    const pw = (g.w - 12) / g.cols;
    const ph = (g.h - (g.door ? 22 : 10)) / g.rows;
    const wins: ReactNode[] = [];
    for (let r = 0, k = 0; r < g.rows; r++)
      for (let c = 0; c < g.cols; c++, k++) {
        const u = v.windows[k] ?? 0;
        wins.push(
          <rect
            key={k}
            className={`win${u === 0.5 ? (fresh ? ' fresh' : ' now') : ''}`}
            x={+(g.x + 6 + c * pw + pw * 0.16).toFixed(1)}
            y={+(g.y + 6 + r * ph + ph * 0.18).toFixed(1)}
            width={+(pw * 0.68).toFixed(1)}
            height={+(ph * 0.6).toFixed(1)}
            rx={1.5}
            fill={u ? 'var(--win-lit)' : 'var(--win)'}
          />,
        );
      }
    const isCur = id === current;
    return (
      <g key={id} className={`bld${v.fog ? ' fogged' : ''}${selected === id ? ' sel' : ''}`} {...interact(id)}>
        <polygon points={`${g.x + g.w},${g.y} ${g.x + g.w + d},${g.y - d * 0.55} ${g.x + g.w + d},${g.y + g.h - d * 0.55} ${g.x + g.w},${g.y + g.h}`} fill="var(--wall-side)" />
        <polygon points={`${g.x - 3},${g.y} ${g.x + g.w + 3},${g.y} ${g.x + g.w + d + 2},${g.y - d * 0.55} ${g.x + d - 1},${g.y - d * 0.55}`} fill="var(--roof)" />
        <rect className="front" x={g.x} y={g.y} width={g.w} height={g.h} fill="var(--wall)" />
        {wins}
        {g.door && <rect x={g.x + g.w / 2 - 8} y={g.y + g.h - 16} width={16} height={16} fill="var(--roof)" />}
        {(g.clock || isCur) && !v.fog && (
          <>
            <circle cx={g.x + g.w / 2} cy={g.y - 12} r={9} fill="var(--wall)" stroke="var(--roof)" strokeWidth={2} />
            <path d={`M${g.x + g.w / 2} ${g.y - 12}v-5M${g.x + g.w / 2} ${g.y - 12}h4`} stroke="var(--roof)" strokeWidth={1.6} />
          </>
        )}
        {isCur && (
          <>
            <path d={`M${g.x + g.w + d + 8} ${g.y + g.h - d * 0.55}V${g.y - 34}`} stroke="var(--ink-2)" strokeWidth={1.5} />
            <path d={`M${g.x + g.w + d + 8} ${g.y - 34}h18l-4 6 4 6h-18z`} fill="var(--jeok)" />
          </>
        )}
        <Label cx={g.x + g.w / 2} y={g.y + g.h + 5} text={v.label.split(',')[0]} />
      </g>
    );
  };

  const leaves: [number, number, number][] = [
    [120, 230, 0],
    [250, 160, 2.2],
    [30, 170, 4.1],
    [370, 180, 1.4],
    [200, 140, 5.3],
    [90, 200, 3.1],
  ];

  return (
    <svg className="scene" viewBox="0 0 400 360" role="group" aria-label="Карта школьного кампуса">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sky)" />
          <stop offset="1" stopColor="var(--sky-2)" />
        </linearGradient>
      </defs>
      <rect width="400" height="360" fill="url(#sky)" />
      <circle cx="335" cy="44" r="16" fill="var(--win-lit)" opacity=".85" />
      <path d="M0 132 L60 92 L110 118 L170 72 L240 116 L300 84 L360 112 L400 96 V170 H0Z" fill="var(--hill-2)" />
      <path d="M0 150 L80 118 L150 140 L230 110 L320 142 L400 124 V190 H0Z" fill="var(--hill)" />
      {ORDER.slice(0, 4).map(building)}
      <rect x="0" y="150" width="400" height="210" fill="var(--ground)" />
      <path d="M190 360 C 200 300, 150 260, 190 222" stroke="var(--path)" strokeWidth="22" fill="none" />
      <g className={`bld${selected === 'yard' ? ' sel' : ''}`} {...interact('yard')}>
        <ellipse className="front" cx="318" cy="306" rx="66" ry="30" fill="var(--track)" />
        <ellipse cx="318" cy="306" rx="48" ry="18" fill="var(--hill)" />
        <Label cx={318} y={341} text="운동장" />
      </g>
      {ORDER.slice(4).map(building)}
      <Tree x={108} y={262} s={1.1} />
      <Tree x={248} y={186} s={0.9} />
      <Tree x={14} y={180} s={0.8} />
      <Tree x={380} y={196} s={0.9} />
      <Tree x={118} y={322} s={1} />
      {leaves.map(([x, y, dl]) => (
        <ellipse key={`${x}-${y}`} className="leaf" cx={x} cy={y} rx={3} ry={1.8} style={{ animationDelay: `${dl}s`, transformBox: 'fill-box' }} />
      ))}
    </svg>
  );
}
