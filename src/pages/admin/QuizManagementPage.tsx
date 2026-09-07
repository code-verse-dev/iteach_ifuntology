import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetAdminQuizzesQuery, useToggleLessonStatusMutation } from "@/redux/services/apiSlices/quizSlice";
import { courseRouteKey } from "@/utils/mediaUrl";

export default function QuizManagementPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("keyword") ?? "");
  const [page, setPage] = useState(1);
  const courseType = params.get("course") ?? params.get("courseType") ?? "";
  const type = params.get("type") ?? "";
  const { data: coursesData } = useGetCoursesQuery();
  const catalog = coursesData?.data ?? [];
  const { data, isFetching } = useGetAdminQuizzesQuery({
    page,
    limit: 20,
    keyword: params.get("keyword") ?? undefined,
    courseType: courseType || undefined,
    type: type || undefined,
  });
  const [toggleStatus] = useToggleLessonStatusMutation();
  const list = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1, totalDocs: 0 };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Authoring"
        title="Quiz management"
        description="Manage quizzes, tests, and exams. Open one to add questions or review student attempts."
      />
      <form
        className="mb-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setParams((current) => {
            const next = new URLSearchParams(current);
            if (search.trim()) next.set("keyword", search.trim());
            else next.delete("keyword");
            return next;
          });
        }}
      >
        <Input className="max-w-sm" placeholder="Search title" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="outline">{isFetching ? "Searching..." : "Search"}</Button>
      </form>
      <div className="mb-5 flex flex-wrap gap-2">
        <Button size="sm" variant={!courseType ? "default" : "outline"} className="rounded-full" onClick={() => { setParams({}); setPage(1); }}>
          All courses
        </Button>
        {catalog.map((course: any) => {
          const key = courseRouteKey(course);
          return (
            <Button
              key={course._id}
              size="sm"
              variant={courseType === key ? "default" : "outline"}
              className="rounded-full"
              onClick={() => { setParams({ course: key, ...(type ? { type } : {}) }); setPage(1); }}
            >
              {course.title}
            </Button>
          );
        })}
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {["", "QUIZ", "TEST", "EXAM"].map((value) => (
          <Button
            key={value || "all"}
            size="sm"
            variant={type === value ? "default" : "outline"}
            className="rounded-full"
            onClick={() => {
              setPage(1);
              setParams((current) => {
                const next = new URLSearchParams(current);
                if (value) next.set("type", value);
                else next.delete("type");
                return next;
              });
            }}
          >
            {value || "All types"}
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
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((quiz: any) => (
              <tr key={quiz._id} className="border-t border-border/70">
                <td className="px-4 py-4 font-medium">{quiz.title}</td>
                <td className="px-4 py-4">{quiz.courseModule?.courseType ?? quiz.courseModule?.name ?? "—"}</td>
                <td className="px-4 py-4"><Badge variant="secondary">{quiz.type}</Badge></td>
                <td className="px-4 py-4">{quiz.noOfQuestions ?? 0}</td>
                <td className="px-4 py-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        const res: any = await toggleStatus({
                          id: quiz._id,
                          status: quiz.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                        }).unwrap();
                        toast.success(res?.message || "Status updated");
                      } catch (err: any) {
                        toast.error(err?.data?.message || "Could not update status");
                      }
                    }}
                  >
                    {quiz.status === "INACTIVE" ? "Inactive" : "Active"}
                  </Button>
                </td>
                <td className="px-4 py-4 text-right">
                  <Button size="sm" asChild>
                    <Link to={`/admin/quiz-management/${quiz._id}`}>Questions</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {isFetching ? "Loading assessments..." : "No quizzes, tests, or exams found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>{meta.totalDocs} result{meta.totalDocs === 1 ? "" : "s"}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page >= (meta.totalPages || 1) || isFetching} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </AppPage>
  );
}
