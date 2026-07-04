import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { MessageThreadList } from "@/components/dashboard/message-thread-list";
import { requireAdmin } from "@/lib/auth";
import { adminMessageThreads } from "@/lib/portal/queries";

export const metadata = { title: "Secure Messages — Admin" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "awaiting_client", label: "Awaiting client" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const all = await adminMessageThreads();
  const threads = status && status !== "all" ? await adminMessageThreads(status) : all;

  const open = all.filter((t) => t.status === "open").length;
  const awaiting = all.filter((t) => t.status === "awaiting_client").length;
  const unread = all.filter((t) => t.unread_for_officer).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Secure Messages"
        title="Private Office inbox."
        description="Threaded conversations with private clients. Reply, attach documents, and update status. Every action is recorded against the audit log."
      />

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total threads" value={String(all.length)} />
        <Stat label="Open" value={String(open)} tone={open > 0 ? "accent" : "default"} />
        <Stat label="Awaiting client" value={String(awaiting)} />
        <Stat label="Unread" value={String(unread)} tone={unread > 0 ? "accent" : "default"} />
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = (status ?? "all") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/admin/messages" : `/admin/messages?status=${f.value}`}
              className={
                "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors " +
                (active
                  ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                  : "border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]")
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <MessageThreadList threads={threads} basePath="/admin/messages" audience="officer" />
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
