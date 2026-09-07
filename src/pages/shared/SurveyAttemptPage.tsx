import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useGetAvailableSurveysQuery,
  useGetSurveyByIdQuery,
  useGetSurveyQuestionsQuery,
  useSubmitSurveyAnswersMutation,
} from "@/redux/services/apiSlices/surveySlice";
import { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";

function surveysHome(role?: string) {
  return role === "teacher" ? "/teacher/surveys" : "/student/surveys";
}

export default function SurveyAttemptPage() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => state.user.userData?.role) as string;
  const home = surveysHome(role);

  const { data: availableData } = useGetAvailableSurveysQuery();
  const listed = (availableData?.data ?? []).find((s: any) => s._id === surveyId);
  const { data: surveyData, isFetching: loadingSurvey } = useGetSurveyByIdQuery(surveyId as string, {
    skip: !surveyId,
  });
  const { data: questionsData, isFetching: loadingQuestions } = useGetSurveyQuestionsQuery(surveyId as string, {
    skip: !surveyId,
  });
  const [submitSurvey, { isLoading }] = useSubmitSurveyAnswersMutation();

  const survey = listed ?? surveyData?.data;
  const questions = useMemo(
    () => [...(questionsData?.data ?? [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
    [questionsData],
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const submit = async () => {
    const missing = questions.filter(
      (q: any) => q.required && !String(answers[q._id] ?? "").trim(),
    );
    if (missing.length > 0) {
      toast.error("Please answer all required questions.");
      return;
    }
    try {
      const res: any = await submitSurvey({
        surveyId: surveyId as string,
        answers: questions.map((q: any) => ({
          question: q._id,
          answer: String(answers[q._id] ?? ""),
        })),
      }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Survey submitted");
        const responseId = res?.data?._id ?? res?.data?.responseId;
        navigate(responseId ? `${home}/response/${responseId}` : home, { replace: true });
      } else {
        toast.error(res?.message || "Could not submit survey");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not submit survey");
    }
  };

  if (listed?.isSubmitted) {
    return (
      <AppPage>
        <PageHeader eyebrow="Survey" title={listed.title ?? "Survey"} description="You have already submitted this survey." />
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to={home}>Back to surveys</Link></Button>
          {listed.responseId && (
            <Button asChild><Link to={`${home}/response/${listed.responseId}`}>View response</Link></Button>
          )}
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow={survey?.type}
        title={survey?.title ?? (loadingSurvey ? "Loading..." : "Survey")}
        description={survey?.description || `${questions.length} questions`}
        actions={
          <Button variant="outline" asChild>
            <Link to={home}>Back to surveys</Link>
          </Button>
        }
      />
      {loadingQuestions && <p className="text-sm text-muted-foreground">Loading questions...</p>}
      <div className="space-y-4">
        {questions.map((question: any, index: number) => (
          <article key={question._id} className="surface-card rounded-2xl border border-border/70 p-5">
            <p className="font-medium">
              {index + 1}. {question.question}
              {question.required && <span className="ml-1 text-destructive">*</span>}
            </p>
            <div className="mt-3">
              {question.type === "yes_no" && (
                <RadioGroup
                  value={answers[question._id] ?? ""}
                  onValueChange={(value) => setAnswers((prev) => ({ ...prev, [question._id]: value }))}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  {["yes", "no"].map((opt) => (
                    <label
                      key={opt}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 capitalize",
                        answers[question._id] === opt ? "border-primary bg-primary/5" : "border-border",
                      )}
                    >
                      <RadioGroupItem value={opt} id={`${question._id}-${opt}`} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
              {question.type === "multiple_choice" && (
                <RadioGroup
                  value={answers[question._id] ?? ""}
                  onValueChange={(value) => setAnswers((prev) => ({ ...prev, [question._id]: value }))}
                  className="grid gap-2"
                >
                  {(question.options ?? []).map((opt: string) => (
                    <label
                      key={opt}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3",
                        answers[question._id] === opt ? "border-primary bg-primary/5" : "border-border",
                      )}
                    >
                      <RadioGroupItem value={opt} id={`${question._id}-${opt}`} />
                      <Label htmlFor={`${question._id}-${opt}`} className="cursor-pointer">{opt}</Label>
                    </label>
                  ))}
                </RadioGroup>
              )}
              {question.type === "rating" && (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [question._id]: String(n) }))}
                      className={cn(
                        "h-10 w-10 rounded-xl border font-semibold",
                        answers[question._id] === String(n)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
              {question.type === "text" && (
                <Input
                  placeholder="Type your answer..."
                  value={answers[question._id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [question._id]: e.target.value }))}
                />
              )}
            </div>
          </article>
        ))}
      </div>
      {questions.length > 0 && (
        <Button className="mt-6" disabled={isLoading} onClick={submit}>
          {isLoading ? "Submitting..." : "Submit survey"}
        </Button>
      )}
    </AppPage>
  );
}
