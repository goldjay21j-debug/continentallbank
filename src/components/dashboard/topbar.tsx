"use client";

import Link from "next/link";
import { LogOut, MessageSquare, Search, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { signOutAction } from "@/app/actions/auth";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { Notification } from "@/lib/demo/notifications";
import { formatAccountNumber, initials } from "@/lib/utils";

type Props = {
  fullName: string;
  email: string;
  accountNumber: string | null;
  locale: Locale;
  notifications: Notification[];
};

export function DashboardTopbar({ fullName, email, accountNumber, locale, notifications }: Props) {
  return (
    <header className="sticky top-[65px] z-30 border-b border-[#D8DEE6] bg-white/88 shadow-[0_18px_46px_-42px_rgba(15,23,42,0.46)] backdrop-blur-xl lg:top-0">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <div className="hidden min-w-[220px] md:block">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08231]">
            Private portal
          </div>
          <div className="mt-1 text-[12px] tabular-figures text-slate-600">
            {formatAccountNumber(accountNumber)}
          </div>
        </div>

        <label className="relative hidden h-10 max-w-xl flex-1 items-center rounded-md border border-slate-200 bg-[#F7F8FA] px-3 text-slate-700 transition focus-within:border-champagne-500/45 focus-within:bg-white focus-within:ring-2 focus-within:ring-champagne-500/15 md:flex">
          <Search className="mr-2 h-4 w-4 text-slate-400" strokeWidth={1.6} />
          <input
            type="search"
            placeholder="Search accounts, documents, messages"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="gold" size="sm" asChild className="hidden shadow-none sm:inline-flex">
            <Link href="/dashboard/messages">
              <MessageSquare className="h-3.5 w-3.5" />
              Message banker
            </Link>
          </Button>

          <div className="hidden sm:block">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          <NotificationBell notifications={notifications} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus-ring flex items-center gap-3 rounded-md border border-slate-200 bg-[#F7F8FA] py-1 pl-1 pr-3 transition-colors hover:border-slate-300 hover:bg-white">
                <Avatar>
                  <AvatarFallback>{initials(fullName)}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <div className="text-[13px] font-semibold leading-tight text-slate-900">
                    {fullName}
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase leading-tight tracking-[0.14em] text-slate-500">
                    Private Client
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="px-2 py-2 normal-case tracking-normal">
                <div className="text-[13px] font-medium text-foreground">{fullName}</div>
                <div className="text-[12px] text-muted-foreground">{email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserRound className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/security">
                  <Settings className="h-4 w-4" /> Security
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
