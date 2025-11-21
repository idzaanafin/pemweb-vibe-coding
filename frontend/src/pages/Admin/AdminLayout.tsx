import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Content */}
      <main className="flex-1 p-6 pt-10 md:ml-64">
        <Outlet />
      </main>
    </div>
  );
}
