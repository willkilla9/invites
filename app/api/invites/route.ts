import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// GET ALL INVITES
export async function GET() {
  const snapshot = await getDocs(collection(db, "invites"));
  const invites = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(invites);
}

// CREATE AN INVITE
export async function POST(req: Request) {
  const { nom, prenom, phone, email, eventId } = await req.json();

  if (!nom || !prenom) {
    return NextResponse.json(
      { error: "Nom et prénom sont obligatoires" },
      { status: 400 }
    );
  }

  if (!eventId) {
    return NextResponse.json(
      { error: "Un évènement est requis" },
      { status: 400 }
    );
  }

  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return NextResponse.json({ error: "Évènement introuvable" }, { status: 404 });
  }

  const eventData = eventSnap.data();

  const docRef = await addDoc(collection(db, "invites"), {
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

  return NextResponse.json({ id: docRef.id, nom, prenom, phone, email, eventId });
}
