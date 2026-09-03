import { jwtDecode } from "jwt-decode";
import React, { ReactNode } from "react";
import { Navigate } from "react-router";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { UserRole } from "@/constants/roles";
import { RootState } from "@/redux/store";

interface Props {
  children: ReactNode;
  roles?: UserRole[];
}

interface JwtPayload {
  _id: string;
  email?: string;
  role?: UserRole;
  exp: number;
  [key: string]: any;
}

const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const token = Cookies.get("accessToken");
  const user = useSelector((state: RootState) => state.user.userData);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwtDecode<JwtPayload>(token);
  } catch {
    Cookies.remove("accessToken");
    return <Navigate to="/login" replace />;
  }

  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    Cookies.remove("accessToken");
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || decoded.role) as UserRole | undefined;
  if (roles?.length && role && !roles.includes(role)) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
