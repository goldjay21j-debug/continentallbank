"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedClient } from "@/lib/auth";
import { localAuthEnabled } from "@/lib/auth-mode";
import { isDemoMode, supabaseConfigured } from "@/lib/demo";
import { calculateReleaseFee, isRecoveryVerified } from "@/lib/demo/recovery";
import { createServiceClient } from "@/lib/supabase/server";
import { EscrowReleaseRequestSchema, RecoveryCaseSchema } from "@/lib/validation";
import type { ActionResult } from "./withdrawals";

const DEMO_MSG = "Demo mode — your changes are simulated, nothing is saved.";

export async function createRecoveryCase(input: unknown): Promise<ActionResult> {
  const user = await requireApprovedClient();
  const parsed = RecoveryCaseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid recovery case" };
  }

  if ((await isDemoMode()) || localAuthEnabled() || !supabaseConfigured()) {
    revalidatePath("/dashboard");
    return { ok: true, message: DEMO_MSG };
  }

  const data = parsed.data;
  const service = createServiceClient();
  const { data: recoveryCase, error } = await service
    .from("cases")
    .insert({
      user_id: user.id,
      title: data.title,
      complaint_type: data.complaintType,
      summary: data.summary,
      evidence_summary: data.evidenceSummary || null,
      counterparty_name: data.counterpartyName || null,
      counterparty_contact: data.counterpartyContact || null,
      amount_claimed: data.amountClaimed,
      currency: data.currency,
      status: "submitted",
    })
    .select()
    .maybeSingle();

  if (error || !recoveryCase) {
    return { ok: false, error: error?.message ?? "Could not submit recovery case" };
  }

  if (data.counterpartyName) {
    await service.from("case_parties").insert({
      case_id: recoveryCase.id,
      user_id: null,
      name: data.counterpartyName,
      email: looksLikeEmail(data.counterpartyContact) ? data.counterpartyContact : null,
      phone: looksLikeEmail(data.counterpartyContact) ? null : data.counterpartyContact || null,
      company: data.counterpartyName,
      role: "counterparty",
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/escrow");
  revalidatePath("/admin");
  return { ok: true, message: "Recovery case submitted for officer review." };
}

export async function createSecureEscrowAccount(): Promise<ActionResult> {
  const user = await requireApprovedClient();

  if (!isRecoveryVerified(user.profile)) {
    return { ok: false, error: "Complete KYC verification before opening escrow access." };
  }

  if ((await isDemoMode()) || localAuthEnabled() || !supabaseConfigured()) {
    revalidatePath("/dashboard/escrow");
    return { ok: true, message: DEMO_MSG };
  }

  const service = createServiceClient();
  const [{ data: recoveryCase }, { data: existing }] = await Promise.all([
    service
      .from("cases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    service
      .from("escrow_contracts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!recoveryCase) {
    return { ok: false, error: "Submit a recovery case before creating escrow access." };
  }

  if (existing) {
    await service
      .from("profiles")
      .update({
        escrow_account_status: "active",
        escrow_account_reference: existing.reference,
        escrow_account_opened_at: existing.created_at,
      })
      .eq("id", user.id);

    revalidatePath("/dashboard/escrow");
    return { ok: true, message: "Escrow account already exists and is active." };
  }

  const reference = escrowReference(user.profile.account_number);
  const now = new Date().toISOString();
  const { error: contractError } = await service.from("escrow_contracts").insert({
    user_id: user.id,
    case_id: recoveryCase.id,
    reference,
    status: "active",
    release_status: "not_eligible",
    release_conditions_open: true,
    currency: recoveryCase.currency,
  });

  if (contractError) return { ok: false, error: contractError.message };

  const { error: profileError } = await service
    .from("profiles")
    .update({
      escrow_account_status: "active",
      escrow_account_reference: reference,
      escrow_account_opened_at: now,
    })
    .eq("id", user.id);

  if (profileError) return { ok: false, error: profileError.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/escrow");
  revalidatePath("/admin");
  return { ok: true, message: "Secure escrow account created." };
}

export async function submitEscrowReleaseRequest(input: unknown): Promise<ActionResult> {
  const user = await requireApprovedClient();
  const parsed = EscrowReleaseRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid release request" };
  }

  if ((await isDemoMode()) || localAuthEnabled() || !supabaseConfigured()) {
    revalidatePath("/dashboard/withdraw/success");
    return { ok: true, message: DEMO_MSG };
  }

  const request = parsed.data;
  const service = createServiceClient();
  const { data: contract, error: contractError } = await service
    .from("escrow_contracts")
    .select("*")
    .eq("id", request.escrowContractId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (contractError || !contract) return { ok: false, error: "Escrow contract not found" };
  if (contract.release_status !== "eligible") {
    return { ok: false, error: "Escrow funds are not eligible for release yet." };
  }
  if (!["active", "ready_for_release", "release_approved"].includes(contract.status)) {
    return { ok: false, error: "Escrow contract is not open for release requests." };
  }
  if (request.currency !== contract.currency) {
    return { ok: false, error: "Release currency does not match the escrow contract." };
  }
  if (request.amount > Number(contract.available_for_withdrawal)) {
    return { ok: false, error: "Amount exceeds eligible escrow balance." };
  }

  const fee = calculateReleaseFee(request.amount);
  const { error } = await service.from("withdrawal_requests").insert({
    user_id: user.id,
    currency: request.currency,
    amount: fee.amount,
    method: `escrow_${request.method}`,
    payment_details: request.paymentDetails,
    notes: request.notes ?? null,
    status: "awaiting_fee_completion",
    case_id: request.caseId,
    escrow_contract_id: request.escrowContractId,
    release_processing_fee: fee.releaseProcessingFee,
    release_processing_fee_percentage: fee.percentage,
    net_amount: fee.netAmount,
    fee_status: "pending_verification",
    release_status: "eligible",
    provider_status: "awaiting_provider_fee_verification",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/withdraw");
  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/dashboard/escrow");
  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin");
  return { ok: true, message: "Release request submitted for fee verification." };
}

function escrowReference(accountNumber?: string | null) {
  const suffix = (accountNumber ?? "CB000000").replace(/\D/g, "").slice(-6).padStart(6, "0");
  return `ESC-CB${suffix}-${Date.now().toString().slice(-6)}`;
}

function looksLikeEmail(value?: string | null) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}
