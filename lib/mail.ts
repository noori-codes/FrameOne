import nodemailer from "nodemailer";

function emailFrom() {
  return process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USERNAME?.trim() || "";
}

function smtpConfig() {
  const host = process.env.EMAIL_HOST?.trim() || "";
  const port = Number(process.env.EMAIL_PORT?.trim() || "587") || 587;
  const user = process.env.EMAIL_USERNAME?.trim() || "";
  const pass = process.env.EMAIL_PASSWORD?.trim() || "";

  if (!host || !user || !pass) return null;
  return { host, port, user, pass };
}

/**
 * Send transactional email via EMAIL_* SMTP (mail.noorullah.dev).
 * Required: EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_FROM.
 */
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const smtp = smtpConfig();
  const from = emailFrom();

  if (!smtp) {
    throw new Error(
      "Email is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, and EMAIL_PASSWORD.",
    );
  }
  if (!from || !from.includes("@")) {
    throw new Error("EMAIL_FROM must be a valid address (e.g. imran@noorullah.dev).");
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
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
