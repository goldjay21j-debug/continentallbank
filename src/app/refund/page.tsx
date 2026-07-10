import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ScrollText, Clock } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingBackdrop } from "@/components/marketing/marketing-backdrop";
import { PublicRefundForm } from "@/components/marketing/refund-form";
import { ActivityTicker } from "@/components/shared/activity-ticker";
import { TrustBadgeRail } from "@/components/shared/trust-badges";

export const metadata: Metadata = {
  title: "Submit a Refund Request",
  description:
    "Submit a refund request with Continental Bank for disputed charges, failed settlements, or dormant deposits. All requests are reviewed manually by a relationship officer.",
};

export default function RefundPage() {
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
              <span>Refund Desk</span>
            </div>
            <h1 className="font-display text-display-xl text-foreground text-balance">
              Submit a refund request. We will respond.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
              The form below is for disputed charges, failed settlements, dormant deposits, and
              any other matter requiring restitution. Each request is reviewed by
              hand by a relationship officer of the Bank — there is no automated outcome.
            </p>
            <TrustBadgeRail preset="refund" compact className="mt-6 lg:grid-cols-3 xl:grid-cols-3" />
            <ActivityTicker preset="refund" label="Refund activity" compact className="mt-4" />
          </div>
        </div>
      </section>

      {/* Information row — what to expect */}
      <section className="relative bg-background">
        <div className="container py-8 lg:py-10">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={Clock}
              eyebrow="01"
              title="One business day"
              body="A relationship officer will acknowledge your request by email within one business day. Substantive review follows."
            />
            <InfoCard
              icon={ScrollText}
              eyebrow="02"
              title="Recorded and audited"
              body="Every request is logged against the audit register. The disposition is written, signed, and traceable to the responsible officer."
            />
            <InfoCard
              icon={ShieldCheck}
              eyebrow="03"
              title="Discreet by default"
              body="Request details are discussed by email and on a recorded telephone line. Continental Bank never solicits passwords, OTPs, or full card credentials."
            />
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="relative bg-background">
        <div className="container pb-12 lg:pb-16">
          <div className="mx-auto max-w-3xl">
            <PublicRefundForm />
          </div>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  icon: any;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <article className="glass-light p-5">
      <div className="flex items-start justify-between">
        <div className="eyebrow text-champagne-700 dark:text-champagne-400">{eyebrow}</div>
        <Icon className="h-4 w-4 text-champagne-600" strokeWidth={1.5} />
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
        {body}
      </p>
    </article>
  );
}
