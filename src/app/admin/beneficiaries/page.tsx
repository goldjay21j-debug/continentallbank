import Link from "next/link";
import { Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { BeneficiaryDecisionActions } from "@/components/admin/beneficiary-decision-actions";
import { requireAdmin } from "@/lib/auth";
import {
  BENEFICIARY_RAIL_LABEL,
  BENEFICIARY_STATUS_LABEL,
  type Beneficiary,
} from "@/lib/portal/beneficiaries";
import { adminBeneficiaryQueue } from "@/lib/portal/queries";
import { formatDate, maskAccountNumber } from "@/lib/utils";

export const metadata = { title: "Beneficiaries — Admin" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export default async function AdminBeneficiariesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requireAdmin();
  const { status } = await searchParams;
  const all = (await adminBeneficiaryQueue()) as (Beneficiary & {
    client_name: string;
    client_account: string | null;
  })[];
  const rows = status && status !== "all" ? all.filter((b) => b.status === status) : all;
  const canDecide = admin.profile.role !== "support_admin";

  const counts = {
    all: all.length,
    pending: all.filter((b) => b.status === "pending").length,
    approved: all.filter((b) => b.status === "approved").length,
    rejected: all.filter((b) => b.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Beneficiaries"
        title="Approve outbound destinations."
        description="Every withdrawal destination must be verified against the client's KYC file before funds can be routed to it. Approve, reject, or annotate each submission."
      />

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={String(counts.all)} />
        <Stat
          label="Pending"
          value={String(counts.pending)}
          tone={counts.pending > 0 ? "accent" : "default"}
        />
        <Stat label="Approved" value={String(counts.approved)} />
        <Stat label="Rejected" value={String(counts.rejected)} />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = (status ?? "all") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/admin/beneficiaries" : `/admin/beneficiaries?status=${f.value}`}
              className={
                "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors inline-flex items-center gap-1.5 " +
                (active
                  ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                  : "border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]")
              }
            >
              <span>{f.label}</span>
              <span className="tabular-figures opacity-70">
                {f.value === "all" ? counts.all : counts[f.value as keyof typeof counts]}
              </span>
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Banknote className="mx-auto h-5 w-5 text-muted-foreground mb-3" />
          <p className="text-[14px] font-medium text-foreground">No beneficiaries match this filter.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((b) => (
            <li key={b.id} className="glass-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={b.status} />
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {BENEFICIARY_RAIL_LABEL[b.rail]} · {b.currency}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(b.created_at)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between gap-x-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/users/${b.user_id}`}
                        className="break-words text-[15px] font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {b.client_name}
                      </Link>
                      <span className="ml-2 inline-block break-words text-[12px] tabular-figures text-muted-foreground">
                        {maskAccountNumber(b.client_account)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Row label="Nickname" value={b.nickname} />
                    <Row label="Recipient" value={b.account_holder} />
                    {b.bank && <Row label="Institution" value={b.bank} />}
                    <Row label="Country" value={b.country} />
                    <Row label="Destination" value={b.destination_masked} mono span />
                  </div>

                  {b.notes && (
                    <p className="mt-3 text-[12.5px] italic text-muted-foreground border-l-2 border-champagne-500/30 pl-3 max-w-2xl">
                      &ldquo;{b.notes}&rdquo;
                    </p>
                  )}
                  {b.review_note && b.status !== "pending" && (
                    <p className="mt-3 text-[12.5px] text-foreground border-l-2 border-emerald-500/30 pl-3 max-w-2xl">
                      Officer note · {b.review_note}
                    </p>
                  )}
                </div>

                {canDecide && b.status === "pending" && (
                  <BeneficiaryDecisionActions id={b.id} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Beneficiary["status"] }) {
  const variant =
    status === "approved"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "rejected"
          ? "destructive"
          : "muted";
  return <Badge variant={variant}>{BENEFICIARY_STATUS_LABEL[status]}</Badge>;
}

function Row({
  label,
  value,
  mono,
  span,
}: {
  label: string;
  value: string;
  mono?: boolean;
  span?: boolean;
}) {
  return (
    <div className={"flex min-w-0 flex-col gap-0.5 " + (span ? "sm:col-span-2" : "")}>
      <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span
        className={
          "break-words text-foreground " +
          (mono ? "font-mono tabular-figures text-[12.5px]" : "text-[13px] font-medium")
        }
      >
        {value}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className="glass-card p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div
        className={
          "mt-2 font-display text-2xl font-semibold tabular-figures " +
          (tone === "accent" ? "text-champagne-700 dark:text-champagne-300" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
