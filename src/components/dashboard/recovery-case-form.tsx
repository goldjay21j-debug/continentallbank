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
import {
  CURRENCIES,
  RECOVERY_CASE_TYPES,
  type Currency,
  type RecoveryCaseType,
} from "@/lib/constants";

export function RecoveryCaseForm({ defaultCurrency = "USD" }: { defaultCurrency?: Currency }) {
  const [title, setTitle] = useState("");
  const [complaintType, setComplaintType] = useState<RecoveryCaseType>(RECOVERY_CASE_TYPES[0].id);
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

      toast.success(result.message ?? "Investigation case filed.");
      reset();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <div className="eyebrow text-champagne-700 dark:text-champagne-400">
          Fraud recovery intake
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
          File a stolen-funds investigation
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Report romance scams, crypto wallet theft, investment fraud, wire fraud, impersonation,
          phishing, marketplace fraud, or any other recovery matter. Officers review the case and
          request evidence before escrow access can open.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="case-title">Case title</Label>
          <Input
            id="case-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Romance scam recovery involving wire transfers"
          />
        </div>

        <div className="space-y-2">
          <Label>Investigation type</Label>
          <Select
            value={complaintType}
            onValueChange={(value) => setComplaintType(value as RecoveryCaseType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECOVERY_CASE_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-[1fr_110px] gap-2">
          <div className="space-y-2">
            <Label htmlFor="amount-claimed">Estimated loss</Label>
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
          <Label htmlFor="case-summary">What happened?</Label>
          <Textarea
            id="case-summary"
            rows={5}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Explain how the scam started, dates, payment methods, wallet or bank details, profiles used, promises made, and what recovery help you need."
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="evidence-summary">Evidence available</Label>
          <Textarea
            id="evidence-summary"
            rows={3}
            value={evidenceSummary}
            onChange={(event) => setEvidenceSummary(event.target.value)}
            placeholder="List bank receipts, transaction hashes, wallet addresses, emails, phone numbers, social profiles, screenshots, contracts, police reports, or exchange tickets."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterparty-name">Suspect, platform, or company</Label>
          <Input
            id="counterparty-name"
            value={counterpartyName}
            onChange={(event) => setCounterpartyName(event.target.value)}
            placeholder="Name, alias, broker, exchange, company, or profile"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="counterparty-contact">Contact or payment reference</Label>
          <Input
            id="counterparty-contact"
            value={counterpartyContact}
            onChange={(event) => setCounterpartyContact(event.target.value)}
            placeholder="Email, phone, wallet, bank account, URL, or transaction ID"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3 text-[12.5px] text-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne-700" />
        <p>
          Submitting a case starts evidence-led officer review. Recovery is never automatic or
          guaranteed; the desk validates identity, documents, counterparties, and provider records
          before any private escrow or release step is enabled.
        </p>
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Submitting..." : "File investigation case"}
        <FileCheck2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
