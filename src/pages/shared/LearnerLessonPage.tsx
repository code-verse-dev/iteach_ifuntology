import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetModuleByIdQuery } from "@/redux/services/apiSlices/courseSlice";
import { RootState } from "@/redux/store";

export default function LearnerLessonPage() {
  const { courseId, moduleId, lessonId } = useParams();
  const user = useSelector((state: RootState) => state.user.userData);
  const role = user?.role as string;
  const { data } = useGetModuleByIdQuery(moduleId as string, { skip: !moduleId });
  const lesson = data?.data?.lessons?.find((l: any) => l._id === lessonId);
  const back = role === "student" ? `/student/learning/${courseId}` : `/teacher/my-courses/${courseId}`;

  return (
    <AppPage>
      <PageHeader
        eyebrow={data?.data?.title}
        title={lesson?.title ?? "Lesson"}
        description={lesson?.summary}
        actions={
          <Button variant="outline" asChild>
            <Link to={back}>Back to course</Link>
          </Button>
        }
      />
      <article className="surface-card rounded-2xl border border-border/70 p-6">
        <Badge>{lesson?.type}</Badge>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Lesson material detail page. PDF viewers, video players, and downloadable worksheets from the current LMS
          will plug in here once the backend is available.
        </p>
        <div className="mt-6 min-h-56 rounded-2xl border border-dashed border-primary/30 bg-secondary p-8 text-center text-sm text-muted-foreground">
          {lesson?.type === "pdf"
            ? "PDF reader placeholder"
            : lesson?.type === "video"
              ? "Video player placeholder"
              : "Quiz placeholder"}
        </div>
      </article>
    </AppPage>
  );
}
