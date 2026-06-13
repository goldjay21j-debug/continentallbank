import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  FileCheck2,
  FolderOpen,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { MotionCard } from "@/components/motion/motion-card";
import { MotionList, MotionRow } from "@/components/motion/motion-list";
import { requireAdmin } from "@/lib/auth";
import {
  adminEscrowContracts,
  adminRecoveredFunds,
  adminRecoveryCases,
  adminRecoveryMetrics,
} from "@/lib/demo/queries";
import { formatCurrency, formatDateTime, maskAccountNumber } from "@/lib/utils";

export const metadata = { title: "Recovery & Escrow — Admin" };

export default async function AdminRecoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const [metrics, cases, contracts, recoveredFunds] = await Promise.all([
    adminRecoveryMetrics(),
    adminRecoveryCases(status),
    adminEscrowContracts(),
    adminRecoveredFunds(20),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Recovery & escrow"
        title="Escrow administration dashboard."
        description="Admin-only view for recovery cases, private escrow contracts, recovered funds, release eligibility, and provider-controlled payout readiness."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/withdrawals">
              Release queue
              <ArrowDownLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat icon={FolderOpen} label="Open cases" value={metrics.openCases} />
        <Stat icon={FileCheck2} label="Recovered" value={metrics.recoveredCases} tone="success" />
        <Stat icon={Landmark} label="Active escrows" value={metrics.activeEscrows} />
        <Stat icon={WalletCards} label="Release eligible" value={metrics.releaseEligible} tone="warning" />
        <Stat
          icon={ShieldCheck}
          label="Recovered funds"
          value={formatCurrency(metrics.totalRecovered, "USD", {
            notation: "compact",
            maximumFractionDigits: 1,
            minimumFractionDigits: 0,
          })}
          tone="success"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
        <MotionCard
          index={0}
          surface="none"
          className="overflow-hidden rounded-md border border-white/[0.09] bg-white/[0.045] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionHeader
            eyebrow="Recovery queue"
            title="Client cases"
            actionHref="/admin/recovery"
            actionLabel="All"
          />
          {(cases as any[]).length === 0 ? (
            <EmptyState message="No recovery cases match this filter." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="border-b border-white/[0.07] bg-navy-950/42 text-[10px] uppercase tracking-[0.18em] text-ivory-100/40">
                  <tr>
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Case</th>
                    <th className="px-5 py-3 text-right font-medium">Claimed</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {(cases as any[]).map((item) => (
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
                          {formatStatus(item.complaint_type)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-[13.5px] font-semibold tabular-figures text-ivory-100">
                        {formatCurrency(item.amount_claimed, item.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={item.status === "recovered" ? "success" : "warning"}>
                          {formatStatus(item.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ivory-100/48">
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
          index={1}
          surface="none"
          className="overflow-hidden rounded-md border border-white/[0.09] bg-navy-950/62 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <SectionHeader
            eyebrow="Escrow contracts"
            title="Release readiness"
            actionHref="/admin/withdrawals"
            actionLabel="Withdrawals"
          />
          {(contracts as any[]).length === 0 ? (
            <EmptyState message="No escrow contracts have been opened yet." />
          ) : (
            <MotionList className="divide-y divide-white/[0.06]">
              {(contracts as any[]).slice(0, 8).map((contract) => (
                <MotionRow key={contract.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-medium text-ivory-100">
                        {contract.reference}
                      </div>
                      <div className="mt-1 truncate text-[12px] text-ivory-100/46">
                        {contract.profiles?.full_name ?? "Client"} - {contract.cases?.title ?? "Recovery case"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="gold">{formatStatus(contract.status)}</Badge>
                        <Badge variant={contract.release_status === "eligible" ? "success" : "warning"}>
                          {formatStatus(contract.release_status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-[13px] font-semibold tabular-figures text-ivory-100">
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
        index={2}
        surface="none"
        className="overflow-hidden rounded-md border border-white/[0.09] bg-white/[0.045] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-xl"
      >
        <SectionHeader
          eyebrow="Recovered funds"
          title="Provider-posted entries"
          actionHref="/admin/audit-logs"
          actionLabel="Audit"
        />
        {(recoveredFunds as any[]).length === 0 ? (
          <EmptyState message="No recovered funds have been posted." />
        ) : (
          <MotionList className="divide-y divide-white/[0.06]">
            {(recoveredFunds as any[]).map((entry) => (
              <MotionRow key={entry.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium text-ivory-100">
                    {entry.source ?? "Recovered funds"}
                  </div>
                  <div className="mt-1 text-[12px] text-ivory-100/46">
                    {entry.profiles?.full_name ?? "Client"} - {entry.cases?.title ?? "Case"} -{" "}
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
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof FolderOpen;
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-300"
      : tone === "warning"
        ? "text-amber-300"
        : "text-ivory-100";

  return (
    <MotionCard
      surface="none"
      className="rounded-md border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_20px_55px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-100/42">
            {label}
          </div>
          <div className={`mt-3 font-display text-3xl font-semibold tabular-figures ${toneClass}`}>
            {value}
          </div>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-white/[0.08] bg-navy-950/45 text-champagne-300">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </div>
      </div>
    </MotionCard>
  );
}

function SectionHeader({
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
    <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-[180px] place-items-center px-6 py-12 text-center text-[13px] text-ivory-100/56">
      {message}
    </div>
  );
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}
