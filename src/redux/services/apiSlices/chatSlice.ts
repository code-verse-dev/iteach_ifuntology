import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { threads } from "@/mock/data";
import { appendMessage, delay, listMessages, ok } from "@/mock/store";

export const chatSlice = createApi({
  reducerPath: "chatSlice",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Chat"],
  endpoints: (builder) => ({
    getThreads: builder.query({
      async queryFn() {
        await delay();
        return { data: ok(threads) };
      },
      providesTags: ["Chat"],
    }),
    getMessages: builder.query({
      async queryFn(threadId: string) {
        await delay(120);
        return { data: ok(listMessages(threadId)) };
      },
      providesTags: ["Chat"],
    }),
    sendMessage: builder.mutation({
      async queryFn(body: { threadId: string; text: string }) {
        await delay(120);
        return { data: ok(appendMessage(body.threadId, body.text)) };
      },
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const { useGetThreadsQuery, useGetMessagesQuery, useSendMessageMutation } = chatSlice;
