import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KycVerificationForm } from "@/components/dashboard/kyc-verification-form";
import { signOutAction } from "@/app/actions/auth";
import { isAdmin, requireUser } from "@/lib/auth";
import { formatAccountNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Application under review",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PendingPage() {
  const user = await requireUser();
  // Forward users who shouldn't be here.
  if (isAdmin(user.profile.role)) redirect("/admin");
  if (user.profile.account_status === "approved") redirect("/dashboard");

  const status = user.profile.account_status;

  return (
    <div className="space-y-9">
      <header>
        <Badge variant="gold" className="mb-5">
          <Hourglass className="mr-1.5 h-3 w-3" /> Under review
        </Badge>
        <h1 className="font-display text-display-md text-foreground text-balance">
          {status === "rejected"
            ? "Application declined."
            : status === "suspended"
              ? "Account suspended."
              : "Your application is under review."}
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground text-pretty">
          {status === "rejected"
            ? "Continental Bank has elected not to proceed with this application. A relationship manager has been notified and will contact you only if a review is appropriate."
            : status === "suspended"
              ? "Access to this account has been suspended pending a review. Please contact your relationship manager directly."
              : "A relationship manager is reviewing your application. You will receive an email when your account is activated. This process typically takes one business day."}
        </p>
      </header>

      <div className="glass-card p-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-[13px]">
          <div>
            <dt className="eyebrow text-muted-foreground">Account holder</dt>
            <dd className="mt-1.5 font-medium text-foreground">{user.profile.full_name}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Email</dt>
            <dd className="mt-1.5 font-medium text-foreground">{user.email}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Reference</dt>
            <dd className="mt-1.5 tabular-figures font-medium text-foreground">
              {formatAccountNumber(user.profile.account_number)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Status</dt>
            <dd className="mt-1.5">
              <Badge
                variant={
                  status === "rejected"
                    ? "destructive"
                    : status === "suspended"
                      ? "warning"
                      : "gold"
                }
              >
                {status}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>

      {status === "pending" && (
        <div className="glass-card p-6">
          <KycVerificationForm
            initial={{
              kyc_status: user.profile.kyc_status ?? "not_submitted",
              kyc_method: user.profile.kyc_method ?? null,
              kyc_document_name: user.profile.kyc_document_name ?? null,
              kyc_submitted_at: user.profile.kyc_submitted_at ?? null,
              kyc_reviewed_at: user.profile.kyc_reviewed_at ?? null,
              kyc_review_note: user.profile.kyc_review_note ?? null,
            }}
          />
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action={signOutAction}>
          <Button variant="ghost" type="submit">
            Sign out
          </Button>
        </form>
        <Button variant="outline" asChild>
          <Link href="mailto:recovery@continentallbank.com">Contact the escrow desk</Link>
        </Button>
      </div>
    </div>
  );
}
