import { CHANNEL_MAP, CHANNELS } from "./seed";
import type {
  AppState,
  ChannelId,
  Customer,
  Order,
  OrderStatus,
  Product,
} from "./types";

/* ------------------------------------------------------------- formatting -- */

export const money = (n: number, digits = 2): string =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

export const compact = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
};

export const num = (n: number): string => n.toLocaleString("en-US");

export const percent = (n: number, digits = 1): string =>
  `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;

export const dateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export const dateTime = (iso: string): string =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const relative = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 36e5;
  if (diff < 1) return "just now";
  if (diff < 24) return `${Math.round(diff)}h ago`;
  const days = Math.round(diff / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
};

/* ---------------------------------------------------------------- windows -- */

const DAY = 864e5;

export function inWindow(orders: Order[], days: number, offsetDays = 0): Order[] {
  const end = Date.now() - offsetDays * DAY;
  const start = end - days * DAY;
  return orders.filter((o) => {
    const t = new Date(o.date).getTime();
    return t >= start && t <= end;
  });
}

export interface Totals {
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  units: number;
  aov: number;
  margin: number;
}

export function totals(orders: Order[]): Totals {
  const live = orders.filter((o) => o.status !== "Cancelled");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const cost = live.reduce((s, o) => s + o.cost, 0);
  const units = live.reduce((s, o) => s + o.qty, 0);
  return {
    revenue,
    cost,
    profit: revenue - cost,
    orders: live.length,
    units,
    aov: live.length ? revenue / live.length : 0,
    margin: revenue ? ((revenue - cost) / revenue) * 100 : 0,
  };
}

export function delta(current: number, previous: number): number {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export interface Point {
  date: string;
  label: string;
  revenue: number;
  cost: number;
  orders: number;
}

export function dailySeries(orders: Order[], days: number): Point[] {
  const points: Point[] = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today.getTime() - i * DAY);
    const key = day.toISOString().slice(0, 10);
    const bucket = orders.filter(
      (o) => o.status !== "Cancelled" && o.date.slice(0, 10) === key
    );
    points.push({
      date: day.toISOString(),
      label: day.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      revenue: bucket.reduce((s, o) => s + o.total, 0),
      cost: bucket.reduce((s, o) => s + o.cost, 0),
      orders: bucket.length,
    });
  }
  return points;
}

/* --------------------------------------------------------------- channels -- */

export interface ChannelSlice {
  id: ChannelId;
  name: string;
  color: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  share: number;
}

export function byChannel(orders: Order[]): ChannelSlice[] {
  const live = orders.filter((o) => o.status !== "Cancelled");
  const total = live.reduce((s, o) => s + o.total, 0);
  return CHANNELS.map((c) => {
    const rows = live.filter((o) => o.channel === c.id);
    const revenue = rows.reduce((s, o) => s + o.total, 0);
    const cost = rows.reduce((s, o) => s + o.cost, 0);
    return {
      id: c.id,
      name: c.name,
      color: c.color,
      revenue,
      cost,
      profit: revenue - cost,
      orders: rows.length,
      share: total ? (revenue / total) * 100 : 0,
    };
  })
    .filter((c) => c.orders > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Sent To Supplier",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export function byStatus(orders: Order[]): Record<OrderStatus, number> {
  const base = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, 0])
  ) as Record<OrderStatus, number>;
  for (const o of orders) base[o.status] += 1;
  return base;
}

/* --------------------------------------------------------------- products -- */

export interface ProductPerf {
  product: Product;
  units: number;
  revenue: number;
  profit: number;
  margin: number;
}

export function productPerformance(
  products: Product[],
  orders: Order[]
): ProductPerf[] {
  return products
    .map((product) => {
      const rows = orders.filter(
        (o) => o.productId === product.id && o.status !== "Cancelled"
      );
      const revenue = rows.reduce((s, o) => s + o.total, 0);
      const cost = rows.reduce((s, o) => s + o.cost, 0);
      const units = rows.reduce((s, o) => s + o.qty, 0);
      return {
        product,
        units,
        revenue,
        profit: revenue - cost,
        margin: revenue ? ((revenue - cost) / revenue) * 100 : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export interface SupplierPerf {
  supplier: string;
  orders: number;
  revenue: number;
  profit: number;
  leadTime: number;
  lowStock: number;
}

export function supplierPerformance(
  products: Product[],
  orders: Order[]
): SupplierPerf[] {
  const names = [...new Set(products.map((p) => p.supplier))];
  return names
    .map((supplier) => {
      const mine = products.filter((p) => p.supplier === supplier);
      const ids = new Set(mine.map((p) => p.id));
      const rows = orders.filter(
        (o) => ids.has(o.productId) && o.status !== "Cancelled"
      );
      const revenue = rows.reduce((s, o) => s + o.total, 0);
      const cost = rows.reduce((s, o) => s + o.cost, 0);
      return {
        supplier,
        orders: rows.length,
        revenue,
        profit: revenue - cost,
        leadTime: mine.reduce((s, p) => s + p.leadTime, 0) / mine.length,
        lowStock: mine.filter((p) => p.stock < 15).length,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function countrySplit(orders: Order[], limit = 6) {
  const live = orders.filter((o) => o.status !== "Cancelled");
  const total = live.reduce((s, o) => s + o.total, 0);
  const map = new Map<string, number>();
  for (const o of live) {
    map.set(o.country, (map.get(o.country) ?? 0) + o.total);
  }
  return [...map.entries()]
    .map(([country, revenue]) => ({
      country,
      revenue,
      share: total ? (revenue / total) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/* ---------------------------------------------------------------- heatmap -- */

const BUCKETS = [
  { label: "00–06", from: 0, to: 6 },
  { label: "06–12", from: 6, to: 12 },
  { label: "12–18", from: 12, to: 18 },
  { label: "18–24", from: 18, to: 24 },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function orderHeatmap(orders: Order[]) {
  const rows = WEEKDAYS.map((day) => ({
    day,
    cells: BUCKETS.map((b) => ({ label: b.label, value: 0, revenue: 0 })),
  }));
  for (const o of orders) {
    if (o.status === "Cancelled") continue;
    const d = new Date(o.date);
    const weekday = (d.getDay() + 6) % 7;
    const hour = d.getHours();
    const bucket = BUCKETS.findIndex((b) => hour >= b.from && hour < b.to);
    if (bucket < 0) continue;
    rows[weekday].cells[bucket].value += 1;
    rows[weekday].cells[bucket].revenue += o.total;
  }
  const max = Math.max(1, ...rows.flatMap((r) => r.cells.map((c) => c.value)));
  return { rows, max, buckets: BUCKETS.map((b) => b.label) };
}

/* --------------------------------------------------------------- forecast -- */

export function forecastSeries(points: Point[], days = 7): number[] {
  const tail = points.slice(-14);
  if (tail.length < 2) return Array(days).fill(0);
  const n = tail.length;
  const meanX = (n - 1) / 2;
  const meanY = tail.reduce((s, p) => s + p.revenue, 0) / n;
  let numerator = 0;
  let denominator = 0;
  tail.forEach((p, i) => {
    numerator += (i - meanX) * (p.revenue - meanY);
    denominator += (i - meanX) ** 2;
  });
  const slope = denominator ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;
  return Array.from({ length: days }, (_, i) =>
    Math.max(0, intercept + slope * (n + i))
  );
}

/* ------------------------------------------------------------------ alerts -- */

export interface Alert {
  tone: "danger" | "warning" | "info";
  title: string;
  detail: string;
}

export function buildAlerts(state: AppState): Alert[] {
  const alerts: Alert[] = [];
  const pending = state.orders.filter((o) => o.status === "Pending");
  const stalled = state.orders.filter((o) => {
    if (o.status !== "Sent To Supplier") return false;
    return Date.now() - new Date(o.date).getTime() > 2 * DAY;
  });
  const lowStock = state.products.filter((p) => p.stock < 15);
  const chargebacks = state.transactions.filter(
    (t) => t.type === "chargeback" && t.status !== "Completed"
  );
  const exceptions = state.shipments.filter((s) => s.status === "Exception");

  if (stalled.length) {
    alerts.push({
      tone: "danger",
      title: `${stalled.length} orders stalled at the supplier`,
      detail: "Older than 48h — chase an ETA or switch supplier.",
    });
  }
  if (chargebacks.length) {
    alerts.push({
      tone: "danger",
      title: `${chargebacks.length} open chargebacks`,
      detail: "Submit evidence before the dispute window closes.",
    });
  }
  if (exceptions.length) {
    alerts.push({
      tone: "warning",
      title: `${exceptions.length} shipments in exception`,
      detail: "Customs or address issues need a manual touch.",
    });
  }
  if (lowStock.length) {
    alerts.push({
      tone: "warning",
      title: `${lowStock.length} products below 15 units`,
      detail: lowStock
        .slice(0, 3)
        .map((p) => p.title)
        .join(", "),
    });
  }
  if (pending.length) {
    alerts.push({
      tone: "info",
      title: `${pending.length} new orders awaiting routing`,
      detail: "Auto-routing sends them to the cheapest supplier.",
    });
  }
  return alerts;
}

/* --------------------------------------------------------------- customers -- */

export function customerStats(customers: Customer[], orders: Order[]) {
  const live = orders.filter((o) => o.status !== "Cancelled");
  const repeat = customers.filter((c) => c.orders > 1).length;
  const vip = customers.filter((c) => c.segment === "VIP").length;
  const atRisk = customers.filter((c) => c.segment === "At risk").length;
  const spend = customers.reduce((s, c) => s + c.spent, 0);
  return {
    total: customers.length,
    repeat,
    vip,
    atRisk,
    repeatRate: customers.length ? (repeat / customers.length) * 100 : 0,
    ltv: customers.length ? spend / customers.length : 0,
    units: live.reduce((s, o) => s + o.qty, 0),
  };
}

export function channelName(id: ChannelId): string {
  return CHANNEL_MAP[id]?.name ?? id;
}
