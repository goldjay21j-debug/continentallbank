import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileWarning,
  IdCard,
  ScrollText,
  ShieldAlert,
  Snowflake,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { MotionCard } from "@/components/motion/motion-card";
import { MotionList, MotionRow } from "@/components/motion/motion-list";
import { RiskBandPill, SeverityChip } from "@/components/admin/risk-pill";
import { requireAdmin } from "@/lib/auth";
import {
  KYC_STATUS_LABEL,
  RISK_CATEGORY_LABEL,
  type KycDocStatus,
  type KycDocKind,
  type RiskFlag,
} from "@/lib/portal/risk";
import { adminAuditLogs, adminClientRoster } from "@/lib/portal/queries";
import { formatDate, formatDateTime, maskAccountNumber } from "@/lib/utils";
import { ACCOUNT_STATUS } from "@/lib/constants";

export const metadata = { title: "Compliance — Admin" };

export default async function CompliancePage() {
  await requireAdmin();
  const [profiles, auditLogs] = await Promise.all([adminClientRoster(), adminAuditLogs()]);
  const roster = profiles.map((profile) => {
    const kyc = kycSummaryFromProfile(profile as any);
    return {
      profile,
      kyc,
      score: { score: 0, band: "clear" as const },
      flags: [] as RiskFlag[],
    };
  });
  const activeRiskFlags: RiskFlag[] = [];
  const complianceEvents = auditLogs
    .filter((entry: any) => /kyc|user_|account/i.test(entry.action_type))
    .slice(0, 10);

  const kycPending = roster.filter((r) => r.kyc.pending > 0);
  const kycExpired = roster.filter((r) => r.kyc.expired > 0);
  const flagged = roster.filter((r) => r.flags.length > 0);
  const frozen = roster.filter((r) => r.profile.account_status === "suspended");

  const totals = {
    clients: roster.length,
    verified: roster.filter((r) => r.kyc.verified > 0 && r.kyc.pending === 0 && r.kyc.expired === 0).length,
    pending: kycPending.length,
    flagged: flagged.length,
    frozen: frozen.length,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="Risk, KYC & account oversight."
        description="Officer-only command center for know-your-client review, risk flag management, account freezes, and audit exports."
        actions={
          <Button variant="outline" asChild>
            <Link href="/api/audit-logs/export">
              <ScrollText className="h-4 w-4" /> Export audit (CSV)
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat icon={Users} label="Clients" value={String(totals.clients)} />
        <Stat
          icon={CheckCircle2}
          label="KYC verified"
          value={String(totals.verified)}
          tone="success"
        />
        <Stat
          icon={Clock3}
          label="KYC pending"
          value={String(totals.pending)}
          tone={totals.pending > 0 ? "accent" : "default"}
        />
        <Stat
          icon={AlertTriangle}
          label="Active flags"
          value={String(totals.flagged)}
          tone={totals.flagged > 0 ? "warning" : "default"}
        />
        <Stat
          icon={Snowflake}
          label="Frozen"
          value={String(totals.frozen)}
          tone={totals.frozen > 0 ? "danger" : "default"}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* KYC Review Queue */}
        <MotionCard index={0} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-foreground/[0.06] px-6 py-4">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">Queue</div>
              <h3 className="mt-1 font-display text-lg font-semibold">KYC review</h3>
            </div>
            <Badge variant={kycPending.length > 0 ? "warning" : "muted"}>
              {kycPending.length} pending
            </Badge>
          </div>
          {kycPending.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">
              No KYC reviews waiting.
            </div>
          ) : (
            <MotionList className="divide-y divide-foreground/[0.05]">
              {kycPending.map((r) => (
                <MotionRow
                  key={r.profile.id}
                  className="px-6 py-4 transition-colors duration-200 hover:bg-foreground/[0.03]"
                >
                  <Link href={`/admin/users/${r.profile.id}`} className="block">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium text-foreground truncate">
                          {r.profile.full_name}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground tabular-figures mt-0.5">
                          {maskAccountNumber(r.profile.account_number)} · {r.profile.country}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="warning">{r.kyc.pending} doc</Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {r.kyc.docs
                        .filter((d) => d.status === "submitted" || d.status === "missing")
                        .map((d) => (
                          <span
                            key={d.id}
                            className={
                              "text-[10.5px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border " +
                              (d.status === "missing"
                                ? "border-destructive/30 bg-destructive/10 text-destructive"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300")
                            }
                          >
                            {d.kind.replace(/_/g, " ")} · {KYC_STATUS_LABEL[d.status]}
                          </span>
                        ))}
                    </div>
                  </Link>
                </MotionRow>
              ))}
            </MotionList>
          )}
        </MotionCard>

        {/* Active risk flags */}
        <MotionCard index={1} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-foreground/[0.06] px-6 py-4">
            <div>
              <div className="eyebrow text-champagne-700 dark:text-champagne-400">Flags</div>
              <h3 className="mt-1 font-display text-lg font-semibold">Active risk flags</h3>
            </div>
            <ShieldAlert className="h-4 w-4 text-champagne-600" />
          </div>
          {activeRiskFlags.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">
              No active flags.
            </div>
          ) : (
            <MotionList className="divide-y divide-foreground/[0.05] max-h-[420px] overflow-y-auto">
              {activeRiskFlags
                .filter((f) => !f.resolved_at)
                .map((f) => {
                  const client = roster.find((r) => r.profile.id === f.user_id)?.profile;
                  return (
                    <MotionRow key={f.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${f.user_id}`}
                            className="text-[13.5px] font-medium text-foreground hover:underline underline-offset-4"
                          >
                            {client?.full_name ?? "—"}
                          </Link>
                          <div className="text-[11.5px] text-muted-foreground mt-0.5">
                            {RISK_CATEGORY_LABEL[f.category]}
                          </div>
                        </div>
                        <SeverityChip severity={f.severity} />
                      </div>
                      <p className="mt-2 text-[12.5px] text-muted-foreground italic leading-relaxed">
                        &ldquo;{f.note}&rdquo;
                      </p>
                      <div className="mt-2 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                        {f.raised_by_full_name} · {formatDate(f.raised_at)}
                      </div>
                    </MotionRow>
                  );
                })}
            </MotionList>
          )}
        </MotionCard>
      </section>

      {/* Full compliance roster */}
      <MotionCard index={2} className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-foreground/[0.06] px-6 py-4">
          <div>
            <div className="eyebrow text-champagne-700 dark:text-champagne-400">Client roster</div>
            <h3 className="mt-1 font-display text-lg font-semibold">Compliance posture</h3>
          </div>
        </div>
        <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_0.9fr_0.7fr_auto] gap-4 border-b border-foreground/[0.05] bg-foreground/[0.02] px-6 py-3 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>Client</span>
          <span>Account / Country</span>
          <span>KYC</span>
          <span>Status</span>
          <span>Risk</span>
          <span className="text-right">Open</span>
        </div>
        <ul className="divide-y divide-foreground/[0.05]">
          {roster.map((r) => (
            <li
              key={r.profile.id}
              className="grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_1fr_1fr_0.9fr_0.7fr_auto] items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-foreground/[0.03]"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/users/${r.profile.id}`}
                  className="text-[14px] font-medium text-foreground hover:underline underline-offset-4 truncate"
                >
                  {r.profile.full_name}
                </Link>
                <div className="text-[11.5px] text-muted-foreground truncate">
                  {r.profile.email}
                </div>
              </div>
              <div className="hidden md:block text-[12px] text-muted-foreground tabular-figures">
                {maskAccountNumber(r.profile.account_number)}
                <div className="text-[11px] mt-0.5 not-italic">{r.profile.country}</div>
              </div>
              <div className="hidden md:block text-[12px]">
                <KycChip kyc={r.kyc} />
              </div>
              <div className="hidden md:block">
                <Badge
                  variant={
                    r.profile.account_status === "approved"
                      ? "success"
                      : r.profile.account_status === "suspended"
                        ? "destructive"
                        : r.profile.account_status === "pending"
                          ? "warning"
                          : "muted"
                  }
                >
                  {ACCOUNT_STATUS[r.profile.account_status as keyof typeof ACCOUNT_STATUS] ??
                    r.profile.account_status}
                </Badge>
              </div>
              <div className="hidden md:block">
                <RiskBandPill band={r.score.band} score={r.score.score} />
              </div>
              <div className="md:flex hidden justify-end">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/users/${r.profile.id}`} aria-label="Open">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="md:hidden col-span-2 flex flex-wrap items-center gap-2">
                <KycChip kyc={r.kyc} />
                <RiskBandPill band={r.score.band} score={r.score.score} />
              </div>
            </li>
          ))}
        </ul>
      </MotionCard>

      {/* Recent compliance events */}
      <MotionCard index={3} className="overflow-hidden">
        <div className="border-b border-foreground/[0.06] px-6 py-4">
          <div className="eyebrow text-champagne-700 dark:text-champagne-400">Timeline</div>
          <h3 className="mt-1 font-display text-lg font-semibold">Recent compliance events</h3>
        </div>
        <ul className="divide-y divide-foreground/[0.05]">
          {complianceEvents.length === 0 ? (
            <li className="px-6 py-10 text-center text-[13px] text-muted-foreground">
              No compliance events recorded yet.
            </li>
          ) : complianceEvents.map((e: any) => (
            <li key={e.id} className="px-6 py-4 flex items-start gap-3">
              <span
                className={
                  "inline-flex h-8 w-8 items-center justify-center rounded-md border " +
                  (e.action_type === "user_suspend"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : e.action_type.includes("flag")
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : e.action_type.includes("kyc_approved")
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-foreground/10 bg-foreground/[0.04] text-foreground")
                }
              >
                {e.action_type === "user_suspend" ? (
                  <Snowflake className="h-4 w-4" strokeWidth={1.6} />
                ) : e.action_type.includes("flag") ? (
                  <FileWarning className="h-4 w-4" strokeWidth={1.6} />
                ) : e.action_type.includes("kyc_approved") ? (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.6} />
                ) : (
                  <IdCard className="h-4 w-4" strokeWidth={1.6} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={e.user_id ? `/admin/users/${e.user_id}` : "/admin/users"}
                  className="text-[13.5px] font-medium text-foreground hover:underline underline-offset-4"
                >
                  {e.client?.full_name ?? "Client record"}
                </Link>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">
                  {String(e.action_type).replace(/_/g, " ")}
                </p>
                <div className="mt-1 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  {e.admin?.full_name ?? "System"} · {formatDateTime(e.created_at)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </MotionCard>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: any;
  label: string;
  value: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "warning"
        ? "text-amber-700 dark:text-amber-300"
        : tone === "danger"
          ? "text-destructive"
          : tone === "accent"
            ? "text-champagne-700 dark:text-champagne-300"
            : "text-foreground";
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <Icon className={"h-3.5 w-3.5 " + toneClass} strokeWidth={1.7} />
      </div>
      <div className={"mt-2 font-display text-2xl font-semibold tabular-figures " + toneClass}>
        {value}
      </div>
    </div>
  );
}

function KycChip({ kyc }: { kyc: { verified: number; pending: number; expired: number; total: number } }) {
  const allVerified = kyc.total > 0 && kyc.verified === kyc.total;
  if (allVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.7} />
        {kyc.verified}/{kyc.total} verified
      </span>
    );
  }
  if (kyc.expired > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-destructive">
        <FileWarning className="h-3.5 w-3.5" strokeWidth={1.7} />
        {kyc.expired} expired
      </span>
    );
  }
  if (kyc.pending > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-amber-700 dark:text-amber-300">
        <Clock3 className="h-3.5 w-3.5" strokeWidth={1.7} />
        {kyc.pending} pending
      </span>
    );
  }
  return (
    <span className="text-[12px] text-muted-foreground">No documents</span>
  );
}

function kycSummaryFromProfile(profile: {
  id: string;
  kyc_status?: string | null;
  kyc_method?: string | null;
  kyc_submitted_at?: string | null;
  kyc_reviewed_at?: string | null;
  kyc_review_note?: string | null;
  updated_at?: string | null;
}) {
  const status = profile.kyc_status ?? "not_submitted";
  const docStatus = kycDocStatusFromProfile(status);
  const hasDocument = status !== "not_submitted";
  const docs = hasDocument
    ? [
        {
          id: `${profile.id}-kyc`,
          user_id: profile.id,
          kind: (profile.kyc_method ?? "national_id") as KycDocKind,
          status: docStatus,
          submitted_at: profile.kyc_submitted_at ?? profile.updated_at ?? new Date().toISOString(),
          reviewed_at: profile.kyc_reviewed_at ?? undefined,
          review_note: profile.kyc_review_note ?? undefined,
        },
      ]
    : [];

  return {
    total: docs.length,
    verified: docStatus === "verified" ? 1 : 0,
    pending: docStatus === "submitted" ? 1 : 0,
    expired: docStatus === "expired" ? 1 : 0,
    rejected: docStatus === "rejected" ? 1 : 0,
    docs,
  };
}

function kycDocStatusFromProfile(status: string): KycDocStatus {
  if (status === "approved") return "verified";
  if (status === "rejected") return "rejected";
  if (status === "submitted" || status === "under_review") return "submitted";
  return "missing";
}
