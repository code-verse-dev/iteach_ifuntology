import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/branding/BrandLogo";
import {
  certificateStudentName,
  certificateTitle,
  useGetCertificateByIdQuery,
  useGetMyCertificateByCourseQuery,
} from "@/redux/services/apiSlices/certificateSlice";
import { RootState } from "@/redux/store";
import { formatDate } from "@/lib/utils";

export default function CertificateViewPage() {
  const { certificateId, courseId } = useParams();
  const role = useSelector((state: RootState) => state.user.userData?.role) as string;
  const decodedCourse = decodeURIComponent(courseId ?? "");
  const byId = useGetCertificateByIdQuery(certificateId as string, { skip: !certificateId });
  const byCourse = useGetMyCertificateByCourseQuery(decodedCourse, {
    skip: !decodedCourse || !!certificateId || role !== "student",
  });
  const active = certificateId ? byId : byCourse;
  const cert = active.data?.data;
  const courseType = cert?.course?.courseType ?? cert?.courseType ?? decodedCourse;
  const title = cert ? certificateTitle(cert) : courseType || "Certificate";
  const studentName = cert ? certificateStudentName(cert) : "";
  const issued = cert?.createdAt ? formatDate(cert.createdAt) : "";
  const backTo =
    role === "admin"
      ? "/admin/certificates"
      : role === "teacher"
        ? "/teacher/my-students"
        : "/student/certificates";

  return (
    <AppPage>
      <PageHeader
        eyebrow="Certificate"
        title={title}
        description={active.isFetching ? "Loading certificate..." : undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={backTo}>All certificates</Link>
            </Button>
            {cert && (
              <Button variant="outline" onClick={() => window.print()}>
                Print
              </Button>
            )}
          </div>
        }
      />
      {!active.isFetching && !cert && (
        <p className="rounded-2xl border border-border/70 bg-secondary/50 px-4 py-8 text-center text-sm text-muted-foreground">
          {active.data?.message || "No certificate earned yet. Pass every quiz in this course to receive one."}
        </p>
      )}
      {cert && (
        <div className="surface-card mx-auto max-w-3xl rounded-3xl border border-primary/20 p-10 text-center print:border-primary">
          <BrandLogo size="large" className="justify-center" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Funtology Career & Literacy Foundation
          </p>
          <h2 className="mt-4 text-3xl font-bold">Certificate of Completion</h2>
          <p className="mt-3 text-muted-foreground">This certifies that</p>
          <p className="mt-2 text-2xl font-semibold">{studentName}</p>
          <p className="mt-3 text-muted-foreground">
            has completed the {courseType} pathway in iTeach iFuntology.
          </p>
          {issued && <p className="mt-6 text-sm text-muted-foreground">Issued {issued}</p>}
        </div>
      )}
    </AppPage>
  );
}
