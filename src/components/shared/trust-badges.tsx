import Link from "next/link";
import {
  CheckCircle2,
  FileLock2,
  KeyRound,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrustBadgeKey =
  | "tls"
  | "access"
  | "audit"
  | "withdrawalReview"
  | "documentVault"
  | "privacy"
  | "session";

type TrustBadge = {
  icon: LucideIcon;
  label: string;
  detail: string;
  href?: string;
};

const TRUST_BADGES: Record<TrustBadgeKey, TrustBadge> = {
  tls: {
    icon: LockKeyhole,
    label: "HTTPS/TLS protected",
    detail: "Encrypted browser connection in production",
    href: "/security",
  },
  access: {
    icon: KeyRound,
    label: "Approved access only",
    detail: "Portal access is role-scoped",
    href: "/security",
  },
  audit: {
    icon: ScrollText,
    label: "Audit logged",
    detail: "Account changes write an audit record",
    href: "/security",
  },
  withdrawalReview: {
    icon: UserCheck,
    label: "Officer-reviewed funds",
    detail: "No automatic withdrawal settlement",
    href: "/security",
  },
  documentVault: {
    icon: FileLock2,
    label: "Document vault",
    detail: "Statements and receipts retained",
    href: "/security",
  },
  privacy: {
    icon: ShieldCheck,
    label: "Privacy controls",
    detail: "Least-privilege account access",
    href: "/privacy",
  },
  session: {
    icon: CheckCircle2,
    label: "Session monitoring",
    detail: "Recent sign-ins visible in portal",
    href: "/dashboard/security",
  },
};

const PRESETS = {
  marketing: ["tls", "audit", "withdrawalReview", "privacy"],
  auth: ["tls", "access", "privacy"],
  refund: ["tls", "audit", "withdrawalReview"],
  dashboard: ["tls", "audit", "withdrawalReview", "session"],
  documents: ["documentVault", "audit", "privacy"],
  withdrawals: ["withdrawalReview", "audit", "tls"],
  security: ["tls", "access", "audit", "privacy"],
} satisfies Record<string, TrustBadgeKey[]>;

type TrustBadgeRailProps = {
  preset?: keyof typeof PRESETS;
  items?: TrustBadgeKey[];
  tone?: "light" | "dark";
  compact?: boolean;
  className?: string;
};

export function TrustBadgeRail({
  preset = "marketing",
  items,
  tone = "light",
  compact = false,
  className,
}: TrustBadgeRailProps) {
  const keys = items ?? PRESETS[preset];

  return (
    <div
      className={cn(
        "grid gap-2.5",
        compact ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
      aria-label="Trust and security controls"
    >
      {keys.map((key) => (
        <TrustBadgeCard key={key} badge={TRUST_BADGES[key]} tone={tone} compact={compact} />
      ))}
    </div>
  );
}

function TrustBadgeCard({
  badge,
  tone,
  compact,
}: {
  badge: TrustBadge;
  tone: "light" | "dark";
  compact: boolean;
}) {
  const Icon = badge.icon;
  const content = (
    <>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md border",
          compact ? "h-8 w-8" : "h-9 w-9",
          tone === "dark"
            ? "border-champagne-400/20 bg-champagne-500/10 text-champagne-300"
            : "border-champagne-500/20 bg-champagne-500/10 text-champagne-700",
        )}
      >
        <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.6} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block font-medium leading-tight",
            compact ? "text-[12.5px]" : "text-[13px]",
            tone === "dark" ? "text-ivory-100" : "text-foreground",
          )}
        >
          {badge.label}
        </span>
        <span
          className={cn(
            "mt-1 block leading-snug",
            compact ? "text-[11.5px]" : "text-[12px]",
            tone === "dark" ? "text-ivory-100/58" : "text-muted-foreground",
          )}
        >
          {badge.detail}
        </span>
      </span>
    </>
  );

  const className = cn(
    "group flex min-w-0 items-start gap-3 rounded-md border p-3 transition-colors duration-200",
    tone === "dark"
      ? "border-ivory-100/[0.08] bg-ivory-100/[0.045] hover:border-champagne-400/24 hover:bg-ivory-100/[0.07]"
      : "border-border bg-card/60 hover:border-champagne-500/25 hover:bg-card",
  );

  if (!badge.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={badge.href} className={cn(className, "focus-ring")}>
      {content}
    </Link>
  );
}
