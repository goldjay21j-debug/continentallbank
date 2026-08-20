import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { WithdrawalSubmitButton } from "@/components/dashboard/withdrawal-submit-button";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { clientWallets } from "@/lib/portal/queries";
import { formatCurrency } from "@/lib/utils";
import { CURRENCIES, type Currency } from "@/lib/constants";

type Method =
  | "bank"
  | "zelle"
  | "cashapp"
  | "wise"
  | "revolut"
  | "sepa"
  | "iban"
  | "uk_faster"
  | "card"
  | "paypal";

const methodLabel: Record<Method, string> = {
  bank: "Bank transfer",
  zelle: "Zelle",
  cashapp: "Cash App",
  wise: "Wise",
  revolut: "Revolut",
  sepa: "SEPA transfer",
  iban: "IBAN transfer",
  uk_faster: "UK Faster Payments",
  card: "Card payout review",
  paypal: "PayPal withdrawal",
};

export const metadata = { title: "Review Withdrawal" };

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

  const wallets = await clientWallets(user.id);
  const requestedCurrency = isCurrency(params.currency)
    ? params.currency
    : (user.profile.preferred_currency as Currency);
  const wallet =
    wallets.find((item) => item.currency === requestedCurrency) ??
    wallets.find((item) => Number(item.available_balance) > 0) ??
    wallets[0];

  if (!wallet || Number(wallet.available_balance) <= 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Withdrawal review"
          title="Review is not available."
          description="There are no funds currently available for withdrawal in this currency."
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
  const requested = Number(params.amount ?? available);
  const amount =
    Number.isFinite(requested) && requested > 0
      ? Math.min(requested, available)
      : available;
  const destination = params.destination?.trim() || "To be confirmed during provider review";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Withdrawal review"
        title="Confirm withdrawal request."
        description="Review the amount, method, and destination before submitting the instruction for bank officer review."
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
                <div className="eyebrow text-champagne-700">Withdrawal instruction</div>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                  {methodLabel[params.method]}
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Account {user.profile.account_number ?? "Pending assignment"}
                </p>
              </div>
              <Badge variant="warning">Pending officer review</Badge>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-7 sm:grid-cols-2 lg:grid-cols-3 sm:px-8">
            <ReviewMetric label="Requested amount" value={formatCurrency(amount, currency)} strong />
            <ReviewMetric label="Pending after submit" value={formatCurrency(amount, currency)} />
            <ReviewMetric label="Eligible balance" value={formatCurrency(available, currency)} />
          </div>

          <div className="border-t border-[#E3D8C5] px-6 py-5 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Account holder" value={user.profile.full_name} />
              <Detail label="Destination" value={destination} />
              <Detail label="Review status" value="Pending bank officer review" />
              <Detail label="Settlement status" value="Not settled" />
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
                Officer-controlled payout
              </h2>
            </div>
            <LockKeyhole className="h-5 w-5 text-champagne-600" strokeWidth={1.5} />
          </div>
          <div className="mt-5 space-y-3 text-[12.5px] leading-5 text-muted-foreground">
            <p>
              The request will move the amount from available balance to pending balance. Admins
              verify destination details before approving, rejecting, or marking the payout settled.
            </p>
            <div className="flex items-start gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3 text-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne-700" />
              <span>Users cannot edit approval status, settlement status, or audit records.</span>
            </div>
          </div>
          <div className="mt-6">
            <WithdrawalSubmitButton
              amount={amount}
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
      <div className="mt-1.5 break-words text-[13px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function isMethod(value: string | undefined): value is Method {
  return Boolean(value && value in methodLabel);
}

function isCurrency(value: string | undefined): value is Currency {
  return Boolean(value && (CURRENCIES as readonly string[]).includes(value));
}
