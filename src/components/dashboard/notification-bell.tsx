"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowDownLeft,
  Bell,
  CheckCircle2,
  FileText,
  Mail,
  ShieldAlert,
  Undo2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  type Notification,
  type NotificationKind,
} from "@/lib/portal/notifications";
import { cn } from "@/lib/utils";

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

type Props = {
  notifications: Notification[];
};

export function NotificationBell({ notifications: initial }: Props) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(initial);

  const unread = list.filter((n) => !n.read).length;

  function markAllRead() {
    setList((l) => l.map((n) => ({ ...n, read: true })));
  }

  function markOne(id: string) {
    setList((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground hover:bg-foreground/[0.06] focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne-500"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne-500 px-1 text-[9px] font-semibold text-navy-900 tabular-figures"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] sm:w-[400px] max-w-[calc(100vw-1.5rem)]">
        <div className="flex items-center justify-between border-b border-foreground/[0.06] px-4 py-3">
          <div>
            <div className="text-[14px] font-semibold text-foreground tracking-tight">
              Notifications
            </div>
            <div className="text-[11.5px] text-muted-foreground">
              {unread > 0
                ? `${unread} unread`
                : "All caught up"}
            </div>
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] uppercase tracking-[0.14em] text-champagne-700 dark:text-champagne-300 hover:text-foreground transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <ul className="max-h-[420px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {list.slice(0, 8).map((n, i) => {
              const Icon = ICON_MAP[n.kind];
              const tone = TONE_MAP[n.severity];
              const inner = (
                <div className="flex gap-3 px-4 py-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-foreground/10 bg-foreground/[0.04]",
                      tone,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={cn(
                          "text-[13px] font-medium tracking-tight leading-snug",
                          !n.read ? "text-foreground" : "text-foreground/85",
                        )}
                      >
                        {n.title}
                      </div>
                      {!n.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-champagne-500 shrink-0" />
                      )}
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
                      {n.body}
                    </div>
                    <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {relativeTime(n.created_at)}
                      {n.amount && (
                        <>
                          {" · "}
                          <span className="tabular-figures normal-case tracking-tight">
                            {n.amount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{
                    duration: 0.28,
                    delay: 0.03 + i * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border-b border-foreground/[0.04] last:border-b-0"
                >
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => {
                        markOne(n.id);
                        setOpen(false);
                      }}
                      className="block transition-colors hover:bg-foreground/[0.03]"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markOne(n.id)}
                      className="block w-full text-left transition-colors hover:bg-foreground/[0.03]"
                    >
                      {inner}
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <div className="border-t border-foreground/[0.06] p-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full justify-between"
            onClick={() => setOpen(false)}
          >
            <Link href="/dashboard/notifications">
              All notifications
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = (now - then) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
