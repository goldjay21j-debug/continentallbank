import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireAdmin } from "@/lib/auth";
import { adminAllTransactions } from "@/lib/portal/queries";
import { formatCurrency, formatDateTime, maskAccountNumber } from "@/lib/utils";

export const metadata = { title: "Ledger — Admin" };

export default async function AdminTransactionsPage() {
  await requireAdmin();
  const rows = (await adminAllTransactions()) as any[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Ledger"
        title="All transactions."
        description="Consolidated view of every client-visible transaction posted on the platform."
      />

      <div className="glass-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[auto_1.4fr_1fr_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-foreground/[0.06] bg-foreground/[0.02] px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span></span>
          <span>Client</span>
          <span>Type / Description</span>
          <span>Currency</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Status</span>
          <span className="text-right">When</span>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-[13px] text-muted-foreground">
            No transactions on file.
          </div>
        ) : (
          <ul className="divide-y divide-foreground/[0.05]">
            {rows.map((t) => (
              <li
                key={t.id}
                className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1.4fr_1fr_0.8fr_0.8fr_0.8fr_auto] items-center gap-4 px-6 py-4"
              >
                <span
                  className={
                    "inline-flex h-9 w-9 items-center justify-center rounded-sm border " +
                    (t.amount >= 0
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-border bg-muted text-muted-foreground")
                  }
                >
                  {t.amount >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/admin/users/${t.profiles?.id}`}
                    className="text-[14px] font-medium text-foreground hover:underline underline-offset-4"
                  >
                    {t.profiles?.full_name ?? "—"}
                  </Link>
                  <div className="text-[11.5px] text-muted-foreground tabular-figures">
                    {maskAccountNumber(t.profiles?.account_number)}
                  </div>
                </div>
                <div className="hidden md:block min-w-0">
                  <div className="text-[13.5px] text-foreground capitalize truncate">
                    {t.description ?? t.type}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground capitalize">{t.type}</div>
                </div>
                <div className="hidden md:block text-[13px] text-foreground">{t.currency}</div>
                <div className="text-right tabular-figures text-[14px] font-medium text-foreground">
                  {t.amount >= 0 ? "+" : ""}
                  {formatCurrency(t.amount, t.currency)}
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
                <div className="hidden md:block text-right text-[12px] text-muted-foreground">
                  {formatDateTime(t.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
