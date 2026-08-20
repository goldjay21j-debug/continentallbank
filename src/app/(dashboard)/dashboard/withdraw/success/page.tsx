import Link from "next/link";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { MotionCard } from "@/components/motion/motion-card";

export const metadata = { title: "Withdrawal Submitted" };

export default function WithdrawSuccessPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Withdrawal submitted"
        title="Request sent for officer review."
        description="The withdrawal instruction has been recorded. Funds move to pending balance until the bank verifies destination details and settlement status."
        actions={
          <>
            <Button asChild>
              <Link href="/dashboard/withdrawals">View request history</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </>
        }
      />

      <MotionCard className="p-6 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <Step
            icon={CheckCircle2}
            title="Request recorded"
            body="Your withdrawal instruction is now visible to the operations desk."
          />
          <Step
            icon={ShieldCheck}
            title="Officer review"
            body="A bank officer verifies the recipient, method, and account controls before settlement."
          />
          <Step
            icon={FileText}
            title="Receipt trail"
            body="Receipts and completion documents can be issued to your secure document vault."
          />
        </div>
      </MotionCard>
    </div>
  );
}

function Step({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof CheckCircle2;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-foreground/[0.06] bg-foreground/[0.025] p-5">
      <Icon className="h-5 w-5 text-champagne-600" strokeWidth={1.6} />
      <div className="mt-4 text-[15px] font-semibold text-foreground">{title}</div>
      <p className="mt-1.5 text-[12.5px] leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}
