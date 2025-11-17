import { NextResponse } from "next/server";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// GET ALL INVITES
export async function GET() {
  const snapshot = await getDocs(collection(db, "invites"));
  const invites = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(invites);
}

// CREATE AN INVITE
export async function POST(req: Request) {
  const { nom, prenom, phone, email } = await req.json();

  if (!nom || !prenom) {
    return NextResponse.json(
      { error: "Nom et prénom sont obligatoires" },
      { status: 400 }
    );
  }

  const docRef = await addDoc(collection(db, "invites"), {
    nom,
    prenom,
    phone: phone || null,
    email: email || null,
    status: "INVITED",
    createdAt: Date.now(),
  });

  return NextResponse.json({ id: docRef.id, nom, prenom, phone, email });
}
