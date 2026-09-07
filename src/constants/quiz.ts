export const QUIZ_PASS_THRESHOLD = 40;

export const IMPORTED_ASSESSMENT_MODULE_TITLES = [
  "Imported Quizzes",
  "Imported Tests",
  "Imported Exams",
] as const;

export function isImportedAssessmentModule(title?: string | null): boolean {
  if (!title) return false;
  return (IMPORTED_ASSESSMENT_MODULE_TITLES as readonly string[]).includes(title);
}

export function getAssessmentLabel(type?: string) {
  const normalized = String(type ?? "").toUpperCase();
  if (normalized === "TEST") return "Test";
  if (normalized === "EXAM") return "Exam";
  return "Quiz";
}
