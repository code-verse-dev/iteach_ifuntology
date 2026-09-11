import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Pencil } from "lucide-react";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  computeRowCreditTotal,
  createEmptyEntryCells,
  currentMonthRange,
  exportPracticalRowsCsv,
  formatEntryDateLabel,
  getPracticalColumns,
  normalizeEntryDateYmd,
  PRACTICAL_SHEET_INTRO,
  todayDateString,
} from "@/constants/practicalSheet";
import {
  useGetPracticalSheetQuery,
  useSaveDailyPracticalEntryMutation,
  type PracticalSheetRow,
} from "@/redux/services/apiSlices/practicalSheetSlice";
import { RootState } from "@/redux/store";

export default function PracticalSheetPage() {
  const { courseId } = useParams();
  const decodedCourseType = decodeURIComponent(courseId ?? "");
  const columns = useMemo(() => getPracticalColumns(decodedCourseType), [decodedCourseType]);
  const user = useSelector((state: RootState) => state.user.userData) as any;
  const studentName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "—";
  const defaultRange = useMemo(() => currentMonthRange(), []);
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [appliedFrom, setAppliedFrom] = useState(defaultRange.from);
  const [appliedTo, setAppliedTo] = useState(defaultRange.to);
  const { data, isLoading, isError, isFetching } = useGetPracticalSheetQuery(
    { courseType: decodedCourseType, from: appliedFrom, to: appliedTo },
    { skip: !decodedCourseType || !columns },
  );
  const [saveDailyEntry, { isLoading: isSaving }] = useSaveDailyPracticalEntryMutation();
  const sheet = data?.data;
  const rows: PracticalSheetRow[] = sheet?.rows ?? [];
  const today = todayDateString();
  const todayEntry: PracticalSheetRow | null =
    normalizeEntryDateYmd(sheet?.todayEntry?.entryDate) === today
      ? (sheet.todayEntry ?? null)
      : (rows.find((row) => normalizeEntryDateYmd(row.entryDate) === today) ?? null);
  const monthProgress = sheet?.monthProgress ?? { filled: 0, totalDays: 0, percent: 0 };
  const [formCells, setFormCells] = useState<Record<string, string>>({});
  const formLocked = Boolean(todayEntry?.approved);
  const qtyCols = columns?.filter((col) => col.key !== "total") ?? [];

  useEffect(() => {
    if (!columns) return;
    setFormCells(todayEntry?.cells ? { ...todayEntry.cells } : createEmptyEntryCells(columns));
  }, [columns, todayEntry]);

  const updateFormCell = (key: string, value: string) => {
    if (!columns || formLocked || key === "total") return;
    setFormCells((prev) => {
      const next = { ...prev, [key]: value };
      next.total = computeRowCreditTotal(next, columns);
      return next;
    });
  };

  const handleSaveDaily = async () => {
    if (!columns || formLocked) return;
    try {
      const res: any = await saveDailyEntry({ courseType: decodedCourseType, cells: formCells }).unwrap();
      if (res?.status === false) throw new Error(res?.message ?? "Failed to save daily entry");
      toast.success("Daily entry saved");
    } catch (error: any) {
      toast.error(error?.data?.message ?? error?.message ?? "Failed to save daily entry");
    }
  };

  const applyDateFilter = () => {
    if (!fromDate || !toDate) return toast.error("Please select both from and to dates");
    if (fromDate > toDate) return toast.error("From date cannot be after to date");
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  if (!columns) {
    return (
      <AppPage>
        <PageHeader title="Practical sheet" description="This course does not have a practical sheet yet." />
        <Button variant="outline" asChild>
          <Link to={`/student/learning/${encodeURIComponent(decodedCourseType)}`}>Back to course</Link>
        </Button>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow={decodedCourseType}
        title="Practical sheet"
        description={PRACTICAL_SHEET_INTRO}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/student/learning/${encodeURIComponent(decodedCourseType)}`}>Back to course</Link>
            </Button>
            <Button variant="outline" disabled={!rows.length} onClick={() => exportPracticalRowsCsv(`${decodedCourseType}-practical-sheet.csv`, columns, rows)}>
              Export
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading practical sheet...</p>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">Unable to load practical sheet for this course.</p>
      ) : (
        <div className="space-y-6">
          <section className="surface-card rounded-2xl border border-border/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium">{sheet?.name || studentName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {monthProgress.filled ?? 0} of {monthProgress.totalDays ?? 0} days filled this month
                  {monthProgress.percent != null ? ` (${monthProgress.percent}%)` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label>From</Label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>To</Label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
                <Button onClick={applyDateFilter} disabled={isFetching}>Apply</Button>
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
            </div>
          </section>

          <section id="daily-practical-form" className="surface-card scroll-mt-4 rounded-2xl border border-border/70 p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Today&apos;s entry</h2>
                <p className="text-sm text-muted-foreground">
                  Enter quantities for {formatEntryDateLabel(today)}. Past days are view-only once saved.
                </p>
              </div>
              {formLocked && <Badge variant="secondary">Approved — locked</Badge>}
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
                    placeholder="0"
                    value={formCells[col.key] ?? ""}
                    disabled={formLocked}
                    onChange={(e) => updateFormCell(col.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                Estimated total credits: <strong>{computeRowCreditTotal(formCells, columns) || "0"}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled={isSaving || formLocked} onClick={() => columns && setFormCells(createEmptyEntryCells(columns))}>
                  Clear all
                </Button>
                <Button disabled={isSaving || formLocked} onClick={handleSaveDaily}>
                  {isSaving ? "Saving..." : "Save daily entry"}
                </Button>
              </div>
            </div>
          </section>

          <section className="surface-card overflow-hidden rounded-2xl border border-border/70">
            <div className="flex items-center justify-between border-b border-border/70 p-4">
              <h2 className="font-semibold">Daily entries</h2>
              <p className="text-xs text-muted-foreground">{rows.length} filled{isFetching ? " · refreshing" : ""}</p>
            </div>
            {!rows.length ? (
              <p className="p-6 text-sm text-muted-foreground">No entries in this date range yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-3 py-3">Approval</th>
                      {qtyCols.map((col) => (
                        <th key={col.key} className="px-3 py-3 font-medium">{col.label}</th>
                      ))}
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const isToday = normalizeEntryDateYmd(row.entryDate) === today;
                      const canEditToday = isToday && !row.approved;
                      return (
                        <tr key={row.entryDate} className="border-t border-border/70">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatEntryDateLabel(row.entryDate)}
                              {isToday && <Badge variant="secondary">Today</Badge>}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {row.approved ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                              </span>
                            ) : (
                              "Pending"
                            )}
                          </td>
                          {qtyCols.map((col) => (
                            <td key={col.key} className="px-3 py-3 text-muted-foreground">
                              {(row.cells?.[col.key] ?? "").trim() || "—"}
                            </td>
                          ))}
                          <td className="px-3 py-3 font-medium">{computeRowCreditTotal(row.cells, columns) || "—"}</td>
                          <td className="px-3 py-3">
                            {canEditToday ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setFormCells({ ...row.cells });
                                  document.getElementById("daily-practical-form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">{row.approved ? "Locked" : "—"}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </AppPage>
  );
}
