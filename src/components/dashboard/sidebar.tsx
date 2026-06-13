"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  Banknote,
  Bell,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Undo2,
  UserRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { signOutAction } from "@/app/actions/auth";
import { cn, formatAccountNumber, initials } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const accountItems: NavItem[] = [
  { href: "/dashboard", label: "Recovery", icon: LayoutDashboard },
  { href: "/dashboard/escrow", label: "Escrow", icon: LockKeyhole },
  { href: "/dashboard/withdraw", label: "Release", icon: ArrowDownLeft },
  { href: "/dashboard/wallets", label: "Accounts", icon: Wallet },
  { href: "/dashboard/transactions", label: "Ledger", icon: ArrowLeftRight },
  { href: "/dashboard/beneficiaries", label: "Beneficiaries", icon: Banknote },
];

const serviceItems: NavItem[] = [
  { href: "/dashboard/withdrawals", label: "Request history", icon: ClipboardCheck },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/refunds", label: "Refunds", icon: Undo2 },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
];

const profileItems: NavItem[] = [
  { href: "/dashboard/onboarding", label: "Onboarding", icon: ClipboardCheck },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/security", label: "Security", icon: ShieldCheck },
];

const allItems = [...accountItems, ...serviceItems, ...profileItems];

export function DashboardSidebar({
  fullName,
  email,
  accountNumber,
}: {
  fullName: string;
  email: string;
  accountNumber: string | null;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden h-screen w-[282px] shrink-0 flex-col border-r border-champagne-200/[0.10] bg-[#0E1A24]/95 shadow-[18px_0_46px_-40px_rgba(0,0,0,0.82)] backdrop-blur-xl lg:sticky lg:top-0 lg:flex">
        <div className="border-b border-champagne-200/[0.10] px-6 py-7">
          <Link href="/" className="focus-ring inline-block rounded-sm">
            <BrandMark variant="light" />
          </Link>
          <div className="mt-5 rounded-md border border-champagne-300/18 bg-ivory-100/[0.055] p-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-champagne-300">
              Private Client
            </div>
            <div className="mt-1 truncate text-[12px] tabular-figures text-ivory-100/64">
              {formatAccountNumber(accountNumber)}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <NavGroup label="Portfolio">
            {accountItems.map((item) => (
              <DashboardNavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </NavGroup>
          <NavGroup label="Private office" className="mt-6">
            {serviceItems.map((item) => (
              <DashboardNavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </NavGroup>
          <NavGroup label="Account" className="mt-6">
            {profileItems.map((item) => (
              <DashboardNavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </NavGroup>
        </nav>

        <div className="border-t border-champagne-200/[0.10] p-4">
          <div className="rounded-md border border-ivory-100/[0.08] bg-ivory-100/[0.055] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-champagne-500 text-[13px] font-semibold text-navy-950 shadow-[0_10px_24px_-18px_rgba(200,169,106,0.9)]">
                {initials(fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-ivory-100">{fullName}</div>
                <div className="mt-0.5 truncate text-[12px] text-ivory-100/48">{email}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ivory-100/[0.08] pt-3">
              <Link
                href="/dashboard/messages"
                className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-ivory-100/[0.08] bg-ivory-100/[0.055] text-[12px] font-medium text-ivory-100/82 transition-colors hover:bg-ivory-100/[0.09]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Message
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="focus-ring inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-ivory-100/[0.08] bg-ivory-100/[0.055] text-[12px] font-medium text-ivory-100/82 transition-colors hover:bg-ivory-100/[0.09]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <nav className="sticky top-0 z-40 border-b border-champagne-200/[0.10] bg-[#0E1A24]/96 px-3 py-3 shadow-[0_14px_34px_-28px_rgba(0,0,0,0.78)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="focus-ring shrink-0 rounded-sm">
            <BrandMark variant="light" withWordmark={false} />
          </Link>
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {allItems.map((item) => {
              const active = isActive(item.href, pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-[12px] font-medium",
                    active
                      ? "border-champagne-400/32 bg-champagne-500/14 text-champagne-100"
                      : "border-ivory-100/[0.08] bg-ivory-100/[0.045] text-ivory-100/66 hover:bg-ivory-100/[0.07] hover:text-ivory-100",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

function NavGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ivory-100/44">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function DashboardNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(item.href, pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-200",
        active
          ? "bg-ivory-100/[0.085] text-ivory-100 shadow-[inset_0_0_0_1px_rgba(250,247,240,0.055)]"
          : "text-ivory-100/62 hover:bg-ivory-100/[0.055] hover:text-ivory-100",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-sm bg-champagne-400/90" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-champagne-300" : "text-ivory-100/42 group-hover:text-champagne-300",
        )}
        strokeWidth={1.6}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function isActive(href: string, pathname: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}
