import { Monitor, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { PasswordChangeForm } from "@/components/dashboard/password-change-form";
import { requireApprovedClient } from "@/lib/auth";
import { clientLoginHistory } from "@/lib/portal/queries";
import { formatDateTime } from "@/lib/utils";
import type { LoginHistoryEntry } from "@/lib/types/database";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  const user = await requireApprovedClient();
  const history = (await clientLoginHistory(user.id)) as LoginHistoryEntry[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Security"
        title="Account safeguards."
        description="Manage your password and review recent access to your private portal."
      />

      <TrustBadgeRail preset="security" tone="light" compact />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass-card p-6 lg:p-8 h-fit">
          <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-2">Password</div>
          <h3 className="font-display text-xl font-semibold mb-4">Change your password</h3>
          <PasswordChangeForm />
        </div>

        <div className="glass-card">
          <div className="border-b border-foreground/[0.06] px-6 py-4">
            <div className="eyebrow text-champagne-700 dark:text-champagne-400">Login history</div>
            <h3 className="mt-1 font-display text-lg font-semibold">Recent sessions</h3>
          </div>
          {history.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">
              No sessions recorded yet.
            </div>
          ) : (
            <ul className="divide-y divide-foreground/[0.05] max-h-[520px] overflow-y-auto">
              {history.map((h, i) => (
                <li key={h.id} className="px-6 py-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-medium text-foreground">
                      {formatDateTime(h.login_time)}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {(h.browser ?? "Unknown").slice(0, 60)}
                      </span>
                      {h.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {h.location}
                        </span>
                      )}
                      {h.ip_address && (
                        <span className="tabular-figures">{h.ip_address}</span>
                      )}
                    </div>
                  </div>
                  {i === 0 && <Badge variant="success">Current</Badge>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
