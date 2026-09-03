export type UserRole = "admin" | "teacher" | "student";

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export const DEMO_OTP = "123456";
export const DEMO_PASSWORD = "Password123!";
