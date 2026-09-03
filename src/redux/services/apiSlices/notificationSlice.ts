import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserRole } from "@/constants/roles";
import { notifications } from "@/mock/data";
import { delay, ok } from "@/mock/store";

export const notificationSlice = createApi({
  reducerPath: "notificationSlice",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getAllNotifications: builder.query({
      async queryFn(arg: { role?: UserRole }) {
        await delay();
        const list = notifications.filter((n) => n.role === "all" || n.role === arg?.role);
        return {
          data: ok({
            unreadCount: list.filter((n) => !n.isRead).length,
            notifications: { docs: list },
          }),
        };
      },
      providesTags: ["Notifications"],
    }),
  }),
});

export const { useGetAllNotificationsQuery } = notificationSlice;
