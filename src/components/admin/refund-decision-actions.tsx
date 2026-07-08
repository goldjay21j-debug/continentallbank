"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, Eye, XCircle, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { decideRefundClaim } from "@/app/actions/refunds";
import { cn } from "@/lib/utils";

type Decision = "under_review" | "approved" | "rejected" | "completed";

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeInOut = [0.65, 0, 0.35, 1] as [number, number, number, number];

const decisionLabel: Record<Decision, string> = {
  under_review: "Mark under review",
  approved: "Approve claim",
  rejected: "Reject claim",
  completed: "Mark settled",
};

const decisionDescription: Record<Decision, string> = {
  under_review:
    "Acknowledges receipt and signals to the client that a banker is investigating.",
  approved:
    "Approves the claim. No money moves until you settle it manually and mark it completed.",
  rejected:
    "Closes the claim with a written reason. The reason will be visible to the client.",
  completed:
    "Marks the approved claim as fully settled. Use after the restitution has been sent.",
};

export function RefundDecisionActions({
  id,
  status,
}: {
  id: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "completed";
}) {
  const [open, setOpen] = useState<Decision | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const reduce = useReducedMotion();

  function act() {
    if (!open) return;
    startTransition(async () => {
      const res = await decideRefundClaim({ id, decision: open, adminNote: note || undefined });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Processed.");
      setOpen(null);
      setNote("");
    });
  }

  const layoutKey = (d: Decision) => `rc-${id}-${d}`;
  const noteRequired = open === "rejected";

  return (
    <DialogPrimitive.Root open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
      <div className="flex flex-wrap items-center gap-2">
        {status === "pending" && (
          <ActionTrigger
            layoutId={layoutKey("under_review")}
            visible={open !== "under_review"}
            onClick={() => setOpen("under_review")}
            variant="outline"
            reduce={reduce}
          >
            <Eye className="h-3.5 w-3.5" /> Under review
          </ActionTrigger>
        )}
        {(status === "pending" || status === "under_review") && (
          <>
            <ActionTrigger
              layoutId={layoutKey("approved")}
              visible={open !== "approved"}
              onClick={() => setOpen("approved")}
              variant="default"
              reduce={reduce}
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </ActionTrigger>
            <ActionTrigger
              layoutId={layoutKey("rejected")}
              visible={open !== "rejected"}
              onClick={() => setOpen("rejected")}
              variant="outline"
              reduce={reduce}
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </ActionTrigger>
          </>
        )}
        {status === "approved" && (
          <ActionTrigger
            layoutId={layoutKey("completed")}
            visible={open !== "completed"}
            onClick={() => setOpen("completed")}
            variant="gold"
            reduce={reduce}
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark settled
          </ActionTrigger>
        )}
      </div>

      <AnimatePresence>
        {open !== null && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: easeOut }}
                className="fixed inset-0 z-50 glass-overlay"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center">
                <motion.div
                  layoutId={reduce ? undefined : layoutKey(open)}
                  initial={reduce ? { opacity: 0, scale: 0.98 } : false}
                  animate={reduce ? { opacity: 1, scale: 1 } : undefined}
                  exit={reduce ? { opacity: 0, scale: 0.98 } : undefined}
                  transition={{ duration: 0.36, ease: easeInOut }}
                  className="pointer-events-auto relative max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto glass-strong p-5 sm:p-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.24, ease: easeOut, delay: reduce ? 0 : 0.12 }}
                  >
                    <DialogPrimitive.Title className="text-lg font-semibold tracking-tight">
                      {decisionLabel[open]}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1.5">
                      {decisionDescription[open]}
                    </DialogPrimitive.Description>

                    <div className="mt-5 space-y-2">
                      <Label htmlFor="note">
                        Officer note {noteRequired ? "(required)" : "(optional)"}
                      </Label>
                      <Textarea
                        id="note"
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Recorded in audit log and shown to client."
                        required={noteRequired}
                      />
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button variant="ghost" onClick={() => setOpen(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={act}
                        disabled={pending || (noteRequired && !note.trim())}
                      >
                        {pending ? "Working…" : "Confirm"}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

function ActionTrigger({
  layoutId,
  visible,
  children,
  onClick,
  variant,
  reduce,
}: {
  layoutId: string;
  visible: boolean;
  children: React.ReactNode;
  onClick: () => void;
  variant: "default" | "outline" | "gold";
  reduce: boolean | null;
}) {
  const variantClass =
    variant === "gold"
      ? "bg-champagne-500 text-navy-900 hover:bg-champagne-400 shadow-[0_8px_24px_-12px_rgba(200,169,106,0.5)]"
      : variant === "outline"
        ? "border border-foreground/15 bg-foreground/[0.03] text-foreground hover:bg-foreground/[0.06]"
        : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-[0_8px_24px_-12px_rgba(7,17,31,0.4)]";

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          layoutId={reduce ? undefined : layoutId}
          onClick={onClick}
          transition={{ duration: 0.36, ease: easeInOut }}
          className={cn(
            "inline-flex min-h-8 min-w-0 max-w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-center text-xs font-medium",
            "transition-colors duration-200 focus-ring",
            variantClass,
          )}
        >
          {children}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
