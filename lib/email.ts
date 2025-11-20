const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    return null;
  }
  return trimmed.toLowerCase();
}

export function assertEmail(value: unknown, label = "adresse email"): string {
  const normalized = normalizeEmail(value);
  if (!normalized) {
    throw new Error(`${label} invalide`);
  }
  return normalized;
}
