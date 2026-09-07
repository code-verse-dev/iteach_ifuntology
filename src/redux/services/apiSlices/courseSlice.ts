import { createApi } from "@reduxjs/toolkit/query/react";
import { Quiz, QuizQuestionItem } from "@/mock/data";
import {
  createQuizQuestion,
  createVideo,
  delay,
  deleteQuizQuestion,
  fail,
  getQuiz,
  listQuizQuestions,
  listQuizzes,
  listVideos,
  ok,
  updateQuiz,
  updateQuizQuestion,
} from "@/mock/store";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";
import { toMinutes } from "@/utils/mediaUrl";

const isObjectId = (value?: string) => /^[a-fA-F0-9]{24}$/.test(value ?? "");

const normalizeCourse = (course: any) => {
  if (!course) return course;
  return {
    ...course,
    title: course.title ?? course.courseType,
    slug: course.courseType,
    modules: course.totalModules ?? course.modules ?? 0,
    lessons: course.totalContent ?? course.lessons ?? 0,
    students: course.totalAssignments ?? course.students ?? 0,
    totalCertificates: course.totalCertificates ?? 0,
    status: course.status ?? "published",
  };
};

const normalizeLesson = (lesson: any) => ({
  ...lesson,
  summary: lesson?.description ?? lesson?.summary,
  type: lesson?.type,
});

const normalizeModule = (mod: any) => ({
  ...mod,
  courseId: mod?.courseType,
  lessons: (mod?.lessons ?? [])
    .map(normalizeLesson)
    .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0)),
});

function appendLessonFields(
  formData: FormData,
  body: {
    title?: string;
    description?: string;
    summary?: string;
    type?: string;
    duration?: unknown;
    order?: unknown;
    allowPdfPreview?: boolean;
    allowPdfDownload?: boolean;
  },
) {
  if (body.title !== undefined) formData.append("title", body.title);
  const description = body.description ?? body.summary;
  if (description !== undefined) formData.append("description", description);
  if (body.type !== undefined) formData.append("type", String(body.type).toUpperCase());
  if (body.duration !== undefined) formData.append("duration", String(toMinutes(body.duration)));
  if (body.order !== undefined) formData.append("order", String(Number(body.order) || 0));
  if (body.allowPdfPreview !== undefined) formData.append("allowPdfPreview", String(body.allowPdfPreview));
  if (body.allowPdfDownload !== undefined) formData.append("allowPdfDownload", String(body.allowPdfDownload));
}

export const courseSlice = createApi({
  reducerPath: "courseSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Courses", "Modules", "Lessons", "Quizzes", "Videos"],
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: () => ({
        url: "/course",
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: (Array.isArray(response?.data) ? response.data : []).map(normalizeCourse),
      }),
      providesTags: ["Courses"],
    }),
    getCourseById: builder.query({
      query: (id: string) => ({
        url: isObjectId(id)
          ? `/course/${id}`
          : `/course-module/course/by-type/${encodeURIComponent(id)}`,
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: normalizeCourse(response?.data),
      }),
      providesTags: ["Courses"],
    }),
    getModules: builder.query<
      any,
      | string
      | {
          courseType?: string;
          page?: number;
          limit?: number;
          keyword?: string;
        }
      | void
    >({
      query: (arg) => {
        const params = typeof arg === "string" || !arg ? { courseType: arg || undefined } : arg;
        return {
          url: "/course-module",
          method: "GET",
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 100,
            ...(params.courseType ? { courseType: params.courseType } : {}),
            ...(params.keyword ? { keyword: params.keyword } : {}),
          },
        };
      },
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: (response?.data?.docs ?? []).map(normalizeModule),
        meta: {
          totalDocs: response?.data?.totalDocs ?? 0,
          page: response?.data?.page ?? 1,
          limit: response?.data?.limit ?? 100,
          totalPages: response?.data?.totalPages ?? 1,
        },
      }),
      providesTags: ["Modules"],
    }),
    getModuleById: builder.query({
      query: (id: string) => ({
        url: `/course-module/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: normalizeModule(response?.data),
      }),
      providesTags: ["Modules"],
    }),
    getLessonById: builder.query({
      query: (id: string) => ({
        url: `/lesson/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: normalizeLesson(response?.data),
      }),
      providesTags: ["Lessons"],
    }),
    createModule: builder.mutation({
      query: (body: {
        courseType?: string;
        courseId?: string;
        title: string;
        description?: string;
        duration?: number | string;
        order?: number;
        status?: "ACTIVE" | "INACTIVE";
      }) => ({
        url: "/course-module",
        method: "POST",
        body: {
          courseType: body.courseType || body.courseId,
          title: body.title,
          description: body.description,
          duration: toMinutes(body.duration),
          order: Number(body.order) || 0,
          ...(body.status ? { status: body.status } : {}),
        },
      }),
      invalidatesTags: ["Modules", "Courses"],
    }),
    updateModule: builder.mutation({
      query: (body: {
        id: string;
        title?: string;
        description?: string;
        duration?: number | string;
        order?: number;
        status?: "ACTIVE" | "INACTIVE";
      }) => ({
        url: `/course-module/${body.id}`,
        method: "PATCH",
        body: {
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.duration !== undefined ? { duration: toMinutes(body.duration) } : {}),
          ...(body.order !== undefined ? { order: Number(body.order) || 0 } : {}),
          ...(body.status ? { status: body.status } : {}),
        },
      }),
      invalidatesTags: ["Modules", "Courses"],
    }),
    deleteModule: builder.mutation({
      query: (id: string) => ({
        url: `/course-module/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Modules", "Courses", "Lessons"],
    }),
    createLesson: builder.mutation({
      query: (body: {
        moduleId?: string;
        courseModule?: string;
        title: string;
        description?: string;
        summary?: string;
        type: string;
        duration?: number | string;
        order?: number;
        file?: File;
        video?: File;
        allowPdfPreview?: boolean;
        allowPdfDownload?: boolean;
      }) => {
        const formData = new FormData();
        formData.append("courseModule", body.moduleId || body.courseModule || "");
        appendLessonFields(formData, body);
        if (body.file) formData.append("file", body.file);
        if (body.video) formData.append("video", body.video);
        return { url: "/lesson", method: "POST", body: formData };
      },
      invalidatesTags: ["Modules", "Lessons", "Courses"],
    }),
    updateLesson: builder.mutation({
      query: (body: {
        lessonId: string;
        moduleId?: string;
        title?: string;
        description?: string;
        summary?: string;
        type?: string;
        duration?: number | string;
        order?: number;
        file?: File;
        video?: File;
        allowPdfPreview?: boolean;
        allowPdfDownload?: boolean;
      }) => {
        const formData = new FormData();
        appendLessonFields(formData, body);
        if (body.file) formData.append("file", body.file);
        if (body.video) formData.append("video", body.video);
        return { url: `/lesson/${body.lessonId}`, method: "PATCH", body: formData };
      },
      invalidatesTags: ["Modules", "Lessons"],
    }),
    deleteLesson: builder.mutation({
      query: (body: { lessonId: string; moduleId?: string }) => ({
        url: `/lesson/${body.lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Modules", "Lessons", "Courses"],
    }),
    getQuizzes: builder.query({
      async queryFn(courseId?: string) {
        await delay();
        return { data: ok(listQuizzes(courseId)) };
      },
      providesTags: ["Quizzes"],
    }),
    getQuizById: builder.query({
      async queryFn(id: string) {
        await delay();
        return { data: ok(getQuiz(id)) };
      },
      providesTags: ["Quizzes"],
    }),
    updateQuiz: builder.mutation({
      async queryFn(body: { id: string } & Partial<Quiz>) {
        await delay();
        const quiz = updateQuiz(body.id, body);
        if (!quiz) return { error: { status: 404, data: fail("Quiz not found") } };
        return { data: ok(quiz, "Quiz updated") };
      },
      invalidatesTags: ["Quizzes"],
    }),
    getQuizQuestions: builder.query({
      async queryFn(quizId: string) {
        await delay();
        return { data: ok(listQuizQuestions(quizId)) };
      },
      providesTags: ["Quizzes"],
    }),
    createQuizQuestion: builder.mutation({
      async queryFn(body: { quizId: string } & Omit<QuizQuestionItem, "_id" | "quizId">) {
        await delay();
        return { data: ok(createQuizQuestion(body.quizId, body), "Question added") };
      },
      invalidatesTags: ["Quizzes"],
    }),
    updateQuizQuestion: builder.mutation({
      async queryFn(body: { id: string } & Partial<QuizQuestionItem>) {
        await delay();
        const question = updateQuizQuestion(body.id, body);
        if (!question) return { error: { status: 404, data: fail("Question not found") } };
        return { data: ok(question, "Question updated") };
      },
      invalidatesTags: ["Quizzes"],
    }),
    deleteQuizQuestion: builder.mutation({
      async queryFn(id: string) {
        await delay();
        if (!deleteQuizQuestion(id)) return { error: { status: 404, data: fail("Question not found") } };
        return { data: ok({}, "Question deleted") };
      },
      invalidatesTags: ["Quizzes"],
    }),
    getVideos: builder.query({
      async queryFn() {
        await delay();
        return { data: ok(listVideos()) };
      },
      providesTags: ["Videos"],
    }),
    createVideo: builder.mutation({
      async queryFn(body: { title: string; courseId: string; duration?: string; fileName?: string }) {
        await delay();
        return { data: ok(createVideo(body), "Video added") };
      },
      invalidatesTags: ["Videos"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetModulesQuery,
  useGetModuleByIdQuery,
  useGetLessonByIdQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useUpdateQuizMutation,
  useGetQuizQuestionsQuery,
  useCreateQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useGetVideosQuery,
  useCreateVideoMutation,
} = courseSlice;
