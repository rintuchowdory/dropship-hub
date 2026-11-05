import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  LineChart,
  Package,
  ShoppingCart,
} from "lucide-react";
import { RevenueChart } from "../components/RevenueChart";
import { PageHeader } from "../components/StatCard";
import {
  BarRow,
  Badge,
  Donut,
  EmptyState,
  Metric,
  OrderBadge,
  SectionCard,
  Segmented,
} from "../components/ui";
import { channelName } from "../lib/metrics";
import {
  byChannel,
  byStatus,
  buildAlerts,
  compact,
  dateShort,
  dailySeries,
  delta,
  inWindow,
  money,
  num,
  ORDER_STATUSES,
  productPerformance,
  totals,
} from "../lib/metrics";
import { useAppState } from "../lib/store";
import type { Page } from "../lib/types";

const RANGES = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
] as const;

const STATUS_COLOR: Record<string, string> = {
  Pending: "#f59e0b",
  "Sent To Supplier": "#38bdf8",
  Shipped: "#818cf8",
  Delivered: "#22c55e",
  Cancelled: "#f43f5e",
};

export function DashboardPage({
  onNavigate,
}: {
  onNavigate: (p: Page) => void;
}) {
  const state = useAppState();
  const [range, setRange] = useState<number>(30);

  const view = useMemo(() => {
    const current = inWindow(state.orders, range);
    const previous = inWindow(state.orders, range, range);
    const series = dailySeries(state.orders, range);
    const currentTotals = totals(current);
    const previousTotals = totals(previous);
    const channels = byChannel(current);
    const status = byStatus(current);
    const perf = productPerformance(state.products, current);
    const alerts = buildAlerts(state);
    const customers = new Map(
      state.customers.map((c) => [c.id, c] as const)
    );
    const recent = [...current]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 7);
    const revenueWindow = inWindow(state.orders, 7);
    const revenuePrevWindow = inWindow(state.orders, 7, 7);

    return {
      series,
      currentTotals,
      previousTotals,
      channels,
      status,
      perf,
      alerts,
      customers,
      recent,
      sparkAll: series.map((p) => p.revenue),
      sparkRecent: dailySeries(state.orders, 14).map((p) => p.revenue),
      openShare: current.length
        ? ((status.Pending + status["Sent To Supplier"]) / current.length) * 100
        : 0,
      week: totals(revenueWindow).revenue,
      weekPrev: totals(revenuePrevWindow).revenue,
    };
  }, [state, range]);

  const t = view.currentTotals;
  const p = view.previousTotals;
  const statusMax = Math.max(1, ...ORDER_STATUSES.map((s) => view.status[s]));

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Dashboard"
        sub={`Consolidated across ${state.connections.length} connected services — last ${range} days`}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="good">{state.demo ? "seeded dataset" : "database empty"}</Badge>
            <Segmented options={[...RANGES]} value={range} onChange={setRange} />
          </div>
        }
      />

      {state.orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No data in this workspace yet."
            hint="The D1 database is empty. Import the starter dataset to see the dashboard with a full quarter of orders, or add products and orders through the API."
            action={
              <button
                onClick={() => onNavigate("connections")}
                className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-[#052e16] hover:bg-accent/90"
              >
                Open connections
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Revenue"
              value={compact(t.revenue)}
              sub={`${num(t.orders)} orders`}
              delta={delta(t.revenue, p.revenue)}
              spark={view.sparkAll}
              icon={<DollarSign className="h-4 w-4 text-accent" />}
            />
            <Metric
              label="Net profit"
              value={compact(t.profit)}
              sub={`${t.margin.toFixed(1)}% margin`}
              delta={delta(t.profit, p.profit)}
              spark={view.sparkAll.map((v) => v * 0.42)}
              icon={<LineChart className="h-4 w-4 text-accent" />}
            />
            <Metric
              label="Orders"
              value={num(t.orders)}
              sub={`${view.openShare.toFixed(0)}% not shipped yet`}
              delta={delta(t.orders, p.orders)}
              spark={view.sparkRecent.map((v) => v)}
              icon={<ShoppingCart className="h-4 w-4 text-muted" />}
            />
            <Metric
              label="Avg. order value"
              value={money(t.aov, 0)}
              sub={`${num(t.units)} units sold`}
              delta={delta(t.aov, p.aov)}
              icon={<Package className="h-4 w-4 text-muted" />}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard
              className="lg:col-span-2"
              title="Revenue vs. cost"
              sub={`Gross revenue ${compact(t.revenue)} · supplier + fee cost ${compact(t.cost)}`}
              action={
                <div className="flex items-center gap-3 text-[11px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent" /> Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Cost
                  </span>
                </div>
              }
            >
              <RevenueChart points={view.series} />
            </SectionCard>

            <SectionCard
              title="Revenue by channel"
              sub="Where the money comes from"
            >
              <div className="flex flex-col items-center gap-5">
                <Donut
                  slices={view.channels.map((c) => ({
                    label: c.name,
                    value: c.revenue,
                    color: c.color,
                  }))}
                  centerValue={compact(t.revenue)}
                  centerLabel="total"
                />
                <div className="w-full space-y-2.5">
                  {view.channels.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="truncate">{c.name}</span>
                      </span>
                      <span className="shrink-0 text-muted">
                        {compact(c.revenue)} · {c.share.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard
              title="Order pipeline"
              sub="Current period by fulfilment stage"
            >
              <div className="space-y-3">
                {ORDER_STATUSES.map((s) => (
                  <BarRow
                    key={s}
                    label={s}
                    value={view.status[s]}
                    max={statusMax}
                    display={num(view.status[s])}
                    color={STATUS_COLOR[s]}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Top products"
              sub="Ranked by revenue this period"
              action={
                <button
                  onClick={() => onNavigate("analytics")}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
                >
                  Details <ArrowRight className="h-3 w-3" />
                </button>
              }
            >
              <div className="space-y-3">
                {view.perf.slice(0, 5).map((row) => (
                  <BarRow
                    key={row.product.id}
                    label={row.product.title}
                    value={row.revenue}
                    max={view.perf[0]?.revenue ?? 1}
                    display={compact(row.revenue)}
                    hint={`${row.units} units · ${row.margin.toFixed(0)}% margin`}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Needs attention"
              sub="Generated from orders, stock and disputes"
              action={<Badge tone="warn">{view.alerts.length}</Badge>}
            >
              <ul className="space-y-3">
                {view.alerts.map((alert) => (
                  <li key={alert.title} className="flex gap-2.5">
                    <AlertTriangle
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                        alert.tone === "danger"
                          ? "text-rose-400"
                          : alert.tone === "warning"
                            ? "text-amber-300"
                            : "text-sky-300"
                      }`}
                    />
                    <div>
                      <p className="text-xs font-medium">{alert.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                        {alert.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard
            className="mt-4"
            title="Recent orders"
            sub="Newest first, straight from the channel sync"
            action={
              <button
                onClick={() => onNavigate("orders")}
                className="flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent/80"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }
          >
            <div className="-mx-5 -mb-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted">
                    {["Order", "Channel", "Customer", "Total", "Status", "Date"].map(
                      (col) => (
                        <th key={col} className="px-5 py-2.5 text-left font-medium">
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {view.recent.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/40 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-2.5 font-medium">{order.ref}</td>
                      <td className="px-5 py-2.5 text-muted">
                        {channelName(order.channel)}
                      </td>
                      <td className="px-5 py-2.5 text-muted">
                        {view.customers.get(order.customerId)?.name ?? "Guest"}
                      </td>
                      <td className="px-5 py-2.5">{money(order.total)}</td>
                      <td className="px-5 py-2.5">
                        <OrderBadge status={order.status} />
                      </td>
                      <td className="px-5 py-2.5 text-muted">
                        {dateShort(order.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
