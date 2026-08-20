import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CreditCard,
  Globe2,
  Landmark,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { MotionCard } from "@/components/motion/motion-card";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { requireApprovedClient } from "@/lib/auth";
import { clientWallets } from "@/lib/portal/queries";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/lib/constants";

export const metadata = { title: "Withdrawal Request" };

const methods = [
  {
    id: "bank",
    title: "Bank transfer",
    body: "Officer-reviewed wire, ACH, SEPA, IBAN, or Faster Payments withdrawal.",
    icon: Building2,
  },
  {
    id: "zelle",
    title: "Zelle",
    body: "US domestic withdrawal using a verified Zelle email address or mobile number.",
    icon: Smartphone,
  },
  {
    id: "cashapp",
    title: "Cash App",
    body: "Cash App payout review using a verified $Cashtag, phone, or account email.",
    icon: BadgeDollarSign,
  },
  {
    id: "wise",
    title: "Wise",
    body: "Wise recipient review for supported local and international currency routes.",
    icon: Globe2,
  },
  {
    id: "revolut",
    title: "Revolut",
    body: "Revolut payout review using a verified Revolut tag, phone, or account email.",
    icon: WalletCards,
  },
  {
    id: "sepa",
    title: "SEPA transfer",
    body: "Euro-area withdrawal routed to a verified SEPA destination.",
    icon: Landmark,
  },
  {
    id: "iban",
    title: "IBAN transfer",
    body: "International bank withdrawal using a verified IBAN and beneficiary record.",
    icon: Landmark,
  },
  {
    id: "uk_faster",
    title: "UK Faster Payments",
    body: "GBP withdrawal to a verified UK sort code and account number.",
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
    title: "PayPal withdrawal",
    body: "Submit a verified PayPal email for recipient and payout checks.",
    icon: Mail,
  },
] as const;

export default async function WithdrawPage() {
  const user = await requireApprovedClient();
  const wallets = await clientWallets(user.id);
  const preferredCurrency = user.profile.preferred_currency as Currency;
  const preferredWallet = wallets.find((wallet) => wallet.currency === preferredCurrency);
  const activeWallet =
    preferredWallet ??
    wallets.find((wallet) => Number(wallet.available_balance) > 0) ??
    wallets[0];
  const currency = (activeWallet?.currency ?? preferredCurrency) as Currency;
  const available = Number(activeWallet?.available_balance ?? 0);
  const pending = Number(activeWallet?.pending_balance ?? 0);
  const isEligible = available > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Withdrawal request"
        title="Choose a withdrawal method."
        description={
          isEligible
            ? "Select the payout rail you want reviewed by the bank. Funds move to pending balance while an officer verifies the instruction."
            : "Withdrawal methods are shown below. Add available funds before submitting a withdrawal instruction."
        }
      />

      <TrustBadgeRail preset="withdrawals" tone="light" compact />

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <MotionCard index={0} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                Available withdrawal balance
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold tabular-figures text-foreground">
                {formatCurrency(available, currency)}
              </h2>
            </div>
            <Badge variant={isEligible ? "success" : "warning"}>
              {isEligible ? "Available" : "No funds"}
            </Badge>
          </div>
          {isEligible ? (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Quote label="Available" value={formatCurrency(available, currency)} strong />
                <Quote label="Pending review" value={formatCurrency(pending, currency)} />
                <Quote label="Currency" value={currency} />
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3 text-[12.5px] leading-5 text-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne-700" />
                <p>
                  Withdrawal instructions are reviewed manually. Admins control approval,
                  settlement status, audit records, and final payout completion.
                </p>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-4">
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">Current status</div>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
                No available balance
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                Your account does not currently show funds available for withdrawal. Once an
                available balance is posted, you can select a payout rail and submit instructions
                for officer review.
              </p>
            </div>
          )}
        </MotionCard>

        <div className="grid gap-4 sm:grid-cols-2">
          {methods.map((method, index) => {
            const Icon = method.icon;
            const href = `/dashboard/withdraw/${method.id}?amount=${available}&currency=${currency}`;
            return (
              <MotionCard key={method.id} index={index + 1} hover className="p-5">
                {isEligible ? (
                  <Link href={href} className="flex h-full items-start justify-between gap-4">
                    <MethodContent icon={Icon} title={method.title} body={method.body} />
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ) : (
                  <div className="flex h-full items-start justify-between gap-4 opacity-75" aria-disabled="true">
                    <MethodContent icon={Icon} title={method.title} body={method.body} />
                    <LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                )}
              </MotionCard>
            );
          })}
        </div>
      </section>

      <MotionCard index={4} className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-champagne-600" />
            <p className="text-[12.5px] leading-5 text-muted-foreground">
              Withdrawal requests are instructions, not instant payouts. Admins verify destination,
              audit trail, beneficiary, and payout completion before funds are marked settled.
            </p>
          </div>
          {!isEligible && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/wallets">Open accounts</Link>
              </Button>
            </div>
          )}
        </div>
      </MotionCard>
    </div>
  );
}

function MethodContent({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Building2;
  title: string;
  body: string;
}) {
  return (
    <div className="flex min-w-0 gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm border border-champagne-500/24 bg-champagne-500/10 text-champagne-700">
        <Icon className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <div className="min-w-0">
        <h3 className="break-words text-[15px] font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">{body}</p>
      </div>
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
