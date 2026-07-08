import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Common questions about recovery case onboarding, evidence review, KYC, escrow, releases, and the secure message center.",
};

export default function HelpPage() {
  return (
    <LegalPage
      eyebrow="Help"
      title="Help Center"
      lead="Answers to the questions clients most often ask. For anything not covered here, the recovery desk responds through the secure portal."
      sections={[
        {
          title: "Onboarding",
          body: (
            <>
              <p>
                <strong>How do I start?</strong> Create a secure recovery profile, wait for
                account approval, then file the investment recovery case from your dashboard. The
                recovery desk will request identity documents and evidence as needed.
              </p>
              <p>
                <strong>How long does approval take?</strong> Typically one business day for
                qualifying applications. Complex cases involving multiple payment providers,
                jurisdictions, wallets, or counterparties may require additional review.
              </p>
            </>
          ),
        },
        {
          title: "Wallets & ledger",
          body: (
            <>
              <p>
                <strong>Why three currencies?</strong> Continental clients hold USD, EUR, and GBP
                positions independently. Each portfolio is reconciled separately. Consolidated
                figures shown on your dashboard are computed at the EOM Geneva fix for reporting
                convenience only.
              </p>
              <p>
                <strong>How are interest credits calculated?</strong> Interest is accrued daily
                against the prevailing rate for each currency band and credited monthly on the
                first business day.
              </p>
            </>
          ),
        },
        {
          title: "Withdrawals",
          body: (
            <>
              <p>
                <strong>How long does a withdrawal take?</strong> Approved withdrawals settle
                within one business day for SEPA, UK Faster Payments, Wise, Revolut, and PayPal.
                Bank wire to non-correspondent institutions may take two to three business days
                depending on the receiving bank.
              </p>
              <p>
                <strong>Why does the amount sit in pending balance first?</strong> Funds move
                from available to pending balance when an instruction is received. They settle
                fully (and are removed from pending) once your banker has executed and confirmed.
              </p>
            </>
          ),
        },
        {
          title: "Beneficiaries",
          body: (
            <>
              <p>
                <strong>Why does a destination need approval?</strong> Continental only routes
                outbound funds to destinations a finance officer has verified against your KYC
                file. This protects you from misdirection by impersonators.
              </p>
              <p>
                <strong>How long does approval take?</strong> Typically within the business day.
                Domestic SEPA and UK Faster Payments are usually faster than international
                wires, which may require a confirmation call to the receiving institution.
              </p>
            </>
          ),
        },
        {
          title: "Statements & documents",
          body: (
            <>
              <p>
                <strong>Where do I find my statements?</strong> The Document Vault on your
                dashboard contains every statement, account letter, KYC confirmation, withdrawal
                receipt, refund evidence, and annual tax summary issued in your name.
              </p>
              <p>
                <strong>Can I request a custom report?</strong> Yes. Open a thread in the Secure
                Message Center and the recovery desk will prepare it within the business day.
              </p>
            </>
          ),
        },
        {
          title: "Contacting us",
          body: (
            <>
              <p>
                The Secure Message Center is the fastest way to reach the recovery desk for any
                non-urgent matter. For urgent operational issues, suspected unauthorised
                instructions, or freeze requests, contact case support directly through the
                details in your portal.
              </p>
              <p>
                General inquiries:{" "}
                <a
                  href="mailto:support@continentallbank.com"
                  className="text-foreground underline underline-offset-4"
                >
                  support@continentallbank.com
                </a>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
