/**
 * Configuration centralisée pour la gestion des uploads
 * Définit les règles de validation, sécurité et stockage par type de fichier
 */

export const UPLOAD_CONFIG = {
  // Répertoire racine des uploads (peut être un lien symbolique vers un dossier externe)
  ROOT_DIR: 'uploads',

  // Configuration par type de fichier
  TYPES: {
    // Photos de profil (public)
    AVATAR: {
      dir: 'avatars',
      public: true,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      naming: 'user_{userId}_avatar_{timestamp}',
      description: 'Photos de profil utilisateurs'
    },

    // CV des candidats (privé)
    CV: {
      dir: 'cv',
      public: false,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      allowedExtensions: ['.pdf', '.doc', '.docx'],
      naming: 'candidate_{userId}_cv_{timestamp}',
      description: 'Curriculum Vitae'
    },

    // Lettres de motivation (privé)
    RESUME: {
      dir: 'resumes',
      public: false,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      allowedExtensions: ['.pdf', '.doc', '.docx'],
      naming: 'candidate_{userId}_lm_{timestamp}',
      description: 'Lettres de motivation'
    },

    // Diplômes et certificats (privé)
    DIPLOMA: {
      dir: 'diplomas',
      public: false,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
      naming: 'candidate_{userId}_{docType}_{timestamp}',
      description: 'Diplômes et certificats de travail'
    },

    // Documents d'identité (privé)
    IDENTITY: {
      dir: 'identity',
      public: false,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
      naming: 'candidate_{userId}_{docType}_{timestamp}',
      description: 'Documents d\'identité (CNI, passeport, etc.)'
    },

    // Documents d'entreprises (privé)
    COMPANY_DOC: {
      dir: 'company-docs',
      public: false,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
      naming: 'company_{userId}_{docType}_{timestamp}',
      description: 'Documents légaux et administratifs d\'entreprises'
    },

    // Images d'offres d'emploi (public)
    JOB_IMAGE: {
      dir: 'job-images',
      public: true,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      naming: 'job_{jobId}_image_{timestamp}',
      description: 'Images illustrant les offres d\'emploi'
    },

    // Images de portfolios (public)
    PORTFOLIO_IMAGE: {
      dir: 'portfolios',
      public: true,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      naming: 'portfolio_{portfolioId}_image_{timestamp}',
      description: 'Images de projets portfolio'
    },

    // Images de notifications (public)
    NOTIFICATION_IMAGE: {
      dir: 'notifications',
      public: true,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      naming: 'notification_{notificationId}_image_{timestamp}',
      description: 'Images accompagnant les notifications'
    },

    // Images de formations (public)
    TRAINING_IMAGE: {
      dir: 'formations',
      public: true,
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      naming: 'training_{trainingId}_image_{timestamp}',
      description: 'Images ou brochures des formations'
    },

    // Fichiers temporaires pour traitement IA
    TEMP: {
      dir: 'temp',
      public: false,
      maxSize: 50 * 1024 * 1024, // 50MB (pour CV volumineux)
      allowedTypes: ['application/pdf'],
      allowedExtensions: ['.pdf'],
      naming: 'temp_{sessionId}_{timestamp}',
      description: 'Fichiers temporaires pour analyse IA',
      cleanup: {
        enabled: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        cronSchedule: '0 */6 * * *' // Toutes les 6 heures
      }
    }
  },

  // Configuration générale
  GENERAL: {
    // Créer les dossiers automatiquement si inexistants
    autoCreateDirs: true,

    // Préfixes d'URL pour les fichiers
    urlPrefix: {
      public: '/uploads/',
      private: '/api/uploads/secure/' // Route protégée pour fichiers privés
    },

    // Configuration Multer par défaut
    multer: {
      dest: 'uploads/private/temp/',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB global max
        files: 10 // Max 10 fichiers simultanés
      }
    }
  }
};

/**
 * Valide un fichier selon sa configuration
 * @param {Object} file - Objet fichier Multer
 * @param {string} type - Type de fichier (clé dans UPLOAD_CONFIG.TYPES)
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateFile(file, type) {
  const config = UPLOAD_CONFIG.TYPES[type];
  if (!config) {
    return { valid: false, error: `Type de fichier inconnu: ${type}` };
  }

  // Vérifier la taille
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Maximum: ${config.maxSize / (1024 * 1024)}MB`
    };
  }

  // Vérifier le type MIME
  if (!config.allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${config.allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Génère le nom de fichier selon la configuration
 * @param {string} type - Type de fichier
 * @param {Object} params - Paramètres pour le nommage (userId, jobId, etc.)
 * @param {string} originalExt - Extension originale du fichier
 * @returns {string} Nom de fichier généré
 */
export function generateFilename(type, params, originalExt) {
  const config = UPLOAD_CONFIG.TYPES[type];
  const timestamp = Date.now();

  let filename = config.naming;
  Object.entries(params).forEach(([key, value]) => {
    filename = filename.replace(`{${key}}`, value);
  });
  filename = filename.replace('{timestamp}', timestamp);

  return `${filename}${originalExt}`;
}

/**
 * Obtient le chemin complet de destination
 * @param {string} type - Type de fichier
 * @returns {string} Chemin relatif depuis la racine du projet
 */
export function getDestinationPath(type) {
  const config = UPLOAD_CONFIG.TYPES[type];
  if (!config) throw new Error(`Type de fichier inconnu: ${type}`);
  const section = config.public ? 'public' : 'private';
  return `${UPLOAD_CONFIG.ROOT_DIR}/${section}/${config.dir}`;
}

/**
 * Vérifie si un type de fichier est public
 * @param {string} type - Type de fichier
 * @returns {boolean} True si public
 */
export function isPublicType(type) {
  const config = UPLOAD_CONFIG.TYPES[type];
  return config ? config.public : false;
}