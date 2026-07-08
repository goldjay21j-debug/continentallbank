import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full min-w-0 max-w-full rounded-sm border border-input bg-background px-3.5 py-2 text-sm",
          "placeholder:text-muted-foreground/70 shadow-inner-soft",
          "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
          "hover:border-foreground/20",
          "focus-visible:outline-none focus-visible:border-champagne-500/70",
          "focus-visible:shadow-[0_0_0_3px_rgba(200,169,106,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
