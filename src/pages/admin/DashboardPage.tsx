import { Award, BookOpen, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AppPage, { PageHeader, StatCard } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { useGetTeachersQuery } from "@/redux/services/apiSlices/teacherSlice";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetCertificateStatsQuery } from "@/redux/services/apiSlices/certificateSlice";

export default function AdminDashboard() {
  const { data: teachersData } = useGetTeachersQuery({ page: 1, limit: 8 });
  const { data: coursesData } = useGetCoursesQuery();
  const { data: certStats } = useGetCertificateStatsQuery();
  const teachers = teachersData?.data ?? [];
  const teacherCount = teachersData?.meta?.totalDocs ?? teachers.length;
  const courses = coursesData?.data ?? [];
  const certificateCount = certStats?.data?.total ?? 0;

  return (
    <AppPage>
      <PageHeader
        eyebrow="Admin"
        title="Foundation overview"
        description="Create teachers, assign lifetime courses and student seats, and author LMS materials."
        actions={
          <Button asChild>
            <Link to="/admin/teachers">Manage teachers</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Teachers" value={teacherCount} hint="Accounts you created" icon={Users} />
        <StatCard label="Courses" value={courses.length} hint="Funtology family catalog" icon={BookOpen} />
        <StatCard label="Published" value={courses.length} hint="Ready for classrooms" icon={GraduationCap} />
        <StatCard label="Certificates" value={certificateCount} hint="Issued to students" icon={Award} />
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="surface-card rounded-2xl border border-border/70 p-6">
          <h2 className="text-lg font-semibold">Recent teachers</h2>
          <ul className="mt-4 space-y-3">
            {teachers.slice(0, 4).map((t: any) => (
              <li key={t._id} className="flex items-center justify-between rounded-xl bg-secondary/70 px-4 py-3">
                <div>
                  <p className="font-medium">{t.firstName} {t.lastName}</p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
                </div>
                <span className="text-xs font-semibold text-primary">{t.assignments?.length ?? 0} courses</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="surface-card rounded-2xl border border-border/70 p-6">
          <h2 className="text-lg font-semibold">What you can do</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["Assign seats", "Give each teacher lifetime access and a student cap."],
              ["Author materials", "Courses, modules, lessons, quizzes, and videos."],
              ["Support classrooms", "Chat, notifications, and profile tools for every role."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-border/70 p-4">
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppPage>
  );
}
