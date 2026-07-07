"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/shared/brand-mark";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-8">
          <BrandMark />
        </div>
        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-4">
          Service interruption
        </div>
        <h1 className="font-display text-display-md text-foreground">
          A momentary issue occurred.
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
          The recovery desk has been notified. You may retry, or return to the home page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
