import {
  BarChart3,
  Bot,
  LayoutGrid,
  Package,
  Plug,
  RefreshCw,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { clearAll, getState, resetDemo, useAppState } from "../lib/store";
import type { Page } from "../lib/types";

const GROUPS: {
  label: string;
  items: { id: Page; label: string; icon: typeof LayoutGrid }[];
}[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "orders", label: "Orders", icon: ShoppingCart },
      { id: "products", label: "Products", icon: Package },
      { id: "tracking", label: "Tracking", icon: Truck },
      { id: "automation", label: "Automation", icon: Bot },
    ],
  },
  {
    label: "Network",
    items: [
      { id: "connections", label: "Connections", icon: Plug },
      { id: "customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Money",
    items: [{ id: "finance", label: "Finance", icon: Wallet }],
  },
];

export function Sidebar({
  current,
  onNavigate,
}: {
  current: Page;
  onNavigate: (p: Page) => void;
}) {
  const state = useAppState();
  const openOrders = state.orders.filter(
    (o) => o.status === "Pending" || o.status === "Sent To Supplier"
  ).length;

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <Zap className="h-5 w-5 fill-accent text-accent" />
        <span className="text-[15px] font-bold tracking-tight">
          DropshipConnect
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted/70">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ id, label, icon: Icon }) => {
                const active = current === id;
                return (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-accentdim font-medium text-accent"
                        : "text-muted hover:bg-white/5 hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{label}</span>
                    {id === "orders" && openOrders > 0 && (
                      <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted">
                        {openOrders}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center justify-between px-1 text-[11px] text-muted">
          <span>{state.connections.length} services connected</span>
          <span className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${state.demo ? "bg-accent" : "bg-muted"}`}
            />
            {state.demo ? "seeded" : "empty"}
          </span>
        </div>
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={resetDemo}
            title="Import the starter dataset into the database"
            className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-1.5 text-[11px] text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            <RefreshCw className="h-3 w-3" /> Seed import
          </button>
          <button
            onClick={clearAll}
            title="Empty the database"
            className="rounded-md border border-border px-2 py-1.5 text-[11px] text-muted transition-colors hover:border-rose-500/40 hover:text-rose-300"
            aria-label="Clear all data"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 px-1 text-[10px] text-muted/60">
          {getState().orders.length} orders ·{" "}
          {getState().products.length} products in D1
        </p>
      </div>
    </aside>
  );
}
