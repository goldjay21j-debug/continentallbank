"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Globe2,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BENEFICIARY_RAIL_LABEL,
  BENEFICIARY_STATUS_LABEL,
  type Beneficiary,
} from "@/lib/portal/beneficiaries";
import { formatDate } from "@/lib/utils";

export function BeneficiaryCard({
  beneficiary,
  index = 0,
}: {
  beneficiary: Beneficiary;
  index?: number;
}) {
  const b = beneficiary;
  const railLabel = BENEFICIARY_RAIL_LABEL[b.rail];

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.36,
        delay: 0.04 + index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2 }}
      className="glass-card flex flex-col p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/10 bg-foreground/[0.04] text-champagne-700 dark:text-champagne-300">
            <Banknote className="h-4 w-4" strokeWidth={1.7} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">
                {b.nickname}
              </h3>
              {b.is_default && (
                <Star className="h-3 w-3 text-champagne-500 fill-champagne-500" />
              )}
            </div>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">
              {railLabel} · {b.currency}
            </div>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>

      <div className="mt-4 space-y-2 text-[12.5px]">
        <Row label="Recipient" value={b.account_holder} />
        {b.bank && <Row label="Institution" value={b.bank} />}
        <Row label="Destination" value={b.destination_masked} mono />
        <Row label="Country" value={b.country} />
      </div>

      {b.notes && (
        <p className="mt-3 text-[12px] text-muted-foreground italic border-l-2 border-champagne-500/30 pl-3">
          &ldquo;{b.notes}&rdquo;
        </p>
      )}

      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Added {formatDate(b.created_at)}</span>
        {b.status === "approved" && b.reviewed_by_full_name && (
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            {b.reviewed_by_full_name}
          </span>
        )}
      </div>
    </motion.article>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span
        className={
          "min-w-0 break-words text-foreground text-right " +
          (mono ? "font-mono tabular-figures text-[12px]" : "font-medium")
        }
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: Beneficiary["status"] }) {
  const variant =
    status === "approved"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "rejected"
          ? "destructive"
          : "muted";
  return <Badge variant={variant}>{BENEFICIARY_STATUS_LABEL[status]}</Badge>;
}
