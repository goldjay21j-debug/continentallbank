"use client";

import { useId, useState } from "react";
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
  memberSince: number;
  balances: CurrencyBalance[];
  defaultCurrency?: Currency;
  role?: string;
  validThru?: string;
}

/**
 * Splits a localized currency string into a leading symbol, integer group,
 * and superior-set cents (incl. decimal separator). Falls back to the whole
 * formatted string in `int` if parsing is uncertain — the split is a visual
 * enhancement, never a correctness dependency.
 */
function splitAmount(amount: number, currency: Currency) {
  const sym = SYMBOL[currency] ?? "";
  const full = formatCurrency(amount, currency);
  const decSep = currency === "EUR" ? "," : ".";
  const cut = full.lastIndexOf(decSep);
  const strip = (s: string) => s.replace(sym, "").replace(/ /g, "").trim();
  if (cut === -1) return { sym, int: strip(full) || "0", cents: "" };
  const int = strip(full.slice(0, cut));
  const cents = strip(full.slice(cut)); // ".00" | ",00"
  if (!/^\d+$/.test(int.replace(/[.,\s]/g, ""))) {
    // Unexpected shape — degrade gracefully to the full string.
    return { sym: "", int: full, cents: "" };
  }
  return { sym, int, cents };
}

export function BalanceCard({
  holderName,
  cardNumberFormatted,
  memberSince,
  balances,
  defaultCurrency,
  role = "Private Client",
  validThru = "12 / 29",
}: BalanceCardProps) {
  const rawId = useId();
  const grainId = `cb-grain-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const first = balances[0]?.currency ?? "USD";
  const [ccy, setCcy] = useState<Currency>(defaultCurrency ?? first);
  const [hidden, setHidden] = useState(false);

  const active = balances.find((b) => b.currency === ccy) ?? balances[0];
  const { sym, int, cents } = splitAmount(active?.availableBalance ?? 0, ccy);
  const escrowStr = formatCurrency(active?.escrowEligible ?? 0, ccy);

  return (
    <section className="cb-balance" aria-label="Continental balance">
      <p className="eyebrow mb-3">Continental balance</p>

      <div className="cb-inner">
        <div className="cb-cardcol">
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

          {/* the card */}
          <article className="cb-card" role="tabpanel" aria-labelledby={`cb-seg-${ccy}`}>
            <svg className="cb-grain" aria-hidden focusable="false">
              <filter id={grainId}>
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
              </filter>
              <rect width="100%" height="100%" filter={`url(#${grainId})`} />
            </svg>

            {/* CB crest ghost-emboss watermark */}
            <svg className="cb-crest" viewBox="0 0 240 260" aria-hidden focusable="false">
              <g fill="none" strokeWidth={2}>
                <path
                  d="M120 6 L228 40 V132 C228 200 178 240 120 256 C62 240 12 200 12 132 V40 Z"
                  transform="translate(0,1.5)"
                  stroke="rgba(0,0,0,.4)"
                />
                <path
                  d="M120 6 L228 40 V132 C228 200 178 240 120 256 C62 240 12 200 12 132 V40 Z"
                  transform="translate(0,-1.5)"
                  stroke="rgba(255,255,255,.045)"
                />
                <path
                  d="M120 6 L228 40 V132 C228 200 178 240 120 256 C62 240 12 200 12 132 V40 Z"
                  stroke="rgba(200,169,106,.10)"
                />
              </g>
              <text x="120" y="170" textAnchor="middle" fontFamily="Palatino, Georgia, serif" fontWeight={700} fontSize={120} letterSpacing={4} fill="rgba(255,255,255,.028)" transform="translate(0,-1.5)">
                CB
              </text>
              <text x="120" y="170" textAnchor="middle" fontFamily="Palatino, Georgia, serif" fontWeight={700} fontSize={120} letterSpacing={4} fill="rgba(0,0,0,.34)" transform="translate(0,1.5)">
                CB
              </text>
              <text x="120" y="170" textAnchor="middle" fontFamily="Palatino, Georgia, serif" fontWeight={700} fontSize={120} letterSpacing={4} fill="rgba(200,169,106,.085)">
                CB
              </text>
            </svg>

            <div className="cb-microprint" aria-hidden>
              CONTINENTAL·PRIVATE·BANK·CONTINENTAL·PRIVATE·BANK·CONTINENTAL·PRIVATE·BANK·CONTINENTAL·PRIVATE·BANK·CONTINENTAL·PRIVATE·BANK
            </div>

            <div className="cb-face">
              <div className="cb-top">
                <div className="cb-lockup">
                  <svg className="cb-shield" viewBox="0 0 34 40" aria-hidden focusable="false">
                    <path d="M17 1 L32 6 V19 C32 30 25 36 17 39 C9 36 2 30 2 19 V6 Z" fill="none" stroke="rgba(219,188,114,.85)" strokeWidth={1.1} />
                    <text x="17" y="25" textAnchor="middle" fontFamily="Palatino, Georgia, serif" fontSize={15} fontWeight={600} fill="rgba(219,188,114,.92)" letterSpacing={0.5}>
                      CB
                    </text>
                  </svg>
                  <div>
                    <div className="cb-wm">CONTINENTAL</div>
                    <div className="cb-wmsub">Private · Bank · Established MCMLXXII</div>
                  </div>
                </div>
                <div className="cb-badge">
                  <span className="cb-sym" aria-hidden>
                    {SYMBOL[ccy]}
                  </span>
                  <span>{ccy}</span>
                </div>
              </div>

              <div className="cb-hero">
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
              </div>

              <div className="cb-rule" />

              <div className="cb-bottom">
                <svg className="cb-chip" viewBox="0 0 44 35" aria-hidden focusable="false">
                  <rect x="1" y="1" width="42" height="33" rx="6" fill="none" stroke="rgba(219,188,114,.55)" strokeWidth={1} />
                  <rect x="12" y="1" width="20" height="33" fill="none" stroke="rgba(219,188,114,.4)" strokeWidth={1} />
                  <line x1="1" y1="12" x2="44" y2="12" stroke="rgba(219,188,114,.4)" strokeWidth={1} />
                  <line x1="1" y1="23" x2="44" y2="23" stroke="rgba(219,188,114,.4)" strokeWidth={1} />
                </svg>
                <div className="cb-cardno">{cardNumberFormatted}</div>
                <div className="cb-meta">
                  <div>
                    <div className="cb-name">{holderName}</div>
                    <div className="cb-role">{role}</div>
                    <div className="cb-member">Member since {memberSince}</div>
                  </div>
                  <div className="cb-plate">
                    <div className="cb-valid">
                      Valid thru <b>{validThru}</b>
                    </div>
                    <div className="cb-dots" role="presentation" aria-hidden>
                      {balances.map((b) => (
                        <span key={b.currency} className={b.currency === ccy ? "cb-dot on" : "cb-dot"} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* quick actions */}
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
