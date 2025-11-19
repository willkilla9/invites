const envValues = {
  NEXT_PUBLIC_FIREBASE_API_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    process.env.FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.FIREBASE_APP_ID,
} as const;

const requireEnvValue = (primaryName: keyof typeof envValues): string => {
  const value = envValues[primaryName];
  if (!value) {
    throw new Error(`Missing Firebase configuration value for ${primaryName}.`);
  }
  return value;
};

export const firebaseConfig = {
  apiKey: requireEnvValue("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requireEnvValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnvValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requireEnvValue("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireEnvValue("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requireEnvValue("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

export const firebaseApiKey = firebaseConfig.apiKey;
