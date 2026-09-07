import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import PdfFlipViewer from "@/components/lms/PdfFlipViewer";
import { formatDuration, mediaUrl, normalizeLessonType } from "@/utils/mediaUrl";

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

export default function LessonMaterial({
  lesson,
  fullWidthTo,
}: {
  lesson?: any;
  fullWidthTo?: string;
}) {
  const navigate = useNavigate();
  if (!lesson) {
    return <p className="text-sm text-muted-foreground">Lesson not found.</p>;
  }

  const type = normalizeLessonType(lesson.type);
  const url = mediaUrl(lesson.fileUrl);
  const canPreview = lesson.allowPdfPreview !== false;
  const canDownload = lesson.allowPdfDownload !== false;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{type || "Lesson"}</Badge>
        {lesson.duration != null && lesson.duration !== "" && (
          <Badge variant="secondary">{formatDuration(lesson.duration)}</Badge>
        )}
      </div>
      {lesson.description && (
        <p className="leading-relaxed text-muted-foreground">{lesson.description}</p>
      )}

      {type === "PDF" && (
        <div className="overflow-visible rounded-2xl border border-border/70">
          {url && canPreview ? (
            <PdfFlipViewer
              key={lesson._id ?? url}
              fileUrl={url}
              title={lesson.title}
              onDownload={canDownload ? () => downloadPdf(url, `${lesson.title ?? "lesson"}.pdf`) : undefined}
              onFullWidth={fullWidthTo ? () => navigate(fullWidthTo) : undefined}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/30 bg-secondary p-10 text-center text-sm text-muted-foreground">
              {url ? "PDF preview is disabled for this lesson." : "No PDF has been uploaded yet."}
            </div>
          )}
        </div>
      )}

      {type === "VIDEO" && (
        url ? (
          <video src={url} controls className="w-full rounded-2xl border border-border/70 bg-black" />
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-secondary p-10 text-center text-sm text-muted-foreground">
            No video has been uploaded yet.
          </div>
        )
      )}

      {!["PDF", "VIDEO"].includes(type) && (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-secondary p-10 text-center text-sm text-muted-foreground">
          {type || "Assessment"} material will be available after quiz integration.
        </div>
      )}
    </div>
  );
}
