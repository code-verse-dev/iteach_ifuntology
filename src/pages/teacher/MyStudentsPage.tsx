import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/inputs/PasswordField";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteStudentMutation,
  useGetMyStudentsQuery,
  useInviteStudentMutation,
  useResetStudentPasswordMutation,
  useToggleStudentStatusMutation,
} from "@/redux/services/apiSlices/studentSlice";
import {
  teacherSlice,
  useGetMyAssignmentsQuery,
} from "@/redux/services/apiSlices/teacherSlice";
import {
  getPasswordValidationError,
  PASSWORD_POLICY_HINT,
} from "@/utils/passwordValidation";

const emptyForm = { firstName: "", lastName: "", email: "", password: "" };

function apiError(err: any, fallback: string) {
  const message = err?.data?.message;
  if (Array.isArray(message)) return message[0] || fallback;
  return message || fallback;
}

export default function MyStudentsPage() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [courseType, setCourseType] = useState("");
  const { data, isFetching } = useGetMyStudentsQuery({
    page,
    limit: 20,
    ...(keyword ? { keyword } : {}),
    ...(courseType ? { courseType } : {}),
  });
  const { data: assignmentData } = useGetMyAssignmentsQuery();
  const [invite, { isLoading }] = useInviteStudentMutation();
  const [removeStudent, { isLoading: deleting }] = useDeleteStudentMutation();
  const [resetPassword, { isLoading: resetting }] = useResetStudentPasswordMutation();
  const [toggleStatus, { isLoading: toggling }] = useToggleStudentStatusMutation();
  const students = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1, totalDocs: 0 };
  const assignments = assignmentData?.data ?? [];
  const [open, setOpen] = useState(false);
  const [passwordFor, setPasswordFor] = useState<any>(null);
  const [deleteFor, setDeleteFor] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const usedSeats = assignments.reduce((sum: number, a: any) => sum + (a.usedSeats ?? 0), 0);
  const totalSeats = assignments.reduce((sum: number, a: any) => sum + (a.seats ?? 0), 0);
  const hasAssignableCourse = assignments.some((a: any) => (a.seats ?? 0) > (a.usedSeats ?? 0));

  const pageLabel = useMemo(
    () => `Page ${meta.page} of ${meta.totalPages || 1}`,
    [meta.page, meta.totalPages],
  );

  const refreshAssignments = () => {
    dispatch(teacherSlice.util.invalidateTags(["TeacherAssignments"]));
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(search.trim());
  };

  const toggleCourse = (course: string, remaining: number) => {
    if (remaining <= 0) return;
    setSelectedCourses((prev) =>
      prev.includes(course) ? prev.filter((item) => item !== course) : [...prev, course],
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourses.length === 0) {
      toast.error("Select at least one assigned course");
      return;
    }
    const passwordError = getPasswordValidationError(form.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    try {
      const res: any = await invite({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        courseType: selectedCourses,
      }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Student invited");
        setOpen(false);
        setForm(emptyForm);
        setSelectedCourses([]);
        refreshAssignments();
      } else {
        toast.error(res?.message || "Could not invite student");
      }
    } catch (err: any) {
      toast.error(apiError(err, "Could not invite student"));
    }
  };

  const savePassword = async () => {
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    try {
      const res: any = await resetPassword({
        studentId: passwordFor._id,
        password,
      }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Password updated");
        setPasswordFor(null);
        setPassword("");
      } else {
        toast.error(res?.message || "Could not update password");
      }
    } catch (err: any) {
      toast.error(apiError(err, "Could not update password"));
    }
  };

  const confirmDelete = async () => {
    try {
      const res: any = await removeStudent({ studentId: deleteFor._id }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Student removed");
        setDeleteFor(null);
        refreshAssignments();
      } else {
        toast.error(res?.message || "Could not remove student");
      }
    } catch (err: any) {
      toast.error(apiError(err, "Could not remove student"));
    }
  };

  const onToggleStatus = async (student: any) => {
    try {
      const res: any = await toggleStatus({ studentId: student._id }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Student status updated");
      } else {
        toast.error(res?.message || "Could not update status");
      }
    } catch (err: any) {
      toast.error(apiError(err, "Could not update status"));
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Classroom"
        title="My students"
        description={`Invite learners with credentials you control. Seats used: ${usedSeats} / ${totalSeats || 0}.`}
        actions={
          <Button onClick={() => setOpen(true)} disabled={!hasAssignableCourse}>
            Invite student
          </Button>
        }
      />
      {assignments.length === 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          No courses are assigned to you yet. Ask an admin to assign lifetime courses and seats before inviting students.
        </p>
      )}
      <form className="mb-4 flex flex-wrap items-center gap-2" onSubmit={applySearch}>
        <Input
          className="max-w-sm"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={courseType}
          onChange={(e) => {
            setPage(1);
            setCourseType(e.target.value);
          }}
        >
          <option value="">All courses</option>
          {assignments.map((assignment: any) => (
            <option key={assignment.courseType} value={assignment.courseType}>
              {assignment.courseType}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" disabled={isFetching}>
          {isFetching ? "Searching..." : "Search"}
        </Button>
      </form>
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Courses</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((student: any) => (
              <tr key={student._id} className="border-t border-border/70">
                <td className="px-4 py-4">
                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {(student.enrollments ?? []).length === 0 && (
                      <span className="text-muted-foreground">None yet</span>
                    )}
                    {(student.enrollments ?? []).map((enrollment: any) => (
                      <Badge key={enrollment._id ?? enrollment.courseType} variant="secondary">
                        {enrollment.courseType}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={student.status === "INACTIVE" ? "text-rose-500" : "text-emerald-600"}>
                    {student.status === "INACTIVE" ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-4 text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/teacher/my-students/${student._id}`}>Profile</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggling}
                    onClick={() => onToggleStatus(student)}
                  >
                    {student.status === "INACTIVE" ? "Activate" : "Suspend"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPasswordFor(student)}>
                    Password
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteFor(student)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  {isFetching ? "Loading students..." : "No students have been invited yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>{meta.totalDocs} result{meta.totalDocs === 1 ? "" : "s"} · {pageLabel}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (meta.totalPages || 1) || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setForm(emptyForm);
            setSelectedCourses([]);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Invite student</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Temporary password</Label>
              <PasswordField value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_HINT}</p>
            </div>
            <div className="space-y-2">
              <Label>Courses</Label>
              {assignments.length === 0 && (
                <p className="text-sm text-muted-foreground">No assigned courses available.</p>
              )}
              {assignments.map((assignment: any) => {
                const remaining = Math.max(0, (assignment.seats ?? 0) - (assignment.usedSeats ?? 0));
                return (
                  <label key={assignment.courseType} className="flex items-start gap-3 rounded-lg border border-border/70 p-3">
                    <Checkbox
                      checked={selectedCourses.includes(assignment.courseType)}
                      disabled={remaining <= 0}
                      onCheckedChange={() => toggleCourse(assignment.courseType, remaining)}
                    />
                    <span>
                      <span className="block font-medium">{assignment.courseType}</span>
                      <span className="text-xs text-muted-foreground">
                        {assignment.usedSeats ?? 0} of {assignment.seats ?? 0} seats in use
                        {remaining <= 0 ? " · no seats left" : ` · ${remaining} remaining`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading || !hasAssignableCourse}>
                {isLoading ? "Inviting..." : "Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!passwordFor}
        onOpenChange={(next) => {
          if (!next) {
            setPasswordFor(null);
            setPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password for {passwordFor?.firstName}</DialogTitle>
          </DialogHeader>
          <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_HINT}</p>
          <DialogFooter>
            <Button onClick={savePassword} disabled={resetting}>
              {resetting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteFor} onOpenChange={(next) => !next && setDeleteFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {deleteFor?.firstName} {deleteFor?.lastName}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This removes the student from your classroom and frees their seats. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Removing..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
