import type { EscrowContract, Profile, RecoveryCase } from "@/lib/types/database";

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
      title: "Investigation Case Required",
      description:
        "File an investment recovery case first. The escrow desk opens only after the matter has been recorded and reviewed by an officer.",
      actionHref: "/dashboard",
      actionLabel: "File investigation",
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

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
