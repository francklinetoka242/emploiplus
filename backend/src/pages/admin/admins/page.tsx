import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Mail, Calendar, Trash2, Edit, AlertCircle } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import { toast } from "sonner";
import AdminForm from "@/components/admin/admins/AdminForm";

type AdminRole = "super_admin" | "admin_offres" | "admin_users" | "admin";

interface Admin {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  created_at: string;
  is_blocked: boolean;
}

export default function AdminsPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");

  useEffect(() => {
    fetchAdmins();
    // fetch admin stats if super admin
      try {
      const current = JSON.parse(localStorage.getItem('admin') || '{}');
      if (current && current.role === 'super_admin') {
        const adminToken = localStorage.getItem('adminToken');
        const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
        fetch('/api/admin/stats', { headers })
          .then((r) => r.ok ? r.json() : Promise.reject(r))
          .then((d) => setStats(d))
          .catch((e) => { console.error('Fetch admin stats error', e); });
      }
    } catch (e) {}
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admins");
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      } else {
        const demoAdmins: Admin[] = [
          {
            id: "1",
            full_name: "Francklin Etoka",
            email: "super@emploi.cg",
            role: "super_admin",
            created_at: "2025-04-05",
            is_blocked: false,
          },
        ];
        setAdmins(demoAdmins);
      }
    } catch (err) {
      console.error("Erreur fetch admins:", err);
      toast.error("Erreur lors du chargement des administrateurs");
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (adminId: string) => {
    try {
      setAdmins(admins.filter((a) => a.id !== adminId));
      toast.success("Administrateur supprimé");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleBlockAdmin = async (adminId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      setAdmins(
        admins.map((a) =>
          a.id === adminId ? { ...a, is_blocked: newStatus } : a
        )
      );
      toast.success(newStatus ? "Administrateur bloqué" : "Administrateur débloqué");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getRoleColor = (role: AdminRole) => {
    switch (role) {
      case "super_admin":
        return "from-red-500 to-red-600";
      case "admin_offres":
        return "from-green-500 to-green-600";
      case "admin_users":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRoleLabel = (role: AdminRole) => {
    const labels: Record<AdminRole, string> = {
      super_admin: "Super Administrateur",
      admin_offres: "Admin Offres",
      admin_users: "Admin Utilisateurs",
      admin: "Administrateur",
    };
    return labels[role];
  };

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 flex items-center gap-4 mb-3">
          <div className="p-2 bg-orange-600 rounded-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          Gestion des administrateurs
        </h1>
        <p className="text-xl text-muted-foreground">
          Gérez les accès administrateur et les permissions
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-muted-foreground">Utilisateurs</div>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <div className="text-xs text-muted-foreground">Candidats: {stats.total_candidates} • Entreprises: {stats.total_companies}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-muted-foreground">Offres</div>
            <div className="text-2xl font-bold">{stats.total_jobs}</div>
            <div className="text-xs text-muted-foreground">Publiées par entreprises (top): {stats.jobs_per_company?.slice(0,3).map((c:any)=>c.company || c.company_name).join(', ')}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-muted-foreground">Candidatures</div>
            <div className="text-2xl font-bold">{stats.total_applications}</div>
            <div className="text-xs text-muted-foreground">Sélectionnées pour entretien: {stats.total_validated_applications}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-muted-foreground">Activité récente</div>
            <div className="text-sm text-muted-foreground">Dernières candidatures: {stats.recent_applications ? stats.recent_applications.length : 0}</div>
          </div>
        </div>
      )}

      {/* Bouton Créer Admin */}
      <div className="mb-8">
        <Button
          size="lg"
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => {
            setEditingAdmin(null);
            setShowForm(true);
          }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Créer un administrateur
        </Button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card className="p-8 mb-8 border-l-4 border-l-orange-600">
          <h3 className="text-2xl font-bold mb-6">
            {editingAdmin ? "Modifier l'administrateur" : "Créer un administrateur"}
          </h3>
          <AdminForm
            admin={editingAdmin || undefined}
            onSuccess={() => {
              setShowForm(false);
              setEditingAdmin(null);
              fetchAdmins();
            }}
          />
        </Card>
      )}

      {/* Liste des admins */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Chargement...</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="h-20 w-20 mx-auto text-gray-300 mb-6" />
          <p className="text-2xl text-muted-foreground">Aucun administrateur</p>
        </div>
      ) : (
        <div className="space-y-6">
          {admins.map((admin) => (
            <Card
              key={admin.id}
              className="p-8 hover:shadow-lg transition border-l-4 border-l-orange-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`p-4 bg-gradient-to-br ${getRoleColor(admin.role)} rounded-xl shadow-lg`}>
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{admin.first_name && admin.last_name ? `${admin.first_name} ${admin.last_name}` : (admin.nom && admin.prenom ? `${admin.prenom} ${admin.nom}` : admin.email)}</h3>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {admin.email}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="inline-block px-4 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {getRoleLabel(admin.role)}
                      </span>
                      {admin.is_blocked && (
                        <span className="inline-block px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          Bloqué
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(admin.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="flex items-center gap-3">
                    {currentAdmin.role === "super_admin" && admin.id !== currentAdmin.id && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAdmin(admin);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant={admin.is_blocked ? "default" : "destructive"}
                          onClick={() => toggleBlockAdmin(admin.id, admin.is_blocked)}
                        >
                          {admin.is_blocked ? "Débloquer" : "Bloquer"}
                        </Button>
                        <ConfirmButton title="Supprimer cet administrateur ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => deleteAdmin(admin.id)}>
                          <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                        </ConfirmButton>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-3xl font-bold mt-2">{admins.length}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Super Admins</p>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {admins.filter((a) => a.role === "super_admin").length}
          </p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Admin Offres</p>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {admins.filter((a) => a.role === "admin_offres").length}
          </p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Actifs</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {admins.filter((a) => !a.is_blocked).length}
          </p>
        </Card>
      </div>
    </div>
  );
}
