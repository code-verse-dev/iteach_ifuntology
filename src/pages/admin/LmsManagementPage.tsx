import { Link } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { courseRouteKey } from "@/utils/mediaUrl";

export default function LmsManagementPage() {
  const { data, isFetching } = useGetCoursesQuery();
  const courses = data?.data ?? [];

  return (
    <AppPage>
      <PageHeader
        eyebrow="Authoring"
        title="LMS management"
        description="Catalog of foundation courses. Teachers receive these as lifetime assignments instead of paid subscriptions."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course: any) => {
          const key = courseRouteKey(course);
          return (
            <article key={course._id} className="surface-card rounded-2xl border border-border/70 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
                </div>
                <Badge>{course.courseType}</Badge>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-secondary p-3"><dt className="text-muted-foreground">Modules</dt><dd className="font-semibold">{course.modules}</dd></div>
                <div className="rounded-xl bg-secondary p-3"><dt className="text-muted-foreground">Lessons</dt><dd className="font-semibold">{course.lessons}</dd></div>
                <div className="rounded-xl bg-secondary p-3"><dt className="text-muted-foreground">Certificates</dt><dd className="font-semibold">{course.totalCertificates ?? 0}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                  <Link to={`/admin/module-management?course=${encodeURIComponent(key)}`}>Modules</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/admin/quiz-management?course=${encodeURIComponent(key)}`}>Quizzes</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/admin/certificates?course=${encodeURIComponent(key)}`}>Certificates</Link>
                </Button>
              </div>
            </article>
          );
        })}
        {courses.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {isFetching ? "Loading courses..." : "No courses found."}
          </p>
        )}
      </div>
    </AppPage>
  );
}
