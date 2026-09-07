import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetLessonByIdQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetQuizQuestionsQuery, useSubmitQuizResponseMutation } from "@/redux/services/apiSlices/quizSlice";
import { getAssessmentLabel } from "@/constants/quiz";

export default function QuizAttemptPage() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const courseType = decodeURIComponent(courseId ?? "");
  const { data: lessonData, isFetching: loadingLesson } = useGetLessonByIdQuery(quizId as string, { skip: !quizId });
  const { data: questionsData, isFetching: loadingQuestions } = useGetQuizQuestionsQuery(quizId as string, { skip: !quizId });
  const [submitQuiz, { isLoading }] = useSubmitQuizResponseMutation();
  const lesson = lessonData?.data;
  const questions = useMemo(
    () => [...(questionsData?.data ?? [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
    [questionsData],
  );
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const label = getAssessmentLabel(lesson?.type);
  const back = `/student/learning/${encodeURIComponent(courseType)}`;

  const submit = async () => {
    const payload = questions.map((question: any) => {
      const value = answers[question._id];
      let answer: string | boolean = "";
      if (question.type === "true_false") {
        answer = value === true || value === "true";
      } else {
        answer = String(value ?? "");
      }
      return { questionId: question._id, answer };
    });
    try {
      const res: any = await submitQuiz({ lessonId: quizId as string, answers: payload }).unwrap();
      if (res?.status) {
        toast.success(res?.message || `${label} submitted`);
        navigate(`/student/learning/response/${res?.data?._id}`, {
          replace: true,
          state: lesson?.type === "QUIZ"
            ? {
                certificateIssued: res?.data?.certificateIssued,
                certificateId: res?.data?.certificateId,
                allQuizzesPassed: res?.data?.allQuizzesPassed,
              }
            : undefined,
        });
      } else {
        toast.error(res?.message || `Could not submit ${label.toLowerCase()}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || `Could not submit ${label.toLowerCase()}`);
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow={label}
        title={lesson?.title ?? (loadingLesson ? "Loading..." : "Assessment")}
        description={`${questions.length} questions`}
        actions={
          <Button variant="outline" asChild>
            <Link to={back}>Back to course</Link>
          </Button>
        }
      />
      {(loadingLesson || loadingQuestions) && <p className="text-sm text-muted-foreground">Loading {label.toLowerCase()}...</p>}
      <div className="space-y-4">
        {questions.map((question: any, index: number) => (
          <article key={question._id} className="surface-card rounded-2xl border border-border/70 p-5">
            <p className="font-medium">{index + 1}. {question.question}</p>
            <div className="mt-3 grid gap-2">
              {question.type === "short_answer" ? (
                <Input
                  value={String(answers[question._id] ?? "")}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [question._id]: e.target.value }))}
                  placeholder="Your answer"
                />
              ) : question.type === "true_false" ? (
                ["true", "false"].map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${String(answers[question._id]) === option ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      name={question._id}
                      checked={String(answers[question._id]) === option}
                      onChange={() => setAnswers((prev) => ({ ...prev, [question._id]: option === "true" }))}
                    />
                    {option === "true" ? "True" : "False"}
                  </label>
                ))
              ) : (
                (question.options ?? []).map((option: string) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${answers[question._id] === option ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      name={question._id}
                      checked={answers[question._id] === option}
                      onChange={() => setAnswers((prev) => ({ ...prev, [question._id]: option }))}
                    />
                    {option}
                  </label>
                ))
              )}
            </div>
          </article>
        ))}
        {questions.length > 0 && (
          <Button onClick={submit} disabled={isLoading}>
            {isLoading ? "Submitting..." : `Submit ${label.toLowerCase()}`}
          </Button>
        )}
      </div>
    </AppPage>
  );
}
