import Link from "next/link";
import { ArrowRight, Building2, CreditCard, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { EscrowCreateButton } from "@/components/dashboard/escrow-create-button";
import { MotionCard } from "@/components/motion/motion-card";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { requireApprovedClient } from "@/lib/auth";
import { calculateReleaseFee } from "@/lib/portal/recovery";
import { clientEscrowOverview } from "@/lib/portal/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Release Request" };

const methods = [
  {
    id: "bank",
    title: "Bank transfer",
    body: "Officer-reviewed wire, ACH, SEPA, IBAN, or Faster Payments release.",
    icon: Building2,
  },
  {
    id: "card",
    title: "Card payout review",
    body: "Request a card-based provider review using cardholder and last-four details only.",
    icon: CreditCard,
  },
  {
    id: "paypal",
    title: "PayPal release",
    body: "Submit a verified PayPal email for provider-side fee and recipient checks.",
    icon: Mail,
  },
] as const;

export default async function WithdrawPage() {
  const user = await requireApprovedClient();
  const overview = await clientEscrowOverview(user.id, user.profile);
  const contract = overview.escrowContract;
  const available = Number(contract?.available_for_withdrawal ?? 0);
  const quote = calculateReleaseFee(available);

  if (!overview.withdrawalEligibility || !contract || !overview.primaryCase) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Release request"
          title="Withdrawal is not eligible yet."
          description={overview.accessState.description}
        />
        <TrustBadgeRail preset="withdrawals" tone="light" compact />
        <MotionCard className="p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                Current gate
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                {overview.accessState.title}
              </h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted-foreground">
                Release requests unlock only after a recovery case exists, KYC is approved, escrow
                is active, and provider release conditions are marked eligible.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {overview.accessState.key === "escrow_required" && <EscrowCreateButton />}
              {overview.accessState.key === "identity_required" && (
                <Button asChild>
                  <Link href="/dashboard/profile">Upload KYC</Link>
                </Button>
              )}
              {overview.accessState.key === "case_required" && (
                <Button asChild>
                  <Link href="/dashboard">Start recovery case</Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/dashboard/escrow">Open escrow dashboard</Link>
              </Button>
            </div>
          </div>
        </MotionCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Release request"
        title="Choose payout method."
        description="Submit a release request for officer and provider fee verification. Funds remain in escrow until all release controls are complete."
      />

      <TrustBadgeRail preset="withdrawals" tone="light" compact />

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <MotionCard index={0} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                Eligible escrow balance
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold tabular-figures text-foreground">
                {formatCurrency(available, contract.currency)}
              </h2>
            </div>
            <Badge variant="success">Eligible</Badge>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Quote label="Release amount" value={formatCurrency(quote.amount, contract.currency)} />
            <Quote label="Processing fee" value={formatCurrency(quote.releaseProcessingFee, contract.currency)} />
            <Quote label="Estimated net" value={formatCurrency(quote.netAmount, contract.currency)} strong />
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3 text-[12.5px] leading-5 text-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne-700" />
            <p>
              The 20% release processing fee is calculated by the server and reviewed by the
              provider. The client cannot edit fee, net amount, or payout status.
            </p>
          </div>
        </MotionCard>

        <div className="grid gap-4">
          {methods.map((method, index) => {
            const Icon = method.icon;
            return (
              <MotionCard key={method.id} index={index + 1} hover className="p-5">
                <Link
                  href={`/dashboard/withdraw/${method.id}?amount=${available}&currency=${contract.currency}`}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex min-w-0 gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm border border-champagne-500/24 bg-champagne-500/10 text-champagne-700">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">{method.title}</h3>
                      <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">
                        {method.body}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </MotionCard>
            );
          })}
        </div>
      </section>

      <MotionCard index={4} className="p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-4 w-4 text-champagne-600" />
          <p className="text-[12.5px] leading-5 text-muted-foreground">
            Release requests are instructions, not instant withdrawals. Admins verify the fee,
            provider status, audit trail, beneficiary, and payout completion before funds leave
            escrow.
          </p>
        </div>
      </MotionCard>
    </div>
  );
}

function Quote({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={strong ? "mt-1.5 text-[15px] font-semibold tabular-figures text-foreground" : "mt-1.5 text-[13px] font-medium tabular-figures text-foreground"}>
        {value}
      </div>
    </div>
  );
}
