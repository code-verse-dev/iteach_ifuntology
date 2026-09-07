import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import PdfFlipViewer from "@/components/lms/PdfFlipViewer";
import { useGetLessonByIdQuery } from "@/redux/services/apiSlices/courseSlice";
import { RootState } from "@/redux/store";
import { mediaUrl } from "@/utils/mediaUrl";

async function downloadPdf(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function lessonBackPath(params: {
  role?: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  pathname: string;
}) {
  const { role, courseId, moduleId, lessonId, pathname } = params;
  if (role === "admin" && moduleId && lessonId) {
    return `/admin/module-management/${moduleId}/lesson/${lessonId}`;
  }
  const base = role === "teacher" ? "/teacher/my-courses" : "/student/learning";
  if (pathname.includes("/exams/") && courseId) {
    return `${base}/${encodeURIComponent(courseId)}/exams`;
  }
  if (courseId && moduleId && lessonId) {
    return `${base}/${encodeURIComponent(courseId)}/lesson/${moduleId}/${lessonId}`;
  }
  return base;
}

export default function LessonPdfPage({ mode }: { mode: "wide" | "fullscreen" }) {
  const { lessonId, moduleId, courseId } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = useSelector((state: RootState) => state.user.userData?.role) as string;
  const { data, isFetching } = useGetLessonByIdQuery(lessonId as string, { skip: !lessonId });
  const lesson = data?.data;
  const url = mediaUrl(lesson?.fileUrl);
  const canDownload = lesson?.allowPdfDownload !== false;
  const canPreview = lesson?.allowPdfPreview !== false && !!lesson?.fileUrl;
  const backTo = lessonBackPath({ role, courseId, moduleId, lessonId, pathname });
  const widePath = pathname.replace(/\/fullscreen\/?$/, "");
  const fullscreenPath = widePath.endsWith("/pdf") || widePath.includes("/pdf/")
    ? `${widePath.replace(/\/$/, "")}/fullscreen`
    : `${pathname.replace(/\/$/, "")}/fullscreen`;

  const [viewerHeightCap, setViewerHeightCap] = useState(() =>
    Math.max(520, window.innerHeight - (mode === "fullscreen" ? 56 : 280)),
  );

  useEffect(() => {
    const update = () => {
      setViewerHeightCap(Math.max(520, window.innerHeight - (mode === "fullscreen" ? 56 : 280)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [mode]);

  const viewer = url && canPreview ? (
    <PdfFlipViewer
      fileUrl={url}
      title={lesson?.title}
      onDownload={canDownload ? () => downloadPdf(url, `${lesson?.title ?? "lesson"}.pdf`) : undefined}
      onFullWidth={mode === "wide" ? () => navigate(fullscreenPath) : undefined}
      maxPageWidth={mode === "fullscreen" ? 2400 : 1200}
      viewerHeightCap={viewerHeightCap}
      className={mode === "fullscreen" ? "min-h-0 flex-1" : undefined}
    />
  ) : (
    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
      {isFetching ? "Loading PDF…" : "No PDF is available for this lesson."}
    </p>
  );

  if (mode === "fullscreen") {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5">
          <button
            type="button"
            onClick={() => navigate(widePath || backTo)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit full view
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-medium">
            {lesson?.title ?? "PDF document"}
          </p>
          <span className="w-[88px]" aria-hidden />
        </header>
        <main className="flex min-h-0 w-full flex-1 flex-col">{viewer}</main>
      </div>
    );
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow="PDF"
        title={lesson?.title ?? (isFetching ? "Loading PDF..." : "PDF viewer")}
        description={lesson?.description}
        actions={
          <Button variant="outline" asChild>
            <Link to={backTo}>Back to lesson</Link>
          </Button>
        }
      />
      <article className="overflow-visible rounded-2xl border border-border/70">
        {viewer}
      </article>
    </AppPage>
  );
}
