"use client";

import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpRight,
  FileText,
  IdCard,
  Mail,
  Receipt,
  ScrollText,
  Undo2,
  ShieldCheck,
  LifeBuoy,
  Landmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DocumentRecord, DocumentType } from "@/lib/portal/documents";
import { formatDate } from "@/lib/utils";

const ICON_MAP: Record<DocumentType, LucideIcon> = {
  statement: FileText,
  account_letter: Mail,
  kyc: IdCard,
  withdrawal_receipt: Receipt,
  refund_evidence: Undo2,
  beneficiary_receipt: Landmark,
  security_receipt: ShieldCheck,
  support_receipt: LifeBuoy,
  tax: ScrollText,
};

const TONE_MAP: Record<DocumentType, string> = {
  statement: "text-champagne-700 dark:text-champagne-300",
  account_letter: "text-champagne-700 dark:text-champagne-300",
  kyc: "text-emerald-600 dark:text-emerald-400",
  withdrawal_receipt: "text-amber-700 dark:text-amber-300",
  refund_evidence: "text-sky-700 dark:text-sky-300",
  beneficiary_receipt: "text-emerald-700 dark:text-emerald-300",
  security_receipt: "text-rose-700 dark:text-rose-300",
  support_receipt: "text-indigo-700 dark:text-indigo-300",
  tax: "text-violet-700 dark:text-violet-300",
};

export function DocumentCard({
  doc,
  index = 0,
}: {
  doc: DocumentRecord;
  index?: number;
}) {
  const Icon = ICON_MAP[doc.type];
  const url = `/api/documents/${doc.id}`;
  const filename =
    (doc.reference ? doc.reference : doc.id) + ".pdf";

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
      className="group glass-card flex flex-col p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={
            "inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/10 bg-foreground/[0.04] " +
            TONE_MAP[doc.type]
          }
        >
          <Icon className="h-4 w-4" strokeWidth={1.7} />
        </span>
        {doc.currency && (
          <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground">
            {doc.currency}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-[14px] font-semibold text-foreground tracking-tight leading-snug">
        {doc.title}
      </h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground line-clamp-2">
        {doc.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{formatDate(doc.created_at)}</span>
        <span className="tabular-figures">{doc.size}</span>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-foreground/15 bg-foreground/[0.03] px-2.5 h-8 text-[11px] font-medium text-foreground hover:bg-foreground/[0.06] transition-colors duration-200"
        >
          View
          <ArrowUpRight className="h-3 w-3" />
        </a>
        <a
          href={url}
          download={filename}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-2.5 h-8 text-[11px] font-medium hover:bg-primary/95 transition-colors duration-200"
        >
          <ArrowDownToLine className="h-3 w-3" />
          Download
        </a>
      </div>
    </motion.article>
  );
}
