import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CreditCard,
  Globe2,
  Landmark,
  Mail,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/dashboard/page-header";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { CURRENCIES, type Currency } from "@/lib/constants";
import { clientWallets } from "@/lib/portal/queries";
import { formatCurrency } from "@/lib/utils";

const methodConfig = {
  bank: {
    title: "Bank transfer withdrawal.",
    eyebrow: "Bank transfer",
    icon: Building2,
    destinationLabel: "Bank destination",
    placeholder: "Beneficiary, bank, routing or IBAN reference",
    helper: "Provide enough detail for officers to verify the receiving account. Full documents can be requested securely after review.",
  },
  zelle: {
    title: "Zelle withdrawal.",
    eyebrow: "Zelle",
    icon: Smartphone,
    destinationLabel: "Zelle recipient",
    placeholder: "Verified email address or US mobile number",
    helper: "Use the Zelle email or mobile number tied to the receiving account.",
  },
  cashapp: {
    title: "Cash App withdrawal.",
    eyebrow: "Cash App",
    icon: BadgeDollarSign,
    destinationLabel: "Cash App recipient",
    placeholder: "$Cashtag, phone, or account email",
    helper: "Provide the verified Cash App identifier. Officers may request confirmation before approval.",
  },
  wise: {
    title: "Wise withdrawal.",
    eyebrow: "Wise",
    icon: Globe2,
    destinationLabel: "Wise recipient",
    placeholder: "Wise email, recipient name, or account reference",
    helper: "Wise withdrawals are reviewed against recipient identity and supported currency routes.",
  },
  revolut: {
    title: "Revolut withdrawal.",
    eyebrow: "Revolut",
    icon: WalletCards,
    destinationLabel: "Revolut recipient",
    placeholder: "Revolut tag, phone, or account email",
    helper: "Use the verified Revolut recipient details for provider-side review.",
  },
  sepa: {
    title: "SEPA transfer withdrawal.",
    eyebrow: "SEPA transfer",
    icon: Landmark,
    destinationLabel: "SEPA destination",
    placeholder: "Beneficiary name and SEPA IBAN",
    helper: "SEPA withdrawals require a verified euro-area beneficiary and account ownership review.",
  },
  iban: {
    title: "IBAN transfer withdrawal.",
    eyebrow: "IBAN transfer",
    icon: Landmark,
    destinationLabel: "IBAN destination",
    placeholder: "Beneficiary name, IBAN, bank name, and country",
    helper: "International IBAN withdrawals may require additional bank documentation before approval.",
  },
  uk_faster: {
    title: "UK Faster Payments withdrawal.",
    eyebrow: "UK Faster Payments",
    icon: Building2,
    destinationLabel: "UK bank destination",
    placeholder: "Beneficiary, sort code, and account reference",
    helper: "UK Faster Payments withdrawals require verified beneficiary and account ownership details.",
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
    title: "PayPal withdrawal.",
    eyebrow: "PayPal provider",
    icon: Mail,
    destinationLabel: "Verified PayPal email",
    placeholder: "name@example.com",
    helper: "Use the PayPal email that should receive payout review.",
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

  const wallets = await clientWallets(user.id);
  const requestedCurrency = isCurrency(paramsValue.currency)
    ? paramsValue.currency
    : (user.profile.preferred_currency as Currency);
  const wallet =
    wallets.find((item) => item.currency === requestedCurrency) ??
    wallets.find((item) => Number(item.available_balance) > 0) ??
    wallets[0];

  if (!wallet || Number(wallet.available_balance) <= 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Withdrawal method"
          title="No available balance."
          description="There are no funds currently available for withdrawal. Once an available balance is posted, you can submit payout instructions for officer review."
          actions={
            <Button variant="outline" asChild>
              <Link href="/dashboard/withdraw">Back to withdrawal options</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const available = Number(wallet.available_balance);
  const currency = wallet.currency as Currency;
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
        description="Enter payout details for officer review. The request will move funds to pending balance until the bank marks the instruction approved or settled."
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
            A withdrawal request is not a payout confirmation. The bank verifies recipient details,
            risk controls, and final settlement status before completion.
          </p>
          <div className="mt-5 rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Available balance
            </div>
            <div className="mt-1.5 font-display text-2xl font-semibold tabular-figures text-foreground">
              {formatCurrency(available, currency)}
            </div>
          </div>
        </MotionCard>

        <MotionCard index={1} className="p-6 lg:p-8">
          <form action="/dashboard/withdraw/review" className="space-y-5">
            <input type="hidden" name="method" value={method} />
            <input type="hidden" name="currency" value={currency} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  inputMode="decimal"
                  defaultValue={amount.toFixed(2)}
                  className="tabular-figures"
                />
                <p className="text-[11.5px] text-muted-foreground">
                  Maximum available: {formatCurrency(available, currency)}
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
                The next screen lets you confirm the amount, destination, and method. Approval,
                settlement status, and final payout remain officer-controlled.
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
  return value in methodConfig;
}

function isCurrency(value: string | undefined): value is Currency {
  return Boolean(value && (CURRENCIES as readonly string[]).includes(value));
}
