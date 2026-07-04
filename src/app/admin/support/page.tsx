import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { TicketReplyForm } from "@/components/admin/ticket-reply-form";
import { requireAdmin } from "@/lib/auth";
import { adminTickets } from "@/lib/portal/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Support — Admin" };

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const rows = (await adminTickets(status)) as any[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Support"
        title="Concierge inbox."
        description="Respond to client tickets. Replies are recorded against the audit log."
      />

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/support${s === "all" ? "" : `?status=${s}`}`}
            className={
              "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors " +
              ((status ?? "all") === s
                ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="glass-card px-6 py-16 text-center text-[13px] text-muted-foreground">
          No tickets in this view.
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((t) => (
            <li key={t.id} className="glass-card p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        t.status === "resolved" || t.status === "closed"
                          ? "success"
                          : t.status === "in_progress"
                            ? "gold"
                            : "warning"
                      }
                      className="capitalize"
                    >
                      {t.status.replace("_", " ")}
                    </Badge>
                    <span className="text-[12px] text-muted-foreground">{formatDateTime(t.created_at)}</span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
                    {t.subject}
                  </h3>
                  <Link
                    href={`/admin/users/${t.profiles?.id}`}
                    className="text-[12px] text-muted-foreground hover:underline underline-offset-4"
                  >
                    {t.profiles?.full_name} · {t.profiles?.email}
                  </Link>
                </div>
              </div>
              <p className="mt-4 text-[13.5px] text-foreground leading-relaxed whitespace-pre-wrap">
                {t.message}
              </p>
              {t.admin_reply && (
                <div className="mt-4 rounded-sm border border-champagne-500/20 bg-champagne-500/5 px-4 py-3">
                  <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-1.5">
                    Previous reply
                  </div>
                  <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
                    {t.admin_reply}
                  </p>
                </div>
              )}
              <div className="hairline my-5" />
              <TicketReplyForm id={t.id} currentStatus={t.status} existingReply={t.admin_reply} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
