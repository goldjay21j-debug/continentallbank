"use client";

import { useTransition } from "react";
import { Check, LockKeyhole, ShieldAlert, UnlockKeyhole, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { decideUser } from "@/app/actions/admin";

type Decision = "approve" | "reject" | "freeze" | "unfreeze";

export function UserDecisionActions({
  userId,
  status,
}: {
  userId: string;
  status: "pending" | "approved" | "rejected" | "suspended";
}) {
  const [pending, startTransition] = useTransition();

  function act(decision: Decision) {
    startTransition(async () => {
      const res = await decideUser({ userId, decision });
      if (!res.ok) toast.error(res.error);
      else toast.success(res.message ?? "Updated.");
    });
  }

  return (
    <div className="flex min-w-0 flex-col items-start gap-2 sm:items-end">
      <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        <ShieldAlert className="h-3.5 w-3.5" />
        Account controls
      </div>
      <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
        {status !== "approved" && status !== "suspended" && (
          <Button variant="default" size="sm" disabled={pending} onClick={() => act("approve")}>
            <Check className="h-4 w-4" /> Activate
          </Button>
        )}
        {status === "suspended" && (
          <Button variant="gold" size="sm" disabled={pending} onClick={() => act("unfreeze")}>
            <UnlockKeyhole className="h-4 w-4" /> Unfreeze account
          </Button>
        )}
        {status !== "rejected" && (
          <Button variant="outline" size="sm" disabled={pending} onClick={() => act("reject")}>
            <XCircle className="h-4 w-4" /> Reject
          </Button>
        )}
        {status !== "suspended" && (
          <Button variant="destructive" size="sm" disabled={pending} onClick={() => act("freeze")}>
            <LockKeyhole className="h-4 w-4" /> Freeze account
          </Button>
        )}
      </div>
    </div>
  );
}
