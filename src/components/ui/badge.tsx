import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-w-0 max-w-full items-center justify-center rounded-full border px-2.5 py-0.5 text-center text-[10.5px] font-medium uppercase tracking-[0.14em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success:
          "border-success/20 bg-success/10 text-success",
        warning:
          "border-warning/30 bg-warning/10 text-warning",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive",
        gold: "border-champagne-500/30 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300",
        muted:
          "border-border bg-muted/60 text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}

export { Badge, badgeVariants };
