import { createVerify } from "crypto";
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

type FirebaseTokenPayload = {
  aud: string;
  iss: string;
  sub: string;
  user_id: string;
  email?: string;
  exp: number;
  iat: number;
};

type CertCache = {
  certs: Record<string, string>;
  expiresAt: number;
};

const GOOGLE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
let certCache: CertCache | null = null;

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64");
}

async function getGoogleCerts(): Promise<Record<string, string>> {
  if (certCache && certCache.expiresAt > Date.now()) {
    return certCache.certs;
  }

  const response = await fetch(GOOGLE_CERTS_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Impossible de télécharger les certificats Google");
  }

  const certs = (await response.json()) as Record<string, string>;
  const cacheControl = response.headers.get("cache-control") || "";
  const match = cacheControl.match(/max-age=(\d+)/);
  const ttl = match ? parseInt(match[1], 10) * 1000 : 5 * 60 * 1000;
  certCache = { certs, expiresAt: Date.now() + ttl };
  return certs;
}

async function verifyFirebaseIdToken(
  token: string,
  projectId: string,
): Promise<FirebaseTokenPayload> {
  const segments = token.split(".");
  if (segments.length !== 3) {
    throw new Error("Format de jeton invalide");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = segments;
  const header = JSON.parse(base64UrlDecode(encodedHeader).toString("utf8"));

  if (header.alg !== "RS256") {
    throw new Error("Algorithme de signature non supporté");
  }

  const certs = await getGoogleCerts();
  const certificate = certs[header.kid as string];
  if (!certificate) {
    throw new Error("Certificat inconnu pour ce jeton");
  }

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const signature = base64UrlDecode(encodedSignature);
  const isValid = verifier.verify(certificate, signature);
  if (!isValid) {
    throw new Error("Signature de jeton invalide");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));

  if (payload.aud !== projectId) {
    throw new Error("Audience du jeton invalide");
  }

  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error("Emetteur du jeton invalide");
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowInSeconds) {
    throw new Error("Jeton expiré");
  }

  if (!payload.user_id) {
    throw new Error("Identifiant utilisateur manquant");
  }

  return payload as FirebaseTokenPayload;
}

export async function verifyRequestAuth(req: Request): Promise<AuthSuccess | AuthFailure> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Configuration Firebase manquante" }, { status: 500 }),
    };
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = await verifyFirebaseIdToken(token, projectId);
    return {
      ok: true,
      user: {
        localId: decoded.user_id,
        email: decoded.email,
      },
    };
  } catch (error) {
    console.error("verifyRequestAuth", error);
    return {
      ok: false,
      response: NextResponse.json({ error: "Jeton invalide" }, { status: 401 }),
    };
  }
}
