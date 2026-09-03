import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BookOpen, Users } from "lucide-react";
import AppPage, { PageHeader, StatCard } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { courses } from "@/mock/data";
import { useGetMyStudentsQuery } from "@/redux/services/apiSlices/studentSlice";

export default function TeacherDashboard() {
  const user = useSelector((state: RootState) => state.user.userData);
  const { data } = useGetMyStudentsQuery(user?._id, { skip: !user?._id });
  const students = data?.data ?? [];
  const assigned = (user?.assignments ?? []).map((a: any) => ({
    ...a,
    title: courses.find((c) => c._id === a.courseId)?.title,
  }));
  const seats = assigned.reduce((s: number, a: any) => s + a.seats, 0);

  return (
    <AppPage>
      <PageHeader
        eyebrow="Teacher"
        title={`Hello, ${user?.firstName ?? "teacher"}`}
        description="Your courses are lifetime gifts from the foundation. Invite students within your assigned seats."
        actions={
          <Button asChild>
            <Link to="/teacher/my-students">Invite a student</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned courses" value={assigned.length} icon={BookOpen} hint="Lifetime access" />
        <StatCard label="Student seats" value={`${students.length} / ${seats || 0}`} icon={Users} hint="Used of assigned" />
        <StatCard label="Classroom" value={students.length} icon={Users} hint="Active learners" />
      </div>
      <section className="mt-8 surface-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-lg font-semibold">Your classroom catalog</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {assigned.map((a: any) => (
            <Link key={a.courseId} to={`/teacher/my-courses/${a.courseId}`} className="rounded-xl border border-border/70 p-4 hover:border-primary/40">
              <p className="font-medium">{a.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.usedSeats} of {a.seats} seats in use</p>
            </Link>
          ))}
          {assigned.length === 0 && <p className="text-sm text-muted-foreground">No courses assigned yet. Ask an admin to add Funtology, Skintology, or others.</p>}
        </div>
      </section>
    </AppPage>
  );
}
