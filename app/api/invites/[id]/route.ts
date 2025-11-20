import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { verifyRequestAuth } from "@/lib/serverAuth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const ref = doc(db, "invites", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return NextResponse.json({ error: "Invite introuvable" }, { status: 404 });
  }

  const invite = snap.data();
  if (invite.createdBy && invite.createdBy !== auth.user.localId) {
    return NextResponse.json({ error: "Invite non autorisée" }, { status: 403 });
  }

  return NextResponse.json({ id: snap.id, ...invite });
}
