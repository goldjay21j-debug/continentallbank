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
  KycDecisionSchema,
  TicketReplySchema,
  UserDecisionSchema,
} from "@/lib/validation";
import type { ActionResult } from "./withdrawals";

const LIVE_BACKEND_ERROR = "Live Supabase is not configured. Add Supabase environment variables before saving changes.";

async function getClientMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
  };
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
