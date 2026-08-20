import Link from "next/link";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { KycDecisionActions } from "@/components/admin/kyc-decision-actions";
import { DocumentIssueForm } from "@/components/admin/document-issue-form";
import { UserDecisionActions } from "@/components/admin/user-decision-actions";
import { BalanceAdjustForm } from "@/components/admin/balance-adjust-form";
import { requireAdmin } from "@/lib/auth";
import { adminClientDetail } from "@/lib/portal/queries";
import { formatCurrency, formatDateTime, maskAccountNumber } from "@/lib/utils";
import { formatWithdrawalMethod } from "@/lib/withdrawal-methods";
import { KYC_METHODS, KYC_STATUS, ROLE_LABELS, type KycStatus, type Role } from "@/lib/constants";
import type { LedgerEntry, Profile, Wallet, WithdrawalRequest } from "@/lib/types/database";

export const metadata = { title: "Client detail" };

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;

  const { profile, wallets, ledger, withdrawals } = await adminClientDetail(id);
  if (!profile) return notFound();

  const p = profile as Profile;
  const ws = wallets as Wallet[];
  const ledgerRows = ledger as LedgerEntry[];
  const wds = withdrawals as WithdrawalRequest[];
  const kycStatus = (p.kyc_status ?? "not_submitted") as KycStatus;

  const canModifyBalance =
    admin.profile.role === "super_admin" || admin.profile.role === "finance_admin";

  return (
    <div className="space-y-10">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3">
          <Link href="/admin/users">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to clients
          </Link>
        </Button>
        <PageHeader
          eyebrow="Client profile"
          title={p.full_name}
          description={`${p.email} · ${ROLE_LABELS[p.role as Role]}`}
          actions={<UserDecisionActions userId={p.id} status={p.account_status} />}
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-5 h-fit">
            <div className="eyebrow text-champagne-700 dark:text-champagne-400">Identity</div>
            <Row label="Account number" value={maskAccountNumber(p.account_number)} />
            <Row label="Status">
              <Badge
                variant={
                  p.account_status === "approved"
                    ? "success"
                    : p.account_status === "rejected"
                      ? "destructive"
                      : p.account_status === "suspended"
                        ? "muted"
                        : "warning"
                }
                className="capitalize"
              >
                {p.account_status === "suspended" ? "Frozen" : p.account_status}
              </Badge>
            </Row>
            <Row label="Country" value={p.country ?? "—"} />
            <Row label="Phone" value={p.phone ?? "—"} />
            <Row label="Reporting" value={p.preferred_currency} />
            <Row label="Language" value={p.preferred_language?.toUpperCase()} />
            <Row label="Registered" value={formatDateTime(p.created_at)} />
          </div>

          <div className="glass-card p-6 space-y-5 h-fit">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                  KYC verification
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
                  Document review
                </h3>
              </div>
              <FileCheck2 className="h-5 w-5 text-champagne-600" strokeWidth={1.5} />
            </div>
            <Row label="KYC status">
              <KycStatusBadge status={kycStatus} />
            </Row>
            <Row label="Method" value={labelForKycMethod(p.kyc_method)} />
            <Row label="Document" value={p.kyc_document_name ?? "—"} />
            <Row label="Submitted" value={p.kyc_submitted_at ? formatDateTime(p.kyc_submitted_at) : "—"} />
            <Row label="Reviewed" value={p.kyc_reviewed_at ? formatDateTime(p.kyc_reviewed_at) : "—"} />
            {p.kyc_review_note && (
              <div className="rounded-md border border-champagne-500/20 bg-champagne-500/5 px-3.5 py-3">
                <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-1">
                  Last note
                </div>
                <p className="text-[12.5px] leading-relaxed text-foreground">
                  {p.kyc_review_note}
                </p>
              </div>
            )}
            {p.kyc_document_path && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/admin/kyc-document/${p.id}`} target="_blank" rel="noreferrer">
                  Open document
                </a>
              </Button>
            )}
            <KycDecisionActions userId={p.id} status={kycStatus} />
          </div>
        </div>

        <div className="glass-card p-6 lg:p-7">
          <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-4">
            Currency accounts
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {ws.map((w) => (
              <div key={w.id} className="rounded-sm border border-border bg-background p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {w.currency} Portfolio
                </div>
                <div className="mt-2 font-display text-xl font-semibold tabular-figures text-foreground">
                  {formatCurrency(w.available_balance, w.currency)}
                </div>
                <div className="mt-1 text-[11.5px] text-muted-foreground tabular-figures">
                  Pending {formatCurrency(w.pending_balance, w.currency)}
                </div>
                <div className="text-[11.5px] text-muted-foreground tabular-figures">
                  Withdrawn {formatCurrency(w.total_withdrawn, w.currency)}
                </div>
              </div>
            ))}
          </div>

          {canModifyBalance && (
            <>
              <div className="hairline my-7" />
              <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-4">
                Post adjustment
              </div>
              <BalanceAdjustForm userId={p.id} />
            </>
          )}
        </div>
      </section>

      <section className="glass-card p-6 lg:p-7">
        <DocumentIssueForm userId={p.id} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <div className="border-b border-foreground/[0.06] px-6 py-4 flex items-center justify-between">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">Ledger</div>
              <h3 className="mt-1 font-display text-lg font-semibold">Immutable record</h3>
            </div>
          </div>
          {ledgerRows.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">
              No ledger entries yet.
            </div>
          ) : (
            <ul className="divide-y divide-foreground/[0.05] max-h-[520px] overflow-y-auto">
              {ledgerRows.map((l) => (
                <li key={l.id} className="px-4 py-4 sm:px-6">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="break-words text-[13.5px] font-medium capitalize text-foreground">
                        {l.action_type.replace(/_/g, " ")}
                      </div>
                      <div className="mt-0.5 break-words text-[11.5px] tabular-figures text-muted-foreground">
                        {formatDateTime(l.created_at)} · {l.currency}
                      </div>
                      {l.note && (
                        <div className="mt-1.5 break-words text-[12.5px] italic text-muted-foreground">
                          &quot;{l.note}&quot;
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 text-left sm:text-right">
                      <div className="tabular-figures text-[14px] font-medium text-foreground">
                        {Number(l.amount) >= 0 ? "+" : ""}
                        {formatCurrency(l.amount, l.currency)}
                      </div>
                      <div className="text-[11px] tabular-figures text-muted-foreground mt-0.5">
                        {formatCurrency(l.balance_before, l.currency)} →{" "}
                        {formatCurrency(l.balance_after, l.currency)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card">
          <div className="border-b border-foreground/[0.06] px-6 py-4">
            <div className="eyebrow text-champagne-700 dark:text-champagne-400">Withdrawals</div>
            <h3 className="mt-1 font-display text-lg font-semibold">Recent requests</h3>
          </div>
          {wds.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">
              No requests on file.
            </div>
          ) : (
            <ul className="divide-y divide-foreground/[0.05] max-h-[520px] overflow-y-auto">
              {wds.map((w) => (
                <li key={w.id} className="px-4 py-4 sm:px-6">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="tabular-figures text-[14px] font-medium text-foreground">
                        {formatCurrency(w.amount, w.currency)}
                      </div>
                      <div className="break-words text-[11.5px] capitalize text-muted-foreground">
                        {formatWithdrawalMethod(w.method)} · {formatDateTime(w.created_at)}
                      </div>
                    </div>
                    <Badge
                      variant={
                        w.status === "completed"
                          ? "success"
                          : w.status === "approved"
                            ? "gold"
                            : w.status === "rejected"
                              ? "destructive"
                              : "warning"
                      }
                    >
                      {w.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <span className="min-w-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right text-[13.5px] font-medium tabular-figures text-foreground">
        {children ?? value}
      </span>
    </div>
  );
}

function KycStatusBadge({ status }: { status: KycStatus }) {
  const map = {
    not_submitted: "muted",
    submitted: "warning",
    under_review: "gold",
    approved: "success",
    rejected: "destructive",
  } as const;
  return (
    <Badge variant={map[status]} className="capitalize">
      {KYC_STATUS[status]}
    </Badge>
  );
}

function labelForKycMethod(method: Profile["kyc_method"]) {
  return KYC_METHODS.find((m) => m.id === method)?.label ?? "—";
}
