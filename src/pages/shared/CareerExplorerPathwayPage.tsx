import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Compass, Download, Eye, FileText, Route } from "lucide-react";
import AppPage from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetCourseByIdQuery } from "@/redux/services/apiSlices/courseSlice";
import {
  CAREER_EXPLORER_LEVELS,
  CAREER_EXPLORER_WEEKS,
  getCoursePdfName,
  getLevelGuidePdfUrl,
  getPdfFilename,
  getWeekPathwayPdfUrl,
} from "@/constants/careerExplorerPathway";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";

async function downloadExternalPdf(url: string, filename: string) {
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

function PdfActionButtons({
  url,
  label,
  onPreview,
}: {
  url: string;
  label: string;
  onPreview: (url: string, label: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => onPreview(url, label)}>
        <Eye className="h-3.5 w-3.5" />
        Preview
      </Button>
      <Button type="button" size="sm" onClick={() => void downloadExternalPdf(url, getPdfFilename(url))}>
        <Download className="h-3.5 w-3.5" />
        Download
      </Button>
    </div>
  );
}

export default function CareerExplorerPathwayPage() {
  const { courseId } = useParams();
  const user = useSelector((state: RootState) => state.user.userData);
  const role = user?.role as string;
  const decodedCourse = decodeURIComponent(courseId ?? "");
  const courseBase = role === "student" ? "/student/learning" : "/teacher/my-courses";
  const { data: courseData } = useGetCourseByIdQuery(decodedCourse, { skip: !decodedCourse });
  const course = courseData?.data;
  const courseKey = course?.courseType ?? course?.slug ?? decodedCourse;
  const coursePdfName = getCoursePdfName(courseKey);
  const courseTitle = course?.title ?? coursePdfName;
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);

  return (
    <AppPage>
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to={`${courseBase}/${encodeURIComponent(courseKey)}`}>Back to {courseTitle}</Link>
        </Button>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {courseTitle} · Resources
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Career Explorer Pathway</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Explore curriculum pathways by skill level. Each level includes a guide plus shared weekly
          curriculum pathways for {coursePdfName}.
        </p>
      </div>

      <Card className="overflow-hidden rounded-3xl border border-border/70">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-xl font-bold">Pathway Hierarchy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a level to view its guide PDF and curriculum pathway options.
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <Accordion type="single" collapsible className="space-y-3">
            {CAREER_EXPLORER_LEVELS.map((level) => {
              const levelPdfUrl = getLevelGuidePdfUrl(courseKey, level.pdfSuffix);
              const levelPdfLabel = `${coursePdfName} ${level.subtitle} Guide`;

              return (
                <AccordionItem
                  key={level.id}
                  value={level.id}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-secondary/40"
                >
                  <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
                    <div className="flex w-full items-center gap-4 text-left">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                          level.accent,
                        )}
                      >
                        <Compass className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {level.subtitle}
                        </p>
                        <h3 className="text-lg font-bold">{level.title}</h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-5 px-4 pb-5 pt-4 sm:px-5">
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-3">
                          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", level.iconBg)}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{levelPdfLabel}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Level overview and guidance for {level.title} learners.
                            </p>
                          </div>
                        </div>
                        <PdfActionButtons
                          url={levelPdfUrl}
                          label={levelPdfLabel}
                          onPreview={(url, label) => setPreview({ url, label })}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Route className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                          Curriculum Pathways
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {CAREER_EXPLORER_WEEKS.map((weeks) => {
                          const weekUrl = getWeekPathwayPdfUrl(courseKey, weeks);
                          const weekLabel = `${coursePdfName} ${weeks} Weeks`;
                          return (
                            <div key={`${level.id}-${weeks}`} className="rounded-2xl border border-border/70 bg-background p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</p>
                                  <p className="mt-1 text-base font-bold">{weeks} Weeks</p>
                                </div>
                                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">PDF</div>
                              </div>
                              <div className="mt-4">
                                <PdfActionButtons
                                  url={weekUrl}
                                  label={weekLabel}
                                  onPreview={(url, label) => setPreview({ url, label })}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </Card>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-left text-lg font-bold">
              {preview?.label ?? "PDF Preview"}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="min-h-0 flex-1 bg-secondary">
              <iframe title={preview.label} src={preview.url} className="h-full w-full border-0" />
            </div>
          )}
          {preview && (
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => void downloadExternalPdf(preview.url, getPdfFilename(preview.url))}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
