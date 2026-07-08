import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireApprovedClient } from "@/lib/auth";
import { clientTransactions } from "@/lib/portal/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Transaction } from "@/lib/types/database";

export const metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const user = await requireApprovedClient();
  const txs = (await clientTransactions(user.id, 200)) as Transaction[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Transactions"
        title="A complete ledger of your movements."
        description="Every credit, debit, and adjustment is recorded with a timestamp and the responsible officer."
      />

      <div className="glass-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.6fr)] gap-4 border-b border-foreground/[0.06] bg-foreground/[0.02] px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>Description</span>
          <span>Type</span>
          <span>Currency</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Status</span>
        </div>
        {txs.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-foreground/[0.05]">
            {txs.map((t) => (
              <li
                key={t.id}
                className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.6fr)] md:gap-4"
              >
                <span
                  className={
                    "md:hidden inline-flex h-9 w-9 items-center justify-center rounded-sm border " +
                    (t.amount >= 0
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-border bg-muted text-muted-foreground")
                  }
                >
                  {t.amount >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                </span>
                <div className="min-w-0">
                  <div className="break-words text-[14px] font-medium capitalize text-foreground md:truncate">
                    {t.description ?? t.type}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {formatDateTime(t.created_at)}
                  </div>
                </div>
                <div className="hidden md:block">
                  <Badge variant="muted" className="capitalize">
                    {t.type}
                  </Badge>
                </div>
                <div className="hidden md:block text-[13px] tabular-figures text-foreground">
                  {t.currency}
                </div>
                <div className="col-span-2 min-w-0 text-right sm:col-span-1 md:col-span-1">
                  <div className="tabular-figures text-[14px] font-medium text-foreground">
                    {t.amount >= 0 ? "+" : ""}
                    {formatCurrency(t.amount, t.currency)}
                  </div>
                </div>
                <div className="hidden md:flex justify-end">
                  <Badge
                    variant={
                      t.status === "completed"
                        ? "success"
                        : t.status === "rejected"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {t.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border">
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-[14px] font-medium text-foreground">No movements yet</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Transactions posted by your banker will appear here.
      </p>
    </div>
  );
}
