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
import {
  useCreateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useGetQuizByIdQuery,
  useGetQuizQuestionsQuery,
  useUpdateQuizMutation,
  useUpdateQuizQuestionMutation,
} from "@/redux/services/apiSlices/courseSlice";

const EMPTY_Q = {
  question: "",
  type: "multiple_choice" as "multiple_choice" | "true_false",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 10,
};

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const { data: quizData, refetch: refetchQuiz } = useGetQuizByIdQuery(quizId as string, { skip: !quizId });
  const { data: qData, refetch } = useGetQuizQuestionsQuery(quizId as string, { skip: !quizId });
  const quiz = quizData?.data;
  const questions = qData?.data ?? [];
  const [updateQuiz] = useUpdateQuizMutation();
  const [createQuestion] = useCreateQuizQuestionMutation();
  const [updateQuestion] = useUpdateQuizQuestionMutation();
  const [deleteQuestion] = useDeleteQuizQuestionMutation();
  const [editQuizOpen, setEditQuizOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editQ, setEditQ] = useState<any>(null);
  const [deleteQ, setDeleteQ] = useState<any>(null);
  const [quizForm, setQuizForm] = useState({ title: "", description: "", passingScore: 70, kind: "quiz" });
  const [qForm, setQForm] = useState(EMPTY_Q);

  const openEditQuiz = () => {
    setQuizForm({
      title: quiz?.title ?? "",
      description: quiz?.description ?? "",
      passingScore: quiz?.passingScore ?? 70,
      kind: quiz?.kind ?? "quiz",
    });
    setEditQuizOpen(true);
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow={quiz?.kind}
        title={quiz?.title ?? "Quiz"}
        description={quiz?.description || "View, add, and edit questions."}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/admin/quiz-management">All quizzes</Link></Button>
            <Button variant="outline" onClick={openEditQuiz}><Pencil className="h-4 w-4" /> Edit quiz</Button>
            <Button onClick={() => { setQForm(EMPTY_Q); setAddOpen(true); }}>
              <Plus className="h-4 w-4" /> Add question
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        {questions.map((q: any, idx: number) => (
          <article key={q._id} className="surface-card rounded-2xl border border-border/70 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question {idx + 1}</p>
                <h2 className="mt-1 font-semibold">{q.question}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{q.type === "true_false" ? "True / False" : "Multiple choice"}</Badge>
                  <Badge variant="outline">{q.points} pts</Badge>
                </div>
                {q.type === "multiple_choice" && (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {q.options.map((opt: string) => (
                      <li key={opt} className={opt === q.correctAnswer ? "font-medium text-primary" : ""}>
                        {opt === q.correctAnswer ? "✓ " : ""}{opt}
                      </li>
                    ))}
                  </ul>
                )}
                {q.type === "true_false" && (
                  <p className="mt-2 text-sm text-primary">Correct: {q.correctAnswer}</p>
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

      <Dialog open={editQuizOpen} onOpenChange={setEditQuizOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit quiz</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await updateQuiz({ id: quizId as string, ...quizForm, passingScore: Number(quizForm.passingScore) }).unwrap();
              toast.success("Quiz updated");
              setEditQuizOpen(false);
              refetchQuiz();
            }}
          >
            <div className="space-y-1.5"><Label>Title</Label><Input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={quizForm.kind} onValueChange={(v) => setQuizForm({ ...quizForm, kind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Passing score</Label><Input type="number" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })} /></div>
            </div>
            <DialogFooter><Button type="submit">Save quiz</Button></DialogFooter>
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
              const options = qForm.type === "true_false" ? ["true", "false"] : qForm.options.filter(Boolean);
              await createQuestion({
                quizId: quizId as string,
                question: qForm.question,
                type: qForm.type,
                options,
                correctAnswer: qForm.correctAnswer,
                points: Number(qForm.points) || 10,
              }).unwrap();
              toast.success("Question added");
              setAddOpen(false);
              refetch();
              refetchQuiz();
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
                const options = editQ.type === "true_false" ? ["true", "false"] : (editQ.options ?? []).filter(Boolean);
                await updateQuestion({
                  id: editQ._id,
                  question: editQ.question,
                  type: editQ.type,
                  options,
                  correctAnswer: editQ.correctAnswer,
                  points: Number(editQ.points) || 10,
                }).unwrap();
                toast.success("Question updated");
                setEditQ(null);
                refetch();
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
                await deleteQuestion(deleteQ._id).unwrap();
                toast.success("Question deleted");
                setDeleteQ(null);
                refetch();
                refetchQuiz();
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
            <Select value={form.correctAnswer} onValueChange={(v) => setForm({ ...form, correctAnswer: v })}>
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
          <Select value={form.correctAnswer} onValueChange={(v) => setForm({ ...form, correctAnswer: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <DialogFooter><Button type="submit">Save question</Button></DialogFooter>
    </form>
  );
}
