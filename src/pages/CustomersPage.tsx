import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { PageHeader } from "../components/StatCard";
import { Badge, EmptyState, Metric, SectionCard, Segmented } from "../components/ui";
import { compact, customerStats, dateShort, money, num, relative } from "../lib/metrics";
import { useAppState } from "../lib/store";
import type { Segment } from "../lib/types";

const SEGMENT_TONE: Record<Segment, "good" | "info" | "neutral" | "warn"> = {
  VIP: "good",
  Repeat: "info",
  New: "neutral",
  "At risk": "warn",
};

export function CustomersPage() {
  const state = useAppState();
  const [segment, setSegment] = useState<"all" | Segment>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(
    () => customerStats(state.customers, state.orders),
    [state.customers, state.orders]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.customers
      .filter((c) => (segment === "all" ? true : c.segment === segment))
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      )
      .sort((a, b) => b.spent - a.spent);
  }, [state.customers, segment, query]);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Customers"
        sub={`${num(stats.total)} buyers · ${money(stats.ltv, 0)} average lifetime value`}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric
          label="Buyers"
          value={num(stats.total)}
          sub={`${stats.units} units purchased`}
          icon={<Users className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Repeat rate"
          value={`${stats.repeatRate.toFixed(0)}%`}
          sub={`${stats.repeat} returning customers`}
        />
        <Metric
          label="VIP"
          value={num(stats.vip)}
          sub="more than $900 lifetime"
        />
        <Metric
          label="At risk"
          value={num(stats.atRisk)}
          sub="repeat buyers, 45+ days idle"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          size="sm"
          value={segment}
          onChange={setSegment}
          options={[
            { value: "all", label: "All" },
            { value: "VIP", label: "VIP" },
            { value: "Repeat", label: "Repeat" },
            { value: "New", label: "New" },
            { value: "At risk", label: "At risk" },
          ]}
        />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, email or country…"
            className="w-72 rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
          />
        </div>
      </div>

      <SectionCard className="mt-4" title="Customer base" sub={`${rows.length} in view`}>
        {rows.length === 0 ? (
          <EmptyState title="No customers match this filter." />
        ) : (
          <div className="-mx-5 -mb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted">
                  {["Customer", "Country", "Orders", "Spent", "Segment", "Last order"].map(
                    (col) => (
                      <th key={col} className="px-5 py-2.5 text-left font-medium">
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 80).map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/40 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-2.5">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-[11px] text-muted">{c.email}</p>
                    </td>
                    <td className="px-5 py-2.5 text-muted">{c.country}</td>
                    <td className="px-5 py-2.5 text-muted">{c.orders}</td>
                    <td className="px-5 py-2.5">
                      {compact(c.spent)}
                      <p className="text-[11px] text-muted/70">
                        {c.orders > 1 ? money(c.spent / c.orders, 0) + " AOV" : "—"}
                      </p>
                    </td>
                    <td className="px-5 py-2.5">
                      <Badge tone={SEGMENT_TONE[c.segment]}>{c.segment}</Badge>
                    </td>
                    <td className="px-5 py-2.5 text-muted">
                      {dateShort(c.lastOrder)}
                      <p className="text-[11px] text-muted/70">
                        {relative(c.lastOrder)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
