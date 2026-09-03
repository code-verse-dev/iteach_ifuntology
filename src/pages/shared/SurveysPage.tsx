import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
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
import { useCreateSurveyMutation, useGetSurveysQuery } from "@/redux/services/apiSlices/courseSlice";
import { RootState } from "@/redux/store";

export default function SurveysPage() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.userData);
  const isAdmin = user?.role === "admin";
  const { data, refetch } = useGetSurveysQuery();
  const list = data?.data ?? [];
  const [createSurvey, { isLoading }] = useCreateSurveyMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "feedback" as "feedback" | "satisfaction" | "evaluation",
    targetRole: "student" as "student" | "teacher",
    isActive: true,
  });

  return (
    <AppPage>
      <PageHeader
        eyebrow="Feedback"
        title="Surveys & evaluations"
        description="Create and manage surveys for teachers and students."
        actions={
          isAdmin ? (
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create survey</Button>
          ) : undefined
        }
      />
      <div className="space-y-3">
        {list.map((survey: any) => (
          <article key={survey._id} className="surface-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 p-5">
            <div>
              <h2 className="font-semibold">{survey.title}</h2>
              <p className="text-sm text-muted-foreground">{survey.description}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {survey.questions} questions · {survey.responses} responses
              </p>
            </div>
            <div className="flex items-center gap-2">
              {survey.type && <Badge variant="secondary">{survey.type}</Badge>}
              {survey.targetRole && <Badge variant="outline">{survey.targetRole}</Badge>}
              <Badge variant={survey.isActive === false ? "secondary" : "default"}>
                {survey.isActive === false ? "Inactive" : "Active"}
              </Badge>
              {isAdmin && (
                <Button size="sm" asChild>
                  <Link to={`/admin/surveys-evaluations/${survey._id}`}>Questions</Link>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create survey</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const res: any = await createSurvey(form).unwrap();
              if (res?.status) {
                toast.success("Survey created");
                setOpen(false);
                setForm({ title: "", description: "", type: "feedback", targetRole: "student", isActive: true });
                refetch();
                if (res?.data?._id) navigate(`/admin/surveys-evaluations/${res.data._id}`);
              }
            }}
          >
            <div className="space-y-1.5"><Label>Survey title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
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
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Visible and accepting responses</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Create survey"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
