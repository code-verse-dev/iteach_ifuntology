import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatDuration } from "@/utils/mediaUrl";

const EMPTY_LESSON = {
  title: "",
  description: "",
  type: "PDF",
  duration: "0",
  order: "1",
  allowPdfPreview: true,
  allowPdfDownload: true,
  file: undefined as File | undefined,
};

function apiError(err: any, fallback: string) {
  const message = err?.data?.message;
  if (Array.isArray(message)) return message[0] || fallback;
  return message || fallback;
}

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { data, isFetching } = useGetModuleByIdQuery(moduleId as string, { skip: !moduleId });
  const mod = data?.data;
  const [createLesson, { isLoading: creating }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: updatingLesson }] = useUpdateLessonMutation();
  const [removeLesson, { isLoading: deletingLesson }] = useDeleteLessonMutation();
  const [updateModule, { isLoading: updatingModule }] = useUpdateModuleMutation();
  const [deleteModule, { isLoading: deletingModule }] = useDeleteModuleMutation();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState<any>(null);
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", duration: "0", order: "1" });

  const nextOrder = String((mod?.lessons?.reduce((max: number, lesson: any) => Math.max(max, Number(lesson.order) || 0), 0) ?? 0) + 1);

  const openEditModule = () => {
    setModuleForm({
      title: mod?.title ?? "",
      description: mod?.description ?? "",
      duration: String(mod?.duration ?? 0),
      order: String(mod?.order ?? 1),
    });
    setEditModuleOpen(true);
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow={mod?.courseType || "Module"}
        title={mod?.title ?? "Module"}
        description={mod?.description || "Lesson materials, reading, and media for this unit."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/admin/module-management?course=${encodeURIComponent(mod?.courseType ?? "")}`}>All modules</Link>
            </Button>
            <Button variant="outline" onClick={openEditModule}><Pencil className="h-4 w-4" /> Edit module</Button>
            <Button variant="ghost" onClick={() => setDeleteModuleOpen(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
            <Button onClick={() => { setLessonForm({ ...EMPTY_LESSON, order: nextOrder }); setAddOpen(true); }}>
              <Plus className="h-4 w-4" /> Add lesson
            </Button>
          </div>
        }
      />
      <div className="space-y-3">
        {mod?.lessons?.map((lesson: any) => (
          <div key={lesson._id} className="surface-card rounded-2xl border border-border/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Link
                to={["QUIZ", "TEST", "EXAM"].includes(String(lesson.type).toUpperCase())
                  ? `/admin/quiz-management/${lesson._id}`
                  : `/admin/module-management/${moduleId}/lesson/${lesson._id}`}
                className="min-w-0 flex-1"
              >
                <h2 className="font-semibold hover:text-primary">{lesson.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{lesson.description || lesson.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Order {lesson.order} · {formatDuration(lesson.duration) || "No duration"}
                </p>
              </Link>
              <div className="flex items-center gap-2">
                <Badge>{lesson.type}</Badge>
                <Button variant="outline" size="sm" onClick={() => setEditOpen({ ...lesson, file: undefined })}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(lesson)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
        {mod?.lessons?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {isFetching ? "Loading lessons..." : "No lessons yet. Add the first one for this module."}
          </p>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add lesson</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (lessonForm.type === "PDF" && !lessonForm.file) {
                toast.error("Upload a PDF file");
                return;
              }
              if (lessonForm.type === "VIDEO" && !lessonForm.file) {
                toast.error("Upload a video file");
                return;
              }
              try {
                const res: any = await createLesson({
                  moduleId: moduleId as string,
                  title: lessonForm.title,
                  description: lessonForm.description,
                  type: lessonForm.type,
                  duration: lessonForm.duration,
                  order: Number(lessonForm.order) || 0,
                  file: lessonForm.type === "PDF" ? lessonForm.file : undefined,
                  video: lessonForm.type === "VIDEO" ? lessonForm.file : undefined,
                  allowPdfPreview: lessonForm.allowPdfPreview,
                  allowPdfDownload: lessonForm.allowPdfDownload,
                }).unwrap();
                if (res?.status) {
                  toast.success(res?.message || "Lesson added");
                  setAddOpen(false);
                } else {
                  toast.error(res?.message || "Could not add lesson");
                }
              } catch (err: any) {
                toast.error(apiError(err, "Could not add lesson"));
              }
            }}
          >
            <div className="space-y-1.5"><Label>Title</Label><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={lessonForm.type} onValueChange={(value) => setLessonForm({ ...lessonForm, type: value, file: undefined })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Duration (minutes)</Label><Input type="number" min={0} value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Order</Label><Input type="number" min={0} value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })} /></div>
            {lessonForm.type !== "QUIZ" && (
              <div className="space-y-1.5">
                <Label>{lessonForm.type === "VIDEO" ? "Video file" : "PDF file"}</Label>
                <Input
                  type="file"
                  accept={lessonForm.type === "VIDEO" ? "video/*" : "application/pdf"}
                  onChange={(e) => setLessonForm({ ...lessonForm, file: e.target.files?.[0] })}
                />
              </div>
            )}
            {lessonForm.type === "PDF" && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={lessonForm.allowPdfPreview}
                    onCheckedChange={(checked) => setLessonForm({ ...lessonForm, allowPdfPreview: Boolean(checked) })}
                  />
                  Allow preview
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={lessonForm.allowPdfDownload}
                    onCheckedChange={(checked) => setLessonForm({ ...lessonForm, allowPdfDownload: Boolean(checked) })}
                  />
                  Allow download
                </label>
              </div>
            )}
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
                try {
                  const res: any = await updateLesson({
                    lessonId: editOpen._id,
                    title: editOpen.title,
                    description: editOpen.description ?? editOpen.summary,
                    duration: editOpen.duration,
                    order: editOpen.order,
                    file: String(editOpen.type).toUpperCase() === "PDF" ? editOpen.file : undefined,
                    video: String(editOpen.type).toUpperCase() === "VIDEO" ? editOpen.file : undefined,
                    allowPdfPreview: editOpen.allowPdfPreview,
                    allowPdfDownload: editOpen.allowPdfDownload,
                  }).unwrap();
                  if (res?.status) {
                    toast.success(res?.message || "Lesson updated");
                    setEditOpen(null);
                  } else {
                    toast.error(res?.message || "Could not update lesson");
                  }
                } catch (err: any) {
                  toast.error(apiError(err, "Could not update lesson"));
                }
              }}
            >
              <div className="space-y-1.5"><Label>Title</Label><Input value={editOpen.title} onChange={(e) => setEditOpen({ ...editOpen, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={editOpen.description ?? editOpen.summary ?? ""} onChange={(e) => setEditOpen({ ...editOpen, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Duration (minutes)</Label><Input type="number" min={0} value={editOpen.duration ?? 0} onChange={(e) => setEditOpen({ ...editOpen, duration: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Order</Label><Input type="number" min={0} value={editOpen.order ?? 1} onChange={(e) => setEditOpen({ ...editOpen, order: e.target.value })} /></div>
              </div>
              {["PDF", "VIDEO"].includes(String(editOpen.type).toUpperCase()) && (
                <div className="space-y-1.5">
                  <Label>Replace file (optional)</Label>
                  <Input
                    type="file"
                    accept={String(editOpen.type).toUpperCase() === "VIDEO" ? "video/*" : "application/pdf"}
                    onChange={(e) => setEditOpen({ ...editOpen, file: e.target.files?.[0] })}
                  />
                </div>
              )}
              <DialogFooter><Button type="submit" disabled={updatingLesson}>{updatingLesson ? "Saving..." : "Save"}</Button></DialogFooter>
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
              disabled={deletingLesson}
              onClick={async () => {
                try {
                  const res: any = await removeLesson({ lessonId: deleteOpen._id }).unwrap();
                  if (res?.status) {
                    toast.success(res?.message || "Lesson deleted");
                    setDeleteOpen(null);
                  } else {
                    toast.error(res?.message || "Could not delete lesson");
                  }
                } catch (err: any) {
                  toast.error(apiError(err, "Could not delete lesson"));
                }
              }}
            >
              {deletingLesson ? "Deleting..." : "Delete"}
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
              try {
                const res: any = await updateModule({ id: moduleId as string, ...moduleForm }).unwrap();
                if (res?.status) {
                  toast.success(res?.message || "Module updated");
                  setEditModuleOpen(false);
                } else {
                  toast.error(res?.message || "Could not update module");
                }
              } catch (err: any) {
                toast.error(apiError(err, "Could not update module"));
              }
            }}
          >
            <div className="space-y-1.5"><Label>Title</Label><Input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Duration (minutes)</Label><Input type="number" min={0} value={moduleForm.duration} onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Order</Label><Input type="number" min={0} value={moduleForm.order} onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={updatingModule}>{updatingModule ? "Saving..." : "Save"}</Button></DialogFooter>
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
              disabled={deletingModule}
              onClick={async () => {
                try {
                  const res: any = await deleteModule(moduleId as string).unwrap();
                  if (res?.status) {
                    toast.success(res?.message || "Module deleted");
                    navigate("/admin/module-management");
                  } else {
                    toast.error(res?.message || "Could not delete module");
                  }
                } catch (err: any) {
                  toast.error(apiError(err, "Could not delete module"));
                }
              }}
            >
              {deletingModule ? "Deleting..." : "Delete module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
