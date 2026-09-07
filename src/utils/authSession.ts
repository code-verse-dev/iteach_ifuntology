import Cookies from "js-cookie";

export function setAccessTokenCookie(token?: string) {
  if (!token) return;
  Cookies.set("accessToken", token, {
    secure: window.location.protocol === "https:",
    sameSite: "lax",
  });
}

export function clearAccessTokenCookie() {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
}
