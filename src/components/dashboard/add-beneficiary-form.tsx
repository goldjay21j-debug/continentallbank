"use client";

import { useState, useTransition } from "react";
import { Plus, ShieldCheck } from "lucide-react";
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
import { MotionCard } from "@/components/motion/motion-card";
import { submitBeneficiary } from "@/app/actions/beneficiaries";
import {
  BENEFICIARY_RAIL_BY_CURRENCY,
  BENEFICIARY_RAIL_LABEL,
  type BeneficiaryRail,
} from "@/lib/portal/beneficiaries";

const COUNTRIES = [
  "US",
  "GB",
  "CH",
  "DE",
  "FR",
  "IT",
  "ES",
  "BE",
  "LU",
  "AE",
  "SG",
  "HK",
  "JP",
  "CA",
];

export function AddBeneficiaryForm() {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    nickname: "",
    holder: "",
    currency: "USD" as "USD" | "EUR" | "GBP",
    rail: "bank_wire" as BeneficiaryRail,
    country: "US",
    bank: "",
    destination: "",
    notes: "",
  });

  const allowedRails = BENEFICIARY_RAIL_BY_CURRENCY[state.currency];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!state.nickname.trim() || !state.holder.trim() || !state.destination.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }
    startTransition(async () => {
      const res = await submitBeneficiary(state);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Beneficiary submitted for officer review.");
      setState({
        nickname: "",
        holder: "",
        currency: "USD",
        rail: "bank_wire",
        country: "US",
        bank: "",
        destination: "",
        notes: "",
      });
    });
  }

  return (
    <MotionCard className="p-5 sm:p-6">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-2">
            New destination
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground tracking-tight">
            Add a beneficiary
          </h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground max-w-2xl">
            New beneficiaries are reviewed by a finance officer before they can
            be used for a withdrawal. You will be notified when the review is
            complete — typically within the business day.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nickname" required>
            <Input
              value={state.nickname}
              onChange={(e) => setState({ ...state, nickname: e.target.value })}
              placeholder="e.g. Citibank · operating"
              required
            />
          </Field>
          <Field label="Legal name of recipient" required>
            <Input
              value={state.holder}
              onChange={(e) => setState({ ...state, holder: e.target.value })}
              placeholder="As it appears at the bank"
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Currency">
            <Select
              value={state.currency}
              onValueChange={(v) =>
                setState({
                  ...state,
                  currency: v as "USD" | "EUR" | "GBP",
                  rail: BENEFICIARY_RAIL_BY_CURRENCY[v as "USD" | "EUR" | "GBP"][0],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["USD", "EUR", "GBP"] as const).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Rail">
            <Select
              value={state.rail}
              onValueChange={(v) => setState({ ...state, rail: v as BeneficiaryRail })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedRails.map((r) => (
                  <SelectItem key={r} value={r}>
                    {BENEFICIARY_RAIL_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Country">
            <Select
              value={state.country}
              onValueChange={(v) => setState({ ...state, country: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Institution (optional)">
          <Input
            value={state.bank}
            onChange={(e) => setState({ ...state, bank: e.target.value })}
            placeholder="e.g. Citibank N.A., New York"
          />
        </Field>

        <Field label="Destination identifier" required>
          <Input
            value={state.destination}
            onChange={(e) => setState({ ...state, destination: e.target.value })}
            placeholder={destinationPlaceholder(state.rail)}
            required
            className="font-mono tabular-figures text-[13px]"
          />
          <p className="text-[11.5px] text-muted-foreground">
            {destinationHelp(state.rail)}
          </p>
        </Field>

        <Field label="Notes (optional)">
          <Textarea
            rows={3}
            value={state.notes}
            onChange={(e) => setState({ ...state, notes: e.target.value })}
            placeholder="e.g. 'For invoiced services only.'"
          />
        </Field>

        <div className="flex items-start gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3 text-[12.5px] text-foreground">
          <ShieldCheck className="h-4 w-4 mt-0.5 text-champagne-700 dark:text-champagne-400 shrink-0" />
          <p>
            A finance officer will verify this destination against your KYC file
            before approving. Outbound withdrawals can only be routed to
            approved beneficiaries.
          </p>
        </div>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit for review"}
          {!pending && <Plus className="h-4 w-4" />}
        </Button>
      </form>
    </MotionCard>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-champagne-600 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function destinationPlaceholder(rail: BeneficiaryRail) {
  switch (rail) {
    case "sepa":
      return "DE89 3704 0044 0532 0130 00";
    case "bank_wire":
      return "Account number · SWIFT/BIC";
    case "uk_faster":
      return "Sort code · account (12-34-56 · 12345678)";
    case "paypal":
    case "wise":
      return "name@example.com";
    case "revolut":
      return "@yourtag";
    case "zelle":
      return "email or US phone";
    case "cashapp":
      return "$cashtag";
    default:
      return "";
  }
}

function destinationHelp(rail: BeneficiaryRail) {
  switch (rail) {
    case "sepa":
      return "IBAN of the receiving account. Officer will request BIC.";
    case "bank_wire":
      return "Account number + SWIFT/BIC. Add any reference required by the receiving bank.";
    case "uk_faster":
      return "UK sort code (6 digits) followed by 8-digit account number.";
    case "paypal":
    case "wise":
      return "Email registered at the rail.";
    case "revolut":
      return "Revolut tag or registered phone number.";
    case "zelle":
      return "Email or US phone enrolled at Zelle.";
    case "cashapp":
      return "Cash App handle (with the leading $).";
  }
}
