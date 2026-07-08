import {
  CheckCircle2,
  FileCheck2,
  KeyRound,
  Landmark,
  ReceiptText,
  RefreshCcw,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityTickerPreset = "public" | "auth" | "client" | "withdrawals" | "refund" | "admin";

type ActivityItem = {
  desk: string;
  event: string;
  detail: string;
  icon: LucideIcon;
};

const ACTIVITY_ITEMS: Record<ActivityTickerPreset, ActivityItem[]> = {
  public: [
    {
      desk: "Geneva Desk",
      event: "Withdrawal approved",
      detail: "Officer review completed",
      icon: CheckCircle2,
    },
    {
      desk: "Private Office",
      event: "Refund completed",
      detail: "Claim closed successfully",
      icon: RefreshCcw,
    },
    {
      desk: "Document Vault",
      event: "Statement issued",
      detail: "Secure file posted",
      icon: FileCheck2,
    },
    {
      desk: "New York Desk",
      event: "Account approved",
      detail: "Private client access opened",
      icon: KeyRound,
    },
    {
      desk: "Compliance",
      event: "Security review cleared",
      detail: "Access controls verified",
      icon: ShieldCheck,
    },
  ],
  auth: [
    {
      desk: "Portal",
      event: "Session secured",
      detail: "Encrypted access established",
      icon: ShieldCheck,
    },
    {
      desk: "Private Office",
      event: "Account approved",
      detail: "Client file opened",
      icon: KeyRound,
    },
    {
      desk: "Audit",
      event: "Access recorded",
      detail: "Sign-in event logged",
      icon: ScrollText,
    },
    {
      desk: "Document Vault",
      event: "Receipt issued",
      detail: "Client copy posted",
      icon: ReceiptText,
    },
  ],
  client: [
    {
      desk: "Private Office",
      event: "Withdrawal approved",
      detail: "Settlement desk notified",
      icon: CheckCircle2,
    },
    {
      desk: "Document Vault",
      event: "Statement posted",
      detail: "Quarterly report available",
      icon: FileCheck2,
    },
    {
      desk: "Ledger",
      event: "Account reconciled",
      detail: "Officer-audited movement",
      icon: ScrollText,
    },
    {
      desk: "Compliance",
      event: "Beneficiary verified",
      detail: "Destination review completed",
      icon: ShieldCheck,
    },
  ],
  withdrawals: [
    {
      desk: "Settlement",
      event: "Withdrawal approved",
      detail: "Manual review completed",
      icon: CheckCircle2,
    },
    {
      desk: "Payment Desk",
      event: "Receipt issued",
      detail: "Client document created",
      icon: ReceiptText,
    },
    {
      desk: "Audit",
      event: "Instruction logged",
      detail: "Immutable record written",
      icon: ScrollText,
    },
    {
      desk: "Private Office",
      event: "Funds released",
      detail: "Officer settlement completed",
      icon: Landmark,
    },
  ],
  refund: [
    {
      desk: "Recovery Desk",
      event: "Refund completed",
      detail: "Claim closed successfully",
      icon: RefreshCcw,
    },
    {
      desk: "Audit",
      event: "Claim recorded",
      detail: "Case trail updated",
      icon: ScrollText,
    },
    {
      desk: "Private Office",
      event: "Client response sent",
      detail: "Officer note issued",
      icon: FileCheck2,
    },
    {
      desk: "Compliance",
      event: "Evidence reviewed",
      detail: "Recovery file verified",
      icon: ShieldCheck,
    },
  ],
  admin: [
    {
      desk: "Operations",
      event: "Withdrawal approved",
      detail: "Payment queue reduced",
      icon: CheckCircle2,
    },
    {
      desk: "Refund Desk",
      event: "Refund completed",
      detail: "Client case closed",
      icon: RefreshCcw,
    },
    {
      desk: "Audit",
      event: "Officer action logged",
      detail: "Immutable trail updated",
      icon: ScrollText,
    },
    {
      desk: "Compliance",
      event: "Client approved",
      detail: "KYC status updated",
      icon: ShieldCheck,
    },
    {
      desk: "Vault",
      event: "Document issued",
      detail: "Statement copy posted",
      icon: FileCheck2,
    },
  ],
};

type ActivityTickerProps = {
  preset?: ActivityTickerPreset;
  tone?: "light" | "dark";
  label?: string;
  compact?: boolean;
  className?: string;
};

export function ActivityTicker({
  preset = "public",
  tone = "light",
  label = "Live operations",
  compact = false,
  className,
}: ActivityTickerProps) {
  const items = ACTIVITY_ITEMS[preset];
  const loop = [...items, ...items];

  return (
    <section
      className={cn(
        "overflow-hidden rounded-md border",
        tone === "dark"
          ? "border-ivory-100/[0.08] bg-ivory-100/[0.045] text-ivory-100"
          : "border-border bg-card/65 text-foreground",
        className,
      )}
      aria-label="Anonymous recent Continental activity"
    >
      <ul className="sr-only">
        {items.map((item) => (
          <li key={`${item.desk}-${item.event}`}>
            {item.desk}: {item.event}. {item.detail}.
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "flex items-center gap-4",
          compact ? "py-2.5 pl-3" : "py-3 pl-4",
        )}
      >
        <div
          className={cn(
          "flex min-w-0 max-w-[45%] shrink items-center gap-2 border-r pr-4 text-[10px] font-medium uppercase tracking-[0.18em]",
            tone === "dark" ? "border-ivory-100/[0.10] text-champagne-300" : "border-border text-champagne-700",
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-champagne-500 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-champagne-500" />
          </span>
          <span className="truncate">{label}</span>
        </div>

        <div className="activity-ticker-mask min-w-0 flex-1" aria-hidden="true">
          <div className={cn("activity-ticker-track flex w-max items-center", compact ? "gap-3" : "gap-4")}>
            {loop.map((item, index) => (
              <ActivityChip
                key={`${item.desk}-${item.event}-${index}`}
                item={item}
                tone={tone}
                compact={compact}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityChip({
  item,
  tone,
  compact,
}: {
  item: ActivityItem;
  tone: "light" | "dark";
  compact: boolean;
}) {
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "flex max-w-[calc(100vw-2rem)] shrink-0 items-center gap-2 rounded-full border",
        compact ? "px-3 py-1.5" : "px-3.5 py-2",
        tone === "dark"
          ? "border-ivory-100/[0.08] bg-[#17212B]/70"
          : "border-border bg-background/80",
      )}
    >
      <Icon
        className={cn(
          "shrink-0 text-champagne-600",
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
        strokeWidth={1.6}
      />
      <span className="text-[12px] font-medium">{item.event}</span>
      <span className={cn("text-[12px]", tone === "dark" ? "text-ivory-100/42" : "text-muted-foreground")}>
        {item.desk} · {item.detail}
      </span>
    </div>
  );
}
