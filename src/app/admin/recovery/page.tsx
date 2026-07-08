import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  FolderOpen,
  LockKeyhole,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  EscrowContractControl,
  EscrowWithdrawalControl,
  RecoveryCaseControl,
} from "@/components/admin/recovery-control-forms";
import { requireAdmin } from "@/lib/auth";
import {
  adminEscrowContracts,
  adminRecoveredFunds,
  adminRecoveryCases,
  adminRecoveryMetrics,
  adminWithdrawalQueue,
} from "@/lib/portal/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Recovery Command" };

export default async function AdminRecoveryPage() {
  const admin = await requireAdmin();
  const [metrics, recoveryCases, escrowContracts, recoveredFunds, withdrawals] =
    await Promise.all([
      adminRecoveryMetrics(),
      adminRecoveryCases(),
      adminEscrowContracts(),
      adminRecoveredFunds(10),
      adminWithdrawalQueue("all"),
    ]);

  const escrowWithdrawals = (withdrawals as any[]).filter((row) => row.escrow_contract_id);
  const canOperateFunds =
    admin.profile.role === "super_admin" || admin.profile.role === "finance_admin";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recovery command"
        title="Escrow recovery operations."
        description="Admin-controlled workflow for investigation cases, private escrow accounts, recovered funds, release readiness, fee verification, and payout status."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin">
                Operations overview
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/withdrawals">Withdrawal queue</Link>
            </Button>
          </>
        }
      />

      {!canOperateFunds && (
        <div className="rounded-md border border-warning/25 bg-warning/10 p-4 text-[13px] leading-6 text-warning">
          Your admin role can review recovery activity, but finance controls are reserved for
          finance administrators and super administrators.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={FolderOpen} label="Open cases" value={metrics.openCases} />
        <MetricCard icon={ShieldCheck} label="Recovered cases" value={metrics.recoveredCases} />
        <MetricCard icon={LockKeyhole} label="Active escrows" value={metrics.activeEscrows} />
        <MetricCard icon={Banknote} label="Release eligible" value={metrics.releaseEligible} />
        <MetricCard
          icon={Banknote}
          label="Recovered total"
          value={formatCurrency(metrics.totalRecovered, "USD", {
            notation: "compact",
            maximumFractionDigits: 1,
            minimumFractionDigits: 0,
          })}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Panel
          eyebrow="Investigation intake"
          title="Case control"
          detail="Admins can accept, review, assign, recover, reject, or close recovery files."
        >
          {(recoveryCases as any[]).length === 0 ? (
            <EmptyState message="No recovery cases have been filed yet." />
          ) : (
            <div className="space-y-4">
              {(recoveryCases as any[]).slice(0, 10).map((item) => (
                <RecoveryCaseControl key={item.id} recoveryCase={item} />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          eyebrow="Private escrow"
          title="Escrow and recovered funds"
          detail="Admins can post recovered funds, mark release readiness, and update provider references."
        >
          {(escrowContracts as any[]).length === 0 ? (
            <EmptyState message="No private escrow accounts have been opened yet." />
          ) : (
            <div className="space-y-4">
              {(escrowContracts as any[]).slice(0, 10).map((contract) => (
                <EscrowContractControl key={contract.id} contract={contract} />
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Panel
          eyebrow="Release requests"
          title="Fee verification and payout progress"
          detail="Payout processing remains locked until release processing fee verification is complete."
        >
          {escrowWithdrawals.length === 0 ? (
            <EmptyState message="No escrow release requests have been submitted." />
          ) : (
            <div className="space-y-4">
              {escrowWithdrawals.slice(0, 12).map((request) => (
                <EscrowWithdrawalControl key={request.id} request={request} />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          eyebrow="Recovered funds ledger"
          title="Latest provider records"
          detail="Client balances come from recovered funds entries and escrow contract records only."
        >
          {(recoveredFunds as any[]).length === 0 ? (
            <EmptyState message="No recovered funds have been posted." />
          ) : (
            <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-md border border-white/[0.08]">
              {(recoveredFunds as any[]).map((entry) => (
                <li key={entry.id} className="bg-white/[0.035] px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-medium text-ivory-100">
                        {entry.source ?? "Recovered funds"}
                      </div>
                      <div className="mt-1 text-[12px] text-ivory-100/48">
                        {entry.profiles?.full_name ?? "Client"} -{" "}
                        {entry.provider_reference ?? "Provider reference pending"}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ivory-100/36">
                        {formatDateTime(entry.created_at)}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-[14px] font-semibold tabular-figures text-ivory-100">
                      {formatCurrency(entry.amount, entry.currency)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>

      <section className="rounded-md border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-champagne-300">
              Control guarantee
            </div>
            <h2 className="mt-1 text-[18px] font-semibold text-ivory-100">
              Users can open escrow only after case and KYC approval.
            </h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-6 text-ivory-100/56">
              Users may file cases, upload KYC, create the private escrow account when eligible,
              and submit release requests. Admins and provider-side backend records control
              recovered funds, release eligibility, fee verification, payout status, disputes,
              and audit history.
            </p>
          </div>
          <Badge variant="success" className="self-start">Admin controlled</Badge>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.045] p-4 shadow-[0_20px_55px_-42px_rgba(0,0,0,0.9)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-100/42">
            {label}
          </div>
          <div className="mt-3 truncate font-display text-2xl font-semibold tabular-figures text-ivory-100">
            {value}
          </div>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-champagne-500/24 bg-champagne-500/[0.08] text-champagne-300">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </div>
      </div>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  detail,
  children,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-white/[0.08] bg-white/[0.045] p-5 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)]">
      <div className="mb-5">
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-champagne-300">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-[18px] font-semibold text-ivory-100">{title}</h2>
        <p className="mt-2 text-[13px] leading-5 text-ivory-100/54">{detail}</p>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-[180px] place-items-center rounded-md border border-white/[0.08] bg-white/[0.035] px-5 py-10 text-center">
      <div>
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-sm border border-white/[0.08] bg-white/[0.04] text-champagne-300">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div className="mt-3 text-[13px] text-ivory-100/56">{message}</div>
      </div>
    </div>
  );
}
