import { format, parseISO, isToday as isTodayFns, isPast as isPastFns } from "date-fns";

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return format(parseISO(dateStr), "MMM d, yyyy");
}

export function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDateTime(dateStr, timeStr) {
  return `${formatDate(dateStr)} at ${formatTime(timeStr)}`;
}

export function getRoundColor(round) {
  const colors = {
    Screening: "bg-blue-100 text-blue-700",
    L1: "bg-amber-100 text-amber-700",
    L2: "bg-purple-100 text-purple-700",
    HR: "bg-green-100 text-green-700",
  };
  return colors[round] || "bg-gray-100 text-gray-700";
}

export function getStatusColor(status) {
  const colors = {
    Scheduled: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Rescheduled: "bg-amber-100 text-amber-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  return isTodayFns(parseISO(dateStr));
}

export function isPast(dateStr) {
  if (!dateStr) return false;
  return isPastFns(parseISO(dateStr));
}

export function groupInterviewsByDate(interviews) {
  const grouped = {};
  for (const iv of interviews) {
    if (!grouped[iv.date]) grouped[iv.date] = [];
    grouped[iv.date].push(iv);
  }
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({ date, interviews: items }));
}
