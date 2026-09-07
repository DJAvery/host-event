"use client";

import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TeddyBear from "@/components/decorative/TeddyBear";

const CODE_LENGTH = 4;

export default function HostLoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const submittedRef = useRef(false);

  async function submitCode(code: string) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${slug}/host/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Incorrect host code. Please try again.");
        setSubmitting(false);
        submittedRef.current = false;
        setDigits(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      router.push(`/${slug}/host/dashboard`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
      submittedRef.current = false;
    }
  }

  function handleDigitChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, "").slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const next = [...digits];
    next[index] = value;
    const code = next.join("");
    if (value && code.length === CODE_LENGTH) {
      submitCode(code);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;
    event.preventDefault();

    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setDigits(next);

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = digits.join("");
    if (code.length === CODE_LENGTH) submitCode(code);
  }

  const isComplete = digits.join("").length === CODE_LENGTH;

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-blush-100 px-4 py-16">
      <div className="mb-4 w-full max-w-sm">
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brown-500 hover:text-pink-600"
        >
          ← Home
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-pink-200 bg-white p-8 text-center shadow-xl shadow-pink-100"
      >
        <TeddyBear className="mx-auto h-20 w-20" />

        <h1 className="font-script mt-2 text-3xl text-pink-600">
          Host Access 🧸
        </h1>
        <p className="mt-2 text-brown-600">
          Enter your private 4-digit host code to view the RSVP list.
        </p>

        <div
          role="group"
          aria-label="4-digit host access code"
          className="mt-6 flex justify-center gap-3"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              autoFocus={index === 0}
              disabled={submitting}
              onChange={(event) => handleDigitChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
              className="h-16 w-14 rounded-xl border-2 border-beige-200 bg-cream-50 text-center text-2xl font-bold text-brown-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 disabled:opacity-60"
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-pink-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !isComplete}
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-pink-500 text-lg font-bold text-white shadow-md shadow-pink-300/50 transition-transform hover:scale-[1.02] hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Checking…" : "View Guest List"}
        </button>
      </form>
    </main>
  );
}
