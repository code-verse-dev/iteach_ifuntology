import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { RootState } from "@/redux/store";
import { courses } from "@/mock/data";

export default function MyCoursesPage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const role = user?.role as string;
  const assignedIds = new Set((user?.assignments ?? []).map((a: any) => a.courseId));
  const list =
    role === "teacher"
      ? courses.filter((c) => assignedIds.has(c._id))
      : courses.filter((c) => c.status === "published").slice(0, 2);
  const base = role === "student" ? "/student/learning" : "/teacher/my-courses";

  return (
    <AppPage>
      <PageHeader
        eyebrow="Courses"
        title={role === "student" ? "Learning" : "My courses"}
        description={role === "student" ? "Modules, lessons, quizzes, and certificates from your teacher." : "Preview the same LMS materials your students use."}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((course) => (
          <Link key={course._id} to={`${base}/${course._id}`} className="surface-card rounded-2xl border border-border/70 p-6 hover:border-primary/40">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <Badge>Lifetime</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
            <p className="mt-4 text-sm text-muted-foreground">{course.modules} modules · {course.lessons} lessons</p>
          </Link>
        ))}
      </div>
    </AppPage>
  );
}
