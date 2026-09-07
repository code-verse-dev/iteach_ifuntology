import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import {
  certificateStudentName,
  certificateTitle,
  useGetAdminCertificatesQuery,
} from "@/redux/services/apiSlices/certificateSlice";
import { courseRouteKey } from "@/utils/mediaUrl";
import { formatDate } from "@/lib/utils";

export default function AdminCertificatesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("keyword") ?? "");
  const [page, setPage] = useState(1);
  const courseType = params.get("course") ?? "";
  const { data: coursesData } = useGetCoursesQuery();
  const catalog = coursesData?.data ?? [];
  const { data, isFetching } = useGetAdminCertificatesQuery({
    page,
    limit: 20,
    keyword: params.get("keyword") ?? undefined,
    courseType: courseType || undefined,
  });
  const list = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1, totalDocs: 0 };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Recognition"
        title="Certificates"
        description="Records issued when a student passes every quiz in a course."
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
        <Input className="max-w-sm" placeholder="Search student or course" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              onClick={() => { setParams({ course: key }); setPage(1); }}
            >
              {course.title}
            </Button>
          );
        })}
      </div>
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((cert: any) => (
              <tr key={cert._id} className="border-t border-border/70">
                <td className="px-4 py-4">
                  <p className="font-medium">{certificateStudentName(cert)}</p>
                  <p className="text-xs text-muted-foreground">{cert.student?.email}</p>
                </td>
                <td className="px-4 py-4">{certificateTitle(cert)}</td>
                <td className="px-4 py-4">{formatDate(cert.createdAt)}</td>
                <td className="px-4 py-4 text-right">
                  <Button size="sm" asChild>
                    <Link to={`/admin/certificates/${cert._id}`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  {isFetching ? "Loading certificates..." : "No certificates issued yet."}
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
