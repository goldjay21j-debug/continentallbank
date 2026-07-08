import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { requireAdmin } from "@/lib/auth";
import { adminClientRoster } from "@/lib/portal/queries";
import { formatDate, maskAccountNumber } from "@/lib/utils";
import { KYC_STATUS, ROLE_LABELS, type KycStatus, type Role } from "@/lib/constants";
import type { Profile } from "@/lib/types/database";

export const metadata = { title: "Clients" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const admin = await requireAdmin();
  const { status, q } = await searchParams;
  const profiles = (await adminClientRoster(status, q)) as Profile[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Clients"
        title="Client roster."
        description="Review applications, manage active accounts, and onboard new clients."
        actions={
          admin.profile.role === "super_admin" ? (
            <CreateUserDialog trigger={
              <Button>
                <Plus className="h-4 w-4" /> New client
              </Button>
            } />
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "pending", "approved", "rejected", "suspended"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/users${s === "all" ? "" : `?status=${s}`}`}
            className={
              "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors " +
              ((status ?? "all") === s
                ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-foreground/[0.06] bg-foreground/[0.02] px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>Client</span>
          <span>Account</span>
          <span>Country</span>
          <span>Role</span>
          <span>Status</span>
          <span>KYC</span>
          <span className="text-right">Joined</span>
        </div>
        {profiles.length === 0 ? (
          <div className="px-6 py-16 text-center text-[13px] text-muted-foreground">
            No clients matching this filter.
          </div>
        ) : (
          <ul className="divide-y divide-foreground/[0.05]">
            {profiles.map((p) => (
              <li
                key={p.id}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_auto] md:gap-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/users/${p.id}`}
                    className="break-words text-[14px] font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {p.full_name}
                  </Link>
                  <div className="text-[12px] text-muted-foreground truncate">{p.email}</div>
                </div>
                <div className="hidden md:block text-[12.5px] tabular-figures text-foreground">
                  {maskAccountNumber(p.account_number)}
                </div>
                <div className="hidden md:block text-[12.5px] text-muted-foreground">
                  {p.country ?? "—"}
                </div>
                <div className="hidden md:block text-[12.5px] text-muted-foreground">
                  {ROLE_LABELS[p.role as Role]}
                </div>
                <div className="hidden md:block">
                  <StatusBadge status={p.account_status} />
                </div>
                <div className="hidden md:block">
                  <KycBadge status={(p.kyc_status ?? "not_submitted") as KycStatus} />
                </div>
                <div className="flex min-w-0 items-center justify-self-end md:hidden">
                  <StatusBadge status={p.account_status} />
                </div>
                <div className="hidden md:flex justify-end items-center gap-2">
                  <span className="text-[12px] text-muted-foreground">
                    {formatDate(p.created_at)}
                  </span>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/users/${p.id}`} aria-label="Open">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Profile["account_status"] }) {
  const map = {
    pending: "warning",
    approved: "success",
    rejected: "destructive",
    suspended: "muted",
  } as const;
  return (
    <Badge variant={map[status]} className="capitalize">
      {status}
    </Badge>
  );
}

function KycBadge({ status }: { status: KycStatus }) {
  const map = {
    not_submitted: "muted",
    submitted: "warning",
    under_review: "gold",
    approved: "success",
    rejected: "destructive",
  } as const;
  return (
    <Badge variant={map[status]} className="capitalize">
      {KYC_STATUS[status]}
    </Badge>
  );
}
