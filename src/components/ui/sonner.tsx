"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme = "system" } = useTheme();
  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      position="bottom-right"
      richColors={false}
      duration={4500}
      gap={12}
      offset={20}
      toastOptions={{
        className:
          "max-w-[calc(100vw-1rem)] break-words border border-border bg-card text-card-foreground shadow-soft-lg rounded-md font-sans text-sm " +
          "data-[type=success]:border-success/30 data-[type=error]:border-destructive/30",
        descriptionClassName: "text-muted-foreground text-[13px]",
        style: {
          backdropFilter: "blur(8px)",
        },
      }}
    />
  );
}
