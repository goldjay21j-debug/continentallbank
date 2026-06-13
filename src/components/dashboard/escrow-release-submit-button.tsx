"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { submitEscrowReleaseRequest } from "@/app/actions/recovery";
import { Button } from "@/components/ui/button";
import type { Currency } from "@/lib/constants";

type Props = {
  escrowContractId: string;
  caseId: string;
  amount: number;
  currency: Currency;
  method: "bank" | "card" | "paypal";
  paymentDetails: Record<string, string>;
};

export function EscrowReleaseSubmitButton(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await submitEscrowReleaseRequest(props);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Release request submitted.");
      router.push("/dashboard/withdraw/success");
      router.refresh();
    });
  }

  return (
    <Button type="button" size="lg" onClick={submit} disabled={pending} className="w-full sm:w-auto">
      {pending ? "Submitting..." : "Submit release request"}
      <SendHorizontal className="h-4 w-4" />
    </Button>
  );
}
