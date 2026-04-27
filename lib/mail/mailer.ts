import "server-only";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const APP_NAME = process.env.APP_NAME ?? "Flowity";

// Accept either bare email or "Name <email@domain>".
const FROM_RAW =
  process.env.FROM_EMAIL || process.env.MAIL_FROM || "no-reply@example.com";
const FROM = /<[^>]+>/.test(FROM_RAW) ? FROM_RAW : `${APP_NAME} <${FROM_RAW}>`;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn("[mail] Missing envs", {
    SMTP_HOST,
    SMTP_USER,
    hasPass: !!SMTP_PASS,
  });
}

// Mirror your Nest config: secure:false for 587 (STARTTLS)
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  logger: true,
  debug: true,
});

export async function sendMail(opts: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  try {
    // optional verify, like your Nest factory:
    await transporter.verify().catch(() => {});
    const info = await transporter.sendMail({
      from: opts.from ?? FROM,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    console.log("[mail] sent", {
      id: info.messageId,
      to: opts.to,
      response: info.response,
    });
    return info;
  } catch (err) {
    console.error("[mail] sendMail error:", err);
    throw err;
  }
}

export async function sendInviteEmail(args: {
  to: string;
  acceptUrl: string;
  salonName: string;
}) {
  const { to, acceptUrl, salonName } = args;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
      <h2>You're invited to join ${salonName} on ${APP_NAME}</h2>
      <p>Click the button below to create your account and connect to the salon:</p>
      <p>
        <a href="${acceptUrl}"
           style="display:inline-block;padding:10px 16px;border-radius:8px;background:#111;color:#fff;text-decoration:none">
          Accept Invite
        </a>
      </p>
      <p>Or paste this link:<br/><span style="color:#555">${acceptUrl}</span></p>
    </div>
  `;
  return sendMail({
    to,
    subject: `You're invited to ${salonName} on ${APP_NAME}`,
    html,
  });
}
