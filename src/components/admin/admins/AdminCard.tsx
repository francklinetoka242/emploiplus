// src/components/admin/admins/AdminCard.tsx
import { Card } from "@/components/ui/card";
import { Shield, Mail, Calendar } from "lucide-react";

type AdminRole = "super_admin" | "admin_offres" | "admin_users" | "admin";

interface Admin {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

interface Props {
  admin: Admin;
}

export default function AdminCard({ admin }: Props) {
  return (
    <Card className="p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-xl">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{admin.first_name && admin.last_name ? `${admin.first_name} ${admin.last_name}` : admin.email}</h3>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {admin.email}
            </p>
            <p className="text-lg capitalize mt-2">
              Rôle : <strong>{admin.role.replace("_", " ")}</strong>
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Inscrit le {new Date(admin.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </Card>
  );
}