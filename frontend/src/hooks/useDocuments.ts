/**
 * DOCUMENTS HOOKS
 * React Query hooks for managing legal documents (frontend)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/headers';
import { toast } from '@/components/ui/use-toast';

// ============================================================================
// TYPES
// ============================================================================

export interface Document {
  id: number;
  slug: string;
  name: string;
  content: string;
  type: 'privacy' | 'terms' | 'cookies' | 'other';
  is_published: boolean;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  slug: string;
  name: string;
  content: string;
  type: 'privacy' | 'terms' | 'cookies' | 'other';
}

export interface UpdateDocumentInput {
  slug?: string;
  name?: string;
  content?: string;
  type?: 'privacy' | 'terms' | 'cookies' | 'other';
}

export interface DocumentStats {
  total_documents: number;
  privacy_count: number;
  terms_count: number;
  cookies_count: number;
  other_count: number;
  last_updated: string;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch all documents
 */
export function useDocuments(filters?: { type?: string }) {
  return useQuery<Document[]>({
    queryKey: ['documents', filters?.type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      const response = await apiFetch(`/api/admin/documentations?${params}`, {}, { admin: true });
      return (response as any)?.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Fetch single document
 */
export function useDocument(idOrSlug: string | number) {
  return useQuery<Document>({
    queryKey: ['document', idOrSlug],
    queryFn: async () => {
      const response = await apiFetch(`/api/admin/documentations/${idOrSlug}`, {}, { admin: true });
      return (response as any)?.data || ({} as Document);
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!idOrSlug,
  });
}

/**
 * Create document mutation
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentInput) => {
      const response = await apiFetch(
        '/api/admin/documentations',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
        { admin: true }
      );
      return response;
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Succès',
        description: response?.message || 'Document créé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.message || 'Erreur lors de la création du document',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update document mutation
 */
export function useUpdateDocument(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDocumentInput) => {
      const response = await apiFetch(
        `/api/admin/documentations/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
        { admin: true }
      );
      return response;
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      toast({
        title: 'Succès',
        description: response?.message || 'Document mis à jour avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.message || 'Erreur lors de la mise à jour du document',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete document mutation
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiFetch(
        `/api/admin/documentations/${id}`,
        { method: 'DELETE' },
        { admin: true }
      );
      return response;
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Succès',
        description: response?.message || 'Document supprimé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.message || 'Erreur lors de la suppression du document',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Fetch document statistics
 */
export function useDocumentStatistics() {
  return useQuery<DocumentStats>({
    queryKey: ['documents', 'stats'],
    queryFn: async () => {
      const response = await apiFetch(`/api/admin/documentations/stats`, {}, { admin: true });
      return (response as any)?.data || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get document type label in French
 */
export function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    privacy: '🔒 Politique de confidentialité',
    terms: '📜 Mentions légales',
    cookies: '🍪 Politique des cookies',
    other: '📄 Autre',
  };
  return labels[type] || type;
}

/**
 * Get document type color
 */
export function getDocumentTypeColor(type: string): string {
  const colors: Record<string, string> = {
    privacy: 'bg-blue-100 text-blue-800 border-blue-300',
    terms: 'bg-purple-100 text-purple-800 border-purple-300',
    cookies: 'bg-orange-100 text-orange-800 border-orange-300',
    other: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[type] || colors.other;
}

/**
 * Format date for display
 */
export function formatDocumentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get word count from HTML content
 */
export function getWordCount(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, '');
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}
