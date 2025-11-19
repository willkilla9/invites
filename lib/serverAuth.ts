import { NextResponse } from "next/server";

type AuthSuccess = {
  ok: true;
  user: {
    localId: string;
    email?: string;
  };
};

type AuthFailure = {
  ok: false;
  response: NextResponse;
};

export async function verifyRequestAuth(req: Request): Promise<AuthSuccess | AuthFailure> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Configuration Firebase manquante" }, { status: 500 }),
    };
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const lookupResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: token }),
        cache: "no-store",
      },
    );

    if (!lookupResponse.ok) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Jeton invalide" }, { status: 401 }),
      };
    }

    const lookupData = await lookupResponse.json();
    const user = lookupData.users?.[0];

    if (!user?.localId) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 }),
      };
    }

    return { ok: true, user: { localId: user.localId, email: user.email } };
  } catch (error) {
    console.error("verifyRequestAuth", error);
    return {
      ok: false,
      response: NextResponse.json({ error: "Impossible de vérifier l'authentification" }, { status: 500 }),
    };
  }
}
