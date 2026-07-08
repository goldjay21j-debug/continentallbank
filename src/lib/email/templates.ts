/**
 * Continental Bank — transactional email templates
 *
 * These templates are designed for use with any transactional email provider
 * (Resend, Postmark, SES, SendGrid…). They return plain HTML strings — no
 * runtime dependencies.
 *
 * To wire to a provider, fill in `sendEmail()` in @/lib/email/send.ts.
 */

import { SITE } from "@/lib/constants";

const palette = {
  navy: "#07111F",
  card: "#0E1B33",
  ivory: "#F6F1E8",
  champagne: "#C8A96A",
  muted: "#8A9099",
  border: "#1A2541",
};

function shell({
  preheader,
  title,
  body,
  cta,
}: {
  preheader: string;
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return /* html */ `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${palette.navy};font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:${palette.ivory};">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${palette.navy};">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${palette.card};border:1px solid ${palette.border};border-radius:6px;overflow:hidden;">
          <tr>
            <td style="padding:32px 36px;border-bottom:1px solid ${palette.border};">
              <table role="presentation" width="100%"><tr>
                <td style="font-family:Georgia,serif;color:${palette.champagne};font-size:22px;letter-spacing:2px;">CB</td>
                <td align="right" style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${palette.muted};">
                  Escrow & Investment Desk · Secure Portal
                </td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 36px 8px 36px;">
              <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${palette.champagne};margin-bottom:14px;">
                ${SITE.name}
              </div>
              <h1 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:28px;line-height:1.2;font-weight:500;color:${palette.ivory};">
                ${title}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 24px 36px;font-size:15px;line-height:1.65;color:rgba(246,241,232,0.85);">
              ${body}
            </td>
          </tr>
          ${
            cta
              ? `<tr><td style="padding:0 36px 32px 36px;">
                  <a href="${cta.href}" style="display:inline-block;background:${palette.champagne};color:${palette.navy};text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.04em;padding:14px 24px;border-radius:3px;">
                    ${cta.label}
                  </a>
                </td></tr>`
              : ""
          }
          <tr>
            <td style="padding:28px 36px;border-top:1px solid ${palette.border};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${palette.muted};">
              Continental Bank · Place de la Concorde 12 · CH-1204 Geneva
              <br /><br />
              This message is confidential. If received in error, please delete and inform
              <a href="mailto:support@continentallbank.com" style="color:${palette.champagne};text-decoration:none;">support@continentallbank.com</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body></html>`;
}

export const emails = {
  registrationReceived: (fullName: string) =>
    shell({
      preheader: "We have received your secure client profile.",
      title: "Client profile received.",
      body: `<p>Dear ${escapeHtml(fullName)},</p>
        <p>Continental Bank acknowledges receipt of your secure client profile. A relationship officer has been assigned to review your file.</p>
        <p>You will be notified when your portal access is activated. You can then open escrow services, start an investment request, submit KYC, and continue through officer review.</p>
        <p>- The Escrow & Investment Desk</p>`,
    }),

  accountApproved: (fullName: string, accountNumber: string, portalUrl: string) =>
    shell({
      preheader: "Your secure portal is active.",
      title: "Your secure portal is now active.",
      body: `<p>Dear ${escapeHtml(fullName)},</p>
        <p>Your secure portal has been activated. You may now access the dashboard to open escrow services, start an investment request, submit KYC, review escrow readiness, and reach the escrow desk.</p>
        <p><strong>Account reference:</strong> <span style="font-family:monospace;letter-spacing:1px;">${escapeHtml(accountNumber)}</span></p>
        <p>For any matter requiring discretion, please correspond through the secure portal or contact the escrow desk directly.</p>
        <p>- The Escrow & Investment Desk</p>`,
      cta: { href: portalUrl, label: "Enter portal" },
    }),

  withdrawalSubmitted: (fullName: string, amount: string, method: string) =>
    shell({
      preheader: "Your withdrawal instruction has been received.",
      title: "Withdrawal instruction received.",
      body: `<p>Dear ${escapeHtml(fullName)},</p>
        <p>We confirm receipt of your withdrawal instruction for <strong>${escapeHtml(amount)}</strong> via <strong>${escapeHtml(method)}</strong>. The funds are now held in your pending balance while an officer reviews the instruction.</p>
        <p>You will be notified upon settlement or if further information is required.</p>
        <p>- The Escrow & Investment Desk</p>`,
    }),

  withdrawalApproved: (fullName: string, amount: string, method: string, note?: string | null) =>
    shell({
      preheader: "Your withdrawal has been approved.",
      title: "Withdrawal approved.",
      body: `<p>Dear ${escapeHtml(fullName)},</p>
        <p>Your withdrawal instruction for <strong>${escapeHtml(amount)}</strong> via <strong>${escapeHtml(method)}</strong> has been approved and is scheduled for settlement.</p>
        ${note ? `<p style="border-left:2px solid ${palette.champagne};padding-left:12px;color:rgba(246,241,232,0.7);font-style:italic;">"${escapeHtml(note)}"</p>` : ""}
        <p>You will receive a separate confirmation once settlement is complete.</p>
        <p>- The Escrow & Investment Desk</p>`,
    }),

  withdrawalRejected: (fullName: string, amount: string, reason: string) =>
    shell({
      preheader: "Your withdrawal could not be processed.",
      title: "Withdrawal not processed.",
      body: `<p>Dear ${escapeHtml(fullName)},</p>
        <p>We regret that your withdrawal instruction for <strong>${escapeHtml(amount)}</strong> could not be processed at this time. The funds have been returned to your available balance.</p>
        <p style="border-left:2px solid ${palette.champagne};padding-left:12px;color:rgba(246,241,232,0.7);font-style:italic;">"${escapeHtml(reason)}"</p>
        <p>Please contact the escrow desk for further detail.</p>
        <p>- The Escrow & Investment Desk</p>`,
    }),

  supportResponse: (fullName: string, subject: string, message: string) =>
    shell({
      preheader: `Re: ${subject}`,
      title: "A reply from the Escrow Desk.",
      body: `<p>Dear ${escapeHtml(fullName)},</p>
        <p>A member of the Escrow Desk has responded to your ticket - <em>${escapeHtml(subject)}</em>:</p>
        <p style="border-left:2px solid ${palette.champagne};padding-left:12px;color:rgba(246,241,232,0.85);">${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
        <p>You may continue the conversation from your portal.</p>
        <p>- The Escrow & Investment Desk</p>`,
    }),
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
