import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetCourseExamsForTeacherQuery,
  useGetCourseExamsQuery,
  useGetCourseQuizzesForTeacherQuery,
  useGetCourseQuizzesQuery,
  useGetCourseTestsForTeacherQuery,
  useGetCourseTestsQuery,
} from "@/redux/services/apiSlices/quizSlice";
import { RootState } from "@/redux/store";
import { QUIZ_PASS_THRESHOLD } from "@/constants/quiz";

type Kind = "QUIZ" | "TEST" | "EXAM";

const CONFIG: Record<Kind, { label: string; plural: string; listKey: string; totalKey: string }> = {
  QUIZ: { label: "Quiz", plural: "Quizzes", listKey: "quizzes", totalKey: "totalQuizzes" },
  TEST: { label: "Test", plural: "Tests", listKey: "tests", totalKey: "totalTests" },
  EXAM: { label: "Exam", plural: "Exams", listKey: "exams", totalKey: "totalExams" },
};

function statusBadge(status?: string) {
  if (status === "passed") {
    return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Passed</Badge>;
  }
  if (status === "failed") {
    return <Badge className="bg-orange-100 text-orange-700"><XCircle className="mr-1 h-3.5 w-3.5" />Failed</Badge>;
  }
  return <Badge variant="secondary"><HelpCircle className="mr-1 h-3.5 w-3.5" />Not attempted</Badge>;
}

export default function CourseAssessmentsPage({ kind }: { kind: Kind }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => state.user.userData?.role) as string;
  const courseType = decodeURIComponent(courseId ?? "");
  const config = CONFIG[kind];
  const isTeacher = role === "teacher";
  const courseBase = isTeacher ? "/teacher/my-courses" : "/student/learning";

  const studentQuizzes = useGetCourseQuizzesQuery(courseType, { skip: !courseType || isTeacher || kind !== "QUIZ" });
  const studentTests = useGetCourseTestsQuery(courseType, { skip: !courseType || isTeacher || kind !== "TEST" });
  const studentExams = useGetCourseExamsQuery(courseType, { skip: !courseType || isTeacher || kind !== "EXAM" });
  const teacherQuizzes = useGetCourseQuizzesForTeacherQuery(courseType, { skip: !courseType || !isTeacher || kind !== "QUIZ" });
  const teacherTests = useGetCourseTestsForTeacherQuery(courseType, { skip: !courseType || !isTeacher || kind !== "TEST" });
  const teacherExams = useGetCourseExamsForTeacherQuery(courseType, { skip: !courseType || !isTeacher || kind !== "EXAM" });

  const active = isTeacher
    ? (kind === "QUIZ" ? teacherQuizzes : kind === "TEST" ? teacherTests : teacherExams)
    : (kind === "QUIZ" ? studentQuizzes : kind === "TEST" ? studentTests : studentExams);

  const payload = active.data?.data;
  const items: any[] = payload?.[config.listKey] ?? [];
  const total = payload?.[config.totalKey] ?? items.length;

  return (
    <AppPage>
      <PageHeader
        eyebrow={courseType}
        title={config.plural}
        description={
          isTeacher
            ? `Review ${config.plural.toLowerCase()} for this course. Students attempt them from Learning.`
            : `Pass mark is ${QUIZ_PASS_THRESHOLD}%. You can retake as many times as you need.`
        }
        actions={
          <Button variant="outline" asChild>
            <Link to={`${courseBase}/${encodeURIComponent(courseType)}`}>Back to course</Link>
          </Button>
        }
      />
      {!isTeacher && payload?.certificate && kind === "QUIZ" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>You earned this course certificate after passing every quiz.</span>
          <Button size="sm" asChild>
            <Link to={`/student/certificates/${payload.certificate._id}`}>View certificate</Link>
          </Button>
        </div>
      )}
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{config.label}</th>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Questions</th>
              {!isTeacher && <th className="px-4 py-3 font-medium">Status</th>}
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item._id} className="border-t border-border/70">
                <td className="px-4 py-4 font-medium">{item.title}</td>
                <td className="px-4 py-4">{item.moduleTitle ?? "—"}</td>
                <td className="px-4 py-4">{item.noOfQuestions ?? 0}</td>
                {!isTeacher && <td className="px-4 py-4">{statusBadge(item.status)}</td>}
                <td className="px-4 py-4 text-right space-x-2">
                  {isTeacher ? (
                    <Button size="sm" variant="outline" onClick={() => navigate(`${courseBase}/${encodeURIComponent(courseType)}/assessment/${item._id}`)}>
                      Preview
                    </Button>
                  ) : (
                    <>
                      {item.latestResponse?._id && (
                        <Button size="sm" variant="outline" onClick={() => navigate(`/student/learning/response/${item.latestResponse._id}`)}>
                          View result
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => navigate(`${courseBase}/${encodeURIComponent(courseType)}/quiz/${item._id}`)}
                      >
                        {item.status === "passed" ? "Retake" : item.status === "failed" ? `Retry ${config.label}` : `Attempt ${config.label}`}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={isTeacher ? 4 : 5} className="px-4 py-10 text-center text-muted-foreground">
                  {active.isFetching ? `Loading ${config.plural.toLowerCase()}...` : `No ${config.plural.toLowerCase()} are available yet.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{total} {config.plural.toLowerCase()}</p>
    </AppPage>
  );
}
