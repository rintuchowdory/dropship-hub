import { useMemo, useState } from "react";
import { Package, Plus, Search, Trash2, TrendingUp } from "lucide-react";
import { PageHeader } from "../components/StatCard";
import { ImportProductModal } from "../components/ImportProductModal";
import { Badge, BarRow, EmptyState, Metric, SectionCard } from "../components/ui";
import {
  compact,
  inWindow,
  money,
  num,
  productPerformance,
} from "../lib/metrics";
import { removeProduct, useAppState } from "../lib/store";

export function ProductsPage() {
  const state = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const perf = productPerformance(state.products, inWindow(state.orders, 90));
    const q = query.trim().toLowerCase();
    return perf.filter(
      (r) =>
        !q ||
        r.product.title.toLowerCase().includes(q) ||
        r.product.sku.toLowerCase().includes(q) ||
        r.product.supplier.toLowerCase().includes(q)
    );
  }, [state.products, state.orders, query]);

  const lowStock = state.products.filter((p) => p.stock < 15);
  const stockValue = state.products.reduce(
    (s, p) => s + p.stock * p.cost,
    0
  );
  const avgMargin = rows.length
    ? rows.reduce((s, r) => s + r.margin, 0) / rows.length
    : 0;

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Products"
        sub={`${state.products.length} products sourced from ${new Set(state.products.map((p) => p.supplier)).size} suppliers`}
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-[#052e16] transition-colors hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" /> Import product
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Catalogue"
          value={num(state.products.length)}
          sub="active SKUs"
          icon={<Package className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Avg. margin"
          value={`${avgMargin.toFixed(0)}%`}
          sub="last 90 days"
          icon={<TrendingUp className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Stock value at cost"
          value={compact(stockValue)}
          sub={`${num(state.products.reduce((s, p) => s + p.stock, 0))} units`}
          icon={<Package className="h-4 w-4 text-muted" />}
        />
        <Metric
          label="Low stock"
          value={num(lowStock.length)}
          sub="below 15 units"
          icon={<Package className="h-4 w-4 text-amber-300" />}
        />
      </div>

      {lowStock.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs font-medium text-amber-300">
            Replenish soon:{" "}
            {lowStock.map((p) => `${p.title} (${p.stock})`).join(" · ")}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, SKU or supplier…"
            className="w-72 rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No products yet."
            hint="Import products from your connected suppliers to calculate margins and stock alerts."
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-[#052e16] hover:bg-accent/90"
              >
                Import product
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Product",
                      "Supplier",
                      "Cost",
                      "Price",
                      "Margin",
                      "Stock",
                      "Sold 90d",
                      "",
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
                  {rows.map(({ product, units, revenue, margin }) => (
                    <tr
                      key={product.id}
                      className="border-b border-border/50 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{product.title}</p>
                        <p className="text-[11px] text-muted">{product.sku}</p>
                      </td>
                      <td className="px-4 py-2.5 text-muted">
                        {product.supplier}
                        <p className="text-[11px] text-muted/70">
                          {product.leadTime} d lead
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-muted">
                        {money(product.cost)}
                      </td>
                      <td className="px-4 py-2.5">{money(product.price)}</td>
                      <td
                        className={`px-4 py-2.5 ${margin > 50 ? "text-accent" : margin > 30 ? "text-ink" : "text-amber-300"}`}
                      >
                        {margin.toFixed(0)}%
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            product.stock < 15 ? "text-amber-300" : "text-muted"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted">
                        {units}
                        <p className="text-[11px] text-muted/70">
                          {compact(revenue)}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => removeProduct(product.id)}
                          aria-label={`Delete ${product.title}`}
                          className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <SectionCard
            title="Revenue concentration"
            sub="Top sellers of the last 90 days"
          >
            <div className="space-y-3">
              {rows.slice(0, 8).map((row) => (
                <BarRow
                  key={row.product.id}
                  label={row.product.title}
                  value={row.revenue}
                  max={rows[0]?.revenue ?? 1}
                  display={compact(row.revenue)}
                  hint={`${row.units} units · ${row.margin.toFixed(0)}% margin`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge tone={lowStock.length ? "warn" : "good"}>
                {lowStock.length ? `${lowStock.length} need reorder` : "stock healthy"}
              </Badge>
            </div>
          </SectionCard>
        </div>
      )}

      {modalOpen && <ImportProductModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
