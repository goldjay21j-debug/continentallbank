import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingBackdrop } from "@/components/marketing/marketing-backdrop";

type Section = {
  title: string;
  body: React.ReactNode;
};

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  afterLead?: React.ReactNode;
  effective?: string;
  sections: Section[];
};

/**
 * Shared layout for legal / informational pages (Privacy, Terms, About,
 * FAQ). Centred narrow column, premium typography, glass-light card per
 * section. Header + footer kept from the marketing site.
 */
export function LegalPage({ eyebrow, title, lead, afterLead, effective, sections }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
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

          <div className="mt-5 max-w-3xl">
            <div className="eyebrow flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>{eyebrow}</span>
            </div>
            <h1 className="font-display text-display-xl text-foreground text-balance">{title}</h1>
            {lead && (
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                {lead}
              </p>
            )}
            {afterLead && <div className="mt-6">{afterLead}</div>}
            {effective && (
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Effective {effective}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="relative bg-background">
        <div className="container py-10 lg:py-14">
          <div className="mx-auto max-w-3xl space-y-4">
            {sections.map((s) => (
              <article key={s.title} className="glass-light p-5 lg:p-7">
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  {s.title}
                </h2>
                <div className="space-y-4 text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
                  {s.body}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      </main>

      <SiteFooter />
    </div>
  );
}
