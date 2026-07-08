"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Banknote, FileCheck2, LockKeyhole, ShieldCheck, type LucideIcon } from "lucide-react";
import {
  recordRecoveredFunds,
  updateEscrowContract,
  updateEscrowWithdrawal,
  updateRecoveryCase,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency, formatDateTime, maskAccountNumber } from "@/lib/utils";

const caseStatuses = [
  "submitted",
  "under_review",
  "accepted",
  "assigned",
  "recovered",
  "rejected",
  "closed",
] as const;

const escrowStatuses = [
  "pending_setup",
  "active",
  "ready_for_release",
  "release_approved",
  "frozen",
  "closed",
] as const;

const releaseStatuses = ["not_eligible", "under_review", "eligible", "blocked"] as const;

const withdrawalStatuses = [
  "pending_review",
  "awaiting_fee_completion",
  "approved",
  "approved_for_processing",
  "processing",
  "completed",
  "paid",
  "failed",
  "rejected",
  "cancelled",
] as const;

const feeStatuses = ["unpaid", "pending_verification", "completed"] as const;

type ProfileLite = {
  full_name?: string | null;
  email?: string | null;
  account_number?: string | null;
  country?: string | null;
};

export function RecoveryCaseControl({ recoveryCase }: { recoveryCase: any }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    status: recoveryCase.status as string,
    providerReference: recoveryCase.provider_reference ?? "",
    note: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateRecoveryCase({
        caseId: recoveryCase.id,
        status: state.status,
        providerReference: state.providerReference,
        note: state.note,
      });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(res.message ?? "Escrow request updated.");
        setState((current) => ({ ...current, note: "" }));
      }
    });
  }

  const profile = recoveryCase.profiles as ProfileLite | null;

  return (
    <form onSubmit={submit} className="rounded-md border border-white/[0.08] bg-white/[0.04] p-4">
      <ControlHeading
        icon={FileCheck2}
        title={recoveryCase.title}
        eyebrow={profile?.full_name ?? "Escrow request"}
        badge={formatStatus(recoveryCase.status)}
      />
      <div className="mt-3 text-[12px] text-ivory-100/46">
        {maskAccountNumber(profile?.account_number)} · {formatCurrency(recoveryCase.amount_claimed, recoveryCase.currency)}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Request status">
          <Select value={state.status} onValueChange={(status) => setState({ ...state, status })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {caseStatuses.map((status) => (
                <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Provider reference">
          <Input
            value={state.providerReference}
            onChange={(e) => setState({ ...state, providerReference: e.target.value })}
            placeholder="Provider / investigation ref"
          />
        </Field>
      </div>

      <Field label="Officer note" className="mt-3">
        <Textarea
          rows={2}
          value={state.note}
          onChange={(e) => setState({ ...state, note: e.target.value })}
          placeholder="Recorded in audit log and reflected to the client."
        />
      </Field>

      <Button type="submit" size="sm" disabled={pending} className="mt-4">
        {pending ? "Saving..." : "Update request"}
      </Button>
    </form>
  );
}

export function EscrowContractControl({ contract }: { contract: any }) {
  const [pending, startTransition] = useTransition();
  const [fundPending, startFundTransition] = useTransition();
  const [state, setState] = useState({
    status: contract.status as string,
    releaseStatus: contract.release_status as string,
    releaseConditionsOpen: contract.release_conditions_open ? "open" : "closed",
    providerReference: contract.provider_reference ?? "",
    note: "",
  });
  const [funds, setFunds] = useState({
    amount: "",
    source: "Provider approved-funds record",
    providerReference: "",
    note: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateEscrowContract({
        contractId: contract.id,
        status: state.status,
        releaseStatus: state.releaseStatus,
        releaseConditionsOpen: state.releaseConditionsOpen === "open",
        providerReference: state.providerReference,
        note: state.note,
      });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(res.message ?? "Escrow updated.");
        setState((current) => ({ ...current, note: "" }));
      }
    });
  }

  function postFunds(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(funds.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter approved funds greater than zero.");
      return;
    }
    startFundTransition(async () => {
      const res = await recordRecoveredFunds({
        escrowContractId: contract.id,
        amount,
        source: funds.source,
        providerReference: funds.providerReference,
        note: funds.note,
      });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(res.message ?? "Approved funds posted.");
        setFunds({ amount: "", source: "Provider approved-funds record", providerReference: "", note: "" });
      }
    });
  }

  const profile = contract.profiles as ProfileLite | null;

  return (
    <div className="rounded-md border border-white/[0.08] bg-navy-950/56 p-4">
      <ControlHeading
        icon={LockKeyhole}
        title={contract.reference}
        eyebrow={profile?.full_name ?? "Private escrow"}
        badge={formatStatus(contract.release_status)}
      />
      <div className="mt-3 grid gap-3 text-[12px] text-ivory-100/54 sm:grid-cols-2">
        <Metric label="Total approved" value={formatCurrency(contract.total_recovered, contract.currency)} />
        <Metric label="Available release" value={formatCurrency(contract.available_for_withdrawal, contract.currency)} />
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Escrow status">
            <Select value={state.status} onValueChange={(status) => setState({ ...state, status })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {escrowStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Release status">
            <Select value={state.releaseStatus} onValueChange={(releaseStatus) => setState({ ...state, releaseStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {releaseStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Release conditions">
            <Select
              value={state.releaseConditionsOpen}
              onValueChange={(releaseConditionsOpen) =>
                setState({ ...state, releaseConditionsOpen })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Satisfied</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Provider reference">
            <Input
              value={state.providerReference}
              onChange={(e) => setState({ ...state, providerReference: e.target.value })}
              placeholder="Provider / escrow ref"
            />
          </Field>
        </div>
        <Field label="Officer note">
          <Textarea
            rows={2}
            value={state.note}
            onChange={(e) => setState({ ...state, note: e.target.value })}
            placeholder="Why release status changed."
          />
        </Field>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Update escrow controls"}
        </Button>
      </form>

      <form onSubmit={postFunds} className="mt-5 border-t border-white/[0.08] pt-4">
        <div className="mb-3 flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] text-champagne-300">
          <Banknote className="h-3.5 w-3.5" />
          Post approved funds
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={`Amount (${contract.currency})`}>
            <Input
              inputMode="decimal"
              value={funds.amount}
              onChange={(e) => setFunds({ ...funds, amount: e.target.value })}
              placeholder="0.00"
              className="tabular-figures"
            />
          </Field>
          <Field label="Source">
            <Input
              value={funds.source}
              onChange={(e) => setFunds({ ...funds, source: e.target.value })}
              placeholder="Provider approved-funds record"
            />
          </Field>
          <Field label="Provider reference">
            <Input
              value={funds.providerReference}
              onChange={(e) => setFunds({ ...funds, providerReference: e.target.value })}
              placeholder="Provider ref"
            />
          </Field>
          <Field label="Posting note">
            <Input
              value={funds.note}
              onChange={(e) => setFunds({ ...funds, note: e.target.value })}
              placeholder="Audit note"
            />
          </Field>
        </div>
        <Button type="submit" size="sm" variant="gold" disabled={fundPending} className="mt-3">
          {fundPending ? "Posting..." : "Post approved funds"}
        </Button>
      </form>
    </div>
  );
}

export function EscrowWithdrawalControl({ request }: { request: any }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    status: request.status as string,
    feeStatus: request.fee_status as string,
    providerStatus: request.provider_status ?? "",
    providerReference: request.provider_reference ?? "",
    adminNote: request.admin_note ?? "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateEscrowWithdrawal({
        id: request.id,
        status: state.status,
        feeStatus: state.feeStatus,
        providerStatus: state.providerStatus,
        providerReference: state.providerReference,
        adminNote: state.adminNote,
      });
      if (!res.ok) toast.error(res.error);
      else toast.success(res.message ?? "Release request updated.");
    });
  }

  const profile = request.profiles as ProfileLite | null;

  return (
    <form onSubmit={submit} className="rounded-md border border-white/[0.08] bg-white/[0.04] p-4">
      <ControlHeading
        icon={ShieldCheck}
        title={formatCurrency(request.amount, request.currency)}
        eyebrow={profile?.full_name ?? "Escrow release request"}
        badge={formatStatus(request.status)}
      />
      <div className="mt-3 grid gap-3 text-[12px] text-ivory-100/54 sm:grid-cols-3">
        <Metric label="Fee" value={formatCurrency(request.release_processing_fee, request.currency)} />
        <Metric label="Net payout" value={formatCurrency(request.net_amount ?? 0, request.currency)} />
        <Metric label="Submitted" value={formatDateTime(request.created_at)} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Release status">
          <Select value={state.status} onValueChange={(status) => setState({ ...state, status })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {withdrawalStatuses.map((status) => (
                <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Fee verification">
          <Select value={state.feeStatus} onValueChange={(feeStatus) => setState({ ...state, feeStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {feeStatuses.map((status) => (
                <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Provider status">
          <Input
            value={state.providerStatus}
            onChange={(e) => setState({ ...state, providerStatus: e.target.value })}
            placeholder="e.g. provider_fee_verified"
          />
        </Field>
        <Field label="Provider reference">
          <Input
            value={state.providerReference}
            onChange={(e) => setState({ ...state, providerReference: e.target.value })}
            placeholder="Payout / provider ref"
          />
        </Field>
      </div>
      <Field label="Admin note" className="mt-3">
        <Textarea
          rows={2}
          value={state.adminNote}
          onChange={(e) => setState({ ...state, adminNote: e.target.value })}
          placeholder="Client-visible release review note."
        />
      </Field>
      <Button type="submit" size="sm" disabled={pending} className="mt-4">
        {pending ? "Saving..." : "Update release request"}
      </Button>
    </form>
  );
}

function ControlHeading({
  icon: Icon,
  eyebrow,
  title,
  badge,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  badge: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-champagne-500/24 bg-champagne-500/[0.08] text-champagne-300">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[11px] uppercase tracking-[0.16em] text-ivory-100/44">
            {eyebrow}
          </div>
          <div className="mt-1 truncate text-[14px] font-semibold text-ivory-100">{title}</div>
        </div>
      </div>
      <Badge variant="warning" className="shrink-0">{badge}</Badge>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-ivory-100/62">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-white/[0.07] bg-white/[0.035] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-ivory-100/36">{label}</div>
      <div className="mt-1 truncate text-[12.5px] font-medium tabular-figures text-ivory-100">
        {value}
      </div>
    </div>
  );
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}
