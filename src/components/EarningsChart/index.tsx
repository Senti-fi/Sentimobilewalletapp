/**
 * EarningsChart
 *
 * Reusable interactive area chart for earnings/portfolio data.
 *
 * Features:
 *  - Smooth bezier area + line (pure SVG, no external chart lib)
 *  - Animated transition when `periodKey` changes (fade + slide via motion)
 *  - Pointer/touch interaction → crosshair + floating tooltip
 *  - Deterministic gradient fills (unique ID per instance via useId)
 *  - vectorEffect="non-scaling-stroke" keeps stroke width crisp
 *    even with preserveAspectRatio="none"
 */

import { useState, useRef, useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { DataPoint } from '../../data/portfolioTimeSeries';

// Virtual SVG width (viewBox units). Height is provided as a prop (real px).
const VW = 1000;

// ── SVG path helpers ──────────────────────────────────────────────────

function buildLinePath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;

  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const { x: x0, y: y0 } = pts[i];
    const { x: x1, y: y1 } = pts[i + 1];
    // Mid-point cubic bezier: horizontal tension only — stays monotone
    const mx = (x0 + x1) / 2;
    d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}

function buildAreaPath(
  linePath: string,
  firstPt: { x: number; y: number },
  lastPt: { x: number; y: number },
  bottom: number,
): string {
  return `${linePath} L ${lastPt.x},${bottom} L ${firstPt.x},${bottom} Z`;
}

// ── Formatter ─────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Component ─────────────────────────────────────────────────────────

export interface EarningsChartProps {
  data: DataPoint[];
  /** Used as AnimatePresence key — change triggers re-animation */
  periodKey: string;
  height?: number;
  /** Accent color for line + gradient (CSS hex or rgb) */
  color?: string;
  /** Show caption below chart? */
  caption?: string;
}

export default function EarningsChart({
  data,
  periodKey,
  height = 128,
  color = '#007bff',
  caption,
}: EarningsChartProps) {
  const uid          = useId();
  const gradId       = `ecg-grad-${uid.replace(/:/g, '')}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // ── Layout ──────────────────────────────────────────────────────────
  const PAD_TOP    = 12;
  const PAD_BOTTOM = 22; // room for x-axis labels
  const chartH     = height - PAD_TOP - PAD_BOTTOM;
  const bottom     = height - PAD_BOTTOM;

  // ── Data → SVG coordinates ──────────────────────────────────────────
  const values = data.map(d => d.value);
  const yMin   = values.length ? Math.min(...values) : 0;
  const yMax   = values.length ? Math.max(...values) : 1;
  const yRange = yMax - yMin || Math.max(yMax * 0.01, 1);

  const pts = data.map((_, i) => ({
    x: data.length <= 1 ? VW / 2 : (i / (data.length - 1)) * VW,
    y: PAD_TOP + chartH * (1 - (values[i] - yMin) / yRange),
  }));

  const linePath = buildLinePath(pts);
  const areaPath =
    pts.length >= 2
      ? buildAreaPath(linePath, pts[0], pts[pts.length - 1], bottom)
      : '';

  // ── Interaction ──────────────────────────────────────────────────────
  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    if (!containerRef.current || data.length === 0) return;
    const rect  = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setActiveIdx(Math.round(ratio * (data.length - 1)));
  }

  const active   = activeIdx !== null ? data[activeIdx]  : null;
  const activePt = activeIdx !== null ? pts[activeIdx]   : null;

  // Keep tooltip inside the chart bounds (5 %–95 %)
  const tipPct = activePt !== null
    ? Math.max(5, Math.min(95, (activePt.x / VW) * 100))
    : 50;

  return (
    <div className="flex flex-col gap-[8px]">
      {/* ── Chart area ─────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative select-none touch-none"
        style={{ height }}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setActiveIdx(null)}
      >
        {/* Animated SVG */}
        <AnimatePresence mode="wait">
          <motion.svg
            key={periodKey}
            width="100%"
            height={height}
            viewBox={`0 0 ${VW} ${height}`}
            preserveAspectRatio="none"
            className="absolute inset-0"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Gradient area fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill={`url(#${gradId})`}
                stroke="none"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Crosshair + dot when active */}
            {activePt && (
              <>
                <line
                  x1={activePt.x} y1={PAD_TOP}
                  x2={activePt.x} y2={bottom}
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="5"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </motion.svg>
        </AnimatePresence>

        {/* Floating tooltip */}
        {active && (
          <div
            className="absolute pointer-events-none z-10"
            style={{ bottom: PAD_BOTTOM + 6, left: `${tipPct}%`, transform: 'translateX(-50%)' }}
          >
            <div className="bg-[#1a2540] border border-[rgba(255,255,255,0.12)] rounded-[8px] px-[8px] py-[5px] flex flex-col items-center shadow-lg">
              <p className="text-[#8ac7ff] text-[9px] leading-[14px] whitespace-nowrap">{active.label}</p>
              <p className="text-white text-[11px] leading-[16px] font-semibold whitespace-nowrap">${fmt(active.value)}</p>
              {active.earned > 0 && (
                <p className="text-[#00e6ff] text-[9px] leading-[12px] whitespace-nowrap">+${fmt(active.earned)}</p>
              )}
            </div>
          </div>
        )}

        {/* X-axis labels */}
        {data.length >= 2 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between pointer-events-none">
            <p className="font-normal text-[10px] leading-[15px] uppercase text-[#6b7280]">
              {data[0].label}
            </p>
            <p className="font-normal text-[10px] leading-[15px] uppercase text-[#6b7280]">
              {data[data.length - 1].label}
            </p>
          </div>
        )}
      </div>

      {/* Optional caption */}
      {caption && (
        <p className="font-medium italic text-[10px] leading-[normal] text-[#6b7280]">
          {caption}
        </p>
      )}
    </div>
  );
}
