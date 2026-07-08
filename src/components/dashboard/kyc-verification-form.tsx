"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileCheck2, ShieldCheck, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { submitKycVerification } from "@/app/actions/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KYC_METHODS, KYC_STATUS, type KycMethod, type KycStatus } from "@/lib/constants";
import type { Profile } from "@/lib/types/database";

type KycSnapshot = Pick<
  Profile,
  | "kyc_status"
  | "kyc_method"
  | "kyc_document_name"
  | "kyc_submitted_at"
  | "kyc_reviewed_at"
  | "kyc_review_note"
>;

const statusVariant: Record<KycStatus, "muted" | "warning" | "gold" | "success" | "destructive"> = {
  not_submitted: "muted",
  submitted: "warning",
  under_review: "gold",
  approved: "success",
  rejected: "destructive",
};

const statusIcon = {
  not_submitted: ShieldCheck,
  submitted: Clock3,
  under_review: Clock3,
  approved: CheckCircle2,
  rejected: AlertTriangle,
} as const;

export function KycVerificationForm({ initial }: { initial: KycSnapshot }) {
  const fallbackMethod = (initial.kyc_method ?? "passport") as KycMethod;
  const [method, setMethod] = useState<KycMethod>(fallbackMethod);
  const [file, setFile] = useState<File | null>(null);
  const [snapshot, setSnapshot] = useState(initial);
  const [pending, startTransition] = useTransition();

  const selectedMethod = useMemo(
    () => KYC_METHODS.find((m) => m.id === method) ?? KYC_METHODS[0],
    [method],
  );
  const StatusIcon = statusIcon[(snapshot.kyc_status ?? "not_submitted") as KycStatus];
  const status = (snapshot.kyc_status ?? "not_submitted") as KycStatus;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!file) {
      toast.error("Choose a verification document.");
      return;
    }

    const formData = new FormData();
    formData.set("method", method);
    formData.set("document", file);

    startTransition(async () => {
      const res = await submitKycVerification(formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? "Submitted.");
      setSnapshot({
        ...snapshot,
        kyc_status: "submitted",
        kyc_method: method,
        kyc_document_name: file.name,
        kyc_submitted_at: new Date().toISOString(),
        kyc_reviewed_at: null,
        kyc_review_note: null,
      });
      setFile(null);
      form.reset();
    });
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="eyebrow text-champagne-700 dark:text-champagne-400">
            Verification
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
            KYC review package
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Upload one accepted identity, address, or funds-source document for admin approval.
          </p>
        </div>
        <Badge variant={statusVariant[status]} className="w-fit">
          <StatusIcon className="mr-1.5 h-3 w-3" />
          {KYC_STATUS[status]}
        </Badge>
      </div>

      <div className="grid gap-3 text-[12.5px]">
        <ReviewRow label="Current method" value={labelForMethod(snapshot.kyc_method)} />
        <ReviewRow label="Document" value={snapshot.kyc_document_name ?? "No document uploaded"} />
        <ReviewRow label="Submitted" value={formatDateTime(snapshot.kyc_submitted_at)} />
        <ReviewRow label="Reviewed" value={formatDateTime(snapshot.kyc_reviewed_at)} />
      </div>

      {snapshot.kyc_review_note && (
        <div className="rounded-md border border-champagne-500/20 bg-champagne-500/5 px-4 py-3">
          <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-1">
            Compliance note
          </div>
          <p className="text-[12.5px] leading-relaxed text-foreground">
            {snapshot.kyc_review_note}
          </p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label>Verification method</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as KycMethod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KYC_METHODS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11.5px] text-muted-foreground">{selectedMethod.description}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kyc-document">Upload document</Label>
          <label
            htmlFor="kyc-document"
            className="focus-within:ring-ring/35 flex min-h-[116px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-foreground/15 bg-foreground/[0.025] px-4 py-5 text-center transition-colors hover:border-champagne-500/35 hover:bg-champagne-500/[0.04] focus-within:ring-2"
          >
            <UploadCloud className="h-5 w-5 text-champagne-600" strokeWidth={1.6} />
            <span className="mt-2 text-[13px] font-medium text-foreground">
              {file?.name ?? "Choose PDF, JPG, PNG, or WebP"}
            </span>
            <span className="mt-1 text-[11.5px] text-muted-foreground">
              Maximum size 10 MB.
            </span>
            <input
              id="kyc-document"
              name="document"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="grid gap-2 text-[12px] text-muted-foreground">
          <ChecklistItem text="Name and document number must be readable." />
          <ChecklistItem text="Address documents should be dated within 90 days." />
          <ChecklistItem text="Funds-source documents must show issuer and amount trail." />
        </div>

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Submitting..." : status === "not_submitted" ? "Submit for review" : "Submit updated document"}
          <FileCheck2 className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-foreground/[0.06] pb-2 last:border-b-0">
      <span className="shrink-0 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 max-w-[60%] break-words text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-champagne-600" />
      <span>{text}</span>
    </div>
  );
}

function labelForMethod(method: Profile["kyc_method"]) {
  return KYC_METHODS.find((m) => m.id === method)?.label ?? "Not selected";
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
