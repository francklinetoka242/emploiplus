// src/pages/admin/layout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-72">
        <Outlet />
      </main>
    </div>
  );
}