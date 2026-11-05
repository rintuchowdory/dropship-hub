import { useState } from "react";
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
import type { Page } from "./lib/types";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-ink">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="min-w-0 flex-1 overflow-y-auto">
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
