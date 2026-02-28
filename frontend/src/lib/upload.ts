import { buildApiUrl, authHeaders } from './headers';

export interface UploadFileResult {
  success: boolean;
  url?: string | null;
  message?: string;
}

/**
 * Upload a file to the backend storage endpoint.
 * - `file`: the File object to upload
 * - `token`: optional JWT for Authorization header
 * - `target`: logical target/bucket name (e.g. 'jobs','applications','profiles','documents')
 *
 * The function sends a multipart/form-data POST to `/api/uploads/{target}` when possible,
 * but falls back to `/api/uploads/candidate` for candidate-specific uploads.
 */
export async function uploadFile(file: File, token?: string | null, target: string = 'uploads'): Promise<string | null> {
  try {
    if (!file) return null;

    const form = new FormData();
    form.append('file', file);
    form.append('target', target);

    // choose endpoint - normalized
    const normalized = (target || 'uploads').toString().toLowerCase();
    let path = `/uploads/${normalized}`;

    // if backend only supports candidate uploads, route to that endpoint
    if (normalized === 'candidates' || normalized === 'candidate') {
      path = '/uploads/candidate';
    }

    const url = buildApiUrl(path);

    // prepare headers - do not set Content-Type for FormData
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: form,
      credentials: 'include',
    });

    const json = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      console.error('uploadFile failed', json);
      return null;
    }

    // backend is expected to return { data: { url } } or { url }
    const uploadedUrl = json?.data?.url ?? json?.url ?? null;
    return uploadedUrl;
  } catch (err) {
    console.error('uploadFile error', err);
    return null;
  }
}

export default uploadFile;
