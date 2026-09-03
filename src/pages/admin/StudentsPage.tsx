import { useState } from "react";
import { Eye } from "lucide-react";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import PersonDetailDialog from "@/components/people/PersonDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetStudentsQuery } from "@/redux/services/apiSlices/studentSlice";

export default function StudentsPage() {
  const { data } = useGetStudentsQuery();
  const students = data?.data ?? [];
  const [selected, setSelected] = useState<any>(null);

  return (
    <AppPage>
      <PageHeader
        eyebrow="People"
        title="Students"
        description="Learners invited by teachers. Open a student to view contact details, enrolled courses, and surveys."
      />
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Teacher</th>
              <th className="px-4 py-3 font-medium">Courses</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((student: any) => {
              const teacherName = student.teacher
                ? `${student.teacher.firstName} ${student.teacher.lastName}`.trim()
                : "—";
              return (
                <tr key={student._id} className="border-t border-border/70">
                  <td className="px-4 py-4">
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{teacherName}</p>
                    {student.teacher?.email && (
                      <p className="text-xs text-muted-foreground">{student.teacher.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(student.enrollments ?? []).length === 0 && <span className="text-muted-foreground">None yet</span>}
                      {(student.enrollments ?? []).map((enrollment: any) => (
                        <Badge key={enrollment._id} variant="secondary">{enrollment.courseType}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={student.status === "INACTIVE" ? "text-rose-500" : "text-emerald-600"}>
                      {student.status === "INACTIVE" ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelected(student)}>
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </Button>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No students have been invited yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PersonDetailDialog person={selected} open={!!selected} onOpenChange={(open) => !open && setSelected(null)} />
    </AppPage>
  );
}
