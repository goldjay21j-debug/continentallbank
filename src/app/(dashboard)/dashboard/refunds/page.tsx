import { CheckCircle2, Circle, Clock3, FileText, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { RefundDisputeForm } from "@/components/dashboard/refund-dispute-form";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { clientRefundClaims } from "@/lib/portal/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { REFUND_REASONS, type Currency } from "@/lib/constants";
import type { RefundClaim } from "@/lib/types/database";

export const metadata = { title: "Refunds & Disputes" };

const REASON_LABEL = Object.fromEntries(REFUND_REASONS.map((r) => [r.id, r.label]));

export default async function RefundsPage() {
  const user = await requireApprovedClient();
  const claims = (await clientRefundClaims(user.id)) as RefundClaim[];
  const preferredCurrency = user.profile.preferred_currency as Currency;
  const activeClaims = claims.filter((c) => c.status === "pending" || c.status === "under_review");
  const settledClaims = claims.filter((c) => c.status === "approved" || c.status === "completed");
  const totalClaimed = claims.reduce((sum, c) => sum + Number(c.amount), 0);
  const latest = claims[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Refunds &amp; disputes"
        title="File a dispute, recover what is owed."
        description="For disputed charges, failed settlements, or any restitution required against your portfolio. Each dispute is reviewed personally by your banker."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <RefundMetric
          icon={Clock3}
          label="Active reviews"
          value={activeClaims.length.toString()}
          note="Claims with an officer"
          index={0}
        />
        <RefundMetric
          icon={CheckCircle2}
          label="Approved or settled"
          value={settledClaims.length.toString()}
          note="Refunds cleared by the desk"
          index={1}
        />
        <RefundMetric
          icon={FileText}
          label="Total claimed"
          value={formatCurrency(totalClaimed, latest?.currency ?? preferredCurrency, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          note={claims.length ? "Across submitted disputes" : "No claims filed"}
          index={2}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <div className="glass-card p-6 lg:p-8 h-fit">
            <RefundDisputeForm
              defaultCurrency={user.profile.preferred_currency as Currency}
            />
          </div>

          <MotionCard index={3} className="p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-champagne-500/20 bg-champagne-500/10">
                <ShieldCheck className="h-4 w-4 text-champagne-600" strokeWidth={1.6} />
              </span>
              <div>
                <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                  Receipt trail
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Approved refunds can generate a vault receipt with the original
                  reference, officer note, and settlement confirmation.
                </p>
              </div>
            </div>
          </MotionCard>
        </div>

        <div className="glass-card">
          <div className="border-b border-foreground/[0.06] px-6 py-4">
            <div className="eyebrow text-champagne-700 dark:text-champagne-400">History</div>
            <h3 className="mt-1 font-display text-lg font-semibold">Your claims</h3>
          </div>
          {claims.length === 0 ? (
            <div className="px-6 py-16 text-center text-[13px] text-muted-foreground">
              You have not filed any disputes yet.
            </div>
          ) : (
            <ul className="divide-y divide-foreground/[0.05] max-h-[640px] overflow-y-auto">
              {claims.map((r) => (
                <li key={r.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="tabular-figures text-[15px] font-medium text-foreground">
                        {r.currency
                          ? formatCurrency(r.amount, r.currency)
                          : `${r.amount.toLocaleString()}`}
                      </div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">
                        {REASON_LABEL[
                          (r.supporting_info as { reason?: string } | null)?.reason ?? "other"
                        ] ?? "Other"}
                        {" · "}
                        {formatDateTime(r.created_at)}
                      </div>
                      {r.transaction_reference && (
                        <div className="text-[11.5px] tabular-figures text-muted-foreground mt-1">
                          Ref · {r.transaction_reference}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={
                        r.status === "completed"
                          ? "success"
                          : r.status === "approved"
                            ? "gold"
                            : r.status === "under_review"
                              ? "gold"
                              : r.status === "rejected"
                                ? "destructive"
                                : "warning"
                      }
                      className="capitalize shrink-0"
                    >
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-3 text-[12.5px] text-muted-foreground leading-relaxed">
                    {r.description}
                  </p>
                  <RefundTimeline status={r.status} />
                  <div className="mt-4 grid gap-2 rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-3 text-[12px] text-muted-foreground sm:grid-cols-2">
                    <ChecklistItem active={Boolean(r.transaction_reference)} label="Transaction reference" />
                    <ChecklistItem active={Boolean(r.amount)} label="Claim amount recorded" />
                    <ChecklistItem active={r.description.length >= 20} label="Client statement captured" />
                    <ChecklistItem active={Boolean(r.admin_note)} label="Officer note attached" />
                  </div>
                  {r.admin_note && (
                    <div className="mt-3 rounded-sm border border-champagne-500/20 bg-champagne-500/5 px-3.5 py-2.5">
                      <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-1">
                        Officer note
                      </div>
                      <p className="text-[12.5px] text-foreground leading-relaxed">
                        {r.admin_note}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function RefundMetric({
  icon: Icon,
  label,
  value,
  note,
  index,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  note: string;
  index: number;
}) {
  return (
    <MotionCard index={index} className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-2xl font-semibold tabular-figures text-foreground">
            {value}
          </div>
          <div className="mt-2 text-[12px] text-muted-foreground">{note}</div>
        </div>
        <Icon className="h-5 w-5 text-champagne-600" strokeWidth={1.5} />
      </div>
    </MotionCard>
  );
}

function RefundTimeline({ status }: { status: RefundClaim["status"] }) {
  const steps = [
    { id: "pending", label: "Filed" },
    { id: "under_review", label: "Review" },
    { id: "approved", label: "Approved" },
    { id: "completed", label: status === "rejected" ? "Closed" : "Settled" },
  ] as const;
  const order = ["pending", "under_review", "approved", "completed"] as const;
  const currentIndex =
    status === "rejected" ? 3 : Math.max(0, order.indexOf(status as (typeof order)[number]));

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {steps.map((step, index) => {
        const complete = index <= currentIndex && status !== "rejected";
        const rejected = status === "rejected" && index === 3;
        return (
          <div key={step.id} className="min-w-0">
            <div
              className={
                "h-1 rounded-full " +
                (complete
                  ? "bg-champagne-500"
                  : rejected
                    ? "bg-destructive/70"
                    : "bg-foreground/[0.08]")
              }
            />
            <div
              className={
                "mt-2 truncate text-[10.5px] uppercase tracking-[0.12em] " +
                (complete
                  ? "text-champagne-700 dark:text-champagne-300"
                  : rejected
                    ? "text-destructive"
                    : "text-muted-foreground")
              }
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChecklistItem({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
      )}
      <span>{label}</span>
    </div>
  );
}
