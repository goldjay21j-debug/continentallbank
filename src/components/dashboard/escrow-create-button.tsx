"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { createSecureEscrowAccount } from "@/app/actions/recovery";
import { Button } from "@/components/ui/button";

export function EscrowCreateButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function createEscrow() {
    startTransition(async () => {
      const result = await createSecureEscrowAccount();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Escrow account created.");
      router.refresh();
      router.push("/dashboard/escrow");
    });
  }

  return (
    <Button type="button" onClick={createEscrow} disabled={pending} className={className}>
      {pending ? "Creating..." : "Create secure escrow"}
      <LockKeyhole className="h-4 w-4" />
    </Button>
  );
}
