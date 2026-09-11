export type PracticalColumn = {
  key: string;
  label: string;
  creditWeight: number;
};

export const PRACTICAL_SHEET_INTRO =
  "Record your completed hands-on services each day. Enter only the services you performed, then save for teacher approval.";

function col(key: string, label: string, creditWeight: number): PracticalColumn {
  return { key, label, creditWeight };
}

export const SKINTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  col("sanitationDisinfection", "Sanitation & Disinfection", 0.5),
  col("stationSetUp", "Station Set Up", 0.5),
  col("makeUpRemoval", "Make Up Removal", 1),
  col("browApplications", "Brow Applications", 1),
  col("facialManipulations", "Facial Manipulations", 1.5),
  col("specialtyFacialArt", "Specialty Facial Art", 1),
  col("deepFacialTreatment", "Deep Facial Treatment", 1),
  col("draping", "Draping", 0.5),
  col("fiveStepCleansing", "Five Step Cleansing", 1.5),
  col("mockHairRemoval", "Mock Hair Removal", 1),
  col("eyelashApplication", "Eyelash Application", 1),
  col("facialGems", "Facial Gems", 0.75),
  col("facialContourHighlighting", "Facial Contour/Highlighting", 1.75),
  col("fullFacialMakeUpApplication", "Full Facial Make Up Application", 2.5),
  col("eyelashReplacement", "Eyelash Replacement", 0.75),
  col("eyes", "Eyes", 1),
  col("lips", "Lips", 1),
  col("theatricalMakeUp", "Theatrical Make-Up", 3),
  col("specialtyHolidayFacial", "Specialty/Holiday Facial", 2),
  col("weddingPromsHomecomingLooks", "Wedding, Proms & Homecoming Looks", 3),
  col("total", "TOTAL", 0),
];

export const FUNTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  col("sanitationDisinfection", "Sanitation & Disinfection", 0.5),
  col("stationSetUp", "Station Set Up", 1),
  col("wetHairstyling", "Wet Hairstyling", 1.5),
  col("dryHairstyling", "Dry Hairstyling", 1),
  col("mockPermanentWaveServices", "Mock Permanent Wave Services", 3),
  col("mockShampooServices", "Mock Shampoo Services", 0.5),
  col("mockConditionerServices", "Mock Conditioner Services", 0.5),
  col("haircutting", "Haircutting", 0.75),
  col("facialMassages", "Facial Massages", 1),
  col("mockChemicalServices", "Mock Chemical Services", 2),
  col("hairSectioningParting", "Hair Sectioning/Parting", 1),
  col("scalpTreatments", "Scalp Treatments", 1),
  col("hairSculptingFingerwaving", "Hair Sculpting/Fingerwaving", 2),
  col("mockHaircolorServices", "Mock Haircolor Services", 1.75),
  col("mockRetouchApplications", "Mock Retouch Applications", 1.75),
  col("braidsTwistsCornrows", "Braids, Twists & Cornrows", 3),
  col("artificialEnhancements", "Artificial Enhancements", 2),
  col("lashBrowServices", "Lash & Brow Services", 1),
  col("nailcareServices", "Nailcare Services", 1.5),
  col("total", "TOTAL", 0),
];

export const NAILTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  col("sanitationDisinfection", "Sanitation & Disinfection", 0.5),
  col("stationSetUp", "Station Set Up", 1),
  col("nailPolishing", "Nail Polishing", 1),
  col("nailPolishRemoval", "Nail Polish Removal", 0.5),
  col("nailShapingServices", "Nail Shaping Services", 0.5),
  col("handArmMassages", "Hand/Arm Massages", 1),
  col("nailArtServices", "Nail Art Services", 1.5),
  col("manicures", "Manicures", 1),
  col("pedicures", "Pedicures", 1),
  col("nailPolishing5Nails", "Nail Polishing: 5 Nails", 0.75),
  col("nailPolishing10Nails", "Nail Polishing: 10 Nails", 1.5),
  col("extraLongNails", "Extra Long Nails", 2.25),
  col("mockOilTreatmentServices", "Mock Oil Treatment Services", 1),
  col("nailRepair", "Nail Repair", 1),
  col("alternatingNailPatterns", "Alternating Nail Patterns", 1),
  col("primaryColorNailDesigns", "Primary Color Nail Designs", 1),
  col("secondaryColorNailDesigns", "Secondary Color Nail Designs", 1),
  col("nailcareServices", "Nailcare Services", 1.5),
  col("themeNails", "Theme Nails", 2),
  col("total", "TOTAL", 0),
];

export const BARBERTOLOGY_PRACTICAL_COLUMNS: PracticalColumn[] = [
  col("sanitationDisinfection", "Sanitation & Disinfection", 0.5),
  col("stationSetUp", "Station Set Up", 0.5),
  col("haircuttingBeard", "Haircutting (Beard)", 0.5),
  col("haircuttingMustaches", "Haircutting Mustaches", 0.5),
  col("haircuttingShears", "Haircutting/Shears", 0.75),
  col("haircuttingClippers", "Haircutting/Clippers", 0.75),
  col("haircuttingWith3PlusGuards", "Haircutting with 3+ Guards", 1),
  col("haircuttingOverComb", "Haircutting/Over Comb", 0.75),
  col("drapings", "Drapings", 1),
  col("wetHairstyling", "Wet Hairstyling", 1.5),
  col("dryHairstyling", "Dry Hairstyling", 1),
  col("mockPermanentWaveServices", "Mock Permanent Wave Services", 3),
  col("mockShampooServices", "Mock Shampoo Services", 0.5),
  col("mockConditionerServices", "Mock Conditioner Services", 0.5),
  col("facialMassages", "Facial Massages", 1),
  col("mockChemicalServices", "Mock Chemical Services", 2),
  col("hairSectioningParting", "Hair Sectioning/Parting", 1),
  col("scalpTreatmentsDetangling", "Scalp Treatments & Detangling", 1),
  col("hairSculpting", "Hair Sculpting", 1),
  col("mockHaircolorServices", "Mock Haircolor Services", 1.75),
  col("mockRetouchApplications", "Mock Retouch Applications", 1.75),
  col("braidsTwistsCornrows", "Braids, Twists & Cornrows", 3),
  col("artificialEnhancements", "Artificial Enhancements", 2),
  col("browServices", "Brow Services", 1),
  col("nailcareServices", "Nailcare Services", 1),
  col("total", "TOTAL", 0),
];

export function getPracticalColumns(courseType?: string): PracticalColumn[] | null {
  switch (courseType) {
    case "Skintology":
      return SKINTOLOGY_PRACTICAL_COLUMNS;
    case "Funtology":
      return FUNTOLOGY_PRACTICAL_COLUMNS;
    case "Nailtology":
      return NAILTOLOGY_PRACTICAL_COLUMNS;
    case "Barbertology":
      return BARBERTOLOGY_PRACTICAL_COLUMNS;
    default:
      return null;
  }
}

export function createEmptyEntryCells(columns: PracticalColumn[]) {
  return Object.fromEntries(columns.map((column) => [column.key, ""]));
}

export function todayDateString(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function currentMonthRange(now = new Date()): { from: string; to: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const from = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const to = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export function getViewerTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function normalizeEntryDateYmd(value?: string | Date | null): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  }
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) {
    if (typeof value === "string") {
      const prefix = value.trim().slice(0, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(prefix) ? prefix : "";
    }
    return "";
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: getViewerTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dt);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return y && m && d ? `${y}-${m}-${d}` : "";
}

export function formatEntryDateLabel(value?: string | Date | null) {
  if (value == null || value === "") return "—";
  const ymd = normalizeEntryDateYmd(value);
  if (!ymd) return typeof value === "string" ? value : "—";
  const [year, month, day] = ymd.split("-").map(Number);
  const dt = new Date(year, month - 1, day, 12, 0, 0);
  if (Number.isNaN(dt.getTime())) return ymd;
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: getViewerTimeZone(),
  });
}

export function computeRowCreditTotal(
  cells: Record<string, string>,
  columns: PracticalColumn[],
): string {
  let sum = 0;
  for (const column of columns) {
    if (column.key === "total") continue;
    const raw = String(cells?.[column.key] ?? "").trim();
    if (!raw) continue;
    const entered = Number(raw);
    if (!Number.isFinite(entered)) continue;
    const weight = column.creditWeight > 0 ? column.creditWeight : 1;
    sum += entered * weight;
  }
  if (sum === 0) return "";
  const rounded = Math.round(sum * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function exportPracticalRowsCsv(
  filename: string,
  columns: PracticalColumn[],
  rows: Array<{ entryDate?: string | null; approved?: boolean; cells?: Record<string, string> }>,
) {
  const escape = (value: string) => `"${(value ?? "").replace(/"/g, '""')}"`;
  const header = ["Date", "Approved", ...columns.map((column) => column.label)];
  const lines = rows.map((row) => [
    row.entryDate ?? "",
    row.approved ? "Yes" : "No",
    ...columns.map((column) =>
      column.key === "total"
        ? computeRowCreditTotal(row.cells ?? {}, columns)
        : (row.cells?.[column.key] ?? ""),
    ),
  ]);
  const csv = [header, ...lines].map((line) => line.map(escape).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
