"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { adjustBalance } from "@/app/actions/admin";
import { CURRENCIES, TRANSACTION_TYPES, type Currency, type TransactionType } from "@/lib/constants";

export function BalanceAdjustForm({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    currency: "USD" as Currency,
    type: "deposit" as TransactionType,
    amount: "",
    description: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(state.amount);
    if (!Number.isFinite(amt) || amt === 0) {
      toast.error("Enter an amount.");
      return;
    }
    startTransition(async () => {
      const res = await adjustBalance({
        userId,
        currency: state.currency,
        type: state.type,
        amount: amt,
        description: state.description || undefined,
      });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(res.message ?? "Posted.");
        setState({ ...state, amount: "", description: "" });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={state.currency} onValueChange={(v) => setState({ ...state, currency: v as Currency })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={state.type} onValueChange={(v) => setState({ ...state, type: v as TransactionType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TRANSACTION_TYPES).map(([k, label]) => (
                <SelectItem key={k} value={k}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Amount</Label>
          <Input
            inputMode="decimal"
            value={state.amount}
            onChange={(e) => setState({ ...state, amount: e.target.value })}
            className="tabular-figures"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Note (required for audit)</Label>
        <Textarea
          rows={2}
          value={state.description}
          onChange={(e) => setState({ ...state, description: e.target.value })}
          placeholder="e.g. ‘Q3 interest credit per banker note 2026-05-19.’"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Posting…" : "Post adjustment"}
        </Button>
        <p className="text-[11.5px] text-muted-foreground">
          Deposit / interest / transfer add funds. Withdrawal / fee deduct.
        </p>
      </div>
    </form>
  );
}
