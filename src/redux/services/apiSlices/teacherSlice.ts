import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { CourseAssignment } from "@/mock/data";
import {
  assignCourses,
  createTeacher,
  delay,
  enrichPerson,
  fail,
  findUserById,
  listTeachers,
  ok,
  updateTeacherPassword,
} from "@/mock/store";

export const teacherSlice = createApi({
  reducerPath: "teacherSlice",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Teachers"],
  endpoints: (builder) => ({
    getTeachers: builder.query({
      async queryFn() {
        await delay();
        return { data: ok(listTeachers()) };
      },
      providesTags: ["Teachers"],
    }),
    getTeacher: builder.query({
      async queryFn(id: string) {
        await delay();
        const user = findUserById(id);
        return { data: ok(user ? enrichPerson(user) : null) };
      },
      providesTags: ["Teachers"],
    }),
    createTeacher: builder.mutation({
      async queryFn(body: any) {
        await delay();
        return { data: ok(createTeacher(body), "Teacher created") };
      },
      invalidatesTags: ["Teachers"],
    }),
    updateTeacherPassword: builder.mutation({
      async queryFn(body: { id: string; password: string }) {
        await delay();
        const user = updateTeacherPassword(body.id, body.password);
        if (!user) return { error: { status: 404, data: fail("Teacher not found") } };
        return { data: ok(user, "Password updated") };
      },
      invalidatesTags: ["Teachers"],
    }),
    assignTeacherCourses: builder.mutation({
      async queryFn(body: { id: string; assignments: CourseAssignment[] }) {
        await delay();
        const user = assignCourses(body.id, body.assignments);
        if (!user) return { error: { status: 404, data: fail("Teacher not found") } };
        return { data: ok(user, "Assignments saved") };
      },
      invalidatesTags: ["Teachers"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherPasswordMutation,
  useAssignTeacherCoursesMutation,
} = teacherSlice;
