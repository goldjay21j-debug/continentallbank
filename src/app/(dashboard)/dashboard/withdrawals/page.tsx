import Link from "next/link";
import { ArrowDownLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityTicker } from "@/components/shared/activity-ticker";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { clientWithdrawals } from "@/lib/portal/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { formatWithdrawalMethod } from "@/lib/withdrawal-methods";
import type { WithdrawalRequest } from "@/lib/types/database";

export const metadata = { title: "Request History" };

export default async function WithdrawalsPage() {
  const user = await requireApprovedClient();
  const reqs = (await clientWithdrawals(user.id)) as WithdrawalRequest[];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Withdrawal history"
        title="Requests and payout instructions."
        description="Review submitted withdrawal instructions, officer review state, and settlement history."
        actions={
          <Button asChild>
            <Link href="/dashboard/withdraw">
              New withdrawal request
              <ArrowDownLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <TrustBadgeRail preset="withdrawals" tone="light" compact className="xl:grid-cols-3" />
      <ActivityTicker preset="withdrawals" tone="light" label="Settlement activity" compact />

      <MotionCard className="overflow-hidden">
        <div className="border-b border-foreground/[0.06] px-6 py-4">
          <div className="eyebrow text-champagne-700 dark:text-champagne-400">History</div>
          <h3 className="mt-1 font-display text-lg font-semibold">Recent requests</h3>
        </div>
        {reqs.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-muted-foreground">
            <ShieldCheck className="mx-auto mb-3 h-5 w-5 text-champagne-600" />
            No withdrawal requests yet.
          </div>
        ) : (
          <ul className="divide-y divide-foreground/[0.05]">
            {reqs.map((request) => (
              <li key={request.id} className="px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={badgeForStatus(request.status)}>
                        {formatStatus(request.status)}
                      </Badge>
                      {request.fee_status !== "unpaid" && (
                        <Badge variant={request.fee_status === "completed" ? "success" : "warning"}>
                          Fee {formatStatus(request.fee_status)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[15px] font-medium text-foreground">
                      {formatCurrency(request.amount, request.currency)}
                    </div>
                    <div className="mt-1 break-words text-[12px] capitalize text-muted-foreground">
                      {formatWithdrawalMethod(request.method)} - {formatDateTime(request.created_at)}
                    </div>
                    {Number(request.release_processing_fee ?? 0) > 0 && (
                      <div className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
                        <Detail label="Processing fee" value={formatCurrency(request.release_processing_fee, request.currency)} />
                        <Detail label="Estimated net" value={formatCurrency(request.net_amount ?? 0, request.currency)} />
                        <Detail label="Release status" value={formatStatus(request.release_status)} />
                      </div>
                    )}
                    {request.admin_note && (
                      <p className="mt-3 max-w-2xl border-l-2 border-champagne-500/30 pl-3 text-[12.5px] italic text-muted-foreground">
                        &quot;{request.admin_note}&quot;
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild className="self-start">
                    <Link href="/dashboard/documents">
                      View documents
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </MotionCard>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0 rounded-md border border-foreground/[0.06] bg-foreground/[0.025] px-3 py-2">
      <span className="block text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-1 block break-words font-medium text-foreground">{value}</span>
    </span>
  );
}

function badgeForStatus(
  status: WithdrawalRequest["status"],
): "success" | "gold" | "destructive" | "warning" {
  if (status === "completed" || status === "paid") return "success";
  if (status === "approved" || status === "approved_for_processing") return "gold";
  if (status === "rejected" || status === "failed" || status === "cancelled") return "destructive";
  return "warning";
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}
