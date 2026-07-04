import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AmbientBackdrop } from "@/components/shared/ambient-backdrop";
import { PageTransition } from "@/components/motion/page-transition";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin Operations",
    template: "%s · Admin Operations",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="relative min-h-screen bg-background text-foreground dark">
      <AmbientBackdrop variant="navy" />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar
          fullName={user.profile.full_name}
          email={user.email ?? ""}
          role={user.profile.role}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            fullName={user.profile.full_name}
            email={user.email ?? ""}
            role={user.profile.role}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1480px]">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
