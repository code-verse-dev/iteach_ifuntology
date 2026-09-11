import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  computeRowCreditTotal,
  formatEntryDateLabel,
  getPracticalColumns,
  normalizeEntryDateYmd,
  todayDateString,
} from "@/constants/practicalSheet";
import {
  useGetStudentPracticalSheetQuery,
  useTeacherUpdatePracticalEntryMutation,
} from "@/redux/services/apiSlices/practicalSheetSlice";

export default function PracticalSheetEntryDetailsPage() {
  const navigate = useNavigate();
  const { studentId, courseType, entryDate } = useParams();
  const decodedCourseType = decodeURIComponent(courseType ?? "");
  const columns = useMemo(() => getPracticalColumns(decodedCourseType), [decodedCourseType]);
  const qtyCols = columns?.filter((col) => col.key !== "total") ?? [];
  const { data, isLoading, isError } = useGetStudentPracticalSheetQuery(
    { studentId: studentId ?? "", courseType: decodedCourseType, from: entryDate, to: entryDate },
    { skip: !studentId || !decodedCourseType || !entryDate || !columns },
  );
  const [updateEntry, { isLoading: isSaving }] = useTeacherUpdatePracticalEntryMutation();
  const sheet = data?.data;
  const entry = useMemo(
    () =>
      (sheet?.rows ?? []).find(
        (row: any) => normalizeEntryDateYmd(row.entryDate) === normalizeEntryDateYmd(entryDate),
      ) ?? null,
    [sheet, entryDate],
  );
  const [cells, setCells] = useState<Record<string, string>>({});
  const today = todayDateString();
  const isToday = normalizeEntryDateYmd(entryDate) === today;
  const canEdit = Boolean(entry) && isToday && !entry?.approved;

  useEffect(() => {
    if (entry?.cells) setCells({ ...entry.cells });
  }, [entry]);

  const persist = async (approve: boolean) => {
    if (!studentId || !entryDate || !columns) return;
    if (!canEdit && !approve) return;
    if (approve && (!isToday || entry?.approved)) {
      toast.message("Only today's pending entry can be approved here");
      return;
    }
    try {
      const res: any = await updateEntry({
        studentId,
        courseType: decodedCourseType,
        entryDate,
        cells: canEdit ? cells : entry?.cells,
        approve,
      }).unwrap();
      if (res?.status === false) throw new Error(res?.message ?? "Failed to update entry");
      toast.success(approve ? "Entry saved and approved" : "Entry saved successfully");
    } catch (error: any) {
      toast.error(error?.data?.message ?? error?.message ?? "Failed to update entry");
    }
  };

  if (!columns) {
    return (
      <AppPage>
        <PageHeader title="Practical entry" description="Practical sheet is not available for this course." />
        <Button variant="outline" onClick={() => navigate("/teacher/practical-sheets")}>Back</Button>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow={decodedCourseType}
        title={`${sheet?.name || "Student"} · ${formatEntryDateLabel(entryDate)}`}
        description={isToday ? "Today's entry" : "Past entries are view-only from this page."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/teacher/practical-sheets">Back to inbox</Link>
            </Button>
            {studentId && (
              <Button variant="outline" asChild>
                <Link to={`/teacher/my-students/${studentId}/practical-sheet/${encodeURIComponent(decodedCourseType)}`}>
                  Open full sheet
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading entry...</p>
      ) : isError || !entry ? (
        <p className="text-sm text-muted-foreground">Entry not found for this date.</p>
      ) : (
        <section className="surface-card rounded-2xl border border-border/70 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {entry.approved ? <Badge variant="secondary">Approved</Badge> : <Badge>Pending</Badge>}
            <p className="text-sm">
              Total credits: <strong>{computeRowCreditTotal(cells, columns) || entry.cells?.total || "—"}</strong>
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {qtyCols.map((col) => (
              <div key={col.key} className="rounded-xl border border-border/70 p-3">
                <p className="text-sm font-medium">{col.label}</p>
                <p className="text-xs text-muted-foreground">Credit × {col.creditWeight}</p>
                <Input
                  className="mt-2"
                  type="number"
                  min={0}
                  step="1"
                  value={cells[col.key] ?? ""}
                  disabled={!canEdit || isSaving}
                  onChange={(e) => {
                    if (!canEdit) return;
                    setCells((prev) => {
                      const next = { ...prev, [col.key]: e.target.value };
                      next.total = computeRowCreditTotal(next, columns);
                      return next;
                    });
                  }}
                />
              </div>
            ))}
          </div>
          {canEdit && (
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled={isSaving} onClick={() => persist(false)}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
              <Button disabled={isSaving} onClick={() => persist(true)}>
                Save & approve
              </Button>
            </div>
          )}
        </section>
      )}
    </AppPage>
  );
}
