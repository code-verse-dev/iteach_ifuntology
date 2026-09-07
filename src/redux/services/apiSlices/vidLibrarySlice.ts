import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";

export const vidLibrarySlice = createApi({
  reducerPath: "vidLibrarySlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["VidLibrary", "VidLibraryTypes"],
  endpoints: (builder) => ({
    getAccessibleCourseTypes: builder.query<any, void>({
      query: () => ({
        url: "/vid-library/accessible-course-types",
        method: "GET",
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: Array.isArray(response?.data?.courseTypes) ? response.data.courseTypes : [],
      }),
      providesTags: ["VidLibraryTypes"],
    }),
    getVideos: builder.query<
      any,
      { page?: number; limit?: number; courseType?: string; keyword?: string } | void
    >({
      query: (params) => ({
        url: "/vid-library",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          ...(params?.courseType ? { courseType: params.courseType } : {}),
          ...(params?.keyword ? { keyword: params.keyword } : {}),
        },
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: response?.data?.docs ?? [],
        meta: {
          totalDocs: response?.data?.totalDocs ?? 0,
          page: response?.data?.page ?? 1,
          limit: response?.data?.limit ?? 12,
          totalPages: response?.data?.totalPages ?? 1,
        },
      }),
      providesTags: ["VidLibrary"],
    }),
    createVideo: builder.mutation<any, { courseType: string; title?: string; video: File }>({
      query: ({ courseType, title, video }) => {
        const formData = new FormData();
        formData.append("courseType", courseType);
        if (title?.trim()) formData.append("title", title.trim());
        formData.append("video", video);
        return { url: "/vid-library", method: "POST", body: formData };
      },
      invalidatesTags: ["VidLibrary"],
    }),
    deleteVideo: builder.mutation<any, string>({
      query: (id) => ({
        url: `/vid-library/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VidLibrary"],
    }),
  }),
});

export const {
  useGetAccessibleCourseTypesQuery,
  useGetVideosQuery,
  useCreateVideoMutation,
  useDeleteVideoMutation,
} = vidLibrarySlice;
