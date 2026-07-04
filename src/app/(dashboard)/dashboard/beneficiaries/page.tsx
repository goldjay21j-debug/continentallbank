import Link from "next/link";
import { Banknote } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { BeneficiaryCard } from "@/components/dashboard/beneficiary-card";
import { AddBeneficiaryForm } from "@/components/dashboard/add-beneficiary-form";
import { MotionCard } from "@/components/motion/motion-card";
import { requireApprovedClient } from "@/lib/auth";
import { clientBeneficiaries } from "@/lib/portal/queries";

export const metadata = { title: "Beneficiaries" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
] as const;

export default async function BeneficiariesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireApprovedClient();
  const { status } = await searchParams;
  const all = await clientBeneficiaries(user.id);
  const list = status && status !== "all" ? all.filter((b) => b.status === status) : all;

  const approved = all.filter((b) => b.status === "approved").length;
  const pending = all.filter((b) => b.status === "pending").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Beneficiaries"
        title="Vetted withdrawal destinations."
        description="Continental only settles outbound funds to destinations a finance officer has reviewed. Add a new beneficiary and your relationship manager will verify it against your KYC file."
      />

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={String(all.length)} />
        <Stat
          label="Approved"
          value={String(approved)}
          tone={approved > 0 ? "accent" : "default"}
        />
        <Stat
          label="Awaiting review"
          value={String(pending)}
          tone={pending > 0 ? "accent" : "default"}
        />
        <Stat
          label="Default routes"
          value={String(all.filter((b) => b.is_default).length)}
        />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = (status ?? "all") === f.value;
          const count =
            f.value === "all" ? all.length : all.filter((b) => b.status === f.value).length;
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/dashboard/beneficiaries" : `/dashboard/beneficiaries?status=${f.value}`}
              className={
                "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors inline-flex items-center gap-1.5 " +
                (active
                  ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                  : "border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]")
              }
            >
              <span>{f.label}</span>
              <span className="tabular-figures opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      {list.length === 0 ? (
        <MotionCard className="p-10 text-center">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03] mb-3">
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-medium text-foreground">No beneficiaries here.</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add your first destination below.
          </p>
        </MotionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((b, i) => (
            <BeneficiaryCard key={b.id} beneficiary={b} index={i} />
          ))}
        </div>
      )}

      <AddBeneficiaryForm />
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className="glass-card p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div
        className={
          "mt-2 font-display text-2xl font-semibold tabular-figures " +
          (tone === "accent" ? "text-champagne-700 dark:text-champagne-300" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
