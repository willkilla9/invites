const getEnvValue = (primaryName: string): string | undefined => {
  const fallbackName = primaryName.startsWith("NEXT_PUBLIC_") ? primaryName.replace("NEXT_PUBLIC_", "") : primaryName;
  return process.env[primaryName] ?? process.env[fallbackName];
};

const requireEnvValue = (primaryName: string): string => {
  const value = getEnvValue(primaryName);
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
