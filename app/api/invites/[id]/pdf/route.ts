export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const ref = doc(db, "invites", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return NextResponse.json({ error: "Invite introuvable" }, { status: 404 });
  }

  const invite = snap.data();

  let eventData: Record<string, any> | null = null;
  if (invite.eventId) {
    const eventRef = doc(db, "events", invite.eventId);
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
      eventData = eventSnap.data();
    }
  }

  // Generate QR
  const qrDataUrl = await QRCode.toDataURL(id);
  const qrImageBytes = Uint8Array.from(
    Buffer.from(qrDataUrl.split(",")[1], "base64")
  );

  // Create PDF
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const margin = 36;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const accent = rgb(99 / 255, 102 / 255, 241 / 255);
  const softAccent = rgb(196 / 255, 181 / 255, 253 / 255);
  const canvas = rgb(7 / 255, 10 / 255, 20 / 255);
  const card = rgb(18 / 255, 22 / 255, 38 / 255);
  const muted = rgb(152 / 255, 167 / 255, 198 / 255);

  const drawLabelValue = (
    label: string,
    value: string,
    x: number,
    y: number,
    maxWidth?: number
  ) => {
    page.drawText(label.toUpperCase(), {
      x,
      y,
      size: 8,
      font: boldFont,
      color: muted,
    });
    page.drawText(value, {
      x,
      y: y - 16,
      size: 14,
      font,
      color: rgb(1, 1, 1),
      maxWidth,
      lineHeight: 14,
    });
  };

  const fullName = [invite.prenom, invite.nom].filter(Boolean).join(" ");
  const displayName = fullName
    ? `Nom : ${fullName}`
    : "Nom : ………………………………";
  const status = (invite.status || "En attente").toUpperCase();
  const reference = invite.referenceCode || id;
  const contactLine =
    [
      invite.email ? `Email : ${invite.email}` : undefined,
      invite.phone ? `Téléphone : ${invite.phone}` : undefined,
    ]
      .filter(Boolean)
      .join("   •   ") || "Email : ……………………………… • Téléphone : ……………………";
  const eventTitle = eventData?.name || invite.eventName || invite.eventTitle || "Évènement à confirmer";
  const eventDate = eventData?.date || invite.eventDate || "Date à confirmer";
  const eventTime =
    eventData?.time || invite.eventTime || "Accueil et programme précisés ultérieurement";
  const eventVenueHero =
    eventData?.place || invite.eventPlace || invite.eventVenue || "Lieu à confirmer";
  const eventVenueDetail =
    eventData?.place || invite.eventPlace || invite.eventVenueDetail || invite.eventVenue || "Lieu communiqué ultérieurement";
  const eventLogoUrl = eventData?.logoUrl || invite.eventLogo || null;
  const extraNote =
    invite.note || "Présentez ce pass numérique accompagné d’une pièce d’identité.";

  // Canvas + halo
  page.drawRectangle({ x: 0, y: 0, width, height, color: canvas });
  page.drawRectangle({
    x: margin / 2,
    y: height - 220,
    width: width - margin,
    height: 180,
    color: rgb(24 / 255, 22 / 255, 44 / 255),
  });

  const cardX = margin;
  const cardWidth = width - margin * 2;

  // Hero
  const heroHeight = 150;
  const heroY = height - margin - heroHeight;
  page.drawRectangle({
    x: cardX,
    y: heroY,
    width: cardWidth,
    height: heroHeight,
    color: card,
    borderColor: accent,
    borderWidth: 1,
  });
  page.drawRectangle({
    x: cardX,
    y: heroY + heroHeight - 4,
    width: cardWidth,
    height: 4,
    color: accent,
  });

  let logoImage = null;
  if (eventLogoUrl) {
    try {
      const response = await fetch(eventLogoUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("png") || eventLogoUrl.toLowerCase().endsWith(".png")) {
          logoImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          logoImage = await pdfDoc.embedJpg(arrayBuffer);
        }
      }
    } catch (error) {
      console.error("Impossible de charger le logo de l'évènement", error);
    }
  }

  page.drawText("PASS D'INVITATION", {
    x: cardX + 24,
    y: heroY + heroHeight - 32,
    size: 10,
    font: boldFont,
    color: softAccent,
  });
  page.drawText(eventTitle, {
    x: cardX + 24,
    y: heroY + heroHeight - 60,
    size: 22,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  page.drawText(`${eventDate} • ${eventVenueHero}`, {
    x: cardX + 24,
    y: heroY + heroHeight - 84,
    size: 12,
    font,
    color: muted,
  });

  if (logoImage) {
    const desiredWidth = 96;
    const scale = desiredWidth / logoImage.width;
    const logoHeight = logoImage.height * scale;
    page.drawImage(logoImage, {
      x: cardX + cardWidth - desiredWidth - 24,
      y: heroY + heroHeight - logoHeight - 24,
      width: desiredWidth,
      height: logoHeight,
    });
  }

  page.drawText(displayName, {
    x: cardX + 24,
    y: heroY + 38,
    size: 18,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  page.drawText(reference, {
    x: cardX + 24,
    y: heroY + 16,
    size: 12,
    font,
    color: muted,
  });
  page.drawText(status, {
    x: cardX + cardWidth - 150,
    y: heroY + 42,
    size: 14,
    font: boldFont,
    color: accent,
  });

  // Details card
  const detailsHeight = 260;
  const detailsY = heroY - 28 - detailsHeight;
  page.drawRectangle({
    x: cardX,
    y: detailsY,
    width: cardWidth,
    height: detailsHeight,
    color: card,
    borderColor: rgb(34 / 255, 37 / 255, 56 / 255),
    borderWidth: 1,
  });

  const colWidth = (cardWidth - 48) / 2;
  let colY = detailsY + detailsHeight - 40;
  drawLabelValue("Horaire", `${eventTime}`, cardX + 24, colY, colWidth - 8);
  drawLabelValue("Lieu", eventVenueDetail, cardX + 24 + colWidth, colY, colWidth - 8);

  colY -= 80;
  drawLabelValue("Coordonnées", contactLine, cardX + 24, colY, cardWidth - 48);

  colY -= 70;

  page.drawRectangle({
    x: cardX + 24,
    y: colY - 28,
    width: cardWidth - 48,
    height: 1,
    color: rgb(43 / 255, 46 / 255, 64 / 255),
  });

  page.drawText("À PRÉSENTER À L'ENTRÉE", {
    x: cardX + 24,
    y: colY - 46,
    size: 10,
    font: boldFont,
    color: muted,
  });
  page.drawText(extraNote, {
    x: cardX + 24,
    y: colY - 64,
    size: 12,
    font,
    color: rgb(224 / 255, 231 / 255, 255 / 255),
    maxWidth: cardWidth - 48,
    lineHeight: 14,
  });

  // QR block
  const qrSize = 170;
  const qrX = cardX + cardWidth - qrSize - 12;
  const qrY = margin + 80;
  page.drawRectangle({
    x: qrX - 16,
    y: qrY - 16,
    width: qrSize + 32,
    height: qrSize + 32,
    color: card,
    borderColor: accent,
    borderWidth: 1,
  });

  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  page.drawText("Scan pour valider l'entrée", {
    x: qrX - 8,
    y: qrY + qrSize + 12,
    size: 10,
    font,
    color: muted,
  });

  page.drawText("Le QR code est unique et lié à cette invitation.", {
    x: cardX,
    y: qrY + qrSize + 12,
    size: 10,
    font,
    color: muted,
  });

  page.drawText("Support: concierge@evenement.com", {
    x: cardX,
    y: margin,
    size: 10,
    font,
    color: muted,
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=invite.pdf",
    },
  });

}
