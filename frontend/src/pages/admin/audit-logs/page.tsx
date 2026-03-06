import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  User,
  Filter,
  ChevronDown,
  Clock,
  AlertCircle,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { authHeaders } from "@/lib/headers";

interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ip_address: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  adminId: string;
  module: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtering, setFiltering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    adminId: "",
    module: "",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchAdmins();
    fetchModules();
  }, []);

  const fetchLogs = async (filterParams?: FilterState) => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      const headers = adminToken
        ? authHeaders(undefined, "adminToken")
        : authHeaders();

      const params = filterParams || filters;
      const queryString = new URLSearchParams();

      if (params.startDate) queryString.append("startDate", params.startDate);
      if (params.endDate) queryString.append("endDate", params.endDate);
      if (params.adminId) queryString.append("adminId", params.adminId);
      if (params.module) queryString.append("module", params.module);

      const response = await fetch(
        `/api/admin/audit-logs?${queryString.toString()}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : data.data || []);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des logs d'audit:", err);
      toast.error("Erreur lors du chargement des logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const headers = adminToken
        ? authHeaders(undefined, "adminToken")
        : authHeaders();

      const response = await fetch("/api/admins", {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des admins:", err);
    }
  };

  const fetchModules = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const headers = adminToken
        ? authHeaders(undefined, "adminToken")
        : authHeaders();

      const response = await fetch("/api/admin/audit-logs/modules", { headers });

      if (response.ok) {
        const data = await response.json();
        setModules(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des modules:", err);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchLogs(filters);
    setFiltering(false);
  };

  const resetFilters = () => {
    const newFilters = {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      adminId: "",
      module: "",
    };
    setFilters(newFilters);
    fetchLogs(newFilters);
  };

  const exportLogs = () => {
    try {
      const csv = [
        ["ID", "Administrateur", "Action", "Module", "Détails", "Date/Heure", "Adresse IP"],
        ...logs.map((log) => [
          log.id,
          log.admin_name,
          log.action,
          log.module,
          log.details,
          new Date(log.timestamp).toLocaleString("fr-FR"),
          log.ip_address,
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success("Logs exportés avec succès");
    } catch (err) {
      console.error("Erreur lors de l'export:", err);
      toast.error("Erreur lors de l'export");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActionColor = (action: string) => {
    if (action.startsWith("CREATE_")) return "bg-green-50 border-l-green-500";
    if (action.startsWith("UPDATE_")) return "bg-blue-50 border-l-blue-500";
    if (action.startsWith("DELETE_")) return "bg-red-50 border-l-red-500";
    if (action.startsWith("BLOCK_")) return "bg-orange-50 border-l-orange-500";
    return "bg-gray-50 border-l-gray-500";
  };

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith("CREATE_"))
      return "bg-green-100 text-green-800 border-green-200";
    if (action.startsWith("UPDATE_"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (action.startsWith("DELETE_"))
      return "bg-red-100 text-red-800 border-red-200";
    if (action.startsWith("BLOCK_"))
      return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="p-10 h-full overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 flex items-center gap-4 mb-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          Historique d'Audit
        </h1>
        <p className="text-xl text-muted-foreground">
          Consultation des actions administrateur (lecture seule)
        </p>
      </div>

      {/* Filtres */}
      <Card className="p-6 mb-8 border-l-4 border-l-purple-600">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-600" />
            Filtres
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFiltering(!filtering)}
            className="flex items-center gap-2"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                filtering ? "rotate-180" : ""
              }`}
            />
            {filtering ? "Réduire" : "Développer"}
          </Button>
        </div>

        {filtering && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Administrateur
              </label>
              <select
                value={filters.adminId}
                onChange={(e) =>
                  handleFilterChange("adminId", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Tous les admins</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.first_name} {admin.last_name} ({admin.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Module</label>
              <select
                value={filters.module}
                onChange={(e) => handleFilterChange("module", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Tous les modules</option>
                {modules.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {filtering && (
          <div className="flex gap-3">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={applyFilters}
            >
              Appliquer les filtres
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Réinitialiser
            </Button>
            <Button
              variant="outline"
              className="ml-auto flex items-center gap-2"
              onClick={exportLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        )}
      </Card>

      {/* Nombre de logs trouvés */}
      <div className="mb-6 text-sm text-muted-foreground">
        {logs.length} log(s) trouvé(s)
      </div>

      {/* Logs Timeline */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          Chargement...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="h-20 w-20 mx-auto text-gray-300 mb-6" />
          <p className="text-2xl text-muted-foreground">Aucun log d'audit</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <Card
              key={log.id}
              className={`p-6 border-l-4 transition hover:shadow-md ${getActionColor(
                log.action
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* En-tête du log */}
                  <div className="flex items-center gap-4 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
                      {log.module}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-900 mb-2 text-sm">{log.details}</p>

                  {/* Infos détaillées */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        <strong>{log.admin_name}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(log.timestamp).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-mono text-xs">{log.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">
                        ID: {log.id.substring(0, 8)}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(log.id, log.id)}
                        className="hover:text-purple-600 transition"
                        title="Copier l'ID"
                      >
                        {copiedId === log.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Information de sécurité */}
      <Card className="mt-12 p-6 bg-yellow-50 border-l-4 border-l-yellow-400">
        <p className="text-sm text-yellow-800">
          <strong>🔒 Sécurité:</strong> Ce journal d'audit est en lecture seule
          pour garantir l'intégrité des données. Aucune suppression/modification
          n'est possible une fois enregistrée.
        </p>
      </Card>
    </div>
  );
}
