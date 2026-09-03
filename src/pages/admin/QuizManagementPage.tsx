import { Link, useSearchParams } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCoursesQuery, useGetQuizzesQuery } from "@/redux/services/apiSlices/courseSlice";
import { courses } from "@/mock/data";

export default function QuizManagementPage() {
  const [params, setParams] = useSearchParams();
  const { data: coursesData } = useGetCoursesQuery();
  const catalog = coursesData?.data ?? courses;
  const courseId = params.get("course") ?? undefined;
  const { data } = useGetQuizzesQuery(courseId);
  const list = data?.data ?? [];

  return (
    <AppPage>
      <PageHeader
        eyebrow="Authoring"
        title="Quiz management"
        description="Open an assessment to view questions, add questions, or edit the quiz."
      />
      <div className="mb-5 flex flex-wrap gap-2">
        <Button size="sm" variant={!courseId ? "default" : "outline"} className="rounded-full" onClick={() => setParams({})}>
          All courses
        </Button>
        {catalog.map((c: any) => (
          <Button
            key={c._id}
            size="sm"
            variant={courseId === c._id ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setParams({ course: c._id })}
          >
            {c.title}
          </Button>
        ))}
      </div>
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Assessment</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Questions</th>
              <th className="px-4 py-3 font-medium">Pass</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((q: any) => (
              <tr key={q._id} className="border-t border-border/70">
                <td className="px-4 py-4 font-medium">{q.title}</td>
                <td className="px-4 py-4">{catalog.find((c: any) => c._id === q.courseId)?.title}</td>
                <td className="px-4 py-4"><Badge variant="secondary">{q.kind}</Badge></td>
                <td className="px-4 py-4">{q.questions}</td>
                <td className="px-4 py-4">{q.passingScore}%</td>
                <td className="px-4 py-4 text-right">
                  <Button size="sm" asChild>
                    <Link to={`/admin/quiz-management/${q._id}`}>Questions</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppPage>
  );
}
