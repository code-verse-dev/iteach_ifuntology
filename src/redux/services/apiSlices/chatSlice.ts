import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";

export const chatSlice = createApi({
  reducerPath: "chatSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Chats", "Messages"],
  endpoints: (builder) => ({
    getChats: builder.query<any, { keyword?: string } | void>({
      query: (params) => ({
        url: "/chat",
        method: "GET",
        params: {
          page: 1,
          limit: 100,
          ...(params?.keyword ? { keyword: params.keyword } : {}),
        },
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: response?.data?.docs ?? [],
      }),
      providesTags: ["Chats"],
    }),
    createChat: builder.mutation<any, { sender: string; receiver: string }>({
      query: (body) => ({
        url: "/chat",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chats"],
    }),
    getMessages: builder.query<any, string>({
      query: (chatId) => ({
        url: `/message/${chatId}`,
        method: "GET",
        params: { page: 1, limit: 100 },
      }),
      transformResponse: (response: any) => ({
        status: response?.status,
        message: response?.message,
        data: Array.isArray(response?.data)
          ? response.data
          : response?.data?.docs ?? [],
      }),
      providesTags: (_result, _error, chatId) => [{ type: "Messages", id: chatId }],
    }),
    sendMessage: builder.mutation<any, { chatId: string; content: string }>({
      query: (body) => ({
        url: "/message",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chats"],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useCreateChatMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatSlice;
