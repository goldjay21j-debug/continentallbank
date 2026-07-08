import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, CreditCard, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/dashboard/page-header";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { clientEscrowOverview } from "@/lib/portal/queries";
import { formatCurrency } from "@/lib/utils";

const methodConfig = {
  bank: {
    title: "Bank transfer release.",
    eyebrow: "Bank transfer",
    icon: Building2,
    destinationLabel: "Bank destination",
    placeholder: "Beneficiary, bank, routing or IBAN reference",
    helper: "Provide enough detail for officers to verify the receiving account. Full documents can be requested securely after review.",
  },
  card: {
    title: "Card payout review.",
    eyebrow: "Card provider",
    icon: CreditCard,
    destinationLabel: "Cardholder and last four",
    placeholder: "Name on card - last four only",
    helper: "Do not enter a full card number, CVV, or expiry. Provider verification happens outside this form.",
  },
  paypal: {
    title: "PayPal release.",
    eyebrow: "PayPal provider",
    icon: Mail,
    destinationLabel: "Verified PayPal email",
    placeholder: "name@example.com",
    helper: "Use the PayPal email that should receive provider-side verification.",
  },
} as const;

type Method = keyof typeof methodConfig;

export default async function WithdrawalMethodPage({
  params,
  searchParams,
}: {
  params: Promise<{ method: string }>;
  searchParams: Promise<{ amount?: string; currency?: string }>;
}) {
  const user = await requireApprovedClient();
  const { method: rawMethod } = await params;
  if (!isMethod(rawMethod)) notFound();
  const method = rawMethod;
  const paramsValue = await searchParams;
  const config = methodConfig[method];
  const Icon = config.icon;

  const overview = await clientEscrowOverview(user.id, user.profile);
  const contract = overview.escrowContract;
  if (!overview.withdrawalEligibility || !contract || !overview.primaryCase) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Release method"
          title="Escrow release is not eligible."
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
  const requestedAmount = Number(paramsValue.amount ?? available);
  const amount =
    Number.isFinite(requestedAmount) && requestedAmount > 0
      ? Math.min(requestedAmount, available)
      : available;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description="Enter release details for review. You will confirm the release processing fee and estimated net amount before submitting."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/withdraw">Change method</Link>
          </Button>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <MotionCard index={0} className="p-6">
          <div className="grid h-12 w-12 place-items-center rounded-sm border border-champagne-500/24 bg-champagne-500/10 text-champagne-700">
            <Icon className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
            Provider verification required
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            A release request is not a payout confirmation. The provider verifies fee completion,
            recipient details, risk controls, and final release status before settlement.
          </p>
          <div className="mt-5 rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Eligible balance
            </div>
            <div className="mt-1.5 font-display text-2xl font-semibold tabular-figures text-foreground">
              {formatCurrency(available, contract.currency)}
            </div>
          </div>
        </MotionCard>

        <MotionCard index={1} className="p-6 lg:p-8">
          <form action="/dashboard/withdraw/review" className="space-y-5">
            <input type="hidden" name="method" value={method} />
            <input type="hidden" name="currency" value={contract.currency} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Release amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  inputMode="decimal"
                  defaultValue={amount.toFixed(2)}
                  className="tabular-figures"
                />
                <p className="text-[11.5px] text-muted-foreground">
                  Maximum eligible: {formatCurrency(available, contract.currency)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">{config.destinationLabel}</Label>
                <Input id="destination" name="destination" placeholder={config.placeholder} />
                <p className="text-[11.5px] text-muted-foreground">{config.helper}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3 text-[12.5px] leading-5 text-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne-700" />
              <p>
                The next screen calculates the processing fee and net release. Fee, net, status,
                and provider reference remain locked.
              </p>
            </div>

            <Button type="submit">
              Continue to review
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </MotionCard>
      </section>
    </div>
  );
}

function isMethod(value: string): value is Method {
  return value === "bank" || value === "card" || value === "paypal";
}
