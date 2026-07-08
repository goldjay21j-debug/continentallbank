"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Apple-style morphing dialog.
 *
 * The trigger button visually morphs into the modal container using a
 * shared `layoutId`. Framer Motion interpolates position, size, and
 * border-radius so the button continuously expands into the dialog
 * rather than the dialog appearing as a separate surface.
 *
 * Usage:
 *
 *   <MorphDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     layoutId="create-client"
 *     trigger={(p) => <button {...p}>New client</button>}
 *   >
 *     <MorphDialog.Header>
 *       <MorphDialog.Title>Create new client</MorphDialog.Title>
 *       <MorphDialog.Description>…</MorphDialog.Description>
 *     </MorphDialog.Header>
 *     {/* body * /}
 *   </MorphDialog>
 */

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeInOut = [0.65, 0, 0.35, 1] as [number, number, number, number];

type MorphDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutId: string;
  /** Function returning the trigger button. Receives `data-state` and event handlers from Radix. */
  trigger: (
    triggerProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      ref: React.Ref<HTMLButtonElement>;
    },
  ) => React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function MorphDialogRoot({
  open,
  onOpenChange,
  layoutId,
  trigger,
  children,
  className,
}: MorphDialogProps) {
  const reduce = useReducedMotion();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {!open && (
          <motion.div
            key="trigger"
            layoutId={reduce ? undefined : layoutId}
            transition={{ duration: 0.36, ease: easeInOut }}
            className="inline-block"
          >
            <DialogPrimitive.Trigger asChild>
              {trigger({ ref: triggerRef })}
            </DialogPrimitive.Trigger>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
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
                  layoutId={reduce ? undefined : layoutId}
                  initial={reduce ? { opacity: 0, scale: 0.98 } : false}
                  animate={reduce ? { opacity: 1, scale: 1 } : undefined}
                  exit={reduce ? { opacity: 0, scale: 0.98 } : undefined}
                  transition={{ duration: 0.36, ease: easeInOut }}
                  className={cn(
                    "pointer-events-auto relative max-h-[calc(100dvh-3rem)] w-full max-w-xl overflow-y-auto glass-strong p-5 sm:p-7",
                    className,
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{
                      duration: 0.24,
                      ease: easeOut,
                      delay: reduce ? 0 : 0.12,
                    }}
                  >
                    {children}
                  </motion.div>

                  <DialogPrimitive.Close className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground opacity-70 transition-all duration-200 hover:opacity-100 hover:bg-foreground/[0.08] focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne-500">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

const MorphDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />
);

const MorphDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight", className)}
    {...props}
  />
));
MorphDialogTitle.displayName = "MorphDialogTitle";

const MorphDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
MorphDialogDescription.displayName = "MorphDialogDescription";

const MorphDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);

export const MorphDialog = Object.assign(MorphDialogRoot, {
  Header: MorphDialogHeader,
  Title: MorphDialogTitle,
  Description: MorphDialogDescription,
  Footer: MorphDialogFooter,
  Close: DialogPrimitive.Close,
});
