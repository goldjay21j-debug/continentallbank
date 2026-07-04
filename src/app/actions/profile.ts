"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/auth-mode";
import { KycSubmissionSchema, PasswordChangeSchema, ProfileUpdateSchema } from "@/lib/validation";
import { issueKycSubmissionReceipt, issueSecurityReceipt } from "@/lib/receipts";
import type { ActionResult } from "./withdrawals";

const LIVE_BACKEND_ERROR = "Live Supabase is not configured. Add Supabase environment variables before saving changes.";
const KYC_BUCKET = "kyc-documents";
const MAX_KYC_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_KYC_MIME = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = ProfileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      country: parsed.data.country,
      preferred_language: parsed.data.preferredLanguage,
      preferred_currency: parsed.data.preferredCurrency,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/profile");
  return { ok: true, message: "Profile updated." };
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = PasswordChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) return { ok: false, error: error.message };

  const service = createServiceClient();
  await issueSecurityReceipt(
    service,
    user.profile,
    "Password changed",
    "Your portal password was changed successfully. If you did not request this change, contact the Private Office immediately.",
  );

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Password updated." };
}

export async function submitKycVerification(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = KycSubmissionSchema.safeParse({
    method: formData.get("method"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Select a verification method" };
  }

  const document = formData.get("document");
  if (!(document instanceof File) || document.size === 0) {
    return { ok: false, error: "Upload a PDF, JPG, PNG, or WebP document." };
  }
  if (document.size > MAX_KYC_FILE_SIZE) {
    return { ok: false, error: "KYC document must be 10 MB or smaller." };
  }
  if (!ALLOWED_KYC_MIME.has(document.type)) {
    return { ok: false, error: "Use PDF, JPG, PNG, or WebP for verification." };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const service = createServiceClient();
  const { error: bucketError } = await service.storage.createBucket(KYC_BUCKET, {
    public: false,
    fileSizeLimit: MAX_KYC_FILE_SIZE,
    allowedMimeTypes: Array.from(ALLOWED_KYC_MIME),
  });
  if (bucketError && !/already exists|duplicate|resource already exists/i.test(bucketError.message)) {
    return { ok: false, error: bucketError.message };
  }

  const now = new Date().toISOString();
  const safeName = safeDocumentName(document.name);
  const path = `${user.id}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await service.storage.from(KYC_BUCKET).upload(path, document, {
    cacheControl: "3600",
    contentType: document.type,
    upsert: true,
  });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: uploadedFile } = await service
    .from("uploaded_files")
    .insert({
      user_id: user.id,
      case_id: null,
      kyc_submission_id: null,
      file_kind: "kyc",
      bucket: KYC_BUCKET,
      path,
      file_name: document.name,
      mime_type: document.type,
      size_bytes: document.size,
      visibility: "private",
    })
    .select()
    .maybeSingle();

  const { data: kycSubmission } = await service
    .from("kyc_submissions")
    .insert({
      user_id: user.id,
      method: parsed.data.method,
      status: "pending_review",
      document_file_id: uploadedFile?.id ?? null,
      notes: null,
      reviewed_at: null,
      reviewed_by_admin_id: null,
      review_note: null,
    })
    .select()
    .maybeSingle();

  if (uploadedFile?.id && kycSubmission?.id) {
    await service
      .from("uploaded_files")
      .update({ kyc_submission_id: kycSubmission.id })
      .eq("id", uploadedFile.id);
  }

  const { error } = await service
    .from("profiles")
    .update({
      kyc_status: "submitted",
      kyc_method: parsed.data.method,
      kyc_document_name: document.name,
      kyc_document_path: path,
      kyc_document_mime_type: document.type,
      kyc_submitted_at: now,
      kyc_reviewed_at: null,
      kyc_reviewed_by_admin_id: null,
      kyc_review_note: null,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  await issueKycSubmissionReceipt(
    service,
    user.profile,
    parsed.data.method,
    document.name,
  );

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${user.id}`);
  return { ok: true, message: "Verification package submitted for admin review." };
}

function safeDocumentName(name: string) {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "kyc-document";
}
