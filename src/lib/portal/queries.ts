/**
 * Live Supabase data fetchers used by dashboard/admin pages.
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { type DocumentRecord } from "./documents";
import { type Notification } from "./notifications";
import type { MessageThread, MessageThreadStatus } from "./messages";
import { recoveryAccessState } from "./recovery";
import type { Profile } from "@/lib/types/database";

/* ---- Client-side fetchers --------------------------------------- */

export async function clientWallets(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .order("currency");
  return data ?? [];
}

export async function clientTransactions(userId: string, limit = 200) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function clientWithdrawals(userId: string, limit = 50) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function clientPendingWithdrawals(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", userId)
    .in("status", [
      "pending",
      "approved",
      "awaiting_fee_completion",
      "pending_review",
      "approved_for_processing",
      "processing",
    ])
    .order("created_at", { ascending: false })
    .limit(4);
  return data ?? [];
}

export async function clientTickets(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function clientMessageThreads(userId: string, clientName: string) {
  const tickets = await clientTickets(userId);
  return tickets.map((ticket: any) =>
    supportTicketToThread(ticket, {
      clientName,
      officerName: "Private Office",
    }),
  );
}

export async function clientLoginHistory(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("login_history")
    .select("*")
    .eq("user_id", userId)
    .order("login_time", { ascending: false })
    .limit(15);
  return data ?? [];
}

export async function clientDocuments(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generated_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []).map(generatedDocumentToRecord);
}

export async function clientNotifications(userId: string, limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((n) => ({
    id: n.id,
    user_id: n.user_id,
    kind: n.kind,
    severity: n.severity,
    title: n.title,
    body: n.body,
    href: n.href ?? undefined,
    currency: n.currency ?? undefined,
    amount: n.amount_label ?? undefined,
    read: n.read,
    created_at: n.created_at,
  })) satisfies Notification[];
}

export async function clientBeneficiaries(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((b) => ({
    ...b,
    bank: b.bank ?? undefined,
    notes: b.notes ?? undefined,
    reviewed_by_full_name: undefined,
    review_note: b.review_note ?? undefined,
    reviewed_at: b.reviewed_at ?? undefined,
  }));
}

export async function clientRecoveryCases(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function clientEscrowContract(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("escrow_contracts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function clientRecoveredFunds(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recovered_funds_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function clientActiveDisputes(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("disputes")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["open", "under_review"])
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function clientEscrowOverview(userId: string, profile: Profile) {
  const [recoveryCases, escrowContract, recoveredFunds, activeDisputes] =
    await Promise.all([
      clientRecoveryCases(userId),
      clientEscrowContract(userId),
      clientRecoveredFunds(userId),
      clientActiveDisputes(userId),
    ]);

  const accessState = recoveryAccessState(profile, recoveryCases, escrowContract);

  return {
    recoveryCases,
    primaryCase: recoveryCases[0] ?? null,
    escrowContract,
    recoveredFunds,
    activeDisputes,
    accessState,
    withdrawalEligibility:
      accessState.key === "ready" &&
      escrowContract?.release_status === "eligible" &&
      Number(escrowContract.available_for_withdrawal) > 0,
  };
}

/* ---- Admin-side fetchers ---------------------------------------- */

export async function adminCounts() {
  const s = createServiceClient();
  const [a, b, c, d] = await Promise.all([
    s.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "pending"),
    s
      .from("withdrawal_requests")
      .select("id", { count: "exact", head: true })
      .in("status", [
        "pending",
        "submitted",
        "pending_review",
        "awaiting_fee_completion",
        "approved",
        "approved_for_processing",
        "processing",
      ]),
    s.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    s.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
  ]);
  return {
    pendingClients: a.count ?? 0,
    pendingWithdrawals: b.count ?? 0,
    openTickets: c.count ?? 0,
    totalClients: d.count ?? 0,
  };
}

export async function adminDashboardMetrics() {
  const s = createServiceClient();
  const [
    { count: pendingKyc },
    { count: pendingBeneficiaries },
    { count: documentsIssued },
    { count: unreadNotifications },
    { data: recentDocuments },
    recentBeneficiaries,
  ] = await Promise.all([
    s
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("kyc_status", ["submitted", "under_review"]),
    s
      .from("beneficiaries")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    s.from("generated_documents").select("id", { count: "exact", head: true }),
    s.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
    s
      .from("generated_documents")
      .select(
        "*, profiles:profiles!generated_documents_user_id_fkey(full_name, account_number)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
    adminBeneficiaryQueue("pending"),
  ]);

  return {
    pendingKyc: pendingKyc ?? 0,
    pendingBeneficiaries: pendingBeneficiaries ?? 0,
    documentsIssued: documentsIssued ?? 0,
    unreadNotifications: unreadNotifications ?? 0,
    recentDocuments: (recentDocuments ?? []).map((row: any) => ({
      ...generatedDocumentToRecord(row),
      profiles: row.profiles,
    })),
    recentBeneficiaries: recentBeneficiaries.slice(0, 4),
  };
}

export async function adminWithdrawalQueue(statusFilter?: string) {
  const s = createServiceClient();
  let q = s
    .from("withdrawal_requests")
    .select(
      "*, profiles:profiles!withdrawal_requests_user_id_fkey(id, full_name, email, account_number, country)",
    )
    .order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
  const { data } = await q.limit(200);
  return data ?? [];
}

export async function adminClientRoster(statusFilter?: string, q?: string) {
  const s = createServiceClient();
  let query = s.from("profiles").select("*").order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "all") query = query.eq("account_status", statusFilter);
  if (q && q.trim()) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,account_number.ilike.%${q}%`);
  }
  const { data } = await query.limit(200);
  return data ?? [];
}

export async function adminBeneficiaryQueue(statusFilter?: string) {
  const s = createServiceClient();
  let q = s
    .from("beneficiaries")
    .select("*, profiles:profiles!beneficiaries_user_id_fkey(full_name, account_number)")
    .order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
  const { data } = await q.limit(200);
  return (data ?? []).map((b: any) => ({
    ...b,
    bank: b.bank ?? undefined,
    notes: b.notes ?? undefined,
    reviewed_by_full_name: undefined,
    review_note: b.review_note ?? undefined,
    reviewed_at: b.reviewed_at ?? undefined,
    client_name: b.profiles?.full_name ?? "Client",
    client_account: b.profiles?.account_number ?? null,
  }));
}

export async function adminRecoveryCases(statusFilter?: string) {
  const s = createServiceClient();
  let q = s
    .from("cases")
    .select(
      "*, profiles:profiles!cases_user_id_fkey(id, full_name, email, account_number, country, kyc_status, is_verified, escrow_account_status)",
    )
    .order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
  const { data } = await q.limit(200);
  return data ?? [];
}

export async function adminEscrowContracts(statusFilter?: string) {
  const s = createServiceClient();
  let q = s
    .from("escrow_contracts")
    .select(
      "*, profiles:profiles!escrow_contracts_user_id_fkey(id, full_name, email, account_number, country, kyc_status, is_verified, escrow_account_status), cases:cases!escrow_contracts_case_id_fkey(id, title, status, complaint_type)",
    )
    .order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
  const { data } = await q.limit(200);
  return data ?? [];
}

export async function adminRecoveredFunds(limit = 50) {
  const s = createServiceClient();
  const { data } = await s
    .from("recovered_funds_entries")
    .select(
      "*, profiles:profiles!recovered_funds_entries_user_id_fkey(id, full_name, account_number), cases:cases!recovered_funds_entries_case_id_fkey(id, title, status), escrow_contracts:escrow_contracts!recovered_funds_entries_escrow_contract_id_fkey(id, reference, status)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function adminRecoveryMetrics() {
  const [cases, contracts, funds] = await Promise.all([
    adminRecoveryCases(),
    adminEscrowContracts(),
    adminRecoveredFunds(200),
  ]);

  return {
    openCases: cases.filter((c: any) => !["rejected", "closed"].includes(c.status)).length,
    recoveredCases: cases.filter((c: any) => c.status === "recovered").length,
    activeEscrows: contracts.filter((c: any) =>
      ["active", "ready_for_release", "release_approved"].includes(c.status),
    ).length,
    releaseEligible: contracts.filter((c: any) => c.release_status === "eligible").length,
    totalRecovered: funds.reduce((sum: number, f: any) => sum + Number(f.amount ?? 0), 0),
  };
}

export async function adminClientDetail(userId: string) {
  const s = createServiceClient();
  const [{ data: profile }, { data: wallets }, { data: ledger }, { data: withdrawals }] =
    await Promise.all([
      s.from("profiles").select("*").eq("id", userId).maybeSingle(),
      s.from("wallets").select("*").eq("user_id", userId).order("currency"),
      s.from("ledger_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      s.from("withdrawal_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    ]);
  return {
    profile: profile ?? null,
    wallets: wallets ?? [],
    ledger: ledger ?? [],
    withdrawals: withdrawals ?? [],
  };
}

export async function adminAllTransactions() {
  const s = createServiceClient();
  const { data } = await s
    .from("transactions")
    .select("*, profiles:profiles!transactions_user_id_fkey(id, full_name, account_number)")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function adminTickets(statusFilter?: string) {
  const s = createServiceClient();
  let q = s
    .from("support_tickets")
    .select(
      "*, profiles:profiles!support_tickets_user_id_fkey(id, full_name, account_number, email)",
    )
    .order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
  const { data } = await q.limit(100);
  return data ?? [];
}

export async function adminMessageThreads(statusFilter?: string) {
  const tickets = await adminTickets(statusFilter === "awaiting_client" ? "in_progress" : statusFilter);
  return tickets.map((ticket: any) =>
    supportTicketToThread(ticket, {
      clientName: ticket.profiles?.full_name ?? "Client",
      officerName: "Private Office",
    }),
  );
}

export async function clientMessageThreadById(userId: string, id: string, clientName: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data
    ? supportTicketToThread(data, {
        clientName,
        officerName: "Private Office",
      })
    : null;
}

export async function adminMessageThreadById(id: string) {
  const s = createServiceClient();
  const { data } = await s
    .from("support_tickets")
    .select("*, profiles:profiles!support_tickets_user_id_fkey(id, full_name, account_number, email)")
    .eq("id", id)
    .maybeSingle();
  return data
    ? supportTicketToThread(data as any, {
        clientName: (data as any).profiles?.full_name ?? "Client",
        officerName: "Private Office",
      })
    : null;
}

export async function adminAuditLogs() {
  const s = createServiceClient();
  const { data } = await s
    .from("audit_logs")
    .select(
      "*, admin:profiles!audit_logs_admin_id_fkey(full_name), client:profiles!audit_logs_user_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(300);
  return data ?? [];
}

export async function adminAnalytics() {
  const s = createServiceClient();
  const [
    { count: totalClients },
    { count: approvedClients },
    { count: pendingClients },
    { data: wallets },
    { data: withdrawalsByStatus },
  ] = await Promise.all([
    s.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
    s.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "approved"),
    s.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "pending"),
    s.from("wallets").select("currency, available_balance, pending_balance, total_withdrawn"),
    s.from("withdrawal_requests").select("status, amount, currency"),
  ]);

  const custody: Record<string, number> = { USD: 0, EUR: 0, GBP: 0 };
  const pending: Record<string, number> = { USD: 0, EUR: 0, GBP: 0 };
  const withdrawn: Record<string, number> = { USD: 0, EUR: 0, GBP: 0 };
  (wallets ?? []).forEach((w: any) => {
    custody[w.currency] = (custody[w.currency] ?? 0) + Number(w.available_balance);
    pending[w.currency] = (pending[w.currency] ?? 0) + Number(w.pending_balance);
    withdrawn[w.currency] = (withdrawn[w.currency] ?? 0) + Number(w.total_withdrawn);
  });

  const wStatus: Record<string, number> = {
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
  };
  (withdrawalsByStatus ?? []).forEach((w: any) => {
    wStatus[w.status] = (wStatus[w.status] ?? 0) + 1;
  });

  return {
    totalClients: totalClients ?? 0,
    approvedClients: approvedClients ?? 0,
    pendingClients: pendingClients ?? 0,
    openTickets: 0,
    pendingWithdrawals: wStatus.pending ?? 0,
    custody,
    pending,
    withdrawnLifetime: withdrawn,
    withdrawalsByStatus: wStatus,
  };
}

export async function adminRecentWithdrawals() {
  const s = createServiceClient();
  const { data } = await s
    .from("withdrawal_requests")
    .select(
      "id, amount, currency, method, status, created_at, user_id, profiles:profiles!withdrawal_requests_user_id_fkey(full_name, account_number)",
    )
    .in("status", [
      "pending",
      "submitted",
      "pending_review",
      "awaiting_fee_completion",
      "approved",
      "approved_for_processing",
      "processing",
    ])
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

/* ---- Refund claims --------------------------------------------- */

export async function clientRefundClaims(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("refund_claims")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function adminRefundQueue(statusFilter?: string) {
  const s = createServiceClient();
  let q = s
    .from("refund_claims")
    .select(
      "*, profiles:profiles!refund_claims_user_id_fkey(id, full_name, email, account_number)",
    )
    .order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
  const { data } = await q.limit(200);
  return data ?? [];
}

export async function adminPendingRefundCount() {
  const s = createServiceClient();
  const { count } = await s
    .from("refund_claims")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "under_review"]);
  return count ?? 0;
}

export async function adminRecentActivity() {
  const s = createServiceClient();
  const { data } = await s
    .from("audit_logs")
    .select("id, action_type, created_at, admin_id, profiles:profiles!audit_logs_admin_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

function generatedDocumentToRecord(row: any): DocumentRecord {
  const body = isDocumentBody(row.body)
    ? row.body
    : {
        heading: row.title,
        rows: [{ label: "Reference", value: row.reference ?? row.id }],
        paragraph: row.description,
      };

  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title,
    description: row.description,
    size: row.size_label ?? "72 KB",
    currency: row.currency ?? undefined,
    reference: row.reference ?? undefined,
    created_at: row.created_at,
    body,
  };
}

function supportTicketToThread(
  ticket: any,
  names: { clientName: string; officerName: string },
): MessageThread {
  const status = supportStatusToThreadStatus(ticket.status);
  const messages: MessageThread["messages"] = [
    {
      id: `${ticket.id}-client`,
      thread_id: ticket.id,
      sender_id: ticket.user_id,
      sender_name: names.clientName,
      sender_role: "client" as const,
      body: ticket.message,
      created_at: ticket.created_at,
    },
  ];

  if (ticket.admin_reply) {
    messages.push({
      id: `${ticket.id}-officer`,
      thread_id: ticket.id,
      sender_id: ticket.assigned_to_admin_id ?? "private-office",
      sender_name: names.officerName,
      sender_role: "officer" as const,
      body: ticket.admin_reply,
      created_at: ticket.updated_at ?? ticket.created_at,
    });
  }

  return {
    id: ticket.id,
    user_id: ticket.user_id,
    subject: ticket.subject,
    status,
    assigned_to: ticket.assigned_to_admin_id
      ? { id: ticket.assigned_to_admin_id, full_name: names.officerName }
      : null,
    last_message_at: messages[messages.length - 1]?.created_at ?? ticket.created_at,
    unread_for_client: false,
    unread_for_officer: status === "open" || status === "awaiting_client",
    created_at: ticket.created_at,
    messages,
  };
}

function supportStatusToThreadStatus(status: string): MessageThreadStatus {
  if (status === "resolved") return "resolved";
  if (status === "closed") return "closed";
  if (status === "in_progress") return "awaiting_client";
  return "open";
}

function isDocumentBody(value: unknown): value is DocumentRecord["body"] {
  return Boolean(
    value &&
      typeof value === "object" &&
      "heading" in value &&
      "rows" in value &&
      Array.isArray((value as { rows?: unknown }).rows),
  );
}
