import nodemailer, { Transporter } from "nodemailer";

type InviteEmailPayload = {
  to: string;
  inviteId: string;
  guestName: string;
  eventName?: string | null;
  eventDate?: string | null;
  eventPlace?: string | null;
};

type MailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

const getMailConfig = (): MailConfig => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    throw new Error("Configuration SMTP incomplète");
  }

  return { host, port, user, pass, from };
};

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const buildInviteUrl = (inviteId: string) => {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  return `${normalizedBase}/invite/${inviteId}`;
};

const buildInvitePdfUrl = (inviteId: string) => {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  return `${normalizedBase}/api/public/invites/${inviteId}/pdf`;
};

const buildMessage = (payload: InviteEmailPayload) => {
  const inviteUrl = buildInviteUrl(payload.inviteId);
  const pdfUrl = buildInvitePdfUrl(payload.inviteId);
  const guest = payload.guestName || "Invité";
  const eventName = payload.eventName || "votre évènement";
  const eventDate = payload.eventDate || "Date communiquée prochainement";
  const eventPlace = payload.eventPlace || "Lieu communiqué prochainement";

  const html = [
    `<p>Bonjour ${guest},</p>`,
    `<p>Votre invitation pour <strong>${eventName}</strong> est prête.</p>`,
    `<p>Date : ${eventDate}<br/>Lieu : ${eventPlace}</p>`,
    `<p>Consultez et sauvegardez votre badge via le lien suivant :</p>`,
    `<p><a href="${inviteUrl}" style="color:#6366f1;font-weight:600">Accéder à mon invitation</a></p>`,
    `<p>Besoin du PDF ? <a href="${pdfUrl}" style="color:#22d3ee;font-weight:600">Télécharger le badge</a></p>`,
    `<p>Merci et à très vite.</p>`,
  ].join("");

  const text = [
    `Bonjour ${guest},`,
    `Votre invitation pour ${eventName} est prête.`,
    `Date : ${eventDate}`,
    `Lieu : ${eventPlace}`,
    `Consultez-la via ${inviteUrl}`,
    `PDF direct : ${pdfUrl}`,
    `Merci.`,
  ].join("\n");

  return { html, text };
};

let cachedTransporter: Transporter | null = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;
  const config = getMailConfig();
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  return cachedTransporter;
};

export async function sendInviteEmail(payload: InviteEmailPayload) {
  const config = getMailConfig();
  const subject = `Invitation - ${payload.eventName || "Évènement"}`;
  const message = buildMessage(payload);

  await getTransporter().sendMail({
    from: config.from,
    to: payload.to,
    subject,
    html: message.html,
    text: message.text,
  });
}
