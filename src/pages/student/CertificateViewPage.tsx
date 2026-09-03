import { Link } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/branding/BrandLogo";

export default function CertificateViewPage() {
  return (
    <AppPage>
      <PageHeader
        eyebrow="Certificate"
        title="Funtology"
        actions={
          <Button variant="outline" asChild>
            <Link to="/student/certificates">All certificates</Link>
          </Button>
        }
      />
      <div className="surface-card mx-auto max-w-3xl rounded-3xl border border-primary/20 p-10 text-center">
        <BrandLogo size="large" className="justify-center" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Funtology Career & Literacy Foundation</p>
        <h2 className="mt-4 text-3xl font-bold">Certificate of Completion</h2>
        <p className="mt-3 text-muted-foreground">This certifies that</p>
        <p className="mt-2 text-2xl font-semibold">Maya Brooks</p>
        <p className="mt-3 text-muted-foreground">has completed the Funtology welcome pathway in iTeach iFuntology.</p>
      </div>
    </AppPage>
  );
}
