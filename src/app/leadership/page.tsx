import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingBackdrop } from "@/components/marketing/marketing-backdrop";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "The principals and senior officers responsible for Continental Bank — Geneva, London, Luxembourg, Singapore, Dubai, New York.",
};

type Leader = {
  name: string;
  role: string;
  office: string;
  since: string;
  bio: string;
};

const board: Leader[] = [
  {
    name: "É. Marchand",
    role: "Chairman",
    office: "Geneva",
    since: "1994",
    bio:
      "Joined Continental in 1989 from a Vaudoise private bank. Chairman since 1994. Sits on the audit and compliance committees. Studied law at Lausanne and Geneva.",
  },
  {
    name: "C. Rougier",
    role: "Chief Compliance Officer",
    office: "Geneva",
    since: "2006",
    bio:
      "Career compliance officer. Previously head of AML at a tier-1 Swiss private bank. Member of the Swiss Bankers Association's working group on private client KYC.",
  },
  {
    name: "É. Dupont",
    role: "Head of Private Clients",
    office: "Geneva",
    since: "2003",
    bio:
      "Twenty-two years with Continental. Oversees the relationship-manager team. Each Geneva private client is paired with a named officer reporting to É. Dupont.",
  },
];

const desks: Leader[] = [
  {
    name: "I. Whitmore",
    role: "Desk Head",
    office: "London",
    since: "2011",
    bio:
      "Former head of UK private banking at a top-five British bank. Oversees the Mayfair desk and serves UK-domiciled principals across all three currencies.",
  },
  {
    name: "L. Faber",
    role: "Desk Head",
    office: "Luxembourg",
    since: "2009",
    bio:
      "Oversees the EU-passported desk. Coordinates with counsel on cross-border estate and holding structures for our European clientele.",
  },
  {
    name: "K. Lim",
    role: "Desk Head",
    office: "Singapore",
    since: "2017",
    bio:
      "Joined from a tier-1 Singaporean wealth manager. Coordinates with the Asia-Pacific relationship team and provides local cover during European hours.",
  },
  {
    name: "S. Al-Mahmoud",
    role: "Desk Head",
    office: "Dubai",
    since: "2019",
    bio:
      "Leads the Middle East & North Africa desk. Long-standing relationships with the region's principal families and family offices.",
  },
  {
    name: "R. Carrington",
    role: "Representative",
    office: "New York",
    since: "2018",
    bio:
      "Represents Continental in the Americas. Acts as the introducer to the Geneva private client office for North American principals.",
  },
];

export default function LeadershipPage() {
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
              <span>Leadership</span>
            </div>
            <h1 className="font-display text-display-xl text-foreground text-balance">
              The people responsible for your file.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              Continental Bank is a small institution by design. Decisions about your relationship
              rest with named individuals whose tenure, credentials, and authority are public —
              not with a panel whose composition shifts.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Board / Geneva senior */}
      <section className="bg-background border-t border-border/60">
        <div className="container py-10 lg:py-14">
          <Reveal className="mb-8 max-w-2xl">
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Geneva · senior office</span>
            </div>
            <h2 className="font-display text-display-md text-foreground text-balance">
              The principals at the head of the bank.
            </h2>
          </Reveal>

          <Stagger className="grid gap-5 md:grid-cols-3" step={0.07}>
            {board.map((p) => (
              <StaggerItem as="article" key={p.name} className="glass-light p-5 lg:p-6">
                <LeaderCard leader={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Desks */}
      <section className="bg-paper relative overflow-hidden border-t border-border/60">
        <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden />
        <MarketingBackdrop />
        <div className="container relative py-10 lg:py-14">
          <Reveal className="mb-8 max-w-2xl">
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Desk heads</span>
            </div>
            <h2 className="font-display text-display-md text-foreground text-balance">
              Continental abroad.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              Each desk operates under the same protocol as Geneva, with a senior officer
              responsible to the Chairman.
            </p>
          </Reveal>

          <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" step={0.07}>
            {desks.map((p) => (
              <StaggerItem as="article" key={p.name} className="glass-light p-5 lg:p-6">
                <LeaderCard leader={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <>
      <div className="flex items-start gap-4">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-champagne-500/30 bg-champagne-500/[0.08] text-champagne-700 dark:text-champagne-300 font-display text-base tracking-wider">
          {initials(leader.name)}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">
            {leader.name}
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            {leader.role} · {leader.office}
          </p>
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-champagne-700 dark:text-champagne-400 mt-1">
            Continental since {leader.since}
          </p>
        </div>
      </div>
      <p className="mt-5 text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
        {leader.bio}
      </p>
    </>
  );
}
