export function toDateTimeLocalInputValue(date: Date, endOfDay = false): string {
  const d = new Date(date);
  if (endOfDay) d.setHours(23, 59, 59, 0);
  else d.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toGraphqlDateTime(value: string, isEnd = false): string | null {
  if (!value?.trim()) return null;
  const raw = value.trim();
  if (raw.includes("T")) {
    const [date, time = "00:00"] = raw.split("T");
    const t = time.length === 5 ? `${time}:00` : time;
    return `${date} ${t}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw} ${isEnd ? "23:59:59" : "00:00:00"}`;
  return raw;
}

export function formatDateTime(value: string): { date: string; time: string } {
  if (!value) return { date: "—", time: "" };
  const d = new Date(value);
  if (isNaN(d.getTime())) return { date: value, time: "" };
  return {
    date: d.toLocaleDateString("fr-FR"),
    time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}