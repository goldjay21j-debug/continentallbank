import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { EscrowReleaseSubmitButton } from "@/components/dashboard/escrow-release-submit-button";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { calculateReleaseFee } from "@/lib/portal/recovery";
import { clientEscrowOverview } from "@/lib/portal/queries";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/lib/constants";

type Method = "bank" | "card" | "paypal";

const methodLabel: Record<Method, string> = {
  bank: "Bank transfer",
  card: "Card payout review",
  paypal: "PayPal release",
};

export const metadata = { title: "Review Release" };

export default async function WithdrawReviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    method?: string;
    amount?: string;
    currency?: string;
    destination?: string;
  }>;
}) {
  const user = await requireApprovedClient();
  const params = await searchParams;
  if (!isMethod(params.method)) notFound();

  const overview = await clientEscrowOverview(user.id, user.profile);
  const contract = overview.escrowContract;
  const primaryCase = overview.primaryCase;

  if (!overview.withdrawalEligibility || !contract || !primaryCase) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Release review"
          title="Review is not available."
          description={overview.accessState.description}
          actions={
            <Button variant="outline" asChild>
              <Link href="/dashboard/withdraw">Back to release options</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const available = Number(contract.available_for_withdrawal);
  const requested = Number(params.amount ?? available);
  const amount =
    Number.isFinite(requested) && requested > 0
      ? Math.min(requested, available)
      : available;
  const quote = calculateReleaseFee(amount);
  const destination = params.destination?.trim() || "To be confirmed during provider review";
  const currency = contract.currency as Currency;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Release review"
        title="Confirm release request."
        description="Review the server-calculated processing fee, estimated net amount, method, and destination before submitting to provider verification."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/withdraw/${params.method}`}>
              <ArrowLeft className="h-4 w-4" />
              Edit details
            </Link>
          </Button>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <MotionCard index={0} intensity="strong" className="overflow-hidden border border-[#E3D8C5]">
          <div className="border-b border-[#E3D8C5] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="eyebrow text-champagne-700">Release request</div>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                  {methodLabel[params.method]}
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Escrow contract {contract.reference}
                </p>
              </div>
              <Badge variant="warning">Awaiting fee verification</Badge>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-7 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
            <ReviewMetric label="Requested amount" value={formatCurrency(quote.amount, currency)} />
            <ReviewMetric label="Release fee - 20%" value={formatCurrency(quote.releaseProcessingFee, currency)} />
            <ReviewMetric label="Estimated net" value={formatCurrency(quote.netAmount, currency)} strong />
            <ReviewMetric label="Eligible balance" value={formatCurrency(available, currency)} />
          </div>

          <div className="border-t border-[#E3D8C5] px-6 py-5 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Case" value={primaryCase.title} />
              <Detail label="Destination" value={destination} />
              <Detail label="Fee status" value="Pending verification" />
              <Detail label="Withdrawal status" value="Awaiting fee completion" />
            </div>
          </div>
        </MotionCard>

        <MotionCard index={1} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                Locked controls
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
                Provider-controlled payout
              </h2>
            </div>
            <LockKeyhole className="h-5 w-5 text-champagne-600" strokeWidth={1.5} />
          </div>
          <div className="mt-5 space-y-3 text-[12.5px] leading-5 text-muted-foreground">
            <p>
              The request will be filed as awaiting fee completion. Admins and providers verify
              release processing fee status before payout can move to processing or paid.
            </p>
            <div className="flex items-start gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3 text-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne-700" />
              <span>Users cannot edit fee, net amount, provider status, or release status.</span>
            </div>
          </div>
          <div className="mt-6">
            <EscrowReleaseSubmitButton
              escrowContractId={contract.id}
              caseId={primaryCase.id}
              amount={quote.amount}
              currency={currency}
              method={params.method}
              paymentDetails={{ destination }}
            />
          </div>
        </MotionCard>
      </section>
    </div>
  );
}

function ReviewMetric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border border-[#E3D8C5] bg-white p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={strong ? "mt-2 font-display text-2xl font-semibold tabular-figures text-foreground" : "mt-2 text-[15px] font-semibold tabular-figures text-foreground"}>
        {value}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-[13px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function isMethod(value: string | undefined): value is Method {
  return value === "bank" || value === "card" || value === "paypal";
}
