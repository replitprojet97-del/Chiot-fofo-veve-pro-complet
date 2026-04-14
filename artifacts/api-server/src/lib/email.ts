import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.SENDPULSE_SMTP_HOST ?? "smtp.sendpulse.com";
  const port = parseInt(process.env.SENDPULSE_SMTP_PORT ?? "465", 10);
  const user = process.env.SENDPULSE_SMTP_USER ?? "";
  const pass = process.env.SENDPULSE_SMTP_PASS ?? "";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? process.env.SENDPULSE_SMTP_USER ?? "admin@berger-bleu.fr";
const FROM_NAME = "Élevage du Berger Bleu";
const FROM_ADDR = process.env.SENDPULSE_FROM_EMAIL ?? ADMIN_EMAIL;

export async function sendContactEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> {
  if (!process.env.SENDPULSE_SMTP_USER) {
    console.log("[email] SendPulse not configured — skipping send. Data:", data);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDR}>`,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `Nouveau message de contact — ${data.firstName} ${data.lastName}`,
    html: `
      <h2>Nouveau message de contact</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td><strong>Prénom :</strong></td><td>${data.firstName}</td></tr>
        <tr><td><strong>Nom :</strong></td><td>${data.lastName}</td></tr>
        <tr><td><strong>Email :</strong></td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td><strong>Téléphone :</strong></td><td>${data.phone}</td></tr>` : ""}
        <tr><td><strong>Message :</strong></td><td style="white-space:pre-wrap">${data.message}</td></tr>
      </table>
      <p style="color:#888;font-size:12px">Élevage du Berger Bleu — message reçu le ${new Date().toLocaleString("fr-FR")}</p>
    `,
  });
}

export async function sendReservationEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  puppyName: string;
  puppyColor: string;
  puppySex: string;
  puppyPrice: number;
  puppyId: number;
}): Promise<void> {
  if (!process.env.SENDPULSE_SMTP_USER) {
    console.log("[email] SendPulse not configured — skipping send. Data:", data);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDR}>`,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `Demande de réservation — ${data.puppyName} (${data.puppyColor}) — ${data.firstName} ${data.lastName}`,
    html: `
      <h2>Demande de réservation</h2>
      <div style="background:#f0f7f0;border-left:4px solid #2d6a4f;padding:12px 16px;margin-bottom:20px;border-radius:4px">
        <strong>Chiot concerné :</strong> ${data.puppyName}<br>
        <strong>Couleur :</strong> ${data.puppyColor}<br>
        <strong>Sexe :</strong> ${data.puppySex}<br>
        <strong>Prix :</strong> ${data.puppyPrice.toLocaleString("fr-FR")} €<br>
        <strong>ID :</strong> #${data.puppyId}
      </div>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td><strong>Prénom :</strong></td><td>${data.firstName}</td></tr>
        <tr><td><strong>Nom :</strong></td><td>${data.lastName}</td></tr>
        <tr><td><strong>Email :</strong></td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td><strong>Téléphone :</strong></td><td>${data.phone}</td></tr>` : ""}
        <tr><td><strong>Message :</strong></td><td style="white-space:pre-wrap">${data.message}</td></tr>
      </table>
      <p style="color:#888;font-size:12px">Élevage du Berger Bleu — demande reçue le ${new Date().toLocaleString("fr-FR")}</p>
    `,
  });
}
