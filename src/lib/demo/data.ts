/**
 * Continental Bank — DEMO seed data
 *
 * Used when Supabase is not yet configured (or when the visitor opts into
 * demo mode from the login screen). All figures are illustrative.
 */

import type {
  AuditLog,
  LedgerEntry,
  LoginHistoryEntry,
  Profile,
  RefundClaim,
  SupportTicket,
  Transaction,
  Wallet,
  WithdrawalRequest,
} from "@/lib/types/database";

const ISO = (d: string) => new Date(d).toISOString();

type ProfileKycFields = Pick<
  Profile,
  | "kyc_status"
  | "kyc_method"
  | "kyc_document_name"
  | "kyc_document_path"
  | "kyc_document_mime_type"
  | "kyc_submitted_at"
  | "kyc_reviewed_at"
  | "kyc_reviewed_by_admin_id"
  | "kyc_review_note"
>;

type ProfileEscrowFields = Pick<
  Profile,
  | "company"
  | "is_verified"
  | "escrow_account_status"
  | "escrow_account_reference"
  | "escrow_account_opened_at"
>;

function kycFields(
  status: Profile["kyc_status"],
  method: Profile["kyc_method"] = null,
  documentName: string | null = null,
  submittedAt: string | null = null,
  reviewNote: string | null = null,
): ProfileKycFields {
  const reviewed = status === "approved" || status === "rejected";
  return {
    kyc_status: status,
    kyc_method: method,
    kyc_document_name: documentName,
    kyc_document_path: documentName
      ? `demo-kyc/${documentName.toLowerCase().replace(/[^a-z0-9.]+/g, "-")}`
      : null,
    kyc_document_mime_type: documentName?.endsWith(".pdf") ? "application/pdf" : null,
    kyc_submitted_at: submittedAt,
    kyc_reviewed_at: reviewed ? ISO("2026-05-18T09:45:00Z") : null,
    kyc_reviewed_by_admin_id: reviewed ? "demo-officer-0001" : null,
    kyc_review_note: reviewNote,
  };
}

function escrowFields({
  company = null,
  isVerified = false,
  status = "not_started",
  reference = null,
  openedAt = null,
}: {
  company?: string | null;
  isVerified?: boolean;
  status?: Profile["escrow_account_status"];
  reference?: string | null;
  openedAt?: string | null;
} = {}): ProfileEscrowFields {
  return {
    company,
    is_verified: isVerified,
    escrow_account_status: status,
    escrow_account_reference: reference,
    escrow_account_opened_at: openedAt,
  };
}

function withdrawalEscrowFields({
  caseId = null,
  contractId = null,
  amount = 0,
  feeStatus = "unpaid",
  releaseStatus = "not_eligible",
  providerStatus = null,
  providerReference = null,
}: {
  caseId?: string | null;
  contractId?: string | null;
  amount?: number;
  feeStatus?: WithdrawalRequest["fee_status"];
  releaseStatus?: WithdrawalRequest["release_status"];
  providerStatus?: string | null;
  providerReference?: string | null;
} = {}): Pick<
  WithdrawalRequest,
  | "case_id"
  | "escrow_contract_id"
  | "release_processing_fee"
  | "release_processing_fee_percentage"
  | "net_amount"
  | "fee_status"
  | "release_status"
  | "provider_status"
  | "provider_reference"
> {
  const fee = caseId ? amount * 0.2 : 0;
  return {
    case_id: caseId,
    escrow_contract_id: contractId,
    release_processing_fee: fee,
    release_processing_fee_percentage: 20,
    net_amount: amount - fee,
    fee_status: feeStatus,
    release_status: releaseStatus,
    provider_status: providerStatus,
    provider_reference: providerReference,
  };
}

/* ------------------------------------------------------------------ *
 *  Demo client (signed-in)
 * ------------------------------------------------------------------ */

export const demoClientProfile: Profile = {
  id: "demo-client-0001",
  full_name: "Hélène Bertrand",
  email: "h.bertrand@example.com",
  phone: "+41 22 555 02 18",
  country: "CH",
  preferred_language: "en",
  preferred_currency: "USD",
  role: "client",
  account_status: "approved",
  ...escrowFields({
    isVerified: true,
    status: "active",
    reference: "ESC-CB4910-2026-017",
    openedAt: ISO("2026-05-18T10:30:00Z"),
  }),
  ...kycFields(
    "approved",
    "passport",
    "passport-verification-confirmation.pdf",
    ISO("2026-05-17T08:30:00Z"),
    "Identity and proof of address accepted without exceptions.",
  ),
  account_number: "CB491072820314",
  avatar_url: null,
  created_at: ISO("2022-03-14T10:21:00Z"),
  updated_at: ISO("2026-05-18T14:02:00Z"),
};

export const demoClientWallets: Wallet[] = [
  {
    id: "demo-wallet-usd",
    user_id: demoClientProfile.id,
    currency: "USD",
    available_balance: 2418902.41,
    pending_balance: 75000,
    total_withdrawn: 481200.0,
    created_at: ISO("2022-03-14T10:21:00Z"),
    updated_at: ISO("2026-05-19T08:14:00Z"),
  },
  {
    id: "demo-wallet-eur",
    user_id: demoClientProfile.id,
    currency: "EUR",
    available_balance: 1107433.12,
    pending_balance: 0,
    total_withdrawn: 220000.0,
    created_at: ISO("2022-03-14T10:21:00Z"),
    updated_at: ISO("2026-05-17T11:42:00Z"),
  },
  {
    id: "demo-wallet-gbp",
    user_id: demoClientProfile.id,
    currency: "GBP",
    available_balance: 864720.55,
    pending_balance: 12500,
    total_withdrawn: 95400.0,
    created_at: ISO("2022-03-14T10:21:00Z"),
    updated_at: ISO("2026-05-16T15:20:00Z"),
  },
];

export const demoClientTransactions: Transaction[] = [
  {
    id: "demo-tx-1",
    user_id: demoClientProfile.id,
    currency: "USD",
    type: "interest",
    amount: 12480.33,
    status: "completed",
    description: "Q2 portfolio interest credit",
    created_by_admin_id: null,
    created_at: ISO("2026-05-18T09:00:00Z"),
  },
  {
    id: "demo-tx-2",
    user_id: demoClientProfile.id,
    currency: "USD",
    type: "withdrawal",
    amount: -75000,
    status: "pending",
    description: "Withdrawal requested · WISE",
    created_by_admin_id: null,
    created_at: ISO("2026-05-17T16:48:00Z"),
  },
  {
    id: "demo-tx-3",
    user_id: demoClientProfile.id,
    currency: "EUR",
    type: "deposit",
    amount: 250000,
    status: "completed",
    description: "Wire — Banque Lombard Geneva",
    created_by_admin_id: null,
    created_at: ISO("2026-05-12T13:14:00Z"),
  },
  {
    id: "demo-tx-4",
    user_id: demoClientProfile.id,
    currency: "GBP",
    type: "withdrawal",
    amount: -12500,
    status: "pending",
    description: "Withdrawal requested · UK_FASTER",
    created_by_admin_id: null,
    created_at: ISO("2026-05-10T08:32:00Z"),
  },
  {
    id: "demo-tx-5",
    user_id: demoClientProfile.id,
    currency: "USD",
    type: "withdrawal",
    amount: -120000,
    status: "completed",
    description: "Withdrawal completed · BANK_TRANSFER",
    created_by_admin_id: null,
    created_at: ISO("2026-04-28T11:05:00Z"),
  },
  {
    id: "demo-tx-6",
    user_id: demoClientProfile.id,
    currency: "USD",
    type: "fee",
    amount: -350,
    status: "completed",
    description: "Quarterly administration",
    created_by_admin_id: null,
    created_at: ISO("2026-04-01T08:00:00Z"),
  },
];

export const demoClientWithdrawals: WithdrawalRequest[] = [
  {
    id: "demo-wd-1",
    user_id: demoClientProfile.id,
    currency: "USD",
    amount: 75000,
    method: "wise",
    payment_details: { destination: "h.bertrand@example.com" },
    notes: "Routine quarterly distribution. Please confirm before settlement.",
    status: "pending",
    ...withdrawalEscrowFields({
      caseId: "demo-case-1",
      contractId: "demo-escrow-1",
      amount: 75000,
      feeStatus: "pending_verification",
      releaseStatus: "eligible",
      providerStatus: "release_review",
    }),
    admin_note: null,
    processed_by_admin_id: null,
    created_at: ISO("2026-05-17T16:48:00Z"),
    updated_at: ISO("2026-05-17T16:48:00Z"),
  },
  {
    id: "demo-wd-2",
    user_id: demoClientProfile.id,
    currency: "GBP",
    amount: 12500,
    method: "uk_faster",
    payment_details: { destination: "12-34-56 · 12345678" },
    notes: null,
    status: "approved",
    ...withdrawalEscrowFields(),
    admin_note: "Approved. Settlement scheduled for next business day.",
    processed_by_admin_id: "demo-officer-0001",
    created_at: ISO("2026-05-10T08:32:00Z"),
    updated_at: ISO("2026-05-10T11:14:00Z"),
  },
  {
    id: "demo-wd-3",
    user_id: demoClientProfile.id,
    currency: "USD",
    amount: 120000,
    method: "bank_transfer",
    payment_details: { destination: "•••• •••• 4419" },
    notes: null,
    status: "completed",
    ...withdrawalEscrowFields({
      amount: 120000,
      feeStatus: "completed",
      providerStatus: "settled",
      providerReference: "8821-5572",
    }),
    admin_note: "Settled to Citibank reference 8821-5572.",
    processed_by_admin_id: "demo-officer-0001",
    created_at: ISO("2026-04-26T09:14:00Z"),
    updated_at: ISO("2026-04-28T11:05:00Z"),
  },
];

export const demoClientTickets: SupportTicket[] = [
  {
    id: "demo-tk-1",
    user_id: demoClientProfile.id,
    subject: "Annual statement — request for Q3 PDF",
    message:
      "Could you please prepare a consolidated Q3 statement across all three portfolios in PDF? For my accountant in Lugano.",
    status: "resolved",
    admin_reply:
      "Of course, Madame. The Q3 consolidated statement has been delivered to your secure file vault. We have copied your assistant. Best regards, É. Dupont.",
    assigned_to_admin_id: "demo-officer-0001",
    created_at: ISO("2026-05-04T10:11:00Z"),
    updated_at: ISO("2026-05-04T14:48:00Z"),
  },
  {
    id: "demo-tk-2",
    user_id: demoClientProfile.id,
    subject: "Travel notice — Singapore, June 4-12",
    message:
      "I will be in Singapore the second week of June. Please flag the Asia desk so any urgent matter can be routed locally.",
    status: "in_progress",
    admin_reply: null,
    assigned_to_admin_id: null,
    created_at: ISO("2026-05-18T07:30:00Z"),
    updated_at: ISO("2026-05-18T07:30:00Z"),
  },
];

export const demoClientLoginHistory: LoginHistoryEntry[] = [
  {
    id: "lh-1",
    user_id: demoClientProfile.id,
    ip_address: "82.150.108.4",
    device: "MacBook Pro",
    browser: "Safari · macOS",
    location: "Geneva, CH",
    login_time: ISO("2026-05-19T08:14:00Z"),
  },
  {
    id: "lh-2",
    user_id: demoClientProfile.id,
    ip_address: "82.150.108.4",
    device: "iPhone",
    browser: "Mobile Safari · iOS",
    location: "Geneva, CH",
    login_time: ISO("2026-05-18T19:42:00Z"),
  },
  {
    id: "lh-3",
    user_id: demoClientProfile.id,
    ip_address: "212.83.10.221",
    device: "MacBook Pro",
    browser: "Safari · macOS",
    location: "Paris, FR",
    login_time: ISO("2026-05-16T11:05:00Z"),
  },
];

/* ------------------------------------------------------------------ *
 *  Demo officer (admin)
 * ------------------------------------------------------------------ */

export const demoAdminProfile: Profile = {
  id: "demo-officer-0001",
  full_name: "Étienne Dupont",
  email: "e.dupont@continental.example",
  phone: "+41 22 555 01 02",
  country: "CH",
  preferred_language: "en",
  preferred_currency: "EUR",
  role: "super_admin",
  account_status: "approved",
  ...escrowFields({ company: "Continental Bank", isVerified: true }),
  ...kycFields(
    "approved",
    null,
    null,
    ISO("2019-01-12T09:00:00Z"),
    "Internal officer account.",
  ),
  account_number: null,
  avatar_url: null,
  created_at: ISO("2019-01-12T09:00:00Z"),
  updated_at: ISO("2026-05-19T07:00:00Z"),
};

/* ------------------------------------------------------------------ *
 *  Demo roster of other clients (visible to officers)
 * ------------------------------------------------------------------ */

export const demoClientRoster: Profile[] = [
  demoClientProfile,
  {
    id: "demo-client-0002",
    full_name: "Marcus Ainsworth",
    email: "m.ainsworth@example.com",
    phone: "+44 20 7946 0034",
    country: "GB",
    preferred_language: "en",
    preferred_currency: "GBP",
    role: "client",
    account_status: "approved",
    ...escrowFields({ isVerified: true, status: "active", reference: "ESC-CB6620-2026-014", openedAt: ISO("2026-04-22T11:00:00Z") }),
    ...kycFields(
      "approved",
      "passport",
      "ainsworth-passport.pdf",
      ISO("2026-02-03T14:22:00Z"),
      "Passport accepted.",
    ),
    account_number: "CB662014950011",
    avatar_url: null,
    created_at: ISO("2021-08-04T13:22:00Z"),
    updated_at: ISO("2026-05-15T10:08:00Z"),
  },
  {
    id: "demo-client-0003",
    full_name: "Yusuf Al-Hashimi",
    email: "y.alhashimi@example.com",
    phone: "+971 4 555 0942",
    country: "AE",
    preferred_language: "ar",
    preferred_currency: "USD",
    role: "client",
    account_status: "approved",
    ...escrowFields(),
    ...kycFields(
      "under_review",
      "source_of_funds",
      "source-of-funds-letter.pdf",
      ISO("2026-05-20T10:05:00Z"),
      null,
    ),
    account_number: "CB551142390877",
    avatar_url: null,
    created_at: ISO("2023-02-19T08:45:00Z"),
    updated_at: ISO("2026-05-12T16:20:00Z"),
  },
  {
    id: "demo-client-0004",
    full_name: "Sofia Marchetti",
    email: "s.marchetti@example.com",
    phone: "+39 02 555 4421",
    country: "IT",
    preferred_language: "it",
    preferred_currency: "EUR",
    role: "client",
    account_status: "pending",
    ...escrowFields(),
    ...kycFields(
      "submitted",
      "national_id",
      "marchetti-national-id.pdf",
      ISO("2026-05-17T09:22:00Z"),
      null,
    ),
    account_number: "CB880204110256",
    avatar_url: null,
    created_at: ISO("2026-05-17T09:14:00Z"),
    updated_at: ISO("2026-05-17T09:14:00Z"),
  },
  {
    id: "demo-client-0005",
    full_name: "Akira Tanaka",
    email: "a.tanaka@example.com",
    phone: "+81 3 5555 1280",
    country: "JP",
    preferred_language: "en",
    preferred_currency: "USD",
    role: "client",
    account_status: "pending",
    ...escrowFields(),
    ...kycFields("not_submitted"),
    account_number: "CB100558740043",
    avatar_url: null,
    created_at: ISO("2026-05-18T22:01:00Z"),
    updated_at: ISO("2026-05-18T22:01:00Z"),
  },
  {
    id: "demo-client-0006",
    full_name: "Beatrice Lindqvist",
    email: "b.lindqvist@example.com",
    phone: "+46 8 555 0119",
    country: "SE",
    preferred_language: "en",
    preferred_currency: "EUR",
    role: "client",
    account_status: "suspended",
    ...escrowFields({ isVerified: false, status: "active", reference: "ESC-CB4001-2026-004", openedAt: ISO("2026-01-17T10:12:00Z") }),
    ...kycFields(
      "rejected",
      "proof_of_address",
      "lindqvist-address.png",
      ISO("2026-04-03T11:09:00Z"),
      "Proof of address expired. Request current document.",
    ),
    account_number: "CB400118250642",
    avatar_url: null,
    created_at: ISO("2020-11-02T10:00:00Z"),
    updated_at: ISO("2026-04-04T14:18:00Z"),
  },
];

/* ------------------------------------------------------------------ *
 *  Officer-visible pending queues
 * ------------------------------------------------------------------ */

export const demoAdminWithdrawalQueue: (WithdrawalRequest & {
  profiles: Pick<Profile, "id" | "full_name" | "email" | "account_number" | "country">;
})[] = [
  {
    ...demoClientWithdrawals[0],
    profiles: {
      id: demoClientProfile.id,
      full_name: demoClientProfile.full_name,
      email: demoClientProfile.email,
      account_number: demoClientProfile.account_number,
      country: demoClientProfile.country,
    },
  },
  {
    id: "demo-wd-q-2",
    user_id: "demo-client-0002",
    currency: "GBP",
    amount: 48200,
    method: "uk_faster",
    payment_details: { destination: "20-15-04 · 11225599" },
    notes: "Office expenditure — please prioritise.",
    status: "pending",
    ...withdrawalEscrowFields(),
    admin_note: null,
    processed_by_admin_id: null,
    created_at: ISO("2026-05-19T07:42:00Z"),
    updated_at: ISO("2026-05-19T07:42:00Z"),
    profiles: {
      id: "demo-client-0002",
      full_name: "Marcus Ainsworth",
      email: "m.ainsworth@example.com",
      account_number: "CB662014950011",
      country: "GB",
    },
  },
  {
    id: "demo-wd-q-3",
    user_id: "demo-client-0003",
    currency: "USD",
    amount: 220000,
    method: "bank_transfer",
    payment_details: { destination: "Mashreq · 1004-5512-887" },
    notes: null,
    status: "pending",
    ...withdrawalEscrowFields(),
    admin_note: null,
    processed_by_admin_id: null,
    created_at: ISO("2026-05-19T05:14:00Z"),
    updated_at: ISO("2026-05-19T05:14:00Z"),
    profiles: {
      id: "demo-client-0003",
      full_name: "Yusuf Al-Hashimi",
      email: "y.alhashimi@example.com",
      account_number: "CB551142390877",
      country: "AE",
    },
  },
];

export const demoAdminTicketQueue: (SupportTicket & {
  profiles: Pick<Profile, "id" | "full_name" | "account_number" | "email">;
})[] = [
  {
    ...demoClientTickets[1],
    profiles: {
      id: demoClientProfile.id,
      full_name: demoClientProfile.full_name,
      email: demoClientProfile.email,
      account_number: demoClientProfile.account_number,
    },
  },
  {
    id: "demo-tk-q-2",
    user_id: "demo-client-0002",
    subject: "Quarterly compliance pack — addendum required",
    message:
      "My counsel in Mayfair has flagged an addendum needed for the Q1 compliance pack. May we coordinate a brief call this week?",
    status: "open",
    admin_reply: null,
    assigned_to_admin_id: null,
    created_at: ISO("2026-05-18T15:32:00Z"),
    updated_at: ISO("2026-05-18T15:32:00Z"),
    profiles: {
      id: "demo-client-0002",
      full_name: "Marcus Ainsworth",
      email: "m.ainsworth@example.com",
      account_number: "CB662014950011",
    },
  },
];

export const demoAdminRecentLedger: Transaction[] = [
  ...demoClientTransactions.slice(0, 5),
  {
    id: "demo-tx-a-1",
    user_id: "demo-client-0002",
    currency: "GBP",
    type: "deposit",
    amount: 150000,
    status: "completed",
    description: "Wire — Coutts London",
    created_by_admin_id: demoAdminProfile.id,
    created_at: ISO("2026-05-15T10:08:00Z"),
  },
  {
    id: "demo-tx-a-2",
    user_id: "demo-client-0003",
    currency: "USD",
    type: "interest",
    amount: 8412.55,
    status: "completed",
    description: "Q2 portfolio interest credit",
    created_by_admin_id: null,
    created_at: ISO("2026-05-13T09:00:00Z"),
  },
];

export const demoAuditLog: (AuditLog & {
  admin: { full_name: string };
  client: { full_name: string };
})[] = [
  {
    id: "al-1",
    admin_id: demoAdminProfile.id,
    user_id: demoClientProfile.id,
    action_type: "withdrawal_completed",
    currency: "USD",
    old_value: { status: "approved", amount: 120000 },
    new_value: { status: "completed", amount: 120000 },
    note: "Settled to Citibank reference 8821-5572.",
    ip_address: "82.150.99.10",
    created_at: ISO("2026-04-28T11:05:00Z"),
    admin: { full_name: demoAdminProfile.full_name },
    client: { full_name: demoClientProfile.full_name },
  },
  {
    id: "al-2",
    admin_id: demoAdminProfile.id,
    user_id: "demo-client-0002",
    action_type: "balance_deposit",
    currency: "GBP",
    old_value: { available_balance: 412800 },
    new_value: { available_balance: 562800 },
    note: "Wire — Coutts London",
    ip_address: "82.150.99.10",
    created_at: ISO("2026-05-15T10:08:00Z"),
    admin: { full_name: demoAdminProfile.full_name },
    client: { full_name: "Marcus Ainsworth" },
  },
  {
    id: "al-3",
    admin_id: demoAdminProfile.id,
    user_id: "demo-client-0006",
    action_type: "user_suspend",
    currency: null,
    old_value: { status: "approved" },
    new_value: { status: "suspended" },
    note: "Suspended pending KYC refresh.",
    ip_address: "82.150.99.10",
    created_at: ISO("2026-04-04T14:18:00Z"),
    admin: { full_name: demoAdminProfile.full_name },
    client: { full_name: "Beatrice Lindqvist" },
  },
];

export const demoLedgerForClient: LedgerEntry[] = [
  {
    id: "le-1",
    user_id: demoClientProfile.id,
    wallet_id: demoClientWallets[0].id,
    admin_id: demoAdminProfile.id,
    currency: "USD",
    action_type: "withdrawal_completed",
    amount: -120000,
    balance_before: 2538902.41,
    balance_after: 2418902.41,
    note: "Settled to Citibank reference 8821-5572.",
    created_at: ISO("2026-04-28T11:05:00Z"),
  },
  {
    id: "le-2",
    user_id: demoClientProfile.id,
    wallet_id: demoClientWallets[0].id,
    admin_id: null,
    currency: "USD",
    action_type: "withdrawal_requested",
    amount: -75000,
    balance_before: 2493902.41,
    balance_after: 2418902.41,
    note: "Withdrawal requested via wise",
    created_at: ISO("2026-05-17T16:48:00Z"),
  },
  {
    id: "le-3",
    user_id: demoClientProfile.id,
    wallet_id: demoClientWallets[1].id,
    admin_id: demoAdminProfile.id,
    currency: "EUR",
    action_type: "admin_deposit",
    amount: 250000,
    balance_before: 857433.12,
    balance_after: 1107433.12,
    note: "Wire — Banque Lombard Geneva",
    created_at: ISO("2026-05-12T13:14:00Z"),
  },
];

/* ------------------------------------------------------------------ *
 *  Analytics aggregates
 * ------------------------------------------------------------------ */

export const demoAnalytics = {
  totalClients: demoClientRoster.length,
  approvedClients: demoClientRoster.filter((p) => p.account_status === "approved").length,
  pendingClients: demoClientRoster.filter((p) => p.account_status === "pending").length,
  openTickets: demoAdminTicketQueue.length,
  pendingWithdrawals: demoAdminWithdrawalQueue.length,
  custody: {
    USD: 8_402_310.55,
    EUR: 4_982_119.23,
    GBP: 2_315_604.18,
  },
  pending: {
    USD: 295_000,
    EUR: 0,
    GBP: 60_700,
  },
  withdrawnLifetime: {
    USD: 1_240_400,
    EUR: 612_000,
    GBP: 224_800,
  },
  withdrawalsByStatus: {
    pending: 3,
    approved: 2,
    completed: 41,
    rejected: 1,
  },
  pendingRefunds: 4,
};

/* ------------------------------------------------------------------ *
 *  Refund claims — demo seed
 * ------------------------------------------------------------------ */

export const demoClientRefundClaims: RefundClaim[] = [
  {
    id: "demo-rc-1",
    user_id: demoClientProfile.id,
    claim_type: "transaction_dispute",
    claimant_name: demoClientProfile.full_name,
    claimant_email: demoClientProfile.email,
    claimant_phone: demoClientProfile.phone,
    account_reference: demoClientProfile.account_number,
    transaction_reference: "TX-2026-04-26-8821",
    related_transaction_id: null,
    currency: "USD",
    amount: 350,
    description:
      "The Q1 administration fee of $350 was applied twice — once on 01 April and again on 01 May. Please reverse the duplicate.",
    supporting_info: { reason: "duplicate_charge" },
    status: "approved",
    admin_note:
      "Duplicate confirmed. Reversal scheduled for next settlement window.",
    processed_by_admin_id: demoAdminProfile.id,
    created_at: ISO("2026-05-15T09:24:00Z"),
    updated_at: ISO("2026-05-16T11:02:00Z"),
  },
  {
    id: "demo-rc-2",
    user_id: demoClientProfile.id,
    claim_type: "transaction_dispute",
    claimant_name: demoClientProfile.full_name,
    claimant_email: demoClientProfile.email,
    claimant_phone: demoClientProfile.phone,
    account_reference: demoClientProfile.account_number,
    transaction_reference: "WD-2026-05-10",
    related_transaction_id: null,
    currency: "GBP",
    amount: 12500,
    description:
      "My UK Faster Payments transfer of GBP 12,500 on 10 May has not arrived at Coutts. Could you confirm settlement and, if needed, arrange a recall?",
    supporting_info: { reason: "failed_settlement" },
    status: "under_review",
    admin_note: null,
    processed_by_admin_id: demoAdminProfile.id,
    created_at: ISO("2026-05-18T10:42:00Z"),
    updated_at: ISO("2026-05-19T08:14:00Z"),
  },
];

export const demoAdminRefundQueue: (RefundClaim & {
  profiles: Pick<Profile, "id" | "full_name" | "account_number" | "email"> | null;
})[] = [
  {
    ...demoClientRefundClaims[1],
    profiles: {
      id: demoClientProfile.id,
      full_name: demoClientProfile.full_name,
      email: demoClientProfile.email,
      account_number: demoClientProfile.account_number,
    },
  },
  {
    id: "demo-rc-q-3",
    user_id: "demo-client-0003",
    claim_type: "transaction_dispute",
    claimant_name: "Yusuf Al-Hashimi",
    claimant_email: "y.alhashimi@example.com",
    claimant_phone: "+971 4 555 0942",
    account_reference: "CB551142390877",
    transaction_reference: "TX-2026-05-09-4421",
    related_transaction_id: null,
    currency: "USD",
    amount: 4800,
    description:
      "An FX spread charge of USD 4,800 applied to the EUR conversion on 9 May appears to exceed the rate negotiated in our March mandate update. Requesting review and partial reversal.",
    supporting_info: { reason: "incorrect_amount" },
    status: "pending",
    admin_note: null,
    processed_by_admin_id: null,
    created_at: ISO("2026-05-19T07:20:00Z"),
    updated_at: ISO("2026-05-19T07:20:00Z"),
    profiles: {
      id: "demo-client-0003",
      full_name: "Yusuf Al-Hashimi",
      email: "y.alhashimi@example.com",
      account_number: "CB551142390877",
    },
  },
  // ---- Anonymous public claim (no linked client) -------------------------
  {
    id: "demo-rc-q-4",
    user_id: null,
    claim_type: "public_claim",
    claimant_name: "John A. Reilly",
    claimant_email: "j.reilly@example.com",
    claimant_phone: "+1 415 555 0188",
    account_reference: null,
    transaction_reference: "Reference unknown",
    related_transaction_id: null,
    currency: "USD",
    amount: 18400,
    description:
      "My late father, William Reilly, had a relationship with Continental Bank's New York office in the 1980s. As executor of his estate I am trying to determine whether any historical deposit remains in his name. Documentation can be provided on request.",
    supporting_info: { reason: "other" },
    status: "pending",
    admin_note: null,
    processed_by_admin_id: null,
    created_at: ISO("2026-05-18T22:55:00Z"),
    updated_at: ISO("2026-05-18T22:55:00Z"),
    profiles: null,
  },
  {
    id: "demo-rc-q-5",
    user_id: "demo-client-0002",
    claim_type: "transaction_dispute",
    claimant_name: "Marcus Ainsworth",
    claimant_email: "m.ainsworth@example.com",
    claimant_phone: "+44 20 7946 0034",
    account_reference: "CB662014950011",
    transaction_reference: "WD-2026-05-19",
    related_transaction_id: null,
    currency: "GBP",
    amount: 48200,
    description:
      "Withdrawal of GBP 48,200 lodged this morning was rejected at the counterparty. Please reverse the pending balance and confirm.",
    supporting_info: { reason: "failed_settlement" },
    status: "pending",
    admin_note: null,
    processed_by_admin_id: null,
    created_at: ISO("2026-05-20T06:18:00Z"),
    updated_at: ISO("2026-05-20T06:18:00Z"),
    profiles: {
      id: "demo-client-0002",
      full_name: "Marcus Ainsworth",
      email: "m.ainsworth@example.com",
      account_number: "CB662014950011",
    },
  },
];
