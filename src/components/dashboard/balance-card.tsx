"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Lock,
  LockKeyhole,
  MessageSquare,
  Wallet as WalletIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CURRENCY_LABELS, type Currency } from "@/lib/constants";

const SYMBOL: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£" };

export interface CurrencyBalance {
  currency: Currency;
  /** Spendable available balance for this currency account (major units). */
  availableBalance: number;
  /** Escrow amount eligible for release in this currency (major units). */
  escrowEligible: number;
}

export interface BalanceCardProps {
  holderName: string;
  /** Pass formatAccountNumber(account_number) — e.g. "CB32 5890 8611 58". */
  cardNumberFormatted: string;
  memberSince?: number;
  balances: CurrencyBalance[];
  defaultCurrency?: Currency;
}

/**
 * Splits a localized currency string into a leading symbol, integer group, and
 * superior-set cents (incl. decimal separator). Falls back to the whole formatted
 * string if parsing is uncertain — the split is a visual enhancement only.
 */
function splitAmount(amount: number, currency: Currency) {
  const sym = SYMBOL[currency] ?? "";
  const full = formatCurrency(amount, currency);
  const decSep = currency === "EUR" ? "," : ".";
  const cut = full.lastIndexOf(decSep);
  const strip = (s: string) => s.replace(sym, "").replace(/ /g, "").trim();
  if (cut === -1) return { sym, int: strip(full) || "0", cents: "" };
  const int = strip(full.slice(0, cut));
  const cents = strip(full.slice(cut));
  if (!/^\d+$/.test(int.replace(/[.,\s]/g, ""))) return { sym: "", int: full, cents: "" };
  return { sym, int, cents };
}

/**
 * "Minimal" balance card (Option C): a compact navy card — one balance, one gold
 * hairline, one account number — with the quick actions in a row below it.
 */
export function BalanceCard({
  holderName,
  cardNumberFormatted,
  balances,
  defaultCurrency,
}: BalanceCardProps) {
  const first = balances[0]?.currency ?? "USD";
  const [ccy, setCcy] = useState<Currency>(defaultCurrency ?? first);
  const [hidden, setHidden] = useState(false);

  const active = balances.find((b) => b.currency === ccy) ?? balances[0];
  const { sym, int, cents } = splitAmount(active?.availableBalance ?? 0, ccy);
  const escrowStr = formatCurrency(active?.escrowEligible ?? 0, ccy);

  return (
    <section className="cb-balance" aria-label="Continental balance">
      <p className="eyebrow mb-3">Continental balance</p>

      <div className="cb-stage">
        {/* currency switcher */}
        <div className="cb-switch" role="tablist" aria-label="Display currency">
          {balances.map((b) => (
            <button
              key={b.currency}
              type="button"
              role="tab"
              id={`cb-seg-${b.currency}`}
              aria-selected={b.currency === ccy}
              aria-label={CURRENCY_LABELS[b.currency]}
              className="cb-seg"
              onClick={() => setCcy(b.currency)}
            >
              <span className="cb-sym" aria-hidden>
                {SYMBOL[b.currency]}
              </span>
              {b.currency}
            </button>
          ))}
        </div>

        {/* the minimal card */}
        <article className="cb-card" role="tabpanel" aria-labelledby={`cb-seg-${ccy}`}>
          <div className="cb-top">
            <div className="cb-lockup">
              <svg className="cb-shield" viewBox="0 0 34 40" aria-hidden focusable="false">
                <path d="M17 1 L32 6 V19 C32 30 25 36 17 39 C9 36 2 30 2 19 V6 Z" fill="none" stroke="rgba(219,188,114,.85)" strokeWidth={1.1} />
                <text x="17" y="25" textAnchor="middle" fontFamily="Palatino, Georgia, serif" fontSize={15} fontWeight={600} fill="rgba(219,188,114,.92)" letterSpacing={0.5}>
                  CB
                </text>
              </svg>
              <div className="cb-wm">CONTINENTAL</div>
            </div>
            <div className="cb-badge">
              <span className="cb-sym" aria-hidden>
                {SYMBOL[ccy]}
              </span>
              <span>{ccy}</span>
            </div>
          </div>

          <div className="cb-hlabel-row">
            <span className="cb-hlabel">Available balance</span>
            <button
              type="button"
              className="cb-eye"
              aria-pressed={hidden}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              onClick={() => setHidden((v) => !v)}
            >
              {hidden ? <EyeOff strokeWidth={1.7} /> : <Eye strokeWidth={1.7} />}
            </button>
          </div>
          <div className={hidden ? "cb-figure is-hidden" : "cb-figure"} aria-live="polite">
            {cents ? (
              <>
                <span className="cb-sym">{sym}</span>
                <span className="cb-int">{int}</span>
                <span className="cb-cents">{cents}</span>
              </>
            ) : (
              <span>{formatCurrency(active?.availableBalance ?? 0, ccy)}</span>
            )}
          </div>
          <div className="cb-escrow">
            <Lock className="cb-lock" strokeWidth={1.6} aria-hidden />
            <span className="cb-k">Escrow eligible</span>
            <span className="cb-v">{escrowStr}</span>
          </div>

          <div className="cb-rule" />
          <div className="cb-cbottom">
            <div className="cb-cardno">{cardNumberFormatted}</div>
            <div className="cb-holder">{holderName}</div>
          </div>
        </article>

        {/* quick actions — below the card */}
        <div className="cb-actions">
          <Link href="/dashboard/withdraw" className="cb-action cb-action--primary" data-frost-disable="true">
            <ArrowDownLeft strokeWidth={1.7} />
            <span className="cb-stack">
              <span className="cb-lead">Withdraw</span>
              <span className="cb-hint">Request an eligible release</span>
            </span>
          </Link>
          <Link href="/dashboard/transactions" className="cb-action">
            <ArrowLeftRight strokeWidth={1.7} />
            Transactions
          </Link>
          <Link href="/dashboard/wallets" className="cb-action">
            <WalletIcon strokeWidth={1.7} />
            Accounts
          </Link>
          <Link href="/dashboard/escrow" className="cb-action">
            <LockKeyhole strokeWidth={1.7} />
            Escrow
          </Link>
          <Link href="/dashboard/messages" className="cb-action" data-frost-allow="true">
            <MessageSquare strokeWidth={1.7} />
            Message banker
          </Link>
        </div>
      </div>
    </section>
  );
}
