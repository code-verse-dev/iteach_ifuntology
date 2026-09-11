import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import AppPage, { PageHeader, StatCard } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ClipboardList } from "lucide-react";
import {
  computeRowCreditTotal,
  currentMonthRange,
  exportPracticalRowsCsv,
  formatEntryDateLabel,
  getPracticalColumns,
  PRACTICAL_SHEET_INTRO,
} from "@/constants/practicalSheet";
import {
  useGetStudentPracticalSheetQuery,
  useTeacherUpdatePracticalEntryMutation,
  type PracticalSheetRow,
} from "@/redux/services/apiSlices/practicalSheetSlice";

export default function StudentPracticalSheetView() {
  const { studentId, courseType } = useParams();
  const decodedCourseType = decodeURIComponent(courseType ?? "");
  const columns = useMemo(() => getPracticalColumns(decodedCourseType), [decodedCourseType]);
  const qtyCols = columns?.filter((col) => col.key !== "total") ?? [];
  const defaultRange = useMemo(() => currentMonthRange(), []);
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [appliedFrom, setAppliedFrom] = useState(defaultRange.from);
  const [appliedTo, setAppliedTo] = useState(defaultRange.to);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [savingDate, setSavingDate] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching } = useGetStudentPracticalSheetQuery(
    { studentId: studentId ?? "", courseType: decodedCourseType, from: appliedFrom, to: appliedTo },
    { skip: !studentId || !decodedCourseType || !columns },
  );
  const [updateEntry] = useTeacherUpdatePracticalEntryMutation();
  const sheet = data?.data;
  const rows: PracticalSheetRow[] = sheet?.rows ?? [];
  const approvedCount = rows.filter((row) => row.approved).length;
  const pendingCount = rows.length - approvedCount;
  const totalCredits = rows.reduce(
    (sum, row) => sum + (Number(computeRowCreditTotal(row.cells, columns ?? [])) || 0),
    0,
  );

  const persist = async (row: PracticalSheetRow, approve: boolean) => {
    if (!studentId || !row.entryDate || !columns) return;
    const cells = drafts[row.entryDate] ?? row.cells;
    setSavingDate(row.entryDate);
    try {
      const res: any = await updateEntry({
        studentId,
        courseType: decodedCourseType,
        entryDate: row.entryDate,
        cells,
        approve,
      }).unwrap();
      if (res?.status === false) throw new Error(res?.message ?? "Failed to update entry");
      toast.success(approve ? "Entry updated and approved" : "Entry updated");
    } catch (error: any) {
      toast.error(error?.data?.message ?? error?.message ?? "Failed to update entry");
    } finally {
      setSavingDate(null);
    }
  };

  if (!columns) {
    return (
      <AppPage>
        <PageHeader title="Practical sheet" description="Practical sheet is not available for this course." />
        <Button variant="outline" asChild>
          <Link to={`/teacher/my-students/${studentId}`}>Back to student</Link>
        </Button>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow={decodedCourseType}
        title={`${sheet?.name || "Student"} practical sheet`}
        description={PRACTICAL_SHEET_INTRO}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/teacher/my-students/${studentId}`}>Back to student</Link>
            </Button>
            <Button
              variant="outline"
              disabled={!rows.length}
              onClick={() => exportPracticalRowsCsv(`${decodedCourseType}-practical-sheet.csv`, columns, rows)}
            >
              Export
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entries" value={rows.length} icon={ClipboardList} />
        <StatCard label="Approved" value={approvedCount} icon={CheckCircle2} />
        <StatCard label="Pending" value={pendingCount} icon={ClipboardList} />
        <StatCard label="Total credits" value={totalCredits || "0"} icon={ClipboardList} />
      </div>

      <section className="mb-6 surface-card rounded-2xl border border-border/70 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <Button
            onClick={() => {
              if (!fromDate || !toDate) return toast.error("Please select both from and to dates");
              if (fromDate > toDate) return toast.error("From date cannot be after to date");
              setAppliedFrom(fromDate);
              setAppliedTo(toDate);
            }}
            disabled={isFetching}
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const range = currentMonthRange();
              setFromDate(range.from);
              setToDate(range.to);
              setAppliedFrom(range.from);
              setAppliedTo(range.to);
            }}
          >
            This month
          </Button>
        </div>
      </section>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading practical sheet...</p>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">Unable to load this student&apos;s practical sheet.</p>
      ) : !rows.length ? (
        <p className="text-sm text-muted-foreground">
          {sheet?.exists === false ? "This student has not started this practical sheet yet." : "No entries in this date range."}
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const cells = drafts[row.entryDate ?? ""] ?? row.cells;
            const busy = savingDate === row.entryDate;
            return (
              <article key={row.entryDate} className="surface-card rounded-2xl border border-border/70 p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{formatEntryDateLabel(row.entryDate)}</h2>
                    <p className="text-sm text-muted-foreground">
                      Total: {computeRowCreditTotal(cells, columns) || "0"}
                    </p>
                  </div>
                  {row.approved ? <Badge variant="secondary">Approved</Badge> : <Badge>Pending</Badge>}
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
                        disabled={busy}
                        onChange={(e) => {
                          if (!row.entryDate) return;
                          setDrafts((prev) => {
                            const nextCells = { ...(prev[row.entryDate!] ?? row.cells), [col.key]: e.target.value };
                            nextCells.total = computeRowCreditTotal(nextCells, columns);
                            return { ...prev, [row.entryDate!]: nextCells };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button variant="outline" disabled={busy} onClick={() => persist(row, false)}>
                    {busy ? "Saving..." : "Save"}
                  </Button>
                  <Button disabled={busy} onClick={() => persist(row, true)}>
                    {row.approved ? "Re-approve" : "Approve"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppPage>
  );
}
