import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDoc } from "firebase/firestore";
import { verifyRequestAuth } from "@/lib/serverAuth";
import { normalizeEmail } from "@/lib/email";
import { sendInviteEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const { rows, eventId } = await req.json();

  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "Invalid rows" }, { status: 400 });
  }

  if (!eventId) {
    return NextResponse.json({ error: "Évènement requis" }, { status: 400 });
  }

  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return NextResponse.json({ error: "Évènement introuvable" }, { status: 404 });
  }

  const eventData = eventSnap.data();
  if (eventData.createdBy && eventData.createdBy !== auth.user.localId) {
    return NextResponse.json({ error: "Évènement non autorisé" }, { status: 403 });
  }

  let imported = 0;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const nom = (row.nom || row.Nom || "").trim();
    const prenom = (row.prenom || row.Prenom || "").trim();
    const phone = row.phone || row["numero de tele"] || row.Phone || row["Téléphone"];
    const emailCandidate = row.email || row.Email || row.EMAIL;
    const normalizedEmail = normalizeEmail(emailCandidate);

    if (!nom || !prenom) {
      continue;
    }

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: `Adresse email manquante ou invalide pour ${nom} ${prenom} (ligne ${index + 2})` },
        { status: 400 },
      );
    }

    const docRef = await addDoc(collection(db, "invites"), {
      nom,
      prenom,
      phone: phone || null,
      email: normalizedEmail,
      eventId,
      eventName: eventData.name || null,
      eventDate: eventData.date || null,
      eventTime: eventData.time || null,
      eventPlace: eventData.place || null,
      eventLogo: eventData.logoUrl || null,
      status: "INVITED",
      createdAt: Date.now(),
      createdBy: auth.user.localId,
      createdByEmail: auth.user.email ?? null,
    });

    try {
      await sendInviteEmail({
        to: normalizedEmail,
        inviteId: docRef.id,
        guestName: `${prenom} ${nom}`.trim(),
        eventName: eventData.name,
        eventDate: eventData.date,
        eventPlace: eventData.place,
      });
    } catch (error) {
      console.error("sendInviteEmail-import", error);
      await deleteDoc(docRef);
      return NextResponse.json(
        { error: `Envoi email impossible pour ${nom} ${prenom}. Import interrompu.` },
        { status: 502 },
      );
    }

    imported++;
  }

  return NextResponse.json({ imported });
}
