import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  const eventsQuery = query(collection(db, "events"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(eventsQuery);
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const { name, logoUrl, date, time, place } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Le nom de l'évènement est obligatoire" }, { status: 400 });
  }

  const docRef = await addDoc(collection(db, "events"), {
    name,
    logoUrl: logoUrl || null,
    date: date || null,
    time: time || null,
    place: place || null,
    createdAt: Date.now(),
  });

  return NextResponse.json({
    id: docRef.id,
    name,
    logoUrl: logoUrl || null,
    date: date || null,
    time: time || null,
    place: place || null,
  });
}
