import { useMemo, useState } from "react";
import { Bot, Plus, Trash2, Zap } from "lucide-react";
import { PageHeader } from "../components/StatCard";
import { Badge, EmptyState, Metric, SectionCard, Toggle } from "../components/ui";
import { relative } from "../lib/metrics";
import { addRule, newId, removeRule, toggleRule, useAppState } from "../lib/store";

const TRIGGERS = [
  "Order risk score is above 90",
  "Order is paid",
  "Order sits in Sent To Supplier for more than 48h",
  "Product stock drops below 15",
  "A chargeback is opened",
  "Refund is issued",
  "Shipment hits an exception",
];

const ACTIONS = [
  "Hold order for manual review",
  "Send to supplier with lowest landed cost",
  "Create a replenishment task",
  "Email the customer an update",
  "Notify #ops in Slack",
  "Collect evidence for the dispute",
  "Tag the order as high value",
];

export function AutomationPage() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [when, setWhen] = useState(TRIGGERS[0]);
  const [then, setThen] = useState(ACTIONS[0]);

  const active = state.rules.filter((r) => r.enabled);
  const totalHits = state.rules.reduce((s, r) => s + r.hits, 0);

  const runs = useMemo(() => {
    return state.rules
      .flatMap((rule) =>
        Array.from({ length: Math.min(3, Math.max(1, Math.round(rule.hits / 6))) }, (_, i) => ({
          id: `${rule.id}_${i}`,
          rule: rule.name,
          enabled: rule.enabled,
          minutesAgo: (i + 1) * (7 + rule.hits % 13) * 60 * 1000,
        }))
      )
      .sort((a, b) => a.minutesAgo - b.minutesAgo)
      .slice(0, 8)
      .map((r) => ({
        ...r,
        at: new Date(Date.now() - r.minutesAgo).toISOString(),
      }));
  }, [state.rules]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addRule({
      id: newId("rule"),
      name: name.trim(),
      when,
      then,
      enabled: true,
      hits: 0,
      created: new Date().toISOString(),
    });
    setName("");
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Automation"
        sub="Rules that route, hold and chase orders without a human in the loop"
        action={
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-[#052e16] transition-colors hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" /> New rule
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric
          label="Rules"
          value={String(state.rules.length)}
          sub={`${active.length} active`}
          icon={<Bot className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Triggered"
          value={String(totalHits)}
          sub="lifetime executions"
          icon={<Zap className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Saved handling time"
          value={`${Math.round(totalHits * 1.4)} min`}
          sub="at 84s per order"
        />
        <Metric
          label="Needs review"
          value={String(state.rules.filter((r) => !r.enabled).length)}
          sub="paused rules"
        />
      </div>

      {open && (
        <SectionCard className="mt-4" title="New rule" sub="Compose a trigger and an action">
          <form onSubmit={submit} className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs text-muted">Rule name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hold suspicious DHL orders"
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted">When</label>
              <select
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent/60"
              >
                {TRIGGERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted">Then</label>
              <select
                value={then}
                onChange={(e) => setThen(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent/60"
              >
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-3">
              <button
                type="submit"
                disabled={!name.trim()}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#052e16] transition-colors hover:bg-accent/90 disabled:opacity-50"
              >
                Create rule
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Active rules" sub="Toggle to pause a rule instantly">
          {state.rules.length === 0 ? (
            <EmptyState title="No rules yet." hint="Create your first rule to automate order routing." />
          ) : (
            <ul className="divide-y divide-border/60">
              {state.rules.map((rule) => (
                <li key={rule.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <Toggle
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    label={`Toggle ${rule.name}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{rule.name}</p>
                      <Badge tone={rule.enabled ? "good" : "neutral"}>
                        {rule.enabled ? "active" : "paused"}
                      </Badge>
                      <span className="text-[11px] text-muted">
                        {rule.hits} runs
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted">
                      <span className="text-muted/70">when</span> {rule.when}{" "}
                      <span className="text-muted/70">→</span> {rule.then}
                    </p>
                  </div>
                  <button
                    onClick={() => removeRule(rule.id)}
                    aria-label={`Delete ${rule.name}`}
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Execution log" sub="Most recent rule runs">
          <ul className="space-y-3">
            {runs.map((run) => (
              <li key={run.id} className="flex items-start gap-2.5 text-xs">
                <span
                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${run.enabled ? "bg-accent" : "bg-muted"}`}
                />
                <div>
                  <p className="font-medium">{run.rule}</p>
                  <p className="text-[11px] text-muted">{relative(run.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
