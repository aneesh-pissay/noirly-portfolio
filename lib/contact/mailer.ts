import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { DEFAULT_THEME_ID, getTheme, NOIRLY_THEMES } from "@noirly-dev/ui/themes";

/**
 * SMTP delivery for contact-form enquiries — the same setup as Noirly
 * Identity, so the same credentials work here (see .env.example).
 */

export interface Enquiry {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
}

function readConfig(): SmtpConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM, CONTACT_TO_EMAIL } =
    process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM || !CONTACT_TO_EMAIL) {
    return null;
  }
  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: EMAIL_FROM,
    to: CONTACT_TO_EMAIL,
  };
}

let transporter: Transporter | null = null;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// The portfolio's type system: Fraunces for display, Hanken Grotesk for prose,
// JetBrains Mono for labels. Clients that block web fonts (Gmail) use the fallbacks.
const FONT_DISPLAY = `'Fraunces',Georgia,'Times New Roman',serif`;
const FONT_SANS = `'Hanken Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const FONT_MONO = `'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Hanken+Grotesk:wght@400;600&family=JetBrains+Mono:wght@600&display=swap";

function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${alpha})`;
}

/** The site's default theme in light mode — reads cleanly in any inbox. */
function palette() {
  const { bg, surface, text, accent, accentInk } = (getTheme(DEFAULT_THEME_ID) ?? NOIRLY_THEMES[0]!).light;
  return {
    bg,
    surface,
    text,
    accent,
    accentInk,
    secondary: rgba(text, 0.66),
    muted: rgba(text, 0.58),
    hairline: rgba(text, 0.1),
    hairlineStrong: rgba(text, 0.18),
    accentSoft: rgba(accent, 0.1),
  };
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "?"
  );
}

/**
 * Email clients ignore <style> blocks and modern layout, so this is
 * table-based with inline styles throughout.
 */
export function renderEnquiry(enquiry: Enquiry) {
  const budget = enquiry.budget || "Not specified";
  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Project", enquiry.projectType],
    ["Budget", budget],
  ];

  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${enquiry.message}\n`;

  const name = escapeHtml(enquiry.name);
  const email = escapeHtml(enquiry.email);
  const replyHref = escapeHtml(
    `mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.projectType} enquiry`)}`,
  );
  const received = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const c = palette();
  const label = `font-family:${FONT_MONO};font-size:11px;font-weight:600;letter-spacing:2.4px;text-transform:uppercase;color:${c.muted}`;

  // `.eyebrow` from the design system: a hairline rule, then a mono label.
  const eyebrow = (text: string, color = c.muted) => `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="28" style="border-top:1px solid ${c.hairlineStrong};font-size:0;line-height:0">&nbsp;</td>
      <td style="padding-left:10px;${label};color:${color}">${text}</td>
    </tr></table>`;

  const detail = (key: string, value: string) => `
    <td width="48%" valign="top" style="width:48%;padding:16px 18px;background:${c.bg};border:1px solid ${c.hairline};border-radius:12px">
      <div style="${label};font-size:10px">${key}</div>
      <div style="font-family:${FONT_SANS};font-size:15px;font-weight:600;color:${c.text};margin-top:6px">${escapeHtml(value)}</div>
    </td>`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<link href="${FONTS_HREF}" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:${c.bg}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${name} · ${escapeHtml(enquiry.projectType)} · ${escapeHtml(budget)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.bg}">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

        <tr><td style="padding:0 4px 20px">${eyebrow("Portfolio &middot; New enquiry")}</td></tr>

        <tr><td style="background:${c.surface};border:1px solid ${c.hairline};border-radius:26px;padding:36px 32px">

          <div style="font-family:${FONT_DISPLAY};font-size:32px;font-weight:600;line-height:1.15;letter-spacing:-0.8px;color:${c.text}">
            ${escapeHtml(enquiry.projectType)}<span style="color:${c.accent}">.</span>
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px"><tr>
            <td width="52" valign="middle">
              <div style="width:46px;height:46px;line-height:46px;border-radius:50%;background:${c.accentSoft};border:1px solid ${c.accent};color:${c.accent};text-align:center;font-family:${FONT_MONO};font-size:14px;font-weight:600;letter-spacing:1px">${escapeHtml(initials(enquiry.name))}</div>
            </td>
            <td valign="middle" style="padding-left:12px">
              <div style="font-family:${FONT_SANS};font-size:17px;font-weight:600;color:${c.text}">${name}</div>
              <a href="mailto:${email}" style="font-family:${FONT_SANS};font-size:14px;color:${c.secondary};text-decoration:none">${email}</a>
            </td>
          </tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-collapse:separate;border-spacing:0"><tr>
            ${detail("Project", enquiry.projectType)}
            <td width="12" style="width:12px;min-width:12px;font-size:0;line-height:0">&nbsp;</td>
            ${detail("Budget", budget)}
          </tr></table>

          <div style="margin-top:28px">${eyebrow("Message")}</div>
          <div style="margin-top:12px;font-family:${FONT_SANS};font-size:16px;line-height:1.7;color:${c.text};white-space:pre-wrap">${escapeHtml(enquiry.message)}</div>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px"><tr>
            <td style="background:${c.accent};border-radius:9999px">
              <a href="${replyHref}" style="display:inline-block;padding:14px 24px;font-family:${FONT_MONO};font-size:11px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:${c.accentInk};text-decoration:none">Reply to ${name} &rarr;</a>
            </td>
          </tr></table>

        </td></tr>

        <tr><td style="padding:20px 4px 0;font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:${c.muted}">
          Received ${escapeHtml(received)} IST via the contact form. Replying to this email goes straight to ${name}.
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
  return { text, html };
}

/**
 * Sends the enquiry to CONTACT_TO_EMAIL, with Reply-To set to the visitor so
 * hitting reply goes straight to them.
 *
 * Without SMTP configured, development logs the enquiry and reports success so
 * the form can be exercised locally; production refuses, so a missing setting
 * can never silently swallow a real client's message.
 */
export async function sendEnquiry(enquiry: Enquiry): Promise<void> {
  // End-to-end tests exercise the real form and action without mailing anyone.
  if (process.env.CONTACT_EMAIL_DRY_RUN === "1") {
    console.info("[contact] CONTACT_EMAIL_DRY_RUN — enquiry not sent:", enquiry.email);
    return;
  }

  const config = readConfig();

  if (!config) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] SMTP not configured — enquiry logged instead of sent:", enquiry);
      return;
    }
    throw new Error(
      "Contact form email is not configured: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM and CONTACT_TO_EMAIL.",
    );
  }

  transporter ??= nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  const { text, html } = renderEnquiry(enquiry);
  await transporter.sendMail({
    from: config.from,
    to: config.to,
    // An address object, not a hand-built "Name <email>" string, so nodemailer
    // does the header encoding.
    replyTo: { name: enquiry.name, address: enquiry.email },
    subject: `Portfolio enquiry: ${enquiry.projectType} — ${enquiry.name}`,
    text,
    html,
  });
}
