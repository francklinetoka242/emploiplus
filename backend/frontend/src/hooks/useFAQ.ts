/**
 * FAQ HOOKS
 * React Query hooks for managing FAQ items (frontend)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/headers';
import { toast } from '@/components/ui/use-toast';

// ============================================================================
// TYPES
// ============================================================================

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_published: boolean;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFAQInput {
  question: string;
  answer: string;
  category: string;
  is_published?: boolean;
}

export interface UpdateFAQInput {
  question?: string;
  answer?: string;
  category?: string;
  is_published?: boolean;
}

export interface ReorderFAQInput {
  items: Array<{
    id: number;
    order_index: number;
  }>;
}

export interface FAQStatistics {
  total_faqs: number;
  published_count: number;
  draft_count: number;
  categories: Record<string, number>;
  last_updated: string;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch all FAQ items with optional filters
 */
export function useFAQItems(filters?: { category?: string; published?: boolean }) {
  return useQuery<FAQItem[]>({
    queryKey: ['faq', filters?.category, filters?.published],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.published !== undefined) params.append('published', String(filters.published));
      const response = await apiFetch(`/api/admin/faq?${params}`, {}, { admin: true });
      return (response as any)?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Fetch public FAQ items (published only)
 */
export function usePublicFAQItems(filters?: { category?: string }) {
  return useQuery<FAQItem[]>({
    queryKey: ['faq-public', filters?.category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      params.append('published', 'true');
      const response = await apiFetch(`/api/faq?${params}`);
      return (response as any)?.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Fetch single FAQ item
 */
export function useFAQItem(id: number) {
  return useQuery<FAQItem>({
    queryKey: ['faq', id],
    queryFn: async () => {
      const response = await apiFetch(`/api/admin/faq/${id}`, {}, { admin: true });
      return (response as any)?.data || ({} as FAQItem);
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!id,
  });
}

/**
 * Create FAQ item mutation
 */
export function useCreateFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFAQInput) => {
      const response = await apiFetch(
        '/api/admin/faq',
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
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      queryClient.invalidateQueries({ queryKey: ['faq-public'] });
      toast({
        title: 'Succès',
        description: response?.message || 'FAQ créée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.message || 'Erreur lors de la création de la FAQ',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update FAQ item mutation
 */
export function useUpdateFAQItem(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateFAQInput) => {
      const response = await apiFetch(
        `/api/admin/faq/${id}`,
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
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      queryClient.invalidateQueries({ queryKey: ['faq', id] });
      queryClient.invalidateQueries({ queryKey: ['faq-public'] });
      toast({
        title: 'Succès',
        description: response?.message || 'FAQ mise à jour avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.message || 'Erreur lors de la mise à jour de la FAQ',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete FAQ item mutation
 */
export function useDeleteFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiFetch(
        `/api/admin/faq/${id}`,
        { method: 'DELETE' },
        { admin: true }
      );
      return response;
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      queryClient.invalidateQueries({ queryKey: ['faq-public'] });
      toast({
        title: 'Succès',
        description: response?.message || 'FAQ supprimée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.message || 'Erreur lors de la suppression de la FAQ',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Reorder FAQ items mutation
 */
export function useReorderFAQItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderFAQInput) => {
      const response = await apiFetch(
        '/api/admin/faq/reorder',
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
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      queryClient.invalidateQueries({ queryKey: ['faq-public'] });
      toast({
        title: 'Succès',
        description: response?.message || 'Ordre des FAQ mis à jour avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.message || 'Erreur lors de la mise à jour de l\'ordre',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Fetch FAQ statistics
 */
export function useFAQStatistics() {
  return useQuery<FAQStatistics>({
    queryKey: ['faq', 'stats'],
    queryFn: async () => {
      const response = await apiFetch(`/api/admin/faq/stats`, {}, { admin: true });
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
 * Get common FAQ categories
 */
export function getFAQCategories(): string[] {
  return [
    'Compte',
    'Mot de passe',
    'Paiement',
    'Support',
    'Général',
    'Technique',
  ];
}

/**
 * Format category name with emoji
 */
export function formatFAQCategory(category: string): string {
  const categories: Record<string, string> = {
    'Compte': '👤 Compte',
    'Mot de passe': '🔐 Mot de passe',
    'Paiement': '💳 Paiement',
    'Support': '🆘 Support',
    'Général': '❓ Questions générales',
    'Technique': '⚙️ Questions techniques',
  };
  return categories[category] || category;
}

/**
 * Get category color
 */
export function getFAQCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Compte': 'bg-blue-100 text-blue-800',
    'Mot de passe': 'bg-red-100 text-red-800',
    'Paiement': 'bg-green-100 text-green-800',
    'Support': 'bg-purple-100 text-purple-800',
    'Général': 'bg-gray-100 text-gray-800',
    'Technique': 'bg-orange-100 text-orange-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
}

/**
 * Search FAQ items by keyword
 */
export function searchFAQItems(items: FAQItem[], searchTerm: string): FAQItem[] {
  if (!searchTerm.trim()) return items;
  
  const lowerSearch = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.question.toLowerCase().includes(lowerSearch) ||
      item.answer.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Sort FAQ items by order index
 */
export function sortFAQByOrder(items: FAQItem[]): FAQItem[] {
  return [...items].sort((a, b) => a.order_index - b.order_index);
}

/**
 * Group FAQ items by category
 */
export function groupFAQByCategory(items: FAQItem[]): Record<string, FAQItem[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, FAQItem[]>
  );
}

/**
 * Format date for display
 */
export function formatFAQDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
