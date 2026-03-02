import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchBar from '@/components/SearchBar';
import { Badge } from "@/components/ui/badge";
import { Users, Search, Mail, Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { authHeaders } from '@/lib/headers';
import ConfirmButton from '@/components/ConfirmButton';

interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: "candidat" | "entreprise";
  created_at: string;
  is_blocked: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adminDeleteTarget, setAdminDeleteTarget] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "candidat" | "entreprise">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (userTypeFilter !== "all") {
      filtered = filtered.filter((user) => user.user_type === userTypeFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, userTypeFilter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        // Normalize user_type values to french labels used in admin UI
        const normalized = (data || []).map((u: any) => ({
          ...u,
          user_type: ((): "candidat" | "entreprise" => {
            const ut = String(u.user_type || '').toLowerCase();
            if (ut === 'candidate' || ut === 'candidat') return 'candidat';
            if (ut === 'company' || ut === 'entreprise') return 'entreprise';
            return 'candidat';
          })(),
        }));
        setUsers(normalized);
      } else {
        const demoUsers: User[] = [
          {
            id: "1",
            full_name: "Marie Kongo",
            email: "marie@example.com",
            user_type: "candidat",
            created_at: "2025-12-05",
            is_blocked: false,
          },
          {
            id: "2",
            full_name: "Jean Entreprise",
            email: "jean@company.com",
            user_type: "entreprise",
            created_at: "2025-12-04",
            is_blocked: false,
          },
          {
            id: "3",
            full_name: "Sophie Candidat",
            email: "sophie@example.com",
            user_type: "candidat",
            created_at: "2025-12-03",
            is_blocked: false,
          },
        ];
        setUsers(demoUsers);
      }
    } catch (err) {
      console.error("Erreur fetch users:", err);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error('Erreur chargement utilisateur');
      const data = await res.json();
      setSelectedUser(data);
    } catch (err) {
      console.error('Erreur fetch user details:', err);
      toast.error('Impossible de charger les détails utilisateur');
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: authHeaders(undefined, 'adminToken') });
      if (!res.ok) throw new Error('Erreur suppression');
      toast.success('Utilisateur supprimé définitivement');
      setUsers(users.filter((u) => u.id !== id));
      setSelectedUser(null);
    } catch (err) {
      console.error('Delete user error:', err);
      toast.error('Impossible de supprimer l utilisateur');
    }
  };

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_blocked: newStatus } : user
        )
      );
      toast.success(newStatus ? "Utilisateur bloqué" : "Utilisateur débloqué");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const exportUsers = () => {
    const csv = [
      ["Nom", "Email", "Type", "Inscrit le", "Statut"],
      ...filteredUsers.map((u) => [
        u.full_name,
        u.email,
        u.user_type,
        new Date(u.created_at).toLocaleDateString("fr-FR"),
        u.is_blocked ? "Bloqué" : "Actif",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utilisateurs.csv";
    a.click();
    toast.success("Export réussi");
  };

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 flex items-center gap-4 mb-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          Gestion des utilisateurs
        </h1>
        <p className="text-xl text-muted-foreground">
          Consultez et gérez tous les candidats et entreprises inscrites
        </p>
      </div>

      <Card className="p-8 mb-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Rechercher</label>
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Nom ou email..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Type d'utilisateur</label>
            <select
              value={userTypeFilter}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all" || val === "candidat" || val === "entreprise") {
                  setUserTypeFilter(val);
                }
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous</option>
              <option value="candidat">Candidats</option>
              <option value="entreprise">Entreprises</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={exportUsers} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Détails utilisateur</h3>
              <div>
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>Fermer</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Nom complet:</strong> {selectedUser.full_name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Téléphone:</strong> {selectedUser.phone || '—'}</p>
                <p><strong>Pays:</strong> {selectedUser.country || '—'}</p>
                <p><strong>Date de naissance:</strong> {selectedUser.birthdate ? new Date(selectedUser.birthdate).toLocaleDateString('fr-FR') : '—'}</p>
                <p><strong>Type:</strong> {String(selectedUser.user_type).toLowerCase() === 'company' ? 'Entreprise' : 'Candidat'}</p>
              </div>
              <div>
                {selectedUser.profile_image_url && (
                  <img src={selectedUser.profile_image_url} alt="Profil" className="w-32 h-32 object-cover rounded-full" />
                )}
                <p className="mt-2"><strong>Parcours — Diplôme:</strong> {selectedUser.diploma || '—'}</p>
                <p><strong>Profession / Poste actuel:</strong> {selectedUser.profession || selectedUser.job_title || '—'}</p>
                <p><strong>Années d'expérience:</strong> {selectedUser.experience_years ?? '—'}</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Compétences</h4>
              <div className="flex gap-2 flex-wrap mt-2">
                {(selectedUser.skills || []).map((s: any) => (
                  <span key={s.id || s.skill_name} className="px-3 py-1 bg-gray-100 rounded-md">{s.skill_name || s}</span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Documents / Certifications</h4>
              <ul className="list-disc ml-6 mt-2">
                {(selectedUser.documents || []).map((d: any) => (
                  <li key={d.id}><a href={d.storage_url} target="_blank" rel="noreferrer" className="text-primary">{d.doc_type}</a></li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <ConfirmButton title="Supprimer ce compte ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => deleteUser(selectedUser.id)}>
                <Button variant="destructive">Supprimer définitivement</Button>
              </ConfirmButton>
            </div>
          </div>
        </div>
      )}

      {adminDeleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Suppression du compte — Informations</h3>
            <div className="prose mb-4">
              <p>En tant qu'administrateur, vous pouvez supprimer définitivement ce compte. Cette action est irréversible.</p>
              <p>Nous recommandons d'utiliser la suppression programmée (soft delete) pour respecter le délai de rétractation, mais vous pouvez supprimer immédiatement si nécessaire.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setAdminDeleteTarget(null)}>Annuler</Button>
              <ConfirmButton title="Supprimer ce compte ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => { deleteUser(adminDeleteTarget.id); setAdminDeleteTarget(null); }}>
                <Button variant="destructive">Supprimer définitivement</Button>
              </ConfirmButton>
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-6 font-medium text-gray-700">Nom</th>
                  <th className="text-left p-6 font-medium text-gray-700">Email</th>
                  <th className="text-left p-6 font-medium text-gray-700">Type</th>
                  <th className="text-left p-6 font-medium text-gray-700">Inscrit</th>
                  <th className="text-left p-6 font-medium text-gray-700">Statut</th>
                  <th className="text-right p-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-6 font-medium">{user.full_name}</td>
                    <td className="p-6 text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </td>
                    <td className="p-6">
                      <Badge variant={user.user_type === "candidat" ? "default" : "secondary"}>
                        {user.user_type === "candidat" ? "Candidat" : "Entreprise"}
                      </Badge>
                    </td>
                    <td className="p-6 text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-6">
                      <Badge variant={user.is_blocked ? "destructive" : "outline"}>
                        {user.is_blocked ? "Bloqué" : "Actif"}
                      </Badge>
                    </td>
                    <td className="p-6 text-right">
                      <Button
                        size="sm"
                        variant={user.is_blocked ? "default" : "destructive"}
                        onClick={() => toggleBlockUser(user.id, user.is_blocked)}
                      >
                        {user.is_blocked ? "Débloquer" : "Bloquer"}
                      </Button>
                      <Button size="sm" className="ml-2" onClick={() => fetchUserDetails(user.id)}>
                        Voir
                      </Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => setAdminDeleteTarget(user)}>
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Total utilisateurs</p>
          <p className="text-3xl font-bold mt-2">{users.length}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Candidats</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {users.filter((u) => u.user_type === "candidat").length}
          </p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Entreprises</p>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {users.filter((u) => u.user_type === "entreprise").length}
          </p>
        </Card>
      </div>
    </div>
  );
}
