import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAssignTeacherCoursesMutation, useGetTeacherQuery } from "@/redux/services/apiSlices/teacherSlice";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { CourseAssignment } from "@/mock/data";

export default function AssignCoursesPage() {
  const { teacherId } = useParams();
  const { data: teacherData } = useGetTeacherQuery(teacherId as string, { skip: !teacherId });
  const { data: coursesData } = useGetCoursesQuery();
  const [assign, { isLoading }] = useAssignTeacherCoursesMutation();
  const teacher = teacherData?.data;
  const courses = coursesData?.data ?? [];
  const [rows, setRows] = useState<Record<string, { on: boolean; seats: number }>>({});

  useEffect(() => {
    if (!teacher || !courses.length) return;
    const next: Record<string, { on: boolean; seats: number }> = {};
    courses.forEach((c: any) => {
      const found = teacher.assignments?.find((a: CourseAssignment) => a.courseId === c._id);
      next[c._id] = { on: Boolean(found), seats: found?.seats ?? 10 };
    });
    setRows(next);
  }, [teacher, courses]);

  const save = async () => {
    const assignments = Object.entries(rows)
      .filter(([, v]) => v.on)
      .map(([courseId, v]) => ({
        courseId,
        seats: Number(v.seats) || 0,
        usedSeats: teacher?.assignments?.find((a: CourseAssignment) => a.courseId === courseId)?.usedSeats ?? 0,
      }));
    try {
      const res: any = await assign({ id: teacherId as string, assignments }).unwrap();
      if (res?.status) toast.success("Lifetime assignments saved");
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not save assignments");
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Teachers"
        title={`${teacher?.firstName ?? ""} ${teacher?.lastName ?? ""}`}
        description="Assign Funtology family courses for lifetime access and set how many students this teacher may invite."
        actions={
          <Button variant="outline" asChild>
            <Link to="/admin/teachers">Back</Link>
          </Button>
        }
      />
      <div className="surface-card space-y-4 rounded-2xl border border-border/70 p-6">
        {courses.map((c: any) => (
          <div key={c._id} className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-start gap-3">
              <Checkbox
                checked={rows[c._id]?.on ?? false}
                onCheckedChange={(checked) =>
                  setRows((prev) => ({ ...prev, [c._id]: { on: Boolean(checked), seats: prev[c._id]?.seats ?? 10 } }))
                }
              />
              <span>
                <span className="block font-medium">{c.title}</span>
                <span className="text-sm text-muted-foreground">{c.description}</span>
              </span>
            </label>
            <div className="flex items-center gap-2 sm:w-40">
              <Input
                type="number"
                min={1}
                value={rows[c._id]?.seats ?? 10}
                disabled={!rows[c._id]?.on}
                onChange={(e) =>
                  setRows((prev) => ({ ...prev, [c._id]: { ...prev[c._id], seats: Number(e.target.value) } }))
                }
              />
              <span className="text-xs text-muted-foreground">seats</span>
            </div>
          </div>
        ))}
        <Button onClick={save} disabled={isLoading}>{isLoading ? "Saving..." : "Save assignments"}</Button>
      </div>
    </AppPage>
  );
}
