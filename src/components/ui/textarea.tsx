import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[88px] w-full min-w-0 max-w-full rounded-sm border border-input bg-background px-3.5 py-2.5 text-sm",
          "placeholder:text-muted-foreground/70 shadow-inner-soft",
          "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
          "hover:border-foreground/20",
          "focus-visible:outline-none focus-visible:border-champagne-500/70",
          "focus-visible:shadow-[0_0_0_3px_rgba(200,169,106,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
