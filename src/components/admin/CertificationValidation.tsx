import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  FileCheck,
  AlertTriangle,
  Eye,
  Download,
  Clock,
  User,
  Building2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// ============ TYPES & INTERFACES ============

interface CertificationRequest {
  id: number;
  user_id: number;
  user_type: "candidate" | "company";
  user_name: string;
  user_email: string;
  document_type: "CNI" | "RCCM" | "DEGREE" | "CERTIFICATE";
  document_url: string;
  document_name: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  verified_status?: "verified" | "unverified" | "pending";
}

interface CertificationStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  verified_count: number;
  unverified_count: number;
}

// ============ COMPONENT ============

const CertificationValidation = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCert, setSelectedCert] = useState<CertificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch certifications
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["certifications", activeTab],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/admin/certifications?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch certifications");
      return response.json() as Promise<CertificationRequest[]>;
    },
    refetchInterval: 30000,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["certificationStats"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/admin/certifications/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json() as Promise<CertificationStats>;
    },
  });

  // Approve certification
  const approveMutation = useMutation({
    mutationFn: async (certId: number) => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/admin/certifications/${certId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) throw new Error("Failed to approve certification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certificationStats"] });
      setSelectedCert(null);
      toast.success("Certification approuvée ✅");
    },
    onError: () => toast.error("Erreur lors de l'approbation"),
  });

  // Reject certification
  const rejectMutation = useMutation({
    mutationFn: async (certId: number) => {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/admin/certifications/${certId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected", rejection_reason: rejectionReason }),
      });
      if (!response.ok) throw new Error("Failed to reject certification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certificationStats"] });
      setSelectedCert(null);
      setRejectionReason("");
      toast.success("Certification rejetée avec raison");
    },
    onError: () => toast.error("Erreur lors du rejet"),
  });

  // Filter certifications
  const filteredCertifications = certifications.filter(
    (cert) =>
      cert.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.document_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== DOCUMENT TYPES BADGE =====
  const getDocumentBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      CNI: { label: "Carte d'identité", color: "bg-blue-100 text-blue-800" },
      RCCM: { label: "RCCM (Entreprise)", color: "bg-purple-100 text-purple-800" },
      DEGREE: { label: "Diplôme", color: "bg-green-100 text-green-800" },
      CERTIFICATE: { label: "Certificat", color: "bg-orange-100 text-orange-800" },
    };
    const badge = badges[type] || { label: type, color: "bg-gray-100 text-gray-800" };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>{badge.label}</span>;
  };

  // ===== STATUS BADGE =====
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: React.ReactNode; color: string; text: string }> = {
      pending: {
        icon: <Clock className="h-4 w-4" />,
        color: "bg-yellow-50 text-yellow-800 border-yellow-200",
        text: "En attente",
      },
      approved: {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-green-50 text-green-800 border-green-200",
        text: "Approuvée",
      },
      rejected: {
        icon: <XCircle className="h-4 w-4" />,
        color: "bg-red-50 text-red-800 border-red-200",
        text: "Rejetée",
      },
    };
    const badge = badges[status];
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${badge.color}`}>
        {badge.icon}
        <span className="text-sm font-medium">{badge.text}</span>
      </div>
    );
  };

  // ===== CERTIFICATION CARD COMPONENT =====
  const CertificationCard = ({ cert }: { cert: CertificationRequest }) => (
    <Card
      className={`p-6 cursor-pointer hover:shadow-lg transition-all border-l-4 ${
        cert.status === "pending"
          ? "border-l-yellow-500"
          : cert.status === "approved"
            ? "border-l-green-500"
            : "border-l-red-500"
      }`}
      onClick={() => setSelectedCert(cert)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {cert.user_type === "company" ? (
                <Building2 className="h-5 w-5 text-purple-600" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
              <h3 className="text-lg font-bold">{cert.user_name}</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {cert.user_type === "company" ? "Entreprise" : "Candidat"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{cert.user_email}</p>
          </div>
          {getStatusBadge(cert.status)}
        </div>

        {/* Document Info */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <FileCheck className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Type de document</p>
              <p className="text-xs text-muted-foreground">{cert.document_name}</p>
            </div>
          </div>
          {getDocumentBadge(cert.document_type)}
        </div>

        {/* Timeline */}
        <div className="text-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Soumis le :</span>
            <span className="font-medium">
              {new Date(cert.submitted_at).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {cert.reviewed_at && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Examiné par :</span>
              <span className="font-medium">{cert.reviewed_by || "Admin"}</span>
            </div>
          )}
        </div>

        {/* Status-specific content */}
        {cert.status === "rejected" && cert.rejection_reason && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm font-medium text-red-900 mb-1">Raison du rejet :</p>
            <p className="text-sm text-red-800">{cert.rejection_reason}</p>
          </div>
        )}

        {/* Verified Status */}
        {cert.verified_status && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            {cert.verified_status === "verified" ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Compte certifié</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Compte non certifié</span>
              </>
            )}
          </div>
        )}

        {/* Preview Button */}
        {cert.status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCert(cert);
              setPreviewUrl(cert.document_url);
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" /> Voir le document
          </Button>
        )}
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Chargement des certifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Validation des Certifications</h2>
        <p className="text-muted-foreground mt-1">
          Vérifiez et approuvez les documents d'identité (CNI, RCCM) et certifications des utilisateurs
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <p className="text-sm text-muted-foreground">En attente</p>
            <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.total_pending}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <p className="text-sm text-muted-foreground">Approuvées</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.total_approved}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <p className="text-sm text-muted-foreground">Rejetées</p>
            <p className="text-3xl font-bold mt-2 text-red-600">{stats.total_rejected}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-sm text-muted-foreground">Certifiés</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">{stats.verified_count}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-sm text-muted-foreground">Non certifiés</p>
            <p className="text-3xl font-bold mt-2 text-purple-600">{stats.unverified_count}</p>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou type de document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Main Content - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> En attente ({filteredCertifications.filter((c) => c.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Approuvées ({filteredCertifications.filter((c) => c.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Rejetées ({filteredCertifications.filter((c) => c.status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        {/* Content Tabs */}
        {["pending", "approved", "rejected"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-6">
            {filteredCertifications.filter((c) => c.status === status).length === 0 ? (
              <Card className="p-12 text-center">
                <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune certification {status === "pending" ? "en attente" : status === "approved" ? "approuvée" : "rejetée"}</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCertifications
                  .filter((c) => c.status === status)
                  .map((cert) => (
                    <CertificationCard key={cert.id} cert={cert} />
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal - Document Preview & Action */}
      {selectedCert && selectedCert.status === "pending" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-96 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedCert.user_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCert.user_email}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCert(null);
                    setPreviewUrl(null);
                    setRejectionReason("");
                  }}
                >
                  ✕
                </Button>
              </div>

              {/* Document Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{getDocumentBadge(selectedCert.document_type)}</span>
                </div>

                {previewUrl && (
                  <div className="border rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="w-full h-auto object-contain max-h-64"
                    />
                  </div>
                )}

                <a
                  href={selectedCert.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <Download className="h-4 w-4" /> Télécharger le document original
                </a>
              </div>

              {/* Rejection Reason (if rejecting) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Raison du rejet (si applicable)
                </label>
                <Textarea
                  placeholder="Ex: Document flou, informations manquantes, etc."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCert(null);
                    setPreviewUrl(null);
                    setRejectionReason("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      toast.error("Veuillez fournir une raison du rejet");
                      return;
                    }
                    rejectMutation.mutate(selectedCert.id);
                  }}
                  disabled={rejectMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Rejeter
                </Button>
                <Button
                  onClick={() => approveMutation.mutate(selectedCert.id)}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" /> Approuver & Certifier
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Processus :</strong> Examinez les documents, puis cliquez sur le document pour
            l'approuver ou le rejeter. L'approbation change automatiquement le statut de l'utilisateur à "Certifié".
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CertificationValidation;
