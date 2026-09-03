import { Link } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { certificates } from "@/mock/data";
import { formatDate } from "@/lib/utils";

export default function CertificatesPage() {
  return (
    <AppPage>
      <PageHeader
        eyebrow="Recognition"
        title="Certificates"
        description="Completed pathway records from your classroom."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {certificates.map((cert) => (
          <Link key={cert._id} to="/student/learning/c-fun/certificate" className="surface-card rounded-2xl border border-border/70 p-6 hover:border-primary/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Certificate</p>
            <h2 className="mt-2 text-xl font-semibold">{cert.courseTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{cert.studentName} · {formatDate(cert.issuedAt)}</p>
          </Link>
        ))}
      </div>
    </AppPage>
  );
}
