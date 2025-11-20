import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const ref = doc(db, "invites", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  const invite = snap.data();
  return NextResponse.json({
    id,
    nom: invite.nom ?? null,
    prenom: invite.prenom ?? null,
    email: invite.email ?? null,
    status: invite.status ?? "INVITED",
    eventName: invite.eventName ?? null,
    eventDate: invite.eventDate ?? null,
    eventTime: invite.eventTime ?? null,
    eventPlace: invite.eventPlace ?? null,
    eventLogo: invite.eventLogo ?? null,
    campaignName: invite.campaignName ?? null,
  });
}
