import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { TrustBadgeRail } from "@/components/shared/trust-badges";

export const metadata: Metadata = {
  title: "Compliance",
  description:
    "Continental Bank's regulatory framework, AML/KYC standards, sanctions screening, and supervisory oversight.",
};

export default function CompliancePage() {
  return (
    <LegalPage
      eyebrow="Governance"
      title="Compliance & regulatory framework"
      lead="Continental Bank operates under the supervision of the Swiss Financial Market Supervisory Authority and the standards of the Wolfsberg principles for private banking. This page summarises our framework."
      afterLead={<TrustBadgeRail preset="security" compact />}
      sections={[
        {
          title: "1. Supervisory oversight",
          body: (
            <>
              <p>
                The Bank is a member of an accredited Swiss self-regulatory organisation (SRO) for
                anti-money-laundering supervision and is licensed under the Swiss Banking Act. Our
                affiliated entities in London, Luxembourg, Singapore, and Dubai are licensed and
                supervised by their respective competent authorities.
              </p>
            </>
          ),
        },
        {
          title: "2. KYC standards",
          body: (
            <>
              <p>
                Every relationship is opened only after identification of the principal,
                verification of the source of wealth, and determination of beneficial ownership.
                Documentation is held in our secure file vault for the lifetime of the
                relationship and seven years thereafter, as required by Swiss law.
              </p>
              <p>
                Enhanced due diligence is applied to politically exposed persons, principals
                domiciled in jurisdictions designated as higher risk, and any transactions whose
                economic background is unclear.
              </p>
            </>
          ),
        },
        {
          title: "3. Sanctions screening",
          body: (
            <>
              <p>
                Continental screens all principals, beneficial owners, authorised representatives,
                and counterparties against EU, OFAC, UN, and Swiss SECO sanctions lists at
                onboarding and continuously thereafter. We do not establish or maintain
                relationships with sanctioned persons or entities.
              </p>
            </>
          ),
        },
        {
          title: "4. Transaction monitoring",
          body: (
            <>
              <p>
                Inbound and outbound transactions are monitored against the client's economic
                profile. Atypical activity is escalated to the bank's MLRO for review and, where
                appropriate, reported to MROS in accordance with Swiss AMLA.
              </p>
            </>
          ),
        },
        {
          title: "5. Internal audit",
          body: (
            <>
              <p>
                An independent internal audit function reviews the Bank's compliance, risk, and
                operational controls on a multi-year plan approved annually by the Board. External
                audit is performed by a top-tier firm whose engagement and opinion are public.
              </p>
            </>
          ),
        },
        {
          title: "6. Contacting Compliance",
          body: (
            <>
              <p>
                For correspondence concerning compliance — including any concern raised by a
                supervisor, court, or counsel — please write to{" "}
                <a
                  href="mailto:compliance@continentallbank.com"
                  className="text-foreground underline underline-offset-4"
                >
                  compliance@continentallbank.com
                </a>
                . We respond to all bona fide inquiries within five business days.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
