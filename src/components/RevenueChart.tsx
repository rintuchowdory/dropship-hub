import { useId } from "react";
import { compact } from "../lib/metrics";
import type { Point } from "../lib/metrics";

/**
 * Revenue vs. cost area chart, hand-rolled SVG (no chart library).
 */
export function RevenueChart({
  points,
  height = 260,
}: {
  points: Point[];
  height?: number;
}) {
  const gradientId = useId();
  const W = 760;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 26, left: 46 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const peak = Math.max(
    1,
    ...points.map((p) => Math.max(p.revenue, p.cost))
  );
  const step = Math.pow(10, Math.floor(Math.log10(peak)));
  const maxY = Math.ceil(peak / (step / 2)) * (step / 2);

  const yFor = (v: number) => PAD.top + ih - (v / maxY) * ih;
  const xFor = (i: number) =>
    PAD.left + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);

  const line = (key: "revenue" | "cost") =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)},${yFor(p[key])}`)
      .join(" ");

  const area = `${line("revenue")} L ${xFor(points.length - 1)},${PAD.top + ih} L ${xFor(0)},${PAD.top + ih} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => maxY * f);
  const labelEvery = Math.max(1, Math.round(points.length / 8));
  const last = points[points.length - 1];

  if (!points.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted">
        No sales data in this period.
      </div>
    );
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Revenue versus cost over the selected period"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray={tick === 0 ? undefined : "3 5"}
            />
            <text
              x={PAD.left - 8}
              y={yFor(tick) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
            >
              {compact(tick)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line("revenue")}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={line("cost")}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="1.8"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />

        {last && (
          <>
            <circle
              cx={xFor(points.length - 1)}
              cy={yFor(last.revenue)}
              r="3.5"
              fill="#22c55e"
            />
            <circle
              cx={xFor(points.length - 1)}
              cy={yFor(last.revenue)}
              r="7"
              fill="#22c55e"
              opacity="0.18"
            />
          </>
        )}

        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text
              key={p.date}
              x={xFor(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {p.label}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
