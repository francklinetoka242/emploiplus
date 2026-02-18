/**
 * Upload utilities - STUB VERSION (Supabase removed)
 * 
 * ⚠️ TEMPORARILY DISABLED: File upload functionality depends on Supabase Storage
 * which has been removed from the frontend.
 * 
 * These functions will return placeholder URLs for now.
 */

export const BUCKET_CONFIG = {
  avatars: { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png'] },
  'candidats-docs': { maxSize: 10 * 1024 * 1024, allowedTypes: ['application/pdf'] },
  'assets-emploi': { maxSize: 20 * 1024 * 1024, allowedTypes: ['image/*', 'video/*'] },
  'feed-posts': { maxSize: 50 * 1024 * 1024, allowedTypes: ['image/*', 'video/*'] },
};

/**
 * Validate file before upload
 */
export function validateFile(file: File, bucketName: string = 'feed-posts'): { valid: boolean; error?: string } {
  const config = BUCKET_CONFIG[bucketName as keyof typeof BUCKET_CONFIG];
  if (!config) return { valid: false, error: 'Bucket not found' };
  
  if (file.size > config.maxSize) {
    return { valid: false, error: `File too large. Max: ${config.maxSize / 1024 / 1024}MB` };
  }
  
  return { valid: true };
}

/**
 * Stub upload functions that return placeholder URLs
 */
export async function uploadToSupabase(file: File, bucketName: string = 'feed-posts', userId?: string): Promise<string> {
  console.warn('⚠️ File upload is disabled. Returning placeholder URL.', { fileName: file.name, bucketName });
  return `https://via.placeholder.com/500?text=${encodeURIComponent(file.name)}`;
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  return uploadToSupabase(file, 'avatars', userId);
}

export async function uploadCandidateDocument(file: File, userId: string): Promise<string> {
  return uploadToSupabase(file, 'candidats-docs', userId);
}

export async function uploadCompanyDocument(file: File, companyId: string): Promise<string> {
  return uploadToSupabase(file, 'candidats-docs', companyId);
}

export async function uploadCompanyLogo(file: File, companyId: string): Promise<string> {
  return uploadToSupabase(file, 'avatars', companyId);
}

export async function uploadFeedPost(file: File, userId: string): Promise<string> {
  return uploadToSupabase(file, 'feed-posts', userId);
}

export async function uploadJobAsset(file: File): Promise<string> {
  return uploadToSupabase(file, 'assets-emploi');
}

export async function deleteFromSupabase(url: string): Promise<void> {
  console.warn('⚠️ File deletion is disabled.', { url });
  // Noop
}

export function getPublicUrl(bucketName: string, path: string): string {
  return `https://via.placeholder.com/500?text=${encodeURIComponent(path)}`;
}

/**
 * Legacy uploadFile function
 * @deprecated Use specific upload functions
 */
export async function uploadFile(file: File, token?: string | null, category: string = 'documents'): Promise<string> {
  const categoryMap: Record<string, string> = {
    'profiles': 'avatars',
    'documents': 'candidats-docs',
    'jobs': 'assets-emploi',
    'formations': 'assets-emploi',
    'services': 'feed-posts',
    'portfolios': 'feed-posts',
  };

  const bucketName = categoryMap[category] || 'feed-posts';
  const userData = localStorage.getItem('user');
  const userId = userData ? JSON.parse(userData)?.id : undefined;

  return uploadToSupabase(file, bucketName, userId);
}
