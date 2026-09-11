import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";
import { getViewerTimeZone } from "@/constants/practicalSheet";

export type PracticalSheetRow = {
  entryDate?: string | null;
  cells: Record<string, string>;
  approved?: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

export type PracticalSheetMonthProgress = {
  filled: number;
  totalDays: number;
  percent: number;
  from: string;
  to: string;
};

export type TeacherPracticalEntry = {
  studentId: string;
  studentName: string;
  courseType: string;
  entryDate: string;
  cells: Record<string, string>;
  total: string;
  approved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

export const practicalSheetSlice = createApi({
  reducerPath: "practicalSheetSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["PracticalSheet", "StudentPracticalSheet", "TeacherPracticalEntries"],
  endpoints: (builder) => ({
    getPracticalSheet: builder.query<
      any,
      { courseType: string; from?: string; to?: string }
    >({
      query: ({ courseType, from, to }) => ({
        url: `/practical-sheet/${encodeURIComponent(courseType)}`,
        method: "GET",
        params: {
          timezone: getViewerTimeZone(),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "PracticalSheet", id: arg.courseType },
      ],
    }),
    saveDailyPracticalEntry: builder.mutation<
      any,
      { courseType: string; cells: Record<string, string> }
    >({
      query: ({ courseType, cells }) => ({
        url: `/practical-sheet/${encodeURIComponent(courseType)}/daily`,
        method: "PUT",
        body: { cells, timezone: getViewerTimeZone() },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "PracticalSheet", id: arg.courseType },
      ],
    }),
    getStudentPracticalSheet: builder.query<
      any,
      { studentId: string; courseType: string; from?: string; to?: string }
    >({
      query: ({ studentId, courseType, from, to }) => ({
        url: `/practical-sheet/student/${studentId}/${encodeURIComponent(courseType)}`,
        method: "GET",
        params: {
          timezone: getViewerTimeZone(),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "StudentPracticalSheet", id: `${arg.studentId}:${arg.courseType}` },
      ],
    }),
    getTeacherPracticalEntries: builder.query<
      any,
      {
        courseType?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ courseType, from, to, page = 1, limit = 20 } = {}) => ({
        url: "/practical-sheet/teacher/entries",
        method: "GET",
        params: {
          page,
          limit,
          timezone: getViewerTimeZone(),
          ...(courseType ? { courseType } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      }),
      providesTags: ["TeacherPracticalEntries"],
    }),
    teacherUpdatePracticalEntry: builder.mutation<
      any,
      {
        studentId: string;
        courseType: string;
        entryDate: string;
        cells?: Record<string, string>;
        approve?: boolean;
      }
    >({
      query: ({ studentId, courseType, entryDate, cells, approve }) => ({
        url: `/practical-sheet/student/${studentId}/${encodeURIComponent(courseType)}/entry/${entryDate}`,
        method: "PUT",
        body: {
          ...(cells ? { cells } : {}),
          ...(approve ? { approve: true } : {}),
        },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "StudentPracticalSheet", id: `${arg.studentId}:${arg.courseType}` },
        "TeacherPracticalEntries",
      ],
    }),
    bulkApproveTodayPracticalEntries: builder.mutation<
      any,
      { courseType?: string } | void
    >({
      query: (body) => ({
        url: "/practical-sheet/teacher/entries/bulk-approve-today",
        method: "POST",
        body: {
          ...(body ?? {}),
          timezone: getViewerTimeZone(),
        },
      }),
      invalidatesTags: ["TeacherPracticalEntries", "StudentPracticalSheet"],
    }),
  }),
});

export const {
  useGetPracticalSheetQuery,
  useSaveDailyPracticalEntryMutation,
  useGetStudentPracticalSheetQuery,
  useGetTeacherPracticalEntriesQuery,
  useTeacherUpdatePracticalEntryMutation,
  useBulkApproveTodayPracticalEntriesMutation,
} = practicalSheetSlice;
