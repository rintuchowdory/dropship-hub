import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownLeft, Clock, Percent, Wallet } from "lucide-react";
import { PageHeader } from "../components/StatCard";
import { Badge, EmptyState, Metric, SectionCard, Segmented } from "../components/ui";
import { compact, dateShort, inWindow, money } from "../lib/metrics";
import { useAppState } from "../lib/store";
import type { TransactionType } from "../lib/types";

const TYPE_LABEL: Record<TransactionType, string> = {
  payout: "Payout",
  refund: "Refund",
  chargeback: "Chargeback",
  fee: "Fee",
};

const TYPE_TONE: Record<TransactionType, "good" | "info" | "bad" | "neutral"> = {
  payout: "good",
  refund: "info",
  chargeback: "bad",
  fee: "neutral",
};

export function FinancePage() {
  const state = useAppState();
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const view = useMemo(() => {
    const txn = state.transactions;
    const sumBy = (type: TransactionType) =>
      txn
        .filter((t) => t.type === type && t.status !== "Failed")
        .reduce((s, t) => s + Math.abs(t.amount), 0);

    const paidOut = txn
      .filter((t) => t.type === "payout" && t.status === "Completed")
      .reduce((s, t) => s + t.amount, 0);
    const pending = txn
      .filter((t) => t.type === "payout" && t.status === "Pending")
      .reduce((s, t) => s + t.amount, 0);
    const refunds = sumBy("refund");
    const chargebacks = sumBy("chargeback");
    const fees = sumBy("fee");
    const last30 = inWindow(state.orders, 30).filter(
      (o) => o.status !== "Cancelled"
    );
    const gross30 = last30.reduce((s, o) => s + o.total, 0);

    return {
      paidOut,
      pending,
      refunds,
      chargebacks,
      fees,
      gross30,
      net: gross30 - fees,
      refundRate: gross30 ? (refunds / gross30) * 100 : 0,
      rows: filter === "all" ? txn : txn.filter((t) => t.type === filter),
    };
  }, [state.transactions, state.orders, filter]);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Finance"
        sub="Payouts, disputes and fees across every payment provider"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Paid out"
          value={compact(view.paidOut)}
          sub="settled to your bank"
          icon={<Wallet className="h-4 w-4 text-accent" />}
        />
        <Metric
          label="Pending payouts"
          value={compact(view.pending)}
          sub="in transit or scheduled"
          icon={<Clock className="h-4 w-4 text-sky-300" />}
        />
        <Metric
          label="Refunds"
          value={compact(view.refunds)}
          sub={`${view.refundRate.toFixed(1)}% of gross`}
          icon={<ArrowDownLeft className="h-4 w-4 text-muted" />}
        />
        <Metric
          label="Chargebacks"
          value={compact(view.chargebacks)}
          sub="disputed by buyers"
          icon={<AlertTriangle className="h-4 w-4 text-rose-400" />}
        />
        <Metric
          label="Fees (30d)"
          value={compact(view.fees)}
          sub="platform + apps"
          icon={<Percent className="h-4 w-4 text-muted" />}
        />
      </div>

      <div className="mt-4">
        <Segmented
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All movements" },
            { value: "payout", label: "Payouts" },
            { value: "refund", label: "Refunds" },
            { value: "chargeback", label: "Chargebacks" },
            { value: "fee", label: "Fees" },
          ]}
        />
      </div>

      <SectionCard
        className="mt-4"
        title="Transactions"
        sub={`${view.rows.length} movements · gross last 30 days ${money(view.gross30, 0)}`}
      >
        {view.rows.length === 0 ? (
          <EmptyState title="No transactions yet." />
        ) : (
          <div className="-mx-5 -mb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted">
                  {["Type", "Provider", "Description", "Amount", "Status", "Date"].map(
                    (col) => (
                      <th key={col} className="px-5 py-2.5 text-left font-medium">
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {view.rows.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border/40 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-2.5">
                      <Badge tone={TYPE_TONE[t.type]}>{TYPE_LABEL[t.type]}</Badge>
                    </td>
                    <td className="px-5 py-2.5 text-muted">{t.provider}</td>
                    <td className="px-5 py-2.5">{t.description}</td>
                    <td
                      className={`px-5 py-2.5 ${t.amount < 0 ? "text-rose-400" : "text-accent"}`}
                    >
                      {money(t.amount)}
                    </td>
                    <td className="px-5 py-2.5 text-muted">{t.status}</td>
                    <td className="px-5 py-2.5 text-muted">
                      {dateShort(t.date)}
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
