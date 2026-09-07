import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useCreateSurveyQuestionsMutation,
  useDeleteSurveyQuestionMutation,
  useGetQuestionStatsQuery,
  useGetSurveyByIdQuery,
  useGetSurveyQuestionsQuery,
  useGetSurveyResponsesQuery,
  useGetSurveyStatsQuery,
  useToggleSurveyMutation,
  useUpdateSurveyQuestionMutation,
} from "@/redux/services/apiSlices/surveySlice";
import { formatDate } from "@/lib/utils";

const EMPTY_Q = {
  question: "",
  type: "text" as "yes_no" | "multiple_choice" | "rating" | "text",
  options: [] as string[],
  required: true,
  order: 1,
};

const typeLabel = (type: string) =>
  type === "yes_no" ? "Yes / No" : type === "multiple_choice" ? "Multiple choice" : type === "rating" ? "Rating" : "Text";

const questionOptions = (type: string, options: string[] = []) => {
  if (type === "yes_no") return ["yes", "no"];
  if (type === "multiple_choice") return options.filter(Boolean);
  return [];
};

const personName = (user?: any) => {
  if (!user) return "Unknown";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "Unknown";
};

export default function SurveyDetailPage() {
  const { surveyId } = useParams();
  const { data: surveyData } = useGetSurveyByIdQuery(surveyId as string, { skip: !surveyId });
  const { data: qData, refetch } = useGetSurveyQuestionsQuery(surveyId as string, { skip: !surveyId });
  const survey = surveyData?.data;
  const questions = qData?.data ?? [];
  const [createQuestions] = useCreateSurveyQuestionsMutation();
  const [updateQuestion] = useUpdateSurveyQuestionMutation();
  const [deleteQuestion] = useDeleteSurveyQuestionMutation();
  const [toggleSurvey] = useToggleSurveyMutation();
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
        description={survey?.description || "Add questions and review responses."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/surveys-evaluations">All surveys</Link>
            </Button>
            {survey && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const res: any = await toggleSurvey(survey._id).unwrap();
                    if (res?.status) toast.success(res?.message || "Survey status updated");
                    else toast.error(res?.message || "Could not update survey");
                  } catch (err: any) {
                    toast.error(err?.data?.message || "Could not update survey");
                  }
                }}
              >
                {survey.isActive === false ? "Activate" : "Deactivate"}
              </Button>
            )}
            <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add question</Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {survey?.targetRole && <Badge variant="outline" className="capitalize">{survey.targetRole}</Badge>}
        <Badge variant={survey?.isActive === false ? "secondary" : "default"}>
          {survey?.isActive === false ? "Inactive" : "Active"}
        </Badge>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="mt-5 space-y-3">
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
                        <span key={opt} className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{opt}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditQ({ ...q, options: [...(q.options ?? [])] })}
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
        </TabsContent>
        <TabsContent value="responses" className="mt-5">
          <SurveyResponsesTab surveyId={surveyId as string} />
        </TabsContent>
        <TabsContent value="stats" className="mt-5">
          <SurveyStatsTab surveyId={surveyId as string} />
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add question</DialogTitle></DialogHeader>
          <SurveyQuestionForm
            form={form}
            setForm={setForm}
            onSubmit={async () => {
              const res: any = await createQuestions({
                surveyId: surveyId as string,
                questions: [{
                  question: form.question,
                  type: form.type,
                  options: questionOptions(form.type, form.options),
                  required: form.required,
                  order: Number(form.order) || questions.length + 1,
                }],
              }).unwrap();
              if (!res?.status) {
                toast.error(res?.message || "Could not add question");
                return;
              }
              toast.success(res?.message || "Question added");
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
                const res: any = await updateQuestion({
                  id: editQ._id,
                  question: editQ.question,
                  type: editQ.type,
                  options: questionOptions(editQ.type, editQ.options),
                  required: editQ.required,
                  order: Number(editQ.order) || 1,
                }).unwrap();
                if (!res?.status) {
                  toast.error(res?.message || "Could not update question");
                  return;
                }
                toast.success(res?.message || "Question updated");
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
                const res: any = await deleteQuestion(deleteQ._id).unwrap();
                if (res?.status) toast.success(res?.message || "Question deleted");
                else toast.error(res?.message || "Could not delete question");
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

function SurveyResponsesTab({ surveyId }: { surveyId: string }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const { data, isFetching } = useGetSurveyResponsesQuery(
    { surveyId, page, limit: 10 },
    { skip: !surveyId },
  );
  const payload = data?.data ?? {};
  const responses = payload.responses ?? payload.docs ?? [];
  const totalPages = payload.totalPages ?? 1;
  const totalDocs = payload.totalDocs ?? payload.total ?? 0;

  return (
    <>
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Respondent</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Answers</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {isFetching && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading responses...</td></tr>
            )}
            {!isFetching && responses.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No responses yet.</td></tr>
            )}
            {responses.map((response: any) => (
              <tr key={response._id} className="border-t border-border/60">
                <td className="px-4 py-3 font-medium">{personName(response.user)}</td>
                <td className="px-4 py-3 text-muted-foreground">{response.user?.email ?? "—"}</td>
                <td className="px-4 py-3">{response.answers?.length ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(response.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelected(response)}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{totalDocs} responses</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Response from {personName(selected?.user)}</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {(selected?.answers ?? []).map((item: any, idx: number) => {
              const question = item.question;
              const text = typeof question === "string" ? question : question?.question;
              return (
                <div key={item._id ?? idx} className="rounded-xl bg-secondary px-4 py-3">
                  <p className="text-xs text-muted-foreground">Question {idx + 1}</p>
                  <p className="mt-1 text-sm font-medium">{text}</p>
                  <p className="mt-1 text-sm capitalize text-primary">{String(item.answer ?? "—")}</p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SurveyStatsTab({ surveyId }: { surveyId: string }) {
  const { data: statsData, isFetching: loadingStats } = useGetSurveyStatsQuery(surveyId, { skip: !surveyId });
  const { data: questionData, isFetching: loadingQuestions } = useGetQuestionStatsQuery(surveyId, { skip: !surveyId });
  const stats = statsData?.data;
  const questionStats = Array.isArray(questionData?.data) ? questionData.data : [];
  const avg = stats?.averageRating != null ? Number(stats.averageRating).toFixed(1) : "—";

  return (
    <div className="space-y-4">
      {loadingStats ? (
        <p className="text-sm text-muted-foreground">Loading stats...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatBox label="Responses" value={stats?.totalResponses ?? 0} />
          <StatBox label="Questions" value={stats?.totalQuestions ?? 0} />
          <StatBox label="Average rating" value={avg === "—" ? avg : `${avg} / 5`} />
        </div>
      )}
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Responses</th>
              <th className="px-4 py-3 font-medium">Avg rating</th>
            </tr>
          </thead>
          <tbody>
            {loadingQuestions && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading breakdown...</td></tr>
            )}
            {!loadingQuestions && questionStats.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No question stats yet.</td></tr>
            )}
            {questionStats.map((row: any) => (
              <tr key={row._id} className="border-t border-border/60">
                <td className="px-4 py-3">{row.question}</td>
                <td className="px-4 py-3 capitalize">{typeLabel(row.type)}</td>
                <td className="px-4 py-3">{row.totalResponses ?? 0}</td>
                <td className="px-4 py-3">{row.avgRating != null ? Number(row.avgRating).toFixed(1) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface-card rounded-2xl border border-border/70 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
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
