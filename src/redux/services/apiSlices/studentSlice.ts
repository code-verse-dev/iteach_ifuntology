import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";

const normalizeStudent = (user: any) => {
  const enrollments = user?.enrollments ?? [];
  return {
    ...user,
    phone: user?.phoneNumber ?? user?.phone,
    enrollments,
    teacher: user?.teacher ?? enrollments[0]?.teacher ?? null,
  };
};

const paginatedUsers = (response: any) => ({
  status: response?.status,
  message: response?.message,
  data: (response?.data?.docs ?? []).map(normalizeStudent),
  meta: {
    totalDocs: response?.data?.totalDocs ?? 0,
    page: response?.data?.page ?? 1,
    limit: response?.data?.limit ?? 50,
    totalPages: response?.data?.totalPages ?? 1,
  },
});

export const studentSlice = createApi({
  reducerPath: "studentSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Students", "MyStudents"],
  endpoints: (builder) => ({
    getStudents: builder.query<
      any,
      { page?: number; limit?: number; keyword?: string } | void
    >({
      query: (params) => ({
        url: "/user/admin/getUsers",
        method: "GET",
        params: {
          role: "student",
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          ...(params?.keyword ? { keyword: params.keyword } : {}),
        },
      }),
      transformResponse: paginatedUsers,
      providesTags: ["Students"],
    }),
    getMyStudents: builder.query<
      any,
      | string
      | {
          page?: number;
          limit?: number;
          keyword?: string;
          courseType?: string;
        }
      | void
    >({
      query: (arg) => {
        const params = typeof arg === "string" || !arg ? {} : arg;
        return {
          url: "/invitation/my-students",
          method: "GET",
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 50,
            ...(params.keyword ? { keyword: params.keyword } : {}),
            ...(params.courseType ? { courseType: params.courseType } : {}),
          },
        };
      },
      transformResponse: (response: any) => {
        const docs = response?.data?.docs ?? [];
        const byUser = new Map<string, any>();
        for (const doc of docs) {
          const user = doc.user;
          if (!user?._id) continue;
          const id = String(user._id);
          if (!byUser.has(id)) {
            byUser.set(id, {
              ...user,
              _id: id,
              enrollments: [],
            });
          }
          byUser.get(id).enrollments.push({
            _id: doc._id,
            courseType: doc.courseType,
            progressPercentage: doc.progressPercentage ?? 0,
            status: doc.status,
          });
        }
        return {
          status: response?.status,
          message: response?.message,
          data: Array.from(byUser.values()),
          meta: {
            totalDocs: response?.data?.totalDocs ?? 0,
            page: response?.data?.page ?? 1,
            limit: response?.data?.limit ?? 50,
            totalPages: response?.data?.totalPages ?? 1,
          },
        };
      },
      providesTags: ["MyStudents"],
    }),
    inviteStudent: builder.mutation({
      query: (body: {
        firstName: string;
        lastName: string;
        email: string;
        password?: string;
        courseType: string[];
      }) => ({
        url: "/invitation/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MyStudents", "Students"],
    }),
    deleteStudent: builder.mutation({
      query: (body: { studentId: string }) => ({
        url: `/invitation/my-students/${body.studentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyStudents", "Students"],
    }),
    resetStudentPassword: builder.mutation({
      query: (body: { studentId: string; password: string }) => ({
        url: `/invitation/my-students/${body.studentId}/reset-password`,
        method: "POST",
        body: { password: body.password },
      }),
      invalidatesTags: ["MyStudents"],
    }),
    toggleStudentStatus: builder.mutation({
      query: (body: { studentId: string }) => ({
        url: `/invitation/my-students/${body.studentId}/status`,
        method: "PATCH",
      }),
      invalidatesTags: ["MyStudents", "Students"],
    }),
    getMyEnrollments: builder.query({
      query: () => ({
        url: "/invitation/my-teachers",
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: Array.isArray(response?.data) ? response.data : [],
      }),
      providesTags: ["MyStudents"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetMyStudentsQuery,
  useInviteStudentMutation,
  useDeleteStudentMutation,
  useResetStudentPasswordMutation,
  useToggleStudentStatusMutation,
  useGetMyEnrollmentsQuery,
} = studentSlice;
