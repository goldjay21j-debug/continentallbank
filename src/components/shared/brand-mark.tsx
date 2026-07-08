import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "default" | "light" | "dark";
  withWordmark?: boolean;
};

/**
 * Continental Bank wordmark.
 * Premium typographic mark — no childish iconography.
 *
 * Mark composed of a hand-set crested monogram "CB" inside a hairline shield,
 * paired with the wordmark and "EST. 1972" plate.
 */
export function BrandMark({ className, variant = "default", withWordmark = true }: Props) {
  const colorText =
    variant === "light"
      ? "text-ivory-100"
      : variant === "dark"
        ? "text-navy-900"
        : "text-foreground";

  const colorAccent =
    variant === "light" ? "text-champagne-400" : "text-champagne-600";

  return (
    <div className={cn("inline-flex min-w-0 items-center gap-3 select-none", className)}>
      <svg viewBox="0 0 44 44" className="h-8 w-8 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="cb-gold" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#DBBC72" />
            <stop offset="100%" stopColor="#B08D4E" />
          </linearGradient>
        </defs>
        <path
          d="M22 1.5 L41 7.5 V22 C41 33 33 39.5 22 42.5 C11 39.5 3 33 3 22 V7.5 Z"
          fill="none"
          stroke="url(#cb-gold)"
          strokeWidth="1.2"
        />
        <text
          x="22"
          y="27"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="14"
          fontWeight="500"
          letterSpacing="0.5"
          fill="url(#cb-gold)"
        >
          CB
        </text>
      </svg>
      {withWordmark && (
        <div className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "truncate font-display text-[15px] font-semibold tracking-[0.06em] uppercase",
              colorText,
            )}
          >
            Continental
          </span>
          <span
            className={cn(
              "mt-0.5 truncate text-[9.5px] uppercase tracking-[0.32em]",
              colorAccent,
            )}
          >
            Private · Bank
          </span>
        </div>
      )}
    </div>
  );
}
