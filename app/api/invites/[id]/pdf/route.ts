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

  // Generate QR
  const qrDataUrl = await QRCode.toDataURL(id);
  const qrImageBytes = Uint8Array.from(
    Buffer.from(qrDataUrl.split(",")[1], "base64")
  );

  // Create PDF
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("Invitation", {
    x: 200,
    y: 750,
    size: 24,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Nom : ${invite.nom}`, { x: 50, y: 700, size: 16, font });
  page.drawText(`Prénom : ${invite.prenom}`, { x: 50, y: 670, size: 16, font });
  invite.phone && page.drawText(`Téléphone : ${invite.phone}`, { x: 50, y: 640, size: 16, font });
  invite.email && page.drawText(`Email : ${invite.email}`, { x: 50, y: 610, size: 16, font });

  // Insert QR
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  page.drawImage(qrImage, {
    x: 200,
    y: 400,
    width: 200,
    height: 200,
  });

  const pdfBytes = await pdfDoc.save();

return new NextResponse(Buffer.from(pdfBytes), {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": "inline; filename=invite.pdf",
  },
});

}
