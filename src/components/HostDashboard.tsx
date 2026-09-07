"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatE164ForDisplay } from "@/lib/phone";

type Rsvp = {
  id: string;
  full_name: string;
  phone: string;
  rsvp_status: "yes" | "no";
  message: string | null;
  created_at: string;
  sms_status: "sent" | "failed" | "simulated";
  sms_message_sid: string | null;
  sms_error: string | null;
};

type StatusFilter = "all" | "yes" | "no";
type SortOrder = "newest" | "oldest";

function toCsv(rows: Rsvp[]): string {
  const header = ["Full Name", "Phone", "Status", "Message", "Submitted"];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const lines = rows.map((row) =>
    [
      escape(row.full_name),
      escape(formatE164ForDisplay(row.phone)),
      escape(row.rsvp_status === "yes" ? "Attending" : "Not Attending"),
      escape(row.message ?? ""),
      escape(new Date(row.created_at).toLocaleString()),
    ].join(",")
  );

  return [header.join(","), ...lines].join("\n");
}

export default function HostDashboard({
  slug,
  eventName,
}: {
  slug: string;
  eventName: string;
}) {
  const router = useRouter();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [devMode, setDevMode] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const loadRsvps = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/events/${slug}/host/rsvps`, {
        cache: "no-store",
      });
      if (response.status === 401) {
        router.push(`/${slug}/host`);
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not load RSVPs.");
      }
      setRsvps(data.rsvps ?? []);
      setDevMode(Boolean(data.devMode));
    } catch {
      setError("Could not load RSVPs. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [router, slug]);

  useEffect(() => {
    // Initial data fetch on mount; loadRsvps also powers the manual Refresh button.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRsvps();
  }, [loadRsvps]);

  const stats = useMemo(() => {
    const attending = rsvps.filter((r) => r.rsvp_status === "yes").length;
    const notAttending = rsvps.filter((r) => r.rsvp_status === "no").length;
    return { total: rsvps.length, attending, notAttending };
  }, [rsvps]);

  const visibleRsvps = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = rsvps.filter((rsvp) => {
      const matchesStatus =
        statusFilter === "all" || rsvp.rsvp_status === statusFilter;
      if (!matchesStatus) return false;

      if (!query) return true;

      const nameMatch = rsvp.full_name.toLowerCase().includes(query);
      const phoneDigitsQuery = query.replace(/\D/g, "");
      const phoneMatch =
        phoneDigitsQuery.length > 0 && rsvp.phone.includes(phoneDigitsQuery);
      return nameMatch || phoneMatch;
    });

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [rsvps, search, statusFilter, sortOrder]);

  function handleExportCsv() {
    const csv = toCsv(visibleRsvps);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}-rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleLogout() {
    await fetch(`/api/events/${slug}/host/logout`, { method: "POST" });
    router.push(`/${slug}/host`);
    router.refresh();
  }

  return (
    <main className="flex-1 bg-cream-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        {devMode && (
          <div
            role="status"
            className="mb-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 print:hidden"
          >
            🧪 DEVELOPMENT ONLY: Supabase isn&apos;t configured yet, so
            you&apos;re viewing RSVPs from a local test file, not the real
            database.
          </div>
        )}

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center print:hidden">
          <div>
            <p className="font-script text-3xl text-pink-600">Host Dashboard</p>
            <h1 className="text-2xl font-bold text-brown-700">
              {eventName} — RSVP Submissions
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadRsvps}
              className="min-h-11 rounded-full border border-brown-400 px-5 font-semibold text-brown-600 hover:bg-blush-100"
            >
              ⟳ Refresh
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={visibleRsvps.length === 0}
              className="min-h-11 rounded-full bg-pink-500 px-5 font-semibold text-white shadow-md shadow-pink-300/50 transition-transform hover:scale-105 hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ⬇ Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={visibleRsvps.length === 0}
              className="min-h-11 rounded-full border border-brown-400 px-5 font-semibold text-brown-600 hover:bg-blush-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              🖨 Print Guest List
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-11 rounded-full border border-brown-400 px-5 font-semibold text-brown-600 hover:bg-blush-100"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 print:hidden">
          <div className="rounded-2xl border border-pink-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-brown-700">{stats.total}</p>
            <p className="text-brown-500">Total Responses</p>
          </div>
          <div className="rounded-2xl border border-pink-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-pink-600">
              {stats.attending}
            </p>
            <p className="text-brown-500">Attending</p>
          </div>
          <div className="rounded-2xl border border-pink-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-brown-400">
              {stats.notAttending}
            </p>
            <p className="text-brown-500">Not Attending</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-pink-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center print:hidden">
          <label htmlFor="guest-search" className="sr-only">
            Search guests by name or phone number
          </label>
          <input
            id="guest-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or phone number…"
            className="min-h-11 flex-1 rounded-xl border border-beige-200 bg-cream-50 px-4 text-brown-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          />

          <label htmlFor="status-filter" className="sr-only">
            Filter by RSVP status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="min-h-11 rounded-xl border border-beige-200 bg-cream-50 px-4 text-brown-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          >
            <option value="all">All Responses</option>
            <option value="yes">Attending</option>
            <option value="no">Not Attending</option>
          </select>

          <label htmlFor="sort-order" className="sr-only">
            Sort RSVPs
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="min-h-11 rounded-xl border border-beige-200 bg-cream-50 px-4 text-brown-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <p className="mt-3 text-sm text-brown-500 print:hidden">
          Showing {visibleRsvps.length} of {stats.total} guest
          {stats.total === 1 ? "" : "s"}
        </p>

        <div
          id="admin-guest-list"
          className="mt-4 overflow-x-auto rounded-2xl border border-pink-200 bg-white shadow-sm"
        >
          {loading ? (
            <p className="p-6 text-center text-brown-500">Loading RSVPs…</p>
          ) : error ? (
            <p role="alert" className="p-6 text-center text-pink-700">
              {error}
            </p>
          ) : visibleRsvps.length === 0 ? (
            <p className="p-6 text-center text-brown-500">
              {stats.total === 0
                ? "No RSVPs yet. Check back soon!"
                : "No guests match your search or filter."}
            </p>
          ) : (
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-blush-100 text-brown-700">
                <tr>
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3">Phone Number</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Message</th>
                  <th scope="col" className="px-4 py-3">Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {visibleRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="border-t border-beige-100">
                    <td className="px-4 py-3 font-semibold text-brown-700">
                      {rsvp.full_name}
                    </td>
                    <td className="px-4 py-3 text-brown-600">
                      {formatE164ForDisplay(rsvp.phone)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          rsvp.rsvp_status === "yes"
                            ? "inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700"
                            : "inline-flex items-center gap-1 rounded-full bg-beige-100 px-3 py-1 text-sm font-semibold text-brown-600"
                        }
                      >
                        {rsvp.rsvp_status === "yes" ? "✓ Attending" : "✕ Not Attending"}
                      </span>
                      {rsvp.sms_status === "failed" && (
                        <span
                          title={rsvp.sms_error ?? "Invitation text failed to send"}
                          className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 print:hidden"
                        >
                          ⚠ SMS not delivered
                        </span>
                      )}
                      {rsvp.sms_status === "simulated" && (
                        <span
                          title="Twilio isn't connected yet — no real text was sent for this RSVP."
                          className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 print:hidden"
                        >
                          🧪 SMS simulated (dev)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-brown-600">
                      {rsvp.message || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-brown-500">
                      {new Date(rsvp.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
