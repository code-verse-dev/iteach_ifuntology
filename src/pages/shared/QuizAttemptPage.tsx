import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { quizQuestions, quizzes } from "@/mock/data";
import { RootState } from "@/redux/store";

export default function QuizAttemptPage() {
  const { courseId, quizId } = useParams();
  const user = useSelector((state: RootState) => state.user.userData);
  const quiz = quizzes.find((q) => q._id === quizId);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const back = user?.role === "student" ? `/student/learning/${courseId}` : `/teacher/my-courses/${courseId}`;

  const submit = () => {
    const correct = quizQuestions.filter((q) => answers[q.id] === q.answer).length;
    setScore(Math.round((correct / quizQuestions.length) * 100));
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow={quiz?.kind}
        title={quiz?.title ?? "Assessment"}
        description={`${quiz?.questions} questions · passing score ${quiz?.passingScore}%`}
        actions={
          <Button variant="outline" asChild>
            <Link to={back}>Back</Link>
          </Button>
        }
      />
      <div className="space-y-4">
        {quizQuestions.map((q, idx) => (
          <article key={q.id} className="surface-card rounded-2xl border border-border/70 p-5">
            <p className="font-medium">{idx + 1}. {q.prompt}</p>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, i) => (
                <label key={opt} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${answers[q.id] === i ? "border-primary bg-primary/5" : "border-border"}`}>
                  <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers((p) => ({ ...p, [q.id]: i }))} />
                  {opt}
                </label>
              ))}
            </div>
          </article>
        ))}
        <Button onClick={submit}>Submit</Button>
        {score !== null && (
          <p className="text-sm font-medium text-primary">Score: {score}%. {score >= (quiz?.passingScore ?? 70) ? "Passed" : "Keep practicing."}</p>
        )}
      </div>
    </AppPage>
  );
}
