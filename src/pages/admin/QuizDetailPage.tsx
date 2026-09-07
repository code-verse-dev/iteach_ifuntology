import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLessonByIdQuery, useUpdateLessonMutation } from "@/redux/services/apiSlices/courseSlice";
import {
  useCreateQuizQuestionsMutation,
  useDeleteQuizQuestionMutation,
  useGetQuizQuestionsQuery,
  useGetQuizResponsesQuery,
  useUpdateQuizQuestionMutation,
} from "@/redux/services/apiSlices/quizSlice";

const EMPTY_Q = {
  question: "",
  type: "multiple_choice" as "multiple_choice" | "true_false" | "short_answer",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 10,
};

function apiError(err: any, fallback: string) {
  const message = err?.data?.message;
  if (Array.isArray(message)) return message[0] || fallback;
  return message || fallback;
}

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const { data: quizData } = useGetLessonByIdQuery(quizId as string, { skip: !quizId });
  const { data: qData } = useGetQuizQuestionsQuery(quizId as string, { skip: !quizId });
  const { data: responsesData } = useGetQuizResponsesQuery({ lessonId: quizId as string }, { skip: !quizId });
  const quiz = quizData?.data;
  const questions = qData?.data ?? [];
  const responses = responsesData?.data?.data ?? responsesData?.data?.docs ?? [];
  const [updateLesson] = useUpdateLessonMutation();
  const [createQuestions] = useCreateQuizQuestionsMutation();
  const [updateQuestion] = useUpdateQuizQuestionMutation();
  const [deleteQuestion] = useDeleteQuizQuestionMutation();
  const [tab, setTab] = useState<"questions" | "responses">("questions");
  const [editQuizOpen, setEditQuizOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editQ, setEditQ] = useState<any>(null);
  const [deleteQ, setDeleteQ] = useState<any>(null);
  const [quizForm, setQuizForm] = useState({ title: "", description: "" });
  const [qForm, setQForm] = useState(EMPTY_Q);

  return (
    <AppPage>
      <PageHeader
        eyebrow={quiz?.type}
        title={quiz?.title ?? "Assessment"}
        description={quiz?.description || "View, add, and edit questions. Review student attempts."}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/admin/quiz-management">All assessments</Link></Button>
            <Button variant="outline" onClick={() => { setQuizForm({ title: quiz?.title ?? "", description: quiz?.description ?? "" }); setEditQuizOpen(true); }}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button onClick={() => { setQForm(EMPTY_Q); setAddOpen(true); }}>
              <Plus className="h-4 w-4" /> Add question
            </Button>
          </div>
        }
      />
      <div className="mb-5 flex gap-2">
        <Button size="sm" variant={tab === "questions" ? "default" : "outline"} onClick={() => setTab("questions")}>Questions</Button>
        <Button size="sm" variant={tab === "responses" ? "default" : "outline"} onClick={() => setTab("responses")}>Responses</Button>
      </div>

      {tab === "questions" && (
        <div className="space-y-3">
          {questions.map((q: any, idx: number) => (
            <article key={q._id} className="surface-card rounded-2xl border border-border/70 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question {idx + 1}</p>
                  <h2 className="mt-1 font-semibold">{q.question}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{q.type?.replace("_", " ")}</Badge>
                    <Badge variant="outline">{q.points} pts</Badge>
                  </div>
                  {q.type === "multiple_choice" && (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {(q.options ?? []).map((opt: string) => (
                        <li key={opt} className={opt === q.correctAnswer ? "font-medium text-primary" : ""}>
                          {opt === q.correctAnswer ? "✓ " : ""}{opt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.type !== "multiple_choice" && (
                    <p className="mt-2 text-sm text-primary">Correct: {String(q.correctAnswer)}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditQ({ ...q, options: q.options?.length ? q.options : ["", "", "", ""] })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteQ(q)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {questions.length === 0 && <p className="text-sm text-muted-foreground">No questions yet.</p>}
        </div>
      )}

      {tab === "responses" && (
        <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
          <table className="w-full text-sm">
            <thead className="bg-secondary/80 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((item: any) => (
                <tr key={item._id} className="border-t border-border/70">
                  <td className="px-4 py-4">{item.user ? `${item.user.firstName ?? ""} ${item.user.lastName ?? ""}`.trim() : "—"}</td>
                  <td className="px-4 py-4">{item.score} / {item.totalPoints}</td>
                  <td className="px-4 py-4">{Math.round(item.percentage ?? 0)}%</td>
                </tr>
              ))}
              {responses.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">No attempts yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={editQuizOpen} onOpenChange={setEditQuizOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit assessment</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res: any = await updateLesson({ lessonId: quizId as string, title: quizForm.title, description: quizForm.description }).unwrap();
                if (res?.status) {
                  toast.success(res?.message || "Updated");
                  setEditQuizOpen(false);
                } else toast.error(res?.message || "Could not update");
              } catch (err: any) {
                toast.error(apiError(err, "Could not update"));
              }
            }}
          >
            <div className="space-y-1.5"><Label>Title</Label><Input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} /></div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add question</DialogTitle></DialogHeader>
          <QuestionForm
            form={qForm}
            setForm={setQForm}
            onSubmit={async () => {
              const options = qForm.type === "true_false" ? ["true", "false"] : qForm.type === "short_answer" ? [] : qForm.options.filter(Boolean);
              const correctAnswer = qForm.type === "true_false" ? qForm.correctAnswer === "true" || qForm.correctAnswer === true : qForm.correctAnswer;
              try {
                const res: any = await createQuestions({
                  lesson: quizId as string,
                  questions: [{
                    question: qForm.question,
                    type: qForm.type,
                    options,
                    correctAnswer,
                    points: Number(qForm.points) || 10,
                    order: questions.length + 1,
                  }],
                }).unwrap();
                if (res?.status) {
                  toast.success(res?.message || "Question added");
                  setAddOpen(false);
                } else toast.error(res?.message || "Could not add question");
              } catch (err: any) {
                toast.error(apiError(err, "Could not add question"));
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editQ} onOpenChange={() => setEditQ(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit question</DialogTitle></DialogHeader>
          {editQ && (
            <QuestionForm
              form={editQ}
              setForm={setEditQ}
              onSubmit={async () => {
                const options = editQ.type === "true_false" ? ["true", "false"] : editQ.type === "short_answer" ? [] : (editQ.options ?? []).filter(Boolean);
                const correctAnswer = editQ.type === "true_false" ? editQ.correctAnswer === "true" || editQ.correctAnswer === true : editQ.correctAnswer;
                try {
                  const res: any = await updateQuestion({
                    id: editQ._id,
                    question: editQ.question,
                    type: editQ.type,
                    options,
                    correctAnswer,
                    points: Number(editQ.points) || 10,
                    order: editQ.order,
                  }).unwrap();
                  if (res?.status) {
                    toast.success(res?.message || "Question updated");
                    setEditQ(null);
                  } else toast.error(res?.message || "Could not update");
                } catch (err: any) {
                  toast.error(apiError(err, "Could not update"));
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteQ} onOpenChange={() => setDeleteQ(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete this question?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQ(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                try {
                  await deleteQuestion(deleteQ._id).unwrap();
                  toast.success("Question deleted");
                  setDeleteQ(null);
                } catch (err: any) {
                  toast.error(apiError(err, "Could not delete"));
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}

function QuestionForm({
  form,
  setForm,
  onSubmit,
}: {
  form: any;
  setForm: (v: any) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit();
      }}
    >
      <div className="space-y-1.5"><Label>Question</Label><Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, correctAnswer: v === "true_false" ? "true" : form.correctAnswer })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple choice</SelectItem>
              <SelectItem value="true_false">True / False</SelectItem>
              <SelectItem value="short_answer">Short answer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Points</Label><Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} /></div>
      </div>
      {form.type === "multiple_choice" && (
        <div className="space-y-2">
          <Label>Options</Label>
          {(form.options ?? ["", "", "", ""]).slice(0, 4).map((opt: string, i: number) => (
            <Input
              key={i}
              value={opt}
              placeholder={`Option ${i + 1}`}
              onChange={(e) => {
                const options = [...(form.options ?? ["", "", "", ""])];
                options[i] = e.target.value;
                setForm({ ...form, options });
              }}
            />
          ))}
          <div className="space-y-1.5">
            <Label>Correct answer</Label>
            <Select value={String(form.correctAnswer ?? "")} onValueChange={(v) => setForm({ ...form, correctAnswer: v })}>
              <SelectTrigger><SelectValue placeholder="Select correct option" /></SelectTrigger>
              <SelectContent>
                {(form.options ?? []).filter(Boolean).map((opt: string) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      {form.type === "true_false" && (
        <div className="space-y-1.5">
          <Label>Correct answer</Label>
          <Select value={String(form.correctAnswer)} onValueChange={(v) => setForm({ ...form, correctAnswer: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {form.type === "short_answer" && (
        <div className="space-y-1.5">
          <Label>Correct answer</Label>
          <Input value={String(form.correctAnswer ?? "")} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
        </div>
      )}
      <DialogFooter><Button type="submit">Save question</Button></DialogFooter>
    </form>
  );
}
