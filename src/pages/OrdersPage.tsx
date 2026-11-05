import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "../components/StatCard";
import { Badge, EmptyState, OrderBadge, Segmented } from "../components/ui";
import { channelName, dateTime, money } from "../lib/metrics";
import { ORDER_STATUSES } from "../lib/metrics";
import { setOrderStatus, useAppState } from "../lib/store";
import type { OrderStatus } from "../lib/types";

const PAGE_SIZE = 12;

export function OrdersPage() {
  const state = useAppState();
  const [status, setStatus] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [channel, setChannel] = useState<string>("all");

  const customerById = useMemo(
    () => new Map(state.customers.map((c) => [c.id, c])),
    [state.customers]
  );
  const productById = useMemo(
    () => new Map(state.products.map((p) => [p.id, p])),
    [state.products]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: state.orders.length };
    for (const s of ORDER_STATUSES) {
      map[s] = state.orders.filter((o) => o.status === s).length;
    }
    return map;
  }, [state.orders]);

  const channels = useMemo(
    () => [...new Set(state.orders.map((o) => o.channel))],
    [state.orders]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.orders
      .filter((o) => (status === "All" ? true : o.status === status))
      .filter((o) => (channel === "all" ? true : o.channel === channel))
      .filter((o) => {
        if (!q) return true;
        const customer = customerById.get(o.customerId)?.name ?? "";
        const product = productById.get(o.productId)?.title ?? "";
        return (
          o.ref.toLowerCase().includes(q) ||
          customer.toLowerCase().includes(q) ||
          product.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [state.orders, status, channel, query, customerById, productById]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const rows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  const revenue = filtered
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Orders"
        sub={`${filtered.length} of ${state.orders.length} orders · ${money(revenue, 0)} value in view`}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["All", ...ORDER_STATUSES].map((s) => {
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(0);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-accentdim text-accent"
                    : "border border-border bg-card text-muted hover:text-ink"
                }`}
              >
                {s} <span className="opacity-60">{counts[s] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search order, customer, product…"
            className="w-72 rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
          />
        </div>
      </div>

      <div className="mt-3">
        <Segmented
          size="sm"
          value={channel}
          onChange={(v) => {
            setChannel(v);
            setPage(0);
          }}
          options={[
            { value: "all", label: "All channels" },
            ...channels.map((c) => ({ value: c, label: channelName(c) })),
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No orders match this filter."
            hint="Try a different status, channel or search term."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Order",
                    "Channel",
                    "Customer",
                    "Product",
                    "Total",
                    "Profit",
                    "Risk",
                    "Status",
                    "Date",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => {
                  const customer = customerById.get(order.customerId);
                  const product = productById.get(order.productId);
                  const profit = order.total - order.cost;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border/50 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-2.5 font-medium">{order.ref}</td>
                      <td className="px-4 py-2.5 text-muted">
                        {channelName(order.channel)}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-ink">{customer?.name ?? "Guest"}</p>
                        <p className="text-[11px] text-muted">
                          {order.country} · {customer?.segment ?? "New"}
                        </p>
                      </td>
                      <td className="max-w-[180px] px-4 py-2.5">
                        <p className="truncate text-muted">
                          {product?.title ?? "—"}
                        </p>
                        <p className="text-[11px] text-muted/70">
                          {order.qty}× · {product?.sku}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">{money(order.total)}</td>
                      <td
                        className={`px-4 py-2.5 ${profit > 0 ? "text-accent" : "text-rose-400"}`}
                      >
                        {money(profit)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          tone={
                            order.risk > 85
                              ? "bad"
                              : order.risk > 60
                                ? "warn"
                                : "neutral"
                          }
                        >
                          {order.risk}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <OrderBadge status={order.status} />
                          <select
                            value={order.status}
                            onChange={(e) =>
                              setOrderStatus(
                                order.id,
                                e.target.value as OrderStatus
                              )
                            }
                            aria-label={`Change status of ${order.ref}`}
                            className="rounded border border-border bg-bg px-1.5 py-1 text-[11px] text-muted outline-none focus:border-accent/60"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-muted">
                        {dateTime(order.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted">
            <span>
              Page {safePage + 1} of {pages} · {filtered.length} orders
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="rounded border border-border p-1.5 transition-colors hover:text-ink disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPage(Math.min(pages - 1, safePage + 1))}
                disabled={safePage >= pages - 1}
                className="rounded border border-border p-1.5 transition-colors hover:text-ink disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
