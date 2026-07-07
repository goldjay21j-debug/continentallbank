import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Continental Bank Privacy Policy — how we collect, use, and protect the personal data of private clients.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Governance"
      title="Privacy Policy"
      lead="The Continental relationship rests on discretion. This Policy describes the personal data we hold, the lawful basis on which we hold it, and the safeguards under which it is processed."
      effective="01 January 2026"
      sections={[
        {
          title: "1. Scope",
          body: (
            <>
              <p>
                This Policy applies to the personal data of private clients, prospective clients,
                introducers, beneficial owners, and authorised representatives whose information is
                processed by Continental Bank (the &ldquo;Bank&rdquo;) in connection with the
                private banking relationship.
              </p>
              <p>
                The Bank is the controller of this data under applicable Swiss federal data
                protection law and, where relevant, the EU General Data Protection Regulation.
              </p>
            </>
          ),
        },
        {
          title: "2. Categories of data",
          body: (
            <>
              <p>
                In the ordinary course of the relationship the Bank holds identification
                information, residency and contact details, evidence of source of wealth and source
                of funds, transactional records, communications between the client and the
                relationship office, and login telemetry recorded for security monitoring.
              </p>
              <p>
                The Bank does not solicit or store special categories of data (health, political
                opinion, religion, biometric) unless explicitly required by a counter-party for
                legal or tax compliance.
              </p>
            </>
          ),
        },
        {
          title: "3. Lawful basis",
          body: (
            <p>
              Personal data is processed (i) to perform the mandate concluded with the client; (ii)
              to satisfy legal obligations under Swiss banking law, anti-money-laundering rules,
              and tax-information-exchange treaties; (iii) in the legitimate interest of operating
              a private banking institution under prudential supervision; and (iv) on the basis of
              explicit consent, where consent is required.
            </p>
          ),
        },
        {
          title: "4. Confidentiality and onward disclosure",
          body: (
            <>
              <p>
                Continental Bank maintains banking secrecy as a matter of contractual and statutory
                duty. Personal data is shared with third parties only where (a) the client has
                instructed it in writing, (b) it is required by a competent authority through a
                formal legal channel, or (c) it is necessary to execute a transaction the client
                has instructed (e.g. correspondent banks for outbound payments).
              </p>
              <p>
                The Bank does not share personal data for marketing purposes. Continental Bank does
                not maintain a marketing database.
              </p>
            </>
          ),
        },
        {
          title: "5. Retention",
          body: (
            <p>
              Active relationship data is retained for the duration of the mandate and for ten
              years thereafter, as required by Swiss accounting and banking record-keeping rules.
              Closed relationships are subject to a documented archival regime; access is
              restricted to compliance officers.
            </p>
          ),
        },
        {
          title: "6. Your rights",
          body: (
            <>
              <p>
                You may, at any time, request access to the personal data the Bank holds about you,
                a correction of inaccurate data, a copy of records in a portable format, or a
                restriction of processing where permitted by law. You may also withdraw consent
                where processing is based on consent.
              </p>
              <p>
                Requests should be addressed to the Data Protection Officer in writing at the
                Geneva office. The Bank will acknowledge receipt within five business days and
                respond substantively within thirty calendar days.
              </p>
            </>
          ),
        },
        {
          title: "7. Security",
          body: (
            <p>
              Personal data is held in encrypted form at rest and in transit, on infrastructure
              physically located in Switzerland and the European Union. Access is granted on a
              least-privilege basis, recorded against an immutable audit log, and reviewed
              quarterly by an independent committee.
            </p>
          ),
        },
        {
          title: "8. Contact",
          body: (
            <p>
              Continental Bank · Data Protection Office · Place de la Concorde 12 · CH-1204 Geneva
              · Switzerland · <span className="tabular-figures">privacy@continentallbank.com</span>
            </p>
          ),
        },
      ]}
    />
  );
}
