import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { TrustBadgeRail } from "@/components/shared/trust-badges";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How Continental Bank protects client data, accounts, and outbound funds — from encryption and authentication to the human controls behind every settlement.",
};

export default function SecurityPage() {
  return (
    <LegalPage
      eyebrow="Trust"
      title="Security at Continental"
      lead="Security at Continental is part of the relationship, not a feature. Every layer — encryption, access, settlement, audit — is engineered, witnessed, and reviewed."
      afterLead={<TrustBadgeRail preset="security" compact />}
      sections={[
        {
          title: "1. Data security",
          body: (
            <>
              <p>
                All client data is encrypted in transit using TLS 1.3 and at rest using AES-256.
                Client files held in Geneva are stored on hardware kept within Swiss federal
                jurisdiction and subject to physical access logging.
              </p>
              <p>
                Browser sessions to the portal are protected by HSTS, secure cookies, CSRF tokens,
                and a strict Content Security Policy. The portal is delivered over HTTP/3 from
                edge nodes that hold no client data.
              </p>
            </>
          ),
        },
        {
          title: "2. Authentication & access",
          body: (
            <>
              <p>
                Sign-in to the portal is protected by password and, by default, time-based
                one-time codes (TOTP). Account holders can enrol hardware security keys on
                request.
              </p>
              <p>
                Every sign-in is recorded against your account with timestamp, device, location,
                and IP. You can review the history at any time on the Security page.
              </p>
              <p>
                Officers authenticate against a separate identity provider with phishing-resistant
                credentials, scoped per role (Super, Finance, Support). No officer can access more
                than their role permits.
              </p>
            </>
          ),
        },
        {
          title: "3. Outbound funds",
          body: (
            <>
              <p>
                Continental never auto-settles outbound funds. Every withdrawal is reviewed by a
                named officer against the client's mandate parameters before settlement. Above the
                dual-approval threshold a second officer must co-sign.
              </p>
              <p>
                Withdrawal destinations are only valid once approved against the client's KYC
                file. New beneficiaries trigger an explicit verification with the receiving
                institution.
              </p>
            </>
          ),
        },
        {
          title: "4. Audit & accountability",
          body: (
            <>
              <p>
                Every officer action against a client account writes an immutable record to the
                bank's audit ledger — actor, timestamp, prior state, new state, IP address, and
                free-text justification. Audit rows cannot be amended or deleted by any role.
              </p>
              <p>
                Balance changes are mirrored into a separate immutable ledger that retains the
                before/after balance, the responsible officer, and the cited reason. Reconciliations
                are performed quarterly and on demand.
              </p>
            </>
          ),
        },
        {
          title: "5. Reporting a concern",
          body: (
            <>
              <p>
                If you suspect any compromise of your account, please write to the Private Client
                Office through the Secure Message Center, or call your relationship manager
                directly. We will lock the account, freeze any open instructions, and brief you
                within the hour.
              </p>
              <p>
                For responsible disclosure of platform vulnerabilities, write to{" "}
                <a
                  href="mailto:security@continentallbank.com"
                  className="text-foreground underline underline-offset-4"
                >
                  security@continentallbank.com
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
