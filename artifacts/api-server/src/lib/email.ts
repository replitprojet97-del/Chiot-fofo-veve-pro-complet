function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getSendPulseToken(): Promise<string> {
  const res = await fetch("https://api.sendpulse.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.SENDPULSE_API_ID,
      client_secret: process.env.SENDPULSE_API_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`SendPulse auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

async function sendMail(token: string, mail: {
  from: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  replyTo?: string;
  subject: string;
  html: string;
}): Promise<void> {
  const res = await fetch("https://api.sendpulse.com/smtp/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email: mail }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendPulse send failed: ${res.status} — ${body}`);
  }
}

const FROM_NAME     = "Élevage du Berger Bleu";
const NOREPLY_FROM  = process.env.NOREPLY_FROM_EMAIL        ?? "noreply@berger-bleu.com";
const CONTACT_TO    = process.env.CONTACT_NOTIFY_EMAIL      ?? "contact@berger-bleu.com";
const RESERVATION_TO = process.env.RESERVATION_NOTIFY_EMAIL ?? "reservation@berger-bleu.com";

function isConfigured() {
  return !!(process.env.SENDPULSE_API_ID && process.env.SENDPULSE_API_SECRET);
}

export async function sendContactEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> {
  if (!isConfigured()) {
    console.log("[email] SendPulse API not configured — skipping. Data:", data);
    return;
  }

  const token = await getSendPulseToken();
  const dateStr = new Date().toLocaleString("fr-FR");

  await Promise.all([
    sendMail(token, {
      from: { name: FROM_NAME, email: NOREPLY_FROM },
      to: [{ name: "Élevage du Berger Bleu", email: CONTACT_TO }],
      replyTo: data.email,
      subject: `Nouveau message de contact — ${data.firstName} ${data.lastName}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td><strong>Prénom :</strong></td><td>${escapeHtml(data.firstName)}</td></tr>
          <tr><td><strong>Nom :</strong></td><td>${escapeHtml(data.lastName)}</td></tr>
          <tr><td><strong>Email :</strong></td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
          ${data.phone ? `<tr><td><strong>Téléphone :</strong></td><td>${escapeHtml(data.phone)}</td></tr>` : ""}
          <tr><td><strong>Message :</strong></td><td style="white-space:pre-wrap">${escapeHtml(data.message)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px">Élevage du Berger Bleu — message reçu le ${dateStr}</p>
      `,
    }),
    sendMail(token, {
      from: { name: FROM_NAME, email: NOREPLY_FROM },
      to: [{ name: `${data.firstName} ${data.lastName}`, email: data.email }],
      replyTo: CONTACT_TO,
      subject: `Votre message a bien été reçu — Élevage du Berger Bleu`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#2d6a4f;padding:28px 32px;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:0.5px">Élevage du Berger Bleu</h1>
            <p style="color:#a8d5be;margin:4px 0 0;font-size:13px">Bergers Australiens LOF · Bellevaux, Haute-Savoie</p>
          </div>
          <div style="background:#f9f9f6;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <p style="font-size:16px;margin-top:0">Bonjour ${escapeHtml(data.firstName)},</p>
            <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
            <p>Nous vous répondrons dans les meilleurs délais, généralement sous <strong>24 à 48 heures</strong>.</p>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:20px 0">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Votre message</p>
              <p style="margin:0;white-space:pre-wrap;font-size:14px;color:#374151">${escapeHtml(data.message)}</p>
            </div>
            <p>En attendant, n'hésitez pas à nous contacter directement par téléphone ou WhatsApp au <strong>07 57 81 72 02</strong>.</p>
            <p style="margin-bottom:0">Bien cordialement,<br><strong>L'équipe de l'Élevage du Berger Bleu</strong></p>
          </div>
          <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px">Les Alpages du Berger Bleu · 74470 Bellevaux, Haute-Savoie</p>
        </div>
      `,
    }),
  ]);
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
  if (!isConfigured()) {
    console.log("[email] SendPulse API not configured — skipping. Data:", data);
    return;
  }

  const token = await getSendPulseToken();
  const dateStr = new Date().toLocaleString("fr-FR");

  await Promise.all([
    sendMail(token, {
      from: { name: FROM_NAME, email: NOREPLY_FROM },
      to: [{ name: "Réservations Berger Bleu", email: RESERVATION_TO }],
      replyTo: data.email,
      subject: `Demande de réservation — ${data.puppyName} (${data.puppyColor}) — ${data.firstName} ${data.lastName}`,
      html: `
        <h2>Demande de réservation</h2>
        <div style="background:#f0f7f0;border-left:4px solid #2d6a4f;padding:12px 16px;margin-bottom:20px;border-radius:4px">
          <strong>Chiot concerné :</strong> ${escapeHtml(data.puppyName)}<br>
          <strong>Couleur :</strong> ${escapeHtml(data.puppyColor)}<br>
          <strong>Sexe :</strong> ${escapeHtml(data.puppySex)}<br>
          <strong>Prix :</strong> ${data.puppyPrice.toLocaleString("fr-FR")} €<br>
          <strong>ID :</strong> #${data.puppyId}
        </div>
        <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td><strong>Prénom :</strong></td><td>${escapeHtml(data.firstName)}</td></tr>
          <tr><td><strong>Nom :</strong></td><td>${escapeHtml(data.lastName)}</td></tr>
          <tr><td><strong>Email :</strong></td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
          ${data.phone ? `<tr><td><strong>Téléphone :</strong></td><td>${escapeHtml(data.phone)}</td></tr>` : ""}
          <tr><td><strong>Message :</strong></td><td style="white-space:pre-wrap">${escapeHtml(data.message)}</td></tr>
        </table>
        <p style="color:#888;font-size:12px">Élevage du Berger Bleu — demande reçue le ${dateStr}</p>
      `,
    }),
    sendMail(token, {
      from: { name: FROM_NAME, email: NOREPLY_FROM },
      to: [{ name: `${data.firstName} ${data.lastName}`, email: data.email }],
      replyTo: RESERVATION_TO,
      subject: `Votre demande de réservation — ${escapeHtml(data.puppyName)} — Élevage du Berger Bleu`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#2d6a4f;padding:28px 32px;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:0.5px">Élevage du Berger Bleu</h1>
            <p style="color:#a8d5be;margin:4px 0 0;font-size:13px">Bergers Australiens LOF · Bellevaux, Haute-Savoie</p>
          </div>
          <div style="background:#f9f9f6;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <p style="font-size:16px;margin-top:0">Bonjour ${escapeHtml(data.firstName)},</p>
            <p>Nous avons bien reçu votre demande de réservation et nous vous en remercions chaleureusement.</p>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:20px 0">
              <p style="margin:0 0 10px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Chiot concerné</p>
              <p style="margin:0 0 4px;font-size:18px;font-weight:bold">${escapeHtml(data.puppyName)}</p>
              <p style="margin:0;color:#4b5563">${escapeHtml(data.puppyColor)} · ${escapeHtml(data.puppySex)} · ${data.puppyPrice.toLocaleString("fr-FR")} €</p>
            </div>
            <p>Nous allons étudier votre demande et vous contacterons très prochainement — généralement sous <strong>24 à 48 heures</strong> — pour convenir des prochaines étapes (acompte, visite, remise du chiot).</p>
            <p>Pour toute question urgente, vous pouvez nous joindre directement au <strong>07 57 81 72 02</strong> (téléphone ou WhatsApp).</p>
            <div style="background:#fefce8;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin:20px 0">
              <p style="margin:0;font-size:13px;color:#92400e">⚠️ Cette demande ne constitue pas encore une réservation ferme. Elle sera confirmée lors du versement de l'acompte convenu avec l'élevage.</p>
            </div>
            <p style="margin-bottom:0">Bien cordialement,<br><strong>L'équipe de l'Élevage du Berger Bleu</strong></p>
          </div>
          <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px">Les Alpages du Berger Bleu · 74470 Bellevaux, Haute-Savoie</p>
        </div>
      `,
    }),
  ]);
}
