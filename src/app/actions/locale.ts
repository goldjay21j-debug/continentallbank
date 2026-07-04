"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { LOCALE_COOKIE } from "@/lib/i18n/detect";
import { createClient } from "@/lib/supabase/server";
import { supabasePublicConfigured } from "@/lib/auth-mode";

export async function setLocale(locale: Locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return { ok: false };
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // Persist on the profile for signed-in users (only when Supabase is wired up).
  if (supabasePublicConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ preferred_language: locale }).eq("id", user.id);
      }
    } catch {
      // Cookie was set successfully — Supabase persistence is best-effort.
    }
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
