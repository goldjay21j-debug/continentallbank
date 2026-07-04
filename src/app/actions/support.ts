"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedClient } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/auth-mode";
import { SupportTicketSchema } from "@/lib/validation";
import type { ActionResult } from "./withdrawals";

const LIVE_BACKEND_ERROR = "Live Supabase is not configured. Add Supabase environment variables before saving changes.";

export async function openTicket(input: unknown): Promise<ActionResult> {
  const user = await requireApprovedClient();
  const parsed = SupportTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid ticket" };
  }

  if (!supabaseConfigured()) {
    return { ok: false, error: LIVE_BACKEND_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "open",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/support");
  return { ok: true, message: "Ticket opened. We will reply shortly." };
}
