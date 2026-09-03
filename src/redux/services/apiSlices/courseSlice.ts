import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { courses, Lesson, Module, Quiz, QuizQuestionItem, Survey, SurveyQuestionItem } from "@/mock/data";
import {
  createLesson,
  createModule,
  createQuizQuestion,
  createSurvey,
  createSurveyQuestion,
  createVideo,
  delay,
  deleteLesson,
  deleteModule,
  deleteQuizQuestion,
  deleteSurveyQuestion,
  fail,
  getModule,
  getQuiz,
  getSurvey,
  listModules,
  listQuizQuestions,
  listQuizzes,
  listSurveyQuestions,
  listSurveys,
  listVideos,
  ok,
  updateLesson,
  updateModule,
  updateQuiz,
  updateQuizQuestion,
  updateSurveyQuestion,
} from "@/mock/store";

export const courseSlice = createApi({
  reducerPath: "courseSlice",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Courses", "Modules", "Quizzes", "Videos", "Surveys"],
  endpoints: (builder) => ({
    getCourses: builder.query({
      async queryFn() {
        await delay();
        return { data: ok(courses) };
      },
      providesTags: ["Courses"],
    }),
    getCourseById: builder.query({
      async queryFn(id: string) {
        await delay();
        const course = courses.find((c) => c._id === id || c.slug === id);
        return { data: ok(course) };
      },
    }),
    getModules: builder.query({
      async queryFn(courseId?: string) {
        await delay();
        return { data: ok(listModules(courseId)) };
      },
      providesTags: ["Modules"],
    }),
    getModuleById: builder.query({
      async queryFn(id: string) {
        await delay();
        return { data: ok(getModule(id)) };
      },
      providesTags: ["Modules"],
    }),
    createModule: builder.mutation({
      async queryFn(body: { courseId: string; title: string; description?: string; duration?: string; order?: number }) {
        await delay();
        return { data: ok(createModule(body), "Module created") };
      },
      invalidatesTags: ["Modules"],
    }),
    updateModule: builder.mutation({
      async queryFn(body: { id: string } & Partial<Module>) {
        await delay();
        const mod = updateModule(body.id, body);
        if (!mod) return { error: { status: 404, data: fail("Module not found") } };
        return { data: ok(mod, "Module updated") };
      },
      invalidatesTags: ["Modules"],
    }),
    deleteModule: builder.mutation({
      async queryFn(id: string) {
        await delay();
        if (!deleteModule(id)) return { error: { status: 404, data: fail("Module not found") } };
        return { data: ok({}, "Module deleted") };
      },
      invalidatesTags: ["Modules"],
    }),
    createLesson: builder.mutation({
      async queryFn(body: { moduleId: string } & Omit<Lesson, "_id">) {
        await delay();
        const lesson = createLesson(body.moduleId, body);
        if (!lesson) return { error: { status: 404, data: fail("Module not found") } };
        return { data: ok(lesson, "Lesson added") };
      },
      invalidatesTags: ["Modules"],
    }),
    updateLesson: builder.mutation({
      async queryFn(body: { moduleId: string; lessonId: string } & Partial<Lesson>) {
        await delay();
        const lesson = updateLesson(body.moduleId, body.lessonId, body);
        if (!lesson) return { error: { status: 404, data: fail("Lesson not found") } };
        return { data: ok(lesson, "Lesson updated") };
      },
      invalidatesTags: ["Modules"],
    }),
    deleteLesson: builder.mutation({
      async queryFn(body: { moduleId: string; lessonId: string }) {
        await delay();
        if (!deleteLesson(body.moduleId, body.lessonId)) {
          return { error: { status: 404, data: fail("Lesson not found") } };
        }
        return { data: ok({}, "Lesson deleted") };
      },
      invalidatesTags: ["Modules"],
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
    getSurveys: builder.query({
      async queryFn() {
        await delay();
        return { data: ok(listSurveys()) };
      },
      providesTags: ["Surveys"],
    }),
    createSurvey: builder.mutation({
      async queryFn(body: Omit<Survey, "_id" | "questions" | "responses">) {
        await delay();
        return { data: ok(createSurvey(body), "Survey created") };
      },
      invalidatesTags: ["Surveys"],
    }),
    getSurveyById: builder.query({
      async queryFn(id: string) {
        await delay();
        return { data: ok(getSurvey(id)) };
      },
      providesTags: ["Surveys"],
    }),
    getSurveyQuestions: builder.query({
      async queryFn(surveyId: string) {
        await delay();
        return { data: ok(listSurveyQuestions(surveyId)) };
      },
      providesTags: ["Surveys"],
    }),
    createSurveyQuestion: builder.mutation({
      async queryFn(body: { surveyId: string } & Omit<SurveyQuestionItem, "_id" | "surveyId">) {
        await delay();
        return { data: ok(createSurveyQuestion(body.surveyId, body), "Question added") };
      },
      invalidatesTags: ["Surveys"],
    }),
    updateSurveyQuestion: builder.mutation({
      async queryFn(body: { id: string } & Partial<SurveyQuestionItem>) {
        await delay();
        const question = updateSurveyQuestion(body.id, body);
        if (!question) return { error: { status: 404, data: fail("Question not found") } };
        return { data: ok(question, "Question updated") };
      },
      invalidatesTags: ["Surveys"],
    }),
    deleteSurveyQuestion: builder.mutation({
      async queryFn(id: string) {
        await delay();
        if (!deleteSurveyQuestion(id)) return { error: { status: 404, data: fail("Question not found") } };
        return { data: ok({}, "Question deleted") };
      },
      invalidatesTags: ["Surveys"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetModulesQuery,
  useGetModuleByIdQuery,
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
  useGetSurveysQuery,
  useCreateSurveyMutation,
  useGetSurveyByIdQuery,
  useGetSurveyQuestionsQuery,
  useCreateSurveyQuestionMutation,
  useUpdateSurveyQuestionMutation,
  useDeleteSurveyQuestionMutation,
} = courseSlice;
