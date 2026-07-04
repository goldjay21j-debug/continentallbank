"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MESSAGE_STATUS_LABEL, type Message, type MessageThread } from "@/lib/portal/messages";
import { formatDateTime, initials } from "@/lib/utils";

type Props = {
  thread: MessageThread;
  audience: "client" | "officer";
  /** Display name shown above the composer */
  selfName: string;
  /** Back link target */
  backHref: "/dashboard/messages" | "/admin/messages";
};

export function MessageThreadView({ thread, audience, selfName, backHref }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
          <Link href={backHref}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to inbox
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-2">
              Conversation
            </div>
            <h1 className="font-display text-display-md text-foreground tracking-tight">
              {thread.subject}
            </h1>
            <div className="mt-2 text-[12.5px] text-muted-foreground">
              Started {formatDateTime(thread.created_at)} ·{" "}
              {thread.messages.length} messages
            </div>
          </div>
          <Badge
            variant={
              thread.status === "resolved" || thread.status === "closed"
                ? "success"
                : thread.status === "awaiting_client"
                  ? "gold"
                  : "warning"
            }
          >
            {MESSAGE_STATUS_LABEL[thread.status]}
          </Badge>
        </div>
      </div>

      {/* Thread of messages */}
      <ol className="space-y-4">
        {thread.messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            isSelf={
              (audience === "client" && m.sender_role === "client") ||
              (audience === "officer" && m.sender_role === "officer")
            }
            index={i}
          />
        ))}
      </ol>

      {/* Composer */}
      {thread.status !== "closed" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.36,
            delay: 0.1 + thread.messages.length * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="glass-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials(selfName)}</AvatarFallback>
            </Avatar>
            <div className="text-[12.5px]">
              <div className="font-medium text-foreground">{selfName}</div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Live conversation controls
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-[13px] leading-6 text-muted-foreground">
            Replies are handled through the live support workflow so every response is recorded
            against the client file and audit trail.
          </p>
          <Button asChild className="mt-4">
            <Link href={audience === "officer" ? "/admin/support" : "/dashboard/support"}>
              Open support center
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isSelf,
  index,
}: {
  message: Message;
  isSelf: boolean;
  index: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.36,
        delay: 0.04 + index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex gap-3 ${isSelf ? "flex-row-reverse" : ""}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>{initials(message.sender_name)}</AvatarFallback>
      </Avatar>
      <div className={`min-w-0 max-w-[80%] ${isSelf ? "items-end text-right" : ""} flex flex-col`}>
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {message.sender_name} ·{" "}
          {message.sender_role === "officer" ? "Private Office" : "Client"} ·{" "}
          {formatDateTime(message.created_at)}
        </div>
        <div
          className={
            "mt-1.5 inline-block rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed " +
            (isSelf
              ? "bg-primary text-primary-foreground"
              : "glass-card !rounded-2xl !p-4 text-foreground")
          }
        >
          <p className="whitespace-pre-wrap text-left">{message.body}</p>
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className={`mt-2 flex flex-wrap gap-2 ${isSelf ? "justify-end" : ""}`}>
            {message.attachments.map((a) => (
              <a
                key={a.id}
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1.5 text-[11.5px] text-foreground hover:bg-foreground/[0.06] transition-colors"
              >
                <FileText className="h-3 w-3 text-champagne-700 dark:text-champagne-400" />
                <span>{a.name}</span>
                <span className="text-muted-foreground tabular-figures">· {a.size}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  );
}
