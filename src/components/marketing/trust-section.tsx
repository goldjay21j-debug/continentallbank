import { ScrollText, Landmark, Compass, Crown } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { MarketingBackdrop } from "./marketing-backdrop";
import { detectLocale } from "@/lib/i18n/detect";
import { getT } from "@/lib/i18n/dictionaries";

const pillars = [
  {
    icon: Landmark,
    title: "trust.pillar_reliability_title",
    body: "trust.pillar_reliability_body",
  },
  {
    icon: Crown,
    title: "trust.pillar_service_title",
    body: "trust.pillar_service_body",
  },
  {
    icon: ScrollText,
    title: "trust.pillar_oversight_title",
    body: "trust.pillar_oversight_body",
  },
  {
    icon: Compass,
    title: "trust.pillar_executive_title",
    body: "trust.pillar_executive_body",
  },
];

export async function TrustSection() {
  const t = getT(await detectLocale());

  return (
    <section className="relative border-y border-border bg-background overflow-hidden">
      <MarketingBackdrop />
      <div className="container relative py-24 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <div className="eyebrow flex items-center gap-3 mb-6">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>{t("trust.eyebrow")}</span>
            </div>
            <h2 className="font-display text-display-lg text-foreground text-balance">
              {t("trust.title")}
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground text-pretty">
              {t("trust.description_long")}
            </p>

            <TrustBadgeRail
              preset="marketing"
              compact
              className="mt-8 max-w-xl lg:grid-cols-2 xl:grid-cols-2"
            />

            <dl className="mt-12 space-y-6 border-l border-border pl-6">
              <Number title="ø 11 years" body={t("trust.metric_tenure")} />
              <Number title="38 jurisdictions" body={t("trust.metric_jurisdictions")} />
              <Number title="< 0.02%" body={t("trust.metric_variance")} />
            </dl>
          </Reveal>

          <Stagger as="ul" className="grid gap-4 sm:grid-cols-2" step={0.07}>
            {pillars.map((p) => (
              <StaggerItem as="li" key={p.title} className="glass-light p-7 lg:p-9">
                <p.icon className="h-5 w-5 text-champagne-600" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                  {t(p.title)}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground text-pretty">
                  {t(p.body)}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

function Number({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col">
      <dt className="font-display text-xl font-medium tabular-figures text-foreground">{title}</dt>
      <dd className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
        {body}
      </dd>
    </div>
  );
}
