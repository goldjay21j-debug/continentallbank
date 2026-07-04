import { FileArchive } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DocumentCard } from "@/components/dashboard/document-card";
import { MotionCard } from "@/components/motion/motion-card";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { requireApprovedClient } from "@/lib/auth";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_SCENARIOS,
  type DocumentType,
} from "@/lib/portal/documents";
import { clientDocuments } from "@/lib/portal/queries";

export const metadata = { title: "Document Vault" };

const FILTERS: { value: DocumentType | "all"; label: string }[] = [
  { value: "all", label: "All documents" },
  { value: "statement", label: "Statements" },
  { value: "account_letter", label: "Account letters" },
  { value: "kyc", label: "KYC" },
  { value: "withdrawal_receipt", label: "Withdrawal receipts" },
  { value: "refund_evidence", label: "Refund evidence" },
  { value: "beneficiary_receipt", label: "Beneficiary receipts" },
  { value: "tax", label: "Tax summaries" },
];

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireApprovedClient();
  const { type } = await searchParams;

  const allDocs = await clientDocuments(user.id);
  const docs =
    type && type !== "all" ? allDocs.filter((d) => d.type === type) : allDocs;

  // Counts per type for the filter chips
  const counts = allDocs.reduce(
    (acc, d) => {
      acc[d.type] = (acc[d.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<DocumentType, number>,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Document Vault"
        title="Statements, receipts & official letters."
        description="Every document the bank has issued in your name. Open to preview; download a print-ready PDF directly from your browser."
      />

      <TrustBadgeRail preset="documents" tone="light" compact className="xl:grid-cols-3" />

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = (type ?? "all") === f.value;
          const count =
            f.value === "all"
              ? allDocs.length
              : counts[f.value as DocumentType] ?? 0;
          return (
            <a
              key={f.value}
              href={f.value === "all" ? "/dashboard/documents" : `/dashboard/documents?type=${f.value}`}
              className={
                "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors inline-flex items-center gap-1.5 " +
                (active
                  ? "border-champagne-500/40 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300"
                  : "border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]")
              }
            >
              <span>{f.label}</span>
              <span className="tabular-figures opacity-70">{count}</span>
            </a>
          );
        })}
      </div>

      {/* Grid of documents */}
      {docs.length === 0 ? (
        <MotionCard className="p-10 text-center">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03] mb-3">
            <FileArchive className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-[14px] font-medium text-foreground">
            No documents in this category.
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            New documents posted by your relationship manager will appear here.
          </p>
        </MotionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {docs.map((doc, i) => (
            <DocumentCard key={doc.id} doc={doc} index={i} />
          ))}
        </div>
      )}

      {/* Type legend / explanation */}
      <MotionCard className="p-5 sm:p-6">
        <div className="eyebrow text-champagne-700 dark:text-champagne-400 mb-3">
          About your vault
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground max-w-3xl">
          Continental Bank issues six core document classes covering{" "}
          {DOCUMENT_SCENARIOS.length} client-facing scenarios, including
          account letters, KYC confirmations, withdrawal receipts, refund
          evidence, statements, tax summaries, and service notices. Each record
          is retained for the lifetime of your relationship.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-[12.5px] text-foreground">
          {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-champagne-500/70" />
              {DOCUMENT_TYPE_LABELS[k]}
            </li>
          ))}
        </ul>
      </MotionCard>
    </div>
  );
}
