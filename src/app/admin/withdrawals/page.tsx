import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { WithdrawalDecisionActions } from "@/components/admin/withdrawal-decision-actions";
import { requireAdmin } from "@/lib/auth";
import { adminWithdrawalQueue } from "@/lib/demo/queries";
import { formatCurrency, formatDateTime, maskAccountNumber } from "@/lib/utils";

export const metadata = { title: "Withdrawals — Admin" };

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requireAdmin();
  const { status } = await searchParams;
  const rows = (await adminWithdrawalQueue(status)) as any[];
  const canProcess = admin.profile.role !== "support_admin";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Withdrawals"
        title="Outbound queue."
        description="Review and process client withdrawal requests across all currencies and rails."
      />

      <div className="flex flex-wrap items-center gap-2">
        {([
          "all",
          "pending",
          "awaiting_fee_completion",
          "approved",
          "approved_for_processing",
          "processing",
          "paid",
          "completed",
          "rejected",
        ] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/withdrawals${s === "all" ? "" : `?status=${s}`}`}
            className={
              "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors " +
              ((status ?? "all") === s
                ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-[13px] text-muted-foreground">
            No withdrawals match this filter.
          </div>
        ) : (
          <ul className="divide-y divide-foreground/[0.05]">
            {rows.map((r) => (
              <li key={r.id} className="px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          r.status === "completed"
                            ? "success"
                            : r.status === "approved"
                              ? "gold"
                              : r.status === "rejected"
                                ? "destructive"
                                : "warning"
                        }
                      >
                        {r.status}
                      </Badge>
                      <span className="text-[12px] text-muted-foreground">
                        {formatDateTime(r.created_at)}
                      </span>
                    </div>
                    <Link
                      href={`/admin/users/${r.profiles?.id}`}
                      className="text-[15px] font-medium text-foreground hover:underline underline-offset-4"
                    >
                      {r.profiles?.full_name ?? "—"}
                    </Link>
                    <div className="text-[12px] text-muted-foreground tabular-figures">
                      {maskAccountNumber(r.profiles?.account_number)} · {r.profiles?.email} ·{" "}
                      {r.profiles?.country}
                    </div>
                    <div className="mt-2 text-[12.5px] text-foreground">
                      <span className="capitalize">{String(r.method).replace(/_/g, " ")}</span>
                      {r.payment_details?.destination && (
                        <> · <span className="tabular-figures">{r.payment_details.destination}</span></>
                      )}
                    </div>
                    {r.notes && (
                      <p className="mt-2 text-[12.5px] text-muted-foreground italic border-l-2 border-champagne-500/30 pl-3 max-w-2xl">
                        &quot;{r.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3">
                    <div className="font-display text-2xl font-semibold tabular-figures text-foreground">
                      {formatCurrency(r.amount, r.currency)}
                    </div>
                    {r.escrow_contract_id && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin#recovery-command">
                          Manage escrow release
                        </Link>
                      </Button>
                    )}
                    {canProcess && !r.escrow_contract_id && r.status !== "completed" && r.status !== "rejected" && (
                      <WithdrawalDecisionActions id={r.id} status={r.status} />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
