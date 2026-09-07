import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/api";
import { clearAccessTokenCookie } from "@/utils/authSession";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = Cookies.get("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401 || result?.error?.status === 403) {
    clearAccessTokenCookie();
    api.dispatch({ type: "user/removeUser" });
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return result;
};

export default baseQueryWithReauth;
export { rawBaseQuery };
