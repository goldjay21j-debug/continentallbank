import Link from "next/link";
import {
  ArrowDownLeft,
  Bell,
  FileText,
  Mail,
  ShieldAlert,
  Undo2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import {
  NOTIFICATION_KIND_LABELS,
  type Notification,
  type NotificationKind,
} from "@/lib/portal/notifications";
import { clientNotifications } from "@/lib/portal/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Notifications" };

const ICON_MAP: Record<NotificationKind, LucideIcon> = {
  account: UserRound,
  withdrawal: ArrowDownLeft,
  refund: Undo2,
  message: Mail,
  security: ShieldAlert,
  document: FileText,
};

const TONE_MAP: Record<Notification["severity"], string> = {
  info: "text-champagne-700 dark:text-champagne-300",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-300",
  danger: "text-destructive",
};

const FILTERS: { value: NotificationKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "account", label: "Account" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "refund", label: "Refund" },
  { value: "message", label: "Messages" },
  { value: "security", label: "Security" },
  { value: "document", label: "Documents" },
];

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const user = await requireApprovedClient();
  const { kind } = await searchParams;

  const all = (await clientNotifications(user.id)) as Notification[];
  const list = kind && kind !== "all" ? all.filter((n) => n.kind === kind) : all;

  const unread = all.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Notification Center"
        title="Account events, in order."
        description="Every signal Continental raises against your file — withdrawal status, refund updates, secure messages, security alerts, new documents."
      />

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={String(all.length)} />
        <Stat
          label="Unread"
          value={String(unread)}
          tone={unread > 0 ? "accent" : "default"}
        />
        <Stat
          label="Security alerts"
          value={String(all.filter((n) => n.kind === "security").length)}
        />
        <Stat
          label="Latest"
          value={
            all[0]
              ? new Date(all[0].created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
          small
        />
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = (kind ?? "all") === f.value;
          const count =
            f.value === "all"
              ? all.length
              : all.filter((n) => n.kind === f.value).length;
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/dashboard/notifications" : `/dashboard/notifications?kind=${f.value}`}
              className={
                "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors inline-flex items-center gap-1.5 " +
                (active
                  ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                  : "border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]")
              }
            >
              <span>{f.label}</span>
              <span className="tabular-figures opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      {list.length === 0 ? (
        <MotionCard className="p-10 text-center">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03] mb-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-medium text-foreground">No notifications.</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            New events posted against your account will appear here.
          </p>
        </MotionCard>
      ) : (
        <ul className="space-y-3">
          {list.map((n, i) => {
            const Icon = ICON_MAP[n.kind];
            const tone = TONE_MAP[n.severity];

            const row = (
              <div className="flex gap-4 p-5 sm:p-6">
                <span
                  className={
                    "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-foreground/10 bg-foreground/[0.04] " +
                    tone
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-semibold text-foreground tracking-tight">
                          {n.title}
                        </h3>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-champagne-500" />
                        )}
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
                        {n.body}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="muted" className="capitalize">
                        {NOTIFICATION_KIND_LABELS[n.kind]}
                      </Badge>
                      {n.amount && (
                        <span className="text-[13px] tabular-figures font-medium text-foreground">
                          {n.amount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    {formatDateTime(n.created_at)}
                  </div>
                </div>
              </div>
            );

            return (
              <li key={n.id} className="contents">
                {n.href ? (
                  <Link
                    href={n.href}
                    className="block glass-card transition-transform duration-200 hover:-translate-y-[2px]"
                    style={{ animationDelay: `${0.04 + i * 0.03}s` }}
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="glass-card">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
  small,
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
  small?: boolean;
}) {
  return (
    <div className="glass-card p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div
        className={
          "mt-2 font-display tabular-figures " +
          (small ? "text-lg font-medium" : "text-2xl font-semibold") +
          " " +
          (tone === "accent" ? "text-champagne-700 dark:text-champagne-300" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
