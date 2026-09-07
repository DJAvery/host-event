"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventConfig } from "@/lib/events";

const links = [
  { href: "#home", label: "Home" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar({ event }: { event: EventConfig }) {
  const [open, setOpen] = useState(false);
  const [hostAuthenticated, setHostAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkHostSession() {
      try {
        const response = await fetch(`/api/events/${event.slug}/host/session`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setHostAuthenticated(Boolean(data.authenticated));
      } catch {
        // Network hiccup — default to showing "Host Login".
      }
    }

    checkHostSession();
    return () => {
      cancelled = true;
    };
  }, [event.slug]);

  const hostHref = hostAuthenticated
    ? `/${event.slug}/host/dashboard`
    : `/${event.slug}/host`;
  const hostLabel = hostAuthenticated ? "Host Dashboard" : "Host Login";

  return (
    <header className="sticky top-0 z-50 border-b border-pink-200/60 bg-cream-50/90 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <a
          href="#home"
          className="font-script text-2xl text-pink-600 sm:text-3xl"
        >
          {event.eventName} 🧸
        </a>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full text-brown-600 hover:bg-blush-100 sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span aria-hidden="true" className="text-2xl">
            {open ? "✕" : "☰"}
          </span>
        </button>

        <div className="hidden items-center gap-4 sm:flex">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-4 py-2 text-base font-semibold text-brown-600 transition-colors hover:bg-blush-100 hover:text-pink-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <Link
            href={hostHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-pink-300 px-4 py-2 text-sm font-semibold text-pink-600 transition-colors hover:bg-blush-100"
          >
            <span aria-hidden="true">🔒</span>
            {hostLabel}
          </Link>
        </div>
      </nav>

      {open && (
        <ul
          id="mobile-menu"
          className="flex flex-col gap-1 border-t border-pink-200/60 bg-cream-50 px-4 py-3 sm:hidden"
        >
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block min-h-11 rounded-xl px-4 py-3 text-lg font-semibold text-brown-600 hover:bg-blush-100 hover:text-pink-600"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-1 border-t border-pink-200/60 pt-2">
            <Link
              href={hostHref}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-3 text-lg font-semibold text-pink-600 hover:bg-blush-100"
            >
              <span aria-hidden="true">🔒</span>
              {hostLabel}
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
