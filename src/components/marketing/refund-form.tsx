"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitPublicRefundClaim } from "@/app/actions/refunds";
import { CURRENCIES, REFUND_REASONS } from "@/lib/constants";

export function PublicRefundForm() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [state, setState] = useState({
    claimantName: "",
    claimantEmail: "",
    claimantPhone: "",
    accountReference: "",
    transactionReference: "",
    currency: "USD" as string,
    amount: "",
    reason: REFUND_REASONS[0].id as string,
    description: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(state.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    startTransition(async () => {
      const res = await submitPublicRefundClaim({
        ...state,
        amount: amt,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Claim received.");
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="glass-light p-8 lg:p-10 text-center max-w-2xl mx-auto">
        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-3">
          Claim received
        </div>
        <h3 className="font-display text-2xl font-semibold text-foreground">
          Thank you. A recovery officer will respond.
        </h3>
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
          Your claim has been logged at <span className="font-mono">{state.claimantEmail}</span>.
          A member of our recovery desk will contact you, by email and on a recorded
          telephone line where appropriate, within one business day. Continental Bank does not
          discuss claim details over unsolicited messages.
        </p>
        <Button
          variant="outline"
          className="mt-7"
          onClick={() => {
            setSubmitted(false);
            setState({ ...state, amount: "", description: "" });
          }}
        >
          File another claim
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-light p-8 lg:p-10 space-y-7">
      <div>
        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-2">
          Refund &amp; recovery
        </div>
        <h3 className="font-display text-2xl font-semibold text-foreground">
          File a claim
        </h3>
        <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed">
          For disputed charges, failed settlements, recovery of dormant deposits, or any other
          matter requiring restitution. All claims are reviewed manually by a relationship
          officer.
        </p>
      </div>

      {/* Claimant identity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="claimantName">Full legal name</Label>
          <Input
            id="claimantName"
            value={state.claimantName}
            onChange={(e) => setState({ ...state, claimantName: e.target.value })}
            required
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="claimantEmail">Email address</Label>
          <Input
            id="claimantEmail"
            type="email"
            value={state.claimantEmail}
            onChange={(e) => setState({ ...state, claimantEmail: e.target.value })}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="claimantPhone">Phone (optional)</Label>
          <Input
            id="claimantPhone"
            type="tel"
            value={state.claimantPhone}
            onChange={(e) => setState({ ...state, claimantPhone: e.target.value })}
            autoComplete="tel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountReference">Account reference (if known)</Label>
          <Input
            id="accountReference"
            value={state.accountReference}
            onChange={(e) => setState({ ...state, accountReference: e.target.value })}
            placeholder="CB·••••·••••·••••"
            className="tabular-figures"
          />
        </div>
      </div>

      {/* Claim details */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-5">
        <div className="space-y-2">
          <Label>Reason</Label>
          <Select value={state.reason} onValueChange={(v) => setState({ ...state, reason: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFUND_REASONS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={state.currency}
            onValueChange={(v) => setState({ ...state, currency: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount in dispute</Label>
          <Input
            id="amount"
            inputMode="decimal"
            value={state.amount}
            onChange={(e) => setState({ ...state, amount: e.target.value })}
            placeholder="0.00"
            className="tabular-figures"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionReference">Transaction reference (if known)</Label>
        <Input
          id="transactionReference"
          value={state.transactionReference}
          onChange={(e) => setState({ ...state, transactionReference: e.target.value })}
          placeholder="TX-2026-04-26-8821 · or any reference you have"
          className="tabular-figures"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Describe the claim</Label>
        <Textarea
          id="description"
          rows={6}
          value={state.description}
          onChange={(e) => setState({ ...state, description: e.target.value })}
          required
          minLength={20}
          placeholder="What happened, when, and what restitution you are seeking. Avoid including passwords, OTPs, or full payment credentials."
        />
        <p className="text-[11.5px] text-muted-foreground">
          Continental Bank will never ask for passwords, security codes, or full card details
          through this form.
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <p className="text-[11.5px] text-muted-foreground max-w-md">
          By submitting you confirm that the information provided is accurate to the best of your
          knowledge.
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit claim"}
          {!pending && <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
