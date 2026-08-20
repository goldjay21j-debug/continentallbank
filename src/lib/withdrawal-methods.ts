const WITHDRAWAL_METHOD_LABELS: Record<string, string> = {
  bank: "Bank transfer",
  bank_transfer: "Bank transfer",
  bank_wire: "Bank wire",
  card: "Card payout review",
  paypal: "PayPal",
  zelle: "Zelle",
  cashapp: "Cash App",
  wise: "Wise",
  revolut: "Revolut",
  sepa: "SEPA transfer",
  iban: "IBAN transfer",
  uk_faster: "UK Faster Payments",
};

export function formatWithdrawalMethod(method?: string | null) {
  if (!method) return "Withdrawal method";

  const isEscrowRelease = method.startsWith("escrow_");
  const normalized = isEscrowRelease ? method.slice("escrow_".length) : method;
  const label = WITHDRAWAL_METHOD_LABELS[normalized] ?? titleize(normalized);

  return isEscrowRelease ? `Escrow release via ${label}` : label;
}

function titleize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
