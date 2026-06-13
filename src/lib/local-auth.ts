import { CURRENCIES, type Currency } from "@/lib/constants";
import type { Profile, Transaction, Wallet, WithdrawalRequest } from "@/lib/types/database";

export const LOCAL_AUTH_COOKIE = "cb_local_auth";
export const LOCAL_ADMIN_EMAIL = "admin@continental.local";
export const LOCAL_ADMIN_PASSWORD = "admin12345";

export type LocalAuthSession = {
  id: string;
  email: string;
  profile: Profile;
};

type LocalProfileInput = {
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  preferredLanguage?: string;
  preferredCurrency?: Currency;
};

export function createLocalClientSession(input: LocalProfileInput): LocalAuthSession {
  const email = input.email.trim().toLowerCase();
  const id = localIdFor(email);
  const now = new Date().toISOString();

  const profile: Profile = {
    id,
    full_name: input.fullName.trim(),
    email,
    phone: input.phone || null,
    country: input.country || "US",
    company: null,
    preferred_language: input.preferredLanguage || "en",
    preferred_currency: input.preferredCurrency || "USD",
    role: "client",
    account_status: "approved",
    is_verified: false,
    escrow_account_status: "not_started",
    escrow_account_reference: null,
    escrow_account_opened_at: null,
    kyc_status: "not_submitted",
    kyc_method: null,
    kyc_document_name: null,
    kyc_document_path: null,
    kyc_document_mime_type: null,
    kyc_submitted_at: null,
    kyc_reviewed_at: null,
    kyc_reviewed_by_admin_id: null,
    kyc_review_note: null,
    account_number: accountNumberFor(email),
    avatar_url: null,
    created_at: now,
    updated_at: now,
  };

  return { id, email, profile };
}

export function createLocalAdminSession(): LocalAuthSession {
  const email = LOCAL_ADMIN_EMAIL;
  const now = new Date().toISOString();
  const profile: Profile = {
    id: localIdFor(email),
    full_name: "Development Admin",
    email,
    phone: null,
    country: "US",
    company: "Continental Bank",
    preferred_language: "en",
    preferred_currency: "USD",
    role: "super_admin",
    account_status: "approved",
    is_verified: true,
    escrow_account_status: "not_started",
    escrow_account_reference: null,
    escrow_account_opened_at: null,
    kyc_status: "approved",
    kyc_method: null,
    kyc_document_name: null,
    kyc_document_path: null,
    kyc_document_mime_type: null,
    kyc_submitted_at: now,
    kyc_reviewed_at: now,
    kyc_reviewed_by_admin_id: null,
    kyc_review_note: "Internal administrator account.",
    account_number: "CB000000000001",
    avatar_url: null,
    created_at: now,
    updated_at: now,
  };

  return { id: profile.id, email, profile };
}

export function localNameFromEmail(email: string) {
  const raw = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Private Client";
  return raw.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isLocalAdminCredential(email: string, password: string) {
  return email.trim().toLowerCase() === LOCAL_ADMIN_EMAIL && password === LOCAL_ADMIN_PASSWORD;
}

export function encodeLocalAuthSession(session: LocalAuthSession) {
  const json = JSON.stringify(session);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeLocalAuthSession(value: string | undefined | null): LocalAuthSession | null {
  if (!value) return null;

  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as LocalAuthSession;

    if (!parsed?.id || !parsed.email || !parsed.profile?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function localWallets(userId: string, preferredCurrency: Currency = "USD"): Wallet[] {
  const now = new Date().toISOString();
  const balances: Record<Currency, Pick<Wallet, "available_balance" | "pending_balance" | "total_withdrawn">> = {
    USD: { available_balance: 52480000, pending_balance: 1250000, total_withdrawn: 9750000 },
    EUR: { available_balance: 28350000, pending_balance: 620000, total_withdrawn: 4100000 },
    GBP: { available_balance: 14920000, pending_balance: 280000, total_withdrawn: 2250000 },
  };

  return CURRENCIES.map((currency) => {
    const balance = balances[currency];
    const preferredBoost = currency === preferredCurrency ? 1 : 1;
    return {
      id: `local-wallet-${currency.toLowerCase()}`,
      user_id: userId,
      currency,
      available_balance: balance.available_balance * preferredBoost,
      pending_balance: balance.pending_balance,
      total_withdrawn: balance.total_withdrawn,
      created_at: now,
      updated_at: now,
    };
  });
}

export function localTransactions(userId: string): Transaction[] {
  return [
    {
      id: "local-tx-1",
      user_id: userId,
      currency: "USD",
      type: "deposit",
      amount: 18500000,
      status: "completed",
      description: "Capital call reserve sweep",
      created_by_admin_id: null,
      created_at: daysAgo(2),
    },
    {
      id: "local-tx-2",
      user_id: userId,
      currency: "EUR",
      type: "interest",
      amount: 284500,
      status: "completed",
      description: "Custody yield credit",
      created_by_admin_id: null,
      created_at: daysAgo(5),
    },
    {
      id: "local-tx-3",
      user_id: userId,
      currency: "GBP",
      type: "transfer",
      amount: 3200000,
      status: "completed",
      description: "London treasury reserve transfer",
      created_by_admin_id: null,
      created_at: daysAgo(8),
    },
    {
      id: "local-tx-4",
      user_id: userId,
      currency: "USD",
      type: "withdrawal",
      amount: -1250000,
      status: "pending",
      description: "Board-approved distribution",
      created_by_admin_id: null,
      created_at: daysAgo(11),
    },
  ];
}

export function localWithdrawals(userId: string): WithdrawalRequest[] {
  return [
    {
      id: "local-withdrawal-1",
      user_id: userId,
      currency: "USD",
      amount: 1250000,
      method: "bank_transfer",
      payment_details: { destination: "Operating reserve treasury account" },
      notes: "Settlement window requested after officer verification.",
      status: "pending",
      case_id: null,
      escrow_contract_id: null,
      release_processing_fee: 0,
      release_processing_fee_percentage: 20,
      net_amount: 1250000,
      fee_status: "unpaid",
      release_status: "not_eligible",
      provider_status: null,
      provider_reference: null,
      admin_note: null,
      processed_by_admin_id: null,
      created_at: daysAgo(11),
      updated_at: daysAgo(11),
    },
  ];
}

function localIdFor(value: string) {
  return `local-${hashString(value).toString(16).padStart(8, "0")}`;
}

function accountNumberFor(email: string) {
  const number = String(hashString(email)).padStart(12, "0").slice(0, 12);
  return `CB${number}`;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
