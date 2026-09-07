import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";

const normalizeTeacher = (user: any) => {
  const assignedCourses = (user?.assignedCourses ?? []).map((course: any) => ({
    ...course,
    courseId: course.courseType ?? course.courseId,
    title: course.title ?? course.courseType,
  }));
  return {
    ...user,
    phone: user?.phoneNumber ?? user?.phone,
    assignedCourses,
    assignments: assignedCourses.map((course: any) => ({
      courseId: course.courseId,
      courseType: course.courseType,
      seats: course.seats ?? 0,
      usedSeats: course.usedSeats ?? 0,
    })),
  };
};

const paginatedUsers = (response: any) => ({
  status: response?.status,
  message: response?.message,
  data: (response?.data?.docs ?? []).map(normalizeTeacher),
  meta: {
    totalDocs: response?.data?.totalDocs ?? 0,
    page: response?.data?.page ?? 1,
    limit: response?.data?.limit ?? 50,
    totalPages: response?.data?.totalPages ?? 1,
  },
});

export const teacherSlice = createApi({
  reducerPath: "teacherSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Teachers", "TeacherAssignments"],
  endpoints: (builder) => ({
    getTeachers: builder.query<
      any,
      { page?: number; limit?: number; keyword?: string } | void
    >({
      query: (params) => ({
        url: "/user/admin/getUsers",
        method: "GET",
        params: {
          role: "teacher",
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          ...(params?.keyword ? { keyword: params.keyword } : {}),
        },
      }),
      transformResponse: paginatedUsers,
      providesTags: ["Teachers"],
    }),
    getTeacher: builder.query({
      async queryFn(id: string, _api, _extra, baseQuery) {
        const userRes = await baseQuery({
          url: `/user/getUser/${id}`,
          method: "GET",
        });
        if (userRes.error) return { error: userRes.error };
        const userBody: any = userRes.data;
        if (!userBody?.status || !userBody?.data) {
          return {
            data: {
              status: false,
              message: userBody?.message || "Teacher not found",
              data: null,
            },
          };
        }
        const assignmentRes = await baseQuery({
          url: `/teacher-assignment/${id}`,
          method: "GET",
        });
        const assignments = Array.isArray((assignmentRes.data as any)?.data)
          ? (assignmentRes.data as any).data
          : [];
        return {
          data: {
            status: true,
            message: "Teacher fetched",
            data: {
              ...userBody.data,
              assignments,
            },
          },
        };
      },
      providesTags: (_result, _error, id) => [
        { type: "Teachers", id },
        { type: "TeacherAssignments", id },
      ],
    }),
    getMyAssignments: builder.query({
      query: () => ({
        url: "/teacher-assignment/my",
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: Array.isArray(response?.data) ? response.data : [],
      }),
      providesTags: ["TeacherAssignments"],
    }),
    getAssignableCourses: builder.query({
      query: () => ({
        url: "/course",
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: (Array.isArray(response?.data) ? response.data : []).map((course: any) => ({
          ...course,
          title: course.title ?? course.courseType,
        })),
      }),
    }),
    createTeacher: builder.mutation({
      query: (body: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phoneNumber: string;
        organization: string;
        country: string;
        state: string;
        city: string;
        streetAddress: string;
        zipCode: string;
      }) => ({
        url: "/user/admin/create-teacher",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Teachers"],
    }),
    updateTeacherPassword: builder.mutation({
      query: (body: { id: string; password: string }) => ({
        url: `/user/admin/teacher/${body.id}/password`,
        method: "PUT",
        body: { password: body.password },
      }),
      invalidatesTags: ["Teachers"],
    }),
    assignTeacherCourses: builder.mutation({
      query: (body: {
        id: string;
        assignments: { courseType: string; seats: number }[];
      }) => ({
        url: `/teacher-assignment/${body.id}`,
        method: "PUT",
        body: { assignments: body.assignments },
      }),
      invalidatesTags: (_result, _error, body) => [
        "Teachers",
        { type: "Teachers", id: body.id },
        { type: "TeacherAssignments", id: body.id },
      ],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useGetMyAssignmentsQuery,
  useGetAssignableCoursesQuery,
  useCreateTeacherMutation,
  useUpdateTeacherPasswordMutation,
  useAssignTeacherCoursesMutation,
} = teacherSlice;
