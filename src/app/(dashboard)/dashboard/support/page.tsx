import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { SupportForm } from "@/components/dashboard/support-form";
import { requireApprovedClient } from "@/lib/auth";
import { clientTickets } from "@/lib/portal/queries";
import { formatDateTime } from "@/lib/utils";
import type { SupportTicket } from "@/lib/types/database";

export const metadata = { title: "Support" };

export default async function SupportPage() {
  const user = await requireApprovedClient();
  const tickets = (await clientTickets(user.id)) as SupportTicket[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Concierge"
        title="A direct line, not a queue."
        description="Open a ticket and a member of the private client office will respond personally — typically within the business day."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="glass-card p-6 lg:p-8 h-fit">
          <SupportForm />
        </div>

        <div className="glass-card">
          <div className="border-b border-foreground/[0.06] px-6 py-4">
            <div className="eyebrow text-champagne-700 dark:text-champagne-400">Conversation</div>
            <h3 className="mt-1 font-display text-lg font-semibold">Your tickets</h3>
          </div>
          {tickets.length === 0 ? (
            <div className="px-6 py-16 text-center text-[13px] text-muted-foreground">
              You have no open tickets.
            </div>
          ) : (
            <ul className="divide-y divide-foreground/[0.05] max-h-[640px] overflow-y-auto">
              {tickets.map((t) => (
                <li key={t.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[14px] font-medium text-foreground">{t.subject}</h4>
                      <div className="text-[11.5px] text-muted-foreground mt-0.5">
                        {formatDateTime(t.created_at)}
                      </div>
                    </div>
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
                  </div>
                  <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
                    {t.message}
                  </p>
                  {t.admin_reply && (
                    <div className="mt-4 rounded-sm border border-champagne-500/20 bg-champagne-500/5 px-4 py-3">
                      <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-1.5">
                        Private Office reply
                      </div>
                      <p className="text-[13px] text-foreground leading-relaxed">
                        {t.admin_reply}
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
