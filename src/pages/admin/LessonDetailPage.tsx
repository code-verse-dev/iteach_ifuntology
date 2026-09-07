import { Link, useParams } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import LessonMaterial from "@/components/lms/LessonMaterial";
import { useGetLessonByIdQuery } from "@/redux/services/apiSlices/courseSlice";

export default function LessonDetailPage() {
  const { moduleId, lessonId } = useParams();
  const { data, isFetching } = useGetLessonByIdQuery(lessonId as string, { skip: !lessonId });
  const lesson = data?.data;

  return (
    <AppPage>
      <PageHeader
        eyebrow={lesson?.type}
        title={lesson?.title ?? "Lesson"}
        description={lesson?.description}
        actions={
          <Button variant="outline" asChild>
            <Link to={`/admin/module-management/${moduleId}`}>Back to module</Link>
          </Button>
        }
      />
      <article className="surface-card rounded-2xl border border-border/70 p-6">
        {isFetching && !lesson ? (
          <p className="text-sm text-muted-foreground">Loading lesson...</p>
        ) : (
          <LessonMaterial
            lesson={lesson}
            fullWidthTo={moduleId && lessonId ? `/admin/module-management/${moduleId}/lesson/${lessonId}/pdf` : undefined}
          />
        )}
      </article>
    </AppPage>
  );
}
