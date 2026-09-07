import { UPLOADS_URL } from "@/constants/api";

export function mediaUrl(filename?: string | null) {
  if (!filename) return "";
  if (/^(https?:|blob:|data:)/i.test(filename)) return filename;
  const path = filename.replace(/^\/+/, "").replace(/^(Uploads|uploads)\//, "");
  return `${UPLOADS_URL}${path}`;
}

export function toMinutes(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  const parsed = parseInt(String(value ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDuration(value: unknown): string {
  const minutes = toMinutes(value);
  if (!minutes) return "";
  return `${minutes} min`;
}

export function normalizeLessonType(type?: string) {
  return String(type ?? "").toUpperCase();
}

export function courseRouteKey(course: { courseType?: string; _id?: string } | string | undefined) {
  if (!course) return "";
  if (typeof course === "string") return course;
  return course.courseType || course._id || "";
}
