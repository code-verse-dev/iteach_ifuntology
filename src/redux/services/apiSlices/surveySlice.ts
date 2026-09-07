import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";

export const surveySlice = createApi({
  reducerPath: "surveySlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Surveys", "SurveyQuestions", "SurveyResponses", "SurveyStats"],
  endpoints: (builder) => ({
    getSurveys: builder.query<
      any,
      { page?: number; limit?: number; type?: string; role?: string } | void
    >({
      query: (params) => ({
        url: "/survey",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.type ? { type: params.type } : {}),
          ...(params?.role ? { role: params.role } : {}),
        },
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: response?.data?.docs ?? [],
        meta: {
          totalDocs: response?.data?.totalDocs ?? 0,
          page: response?.data?.page ?? 1,
          totalPages: response?.data?.totalPages ?? 1,
        },
      }),
      providesTags: ["Surveys"],
    }),
    getAvailableSurveys: builder.query<any, void>({
      query: () => ({ url: "/survey/available", method: "GET" }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: Array.isArray(response?.data) ? response.data : [],
      }),
      providesTags: ["Surveys"],
    }),
    getSurveyById: builder.query<any, string>({
      query: (id) => ({ url: `/survey/${id}`, method: "GET" }),
      providesTags: ["Surveys"],
    }),
    createSurvey: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: "/survey", method: "POST", body }),
      invalidatesTags: ["Surveys"],
    }),
    updateSurvey: builder.mutation<any, { id: string } & Record<string, unknown>>({
      query: ({ id, ...body }) => ({ url: `/survey/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Surveys"],
    }),
    toggleSurvey: builder.mutation<any, string>({
      query: (id) => ({ url: `/survey/toggle/${id}`, method: "PATCH" }),
      invalidatesTags: ["Surveys"],
    }),
    deleteSurvey: builder.mutation<any, string>({
      query: (id) => ({ url: `/survey/${id}`, method: "DELETE" }),
      invalidatesTags: ["Surveys"],
    }),
    getSurveyQuestions: builder.query<any, string>({
      query: (surveyId) => ({
        url: `/survey-questions/${surveyId}/questions`,
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: Array.isArray(response?.data) ? response.data : [],
      }),
      providesTags: ["SurveyQuestions"],
    }),
    createSurveyQuestions: builder.mutation<
      any,
      { surveyId: string; questions: Record<string, unknown>[] }
    >({
      query: ({ surveyId, questions }) => ({
        url: `/survey-questions/${surveyId}`,
        method: "POST",
        body: questions,
      }),
      invalidatesTags: ["SurveyQuestions", "Surveys"],
    }),
    updateSurveyQuestion: builder.mutation<any, { id: string } & Record<string, unknown>>({
      query: ({ id, ...body }) => ({
        url: `/survey-questions/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SurveyQuestions"],
    }),
    deleteSurveyQuestion: builder.mutation<any, string>({
      query: (id) => ({ url: `/survey-questions/${id}`, method: "DELETE" }),
      invalidatesTags: ["SurveyQuestions", "Surveys"],
    }),
    submitSurveyAnswers: builder.mutation<
      any,
      { surveyId: string; answers: { question: string; answer: string | number }[] }
    >({
      query: ({ surveyId, answers }) => ({
        url: `/survey-answers/${surveyId}`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["Surveys", "SurveyResponses", "SurveyStats"],
    }),
    getSurveyResponses: builder.query<any, { surveyId: string; page?: number; limit?: number }>({
      query: ({ surveyId, page = 1, limit = 10 }) => ({
        url: `/survey-answers/${surveyId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["SurveyResponses"],
    }),
    getSurveyStats: builder.query<any, string>({
      query: (surveyId) => ({ url: `/survey-answers/${surveyId}/stats`, method: "GET" }),
      providesTags: ["SurveyStats"],
    }),
    getQuestionStats: builder.query<any, string>({
      query: (surveyId) => ({
        url: `/survey-answers/${surveyId}/question-stats`,
        method: "GET",
      }),
      providesTags: ["SurveyStats"],
    }),
    getSurveyResponseById: builder.query<any, string>({
      query: (id) => ({ url: `/survey-answers/by-id/${id}`, method: "GET" }),
      providesTags: ["SurveyResponses"],
    }),
  }),
});

export const {
  useGetSurveysQuery,
  useGetAvailableSurveysQuery,
  useGetSurveyByIdQuery,
  useCreateSurveyMutation,
  useUpdateSurveyMutation,
  useToggleSurveyMutation,
  useDeleteSurveyMutation,
  useGetSurveyQuestionsQuery,
  useCreateSurveyQuestionsMutation,
  useUpdateSurveyQuestionMutation,
  useDeleteSurveyQuestionMutation,
  useSubmitSurveyAnswersMutation,
  useGetSurveyResponsesQuery,
  useGetSurveyStatsQuery,
  useGetQuestionStatsQuery,
  useGetSurveyResponseByIdQuery,
} = surveySlice;
