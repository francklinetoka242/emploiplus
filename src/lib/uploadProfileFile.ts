type Bucket = 'candidats-docs' | 'avatars' | 'entreprises-docs';

export interface UploadResult {
  url: string | null;
  key?: string;
  error?: any;
}

/**
 * Upload a file to backend storage
 * - Checks file size and type on client-side before upload
 * - Sends to backend API for storage
 *
 * TODO: Implement backend file upload endpoint
 */
export async function uploadProfileFile(
  userId: string,
  file: File,
  bucket: Bucket,
  opts?: { makeSignedUrl?: boolean; signedUrlExpiresSec?: number }
): Promise<UploadResult> {
  const maxSizeByBucket: Record<Bucket, number> = {
    avatars: 2 * 1024 * 1024,
    'candidats-docs': 5 * 1024 * 1024,
    'entreprises-docs': 10 * 1024 * 1024,
  };

  const maxSize = maxSizeByBucket[bucket];
  if (file.size > maxSize) {
    return { url: null, error: `File too large. Max ${Math.round(maxSize / 1024 / 1024)}MB` };
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (bucket === 'candidats-docs') {
    if (ext !== 'pdf' && file.type !== 'application/pdf') {
      return { url: null, error: 'CV must be a PDF' };
    }
  }
  if (bucket === 'avatars') {
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Avatar must be an image' };
    }
  }

  // TODO: Implement backend file upload
  console.warn('[uploadProfileFile] File upload not yet implemented. Please upload via backend API');
  
  return {
    url: null,
    error: 'File upload endpoint not implemented. Contact support.',
  };
}

  const filename = bucket === 'avatars' ? `${userId}.${ext || 'png'}` : `${userId}_${Date.now()}.${ext || 'bin'}`;

  const path = bucket === 'avatars' ? `profiles/avatars/${filename}` : bucket === 'candidats-docs' ? `profiles/cvs/${filename}` : `companies/docs/${filename}`;

  // Upload (upsert avatars to replace old avatar)
  const { data: uploadData, error: uploadError } = await client.storage.from(bucket).upload(path, file, { upsert: true });
  if (uploadError) return { url: null, error: uploadError };

  // Try signed URL if requested
  if (opts?.makeSignedUrl) {
    const expires = opts.signedUrlExpiresSec ?? 60 * 60; // 1 hour
    const { data: signedData, error: signedErr } = await client.storage.from(bucket).createSignedUrl(path, expires);
    if (signedErr) return { url: null, error: signedErr };
    const url = signedData.signedUrl;
    const updateField = bucket === 'avatars' ? { avatar_url: url } : bucket === 'candidats-docs' ? { cv_url: url } : { metadata: { doc: url } };
    const { error: dbErr } = await client.from('profiles').update(updateField).eq('id', userId);
    if (dbErr) return { url: null, error: dbErr };
    return { url, key: path };
  }

  // Public URL
  const { data: publicData, error: publicErr } = client.storage.from(bucket).getPublicUrl(path);
  if (publicErr) return { url: null, error: publicErr };
  const url = publicData.publicUrl;
  const updateField = bucket === 'avatars' ? { avatar_url: url } : bucket === 'candidats-docs' ? { cv_url: url } : { metadata: { doc: url } };
  const { error: dbErr } = await client.from('profiles').update(updateField).eq('id', userId);
  if (dbErr) return { url: null, error: dbErr };
  return { url, key: path };
}

export default uploadProfileFile;
