import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
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
  useCreateModuleMutation,
  useDeleteModuleMutation,
  useGetCoursesQuery,
  useGetModulesQuery,
  useUpdateModuleMutation,
} from "@/redux/services/apiSlices/courseSlice";
import { courseRouteKey, formatDuration } from "@/utils/mediaUrl";

function apiError(err: any, fallback: string) {
  const message = err?.data?.message;
  if (Array.isArray(message)) return message[0] || fallback;
  return message || fallback;
}

export default function ModuleManagementPage() {
  const [params, setParams] = useSearchParams();
  const { data: coursesData } = useGetCoursesQuery();
  const catalog = coursesData?.data ?? [];
  const courseFilter = params.get("course") ?? catalog[0]?.courseType ?? "";
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetModulesQuery(
    { courseType: courseFilter, page, limit: 5 },
    { skip: !courseFilter },
  );
  const list = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1, totalDocs: 0 };
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [createModule, { isLoading: creating }] = useCreateModuleMutation();
  const [updateModule, { isLoading: updating }] = useUpdateModuleMutation();
  const [deleteModule, { isLoading: removing }] = useDeleteModuleMutation();
  const [form, setForm] = useState({
    courseType: courseFilter,
    title: "",
    description: "",
    duration: "0",
    order: "1",
  });

  const setCourse = (courseType: string) => {
    setParams({ course: courseType });
    setPage(1);
    setForm((current) => ({ ...current, courseType }));
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await createModule({
        courseType: form.courseType || courseFilter,
        title: form.title,
        description: form.description,
        duration: form.duration,
        order: Number(form.order) || 0,
      }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Module created");
        setOpen(false);
        setForm({ courseType: courseFilter, title: "", description: "", duration: "0", order: "1" });
      } else {
        toast.error(res?.message || "Could not create module");
      }
    } catch (err: any) {
      toast.error(apiError(err, "Could not create module"));
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await updateModule({
        id: editing._id,
        title: editing.title,
        description: editing.description,
        duration: editing.duration,
        order: Number(editing.order) || 0,
      }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Module updated");
        setEditing(null);
      } else {
        toast.error(res?.message || "Could not update module");
      }
    } catch (err: any) {
      toast.error(apiError(err, "Could not update module"));
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Authoring"
        title="Module management"
        description="Filter by course type, then create, edit, or open modules and their lessons."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create module</Button>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {catalog.map((course: any) => {
          const key = courseRouteKey(course);
          return (
            <Button
              key={course._id}
              size="sm"
              variant={courseFilter === key ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setCourse(key)}
            >
              {course.title}
            </Button>
          );
        })}
      </div>

      <div className="space-y-4">
        {list.map((mod: any) => (
          <article key={mod._id} className="surface-card rounded-2xl border border-border/70 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {mod.courseType}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{mod.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Order {mod.order} · {formatDuration(mod.duration) || "No duration"} · {mod.lessons?.length ?? 0} lessons
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing({ ...mod })}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(mod)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/admin/module-management/${mod._id}`}>Open module</Link>
                </Button>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {(mod.lessons ?? []).map((lesson: any) => (
                <li key={lesson._id} className="flex items-center justify-between rounded-xl bg-secondary/80 px-4 py-3 text-sm">
                  <span>{lesson.title}</span>
                  <Badge variant="secondary">{lesson.type}</Badge>
                </li>
              ))}
              {(mod.lessons ?? []).length === 0 && (
                <li className="text-sm text-muted-foreground">No lessons yet. Open the module to add one.</li>
              )}
            </ul>
          </article>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {isFetching ? "Loading modules..." : "No modules found for this course."}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {meta.page} of {meta.totalPages || 1} · {meta.totalDocs} modules
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (meta.totalPages || 1) || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create module</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={submitCreate}>
            <div className="space-y-1.5">
              <Label>Course type</Label>
              <Select value={form.courseType || courseFilter} onValueChange={(value) => setForm({ ...form, courseType: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {catalog.map((course: any) => (
                    <SelectItem key={course._id} value={courseRouteKey(course)}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Duration (minutes)</Label><Input type="number" min={0} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Order</Label><Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={creating}>{creating ? "Saving..." : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit module</DialogTitle></DialogHeader>
          {editing && (
            <form className="space-y-3" onSubmit={submitEdit}>
              <div className="space-y-1.5"><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Duration (minutes)</Label><Input type="number" min={0} value={editing.duration ?? 0} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Order</Label><Input type="number" value={editing.order ?? 1} onChange={(e) => setEditing({ ...editing, order: e.target.value })} /></div>
              </div>
              <DialogFooter><Button type="submit" disabled={updating}>{updating ? "Saving..." : "Save changes"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {deleting?.title}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This removes the module and its lessons from the catalog.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              disabled={removing}
              onClick={async () => {
                try {
                  const res: any = await deleteModule(deleting._id).unwrap();
                  if (res?.status) {
                    toast.success(res?.message || "Module deleted");
                    setDeleting(null);
                  } else {
                    toast.error(res?.message || "Could not delete module");
                  }
                } catch (err: any) {
                  toast.error(apiError(err, "Could not delete module"));
                }
              }}
            >
              {removing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
