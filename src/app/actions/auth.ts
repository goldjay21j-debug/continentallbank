"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { supabaseConfigured, supabasePublicConfigured } from "@/lib/auth-mode";
import { CURRENCIES, SUPPORTED_LOCALES_VALUES } from "@/lib/validation";

const SignUpSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(120),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  phone: z.string().max(40).optional().or(z.literal("")),
  country: z.string().min(2).max(2),
  preferredLanguage: z.enum(SUPPORTED_LOCALES_VALUES),
  preferredCurrency: z.enum(CURRENCIES),
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ADMIN_ROLES = ["super_admin", "finance_admin", "support_admin"] as const;

function isAdminRole(role: string | null | undefined) {
  return Boolean(role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]));
}

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "An account already exists for this email. Please sign in instead.";
  }
  if (lower.includes("password")) {
    return "Use a stronger password with at least 8 characters.";
  }
  if (lower.includes("redirect")) {
    return "The account portal is not fully configured for signups yet. Please contact the recovery desk.";
  }
  return message || "We could not create the account right now. Please try again.";
}

export type SignUpResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof z.infer<typeof SignUpSchema>, string>> };

export async function signUpAction(formData: FormData): Promise<SignUpResult> {
  const parsed = SignUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? "",
    country: formData.get("country"),
    preferredLanguage: formData.get("preferredLanguage"),
    preferredCurrency: formData.get("preferredCurrency"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString();
      if (k) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Please review the highlighted fields.", fieldErrors };
  }

  try {
    const supabase = await createClient();
    const userMetadata = {
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      country: parsed.data.country,
      preferred_language: parsed.data.preferredLanguage,
      preferred_currency: parsed.data.preferredCurrency,
    };

    if (supabaseConfigured()) {
      const admin = createServiceClient();
      const { error: createError } = await admin.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: userMetadata,
      });

      if (createError) return { ok: false, error: friendlyAuthError(createError.message) };

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      return { ok: true, redirectTo: signInError ? "/login" : "/pending" };
    }

    const h = await headers();
    const origin = h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: userMetadata,
      },
    });

    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true, redirectTo: data.session ? "/pending" : "/login" };
  } catch (error) {
    console.error("signUpAction failed", error);
    return {
      ok: false,
      error:
        "We could not create the account right now. Please try again in a moment or contact the recovery desk.",
    };
  }
}

export type SignInResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function signInAction(formData: FormData): Promise<SignInResult> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    return { ok: false, error: "We could not sign you in. Verify your credentials." };
  }

  // Record login history (best effort)
  try {
    const h = await headers();
    await supabase.from("login_history").insert({
      user_id: data.user.id,
      ip_address:
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
      device: null,
      browser: h.get("user-agent") ?? null,
      location: h.get("x-vercel-ip-city") ?? h.get("cf-ipcity") ?? null,
    });
  } catch {
    // non-fatal
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", data.user.id)
    .maybeSingle();

  const isAdmin = isAdminRole(profile?.role);
  const redirectTo = isAdmin
    ? "/admin"
    : profile?.account_status === "approved"
      ? "/dashboard"
      : "/pending";

  return { ok: true, redirectTo };
}

export async function signInAdminAction(formData: FormData): Promise<SignInResult> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Enter your officer email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    return { ok: false, error: "We could not sign you in. Verify your credentials." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!isAdminRole(profile?.role)) {
    await supabase.auth.signOut();
    return { ok: false, error: "Officer access is required for the administration portal." };
  }

  try {
    const h = await headers();
    await supabase.from("login_history").insert({
      user_id: data.user.id,
      ip_address:
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
      device: null,
      browser: h.get("user-agent") ?? null,
      location: h.get("x-vercel-ip-city") ?? h.get("cf-ipcity") ?? null,
    });
  } catch {
    // non-fatal
  }

  return { ok: true, redirectTo: "/admin" };
}

export async function signOutAction(formData?: FormData) {
  if (supabasePublicConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  const requestedRedirect = formData?.get("redirectTo");
  const redirectTo =
    typeof requestedRedirect === "string" && ["/login", "/admin/login"].includes(requestedRedirect)
      ? requestedRedirect
      : "/login";
  redirect(redirectTo);
}
