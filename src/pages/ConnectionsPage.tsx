import { useState } from "react";
import { Check, Plus, Unplug } from "lucide-react";
import { PageHeader } from "../components/StatCard";
import { ConnectModal } from "../components/ConnectModal";
import { Badge, Segmented } from "../components/ui";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  INTEGRATIONS,
  type Integration,
} from "../lib/integrations";
import { toggleConnection, useAppState } from "../lib/store";

function IntegrationCard({
  integration,
  connected,
  onConnect,
}: {
  integration: Integration;
  connected: boolean;
  onConnect: (i: Integration) => void;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted/40">
      <div className="flex items-start justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold"
          style={{
            backgroundColor: integration.badgeBg,
            color: integration.badgeText,
          }}
        >
          {integration.initials}
        </div>
        {connected && <Badge tone="info">selected</Badge>}
      </div>
      <p className="mt-3 text-sm font-semibold">{integration.name}</p>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">
        {integration.description}
      </p>
      {connected ? (
        <button
          onClick={() => toggleConnection(integration.id)}
          className="group mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-accent/40 bg-accentdim py-1.5 text-sm text-accent transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <Check className="h-3.5 w-3.5 group-hover:hidden" />
          <Unplug className="hidden h-3.5 w-3.5 group-hover:block" />
          <span className="group-hover:hidden">Connected</span>
          <span className="hidden group-hover:inline">Disconnect</span>
        </button>
      ) : (
        <button
          onClick={() => onConnect(integration)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-sm text-accent transition-colors hover:border-accent/50 hover:bg-accent/5"
        >
          <Plus className="h-3.5 w-3.5" /> Connect
        </button>
      )}
    </div>
  );
}

export function ConnectionsPage() {
  const state = useAppState();
  const [active, setActive] = useState<Integration | null>(null);
  const [view, setView] = useState<"all" | "connected">("all");
  const connected = state.connections;

  const visibleCategories = CATEGORY_ORDER.filter((catId) => {
    if (view === "all") return true;
    return INTEGRATIONS.some(
      (i) => i.category === catId && connected.includes(i.id)
    );
  });

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Connections"
        sub={`${connected.length} of ${INTEGRATIONS.length} services selected across ${CATEGORY_ORDER.length} categories`}
        action={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "all", label: "All services" },
              { value: "connected", label: "Connected" },
            ]}
          />

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <span className="mt-0.5 text-sm text-amber-400">i</span>
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-semibold text-foreground">Integration catalogue, not live connections.</span>{" "}
          Selecting a service stores your choice in the database so the setup is documented.
          No provider OAuth is wired up yet, so no orders, payouts or tickets are imported from
          these services. Live sync needs app credentials and webhooks per provider.
        </p>
      </div>
        }
      />

      {visibleCategories.map((catId) => {
        const meta = CATEGORIES[catId];
        const cards = INTEGRATIONS.filter(
          (i) =>
            i.category === catId &&
            (view === "all" || connected.includes(i.id))
        );
        const selected = cards.filter((c) => connected.includes(c.id)).length;
        return (
          <section key={catId} className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">{meta.title}</h2>
                <p className="mt-1 text-xs text-muted">{meta.blurb}</p>
              </div>
              <span className="text-[11px] text-muted">
                {selected} / {cards.length} selected
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  connected={connected.includes(integration.id)}
                  onConnect={setActive}
                />
              ))}
            </div>
          </section>
        );
      })}

      {active && (
        <ConnectModal integration={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
