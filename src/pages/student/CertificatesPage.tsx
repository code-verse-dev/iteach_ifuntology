import { Link } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { certificateTitle, useGetMyCertificatesQuery } from "@/redux/services/apiSlices/certificateSlice";
import { formatDate } from "@/lib/utils";

export default function CertificatesPage() {
  const { data, isFetching } = useGetMyCertificatesQuery();
  const certificates = data?.data ?? [];

  return (
    <AppPage>
      <PageHeader
        eyebrow="Recognition"
        title="Certificates"
        description="Records issued after you pass every quiz in a course."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {certificates.map((cert: any) => (
          <Link
            key={cert._id}
            to={`/student/certificates/${cert._id}`}
            className="surface-card rounded-2xl border border-border/70 p-6 hover:border-primary/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Certificate</p>
            <h2 className="mt-2 text-xl font-semibold">{certificateTitle(cert)}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {cert.course?.courseType ?? cert.courseType ?? "Course"} · {formatDate(cert.createdAt)}
            </p>
          </Link>
        ))}
      </div>
      {certificates.length === 0 && (
        <p className="rounded-2xl border border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
          {isFetching ? "Loading certificates..." : "No certificates yet. Pass every quiz in a course to earn one."}
        </p>
      )}
    </AppPage>
  );
}
