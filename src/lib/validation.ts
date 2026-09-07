import { z } from "zod";
import { normalizePhoneToE164 } from "./phone";

/** Strips control characters and collapses excess whitespace from free-text input. */
function sanitizeText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .replace(/\s{2,}/g, " ");
}

export const rsvpInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Name is too long.")
    .transform(sanitizeText),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(25, "Please enter a valid phone number.")
    .transform((value, ctx) => {
      const e164 = normalizePhoneToE164(value);
      if (!e164) {
        ctx.addIssue({
          code: "custom",
          message:
            "Please enter a valid 10-digit US phone number (e.g. (555) 555-5555).",
        });
        return z.NEVER;
      }
      return e164;
    }),
  rsvpStatus: z.enum(["yes", "no"], {
    error: "Please select whether you'll be attending.",
  }),
  message: z
    .string()
    .max(500, "Message is too long.")
    .transform(sanitizeText)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;

export const hostAccessCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Incorrect host code. Please try again."),
});

