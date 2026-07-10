import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ScrollText } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingBackdrop } from "@/components/marketing/marketing-backdrop";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Market Insights",
  description:
    "Quarterly notes from Continental Bank's Geneva research desk — long-form commentary for the bank's principals and family offices.",
};

type Insight = {
  category: "Quarterly Note" | "Treasury Letter" | "Mandate Review" | "Macro Outlook";
  title: string;
  excerpt: string;
  author: string;
  office: string;
  date: string;
  read_minutes: number;
};

const insights: Insight[] = [
  {
    category: "Quarterly Note",
    title: "Q2 2026 — Liquidity, currencies, and the long horizon",
    excerpt:
      "Our Q2 view holds: short-duration USD and EUR liquidity remain a sensible posture for principal capital, with selective deployment as policy clarity returns to the Atlantic. We discuss why mandate breach is the more costly error than mandate caution.",
    author: "Bureau de Recherche · Geneva",
    office: "Geneva",
    date: "2026-04-08",
    read_minutes: 11,
  },
  {
    category: "Treasury Letter",
    title: "Treasury operations across three currencies — a small principle",
    excerpt:
      "Why we hold USD, EUR, and GBP positions at face value rather than converting consolidated reporting on a daily basis. A short letter for new principals.",
    author: "É. Dupont · Head of Private Clients",
    office: "Geneva",
    date: "2026-03-21",
    read_minutes: 6,
  },
  {
    category: "Mandate Review",
    title: "Q1 2026 — Capital Preservation mandate review",
    excerpt:
      "Annual mandate review for the Capital Preservation framework. Capital protection and income generation in measured proportion. Distribution to the principal's appointed counsel on request.",
    author: "É. Dupont · Head of Private Clients",
    office: "Geneva",
    date: "2026-03-04",
    read_minutes: 14,
  },
  {
    category: "Macro Outlook",
    title: "Asia hours — observations from the Singapore desk",
    excerpt:
      "Brief note from K. Lim on liquidity in Asia hours for principals based across our coverage. Singapore continues to act as the Bank's cover during European nights.",
    author: "K. Lim · Singapore Desk",
    office: "Singapore",
    date: "2026-02-18",
    read_minutes: 5,
  },
  {
    category: "Quarterly Note",
    title: "Q1 2026 — A return to quiet rates",
    excerpt:
      "Q1 was the first quarter in three years where Treasury rates moved within a narrow band. We discuss what that implies for principal-capital posture in 2026, and the operational consequences for mandate governance.",
    author: "Bureau de Recherche · Geneva",
    office: "Geneva",
    date: "2026-01-14",
    read_minutes: 13,
  },
  {
    category: "Treasury Letter",
    title: "On counterparty selection — a note for principals",
    excerpt:
      "Continental's counterparty review framework, our preferred custodians, and why we re-examine the list annually regardless of incident.",
    author: "I. Whitmore · London Desk",
    office: "London",
    date: "2025-12-09",
    read_minutes: 9,
  },
];

const categoryTone: Record<Insight["category"], string> = {
  "Quarterly Note": "border-champagne-500/30 bg-champagne-500/10 text-champagne-700 dark:text-champagne-300",
  "Treasury Letter": "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Mandate Review": "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "Macro Outlook": "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

export default function InsightsPage() {
  const featured = insights[0];
  const rest = insights.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper">
        <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden />
        <MarketingBackdrop />
        <div className="container relative pt-14 pb-10 lg:pt-20 lg:pb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="h-3 w-3" />
            Return home
          </Link>

          <Reveal className="mt-5 max-w-3xl">
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Market Insights</span>
            </div>
            <h1 className="font-display text-display-xl text-foreground text-balance">
              Notes from the Geneva research desk.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              Continental's Bureau de Recherche publishes a short body of work each quarter —
              long-form commentary for the Bank's principals and their advisors. We do not
              publish on macro events as they happen.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured note */}
      <section className="bg-background border-t border-border/60">
        <div className="container py-10 lg:py-14">
          <Reveal className="mb-8 max-w-2xl">
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Featured</span>
            </div>
            <h2 className="font-display text-display-md text-foreground text-balance">
              The current quarterly note.
            </h2>
          </Reveal>

          <Reveal>
            <article className="glass-light p-5 lg:p-7 flex flex-col lg:flex-row gap-6 lg:items-start">
              <div className="lg:max-w-md shrink-0">
                <span
                  className={
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.16em] font-medium " +
                    categoryTone[featured.category]
                  }
                >
                  {featured.category}
                </span>
                <h3 className="mt-5 font-display text-2xl lg:text-3xl font-semibold text-foreground tracking-tight text-balance">
                  {featured.title}
                </h3>
                <div className="mt-3 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                  {featured.author} · {formatDate(featured.date)} · {featured.read_minutes} min read
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
                  {featured.excerpt}
                </p>
                <a
                  href="#"
                  className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-foreground hover:text-champagne-700 dark:hover:text-champagne-400 transition-colors duration-200 underline underline-offset-4"
                >
                  Read the full note
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* Archive */}
      <section className="bg-paper relative overflow-hidden border-t border-border/60">
        <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden />
        <MarketingBackdrop />
        <div className="container relative py-10 lg:py-14">
          <Reveal className="mb-8 max-w-2xl">
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Archive</span>
            </div>
            <h2 className="font-display text-display-md text-foreground text-balance">
              Recent letters.
            </h2>
          </Reveal>

          <Stagger as="ul" className="grid gap-4 md:grid-cols-2" step={0.06}>
            {rest.map((p) => (
              <StaggerItem
                as="li"
                key={p.title}
                className="glass-light p-5 lg:p-6 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] font-medium " +
                      categoryTone[p.category]
                    }
                  >
                    {p.category}
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                    {p.read_minutes} min
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground tracking-tight text-balance">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground text-pretty">
                  {p.excerpt}
                </p>
                <div className="mt-5 pt-4 border-t border-foreground/10 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {p.author} · {formatDate(p.date)}
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-8 max-w-xl">
            <div className="glass-light p-5 lg:p-6 flex items-start gap-4">
              <ScrollText className="h-5 w-5 mt-1 text-champagne-600 shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="font-display text-base font-semibold text-foreground">
                  Subscribe to the quarterly note
                </h4>
                <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                  Existing principals receive the quarterly note as a matter of course.
                  Advisors and introducers may request distribution by writing to the Private
                  Client Office.
                </p>
                <a
                  href="mailto:research@continentallbank.com"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-foreground hover:text-champagne-700 dark:hover:text-champagne-400 transition-colors duration-200 underline underline-offset-4"
                >
                  research@continentallbank.com
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
