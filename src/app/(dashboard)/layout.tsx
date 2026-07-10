import type { Metadata } from "next";
import { requireApprovedClient } from "@/lib/auth";
import { detectLocale } from "@/lib/i18n/detect";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { FrozenOverlay } from "@/components/dashboard/frozen-overlay";
import { PageTransition } from "@/components/motion/page-transition";
import { clientNotifications } from "@/lib/portal/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Client Dashboard",
    template: "%s · Client Dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireApprovedClient();
  const locale = await detectLocale({ preferredLocale: user.profile.preferred_language });
  const isFrozen = user.profile.account_status === "suspended";
  const notifications = await clientNotifications(user.id, 8);

  return (
    <div
      className="client-comfort relative min-h-screen bg-background text-foreground"
      data-frozen={isFrozen ? "true" : undefined}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 18% 0%, rgba(196, 156, 78, 0.12), transparent 30%), linear-gradient(180deg, #F7F8FA 0%, #F2F4F7 48%, #ECEFF3 100%)",
        }}
      />

      {isFrozen && (
        <FrozenOverlay
          frozenAt={user.profile.updated_at}
          reason={
            "Outbound activity, profile changes, and new instructions are paused pending compliance review."
          }
        />
      )}

      <div className="flex min-h-screen flex-col lg:flex-row">
        <DashboardSidebar
          fullName={user.profile.full_name}
          email={user.email ?? ""}
          accountNumber={user.profile.account_number}
          locale={locale}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar
            fullName={user.profile.full_name}
            email={user.email ?? ""}
            accountNumber={user.profile.account_number}
            locale={locale}
            notifications={notifications}
          />
          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-5 pb-12 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full min-w-0 max-w-[1500px]">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
