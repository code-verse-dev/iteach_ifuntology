import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BookOpen, Users } from "lucide-react";
import AppPage, { PageHeader, StatCard } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetMyStudentsQuery } from "@/redux/services/apiSlices/studentSlice";
import { useGetMyAssignmentsQuery } from "@/redux/services/apiSlices/teacherSlice";

export default function TeacherDashboard() {
  const user = useSelector((state: RootState) => state.user.userData);
  const { data } = useGetMyStudentsQuery(user?._id, { skip: !user?._id });
  const { data: assignmentData } = useGetMyAssignmentsQuery();
  const { data: coursesData } = useGetCoursesQuery();
  const students = data?.data ?? [];
  const courses = coursesData?.data ?? [];
  const assigned = (assignmentData?.data ?? []).map((assignment: any) => ({
    ...assignment,
    title: courses.find((course: any) => course.courseType === assignment.courseType)?.title ?? assignment.courseType,
  }));
  const usedSeats = assigned.reduce((sum: number, assignment: any) => sum + (assignment.usedSeats ?? 0), 0);
  const seats = assigned.reduce((sum: number, assignment: any) => sum + (assignment.seats ?? 0), 0);

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
        <StatCard label="Student seats" value={`${usedSeats} / ${seats || 0}`} icon={Users} hint="Used of assigned" />
        <StatCard label="Classroom" value={students.length} icon={Users} hint="Active learners" />
      </div>
      <section className="mt-8 surface-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-lg font-semibold">Your classroom catalog</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {assigned.map((assignment: any) => (
            <Link
              key={assignment.courseType}
              to={`/teacher/my-courses/${encodeURIComponent(assignment.courseType)}`}
              className="rounded-xl border border-border/70 p-4 hover:border-primary/40"
            >
              <p className="font-medium">{assignment.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{assignment.usedSeats ?? 0} of {assignment.seats ?? 0} seats in use</p>
            </Link>
          ))}
          {assigned.length === 0 && <p className="text-sm text-muted-foreground">No courses assigned yet. Ask an admin to add Funtology, Skintology, or others.</p>}
        </div>
      </section>
    </AppPage>
  );
}
