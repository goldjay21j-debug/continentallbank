import type { Profile } from "@/lib/types/database";

export type KycDocStatus = "missing" | "submitted" | "verified" | "rejected" | "expired";
export type KycDocKind = "passport" | "national_id" | "proof_of_address" | "source_of_funds" | "tax_certificate";

export type KycDocument = {
  id: string;
  user_id: string;
  kind: KycDocKind;
  status: KycDocStatus;
  issuer?: string;
  expires_at?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_full_name?: string;
  review_note?: string;
};

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskFlag = {
  id: string;
  user_id: string;
  category:
    | "pep"
    | "high_risk_jurisdiction"
    | "unusual_activity"
    | "sanctions"
    | "documentation_gap"
    | "manual_review";
  severity: RiskSeverity;
  note: string;
  raised_by_full_name: string;
  raised_at: string;
  resolved_at?: string;
  resolved_by_full_name?: string;
};

export type ComplianceEvent = {
  id: string;
  user_id: string;
  user_full_name: string;
  kind: "kyc_verified" | "kyc_rejected" | "flag_raised" | "flag_resolved" | "account_frozen" | "account_thawed";
  detail: string;
  by_full_name: string;
  at: string;
};

export const KYC_DOC_LABEL: Record<KycDocKind, string> = {
  passport: "Passport",
  national_id: "National ID",
  proof_of_address: "Proof of address",
  source_of_funds: "Source of funds",
  tax_certificate: "Tax residency certificate",
};

export const KYC_STATUS_LABEL: Record<KycDocStatus, string> = {
  missing: "Not submitted",
  submitted: "Awaiting review",
  verified: "Verified",
  rejected: "Rejected",
  expired: "Expired",
};

export const RISK_CATEGORY_LABEL: Record<RiskFlag["category"], string> = {
  pep: "PEP - Politically Exposed Person",
  high_risk_jurisdiction: "High-risk jurisdiction",
  unusual_activity: "Unusual activity",
  sanctions: "Sanctions screening",
  documentation_gap: "Documentation gap",
  manual_review: "Manual review",
};

export const RISK_SEVERITY_LABEL: Record<RiskSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export type ComplianceRosterRow = {
  profile: Profile;
  kyc: {
    total: number;
    verified: number;
    pending: number;
    expired: number;
    rejected: number;
    docs: KycDocument[];
  };
  score: {
    score: number;
    band: "clear" | "monitored" | "elevated" | "high" | "critical";
  };
  flags: RiskFlag[];
};

export type { Profile };
