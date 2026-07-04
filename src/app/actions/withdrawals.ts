"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireApprovedClient, requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/auth-mode";
import { WithdrawalRequestSchema, WithdrawalDecisionSchema } from "@/lib/validation";
import { issueWithdrawalReceipt } from "@/lib/receipts";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const LIVE_BACKEND_ERROR = "Live Supabase is not configured. Add Supabase environment variables before saving changes.";

/**
 * CLIENT — submit a new withdrawal request.
 * Validates that the user has the available balance, then moves funds to
 * pending_balance (escrow) and writes a ledger entry. Status = 'pending'.
 */
export async function submitWithdrawal(input: unknown): Promise<ActionResult> {
  const user = await requireApprovedClient();
  const parsed = WithdrawalRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const { currency, amount, method, paymentDetails, notes } = parsed.data;
  const service = createServiceClient();

  // Lock the wallet by re-reading it via the service client.
  const { data: wallet, error: wErr } = await service
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .eq("currency", currency)
    .maybeSingle();
  if (wErr || !wallet) return { ok: false, error: "Wallet not found" };

  if (Number(wallet.available_balance) < amount) {
    return { ok: false, error: "Insufficient available balance" };
  }

  const newAvailable = Number(wallet.available_balance) - amount;
  const newPending = Number(wallet.pending_balance) + amount;

  const { data: updated, error: uErr } = await service
    .from("wallets")
    .update({ available_balance: newAvailable, pending_balance: newPending })
    .eq("id", wallet.id)
    .select()
    .maybeSingle();
  if (uErr || !updated) return { ok: false, error: "Could not reserve funds" };

  // Ledger entry — escrow movement
  await service.from("ledger_entries").insert({
    user_id: user.id,
    wallet_id: wallet.id,
    admin_id: null,
    currency,
    action_type: "withdrawal_requested",
    amount: -amount,
    balance_before: Number(wallet.available_balance),
    balance_after: newAvailable,
    note: notes ?? `Withdrawal requested via ${method}`,
  });

  // Insert the withdrawal request
  const { data: withdrawal, error: wrErr } = await service
    .from("withdrawal_requests")
    .insert({
      user_id: user.id,
      currency,
      amount,
      method,
      payment_details: paymentDetails,
      notes: notes ?? null,
      status: "pending",
    })
    .select()
    .maybeSingle();
  if (wrErr || !withdrawal) return { ok: false, error: wrErr?.message ?? "Could not file withdrawal" };

  // Client-visible transaction record
  await service.from("transactions").insert({
    user_id: user.id,
    currency,
    type: "withdrawal",
    amount: -amount,
    status: "pending",
    description: `Withdrawal requested · ${method.toUpperCase()}`,
  });

  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/dashboard/wallets");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
  await issueWithdrawalReceipt(service, user.profile, withdrawal, "pending");
  return { ok: true, message: "Withdrawal request submitted." };
}

/**
 * ADMIN — process a withdrawal request (approve / reject / complete).
 * - Approved: funds remain in pending_balance (the bank is going to send them)
 * - Completed: pending_balance decreases, total_withdrawn increases, tx -> completed
 * - Rejected: funds are returned from pending_balance back to available_balance
 */
export async function processWithdrawal(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (admin.profile.role === "support_admin") {
    return { ok: false, error: "Support admins cannot process withdrawals" };
  }

  const parsed = WithdrawalDecisionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid decision" };

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const { id, decision, adminNote } = parsed.data;
  const service = createServiceClient();

  const { data: req, error: rErr } = await service
    .from("withdrawal_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (rErr || !req) return { ok: false, error: "Request not found" };
  if (req.status === "completed" || req.status === "rejected") {
    return { ok: false, error: "Request already finalised" };
  }

  const { data: wallet } = await service
    .from("wallets")
    .select("*")
    .eq("user_id", req.user_id)
    .eq("currency", req.currency)
    .maybeSingle();
  if (!wallet) return { ok: false, error: "Wallet missing" };
  const { data: profile } = await service
    .from("profiles")
    .select("id, full_name, account_number")
    .eq("id", req.user_id)
    .maybeSingle();

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

  if (decision === "rejected") {
    const newAvailable = Number(wallet.available_balance) + Number(req.amount);
    const newPending = Math.max(0, Number(wallet.pending_balance) - Number(req.amount));
    await service
      .from("wallets")
      .update({ available_balance: newAvailable, pending_balance: newPending })
      .eq("id", wallet.id);

    await service.from("ledger_entries").insert({
      user_id: req.user_id,
      wallet_id: wallet.id,
      admin_id: admin.id,
      currency: req.currency,
      action_type: "withdrawal_rejected",
      amount: Number(req.amount),
      balance_before: Number(wallet.available_balance),
      balance_after: newAvailable,
      note: adminNote ?? "Withdrawal rejected — funds returned",
    });

    await service
      .from("transactions")
      .update({ status: "rejected", description: `Withdrawal rejected · ${req.method.toUpperCase()}` })
      .eq("user_id", req.user_id)
      .eq("type", "withdrawal")
      .eq("currency", req.currency)
      .eq("amount", -Number(req.amount))
      .eq("status", "pending");
  } else if (decision === "completed") {
    const newPending = Math.max(0, Number(wallet.pending_balance) - Number(req.amount));
    const newWithdrawn = Number(wallet.total_withdrawn) + Number(req.amount);

    await service
      .from("wallets")
      .update({ pending_balance: newPending, total_withdrawn: newWithdrawn })
      .eq("id", wallet.id);

    await service.from("ledger_entries").insert({
      user_id: req.user_id,
      wallet_id: wallet.id,
      admin_id: admin.id,
      currency: req.currency,
      action_type: "withdrawal_completed",
      amount: -Number(req.amount),
      balance_before: Number(wallet.available_balance),
      balance_after: Number(wallet.available_balance),
      note: adminNote ?? "Withdrawal settled to client",
    });

    await service
      .from("transactions")
      .update({
        status: "completed",
        description: `Withdrawal completed · ${req.method.toUpperCase()}`,
      })
      .eq("user_id", req.user_id)
      .eq("type", "withdrawal")
      .eq("currency", req.currency)
      .eq("amount", -Number(req.amount))
      .eq("status", "pending");
  }
  // 'approved' — no balance movement yet; banker still has to settle.

  await service
    .from("withdrawal_requests")
    .update({
      status: decision,
      admin_note: adminNote ?? null,
      processed_by_admin_id: admin.id,
    })
    .eq("id", id);

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: req.user_id,
    action_type: `withdrawal_${decision}`,
    currency: req.currency,
    old_value: { status: req.status, amount: req.amount },
    new_value: { status: decision, amount: req.amount },
    note: adminNote ?? null,
    ip_address: ip,
  });

  if (profile) {
    await issueWithdrawalReceipt(
      service,
      profile,
      { ...req, status: decision, admin_note: adminNote ?? null },
      decision,
      admin.id,
    );
  }

  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin");
  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: `Request ${decision}.` };
}
