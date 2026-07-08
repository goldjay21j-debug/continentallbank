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
import { submitClientRefundDispute } from "@/app/actions/refunds";
import { CURRENCIES, REFUND_REASONS, type Currency } from "@/lib/constants";

export function RefundDisputeForm({
  defaultCurrency,
}: {
  defaultCurrency: Currency;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    transactionReference: "",
    currency: defaultCurrency,
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
    if (state.description.trim().length < 20) {
      toast.error("Please describe the dispute (20+ characters).");
      return;
    }
    startTransition(async () => {
      const res = await submitClientRefundDispute({
        transactionReference: state.transactionReference,
        currency: state.currency,
        amount: amt,
        reason: state.reason,
        description: state.description,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Filed.");
      setState({ ...state, amount: "", transactionReference: "", description: "" });
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-2">
          New dispute
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground">
          File a refund dispute
        </h3>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Your banker will review the dispute and reply directly.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionReference">Transaction reference (if you have it)</Label>
        <Input
          id="transactionReference"
          value={state.transactionReference}
          onChange={(e) => setState({ ...state, transactionReference: e.target.value })}
          placeholder="TX-2026-04-26-8821"
          className="tabular-figures"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={state.currency}
            onValueChange={(v) => setState({ ...state, currency: v as Currency })}
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
          <Label htmlFor="amount">Amount</Label>
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
        <Label htmlFor="description">Describe the dispute</Label>
        <Textarea
          id="description"
          rows={5}
          value={state.description}
          onChange={(e) => setState({ ...state, description: e.target.value })}
          required
          minLength={20}
          placeholder="What was wrong with this transaction, and what restitution would you like?"
        />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Submitting…" : "Submit dispute"}
        {!pending && <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
}
