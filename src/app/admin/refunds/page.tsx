import Link from "next/link";
import { ExternalLink, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { RefundDecisionActions } from "@/components/admin/refund-decision-actions";
import { requireAdmin } from "@/lib/auth";
import { adminRefundQueue } from "@/lib/portal/queries";
import { formatCurrency, formatDateTime, maskAccountNumber } from "@/lib/utils";
import { REFUND_REASONS } from "@/lib/constants";

export const metadata = { title: "Refunds — Admin" };

const REASON_LABEL = Object.fromEntries(REFUND_REASONS.map((r) => [r.id, r.label]));

export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requireAdmin();
  const { status } = await searchParams;
  const rows = (await adminRefundQueue(status)) as any[];

  const canProcess = admin.profile.role !== "support_admin";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Refunds &amp; recovery"
        title="Claims queue."
        description="Review and process refund claims — disputes filed by signed-in clients and public claims submitted via the marketing site."
      />

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "pending", "under_review", "approved", "rejected", "completed"] as const).map(
          (s) => (
            <Link
              key={s}
              href={`/admin/refunds${s === "all" ? "" : `?status=${s}`}`}
              className={
                "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors " +
                ((status ?? "all") === s
                  ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {s.replace("_", " ")}
            </Link>
          ),
        )}
      </div>

      <div className="glass-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-[13px] text-muted-foreground">
            No claims match this filter.
          </div>
        ) : (
          <ul className="divide-y divide-foreground/[0.05]">
            {rows.map((r) => (
              <li key={r.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge
                        variant={
                          r.status === "completed"
                            ? "success"
                            : r.status === "approved" || r.status === "under_review"
                              ? "gold"
                              : r.status === "rejected"
                                ? "destructive"
                                : "warning"
                        }
                        className="capitalize"
                      >
                        {String(r.status).replace("_", " ")}
                      </Badge>
                      <Badge variant="muted" className="capitalize">
                        {r.claim_type === "public_claim" ? "Public claim" : "Client dispute"}
                      </Badge>
                      <span className="text-[12px] text-muted-foreground">
                        {formatDateTime(r.created_at)}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 flex-wrap">
                      {r.profiles?.id ? (
                        <Link
                          href={`/admin/users/${r.profiles.id}`}
                          className="text-[15px] font-medium text-foreground hover:underline underline-offset-4 inline-flex items-center gap-1"
                        >
                          {r.claimant_name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[15px] font-medium text-foreground inline-flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                          {r.claimant_name}
                          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground ml-1">
                            · not a registered client
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="text-[12px] text-muted-foreground tabular-figures mt-0.5">
                      {r.claimant_email}
                      {r.claimant_phone && <> · {r.claimant_phone}</>}
                      {r.account_reference && (
                        <> · {maskAccountNumber(r.account_reference)}</>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[12.5px] text-foreground">
                      <span className="font-medium">
                        {REASON_LABEL[r.supporting_info?.reason ?? "other"] ?? "Other"}
                      </span>
                      {r.transaction_reference && (
                        <span className="text-muted-foreground tabular-figures">
                          Ref · {r.transaction_reference}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-[12.5px] text-muted-foreground italic border-l-2 border-champagne-500/30 pl-3 max-w-2xl">
                      &ldquo;{r.description}&rdquo;
                    </p>

                    {r.admin_note && (
                      <div className="mt-3 rounded-sm border border-champagne-500/20 bg-champagne-500/5 px-3.5 py-2.5 max-w-2xl">
                        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-1">
                          Previous note
                        </div>
                        <p className="text-[12.5px] text-foreground leading-relaxed">
                          {r.admin_note}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3">
                    <div className="font-display text-2xl font-semibold tabular-figures text-foreground">
                      {r.currency
                        ? formatCurrency(r.amount, r.currency)
                        : Number(r.amount).toLocaleString()}
                    </div>
                    {canProcess &&
                      r.status !== "completed" &&
                      r.status !== "rejected" && (
                        <RefundDecisionActions id={r.id} status={r.status} />
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
