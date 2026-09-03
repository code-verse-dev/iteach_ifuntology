import { useSelector } from "react-redux";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { useGetAllNotificationsQuery } from "@/redux/services/apiSlices/notificationSlice";
import { RootState } from "@/redux/store";
import { UserRole } from "@/constants/roles";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const role: UserRole = user?.role ?? "student";
  const { data } = useGetAllNotificationsQuery({ role });
  const list = data?.data?.notifications?.docs ?? [];

  return (
    <AppPage>
      <PageHeader eyebrow="Inbox" title="Notifications" description="Classroom updates for your role." />
      <div className="space-y-3">
        {list.map((n: any) => (
          <article key={n._id} className={`surface-card rounded-2xl border p-5 ${n.isRead ? "border-border/70" : "border-primary/30 bg-primary/5"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{n.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </AppPage>
  );
}
