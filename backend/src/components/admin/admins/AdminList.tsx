type AdminRole = "super_admin" | "admin_offres" | "admin_users" | "admin";

interface Admin {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  created_at: string;
}
import { useState, useEffect } from "react";
import AdminCard from "./AdminCard";

export default function AdminList() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetch("/api/admins")
      .then(res => res.json())
      .then(data => setAdmins(data));
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-10">Administrateurs</h1>
      <div className="space-y-6">
        {admins.length === 0 ? (
          <p className="text-center text-muted-foreground text-xl py-20">
            Aucun administrateur
          </p>
        ) : (
          admins.map((admin: Admin) => (
            <AdminCard key={admin.id} admin={admin} />
          ))
        )}
      </div>
    </div>
  );
}