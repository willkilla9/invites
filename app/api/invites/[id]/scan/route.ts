import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { verifyRequestAuth } from "@/lib/serverAuth";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyRequestAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const ref = doc(db, "invites", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return NextResponse.json(
      { success: false, message: "Invite introuvable" },
      { status: 404 }
    );
  }

  const invite = snap.data();

  if (invite.status === "SCANNED") {
    return NextResponse.json(
      { success: false, message: "Déjà scanné", scannedAt: invite.scannedAt },
      { status: 400 }
    );
  }

  await updateDoc(ref, {
    status: "SCANNED",
    scannedAt: Date.now(),
  });

  return NextResponse.json({ success: true, message: "Invite validée" });
}
