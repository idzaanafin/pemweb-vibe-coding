import { Navigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import  type { JSX } from "react/jsx-dev-runtime";

export default function GuestOnly({ children }: { children: JSX.Element }) {
  if (getToken()) return <Navigate to="/" replace />;
  return children;
}
