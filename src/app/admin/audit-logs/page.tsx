import Link from "next/link";
import { Download, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { adminAuditLogs } from "@/lib/portal/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Audit logs" };

export default async function AdminAuditLogsPage() {
  await requireAdmin();
  const rows = (await adminAuditLogs()) as any[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Audit"
        title="Immutable audit log."
        description="Every officer action against the platform is recorded here with timestamp, actor, and change context."
        actions={
          <Button variant="outline" asChild>
            <Link href="/api/audit-logs/export" download>
              <Download className="h-4 w-4" /> Export CSV
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <div className="glass-card px-6 py-16 text-center text-[13px] text-muted-foreground">
          The audit log is empty.
        </div>
      ) : (
        <ol className="space-y-3">
          {rows.map((a) => (
            <li
              key={a.id}
              className="glass-card p-4 flex items-start gap-4"
            >
              <ScrollText className="h-4 w-4 mt-0.5 text-champagne-600" strokeWidth={1.6} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13.5px] font-medium text-foreground capitalize">
                    {a.action_type.replace(/_/g, " ")}
                  </span>
                  {a.currency && <Badge variant="muted">{a.currency}</Badge>}
                  <span className="text-[11.5px] text-muted-foreground tabular-figures">
                    {formatDateTime(a.created_at)}
                  </span>
                </div>
                <div className="text-[12.5px] text-muted-foreground mt-0.5">
                  {a.admin?.full_name ?? "Officer"}
                  {a.client?.full_name ? ` → ${a.client.full_name}` : ""}
                  {a.ip_address ? ` · ${a.ip_address}` : ""}
                </div>
                {(a.old_value || a.new_value) && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                    <CodeBlock label="Old" value={a.old_value} />
                    <CodeBlock label="New" value={a.new_value} />
                  </div>
                )}
                {a.note && (
                  <p className="mt-2 text-[12.5px] italic text-muted-foreground">&quot;{a.note}&quot;</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function CodeBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) {
    return (
      <div>
        <div className="eyebrow text-muted-foreground mb-1">{label}</div>
        <div className="rounded-sm bg-muted/50 px-2 py-1 text-muted-foreground">—</div>
      </div>
    );
  }
  return (
    <div>
      <div className="eyebrow text-muted-foreground mb-1">{label}</div>
      <pre className="rounded-sm bg-muted/50 px-2 py-1 font-mono text-[11.5px] text-foreground whitespace-pre-wrap break-words">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
