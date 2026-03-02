// src/pages/Admin.tsx
/**
 * ================================================================================
 * ADMIN CONSOLE - SUPER ADMIN INTERFACE (REBUILT)
 * ================================================================================
 * 
 * NEW STRUCTURE:
 * - AdminLayout: Main container with sidebar + header
 * - Dynamic content area based on routing
 * - Clean separation of concerns
 * 
 * MENU ITEMS (11 sections):
 * 1. Tableau de bord
 * 2. Offres d'emploi
 * 3. Formations
 * 4. Catalogues & Services
 * 5. Utilisateurs
 * 6. Notifications
 * 7. Administrateurs
 * 8. Historique de connexion
 * 9. FAQ
 * 10. Documentations
 * 11. Santé du Système
 * ================================================================================
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboardPage from "@/components/admin/pages/AdminDashboardPage";

// OLD IMPORTS - COMMENTED OUT FOR CLEANUP
// import { Card } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { api } from "@/lib/api";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { Loader2, Briefcase, BookOpen, Bell, Trash2, BarChart3, DollarSign, MessageSquare, FileCheck, LogIn, ShoppingCart, AlertTriangle } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const adminLevel = admin.level || 0; // 1=Super Admin, 2=Admin Offres, 3=Admin Users

  // ROUTE-BASED CONTENT RENDERING
  // Each route will display the appropriate component
  
  return (
    <AdminLayout adminLevel={adminLevel}>
      <AdminDashboardPage />
    </AdminLayout>
  );
};

/**
 * ================================================================================
 * DEPRECATED TAB-BASED CODE - KEPT FOR REFERENCE
 * ================================================================================ 
 * 
 * All old tab-based content has been moved to dedicated page components.
 * Please use the new page component files instead.
 * 
 * Old components list:
 * - AdminDashboardPage: Main dashboard
 * - JobsManagementPage: Job offers
 * - FormationsManagementPage: Trainings
 * - ServicesManagementPage: Services & catalogues
 * - UsersManagementPage: Users
 * - NotificationsManagementPage: Notifications
 * - AdminsManagementPage: Admin accounts
 * - LoginHistoryPage: Login history
 * - FAQManagementPage: FAQ
 * - DocumentationPage: Documentation
 * - SystemHealthPage: System health
 * 
 * ================================================================================
 */


export default Admin;