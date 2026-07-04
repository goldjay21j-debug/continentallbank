/**
 * Continental Bank document vault types and labels.
 *
 * Production records are loaded from Supabase `generated_documents`.
 */

export type DocumentType =
  | "statement"
  | "account_letter"
  | "kyc"
  | "withdrawal_receipt"
  | "refund_evidence"
  | "beneficiary_receipt"
  | "security_receipt"
  | "support_receipt"
  | "tax";

export type DocumentRecord = {
  id: string;
  user_id: string;
  type: DocumentType;
  title: string;
  description: string;
  /** Human size label, e.g. "184 KB". */
  size: string;
  /** Optional 2-letter currency tag rendered in the corner. */
  currency?: "USD" | "EUR" | "GBP";
  /** Optional reference number printed on the document. */
  reference?: string;
  created_at: string;
  /** Body content the printable HTML page renders. */
  body: {
    heading: string;
    subheading?: string;
    rows: Array<{ label: string; value: string }>;
    paragraph?: string;
    closing?: string;
  };
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  statement: "Account statement",
  account_letter: "Account letter",
  kyc: "KYC document",
  withdrawal_receipt: "Withdrawal receipt",
  refund_evidence: "Refund evidence",
  beneficiary_receipt: "Beneficiary receipt",
  security_receipt: "Security receipt",
  support_receipt: "Support receipt",
  tax: "Tax summary",
};

export const DOCUMENT_SCENARIOS = [
  "Account opening letter",
  "KYC submission receipt",
  "KYC approval or rejection notice",
  "Withdrawal submission receipt",
  "Withdrawal approval notice",
  "Withdrawal completion receipt",
  "Withdrawal rejection notice",
  "Refund claim submission receipt",
  "Refund approval or completion receipt",
  "Refund rejection notice",
  "Beneficiary submission receipt",
  "Beneficiary approval or rejection notice",
  "Monthly or quarterly statement",
  "Annual tax summary",
  "Security change receipt",
  "Support case closure receipt",
] as const;

export function docsByType(docs: DocumentRecord[]): Record<DocumentType, DocumentRecord[]> {
  return docs.reduce(
    (acc, d) => {
      acc[d.type].push(d);
      return acc;
    },
    {
      statement: [],
      account_letter: [],
      kyc: [],
      withdrawal_receipt: [],
      refund_evidence: [],
      beneficiary_receipt: [],
      security_receipt: [],
      support_receipt: [],
      tax: [],
    } as Record<DocumentType, DocumentRecord[]>,
  );
}
