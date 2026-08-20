import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export type AuthedUser = {
  id: string;
  email: string | null;
  profile: Profile;
};

const ADMIN_ROLES = ["super_admin", "finance_admin", "support_admin"] as const;
export const FROZEN_ACCOUNT_ERROR =
  "Account is frozen pending bank review. Contact your relationship manager before submitting new instructions.";

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  return { id: user.id, email: user.email ?? null, profile: profile as Profile };
}

export async function requireUser(): Promise<AuthedUser> {
  const user = await getAuthedUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Requires a signed-in client who can see the dashboard.
 *
 * `approved` clients see it as normal.
 * `suspended` clients are allowed through so the dashboard can render
 * in its frozen state — the layout reads `account_status` and renders
 * the FrozenOverlay + locks form interactions.
 * `pending` / `rejected` clients go to the /pending page.
 */
export async function requireApprovedClient(): Promise<AuthedUser> {
  const user = await requireUser();
  if (isAdmin(user.profile.role)) redirect("/admin");
  const status = user.profile.account_status;
  if (status !== "approved" && status !== "suspended") redirect("/pending");
  return user;
}

export async function requireAdmin(): Promise<AuthedUser> {
  const user = await requireUser();
  if (!ADMIN_ROLES.includes(user.profile.role as (typeof ADMIN_ROLES)[number])) {
    redirect("/dashboard");
  }
  return user;
}

export async function requireSuperAdmin(): Promise<AuthedUser> {
  const user = await requireUser();
  if (user.profile.role !== "super_admin") redirect("/admin");
  return user;
}

export function isAdmin(role: string) {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

export function isFrozenAccount(profile: Pick<Profile, "account_status">) {
  return profile.account_status === "suspended";
}
