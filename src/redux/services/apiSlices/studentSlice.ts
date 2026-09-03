import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  delay,
  deleteStudent,
  fail,
  inviteStudent,
  listAllStudents,
  listStudents,
  ok,
  updateStudentPassword,
} from "@/mock/store";

export const studentSlice = createApi({
  reducerPath: "studentSlice",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Students"],
  endpoints: (builder) => ({
    getStudents: builder.query({
      async queryFn() {
        await delay();
        return { data: ok(listAllStudents()) };
      },
      providesTags: ["Students"],
    }),
    getMyStudents: builder.query({
      async queryFn(teacherId: string) {
        await delay();
        return { data: ok(listStudents(teacherId)) };
      },
      providesTags: ["Students"],
    }),
    inviteStudent: builder.mutation({
      async queryFn(body: { teacherId: string; firstName: string; lastName: string; email: string; password: string }) {
        await delay();
        const result = inviteStudent(body.teacherId, body);
        if ("error" in result) return { error: { status: 400, data: fail(result.error) } };
        return { data: ok(result.user, "Student invited") };
      },
      invalidatesTags: ["Students"],
    }),
    deleteStudent: builder.mutation({
      async queryFn(body: { teacherId: string; studentId: string }) {
        await delay();
        const done = deleteStudent(body.teacherId, body.studentId);
        if (!done) return { error: { status: 404, data: fail("Student not found") } };
        return { data: ok({}, "Student removed") };
      },
      invalidatesTags: ["Students"],
    }),
    resetStudentPassword: builder.mutation({
      async queryFn(body: { teacherId: string; studentId: string; password: string }) {
        await delay();
        const user = updateStudentPassword(body.teacherId, body.studentId, body.password);
        if (!user) return { error: { status: 404, data: fail("Student not found") } };
        return { data: ok(user, "Password updated") };
      },
      invalidatesTags: ["Students"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetMyStudentsQuery,
  useInviteStudentMutation,
  useDeleteStudentMutation,
  useResetStudentPasswordMutation,
} = studentSlice;
