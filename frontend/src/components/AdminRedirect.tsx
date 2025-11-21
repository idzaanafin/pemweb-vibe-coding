import { Navigate, useLocation } from "react-router-dom";
import { getUser } from "../utils/auth";
import type { JSX } from "react/jsx-dev-runtime";

export default function AdminRedirect({ children }: { children: JSX.Element }) {
  const user = getUser();
  const { pathname } = useLocation();

  if (user?.role === "admin") {
    if (pathname.startsWith("/rooms")) {
      return <Navigate to="/admin/rooms" replace />;
    }
    if (pathname.startsWith("/reservations")) {
      return <Navigate to="/admin/reservations" replace />;
    }
  }

  return children;
}
