import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currentMonthRange,
  formatEntryDateLabel,
  normalizeEntryDateYmd,
  todayDateString,
} from "@/constants/practicalSheet";
import {
  useBulkApproveTodayPracticalEntriesMutation,
  useGetTeacherPracticalEntriesQuery,
  type TeacherPracticalEntry,
} from "@/redux/services/apiSlices/practicalSheetSlice";

const COURSE_FILTERS = [
  { value: "all", label: "All courses" },
  { value: "Funtology", label: "Funtology" },
  { value: "Skintology", label: "Skintology" },
  { value: "Nailtology", label: "Nailtology" },
  { value: "Barbertology", label: "Barbertology" },
] as const;

export default function PracticalSheetsPage() {
  const navigate = useNavigate();
  const defaultRange = useMemo(() => currentMonthRange(), []);
  const [courseType, setCourseType] = useState("all");
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [appliedCourseType, setAppliedCourseType] = useState("all");
  const [appliedFrom, setAppliedFrom] = useState(defaultRange.from);
  const [appliedTo, setAppliedTo] = useState(defaultRange.to);
  const [page, setPage] = useState(1);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const queryArgs = useMemo(
    () => ({
      page,
      limit: 20,
      from: appliedFrom,
      to: appliedTo,
      ...(appliedCourseType !== "all" ? { courseType: appliedCourseType } : {}),
    }),
    [page, appliedFrom, appliedTo, appliedCourseType],
  );

  const { data, isLoading, isFetching, isError } = useGetTeacherPracticalEntriesQuery(queryArgs);
  const [bulkApproveToday, { isLoading: isBulkApproving }] = useBulkApproveTodayPracticalEntriesMutation();
  const payload = data?.data;
  const docs: TeacherPracticalEntry[] = payload?.docs ?? [];
  const totalDocs = payload?.totalDocs ?? 0;
  const totalPages = Math.max(1, payload?.totalPages ?? 1);
  const today = todayDateString();
  const pendingTodayCount = docs.filter(
    (entry) => normalizeEntryDateYmd(entry.entryDate) === today && !entry.approved,
  ).length;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const applyFilters = () => {
    if (!fromDate || !toDate) return toast.error("Please select both from and to dates");
    if (fromDate > toDate) return toast.error("From date cannot be after to date");
    setAppliedCourseType(courseType);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setPage(1);
  };

  const handleBulkApprove = async () => {
    try {
      const res: any = await bulkApproveToday(
        appliedCourseType !== "all" ? { courseType: appliedCourseType } : {},
      ).unwrap();
      if (res?.status === false) throw new Error(res?.message ?? "Failed to bulk approve");
      toast.success(res?.message ?? "Today's entries approved");
      setBulkConfirmOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message ?? error?.message ?? "Failed to bulk approve");
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Classroom"
        title="Practical sheets"
        description="Review daily practical entries from your students and approve them."
        actions={
          <Button onClick={() => setBulkConfirmOpen(true)} disabled={isBulkApproving}>
            {isBulkApproving ? "Approving..." : "Bulk approve today"}
          </Button>
        }
      />

      <section className="mb-6 surface-card rounded-2xl border border-border/70 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Course</Label>
            <Select value={courseType} onValueChange={setCourseType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COURSE_FILTERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={applyFilters} disabled={isFetching}>Apply</Button>
          <Button
            variant="outline"
            onClick={() => {
              const range = currentMonthRange();
              setCourseType("all");
              setFromDate(range.from);
              setToDate(range.to);
              setAppliedCourseType("all");
              setAppliedFrom(range.from);
              setAppliedTo(range.to);
              setPage(1);
            }}
          >
            This month
          </Button>
        </div>
      </section>

      <section className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <div className="flex items-center justify-between border-b border-border/70 p-4">
          <h2 className="font-semibold">Daily entries</h2>
          <p className="text-xs text-muted-foreground">
            {totalDocs} {totalDocs === 1 ? "entry" : "entries"}
            {pendingTodayCount > 0 ? ` · ${pendingTodayCount} pending today on this page` : ""}
          </p>
        </div>
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading entries...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-muted-foreground">Unable to load practical entries.</p>
        ) : !docs.length ? (
          <p className="p-6 text-sm text-muted-foreground">No filled entries in this date range.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Approval</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((entry) => {
                    const isToday = normalizeEntryDateYmd(entry.entryDate) === today;
                    return (
                      <tr key={`${entry.studentId}-${entry.courseType}-${entry.entryDate}`} className="border-t border-border/70">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatEntryDateLabel(entry.entryDate)}
                          {isToday && <Badge className="ml-2" variant="secondary">Today</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          <Link className="font-medium hover:text-primary" to={`/teacher/my-students/${entry.studentId}`}>
                            {entry.studentName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{entry.courseType}</td>
                        <td className="px-4 py-3 font-medium">{entry.total || "—"}</td>
                        <td className="px-4 py-3">
                          {entry.approved ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="text-amber-600">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate(
                                `/teacher/practical-sheets/${entry.studentId}/${encodeURIComponent(entry.courseType)}/${entry.entryDate}`,
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 px-4 py-3">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages || isFetching} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk approve today?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will approve all pending practical entries for {formatEntryDateLabel(today)}
            {appliedCourseType !== "all" ? ` in ${appliedCourseType}` : " across all courses"}.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkConfirmOpen(false)}>Cancel</Button>
            <Button disabled={isBulkApproving} onClick={handleBulkApprove}>
              {isBulkApproving ? "Approving..." : "Approve all today"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
