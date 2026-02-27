/**
 * Admin Layout Page
 * Rebuilt from scratch - 2026
 * Uses new clean AdminNavProvider and components
 */

import { AdminNavProvider } from "@/context/AdminNavContext";
import { NewAdminLayout } from "@/components/admin/NewAdminLayout";

export default function AdminLayout() {
  return (
    <AdminNavProvider>
      <NewAdminLayout />
    </AdminNavProvider>
  );
}