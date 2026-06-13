"use client";

import { useState, useTransition } from "react";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createRecoveryCase } from "@/app/actions/recovery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES, type Currency } from "@/lib/constants";

const complaintTypes = [
  { id: "investment_recovery", label: "Investment recovery" },
  { id: "wire_recall", label: "Wire recall" },
  { id: "escrow_dispute", label: "Escrow dispute" },
  { id: "beneficiary_fraud", label: "Beneficiary fraud" },
  { id: "inheritance_recovery", label: "Inheritance recovery" },
  { id: "other", label: "Other recovery matter" },
];

export function RecoveryCaseForm({ defaultCurrency = "USD" }: { defaultCurrency?: Currency }) {
  const [title, setTitle] = useState("");
  const [complaintType, setComplaintType] = useState(complaintTypes[0].id);
  const [summary, setSummary] = useState("");
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [counterpartyContact, setCounterpartyContact] = useState("");
  const [amountClaimed, setAmountClaimed] = useState("");
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setSummary("");
    setEvidenceSummary("");
    setCounterpartyName("");
    setCounterpartyContact("");
    setAmountClaimed("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(amountClaimed || 0);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Enter a valid recovery amount.");
      return;
    }

    startTransition(async () => {
      const result = await createRecoveryCase({
        title,
        complaintType,
        summary,
        evidenceSummary,
        counterpartyName,
        counterpartyContact,
        amountClaimed: amount,
        currency,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message ?? "Recovery case submitted.");
      reset();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <div className="eyebrow text-champagne-700 dark:text-champagne-400">
          Recovery intake
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
          Open a recovery case
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Start with the complaint and evidence summary. Officers can request uploads and provider
          details after intake review.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="case-title">Case title</Label>
          <Input
            id="case-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Cross-border investment recovery"
          />
        </div>

        <div className="space-y-2">
          <Label>Complaint type</Label>
          <Select value={complaintType} onValueChange={setComplaintType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {complaintTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-[1fr_110px] gap-2">
          <div className="space-y-2">
            <Label htmlFor="amount-claimed">Estimated amount</Label>
            <Input
              id="amount-claimed"
              inputMode="decimal"
              value={amountClaimed}
              onChange={(event) => setAmountClaimed(event.target.value)}
              placeholder="0.00"
              className="tabular-figures"
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="case-summary">Complaint summary</Label>
          <Textarea
            id="case-summary"
            rows={5}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Explain what happened, when it happened, the parties involved, and the outcome you are requesting."
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="evidence-summary">Evidence summary</Label>
          <Textarea
            id="evidence-summary"
            rows={3}
            value={evidenceSummary}
            onChange={(event) => setEvidenceSummary(event.target.value)}
            placeholder="List wire receipts, IDs, correspondence, contracts, screenshots, or other evidence ready for officer review."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterparty-name">Counterparty</Label>
          <Input
            id="counterparty-name"
            value={counterpartyName}
            onChange={(event) => setCounterpartyName(event.target.value)}
            placeholder="Company or person involved"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="counterparty-contact">Counterparty contact</Label>
          <Input
            id="counterparty-contact"
            value={counterpartyContact}
            onChange={(event) => setCounterpartyContact(event.target.value)}
            placeholder="Email, phone, or reference"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3 text-[12.5px] text-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne-700" />
        <p>
          Submitting a case does not release funds. The recovery desk reviews evidence, requests
          KYC if needed, and only then activates private escrow access.
        </p>
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Submitting..." : "Submit recovery case"}
        <FileCheck2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
