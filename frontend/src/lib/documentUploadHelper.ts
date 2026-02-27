/**
 * Utilitaire pour gérer les uploads de documents PDF
 * Avec enregistrement automatique en base de données
 */

import { uploadCandidateDocument, uploadCompanyDocument } from '@/lib/upload';
import { authHeaders } from '@/lib/headers';
import { toast } from 'sonner';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload un document candidat et enregistre l'URL en base
 */
export async function uploadCandidateDocAndSave(
  file: File,
  docType: string,
  userId: string,
  dbColumn: string
): Promise<UploadResult> {
  try {
    // Validation
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Seuls les fichiers PDF sont acceptés'
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Le fichier ne doit pas dépasser 5 MB'
      };
    }

    // Upload vers Supabase
    const url = await uploadCandidateDocument(file, userId, docType);

    // Enregistrer l'URL en base de données
    const headers: Record<string, string> = authHeaders('application/json');
    const updateRes = await fetch('/api/users/me', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        [dbColumn]: url
      })
    });

    if (!updateRes.ok) {
      throw new Error('Erreur lors de l\'enregistrement du document');
    }

    toast.success('Document téléchargé avec succès');
    return { success: true, url };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
    toast.error(message);
    return { success: false, error: message };
  }
}

/**
 * Upload un document entreprise et enregistre l'URL en base
 */
export async function uploadCompanyDocAndSave(
  file: File,
  docType: string,
  userId: string,
  dbColumn: string
): Promise<UploadResult> {
  try {
    // Validation
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Seuls les fichiers PDF sont acceptés'
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Le fichier ne doit pas dépasser 5 MB'
      };
    }

    // Upload vers Supabase
    const url = await uploadCompanyDocument(file, userId, docType);

    // Enregistrer l'URL en base de données
    const headers: Record<string, string> = authHeaders('application/json');
    const updateRes = await fetch('/api/users/me', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        [dbColumn]: url
      })
    });

    if (!updateRes.ok) {
      throw new Error('Erreur lors de l\'enregistrement du document');
    }

    toast.success('Document téléchargé avec succès');
    return { success: true, url };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
    toast.error(message);
    return { success: false, error: message };
  }
}

/**
 * Supprimer un document (mettre l'URL à null)
 */
export async function deleteDocument(dbColumn: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = authHeaders('application/json');
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        [dbColumn]: null
      })
    });

    if (!res.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    toast.success('Document supprimé');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
    toast.error(message);
    return false;
  }
}
