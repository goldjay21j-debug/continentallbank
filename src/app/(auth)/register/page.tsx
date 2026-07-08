import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { ActivityTicker } from "@/components/shared/activity-ticker";
import { TrustBadgeRail } from "@/components/shared/trust-badges";

export const metadata: Metadata = {
  title: "File a recovery case",
  description: "Create a secure Continental Bank recovery portal profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-4">
          Investment Recovery Desk
        </div>
        <h1 className="font-display text-display-md text-foreground text-balance">
          Create your recovery case profile.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Submit your secure profile first. Once approved, you can file the investment recovery
          case, upload KYC, and continue through officer review.
        </p>
      </header>

      <RegisterForm />

      <TrustBadgeRail
        preset="auth"
        tone="dark"
        compact
        className="sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1"
      />

      <ActivityTicker preset="auth" tone="dark" label="Recovery desk" compact />
    </div>
  );
}
