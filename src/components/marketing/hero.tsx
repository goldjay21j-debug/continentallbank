import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustBadgeRail } from "@/components/shared/trust-badges";
import { getT } from "@/lib/i18n/dictionaries";
import { detectLocale } from "@/lib/i18n/detect";
import { SITE } from "@/lib/constants";
import { Vault } from "./vault";
import { MarketingBackdrop } from "./marketing-backdrop";
import { Stagger, StaggerItem } from "@/components/motion/primitives";

export async function Hero() {
  const t = getT(await detectLocale());

  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="absolute inset-0 bg-noise pointer-events-none" aria-hidden />
      <MarketingBackdrop />

      <div className="container relative pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
        {/*
          Layout
            Mobile : text-top → vault → CTAs   (single column, semantic order)
            Desktop: text + CTAs left | vault spans both rows right

          Implementation: a 3-child grid that's single-column on mobile.
          On desktop, the vault is the second child but gets row-span-2 +
          col-start-2, so it sits in the right column spanning both rows
          while the two text blocks stack in the left column.
        */}
        <div className="grid gap-7 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* ---- TOP TEXT (eyebrow + headline + subtitle) ---- */}
          <Stagger
            className="max-w-2xl lg:col-start-1 lg:row-start-1"
            variant="hero"
            step={0.07}
          >
            <StaggerItem>
              <div className="eyebrow inline-flex items-center gap-3 mb-4">
                <span className="inline-block h-px w-8 bg-champagne-500/70" />
                <span>{t("hero.eyebrow")}</span>
              </div>
            </StaggerItem>

            <StaggerItem
              as="h1"
              className="font-display text-display-2xl text-foreground text-balance"
            >
              {t("hero.title")}
            </StaggerItem>

            <StaggerItem
              as="p"
              className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground text-pretty"
            >
              {t("hero.subtitle")}
            </StaggerItem>
          </Stagger>

          {/* ---- VAULT (between text and CTAs on mobile,
                   right column spanning both rows on desktop) ---- */}
          <div className="relative flex items-center justify-center lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:justify-end">
            <div className="w-[min(340px,78vw)] sm:w-[min(420px,80vw)] lg:w-[min(520px,100%)] aspect-square">
              <Vault />
            </div>
          </div>

          {/* ---- CTAs + trust pills (below vault on mobile, below text on desktop) ---- */}
          <Stagger
            className="max-w-2xl lg:col-start-1 lg:row-start-2"
            variant="hero"
            step={0.07}
          >
            <StaggerItem className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="default" asChild>
                <Link href="/register">
                  {t("hero.cta_primary")}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#contact">{t("hero.cta_secondary")}</Link>
              </Button>
            </StaggerItem>

            <StaggerItem className="mt-5">
              <TrustBadgeRail
                preset="marketing"
                compact
                className="sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
              />
            </StaggerItem>
          </Stagger>
        </div>

        {/* ---- Stats strip (full-width, below everything) ---- */}
        <div className="mx-auto mt-8 lg:mt-10 max-w-3xl">
          <div className="glass-light grid grid-cols-3">
            <Stat label={t("hero.stat_established")} value={String(SITE.estd)} />
            <Stat label={t("hero.stat_jurisdictions")} value="38" hasDivider />
            <Stat label={t("hero.stat_currencies")} value="USD · EUR · GBP" small hasDivider />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  small,
  hasDivider,
}: {
  label: string;
  value: string;
  small?: boolean;
  hasDivider?: boolean;
}) {
  return (
    <div
      className={
        "relative p-4 text-center sm:p-5 " +
        (hasDivider ? "before:absolute before:left-0 before:top-3 before:bottom-3 before:w-px before:bg-foreground/10" : "")
      }
    >
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div
        className={
          "mt-1.5 font-display text-foreground tabular-figures " +
          (small ? "text-base font-medium" : "text-2xl font-semibold")
        }
      >
        {value}
      </div>
    </div>
  );
}
