import type {
  Dispute,
  EscrowContract,
  Profile,
  RecoveredFundsEntry,
  RecoveryCase,
} from "@/lib/types/database";
import { demoClientProfile, demoClientRoster } from "./data";

const ISO = (d: string) => new Date(d).toISOString();

export type EscrowAccessKey =
  | "case_required"
  | "identity_required"
  | "escrow_required"
  | "ready";

export type EscrowAccessState = {
  key: EscrowAccessKey;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
};

export const demoClientRecoveryCases: RecoveryCase[] = [
  {
    id: "demo-case-1",
    user_id: demoClientProfile.id,
    title: "Cross-border investment recovery",
    complaint_type: "investment_recovery",
    summary:
      "Recovery desk accepted the complaint, verified submitted evidence, and escalated the matter through provider recovery channels.",
    evidence_summary:
      "Wire confirmations, counterparty correspondence, beneficiary identity records, and settlement communications.",
    counterparty_name: "Alpine Treasury Services",
    counterparty_contact: "recoveries@alpine-treasury.example",
    amount_claimed: 104611300,
    currency: "USD",
    status: "recovered",
    assigned_to_admin_id: "demo-officer-0001",
    provider_reference: "REC-GVA-2026-1197",
    created_at: ISO("2026-05-07T09:15:00Z"),
    updated_at: ISO("2026-05-18T11:42:00Z"),
  },
];

export const demoClientEscrowContracts: EscrowContract[] = [
  {
    id: "demo-escrow-1",
    user_id: demoClientProfile.id,
    case_id: "demo-case-1",
    reference: "ESC-CB4910-2026-017",
    status: "ready_for_release",
    release_status: "eligible",
    release_conditions_open: false,
    provider_reference: "PRV-REC-774291",
    currency: "USD",
    total_recovered: 104611300,
    available_for_withdrawal: 104611300,
    created_at: ISO("2026-05-18T10:30:00Z"),
    updated_at: ISO("2026-05-20T13:18:00Z"),
  },
];

export const demoClientRecoveredFunds: RecoveredFundsEntry[] = [
  {
    id: "demo-recovered-1",
    escrow_contract_id: "demo-escrow-1",
    case_id: "demo-case-1",
    user_id: demoClientProfile.id,
    currency: "USD",
    amount: 48600000,
    source: "Provider recovery ledger",
    provider_reference: "PRV-REC-774291-A",
    note: "First recovered tranche reconciled by operations.",
    recorded_by_admin_id: "demo-officer-0001",
    created_at: ISO("2026-05-18T12:00:00Z"),
  },
  {
    id: "demo-recovered-2",
    escrow_contract_id: "demo-escrow-1",
    case_id: "demo-case-1",
    user_id: demoClientProfile.id,
    currency: "USD",
    amount: 56011300,
    source: "Counterparty reserve return",
    provider_reference: "PRV-REC-774291-B",
    note: "Final recovered tranche confirmed for escrow availability.",
    recorded_by_admin_id: "demo-officer-0001",
    created_at: ISO("2026-05-20T13:18:00Z"),
  },
];

export const demoClientDisputes: Dispute[] = [];

export const demoAdminRecoveryCases = demoClientRecoveryCases.map((recoveryCase) => ({
  ...recoveryCase,
  profiles: profileFor(recoveryCase.user_id),
}));

export const demoAdminEscrowContracts = demoClientEscrowContracts.map((contract) => ({
  ...contract,
  profiles: profileFor(contract.user_id),
  cases: demoClientRecoveryCases.find((recoveryCase) => recoveryCase.id === contract.case_id) ?? null,
}));

export const demoAdminRecoveredFunds = demoClientRecoveredFunds.map((entry) => ({
  ...entry,
  profiles: profileFor(entry.user_id),
  cases: demoClientRecoveryCases.find((recoveryCase) => recoveryCase.id === entry.case_id) ?? null,
  escrow_contracts:
    demoClientEscrowContracts.find((contract) => contract.id === entry.escrow_contract_id) ?? null,
}));

export function isRecoveryVerified(profile: Profile) {
  return profile.is_verified || profile.kyc_status === "approved";
}

export function recoveryAccessState(
  profile: Profile,
  recoveryCases: RecoveryCase[],
  escrowContract?: EscrowContract | null,
): EscrowAccessState {
  if (recoveryCases.length === 0) {
    return {
      key: "case_required",
      title: "Recovery Case Required",
      description:
        "Create a recovery complaint first. The escrow desk opens only after a case has been recorded and reviewed.",
      actionHref: "/dashboard",
      actionLabel: "Start recovery case",
    };
  }

  if (!isRecoveryVerified(profile)) {
    return {
      key: "identity_required",
      title: "Identity Verification Required",
      description:
        "Upload an accepted KYC document so an officer can approve your identity before private escrow access is activated.",
      actionHref: "/dashboard/profile",
      actionLabel: "Upload KYC",
    };
  }

  if (profile.escrow_account_status !== "active" || !escrowContract) {
    return {
      key: "escrow_required",
      title: "Create Secure Escrow Account",
      description:
        "Your case and identity are ready. Create the private escrow account that will hold recovered funds under officer control.",
      actionHref: "/dashboard/escrow",
      actionLabel: "Create escrow",
    };
  }

  return {
    key: "ready",
    title: "Escrow Dashboard Active",
    description:
      "Recovered funds, release conditions, provider references, and withdrawal eligibility are now available in your private escrow view.",
    actionHref: "/dashboard/escrow",
    actionLabel: "Open escrow",
  };
}

export function calculateReleaseFee(amount: number) {
  const releaseProcessingFee = roundMoney(amount * 0.2);
  return {
    amount: roundMoney(amount),
    releaseProcessingFee,
    netAmount: roundMoney(amount - releaseProcessingFee),
    percentage: 20,
  };
}

function profileFor(userId: string) {
  const profile = demoClientRoster.find((p) => p.id === userId) ?? demoClientProfile;
  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    account_number: profile.account_number,
    country: profile.country,
    kyc_status: profile.kyc_status,
    is_verified: profile.is_verified,
    escrow_account_status: profile.escrow_account_status,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
