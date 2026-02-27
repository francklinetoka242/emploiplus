import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConfirmButton from '@/components/ConfirmButton';
import { toast } from "sonner";
import { authHeaders } from '@/lib/headers';
import { uploadFile } from '@/lib/upload';
import { Loader2, Upload, Download, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserDocument {
  id: number;
  user_id: number;
  doc_type: string;
  title?: string;
  storage_url?: string;
  created_at: string;
}

const DOC_TYPES = [
  { value: "cv", label: "CV" },
  { value: "diploma", label: "Diplôme" },
  { value: "motivation_letter", label: "Lettre de motivation" },
  { value: "certificate", label: "Certificat" },
  { value: "identity", label: "Pièce d'identité (personne physique)" },
  { value: "guarantor_identity", label: "Pièce d'identité (garant / représentant entreprise)" },
  // enterprise specific removed from candidate view dynamically
  { value: "rccm", label: "RCCM (document entreprise)" },
  { value: "localization_plan", label: "Plan de localisation (entreprise)" },
  { value: "other", label: "Autre document" },
];

export default function InformationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("");
  const [docTitle, setDocTitle] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const search = new URLSearchParams(location.search);
  const returnTo = search.get('returnTo');
  const q = (search.get('q') || '').toLowerCase().trim();

  const docTypeMatches = (typeLabel: string) => {
    if (!q) return true;
    return `${typeLabel}`.toLowerCase().includes(q);
  };
  
  
  

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user-documents", {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur chargement documents");
      const data: UserDocument[] = await res.json();
      // If candidate, filter out enterprise-only doc types
      if (user && user.user_type && user.user_type === 'candidate') {
        setDocuments(data.filter(d => d.doc_type !== 'rccm' && d.doc_type !== 'localization_plan'));
      } else {
        setDocuments(data);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!docFile || !docType) {
      toast.error("Veuillez sélectionner un fichier et un type de document");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      // Upload file via helper
      const storage_url = await uploadFile(docFile, token, 'documents');

      // Create document record
      const docRes = await fetch("/api/user-documents", {
        method: "POST",
        headers: authHeaders('application/json'),
        body: JSON.stringify({
          doc_type: docType,
          title: docTitle || docFile.name,
          storage_url,
        }),
      });

      if (!docRes.ok) throw new Error("Erreur création document");

      toast.success("Document ajouté avec succès");
      setDocFile(null);
      setDocType("");
      setDocTitle("");
      fetchDocuments();
      // If we came here to return to verification, redirect back
      if (returnTo === 'verification') {
        navigate('/parametres/verification');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    try {
      const res = await fetch(`/api/user-documents/${docId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Erreur suppression");
      toast.success("Document supprimé");
      fetchDocuments();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mes informations</h1>

      {/* Upload Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ajouter un document</h2>


          <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="docType">Type de document</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.filter(t => !(user && user.user_type === 'candidate' && (t.value === 'rccm' || t.value === 'localization_plan'))).filter(t => docTypeMatches(t.label)).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="docTitle">Titre (optionnel)</Label>
              <Input
                id="docTitle"
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Ex: CV 2024"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="docFile">Fichier</Label>
            <Input
              id="docFile"
              type="file"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
            {docFile && (
              <p className="text-sm text-muted-foreground mt-2">
                Fichier sélectionné: {docFile.name}
              </p>
            )}
          </div>

          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter le document
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Documents List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Vos documents</h2>

        {documents.length === 0 ? (
          <p className="text-muted-foreground">Aucun document ajouté</p>
        ) : (
          <div className="space-y-3">
            {documents.filter(d => {
              if (!q) return true;
              const hay = `${d.title || ''} ${d.doc_type}`.toLowerCase();
              return hay.includes(q);
            }).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{doc.title || `Document ${doc.id}`}</p>
                  <p className="text-sm text-muted-foreground">
                    {DOC_TYPES.find((t) => t.value === doc.doc_type)?.label || doc.doc_type} •{" "}
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {doc.storage_url && (
                    <a href={doc.storage_url} download target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <ConfirmButton title="Supprimer ce document ?" description="Cette action est irréversible." confirmLabel="Supprimer" onConfirm={() => handleDelete(doc.id)}>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </ConfirmButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
