import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about Continental Bank, posted with the discretion appropriate to the relationship.",
};

export default function FAQPage() {
  return (
    <LegalPage
      eyebrow="The House"
      title="Frequently asked questions."
      lead="A short list of questions that arise during the introduction. Detailed questions are best addressed in conversation with a relationship manager."
      sections={[
        {
          title: "How does one become a Client?",
          body: (
            <p>
              A new relationship begins with an introduction, typically from an existing Client or
              a long-standing counsel. Following the introduction the prospective Client is
              invited to a private conversation in Geneva, London, Luxembourg, Singapore, Dubai, or
              New York. A formal application is then prepared by the responsible partner and
              reviewed at the next monthly partners&rsquo; meeting.
            </p>
          ),
        },
        {
          title: "What is the minimum relationship?",
          body: (
            <p>
              Continental Bank does not publish a minimum. The mandate is structured around the
              complexity of the Client&rsquo;s circumstances rather than the size of the portfolio.
              In practice, the House serves principals whose affairs require multi-jurisdictional
              co-ordination, custody of liquid and non-liquid assets, and dedicated relationship
              attention.
            </p>
          ),
        },
        {
          title: "Are deposits protected?",
          body: (
            <p>
              Client deposits are held in custody, segregated from the Bank&rsquo;s own balance
              sheet, and subject to the Swiss federal deposit-protection regime up to the
              statutory limit. Beyond that limit, the strength of the protection rests on the
              capital position of the Bank, the prudence of its credit policy, and the quality of
              its supervisory arrangements.
            </p>
          ),
        },
        {
          title: "How are withdrawals processed?",
          body: (
            <>
              <p>
                Withdrawal instructions are submitted through the secure portal, by signed letter,
                or over a recorded telephone line. Each instruction is reviewed and authorised
                manually by a responsible officer of the Bank. Continental Bank does not operate
                any automated outbound settlement.
              </p>
              <p>
                Settlement is effected via SEPA, IBAN, Wise, Revolut, UK Faster Payments, PayPal,
                or domestic rails depending on the destination. Each step of the withdrawal
                lifecycle is recorded against the immutable ledger and shown to the Client in the
                portal.
              </p>
            </>
          ),
        },
        {
          title: "Does the Bank offer advisory mandates?",
          body: (
            <p>
              Continental Bank offers private banking and advisory mandates within the framework
              established at onboarding. The House does not solicit, and will not accept, an
              advisory mandate in respect of asset classes which the responsible partner has
              concluded the Client does not, or should not, hold.
            </p>
          ),
        },
        {
          title: "How is the data protected?",
          body: (
            <p>
              All Client data is held in encrypted form at rest and in transit, on infrastructure
              physically located in Switzerland and the European Union. Access is granted on a
              least-privilege basis, recorded against an immutable audit log, and reviewed
              quarterly. The full Privacy Policy is published separately.
            </p>
          ),
        },
        {
          title: "Who do I speak to?",
          body: (
            <p>
              Start by creating a secure client profile and opening an escrow request from your
              portal. The escrow desk can then request supporting documents,
              verify identity, and continue the review through secure messages.
            </p>
          ),
        },
      ]}
    />
  );
}
