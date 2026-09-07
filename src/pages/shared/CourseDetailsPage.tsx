import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Award,
  ChevronRight,
  ClipboardList,
  Compass,
  Download,
  Eye,
  FileQuestion,
  GraduationCap,
  Package,
  Users,
  Video,
} from "lucide-react";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CAREER_SUCCESS_PLANNER_PDF,
  CLASSROOM_KITS_URL,
  FUNTOLOGY_BRAIDING_PDF,
  IFUNTOLOGY_GLOSSARY_PDF,
  WORKFORCE_EXPLORATION_FORM_PDF,
} from "@/constants/api";
import { cn } from "@/lib/utils";
import { useGetCourseByIdQuery, useGetModulesQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetMyStudentsQuery } from "@/redux/services/apiSlices/studentSlice";
import { useGetMyAssignmentsQuery } from "@/redux/services/apiSlices/teacherSlice";
import { RootState } from "@/redux/store";
import { courseRouteKey } from "@/utils/mediaUrl";
import { isImportedAssessmentModule } from "@/constants/quiz";

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.userData);
  const role = user?.role as string;
  const decodedCourse = decodeURIComponent(courseId ?? "");
  const { data: courseData, isFetching: loadingCourse } = useGetCourseByIdQuery(decodedCourse, { skip: !decodedCourse });
  const { data: moduleData, isFetching: loadingModules } = useGetModulesQuery(
    { courseType: decodedCourse, limit: 100 },
    { skip: !decodedCourse },
  );
  const { data: assignmentData } = useGetMyAssignmentsQuery(undefined, { skip: role !== "teacher" });
  const { data: studentsData } = useGetMyStudentsQuery(user?._id, { skip: role !== "teacher" || !user?._id });
  const course = courseData?.data;
  const modules = (moduleData?.data ?? []).filter((mod: any) => !isImportedAssessmentModule(mod.title));
  const students = studentsData?.data ?? [];
  const courseKey = courseRouteKey(course) || decodedCourse;
  const courseBase = role === "student" ? "/student/learning" : "/teacher/my-courses";
  const usedSeats =
    (assignmentData?.data ?? []).find((assignment: any) => assignment.courseType === courseKey)?.usedSeats
    ?? students.filter((student: any) =>
      (student.enrollments ?? []).some((enrollment: any) => enrollment.courseType === courseKey),
    ).length;

  const testingCenter = [
    {
      label: "Quizzes",
      icon: ClipboardList,
      onClick: () => navigate(`${courseBase}/${encodeURIComponent(courseKey)}/quizzes`),
      className: "border-orange-500/25 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
    },
    {
      label: "Tests",
      icon: FileQuestion,
      onClick: () => navigate(`${courseBase}/${encodeURIComponent(courseKey)}/tests`),
      className: "border-blue-500/25 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
    },
    {
      label: "Exams",
      icon: GraduationCap,
      onClick: () => navigate(`${courseBase}/${encodeURIComponent(courseKey)}/exams`),
      className: "border-amber-500/25 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20",
    },
    ...(role === "student"
      ? [{
          label: "Certificate",
          icon: Award,
          onClick: () => navigate(`/student/learning/${encodeURIComponent(courseKey)}/certificate`),
          className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
        }]
      : []),
    {
      label: "Braidology",
      icon: Eye,
      onClick: () => window.open(FUNTOLOGY_BRAIDING_PDF, "_blank", "noopener,noreferrer"),
      className: "border-violet-500/25 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20",
    },
  ];

  return (
    <AppPage>
      <PageHeader
        eyebrow="Course"
        title={course?.title ?? (loadingCourse ? "Loading course..." : "Course")}
        description={course?.description}
        actions={
          <div className="flex flex-wrap gap-2">
            {role === "student" && (
              <Button variant="outline" asChild>
                <Link to="/student/video-library">
                  <Video className="h-4 w-4" />
                  Video Library
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to={courseBase}>All courses</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-5 flex flex-wrap gap-3">
            <Button variant="brand" asChild>
              <a href={CAREER_SUCCESS_PLANNER_PDF} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Career Success Planner
              </a>
            </Button>
            <Button variant="brand" onClick={() => navigate(`${courseBase}/${encodeURIComponent(courseKey)}/career-explorer-pathway`)}>
              <Compass className="h-4 w-4" />
              Career Explorer Pathway
            </Button>
            <Button variant="brand" asChild>
              <a href={WORKFORCE_EXPLORATION_FORM_PDF} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Workforce Exploration Form
              </a>
            </Button>
            <Button variant="brand" asChild>
              <a href={IFUNTOLOGY_GLOSSARY_PDF} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                iFuntology Glossary
              </a>
            </Button>
          </div>

          <h2 className="mb-4 text-xl font-bold">Lessons</h2>
          <div className="space-y-3">
            {modules.map((mod: any) => (
              <article key={mod._id} className="surface-card rounded-2xl border border-border/70 p-5">
                <h3 className="font-semibold">{mod.title}</h3>
                {mod.description && <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>}
                <ul className="mt-3 space-y-2">
                  {(mod.lessons ?? []).map((lesson: any) => (
                    <li key={lesson._id}>
                      <Link
                        to={`${courseBase}/${encodeURIComponent(courseKey)}/lesson/${mod._id}/${lesson._id}`}
                        className="flex items-center justify-between rounded-xl bg-secondary/80 px-4 py-3 text-sm hover:bg-secondary"
                      >
                        <span>{lesson.title}</span>
                        <Badge variant="secondary">{lesson.type}</Badge>
                      </Link>
                    </li>
                  ))}
                  {(mod.lessons ?? []).length === 0 && (
                    <li className="text-sm text-muted-foreground">No lessons in this module yet.</li>
                  )}
                </ul>
              </article>
            ))}
            {modules.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {loadingModules ? "Loading modules..." : "No modules have been published for this course yet."}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-8 lg:col-span-4">
          <section>
            <h2 className="mb-3 text-xl font-bold">Course overview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {course?.description ?? "—"}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold">Testing Center</h2>
            <div className="grid grid-cols-2 gap-2">
              {testingCenter.map((resource) => (
                <button
                  key={resource.label}
                  type="button"
                  onClick={resource.onClick}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-all",
                    resource.className,
                    !resource.onClick && "cursor-default",
                  )}
                >
                  <resource.icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="min-w-0 truncate">{resource.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </section>

          {role === "teacher" && (
            <section className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <h3 className="text-base font-bold">Students</h3>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-sm text-slate-400">Enrolled students</span>
                <span className="text-2xl font-bold">{usedSeats}</span>
              </div>
              <Button className="mt-5 w-full" asChild>
                <Link to="/teacher/my-students">View All Students</Link>
              </Button>
              <Button
                variant="outline"
                className="mt-3 w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={() => window.open(CLASSROOM_KITS_URL, "_blank", "noopener,noreferrer")}
              >
                <Package className="h-4 w-4" />
                Classroom Kits
              </Button>
            </section>
          )}

          {role === "student" && (
            <section className="rounded-2xl bg-slate-900 p-5 text-white">
              <Button
                variant="outline"
                className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={() => window.open(CLASSROOM_KITS_URL, "_blank", "noopener,noreferrer")}
              >
                <Package className="h-4 w-4" />
                Classroom Kits
              </Button>
            </section>
          )}
        </aside>
      </div>
    </AppPage>
  );
}
