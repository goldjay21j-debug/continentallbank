import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — premium transition envelope, refined cubic
  "relative inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal rounded-md text-center font-medium tracking-tight " +
    "transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-[220ms] " +
    "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] " +
    "focus-ring disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 " +
    "[&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-out " +
    "active:translate-y-px active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_rgba(7,17,31,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] " +
          "hover:bg-primary/95 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-12px_rgba(7,17,31,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] " +
          "hover:[&_svg]:translate-x-0.5",
        gold:
          "bg-champagne-500 text-navy-900 shadow-[0_8px_24px_-12px_rgba(200,169,106,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] " +
          "hover:bg-champagne-400 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-12px_rgba(200,169,106,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] " +
          "hover:[&_svg]:translate-x-0.5",
        outline:
          "border border-foreground/15 bg-foreground/[0.03] text-foreground backdrop-blur-xl " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_12px_-4px_rgba(0,0,0,0.18)] " +
          "hover:bg-foreground/[0.06] hover:border-foreground/25 hover:-translate-y-[1px]",
        ghost:
          "text-foreground hover:bg-foreground/[0.06]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_8px_24px_-12px_rgba(150,36,36,0.45)] " +
          "hover:bg-destructive/90 hover:-translate-y-[1px]",
        link: "text-foreground underline-offset-4 hover:underline",
        subtle: "bg-muted/70 text-foreground hover:bg-muted",
      },
      size: {
        default: "min-h-10 px-5 py-2 text-sm",
        sm: "min-h-8 px-3 py-1.5 text-xs",
        lg: "min-h-12 px-7 py-2.5 text-[15px]",
        xl: "min-h-14 px-9 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
