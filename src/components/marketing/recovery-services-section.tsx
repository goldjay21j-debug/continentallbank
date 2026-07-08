import Link from "next/link";
import { ArrowUpRight, FileCheck2, Landmark, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { MarketingBackdrop } from "./marketing-backdrop";

const caseTypes = [
  "Private banking escrow requests",
  "Digital asset wallet matters",
  "Bank platform reviews",
  "Wire and bank transfer support",
  "Identity impersonation concerns",
  "Phishing and account takeover",
  "Marketplace payment reviews",
  "Inheritance and beneficiary services",
];

const steps = [
  {
    icon: FileCheck2,
    title: "Open the request",
    body: "Clients submit the escrow purpose, account amount, counterparty details, payment references, and supporting document summary.",
  },
  {
    icon: ShieldCheck,
    title: "Officer review",
    body: "The escrow desk reviews documents, requests KYC, checks provider references, and records every status change.",
  },
  {
    icon: LockKeyhole,
    title: "Escrow control",
    body: "Private escrow opens only after the request and identity gate are cleared by an officer.",
  },
  {
    icon: Landmark,
    title: "Eligible release",
    body: "Approved funds and withdrawal release requests remain controlled, documented, and provider reviewed.",
  },
];

export function RecoveryServicesSection() {
  return (
    <section id="recovery" className="relative overflow-hidden border-b border-border bg-ivory-50">
      <MarketingBackdrop />
      <div className="container relative py-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-10">
          <Reveal>
            <div className="eyebrow flex items-center gap-3 mb-4 text-champagne-700">
              <span className="inline-block h-px w-8 bg-champagne-500/70" />
              <span>Escrow & Private Banking Desk</span>
            </div>
            <h2 className="font-display text-display-lg text-foreground text-balance">
              Secure escrow accounts, bank review, and controlled release workflows.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground text-pretty">
              Continental Bank gives clients a structured way to open escrow, complete bank
              review, organize supporting documents, verify identity, and manage approved release
              instructions through a private banking workflow.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Open escrow account
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Continue account setup</Link>
              </Button>
            </div>
            <p className="mt-4 max-w-lg text-[12.5px] leading-5 text-muted-foreground">
              Escrow access is officer-reviewed and never automatic. Officers must validate
              identity, documents, payment records, and provider references before escrow access
              or release steps become available.
            </p>
          </Reveal>

          <div className="space-y-4">
            <Stagger as="ul" className="grid gap-3 sm:grid-cols-2" step={0.05}>
              {caseTypes.map((type) => (
                <StaggerItem
                  as="li"
                  key={type}
                  className="flex items-center gap-3 rounded-md border border-[#E3D8C5] bg-white px-4 py-3 text-[13px] font-medium text-foreground shadow-[0_18px_50px_-42px_rgba(15,23,42,0.45)]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-champagne-500/20 bg-champagne-500/10">
                    <ShieldCheck className="h-4 w-4 text-champagne-700" strokeWidth={1.6} />
                  </span>
                  {type}
                </StaggerItem>
              ))}
            </Stagger>

            <Stagger as="ul" className="grid gap-4 md:grid-cols-2" step={0.06}>
              {steps.map((step) => (
                <StaggerItem
                  as="li"
                  key={step.title}
                  className="rounded-md border border-[#E3D8C5] bg-white p-4 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.45)]"
                >
                  <step.icon className="h-5 w-5 text-champagne-700" strokeWidth={1.6} />
                  <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
