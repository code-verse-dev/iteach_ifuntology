import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";

const asList = (response: any) => ({
  status: response?.status,
  message: response?.message,
  data: Array.isArray(response?.data) ? response.data : [],
});

export const certificateSlice = createApi({
  reducerPath: "certificateSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Certificates", "CertificateStats"],
  endpoints: (builder) => ({
    getMyCertificates: builder.query<any, void>({
      query: () => ({
        url: "/certificate/my-certificates",
        method: "GET",
      }),
      transformResponse: asList,
      providesTags: ["Certificates"],
    }),
    getMyCertificateByCourse: builder.query<any, string>({
      query: (courseType) => ({
        url: `/certificate/by-course/${encodeURIComponent(courseType)}`,
        method: "GET",
      }),
      providesTags: ["Certificates"],
    }),
    getCertificateById: builder.query<any, string>({
      query: (id) => ({
        url: `/certificate/${id}`,
        method: "GET",
      }),
      providesTags: ["Certificates"],
    }),
    getStudentCertificates: builder.query<any, string>({
      query: (studentId) => ({
        url: `/certificate/student/${studentId}`,
        method: "GET",
      }),
      transformResponse: asList,
      providesTags: ["Certificates"],
    }),
    getAdminCertificates: builder.query<
      any,
      { page?: number; limit?: number; keyword?: string; courseType?: string } | void
    >({
      query: (params) => ({
        url: "/certificate",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.keyword ? { keyword: params.keyword } : {}),
          ...(params?.courseType ? { courseType: params.courseType } : {}),
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
      providesTags: ["Certificates"],
    }),
    getCertificateStats: builder.query<any, void>({
      query: () => ({
        url: "/certificate/stats",
        method: "GET",
      }),
      providesTags: ["CertificateStats"],
    }),
    getTeacherStudent: builder.query<any, string>({
      query: (studentId) => ({
        url: `/invitation/my-students/${studentId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetMyCertificatesQuery,
  useGetMyCertificateByCourseQuery,
  useGetCertificateByIdQuery,
  useGetStudentCertificatesQuery,
  useGetAdminCertificatesQuery,
  useGetCertificateStatsQuery,
  useGetTeacherStudentQuery,
} = certificateSlice;

export function certificateTitle(cert: any) {
  const courseType = cert?.course?.courseType ?? cert?.courseType ?? "";
  return courseType ? `${courseType} Course Completion` : "Course Completion";
}

export function certificateStudentName(cert: any) {
  return `${cert?.student?.firstName ?? ""} ${cert?.student?.lastName ?? ""}`.trim() || "Student";
}

export function certificateViewPath(role: string | undefined, certificateId: string) {
  if (role === "admin") return `/admin/certificates/${certificateId}`;
  if (role === "teacher") return `/teacher/certificates/${certificateId}`;
  return `/student/certificates/${certificateId}`;
}
