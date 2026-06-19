import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FolderOpen,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecoveryCaseForm } from "@/components/dashboard/recovery-case-form";
import { EscrowCreateButton } from "@/components/dashboard/escrow-create-button";
import { MotionCard } from "@/components/motion/motion-card";
import { MotionList, MotionRow } from "@/components/motion/motion-list";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { requireApprovedClient } from "@/lib/auth";
import { KYC_STATUS, type Currency } from "@/lib/constants";
import { calculateReleaseFee, isRecoveryVerified } from "@/lib/demo/recovery";
import { clientEscrowOverview } from "@/lib/demo/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Escrow Dashboard" };

export default async function EscrowDashboardPage() {
  const user = await requireApprovedClient();
  const overview = await clientEscrowOverview(user.id, user.profile);
  const contract = overview.escrowContract;
  const primaryCase = overview.primaryCase;
  const verified = isRecoveryVerified(user.profile);
  const currency = (contract?.currency ?? primaryCase?.currency ?? user.profile.preferred_currency) as Currency;
  const available = Number(contract?.available_for_withdrawal ?? 0);
  const releaseQuote = calculateReleaseFee(available);

  if (overview.accessState.key !== "ready" || !contract || !primaryCase) {
    return (
      <div className="space-y-6">
        <section className="grid gap-5 xl:grid-cols-[1fr_0.82fr]">
          <MotionCard
            index={0}
            intensity="strong"
            className="overflow-hidden border border-slate-200 bg-white"
          >
            <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
              <div className="p-6 sm:p-8">
                <div className="eyebrow text-champagne-700">Private escrow control</div>
                <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  {overview.accessState.title}
                </h1>
                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
                  {overview.accessState.description} Your release desk remains locked until the
                  recovery case, identity review, and escrow account setup are all cleared by an
                  officer.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <GateStep
                    icon={FolderOpen}
                    label="Recovery case"
                    description="Complaint and evidence logged"
                    complete={Boolean(primaryCase)}
                  />
                  <GateStep
                    icon={ShieldCheck}
                    label="Identity review"
                    description={KYC_STATUS[user.profile.kyc_status]}
                    complete={verified}
                  />
                  <GateStep
                    icon={LockKeyhole}
                    label="Escrow access"
                    description="Private account activated"
                    complete={Boolean(contract)}
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 bg-[#0B1722] p-6 text-ivory-100 lg:border-l lg:border-t-0">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-champagne-300/22 bg-white/[0.07]">
                      <WalletCards className="h-5 w-5 text-champagne-300" strokeWidth={1.6} />
                    </div>
                    <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-champagne-300">
                      Current gate
                    </div>
                    <div className="mt-2 font-display text-2xl font-semibold">
                      Controlled release only
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-ivory-100/70">
                      Funds movement, document requests, provider references, and approval notes
                      remain audit-logged throughout the recovery process.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {overview.accessState.key === "identity_required" && (
                      <Button asChild className="w-full">
                        <Link href="/dashboard/profile">
                          Upload KYC document
                          <FileCheck2 className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {overview.accessState.key === "escrow_required" && <EscrowCreateButton />}
                    {overview.accessState.key === "case_required" && (
                      <Button asChild className="w-full">
                        <Link href="#recovery-intake">
                          Start recovery case
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-white/[0.12] bg-white/[0.04] text-ivory-100 hover:bg-white/[0.08] hover:text-ivory-100"
                    >
                      <Link href="/dashboard/messages">Message banker</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </MotionCard>

          <MotionCard index={1} className="p-5 sm:p-6">
            <div className="eyebrow text-champagne-700">Security assurance</div>
            <h2 className="mt-2 font-display text-xl font-semibold text-slate-950">
              Officer-reviewed escrow access
            </h2>
            <div className="mt-5 space-y-3">
              <AssuranceRow label="Browser session" value="HTTPS/TLS protected" />
              <AssuranceRow label="Account changes" value="Audit logged" />
              <AssuranceRow label="Fund release" value="No automatic settlement" />
              <AssuranceRow label="KYC status" value={KYC_STATUS[user.profile.kyc_status]} />
            </div>
          </MotionCard>
        </section>

        <TrustBadgeRail preset="dashboard" tone="light" compact />

        <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <MotionCard index={2} className="p-5 sm:p-6">
            <div className="eyebrow text-champagne-700">Access checklist</div>
            <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">
              Required before escrow opens.
            </h2>
            <div className="mt-6 space-y-3">
              <GateRow icon={FolderOpen} label="Recovery case" complete={Boolean(primaryCase)} />
              <GateRow icon={ShieldCheck} label="KYC verification" complete={verified} />
              <GateRow icon={LockKeyhole} label="Private escrow account" complete={Boolean(contract)} />
            </div>
          </MotionCard>

          {overview.accessState.key === "case_required" ? (
            <MotionCard id="recovery-intake" index={3} className="p-5 sm:p-6 lg:p-7">
              <RecoveryCaseForm defaultCurrency={user.profile.preferred_currency as Currency} />
            </MotionCard>
          ) : (
            <MotionCard index={3} className="p-5 sm:p-6">
              <div className="eyebrow text-champagne-700">Verification status</div>
              <h2 className="mt-2 font-display text-xl font-semibold text-slate-950">
                {verified ? "Identity approved." : "KYC still required."}
              </h2>
              <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Current KYC status
                </div>
                <div className="mt-1.5 text-[14px] font-semibold text-slate-950">
                  {KYC_STATUS[user.profile.kyc_status]}
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-6 text-slate-600">
                Escrow remains locked until officers verify identity and account ownership. This
                prevents recovered funds from being released to an unverified destination.
              </p>
            </MotionCard>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Private escrow"
        title="Escrow dashboard."
        description="Recovered funds, provider references, release controls, disputes, and fee verification status for your active recovery case."
        actions={
          <Button asChild>
            <Link href="/dashboard/withdraw">
              Request release
              <ArrowDownLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <TrustBadgeRail preset="dashboard" tone="light" compact />

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <MotionCard index={0} intensity="strong" className="overflow-hidden border border-[#E3D8C5]">
          <div className="border-b border-[#E3D8C5] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="eyebrow text-champagne-700">Escrow contract</div>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                  {contract.reference}
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Linked to {primaryCase.title}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">{formatStatus(contract.status)}</Badge>
                <Badge variant={contract.release_status === "eligible" ? "success" : "warning"}>
                  {formatStatus(contract.release_status)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-7 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
            <EscrowMetric label="Total recovered" value={formatCurrency(contract.total_recovered, currency)} />
            <EscrowMetric label="Available release" value={formatCurrency(available, currency)} />
            <EscrowMetric label="Release fee" value={formatCurrency(releaseQuote.releaseProcessingFee, currency)} />
            <EscrowMetric label="Estimated net" value={formatCurrency(releaseQuote.netAmount, currency)} strong />
          </div>
        </MotionCard>

        <MotionCard index={1} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                Provider controls
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
                Security rules
              </h2>
            </div>
            <Landmark className="h-5 w-5 text-champagne-600" strokeWidth={1.5} />
          </div>
          <div className="mt-6 space-y-3">
            <ControlRow label="Provider reference" value={contract.provider_reference ?? "Pending"} />
            <ControlRow label="Release conditions" value={contract.release_conditions_open ? "Open" : "Satisfied"} />
            <ControlRow label="Fee verification" value="Required before payout" />
            <ControlRow label="Funds authority" value="Admin/provider only" />
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <MotionCard index={2} className="overflow-hidden">
          <SectionHeader title="Recovered funds ledger" eyebrow="Escrow entries" />
          <MotionList className="divide-y divide-foreground/[0.05]">
            {overview.recoveredFunds.map((entry) => (
              <MotionRow key={entry.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-foreground">
                      {entry.source ?? "Recovered funds"}
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {entry.provider_reference ?? "Provider reference pending"} -{" "}
                      {formatDateTime(entry.created_at)}
                    </div>
                    {entry.note && (
                      <p className="mt-2 text-[12.5px] leading-5 text-muted-foreground">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[14px] font-semibold tabular-figures text-foreground">
                    {formatCurrency(entry.amount, entry.currency)}
                  </div>
                </div>
              </MotionRow>
            ))}
          </MotionList>
        </MotionCard>

        <MotionCard index={3} className="overflow-hidden">
          <SectionHeader title="Disputes and holds" eyebrow="Case controls" />
          {overview.activeDisputes.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">
              <CheckCircle2 className="mx-auto mb-3 h-5 w-5 text-success" />
              No active disputes or release holds are open.
            </div>
          ) : (
            <MotionList className="divide-y divide-foreground/[0.05]">
              {overview.activeDisputes.map((dispute) => (
                <MotionRow key={dispute.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[14px] font-medium text-foreground">{dispute.title}</div>
                      <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">
                        {dispute.description}
                      </p>
                    </div>
                    <Badge variant="warning">{formatStatus(dispute.status)}</Badge>
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

function GateRow({
  icon: Icon,
  label,
  complete,
}: {
  icon: typeof ShieldCheck;
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-foreground/[0.06] bg-foreground/[0.025] px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-champagne-600" strokeWidth={1.6} />
        <span className="text-[13px] font-medium text-foreground">{label}</span>
      </div>
      <Badge variant={complete ? "success" : "warning"}>{complete ? "Done" : "Required"}</Badge>
    </div>
  );
}

function GateStep({
  icon: Icon,
  label,
  description,
  complete,
}: {
  icon: typeof ShieldCheck;
  label: string;
  description: string;
  complete: boolean;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <Icon className="h-4 w-4 text-champagne-700" strokeWidth={1.6} />
        <Badge variant={complete ? "success" : "warning"}>{complete ? "Cleared" : "Required"}</Badge>
      </div>
      <div className="mt-4 text-[13px] font-semibold text-slate-950">{label}</div>
      <div className="mt-1 text-[12px] leading-5 text-slate-500">{description}</div>
    </div>
  );
}

function AssuranceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <span className="max-w-[52%] text-right text-[13px] font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function EscrowMetric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border border-[#E3D8C5] bg-white p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={strong ? "mt-2 font-display text-2xl font-semibold tabular-figures text-foreground" : "mt-2 text-[16px] font-semibold tabular-figures text-foreground"}>
        {value}
      </div>
    </div>
  );
}

function ControlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-foreground/[0.06] pb-3 last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className="max-w-[55%] text-right text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b border-foreground/[0.06] px-6 py-4">
      <div className="eyebrow text-champagne-700 dark:text-champagne-400">{eyebrow}</div>
      <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}
