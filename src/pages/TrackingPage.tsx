import { useMemo, useState } from "react";
import { PackageCheck, Search, Truck, TriangleAlert } from "lucide-react";
import { PageHeader } from "../components/StatCard";
import { EmptyState, Metric, SectionCard, Segmented, ShipmentBadge } from "../components/ui";
import { dateShort, num, relative } from "../lib/metrics";
import { useAppState } from "../lib/store";
import type { ShipmentStatus } from "../lib/types";

const FILTERS: { value: "all" | ShipmentStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "In transit", label: "In transit" },
  { value: "Out for delivery", label: "Out for delivery" },
  { value: "Delivered", label: "Delivered" },
  { value: "Exception", label: "Exceptions" },
];

export function TrackingPage() {
  const state = useAppState();
  const [filter, setFilter] = useState<"all" | ShipmentStatus>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const base = {
      "In transit": 0,
      "Out for delivery": 0,
      Delivered: 0,
      Exception: 0,
    } as Record<ShipmentStatus, number>;
    for (const s of state.shipments) base[s.status] += 1;
    return base;
  }, [state.shipments]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.shipments
      .filter((s) => (filter === "all" ? true : s.status === filter))
      .filter(
        (s) =>
          !q ||
          s.tracking.toLowerCase().includes(q) ||
          s.orderRef.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q)
      )
      .sort((a, b) => (a.updated < b.updated ? 1 : -1));
  }, [state.shipments, filter, query]);

  const onTime = state.shipments.length
    ? ((counts.Delivered + counts["Out for delivery"]) / state.shipments.length) * 100
    : 0;

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Tracking"
        sub={`${num(state.shipments.length)} shipments normalised across ${new Set(state.shipments.map((s) => s.carrier)).size} carriers`}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric
          label="In transit"
          value={num(counts["In transit"])}
          icon={<Truck className="h-4 w-4 text-sky-300" />}
        />
        <Metric
          label="Out for delivery"
          value={num(counts["Out for delivery"])}
          icon={<PackageCheck className="h-4 w-4 text-amber-300" />}
        />
        <Metric
          label="Delivered"
          value={num(counts.Delivered)}
          sub={`${onTime.toFixed(0)}% on track`}
          icon={<PackageCheck className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Exceptions"
          value={num(counts.Exception)}
          icon={<TriangleAlert className="h-4 w-4 text-rose-400" />}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented size="sm" value={filter} onChange={setFilter} options={FILTERS} />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tracking number, order, carrier…"
            className="w-72 rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
          />
        </div>
      </div>

      <SectionCard className="mt-4" title="Shipments" sub={`${rows.length} in view`}>
        {rows.length === 0 ? (
          <EmptyState
            title="No shipments match this filter."
            hint="Shipments appear here as soon as an order leaves the supplier."
          />
        ) : (
          <div className="-mx-5 -mb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted">
                  {[
                    "Tracking",
                    "Order",
                    "Carrier",
                    "Destination",
                    "Last checkpoint",
                    "Status",
                    "ETA",
                    "Updated",
                  ].map((col) => (
                    <th key={col} className="px-5 py-2.5 text-left font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 60).map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/40 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-5 py-2.5 font-mono text-xs">
                      {s.tracking}
                    </td>
                    <td className="px-5 py-2.5 text-muted">{s.orderRef}</td>
                    <td className="px-5 py-2.5">{s.carrier}</td>
                    <td className="px-5 py-2.5 text-muted">{s.destination}</td>
                    <td className="max-w-[240px] px-5 py-2.5">
                      <p className="truncate text-muted">{s.checkpoint}</p>
                    </td>
                    <td className="px-5 py-2.5">
                      <ShipmentBadge status={s.status} />
                    </td>
                    <td className="px-5 py-2.5 text-muted">{dateShort(s.eta)}</td>
                    <td className="px-5 py-2.5 text-muted">
                      {relative(s.updated)}
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
