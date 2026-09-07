import { createApi } from "@reduxjs/toolkit/query/react";
import { UserRole } from "@/constants/roles";
import { rawBaseQuery } from "@/redux/reauth/baseQueryWithReauth";

export const authSlice = createApi({
  reducerPath: "authSlice",
  baseQuery: rawBaseQuery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<
      any,
      { identifier: string; password: string; role: UserRole }
    >({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<any, void>({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),
    }),

    getMyProfile: builder.query<any, void>({
      query: () => ({
        url: "/user/getMyProfile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),

    getAdminAccount: builder.query<any, void>({
      query: () => ({
        url: "/user/admin-account",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),

    forgetPassword: builder.mutation<
      any,
      { data: { email: string; type: UserRole } }
    >({
      query: ({ data }) => ({
        url: "/reset/sendVerificationCode",
        method: "POST",
        body: data,
      }),
    }),

    verifyOtp: builder.mutation<any, { email: string; code: string }>({
      query: ({ email, code }) => ({
        url: "/reset/verifyRecoverCode",
        method: "POST",
        body: { email, code },
      }),
    }),

    resetPassword: builder.mutation<
      any,
      { email: string; code: string; password: string; type: UserRole }
    >({
      query: ({ email, code, password, type }) => ({
        url: "/reset/resetPassword",
        method: "POST",
        body: { email, code, password, type },
      }),
    }),

    updateProfile: builder.mutation<
      any,
      {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        organization?: string;
      }
    >({
      query: (body) => ({
        url: "/user/editProfile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    updatePassword: builder.mutation<
      any,
      { email: string; oldPassword: string; password: string; type: UserRole }
    >({
      query: (body) => ({
        url: "/reset/changePassword",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMyProfileQuery,
  useGetAdminAccountQuery,
  useForgetPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
} = authSlice;
