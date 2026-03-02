/**
 * PHASE 5: Admin Subscriptions Management Page
 * Manage all subscriptions for Admin Level 1 & 5
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Eye,
} from "lucide-react";
import { authHeaders } from "@/lib/headers";
import { toast } from "sonner";

interface Subscription {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  planName: string;
  status: "active" | "pending" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  amountPaid: number;
  autoRenew: boolean;
}

interface PaginatedResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  pageSize: number;
}

const ITEMS_PER_PAGE = 20;

export default function AdminSubscriptionsPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "pending" | "expired" | "cancelled"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
    setAdmin(adminData);

    if (adminData.level !== 1 && adminData.level !== 5) {
      toast.error("Accès refusé");
      navigate("/admin");
      return;
    }

    fetchSubscriptions();
  }, [currentPage, sortBy, sortOrder, filterStatus, searchTerm]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const headers = authHeaders("application/json");
      headers["Authorization"] = `Bearer ${localStorage.getItem("adminToken")}`;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: ITEMS_PER_PAGE.toString(),
        sortBy,
        sortOrder,
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await fetch(`/api/admin/subscriptions?${params}`, { headers });

      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setSubscriptions(data.subscriptions);
        setTotalCount(data.total);
      } else {
        toast.error("Erreur lors du chargement des abonnements");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "expired":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "En cours";
      case "pending":
        return "En attente";
      case "expired":
        return "Expiré";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "expired":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const toggleSort = (field: "date" | "amount" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Abonnements</h1>
        <div className="text-sm text-gray-600">
          Total : <strong>{totalCount}</strong> abonnements
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <Card className="p-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* SEARCH */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold mb-2 block">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Email ou nom d'utilisateur..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* FILTER STATUS */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(
                  e.target.value as
                    | "all"
                    | "active"
                    | "pending"
                    | "expired"
                    | "cancelled"
                );
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Tous</option>
              <option value="active">En cours</option>
              <option value="pending">En attente</option>
              <option value="expired">Expiré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          {/* REFRESH */}
          <div className="flex items-end">
            <Button
              onClick={fetchSubscriptions}
              className="w-full bg-primary"
            >
              <Zap className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </Card>

      {/* TABLE */}
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <Zap className="w-8 h-8 animate-spin mx-auto" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            Aucun abonnement trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Plan
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Statut
                    {sortBy === "status" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("amount")}
                >
                  <div className="flex items-center gap-2">
                    Montant
                    {sortBy === "amount" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold">{sub.userName}</p>
                      <p className="text-sm text-gray-600">{sub.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{sub.planName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold flex w-fit items-center gap-2 ${getStatusColor(
                        sub.status
                      )}`}
                    >
                      {getStatusIcon(sub.status)}
                      {getStatusLabel(sub.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {sub.amountPaid.toLocaleString()} XAF
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>{sub.startDate}</div>
                    <div className="text-gray-600">{sub.endDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/admin/users/${sub.userId}`)
                      }
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 2),
                Math.min(totalPages, currentPage + 1)
              )
              .map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
