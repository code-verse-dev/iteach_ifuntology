import { useState } from "react";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useCreateVideoMutation, useGetCoursesQuery, useGetVideosQuery } from "@/redux/services/apiSlices/courseSlice";
import { courses } from "@/mock/data";
import { RootState } from "@/redux/store";

export default function VideoLibraryPage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const isAdmin = user?.role === "admin";
  const { data, refetch } = useGetVideosQuery();
  const { data: coursesData } = useGetCoursesQuery();
  const catalog = coursesData?.data ?? courses;
  const list = data?.data ?? [];
  const [createVideo, { isLoading }] = useCreateVideoMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: "c-fun", duration: "", fileName: "" });

  return (
    <AppPage>
      <PageHeader
        eyebrow="Learning"
        title="Video library"
        description="Shared instructional clips used across classrooms."
        actions={
          isAdmin ? (
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add video</Button>
          ) : undefined
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((video: any) => (
          <article key={video._id} className="surface-card overflow-hidden rounded-2xl border border-border/70">
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
              Play · {video.duration}
            </div>
            <div className="p-4">
              <h2 className="font-semibold">{video.title}</h2>
              <Badge variant="secondary" className="mt-2">
                {catalog.find((c: any) => c._id === video.courseId)?.title}
              </Badge>
              {video.fileName && <p className="mt-2 text-xs text-muted-foreground">{video.fileName}</p>}
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add video</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const res: any = await createVideo(form).unwrap();
              if (res?.status) {
                toast.success("Video added");
                setOpen(false);
                setForm({ title: "", courseId: "c-fun", duration: "", fileName: "" });
                refetch();
              }
            }}
          >
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="space-y-1.5">
              <Label>Course type</Label>
              <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {catalog.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="6:12" /></div>
            <div className="space-y-1.5">
              <Label>Video file</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setForm({ ...form, fileName: e.target.files?.[0]?.name ?? "" })}
              />
            </div>
            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Add video"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
