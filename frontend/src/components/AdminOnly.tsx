import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import  type { JSX } from "react/jsx-dev-runtime";

export default function AdminOnly({ children }: { children: JSX.Element }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
