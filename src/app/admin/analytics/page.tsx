import { PageHeader } from "@/components/dashboard/page-header";
import { requireAdmin } from "@/lib/auth";
import { adminAnalytics } from "@/lib/portal/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requireAdmin();
  const a = await adminAnalytics();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Analytics"
        title="Institutional metrics."
        description="A consolidated read of platform-level metrics. Figures are reported per currency — not converted."
      />

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <Metric label="Total clients" value={String(a.totalClients)} />
        <Metric label="Approved" value={String(a.approvedClients)} />
        <Metric label="Pending" value={String(a.pendingClients)} />
        <Metric
          label="Withdrawals open"
          value={String((a.withdrawalsByStatus.pending ?? 0) + (a.withdrawalsByStatus.approved ?? 0))}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {(["USD", "EUR", "GBP"] as const).map((c) => (
          <article key={c} className="glass-card p-6">
            <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-2">
              {c} Custody
            </div>
            <div className="font-display text-3xl font-semibold tabular-figures text-foreground break-words">
              {formatCurrency(a.custody[c] ?? 0, c)}
            </div>
            <div className="hairline my-5" />
            <Row label="Pending" value={formatCurrency(a.pending[c] ?? 0, c)} />
            <Row
              label="Withdrawn (lifetime)"
              value={formatCurrency(a.withdrawnLifetime[c] ?? 0, c)}
            />
          </article>
        ))}
      </section>

      <section className="glass-card p-6">
        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-3">Withdrawals by status</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(a.withdrawalsByStatus).map(([s, count]) => (
            <div key={s} className="rounded-sm border border-border bg-background p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground capitalize">
                {s}
              </div>
              <div className="mt-2 font-display text-2xl font-semibold tabular-figures text-foreground">
                {count}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="glass-card p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-3 font-display text-3xl font-semibold text-foreground tabular-figures">
        {value}
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="tabular-figures text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}
