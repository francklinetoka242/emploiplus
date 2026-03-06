import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface DocumentPageViewerProps {
  slug: string;
  fallbackTitle: string;
  fallbackContent: string;
}

export const DocumentPageViewer: React.FC<DocumentPageViewerProps> = ({
  slug,
  fallbackTitle,
  fallbackContent,
}) => {
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocument();
  }, [slug]);

  async function fetchDocument() {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`/api/documentations/public/${slug}`);
      
      if (res.ok) {
        const data = await res.json();
        setDocument(data.data);
      } else if (res.status === 404) {
        // Document not found, use fallback
        setDocument(null);
      } else {
        setError('Erreur lors de la récupération du document');
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Erreur lors de la récupération du document');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container py-16 max-w-4xl flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">{error}</h3>
            <p className="text-red-700 text-sm mt-1">Veuillez réessayer plus tard</p>
          </div>
        </div>
      </div>
    );
  }

  if (document) {
    return (
      <div className="container py-16 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{document.name}</h1>
        <div 
          className="prose prose-sm max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
        <div className="text-xs text-muted-foreground mt-8 pt-8 border-t">
          Dernière mise à jour: {new Date(document.updated_at).toLocaleDateString('fr-FR')}
        </div>
      </div>
    );
  }

  // Fallback content if document not found
  return (
    <div className="container py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{fallbackTitle}</h1>
      <p className="text-muted-foreground whitespace-pre-line">{fallbackContent}</p>
    </div>
  );
};

export default DocumentPageViewer;
