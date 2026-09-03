import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Award, BookOpen } from "lucide-react";
import AppPage, { PageHeader, StatCard } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { certificates } from "@/mock/data";

export default function StudentDashboard() {
  const user = useSelector((state: RootState) => state.user.userData);

  return (
    <AppPage>
      <PageHeader
        eyebrow="Student"
        title={`Welcome back, ${user?.firstName ?? "learner"}`}
        description="Continue your lifetime pathway. No payments, no store — just courses, modules, and certificates."
        actions={
          <Button asChild>
            <Link to="/student/learning">Go to learning</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Active courses" value={2} icon={BookOpen} hint="Assigned by your teacher" />
        <StatCard label="Certificates" value={certificates.length} icon={Award} hint="Ready to view" />
      </div>
      <section className="mt-8 surface-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-lg font-semibold">Continue</h2>
        <p className="mt-2 text-sm text-muted-foreground">Pick up Literacy in the salon in Funtology, then try the welcome quiz.</p>
        <Button className="mt-4" asChild>
          <Link to="/student/learning/c-fun">Open Funtology</Link>
        </Button>
      </section>
    </AppPage>
  );
}
