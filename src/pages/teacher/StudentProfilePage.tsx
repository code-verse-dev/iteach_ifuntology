import { Link, useParams } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { certificateTitle, useGetTeacherStudentQuery } from "@/redux/services/apiSlices/certificateSlice";
import { formatDate } from "@/lib/utils";

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const { data, isFetching } = useGetTeacherStudentQuery(studentId as string, { skip: !studentId });
  const payload = data?.data;
  const user = payload?.user;
  const enrollments = payload?.enrollments ?? [];
  const certificates = payload?.certificates ?? [];
  const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Student";

  return (
    <AppPage>
      <PageHeader
        eyebrow="Classroom"
        title={isFetching ? "Loading student..." : name}
        description={user?.email}
        actions={
          <Button variant="outline" asChild>
            <Link to="/teacher/my-students">Back to students</Link>
          </Button>
        }
      />
      <section className="mb-6 surface-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-lg font-semibold">Enrolled courses</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {enrollments.map((enrollment: any) => (
            <Badge key={enrollment._id ?? enrollment.courseType} variant="secondary">
              {enrollment.courseType} · {enrollment.status}
            </Badge>
          ))}
          {enrollments.length === 0 && (
            <p className="text-sm text-muted-foreground">No enrollments found.</p>
          )}
        </div>
      </section>
      <section className="mb-6 surface-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-lg font-semibold">Practical credit sheets</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {enrollments.map((enrollment: any) => (
            <article key={`sheet-${enrollment._id ?? enrollment.courseType}`} className="rounded-xl border border-border/70 p-4">
              <p className="font-medium">{enrollment.courseType}</p>
              <p className="mt-1 text-sm text-muted-foreground">Review and approve daily practical entries.</p>
              <Button className="mt-3" size="sm" asChild>
                <Link to={`/teacher/my-students/${studentId}/practical-sheet/${encodeURIComponent(enrollment.courseType)}`}>
                  View practical sheet
                </Link>
              </Button>
            </article>
          ))}
        </div>
        {enrollments.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">No course enrollments to review.</p>
        )}
      </section>
      <section className="surface-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-lg font-semibold">Certificates</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {certificates.map((cert: any) => (
            <article key={cert._id} className="rounded-xl border border-border/70 p-4">
              <p className="font-medium">{certificateTitle(cert)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Issued {formatDate(cert.createdAt)}</p>
              <Button className="mt-3" size="sm" asChild>
                <Link to={`/teacher/certificates/${cert._id}`}>View certificate</Link>
              </Button>
            </article>
          ))}
        </div>
        {certificates.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            {isFetching ? "Loading certificates..." : "This student has not earned a certificate yet."}
          </p>
        )}
      </section>
    </AppPage>
  );
}
