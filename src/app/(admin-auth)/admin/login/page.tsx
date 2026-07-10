import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Activity, Database, FileLock2, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { BrandMark } from "@/components/shared/brand-mark";
import { Skeleton } from "@/components/ui/skeleton";
import { adminBasePathForHost, adminHref } from "@/lib/admin-routing";

export const metadata: Metadata = {
  title: "Administration Portal",
  description: "Officer-only access to Continental Bank administration.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const h = await headers();
  const adminBasePath = adminBasePathForHost(h.get("host"));

  return (
    <main id="main-content" tabIndex={-1} className="relative min-h-screen overflow-x-hidden bg-[#050B13] text-ivory-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(200,169,106,0.16), transparent 30%), radial-gradient(circle at 84% 18%, rgba(75,111,143,0.2), transparent 28%), linear-gradient(135deg, #050B13 0%, #0B1722 52%, #050B13 100%)",
        }}
      />

      <div className="relative mx-auto grid min-h-screen w-full min-w-0 max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:px-10">
        <section className="flex min-w-0 flex-col justify-between">
          <Link
            href={adminHref(adminBasePath, "/admin/login")}
            className="focus-ring w-fit rounded-sm"
          >
            <BrandMark variant="light" />
          </Link>

          <div className="max-w-2xl py-16 lg:py-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-champagne-500/20 bg-champagne-500/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Continental Administration
            </div>
            <h1 className="font-display text-5xl font-semibold leading-tight text-ivory-100 text-balance lg:text-6xl">
              Officer command, separated from client access.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ivory-100/66">
              The administration portal is reserved for approved operators with role-scoped
              privileges, audit logging, client oversight, compliance review, and treasury control.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <AdminAssurance icon={FileLock2} label="Role scoped" />
              <AdminAssurance icon={Activity} label="Audit visible" />
              <AdminAssurance icon={Database} label="Live Supabase" />
            </div>
          </div>

          <div className="hidden text-[11px] uppercase tracking-[0.18em] text-ivory-100/42 lg:block">
            Admin portal · Compliance · Operations · Support
          </div>
        </section>

        <section className="flex min-w-0 items-center justify-center">
          <div className="w-full min-w-0 rounded-md border border-white/[0.10] bg-white/[0.065] p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-8">
            <header className="mb-8">
              <div className="eyebrow mb-3 text-champagne-300">Officer sign in</div>
              <h2 className="font-display text-3xl font-semibold text-ivory-100">
                Administration portal
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ivory-100/58">
                Use an approved admin, finance, or support officer account.
              </p>
            </header>

            <Suspense fallback={<AdminLoginSkeleton />}>
              <AdminLoginForm basePath={adminBasePath} />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminAssurance({
  icon: Icon,
  label,
}: {
  icon: typeof FileLock2;
  label: string;
}) {
  return (
    <div className="rounded-md border border-white/[0.09] bg-white/[0.05] px-3.5 py-3">
      <Icon className="mb-2 h-4 w-4 text-champagne-300" />
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory-100/74">
        {label}
      </div>
    </div>
  );
}

function AdminLoginSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
