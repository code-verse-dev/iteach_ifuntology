import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  useCreateSurveyQuestionMutation,
  useDeleteSurveyQuestionMutation,
  useGetSurveyByIdQuery,
  useGetSurveyQuestionsQuery,
  useUpdateSurveyQuestionMutation,
} from "@/redux/services/apiSlices/courseSlice";

const EMPTY_Q = {
  question: "",
  type: "text" as "yes_no" | "multiple_choice" | "rating" | "text",
  options: [] as string[],
  required: true,
  order: 1,
};

const typeLabel = (type: string) =>
  type === "yes_no" ? "Yes / No" : type === "multiple_choice" ? "Multiple choice" : type === "rating" ? "Rating" : "Text";

export default function SurveyDetailPage() {
  const { surveyId } = useParams();
  const { data: surveyData } = useGetSurveyByIdQuery(surveyId as string, { skip: !surveyId });
  const { data: qData, refetch } = useGetSurveyQuestionsQuery(surveyId as string, { skip: !surveyId });
  const survey = surveyData?.data;
  const questions = qData?.data ?? [];
  const [createQuestion] = useCreateSurveyQuestionMutation();
  const [updateQuestion] = useUpdateSurveyQuestionMutation();
  const [deleteQuestion] = useDeleteSurveyQuestionMutation();
  const [addOpen, setAddOpen] = useState(false);
  const [editQ, setEditQ] = useState<any>(null);
  const [deleteQ, setDeleteQ] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_Q);

  const openAdd = () => {
    setForm({ ...EMPTY_Q, order: questions.length + 1 });
    setAddOpen(true);
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow={survey?.type}
        title={survey?.title ?? "Survey"}
        description={survey?.description || "Add and edit survey questions."}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/surveys-evaluations">All surveys</Link>
            </Button>
            <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add question</Button>
          </div>
        }
      />

      <div className="space-y-3">
        {questions.map((q: any) => (
          <article key={q._id} className="surface-card rounded-2xl border border-border/70 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question {q.order}</p>
                <h2 className="mt-1 font-semibold">{q.question}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{typeLabel(q.type)}</Badge>
                  {q.required && <Badge>Required</Badge>}
                </div>
                {(q.options?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.options.map((opt: string) => (
                      <span key={opt} className="rounded-full bg-secondary px-3 py-1 text-xs">{opt}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditQ({
                      ...q,
                      options: [...(q.options ?? [])],
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteQ(q)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </article>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">No questions yet. Add the first one.</p>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add question</DialogTitle></DialogHeader>
          <SurveyQuestionForm
            form={form}
            setForm={setForm}
            onSubmit={async () => {
              await createQuestion({
                surveyId: surveyId as string,
                question: form.question,
                type: form.type,
                options: form.type === "multiple_choice" ? form.options.filter(Boolean) : form.type === "yes_no" ? ["Yes", "No"] : [],
                required: form.required,
                order: Number(form.order) || questions.length + 1,
              }).unwrap();
              toast.success("Question added");
              setAddOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editQ} onOpenChange={() => setEditQ(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit question</DialogTitle></DialogHeader>
          {editQ && (
            <SurveyQuestionForm
              form={editQ}
              setForm={setEditQ}
              onSubmit={async () => {
                await updateQuestion({
                  id: editQ._id,
                  question: editQ.question,
                  type: editQ.type,
                  options: editQ.type === "multiple_choice" ? (editQ.options ?? []).filter(Boolean) : editQ.type === "yes_no" ? ["Yes", "No"] : [],
                  required: editQ.required,
                  order: Number(editQ.order) || 1,
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

function SurveyQuestionForm({
  form,
  setForm,
  onSubmit,
}: {
  form: any;
  setForm: (v: any) => void;
  onSubmit: () => Promise<void>;
}) {
  const [optionInput, setOptionInput] = useState("");
  const addOption = () => {
    const value = optionInput.trim();
    if (!value || (form.options ?? []).includes(value)) return;
    setForm({ ...form, options: [...(form.options ?? []), value] });
    setOptionInput("");
  };

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (form.type === "multiple_choice" && (form.options ?? []).filter(Boolean).length < 2) {
          toast.error("Add at least two options");
          return;
        }
        await onSubmit();
      }}
    >
      <div className="space-y-1.5">
        <Label>Question</Label>
        <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, options: [] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="multiple_choice">Multiple choice</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="yes_no">Yes / No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Order</Label>
          <Input type="number" min={1} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
        </div>
      </div>
      {form.type === "multiple_choice" && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="flex gap-2">
            <Input
              value={optionInput}
              placeholder="Type an option and press Add"
              onChange={(e) => setOptionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addOption}>Add</Button>
          </div>
          {(form.options ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {form.options.map((opt: string) => (
                <span key={opt} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
                  {opt}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setForm({ ...form, options: form.options.filter((o: string) => o !== opt) })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
        <div>
          <p className="text-sm font-medium">Required</p>
          <p className="text-xs text-muted-foreground">Respondents must answer this question</p>
        </div>
        <Switch checked={Boolean(form.required)} onCheckedChange={(v) => setForm({ ...form, required: v })} />
      </div>
      <DialogFooter>
        <Button type="submit">Save question</Button>
      </DialogFooter>
    </form>
  );
}
