import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import LessonMaterial from "@/components/lms/LessonMaterial";
import { useGetLessonByIdQuery } from "@/redux/services/apiSlices/courseSlice";
import { RootState } from "@/redux/store";

export default function LearnerLessonPage() {
  const { courseId, moduleId, lessonId } = useParams();
  const user = useSelector((state: RootState) => state.user.userData);
  const role = user?.role as string;
  const decodedCourse = decodeURIComponent(courseId ?? "");
  const { data, isFetching } = useGetLessonByIdQuery(lessonId as string, { skip: !lessonId });
  const lesson = data?.data;
  const courseBase = role === "student" ? "/student/learning" : "/teacher/my-courses";
  const back = `${courseBase}/${encodeURIComponent(decodedCourse)}`;
  const pdfPath = courseId && moduleId && lessonId
    ? `${courseBase}/${encodeURIComponent(decodedCourse)}/lesson/${moduleId}/${lessonId}/pdf`
    : undefined;

  return (
    <AppPage>
      <PageHeader
        eyebrow={lesson?.type ?? "Lesson"}
        title={lesson?.title ?? (isFetching ? "Loading lesson..." : "Lesson")}
        description={lesson?.description}
        actions={
          <Button variant="outline" asChild>
            <Link to={back}>Back to course</Link>
          </Button>
        }
      />
      <article className="surface-card rounded-2xl border border-border/70 p-6">
        {isFetching && !lesson ? (
          <p className="text-sm text-muted-foreground">Loading lesson...</p>
        ) : (
          <LessonMaterial lesson={lesson} fullWidthTo={pdfPath} />
        )}
      </article>
    </AppPage>
  );
}
