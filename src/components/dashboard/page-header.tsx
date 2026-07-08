import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow && <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-2">{eyebrow}</div>}
        <h1 className="font-display text-display-md text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
