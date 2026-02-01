/**
 * Service de gestion des uploads Supabase
 * Centralise la validation et l'upload vers les différents buckets Supabase
 */

import { supabase } from '@/lib/supabase';

/**
 * Configuration des buckets avec leurs règles de validation
 */
export const BUCKET_CONFIG = {
  // Documents privés des candidats (CV, Lettre, CNI, etc.)
  'candidats-docs': {
    allowedMimeTypes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5 MB
    description: 'Documents privés des candidats',
    pathPrefix: 'candidats-docs'
  },
  // Documents légaux des entreprises (RCCM, contrats, NUI)
  'entreprises-docs': {
    allowedMimeTypes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5 MB
    description: 'Documents légaux des entreprises',
    pathPrefix: 'entreprises-docs'
  },
  // Images et PDFs pour le fil d'actualité
  'feed-posts': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5 MB
    description: 'Images et documents du fil d\'actualité',
    pathPrefix: 'feed-posts'
  },
  // Logo des entreprises
  'entreprises': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    maxSize: 1 * 1024 * 1024, // 1 MB
    description: 'Logos des entreprises',
    pathPrefix: 'entreprises'
  },
  // Photos de profil
  'avatars': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2 MB
    description: 'Photos de profil',
    pathPrefix: 'avatars'
  },
  // Bannières et illustrations pour offres/formations
  'assets-emploi': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 3 * 1024 * 1024, // 3 MB
    description: 'Bannières et illustrations',
    pathPrefix: 'assets-emploi'
  },
};

/**
 * Valide le fichier avant upload
 */
export function validateFile(
  file: File,
  bucketName: keyof typeof BUCKET_CONFIG
): { valid: boolean; error?: string } {
  const config = BUCKET_CONFIG[bucketName];

  if (!config) {
    return { valid: false, error: `Bucket ${bucketName} not found` };
  }

  // Vérifier le type MIME
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Acceptés: ${config.allowedMimeTypes.join(', ')}`
    };
  }

  // Vérifier la taille
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Maximum: ${config.maxSize / (1024 * 1024)} MB`
    };
  }

  return { valid: true };
}

/**
 * Compresse une image avant upload (pour réduire la taille)
 */
async function compressImage(
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de compresser l\'image'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erreur lors de la compression'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload un fichier vers Supabase Storage
 * @param file - Le fichier à uploader
 * @param bucketName - Le nom du bucket Supabase
 * @param userId - L'ID de l'utilisateur (pour l'organisation du dossier)
 * @param customFileName - Nom de fichier personnalisé (optionnel)
 * @returns URL publique du fichier uploadé
 */
export async function uploadToSupabase(
  file: File,
  bucketName: keyof typeof BUCKET_CONFIG,
  userId?: string,
  customFileName?: string
): Promise<string> {
  try {
    // Valider le fichier
    const validation = validateFile(file, bucketName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    let fileToUpload = file;
    
    // Compresser les images si nécessaire (sauf les PDFs)
    if (file.type.startsWith('image/') && bucketName !== 'feed-posts') {
      try {
        const compressedBlob = await compressImage(file);
        fileToUpload = new File([compressedBlob], file.name, { type: 'image/jpeg' });
      } catch (err) {
        console.warn('Image compression failed, using original:', err);
      }
    }

    // Construire le chemin du fichier
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = customFileName || `${timestamp}_${randomStr}_${file.name}`;
    
    // Ajouter le préfixe userId si fourni
    const filePath = userId 
      ? `${userId}/${fileName}`
      : fileName;

    // Upload vers Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    const err = error as Error;
    console.error(`Upload to ${bucketName} failed:`, err);
    throw new Error(err.message || 'Upload failed');
  }
}

/**
 * Delete un fichier de Supabase Storage
 */
export async function deleteFromSupabase(
  bucketName: keyof typeof BUCKET_CONFIG,
  filePath: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    const err = error as Error;
    console.error(`Delete from ${bucketName} failed:`, err);
    throw new Error(err.message || 'Delete failed');
  }
}

/**
 * Récupérer l'URL publique d'un fichier
 */
export function getPublicUrl(
  bucketName: keyof typeof BUCKET_CONFIG,
  filePath: string
): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Upload helper pour les photos de profil (avatars)
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  // Utiliser l'ID utilisateur comme nom de fichier pour éviter les doublons
  const fileName = `${userId}.jpg`;
  
  return uploadToSupabase(file, 'avatars', userId, fileName);
}

/**
 * Upload helper pour les documents candidats
 */
export async function uploadCandidateDocument(
  file: File,
  userId: string,
  docType: string
): Promise<string> {
  // Vérifier que c'est un PDF
  if (file.type !== 'application/pdf') {
    throw new Error('Seuls les fichiers PDF sont autorisés pour les documents candidats');
  }

  return uploadToSupabase(file, 'candidats-docs', userId);
}

/**
 * Upload helper pour les documents entreprises
 */
export async function uploadCompanyDocument(
  file: File,
  userId: string
): Promise<string> {
  // Vérifier que c'est un PDF
  if (file.type !== 'application/pdf') {
    throw new Error('Seuls les fichiers PDF sont autorisés pour les documents entreprises');
  }

  return uploadToSupabase(file, 'entreprises-docs', userId);
}

/**
 * Upload helper pour les logos entreprises
 */
export async function uploadCompanyLogo(
  file: File,
  userId: string
): Promise<string> {
  const fileName = `logo_${userId}`;
  return uploadToSupabase(file, 'entreprises', userId, fileName);
}

/**
 * Upload helper pour les posts du fil d'actualité
 */
export async function uploadFeedPost(
  file: File,
  userId: string
): Promise<string> {
  return uploadToSupabase(file, 'feed-posts', userId);
}

/**
 * Upload helper pour les assets d'emploi (bannières, illustrations)
 */
export async function uploadJobAsset(
  file: File
): Promise<string> {
  return uploadToSupabase(file, 'assets-emploi', undefined);
}
