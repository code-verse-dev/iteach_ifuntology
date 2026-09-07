import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";
import { UserRole } from "@/constants/roles";

export type NotificationFilter = {
  role?: UserRole;
  page?: number;
  limit?: number;
  isRead?: boolean;
};

const listUrl = (role?: UserRole) =>
  role === "admin"
    ? "/notification/getAllAdminNotifications"
    : "/notification/getUserNotifications";

const markAllUrl = (role?: UserRole) =>
  role === "admin"
    ? "/notification/admin/mark-all-read"
    : "/notification/mark-all-read";

export const notificationSlice = createApi({
  reducerPath: "notificationSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<any, NotificationFilter | void>({
      query: (params) => ({
        url: listUrl(params?.role),
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(typeof params?.isRead === "boolean" ? { isRead: String(params.isRead) } : {}),
        },
      }),
      providesTags: ["Notifications"],
    }),
    toggleNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notification/toggleNotification/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllRead: builder.mutation<any, UserRole | void>({
      query: (role) => ({
        url: markAllUrl(role || undefined),
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useToggleNotificationMutation,
  useMarkAllReadMutation,
} = notificationSlice;
