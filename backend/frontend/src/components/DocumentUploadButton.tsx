/**
 * Composant réutilisable pour l'upload de documents
 * Avec affichage d'une coche verte si le document existe
 */

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Check, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadButtonProps {
  label: string;
  description?: string;
  isUploading: boolean;
  hasDocument: boolean;
  onFileSelect: (file: File) => void;
  onDelete: () => void;
  documentUrl?: string;
}

export function DocumentUploadButton({
  label,
  description,
  isUploading,
  hasDocument,
  onFileSelect,
  onDelete,
  documentUrl
}: DocumentUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset l'input pour permettre de re-sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <Button
          type="button"
          variant={hasDocument ? "outline" : "default"}
          size="sm"
          className={cn(
            "flex-1 gap-2 transition-all",
            hasDocument && "border-green-500 text-green-600 hover:bg-green-50"
          )}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Téléchargement...
            </>
          ) : hasDocument ? (
            <>
              <Check className="w-4 h-4" />
              {label}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {label}
            </>
          )}
        </Button>

        {hasDocument && (
          <>
            {documentUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(documentUrl, '_blank')}
                className="gap-1"
                title="Ouvrir le document"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={onDelete}
              disabled={isUploading}
              title="Supprimer le document"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
