import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AutomationPage } from "./pages/AutomationPage";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FinancePage } from "./pages/FinancePage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductsPage } from "./pages/ProductsPage";
import { TrackingPage } from "./pages/TrackingPage";
import { reload, useApiStatus } from "./lib/store";
import type { Page } from "./lib/types";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const { phase, error } = useApiStatus();

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-ink">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        {phase === "error" && (
          <div className="flex items-center justify-between gap-4 border-b border-rose-500/30 bg-rose-500/10 px-6 py-2.5 text-xs text-rose-200">
            <span>
              The API is not responding{error ? ` (${error})` : ""}. The dashboard is showing
              the last state it received.
            </span>
            <button
              onClick={() => void reload()}
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/40 px-2 py-1 font-medium text-rose-100 transition-colors hover:bg-rose-500/20"
            >
              <RotateCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}
        {phase === "loading" && (
          <div className="flex items-center gap-2 border-b border-border bg-card px-6 py-2.5 text-xs text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Loading data from the database…
          </div>
        )}
        {page === "dashboard" && <DashboardPage onNavigate={setPage} />}
        {page === "analytics" && <AnalyticsPage />}
        {page === "orders" && <OrdersPage />}
        {page === "products" && <ProductsPage />}
        {page === "tracking" && <TrackingPage />}
        {page === "automation" && <AutomationPage />}
        {page === "connections" && <ConnectionsPage />}
        {page === "customers" && <CustomersPage />}
        {page === "finance" && <FinancePage />}
      </main>
    </div>
  );
}
