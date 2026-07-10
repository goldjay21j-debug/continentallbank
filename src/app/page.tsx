import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { TrustSection } from "@/components/marketing/trust-section";
import { RecoveryServicesSection } from "@/components/marketing/recovery-services-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { GlobalSection } from "@/components/marketing/global-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ActivityTicker } from "@/components/shared/activity-ticker";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <section className="border-y border-border/60 bg-background">
          <div className="container py-4">
            <ActivityTicker preset="public" label="Client activity" />
          </div>
        </section>
        <RecoveryServicesSection />
        <TrustSection />
        <FeaturesSection />
        <GlobalSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
