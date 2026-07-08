import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FolderOpen,
  Landmark,
  LockKeyhole,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecoveryCaseForm } from "@/components/dashboard/recovery-case-form";
import { EscrowCreateButton } from "@/components/dashboard/escrow-create-button";
import { ActivityTicker } from "@/components/shared/activity-ticker";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { MotionCard } from "@/components/motion/motion-card";
import { MotionList, MotionRow } from "@/components/motion/motion-list";
import { requireApprovedClient } from "@/lib/auth";
import {
  ACCOUNT_STATUS,
  KYC_STATUS,
  RECOVERY_CASE_TYPE_LABELS,
  type Currency,
  type RecoveryCaseType,
} from "@/lib/constants";
import { calculateReleaseFee, isRecoveryVerified } from "@/lib/portal/recovery";
import {
  clientEscrowOverview,
  clientPendingWithdrawals,
} from "@/lib/portal/queries";
import { formatAccountNumber, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { WithdrawalRequest } from "@/lib/types/database";

export default async function DashboardOverviewPage() {
  const user = await requireApprovedClient();
  const [overview, pendingWithdrawals] = await Promise.all([
    clientEscrowOverview(user.id, user.profile),
    clientPendingWithdrawals(user.id),
  ]);

  const primaryCase = overview.primaryCase;
  const escrowContract = overview.escrowContract;
  const recoveredTotal = overview.recoveredFunds.reduce(
    (sum, entry) => sum + Number(entry.amount ?? 0),
    0,
  );
  const availableForRelease = Number(escrowContract?.available_for_withdrawal ?? 0);
  const releaseQuote = calculateReleaseFee(availableForRelease);
  const verified = isRecoveryVerified(user.profile);
  const currency = (escrowContract?.currency ?? primaryCase?.currency ?? user.profile.preferred_currency) as Currency;
  const pending = pendingWithdrawals as WithdrawalRequest[];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Fraud recovery office - ${user.profile.full_name.split(" ")[0]}`}
        title="Stolen-funds recovery center."
        description="A controlled path for scam investigation, evidence review, KYC approval, private escrow activation, and eligible release requests."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/escrow">Escrow dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/withdraw">
                Request release
                <ArrowDownLeft className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <TrustBadgeRail preset="dashboard" tone="light" compact />
      <ActivityTicker preset="client" tone="light" label="Recovery activity" compact />

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.85fr]">
        <MotionCard index={0} intensity="strong" className="overflow-hidden border border-[#E3D8C5]">
          <div className="border-b border-[#E3D8C5] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="eyebrow text-champagne-700">Recovery relationship</div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {user.profile.full_name}
                  </h2>
                  <Badge variant={user.profile.account_status === "approved" ? "success" : "warning"}>
                    {ACCOUNT_STATUS[user.profile.account_status]}
                  </Badge>
                  <Badge variant={verified ? "success" : "warning"}>
                    {verified ? "Verified" : KYC_STATUS[user.profile.kyc_status]}
                  </Badge>
                </div>
                <div className="mt-1 text-[12px] uppercase tracking-[0.18em] text-muted-foreground tabular-figures">
                  {formatAccountNumber(user.profile.account_number)}
                </div>
              </div>
              <div className="rounded-md border border-[#E3D8C5] bg-ivory-50 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Escrow access
                </div>
                <div className="mt-1 text-[13px] font-medium capitalize text-foreground">
                  {user.profile.escrow_account_status.replace("_", " ")}
                </div>
                <div className="mt-1 text-[11px] tabular-figures text-muted-foreground">
                  {user.profile.escrow_account_reference ?? "Pending private reference"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Current gate
              </div>
              <h3 className="mt-2 font-display text-[clamp(2rem,4vw,3.65rem)] leading-none text-foreground">
                {overview.accessState.title}
              </h3>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                {overview.accessState.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {overview.accessState.key === "case_required" && (
                  <Button asChild>
                    <Link href="#recovery-intake">
                      File investigation
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {overview.accessState.key === "identity_required" && (
                  <Button asChild>
                    <Link href="/dashboard/profile">
                      Upload KYC
                      <FileCheck2 className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {overview.accessState.key === "escrow_required" && <EscrowCreateButton />}
                {overview.accessState.key === "ready" && (
                  <>
                    <Button asChild>
                      <Link href="/dashboard/escrow">
                        Open escrow
                        <LockKeyhole className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/withdraw">Review release options</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-md border border-[#E3D8C5] bg-ivory-50 p-4">
              <div className="eyebrow text-champagne-700">Escrow readiness</div>
              <div className="mt-4 space-y-3">
                <ReadinessRow
                  icon={FolderOpen}
                  label="Investigation case"
                  value={primaryCase ? formatStatus(primaryCase.status) : "Not started"}
                  complete={Boolean(primaryCase)}
                />
                <ReadinessRow
                  icon={ShieldCheck}
                  label="KYC verification"
                  value={verified ? "Approved" : KYC_STATUS[user.profile.kyc_status]}
                  complete={verified}
                />
                <ReadinessRow
                  icon={LockKeyhole}
                  label="Private escrow"
                  value={escrowContract ? formatStatus(escrowContract.status) : "Not opened"}
                  complete={Boolean(escrowContract)}
                />
                <ReadinessRow
                  icon={WalletCards}
                  label="Release eligibility"
                  value={escrowContract ? formatStatus(escrowContract.release_status) : "Not eligible"}
                  complete={overview.withdrawalEligibility}
                />
              </div>
            </div>
          </div>
        </MotionCard>

        <MotionCard index={1} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">Private escrow</div>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
                Release position
              </h2>
            </div>
            <Landmark className="h-5 w-5 text-champagne-600" strokeWidth={1.5} />
          </div>

          <div className="mt-5 space-y-3">
            <PositionRow label="Recovered funds" value={formatCurrency(recoveredTotal, currency)} />
            <PositionRow label="Eligible balance" value={formatCurrency(availableForRelease, currency)} />
            <PositionRow label="Processing fee - 20%" value={formatCurrency(releaseQuote.releaseProcessingFee, currency)} />
            <PositionRow label="Estimated net release" value={formatCurrency(releaseQuote.netAmount, currency)} strong />
          </div>
          <div className="mt-5 rounded-md border border-foreground/[0.06] bg-foreground/[0.025] px-4 py-3 text-[12.5px] leading-5 text-muted-foreground">
            Users request releases only. Fee verification, status changes, provider reference,
            recovered funds, and payout completion remain officer/provider controlled.
          </div>
        </MotionCard>
      </section>

      {!primaryCase ? (
        <section id="recovery-intake" className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <MotionCard index={2} className="p-5 lg:p-6">
            <RecoveryCaseForm defaultCurrency={user.profile.preferred_currency as Currency} />
          </MotionCard>
          <MotionCard index={3} className="p-6">
            <div className="eyebrow text-champagne-700 dark:text-champagne-400">
              What happens next
            </div>
            <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
              Recovery-first access model
            </h3>
            <div className="mt-5 space-y-3">
              <ProcessStep label="1" title="Case recorded" body="A scam or stolen-funds report is created and assigned for officer review." />
              <ProcessStep label="2" title="Evidence requested" body="The recovery desk requests receipts, wallet records, communications, provider references, and timelines." />
              <ProcessStep label="3" title="KYC approved" body="Identity, address, and ownership records are checked before private escrow access." />
              <ProcessStep label="4" title="Escrow opened" body="Any recovered funds are controlled through private escrow and release eligibility rules." />
            </div>
          </MotionCard>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <MotionCard index={2} className="overflow-hidden">
            <div className="border-b border-foreground/[0.06] px-6 py-4">
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">Active recovery case</div>
              <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                {primaryCase.title}
              </h3>
            </div>
            <div className="space-y-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={primaryCase.status === "recovered" ? "success" : "warning"}>
                  {formatStatus(primaryCase.status)}
                </Badge>
                <Badge variant="gold">{recoveryCaseTypeLabel(primaryCase.complaint_type)}</Badge>
                <span className="text-[12px] text-muted-foreground">
                  Opened {formatDate(primaryCase.created_at)}
                </span>
              </div>
              <p className="text-[13px] leading-6 text-muted-foreground">{primaryCase.summary}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Control label="Amount claimed" value={formatCurrency(primaryCase.amount_claimed, primaryCase.currency)} />
                <Control label="Provider ref" value={primaryCase.provider_reference ?? "Pending assignment"} />
                <Control label="Counterparty" value={primaryCase.counterparty_name ?? "Not listed"} />
                <Control label="Evidence" value={primaryCase.evidence_summary ? "Package summarized" : "Requested"} />
              </div>
            </div>
          </MotionCard>

          <MotionCard index={3} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-foreground/[0.06] px-6 py-4">
              <div>
                <div className="eyebrow text-champagne-700 dark:text-champagne-400">Recovered funds</div>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                  Escrow ledger entries
                </h3>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/escrow">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            {overview.recoveredFunds.length === 0 ? (
              <EmptyState message="No recovered funds have been posted to escrow yet." />
            ) : (
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
                      </div>
                      <div className="text-right text-[14px] font-semibold tabular-figures text-foreground">
                        {formatCurrency(entry.amount, entry.currency)}
                      </div>
                    </div>
                  </MotionRow>
                ))}
              </MotionList>
            )}
          </MotionCard>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <MotionCard index={4} className="p-6">
          <div className="eyebrow text-champagne-700 dark:text-champagne-400">
            Pending release instructions
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
            Officer/provider review queue
          </h3>
          {pending.length === 0 ? (
              <div className="mt-5 rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-5 text-center text-[13px] text-muted-foreground">
              <ShieldCheck className="mx-auto mb-3 h-5 w-5 text-champagne-600" />
              No pending release or withdrawal requests.
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {pending.slice(0, 3).map((request) => (
                <li key={request.id} className="rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium tabular-figures text-foreground">
                        {formatCurrency(request.amount, request.currency)}
                      </div>
                      <div className="mt-0.5 truncate text-[12px] capitalize text-muted-foreground">
                        {request.method.replace(/_/g, " ")} - {formatDate(request.created_at)}
                      </div>
                    </div>
                    <Badge variant={request.status === "approved" ? "gold" : "warning"} className="shrink-0 capitalize">
                      {formatStatus(request.status)}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </MotionCard>

        <MotionCard index={5} className="p-6">
          <div className="eyebrow text-champagne-700 dark:text-champagne-400">Controls</div>
          <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
            Security posture
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Control label="Funds movement" value="Admin/provider controlled" />
            <Control label="Release fee" value="20% calculated server-side" />
            <Control label="KYC gate" value={verified ? "Verified" : "Required"} />
            <Control label="Investigation trail" value="Status changes recorded" />
          </div>
        </MotionCard>
      </section>
    </div>
  );
}

function ReadinessRow({
  icon: Icon,
  label,
  value,
  complete,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[#E3D8C5] bg-white px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-foreground/[0.08] bg-foreground/[0.035]">
          <Icon className="h-4 w-4 text-champagne-600" strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">{label}</div>
          <div className="truncate text-[11.5px] text-muted-foreground">{value}</div>
        </div>
      </div>
      {complete ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <Clock3 className="h-4 w-4 shrink-0 text-warning" />
      )}
    </div>
  );
}

function PositionRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-foreground/[0.06] pb-3 last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className={strong ? "font-display text-xl font-semibold tabular-figures text-foreground" : "text-[14px] font-medium tabular-figures text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function ProcessStep({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-sm border border-champagne-500/24 bg-champagne-500/10 text-[12px] font-semibold text-champagne-700">
        {label}
      </div>
      <div>
        <div className="text-[14px] font-semibold text-foreground">{title}</div>
        <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function Control({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-[13px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">
      <Scale className="mx-auto mb-3 h-5 w-5 text-champagne-600" />
      {message}
    </div>
  );
}

function recoveryCaseTypeLabel(value: string) {
  return RECOVERY_CASE_TYPE_LABELS[value as RecoveryCaseType] ?? formatStatus(value);
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}
