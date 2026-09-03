export const CAREER_EXPLORER_PDF_BASE = "https://ifuntology.com/pdfs";

const COURSE_PDF_NAMES: Record<string, string> = {
  funtology: "Funtology",
  barbertology: "Barbertology",
  nailtology: "Nailtology",
  skintology: "Skintology",
  "c-fun": "Funtology",
  "c-barb": "Barbertology",
  "c-nail": "Nailtology",
  "c-skin": "Skintology",
};

export const CAREER_EXPLORER_WEEKS = [2, 4, 6, 8, 12] as const;

export type CareerExplorerLevelId = "beginner" | "intermediate" | "advanced";

export type CareerExplorerLevel = {
  id: CareerExplorerLevelId;
  title: string;
  subtitle: string;
  pdfSuffix: "Beginner" | "Intermediate" | "Advanced";
  accent: string;
  iconBg: string;
};

export const CAREER_EXPLORER_LEVELS: CareerExplorerLevel[] = [
  {
    id: "beginner",
    title: "Explorer",
    subtitle: "Beginner",
    pdfSuffix: "Beginner",
    accent: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "intermediate",
    title: "Innovator",
    subtitle: "Intermediate",
    pdfSuffix: "Intermediate",
    accent: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "advanced",
    title: "Trailblazer",
    subtitle: "Advanced",
    pdfSuffix: "Advanced",
    accent: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/10 text-violet-500",
  },
];

export function getCoursePdfName(courseType?: string): string {
  const key = (courseType ?? "").trim().toLowerCase();
  if (COURSE_PDF_NAMES[key]) return COURSE_PDF_NAMES[key];
  const raw = (courseType ?? "").trim();
  if (!raw) return "Funtology";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function getLevelGuidePdfUrl(courseType: string | undefined, suffix: string): string {
  const name = getCoursePdfName(courseType);
  return `${CAREER_EXPLORER_PDF_BASE}/${name}-${suffix}.pdf`;
}

export function getWeekPathwayPdfUrl(courseType: string | undefined, weeks: number): string {
  const name = getCoursePdfName(courseType);
  return `${CAREER_EXPLORER_PDF_BASE}/${name}-${weeks}.pdf`;
}

export function getPdfFilename(url: string): string {
  return url.split("/").pop() ?? "document.pdf";
}
