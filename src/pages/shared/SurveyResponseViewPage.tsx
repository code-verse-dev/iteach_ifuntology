import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetSurveyResponseByIdQuery } from "@/redux/services/apiSlices/surveySlice";
import { RootState } from "@/redux/store";
import { formatDate } from "@/lib/utils";

function surveysHome(role?: string) {
  if (role === "admin") return "/admin/surveys-evaluations";
  if (role === "teacher") return "/teacher/surveys";
  return "/student/surveys";
}

export default function SurveyResponseViewPage() {
  const { responseId } = useParams();
  const role = useSelector((state: RootState) => state.user.userData?.role) as string;
  const home = surveysHome(role);
  const { data, isFetching } = useGetSurveyResponseByIdQuery(responseId as string, { skip: !responseId });
  const response = data?.data;
  const answers = response?.answers ?? [];

  return (
    <AppPage>
      <PageHeader
        eyebrow="Survey"
        title="Your response"
        description={response?.createdAt ? `Submitted ${formatDate(response.createdAt)}` : "Submitted answers"}
        actions={
          <Button variant="outline" asChild>
            <Link to={home}>Back to surveys</Link>
          </Button>
        }
      />
      <div className="mb-5">
        <Badge>Submitted</Badge>
      </div>
      {isFetching && <p className="text-sm text-muted-foreground">Loading response...</p>}
      {!isFetching && !response && (
        <p className="text-sm text-muted-foreground">Response not found.</p>
      )}
      <div className="space-y-3">
        {answers.map((item: any, idx: number) => {
          const question = item.question;
          const text = typeof question === "string" ? question : question?.question;
          const type = typeof question === "object" ? question?.type : "text";
          return (
            <article key={item._id ?? idx} className="surface-card rounded-2xl border border-border/70 p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{typeLabel(type)}</p>
              <h2 className="mt-1 font-semibold">{text}</h2>
              <p className="mt-2 capitalize text-primary">{String(item.answer ?? "—")}</p>
            </article>
          );
        })}
      </div>
    </AppPage>
  );
}

function typeLabel(type?: string) {
  if (type === "yes_no") return "Yes / No";
  if (type === "multiple_choice") return "Multiple choice";
  if (type === "rating") return "Rating";
  return "Text";
}
