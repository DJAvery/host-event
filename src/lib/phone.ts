/**
 * Normalizes a US phone number entered in any common format to E.164 (+1XXXXXXXXXX).
 * Accepts: 5555555555, 555-555-5555, (555) 555-5555, 555.555.5555, +15555555555
 * Returns null if the number can't be normalized to a valid 10-digit US number.
 */
export function normalizePhoneToE164(rawInput: string): string | null {
  if (!rawInput) return null;

  const digitsOnly = rawInput.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    return `+${digitsOnly}`;
  }

  return null;
}

/** Formats an E.164 US number back to (XXX) XXX-XXXX for display purposes. */
export function formatE164ForDisplay(e164: string): string {
  const match = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  if (!match) return e164;
  const [, area, prefix, line] = match;
  return `(${area}) ${prefix}-${line}`;
}
