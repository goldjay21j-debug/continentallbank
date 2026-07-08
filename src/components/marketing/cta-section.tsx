import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/primitives";

export function CtaSection() {
  return (
    <section id="contact" className="bg-navy-900 text-ivory-100">
      <div className="container relative overflow-hidden py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #C8A96A 0%, transparent 38%), radial-gradient(circle at 80% 70%, #C8A96A 0%, transparent 45%)",
          }}
          aria-hidden
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-12">
          <Reveal>
            <div className="eyebrow flex items-center gap-3 mb-4 text-champagne-300">
              <span className="inline-block h-px w-8 bg-champagne-400/70" />
              <span>Escrow & Private Banking Desk</span>
            </div>
            <h2 className="font-display text-display-xl text-balance">
              Open a secure escrow account with bank officer review.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ivory-100/75 text-pretty">
              Submit your client profile and service request first. The escrow desk can verify
              identity, review provider references, request supporting documents, and open escrow
              only after the required checks are complete.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" variant="gold" asChild>
                <Link href="/register">
                  Open escrow account
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-ivory-100/20 bg-transparent text-ivory-100 hover:bg-ivory-100/5"
              >
                <Link href="mailto:escrow@continentallbank.com">
                  Contact escrow desk
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal
            delay={0.08}
            className="space-y-5 border border-ivory-100/15 bg-navy-800/40 p-5 rounded-md backdrop-blur-sm sm:p-6"
          >
            <div>
              <div className="eyebrow text-champagne-300">Escrow & Private Banking Desk</div>
              <p className="mt-3 text-[14px] leading-relaxed text-ivory-100/80">
                Secure onboarding for private banking relationships, private escrow accounts,
                digital asset reviews, bank transfers, account verification, and marketplace
                payment support.
              </p>
            </div>
            <div className="hairline bg-ivory-100/10" />
            <div>
              <div className="eyebrow text-champagne-300">Client Support</div>
              <p className="mt-3 text-[14px] tabular-figures text-ivory-100/80">
                escrow@continentallbank.com
                <br />
                Secure portal: /register
              </p>
            </div>
            <div className="hairline bg-ivory-100/10" />
            <div>
              <div className="eyebrow text-champagne-300">Review Standard</div>
              <p className="mt-3 text-[14px] text-ivory-100/80">
                Bank officer review, KYC verification, audit logs, and controlled release workflow.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
