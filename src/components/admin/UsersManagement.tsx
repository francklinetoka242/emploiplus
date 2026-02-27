import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Lock, Unlock, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  full_name: string;
  email: string;
  user_type: string;
  is_blocked?: boolean;
  company_name?: string;
  created_at: string;
}

export const UsersManagement = () => {
  const [candidates, setCandidates] = useState<User[]>([]);
  const [companies, setCompanies] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("candidates");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      const allUsers: User[] = await response.json();

      const cands = allUsers.filter(u => u.user_type?.toLowerCase() === 'candidate' || u.user_type?.toLowerCase() === 'candidat');
      const comps = allUsers.filter(u => u.user_type?.toLowerCase() === 'company' || u.user_type?.toLowerCase() === 'entreprise');

      setCandidates(cands);
      setCompanies(comps);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockUser = async (userId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_blocked: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update user");

      toast.success(currentStatus ? "Utilisateur débloqué" : "Utilisateur bloqué");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) return;

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast.success("Utilisateur supprimé");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const filterUsers = (users: User[]) => {
    if (!searchTerm) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter(
      u => u.full_name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
    );
  };

  const UserTable = ({ users }: { users: User[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left py-3 px-4">Nom</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4">Inscrit le</th>
            <th className="text-center py-3 px-4">Statut</th>
            <th className="text-center py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-muted-foreground">
                Aucun utilisateur trouvé
              </td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.id} className="border-b hover:bg-muted/50 transition">
                <td className="py-3 px-4 font-medium">{user.full_name}</td>
                <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                <td className="py-3 px-4 text-muted-foreground text-xs">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_blocked
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {user.is_blocked ? "Bloqué" : "Actif"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant={user.is_blocked ? "outline" : "destructive"}
                      onClick={() => toggleBlockUser(user.id, user.is_blocked || false)}
                    >
                      {user.is_blocked ? (
                        <>
                          <Unlock className="h-4 w-4" />
                          Débloquer
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Bloquer
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
        <Button onClick={fetchUsers} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Candidats</p>
              <p className="text-3xl font-bold">{candidates.length}</p>
            </div>
            <Users className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Entreprises</p>
              <p className="text-3xl font-bold">{companies.length}</p>
            </div>
            <Building2 className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="candidates">Candidats ({candidates.length})</TabsTrigger>
          <TabsTrigger value="companies">Entreprises ({companies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="mt-6">
          <Card className="p-6">
            <UserTable users={filterUsers(candidates)} />
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="mt-6">
          <Card className="p-6">
            <UserTable users={filterUsers(companies)} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersManagement;
