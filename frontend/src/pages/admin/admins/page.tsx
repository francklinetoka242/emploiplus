import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Mail, Calendar, Trash2, Edit, AlertCircle, Settings, Users, Building, Briefcase, FileText, Activity } from "lucide-react";
import ConfirmButton from '@/components/ConfirmButton';
import { toast } from "sonner";
import AdminPermissionsTable from "@/components/AdminPermissionsTable";
import { authHeaders } from "@/lib/headers";

interface Admin {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  permissions?: string[] | null;
  created_at: string;
  is_blocked: boolean;
}

interface AdminStats {
  total: number;
  super_admins: number;
  custom_permissions: number;
  active: number;
  total_users?: number;
  total_candidates?: number;
  total_companies?: number;
  total_jobs?: number;
  total_applications?: number;
  total_validated_applications?: number;
  recent_applications?: any[];
  jobs_per_company?: any[];
}

interface AdminCreateFormProps {
  admin?: Admin | null;
  onSuccess: () => void;
}

function AdminCreateForm({ admin, onSuccess }: AdminCreateFormProps) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    if (admin) {
      setForm({
        first_name: admin.first_name || "",
        last_name: admin.last_name || "",
        email: admin.email,
        password: "",
        permissions: admin.permissions || [],
      });
    }
  }, [admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const adminToken = localStorage.getItem('adminToken');
    const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
    
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      permissions: form.permissions,
      ...(form.password && { password: form.password }),
    };

    try {
      const url = admin ? `/api/admin/management/admins/${admin.id}` : "/api/admin/management/admins";
      const method = admin ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(admin ? "Administrateur modifié" : "Administrateur créé");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la sauvegarde");
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prénom</label>
          <input
            type="text"
            value={form.first_name}
            onChange={(e) => setForm(prev => ({ ...prev, first_name: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            value={form.last_name}
            onChange={(e) => setForm(prev => ({ ...prev, last_name: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Mot de passe {admin ? '(laisser vide pour ne pas changer)' : '*'}</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
          className="w-full p-3 border rounded-lg"
          required={!admin}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-4">Permissions</label>
        <AdminPermissionsTable
          adminId={admin?.id || 'new'}
          currentPermissions={form.permissions}
          onPermissionsChange={(permissions) => setForm(prev => ({ ...prev, permissions }))}
          isSuperAdmin={false}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
          {admin ? "Modifier l'administrateur" : "Créer l'administrateur"}
        </Button>
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");

  useEffect(() => {
    fetchAdmins();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
      const response = await fetch('/api/admin/stats', { headers });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || data);
      }
    } catch (e) {
      console.error('Fetch admin stats error', e);
    }
  };

  const fetchAdmins = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
      const response = await fetch("/api/admins", { headers });
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        // Extraire le tableau d'admins de plusieurs formats possibles
        let list: Admin[] = [];
        if (Array.isArray(result)) {
          list = result;
        } else if (result.admins && Array.isArray(result.admins)) {
          list = result.admins;
        } else if (result.data && Array.isArray(result.data)) {
          list = result.data;
        } else {
          list = [];
        }
        
        // Normaliser les admins: initialiser permissions à [] s'il est undefined ou null
        const normalizedAdmins = (Array.isArray(list) ? list : []).map(admin => ({
          ...admin,
          permissions: admin.permissions && Array.isArray(admin.permissions) ? admin.permissions : [],
        }));
        
        console.log('Processed admins list:', normalizedAdmins);
        setAdmins(normalizedAdmins);
      } else {
        console.error("Erreur lors du chargement:", response.status);
        toast.error(`Erreur lors du chargement des administrateurs (${response.status})`);
        setAdmins([]);
      }
    } catch (err) {
      console.error("Erreur fetch admins:", err);
      toast.error("Erreur lors du chargement des administrateurs");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (adminId: string) => {
    try {
      // optimistic UI update
      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
      const res = await fetch(`/api/admin/management/admins/${adminId}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      toast.success("Administrateur supprimé");
    } catch (err) {
      console.error('deleteAdmin error', err);
      toast.error("Erreur lors de la suppression");
      // rollback UI by refetching list
      fetchAdmins();
    }
  };

  const toggleBlockAdmin = async (adminId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      // optimistic update
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === adminId ? { ...a, is_blocked: newStatus } : a
        )
      );
      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
      const endpoint = `/api/admin/management/admins/${adminId}/${newStatus ? 'block' : 'unblock'}`;
      const res = await fetch(endpoint, { method: 'POST', headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      toast.success(newStatus ? "Administrateur bloqué" : "Administrateur débloqué");
    } catch (err) {
      console.error('toggleBlockAdmin error', err);
      toast.error("Erreur lors de la mise à jour");
      fetchAdmins();
    }
  };

  const handlePermissionsChange = (adminId: string, newPermissions: string[]) => {
    setAdmins(prev => prev.map(admin => 
      admin.id === adminId 
        ? { ...admin, permissions: newPermissions }
        : admin
    ));
    toast.success("Permissions mises à jour");
  };

  const getPermissionsSummary = (permissions?: string[] | null) => {
    const perms = permissions || [];
    if (!perms || perms.length === 0) return "Aucune permission";
    
    const modules = perms.map(p => p.split(':')[0]).filter((v, i, a) => a.indexOf(v) === i);
    return `${modules.length} module(s) : ${modules.join(', ')}`;
  };

  const isSuperAdmin = (permissions?: string[] | null) => {
    const perms = permissions || [];
    return perms.includes('all') || perms.length > 10; // Simple check
  };

  return (
    <div className="p-10 h-full overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
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
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-muted-foreground">Super Admins</div>
            <div className="text-2xl font-bold">{stats.super_admins}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-muted-foreground">Permissions personnalisées</div>
            <div className="text-2xl font-bold">{stats.custom_permissions}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-muted-foreground">Actifs</div>
            <div className="text-2xl font-bold">{stats.active}</div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <div className="text-sm text-muted-foreground">Utilisateurs</div>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <div className="text-xs text-muted-foreground">Candidats: {stats.total_candidates} • Entreprises: {stats.total_companies}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <Briefcase className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-sm text-muted-foreground">Offres</div>
            <div className="text-2xl font-bold">{stats.total_jobs}</div>
            <div className="text-xs text-muted-foreground">Publiées par entreprises (top): {stats.jobs_per_company?.slice(0,3).map((c:any)=>c.company || c.company_name).join(', ')}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <div className="text-sm text-muted-foreground">Candidatures</div>
            <div className="text-2xl font-bold">{stats.total_applications}</div>
            <div className="text-xs text-muted-foreground">Sélectionnées pour entretien: {stats.total_validated_applications}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <Activity className="h-8 w-8 text-orange-600 mb-2" />
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
          <AdminCreateForm
            admin={editingAdmin}
            onSuccess={() => {
              setShowForm(false);
              setEditingAdmin(null);
              fetchAdmins();
            }}
          />
        </Card>
      )}

      {/* Gestion des permissions */}
      {showPermissions && selectedAdmin && (
        <Card className="p-8 mb-8 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">
              Permissions de {selectedAdmin.full_name || selectedAdmin.email}
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                setShowPermissions(false);
                setSelectedAdmin(null);
              }}
            >
              Fermer
            </Button>
          </div>
          <AdminPermissionsTable
            adminId={selectedAdmin.id}
            currentPermissions={selectedAdmin.permissions || []}
            onPermissionsChange={(permissions) => handlePermissionsChange(selectedAdmin.id, permissions)}
            isSuperAdmin={isSuperAdmin(selectedAdmin.permissions)}
          />
        </Card>
      )}

      {/* Liste des admins */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Chargement...</div>
      ) : !Array.isArray(admins) || admins.length === 0 ? (
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
                  <div className={`p-4 bg-gradient-to-br ${isSuperAdmin(admin.permissions) ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'} rounded-xl shadow-lg`}>
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{admin.first_name && admin.last_name ? `${admin.first_name} ${admin.last_name}` : admin.email}</h3>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {admin.email}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="inline-block px-4 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {isSuperAdmin(admin.permissions) ? 'Super Administrateur' : 'Permissions personnalisées'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getPermissionsSummary(admin.permissions)}
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
                    {(isSuperAdmin(currentAdmin.permissions || []) || currentAdmin.permissions?.includes('admins:edit')) && admin.id !== currentAdmin.id && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowPermissions(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Permissions
                        </Button>
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
          <p className="text-sm text-muted-foreground">Permissions personnalisées</p>
          <p className="text-3xl font-bold mt-2 text-purple-600">
            {admins.filter((a) => !a.role || (a.permissions && a.permissions.length > 0)).length}
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
