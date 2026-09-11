import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Award, BookOpen } from "lucide-react";
import AppPage, { PageHeader, StatCard } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetMyEnrollmentsQuery } from "@/redux/services/apiSlices/studentSlice";
import { useGetMyCertificatesQuery } from "@/redux/services/apiSlices/certificateSlice";

export default function StudentDashboard() {
  const user = useSelector((state: RootState) => state.user.userData);
  const { data: enrollmentData } = useGetMyEnrollmentsQuery({});
  const { data: coursesData } = useGetCoursesQuery({});
  const { data: certificateData } = useGetMyCertificatesQuery();
  const certificates = certificateData?.data ?? [];
  const enrollments = enrollmentData?.data ?? [];
  const courseTypes = [...new Set(enrollments.map((item: any) => item.courseType).filter(Boolean))];
  const firstCourse = courseTypes[0];
  const firstTitle =
    (coursesData?.data ?? []).find((course: any) => course.courseType === firstCourse)?.title
    ?? firstCourse;

  return (
    <AppPage>
      <PageHeader
        eyebrow="Student"
        title={`Welcome back, ${user?.firstName ?? "learner"}`}
        description="Continue your pathway. Courses, modules, and certificates."
        actions={
          <Button asChild>
            <Link to="/student/learning">Go to learning</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Active courses" value={courseTypes.length} icon={BookOpen} hint="Assigned by your teacher" />
        <StatCard label="Certificates" value={certificates.length} icon={Award} hint={certificates.length ? "Ready to view" : "Earn by passing every quiz"} />
      </div>
      <section className="mt-8 surface-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-lg font-semibold">Continue</h2>
        {firstCourse ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">Open {firstTitle} to continue your modules and lessons.</p>
            <Button className="mt-4" asChild>
              <Link to={`/student/learning/${encodeURIComponent(firstCourse as string)}`}>Open {firstTitle}</Link>
            </Button>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No courses yet. Ask your teacher to invite you.</p>
        )}
      </section>
    </AppPage>
  );
}
