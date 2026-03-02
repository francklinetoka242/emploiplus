/**
 * Configuration centralisée pour les uploads de documents
 * Groupage des documents et configuration des validations
 */

export interface DocumentConfig {
  fieldName: string;
  label: string;
  description?: string;
  group: string;
  dbColumn: string;
}

export const CANDIDATE_DOCUMENTS: Record<string, DocumentConfig> = {
  cv: {
    fieldName: 'cv',
    label: 'CV',
    description: 'Votre curriculum vitae',
    group: 'Documents Professionnels',
    dbColumn: 'cv_url'
  },
  lm: {
    fieldName: 'lm',
    label: 'Lettre de Motivation',
    description: 'Votre lettre de motivation',
    group: 'Documents Professionnels',
    dbColumn: 'lm_url'
  },
  diplome: {
    fieldName: 'diplome',
    label: 'Diplômes',
    description: 'Vos diplômes et certifications',
    group: 'Diplômes & Expériences',
    dbColumn: 'diplome_url'
  },
  certificat_travail: {
    fieldName: 'certificat_travail',
    label: 'Certificats de Travail',
    description: 'Certificats ou attestations de travail',
    group: 'Diplômes & Expériences',
    dbColumn: 'certificat_travail_url'
  },
  cni: {
    fieldName: 'cni',
    label: 'CNI/Carte Nationale',
    description: 'Votre carte nationale d\'identité',
    group: 'Identité & Résidence',
    dbColumn: 'cni_url'
  },
  passeport: {
    fieldName: 'passeport',
    label: 'Passeport',
    description: 'Votre passeport',
    group: 'Identité & Résidence',
    dbColumn: 'passeport_url'
  },
  carte_residence: {
    fieldName: 'carte_residence',
    label: 'Carte de Résidence',
    description: 'Votre titre de résidence',
    group: 'Identité & Résidence',
    dbColumn: 'carte_residence_url'
  },
  nui: {
    fieldName: 'nui',
    label: 'NUI',
    description: 'Numéro d\'identité unique',
    group: 'Documents Administratifs',
    dbColumn: 'nui_url'
  },
  recepisse_acpe: {
    fieldName: 'recepisse_acpe',
    label: 'Récépissé ACPE',
    description: 'Récépissé d\'enregistrement ACPE',
    group: 'Documents Administratifs',
    dbColumn: 'recepisse_acpe_url'
  }
};

export const COMPANY_DOCUMENTS: Record<string, DocumentConfig> = {
  rccm: {
    fieldName: 'rccm',
    label: 'RCCM',
    description: 'Registre du Commerce et du Crédit Mobilier',
    group: 'Documents Légaux',
    dbColumn: 'rccm_url'
  },
  statuts: {
    fieldName: 'statuts',
    label: 'Statuts',
    description: 'Statuts de la société',
    group: 'Documents Légaux',
    dbColumn: 'statuts_url'
  },
  nui: {
    fieldName: 'nui',
    label: 'NUI',
    description: 'Numéro d\'Identité Unique',
    group: 'Documents Légaux',
    dbColumn: 'nui_url'
  },
  carte_grise_fiscale: {
    fieldName: 'carte_grise_fiscale',
    label: 'Carte Grise/Fiscale',
    description: 'Carte grise ou attestation fiscale',
    group: 'Documents Fiscaux',
    dbColumn: 'carte_grise_fiscale_url'
  },
  attestation_non_redevance: {
    fieldName: 'attestation_non_redevance',
    label: 'Attestation Non-Redevance',
    description: 'Attestation de non-redevance ou certificat',
    group: 'Documents Fiscaux',
    dbColumn: 'attestation_non_redevance_url'
  },
  bail: {
    fieldName: 'bail',
    label: 'Contrat de Bail',
    description: 'Contrat ou attestation de bail',
    group: 'Locaux',
    dbColumn: 'bail_url'
  },
  cni_representant: {
    fieldName: 'cni_representant',
    label: 'CNI du Gérant',
    description: 'Carte d\'identité du gérant/représentant',
    group: 'Représentants',
    dbColumn: 'cni_representant_url'
  }
};

// Grouper les documents par catégorie
export function groupDocuments(docs: Record<string, DocumentConfig>): Record<string, DocumentConfig[]> {
  const grouped: Record<string, DocumentConfig[]> = {};
  
  Object.values(docs).forEach(doc => {
    if (!grouped[doc.group]) {
      grouped[doc.group] = [];
    }
    grouped[doc.group].push(doc);
  });
  
  return grouped;
}

export const CANDIDATE_DOCS_GROUPED = groupDocuments(CANDIDATE_DOCUMENTS);
export const COMPANY_DOCS_GROUPED = groupDocuments(COMPANY_DOCUMENTS);

// Ordre d'affichage des groupes
export const CANDIDATE_GROUP_ORDER = [
  'Documents Professionnels',
  'Diplômes & Expériences',
  'Identité & Résidence',
  'Documents Administratifs'
];

export const COMPANY_GROUP_ORDER = [
  'Documents Légaux',
  'Documents Fiscaux',
  'Locaux',
  'Représentants'
];
