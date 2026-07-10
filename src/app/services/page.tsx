import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Briefcase,
  Globe2,
  Landmark,
  Layers,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingBackdrop } from "@/components/marketing/marketing-backdrop";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { TrustBadgeRail } from "@/components/shared/trust-badges";

export const metadata: Metadata = {
  title: "Private banking services",
  description:
    "Continental Bank's services for principals, family offices, and institutional clients — wealth oversight, custody, multi-currency accounts, and executive concierge.",
};

const services = [
  {
    icon: Landmark,
    eyebrow: "Wealth oversight",
    title: "Discretionary & advisory mandates",
    body:
      "Discretionary mandates managed by Geneva for principals who want time back, and advisory relationships for those who want to retain the decision. Mandates are reviewed quarterly with the principal.",
  },
  {
    icon: Banknote,
    eyebrow: "Custody",
    title: "Multi-currency custody",
    body:
      "USD, EUR, and GBP portfolios held independently, with custody at top-tier counterparties. Each portfolio is reconciled monthly and audited annually.",
  },
  {
    icon: Briefcase,
    eyebrow: "Family office",
    title: "Family office services",
    body:
      "Coordinated administration for principals with residences, holdings, and obligations on multiple continents — including liaison with appointed counsel, accountants, and trustees.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Treasury",
    title: "Treasury & liquidity management",
    body:
      "Active management of operating liquidity for clients running businesses, family offices, or foundations. Daily reporting; dual-officer authorisation above mandate thresholds.",
  },
  {
    icon: Globe2,
    eyebrow: "Cross-border",
    title: "Cross-border coordination",
    body:
      "Geneva, London, Luxembourg, Singapore, Dubai, and New York — one client, one ledger, one banker. Local cover during European hours through our regional desks.",
  },
  {
    icon: Layers,
    eyebrow: "Reporting",
    title: "Bespoke reporting & analytics",
    body:
      "Monthly statements, quarterly mandate reviews, annual tax summaries, and bespoke reporting on request — delivered to your secure file vault.",
  },
];

const mandates = [
  {
    name: "Global Treasury Reserve",
    description:
      "For principals managing large operating liquidity across multiple currencies. Conservative posture, daily reporting, dual-officer authorisation on outbound funds above 250,000.",
    minimum: "USD 2,500,000 equivalent",
  },
  {
    name: "Capital Preservation",
    description:
      "For estates and foundations. Multi-currency, capital-protected, income-oriented. Reviewed annually with the principal's appointed counsel.",
    minimum: "USD 5,000,000 equivalent",
  },
  {
    name: "Discretionary Growth",
    description:
      "For principals with a longer horizon. Broad mandate within agreed risk parameters. Quarterly review with the assigned officer.",
    minimum: "USD 10,000,000 equivalent",
  },
  {
    name: "Family Office Coordination",
    description:
      "Bespoke coordination for multi-generation principals. Pricing reflects scope of administrative work. Discussed at relationship opening.",
    minimum: "By introduction only",
  },
];

export default function ServicesPage() {
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
              <span>Services</span>
            </div>
            <h1 className="font-display text-display-xl text-foreground text-balance">
              Private banking, in the original sense.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              Continental Bank offers the institutional services a principal needs to oversee
              wealth quietly: custody, treasury, multi-currency accounts, discretionary and
              advisory mandates, and the coordination that makes them work together.
            </p>
            <TrustBadgeRail preset="marketing" compact className="mt-6 lg:grid-cols-4" />
          </Reveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-background border-t border-border/60">
        <div className="container py-10 lg:py-14">
          <Reveal className="mb-8 max-w-2xl">
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Service lines</span>
            </div>
            <h2 className="font-display text-display-md text-foreground text-balance">
              Six lines of service, one relationship.
            </h2>
          </Reveal>

          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" step={0.06}>
            {services.map((s) => (
              <StaggerItem
                as="article"
                key={s.title}
                className="glass-light p-5 lg:p-6 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                    {s.eyebrow}
                  </div>
                  <s.icon className="h-4 w-4 text-champagne-600" strokeWidth={1.5} />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground tracking-tight text-balance">
                  {s.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
                  {s.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Mandates */}
      <section className="bg-paper relative overflow-hidden border-t border-border/60">
        <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden />
        <MarketingBackdrop />
        <div className="container relative py-10 lg:py-14">
          <Reveal className="mb-8 max-w-2xl">
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Mandates</span>
            </div>
            <h2 className="font-display text-display-md text-foreground text-balance">
              Four mandate frameworks.
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
              We do not market individual products. Continental establishes a mandate at
              relationship opening and reviews it on the agreed cadence.
            </p>
          </Reveal>

          <Stagger className="grid gap-4 md:grid-cols-2" step={0.06}>
            {mandates.map((m, i) => (
              <StaggerItem as="article" key={m.name} className="glass-light p-5 lg:p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-foreground tracking-tight">
                    {m.name}
                  </h3>
                  <span className="text-[10.5px] uppercase tracking-[0.18em] text-champagne-700 dark:text-champagne-400 tabular-figures">
                    {i + 1} / 4
                  </span>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
                  {m.description}
                </p>
                <div className="mt-5 pt-4 border-t border-foreground/10 flex items-baseline justify-between gap-3 text-[11.5px] uppercase tracking-[0.16em]">
                  <span className="text-muted-foreground">Minimum relationship</span>
                  <span className="text-foreground font-medium tracking-tight normal-case text-[13px] tabular-figures">
                    {m.minimum}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 text-ivory-100">
        <div className="container py-12 lg:py-16 relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #C8A96A 0%, transparent 40%), radial-gradient(circle at 80% 70%, #C8A96A 0%, transparent 45%)",
            }}
            aria-hidden
          />
          <Reveal className="relative max-w-2xl">
            <div className="eyebrow flex items-center gap-3 mb-4 text-champagne-300">
              <span className="inline-block h-px w-8 bg-champagne-400/70" />
              <span>Escrow & Private Banking Desk</span>
            </div>
            <h2 className="font-display text-display-lg text-balance">
              A secure account request starts the mandate.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ivory-100/80 max-w-xl text-pretty">
              Submit the escrow or banking request, supporting document summary, payment
              references, and counterparty details. The escrow desk reviews the file before
              requesting documents, activating escrow, or moving any release workflow forward.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="gold" asChild>
                <Link href="/register">
                  Open escrow account
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-ivory-100/20 bg-transparent text-ivory-100 hover:bg-ivory-100/5"
              >
                <Link href="mailto:escrow@continentallbank.com">
                  Contact escrow desk
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
