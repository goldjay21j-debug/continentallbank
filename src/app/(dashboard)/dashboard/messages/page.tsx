import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { MessageThreadList } from "@/components/dashboard/message-thread-list";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { clientMessageThreads } from "@/lib/portal/queries";

export const metadata = { title: "Secure Messages" };

export default async function MessagesPage() {
  const user = await requireApprovedClient();
  const threads = await clientMessageThreads(user.id, user.profile.full_name);

  const unread = threads.filter((t) => t.unread_for_client).length;
  const open = threads.filter((t) => t.status === "open" || t.status === "awaiting_client").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Secure Messages"
        title="Threaded conversations with the Private Office."
        description="A confidential correspondence channel. Reply, attach documents, and review the full history. Replies are signed by a named officer."
        actions={
          <Button asChild>
            <Link href="/dashboard/messages?new=1">
              <Plus className="h-4 w-4" /> New conversation
            </Link>
          </Button>
        }
      />

      {/* Quick stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={String(threads.length)} />
        <Stat label="Open" value={String(open)} tone={open > 0 ? "accent" : "default"} />
        <Stat label="Unread" value={String(unread)} tone={unread > 0 ? "accent" : "default"} />
        <Stat
          label="Avg. response"
          value="< 2h"
          tone="default"
          small
        />
      </section>

      <MessageThreadList threads={threads} basePath="/dashboard/messages" audience="client" />

      <MotionCard className="p-5 sm:p-6" index={threads.length + 1}>
        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-2">
          Confidentiality charter
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground max-w-3xl">
          All correspondence in the Secure Message Center is end-to-end encrypted
          on Continental's infrastructure and retained for the lifetime of your
          relationship. Officers are bound by the bank's confidentiality
          covenant. Please do not include passwords, one-time codes, or full
          payment credentials in your messages.
        </p>
      </MotionCard>
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
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
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
