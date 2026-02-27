/**
 * ============================================================================
 * Moderation Service - Content Filtering & Validation
 * ============================================================================
 *
 * Service de modération pour les posts:
 * - Détection de spam
 * - Détection de contenu haineux/violent
 * - Vérification des URLs
 */

// Mots-clés spam
const SPAM_KEYWORDS = [
  'click here',
  'buy now',
  'limited time',
  'urgent action',
  'click link',
  'earn money',
  'get rich',
  'free money',
  'guaranteed',
  'work from home',
];

// Patterns de détection
const SPAM_PATTERNS = [
  /^(http|https):\/\/[a-z0-9-]+(\.)?[a-z0-9-]+\.[a-z]{2,}/gi, // URLs multiples
  /\b[A-Z]{5,}\b/g, // MOTS EN MAJUSCULES EXCESSIFS
  /(.)\1{4,}/g, // Caractères répétés (aaaaaaa)
];

// Mots haineux/violents (liste minimale - à élargir)
const HATE_KEYWORDS = [
  'hate',
  'kill',
  'violence',
  'offensive word', // remplacer par vrais mots
];

/**
 * Analyser un post pour détecter le spam
 */
export function detectSpam(content: string): {
  isSpam: boolean;
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;

  const contentLower = content.toLowerCase();

  // Check 1: Spam keywords
  for (const keyword of SPAM_KEYWORDS) {
    if (contentLower.includes(keyword)) {
      reasons.push(`Contains spam keyword: "${keyword}"`);
      score += 20;
    }
  }

  // Check 2: Spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      reasons.push(`Matches spam pattern: ${pattern.source}`);
      score += 15;
    }
  }

  // Check 3: Excessive links
  const urlMatches = content.match(/https?:\/\/\S+/gi);
  if (urlMatches && urlMatches.length > 3) {
    reasons.push(`Too many links (${urlMatches.length})`);
    score += 30;
  }

  // Check 4: Hate speech
  for (const keyword of HATE_KEYWORDS) {
    if (contentLower.includes(keyword)) {
      reasons.push(`Contains hate keyword: "${keyword}"`);
      score += 40;
    }
  }

  // Check 5: Content length (too short)
  if (content.trim().length < 10) {
    reasons.push('Content too short');
    score += 10;
  }

  return {
    isSpam: score >= 50,
    score: Math.min(score, 100),
    reasons,
  };
}

/**
 * Valider un post selon des règles métier
 */
export function validatePost(content: string, author: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Longueur minimale
  if (!content || content.trim().length < 10) {
    errors.push('Content must be at least 10 characters');
  }

  // Longueur maximale
  if (content.length > 5000) {
    errors.push('Content must be less than 5000 characters');
  }

  // Contient au moins un caractère non-vide
  if (!/\S/.test(content)) {
    errors.push('Content cannot be only whitespace');
  }

  // Author validation
  if (!author || author.trim().length === 0) {
    errors.push('Author is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extraire et valider les URLs du contenu
 */
export function extractAndValidateUrls(content: string): {
  urls: string[];
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = content.match(urlPattern) || [];

  // Vérifier les URLs
  for (const url of urls) {
    try {
      new URL(url);
    } catch {
      issues.push(`Invalid URL: ${url}`);
    }
  }

  // Unique URLs
  const uniqueUrls = Array.from(new Set(urls));

  return {
    urls: uniqueUrls,
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Calculer un score de qualité du post
 */
export function calculatePostQuality(
  content: string,
  likes: number,
  comments: number,
  shares: number
): {
  qualityScore: number;
  engagement: number;
} {
  // Score de contenu (0-40)
  const contentScore = Math.min(40, content.length / 50); // Plus long = meilleur

  // Score d'engagement (0-60)
  const engagementScore =
    likes * 2 + comments * 5 + shares * 10;
  const normalizedEngagement = Math.min(
    60,
    Math.log(engagementScore + 1) * 10
  );

  return {
    qualityScore: Math.round(
      contentScore + normalizedEngagement
    ),
    engagement: Math.round(engagementScore),
  };
}

/**
 * Obtenir l'action à prendre sur un post
 */
export function getModerationAction(
  spamScore: number,
  hateScore: number
): {
  action: 'approve' | 'flag' | 'hide' | 'remove';
  reason: string;
} {
  if (spamScore >= 70 || hateScore >= 80) {
    return { action: 'remove', reason: 'Violates content policy' };
  }

  if (spamScore >= 50 || hateScore >= 60) {
    return { action: 'hide', reason: 'Suspicious content' };
  }

  if (spamScore >= 30 || hateScore >= 40) {
    return { action: 'flag', reason: 'Needs manual review' };
  }

  return { action: 'approve', reason: 'Passed moderation' };
}

export default {
  detectSpam,
  validatePost,
  extractAndValidateUrls,
  calculatePostQuality,
  getModerationAction,
};
