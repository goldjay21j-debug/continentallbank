"use client";

import { useState, useTransition } from "react";
import { Check, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { decideBeneficiary } from "@/app/actions/beneficiaries";
import { cn } from "@/lib/utils";

type Decision = "approve" | "reject";

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeInOut = [0.65, 0, 0.35, 1] as [number, number, number, number];

/**
 * Approve / reject a pending beneficiary with morphing dialogs (per the
 * existing Apple-style pattern used on withdrawal decisions).
 */
export function BeneficiaryDecisionActions({ id }: { id: string }) {
  const [open, setOpen] = useState<Decision | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const reduce = useReducedMotion();

  function act() {
    if (!open) return;
    if (open === "reject" && !note.trim()) {
      toast.error("Add a reason before rejecting this beneficiary.");
      return;
    }
    startTransition(async () => {
      const res = await decideBeneficiary({
        id,
        decision: open,
        note: note.trim() || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Beneficiary updated. Client notified.");
      setOpen(null);
      setNote("");
    });
  }

  const layoutKey = (d: Decision) => `ben-${id}-${d}`;

  return (
    <DialogPrimitive.Root open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
      <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">
        <ActionTrigger
          layoutId={layoutKey("approve")}
          visible={open !== "approve"}
          onClick={() => setOpen("approve")}
          variant="default"
          reduce={reduce}
        >
          <Check className="h-4 w-4" /> Approve
        </ActionTrigger>
        <ActionTrigger
          layoutId={layoutKey("reject")}
          visible={open !== "reject"}
          onClick={() => setOpen("reject")}
          variant="outline"
          reduce={reduce}
        >
          <XCircle className="h-4 w-4" /> Reject
        </ActionTrigger>
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
                      {open === "approve" ? "Approve beneficiary" : "Reject beneficiary"}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1.5">
                      {open === "approve"
                        ? "The destination will be available for withdrawal routing. The client will be notified."
                        : "The destination will not be usable. Tell the client why so they can correct or resubmit."}
                    </DialogPrimitive.Description>

                    <div className="mt-5 space-y-2">
                      <Label htmlFor="note">
                        Officer note {open === "reject" ? "(reason)" : "(optional)"}
                      </Label>
                      <Textarea
                        id="note"
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={
                          open === "approve"
                            ? "Verified by phone with the receiving institution."
                            : "e.g. IBAN does not match recipient name on file."
                        }
                      />
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button variant="ghost" onClick={() => setOpen(null)}>
                        Cancel
                      </Button>
                      <Button onClick={act} disabled={pending}>
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
  variant: "default" | "outline";
  reduce: boolean | null;
}) {
  const variantClass =
    variant === "outline"
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
            "inline-flex min-h-9 min-w-0 max-w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 text-center text-[12.5px] font-medium",
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
