import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, ClipboardList, Plus, Trash2 } from "lucide-react";
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
  useCreateSurveyMutation,
  useDeleteSurveyMutation,
  useGetAvailableSurveysQuery,
  useGetSurveysQuery,
  useToggleSurveyMutation,
} from "@/redux/services/apiSlices/surveySlice";
import { RootState } from "@/redux/store";

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "feedback" as "feedback" | "satisfaction" | "evaluation",
  targetRole: "student" as "student" | "teacher",
  isActive: true,
};

function surveysHome(role?: string) {
  if (role === "admin") return "/admin/surveys-evaluations";
  if (role === "teacher") return "/teacher/surveys";
  return "/student/surveys";
}

export default function SurveysPage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const isAdmin = user?.role === "admin";
  return isAdmin ? <AdminSurveysList /> : <AvailableSurveysList role={user?.role} />;
}

function AvailableSurveysList({ role }: { role?: string }) {
  const home = surveysHome(role);
  const { data, isFetching } = useGetAvailableSurveysQuery();
  const list = data?.data ?? [];

  return (
    <AppPage>
      <PageHeader
        eyebrow="Feedback"
        title="Surveys"
        description="Share feedback once per survey. Submitted answers stay available to review."
      />
      {isFetching && <p className="text-sm text-muted-foreground">Loading surveys...</p>}
      {!isFetching && list.length === 0 && (
        <div className="surface-card rounded-2xl border border-border/70 p-10 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold">No surveys available</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back later for new surveys.</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((survey: any) => {
          const submitted = survey.isSubmitted === true;
          return (
            <article key={survey._id} className="surface-card flex flex-col rounded-2xl border border-border/70 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {submitted ? <CheckCircle2 className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{survey.title}</h2>
                  {survey.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{survey.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {survey.type && <Badge variant="secondary" className="capitalize">{survey.type}</Badge>}
                    <Badge variant={submitted ? "default" : "outline"}>
                      {submitted ? "Submitted" : "Not started"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                {submitted ? (
                  <Button variant="outline" className="w-full" asChild disabled={!survey.responseId}>
                    <Link to={`${home}/response/${survey.responseId}`}>View response</Link>
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link to={`${home}/${survey._id}`}>Take survey</Link>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </AppPage>
  );
}

function AdminSurveysList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isFetching } = useGetSurveysQuery({
    page,
    limit: 12,
    type: typeFilter === "all" ? undefined : typeFilter,
    role: roleFilter === "all" ? undefined : roleFilter,
  });
  const list = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1, totalDocs: 0 };
  const [createSurvey, { isLoading }] = useCreateSurveyMutation();
  const [toggleSurvey] = useToggleSurveyMutation();
  const [deleteSurvey, { isLoading: deleting }] = useDeleteSurveyMutation();

  return (
    <AppPage>
      <PageHeader
        eyebrow="Feedback"
        title="Surveys & evaluations"
        description="Create surveys for teachers and students. Responses are collected once per person."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Create survey
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="satisfaction">Satisfaction</SelectItem>
            <SelectItem value="evaluation">Evaluation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isFetching && <p className="text-sm text-muted-foreground">Loading surveys...</p>}
      {!isFetching && list.length === 0 && (
        <p className="text-sm text-muted-foreground">No surveys match these filters.</p>
      )}

      <div className="space-y-3">
        {list.map((survey: any) => (
          <article key={survey._id} className="surface-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 p-5">
            <div>
              <h2 className="font-semibold">{survey.title}</h2>
              <p className="text-sm text-muted-foreground">{survey.description}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {survey.totalQuestions ?? 0} questions · {survey.totalResponses ?? 0} responses
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {survey.type && <Badge variant="secondary" className="capitalize">{survey.type}</Badge>}
              {survey.targetRole && <Badge variant="outline" className="capitalize">{survey.targetRole}</Badge>}
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <span className="text-xs text-muted-foreground">{survey.isActive ? "Active" : "Inactive"}</span>
                <Switch
                  checked={survey.isActive !== false}
                  onCheckedChange={async () => {
                    try {
                      const res: any = await toggleSurvey(survey._id).unwrap();
                      if (res?.status) toast.success(res?.message || "Survey status updated");
                      else toast.error(res?.message || "Could not update survey");
                    } catch (err: any) {
                      toast.error(err?.data?.message || "Could not update survey");
                    }
                  }}
                />
              </div>
              <Button size="sm" asChild>
                <Link to={`/admin/surveys-evaluations/${survey._id}`}>Manage</Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(survey)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>{meta.totalDocs} surveys</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create survey</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res: any = await createSurvey(form).unwrap();
                if (res?.status) {
                  toast.success(res?.message || "Survey created");
                  setOpen(false);
                  setForm(EMPTY_FORM);
                  if (res?.data?._id) navigate(`/admin/surveys-evaluations/${res.data._id}`);
                } else {
                  toast.error(res?.message || "Could not create survey");
                }
              } catch (err: any) {
                toast.error(err?.data?.message || "Could not create survey");
              }
            }}
          >
            <div className="space-y-1.5">
              <Label>Survey title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Target role</Label>
                <Select value={form.targetRole} onValueChange={(v: any) => setForm({ ...form, targetRole: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Survey type</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="satisfaction">Satisfaction</SelectItem>
                    <SelectItem value="evaluation">Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Visible and accepting responses</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Create survey"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete this survey?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This removes {deleteTarget?.title} along with its questions and responses.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              disabled={deleting}
              onClick={async () => {
                try {
                  const res: any = await deleteSurvey(deleteTarget._id).unwrap();
                  if (res?.status) toast.success(res?.message || "Survey deleted");
                  else toast.error(res?.message || "Could not delete survey");
                  setDeleteTarget(null);
                } catch (err: any) {
                  toast.error(err?.data?.message || "Could not delete survey");
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
