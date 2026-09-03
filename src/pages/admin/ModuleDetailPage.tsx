import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  useCreateLessonMutation,
  useDeleteLessonMutation,
  useDeleteModuleMutation,
  useGetModuleByIdQuery,
  useUpdateLessonMutation,
  useUpdateModuleMutation,
} from "@/redux/services/apiSlices/courseSlice";

const EMPTY_LESSON = { title: "", summary: "", type: "pdf", duration: "" };

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { data, refetch } = useGetModuleByIdQuery(moduleId as string, { skip: !moduleId });
  const mod = data?.data;
  const [createLesson, { isLoading: creating }] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [removeLesson] = useDeleteLessonMutation();
  const [updateModule] = useUpdateModuleMutation();
  const [deleteModule] = useDeleteModuleMutation();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState<any>(null);
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", duration: "" });

  const openEditModule = () => {
    setModuleForm({
      title: mod?.title ?? "",
      description: mod?.description ?? "",
      duration: mod?.duration ?? "",
    });
    setEditModuleOpen(true);
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Module"
        title={mod?.title ?? "Module"}
        description={mod?.description || "Lesson materials, reading, and media for this unit."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/module-management">All modules</Link>
            </Button>
            <Button variant="outline" onClick={openEditModule}><Pencil className="h-4 w-4" /> Edit module</Button>
            <Button variant="ghost" onClick={() => setDeleteModuleOpen(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
            <Button onClick={() => { setLessonForm(EMPTY_LESSON); setAddOpen(true); }}>
              <Plus className="h-4 w-4" /> Add lesson
            </Button>
          </div>
        }
      />
      <div className="space-y-3">
        {mod?.lessons?.map((lesson: any) => (
          <div key={lesson._id} className="surface-card rounded-2xl border border-border/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Link to={`/admin/module-management/${moduleId}/lesson/${lesson._id}`} className="min-w-0 flex-1">
                <h2 className="font-semibold hover:text-primary">{lesson.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{lesson.summary}</p>
              </Link>
              <div className="flex items-center gap-2">
                <Badge>{lesson.type}</Badge>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(lesson)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(lesson)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
        {mod?.lessons?.length === 0 && (
          <p className="text-sm text-muted-foreground">No lessons yet. Add the first one for this module.</p>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add lesson</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const res: any = await createLesson({ moduleId: moduleId as string, ...lessonForm }).unwrap();
              if (res?.status) {
                toast.success("Lesson added");
                setAddOpen(false);
                refetch();
              }
            }}
          >
            <div className="space-y-1.5"><Label>Title</Label><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Summary</Label><Textarea value={lessonForm.summary} onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={lessonForm.type} onValueChange={(v) => setLessonForm({ ...lessonForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Duration</Label><Input value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} placeholder="10 min" /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={creating}>{creating ? "Saving..." : "Add lesson"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editOpen} onOpenChange={() => setEditOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit lesson</DialogTitle></DialogHeader>
          {editOpen && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await updateLesson({
                  moduleId: moduleId as string,
                  lessonId: editOpen._id,
                  title: editOpen.title,
                  summary: editOpen.summary,
                  type: editOpen.type,
                  duration: editOpen.duration,
                }).unwrap();
                toast.success("Lesson updated");
                setEditOpen(null);
                refetch();
              }}
            >
              <div className="space-y-1.5"><Label>Title</Label><Input value={editOpen.title} onChange={(e) => setEditOpen({ ...editOpen, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Summary</Label><Textarea value={editOpen.summary ?? ""} onChange={(e) => setEditOpen({ ...editOpen, summary: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={editOpen.type} onValueChange={(v) => setEditOpen({ ...editOpen, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter><Button type="submit">Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteOpen} onOpenChange={() => setDeleteOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {deleteOpen?.title}?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                await removeLesson({ moduleId: moduleId as string, lessonId: deleteOpen._id }).unwrap();
                toast.success("Lesson deleted");
                setDeleteOpen(null);
                refetch();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editModuleOpen} onOpenChange={setEditModuleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit module</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await updateModule({ id: moduleId as string, ...moduleForm }).unwrap();
              toast.success("Module updated");
              setEditModuleOpen(false);
              refetch();
            }}
          >
            <div className="space-y-1.5"><Label>Title</Label><Input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Duration</Label><Input value={moduleForm.duration} onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })} /></div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModuleOpen} onOpenChange={setDeleteModuleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete this module?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Lessons inside it will be removed as well.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModuleOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                await deleteModule(moduleId as string).unwrap();
                toast.success("Module deleted");
                navigate("/admin/module-management");
              }}
            >
              Delete module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
