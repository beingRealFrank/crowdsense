import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { dayStartMs } from '../shared/day';

import { COLORS } from './palette';

// 100 little people, coloured by share. The crowd motif of the game.
export const CrowdDots = (props: { shares: number[]; highlight?: number | null; size?: number }) => {
  const { shares, highlight = null, size = 14 } = props;
  const cells: number[] = [];
  shares.forEach((s, i) => {
    for (let k = 0; k < s; k++) cells.push(i);
  });
  while (cells.length < 100) cells.push(-1);
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(20, ${size}px)` }} aria-hidden>
      {cells.slice(0, 100).map((c, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 10 10">
          <circle cx="5" cy="3" r="2.4" fill={c < 0 ? '#ddd3bf' : COLORS[c]} opacity={highlight === null || c === highlight ? 1 : 0.35} />
          <path d="M1.2 10 C1.2 6.4 8.8 6.4 8.8 10Z" fill={c < 0 ? '#ddd3bf' : COLORS[c]} opacity={highlight === null || c === highlight ? 1 : 0.35} />
        </svg>
      ))}
    </div>
  );
};

// Stacked 100% bar. With onChange it becomes the "read the crowd" control:
// drag the dividers between answers.
export const SplitBar = (props: {
  shares: number[];
  onChange?: (next: number[]) => void;
  height?: number;
  showLabels?: boolean;
}) => {
  const { shares, onChange, height = 56, showLabels = true } = props;
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const cum = shares.slice(0, -1).reduce<number[]>((a, s) => [...a, (a.at(-1) ?? 0) + s], []);

  const pctAt = (e: RPointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return Math.round(((e.clientX - r.left) / r.width) * 100);
  };
  const move = (e: RPointerEvent) => {
    const j = drag.current;
    if (j === null || !onChange) return;
    const lo = j === 0 ? 0 : cum[j - 1]!;
    const hi = j === cum.length - 1 ? 100 : cum[j + 1]!;
    const v = Math.min(hi, Math.max(lo, pctAt(e)));
    const nextCum = cum.map((c, i) => (i === j ? v : c));
    const bounds = [0, ...nextCum, 100];
    onChange(bounds.slice(1).map((b, i) => b - bounds[i]!));
  };
  const down = (e: RPointerEvent) => {
    if (!onChange) return;
    const p = pctAt(e);
    let best = -1;
    let bestD = 999;
    cum.forEach((c, i) => {
      const d = Math.abs(c - p);
      // Ties (stacked dividers): prefer the one that can move in the drag direction.
      if (d < bestD || (d === bestD && p > c)) {
        best = i;
        bestD = d;
      }
    });
    if (best < 0) return;
    ref.current!.setPointerCapture(e.pointerId);
    drag.current = best;
    move(e);
  };

  return (
    <div
      ref={ref}
      className="relative w-full rounded-xl overflow-visible select-none"
      style={{ height, touchAction: 'none', cursor: onChange ? 'ew-resize' : 'default' }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <div className="absolute inset-0 flex rounded-xl overflow-hidden border-2 border-[var(--ink)]">
        {shares.map((s, i) => (
          <div
            key={i}
            className="h-full flex items-center justify-center text-white font-bold num transition-[width] duration-75"
            style={{ width: `${s}%`, background: COLORS[i] }}
          >
            {showLabels && s >= (onChange ? 15 : 11) && <span className="display text-lg drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">{s}%</span>}
          </div>
        ))}
      </div>
      {onChange &&
        cum.map((c, i) => (
          <div key={i} className="absolute top-[-6px] bottom-[-6px] w-0 pointer-events-none" style={{ left: `${c}%` }}>
            <div className="absolute left-[-7px] top-0 bottom-0 w-[14px] rounded-full bg-[var(--paper)] border-2 border-[var(--ink)] shadow-[0_2px_0_var(--ink)]" />
          </div>
        ))}
    </div>
  );
};

export const Countdown = ({ today }: { today: number }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, dayStartMs(today + 1) - now);
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  return <span className="num">{`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}</span>;
};
