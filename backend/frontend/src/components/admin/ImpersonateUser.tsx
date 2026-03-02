import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Clock,
  Shield,
  User,
  Building2,
  AlertTriangle,
  Copy,
  CheckCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// ============ TYPES & INTERFACES ============

interface AdminUser {
  id: number;
  full_name: string;
  company_name?: string;
  email: string;
  user_type: "candidate" | "company" | "admin";
  profile_picture?: string;
  created_at: string;
  applications_count?: number;
  posts_count?: number;
}

interface ImpersonationSession {
  id: string;
  admin_id: number;
  user_id: number;
  user_name: string;
  start_time: string;
  expires_at: string;
  reason: string;
  is_active: boolean;
}

// ============ COMPONENT ============

const ImpersonateUser = () => {
  const [activeTab, setActiveTab] = useState("candidates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [sessionReason, setSessionReason] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["impersonateUsers", activeTab],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const userType = activeTab === "candidates" ? "candidate" : activeTab === "companies" ? "company" : "admin";
      const response = await fetch(`/api/admin/users?type=${userType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json() as Promise<AdminUser[]>;
    },
  });

  // Fetch active sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["impersonationSessions"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/admin/impersonation/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch sessions");
      return response.json() as Promise<ImpersonationSession[]>;
    },
    refetchInterval: 30000,
  });

  // Create impersonation session
  const impersonateMutation = useMutation({
    mutationFn: async (userId: number) => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          reason: sessionReason,
          duration_minutes: 30,
        }),
      });
      if (!response.ok) throw new Error("Failed to create impersonation session");
      return response.json() as Promise<{ token: string; expires_at: string; session_id: string }>;
    },
    onSuccess: (data) => {
      toast.success("Session d'impersonnalisation créée ✅");
      // Auto-copy token
      navigator.clipboard.writeText(data.token).then(() => {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      });
      setSelectedUserId(null);
      setSessionReason("");
    },
    onError: () => toast.error("Erreur lors de la création de la session"),
  });

  // End impersonation session
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/admin/impersonation/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to end session");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Session d'impersonnalisation fermée");
      // Refetch sessions
      window.location.reload();
    },
    onError: () => toast.error("Erreur lors de la fermeture de la session"),
  });

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // ===== USER CARD COMPONENT =====
  const UserCard = ({ user }: { user: AdminUser }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.full_name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {user.full_name.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-lg font-bold">{user.full_name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.company_name && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Building2 className="h-4 w-4" /> {user.company_name}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {user.applications_count !== undefined && (
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-muted-foreground text-xs">Candidatures</p>
              <p className="font-bold text-lg">{user.applications_count}</p>
            </div>
          )}
          {user.posts_count !== undefined && (
            <div className="bg-green-50 p-2 rounded">
              <p className="text-muted-foreground text-xs">Publications</p>
              <p className="font-bold text-lg">{user.posts_count}</p>
            </div>
          )}
        </div>

        {/* Joined Date */}
        <div className="text-xs text-muted-foreground">
          Inscrit depuis : {new Date(user.created_at).toLocaleDateString("fr-FR")}
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setSelectedUserId(user.id)}
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <LogIn className="h-4 w-4" /> Se connecter en tant que
        </Button>
      </div>
    </Card>
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Impersonnalisation (Login As)</h2>
        <p className="text-muted-foreground mt-1">
          Se connecter temporairement en tant qu'utilisateur pour diagnostiquer des bugs ou aider les clients
        </p>
      </div>

      {/* Warning Alert */}
      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900">
            <strong>Attention :</strong> Chaque session d'impersonnalisation est enregistrée à titre d'audit.
            Utilisez cette fonctionnalité uniquement pour l'assistance client ou le débogage. Les sessions expirent après 30 minutes.
          </div>
        </div>
      </Card>

      {/* Active Sessions */}
      {sessions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" /> Sessions actives ({sessions.filter((s) => s.is_active).length})
          </h3>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  session.is_active
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div>
                  <p className="font-medium">{session.user_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Raison : {session.reason || "Non spécifiée"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expire : {new Date(session.expires_at).toLocaleTimeString("fr-FR")}
                  </p>
                </div>
                {session.is_active && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => endSessionMutation.mutate(session.id)}
                    disabled={endSessionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Terminer
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Candidats ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Entreprises ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Admins ({filteredUsers.length})
          </TabsTrigger>
        </TabsList>

        {/* Users Grid */}
        {["candidates", "companies", "admins"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {filteredUsers.length === 0 ? (
              <Card className="p-12 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal - Create Session */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-xl font-bold">
                  Créer une session d'impersonnalisation
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {users.find((u) => u.id === selectedUserId)?.full_name}
                </p>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Raison de la session (optionnel)
                </label>
                <Input
                  placeholder="Ex: Diagnostiquer un bug, vérifier une candidature..."
                  value={sessionReason}
                  onChange={(e) => setSessionReason(e.target.value)}
                />
              </div>

              {/* Session Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Durée : 30 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Session enregistrée à titre d'audit</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUserId(null);
                    setSessionReason("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    if (selectedUserId) {
                      impersonateMutation.mutate(selectedUserId);
                    }
                  }}
                  disabled={impersonateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" /> Créer la session
                </Button>
              </div>

              {/* Success - Token Display */}
              {impersonateMutation.data && (
                <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-900">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Session créée avec succès!</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-900">Token d'accès :</label>
                    <div className="flex gap-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={impersonateMutation.data.token}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono text-green-900 bg-white"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(impersonateMutation.data!.token);
                          setCopiedToken(true);
                          setTimeout(() => setCopiedToken(false), 2000);
                        }}
                      >
                        {copiedToken ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-green-900">
                    Expire : {new Date(impersonateMutation.data.expires_at).toLocaleString("fr-FR")}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-3">
          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> Comment utiliser
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
            <li>Recherchez l'utilisateur dans la liste</li>
            <li>Cliquez sur "Se connecter en tant que"</li>
            <li>Spécifiez la raison (optionnel)</li>
            <li>Coplez le token généré</li>
            <li>Utilisez ce token pour accéder au compte utilisateur</li>
            <li>La session expire après 30 minutes</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default ImpersonateUser;
