import nodemailer from "nodemailer";

function emailFrom() {
  return process.env.EMAIL_FROM?.trim() || "FrameOne <onboarding@resend.dev>";
}

function smtpConfig() {
  const host =
    process.env.SMTP_HOST?.trim() || process.env.EMAIL_HOST?.trim() || "";
  const portRaw =
    process.env.SMTP_PORT?.trim() || process.env.EMAIL_PORT?.trim() || "587";
  const user =
    process.env.SMTP_USER?.trim() || process.env.EMAIL_USERNAME?.trim() || "";
  const pass =
    process.env.SMTP_PASSWORD?.trim() ||
    process.env.EMAIL_PASSWORD?.trim() ||
    "";
  const port = Number(portRaw) || 587;

  if (!host || !user || !pass) return null;
  return { host, port, user, pass };
}

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom(),
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return true;
}

async function sendViaSmtp(to: string, subject: string, html: string) {
  const smtp = smtpConfig();
  if (!smtp) return false;

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  await transporter.sendMail({
    from: emailFrom(),
    to,
    subject,
    html,
  });
  return true;
}

/**
 * Send transactional email via Resend API (preferred) or SMTP.
 * Env: RESEND_API_KEY + EMAIL_FROM, or SMTP_ / EMAIL_ host credentials.
 */
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  if (await sendViaResend(options.to, options.subject, options.html)) return;
  if (await sendViaSmtp(options.to, options.subject, options.html)) return;
  throw new Error(
    "Email is not configured. Set RESEND_API_KEY or SMTP/EMAIL host credentials.",
  );
}

export async function sendSignupVerificationEmail(
  to: string,
  code: string,
) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
      <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:12px;color:#e52535;font-weight:600">FrameOne</p>
      <h1 style="font-size:24px;margin:8px 0 16px">Verify your email</h1>
      <p style="color:#444;line-height:1.5">Use this code to finish creating your account. It expires in 15 minutes.</p>
      <p style="font-size:32px;letter-spacing:0.35em;font-weight:700;margin:28px 0;color:#111">${code}</p>
      <p style="color:#777;font-size:13px;line-height:1.5">If you didn’t sign up for FrameOne, you can ignore this email.</p>
    </div>
  `;

  await sendMail({
    to,
    subject: `${code} is your FrameOne verification code`,
    html,
  });
}
