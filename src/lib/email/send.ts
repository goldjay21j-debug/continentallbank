/**
 * Thin transactional-email wrapper.
 *
 * The MVP ships without a hard provider dependency — wire up your provider of
 * choice (Resend, Postmark, SendGrid, SES…) here.
 *
 * Example with Resend:
 *
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({
 *     from: "Continental Bank <office@continentallbank.com>",
 *     to, subject, html,
 *   });
 */

type SendOpts = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: SendOpts) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[email]", { to, subject, htmlPreview: html.slice(0, 120) + "…" });
    return { ok: true as const };
  }

  // TODO: integrate your transactional provider here.
  return { ok: true as const };
}
