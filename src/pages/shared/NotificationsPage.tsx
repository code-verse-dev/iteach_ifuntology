import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bell, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useToggleNotificationMutation,
} from "@/redux/services/apiSlices/notificationSlice";
import { RootState } from "@/redux/store";
import { UserRole } from "@/constants/roles";
import { cn, formatDate } from "@/lib/utils";

type Filter = "all" | "unread" | "read";

function notificationHref(role: UserRole, payload?: any): string | null {
  if (!payload || typeof payload !== "object") return null;
  if (payload.surveyId && role === "admin") {
    return `/admin/surveys-evaluations/${payload.surveyId}`;
  }
  if (payload.userId && role === "admin") {
    return `/admin/teachers/${payload.userId}`;
  }
  if (payload.certificateId) {
    if (role === "student") return `/student/certificates/${payload.certificateId}`;
    if (role === "teacher") return `/teacher/certificates/${payload.certificateId}`;
    if (role === "admin") return `/admin/certificates/${payload.certificateId}`;
  }
  if (payload.courseType) {
    const course = encodeURIComponent(payload.courseType);
    if (role === "student") return `/student/learning/${course}`;
    if (role === "teacher") return `/teacher/my-courses/${course}`;
  }
  if (payload.assignments && role === "teacher") return "/teacher/my-courses";
  return null;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.userData);
  const role: UserRole = user?.role ?? "student";
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetNotificationsQuery({
    role,
    page,
    limit: 20,
    ...(filter === "unread" ? { isRead: false } : {}),
    ...(filter === "read" ? { isRead: true } : {}),
  });
  const [toggleNotification] = useToggleNotificationMutation();
  const [markAllRead, { isLoading: marking }] = useMarkAllReadMutation();

  const payload = data?.data ?? {};
  const list = payload.notifications?.docs ?? [];
  const unreadCount = payload.unreadCount ?? 0;
  const meta = payload.notifications ?? {};
  const totalPages = meta.totalPages ?? 1;

  return (
    <AppPage>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Updates about courses, invitations, surveys, and certificates."
        actions={
          <Button
            variant="outline"
            disabled={marking || unreadCount === 0}
            onClick={async () => {
              try {
                const res: any = await markAllRead(role).unwrap();
                if (res?.status) toast.success(res?.message || "All notifications marked as read");
                else toast.error(res?.message || "Could not mark notifications as read");
              } catch (err: any) {
                toast.error(err?.data?.message || "Could not mark notifications as read");
              }
            }}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["all", "unread", "read"] as Filter[]).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            className="rounded-full capitalize"
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
          >
            {value}
          </Button>
        ))}
        {unreadCount > 0 && <Badge>{unreadCount} unread</Badge>}
      </div>

      {isFetching && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
      {!isFetching && list.length === 0 && (
        <div className="surface-card rounded-2xl border border-border/70 p-10 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold">No notifications</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "all" ? "You are all caught up." : `No ${filter} notifications.`}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {list.map((item: any) => {
          const href = notificationHref(role, item.payload);
          return (
            <article
              key={item._id}
              className={cn(
                "surface-card flex items-start justify-between gap-3 rounded-2xl border p-5",
                item.isRead ? "border-border/70" : "border-primary/30 bg-primary/5",
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={async () => {
                  if (!item.isRead) {
                    try {
                      await toggleNotification(item._id).unwrap();
                    } catch {
                      // Still allow navigation even if the toggle fails.
                    }
                  }
                  if (href) navigate(href);
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{item.title}</h2>
                  {!item.isRead && <Badge>New</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
              </button>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 shrink-0 rounded-full"
                title={item.isRead ? "Mark as unread" : "Mark as read"}
                onClick={async () => {
                  try {
                    const res: any = await toggleNotification(item._id).unwrap();
                    if (!res?.status) toast.error(res?.message || "Could not update notification");
                  } catch (err: any) {
                    toast.error(err?.data?.message || "Could not update notification");
                  }
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </AppPage>
  );
}
