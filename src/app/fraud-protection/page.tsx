import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { TrustBadgeRail } from "@/components/shared/trust-badges";

export const metadata: Metadata = {
  title: "Account Protection",
  description:
    "How to recognise impersonation, what Continental will and will not ask of you, and how to report a concern.",
};

export default function FraudProtectionPage() {
  return (
    <LegalPage
      eyebrow="Trust"
      title="Account protection"
      lead="A small set of habits will keep you safe. Continental will never ask you to circumvent any of them."
      afterLead={<TrustBadgeRail preset="security" compact />}
      sections={[
        {
          title: "1. What Continental will never ask",
          body: (
            <>
              <p>
                We will never ask you, by email, message, or telephone, to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Disclose your portal password.</li>
                <li>Share a one-time code (TOTP) from your authenticator.</li>
                <li>Read out the full number on any card, debit instrument, or hardware key.</li>
                <li>
                  Transfer funds to an unfamiliar destination to &ldquo;protect&rdquo; or
                  &ldquo;verify&rdquo; them.
                </li>
                <li>Approve a withdrawal you did not initiate.</li>
              </ul>
              <p>
                If a caller, message, or email requests any of the above — regardless of how
                convincing — it is not from Continental. Hang up. Then call your relationship
                manager on the number you have on file, or write through the portal.
              </p>
            </>
          ),
        },
        {
          title: "2. Identifying genuine communications",
          body: (
            <>
              <p>
                Our communications with you will be one of three things:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>A message in the Secure Message Center inside the portal.</li>
                <li>
                  An email from a <code>@continentallbank.com</code> address - informational only.
                  Genuine emails never carry attachments asking for credentials.
                </li>
                <li>A telephone call from a named officer at a number we have shared with you.</li>
              </ul>
              <p>
                When in doubt, end the conversation and reach us through the portal. We will
                never resent a discontinued conversation.
              </p>
            </>
          ),
        },
        {
          title: "3. Securing your access",
          body: (
            <>
              <p>
                Keep your portal password unique and stored only in a reputable password manager.
                Enrol your authenticator on the Security page and consider adding a hardware
                security key. Review your sign-in history at least monthly.
              </p>
              <p>
                If a personal device that has access to the portal is lost or stolen, contact us
                immediately to suspend the session. Then change your password from a known-clean
                device.
              </p>
            </>
          ),
        },
        {
          title: "4. Reporting an incident",
          body: (
            <>
              <p>
                If you suspect you have responded to an unauthorised communication or that an
                unauthorised person has reached your account, write to{" "}
                <a
                  href="mailto:incident@continentallbank.com"
                  className="text-foreground underline underline-offset-4"
                >
                  incident@continentallbank.com
                </a>{" "}
                or contact the recovery desk through your portal. We will freeze open
                instructions, lock the account, and brief you within the hour.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
