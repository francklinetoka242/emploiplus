/**
 * Storage Service (Supabase)
 * 
 * ⚠️ DEPRECATED: Supabase has been removed
 * 
 * This service handled file uploads to Supabase buckets.
 * File upload functionality needs to be migrated to a backend service.
 */

/**
 * Configuration des buckets avec leurs règles de validation
 */
export const BUCKET_CONFIG = {
  'candidats-docs': {
    allowedMimeTypes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024,
    description: 'Documents privés des candidats',
    pathPrefix: 'candidats-docs'
  },
  'entreprises-docs': {
    allowedMimeTypes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024,
    description: 'Documents légaux des entreprises',
    pathPrefix: 'entreprises-docs'
  },
  'feed-posts': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    maxSize: 5 * 1024 * 1024,
    description: 'Images et documents du fil d\'actualité',
    pathPrefix: 'feed-posts'
  },
  'entreprises': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    maxSize: 1 * 1024 * 1024,
    description: 'Logos des entreprises',
    pathPrefix: 'entreprises'
  },
  'avatars': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024,
    description: 'Photos de profil',
    pathPrefix: 'avatars'
  },
  'assets-emploi': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 3 * 1024 * 1024,
    description: 'Bannières et illustrations',
    pathPrefix: 'assets-emploi'
  },
};

/**
 * Validates file before upload
 */
export function validateFile(
  file: File,
  bucketName: keyof typeof BUCKET_CONFIG
): { valid: boolean; error?: string } {
  const config = BUCKET_CONFIG[bucketName];

  if (!config) {
    return { valid: false, error: `Bucket ${bucketName} not found` };
  }

  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Acceptés: ${config.allowedMimeTypes.join(', ')}`
    };
  }

  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Maximum: ${config.maxSize / (1024 * 1024)} MB`
    };
  }

  return { valid: true };
}

/**
 * Upload file - DEPRECATED
 * 
 * @throws Error: Upload service not available (Supabase removed)
 */
export async function uploadFile(
  file: File,
  bucketName: keyof typeof BUCKET_CONFIG,
  userId: string
): Promise<{ url: string | null; error?: string }> {
  console.warn('⚠️ uploadFile - File upload service not available (Supabase removed)');
  return {
    url: null,
    error: 'File upload service temporarily unavailable. Please contact support.'
  };
}

/**
 * Delete file - DEPRECATED
 * 
 * @throws Error: Delete service not available (Supabase removed)
 */
export async function deleteFile(
  bucketName: keyof typeof BUCKET_CONFIG,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  console.warn('⚠️ deleteFile - File delete service not available (Supabase removed)');
  return {
    success: false,
    error: 'File delete service temporarily unavailable. Please contact support.'
  };
}

/**
 * Get signed URL - DEPRECATED
 */
export async function getSignedUrl(
  bucketName: keyof typeof BUCKET_CONFIG,
  filePath: string,
  expiresIn: number = 3600
): Promise<{ url: string | null; error?: string }> {
  console.warn('⚠️ getSignedUrl - URL generation service not available (Supabase removed)');
  return {
    url: null,
    error: 'URL generation service temporarily unavailable. Please contact support.'
  };
}

/**
 * List files - DEPRECATED
 */
export async function listFiles(
  bucketName: keyof typeof BUCKET_CONFIG
): Promise<{ files: any[]; error?: string }> {
  console.warn('⚠️ listFiles - File listing not available (Supabase removed)');
  return {
    files: [],
    error: 'File listing temporarily unavailable. Please contact support.'
  };
}

/**
 * Upload to Supabase - DEPRECATED
 * @deprecated Use backend file upload endpoint instead
 */
export async function uploadToSupabase(
  file: File,
  bucketName: keyof typeof BUCKET_CONFIG,
  userId?: string
): Promise<string> {
  console.warn('⚠️ uploadToSupabase - File upload service not available (Supabase removed)');
  throw new Error('File upload service temporarily unavailable. Please contact support.');
}

/**
 * Upload avatar - DEPRECATED
 * @deprecated Use backend avatar upload endpoint instead
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  console.warn('⚠️ uploadAvatar - File upload service not available (Supabase removed)');
  throw new Error('File upload service temporarily unavailable. Please contact support.');
}

/**
 * Upload candidate document - DEPRECATED
 * @deprecated Use backend document upload endpoint instead
 */
export async function uploadCandidateDocument(file: File, userId: string): Promise<string> {
  console.warn('⚠️ uploadCandidateDocument - File upload service not available (Supabase removed)');
  throw new Error('File upload service temporarily unavailable. Please contact support.');
}

/**
 * Upload company document - DEPRECATED
 * @deprecated Use backend document upload endpoint instead
 */
export async function uploadCompanyDocument(file: File, companyId: string): Promise<string> {
  console.warn('⚠️ uploadCompanyDocument - File upload service not available (Supabase removed)');
  throw new Error('File upload service temporarily unavailable. Please contact support.');
}

/**
 * Upload company logo - DEPRECATED
 * @deprecated Use backend logo upload endpoint instead
 */
export async function uploadCompanyLogo(file: File, companyId: string): Promise<string> {
  console.warn('⚠️ uploadCompanyLogo - File upload service not available (Supabase removed)');
  throw new Error('File upload service temporarily unavailable. Please contact support.');
}

/**
 * Upload feed post - DEPRECATED
 * @deprecated Use backend file upload endpoint instead
 */
export async function uploadFeedPost(file: File, userId: string): Promise<string> {
  console.warn('⚠️ uploadFeedPost - File upload service not available (Supabase removed)');
  throw new Error('File upload service temporarily unavailable. Please contact support.');
}

/**
 * Upload job asset - DEPRECATED
 * @deprecated Use backend file upload endpoint instead
 */
export async function uploadJobAsset(file: File, jobId: string): Promise<string> {
  console.warn('⚠️ uploadJobAsset - File upload service not available (Supabase removed)');
  throw new Error('File upload service temporarily unavailable. Please contact support.');
}

/**
 * Delete from Supabase - DEPRECATED
 * @deprecated Use backend file delete endpoint instead
 */
export async function deleteFromSupabase(
  bucketName: keyof typeof BUCKET_CONFIG,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  console.warn('⚠️ deleteFromSupabase - File delete service not available (Supabase removed)');
  return {
    success: false,
    error: 'File delete service temporarily unavailable. Please contact support.'
  };
}

/**
 * Get public URL - DEPRECATED
 */
export async function getPublicUrl(
  bucketName: keyof typeof BUCKET_CONFIG,
  filePath: string
): Promise<{ url: string | null; error?: string }> {
  console.warn('⚠️ getPublicUrl - URL service not available (Supabase removed)');
  return {
    url: null,
    error: 'URL service temporarily unavailable. Please contact support.'
  };
}
