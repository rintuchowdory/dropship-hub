import { useMemo, useState } from "react";
import { Activity, BarChart3, Globe, Percent, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "../components/StatCard";
import {
  Badge,
  BarRow,
  Donut,
  Metric,
  SectionCard,
  Segmented,
  Sparkline,
} from "../components/ui";
import { RevenueChart } from "../components/RevenueChart";
import {
  byChannel,
  compact,
  countrySplit,
  customerStats,
  dailySeries,
  delta,
  forecastSeries,
  inWindow,
  money,
  num,
  orderHeatmap,
  productPerformance,
  supplierPerformance,
  totals,
} from "../lib/metrics";
import { useAppState } from "../lib/store";

export function AnalyticsPage() {
  const state = useAppState();
  const [range, setRange] = useState<number>(30);

  const data = useMemo(() => {
    const current = inWindow(state.orders, range);
    const previous = inWindow(state.orders, range, range);
    const series = dailySeries(state.orders, range);
    const forecast = forecastSeries(series, 7);
    const channels = byChannel(current);
    const products = productPerformance(state.products, current);
    const suppliers = supplierPerformance(state.products, current);
    const countries = countrySplit(current);
    const heat = orderHeatmap(current);
    const customers = customerStats(state.customers, state.orders);
    const now = totals(current);
    const before = totals(previous);

    return {
      series,
      forecast,
      channels,
      products,
      suppliers,
      countries,
      heat,
      customers,
      now,
      before,
      unitsByDay: series.map((p) => p.orders),
      forecastTotal: forecast.reduce((s, v) => s + v, 0),
    };
  }, [state, range]);

  const { now, before } = data;
  const maxHeat = data.heat.max;

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Analytics"
        sub="A single digital dashboard for demand, margin and supplier quality"
        action={
          <Segmented
            options={[
              { value: 30, label: "30d" },
              { value: 60, label: "60d" },
              { value: 90, label: "90d" },
            ]}
            value={range}
            onChange={setRange}
          />
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Metric
          label="Revenue"
          value={compact(now.revenue)}
          delta={delta(now.revenue, before.revenue)}
          icon={<BarChart3 className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Profit"
          value={compact(now.profit)}
          delta={delta(now.profit, before.profit)}
          icon={<TrendingUp className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Margin"
          value={`${now.margin.toFixed(1)}%`}
          delta={delta(now.margin, before.margin)}
          icon={<Percent className="h-4 w-4 text-muted" />}
        />
        <Metric
          label="AOV"
          value={money(now.aov, 0)}
          delta={delta(now.aov, before.aov)}
          icon={<Activity className="h-4 w-4 text-muted" />}
        />
        <Metric
          label="Repeat rate"
          value={`${data.customers.repeatRate.toFixed(0)}%`}
          sub={`${data.customers.repeat} of ${data.customers.total} buyers`}
          icon={<Users className="h-4 w-4 text-muted" />}
        />
        <Metric
          label="Units"
          value={num(now.units)}
          sub={`${data.customers.vip} VIP customers`}
          icon={<Globe className="h-4 w-4 text-muted" />}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title={`Revenue trend and next 7 days`}
          sub={`Linear trend from the last 14 days · projected ${compact(data.forecastTotal)}`}
          action={
            <div className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" /> actual
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkline values={data.forecast} color="#38bdf8" height={12} />
                forecast
              </span>
            </div>
          }
        >
          <RevenueChart points={data.series} height={240} />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.forecast.slice(0, 4).map((value, i) => (
              <div
                key={i}
                className="rounded-md border border-border/70 bg-bg px-3 py-2"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  day +{i + 1}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{compact(value)}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Channel mix"
          sub="Revenue share this period"
        >
          <div className="flex flex-col items-center gap-4">
            <Donut
              slices={data.channels.map((c) => ({
                label: c.name,
                value: c.revenue,
                color: c.color,
              }))}
              centerValue={`${data.channels.length}`}
              centerLabel="channels"
              size={150}
              thickness={16}
            />
            <div className="w-full space-y-2">
              {data.channels.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </span>
                  <span className="text-muted">
                    {c.share.toFixed(0)}% · {c.orders} orders
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="When your customers buy"
          sub="Orders by weekday and time of day"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="w-12" />
                  {data.heat.buckets.map((b) => (
                    <th
                      key={b}
                      className="pb-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted"
                    >
                      {b}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.heat.rows.map((row) => (
                  <tr key={row.day}>
                    <td className="pr-2 text-[11px] text-muted">{row.day}</td>
                    {row.cells.map((cell) => {
                      const intensity = cell.value / maxHeat;
                      return (
                        <td key={cell.label} className="p-0.5">
                          <div
                            title={`${row.day} ${cell.label}: ${cell.value} orders · ${money(cell.revenue, 0)}`}
                            className="flex h-8 items-center justify-center rounded text-[10px] font-medium"
                            style={{
                              backgroundColor: `rgba(34,197,94,${0.08 + intensity * 0.72})`,
                              color: intensity > 0.55 ? "#04120a" : "#94a3b8",
                            }}
                          >
                            {cell.value || ""}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted">
            Peak window: evening, 18–24. Schedule ad budgets and support shifts
            around it.
          </p>
        </SectionCard>

        <SectionCard title="Where orders ship" sub="Revenue by destination">
          <div className="space-y-3">
            {data.countries.map((c) => (
              <BarRow
                key={c.country}
                label={c.country}
                value={c.revenue}
                max={data.countries[0]?.revenue ?? 1}
                display={compact(c.revenue)}
                hint={`${c.share.toFixed(1)}% of revenue`}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Product economics"
          sub="Units, revenue and contribution margin"
          action={<Badge tone="good">{data.products.length} SKUs</Badge>}
        >
          <div className="max-h-80 overflow-y-auto pr-1">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="text-[10px] uppercase tracking-wider text-muted">
                  {["Product", "Units", "Revenue", "Margin"].map((h) => (
                    <th key={h} className="pb-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.products.map((row) => (
                  <tr
                    key={row.product.id}
                    className="border-t border-border/40"
                  >
                    <td className="max-w-[180px] truncate py-2 pr-2">
                      {row.product.title}
                    </td>
                    <td className="py-2 text-muted">{row.units}</td>
                    <td className="py-2">{compact(row.revenue)}</td>
                    <td className="py-2">
                      <span
                        className={
                          row.margin > 55
                            ? "text-accent"
                            : row.margin > 35
                              ? "text-ink"
                              : "text-amber-300"
                        }
                      >
                        {row.margin.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Supplier scorecard"
          sub="Volume, profit and lead time per source"
        >
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                {["Supplier", "Orders", "Profit", "Lead time", "Low stock"].map(
                  (h) => (
                    <th key={h} className="pb-2 text-left font-medium">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {data.suppliers.map((s) => (
                <tr key={s.supplier} className="border-t border-border/40">
                  <td className="py-2 pr-2">{s.supplier}</td>
                  <td className="py-2 text-muted">{s.orders}</td>
                  <td className="py-2">{compact(s.profit)}</td>
                  <td className="py-2 text-muted">
                    {s.leadTime.toFixed(1)} d
                  </td>
                  <td className="py-2">
                    {s.lowStock ? (
                      <Badge tone="warn">{s.lowStock}</Badge>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}
