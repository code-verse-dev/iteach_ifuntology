import { Link, useLocation, useParams } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetResponseByIdQuery } from "@/redux/services/apiSlices/quizSlice";
import { getAssessmentLabel, QUIZ_PASS_THRESHOLD } from "@/constants/quiz";

export default function QuizResponsePage() {
  const { responseId } = useParams();
  const location = useLocation() as { state?: { certificateIssued?: boolean; certificateId?: string; allQuizzesPassed?: boolean } };
  const { data, isFetching } = useGetResponseByIdQuery(responseId as string, { skip: !responseId });
  const response = data?.data;
  const lesson = response?.lesson;
  const courseType = lesson?.courseType;
  const label = getAssessmentLabel(lesson?.type);
  const passed = (response?.percentage ?? 0) >= QUIZ_PASS_THRESHOLD;

  return (
    <AppPage>
      <PageHeader
        eyebrow={label}
        title={lesson?.title ?? "Result"}
        description={isFetching ? "Loading result..." : `${Math.round(response?.percentage ?? 0)}% · ${response?.score ?? 0} / ${response?.totalPoints ?? 0} points`}
        actions={
          <Button variant="outline" asChild>
            <Link to={courseType ? `/student/learning/${encodeURIComponent(courseType)}` : "/student/learning"}>
              Back to learning
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={passed ? "default" : "secondary"}>{passed ? "Passed" : "Keep practicing"}</Badge>
        <span className="text-sm text-muted-foreground">Pass mark {QUIZ_PASS_THRESHOLD}%</span>
      </div>
      {(location.state?.certificateIssued || location.state?.allQuizzesPassed) && lesson?.type === "QUIZ" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>
            {location.state?.certificateIssued
              ? "You earned a certificate by passing every quiz in this course."
              : "You have now passed every quiz in this course."}
          </span>
          {location.state?.certificateId && (
            <Button size="sm" asChild>
              <Link to={`/student/certificates/${location.state.certificateId}`}>View certificate</Link>
            </Button>
          )}
        </div>
      )}
      <div className="space-y-3">
        {(response?.answers ?? []).map((item: any, index: number) => (
          <article key={index} className="surface-card rounded-2xl border border-border/70 p-5">
            <p className="font-medium">{index + 1}. {item.question?.question ?? "Question"}</p>
            <p className="mt-2 text-sm">Your answer: {String(item.answer ?? "—")}</p>
            <p className={`mt-1 text-sm ${item.correct ? "text-emerald-600" : "text-rose-500"}`}>
              {item.correct ? "Correct" : `Correct answer: ${String(item.question?.correctAnswer ?? "—")}`}
            </p>
          </article>
        ))}
      </div>
    </AppPage>
  );
}
