import { buildApiUrl, authHeaders } from './headers';

interface UploadResult {
  success: boolean;
  url?: string | null;
  message?: string;
}

// Upload candidate document and save reference to user profile
export async function uploadCandidateDocAndSave(
  file: File,
  docKey: string,
  userId: string | undefined,
  dbColumn: string
): Promise<UploadResult> {
  try {
    const form = new FormData();
    form.append('file', file);
    form.append('docKey', docKey);
    form.append('dbColumn', dbColumn);
    if (userId) form.append('userId', userId);

    // build API URL (/api/uploads/candidate)
    const url = buildApiUrl('/uploads/candidate');

    // authHeaders may add Authorization when available; do NOT set Content-Type when sending FormData
    const headers = authHeaders();
    if (headers['Content-Type']) delete headers['Content-Type'];

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: form,
      credentials: 'include',
    });

    const json = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      return { success: false, message: json?.message || 'Upload failed' };
    }

    // expect backend to return { data: { url } }
    const urlResult = json?.data?.url ?? json?.url ?? null;
    return { success: true, url: urlResult };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Upload error' };
  }
}

// Upload company document and save reference to company profile
export async function uploadCompanyDocAndSave(
  file: File,
  docKey: string,
  companyId: string | undefined,
  dbColumn: string
): Promise<UploadResult> {
  try {
    const form = new FormData();
    form.append('file', file);
    form.append('docKey', docKey);
    form.append('dbColumn', dbColumn);
    if (companyId) form.append('companyId', companyId);

    // build API URL (/api/uploads/company)
    const url = buildApiUrl('/uploads/company');

    const headers = authHeaders();
    if (headers['Content-Type']) delete headers['Content-Type'];

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: form,
      credentials: 'include',
    });

    const json = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      return { success: false, message: json?.message || 'Upload failed' };
    }

    const urlResult = json?.data?.url ?? json?.url ?? null;
    return { success: true, url: urlResult };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Upload error' };
  }
}

// Delete document by clearing the corresponding user profile column
export async function deleteDocument(dbColumn: string): Promise<boolean> {
  try {
    // build API URL for updating current user
    const url = buildApiUrl('/users/me');

    const headers = authHeaders('application/json');

    // send PUT to update the profile field to null
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ [dbColumn]: null }),
      credentials: 'include',
    });

    if (!res.ok) return false;

    return true;
  } catch (err) {
    console.error('deleteDocument error', err);
    return false;
  }
}
