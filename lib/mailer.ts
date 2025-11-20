import tls from "tls";

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
  envelopeFrom: string;
};

const responseComplete = (buffer: string) => {
  const lines = buffer.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return false;
  const lastLine = lines[lines.length - 1];
  return /^\d{3}\s/.test(lastLine);
};

const waitForResponse = (socket: tls.TLSSocket) =>
  new Promise<string>((resolve, reject) => {
    let buffer = "";
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    };
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString();
      if (responseComplete(buffer)) {
        cleanup();
        resolve(buffer);
      }
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const onTimeout = () => {
      cleanup();
      reject(new Error("SMTP timeout"));
    };

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });

const sendCommand = async (socket: tls.TLSSocket, command: string) => {
  socket.write(`${command}\r\n`);
  return waitForResponse(socket);
};

const sendDataBlock = async (socket: tls.TLSSocket, data: string) => {
  socket.write(`${data}\r\n.\r\n`);
  return waitForResponse(socket);
};

const extractEnvelope = (input: string) => {
  const match = input.match(/<([^>]+)>/);
  return (match ? match[1] : input).trim();
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

  return { host, port, user, pass, from, envelopeFrom: extractEnvelope(from) };
};

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const buildInviteUrl = (inviteId: string) => {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  return `${normalizedBase}/invite/${inviteId}`;
};

const buildMessage = (
  payload: InviteEmailPayload,
  from: string,
  subject: string,
) => {
  const inviteUrl = buildInviteUrl(payload.inviteId);
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
    `<p>Merci et à très vite.</p>`,
  ].join("");

  const text = [
    `Bonjour ${guest},`,
    `Votre invitation pour ${eventName} est prête.`,
    `Date : ${eventDate}`,
    `Lieu : ${eventPlace}`,
    `Consultez-la via ${inviteUrl}`,
    `Merci.`,
  ].join("\n");

  const headers = [
    `From: ${from}`,
    `To: ${payload.to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset="utf-8"`,
    `Content-Transfer-Encoding: 8bit`,
  ];

  return `${headers.join("\r\n")}\r\n\r\n${html}`;
};

const sendMail = async (payload: InviteEmailPayload) => {
  const config = getMailConfig();
  const subject = `Invitation - ${payload.eventName || "Évènement"}`;
  const message = buildMessage(payload, config.from, subject);

  const socket = tls.connect({
    host: config.host,
    port: config.port,
    rejectUnauthorized: false,
  });
  socket.setTimeout(15000);

  try {
    await waitForResponse(socket); // greeting
    await sendCommand(socket, "EHLO invite-app.local");
    await sendCommand(socket, "AUTH LOGIN");
    await sendCommand(socket, Buffer.from(config.user).toString("base64"));
    await sendCommand(socket, Buffer.from(config.pass).toString("base64"));
    await sendCommand(socket, `MAIL FROM:<${config.envelopeFrom}>`);
    await sendCommand(socket, `RCPT TO:<${payload.to}>`);
    await sendCommand(socket, "DATA");
    await sendDataBlock(socket, message);
    await sendCommand(socket, "QUIT");
  } finally {
    socket.end();
  }
};

export async function sendInviteEmail(payload: InviteEmailPayload) {
  await sendMail(payload);
}
