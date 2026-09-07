import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAssignTeacherCoursesMutation,
  useGetAssignableCoursesQuery,
  useGetTeacherQuery,
} from "@/redux/services/apiSlices/teacherSlice";

export default function AssignCoursesPage() {
  const { teacherId } = useParams();
  const {
    data: teacherData,
    isFetching: loadingTeacher,
    isError,
  } = useGetTeacherQuery(teacherId as string, { skip: !teacherId });
  const { data: coursesData, isFetching: loadingCourses } = useGetAssignableCoursesQuery();
  const [assign, { isLoading }] = useAssignTeacherCoursesMutation();
  const teacher = teacherData?.data;
  const courses = coursesData?.data ?? [];
  const [rows, setRows] = useState<Record<string, { on: boolean; seats: number; usedSeats: number }>>({});

  useEffect(() => {
    if (!courses.length) return;
    const next: Record<string, { on: boolean; seats: number; usedSeats: number }> = {};
    courses.forEach((course: any) => {
      const found = teacher?.assignments?.find(
        (assignment: any) => assignment.courseType === course.courseType,
      );
      next[course.courseType] = {
        on: Boolean(found),
        seats: found?.seats ?? 10,
        usedSeats: found?.usedSeats ?? 0,
      };
    });
    setRows(next);
  }, [teacher, courses]);

  const save = async () => {
    const assignments = Object.entries(rows)
      .filter(([, value]) => value.on)
      .map(([courseType, value]) => ({
        courseType,
        seats: Number(value.seats) || 0,
      }));
    try {
      const res: any = await assign({
        id: teacherId as string,
        assignments,
      }).unwrap();
      if (res?.status) {
        toast.success("Lifetime assignments saved");
      } else {
        toast.error(res?.message || "Could not save assignments");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not save assignments");
    }
  };

  if (!loadingTeacher && (isError || (teacherData && !teacher) || (teacher && teacher.role !== "teacher"))) {
    return (
      <AppPage>
        <PageHeader eyebrow="Teachers" title="Teacher not found" description="This teacher account could not be loaded." />
        <Button variant="outline" asChild>
          <Link to="/admin/teachers">Back to teachers</Link>
        </Button>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow="Teachers"
        title={`${teacher?.firstName ?? ""} ${teacher?.lastName ?? ""}`.trim() || "Assign courses"}
        description="Assign Funtology family courses for lifetime access and set how many students this teacher may invite."
        actions={
          <Button variant="outline" asChild>
            <Link to="/admin/teachers">Back</Link>
          </Button>
        }
      />
      <div className="surface-card space-y-4 rounded-2xl border border-border/70 p-6">
        {loadingTeacher || loadingCourses ? (
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No LMS courses are available to assign yet.</p>
        ) : (
          courses.map((course: any) => {
            const row = rows[course.courseType];
            return (
              <div
                key={course._id ?? course.courseType}
                className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={row?.on ?? false}
                    onCheckedChange={(checked) =>
                      setRows((prev) => ({
                        ...prev,
                        [course.courseType]: {
                          on: Boolean(checked),
                          seats: prev[course.courseType]?.seats ?? 10,
                          usedSeats: prev[course.courseType]?.usedSeats ?? 0,
                        },
                      }))
                    }
                  />
                  <span>
                    <span className="block font-medium">{course.title}</span>
                    <span className="text-sm text-muted-foreground">{course.description}</span>
                    {(row?.usedSeats ?? 0) > 0 && (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {row.usedSeats} seat{row.usedSeats === 1 ? "" : "s"} already in use
                      </span>
                    )}
                  </span>
                </label>
                <div className="flex items-center gap-2 sm:w-40">
                  <Input
                    type="number"
                    min={row?.usedSeats ?? 1}
                    value={row?.seats ?? 10}
                    disabled={!row?.on}
                    onChange={(e) =>
                      setRows((prev) => ({
                        ...prev,
                        [course.courseType]: {
                          ...prev[course.courseType],
                          seats: Number(e.target.value),
                        },
                      }))
                    }
                  />
                  <span className="text-xs text-muted-foreground">seats</span>
                </div>
              </div>
            );
          })
        )}
        <Button onClick={save} disabled={isLoading || !teacher}>
          {isLoading ? "Saving..." : "Save assignments"}
        </Button>
      </div>
    </AppPage>
  );
}
