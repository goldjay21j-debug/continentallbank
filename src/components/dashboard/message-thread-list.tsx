"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MESSAGE_STATUS_LABEL,
  type MessageThread,
} from "@/lib/portal/messages";
import { formatDate } from "@/lib/utils";

type Props = {
  threads: MessageThread[];
  basePath: "/dashboard/messages" | "/admin/messages";
  audience: "client" | "officer";
};

export function MessageThreadList({ threads, basePath, audience }: Props) {
  if (threads.length === 0) {
    return (
      <div className="glass-card p-10 text-center text-[13px] text-muted-foreground">
        No conversations yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {threads.map((thread, i) => {
        const last = thread.messages[thread.messages.length - 1];
        const unread =
          audience === "client" ? thread.unread_for_client : thread.unread_for_officer;
        const attachmentCount = thread.messages.reduce(
          (n, m) => n + (m.attachments?.length ?? 0),
          0,
        );

        return (
          <motion.li
            key={thread.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.36,
              delay: 0.03 + i * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              href={`${basePath}/${thread.id}`}
              className="group glass-card flex items-start gap-4 p-5 sm:p-6 transition-transform duration-200 hover:-translate-y-[2px]"
            >
              {/* Unread indicator + status pill */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <span
                  className={
                    "h-2 w-2 rounded-full " +
                    (unread ? "bg-champagne-500" : "bg-foreground/15")
                  }
                  aria-label={unread ? "Unread" : "Read"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-semibold text-foreground tracking-tight truncate">
                      {thread.subject}
                    </h3>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {last.sender_name} ·{" "}
                      <span className="capitalize">{last.sender_role}</span> ·{" "}
                      {formatDate(last.created_at)}
                    </div>
                  </div>
                  <ThreadStatusBadge status={thread.status} />
                </div>

                <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                  {last.body}
                </p>

                <div className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span>
                    {thread.messages.length}{" "}
                    {thread.messages.length === 1 ? "message" : "messages"}
                  </span>
                  {attachmentCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      {attachmentCount} {attachmentCount === 1 ? "attachment" : "attachments"}
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 text-foreground/60 group-hover:text-foreground transition-colors">
                    Open
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}

function ThreadStatusBadge({ status }: { status: MessageThread["status"] }) {
  const variant =
    status === "resolved" || status === "closed"
      ? "success"
      : status === "awaiting_client"
        ? "gold"
        : "warning";
  return <Badge variant={variant}>{MESSAGE_STATUS_LABEL[status]}</Badge>;
}
