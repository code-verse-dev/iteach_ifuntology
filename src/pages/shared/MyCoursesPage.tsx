import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { RootState } from "@/redux/store";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetMyEnrollmentsQuery } from "@/redux/services/apiSlices/studentSlice";
import { useGetMyAssignmentsQuery } from "@/redux/services/apiSlices/teacherSlice";
import { courseRouteKey } from "@/utils/mediaUrl";

export default function MyCoursesPage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const role = user?.role as string;
  const { data: coursesData, isFetching } = useGetCoursesQuery();
  const { data: assignmentData } = useGetMyAssignmentsQuery(undefined, { skip: role !== "teacher" });
  const { data: enrollmentData } = useGetMyEnrollmentsQuery(undefined, { skip: role !== "student" });
  const courses = coursesData?.data ?? [];
  const assignedTypes = useMemo(
    () => new Set((assignmentData?.data ?? []).map((item: any) => item.courseType).filter(Boolean)),
    [assignmentData],
  );
  const enrolledTypes = useMemo(
    () => new Set((enrollmentData?.data ?? []).map((item: any) => item.courseType).filter(Boolean)),
    [enrollmentData],
  );
  const list = courses.filter((course: any) => {
    if (role === "teacher") return assignedTypes.has(course.courseType);
    if (role === "student") return enrolledTypes.has(course.courseType);
    return true;
  });
  const base = role === "student" ? "/student/learning" : "/teacher/my-courses";

  return (
    <AppPage>
      <PageHeader
        eyebrow="Courses"
        title={role === "student" ? "Learning" : "My courses"}
        description={role === "student" ? "Modules, lessons, quizzes, and certificates from your teacher." : "Preview the same LMS materials your students use."}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((course: any) => {
          const key = courseRouteKey(course);
          return (
            <Link key={course._id} to={`${base}/${encodeURIComponent(key)}`} className="surface-card rounded-2xl border border-border/70 p-6 hover:border-primary/40">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">{course.title}</h2>
                <Badge>Lifetime</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
              <p className="mt-4 text-sm text-muted-foreground">{course.modules} modules · {course.lessons} lessons</p>
            </Link>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {isFetching
            ? "Loading courses..."
            : role === "teacher"
              ? "No courses assigned yet. Ask an admin to assign lifetime courses."
              : "No courses enrolled yet. Ask your teacher to invite you."}
        </p>
      )}
    </AppPage>
  );
}
