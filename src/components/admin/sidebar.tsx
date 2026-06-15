"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  BarChart3,
  Banknote,
  LifeBuoy,
  LogOut,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Users,
  LayoutDashboard,
  ScrollText,
  Undo2,
} from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { NavItem } from "@/components/motion/nav-item";
import { signOutAction } from "@/app/actions/auth";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

const primaryItems = [
  { href: "/admin", label: "Operations", icon: LayoutDashboard },
  { href: "/admin/users", label: "Clients", icon: Users },
  { href: "/admin/compliance", label: "Compliance", icon: ShieldAlert },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowDownLeft },
  { href: "/admin/beneficiaries", label: "Beneficiaries", icon: Banknote },
  { href: "/admin/refunds", label: "Refunds", icon: Undo2 },
  { href: "/admin/transactions", label: "Ledger", icon: ArrowLeftRight },
];

const secondaryItems = [
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar({
  fullName,
  email,
  role,
}: {
  fullName: string;
  email: string;
  role: Role;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden h-screen w-[276px] shrink-0 flex-col border-r border-white/[0.08] bg-navy-950/78 shadow-[18px_0_44px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl lg:sticky lg:top-0 lg:flex">
        <div className="border-b border-white/[0.08] px-6 py-7">
          <Link href="/" className="focus-ring inline-block rounded-sm">
            <BrandMark variant="light" />
          </Link>
          <div className="mt-5 grid grid-cols-[auto_1fr] gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/[0.07] p-3">
            <div className="grid h-9 w-9 place-items-center rounded-sm border border-champagne-500/30 bg-navy-900 text-champagne-300">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.7} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-champagne-300">
                Admin Console
              </div>
              <div className="mt-1 truncate text-[12px] text-ivory-100/68">
                Private banking ops
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <NavGroup label="Control">
            {primaryItems.map((item) => (
              <AdminNavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </NavGroup>
          <NavGroup label="Assurance" className="mt-6">
            {secondaryItems.map((item) => (
              <AdminNavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </NavGroup>
        </nav>

        <div className="border-t border-white/[0.08] p-4">
          <div className="rounded-md border border-white/[0.08] bg-white/[0.045] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-champagne-500 text-[13px] font-semibold text-navy-950">
                {initials(fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-ivory-100">{fullName}</div>
                <div className="mt-0.5 truncate text-[11px] uppercase tracking-[0.13em] text-ivory-100/48">
                  {ROLE_LABELS[role]}
                </div>
              </div>
            </div>
            <div className="mt-3 truncate border-t border-white/[0.07] pt-3 text-[12px] text-ivory-100/54">
              {email}
            </div>
            <form action={signOutAction} className="mt-3">
              <button
                type="submit"
                className="focus-ring inline-flex h-9 w-full items-center justify-center gap-2 rounded-sm border border-white/[0.08] bg-white/[0.045] text-[12px] font-medium text-ivory-100/82 transition-colors hover:bg-white/[0.08]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <nav className="sticky top-0 z-40 border-b border-white/[0.08] bg-navy-950/90 px-3 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="focus-ring shrink-0 rounded-sm">
            <BrandMark variant="light" withWordmark={false} />
          </Link>
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {[...primaryItems, ...secondaryItems].map((item) => {
              const active = isActive(item.href, pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-sm border px-3 text-[12px] font-medium",
                    active
                      ? "border-champagne-500/35 bg-champagne-500/16 text-champagne-200"
                      : "border-white/[0.08] bg-white/[0.04] text-ivory-100/62",
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
      <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ivory-100/38">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function AdminNavItem({
  item,
  pathname,
}: {
  item: (typeof primaryItems)[number] | (typeof secondaryItems)[number];
  pathname: string;
}) {
  return (
    <NavItem
      groupId="admin-nav"
      href={item.href}
      label={item.label}
      icon={item.icon}
      active={isActive(item.href, pathname)}
    />
  );
}

function isActive(href: string, pathname: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
