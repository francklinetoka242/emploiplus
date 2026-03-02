// src/components/admin/AdminLayout.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
  adminLevel?: number;
}

export default function AdminLayout({ children, adminLevel = 1 }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Déconnexion réussie");
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} adminLevel={adminLevel} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 shadow-sm h-20 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-slate-600" />
            ) : (
              <Menu className="h-6 w-6 text-slate-600" />
            )}
          </button>

          {/* SPACER */}
          <div className="flex-1"></div>

          {/* HEADER RIGHT SECTION - INFO & ACTIONS */}
          <AdminHeader admin={admin} onLogout={handleLogout} />
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
