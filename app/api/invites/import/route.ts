import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";

export async function POST(req: Request) {
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

  let imported = 0;

  for (const row of rows) {
    const nom = row.nom || row.Nom;
    const prenom = row.prenom || row.Prenom;
    const phone = row.phone || row["numero de tele"];
    const email = row.email;

    if (!nom || !prenom) continue;

    await addDoc(collection(db, "invites"), {
      nom,
      prenom,
      phone: phone || null,
      email: email || null,
      eventId,
      eventName: eventData.name || null,
      eventDate: eventData.date || null,
      eventTime: eventData.time || null,
      eventPlace: eventData.place || null,
      eventLogo: eventData.logoUrl || null,
      status: "INVITED",
      createdAt: Date.now(),
    });

    imported++;
  }

  return NextResponse.json({ imported });
}
