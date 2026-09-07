import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LessonMaterial from "@/components/lms/LessonMaterial";
import { useGetLessonByIdQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetCourseExamsForTeacherQuery, useGetCourseExamsQuery } from "@/redux/services/apiSlices/quizSlice";
import { RootState } from "@/redux/store";
import { QUIZ_PASS_THRESHOLD } from "@/constants/quiz";

export default function CourseExamsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => state.user.userData?.role) as string;
  const courseType = decodeURIComponent(courseId ?? "");
  const isTeacher = role === "teacher";
  const courseBase = isTeacher ? "/teacher/my-courses" : "/student/learning";
  const studentQuery = useGetCourseExamsQuery(courseType, { skip: !courseType || isTeacher });
  const teacherQuery = useGetCourseExamsForTeacherQuery(courseType, { skip: !courseType || !isTeacher });
  const payload = (isTeacher ? teacherQuery.data?.data : studentQuery.data?.data);
  const exams: any[] = payload?.exams ?? [];
  const exam = exams[0] ?? null;
  const { data: lessonData } = useGetLessonByIdQuery(exam?._id, { skip: !exam?._id });
  const lesson = lessonData?.data;
  const isFetching = isTeacher ? teacherQuery.isFetching : studentQuery.isFetching;

  return (
    <AppPage>
      <PageHeader
        eyebrow={courseType}
        title="Exams"
        description={isTeacher ? "Preview the course exam and any attached PDF." : `Pass mark is ${QUIZ_PASS_THRESHOLD}%.`}
        actions={
          <Button variant="outline" asChild>
            <Link to={`${courseBase}/${encodeURIComponent(courseType)}`}>Back to course</Link>
          </Button>
        }
      />
      {!exam && (
        <p className="text-sm text-muted-foreground">
          {isFetching ? "Loading exam..." : "No exam is available for this course yet."}
        </p>
      )}
      {exam && (
        <div className="space-y-4">
          <div className="surface-card rounded-2xl border border-border/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{exam.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{exam.moduleTitle} · {exam.noOfQuestions} questions</p>
                {!isTeacher && exam.status && (
                  <div className="mt-2">
                    <Badge variant={exam.status === "passed" ? "default" : "secondary"}>{exam.status.replace("_", " ")}</Badge>
                    {exam.latestResponse?.percentage != null && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        Last score {Math.round(exam.latestResponse.percentage * 10) / 10}%
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isTeacher ? (
                  <Button onClick={() => navigate(`${courseBase}/${encodeURIComponent(courseType)}/assessment/${exam._id}`)}>
                    Preview questions
                  </Button>
                ) : (
                  <>
                    {exam.latestResponse?._id && (
                      <Button variant="outline" onClick={() => navigate(`/student/learning/response/${exam.latestResponse._id}`)}>
                        View result
                      </Button>
                    )}
                    <Button onClick={() => navigate(`${courseBase}/${encodeURIComponent(courseType)}/quiz/${exam._id}`)}>
                      {exam.status === "not_attempted" || !exam.status ? "Attempt exam" : "Re-attempt"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          {(exam.fileUrl || lesson?.fileUrl) && (
            <article className="surface-card rounded-2xl border border-border/70 p-6">
              <LessonMaterial
                lesson={{ ...lesson, ...exam, type: "PDF", fileUrl: exam.fileUrl || lesson?.fileUrl }}
                fullWidthTo={`${courseBase}/${encodeURIComponent(courseType)}/exams/pdf/${exam._id}`}
              />
            </article>
          )}
        </div>
      )}
    </AppPage>
  );
}
