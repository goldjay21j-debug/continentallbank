import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  ArrowRight,
  Banknote,
  BellRing,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderOpen,
  Globe2,
  Landmark,
  LifeBuoy,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
  Undo2,
  UserCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityTicker } from "@/components/shared/activity-ticker";
import { MotionCard } from "@/components/motion/motion-card";
import { MotionList, MotionRow } from "@/components/motion/motion-list";
import { requireAdmin } from "@/lib/auth";
import {
  RECOVERY_CASE_TYPE_LABELS,
  SITE,
  type RecoveryCaseType,
} from "@/lib/constants";
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentRecord,
} from "@/lib/portal/documents";
import {
  BENEFICIARY_RAIL_LABEL,
  type Beneficiary,
} from "@/lib/portal/beneficiaries";
import {
  adminAnalytics,
  adminCounts,
  adminDashboardMetrics,
  adminEscrowContracts,
  adminPendingRefundCount,
  adminRecentActivity,
  adminRecentWithdrawals,
  adminRecoveredFunds,
  adminRecoveryCases,
  adminRecoveryMetrics,
} from "@/lib/portal/queries";
import { formatCurrency, formatDateTime, maskAccountNumber } from "@/lib/utils";

export const metadata = { title: "Operations" };

type WithdrawalRow = {
  id: string;
  amount: number | string;
  currency: string;
  method: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    account_number?: string | null;
  } | null;
};

type ActivityRow = {
  id: string;
  action_type: string;
  created_at: string;
  profiles?: {
    full_name?: string | null;
  } | null;
};

type RecentDocument = DocumentRecord & {
  profiles?: {
    full_name?: string | null;
    account_number?: string | null;
  } | null;
};

type BeneficiaryReviewRow = Beneficiary & {
  client_name?: string;
  client_account?: string | null;
  profiles?: {
    full_name?: string | null;
    account_number?: string | null;
  } | null;
};

type RecoveryCaseRow = {
  id: string;
  title: string;
  complaint_type: string;
  amount_claimed: number | string;
  currency: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    account_number?: string | null;
  } | null;
};

type EscrowContractRow = {
  id: string;
  reference: string;
  status: string;
  release_status: string;
  available_for_withdrawal: number | string;
  currency: string;
  profiles?: {
    full_name?: string | null;
  } | null;
  cases?: {
    title?: string | null;
  } | null;
};

type RecoveredFundRow = {
  id: string;
  source?: string | null;
  provider_reference?: string | null;
  amount: number | string;
  currency: string;
  created_at: string;
  profiles?: {
    full_name?: string | null;
  } | null;
  cases?: {
    title?: string | null;
  } | null;
};

const currencies = ["USD", "EUR", "GBP"] as const;

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const [
    counts,
    refundCount,
    dashboard,
    analytics,
    recoveryMetrics,
    recoveryCases,
    escrowContracts,
    recoveredFunds,
    recentRequests,
    recentActivity,
  ] =
    await Promise.all([
      adminCounts(),
      adminPendingRefundCount(),
      adminDashboardMetrics(),
      adminAnalytics(),
      adminRecoveryMetrics(),
      adminRecoveryCases(),
      adminEscrowContracts(),
      adminRecoveredFunds(6),
      adminRecentWithdrawals(),
      adminRecentActivity(),
    ]);

  const reviewTotal =
    counts.pendingClients +
    counts.pendingWithdrawals +
    refundCount +
    recoveryMetrics.openCases +
    counts.openTickets +
    dashboard.pendingKyc +
    dashboard.pendingBeneficiaries;

  const liveDomain = SITE.publicDomain;
  const domainLabel = liveDomain.replace(/^https?:\/\//, "");
  const recentDocuments = dashboard.recentDocuments as RecentDocument[];
  const recentBeneficiaries = dashboard.recentBeneficiaries as BeneficiaryReviewRow[];

  const stats = [
    {
      icon: Users,
      label: "Client applications",
      value: String(counts.pendingClients),
      detail: "Pending onboarding approvals",
      href: "/admin/users?status=pending",
      active: counts.pendingClients > 0,
    },
    {
      icon: FileCheck2,
      label: "KYC reviews",
      value: String(dashboard.pendingKyc),
      detail: "Identity files needing officer review",
      href: "/admin/compliance",
      active: dashboard.pendingKyc > 0,
    },
    {
      icon: Banknote,
      label: "Beneficiary approvals",
      value: String(dashboard.pendingBeneficiaries),
      detail: "Outbound destinations to verify",
      href: "/admin/beneficiaries?status=pending",
      active: dashboard.pendingBeneficiaries > 0,
    },
    {
      icon: ArrowDownLeft,
      label: "Withdrawal queue",
      value: String(counts.pendingWithdrawals),
      detail: "Payment instructions awaiting approval",
      href: "/admin/withdrawals?status=pending",
      active: counts.pendingWithdrawals > 0,
    },
    {
      icon: Undo2,
      label: "Refund requests",
      value: String(refundCount),
      detail: "Disputes and reversals desk",
      href: "/admin/refunds?status=pending",
      active: refundCount > 0,
    },
    {
      icon: FolderOpen,
      label: "Escrow requests",
      value: String(recoveryMetrics.openCases),
      detail: "Escrow files, documents, and readiness",
      href: "/admin/recovery",
      active: recoveryMetrics.openCases > 0,
    },
    {
      icon: LifeBuoy,
      label: "Support cases",
      value: String(counts.openTickets),
      detail: "Concierge messages requiring response",
      href: "/admin/support",
      active: counts.openTickets > 0,
    },
    {
      icon: FileText,
      label: "Documents issued",
      value: String(dashboard.documentsIssued),
      detail: "Receipts, letters, statements",
      href: "/admin/users",
    },
    {
      icon: BellRing,
      label: "Unread client notices",
      value: String(dashboard.unreadNotifications),
      detail: "Portal notifications still unread",
      href: "/admin/audit-logs",
      active: dashboard.unreadNotifications > 0,
    },
  ];

  const actionTiles = [
    {
      icon: FolderOpen,
      label: "Manage escrow requests",
      detail: "Review escrow intake, contracts, approved funds, and release eligibility.",
      href: "/admin/recovery",
      metric: recoveryMetrics.openCases,
    },
    {
      icon: UserCheck,
      label: "Approve clients",
      detail: "Review new private office accounts and activate approved clients.",
      href: "/admin/users?status=pending",
      metric: counts.pendingClients,
    },
    {
      icon: ShieldCheck,
      label: "Review KYC",
      detail: "Inspect submitted identity, address, and source-of-funds records.",
      href: "/admin/compliance",
      metric: dashboard.pendingKyc,
    },
    {
      icon: Banknote,
      label: "Verify beneficiaries",
      detail: "Approve payout destinations before payment officers can release funds.",
      href: "/admin/beneficiaries?status=pending",
      metric: dashboard.pendingBeneficiaries,
    },
    {
      icon: WalletCards,
      label: "Release payments",
      detail: "Approve, reject, or complete withdrawals with full audit history.",
      href: "/admin/withdrawals?status=pending",
      metric: counts.pendingWithdrawals,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <MotionCard
          surface="none"
          className="relative overflow-hidden rounded-md border border-white/[0.09] bg-white/[0.045] p-6 shadow-[0_30px_80px_-46px_rgba(0,0,0,0.96)] backdrop-blur-xl lg:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne-400/60 to-transparent" />
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-champagne-400/10 bg-champagne-300/[0.03]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-sm border border-champagne-500/24 bg-champagne-500/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-champagne-300">
                <LockKeyhole className="h-3.5 w-3.5" strokeWidth={1.7} />
                Admin-only command access
              </div>
              <h1 className="mt-5 font-display text-3xl font-semibold tracking-normal text-ivory-100 sm:text-4xl">
                Continental administration dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-ivory-100/62 sm:text-[15px]">
                Monitor onboarding, compliance, beneficiaries, documents, payments, and officer
                actions for the live Continental Bank domain from one operations surface.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild variant="gold" size="sm">
                  <Link href="/admin/users?status=pending">
                    Start reviews
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/[0.1] bg-white/[0.045] text-ivory-100/82"
                >
                  <Link href={liveDomain} target="_blank" rel="noreferrer">
                    Visit {domainLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:min-w-[280px] lg:w-auto">
              <HeroMetric label="Review queue" value={reviewTotal} />
              <HeroMetric label="Clients" value={counts.totalClients} />
              <HeroMetric label="Domain" value="Live" />
              <HeroMetric label="Desk" value={admin.profile.role.replace("_", " ")} />
            </div>
          </div>
        </MotionCard>

        <MotionCard
          surface="none"
          className="rounded-md border border-white/[0.09] bg-navy-950/66 p-5 shadow-[0_26px_70px_-48px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-champagne-300">
                Production command
              </div>
              <h2 className="mt-2 text-[17px] font-semibold text-ivory-100">
                {domainLabel}
              </h2>
              <p className="mt-2 text-[12.5px] leading-5 text-ivory-100/52">
                Public domain is wired into metadata, portal links, and admin quick access.
              </p>
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-champagne-500/24 bg-champagne-500/[0.09] text-champagne-300">
              <Globe2 className="h-4 w-4" strokeWidth={1.7} />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <HealthRow icon={ShieldCheck} label="Admin gate" value="Restricted" />
            <HealthRow icon={ScrollText} label="Audit trail" value="Recording" />
            <HealthRow icon={Clock3} label="Queue status" value={reviewTotal > 0 ? "Active" : "Clear"} />
          </div>
          <Button asChild variant="outline" className="mt-5 w-full border-white/[0.1] bg-white/[0.045]">
            <Link href="/admin/audit-logs">
              Open audit log
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </MotionCard>
      </section>

      <ActivityTicker preset="admin" tone="dark" label="Live approvals" compact />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
        <MotionCard
          index={3}
          surface="none"
          className="rounded-md border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionTitle
            eyebrow="Officer workflow"
            title="Priority command board"
            actionHref="/admin/users"
            actionLabel="Client roster"
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {actionTiles.map((tile, index) => (
              <ActionTile key={tile.label} {...tile} index={index} />
            ))}
          </div>
        </MotionCard>

        <MotionCard
          index={4}
          surface="none"
          className="rounded-md border border-white/[0.09] bg-navy-950/62 p-5 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionTitle
            eyebrow="Custody"
            title="Portfolio exposure"
            actionHref="/admin/analytics"
            actionLabel="Analytics"
          />
          <div className="mt-5 space-y-4">
            {currencies.map((currency) => (
              <CustodyBar
                key={currency}
                currency={currency}
                value={analytics.custody[currency] ?? 0}
                pending={analytics.pending[currency] ?? 0}
                max={Math.max(...currencies.map((c) => analytics.custody[c] ?? 0), 1)}
              />
            ))}
          </div>
          <div className="mt-5 rounded-sm border border-white/[0.08] bg-white/[0.035] p-3">
            <div className="flex items-center justify-between gap-3 text-[12px] text-ivory-100/58">
              <span>Total approved clients</span>
              <span className="font-medium tabular-figures text-ivory-100">
                {analytics.approvedClients}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[12px] text-ivory-100/58">
              <span>Lifetime withdrawn</span>
              <span className="font-medium tabular-figures text-ivory-100">
                {formatCurrency(
                  currencies.reduce((sum, c) => sum + (analytics.withdrawnLifetime[c] ?? 0), 0),
                  "USD",
                  { notation: "compact", maximumFractionDigits: 1, minimumFractionDigits: 0 },
                )}
              </span>
            </div>
          </div>
        </MotionCard>
      </section>

      <section id="recovery-command" className="grid scroll-mt-6 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <MotionCard
          index={5}
          surface="none"
          className="overflow-hidden rounded-md border border-white/[0.09] bg-white/[0.045] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionHeader
            eyebrow="Escrow and investment"
            title="Escrow request queue"
            href="/admin/recovery"
            label="Current"
          />
          {(recoveryCases as RecoveryCaseRow[]).length === 0 ? (
          <EmptyState message="No escrow requests are currently open." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead className="border-b border-white/[0.07] bg-navy-950/42 text-[10px] uppercase tracking-[0.18em] text-ivory-100/40">
                  <tr>
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Request</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {(recoveryCases as RecoveryCaseRow[]).slice(0, 6).map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-white/[0.035]">
                      <td className="px-5 py-4">
                        <div className="text-[13.5px] font-medium text-ivory-100">
                          {item.profiles?.full_name ?? "Client"}
                        </div>
                        <div className="mt-1 text-[12px] tabular-figures text-ivory-100/42">
                          {maskAccountNumber(item.profiles?.account_number)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-[300px] truncate text-[13.5px] text-ivory-100">
                          {item.title}
                        </div>
                        <div className="mt-1 text-[12px] capitalize text-ivory-100/46">
                          {recoveryCaseTypeLabel(item.complaint_type)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-[13.5px] font-semibold tabular-figures text-ivory-100">
                        {formatCurrency(item.amount_claimed, item.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={item.status === "recovered" ? "success" : "warning"}>
                          {formatMethod(item.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-[12px] tabular-figures text-ivory-100/50">
                        {formatDateTime(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </MotionCard>

        <MotionCard
          index={6}
          surface="none"
          className="overflow-hidden rounded-md border border-white/[0.09] bg-navy-950/62 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionHeader
            eyebrow="Private escrow"
            title="Release readiness"
            href="/admin/withdrawals"
            label="Queue"
          />
          {(escrowContracts as EscrowContractRow[]).length === 0 ? (
            <EmptyState message="No escrow contracts have been opened yet." />
          ) : (
            <MotionList className="divide-y divide-white/[0.06]">
              {(escrowContracts as EscrowContractRow[]).slice(0, 5).map((contract) => (
                <MotionRow key={contract.id} className="px-5 py-4">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-medium text-ivory-100">
                        {contract.reference}
                      </div>
                      <div className="mt-1 truncate text-[12px] text-ivory-100/46">
                        {contract.profiles?.full_name ?? "Client"} -{" "}
                        {contract.cases?.title ?? "Escrow request"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="gold">{formatMethod(contract.status)}</Badge>
                        <Badge variant={contract.release_status === "eligible" ? "success" : "warning"}>
                          {formatMethod(contract.release_status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="min-w-0 text-left text-[13px] font-semibold tabular-figures text-ivory-100 sm:text-right">
                      {formatCurrency(contract.available_for_withdrawal, contract.currency)}
                    </div>
                  </div>
                </MotionRow>
              ))}
            </MotionList>
          )}
        </MotionCard>
      </section>

      <MotionCard
        index={7}
        surface="none"
        className="overflow-hidden rounded-md border border-white/[0.09] bg-white/[0.045] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
      >
        <SectionHeader
          eyebrow="Approved funds"
          title="Provider-posted approved entries"
          href="/admin/audit-logs"
          label="Audit"
        />
        {(recoveredFunds as RecoveredFundRow[]).length === 0 ? (
          <EmptyState message="No approved funds have been posted." />
        ) : (
          <MotionList className="divide-y divide-white/[0.06]">
            {(recoveredFunds as RecoveredFundRow[]).map((entry) => (
              <MotionRow key={entry.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium text-ivory-100">
                    {entry.source ?? "Approved funds"}
                  </div>
                  <div className="mt-1 text-[12px] text-ivory-100/46">
                    {entry.profiles?.full_name ?? "Client"} - {entry.cases?.title ?? "Request"} -{" "}
                    {entry.provider_reference ?? "Provider reference pending"}
                  </div>
                </div>
                <div className="text-[12px] text-ivory-100/48">{formatDateTime(entry.created_at)}</div>
                <div className="text-right text-[14px] font-semibold tabular-figures text-ivory-100">
                  {formatCurrency(entry.amount, entry.currency)}
                </div>
              </MotionRow>
            ))}
          </MotionList>
        )}
      </MotionCard>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <MotionCard
          index={8}
          surface="none"
          className="overflow-hidden rounded-md border border-white/[0.09] bg-white/[0.045] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionHeader
            eyebrow="Payment queue"
            title="Pending withdrawal instructions"
            href="/admin/withdrawals"
            label="Open queue"
          />

          {(recentRequests as WithdrawalRow[]).length === 0 ? (
            <EmptyState message="No payment instructions are awaiting review." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-white/[0.07] bg-navy-950/42 text-[10px] uppercase tracking-[0.18em] text-ivory-100/40">
                  <tr>
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Method</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Submitted</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {(recentRequests as WithdrawalRow[]).map((request) => (
                    <tr key={request.id} className="transition-colors hover:bg-white/[0.035]">
                      <td className="px-5 py-4">
                        <div className="text-[13.5px] font-medium text-ivory-100">
                          {request.profiles?.full_name ?? "Unassigned client"}
                        </div>
                        <div className="mt-1 text-[12px] tabular-figures text-ivory-100/42">
                          {maskAccountNumber(request.profiles?.account_number)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] capitalize text-ivory-100/66">
                        {formatMethod(request.method)}
                      </td>
                      <td className="px-5 py-4 text-right text-[13.5px] font-semibold tabular-figures text-ivory-100">
                        {formatCurrency(request.amount, request.currency)}
                      </td>
                      <td className="px-5 py-4 text-[12px] tabular-figures text-ivory-100/50">
                        {formatDateTime(request.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="warning">{request.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </MotionCard>

        <MotionCard
          index={9}
          surface="none"
          className="overflow-hidden rounded-md border border-white/[0.09] bg-navy-950/62 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionHeader
            eyebrow="Document engine"
            title="Recent receipts and letters"
            href="/admin/users"
            label="Issue document"
          />
          {recentDocuments.length === 0 ? (
            <EmptyState message="No documents have been issued yet." />
          ) : (
            <MotionList className="divide-y divide-white/[0.06]">
              {recentDocuments.map((document) => (
                <MotionRow key={document.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-white/[0.08] bg-white/[0.045] text-champagne-300">
                      <FileText className="h-4 w-4" strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium text-ivory-100">
                        {document.title}
                      </div>
                      <div className="mt-1 truncate text-[12px] text-ivory-100/46">
                        {document.profiles?.full_name ?? "Client"} -{" "}
                        {DOCUMENT_TYPE_LABELS[document.type]}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-ivory-100/38">
                        <span>{formatDateTime(document.created_at)}</span>
                        <span>{maskAccountNumber(document.profiles?.account_number)}</span>
                      </div>
                    </div>
                  </div>
                </MotionRow>
              ))}
            </MotionList>
          )}
        </MotionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <MotionCard
          index={10}
          surface="none"
          className="overflow-hidden rounded-md border border-white/[0.09] bg-white/[0.045] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionHeader
            eyebrow="Beneficiary control"
            title="Payout destinations awaiting approval"
            href="/admin/beneficiaries?status=pending"
            label="Review"
          />
          {recentBeneficiaries.length === 0 ? (
            <EmptyState message="No beneficiary approvals are pending." />
          ) : (
            <MotionList className="divide-y divide-white/[0.06]">
              {recentBeneficiaries.map((beneficiary) => (
                <MotionRow key={beneficiary.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-white/[0.08] bg-white/[0.045] text-champagne-300">
                      <Landmark className="h-4 w-4" strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[13.5px] font-medium text-ivory-100">
                            {beneficiary.client_name ??
                              beneficiary.profiles?.full_name ??
                              beneficiary.submitted_by_full_name}
                          </div>
                          <div className="mt-1 truncate text-[12px] text-ivory-100/46">
                            {beneficiary.nickname} - {BENEFICIARY_RAIL_LABEL[beneficiary.rail]}
                          </div>
                        </div>
                        <Badge variant="warning">{beneficiary.currency}</Badge>
                      </div>
                      <div className="mt-2 text-[11.5px] tabular-figures text-ivory-100/42">
                        {maskAccountNumber(
                          beneficiary.client_account ?? beneficiary.profiles?.account_number,
                        )}
                      </div>
                    </div>
                  </div>
                </MotionRow>
              ))}
            </MotionList>
          )}
        </MotionCard>

        <MotionCard
          index={11}
          surface="none"
          className="overflow-hidden rounded-md border border-white/[0.09] bg-navy-950/62 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionHeader
            eyebrow="Officer activity"
            title="Live audit stream"
            href="/admin/audit-logs"
            label="Open log"
          />
          {(recentActivity as ActivityRow[]).length === 0 ? (
            <EmptyState message="No officer actions have been recorded yet." />
          ) : (
            <MotionList className="divide-y divide-white/[0.06]">
              {(recentActivity as ActivityRow[]).map((activity) => (
                <MotionRow key={activity.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-white/[0.08] bg-white/[0.045] text-champagne-300">
                    <ScrollText className="h-4 w-4" strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-medium capitalize text-ivory-100">
                      {formatMethod(activity.action_type)}
                    </div>
                    <div className="mt-1 text-[12px] leading-5 text-ivory-100/46">
                      {activity.profiles?.full_name ?? "Officer"} -{" "}
                      {formatDateTime(activity.created_at)}
                    </div>
                  </div>
                </MotionRow>
              ))}
            </MotionList>
          )}
        </MotionCard>
      </section>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-navy-950/42 p-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-100/38">
        {label}
      </div>
      <div className="mt-2 truncate text-[18px] font-semibold capitalize tabular-figures text-ivory-100">
        {value}
      </div>
    </div>
  );
}

function HealthRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm border border-white/[0.07] bg-white/[0.035] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-champagne-300" strokeWidth={1.6} />
        <span className="truncate text-[12.5px] text-ivory-100/66">{label}</span>
      </div>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ivory-100/48">
        {value}
      </span>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-champagne-300">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-[17px] font-semibold text-ivory-100">{title}</h2>
      </div>
      <Button variant="ghost" size="sm" asChild className="self-start text-ivory-100/82">
        <Link href={actionHref}>
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
  label,
}: {
  eyebrow: string;
  title: string;
  href: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-champagne-300">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-[17px] font-semibold text-ivory-100">{title}</h2>
      </div>
      <Button variant="ghost" size="sm" asChild className="self-start text-ivory-100/82">
        <Link href={href}>
          {label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  href,
  active,
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  href: string;
  active?: boolean;
  index?: number;
}) {
  return (
    <MotionCard
      index={index}
      hover
      surface="none"
      className="group rounded-md border border-white/[0.09] bg-white/[0.045] shadow-[0_20px_55px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-colors hover:bg-white/[0.065]"
    >
      <Link href={href} className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-100/42">
              {label}
            </div>
            <div className="mt-3 font-display text-3xl font-semibold tabular-figures text-ivory-100">
              {value}
            </div>
          </div>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-white/[0.08] bg-navy-950/45 text-champagne-300">
            <Icon className="h-4 w-4" strokeWidth={1.6} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-ivory-100/50">
          <span className="line-clamp-2">{detail}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>
        {active && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-sm border border-champagne-500/20 bg-champagne-500/[0.08] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-champagne-300">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne-400" />
            Attention
          </div>
        )}
      </Link>
    </MotionCard>
  );
}

function ActionTile({
  icon: Icon,
  label,
  detail,
  href,
  metric,
  index,
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
  href: string;
  metric: number;
  index: number;
}) {
  return (
    <MotionCard
      index={index}
      hover
      surface="none"
      className="rounded-sm border border-white/[0.08] bg-navy-950/38 transition-colors hover:bg-navy-900/54"
    >
      <Link href={href} className="block p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-champagne-500/24 bg-champagne-500/[0.08] text-champagne-300">
            <Icon className="h-4 w-4" strokeWidth={1.6} />
          </div>
          <Badge variant={metric > 0 ? "warning" : "muted"}>{metric}</Badge>
        </div>
        <div className="mt-4 text-[14px] font-semibold text-ivory-100">{label}</div>
        <p className="mt-1 text-[12.5px] leading-5 text-ivory-100/52">{detail}</p>
      </Link>
    </MotionCard>
  );
}

function CustodyBar({
  currency,
  value,
  pending,
  max,
}: {
  currency: string;
  value: number;
  pending: number;
  max: number;
}) {
  const width = `${Math.max(7, Math.round((value / max) * 100))}%`;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-100/42">
            {currency} custody
          </div>
          <div className="mt-1 text-[15px] font-semibold tabular-figures text-ivory-100">
            {formatCurrency(value, currency, {
              notation: "compact",
              maximumFractionDigits: 1,
              minimumFractionDigits: 0,
            })}
          </div>
        </div>
        <div className="text-right text-[11.5px] text-ivory-100/46">
          Pending
          <div className="tabular-figures text-ivory-100/68">
            {formatCurrency(pending, currency, {
              notation: "compact",
              maximumFractionDigits: 1,
              minimumFractionDigits: 0,
            })}
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-champagne-500 to-emerald-300/80"
          style={{ width }}
        />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-[220px] place-items-center px-6 py-12 text-center">
      <div>
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-sm border border-white/[0.08] bg-white/[0.04] text-champagne-300">
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div className="mt-3 text-[13px] text-ivory-100/56">{message}</div>
      </div>
    </div>
  );
}

function formatMethod(value: string) {
  return value.replace(/_/g, " ");
}

function recoveryCaseTypeLabel(value: string) {
  return RECOVERY_CASE_TYPE_LABELS[value as RecoveryCaseType] ?? formatMethod(value);
}
