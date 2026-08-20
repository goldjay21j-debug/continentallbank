"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { submitWithdrawal } from "@/app/actions/withdrawals";
import { Button } from "@/components/ui/button";
import type { Currency } from "@/lib/constants";

type Props = {
  amount: number;
  currency: Currency;
  method: string;
  paymentDetails: Record<string, string>;
  notes?: string;
};

export function WithdrawalSubmitButton(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await submitWithdrawal(props);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Withdrawal request submitted.");
      router.push("/dashboard/withdraw/success");
      router.refresh();
    });
  }

  return (
    <Button type="button" size="lg" onClick={submit} disabled={pending} className="w-full sm:w-auto">
      {pending ? "Submitting..." : "Submit withdrawal request"}
      <SendHorizontal className="h-4 w-4" />
    </Button>
  );
}
