import { useMemo, useState } from "react";
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
import { courses } from "@/mock/data";

const PAGE_SIZE = 5;

export default function ModuleManagementPage() {
  const [params, setParams] = useSearchParams();
  const { data: coursesData } = useGetCoursesQuery();
  const catalog = coursesData?.data ?? courses;
  const courseFilter = params.get("course") ?? catalog[0]?._id ?? "c-fun";
  const { data, refetch } = useGetModulesQuery(courseFilter);
  const list = data?.data ?? [];
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [createModule, { isLoading: creating }] = useCreateModuleMutation();
  const [updateModule, { isLoading: updating }] = useUpdateModuleMutation();
  const [deleteModule] = useDeleteModuleMutation();
  const [form, setForm] = useState({ courseId: courseFilter, title: "", description: "", duration: "", order: "1" });

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const paginated = useMemo(
    () => list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [list, page],
  );

  const setCourse = (courseId: string) => {
    setParams({ course: courseId });
    setPage(1);
    setForm((f) => ({ ...f, courseId }));
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await createModule({
        ...form,
        order: Number(form.order) || 1,
      }).unwrap();
      if (res?.status) {
        toast.success("Module created");
        setOpen(false);
        setForm({ courseId: courseFilter, title: "", description: "", duration: "", order: "1" });
        refetch();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not create module");
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
        order: Number(editing.order) || 1,
      }).unwrap();
      if (res?.status) {
        toast.success("Module updated");
        setEditing(null);
        refetch();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update module");
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
        {catalog.map((c: any) => (
          <Button
            key={c._id}
            size="sm"
            variant={courseFilter === c._id ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setCourse(c._id)}
          >
            {c.title}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {paginated.map((mod: any) => (
          <article key={mod._id} className="surface-card rounded-2xl border border-border/70 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {catalog.find((c: any) => c._id === mod.courseId)?.title}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{mod.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
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
              {mod.lessons.map((lesson: any) => (
                <li key={lesson._id} className="flex items-center justify-between rounded-xl bg-secondary/80 px-4 py-3 text-sm">
                  <span>{lesson.title}</span>
                  <Badge variant="secondary">{lesson.type}</Badge>
                </li>
              ))}
              {mod.lessons.length === 0 && (
                <li className="text-sm text-muted-foreground">No lessons yet. Open the module to add one.</li>
              )}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {list.length} modules
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
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
              <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {catalog.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="20 min" /></div>
              <div className="space-y-1.5"><Label>Order</Label><Input type="number" min={1} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
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
                <div className="space-y-1.5"><Label>Duration</Label><Input value={editing.duration ?? ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></div>
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
              onClick={async () => {
                await deleteModule(deleting._id).unwrap();
                toast.success("Module deleted");
                setDeleting(null);
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
