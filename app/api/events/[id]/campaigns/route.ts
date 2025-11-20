import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyRequestAuth } from "@/lib/serverAuth";

const campaignsCollection = collection(db, "campaigns");

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

async function slugExists(slug: string) {
  const existing = await getDocs(query(campaignsCollection, where("slug", "==", slug), limit(1)));
  return !existing.empty;
}

async function buildUniqueSlug(base: string) {
  const safeBase = base || `campagne-${Date.now()}`;
  let candidate = safeBase;
  let suffix = 1;
  while (await slugExists(candidate)) {
    candidate = `${safeBase}-${suffix++}`;
  }
  return candidate;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const { id: eventId } = await context.params;
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return NextResponse.json({ error: "Évènement introuvable" }, { status: 404 });
  }

  const event = eventSnap.data();
  if (event.createdBy !== auth.user.localId) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const snapshot = await getDocs(query(campaignsCollection, where("eventId", "==", eventId)));
  const campaigns = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  return NextResponse.json(campaigns);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const { id: eventId } = await context.params;
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return NextResponse.json({ error: "Évènement introuvable" }, { status: 404 });
  }

  const event = eventSnap.data();
  if (event.createdBy !== auth.user.localId) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  if (!event.publicInvitesEnabled) {
    return NextResponse.json({ error: "Activez les invitations publiques pour cet évènement" }, { status: 400 });
  }

  const { name, description } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Un nom de campagne est requis" }, { status: 400 });
  }

  const slugBase = slugify(name);
  const slug = await buildUniqueSlug(slugBase || `campagne-${Date.now()}`);

  const payload = {
    name,
    description: description?.trim() || null,
    slug,
    eventId,
    eventName: event.name || null,
    eventDate: event.date || null,
    eventTime: event.time || null,
    eventPlace: event.place || null,
    eventLogo: event.logoUrl || null,
    createdAt: Date.now(),
    createdBy: auth.user.localId,
    createdByEmail: auth.user.email ?? null,
  };

  const docRef = await addDoc(campaignsCollection, payload);
  return NextResponse.json({ id: docRef.id, ...payload });
}
