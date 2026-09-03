import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { DEMO_PASSWORD, UserRole } from "@/constants/roles";
import {
  changeOwnPassword,
  clearSession,
  delay,
  fail,
  findUserByEmail,
  guestLogin,
  ok,
  persistSession,
  publicUser,
  resetPassword,
  setOtp,
  updateProfile,
  verifyOtp,
} from "@/mock/store";

export const authSlice = createApi({
  reducerPath: "authSlice",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation({
      async queryFn(body: { identifier: string; password: string; role: UserRole }) {
        await delay();
        if (!body.role || !body.identifier || !body.password) {
          return { error: { status: 400, data: fail("Choose a role and enter your credentials") } };
        }
        const user = guestLogin(body.identifier, body.role);
        const token = persistSession(user);
        return { data: ok({ user: publicUser(user), token }, "Signed in successfully") };
      },
    }),
    logout: builder.mutation<any, void>({
      async queryFn() {
        await delay(120);
        clearSession();
        return { data: ok({}, "Signed out") };
      },
    }),
    forgetPassword: builder.mutation<any, { data: { email: string } }>({
      async queryFn({ data }) {
        await delay();
        const user = findUserByEmail(data.email);
        if (!user) return { error: { status: 404, data: fail("No account found for that email") } };
        setOtp(data.email);
        return { data: ok({ email: data.email }, "Recovery email sent") };
      },
    }),
    verifyOtp: builder.mutation<any, { email: string; code: string }>({
      async queryFn({ email, code }) {
        await delay();
        if (!verifyOtp(email, code)) {
          return { error: { status: 400, data: fail("Invalid verification code") } };
        }
        return { data: ok({ email, code }, "Code verified") };
      },
    }),
    resetPassword: builder.mutation<any, { email: string; code: string; password: string }>({
      async queryFn({ email, code, password }) {
        await delay();
        const user = resetPassword(email, code, password);
        if (!user) return { error: { status: 400, data: fail("Could not reset password") } };
        return { data: ok(user, "Password updated") };
      },
    }),
    updateProfile: builder.mutation({
      async queryFn(body: { id: string; firstName: string; lastName: string; phone?: string }) {
        await delay();
        const user = updateProfile(body.id, body);
        if (!user) return { error: { status: 404, data: fail("User not found") } };
        return { data: ok({ user }, "Profile updated") };
      },
    }),
    updatePassword: builder.mutation({
      async queryFn(body: { id: string; currentPassword: string; password: string }) {
        await delay();
        const result = changeOwnPassword(body.id, body.currentPassword, body.password);
        if ("error" in result) return { error: { status: 400, data: fail(result.error) } };
        return { data: ok(result.user, "Password updated") };
      },
    }),
    demoHint: builder.query({
      async queryFn() {
        return { data: ok({ password: DEMO_PASSWORD }) };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgetPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
} = authSlice;
