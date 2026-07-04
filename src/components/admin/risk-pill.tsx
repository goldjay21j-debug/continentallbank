import { cn } from "@/lib/utils";
import type { RiskSeverity } from "@/lib/portal/risk";
import { RISK_SEVERITY_LABEL } from "@/lib/portal/risk";

type Band = "clear" | "monitored" | "elevated" | "high" | "critical";

const BAND_STYLES: Record<Band, string> = {
  clear: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  monitored: "border-foreground/15 bg-foreground/[0.04] text-foreground/80",
  elevated: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  high: "border-orange-500/35 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
};

const BAND_LABEL: Record<Band, string> = {
  clear: "Clear",
  monitored: "Monitored",
  elevated: "Elevated",
  high: "High",
  critical: "Critical",
};

export function RiskBandPill({ band, score }: { band: Band; score: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.16em]",
        BAND_STYLES[band],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>Risk · {BAND_LABEL[band]}</span>
      <span className="tabular-figures opacity-70">· {score}</span>
    </span>
  );
}

const SEVERITY_STYLES: Record<RiskSeverity, string> = {
  low: "border-foreground/15 bg-foreground/[0.04] text-foreground/80",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  high: "border-orange-500/35 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function SeverityChip({ severity }: { severity: RiskSeverity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-medium",
        SEVERITY_STYLES[severity],
      )}
    >
      {RISK_SEVERITY_LABEL[severity]}
    </span>
  );
}
