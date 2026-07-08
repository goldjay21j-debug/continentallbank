export const SITE = {
  name: "Continental Bank",
  shortName: "Continental",
  tagline: "Secure escrow, investment review, and private banking oversight.",
  description:
    "A secure private banking platform for escrow onboarding, investment review, private client documents, and officer-controlled release workflows.",
  publicDomain: "https://continentallbank.com",
  domain: process.env.NEXT_PUBLIC_SITE_URL ?? "https://continentallbank.com",
  contact: {
    privateClient: "recovery@continentallbank.com",
    support: "support@continentallbank.com",
  },
  estd: 1972,
} as const;

export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
};

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "CH", name: "Switzerland" },
  { code: "LU", name: "Luxembourg" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong SAR" },
  { code: "JP", name: "Japan" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "IE", name: "Ireland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
] as const;

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "it", name: "Italiano" },
  { code: "ar", name: "العربية" },
  { code: "zh", name: "中文" },
] as const;

export const WITHDRAWAL_METHODS = {
  US: [
    { id: "paypal", label: "PayPal" },
    { id: "cashapp", label: "Cash App" },
    { id: "zelle", label: "Zelle" },
    { id: "bank_transfer", label: "Bank Transfer (ACH)" },
  ],
  EU_UK: [
    { id: "sepa", label: "SEPA Transfer" },
    { id: "iban", label: "IBAN Transfer" },
    { id: "wise", label: "Wise" },
    { id: "revolut", label: "Revolut" },
    { id: "uk_faster", label: "UK Faster Payments" },
    { id: "paypal", label: "PayPal" },
    { id: "bank_transfer", label: "Bank Transfer" },
  ],
} as const;

export type WithdrawalRegion = keyof typeof WITHDRAWAL_METHODS;

export const ACCOUNT_STATUS = {
  pending: "Awaiting Approval",
  approved: "Active",
  rejected: "Declined",
  suspended: "Suspended",
} as const;

export type AccountStatus = keyof typeof ACCOUNT_STATUS;

export const KYC_STATUS = {
  not_submitted: "Not submitted",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Needs attention",
} as const;

export type KycStatus = keyof typeof KYC_STATUS;

export const KYC_METHODS = [
  { id: "passport", label: "Passport", description: "Government passport identity page." },
  { id: "national_id", label: "National ID", description: "Front and back in one PDF or image." },
  { id: "drivers_license", label: "Driver's license", description: "Current licence with visible address." },
  { id: "proof_of_address", label: "Proof of address", description: "Utility, bank, or tax statement under 90 days." },
  { id: "source_of_funds", label: "Source of funds", description: "Bank letter, sale agreement, payroll, or audited proof." },
  { id: "business_registry", label: "Business registry", description: "Certificate of incorporation or company extract." },
] as const;

export type KycMethod = (typeof KYC_METHODS)[number]["id"];

export const WITHDRAWAL_STATUS = {
  draft: "Draft",
  submitted: "Submitted",
  pending: "Pending Review",
  pending_review: "Pending Review",
  awaiting_fee_completion: "Awaiting Fee Completion",
  approved: "Approved",
  approved_for_processing: "Approved for Processing",
  processing: "Processing",
  paid: "Paid",
  rejected: "Rejected",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
} as const;

export type WithdrawalStatus = keyof typeof WITHDRAWAL_STATUS;

export const TRANSACTION_TYPES = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  adjustment: "Adjustment",
  fee: "Fee",
  transfer: "Transfer",
  interest: "Interest",
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;

export const REFUND_STATUS = {
  pending: "Pending Review",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
} as const;

export type RefundStatus = keyof typeof REFUND_STATUS;

export const REFUND_REASONS = [
  { id: "duplicate_charge", label: "Duplicate charge" },
  { id: "incorrect_amount", label: "Incorrect amount" },
  { id: "unauthorised_transaction", label: "Unauthorised transaction" },
  { id: "failed_settlement", label: "Failed / returned settlement" },
  { id: "fee_dispute", label: "Disputed fee" },
  { id: "service_not_rendered", label: "Service not rendered" },
  { id: "other", label: "Other (describe below)" },
] as const;

export const RECOVERY_CASE_TYPES = [
  {
    id: "romance_scam",
    label: "Relationship-led investment mandate",
    description: "Relationship-led financial pressure, private advances, or disputed transfers.",
  },
  {
    id: "crypto_wallet_scam",
    label: "Digital asset wallet review",
    description: "Wallet access issue, exchange dispute, mining-pool matter, or blockchain transfer.",
  },
  {
    id: "investment_scam",
    label: "Investment platform review",
    description: "Broker, trading platform, IPO, fund, or managed-account matter.",
  },
  {
    id: "wire_bank_fraud",
    label: "Wire or bank transfer support",
    description: "Bank wire, ACH, SEPA, IBAN, PayPal, Wise, or card-linked payment review.",
  },
  {
    id: "impersonation_scam",
    label: "Identity verification concern",
    description: "Fake government, bank, law firm, courier, celebrity, or company contact.",
  },
  {
    id: "phishing_account_takeover",
    label: "Phishing / account takeover",
    description: "Compromised email, account login, SIM swap, or unauthorised account access.",
  },
  {
    id: "marketplace_vendor_scam",
    label: "Marketplace / vendor payment review",
    description: "Fake seller, fake invoice, goods not delivered, or business email compromise.",
  },
  {
    id: "inheritance_recovery",
    label: "Inheritance or beneficiary service",
    description: "Estate, beneficiary, probate, or inheritance-related account matter.",
  },
  {
    id: "other_recovery_matter",
    label: "Other escrow or investment matter",
    description: "Any asset, investment, payment, or private banking matter not listed above.",
  },
] as const;

export type RecoveryCaseType = (typeof RECOVERY_CASE_TYPES)[number]["id"];

export const RECOVERY_CASE_TYPE_VALUES = RECOVERY_CASE_TYPES.map((item) => item.id) as [
  RecoveryCaseType,
  ...RecoveryCaseType[],
];

export const RECOVERY_CASE_TYPE_LABELS: Record<RecoveryCaseType, string> =
  RECOVERY_CASE_TYPES.reduce(
    (labels, item) => {
      labels[item.id] = item.label;
      return labels;
    },
    {} as Record<RecoveryCaseType, string>,
  );

export const ADMIN_ROLES = ["super_admin", "finance_admin", "support_admin", "client"] as const;
export type Role = (typeof ADMIN_ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Administrator",
  finance_admin: "Finance Administrator",
  support_admin: "Support Administrator",
  client: "Private Client",
};
