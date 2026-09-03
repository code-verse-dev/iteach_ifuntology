import { Link, useParams } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetModuleByIdQuery } from "@/redux/services/apiSlices/courseSlice";

export default function LessonDetailPage() {
  const { moduleId, lessonId } = useParams();
  const { data } = useGetModuleByIdQuery(moduleId as string, { skip: !moduleId });
  const lesson = data?.data?.lessons?.find((l: any) => l._id === lessonId);

  return (
    <AppPage>
      <PageHeader
        eyebrow={lesson?.type}
        title={lesson?.title ?? "Lesson"}
        description={lesson?.summary}
        actions={
          <Button variant="outline" asChild>
            <Link to={`/admin/module-management/${moduleId}`}>Back to module</Link>
          </Button>
        }
      />
      <article className="surface-card rounded-2xl border border-border/70 p-6 leading-relaxed">
        <Badge className="mb-4">{lesson?.duration}</Badge>
        <p>
          This is the lesson detail canvas. When the new backend is connected, PDFs, videos, and quizzes
          from module authoring will render here exactly as they do in the current LMS.
        </p>
        <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-secondary p-10 text-center text-sm text-muted-foreground">
          Material preview · {lesson?.type?.toUpperCase()} placeholder
        </div>
      </article>
    </AppPage>
  );
}
