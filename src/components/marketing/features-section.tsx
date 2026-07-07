import { ArrowDownLeft, FileCheck2, Layers, LockKeyhole, ShieldCheck } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { MarketingBackdrop } from "./marketing-backdrop";

const features = [
  {
    icon: FileCheck2,
    eyebrow: "Case Intake",
    title: "A real file for every recovery matter",
    body: "Clients can file romance scam, crypto theft, investment fraud, wire fraud, impersonation, phishing, marketplace, or inheritance recovery cases with structured evidence details.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Investigation Review",
    title: "Evidence checked before escalation",
    body: "Officers review timelines, receipts, wallet records, counterparty details, and KYC before a recovery case can progress to private escrow access.",
  },
  {
    icon: LockKeyhole,
    eyebrow: "Escrow Gate",
    title: "No open release without control",
    body: "Private escrow remains locked until identity, case status, and officer approval gates are complete. Release eligibility is never automatic.",
  },
  {
    icon: Layers,
    eyebrow: "Audit Trail",
    title: "Every status change is traceable",
    body: "Case updates, recovered-fund entries, withdrawal requests, refunds, documents, and officer notes remain visible inside a controlled client and admin workflow.",
  },
  {
    icon: ArrowDownLeft,
    eyebrow: "Release Desk",
    title: "Recovered funds move by review",
    body: "When funds become eligible, the release request is routed through provider review, fee verification, destination checks, and documented completion.",
  },
];

export function FeaturesSection() {
  return (
    <section id="services" className="relative bg-background overflow-hidden">
      <MarketingBackdrop />
      <div className="container relative py-24 lg:py-32">
        <Reveal className="mb-16 max-w-2xl">
          <div className="eyebrow flex items-center gap-3 mb-6">
            <span className="inline-block h-px w-8 bg-champagne-500/70" />
            <span>Recovery Operations</span>
          </div>
          <h2 className="font-display text-display-lg text-foreground text-balance">
            Investigation tools for serious stolen-funds cases.
          </h2>
        </Reveal>

        <Stagger as="ul" className="grid gap-4 md:grid-cols-2" step={0.07}>
          {features.map((f) => (
            <StaggerItem as="li" key={f.title} className="glass-light p-8 lg:p-10">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="eyebrow text-champagne-700 dark:text-champagne-400">
                    {f.eyebrow}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold text-foreground text-balance">
                    {f.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground text-pretty">
                    {f.body}
                  </p>
                </div>
                <f.icon className="h-6 w-6 shrink-0 text-champagne-600/80" strokeWidth={1.4} />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
