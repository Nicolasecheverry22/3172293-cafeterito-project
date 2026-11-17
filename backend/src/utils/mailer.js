
import nodemailer from "nodemailer";

let transporter;

const isConfigured = () => Boolean(process.env.SMTP_HOST);

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

export async function sendMail({ to, subject, text, html }) {
  if (!isConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[MAIL DEV] SMTP no configurado. Para: ${to} | Asunto: ${subject}\n${text}`);
    } else {
      console.error("[MAIL] SMTP no configurado: no se pudo enviar el correo.");
    }
    return { delivered: false };
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
  return { delivered: true };
}
