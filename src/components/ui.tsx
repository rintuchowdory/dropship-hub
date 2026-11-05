import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { OrderStatus, ShipmentStatus } from "../lib/types";

/* ------------------------------------------------------------------ badge -- */

type Tone = "neutral" | "good" | "warn" | "bad" | "info";

const TONES: Record<Tone, string> = {
  neutral: "border-border bg-white/[0.03] text-muted",
  good: "border-accent/30 bg-accentdim text-accent",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  bad: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const ORDER_TONE: Record<OrderStatus, Tone> = {
  Pending: "warn",
  "Sent To Supplier": "info",
  Shipped: "info",
  Delivered: "good",
  Cancelled: "bad",
};

export function OrderBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_TONE[status]}>{status}</Badge>;
}

const SHIP_TONE: Record<ShipmentStatus, Tone> = {
  "In transit": "info",
  "Out for delivery": "warn",
  Delivered: "good",
  Exception: "bad",
};

export function ShipmentBadge({ status }: { status: ShipmentStatus }) {
  return <Badge tone={SHIP_TONE[status]}>{status}</Badge>;
}

/* ------------------------------------------------------------------ delta -- */

export function Delta({
  value,
  suffix = "",
  invert = false,
}: {
  value: number;
  suffix?: string;
  invert?: boolean;
}) {
  const up = value >= 0;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        good ? "text-accent" : "text-rose-400"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toFixed(1)}%{suffix}
    </span>
  );
}

/* --------------------------------------------------------------- sparkline -- */

export function Sparkline({
  values,
  color = "#22c55e",
  height = 32,
}: {
  values: number[];
  color?: string;
  height?: number;
}) {
  const w = 96;
  const max = Math.max(1, ...values);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = values.length <= 1 ? w / 2 : (i / (values.length - 1)) * w;
      const y = height - ((v - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      width={w}
      height={height}
      className="overflow-visible"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ cards -- */

export function SectionCard({
  title,
  sub,
  action,
  children,
  className = "",
}: {
  title?: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-border bg-card ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  sub,
  delta,
  spark,
  icon,
  invertDelta,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number;
  spark?: number[];
  icon?: ReactNode;
  invertDelta?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
        </div>
        {spark && spark.length > 1 && <Sparkline values={spark} />}
      </div>
      {delta !== undefined && (
        <div className="mt-2">
          <Delta value={delta} invert={invertDelta} />
          <span className="ml-1 text-[11px] text-muted">vs. previous period</span>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- bars -- */

export function BarRow({
  label,
  value,
  max,
  display,
  color = "#22c55e",
  hint,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  color?: string;
  hint?: string;
}) {
  const width = max ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="truncate text-ink">{label}</span>
        <span className="shrink-0 font-medium text-muted">{display}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      {hint && <p className="mt-1 text-[10px] text-muted">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ donut -- */

export function Donut({
  slices,
  size = 168,
  thickness = 18,
  centerLabel,
  centerValue,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={thickness}
        />
        {slices.map((slice) => {
          const length = (slice.value / total) * circumference;
          const dash = `${Math.max(0, length - 2)} ${circumference}`;
          const element = (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += length;
          return element;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold">{centerValue}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- segmented -- */

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-bg p-0.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            className={`rounded px-2.5 ${size === "sm" ? "py-1 text-[11px]" : "py-1.5 text-xs"} font-medium transition-colors ${
              active
                ? "bg-accentdim text-accent"
                : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------- toggle -- */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#0a0d10] transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ empty -- */

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-sm">{title}</p>
      {hint && <p className="mt-1.5 max-w-md text-xs text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
