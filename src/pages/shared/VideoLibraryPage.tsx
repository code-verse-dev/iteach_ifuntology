import { FormEvent, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Play, Plus, Trash2 } from "lucide-react";
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
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import {
  useCreateVideoMutation,
  useDeleteVideoMutation,
  useGetAccessibleCourseTypesQuery,
  useGetVideosQuery,
} from "@/redux/services/apiSlices/vidLibrarySlice";
import { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";
import { courseRouteKey, mediaUrl } from "@/utils/mediaUrl";

const PAGE_SIZE = 12;

function VideoCard({
  video,
  isAdmin,
  onDelete,
}: {
  video: any;
  isAdmin: boolean;
  onDelete: (video: any) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [durationLabel, setDurationLabel] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = mediaUrl(video.fileUrl);
  const poster = mediaUrl(video.videoThumbnail);
  const title = video.title?.trim() || `${video.courseType} video`;

  const startPlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    setPlaying(true);
    el.controls = true;
    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => toast.error("Could not start playback."));
    }
  };

  return (
    <article className="surface-card overflow-hidden rounded-2xl border border-border/70">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <video
          ref={videoRef}
          className={cn("h-full w-full bg-black", playing ? "object-contain" : "object-cover")}
          poster={poster || undefined}
          src={src}
          playsInline
          preload="metadata"
          controls={playing}
          title={title}
          onEnded={() => {
            const el = videoRef.current;
            if (el) {
              el.pause();
              el.currentTime = 0;
              el.controls = false;
            }
            setPlaying(false);
          }}
          onLoadedMetadata={() => {
            const el = videoRef.current;
            if (!el || !Number.isFinite(el.duration)) return;
            const total = Math.floor(el.duration);
            setDurationLabel(`${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`);
          }}
        />
        {!playing && (
          <>
            <button
              type="button"
              onClick={startPlayback}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-white hover:bg-black/25"
              aria-label={`Play ${title}`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Play className="h-7 w-7 fill-current pl-0.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide">Play video</span>
            </button>
            {durationLabel && (
              <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-md bg-black/75 px-2 py-0.5 text-[11px] text-white">
                {durationLabel}
              </span>
            )}
          </>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <Badge variant="secondary" className="mt-2">{video.courseType}</Badge>
        </div>
        {isAdmin && (
          <Button size="sm" variant="ghost" onClick={() => onDelete(video)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </article>
  );
}

export default function VideoLibraryPage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const isAdmin = user?.role === "admin";
  const [courseType, setCourseType] = useState("");
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [addCourseType, setAddCourseType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: coursesData } = useGetCoursesQuery();
  const catalog = coursesData?.data ?? [];
  const { data: typesData, isFetching: loadingTypes } = useGetAccessibleCourseTypesQuery();
  const accessibleTypes: string[] = typesData?.data ?? [];
  const chips = isAdmin ? catalog.map((course: any) => courseRouteKey(course)).filter(Boolean) : accessibleTypes;

  useEffect(() => {
    if (isAdmin) return;
    if (!chips.length) {
      setCourseType("");
      return;
    }
    if (!courseType || !chips.includes(courseType)) {
      setCourseType(chips[0]);
      setPage(1);
    }
  }, [chips, courseType, isAdmin]);

  const { data, isFetching } = useGetVideosQuery({
    page,
    limit: PAGE_SIZE,
    courseType: courseType || undefined,
    keyword: isAdmin ? keyword || undefined : undefined,
  });
  const [createVideo, { isLoading: creating }] = useCreateVideoMutation();
  const [deleteVideo, { isLoading: removing }] = useDeleteVideoMutation();
  const list = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1, totalDocs: 0 };

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a video file");
      return;
    }
    try {
      const res: any = await createVideo({
        courseType: addCourseType || catalog[0]?.courseType,
        title,
        video: file,
      }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Video added");
        setOpen(false);
        setTitle("");
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        setPage(1);
      } else {
        toast.error(res?.message || "Could not add video");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not add video");
    }
  };

  const confirmDelete = async () => {
    if (!deleting?._id) return;
    try {
      const res: any = await deleteVideo(deleting._id).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Video deleted");
        setDeleting(null);
      } else {
        toast.error(res?.message || "Could not delete video");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not delete video");
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Learning"
        title="Video library"
        description={
          isAdmin
            ? "Upload instructional clips for each course. Teachers and students only see videos for their assigned courses."
            : "Training videos for the courses assigned to you."
        }
        actions={
          isAdmin ? (
            <Button onClick={() => { setAddCourseType(catalog[0]?.courseType ?? "Funtology"); setOpen(true); }}>
              <Plus className="h-4 w-4" /> Add video
            </Button>
          ) : undefined
        }
      />

      {isAdmin && (
        <form
          className="mb-4 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setKeyword(search.trim());
          }}
        >
          <Input className="max-w-sm" placeholder="Search title or course" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="submit" variant="outline">{isFetching ? "Searching..." : "Search"}</Button>
        </form>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {isAdmin && (
          <Button size="sm" variant={!courseType ? "default" : "outline"} className="rounded-full" onClick={() => { setCourseType(""); setPage(1); }}>
            All courses
          </Button>
        )}
        {chips.map((key: string) => (
          <Button
            key={key}
            size="sm"
            variant={courseType === key ? "default" : "outline"}
            className="rounded-full"
            onClick={() => { setCourseType(key); setPage(1); }}
          >
            {catalog.find((course: any) => courseRouteKey(course) === key)?.title ?? key}
          </Button>
        ))}
      </div>

      {!loadingTypes && !isAdmin && chips.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
          No courses are assigned to you yet, so there are no videos to watch.
        </p>
      )}

      {(isAdmin || chips.length > 0) && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((video: any) => (
              <VideoCard key={video._id} video={video} isAdmin={isAdmin} onDelete={setDeleting} />
            ))}
          </div>
          {list.length === 0 && (
            <p className="rounded-2xl border border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
              {isFetching ? "Loading videos..." : "No videos found for this course."}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>{meta.totalDocs} video{meta.totalDocs === 1 ? "" : "s"}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= (meta.totalPages || 1) || isFetching} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add video</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={submitCreate}>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" />
            </div>
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select value={addCourseType} onValueChange={setAddCourseType}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {catalog.map((course: any) => (
                    <SelectItem key={course._id} value={course.courseType}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Video file</Label>
              <Input ref={fileRef} type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>{creating ? "Uploading..." : "Add video"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(next) => !next && setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete video</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete {deleting?.title || "this video"}? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" disabled={removing} onClick={confirmDelete}>
              {removing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
