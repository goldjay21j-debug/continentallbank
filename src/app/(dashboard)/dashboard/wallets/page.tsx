import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Globe2,
  Landmark,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { clientWallets } from "@/lib/portal/queries";
import { CURRENCY_LABELS, type Currency } from "@/lib/constants";
import { formatAccountNumber, formatCurrency, formatDate } from "@/lib/utils";
import type { Wallet } from "@/lib/types/database";

export const metadata = { title: "Currency Accounts" };

const BASE_CURRENCY: Currency = "USD";
const BASE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
};

export default async function WalletsPage() {
  const user = await requireApprovedClient();
  const wallets = (await clientWallets(user.id)) as Wallet[];
  const totalAvailable = wallets.reduce((sum, w) => sum + toBase(w.available_balance, w.currency), 0);
  const totalPending = wallets.reduce((sum, w) => sum + toBase(w.pending_balance, w.currency), 0);
  const totalWithdrawn = wallets.reduce((sum, w) => sum + toBase(w.total_withdrawn, w.currency), 0);
  const totalRelationship = totalAvailable + totalPending;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Currency Accounts"
        title="Account registry."
        description="Each currency position is separated by ledger, reconciled independently, and protected by officer approval before outbound settlement."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/transactions">
                Ledger
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/withdraw">
                Request release <ArrowDownLeft className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <TrustBadgeRail preset="dashboard" tone="light" compact />

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <MotionCard index={0} intensity="strong" className="overflow-hidden">
          <div className="border-b border-[#E3D8C5] px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="eyebrow text-champagne-700">Consolidated accounts</div>
                <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
                  {formatCurrency(totalRelationship, BASE_CURRENCY, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </h2>
                <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                  Reporting value across active currency ledgers, using the Continental base
                  conversion view.
                </p>
              </div>
              <Badge variant="gold" className="w-fit">
                {wallets.length} active ledgers
              </Badge>
            </div>
          </div>
          <div className="grid gap-0 divide-y divide-[#E3D8C5] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <SummaryCell label="Available liquidity" value={formatCompact(totalAvailable)} accent />
            <SummaryCell label="Pending settlement" value={formatCompact(totalPending)} />
            <SummaryCell label="Lifetime outflow" value={formatCompact(totalWithdrawn)} />
          </div>
        </MotionCard>

        <MotionCard index={1} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">Controls</div>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
                Settlement safeguards
              </h2>
            </div>
            <ShieldCheck className="h-5 w-5 text-champagne-600" strokeWidth={1.5} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ControlPoint icon={LockKeyhole} label="Outbound funds" value="Dual officer review" />
            <ControlPoint icon={Scale} label="Ledger policy" value="Separated by currency" />
            <ControlPoint icon={FileText} label="Receipts" value="Stored in vault" />
            <ControlPoint icon={Globe2} label="Desk coverage" value="Geneva / New York" />
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {wallets.map((w, i) => {
          const balance = w.available_balance + w.pending_balance;
          const baseValue = toBase(balance, w.currency);
          const allocation = totalRelationship > 0 ? (baseValue / totalRelationship) * 100 : 0;
          const currency = w.currency as Currency;

          return (
            <MotionCard
              index={i + 2}
              hover
              key={w.id}
              className="flex min-h-[440px] flex-col overflow-hidden"
            >
              <div className="border-b border-foreground/[0.07] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                      {currency} portfolio
                    </div>
                    <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                      {CURRENCY_LABELS[currency]}
                    </h3>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground tabular-figures">
                      {formatAccountNumber(user.profile.account_number)} / {currency}
                    </div>
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-champagne-500/20 bg-champagne-500/10 text-champagne-600">
                    <Landmark className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col px-6 py-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Available balance
                  </div>
                  <div className="mt-2 font-display text-3xl font-semibold text-foreground tabular-figures">
                    {formatCurrency(w.available_balance, currency, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <AccountRow label="Pending settlement" value={formatCurrency(w.pending_balance, currency)} />
                  <AccountRow label="Total withdrawn" value={formatCurrency(w.total_withdrawn, currency)} />
                  <AccountRow label="Base reporting" value={formatCompact(baseValue)} />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">Relationship allocation</span>
                    <span className="font-medium tabular-figures text-foreground">
                      {formatPercent(allocation)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/[0.09]">
                    <div
                      className="h-full rounded-full bg-champagne-500"
                      style={{ width: `${Math.max(3, Math.min(100, allocation))}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 text-[12px]">
                  <Assurance icon={CheckCircle2} label="Reconciled" value={formatDate(w.updated_at)} />
                  <Assurance icon={Building2} label="Custody book" value="Segregated reserve" />
                  <Assurance icon={ShieldCheck} label="Controls" value="Officer approved outflow" />
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/transactions">
                      Ledger
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button variant="gold" size="sm" asChild>
                    <Link href="/dashboard/withdraw">
                      Release
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </MotionCard>
          );
        })}
      </section>
    </div>
  );
}

function SummaryCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-6 py-4 sm:px-7">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div
        className={
          accent
            ? "mt-2 text-lg font-semibold tabular-figures text-champagne-700"
            : "mt-2 text-lg font-semibold tabular-figures text-foreground"
        }
      >
        {value}
      </div>
    </div>
  );
}

function ControlPoint({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-foreground/[0.08] bg-foreground/[0.035]">
        <Icon className="h-4 w-4 text-champagne-600" strokeWidth={1.6} />
      </span>
      <div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-[13px] font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-right text-[14px] font-medium tabular-figures text-foreground">{value}</span>
    </div>
  );
}

function Assurance({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-foreground/[0.07] bg-foreground/[0.03] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-champagne-600" strokeWidth={1.6} />
        <span className="truncate text-muted-foreground">{label}</span>
      </div>
      <span className="shrink-0 text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function toBase(amount: number, currency: string) {
  return amount * (BASE_RATES[currency as Currency] ?? 1);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: BASE_CURRENCY,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return (
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
    }).format(value) + "%"
  );
}
