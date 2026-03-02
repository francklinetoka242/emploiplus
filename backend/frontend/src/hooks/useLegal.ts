import { useQuery } from '@tanstack/react-query';

export function useLegalDocument(slug: string) {
  return useQuery(['legal', slug], async () => {
    const res = await fetch(`/api/cms/documents/${slug}`);
    if (!res.ok) throw new Error('Failed to load document');
    return res.json();
  }, { staleTime: 1000 * 60 * 60 });
}

export function useFaqs(category?: string) {
  return useQuery(['faqs', category || 'all'], async () => {
    const url = category ? `/api/cms/faqs?category=${encodeURIComponent(category)}` : '/api/cms/faqs';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load faqs');
    return res.json();
  }, { staleTime: 1000 * 60 * 10 });
}
