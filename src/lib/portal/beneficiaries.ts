/**
 * Continental Bank beneficiary types and labels.
 *
 * Saved destinations and review queues are loaded from Supabase.
 */

export type BeneficiaryRail =
  | "bank_wire"
  | "sepa"
  | "uk_faster"
  | "paypal"
  | "wise"
  | "revolut"
  | "zelle"
  | "cashapp";

export type BeneficiaryStatus = "pending" | "approved" | "rejected" | "expired";

export type Beneficiary = {
  id: string;
  user_id: string;
  /** Friendly label the client picks ("Citibank - operating"). */
  nickname: string;
  /** Legal name of the recipient as it appears at the rail. */
  account_holder: string;
  rail: BeneficiaryRail;
  currency: "USD" | "EUR" | "GBP";
  /** Country of the receiving institution. */
  country: string;
  /** Masked identifier shown in lists. */
  destination_masked: string;
  /** Optional bank name for wires. */
  bank?: string;
  /** Optional notes, e.g. "Operating account; weekly transfers". */
  notes?: string;
  status: BeneficiaryStatus;
  /** True if this is the client's default for the currency. */
  is_default: boolean;
  /** Captured at submission. */
  submitted_by_full_name: string;
  /** Officer who reviewed. */
  reviewed_by_full_name?: string;
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
};

export const BENEFICIARY_RAIL_LABEL: Record<BeneficiaryRail, string> = {
  bank_wire: "Bank Wire",
  sepa: "SEPA Transfer",
  uk_faster: "UK Faster Payments",
  paypal: "PayPal",
  wise: "Wise",
  revolut: "Revolut",
  zelle: "Zelle",
  cashapp: "Cash App",
};

export const BENEFICIARY_RAIL_BY_CURRENCY: Record<
  "USD" | "EUR" | "GBP",
  BeneficiaryRail[]
> = {
  USD: ["bank_wire", "paypal", "wise", "zelle", "cashapp"],
  EUR: ["sepa", "bank_wire", "paypal", "wise", "revolut"],
  GBP: ["uk_faster", "bank_wire", "paypal", "wise", "revolut"],
};

export const BENEFICIARY_STATUS_LABEL: Record<BeneficiaryStatus, string> = {
  pending: "Awaiting approval",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
};
