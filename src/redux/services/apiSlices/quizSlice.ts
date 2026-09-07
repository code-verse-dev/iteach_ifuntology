import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";

export const quizSlice = createApi({
  reducerPath: "quizSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Quizzes", "QuizQuestions", "QuizResponses"],
  endpoints: (builder) => ({
    getAdminQuizzes: builder.query<
      any,
      { page?: number; limit?: number; keyword?: string; courseType?: string; status?: string; type?: string } | void
    >({
      query: (params) => ({
        url: "/lesson/quizzes",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.keyword ? { keyword: params.keyword } : {}),
          ...(params?.courseType ? { courseType: params.courseType } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.type ? { type: params.type } : {}),
        },
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: response?.data?.docs ?? [],
        meta: {
          totalDocs: response?.data?.totalDocs ?? 0,
          page: response?.data?.page ?? 1,
          limit: response?.data?.limit ?? 20,
          totalPages: response?.data?.totalPages ?? 1,
        },
      }),
      providesTags: ["Quizzes"],
    }),
    getQuizQuestions: builder.query({
      query: (lessonId: string) => ({
        url: `/lesson-quiz-question/${lessonId}`,
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: Array.isArray(response?.data) ? response.data : [],
      }),
      providesTags: ["QuizQuestions"],
    }),
    createQuizQuestions: builder.mutation({
      query: (body: { lesson: string; questions: any[] }) => ({
        url: "/lesson-quiz-question",
        method: "POST",
        body,
      }),
      invalidatesTags: ["QuizQuestions", "Quizzes"],
    }),
    updateQuizQuestion: builder.mutation({
      query: (body: { id: string } & Record<string, unknown>) => ({
        url: `/lesson-quiz-question/${body.id}`,
        method: "PATCH",
        body: {
          question: body.question,
          type: body.type,
          options: body.options,
          correctAnswer: body.correctAnswer,
          points: body.points,
          order: body.order,
        },
      }),
      invalidatesTags: ["QuizQuestions"],
    }),
    deleteQuizQuestion: builder.mutation({
      query: (id: string) => ({
        url: `/lesson-quiz-question/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QuizQuestions", "Quizzes"],
    }),
    toggleLessonStatus: builder.mutation({
      query: (body: { id: string; status: "ACTIVE" | "INACTIVE" }) => ({
        url: `/lesson/${body.id}/status`,
        method: "PATCH",
        body: { status: body.status },
      }),
      invalidatesTags: ["Quizzes"],
    }),
    getQuizResponses: builder.query({
      query: (arg: { lessonId: string; page?: number; limit?: number }) => ({
        url: `/lesson-quiz-response/${arg.lessonId}`,
        method: "GET",
        params: { page: arg.page ?? 1, limit: arg.limit ?? 20 },
      }),
      providesTags: ["QuizResponses"],
    }),
    getCourseQuizzes: builder.query({
      query: (courseType: string) => ({
        url: `/lesson/course-quizzes/${encodeURIComponent(courseType)}`,
        method: "GET",
      }),
    }),
    getCourseTests: builder.query({
      query: (courseType: string) => ({
        url: `/lesson/course-tests/${encodeURIComponent(courseType)}`,
        method: "GET",
      }),
    }),
    getCourseExams: builder.query({
      query: (courseType: string) => ({
        url: `/lesson/course-exams/${encodeURIComponent(courseType)}`,
        method: "GET",
      }),
    }),
    getCourseQuizzesForTeacher: builder.query({
      query: (courseType: string) => ({
        url: `/lesson/course-quizzes/${encodeURIComponent(courseType)}/teacher`,
        method: "GET",
      }),
    }),
    getCourseTestsForTeacher: builder.query({
      query: (courseType: string) => ({
        url: `/lesson/course-tests/${encodeURIComponent(courseType)}/teacher`,
        method: "GET",
      }),
    }),
    getCourseExamsForTeacher: builder.query({
      query: (courseType: string) => ({
        url: `/lesson/course-exams/${encodeURIComponent(courseType)}/teacher`,
        method: "GET",
      }),
    }),
    submitQuizResponse: builder.mutation({
      query: (body: { lessonId: string; answers: { questionId: string; answer: string | boolean }[] }) => ({
        url: `/lesson-quiz-response/${body.lessonId}`,
        method: "POST",
        body: { answers: body.answers },
      }),
      invalidatesTags: ["QuizResponses"],
    }),
    getResponseById: builder.query({
      query: (id: string) => ({
        url: `/lesson-quiz-response/by-id/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAdminQuizzesQuery,
  useGetQuizQuestionsQuery,
  useCreateQuizQuestionsMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useToggleLessonStatusMutation,
  useGetQuizResponsesQuery,
  useGetCourseQuizzesQuery,
  useGetCourseTestsQuery,
  useGetCourseExamsQuery,
  useGetCourseQuizzesForTeacherQuery,
  useGetCourseTestsForTeacherQuery,
  useGetCourseExamsForTeacherQuery,
  useSubmitQuizResponseMutation,
  useGetResponseByIdQuery,
} = quizSlice;
