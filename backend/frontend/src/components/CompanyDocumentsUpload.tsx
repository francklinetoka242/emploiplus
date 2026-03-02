/**
 * Section d'upload de documents pour les profils entreprises
 * Groupage par catégorie avec validation et affichage des coches
 */

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { DocumentUploadButton } from '@/components/DocumentUploadButton';
import {
  COMPANY_DOCUMENTS,
  COMPANY_DOCS_GROUPED,
  COMPANY_GROUP_ORDER,
  DocumentConfig
} from '@/lib/documentUploadConfig';
import {
  uploadCompanyDocAndSave,
  deleteDocument
} from '@/lib/documentUploadHelper';
import { cn } from '@/lib/utils';

interface CompanyDocumentsUploadProps {
  userId: string;
  profileData?: Record<string, any>;
  onDocumentUploaded?: () => void;
}

interface DocumentState {
  [key: string]: {
    url: string | null;
    uploading: boolean;
  };
}

export default function CompanyDocumentsUpload({
  userId,
  profileData,
  onDocumentUploaded
}: CompanyDocumentsUploadProps) {
  const [documentStates, setDocumentStates] = useState<DocumentState>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(COMPANY_GROUP_ORDER)
  );

  // Initialiser les états des documents depuis le profil
  const initializeDocumentStates = useCallback(() => {
    const states: DocumentState = {};
    Object.entries(COMPANY_DOCUMENTS).forEach(([key, config]) => {
      states[key] = {
        url: profileData?.[config.dbColumn] || null,
        uploading: false
      };
    });
    setDocumentStates(states);
  }, [profileData]);

  // Initialiser au chargement
  if (Object.keys(documentStates).length === 0 && profileData) {
    initializeDocumentStates();
  }

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const handleFileSelect = async (file: File, docKey: string) => {
    const config = COMPANY_DOCUMENTS[docKey];
    if (!config) return;

    setDocumentStates(prev => ({
      ...prev,
      [docKey]: { ...prev[docKey], uploading: true }
    }));

    const result = await uploadCompanyDocAndSave(
      file,
      docKey,
      userId,
      config.dbColumn
    );

    setDocumentStates(prev => ({
      ...prev,
      [docKey]: {
        url: result.success ? result.url || null : prev[docKey].url,
        uploading: false
      }
    }));

    if (result.success) {
      onDocumentUploaded?.();
    }
  };

  const handleDeleteDocument = async (docKey: string) => {
    const config = COMPANY_DOCUMENTS[docKey];
    if (!config) return;

    setDocumentStates(prev => ({
      ...prev,
      [docKey]: { ...prev[docKey], uploading: true }
    }));

    const success = await deleteDocument(config.dbColumn);

    if (success) {
      setDocumentStates(prev => ({
        ...prev,
        [docKey]: { url: null, uploading: false }
      }));
      onDocumentUploaded?.();
    } else {
      setDocumentStates(prev => ({
        ...prev,
        [docKey]: { ...prev[docKey], uploading: false }
      }));
    }
  };

  if (!profileData) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Chargement des documents...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Documents de l'Entreprise</h2>
        <p className="text-sm text-muted-foreground">
          Téléchargez les documents de votre entreprise en format PDF (max 5 MB). 
          Une coche verte indique que le document est présent.
        </p>
      </div>

      <div className="space-y-4">
        {COMPANY_GROUP_ORDER.map(groupName => {
          const documents = COMPANY_DOCS_GROUPED[groupName] || [];
          const isExpanded = expandedGroups.has(groupName);
          const completedCount = documents.filter(
            doc => documentStates[doc.fieldName]?.url
          ).length;

          return (
            <div key={groupName} className="border rounded-lg overflow-hidden">
              {/* En-tête du groupe */}
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full px-4 py-3 flex items-center justify-between bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="font-medium">{groupName}</span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    completedCount === documents.length
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  )}>
                    {completedCount}/{documents.length}
                  </span>
                </div>
              </button>

              {/* Contenu du groupe */}
              {isExpanded && (
                <div className="px-4 py-4 bg-background space-y-4 border-t">
                  {documents.map(doc => (
                    <DocumentUploadButton
                      key={doc.fieldName}
                      label={doc.label}
                      description={doc.description}
                      isUploading={documentStates[doc.fieldName]?.uploading || false}
                      hasDocument={!!documentStates[doc.fieldName]?.url}
                      onFileSelect={(file) => handleFileSelect(file, doc.fieldName)}
                      onDelete={() => handleDeleteDocument(doc.fieldName)}
                      documentUrl={documentStates[doc.fieldName]?.url || undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Résumé */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Conseil :</strong> Téléchargez vos documents de base (RCCM, STATUTS, NUI) 
          pour vérifier votre légitimité et pouvoir publier des offres d'emploi sur la plateforme.
        </p>
      </div>
    </Card>
  );
}
