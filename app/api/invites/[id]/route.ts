import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ref = doc(db, "invites", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return NextResponse.json({ error: "Invite introuvable" }, { status: 404 });
  }

  return NextResponse.json({ id: snap.id, ...snap.data() });
}
