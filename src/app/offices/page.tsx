import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, Globe2, Phone, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingBackdrop } from "@/components/marketing/marketing-backdrop";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";

export const metadata: Metadata = {
  title: "Global offices",
  description:
    "Continental Bank's offices in Geneva, London, Luxembourg, Singapore, Dubai, and New York.",
};

type Office = {
  city: string;
  region: string;
  status: "Headquarters" | "Branch" | "Representative";
  since: string;
  address: string;
  phone: string;
  email: string;
  desk_head: string;
  hours: string;
};

const offices: Office[] = [
  {
    city: "Geneva",
    region: "Switzerland",
    status: "Headquarters",
    since: "1972",
    address: "Place de la Concorde 12 · CH-1204 Geneva",
    phone: "+41 22 000 00 00",
    email: "geneva@continentallbank.com",
    desk_head: "É. Dupont, Head of Private Clients",
    hours: "Mon–Fri 07:00–20:00 CET",
  },
  {
    city: "London",
    region: "United Kingdom",
    status: "Branch",
    since: "1981",
    address: "12 St James's Street · London SW1A 1ES",
    phone: "+44 20 0000 0000",
    email: "london@continentallbank.com",
    desk_head: "I. Whitmore, Desk Head",
    hours: "Mon–Fri 07:00–19:00 GMT",
  },
  {
    city: "Luxembourg",
    region: "Grand Duchy of Luxembourg",
    status: "Branch",
    since: "1986",
    address: "Avenue Monterey 28 · L-2163 Luxembourg",
    phone: "+352 22 00 00 00",
    email: "luxembourg@continentallbank.com",
    desk_head: "L. Faber, Desk Head",
    hours: "Mon–Fri 08:00–18:00 CET",
  },
  {
    city: "Singapore",
    region: "Republic of Singapore",
    status: "Branch",
    since: "1997",
    address: "Asia Square Tower 1 · 8 Marina View",
    phone: "+65 6800 0000",
    email: "singapore@continentallbank.com",
    desk_head: "K. Lim, Desk Head",
    hours: "Mon–Fri 08:00–20:00 SGT",
  },
  {
    city: "Dubai",
    region: "United Arab Emirates",
    status: "Branch",
    since: "2009",
    address: "DIFC · Gate Village 11 · Dubai",
    phone: "+971 4 000 0000",
    email: "dubai@continentallbank.com",
    desk_head: "S. Al-Mahmoud, Desk Head",
    hours: "Sun–Thu 08:00–18:00 GST",
  },
  {
    city: "New York",
    region: "United States",
    status: "Representative",
    since: "2014",
    address: "Park Avenue 590 · New York, NY 10022",
    phone: "+1 212 000 0000",
    email: "newyork@continentallbank.com",
    desk_head: "R. Carrington, Representative",
    hours: "Mon–Fri 08:00–18:00 ET",
  },
];

export default function OfficesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="relative overflow-hidden bg-paper">
        <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden />
        <MarketingBackdrop />
        <div className="container relative pt-20 pb-16 lg:pt-28 lg:pb-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="h-3 w-3" />
            Return home
          </Link>

          <Reveal className="mt-7 max-w-3xl">
            <div className="eyebrow flex items-center gap-3 mb-6">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Global Reach</span>
            </div>
            <h1 className="font-display text-display-xl text-foreground text-balance">
              Six offices, one institution.
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              Continental Bank operates under one common protocol across six offices. Whether
              your day begins in Singapore or settles in Geneva, the same officer, the same
              record, the same standard.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-background border-t border-border/60">
        <div className="container py-16 lg:py-20">
          <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" step={0.06}>
            {offices.map((o) => (
              <StaggerItem as="article" key={o.city} className="glass-light p-6 lg:p-7 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                      {o.status}
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-foreground tracking-tight">
                      {o.city}
                    </h3>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">{o.region}</p>
                  </div>
                  <span className="text-[10.5px] uppercase tracking-[0.18em] text-champagne-700 dark:text-champagne-400 tabular-figures">
                    Est. {o.since}
                  </span>
                </div>

                <div className="mt-5 space-y-3.5 text-[12.5px]">
                  <Row icon={MapPin} label="Address" value={o.address} />
                  <Row icon={Phone} label="Telephone" value={o.phone} mono />
                  <Row icon={Building2} label="Desk head" value={o.desk_head} />
                  <Row icon={Globe2} label="Hours" value={o.hours} />
                </div>

                <a
                  href={`mailto:${o.email}`}
                  className="mt-5 pt-4 border-t border-foreground/10 inline-flex items-center justify-between text-[12.5px] text-foreground hover:text-champagne-700 dark:hover:text-champagne-400 transition-colors duration-200 group"
                >
                  <span className="font-mono">{o.email}</span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-3.5 w-3.5 mt-0.5 text-champagne-600 shrink-0" strokeWidth={1.6} />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <div
          className={
            "mt-0.5 text-foreground " +
            (mono ? "font-mono tabular-figures text-[12.5px]" : "text-[13px]")
          }
        >
          {value}
        </div>
      </div>
    </div>
  );
}
