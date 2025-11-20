import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyRequestAuth } from "@/lib/serverAuth";

// GET ALL INVITES
export async function GET(req: Request) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const invitesQuery = query(
    collection(db, "invites"),
    where("createdBy", "==", auth.user.localId),
  );
  const snapshot = await getDocs(invitesQuery);
  const invites = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(invites);
}

// CREATE AN INVITE
export async function POST(req: Request) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

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
  if (eventData.createdBy && eventData.createdBy !== auth.user.localId) {
    return NextResponse.json({ error: "Évènement non autorisé" }, { status: 403 });
  }

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
    createdBy: auth.user.localId,
    createdByEmail: auth.user.email ?? null,
  });

  return NextResponse.json({
    id: docRef.id,
    nom,
    prenom,
    phone: phone || null,
    email: email || null,
    eventId,
  });
}
