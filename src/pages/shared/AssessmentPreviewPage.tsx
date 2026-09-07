import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetLessonByIdQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetQuizQuestionsQuery } from "@/redux/services/apiSlices/quizSlice";
import { getAssessmentLabel } from "@/constants/quiz";

export default function AssessmentPreviewPage() {
  const { courseId, lessonId } = useParams();
  const courseType = decodeURIComponent(courseId ?? "");
  const { data: lessonData, isFetching } = useGetLessonByIdQuery(lessonId as string, { skip: !lessonId });
  const { data: questionsData } = useGetQuizQuestionsQuery(lessonId as string, { skip: !lessonId });
  const lesson = lessonData?.data;
  const questions = useMemo(
    () => [...(questionsData?.data ?? [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
    [questionsData],
  );
  const label = getAssessmentLabel(lesson?.type);

  return (
    <AppPage>
      <PageHeader
        eyebrow={`${label} preview`}
        title={lesson?.title ?? (isFetching ? "Loading..." : "Assessment")}
        description="Teachers can review questions. Correct answers are hidden, and teachers cannot submit attempts."
        actions={
          <Button variant="outline" asChild>
            <Link to={`/teacher/my-courses/${encodeURIComponent(courseType)}`}>Back to course</Link>
          </Button>
        }
      />
      <div className="space-y-4">
        {questions.map((question: any, index: number) => (
          <article key={question._id} className="surface-card rounded-2xl border border-border/70 p-5">
            <p className="font-medium">{index + 1}. {question.question}</p>
            <Badge variant="secondary" className="mt-2">{question.type?.replace("_", " ")}</Badge>
            {question.type !== "short_answer" && (
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {(question.type === "true_false" ? ["True", "False"] : question.options ?? []).map((option: string) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">{isFetching ? "Loading questions..." : "No questions on this assessment yet."}</p>
        )}
      </div>
    </AppPage>
  );
}
