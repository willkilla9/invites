const requireApiKey = (): string => {
  const value =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY;
  if (!value) {
    throw new Error("Missing Firebase configuration value for NEXT_PUBLIC_FIREBASE_API_KEY.");
  }
  return value;
};

const requireAuthDomain = (): string => {
  const value =
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.FIREBASE_AUTH_DOMAIN;
  if (!value) {
    throw new Error(
      "Missing Firebase configuration value for NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN."
    );
  }
  return value;
};

const requireProjectId = (): string => {
  const value =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID;
  if (!value) {
    throw new Error("Missing Firebase configuration value for NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
  }
  return value;
};

const requireStorageBucket = (): string => {
  const value =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.FIREBASE_STORAGE_BUCKET;
  if (!value) {
    throw new Error(
      "Missing Firebase configuration value for NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET."
    );
  }
  return value;
};

const requireMessagingSenderId = (): string => {
  const value =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    process.env.FIREBASE_MESSAGING_SENDER_ID;
  if (!value) {
    throw new Error(
      "Missing Firebase configuration value for NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID."
    );
  }
  return value;
};

const requireAppId = (): string => {
  const value = process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.FIREBASE_APP_ID;
  if (!value) {
    throw new Error("Missing Firebase configuration value for NEXT_PUBLIC_FIREBASE_APP_ID.");
  }
  return value;
};

const apiKey = requireApiKey();
const authDomain = requireAuthDomain();
const projectId = requireProjectId();
const storageBucket = requireStorageBucket();
const messagingSenderId = requireMessagingSenderId();
const appId = requireAppId();

export const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

export const firebaseApiKey = apiKey;
