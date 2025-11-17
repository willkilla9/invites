import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ref = doc(db, "invites", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return NextResponse.json({ error: "Invite introuvable" }, { status: 404 });
  }

  return NextResponse.json({ id: snap.id, ...snap.data() });
}
