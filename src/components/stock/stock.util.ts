/**
 * Converts a JS Date to the "YYYY-MM-DDTHH:MM" format used by datetime-local inputs.
 */
export function toDateTimeLocalInputValue(date: Date, endOfDay = false): string {
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Converts a datetime-local input value ("YYYY-MM-DDTHH:MM") or date string
 * to the "YYYY-MM-DD HH:MM:SS" format expected by Laravel / GraphQL DateTime scalar.
 *
 * Returns null if the value is empty so the API ignores the filter.
 */
export function toGraphqlDateTime(value: string | null | undefined, isEnd = false): string | null {
  if (!value?.trim()) return null;

  const raw = value.trim();

  // "YYYY-MM-DDTHH:MM" → "YYYY-MM-DD HH:MM:SS"
  if (raw.includes("T")) {
    const [datePart, timePart = "00:00"] = raw.split("T");
    // timePart may be "HH:MM" or "HH:MM:SS"
    const seconds = timePart.split(":").length === 2 ? `${timePart}:00` : timePart;
    return `${datePart} ${seconds}`;
  }

  // plain date "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${raw} ${isEnd ? "23:59:59" : "00:00:00"}`;
  }

  // already a full datetime string — pass through
  return raw;
}

/**
 * Formats an ISO / SQL datetime string into separate date and time parts.
 */
export function formatDateTime(value: string): { date: string; time: string } {
  if (!value) return { date: "—", time: "" };
  const d = new Date(value);
  if (isNaN(d.getTime())) return { date: value, time: "" };
  return {
    date: d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}