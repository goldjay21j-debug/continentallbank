"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/auth-mode";
import {
  issueKycDecisionReceipt,
  issueManualClientDocument,
  issueSupportReceipt,
} from "@/lib/receipts";
import type { DocumentType } from "@/lib/portal/documents";
import {
  AdminIssueDocumentSchema,
  AdminBalanceAdjustmentSchema,
  AdminCreateUserSchema,
  AdminEscrowContractUpdateSchema,
  AdminEscrowWithdrawalUpdateSchema,
  AdminRecoveredFundsEntrySchema,
  AdminRecoveryCaseUpdateSchema,
  KycDecisionSchema,
  TicketReplySchema,
  UserDecisionSchema,
} from "@/lib/validation";
import type { ActionResult } from "./withdrawals";

const LIVE_BACKEND_ERROR = "Live Supabase is not configured. Add Supabase environment variables before saving changes.";
const FINANCE_ROLE_ERROR = "Support admins cannot modify recovery funds, escrow controls, or release status.";

async function getClientMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
  };
}

function isFinanceOperator(role: string) {
  return role === "super_admin" || role === "finance_admin";
}

/* ---------------------------------------------------------- *
 *  User approval / suspension
 * ---------------------------------------------------------- */
export async function decideUser(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = UserDecisionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid decision" };

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("*")
    .eq("id", parsed.data.userId)
    .maybeSingle();
  if (!profile) return { ok: false, error: "User not found" };

  const nextStatus =
    parsed.data.decision === "approve"
      ? "approved"
      : parsed.data.decision === "reject"
        ? "rejected"
        : "suspended";

  await service
    .from("profiles")
    .update({ account_status: nextStatus })
    .eq("id", parsed.data.userId);

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: parsed.data.userId,
    action_type: `user_${parsed.data.decision}`,
    old_value: { status: profile.account_status },
    new_value: { status: nextStatus },
    note: parsed.data.note ?? null,
    ip_address: ip,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { ok: true, message: `User ${parsed.data.decision}.` };
}

/* ---------------------------------------------------------- *
 *  Client KYC verification review
 * ---------------------------------------------------------- */
export async function decideKycVerification(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = KycDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid KYC decision" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("*")
    .eq("id", parsed.data.userId)
    .maybeSingle();
  if (!profile) return { ok: false, error: "Client not found" };

  const now = new Date().toISOString();
  const { error } = await service
    .from("profiles")
    .update({
      kyc_status: parsed.data.decision,
      is_verified: parsed.data.decision === "approved",
      kyc_reviewed_at: now,
      kyc_reviewed_by_admin_id: admin.id,
      kyc_review_note: parsed.data.note ?? null,
    })
    .eq("id", parsed.data.userId);
  if (error) return { ok: false, error: error.message };

  if (parsed.data.decision === "approved" || parsed.data.decision === "rejected") {
    await service.from("recovery_kyc_reviews").insert({
      user_id: parsed.data.userId,
      kyc_submission_id: null,
      admin_id: admin.id,
      decision: parsed.data.decision === "approved" ? "verified" : "declined",
      note: parsed.data.note ?? null,
    });
  }

  await issueKycDecisionReceipt(
    service,
    profile,
    parsed.data.decision,
    admin.id,
    parsed.data.note,
  );

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: parsed.data.userId,
    action_type: `kyc_${parsed.data.decision}`,
    old_value: { status: profile.kyc_status },
    new_value: {
      status: parsed.data.decision,
      is_verified: parsed.data.decision === "approved",
      method: profile.kyc_method,
      document: profile.kyc_document_name,
    },
    note: parsed.data.note ?? null,
    ip_address: ip,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: `KYC ${parsed.data.decision.replace("_", " ")}.` };
}

/* ---------------------------------------------------------- *
 *  Recovery case, escrow, recovered funds, and release controls
 * ---------------------------------------------------------- */
export async function updateRecoveryCase(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = AdminRecoveryCaseUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid recovery case update" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data: recoveryCase } = await service
    .from("cases")
    .select("*")
    .eq("id", parsed.data.caseId)
    .maybeSingle();
  if (!recoveryCase) return { ok: false, error: "Recovery case not found" };

  const { error } = await service
    .from("cases")
    .update({
      status: parsed.data.status,
      provider_reference: parsed.data.providerReference || null,
      assigned_to_admin_id:
        parsed.data.status === "assigned" || parsed.data.status === "under_review"
          ? admin.id
          : recoveryCase.assigned_to_admin_id,
    })
    .eq("id", parsed.data.caseId);
  if (error) return { ok: false, error: error.message };

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: recoveryCase.user_id,
    action_type: "recovery_case_update",
    old_value: {
      status: recoveryCase.status,
      provider_reference: recoveryCase.provider_reference,
    },
    new_value: {
      status: parsed.data.status,
      provider_reference: parsed.data.providerReference || null,
    },
    note: parsed.data.note || null,
    ip_address: ip,
  });

  await service.from("notifications").insert({
    user_id: recoveryCase.user_id,
    kind: "account",
    severity: parsed.data.status === "rejected" ? "danger" : "info",
    title: "Recovery file updated",
    body: `Your recovery file is now ${parsed.data.status.replace(/_/g, " ")}.`,
    href: "/dashboard",
    currency: recoveryCase.currency,
    amount_label: null,
    read: false,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/recovery");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/escrow");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Recovery case updated." };
}

export async function updateEscrowContract(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!isFinanceOperator(admin.profile.role)) return { ok: false, error: FINANCE_ROLE_ERROR };

  const parsed = AdminEscrowContractUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid escrow update" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data: contract } = await service
    .from("escrow_contracts")
    .select("*")
    .eq("id", parsed.data.contractId)
    .maybeSingle();
  if (!contract) return { ok: false, error: "Escrow contract not found" };

  const { error } = await service
    .from("escrow_contracts")
    .update({
      status: parsed.data.status,
      release_status: parsed.data.releaseStatus,
      release_conditions_open: parsed.data.releaseConditionsOpen,
      provider_reference: parsed.data.providerReference || null,
    })
    .eq("id", parsed.data.contractId);
  if (error) return { ok: false, error: error.message };

  if (["active", "ready_for_release", "release_approved"].includes(parsed.data.status)) {
    await service
      .from("profiles")
      .update({
        escrow_account_status: "active",
        escrow_account_reference: contract.reference,
        escrow_account_opened_at: contract.created_at,
      })
      .eq("id", contract.user_id);
  }

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: contract.user_id,
    action_type: "escrow_contract_update",
    currency: contract.currency,
    old_value: {
      status: contract.status,
      release_status: contract.release_status,
      release_conditions_open: contract.release_conditions_open,
      provider_reference: contract.provider_reference,
    },
    new_value: {
      status: parsed.data.status,
      release_status: parsed.data.releaseStatus,
      release_conditions_open: parsed.data.releaseConditionsOpen,
      provider_reference: parsed.data.providerReference || null,
    },
    note: parsed.data.note || null,
    ip_address: ip,
  });

  await service.from("notifications").insert({
    user_id: contract.user_id,
    kind: "account",
    severity: parsed.data.releaseStatus === "eligible" ? "success" : "info",
    title: "Escrow status updated",
    body: "Your escrow account has been updated after secure release review.",
    href: "/dashboard/escrow",
    currency: contract.currency,
    amount_label: null,
    read: false,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/recovery");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/escrow");
  revalidatePath("/dashboard/withdraw");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Escrow controls updated." };
}

export async function recordRecoveredFunds(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!isFinanceOperator(admin.profile.role)) return { ok: false, error: FINANCE_ROLE_ERROR };

  const parsed = AdminRecoveredFundsEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid recovered funds entry" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data: contract } = await service
    .from("escrow_contracts")
    .select("*")
    .eq("id", parsed.data.escrowContractId)
    .maybeSingle();
  if (!contract) return { ok: false, error: "Escrow contract not found" };

  const amount = parsed.data.amount;
  const { error: insertError } = await service.from("recovered_funds_entries").insert({
    escrow_contract_id: contract.id,
    case_id: contract.case_id,
    user_id: contract.user_id,
    currency: contract.currency,
    amount,
    source: parsed.data.source,
    provider_reference: parsed.data.providerReference || null,
    note: parsed.data.note || null,
    recorded_by_admin_id: admin.id,
  });
  if (insertError) return { ok: false, error: insertError.message };

  const nextTotal = Number(contract.total_recovered ?? 0) + amount;
  const nextAvailable = Number(contract.available_for_withdrawal ?? 0) + amount;
  const { error: updateError } = await service
    .from("escrow_contracts")
    .update({
      total_recovered: nextTotal,
      available_for_withdrawal: nextAvailable,
    })
    .eq("id", contract.id);
  if (updateError) return { ok: false, error: updateError.message };

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: contract.user_id,
    action_type: "recovered_funds_entry",
    currency: contract.currency,
    old_value: {
      total_recovered: contract.total_recovered,
      available_for_withdrawal: contract.available_for_withdrawal,
    },
    new_value: {
      amount,
      total_recovered: nextTotal,
      available_for_withdrawal: nextAvailable,
      source: parsed.data.source,
      provider_reference: parsed.data.providerReference || null,
    },
    note: parsed.data.note || null,
    ip_address: ip,
  });

  await service.from("notifications").insert({
    user_id: contract.user_id,
    kind: "account",
    severity: "success",
    title: "Recovered funds record posted",
    body: "A recovered funds record has been added to your secure escrow file.",
    href: "/dashboard/escrow",
    currency: contract.currency,
    amount_label: `${contract.currency} ${amount.toLocaleString()}`,
    read: false,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/recovery");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/escrow");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Recovered funds posted." };
}

export async function updateEscrowWithdrawal(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!isFinanceOperator(admin.profile.role)) return { ok: false, error: FINANCE_ROLE_ERROR };

  const parsed = AdminEscrowWithdrawalUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid release update" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const { status, feeStatus } = parsed.data;
  if (
    ["approved_for_processing", "processing", "completed", "paid"].includes(status) &&
    feeStatus !== "completed"
  ) {
    return {
      ok: false,
      error: "Release processing cannot move forward until fee verification is completed.",
    };
  }

  const service = createServiceClient();
  const { data: request } = await service
    .from("withdrawal_requests")
    .select("*")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!request || !request.escrow_contract_id) {
    return { ok: false, error: "Escrow release request not found" };
  }

  const { data: contract } = await service
    .from("escrow_contracts")
    .select("*")
    .eq("id", request.escrow_contract_id)
    .maybeSingle();
  if (!contract) return { ok: false, error: "Escrow contract missing" };

  const nextRequest = {
    status,
    fee_status: feeStatus,
    provider_status: parsed.data.providerStatus || null,
    provider_reference: parsed.data.providerReference || null,
    admin_note: parsed.data.adminNote || null,
    processed_by_admin_id: admin.id,
  };

  const { error } = await service
    .from("withdrawal_requests")
    .update(nextRequest)
    .eq("id", request.id);
  if (error) return { ok: false, error: error.message };

  const wasFinal = ["completed", "paid"].includes(request.status);
  const isFinal = ["completed", "paid"].includes(status);
  if (isFinal && !wasFinal) {
    const nextAvailable = Math.max(
      0,
      Number(contract.available_for_withdrawal ?? 0) - Number(request.amount ?? 0),
    );
    await service
      .from("escrow_contracts")
      .update({ available_for_withdrawal: nextAvailable })
      .eq("id", contract.id);
  }

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: request.user_id,
    action_type: "escrow_withdrawal_update",
    currency: request.currency,
    old_value: {
      status: request.status,
      fee_status: request.fee_status,
      provider_status: request.provider_status,
      provider_reference: request.provider_reference,
    },
    new_value: nextRequest,
    note: parsed.data.adminNote || null,
    ip_address: ip,
  });

  await service.from("notifications").insert({
    user_id: request.user_id,
    kind: "withdrawal",
    severity: status === "rejected" || status === "failed" ? "danger" : "info",
    title: "Release request updated",
    body: `Your release request is now ${status.replace(/_/g, " ")}.`,
    href: "/dashboard/withdrawals",
    currency: request.currency,
    amount_label: `${request.currency} ${Number(request.amount).toLocaleString()}`,
    read: false,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/recovery");
  revalidatePath("/admin/withdrawals");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/escrow");
  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Release request updated." };
}

/* ---------------------------------------------------------- *
 *  Balance adjustment (deposit / withdrawal / adjustment / fee)
 *  Always writes immutable ledger + audit + client-visible tx.
 * ---------------------------------------------------------- */
export async function adjustBalance(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (admin.profile.role === "support_admin") {
    return { ok: false, error: "Support admins cannot modify balances" };
  }

  const parsed = AdminBalanceAdjustmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const { userId, currency, type, amount, description } = parsed.data;
  const service = createServiceClient();

  const { data: wallet } = await service
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("currency", currency)
    .maybeSingle();
  if (!wallet) return { ok: false, error: "Wallet not found" };

  const before = Number(wallet.available_balance);
  // Deposits, interest, transfers in: positive amount adds to balance.
  // Withdrawals, fees: positive amount removes from balance.
  const signedDelta =
    type === "deposit" || type === "interest" || type === "transfer"
      ? Math.abs(amount)
      : -Math.abs(amount);
  const after = before + signedDelta;
  if (after < 0) return { ok: false, error: "Adjustment would leave a negative balance" };

  let newWithdrawn = Number(wallet.total_withdrawn);
  if (type === "withdrawal") newWithdrawn += Math.abs(amount);

  await service
    .from("wallets")
    .update({ available_balance: after, total_withdrawn: newWithdrawn })
    .eq("id", wallet.id);

  await service.from("ledger_entries").insert({
    user_id: userId,
    wallet_id: wallet.id,
    admin_id: admin.id,
    currency,
    action_type: `admin_${type}`,
    amount: signedDelta,
    balance_before: before,
    balance_after: after,
    note: description ?? null,
  });

  await service.from("transactions").insert({
    user_id: userId,
    currency,
    type,
    amount: signedDelta,
    status: "completed",
    description: description ?? null,
    created_by_admin_id: admin.id,
  });

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: userId,
    action_type: `balance_${type}`,
    currency,
    old_value: { available_balance: before },
    new_value: { available_balance: after },
    note: description ?? null,
    ip_address: ip,
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/transactions");
  return { ok: true, message: "Adjustment posted." };
}

/* ---------------------------------------------------------- *
 *  Admin reply to support ticket
 * ---------------------------------------------------------- */
export async function replyTicket(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = TicketReplySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid ticket reply" };

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data: ticket } = await service
    .from("support_tickets")
    .select("*")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!ticket) return { ok: false, error: "Ticket not found" };

  await service
    .from("support_tickets")
    .update({
      admin_reply: parsed.data.reply,
      status: parsed.data.status,
      assigned_to_admin_id: admin.id,
    })
    .eq("id", parsed.data.id);

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: ticket.user_id,
    action_type: "support_reply",
    old_value: { status: ticket.status },
    new_value: { status: parsed.data.status },
    note: parsed.data.reply.slice(0, 280),
    ip_address: ip,
  });

  if (parsed.data.status === "resolved" || parsed.data.status === "closed") {
    await issueSupportReceipt(service, {
      userId: ticket.user_id,
      subject: ticket.subject,
      status: parsed.data.status,
      reply: parsed.data.reply,
      adminId: admin.id,
    });
  }

  revalidatePath("/admin/support");
  revalidatePath("/dashboard/support");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Reply sent." };
}

/* ---------------------------------------------------------- *
 *  Create a user manually (super_admin only)
 * ---------------------------------------------------------- */
export async function createUserAsAdmin(input: unknown): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  const parsed = AdminCreateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const data = parsed.data;
  const service = createServiceClient();

  const { data: created, error } = await service.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.fullName,
      country: data.country,
      preferred_currency: data.preferredCurrency,
      preferred_language: data.preferredLanguage,
    },
  });
  if (error || !created.user) {
    return { ok: false, error: error?.message ?? "Could not create user" };
  }

  // Apply admin-only fields (role + status) after the trigger has run.
  await service
    .from("profiles")
    .update({ role: data.role, account_status: data.status })
    .eq("id", created.user.id);

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: created.user.id,
    action_type: "user_created",
    new_value: { role: data.role, status: data.status },
    ip_address: ip,
  });

  revalidatePath("/admin/users");
  return { ok: true, message: "Account created." };
}

/* ---------------------------------------------------------- *
 *  Manual document issue / reissue
 * ---------------------------------------------------------- */
export async function issueClientDocument(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = AdminIssueDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid document" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("*")
    .eq("id", parsed.data.userId)
    .maybeSingle();
  if (!profile) return { ok: false, error: "Client not found" };

  await issueManualClientDocument(service, {
    profile,
    type: parsed.data.type as DocumentType,
    title: parsed.data.title,
    description: parsed.data.description,
    paragraph: parsed.data.paragraph,
    adminId: admin.id,
  });

  const { ip } = await getClientMeta();
  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: parsed.data.userId,
    action_type: "document_issued",
    new_value: { type: parsed.data.type, title: parsed.data.title },
    note: parsed.data.description,
    ip_address: ip,
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Document issued to client vault." };
}
