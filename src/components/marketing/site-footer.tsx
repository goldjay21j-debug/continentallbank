import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { SITE } from "@/lib/constants";

const columns = [
  {
    title: "Continental",
    links: [
      { label: "About the House", href: "/about" },
      { label: "Leadership", href: "/leadership" },
      { label: "Global offices", href: "/offices" },
      { label: "Market insights", href: "/insights" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Private banking services", href: "/services" },
      { label: "Frequently asked", href: "/faq" },
      { label: "Help Center", href: "/help" },
      { label: "File a refund claim", href: "/refund" },
    ],
  },
  {
    title: "Trust & Governance",
    links: [
      { label: "Security", href: "/security" },
      { label: "Compliance", href: "/compliance" },
      { label: "Fraud Protection", href: "/fraud-protection" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Engagement", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr] lg:gap-12">
          <div>
            <BrandMark />
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
              Continental Bank is a private institution serving principals and family offices
              across 38 jurisdictions. Discreet by tradition, exacting by mandate. Established
              Geneva 1972.
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Member · International Private Banking Council
            </p>
          </div>

          <div className="grid grid-cols-2 gap-7 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="eyebrow mb-4 text-foreground">{col.title}</h4>
                <ul className="space-y-2.5 text-[13px]">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory disclosure block */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-10 border-t border-border pt-7">
          <div className="text-[12px] leading-relaxed text-muted-foreground text-pretty max-w-3xl">
            <p>
              Continental Bank is a private banking institution operating under the prudential
              supervision of the Swiss Financial Market Supervisory Authority (FINMA). Banking
              services in the United Kingdom are conducted through the London Branch,
              authorised and regulated by the Prudential Regulation Authority and the Financial
              Conduct Authority. EU services are conducted through Continental Bank S.A.,
              Luxembourg, supervised by the Commission de Surveillance du Secteur Financier
              (CSSF). All other jurisdictions are served through co-ordinated representative
              offices under the head office&rsquo;s prudential supervision.
            </p>
            <p className="mt-4">
              The contents of this site do not constitute an offer, invitation, recommendation, or
              solicitation to buy or sell any financial instrument, nor an offer to enter into a
              banking relationship in any jurisdiction in which such offer would be unlawful.
            </p>
          </div>

          <div className="space-y-4 text-[12px]">
            <div>
              <div className="eyebrow text-muted-foreground mb-1.5">Head office</div>
              <p className="text-foreground tabular-figures leading-relaxed">
                Place de la Concorde 12<br />
                CH-1204 Geneva · Switzerland
              </p>
            </div>
            <div>
              <div className="eyebrow text-muted-foreground mb-1.5">Identifiers</div>
              <p className="text-foreground tabular-figures leading-relaxed">
                Reg. CH-660.1.000.000<br />
                BIC CONTCHGGXXX
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-border pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <div>
            © {new Date().getFullYear()} {SITE.name}. Geneva · London · Luxembourg · Singapore ·
            Dubai · New York.
          </div>
          <div className="tabular-figures">All rights reserved</div>
        </div>
      </div>
    </footer>
  );
}
