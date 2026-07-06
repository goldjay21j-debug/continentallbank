"use client";

import Link from "next/link";
import { BellRing, ExternalLink, Globe2, LogOut, Plus, Search, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";
import { ROLE_LABELS, SITE, type Role } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { getT, type Locale } from "@/lib/i18n/dictionaries";
import { initials } from "@/lib/utils";

export function AdminTopbar({
  fullName,
  email,
  role,
  locale,
}: {
  fullName: string;
  email: string;
  role: Role;
  locale: Locale;
}) {
  const t = getT(locale);

  return (
    <header className="sticky top-[65px] z-30 border-b border-white/[0.08] bg-navy-950/72 backdrop-blur-xl lg:top-0">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <div className="hidden min-w-[220px] md:block">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-champagne-300">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
            {t("admin.officer_desk")}
          </div>
          <div className="mt-1 text-[12px] text-ivory-100/52">
            {SITE.publicDomain.replace(/^https?:\/\//, "")} {t("admin.command")}
          </div>
        </div>

        <label className="focus-within:ring-ring/60 relative hidden h-10 max-w-xl flex-1 items-center rounded-sm border border-white/[0.08] bg-white/[0.045] px-3 text-ivory-100/76 transition focus-within:ring-2 md:flex">
          <Search className="mr-2 h-4 w-4 text-ivory-100/42" strokeWidth={1.6} />
          <input
            type="search"
            placeholder={t("admin.search_placeholder")}
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ivory-100/34"
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden border-white/[0.08] bg-white/[0.045] text-ivory-100/82 hover:bg-white/[0.08] lg:inline-flex"
          >
            <Link href={SITE.publicDomain} target="_blank" rel="noreferrer">
              <Globe2 className="h-3.5 w-3.5" />
              {t("admin.live_site")}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <Button variant="gold" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/admin/users">
              <Plus className="h-3.5 w-3.5" />
              {t("admin.new_client")}
            </Link>
          </Button>

          <div className="hidden sm:block">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          <Button
            variant="outline"
            size="icon"
            asChild
            aria-label="Messages"
            className="border-white/[0.08] bg-white/[0.045] text-ivory-100/82 hover:bg-white/[0.08]"
          >
            <Link href="/admin/messages">
              <BellRing className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus-ring flex items-center gap-3 rounded-sm border border-white/[0.08] bg-white/[0.045] py-1 pl-1 pr-3 transition-colors hover:bg-white/[0.08]">
                <Avatar>
                  <AvatarFallback>{initials(fullName)}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <div className="text-[13px] font-medium leading-tight text-ivory-100">
                    {fullName}
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase leading-tight tracking-[0.14em] text-ivory-100/46">
                    {ROLE_LABELS[role]}
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
              <form action={signOutAction}>
                <input type="hidden" name="redirectTo" value="/admin/login" />
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  {t("common.logout")}
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
