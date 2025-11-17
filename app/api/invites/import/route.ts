import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export async function POST(req: Request) {
  const { rows } = await req.json();

  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "Invalid rows" }, { status: 400 });
  }

  let imported = 0;

  for (const row of rows) {
    const nom = row.nom || row.Nom;
    const prenom = row.prenom || row.Prenom;
    const phone = row.phone || row["numero de tele"];
    const email = row.email;

    if (!nom || !prenom) continue;

    await addDoc(collection(db, "invites"), {
      nom,
      prenom,
      phone: phone || null,
      email: email || null,
      status: "INVITED",
      createdAt: Date.now(),
    });

    imported++;
  }

  return NextResponse.json({ imported });
}
