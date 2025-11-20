import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyRequestAuth } from "@/lib/serverAuth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const ref = doc(db, "events", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return NextResponse.json({ error: "Évènement introuvable" }, { status: 404 });
  }

  const event = snap.data();
  if (event.createdBy !== auth.user.localId) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const payload = await req.json();
  const updates: Record<string, any> = {};

  if (payload.publicInvitesEnabled !== undefined) {
    updates.publicInvitesEnabled = Boolean(payload.publicInvitesEnabled);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
  }

  await updateDoc(ref, updates);
  return NextResponse.json({ id, ...event, ...updates });
}
