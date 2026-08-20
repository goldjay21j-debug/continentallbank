"use server";

import { revalidatePath } from "next/cache";
import {
  FROZEN_ACCOUNT_ERROR,
  isFrozenAccount,
  requireAdmin,
  requireApprovedClient,
} from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/auth-mode";
import { BeneficiaryDecisionSchema, BeneficiarySubmissionSchema } from "@/lib/validation";
import { issueBeneficiaryReceipt } from "@/lib/receipts";
import type { ActionResult } from "./withdrawals";
import type { BeneficiaryRow } from "@/lib/types/database";

const LIVE_BACKEND_ERROR = "Live Supabase is not configured. Add Supabase environment variables before saving changes.";

export async function submitBeneficiary(input: unknown): Promise<ActionResult> {
  const user = await requireApprovedClient();
  if (isFrozenAccount(user.profile)) return { ok: false, error: FROZEN_ACCOUNT_ERROR };
  const parsed = BeneficiarySubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid beneficiary" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("beneficiaries")
    .insert({
      user_id: user.id,
      nickname: parsed.data.nickname,
      account_holder: parsed.data.holder,
      rail: parsed.data.rail,
      currency: parsed.data.currency,
      country: parsed.data.country,
      destination_masked: maskDestination(parsed.data.destination),
      bank: parsed.data.bank || null,
      notes: parsed.data.notes || null,
      status: "pending",
      is_default: false,
      submitted_by_full_name: user.profile.full_name,
    })
    .select()
    .maybeSingle();

  if (error || !data) return { ok: false, error: error?.message ?? "Could not save beneficiary" };

  await issueBeneficiaryReceipt(service, data as BeneficiaryRow, "pending");

  revalidatePath("/dashboard/beneficiaries");
  revalidatePath("/admin/beneficiaries");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Beneficiary submitted for officer review." };
}

export async function decideBeneficiary(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = BeneficiaryDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid beneficiary decision" };
  }
  if (admin.profile.role === "support_admin") {
    return { ok: false, error: "Support admins cannot approve beneficiaries" };
  }
  if (parsed.data.decision === "reject" && !parsed.data.note?.trim()) {
    return { ok: false, error: "Add a reason before rejecting this beneficiary." };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { data: current } = await service
    .from("beneficiaries")
    .select("*")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!current) return { ok: false, error: "Beneficiary not found" };

  const nextStatus = parsed.data.decision === "approve" ? "approved" : "rejected";
  const reviewedAt = new Date().toISOString();
  const { data, error } = await service
    .from("beneficiaries")
    .update({
      status: nextStatus,
      reviewed_by_admin_id: admin.id,
      review_note: parsed.data.note ?? null,
      reviewed_at: reviewedAt,
    })
    .eq("id", parsed.data.id)
    .select()
    .maybeSingle();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not update beneficiary" };

  await service.from("audit_logs").insert({
    admin_id: admin.id,
    user_id: data.user_id,
    action_type: `beneficiary_${nextStatus}`,
    old_value: { status: current.status },
    new_value: { status: nextStatus },
    note: parsed.data.note ?? null,
  });

  await issueBeneficiaryReceipt(
    service,
    data as BeneficiaryRow,
    nextStatus,
    admin.id,
    parsed.data.note,
  );

  revalidatePath("/admin/beneficiaries");
  revalidatePath("/dashboard/beneficiaries");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: `Beneficiary ${nextStatus}.` };
}

function maskDestination(value: string) {
  const trimmed = value.trim();
  if (trimmed.includes("@")) return trimmed.replace(/(.{2}).+(@.+)/, "$1••••$2");
  const visible = trimmed.replace(/\s+/g, "").slice(-4);
  return visible ? `•••• ${visible}` : "••••";
}
