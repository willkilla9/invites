import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyRequestAuth } from "@/lib/serverAuth";

type EventDoc = {
  createdAt?: number;
  [key: string]: unknown;
};

const getCreatedAt = (value: unknown) => (typeof value === "number" ? value : 0);

export async function GET(req: Request) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const eventsQuery = query(
    collection(db, "events"),
    where("createdBy", "==", auth.user.localId),
  );
  const snapshot = await getDocs(eventsQuery);
  const events = snapshot.docs
    .map((doc) => {
      const data = doc.data() as EventDoc;
      return { id: doc.id, ...data };
    })
    // Firestore equality queries don't guarantee order, so we sort locally
    .sort((a, b) => getCreatedAt(b.createdAt) - getCreatedAt(a.createdAt));
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const { name, logoUrl, date, time, place, publicInvitesEnabled } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Le nom de l'évènement est obligatoire" }, { status: 400 });
  }

  const docRef = await addDoc(collection(db, "events"), {
    name,
    logoUrl: logoUrl || null,
    date: date || null,
    time: time || null,
    place: place || null,
    createdBy: auth.user.localId,
    createdByEmail: auth.user.email ?? null,
    createdAt: Date.now(),
    publicInvitesEnabled: Boolean(publicInvitesEnabled),
  });

  return NextResponse.json({
    id: docRef.id,
    name,
    logoUrl: logoUrl || null,
    date: date || null,
    time: time || null,
    place: place || null,
    createdBy: auth.user.localId,
    createdByEmail: auth.user.email ?? null,
    publicInvitesEnabled: Boolean(publicInvitesEnabled),
  });
}
